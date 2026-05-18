import type {
  AuditLog,
  ChangeStatus,
  DataSpec,
  DataType,
  DefaultConfig,
  DeviceInstance,
  HardwareOverride,
  ImportPreviewItem,
  ModelType,
  PageResult,
  ProductCategory,
  PublishCheckResult,
  QueryParams,
  TemplateVersion,
  ThingModelDefinition
} from '@/types/iot';

const STORAGE_KEY = 'iot_thing_model_admin_state_v1';

interface StoreState {
  categories: ProductCategory[];
  models: ThingModelDefinition[];
  versions: TemplateVersion[];
  hardwareOverrides: HardwareOverride[];
  deviceInstances: DeviceInstance[];
  auditLogs: AuditLog[];
}

const now = () => new Date().toLocaleString('zh-CN', { hour12: false });
const createId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const seedState: StoreState = {
  categories: [
    {
      id: 'cat_baby_monitor',
      name: '婴儿看护器',
      code: 'BABY_MONITOR',
      description: '面向哭声检测、环境监测、看护告警的标准类目模板。',
      status: 'enabled',
      templateStatus: 'changed',
      currentVersion: 'v1.2.0',
      modelCount: 8,
      draftChangeCount: 3,
      hardwareCount: 6,
      lastPublishedAt: '2026/05/08 15:30:00',
      updatedAt: '2026/05/12 16:20:00'
    },
    {
      id: 'cat_ipc',
      name: '智能摄像机',
      code: 'SMART_IPC',
      description: '覆盖视频能力、移动侦测、云台控制和告警事件。',
      status: 'enabled',
      templateStatus: 'published',
      currentVersion: 'v2.0.1',
      modelCount: 12,
      draftChangeCount: 0,
      hardwareCount: 14,
      lastPublishedAt: '2026/05/06 10:18:00',
      updatedAt: '2026/05/06 10:18:00'
    },
    {
      id: 'cat_pet',
      name: '宠物设备',
      code: 'PET_DEVICE',
      description: '喂食、饮水、行为识别和异常告警类物模型模板。',
      status: 'draft',
      templateStatus: 'drafting',
      currentVersion: 'v0.1.0',
      modelCount: 5,
      draftChangeCount: 5,
      hardwareCount: 2,
      lastPublishedAt: '-',
      updatedAt: '2026/05/10 09:12:00'
    }
  ],
  models: [
    {
      id: 'tm_cry_switch',
      categoryId: 'cat_baby_monitor',
      name: '哭声检测开关',
      identifier: 'cry_detection_enable',
      modelType: 'property',
      dataType: 'bool',
      accessMode: 'rw',
      dataSpec: { trueText: '开启', falseText: '关闭' },
      defaultConfig: {
        enabled: true,
        value: true,
        source: 'category',
        allowHardwareOverride: true,
        allowDeviceOverride: true,
        emptyValueStrategy: 'use_default',
        deliveryStrategy: 'on_device_activation'
      },
      functionItems: ['哭声检测', '看护告警'],
      required: true,
      visible: true,
      sort: 10,
      compatibilityPolicy: 'locked',
      description: '控制设备是否启用哭声识别能力。',
      source: 'standard',
      status: 'published',
      changeStatus: 'none',
      version: 'v1.2.0',
      updatedAt: '2026/05/08 15:30:00'
    },
    {
      id: 'tm_cry_sensitivity',
      categoryId: 'cat_baby_monitor',
      name: '哭声检测灵敏度',
      identifier: 'cry_detection_sensitivity',
      modelType: 'property',
      dataType: 'enum',
      accessMode: 'rw',
      dataSpec: {
        enumItems: [
          { value: 0, label: '高' },
          { value: 1, label: '中' },
          { value: 2, label: '低' }
        ]
      },
      defaultConfig: {
        enabled: true,
        value: 1,
        source: 'category',
        allowHardwareOverride: true,
        allowDeviceOverride: true,
        emptyValueStrategy: 'use_default',
        deliveryStrategy: 'on_device_activation'
      },
      functionItems: ['哭声检测'],
      required: false,
      visible: true,
      sort: 20,
      compatibilityPolicy: 'allow_extend',
      description: '控制哭声识别置信度阈值。',
      source: 'standard',
      status: 'draft',
      changeStatus: 'modified',
      version: 'v1.3.0-draft',
      updatedAt: '2026/05/12 15:12:00'
    },
    {
      id: 'tm_temperature_alarm',
      categoryId: 'cat_baby_monitor',
      name: '高温告警阈值',
      identifier: 'temperature_alarm_threshold',
      modelType: 'property',
      dataType: 'float',
      accessMode: 'rw',
      dataSpec: { min: 26, max: 40, step: 0.5, unit: 'C' },
      defaultConfig: {
        enabled: true,
        value: 32,
        source: 'category',
        allowHardwareOverride: true,
        allowDeviceOverride: false,
        emptyValueStrategy: 'use_default',
        deliveryStrategy: 'manual_apply'
      },
      functionItems: ['环境监测'],
      required: true,
      visible: true,
      sort: 30,
      compatibilityPolicy: 'allow_extend',
      description: '超过阈值后触发高温告警。',
      source: 'custom',
      status: 'draft',
      changeStatus: 'created',
      version: 'v1.3.0-draft',
      updatedAt: '2026/05/12 15:40:00'
    },
    {
      id: 'tm_set_night_light',
      categoryId: 'cat_baby_monitor',
      name: '设置夜灯',
      identifier: 'set_night_light',
      modelType: 'service',
      dataType: 'struct',
      accessMode: 'w',
      dataSpec: {
        properties: [
          { name: '亮度', identifier: 'brightness', dataType: 'int', min: 0, max: 100, step: 1 },
          {
            name: '颜色',
            identifier: 'color',
            dataType: 'enum',
            enumItems: [
              { value: 'warm', label: '暖光' },
              { value: 'white', label: '白光' }
            ]
          }
        ]
      },
      defaultConfig: {
        enabled: true,
        value: { brightness: 35, color: 'warm' },
        source: 'category',
        allowHardwareOverride: false,
        allowDeviceOverride: false,
        emptyValueStrategy: 'use_default',
        deliveryStrategy: 'display_only'
      },
      functionItems: ['夜灯控制'],
      required: false,
      visible: true,
      sort: 40,
      compatibilityPolicy: 'allow_extend',
      description: '服务入参默认值用于控制台调试和 App 快捷操作。',
      source: 'custom',
      status: 'published',
      changeStatus: 'none',
      version: 'v1.2.0',
      updatedAt: '2026/05/08 15:30:00'
    },
    {
      id: 'tm_cry_alarm_event',
      categoryId: 'cat_baby_monitor',
      name: '哭声告警事件',
      identifier: 'cry_alarm_event',
      modelType: 'event',
      dataType: 'struct',
      accessMode: 'r',
      dataSpec: {
        properties: [
          { name: '置信度', identifier: 'confidence', dataType: 'float', min: 0, max: 1, step: 0.01 },
          { name: '持续时长', identifier: 'duration', dataType: 'int', min: 0, max: 3600, step: 1 }
        ]
      },
      defaultConfig: {
        enabled: true,
        value: { confidence: 0.86, duration: 12 },
        source: 'category',
        allowHardwareOverride: false,
        allowDeviceOverride: false,
        emptyValueStrategy: 'show_unknown',
        deliveryStrategy: 'display_only'
      },
      functionItems: ['看护告警'],
      required: false,
      visible: true,
      sort: 50,
      compatibilityPolicy: 'allow_add',
      description: '事件使用示例值用于文档、调试和模拟上报。',
      source: 'standard',
      status: 'published',
      changeStatus: 'none',
      version: 'v1.2.0',
      updatedAt: '2026/05/08 15:30:00'
    },
    {
      id: 'tm_motion_detection',
      categoryId: 'cat_ipc',
      name: '移动侦测开关',
      identifier: 'motion_detection_enable',
      modelType: 'property',
      dataType: 'bool',
      accessMode: 'rw',
      dataSpec: { trueText: '开启', falseText: '关闭' },
      defaultConfig: {
        enabled: true,
        value: true,
        source: 'category',
        allowHardwareOverride: true,
        allowDeviceOverride: true,
        emptyValueStrategy: 'use_default',
        deliveryStrategy: 'on_device_activation'
      },
      functionItems: ['移动侦测'],
      required: true,
      visible: true,
      sort: 10,
      compatibilityPolicy: 'locked',
      description: '控制摄像机移动侦测能力。',
      source: 'standard',
      status: 'published',
      changeStatus: 'none',
      version: 'v2.0.1',
      updatedAt: '2026/05/06 10:18:00'
    },
    {
      id: 'tm_feed_plan',
      categoryId: 'cat_pet',
      name: '喂食计划',
      identifier: 'feed_plan',
      modelType: 'property',
      dataType: 'array',
      accessMode: 'rw',
      dataSpec: {
        elementType: 'struct',
        minItems: 0,
        maxItems: 8,
        properties: [
          { name: '小时', identifier: 'hour', dataType: 'int', min: 0, max: 23, step: 1 },
          { name: '份数', identifier: 'portion', dataType: 'int', min: 1, max: 10, step: 1 }
        ]
      },
      defaultConfig: {
        enabled: true,
        value: [{ hour: 8, portion: 2 }],
        source: 'category',
        allowHardwareOverride: true,
        allowDeviceOverride: true,
        emptyValueStrategy: 'use_default',
        deliveryStrategy: 'on_device_activation'
      },
      functionItems: ['自动喂食'],
      required: false,
      visible: true,
      sort: 10,
      compatibilityPolicy: 'allow_extend',
      description: '设备激活后的初始喂食计划。',
      source: 'custom',
      status: 'draft',
      changeStatus: 'created',
      version: 'v0.1.0-draft',
      updatedAt: '2026/05/10 09:12:00'
    }
  ],
  versions: [
    {
      id: 'ver_baby_120',
      categoryId: 'cat_baby_monitor',
      version: 'v1.2.0',
      status: 'published',
      releaseNote: '补齐哭声检测和夜灯服务定义。',
      modelCount: 6,
      changeSummary: { created: 2, modified: 3, deprecated: 0, defaultChanged: 2 },
      impact: { hardwareCount: 6, deviceCount: 12840 },
      publishedBy: '产品管理员',
      publishedAt: '2026/05/08 15:30:00'
    },
    {
      id: 'ver_ipc_201',
      categoryId: 'cat_ipc',
      version: 'v2.0.1',
      status: 'published',
      releaseNote: '移动侦测默认值策略调整。',
      modelCount: 12,
      changeSummary: { created: 1, modified: 1, deprecated: 0, defaultChanged: 1 },
      impact: { hardwareCount: 14, deviceCount: 58320 },
      publishedBy: '产品管理员',
      publishedAt: '2026/05/06 10:18:00'
    }
  ],
  hardwareOverrides: [
    {
      id: 'hw_1',
      categoryId: 'cat_baby_monitor',
      hardwareName: 'BM-Lite-01',
      modelIdentifier: 'cry_detection_sensitivity',
      categoryDefault: 1,
      hardwareDefault: 2,
      valid: true,
      reason: '低功耗型号默认降低检测灵敏度。',
      repairStatus: 'normal',
      updatedBy: '产品管理员',
      updatedAt: '2026/05/08 15:30:00'
    },
    {
      id: 'hw_2',
      categoryId: 'cat_baby_monitor',
      hardwareName: 'BM-Pro-02',
      modelIdentifier: 'temperature_alarm_threshold',
      categoryDefault: 32,
      hardwareDefault: 34,
      valid: true,
      reason: '高配温湿度传感器支持更宽温区。',
      repairStatus: 'normal',
      updatedBy: '产品管理员',
      updatedAt: '2026/05/08 15:30:00'
    },
    {
      id: 'hw_3',
      categoryId: 'cat_baby_monitor',
      hardwareName: 'BM-Old-00',
      modelIdentifier: 'temperature_alarm_threshold',
      categoryDefault: 32,
      hardwareDefault: 42,
      valid: false,
      reason: '硬件覆盖值超过当前类目范围，发布前需要修复。',
      repairStatus: 'conflict',
      updatedBy: '系统校验',
      updatedAt: '2026/05/12 16:20:00'
    }
  ],
  deviceInstances: [
    {
      id: 'dev_baby_001',
      categoryId: 'cat_baby_monitor',
      deviceName: '样板间婴儿看护器',
      deviceSn: 'BM202605120001',
      hardwareName: 'BM-Pro-02',
      templateVersion: 'v1.2.0',
      initialized: true,
      initializedAt: '2026/05/09 09:10:00',
      defaultSnapshot: {
        cry_detection_enable: true,
        cry_detection_sensitivity: 1,
        temperature_alarm_threshold: 34
      },
      lastOnlineAt: '2026/05/12 17:46:00'
    },
    {
      id: 'dev_baby_002',
      categoryId: 'cat_baby_monitor',
      deviceName: '低功耗测试机',
      deviceSn: 'BM202605120002',
      hardwareName: 'BM-Lite-01',
      templateVersion: 'v1.2.0',
      initialized: false,
      initializedAt: '-',
      defaultSnapshot: {},
      lastOnlineAt: '2026/05/12 16:58:00'
    },
    {
      id: 'dev_ipc_001',
      categoryId: 'cat_ipc',
      deviceName: '门店 IPC 01',
      deviceSn: 'IPC202605060001',
      hardwareName: 'IPC-Pro-01',
      templateVersion: 'v2.0.1',
      initialized: true,
      initializedAt: '2026/05/06 11:02:00',
      defaultSnapshot: {
        motion_detection_enable: true
      },
      lastOnlineAt: '2026/05/12 17:30:00'
    }
  ],
  auditLogs: [
    {
      id: 'audit_seed_1',
      categoryId: 'cat_baby_monitor',
      action: '发布模板',
      objectType: 'template',
      objectName: '婴儿看护器 v1.2.0',
      detail: '补齐哭声检测和夜灯服务定义。',
      operator: '产品管理员',
      createdAt: '2026/05/08 15:30:00'
    },
    {
      id: 'audit_seed_2',
      categoryId: 'cat_baby_monitor',
      action: '发现覆盖冲突',
      objectType: 'hardware',
      objectName: 'BM-Old-00',
      detail: 'temperature_alarm_threshold 覆盖值超过当前类目范围。',
      operator: '系统校验',
      createdAt: '2026/05/12 16:20:00'
    }
  ]
};

