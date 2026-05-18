<template>
  <el-drawer
    v-model="visible"
    :title="form.id ? '编辑物模型' : '添加物模型'"
    size="48%"
    class="thing-model-drawer"
    append-to-body
    destroy-on-close
    :close-on-click-modal="false"
  >
    <div class="drawer-layout">
      <aside class="step-nav">
        <button
          v-for="(step, index) in steps"
          :key="step.key"
          class="step-item"
          :class="{ active: activeStep === index, done: index < activeStep }"
          type="button"
          @click="activeStep = index"
        >
          <span>{{ index + 1 }}</span>
          <strong>{{ step.title }}</strong>
          <em>{{ step.desc }}</em>
        </button>
      </aside>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="118px" class="model-form">
        <section v-show="activeStep === 0" class="step-panel">
          <header class="step-head">
            <h3>定义设备能力</h3>
            <p>先明确该能力属于属性、服务还是事件，后续会影响访问权限、默认值策略和发布校验。</p>
          </header>

          <el-form-item label="物模型类型" prop="modelType">
            <el-radio-group v-model="form.modelType" class="model-type-cards" @change="handleTypeChange">
              <el-radio-button label="property">
                <strong>属性</strong>
                <span>设备状态或可配置参数</span>
              </el-radio-button>
              <el-radio-button label="service">
                <strong>服务</strong>
                <span>云端向设备发起的指令</span>
              </el-radio-button>
              <el-radio-button label="event">
                <strong>事件</strong>
                <span>设备主动上报的告警/通知</span>
              </el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="物模型名称" prop="name">
                <el-input v-model="form.name" maxlength="50" show-word-limit placeholder="例如：哭声检测开关" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="标识符" prop="identifier">
                <el-input v-model="form.identifier" maxlength="50" show-word-limit placeholder="例如：cry_detection_enable" clearable />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="绑定功能项">
                <el-select v-model="form.functionItems" multiple filterable clearable allow-create placeholder="请选择或输入功能项" style="width: 100%">
                  <el-option v-for="item in functionOptions" :key="item" :label="item" :value="item" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="来源">
                <el-select v-model="form.source" placeholder="请选择来源" style="width: 100%">
                  <el-option label="标准模板" value="standard" />
                  <el-option label="自定义" value="custom" />
                  <el-option label="硬件扩展" value="hardware" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="业务说明">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="4"
              maxlength="200"
              show-word-limit
              placeholder="说明该物模型的业务含义、适用设备能力和 App/云端使用场景"
              clearable
            />
          </el-form-item>
        </section>

        <section v-show="activeStep === 1" class="step-panel">
          <header class="step-head">
            <h3>配置 TSL 数据定义</h3>
            <p>用标准数据类型约束设备上报、云端下发和 App 展示，避免后续硬件型号重复定义。</p>
          </header>

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="数据类型" prop="dataType">
                <el-select v-model="form.dataType" filterable clearable placeholder="请选择数据类型" style="width: 100%" @change="handleDataTypeChange">
                  <el-option label="布尔型 Bool - 开关状态" value="bool" />
                  <el-option label="枚举型 Enum - 固定档位" value="enum" />
                  <el-option label="整数型 Int - 整数数值" value="int" />
                  <el-option label="浮点型 Float - 小数数值" value="float" />
                  <el-option label="双精度 Double - 高精度小数" value="double" />
                  <el-option label="文本型 Text - 字符串" value="text" />
                  <el-option label="时间型 Date - 时间点" value="date" />
                  <el-option label="数组型 Array - 多组配置" value="array" />
                  <el-option label="结构体 Struct - 复合对象" value="struct" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="访问权限" prop="accessMode">
                <el-radio-group v-model="form.accessMode" class="access-radio">
                  <el-radio label="r">只读</el-radio>
                  <el-radio label="rw" :disabled="form.modelType === 'event' || form.modelType === 'service'">读写</el-radio>
                  <el-radio label="w" :disabled="form.modelType === 'event'">只写</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <div class="type-config">
            <el-row v-if="form.dataType === 'bool'" :gutter="16">
              <el-col :span="12">
                <el-form-item label="0 值文案">
                  <el-input v-model="form.dataSpec.falseText" placeholder="例如：关闭" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="1 值文案">
                  <el-input v-model="form.dataSpec.trueText" placeholder="例如：开启" clearable />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item v-if="form.dataType === 'enum'" label="枚举定义" class="enum-form-item">
              <div class="enum-config">
                <div class="config-head">
                  <span>枚举值需保持稳定，发布后应避免修改已有枚举含义。</span>
                  <el-button text type="primary" :icon="Plus" @click="addEnumItem">添加参数</el-button>
                </div>
                <div v-for="(item, index) in enumItems" :key="index" class="enum-row">
                  <span>枚举值</span>
                  <el-input v-model="item.value" class="enum-value-input" placeholder="值" clearable />
                  <span>参数描述</span>
                  <el-input v-model="item.label" class="enum-label-input" placeholder="例如：高" clearable />
                  <el-button text type="danger" @click="removeEnumItem(index)">删除</el-button>
                </div>
              </div>
            </el-form-item>

            <el-row v-if="isNumberType" :gutter="16">
              <el-col :span="6">
                <el-form-item label="最小值">
                  <el-input-number v-model="form.dataSpec.min" :min="-999999" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="最大值">
                  <el-input-number v-model="form.dataSpec.max" :min="-999999" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="步长">
                  <el-input-number v-model="form.dataSpec.step" :min="0" :precision="3" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="单位">
                  <el-input v-model="form.dataSpec.unit" placeholder="例如：C、%" clearable />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row v-if="form.dataType === 'text'" :gutter="16">
              <el-col :span="12">
                <el-form-item label="最大长度">
                  <el-input-number v-model="form.dataSpec.maxLength" :min="1" :max="2048" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row v-if="form.dataType === 'array'" :gutter="16">
              <el-col :span="8">
                <el-form-item label="元素类型">
                  <el-select v-model="form.dataSpec.elementType" filterable clearable placeholder="请选择元素类型" style="width: 100%">
                    <el-option label="Bool" value="bool" />
                    <el-option label="Enum" value="enum" />
                    <el-option label="Int" value="int" />
                    <el-option label="Float" value="float" />
                    <el-option label="Double" value="double" />
                    <el-option label="Text" value="text" />
                    <el-option label="Date" value="date" />
                    <el-option label="Struct" value="struct" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="最小元素数">
                  <el-input-number v-model="form.dataSpec.minItems" :min="0" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="最大元素数">
                  <el-input-number v-model="form.dataSpec.maxItems" :min="0" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>

            <div v-if="form.dataType === 'struct' || form.dataSpec.elementType === 'struct'" class="struct-table">
              <div class="config-head">
                <span>结构体字段</span>
                <el-button text type="primary" :icon="Plus" @click="addStructField">新增字段</el-button>
              </div>
              <div v-for="(field, index) in structFields" :key="index" class="struct-row">
                <el-input v-model="field.name" placeholder="字段名" clearable />
                <el-input v-model="field.identifier" placeholder="标识符" clearable />
                <el-select v-model="field.dataType" filterable clearable placeholder="类型">
                  <el-option label="Bool" value="bool" />
                  <el-option label="Enum" value="enum" />
                  <el-option label="Int" value="int" />
                  <el-option label="Float" value="float" />
                  <el-option label="Text" value="text" />
                </el-select>
                <el-input-number v-model="field.min" placeholder="最小" />
                <el-button text type="danger" :icon="Delete" @click="removeStructField(index)">删除</el-button>
              </div>
            </div>
          </div>
        </section>

        <section v-show="activeStep === 2" class="step-panel">
          <header class="step-head">
            <h3>{{ defaultStepTitle }}</h3>
            <p>{{ defaultStepDesc }}</p>
          </header>

          <el-alert class="strategy-alert" type="info" show-icon :closable="false">
            <template #title>
              {{ defaultStrategyTip }}
            </template>
          </el-alert>

          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="启用配置">
                <el-switch v-model="form.defaultConfig.enabled" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="允许硬件覆盖">
                <el-switch v-model="form.defaultConfig.allowHardwareOverride" :disabled="form.modelType === 'event'" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="允许设备覆盖">
                <el-switch v-model="form.defaultConfig.allowDeviceOverride" :disabled="form.modelType === 'event'" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item :label="form.modelType === 'event' ? '示例值' : '默认值'" prop="defaultConfig.value">
                <el-switch v-if="form.dataType === 'bool'" v-model="form.defaultConfig.value" />
                <el-select
                  v-else-if="form.dataType === 'enum'"
                  v-model="form.defaultConfig.value"
                  filterable
                  clearable
                  placeholder="请选择默认值"
                  style="width: 100%"
                >
                  <el-option v-for="item in enumItems" :key="String(item.value)" :label="item.label" :value="item.value" />
                </el-select>
                <el-input-number
                  v-else-if="isNumberType"
                  v-model="numberDefaultValue"
                  :min="form.dataSpec.min"
                  :max="form.dataSpec.max"
                  :step="form.dataSpec.step || 1"
                  style="width: 100%"
                />
                <el-date-picker
                  v-else-if="form.dataType === 'date'"
                  v-model="form.defaultConfig.value"
                  type="datetime"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  placeholder="请选择默认时间"
                  style="width: 100%"
                />
                <el-input
                  v-else-if="form.dataType === 'array' || form.dataType === 'struct'"
                  v-model="jsonDefaultValue"
                  type="textarea"
                  :rows="5"
                  placeholder="请输入 JSON 默认值"
                  clearable
                />
                <el-input v-else v-model="textDefaultValue" placeholder="请输入默认值" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="空值策略">
                <el-select v-model="form.defaultConfig.emptyValueStrategy" filterable clearable placeholder="请选择空值策略" style="width: 100%">
                  <el-option label="设备未上报时使用默认值" value="use_default" />
                  <el-option label="展示空值" value="show_empty" />
                  <el-option label="展示未知" value="show_unknown" />
                </el-select>
              </el-form-item>
              <el-form-item label="下发策略">
                <el-select v-model="form.defaultConfig.deliveryStrategy" filterable clearable placeholder="请选择下发策略" style="width: 100%">
                  <el-option label="仅展示兜底" value="display_only" />
                  <el-option label="设备激活时下发" value="on_device_activation" :disabled="form.accessMode === 'r' || form.modelType === 'event'" />
                  <el-option label="恢复出厂后下发" value="on_factory_reset" :disabled="form.accessMode === 'r' || form.modelType === 'event'" />
                  <el-option label="手动应用" value="manual_apply" :disabled="form.accessMode === 'r' || form.modelType === 'event'" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <div class="inheritance-preview">
            <strong>默认值继承链</strong>
            <span>产品类目默认值</span>
            <i />
            <span>硬件型号覆盖</span>
            <i />
            <span>设备实例覆盖</span>
          </div>
        </section>

        <section v-show="activeStep === 3" class="step-panel">
          <header class="step-head">
            <h3>治理规则与发布影响</h3>
            <p>配置发布后的兼容策略、展示策略和排序，确保后续版本迭代不需要重建功能项。</p>
          </header>

          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="是否必填">
                <el-switch v-model="form.required" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="默认展示">
                <el-switch v-model="form.visible" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="排序">
                <el-input-number v-model="form.sort" :min="0" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="兼容策略">
                <el-select v-model="form.compatibilityPolicy" filterable clearable placeholder="请选择兼容策略" style="width: 100%">
                  <el-option label="允许新增 - 推荐用于新增能力" value="allow_add" />
                  <el-option label="允许废弃 - 保留历史兼容" value="allow_deprecate" />
                  <el-option label="禁止修改 - 关键标准能力" value="locked" />
                  <el-option label="允许扩展 - 枚举/结构体可扩展" value="allow_extend" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="版本状态">
                <el-tag type="warning" effect="plain">{{ form.id ? '编辑后生成草稿变更' : '新增后保存为草稿' }}</el-tag>
              </el-form-item>
            </el-col>
          </el-row>

          <div class="review-card">
            <h4>保存后系统会执行</h4>
            <p>1. 校验标识符唯一性、默认值类型、数值范围和只读下发策略。</p>
            <p>2. 写入草稿变更，发布前进入发布校验和审计日志。</p>
            <p>3. 发布后类目模板、硬件覆盖、设备初始化效果同步刷新。</p>
          </div>
        </section>
      </el-form>
    </div>

    <template #footer>
      <div class="drawer-footer">
        <div class="footer-hint">{{ footerHint }}</div>
        <div>
          <el-button @click="handleCancel">取消</el-button>
          <el-button v-if="activeStep > 0" @click="activeStep -= 1">上一步</el-button>
          <el-button v-if="activeStep < steps.length - 1" type="primary" plain @click="handleNextStep">下一步</el-button>
          <el-button :type="activeStep === steps.length - 1 ? 'primary' : 'default'" :loading="submitLoading" @click="handleSubmit">保存草稿</el-button>
        </div>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, reactive, ref, toRaw, watch } from 'vue';
