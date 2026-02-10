/**
 * Standalone script to import gensi.bib into publications database
 * Usage: node scripts/import-gensi-bibtex.js
 */

const fs = require('fs');
const path = require('path');

// BibTeX parser functions
function parseBibTeX(content) {
  const entries = [];
  
  // Enhanced regex to handle multi-line entries
  const entryRegex = /@(\w+)\s*\{\s*([^,\s]+)\s*,\s*([\s\S]*?)\n\}/g;
  let match;
  
  while ((match = entryRegex.exec(content)) !== null) {
    const [, type, key, fieldsStr] = match;
    const fields = parseFields(fieldsStr);
    
    entries.push({
      type: type.toLowerCase(),
      key: key.trim(),
      fields
    });
  }
  
  return entries;
}

function parseFields(fieldsStr) {
  const fields = {};
  
  // Enhanced field parsing to handle nested braces and multi-line values
  const lines = fieldsStr.split('\n');
  let currentField = '';
  let currentValue = '';
  let braceLevel = 0;
  let inField = false;
  
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    
    if (!inField) {
      // Look for field start
      const fieldMatch = line.match(/^(\w+(?:\+\w+)?)\s*=\s*\{(.*)$/);
      if (fieldMatch) {
        currentField = fieldMatch[1];
        currentValue = fieldMatch[2];
        braceLevel = (currentValue.match(/\{/g) || []).length - (currentValue.match(/\}/g) || []).length;
        
        if (braceLevel === 0) {
          // Field complete on same line
          fields[currentField] = cleanFieldValue(currentValue);
        } else {
          inField = true;
        }
      }
    } else {
      // Continue multi-line field
      currentValue += ' ' + line;
      braceLevel += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      
      if (braceLevel === 0) {
        // Field complete
        fields[currentField] = cleanFieldValue(currentValue);
        inField = false;
        currentField = '';
        currentValue = '';
      }
    }
  }
  
  return fields;
}