function readState(): StoreState {
  const rawState = localStorage.getItem(STORAGE_KEY);
  if (!rawState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedState));
    return structuredClone(seedState);
  }

  try {
    const normalized = normalizeState(JSON.parse(rawState) as Partial<StoreState>);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedState));
    return structuredClone(seedState);
  }
}

function writeState(state: StoreState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function normalizeState(state: Partial<StoreState>): StoreState {
  return {
    categories: state.categories?.length ? state.categories : structuredClone(seedState.categories),
    models: state.models?.length ? state.models : structuredClone(seedState.models),
    versions: state.versions || [],
    hardwareOverrides: (state.hardwareOverrides?.length ? state.hardwareOverrides : structuredClone(seedState.hardwareOverrides)).map((override) => ({
      ...override,
      repairStatus: override.valid ? override.repairStatus || 'normal' : 'conflict',
      updatedBy: override.updatedBy || (override.valid ? '产品管理员' : '系统校验'),
      updatedAt: override.updatedAt || now()
    })),
    deviceInstances: state.deviceInstances?.length ? state.deviceInstances : structuredClone(seedState.deviceInstances),
    auditLogs: state.auditLogs?.length ? state.auditLogs : structuredClone(seedState.auditLogs)
  };
}

function pushAuditLog(state: StoreState, payload: Omit<AuditLog, 'id' | 'operator' | 'createdAt'> & { operator?: string }) {
  state.auditLogs.unshift({
    id: createId('audit'),
    operator: payload.operator || '当前用户',
    createdAt: now(),
    ...payload
  });
}

function refreshCategoryStats(state: StoreState) {
  state.categories = state.categories.map((category) => {
    const models = state.models.filter((model) => model.categoryId === category.id && model.status !== 'deprecated');
    const draftChangeCount = models.filter((model) => model.changeStatus !== 'none').length;
    return {
      ...category,
      modelCount: models.length,
      draftChangeCount,
      templateStatus: draftChangeCount > 0 ? 'changed' : category.templateStatus === 'none' ? 'none' : 'published',
      updatedAt: now()
    };
  });
}

function comparePage<T>(rows: T[], params: QueryParams): PageResult<T> {
  const start = (params.pageNum - 1) * params.pageSize;
  const end = start + params.pageSize;
  return {
    rows: rows.slice(start, end),
    total: rows.length
  };
}

function nextDraftVersion(currentVersion: string) {
  const match = currentVersion.match(/^v(\d+)\.(\d+)\.(\d+)/);
  if (!match) return 'v1.0.0-draft';
  return `v${match[1]}.${Number(match[2]) + 1}.0-draft`;
}

function nextReleaseVersion(currentVersion: string) {
  const version = currentVersion.replace('-draft', '');
  const match = version.match(/^v(\d+)\.(\d+)\.(\d+)/);
  if (!match) return 'v1.0.0';
  return `v${match[1]}.${Number(match[2]) + 1}.0`;
}

function isNumberType(dataType: DataType) {
  return ['int', 'float', 'double'].includes(dataType);
}

function numberMatchesStep(value: number, min = 0, step = 1) {
  const quotient = (value - min) / step;
  return Math.abs(quotient - Math.round(quotient)) < 0.000001;
}

export function formatModelType(type: ModelType) {
  return ({ property: '属性', service: '服务', event: '事件' } as const)[type];
}

export function formatDataType(type: DataType) {
  return ({ bool: 'Bool', enum: 'Enum', int: 'Int', float: 'Float', double: 'Double', text: 'Text', date: 'Date', array: 'Array', struct: 'Struct' } as const)[type];
}

export function formatDefaultValue(value: unknown, dataSpec?: DataSpec) {
  if (value === undefined || value === null || value === '') return '-';
  if (typeof value === 'boolean') return value ? dataSpec?.trueText || 'true' : dataSpec?.falseText || 'false';
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function validateDefaultValue(model: Pick<ThingModelDefinition, 'dataType' | 'dataSpec' | 'defaultConfig' | 'modelType' | 'accessMode'>): string[] {
  const errors: string[] = [];
  const { dataType, dataSpec, defaultConfig, modelType, accessMode } = model;
  const value = defaultConfig.value;

  if (!defaultConfig.enabled) return errors;

  if (modelType === 'event' && defaultConfig.deliveryStrategy !== 'display_only') {
    errors.push('事件仅允许配置示例值，不允许作为运行默认值下发');
  }

  if (accessMode === 'r' && ['on_device_activation', 'on_factory_reset', 'manual_apply'].includes(defaultConfig.deliveryStrategy)) {
    errors.push('只读属性或事件不允许配置下发策略');
  }

  if (dataType === 'bool' && typeof value !== 'boolean') {
    errors.push('Bool 默认值必须为 true 或 false');
  }

  if (dataType === 'enum') {
    const enumValues = dataSpec.enumItems?.map((item) => String(item.value)) || [];
    if (!enumValues.includes(String(value))) {
      errors.push('Enum 默认值必须命中已有枚举项');
    }
  }

  if (isNumberType(dataType)) {
    const numberValue = Number(value);
    if (Number.isNaN(numberValue)) {
      errors.push('数值默认值必须是合法数字');
    }
    if (dataSpec.min !== undefined && numberValue < dataSpec.min) {
      errors.push(`数值默认值不能小于 ${dataSpec.min}`);
    }
    if (dataSpec.max !== undefined && numberValue > dataSpec.max) {
      errors.push(`数值默认值不能大于 ${dataSpec.max}`);
    }
    if (dataSpec.step !== undefined && !numberMatchesStep(numberValue, dataSpec.min, dataSpec.step)) {
      errors.push(`数值默认值必须符合步长 ${dataSpec.step}`);
    }
  }

  if (dataType === 'text' && dataSpec.maxLength && String(value).length > dataSpec.maxLength) {
    errors.push(`文本默认值不能超过 ${dataSpec.maxLength} 个字符`);
  }

  if (dataType === 'array') {
    if (!Array.isArray(value)) {
      errors.push('Array 默认值必须是数组 JSON');
    } else {
      if (dataSpec.minItems !== undefined && value.length < dataSpec.minItems) {
        errors.push(`Array 默认值元素数量不能小于 ${dataSpec.minItems}`);
      }
      if (dataSpec.maxItems !== undefined && value.length > dataSpec.maxItems) {
        errors.push(`Array 默认值元素数量不能大于 ${dataSpec.maxItems}`);
      }
    }
  }

  if (dataType === 'struct') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      errors.push('Struct 默认值必须是对象 JSON');
    } else {
      const record = value as Record<string, unknown>;
      dataSpec.properties?.forEach((field) => {
        if (!(field.identifier in record)) {
          errors.push(`Struct 默认值缺少字段 ${field.identifier}`);
        }
      });
    }
  }

  return errors;
}

