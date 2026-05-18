<template>
  <el-dialog
    v-model="visible"
    title="修复硬件默认值覆盖"
    width="560px"
    append-to-body
    destroy-on-close
    :close-on-click-modal="false"
  >
    <template v-if="override">
      <el-descriptions :column="1" border class="override-desc">
        <el-descriptions-item label="硬件型号">{{ override.hardwareName }}</el-descriptions-item>
        <el-descriptions-item label="物模型标识">{{ override.modelIdentifier }}</el-descriptions-item>
        <el-descriptions-item label="类目默认值">{{ formatDefaultValue(override.categoryDefault) }}</el-descriptions-item>
        <el-descriptions-item label="当前覆盖值">{{ formatDefaultValue(override.hardwareDefault) }}</el-descriptions-item>
        <el-descriptions-item label="校验结果">
          <el-tag :type="override.valid ? 'success' : 'danger'">{{ override.valid ? '合法' : '冲突' }}</el-tag>
          <span class="reason">{{ override.reason }}</span>
        </el-descriptions-item>
      </el-descriptions>

      <el-form label-width="96px" class="repair-form">
        <el-form-item label="修复方式">
          <div class="repair-mode-row">
            <el-radio-group v-model="mode">
              <el-radio-button label="update">手动修改</el-radio-button>
              <el-radio-button label="reset">恢复类目默认</el-radio-button>
              <el-radio-button label="clear">清空覆盖</el-radio-button>
            </el-radio-group>
            <RequirementMarker id="hardware-overrides" placement="top" />
          </div>
        </el-form-item>
        <el-form-item v-if="mode === 'update'" label="覆盖值">
          <el-input v-model="valueText" placeholder="请输入硬件默认值" clearable />
        </el-form-item>
      </el-form>
    </template>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <RequirementMarker id="hardware-overrides" placement="top-end" />
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import RequirementMarker from '@/components/RequirementMarker.vue';
import type { HardwareOverride } from '@/types/iot';
import { formatDefaultValue, repairHardwareOverride } from '@/api/iot/thingModel';

const props = defineProps<{
  modelValue: boolean;
  override?: HardwareOverride | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  success: [];
}>();

const visible = ref(false);
const submitLoading = ref(false);
const mode = ref<'update' | 'reset' | 'clear'>('update');
const valueText = ref('');

watch(
  () => props.modelValue,
  (value) => {
    visible.value = value;
    if (value && props.override) {
      mode.value = props.override.valid ? 'update' : 'reset';
      valueText.value = props.override.hardwareDefault === undefined ? '' : String(props.override.hardwareDefault);
    }
  },
  { immediate: true }
);

watch(visible, (value) => emit('update:modelValue', value));

function handleCancel() {
  visible.value = false;
}

async function handleSubmit() {
  if (!props.override) return;
  submitLoading.value = true;
  try {
    await repairHardwareOverride(props.override.id, {
      mode: mode.value,
      value: valueText.value
    });
    ElMessage.success('硬件覆盖已更新');
    visible.value = false;
    emit('success');
  } finally {
    submitLoading.value = false;
  }
}
</script>

<style scoped lang="scss">
.override-desc {
  margin-bottom: 16px;
}

.reason {
  margin-left: 8px;
  color: #607087;
}

.repair-form {
  padding-top: 6px;
}

.repair-mode-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