function cleanFieldValue(value) {
  if (!value) return '';
  
  // Remove trailing comma and closing brace
  value = value.replace(/,?\s*\}?\s*$/, '');
  // Remove leading/trailing braces and quotes
  value = value.replace(/^\s*[\{\"]+|[\}\"]+\s*$/g, '');
  // Normalize whitespace
  value = value.replace(/\s+/g, ' ').trim();
  
  return value;
}

function cleanAuthor(author) {
  if (!author) return '';
  
  // Remove special annotations like {1=highlight}
  let cleaned = author.replace(/\{[^}]*\}/g, '').trim();
  
  // Replace 'and' with commas
  cleaned = cleaned.replace(/\s+and\s+/g, ', ');
  
  return cleaned;
}

function processTags(entry) {
  const tags = [];
  
  const titleLower = (entry.fields.title || '').toLowerCase();
  const abstractLower = (entry.fields.abstract || '').toLowerCase();
  const booktitleLower = (entry.fields.booktitle || '').toLowerCase();
  
  // Tag detection based on keywords
  if (titleLower.includes('mol') || abstractLower.includes('molecular') || 
      abstractLower.includes('molecule') || abstractLower.includes('drug') ||
      titleLower.includes('peptide') || titleLower.includes('protein')) {
    tags.push('Mol');
  }
  
  if (titleLower.includes('llm') || titleLower.includes('language model') || 
      abstractLower.includes('language model') || abstractLower.includes('bert') || 
      abstractLower.includes('transformer') || titleLower.includes('translation') ||
      abstractLower.includes('neural machine translation')) {
    tags.push('LLM');
  }
  
  if (titleLower.includes('bayesian') || titleLower.includes('flow') || 
      abstractLower.includes('bayesian flow') || abstractLower.includes('bfn')) {
    tags.push('BFN');
  }
  
  if (titleLower.includes('diffusion') || abstractLower.includes('diffusion')) {
    tags.push('Diffusion');
  }
  
  return tags;
}

function processDate(entry) {
  const year = entry.fields.year || '';
  const month = entry.fields.month || '';
  
  if (!year) return new Date().toISOString().split('T')[0];
  
  const monthMap = {
    'jan': '01', 'january': '01',
    'feb': '02', 'february': '02', 
    'mar': '03', 'march': '03',
    'apr': '04', 'april': '04',
    'may': '05',
    'jun': '06', 'june': '06',
    'jul': '07', 'july': '07',
    'aug': '08', 'august': '08',
    'sep': '09', 'september': '09',
    'oct': '10', 'october': '10',
    'nov': '11', 'november': '11',
    'dec': '12', 'december': '12'
  };
  
  const monthNum = monthMap[month.toLowerCase()] || '01';
  return `${year}-${monthNum}-01`;
}

function generateBibTeX(entry) {
  const lines = [];
  lines.push(`@${entry.type}{${entry.key},`);
  
  const fieldOrder = ['author', 'title', 'booktitle', 'journal', 'year', 'month', 'pages', 'publisher', 'volume', 'number', 'doi', 'url', 'eprint', 'code', 'abstract'];
  
  for (const field of fieldOrder) {
    if (entry.fields[field]) {
      lines.push(`  ${field} = {${entry.fields[field]}},`);
    }
  }
  
  // Add other fields
  for (const [field, value] of Object.entries(entry.fields)) {
    if (!fieldOrder.includes(field) && field !== 'image' && !field.includes('+')) {
      lines.push(`  ${field} = {${value}},`);
    }
  }
  
  lines.push('}');
  return lines.join('\n');
}

function convertBibTeXEntry(entry) {
  const tags = processTags(entry);
  
  return {
    title: entry.fields.title || '',
    content: entry.fields.abstract || '',
    cover: entry.fields.image || '',
    tag: tags.join(','),
    date: processDate(entry),
    link_url: entry.fields.eprint || entry.fields.url || '',
    author: cleanAuthor(entry.fields.author || ''),
    booktitle: entry.fields.booktitle || entry.fields.journal || '',
    code_url: entry.fields.code || '',
    bib: generateBibTeX(entry)
  };
}

// Generate SQL insert statements
function generateSQLInserts(entries) {
  const sqlStatements = [];
  
  for (const entry of entries) {
    const data = convertBibTeXEntry(entry);
    
    // Skip entries without title
    if (!data.title) continue;
    
    // Escape single quotes for SQL
    const escapeSQL = (str) => {
      if (!str) return '';
      return str.replace(/'/g, "''");
    };
    
    const values = [
      `'${escapeSQL(data.title)}'`,
      `'${escapeSQL(data.content)}'`,
      `'${escapeSQL(data.cover)}'`,
      `'${escapeSQL(data.tag)}'`,
      `'${data.date}'`,
      `'${escapeSQL(data.link_url)}'`,
      `'${escapeSQL(data.author)}'`,
      `'${escapeSQL(data.booktitle)}'`,
      `'${escapeSQL(data.code_url)}'`,
      `'${escapeSQL(data.bib)}'`
    ];
    
    const sql = `INSERT INTO publications (title, content, cover, tag, date, link_url, author, booktitle, code_url, bib) VALUES (${values.join(', ')});`;
    sqlStatements.push(sql);
  }
  
  return sqlStatements;
}

// Main execution
async function main() {
  try {
    console.log('开始导入 gensi.bib 文件...');
    
    // Read the BibTeX file
    const bibFilePath = path.join(process.cwd(), '../../../Users/Admin/Downloads/gensi.bib');
    
    if (!fs.existsSync(bibFilePath)) {
      console.error('找不到文件:', bibFilePath);
      console.log('请确保 gensi.bib 文件在 Downloads 文件夹中');
      return;
    }
    
    const content = fs.readFileSync(bibFilePath, 'utf-8');
    console.log('文件读取成功，大小:', content.length, '字符');
    
    // Parse BibTeX
    const entries = parseBibTeX(content);
    console.log(`解析到 ${entries.length} 个 BibTeX 条目`);
    
    // Generate SQL
    const sqlStatements = generateSQLInserts(entries);
    console.log(`生成了 ${sqlStatements.length} 条 SQL 插入语句`);
    
    // Write SQL file
    const outputPath = path.join(process.cwd(), 'import-publications.sql');
    const sqlContent = [
      '-- 自动生成的发布数据导入 SQL',
      '-- 来源: gensi.bib',
      `-- 生成时间: ${new Date().toISOString()}`,
      `-- 条目数量: ${sqlStatements.length}`,
      '',
      ...sqlStatements
    ].join('\n');
    
    fs.writeFileSync(outputPath, sqlContent, 'utf-8');
    console.log('SQL 文件已生成:', outputPath);
    
    // Generate JSON for manual import
    const jsonData = entries
      .map(entry => convertBibTeXEntry(entry))
      .filter(data => data.title);
    
    const jsonPath = path.join(process.cwd(), 'publications-data.json');
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf-8');
    console.log('JSON 数据文件已生成:', jsonPath);
    
    console.log('\n导入选项:');
    console.log('1. 使用 SQL 文件: 将 import-publications.sql 导入到 Supabase 数据库');
    console.log('2. 使用 JSON 文件: 在发布管理页面使用批量导入功能');
    console.log('3. 手动执行: 复制 SQL 语句到 Supabase SQL 编辑器');
    
  } catch (error) {
    console.error('导入失败:', error);
  }
}

// Run the script
main(); 