/**
 * BibTeX 数据导入工具
 * 用于将 BibTeX 格式的论文数据转换为发布管理系统的数据格式
 */

import { createPublication } from '@/service/api/publication';

// BibTeX 条目的接口定义
interface BibTeXEntry {
  type: string; // @Inproceedings, @article, etc.
  key: string; // citation key
  fields: Record<string, string>; // all the fields
}

// 发布数据创建请求的接口定义
interface CreatePublicationRequest {
  title: string;
  content: string;
  cover?: string;
  tag?: string;
  date?: string;
  link_url?: string;
  author?: string;
  booktitle?: string;
  code_url?: string;
  bib?: string;
  meeting?: string;
  year?: string;
}

/**
 * 解析 BibTeX 文件内容
 */
export function parseBibTeX(content: string): BibTeXEntry[] {
  const entries: BibTeXEntry[] = [];
  
  // 使用正则表达式匹配 BibTeX 条目
  const entryRegex = /@(\w+)\s*\{\s*([^,]+)\s*,\s*([\s\S]*?)\n\}/g;
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

/**
 * 解析 BibTeX 条目的字段
 */
function parseFields(fieldsStr: string): Record<string, string> {
  const fields: Record<string, string> = {};
  
  // 匹配字段，支持多行值和大括号/引号包围的值
  const fieldRegex = /(\w+(?:\+\w+)?)\s*=\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}|(\w+(?:\+\w+)?)\s*=\s*([^,\n]+)/g;
  let match;
  
  while ((match = fieldRegex.exec(fieldsStr)) !== null) {
    const fieldName = (match[1] || match[3]).trim();
    let fieldValue = (match[2] || match[4] || '').trim();
    
    // 清理字段值
    fieldValue = fieldValue.replace(/^\s*\{|\}\s*$/g, ''); // 移除大括号
    fieldValue = fieldValue.replace(/^\s*"(.*?)"\s*$/g, '$1'); // 移除引号
    fieldValue = fieldValue.replace(/\s+/g, ' ').trim(); // 标准化空白字符
    
    if (fieldValue) {
      fields[fieldName] = fieldValue;
    }
  }
  
  return fields;
}

/**
 * 清理作者名称
 */
function cleanAuthor(author: string): string {
  if (!author) return '';
  
  // 移除特殊标记如 author+an
  let cleaned = author.replace(/\{[^}]*\}/g, '').trim();
  
  // 标准化作者分隔符
  cleaned = cleaned.replace(/\s+and\s+/g, ', ');
  
  return cleaned;
}

/**
 * 处理标签
 */
function processTags(entry: BibTeXEntry): string[] {
  const tags: string[] = [];
  
  // 从不同字段提取标签
  const titleLower = (entry.fields.title || '').toLowerCase();
  const abstractLower = (entry.fields.abstract || '').toLowerCase();
  const booktitleLower = (entry.fields.booktitle || '').toLowerCase();
  
  // 基于关键词匹配标签
  if (titleLower.includes('mol') || abstractLower.includes('molecular') || 
      abstractLower.includes('molecule') || abstractLower.includes('drug')) {
    tags.push('Mol');
  }
  
  if (titleLower.includes('llm') || titleLower.includes('language model') || 
      abstractLower.includes('language model') || abstractLower.includes('bert') || 
      abstractLower.includes('transformer')) {
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

/**
 * 处理日期
 */
function processDate(entry: BibTeXEntry): string {
  const year = entry.fields.year || '';
  const month = entry.fields.month || '';
  
  if (!year) return new Date().toISOString().split('T')[0];
  
  // 月份映射
  const monthMap: Record<string, string> = {
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

/**
 * 处理封面图片
 */
function processCover(entry: BibTeXEntry): string {
  return entry.fields.image || '';
}

/**
 * 处理会议/期刊信息，将conference字段映射到meeting
 */
function processMeeting(entry: BibTeXEntry): string {
  // 优先使用conference字段，然后是booktitle，最后是journal
  return entry.fields.conference || entry.fields.booktitle || entry.fields.journal || '';
}

/**
 * 处理年份字段
 */
function processYear(entry: BibTeXEntry): string {
  return entry.fields.year || '';
}

/**
 * 生成 BibTeX 引用
 */
function generateBibTeX(entry: BibTeXEntry): string {
  const lines: string[] = [];
  lines.push(`@${entry.type}{${entry.key},`);
  
  // 按照常见顺序排列字段
  const fieldOrder = ['author', 'title', 'booktitle', 'journal', 'conference', 'year', 'month', 'pages', 'publisher', 'volume', 'number', 'doi', 'url', 'eprint', 'code', 'abstract'];
  
  for (const field of fieldOrder) {
    if (entry.fields[field]) {
      lines.push(`  ${field} = {${entry.fields[field]}},`);
    }
  }
  
  // 添加其他字段
  for (const [field, value] of Object.entries(entry.fields)) {
    if (!fieldOrder.includes(field) && field !== 'image' && !field.includes('+')) {
      lines.push(`  ${field} = {${value}},`);
    }
  }
  
  lines.push('}');
  return lines.join('\n');
}

/**
 * 将单个 BibTeX 条目转换为发布管理系统的数据格式
 */
export function convertBibTeXEntry(entry: BibTeXEntry): CreatePublicationRequest {
  const tags = processTags(entry);
  
  return {
    title: entry.fields.title || '',
    content: entry.fields.abstract || '',
    cover: processCover(entry),
    tag: tags.join(','),
    date: processDate(entry),
    link_url: entry.fields.eprint || entry.fields.url || '',
    author: cleanAuthor(entry.fields.author || ''),
    booktitle: entry.fields.booktitle || entry.fields.journal || '',
    code_url: entry.fields.code || '',
    bib: generateBibTeX(entry),
    meeting: processMeeting(entry),
    year: processYear(entry)
  };
}

/**
 * 批量导入 BibTeX 数据
 */
export async function importBibTeXData(
  content: string,
  onProgress?: (current: number, total: number, item: string) => void,
  onError?: (error: string, entry: BibTeXEntry) => void
): Promise<{ success: number; errors: string[] }> {
  const entries = parseBibTeX(content);
  const errors: string[] = [];
  let success = 0;
  
  console.log(`解析到 ${entries.length} 个 BibTeX 条目`);
  
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    
    try {
      onProgress?.(i + 1, entries.length, entry.fields.title || entry.key);
      
      // 检查必要字段
      if (!entry.fields.title) {
        throw new Error('缺少标题字段');
      }
      
      const publicationData = convertBibTeXEntry(entry);
      
      // 调用 API 创建发布
      await createPublication(publicationData);
      success++;
      
      // 添加延迟避免频率限制
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      const errorMsg = `导入条目 ${entry.key} 失败: ${error instanceof Error ? error.message : String(error)}`;
      errors.push(errorMsg);
      console.error(errorMsg, entry);
      onError?.(errorMsg, entry);
    }
  }
  
  return { success, errors };
}

/**
 * 从文件读取并导入 BibTeX 数据
 */
export async function importBibTeXFromFile(
  file: File,
  onProgress?: (current: number, total: number, item: string) => void,
  onError?: (error: string, entry: BibTeXEntry) => void
): Promise<{ success: number; errors: string[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const result = await importBibTeXData(content, onProgress, onError);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };
    
    reader.readAsText(file, 'utf-8');
  });
} 