export async function listProductCategories(query: { keyword?: string } = {}) {
  const state = readState();
  const keyword = query.keyword?.trim().toLowerCase();
  return keyword
    ? state.categories.filter((item) => item.name.toLowerCase().includes(keyword) || item.code.toLowerCase().includes(keyword))
    : state.categories;
}

export async function saveProductCategory(payload: Partial<ProductCategory>) {
  const state = readState();
  const exists = state.categories.find((category) => category.id === payload.id);

  if (exists) {
    Object.assign(exists, payload, { updatedAt: now() });
    pushAuditLog(state, {
      categoryId: exists.id,
      action: '编辑产品类目',
      objectType: 'category',
      objectName: exists.name,
      detail: `更新类目基础信息，当前状态为 ${exists.status}。`
    });
  } else {
    const newCategory: ProductCategory = {
      id: createId('cat'),
      name: payload.name || '',
      code: payload.code || '',
      description: payload.description || '',
      status: payload.status || 'draft',
      templateStatus: 'drafting',
      currentVersion: 'v0.1.0',
      modelCount: 0,
      draftChangeCount: 0,
      hardwareCount: 0,
      lastPublishedAt: '-',
      updatedAt: now()
    };
    state.categories.unshift(newCategory);
    pushAuditLog(state, {
      categoryId: newCategory.id,
      action: '新增产品类目',
      objectType: 'category',
      objectName: newCategory.name,
      detail: `创建类目编码 ${newCategory.code}，并生成模板草稿入口。`
    });
  }

  writeState(state);
}