import { Delete, Plus } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import type { DataType, ThingModelDefinition } from '@/types/iot';
import { saveThingModel, validateDefaultValue } from '@/api/iot/thingModel';

const props = defineProps<{
  modelValue: boolean;
  model?: ThingModelDefinition | null;
  functionOptions: string[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  success: [];
}>();

function createBlankForm(): ThingModelDefinition {
  return {
    id: '',
    categoryId: '',
    name: '',
    identifier: '',
    modelType: 'property',
    dataType: 'bool',
    accessMode: 'rw',
    dataSpec: { trueText: '开启', falseText: '关闭' },
    defaultConfig: {
      enabled: true,
      value: false,
      source: 'category',
      allowHardwareOverride: true,
      allowDeviceOverride: true,
      emptyValueStrategy: 'use_default',
      deliveryStrategy: 'on_device_activation'
    },
    functionItems: [],
    required: false,
    visible: true,
    sort: 100,
    compatibilityPolicy: 'allow_add',
    description: '',
    source: 'custom',
    status: 'draft',
    changeStatus: 'created',
    version: '',
    updatedAt: ''
  };
}

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
});
const submitLoading = ref(false);
const activeStep = ref(0);
const formRef = ref<FormInstance>();
const form = reactive<ThingModelDefinition>(createBlankForm());

