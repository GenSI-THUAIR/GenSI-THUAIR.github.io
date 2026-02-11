<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue';
import { NButton, NSpace, NInputNumber, NModal, NInput, useMessage } from 'naive-ui';

interface CellData {
  content: string;
  rowSpan: number;
  colSpan: number;
  merged: boolean;       // 被其他单元格合并覆盖
  mergeOrigin?: string;  // "row-col" 合并源
}

const props = defineProps<{
  show: boolean;
  initialHtml?: string;
}>();

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'confirm', tableHtml: string): void;
}>();

const $message = useMessage();

// ---- 表格维度 ----
const rowCount = ref(3);
const colCount = ref(3);

// ---- 网格数据 ----
const grid = ref<CellData[][]>([]);

// ---- 选区 ----
const selectedCells = ref<Set<string>>(new Set());
const isSelecting = ref(false);
const selectionStart = ref<{ row: number; col: number } | null>(null);

// ---- 编辑中的单元格 ----
const editingCell = ref<string | null>(null);
const editingContent = ref('');

// ---- 表头模式 ----
const hasHeader = ref(true);

// 初始化网格
function initGrid() {
  const rows: CellData[][] = [];
  for (let r = 0; r < rowCount.value; r++) {
    const row: CellData[] = [];
    for (let c = 0; c < colCount.value; c++) {
      row.push({
        content: '',
        rowSpan: 1,
        colSpan: 1,
        merged: false
      });
    }
    rows.push(row);
  }
  grid.value = rows;
  selectedCells.value = new Set();
  editingCell.value = null;
}

// 监听弹窗打开
watch(() => props.show, (val) => {
  if (val) {
    if (props.initialHtml) {
      parseHtmlToGrid(props.initialHtml);
    } else {
      initGrid();
    }
  }
});

// 从 HTML 解析回网格（简单实现）
function parseHtmlToGrid(html: string) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const table = doc.querySelector('table');
    if (!table) {
      initGrid();
      return;
    }
    const trs = table.querySelectorAll('tr');
    const maxCols = Math.max(...Array.from(trs).map(tr => {
      let count = 0;
      tr.querySelectorAll('th, td').forEach(cell => {
        count += parseInt(cell.getAttribute('colspan') || '1', 10);
      });
      return count;
    }));

    rowCount.value = trs.length;
    colCount.value = maxCols;

    // 创建空网格
    const newGrid: CellData[][] = [];
    for (let r = 0; r < trs.length; r++) {
      const row: CellData[] = [];
      for (let c = 0; c < maxCols; c++) {
        row.push({ content: '', rowSpan: 1, colSpan: 1, merged: false });
      }
      newGrid.push(row);
    }

    // 检测是否有 thead 或首行用 th
    const thead = table.querySelector('thead');
    const firstRowCells = trs[0]?.querySelectorAll('th');
    hasHeader.value = !!thead || (firstRowCells && firstRowCells.length > 0);

    // 填充网格
    for (let r = 0; r < trs.length; r++) {
      const cells = trs[r].querySelectorAll('th, td');
      let gridCol = 0;
      cells.forEach(cell => {
        // 跳过已被合并占用的列
        while (gridCol < maxCols && newGrid[r][gridCol].merged) {
          gridCol++;
        }
        if (gridCol >= maxCols) return;

        const rs = parseInt(cell.getAttribute('rowspan') || '1', 10);
        const cs = parseInt(cell.getAttribute('colspan') || '1', 10);
        const content = cell.innerHTML || cell.textContent || '';

        newGrid[r][gridCol].content = content;
        newGrid[r][gridCol].rowSpan = rs;
        newGrid[r][gridCol].colSpan = cs;

        // 标记被合并的单元格
        for (let dr = 0; dr < rs; dr++) {
          for (let dc = 0; dc < cs; dc++) {
            if (dr === 0 && dc === 0) continue;
            if (r + dr < trs.length && gridCol + dc < maxCols) {
              newGrid[r + dr][gridCol + dc].merged = true;
              newGrid[r + dr][gridCol + dc].mergeOrigin = `${r}-${gridCol}`;
            }
          }
        }
        gridCol += cs;
      });
    }

    grid.value = newGrid;
    selectedCells.value = new Set();
    editingCell.value = null;
  } catch {
    initGrid();
  }
}