export async function listThingModels(categoryId: string, params: QueryParams) {
  const state = readState();
  const keyword = params.keyword?.trim().toLowerCase();
  const filtered = state.models
    .filter((model) => model.categoryId === categoryId)
    .filter((model) => !keyword || model.name.toLowerCase().includes(keyword) || model.identifier.toLowerCase().includes(keyword))
    .filter((model) => !params.modelType || model.modelType === params.modelType)
    .filter((model) => !params.changeStatus || model.changeStatus === params.changeStatus)
    .sort((left, right) => left.sort - right.sort);

  return comparePage(filtered, params);
}

export async function saveThingModel(payload: ThingModelDefinition) {
  const state = readState();
  const duplicated = state.models.some(
    (model) => model.categoryId === payload.categoryId && model.identifier === payload.identifier && model.id !== payload.id
  );
  if (duplicated) {
    throw new Error('同一模板版本内标识符必须唯一');
  }

  const errors = validateDefaultValue(payload);
  if (errors.length > 0) {
    throw new Error(errors.join('；'));
  }

  const modelIndex = state.models.findIndex((model) => model.id === payload.id);
  const category = state.categories.find((item) => item.id === payload.categoryId);
  const draftVersion = category ? nextDraftVersion(category.currentVersion) : 'v1.0.0-draft';
  let actionName = '新增物模型';
  let objectName = payload.name;

  if (modelIndex >= 0) {
    const previous = state.models[modelIndex];
    actionName = previous.status === 'published' ? '编辑已发布物模型' : '编辑物模型草稿';
    objectName = previous.name;
    state.models[modelIndex] = {
      ...previous,
      ...payload,
      status: previous.status === 'published' ? 'draft' : payload.status,
      changeStatus: previous.changeStatus === 'created' ? 'created' : 'modified',
      version: previous.status === 'published' ? draftVersion : payload.version,
      updatedAt: now()
    };
  } else {
    state.models.unshift({
      ...payload,
      id: createId('tm'),
      status: 'draft',
      changeStatus: 'created',
      version: draftVersion,
      updatedAt: now()
    });
  }

  refreshCategoryStats(state);
  pushAuditLog(state, {
    categoryId: payload.categoryId,
    action: actionName,
    objectType: 'model',
    objectName,
    detail: `${payload.identifier} 已保存为草稿，默认值为 ${formatDefaultValue(payload.defaultConfig.value, payload.dataSpec)}。`
  });
  writeState(state);
}

