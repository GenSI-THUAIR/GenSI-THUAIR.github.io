/**
 * 学术论文数据导入示例
 * 展示如何使用 import-publications.ts 工具
 */

import { convertYamlData, previewConvertedData, generateImportScript } from './import-publications';

// 示例YAML数据（从实际文件中提取的几个条目）
const sampleYamlData = {
  entries: [
    {
      author: "Junwei Yang, Kangjie Zheng, Siyu Long, Zaiqing Nie, Ming Zhang, Xinyu Dai, Wei-Ying Ma, and <b class='highlight'>Hao Zhou</b>",
      booktitle: "the 41th International Conference on Machine Learning (ICML)",
      title: "Mol-AE: Auto-Encoder Based Molecular Representation Learning With 3D Cloze Test Objective",
      year: 2024,
      abstract: "3D molecular representation learning has gained tremendous interest and achieved promising performance in various downstream tasks...",
      month: "July",
      tags: "Mol",
      thumbnail: "/assets/pub-pics/yang2024icml.png",
      bib: "@inproceedings{yang2024icml,...}",
      paper: "https://biorxiv.org/content/10.1101/2024.04.13.589331v1"
    },
    {
      author: "Kangjie Zheng, Siyu Long, Tianyu Lu, Junwei Yang, Xinyu Dai, Ming Zhang, Zaiqing Nie, Wei-Ying Ma, and <b class='highlight'>Hao Zhou</b>",
      booktitle: "the 41th International Conference on Machine Learning (ICML)",
      title: "ESM All-Atom: Multi-scale Protein Language Model for Unified Molecular Modeling",
      year: 2024,
      abstract: "Protein language models have demonstrated significant potential in the field of protein engineering...",
      code: "https://github.com/zhengkangjie/ESM-AA",
      month: "July",
      tags: "Mol,LLM",
      thumbnail: "/assets/pub-pics/zheng2024icml.png",
      bib: "@inproceedings{zheng2024icml,...}",
      paper: "https://arxiv.org/abs/2403.12995"
    }
  ]
};

/**
 * 使用示例1：预览转换后的数据
 */
export function example1_previewData() {
  console.log('=== 示例1：预览转换后的数据 ===');
  const convertedData = previewConvertedData(sampleYamlData, 2);
  return convertedData;
}

/**
 * 使用示例2：生成导入脚本
 */
export function example2_generateScript() {
  console.log('=== 示例2：生成导入脚本 ===');
  const script = generateImportScript(sampleYamlData);
  console.log('生成的导入脚本:');
  console.log(script);
  return script;
}

/**
 * 使用示例3：直接转换数据
 */
export function example3_convertData() {
  console.log('=== 示例3：直接转换数据 ===');
  const convertedData = convertYamlData(sampleYamlData);
  console.log('转换后的数据:', convertedData);
  return convertedData;
}

/**
 * 主要使用流程
 */
export function mainWorkflow() {
  console.log('🚀 学术论文数据导入工具使用流程');
  console.log('');
  
  // 步骤1：预览数据
  console.log('📊 步骤1：预览转换后的数据');
  const previewData = example1_previewData();
  console.log('');
  
  // 步骤2：生成导入脚本
  console.log('📝 步骤2：生成导入脚本');
  const script = example2_generateScript();
  console.log('');
  
  // 步骤3：执行导入（实际使用时）
  console.log('💾 步骤3：实际导入数据');
  console.log('请在发布管理页面的浏览器控制台中运行生成的脚本');
  console.log('或者手动逐条添加数据');
  
  return {
    previewData,
    script,
    totalCount: sampleYamlData.entries.length
  };
}

// 自动运行示例（可在控制台中调用）
if (typeof window !== 'undefined') {
  (window as any).importExamples = {
    preview: example1_previewData,
    generateScript: example2_generateScript,
    convert: example3_convertData,
    runAll: mainWorkflow
  };
  
  console.log('📚 导入工具示例已加载！');
  console.log('在浏览器控制台中运行：');
  console.log('- importExamples.preview() - 预览数据');
  console.log('- importExamples.generateScript() - 生成脚本');
  console.log('- importExamples.convert() - 转换数据');
  console.log('- importExamples.runAll() - 运行完整流程');
} 