// ---- 选择逻辑 ----
function getCellKey(row: number, col: number): string {
  return `${row}-${col}`;
}

function parseCellKey(key: string): { row: number; col: number } {
  const [row, col] = key.split('-').map(Number);
  return { row, col };
}

function handleCellMouseDown(row: number, col: number, event: MouseEvent) {
  // 如果正在编辑，先保存
  if (editingCell.value) {
    saveEditingCell();
  }

  event.preventDefault();
  isSelecting.value = true;
  selectionStart.value = { row, col };

  if (event.ctrlKey || event.metaKey) {
    // Ctrl+点击：切换单个单元格的选中状态
    const key = getCellKey(row, col);
    const newSet = new Set(selectedCells.value);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    selectedCells.value = newSet;
  } else {
    // 普通点击：清除之前选择，选中当前
    selectedCells.value = new Set([getCellKey(row, col)]);
  }
}

function handleCellMouseEnter(row: number, col: number) {
  if (!isSelecting.value || !selectionStart.value) return;
  
  // 选择从 start 到当前的矩形区域
  const startRow = Math.min(selectionStart.value.row, row);
  const endRow = Math.max(selectionStart.value.row, row);
  const startCol = Math.min(selectionStart.value.col, col);
  const endCol = Math.max(selectionStart.value.col, col);

  const newSet = new Set<string>();
  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      newSet.add(getCellKey(r, c));
    }
  }
  selectedCells.value = newSet;
}

function handleMouseUp() {
  isSelecting.value = false;
}

// ---- 单元格编辑 ----
function handleCellDblClick(row: number, col: number) {
  const cell = grid.value[row][col];
  if (cell.merged) return; // 被合并的不能直接编辑
  editingCell.value = getCellKey(row, col);
  editingContent.value = cell.content;
  nextTick(() => {
    const input = document.querySelector('.merge-table-cell-editing input, .merge-table-cell-editing textarea') as HTMLElement;
    input?.focus();
  });
}

function saveEditingCell() {
  if (!editingCell.value) return;
  const { row, col } = parseCellKey(editingCell.value);
  grid.value[row][col].content = editingContent.value;
  editingCell.value = null;
  editingContent.value = '';
}

// ---- 合并操作 ----
const canMerge = computed(() => {
  if (selectedCells.value.size < 2) return false;
  return isValidRectangleSelection();
});

const canSplit = computed(() => {
  if (selectedCells.value.size !== 1) return false;
  const key = Array.from(selectedCells.value)[0];
  const { row, col } = parseCellKey(key);
  const cell = grid.value[row]?.[col];
  if (!cell || cell.merged) return false;
  return cell.rowSpan > 1 || cell.colSpan > 1;
});

function isValidRectangleSelection(): boolean {
  const cells = Array.from(selectedCells.value).map(parseCellKey);
  if (cells.length === 0) return false;

  const minRow = Math.min(...cells.map(c => c.row));
  const maxRow = Math.max(...cells.map(c => c.row));
  const minCol = Math.min(...cells.map(c => c.col));
  const maxCol = Math.max(...cells.map(c => c.col));

  // 检查是否是完整矩形
  const expectedCount = (maxRow - minRow + 1) * (maxCol - minCol + 1);
  if (cells.length !== expectedCount) return false;

  // 检查选区内没有部分重叠的合并单元格
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      const cell = grid.value[r]?.[c];
      if (!cell) return false;

      if (cell.merged) {
        // 被合并的单元格 → 其合并源必须也在选区内
        if (cell.mergeOrigin) {
          const origin = parseCellKey(cell.mergeOrigin);
          if (origin.row < minRow || origin.col < minCol) return false;
        }
      } else if (cell.rowSpan > 1 || cell.colSpan > 1) {
        // 合并源单元格 → 其覆盖范围不能超出选区
        if (r + cell.rowSpan - 1 > maxRow || c + cell.colSpan - 1 > maxCol) {
          return false;
        }
      }
    }
  }
  return true;
}

