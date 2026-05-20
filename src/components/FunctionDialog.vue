<template>
  <el-dialog
    v-model="visible"
    title="新增功能"
    width="500px"
    append-to-body
    destroy-on-close
    :close-on-click-modal="false"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="96px" class="function-form">
      <el-form-item label="功能项名称" prop="name">
        <el-input v-model="form.name" maxlength="50" show-word-limit placeholder="请输入功能项的名称" clearable />
      </el-form-item>
      <el-form-item label="关联硬件">
        <el-select v-model="form.hardware" filterable clearable placeholder="请选择关联硬件" style="width: 100%">
          <el-option label="BM-Lite-01" value="BM-Lite-01" />
          <el-option label="BM-Pro-02" value="BM-Pro-02" />
          <el-option label="IPC-Pro-01" value="IPC-Pro-01" />
        </el-select>
      </el-form-item>
      <el-form-item label="关联类目" prop="categoryName">
        <el-select v-model="form.categoryName" filterable clearable placeholder="请选择关联类目" style="width: 100%">
          <el-option v-for="item in categoryOptions" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" :rows="3" maxlength="100" show-word-limit placeholder="请输入备注说明" clearable />
      </el-form-item>
      <el-form-item label="功能示例图" required class="upload-form-item">
        <div>
          <div class="upload-box">
            <el-icon><Plus /></el-icon>
          </div>
          <div class="upload-tip">建议上传110*110px大小的图片<br />支持格式：.jpg .png .jpeg，单个文件不能超过5MB</div>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <RequirementMarker id="function-manage" placement="top-end" />
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存功能项</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import RequirementMarker from '@/components/RequirementMarker.vue';

const props = defineProps<{
  modelValue: boolean;
  categoryOptions: string[];
  currentCategory?: string;
  initialName?: string;
  initialRemark?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  success: [name: string];
}>();

const visible = ref(false);
const submitLoading = ref(false);
const formRef = ref<FormInstance>();
const form = reactive({
  name: '',
  hardware: '',
  categoryName: '',
  remark: ''
});

const rules: FormRules = {
  name: [{ required: true, message: '功能项名称不能为空', trigger: 'blur' }],
  categoryName: [{ required: true, message: '关联类目不能为空', trigger: 'change' }],
  remark: [{ required: true, message: '备注不能为空', trigger: 'blur' }]
};

watch(
  () => props.modelValue,
  (value) => {
    visible.value = value;
    if (value) {
      form.name = props.initialName || '';
      form.hardware = '';
      form.categoryName = props.currentCategory || '';
      form.remark = props.initialRemark || '';
    }
  },
  { immediate: true }
);

watch(visible, (value) => emit('update:modelValue', value));

function handleCancel() {
  visible.value = false;
}

async function handleSubmit() {
  await formRef.value?.validate();
  submitLoading.value = true;
  try {
    ElMessage.success('功能项已创建');
    visible.value = false;
    emit('success', form.name);
  } finally {
    submitLoading.value = false;
  }
}
</script>

<style scoped lang="scss">
.function-form {
  padding: 20px 8px 4px;
}

:deep(.el-form-item) {
  margin-bottom: 26px;
}

:deep(.el-input__wrapper),
:deep(.el-select__wrapper),
:deep(.el-textarea__inner) {
  border-radius: 4px;
}

.upload-box {
  display: grid;
  width: 110px;
  height: 110px;
  place-items: center;
  border: 1px dashed #d5deeb;
  border-radius: 4px;
  background: #f8fafc;
  color: #8a95a6;
  font-size: 18px;
}

.upload-tip {
  margin-top: 10px;
  color: #8a95a6;
  font-size: 12px;
  line-height: 1.5;
}

.upload-form-item {
  margin-bottom: 18px;
}

:deep(.el-dialog__header) {
  padding: 18px 28px 10px;
  margin-right: 0;
}

:deep(.el-dialog__body) {
  padding: 0 28px;
}

:deep(.el-dialog__footer) {
  padding: 16px 28px 24px;
}
</style>