export async function copyThingModel(modelId: string) {
  const state = readState();
  const source = state.models.find((model) => model.id === modelId);
  if (!source) return;

  state.models.unshift({
    ...source,
    id: createId('tm'),
    name: `${source.name}副本`,
    identifier: `${source.identifier}_copy_${Math.random().toString(36).slice(2, 5)}`,
    status: 'draft',
    changeStatus: 'created',
    updatedAt: now()
  });

  refreshCategoryStats(state);
  pushAuditLog(state, {
    categoryId: source.categoryId,
    action: '复制物模型',
    objectType: 'model',
    objectName: source.name,
    detail: `复制 ${source.identifier} 并生成新的草稿物模型。`
  });
  writeState(state);
}

export async function deprecateThingModel(modelId: string) {
  const state = readState();
  const target = state.models.find((model) => model.id === modelId);
  if (!target) return;

  target.status = 'deprecated';
  target.changeStatus = 'deprecated';
  target.updatedAt = now();
  refreshCategoryStats(state);
  pushAuditLog(state, {
    categoryId: target.categoryId,
    action: '废弃物模型',
    objectType: 'model',
    objectName: target.name,
    detail: `${target.identifier} 已进入草稿变更，发布后不再作为线上能力。`
  });
  writeState(state);
}

export function createEmptyModel(categoryId: string, currentVersion: string): ThingModelDefinition {
  return {
    id: '',
    categoryId,
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
    version: nextDraftVersion(currentVersion),
    updatedAt: now()
  };
}

