export type CategoryStatus = 'draft' | 'enabled' | 'disabled';
export type TemplateStatus = 'none' | 'drafting' | 'published' | 'changed';
export type ModelType = 'property' | 'service' | 'event';
export type DataType = 'bool' | 'enum' | 'int' | 'float' | 'double' | 'text' | 'date' | 'array' | 'struct';
export type AccessMode = 'r' | 'rw' | 'w';
export type DefaultSource = 'system' | 'category' | 'hardware' | 'device';
export type EmptyValueStrategy = 'use_default' | 'show_empty' | 'show_unknown';
export type DeliveryStrategy = 'display_only' | 'on_device_activation' | 'on_factory_reset' | 'manual_apply';
export type PublishStatus = 'draft' | 'pending' | 'published' | 'deprecated' | 'rolled_back';
export type ChangeStatus = 'none' | 'created' | 'modified' | 'deprecated';
export type CompatibilityPolicy = 'allow_add' | 'allow_deprecate' | 'locked' | 'allow_extend';

export interface EnumItem {
  value: string | number;
  label: string;
}

export interface StructField {
  name: string;
  identifier: string;
  dataType: Exclude<DataType, 'array' | 'struct'>;
  min?: number;
  max?: number;
  step?: number;
  maxLength?: number;
  enumItems?: EnumItem[];
}

export interface DataSpec {
  trueText?: string;
  falseText?: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  maxLength?: number;
  enumItems?: EnumItem[];
  elementType?: Exclude<DataType, 'array'>;
  minItems?: number;
  maxItems?: number;
  properties?: StructField[];
}

export interface DefaultConfig {
  enabled: boolean;
  value: unknown;
  source: DefaultSource;
  allowHardwareOverride: boolean;
  allowDeviceOverride: boolean;
  emptyValueStrategy: EmptyValueStrategy;
  deliveryStrategy: DeliveryStrategy;
}

export interface ThingModelDefinition {
  id: string;
  categoryId: string;
  name: string;
  identifier: string;
  modelType: ModelType;
  dataType: DataType;
  accessMode: AccessMode;
  dataSpec: DataSpec;
  defaultConfig: DefaultConfig;
  functionItems: string[];
  required: boolean;
  visible: boolean;
  sort: number;
  compatibilityPolicy: CompatibilityPolicy;
  description: string;
  source: 'standard' | 'custom' | 'hardware';
  status: PublishStatus;
  changeStatus: ChangeStatus;
  version: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  code: string;
  description: string;
  status: CategoryStatus;
  templateStatus: TemplateStatus;
  currentVersion: string;
  modelCount: number;
  draftChangeCount: number;
  hardwareCount: number;
  lastPublishedAt: string;
  updatedAt: string;
}

export interface TemplateVersion {
  id: string;
  categoryId: string;
  version: string;
  status: PublishStatus;
  releaseNote: string;
  modelCount: number;
  changeSummary: {
    created: number;
    modified: number;
    deprecated: number;
    defaultChanged: number;
  };
  impact: {
    hardwareCount: number;
    deviceCount: number;
  };
  publishedBy: string;
  publishedAt: string;
}

export interface HardwareOverride {
  id: string;
  categoryId: string;
  hardwareName: string;
  modelIdentifier: string;
  categoryDefault: unknown;
  hardwareDefault: unknown;
  valid: boolean;
  reason: string;
  repairStatus: 'normal' | 'conflict' | 'fixed';
  updatedBy: string;
  updatedAt: string;
}

export interface DeviceInstance {
  id: string;
  categoryId: string;
  deviceName: string;
  deviceSn: string;
  hardwareName: string;
  templateVersion: string;
  initialized: boolean;
  initializedAt: string;
  defaultSnapshot: Record<string, unknown>;
  lastOnlineAt: string;
}

export interface AuditLog {
  id: string;
  categoryId?: string;
  action: string;
  objectType: 'category' | 'model' | 'template' | 'hardware' | 'device' | 'import' | 'export';
  objectName: string;
  detail: string;
  operator: string;
  createdAt: string;
}

export interface WorkflowStep {
  key: string;
  title: string;
  description: string;
  status: 'todo' | 'doing' | 'done' | 'risk';
  count?: number;
  actionText: string;
}

export interface QueryParams {
  pageNum: number;
  pageSize: number;
  keyword?: string;
  modelType?: ModelType | '';
  changeStatus?: ChangeStatus | '';
}

export interface PageResult<T> {
  rows: T[];
  total: number;
}

export interface ImportPreviewItem {
  identifier: string;
  name: string;
  action: 'create' | 'update' | 'conflict';
  valid: boolean;
  message: string;
  model?: Partial<ThingModelDefinition>;
}

export interface PublishCheckResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    created: number;
    modified: number;
    deprecated: number;
    defaultChanged: number;
  };
  impact: {
    hardwareCount: number;
    deviceCount: number;
  };
}
