<template>
  <div class="effective-panel">
    <div class="panel-title">
      <span>默认值计算</span>
      <el-button text type="primary" :icon="Refresh" @click="handleCalculate">刷新</el-button>
    </div>
    <el-form label-width="92px">
      <el-form-item label="物模型">
        <el-select v-model="modelIdentifier" filterable clearable placeholder="请选择物模型" style="width: 100%" @change="handleCalculate">
          <el-option v-for="model in modelOptions" :key="model.identifier" :label="model.name" :value="model.identifier" />
        </el-select>
      </el-form-item>
      <el-form-item label="设备覆盖">
        <el-input v-model="deviceDefault" placeholder="请输入设备级覆盖值" clearable @keyup.enter="handleCalculate" />
      </el-form-item>
    </el-form>
    <div class="result">
      <span>最终默认值</span>
      <strong>{{ resultText }}</strong>
      <el-tag size="small" :type="sourceTagType">{{ sourceText }}</el-tag>
      <p>{{ result?.path || '选择物模型后计算分层优先级' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Refresh } from '@element-plus/icons-vue';
import type { ThingModelDefinition } from '@/types/iot';
import { calculateEffectiveDefault, formatDefaultValue } from '@/api/iot/thingModel';

const props = defineProps<{
  categoryId: string;
  modelOptions: ThingModelDefinition[];
}>();

const modelIdentifier = ref('');
const deviceDefault = ref('');
const result = ref<{ value: unknown; source: 'system' | 'category' | 'hardware' | 'device'; path: string }>();

const sourceMap = {
  system: '系统默认',
  category: '类目默认',
  hardware: '硬件覆盖',
  device: '设备覆盖'
};
const sourceText = computed(() => (result.value ? sourceMap[result.value.source] : '未计算'));
const sourceTagType = computed(() => {
  if (!result.value) return 'info';
  return result.value.source === 'device' ? 'danger' : result.value.source === 'hardware' ? 'warning' : result.value.source === 'category' ? 'success' : 'info';
});
const resultText = computed(() => {
  const model = props.modelOptions.find((item) => item.identifier === modelIdentifier.value);
  return formatDefaultValue(result.value?.value, model?.dataSpec);
});

watch(
  () => props.modelOptions,
  (models) => {
    if (!modelIdentifier.value && models.length > 0) {
      modelIdentifier.value = models[0].identifier;
      handleCalculate();
    }
  },
  { immediate: true }
);

async function handleCalculate() {
  if (!modelIdentifier.value) return;
  let normalizedDeviceDefault: unknown = deviceDefault.value || undefined;
  const model = props.modelOptions.find((item) => item.identifier === modelIdentifier.value);
  if (model?.dataType === 'bool' && deviceDefault.value) {
    normalizedDeviceDefault = ['true', '1', '开启'].includes(deviceDefault.value);
  }
  if (model && ['int', 'float', 'double', 'enum'].includes(model.dataType) && deviceDefault.value) {
    normalizedDeviceDefault = Number(deviceDefault.value);
  }
  result.value = await calculateEffectiveDefault(props.categoryId, modelIdentifier.value, normalizedDeviceDefault);
}
</script>

<style scoped lang="scss">
.effective-panel {
  padding: 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: #ffffff;
}

.panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  color: #18202f;
  font-weight: 700;
}

.result {
  margin-top: 6px;
  padding: 14px;
  border-radius: 8px;
  background: #f7f9fb;

  span {
    display: block;
    color: #607087;
    font-size: 13px;
  }

  strong {
    display: block;
    margin: 6px 0 10px;
    color: #18202f;
    font-size: 20px;
    word-break: break-all;
  }

  p {
    margin: 10px 0 0;
    color: #607087;
    line-height: 1.5;
  }
}
</style>