export async function parseImportModels(categoryId: string, content: string): Promise<ImportPreviewItem[]> {
  const state = readState();
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return [{ identifier: '-', name: '-', action: 'conflict', valid: false, message: 'JSON 格式解析失败' }];
  }

  const rows = Array.isArray(parsed) ? parsed : [parsed];
  return rows.map((row) => {
    const model = row as Partial<ThingModelDefinition>;
    const existing = state.models.find((item) => item.categoryId === categoryId && item.identifier === model.identifier);
    const normalized = normalizeImportedModel(categoryId, model);
    const errors = validateDefaultValue(normalized as ThingModelDefinition);

    if (!model.identifier || !model.name) {
      return {
        identifier: model.identifier || '-',
        name: model.name || '-',
        action: 'conflict',
        valid: false,
        message: '缺少名称或标识符',
        model: normalized
      };
    }

    return {
      identifier: model.identifier,
      name: model.name,
      action: existing ? 'update' : 'create',
      valid: errors.length === 0,
      message: errors.length === 0 ? '校验通过，导入后保存为草稿' : errors.join('；'),
      model: normalized
    };
  });
}

export async function confirmImportModels(categoryId: string, previewRows: ImportPreviewItem[]) {
  const validRows = previewRows.filter((row) => row.valid && row.model);
  for (const row of validRows) {
    await saveThingModel(normalizeImportedModel(categoryId, row.model || {}) as ThingModelDefinition);
  }
  if (validRows.length > 0) {
    const state = readState();
    const category = state.categories.find((item) => item.id === categoryId);
    pushAuditLog(state, {
      categoryId,
      action: 'JSON 导入',
      objectType: 'import',
      objectName: category?.name || '物模型模板',
      detail: `成功导入 ${validRows.length} 个物模型，已保存为草稿。`
    });
    writeState(state);
  }
  return validRows.length;
}

function normalizeImportedModel(categoryId: string, model: Partial<ThingModelDefinition>) {
  const category = readState().categories.find((item) => item.id === categoryId);
  const base = createEmptyModel(categoryId, category?.currentVersion || 'v1.0.0');
  return {
    ...base,
    ...model,
    id: model.id || '',
    categoryId,
    dataSpec: model.dataSpec || base.dataSpec,
    defaultConfig: {
      ...base.defaultConfig,
      ...(model.defaultConfig as DefaultConfig | undefined)
    },
    functionItems: model.functionItems || [],
    changeStatus: (model.changeStatus as ChangeStatus | undefined) || 'created'
  };
}