const steps = [
  { key: 'basic', title: '能力归属', desc: '类型、名称、标识符' },
  { key: 'schema', title: '数据定义', desc: 'TSL 类型与约束' },
  { key: 'default', title: '默认值策略', desc: '类目默认与继承链' },
  { key: 'governance', title: '治理发布', desc: '兼容、展示、发布影响' }
];

const rules: FormRules = {
  name: [{ required: true, message: '物模型名称不能为空', trigger: 'blur' }],
  identifier: [
    { required: true, message: '标识符不能为空', trigger: 'blur' },
    { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '标识符需以字母开头，仅支持字母、数字、下划线', trigger: 'blur' }
  ],
  modelType: [{ required: true, message: '物模型类型不能为空', trigger: 'change' }],
  dataType: [{ required: true, message: '数据类型不能为空', trigger: 'change' }],
  accessMode: [{ required: true, message: '访问权限不能为空', trigger: 'change' }]
};

const isNumberType = computed(() => ['int', 'float', 'double'].includes(form.dataType));
const footerHint = computed(() => {
  if (activeStep.value === 0) return '建议命名保持业务语义清晰，标识符发布后应尽量稳定。';
  if (activeStep.value === 1) return '数据定义会影响默认值校验、硬件覆盖校验和设备端解析。';
  if (activeStep.value === 2) return '默认值保存到类目模板，发布后可用于设备初始化和展示兜底。';
  return '保存后进入草稿变更，需要发布后才会成为线上模板。';
});
const defaultStepTitle = computed(() => {
  if (form.modelType === 'event') return '配置事件示例值';
  if (form.modelType === 'service') return '配置服务入参默认值';
  return '配置类目默认值';
});
const defaultStepDesc = computed(() => {
  if (form.modelType === 'event') return '事件示例值用于文档、调试和模拟上报，不参与设备初始化下发。';
  if (form.modelType === 'service') return '服务入参默认值用于控制台调试、App 快捷操作和联动编排，通常不直接下发为设备状态。';
  return '默认值沉淀在产品类目模板中，硬件型号和设备实例可按策略继承或覆盖，降低重复维护成本。';
});
const defaultStrategyTip = computed(() => {
  if (form.modelType === 'event') return '事件仅配置示例值，不允许作为运行默认值下发。';
  if (form.modelType === 'service') return '服务建议使用展示/调试默认值；真正执行时仍由用户或自动化规则触发调用。';
  return '建议优先配置类目默认值，再由硬件覆盖处理型号差异。';
});
const numberDefaultValue = computed({
  get: () => Number(form.defaultConfig?.value || 0),
  set: (value: number | undefined) => {
    form.defaultConfig.value = value ?? 0;
  }
});
const textDefaultValue = computed({
  get: () => String(form.defaultConfig?.value ?? ''),
  set: (value: string) => {
    form.defaultConfig.value = value;
  }
});
const jsonDefaultValue = computed({
  get: () => JSON.stringify(form.defaultConfig?.value ?? (form.dataType === 'array' ? [] : {}), null, 2),
  set: (value: string) => {
    try {
      form.defaultConfig.value = JSON.parse(value);
    } catch {
      form.defaultConfig.value = value;
    }
  }
});
const enumItems = computed(() => form.dataSpec.enumItems || []);
const structFields = computed(() => form.dataSpec.properties || []);

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      activeStep.value = 0;
      try {
        Object.assign(form, normalizeModelForm(props.model));
      } catch (error) {
        Object.assign(form, createBlankForm());
        ElMessage.error(error instanceof Error ? `物模型表单初始化失败：${error.message}` : '物模型表单初始化失败');
      }
    }
  },
  { immediate: true }
);

