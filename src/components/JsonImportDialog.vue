<template>
  <el-dialog
    v-model="visible"
    title="导入JSON"
    width="56vw"
    class="json-import-dialog"
    append-to-body
    destroy-on-close
    :close-on-click-modal="false"
  >
    <el-input
      v-model="jsonContent"
      class="json-editor"
      type="textarea"
      :rows="15"
      maxlength="12000"
      placeholder="请输入JSON数据"
      clearable
    />

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleConfirm">完成</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { ImportPreviewItem } from '@/types/iot';
import { confirmImportModels, parseImportModels } from '@/api/iot/thingModel';

const props = defineProps<{
  modelValue: boolean;
  categoryId: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  success: [];
}>();

const visible = ref(false);
const jsonContent = ref('');
const submitLoading = ref(false);
const previewRows = ref<ImportPreviewItem[]>([]);

watch(
  () => props.modelValue,
  (value) => {
    visible.value = value;
    if (value) {
      jsonContent.value = '';
      previewRows.value = [];
    }
  },
  { immediate: true }
);

watch(visible, (value) => emit('update:modelValue', value));

function handleCancel() {
  visible.value = false;
}

async function handleConfirm() {
  if (!jsonContent.value.trim()) {
    ElMessage.warning('请先输入JSON数据');
    return;
  }
  submitLoading.value = true;
  try {
    previewRows.value = await parseImportModels(props.categoryId, jsonContent.value);
    const invalidRow = previewRows.value.find((row) => !row.valid);
    if (invalidRow) {
      ElMessage.error(invalidRow.message);
      return;
    }
    const count = await confirmImportModels(props.categoryId, previewRows.value);
    if (count === 0) {
      ElMessage.warning('没有可导入的物模型');
      return;
    }
    ElMessage.success(`已导入 ${count} 个物模型，并保存为草稿`);
    visible.value = false;
    emit('success');
  } finally {
    submitLoading.value = false;
  }
}
</script>

<style scoped lang="scss">
.json-editor {
  width: 100%;

  :deep(.el-textarea__inner) {
    min-height: 330px !important;
    padding: 14px 16px;
    border-radius: 4px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    line-height: 1.6;
    resize: none;
  }
}

:deep(.el-dialog__header) {
  padding: 18px 32px 10px;
  margin-right: 0;
}

:deep(.el-dialog__body) {
  padding: 22px 32px 20px;
}

:deep(.el-dialog__footer) {
  padding: 12px 32px 28px;
}

@media (max-width: 1200px) {
  :deep(.json-import-dialog) {
    width: calc(100vw - 48px) !important;
  }
}
</style>