function mergeCells() {
  if (!canMerge.value) return;

  const cells = Array.from(selectedCells.value).map(parseCellKey);
  const minRow = Math.min(...cells.map(c => c.row));
  const maxRow = Math.max(...cells.map(c => c.row));
  const minCol = Math.min(...cells.map(c => c.col));
  const maxCol = Math.max(...cells.map(c => c.col));

  const newGrid = JSON.parse(JSON.stringify(grid.value)) as CellData[][];

  // 先把选区内所有已有合并还原
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      newGrid[r][c].merged = false;
      newGrid[r][c].mergeOrigin = undefined;
      newGrid[r][c].rowSpan = 1;
      newGrid[r][c].colSpan = 1;
    }
  }

  // 收集非空内容
  const contents: string[] = [];
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      if (newGrid[r][c].content.trim()) {
        contents.push(newGrid[r][c].content.trim());
      }
    }
  }

  // 设置合并源
  newGrid[minRow][minCol].rowSpan = maxRow - minRow + 1;
  newGrid[minRow][minCol].colSpan = maxCol - minCol + 1;
  newGrid[minRow][minCol].content = contents.join(' ');
  newGrid[minRow][minCol].merged = false;

  // 标记被覆盖的单元格
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      if (r === minRow && c === minCol) continue;
      newGrid[r][c].merged = true;
      newGrid[r][c].mergeOrigin = getCellKey(minRow, minCol);
      newGrid[r][c].content = '';
      newGrid[r][c].rowSpan = 1;
      newGrid[r][c].colSpan = 1;
    }
  }

  grid.value = newGrid;
  selectedCells.value = new Set([getCellKey(minRow, minCol)]);
  $message.success('单元格已合并');
}

function splitCells() {
  if (!canSplit.value) return;

  const key = Array.from(selectedCells.value)[0];
  const { row, col } = parseCellKey(key);
  const cell = grid.value[row][col];

  const newGrid = JSON.parse(JSON.stringify(grid.value)) as CellData[][];

  // 还原所有被此单元格覆盖的单元格
  for (let r = row; r < row + cell.rowSpan; r++) {
    for (let c = col; c < col + cell.colSpan; c++) {
      newGrid[r][c].merged = false;
      newGrid[r][c].mergeOrigin = undefined;
      newGrid[r][c].rowSpan = 1;
      newGrid[r][c].colSpan = 1;
      if (r !== row || c !== col) {
        newGrid[r][c].content = '';
      }
    }
  }

  grid.value = newGrid;
  $message.success('单元格已拆分');
}

// ---- 增加/删除行列 ----
function addRow() {
  const newRow: CellData[] = [];
  for (let c = 0; c < colCount.value; c++) {
    newRow.push({ content: '', rowSpan: 1, colSpan: 1, merged: false });
  }
  grid.value.push(newRow);
  rowCount.value++;
}

function addCol() {
  for (const row of grid.value) {
    row.push({ content: '', rowSpan: 1, colSpan: 1, merged: false });
  }
  colCount.value++;
}

function removeLastRow() {
  if (rowCount.value <= 1) return;
  grid.value.pop();
  rowCount.value--;
  // 清理可能失效的合并
  cleanInvalidMerges();
}

function removeLastCol() {
  if (colCount.value <= 1) return;
  for (const row of grid.value) {
    row.pop();
  }
  colCount.value--;
  cleanInvalidMerges();
}

function cleanInvalidMerges() {
  for (let r = 0; r < grid.value.length; r++) {
    for (let c = 0; c < grid.value[r].length; c++) {
      const cell = grid.value[r][c];
      if (cell.rowSpan > 1 || cell.colSpan > 1) {
        // 裁剪超出范围的合并
        cell.rowSpan = Math.min(cell.rowSpan, grid.value.length - r);
        cell.colSpan = Math.min(cell.colSpan, grid.value[r].length - c);
        if (cell.rowSpan <= 1 && cell.colSpan <= 1) {
          // 合并被完全裁剪，清理被覆盖标记
        }
      }
      if (cell.merged && cell.mergeOrigin) {
        const origin = parseCellKey(cell.mergeOrigin);
        if (origin.row >= grid.value.length || origin.col >= grid.value[0].length) {
          cell.merged = false;
          cell.mergeOrigin = undefined;
        }
      }
    }
  }
}