watch(
  () => form.accessMode,
  (value) => {
    if (value === 'r' && form.defaultConfig.deliveryStrategy !== 'display_only') {
      form.defaultConfig.deliveryStrategy = 'display_only';
    }
  }
);

function handleTypeChange() {
  if (form.modelType === 'event') {
    form.accessMode = 'r';
    form.defaultConfig.deliveryStrategy = 'display_only';
    form.defaultConfig.allowHardwareOverride = false;
    form.defaultConfig.allowDeviceOverride = false;
  }
  if (form.modelType === 'service') {
    form.accessMode = 'w';
    form.defaultConfig.deliveryStrategy = 'display_only';
    form.defaultConfig.allowHardwareOverride = false;
    form.defaultConfig.allowDeviceOverride = false;
  }
  if (form.modelType === 'property' && form.accessMode === 'w') {
    form.accessMode = 'rw';
  }
  if (form.modelType === 'property') {
    form.defaultConfig.allowHardwareOverride = true;
    form.defaultConfig.allowDeviceOverride = true;
  }
}

function handleDataTypeChange(value: DataType) {
  if (value === 'bool') {
    form.dataSpec = { trueText: '开启', falseText: '关闭' };
    form.defaultConfig.value = false;
  } else if (value === 'enum') {
    form.dataSpec = {
      enumItems: [
        { value: 0, label: '高' },
        { value: 1, label: '中' },
        { value: 2, label: '低' }
      ]
    };
    form.defaultConfig.value = 0;
  } else if (['int', 'float', 'double'].includes(value)) {
    form.dataSpec = { min: 0, max: 100, step: 1, unit: '' };
    form.defaultConfig.value = 0;
  } else if (value === 'array') {
    form.dataSpec = { elementType: 'struct', minItems: 0, maxItems: 10, properties: [] };
    form.defaultConfig.value = [];
  } else if (value === 'struct') {
    form.dataSpec = { properties: [] };
    form.defaultConfig.value = {};
  } else if (value === 'text') {
    form.dataSpec = { maxLength: 128 };
    form.defaultConfig.value = '';
  } else {
    form.dataSpec = {};
    form.defaultConfig.value = '';
  }
}