export async function checkPublish(categoryId: string): Promise<PublishCheckResult> {
  const state = readState();
  const models = state.models.filter((model) => model.categoryId === categoryId);
  const category = state.categories.find((item) => item.id === categoryId);
  const errors: string[] = [];
  const warnings: string[] = [];
  const identifiers = new Set<string>();

  models.forEach((model) => {
    if (identifiers.has(model.identifier)) {
      errors.push(`标识符重复：${model.identifier}`);
    }
    identifiers.add(model.identifier);
    validateDefaultValue(model).forEach((error) => errors.push(`${model.name}：${error}`));
    if (model.changeStatus === 'deprecated') {
      warnings.push(`${model.name} 已废弃，请确认下游设备无强依赖`);
    }
    if (model.compatibilityPolicy === 'locked' && model.changeStatus === 'modified') {
      warnings.push(`${model.name} 为禁止修改策略，本次发布需要负责人确认`);
    }
  });

  state.hardwareOverrides
    .filter((override) => override.categoryId === categoryId && !override.valid)
    .forEach((override) => errors.push(`${override.hardwareName} 的 ${override.modelIdentifier} 覆盖值非法：${override.reason}`));

  const changed = models.filter((model) => model.changeStatus !== 'none');
  const summary = {
    created: changed.filter((model) => model.changeStatus === 'created').length,
    modified: changed.filter((model) => model.changeStatus === 'modified').length,
    deprecated: changed.filter((model) => model.changeStatus === 'deprecated').length,
    defaultChanged: changed.filter((model) => model.defaultConfig.enabled).length
  };

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    summary,
    impact: {
      hardwareCount: category?.hardwareCount || 0,
      deviceCount: (category?.hardwareCount || 1) * 2140
    }
  };
}

export async function publishTemplate(categoryId: string, releaseNote: string) {
  const state = readState();
  const checkResult = await checkPublish(categoryId);
  if (!checkResult.passed) {
    throw new Error(checkResult.errors.join('；'));
  }

  const category = state.categories.find((item) => item.id === categoryId);
  if (!category) return;

  const releaseVersion = nextReleaseVersion(category.currentVersion);
  state.models
    .filter((model) => model.categoryId === categoryId && model.status !== 'deprecated')
    .forEach((model) => {
      model.status = 'published';
      model.changeStatus = 'none';
      model.version = releaseVersion;
      model.updatedAt = now();
    });

  category.currentVersion = releaseVersion;
  category.templateStatus = 'published';
  category.draftChangeCount = 0;
  category.lastPublishedAt = now();
  category.updatedAt = now();

  state.versions.unshift({
    id: createId('ver'),
    categoryId,
    version: releaseVersion,
    status: 'published',
    releaseNote,
    modelCount: state.models.filter((model) => model.categoryId === categoryId && model.status !== 'deprecated').length,
    changeSummary: checkResult.summary,
    impact: checkResult.impact,
    publishedBy: '当前用户',
    publishedAt: now()
  });

  pushAuditLog(state, {
    categoryId,
    action: '发布模板',
    objectType: 'template',
    objectName: `${category.name} ${releaseVersion}`,
    detail: `${releaseNote}；影响 ${checkResult.impact.hardwareCount} 个硬件型号、${checkResult.impact.deviceCount} 台设备。`
  });
  writeState(state);
}

