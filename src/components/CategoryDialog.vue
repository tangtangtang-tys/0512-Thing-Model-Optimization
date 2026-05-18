<template>
  <el-dialog
    v-model="visible"
    :title="form.id ? '编辑类目' : '新增类目'"
    width="470px"
    append-to-body
    destroy-on-close
    :close-on-click-modal="false"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="88px" class="prototype-form">
      <el-form-item label="类目名称" prop="name">
        <el-input v-model="form.name" maxlength="20" show-word-limit placeholder="请输入功能类的名称" clearable />
      </el-form-item>
      <el-form-item label="备注" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="4"
          maxlength="200"
          show-word-limit
          placeholder="请输入该功能类型的备注说明，例如AI服务类的功能"
          clearable
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <RequirementMarker id="category-manage" placement="top-end" />
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">完成</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import RequirementMarker from '@/components/RequirementMarker.vue';
import type { ProductCategory } from '@/types/iot';
import { saveProductCategory } from '@/api/iot/thingModel';

const props = defineProps<{
  modelValue: boolean;
  category?: ProductCategory | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  success: [];
}>();

const visible = ref(false);
const submitLoading = ref(false);
const formRef = ref<FormInstance>();
const form = reactive<Partial<ProductCategory>>({
  name: '',
  code: '',
  description: '',
  status: 'draft'
});

const rules: FormRules = {
  name: [{ required: true, message: '类目名称不能为空', trigger: 'blur' }],
  description: [{ required: true, message: '备注不能为空', trigger: 'blur' }]
};

watch(
  () => props.modelValue,
  (value) => {
    visible.value = value;
    if (value) {
      Object.assign(form, {
        id: props.category?.id,
        name: props.category?.name || '',
        code: props.category?.code || `CATEGORY_${Date.now()}`,
        description: props.category?.description || '',
        status: props.category?.status || 'draft'
      });
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
    await saveProductCategory(form);
    ElMessage.success('产品类目已保存');
    visible.value = false;
    emit('success');
  } finally {
    submitLoading.value = false;
  }
}
</script>

<style scoped lang="scss">
.prototype-form {
  padding: 18px 10px 8px;
}

:deep(.el-form-item) {
  margin-bottom: 26px;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  border-radius: 4px;
}

:deep(.el-dialog__header) {
  padding: 18px 28px 10px;
  margin-right: 0;
}

:deep(.el-dialog__body) {
  padding: 0 28px 10px;
}

:deep(.el-dialog__footer) {
  padding: 16px 28px 24px;
}
</style>