function normalizeModelForm(model?: ThingModelDefinition | null): ThingModelDefinition {
  const blank = createBlankForm();
  const source: Partial<ThingModelDefinition> = model ? clonePlain(toRaw(model)) : {};
  const normalized = {
    ...blank,
    ...source,
    dataSpec: {
      ...blank.dataSpec,
      ...(source.dataSpec || {})
    },
    defaultConfig: {
      ...blank.defaultConfig,
      ...(source.defaultConfig || {})
    },
    functionItems: Array.isArray(source.functionItems) ? source.functionItems : [],
    required: source.required ?? blank.required,
    visible: source.visible ?? blank.visible,
    sort: source.sort ?? blank.sort,
    compatibilityPolicy: source.compatibilityPolicy || blank.compatibilityPolicy,
    source: source.source || blank.source,
    status: source.status || blank.status,
    changeStatus: source.changeStatus || blank.changeStatus
  } as ThingModelDefinition;

  normalizeSpecByType(normalized);
  normalizeDefaultByType(normalized);
  return normalized;
}

function clonePlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeSpecByType(model: ThingModelDefinition) {
  if (model.dataType === 'bool') {
    model.dataSpec.trueText ||= '开启';
    model.dataSpec.falseText ||= '关闭';
  }
  if (model.dataType === 'enum' && !Array.isArray(model.dataSpec.enumItems)) {
    model.dataSpec.enumItems = [
      { value: 0, label: '高' },
      { value: 1, label: '中' },
      { value: 2, label: '低' }
    ];
  }
  if (['int', 'float', 'double'].includes(model.dataType)) {
    model.dataSpec.min ??= 0;
    model.dataSpec.max ??= 100;
    model.dataSpec.step ??= 1;
  }
  if (model.dataType === 'text') {
    model.dataSpec.maxLength ??= 128;
  }
  if (model.dataType === 'array') {
    model.dataSpec.elementType ||= 'struct';
    model.dataSpec.minItems ??= 0;
    model.dataSpec.maxItems ??= 10;
  }
  if ((model.dataType === 'struct' || model.dataSpec.elementType === 'struct') && !Array.isArray(model.dataSpec.properties)) {
    model.dataSpec.properties = [];
  }
}

