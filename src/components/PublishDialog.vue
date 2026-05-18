<template>
  <el-dialog
    v-model="visible"
    title="发布物模型模板"
    width="760px"
    append-to-body
    destroy-on-close
    :close-on-click-modal="false"
  >
    <el-skeleton v-if="checkLoading" :rows="8" animated />
    <template v-else-if="checkResult">
      <div class="summary-wrap">
        <el-row :gutter="12" class="summary-row">
          <el-col :span="6">
            <div class="metric">
              <strong>{{ checkResult.summary.created }}</strong>
              <span>新增</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="metric">
              <strong>{{ checkResult.summary.modified }}</strong>
              <span>修改</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="metric">
              <strong>{{ checkResult.summary.deprecated }}</strong>
              <span>废弃</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="metric">
              <strong>{{ checkResult.summary.defaultChanged }}</strong>
              <span>默认值变更</span>
            </div>
          </el-col>
        </el-row>
        <RequirementMarker id="publish-check" placement="left" />
      </div>

      <el-alert
        v-if="checkResult.passed"
        title="发布校验通过"
        type="success"
        show-icon
        :closable="false"
        description="发布会生成新的模板版本，草稿变更将成为线上生效版本。"
      />
      <el-alert
        v-else
        title="发布校验未通过"
        type="error"
        show-icon
        :closable="false"
        description="请先修复默认值、标识符或硬件覆盖冲突后再发布。"
      />

      <el-row :gutter="16" class="impact-row">
        <el-col :span="12">
          <div class="impact-item">
            <span>影响硬件型号</span>
            <strong>{{ checkResult.impact.hardwareCount }}</strong>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="impact-item">
            <span>影响设备数量</span>
            <strong>{{ checkResult.impact.deviceCount }}</strong>
          </div>
        </el-col>
      </el-row>

      <el-form label-width="96px">
        <el-form-item label="发布说明">
          <el-input
            v-model="releaseNote"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
            placeholder="请输入发布说明"
            clearable
          />
          <RequirementMarker id="publish-note-sync" inline placement="top" />
        </el-form-item>
        <el-form-item label="同步策略">
          <el-checkbox v-model="syncHardware">同步到允许继承的硬件型号</el-checkbox>
          <el-checkbox v-model="triggerInitTask">发布后触发默认值初始化任务</el-checkbox>
          <RequirementMarker id="publish-note-sync" inline placement="top" />
        </el-form-item>
      </el-form>

      <div v-if="checkResult.errors.length" class="check-list check-list--error">
        <div class="check-list__head">
          <h4>阻断项</h4>
          <RequirementMarker id="publish-check" placement="top" />
        </div>
        <p v-for="item in checkResult.errors" :key="item">{{ item }}</p>
        <div class="quick-actions">
          <el-button size="small" type="danger" plain @click="emit('navigate', 'hardware')">去修复硬件覆盖</el-button>
          <el-button size="small" plain @click="emit('navigate', 'changes')">查看草稿变更</el-button>
          <el-button size="small" plain @click="emit('navigate', 'models')">返回物模型列表</el-button>
        </div>
      </div>
      <div v-if="checkResult.warnings.length" class="check-list check-list--warning">
        <div class="check-list__head">
          <h4>高风险提示</h4>
          <RequirementMarker id="publish-check" placement="top" />
        </div>
        <p v-for="item in checkResult.warnings" :key="item">{{ item }}</p>
      </div>
    </template>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <RequirementMarker id="publish-check" placement="top-end" />
        <el-button type="primary" :loading="submitLoading" :disabled="!checkResult?.passed" @click="handlePublish">确定发布</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import RequirementMarker from '@/components/RequirementMarker.vue';
import type { PublishCheckResult } from '@/types/iot';
import { checkPublish, publishTemplate } from '@/api/iot/thingModel';

const props = defineProps<{
  modelValue: boolean;
  categoryId: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  success: [];
  navigate: [target: 'models' | 'changes' | 'hardware'];
}>();

const visible = ref(false);
const checkLoading = ref(false);
const submitLoading = ref(false);
const checkResult = ref<PublishCheckResult>();
const releaseNote = ref('');
const syncHardware = ref(true);
const triggerInitTask = ref(false);

watch(
  () => props.modelValue,
  async (value) => {
    visible.value = value;
    if (value) {
      await loadCheckResult();
    }
  },
  { immediate: true }
);

watch(visible, (value) => emit('update:modelValue', value));

async function loadCheckResult() {
  checkLoading.value = true;
  try {
    checkResult.value = await checkPublish(props.categoryId);
    releaseNote.value = '发布类目物模型模板草稿变更';
  } finally {
    checkLoading.value = false;
  }
}

function handleCancel() {
  visible.value = false;
}

async function handlePublish() {
  if (!releaseNote.value.trim()) {
    ElMessage.warning('请输入发布说明');
    return;
  }
  submitLoading.value = true;
  try {
    await publishTemplate(props.categoryId, releaseNote.value);
    ElMessage.success('模板版本已发布');
    visible.value = false;
    emit('success');
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '发布失败');
  } finally {
    submitLoading.value = false;
  }
}
</script>

<style scoped lang="scss">
.summary-wrap {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
  margin-bottom: 14px;
}

.summary-row {
  min-width: 0;
}

.metric,
.impact-item {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: #f8fafc;
}

.metric {
  padding: 12px;
  text-align: center;

  strong {
    display: block;
    color: #0f766e;
    font-size: 24px;
    line-height: 1.1;
  }

  span {
    color: #607087;
    font-size: 13px;
  }
}

.impact-row {
  margin: 14px 0;
}

.impact-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;

  span {
    color: #607087;
  }

  strong {
    color: #18202f;
    font-size: 18px;
  }
}

.check-list {
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 8px;

  h4 {
    margin: 0 0 8px;
    font-size: 14px;
  }

  p {
    margin: 6px 0;
    color: #364152;
    line-height: 1.5;
  }
}

.check-list__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;

  h4 {
    margin: 0;
  }
}

.check-list--error {
  background: #fef2f2;
}

.check-list--warning {
  background: #fff7ed;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
</style>