// ---- 生成 HTML ----
function generateHtml(): string {
  // 不添加内联 style，让前端页面的 CSS 统一控制表格样式
  let html = '<table>\n';

  for (let r = 0; r < grid.value.length; r++) {
    const isHeaderRow = hasHeader.value && r === 0;
    if (isHeaderRow) html += '  <thead>\n';

    html += '  <tr>\n';
    for (let c = 0; c < grid.value[r].length; c++) {
      const cell = grid.value[r][c];
      if (cell.merged) continue;

      const tag = isHeaderRow ? 'th' : 'td';
      const attrs: string[] = [];
      if (cell.rowSpan > 1) attrs.push(`rowspan="${cell.rowSpan}"`);
      if (cell.colSpan > 1) attrs.push(`colspan="${cell.colSpan}"`);

      const attrStr = attrs.length > 0 ? ' ' + attrs.join(' ') : '';
      const content = cell.content || '&nbsp;';
      html += `    <${tag}${attrStr}>${content}</${tag}>\n`;
    }
    html += '  </tr>\n';

    if (isHeaderRow) html += '  </thead>\n  <tbody>\n';
  }

  if (hasHeader.value && grid.value.length > 0) {
    html += '  </tbody>\n';
  }
  html += '</table>';
  return html;
}

// 预览 HTML
const previewHtml = computed(() => {
  if (grid.value.length === 0) return '';
  return generateHtml();
});

// ---- 确认 / 取消 ----
function handleConfirm() {
  const html = generateHtml();
  if (!html) {
    $message.warning('表格为空');
    return;
  }
  emit('confirm', html);
  emit('update:show', false);
}

function handleCancel() {
  emit('update:show', false);
}

// ---- 重置 ----
function handleReset() {
  initGrid();
  $message.info('表格已重置');
}

// 判断单元格是否被选中
function isCellSelected(row: number, col: number): boolean {
  return selectedCells.value.has(getCellKey(row, col));
}

// 获取单元格显示样式
function getCellStyle(row: number, col: number) {
  const cell = grid.value[row]?.[col];
  if (!cell) return {};
  const style: Record<string, string> = {
    border: '1px solid #d0d0d0',
    padding: '6px 8px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
    minWidth: '60px',
    minHeight: '32px',
    position: 'relative',
    userSelect: 'none',
    fontSize: '13px'
  };

  if (cell.merged) {
    style.display = 'none';
  }
  if (isCellSelected(row, col)) {
    style.backgroundColor = '#e6f7ff';
    style.borderColor = '#1890ff';
  }
  if (hasHeader.value && row === 0 && !cell.merged) {
    style.backgroundColor = isCellSelected(row, col) ? '#bae7ff' : '#fafafa';
    style.fontWeight = '600';
  }
  return style;
}
</script>