function normalizeDefaultByType(model: ThingModelDefinition) {
  if (model.defaultConfig.value !== undefined && model.defaultConfig.value !== null) return;
  if (model.dataType === 'bool') model.defaultConfig.value = false;
  else if (model.dataType === 'enum') model.defaultConfig.value = model.dataSpec.enumItems?.[0]?.value ?? 0;
  else if (['int', 'float', 'double'].includes(model.dataType)) model.defaultConfig.value = 0;
  else if (model.dataType === 'array') model.defaultConfig.value = [];
  else if (model.dataType === 'struct') model.defaultConfig.value = {};
  else model.defaultConfig.value = '';
}

function addEnumItem() {
  form.dataSpec.enumItems ||= [];
  form.dataSpec.enumItems.push({ value: form.dataSpec.enumItems.length, label: '' });
}

function removeEnumItem(index: number) {
  form.dataSpec.enumItems?.splice(index, 1);
}

function addStructField() {
  form.dataSpec.properties ||= [];
  form.dataSpec.properties.push({
    name: '',
    identifier: '',
    dataType: 'text'
  });
}

function removeStructField(index: number) {
  form.dataSpec.properties?.splice(index, 1);
}

async function handleNextStep() {
  const valid = await validateCurrentStep();
  if (!valid) return;
  activeStep.value += 1;
}

