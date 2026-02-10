/**
 * 学术论文数据导入工具
 * 用于将YAML格式的论文数据转换为发布管理系统的数据格式
 */

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
}

// YAML数据项的接口定义
interface YamlPublicationEntry {
  author: string;
  booktitle: string;
  title: string;
  year: number;
  abstract: string;
  month?: string;
  tags?: string;
  'author+an'?: string;
  thumbnail?: string;
  bib?: string;
  paper?: string;
  code?: string;
}

// 月份名称到数字的映射
const monthMap: Record<string, string> = {
  'January': '01',
  'February': '02',
  'March': '03',
  'April': '04',
  'May': '05',
  'June': '06',
  'July': '07',
  'August': '08',
  'September': '09',
  'October': '10',
  'November': '11',
  'December': '12'
};

/**
 * 处理作者字段，移除HTML标签并清理格式
 */
function cleanAuthor(author: string): string {
  return author
    .replace(/<[^>]*>/g, '') // 移除所有HTML标签
    .replace(/\s+/g, ' ') // 多个空格合并为单个空格
    .trim();
}

/**
 * 处理标签字段，确保只保留我们系统支持的标签
 */
function processTags(tags?: string): string[] {
  if (!tags) return [];
  
  const validTags = ['Mol', 'LLM', 'BFN', 'Diffusion'];
  const inputTags = tags.split(',').map(tag => tag.trim());
  
  return inputTags.filter(tag => validTags.includes(tag));
}

/**
 * 处理日期字段，将年份和月份组合为YYYY-MM-DD格式
 */
function processDate(year: number, month?: string): string {
  const monthNumber = month && monthMap[month] ? monthMap[month] : '01';
  return `${year}-${monthNumber}-01`;
}

/**
 * 处理缩略图路径，转换为完整URL
 */
function processThumbnail(thumbnail?: string): string {
  if (!thumbnail) return '';
  
  // 如果是相对路径，转换为GitHub Pages的完整URL
  if (thumbnail.startsWith('/assets/')) {
    return `https://algomole.github.io${thumbnail}`;
  }
  
  return thumbnail;
}

/**
 * 将单个YAML条目转换为发布管理系统的数据格式
 */
export function convertYamlEntry(entry: YamlPublicationEntry): CreatePublicationRequest {
  const tags = processTags(entry.tags);
  
  return {
    title: entry.title,
    content: entry.abstract || '',
    cover: processThumbnail(entry.thumbnail),
    tag: tags.join(','), // 转换为逗号分隔的字符串
    date: processDate(entry.year, entry.month),
    link_url: entry.paper || '',
    author: cleanAuthor(entry.author),
    booktitle: entry.booktitle || '',
    code_url: entry.code || '',
    bib: entry.bib || ''
  };
}

/**
 * 批量转换YAML数据
 */
export function convertYamlData(yamlData: { entries: YamlPublicationEntry[] }): CreatePublicationRequest[] {
  return yamlData.entries.map(entry => convertYamlEntry(entry));
}

/**
 * 示例使用方法（在浏览器控制台中）
 */
export function generateImportScript(yamlData: { entries: YamlPublicationEntry[] }): string {
  const convertedData = convertYamlData(yamlData);
  
  const script = `
// 批量导入学术论文数据脚本
// 在浏览器控制台中运行此脚本

const publicationData = ${JSON.stringify(convertedData, null, 2)};

async function importPublications() {
  console.log('开始导入', publicationData.length, '条论文数据...');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < publicationData.length; i++) {
    const publication = publicationData[i];
    
    try {
      // 这里需要调用实际的API函数
      // await createPublication(publication);
      console.log(\`[\${i + 1}/\${publicationData.length}] 成功导入: \${publication.title}\`);
      successCount++;
      
      // 添加延迟以避免请求过快
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(\`[\${i + 1}/\${publicationData.length}] 导入失败: \${publication.title}\`, error);
      errorCount++;
    }
  }
  
  console.log(\`导入完成！成功: \${successCount}, 失败: \${errorCount}\`);
}

// 执行导入（取消注释下面的行来执行）
// importPublications();

// 或者逐条检查数据
console.log('转换后的数据:', publicationData);
  `;
  
  return script;
}

/**
 * 数据预览功能
 */
export function previewConvertedData(yamlData: { entries: YamlPublicationEntry[] }, limit: number = 5) {
  const convertedData = convertYamlData(yamlData);
  
  console.log(`预览前 ${limit} 条转换后的数据:`);
  console.table(convertedData.slice(0, limit));
  
  console.log(`总计 ${convertedData.length} 条数据待导入`);
  
  // 统计标签分布
  const tagStats: Record<string, number> = {};
  convertedData.forEach(item => {
    if (item.tag) {
      item.tag.split(',').forEach((tag: string) => {
        const cleanTag = tag.trim();
        tagStats[cleanTag] = (tagStats[cleanTag] || 0) + 1;
      });
    }
  });
  
  console.log('标签分布统计:', tagStats);
  
  return convertedData;
} 