function normalizeValueByDataType(model: ThingModelDefinition, value: unknown) {
  if (value === undefined || value === null || value === '') return undefined;
  if (model.dataType === 'bool') {
    if (typeof value === 'boolean') return value;
    return ['true', '1', '开启', '是'].includes(String(value));
  }
  if (['int', 'float', 'double', 'enum'].includes(model.dataType)) {
    const numberValue = Number(value);
    return Number.isNaN(numberValue) ? value : numberValue;
  }
  if (['array', 'struct'].includes(model.dataType) && typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

function validateHardwareDefault(model: ThingModelDefinition, value: unknown) {
  if (value === undefined) {
    return { valid: true, reason: '已清空覆盖值，实际使用类目默认值。' };
  }
  const errors = validateDefaultValue({
    ...model,
    defaultConfig: {
      ...model.defaultConfig,
      value
    }
  });
  return {
    valid: errors.length === 0,
    reason: errors.length === 0 ? '覆盖值合法，可在发布后继承到该硬件型号。' : errors.join('；')
  };
}

function buildDefaultSnapshot(state: StoreState, device: DeviceInstance) {
  const snapshot: Record<string, unknown> = {};
  const models = state.models.filter((model) => model.categoryId === device.categoryId && model.status !== 'deprecated' && model.defaultConfig.enabled);

  models.forEach((model) => {
    const hardwareOverride = state.hardwareOverrides.find(
      (override) =>
        override.categoryId === device.categoryId &&
        override.hardwareName === device.hardwareName &&
        override.modelIdentifier === model.identifier &&
        override.valid &&
        model.defaultConfig.allowHardwareOverride &&
        override.hardwareDefault !== undefined
    );
    snapshot[model.identifier] = hardwareOverride ? hardwareOverride.hardwareDefault : model.defaultConfig.value;
  });

  return snapshot;
}

export async function addAuditLog(payload: Omit<AuditLog, 'id' | 'operator' | 'createdAt'> & { operator?: string }) {
  const state = readState();
  pushAuditLog(state, payload);
  writeState(state);
}

export async function listTemplateVersions(categoryId: string) {
  return readState().versions.filter((item) => item.categoryId === categoryId);
}

export async function rollbackTemplateVersion(versionId: string) {
  const state = readState();
  const target = state.versions.find((item) => item.id === versionId);
  if (!target) return;

  const category = state.categories.find((item) => item.id === target.categoryId);
  if (!category) return;

  category.currentVersion = target.version;
  category.templateStatus = 'changed';
  category.updatedAt = now();
  state.versions.unshift({
    ...target,
    id: createId('ver'),
    status: 'rolled_back',
    releaseNote: `模拟回滚到 ${target.version}`,
    publishedBy: '当前用户',
    publishedAt: now()
  });
  pushAuditLog(state, {
    categoryId: category.id,
    action: '模拟回滚',
    objectType: 'template',
    objectName: `${category.name} ${target.version}`,
    detail: `已将当前模板版本标记回 ${target.version}，用于原型流程演示。`
  });
  writeState(state);
}

export async function listHardwareOverrides(categoryId: string) {
  const state = readState();
  return state.hardwareOverrides
    .filter((item) => item.categoryId === categoryId)
    .map((override) => {
      const model = state.models.find((item) => item.categoryId === categoryId && item.identifier === override.modelIdentifier);
      return {
        ...override,
        categoryDefault: model?.defaultConfig.value ?? override.categoryDefault
      };
    });
}

export async function repairHardwareOverride(overrideId: string, payload: { mode: 'update' | 'clear' | 'reset'; value?: unknown }) {
  const state = readState();
  const override = state.hardwareOverrides.find((item) => item.id === overrideId);
  if (!override) return;

  const model = state.models.find((item) => item.categoryId === override.categoryId && item.identifier === override.modelIdentifier);
  if (!model) {
    override.valid = false;
    override.repairStatus = 'conflict';
    override.reason = '未找到关联物模型定义。';
    writeState(state);
    return;
  }

  const categoryDefault = model.defaultConfig.value;
  let nextValue = normalizeValueByDataType(model, payload.value);
  if (payload.mode === 'clear') nextValue = undefined;
  if (payload.mode === 'reset') nextValue = categoryDefault;

  const result = validateHardwareDefault(model, nextValue);
  override.categoryDefault = categoryDefault;
  override.hardwareDefault = nextValue;
  override.valid = result.valid;
  override.reason = result.reason;
  override.repairStatus = result.valid ? 'fixed' : 'conflict';
  override.updatedBy = '当前用户';
  override.updatedAt = now();

  pushAuditLog(state, {
    categoryId: override.categoryId,
    action: result.valid ? '修复硬件覆盖' : '更新硬件覆盖',
    objectType: 'hardware',
    objectName: override.hardwareName,
    detail: `${override.modelIdentifier} 覆盖值调整为 ${formatDefaultValue(nextValue, model.dataSpec)}；${result.reason}`
  });
  writeState(state);
}

export async function listDeviceInstances(categoryId: string) {
  return readState().deviceInstances.filter((item) => item.categoryId === categoryId);
}

export async function initializeDeviceDefaults(categoryId: string, deviceId?: string) {
  const state = readState();
  const category = state.categories.find((item) => item.id === categoryId);
  const devices = state.deviceInstances.filter((item) => item.categoryId === categoryId && (!deviceId || item.id === deviceId));

  devices.forEach((device) => {
    device.templateVersion = category?.currentVersion || device.templateVersion;
    device.defaultSnapshot = buildDefaultSnapshot(state, device);
    device.initialized = true;
    device.initializedAt = now();
  });

  pushAuditLog(state, {
    categoryId,
    action: deviceId ? '初始化设备默认值' : '批量初始化默认值',
    objectType: 'device',
    objectName: deviceId ? devices[0]?.deviceName || '设备实例' : category?.name || '设备实例',
    detail: `已写入 ${devices.length} 台设备的最终默认值快照。`
  });
  writeState(state);
  return devices.length;
}

export async function listAuditLogs(categoryId?: string) {
  const logs = readState().auditLogs;
  return categoryId ? logs.filter((item) => item.categoryId === categoryId || !item.categoryId) : logs;
}

export async function calculateEffectiveDefault(categoryId: string, modelIdentifier: string, deviceDefault?: unknown) {
  const state = readState();
  const model = state.models.find((item) => item.categoryId === categoryId && item.identifier === modelIdentifier);
  const hardwareOverride = state.hardwareOverrides.find((item) => item.categoryId === categoryId && item.modelIdentifier === modelIdentifier && item.valid);

  if (!model) return { value: undefined, source: 'system' as const, path: '系统默认值' };
  if (deviceDefault !== undefined && model.defaultConfig.allowDeviceOverride) {
    return { value: deviceDefault, source: 'device' as const, path: '设备默认值 > 硬件默认值 > 类目默认值 > 系统默认值' };
  }
  if (hardwareOverride && model.defaultConfig.allowHardwareOverride) {
    return { value: hardwareOverride.hardwareDefault, source: 'hardware' as const, path: '硬件默认值 > 类目默认值 > 系统默认值' };
  }
  if (model.defaultConfig.enabled) {
    return { value: model.defaultConfig.value, source: 'category' as const, path: '类目默认值 > 系统默认值' };
  }
  return { value: undefined, source: 'system' as const, path: '系统默认值' };
}