<template>
  <NModal
    :show="props.show"
    preset="card"
    title="合并表格编辑器"
    style="width: 800px; max-width: 95vw;"
    :mask-closable="false"
    @update:show="(val: boolean) => emit('update:show', val)"
  >
    <div class="merge-table-editor" @mouseup="handleMouseUp">
      <!-- 工具栏 -->
      <div class="mte-toolbar">
        <NSpace align="center" :wrap="true">
          <span class="mte-label">行数：</span>
          <NInputNumber v-model:value="rowCount" :min="1" :max="20" size="small" style="width: 80px;" />
          <span class="mte-label">列数：</span>
          <NInputNumber v-model:value="colCount" :min="1" :max="10" size="small" style="width: 80px;" />
          <NButton size="small" @click="initGrid">生成表格</NButton>
          <NButton size="small" @click="addRow">+ 行</NButton>
          <NButton size="small" @click="addCol">+ 列</NButton>
          <NButton size="small" @click="removeLastRow" :disabled="rowCount <= 1">- 行</NButton>
          <NButton size="small" @click="removeLastCol" :disabled="colCount <= 1">- 列</NButton>
        </NSpace>
        <NSpace align="center" style="margin-top: 8px;" :wrap="true">
          <NButton size="small" type="primary" :disabled="!canMerge" @click="mergeCells">
            合并单元格
          </NButton>
          <NButton size="small" type="warning" :disabled="!canSplit" @click="splitCells">
            拆分单元格
          </NButton>
          <NButton size="small" quaternary @click="hasHeader = !hasHeader">
            {{ hasHeader ? '✓ 首行为表头' : '✗ 无表头' }}
          </NButton>
          <NButton size="small" quaternary @click="handleReset">重置</NButton>
        </NSpace>
      </div>

      <!-- 操作提示 -->
      <div class="mte-hint">
        点击选择单元格 | 拖动选择多个 | Ctrl+点击追加选择 | 双击编辑内容
      </div>

      <!-- 可视化网格 -->
      <div class="mte-grid-wrapper" v-if="grid.length > 0">
        <table class="mte-grid-table">
          <tr v-for="(row, rIdx) in grid" :key="rIdx">
            <td
              v-for="(cell, cIdx) in row"
              :key="cIdx"
              v-show="!cell.merged"
              :rowspan="cell.rowSpan > 1 ? cell.rowSpan : undefined"
              :colspan="cell.colSpan > 1 ? cell.colSpan : undefined"
              :style="getCellStyle(rIdx, cIdx)"
              :class="{ 'mte-cell-selected': isCellSelected(rIdx, cIdx), 'mte-cell-header': hasHeader && rIdx === 0 }"
              @mousedown="handleCellMouseDown(rIdx, cIdx, $event)"
              @mouseenter="handleCellMouseEnter(rIdx, cIdx)"
              @dblclick="handleCellDblClick(rIdx, cIdx)"
            >
              <div v-if="editingCell === getCellKey(rIdx, cIdx)" class="merge-table-cell-editing">
                <NInput
                  v-model:value="editingContent"
                  type="text"
                  size="small"
                  placeholder="输入内容"
                  @blur="saveEditingCell"
                  @keyup.enter="saveEditingCell"
                  @keyup.escape="editingCell = null"
                />
              </div>
              <div v-else class="mte-cell-content">
                <span v-if="cell.content" v-html="cell.content"></span>
                <span v-else class="mte-cell-placeholder">
                  {{ cell.rowSpan > 1 || cell.colSpan > 1 ? `合并 ${cell.rowSpan}×${cell.colSpan}` : '' }}
                </span>
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- 预览区域 -->
      <div class="mte-preview" v-if="grid.length > 0">
        <div class="mte-preview-label">预览效果：</div>
        <div class="mte-preview-content" v-html="previewHtml"></div>
      </div>
    </div>

    <template #action>
      <NSpace justify="end">
        <NButton @click="handleCancel">取消</NButton>
        <NButton type="primary" @click="handleConfirm">确认插入</NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped>
.merge-table-editor {
  padding: 4px 0;
}

.mte-toolbar {
  margin-bottom: 12px;
}

.mte-label {
  font-size: 13px;
  color: #555;
  white-space: nowrap;
}

.mte-hint {
  font-size: 12px;
  color: #999;
  margin-bottom: 10px;
  padding: 4px 8px;
  background: #f9f9f9;
  border-radius: 4px;
}

.mte-grid-wrapper {
  overflow-x: auto;
  margin-bottom: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 8px;
  background: #fff;
}

.mte-grid-table {
  border-collapse: collapse;
  width: 100%;
  table-layout: fixed;
}

.mte-grid-table td {
  border: 1px solid #d0d0d0;
  padding: 6px 8px;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.15s;
  min-width: 60px;
  min-height: 32px;
  position: relative;
  user-select: none;
  font-size: 13px;
  vertical-align: middle;
}

.mte-grid-table td:hover {
  background-color: #f5f5f5;
}

.mte-cell-selected {
  background-color: #e6f7ff !important;
  border-color: #1890ff !important;
}

.mte-cell-header {
  background-color: #fafafa;
  font-weight: 600;
}

.mte-cell-header.mte-cell-selected {
  background-color: #bae7ff !important;
}

.mte-cell-content {
  min-height: 20px;
  word-break: break-word;
}

.mte-cell-placeholder {
  color: #ccc;
  font-size: 11px;
}

.merge-table-cell-editing {
  min-width: 80px;
}

.mte-preview {
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 12px;
  background: #fafafa;
}

.mte-preview-label {
  font-size: 12px;
  color: #888;
  margin-bottom: 8px;
}

.mte-preview-content {
  overflow-x: auto;
}

.mte-preview-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  font-size: 14px;
}

.mte-preview-content :deep(th),
.mte-preview-content :deep(td) {
  border: 1px solid #d0d0d0;
  padding: 8px 12px;
  text-align: left;
}

.mte-preview-content :deep(thead) {
  background: #f0f0f0;
}

.mte-preview-content :deep(th) {
  font-weight: 700;
  background: #f0f0f0;
}

.mte-preview-content :deep(tbody tr:hover) {
  background-color: #f9f9f9;
}
</style>