async function validateCurrentStep() {
  try {
    if (activeStep.value === 0) {
      await formRef.value?.validateField(['modelType', 'name', 'identifier']);
    }
    if (activeStep.value === 1) {
      await formRef.value?.validateField(['dataType', 'accessMode']);
    }
    if (activeStep.value === 2) {
      const errors = validateDefaultValue(form);
      if (errors.length > 0) {
        ElMessage.error(errors[0]);
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

function handleCancel() {
  visible.value = false;
}

async function handleSubmit() {
  normalizeBeforeSubmit();
  try {
    await formRef.value?.validate();
  } catch {
    activeStep.value = 0;
    ElMessage.error('请先补齐物模型名称、标识符、数据类型和访问权限');
    return;
  }

  const errors = validateDefaultValue(form);
  if (errors.length > 0) {
    ElMessage.error(errors[0]);
    activeStep.value = 2;
    return;
  }

  submitLoading.value = true;
  try {
    await saveThingModel(form);
    ElMessage.success('物模型已保存为草稿');
    visible.value = false;
    emit('success');
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '保存失败');
  } finally {
    submitLoading.value = false;
  }
}

function normalizeBeforeSubmit() {
  if (form.modelType === 'event') {
    form.accessMode = 'r';
    form.defaultConfig.deliveryStrategy = 'display_only';
    form.defaultConfig.allowHardwareOverride = false;
    form.defaultConfig.allowDeviceOverride = false;
  }
  if (form.modelType === 'service') {
    form.accessMode = 'w';
    form.defaultConfig.deliveryStrategy = 'display_only';
  }
  if (form.accessMode === 'r') {
    form.defaultConfig.deliveryStrategy = 'display_only';
  }
  if (!form.functionItems.length) {
    form.functionItems = ['未分组功能项'];
  }
}
</script>

<style scoped lang="scss">
.drawer-layout {
  display: grid;
  grid-template-columns: 176px minmax(0, 1fr);
  min-height: calc(100vh - 138px);
}

.step-nav {
  padding: 14px 14px 80px 0;
  border-right: 1px solid #edf2f7;
}

.step-item {
  display: grid;
  width: 100%;
  grid-template-columns: 28px 1fr;
  gap: 3px 10px;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: #4b5563;
  text-align: left;
  cursor: pointer;

  span {
    display: grid;
    width: 26px;
    height: 26px;
    grid-row: span 2;
    place-items: center;
    border-radius: 50%;
    background: #eef2f7;
    color: #64748b;
    font-size: 13px;
  }

  strong {
    color: #111827;
    font-size: 14px;
  }

  em {
    color: #8a95a6;
    font-size: 12px;
    font-style: normal;
  }

  &.active {
    border-color: #b8d4ff;
    background: #eef6ff;

    span {
      background: #1264ff;
      color: #fff;
    }
  }

  &.done span {
    background: #10b981;
    color: #fff;
  }
}

.model-form {
  min-width: 0;
  padding: 18px 30px 0 28px;
}

.step-panel {
  padding-bottom: 18px;
}

.step-head {
  margin-bottom: 18px;

  h3 {
    margin: 0 0 8px;
    color: #111827;
    font-size: 16px;
  }

  p {
    margin: 0;
    color: #6b7280;
    font-size: 13px;
    line-height: 1.6;
  }
}

:deep(.thing-model-drawer) {
  min-width: 880px;
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-form-item__label) {
  color: #4b5563;
  font-weight: 400;
}

:deep(.el-input__wrapper),
:deep(.el-select__wrapper),
:deep(.el-textarea__inner),
:deep(.el-input-number .el-input__wrapper) {
  border-radius: 4px;
}

.model-type-cards {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    border-color: #1264ff;
    background: #eef6ff;
    box-shadow: none;
    color: #1264ff;
  }

  :deep(.el-radio-button__inner) {
    display: block;
    min-height: 74px;
    padding: 14px 12px;
    border: 1px solid #dbe3ef;
    border-radius: 6px !important;
    text-align: left;
    white-space: normal;
  }

  strong,
  span {
    display: block;
  }

  strong {
    margin-bottom: 8px;
    font-size: 15px;
  }

  span {
    color: #6b7280;
    font-size: 12px;
  }
}

.access-radio {
  display: flex;
  gap: 18px;
  align-items: center;
}

.type-config {
  padding-top: 2px;
}

.enum-config,
.struct-table,
.review-card {
  width: 100%;
  padding: 14px;
  border: 1px solid #e5eaf3;
  border-radius: 6px;
  background: #fbfdff;
}

.config-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  color: #6b7280;
  font-size: 13px;
}

.enum-row,
.struct-row {
  display: grid;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.enum-row {
  grid-template-columns: auto 120px auto minmax(160px, 1fr) 48px;
  color: #4b5563;
  white-space: nowrap;
}

.struct-row {
  grid-template-columns: minmax(120px, 1fr) minmax(140px, 1fr) 130px 110px 56px;
}

.strategy-alert {
  margin-bottom: 18px;
}

.inheritance-preview {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
  padding: 14px;
  border: 1px solid #dbeafe;
  border-radius: 6px;
  background: #f4f8ff;
  color: #335072;

  strong {
    margin-right: 8px;
    color: #111827;
  }

  span {
    padding: 5px 10px;
    border-radius: 4px;
    background: #fff;
  }

  i {
    width: 28px;
    height: 1px;
    background: #9db9e8;
  }
}

.review-card {
  h4 {
    margin: 0 0 10px;
    color: #111827;
  }

  p {
    margin: 8px 0;
    color: #4b5563;
    line-height: 1.6;
  }
}

:deep(.el-drawer__header) {
  margin-bottom: 0;
  padding: 18px 32px;
  color: #111827;
  border-bottom: 1px solid #edf2f7;
  font-weight: 700;
}

:deep(.el-drawer__body) {
  padding: 0 0 86px 24px;
}

:deep(.el-drawer__footer) {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 16px 32px;
  border-top: 1px solid #edf2f7;
  background: #fff;
}

.drawer-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.footer-hint {
  min-width: 0;
  color: #6b7280;
  font-size: 13px;
}

@media (max-width: 1100px) {
  :deep(.thing-model-drawer) {
    min-width: 0;
    width: 100% !important;
  }

  .drawer-layout {
    grid-template-columns: 1fr;
  }

  .step-nav {
    display: grid;
    grid-template-columns: repeat(4, minmax(120px, 1fr));
    gap: 8px;
    padding: 12px 20px;
    border-right: 0;
    border-bottom: 1px solid #edf2f7;
    overflow-x: auto;
  }

  .model-form {
    padding: 18px 24px 0;
  }

  .model-type-cards {
    grid-template-columns: 1fr;
  }

  .enum-row,
  .struct-row {
    grid-template-columns: 1fr;
  }

  .inheritance-preview {
    flex-wrap: wrap;
  }
}
</style>
