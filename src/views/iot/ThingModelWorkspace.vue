<template>
  <el-container class="admin-shell" :class="{ 'detail-mode': detailMode }">
    <el-aside width="188px" class="sidebar">
      <div class="brand">VIOT管理平台</div>
      <el-menu default-active="thing-model" class="nav-menu" @select="handleModuleSelect">
        <el-sub-menu index="model-root">
          <template #title>
            <el-icon><Cpu /></el-icon>
            <span>机型管理</span>
          </template>
        </el-sub-menu>
        <el-sub-menu index="hardware-root">
          <template #title>
            <el-icon><Connection /></el-icon>
            <span>硬件管理</span>
          </template>
        </el-sub-menu>
        <el-sub-menu index="function-root">
          <template #title>
            <el-icon><Grid /></el-icon>
            <span>功能管理</span>
          </template>
          <el-menu-item index="thing-model">功能类目</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="topbar" height="70px">
        <div class="page-title">
          <el-button v-if="detailMode" text :icon="ArrowLeft" @click="handleBackToList">功能详情</el-button>
          <template v-else>
            <el-icon><Expand /></el-icon>
            <span>产品线</span>
          </template>
        </div>
        <div v-if="!detailMode" class="topbar__actions">
          <el-input v-model="queryParams.keyword" class="top-search" placeholder="请输入功能名称/功能项名称" clearable @keyup.enter="handleQuery" />
          <el-button plain :icon="Document" @click="docsOpen = true">需求说明</el-button>
          <el-button type="primary" @click="handleQuery">查询</el-button>
        </div>
        <div v-else class="topbar__actions">
          <el-button plain :icon="Document" @click="docsOpen = true">需求说明</el-button>
          <el-tooltip :disabled="canPublish" content="当前没有草稿变更，暂不可发布" placement="top">
            <span>
              <el-button type="primary" :icon="UploadFilled" :disabled="!canPublish" @click="handleOpenPublish">立即发布</el-button>
            </span>
          </el-tooltip>
        </div>
      </el-header>

      <el-main v-if="!detailMode" class="category-page">
        <aside class="category-panel">
          <div class="category-title">
            <strong>产品类</strong>
            <el-button text type="primary" :icon="CirclePlus" @click="handleAddCategory" />
          </div>
          <el-input v-model="categoryKeyword" placeholder="请输入产品类名称" clearable :prefix-icon="Search" @keyup.enter="loadCategories" />
          <div class="category-list">
            <button
              v-for="item in categories"
              :key="item.id"
              class="category-item"
              :class="{ active: item.id === selectedCategoryId }"
              type="button"
              @click="selectCategory(item.id)"
            >
              {{ item.name }}
            </button>
          </div>
          <el-empty v-if="categories.length === 0" description="暂无产品类">
            <el-button type="primary" :icon="Plus" @click="handleAddCategory">新增产品类</el-button>
          </el-empty>
        </aside>

        <section class="content">
          <template v-if="selectedCategory">
            <div class="category-hero">
              <div>
                <h2>{{ selectedCategory.name }}</h2>
                <p><span>创建时间：</span>{{ selectedCategory.updatedAt }}</p>
                <p><span>备注：</span>{{ selectedCategory.description }}</p>
              </div>
              <el-button :icon="EditPen" @click="handleEditCategory">编辑</el-button>
            </div>

            <div class="process-strip">
              <div>
                <strong>流程指引</strong>
                <span>{{ nextActionText }}</span>
              </div>
              <div class="process-actions">
                <el-button plain @click="handleSwitchModule('hardware')">硬件覆盖</el-button>
                <el-button plain @click="handleSwitchModule('devices')">设备初始化</el-button>
                <el-button plain @click="handleSwitchModule('audit')">审计日志</el-button>
                <el-button type="primary" plain @click="handleWorkflowAction(nextActionKey)">{{ nextActionButton }}</el-button>
              </div>
            </div>

            <template v-if="activeModule === 'thing-model'">
              <div class="feature-head">
                <strong>功能项列表（{{ functionCards.length }}）</strong>
                <el-button type="primary" :icon="Plus" @click="handleAddFunction">新增功能</el-button>
              </div>
              <div class="feature-grid">
                <button v-for="card in functionCards" :key="card.id" class="feature-card" type="button" @click="openFeatureDetail(card)">
                  <div class="feature-image" :class="{ ai: card.ai }">
                    <template v-if="card.ai">
                      <span class="ai-mark">AI</span>
                    </template>
                    <template v-else>
                      <span class="mock-logo">维拍物联<br /><em>veepai.com</em></span>
                    </template>
                    <span class="corner-tag">{{ card.statusText }}</span>
                  </div>
                  <strong>{{ card.title }}<el-icon><ArrowRight /></el-icon></strong>
                  <p>{{ card.subtitle }}</p>
                </button>
              </div>
              <el-empty v-if="functionCards.length === 0" description="暂无功能项">
                <el-button type="primary" :icon="Plus" @click="handleAddFunction">新增功能</el-button>
              </el-empty>
              <div class="page-foot">共 {{ functionCards.length }} 条　24条/页　1 页</div>
            </template>

            <template v-else-if="activeModule === 'hardware'">
              <div class="table-panel">
                <PanelHead title="硬件默认值覆盖" desc="冲突项会阻断模板发布，需要修复、清空或恢复类目默认值。">
                  <el-button type="primary" plain :disabled="conflictOverrides.length === 0" @click="openRepairOverride(conflictOverrides[0])">修复首个冲突</el-button>
                </PanelHead>
                <HardwareOverrideTable :rows="hardwareOverrides" />
              </div>
            </template>

            <template v-else-if="activeModule === 'devices'">
              <div class="table-panel">
                <PanelHead title="设备初始化效果" desc="模拟设备从类目模板、硬件覆盖中计算最终默认值并写入设备快照。">
                  <el-button type="primary" :icon="Upload" @click="handleInitializeDevices()">批量初始化</el-button>
                </PanelHead>
                <DeviceTable />
              </div>
            </template>

            <template v-else>
              <div class="table-panel">
                <PanelHead title="审计日志" desc="记录类目、物模型、硬件覆盖、发布和设备初始化等关键操作。" />
                <AuditTable />
              </div>
            </template>
          </template>

          <el-empty v-else description="请先创建产品类">
            <el-button type="primary" :icon="Plus" @click="handleAddCategory">新增产品类</el-button>
          </el-empty>
        </section>
      </el-main>

      <el-main v-else class="detail-page">
        <div class="detail-hero">
          <div class="detail-icon" :class="{ ai: selectedFeature?.ai }">{{ selectedFeature?.ai ? 'AI' : 'VP' }}</div>
          <div>
            <h2>
              {{ selectedFeature?.title || selectedCategory?.name }}
              <el-tag type="warning" effect="plain">待发布</el-tag>
            </h2>
            <p>关联类目：{{ selectedCategory?.name }}　　　　创建时间：{{ selectedCategory?.updatedAt }}</p>
            <p>说明：{{ selectedFeature?.subtitle || selectedCategory?.description }}</p>
          </div>
          <div class="detail-hero__actions">
            <el-button data-iot-action="edit-function" native-type="button" :icon="EditPen" @click="handleEditFunction">编辑</el-button>
            <el-button data-iot-action="delete-function" native-type="button" :icon="Delete" @click="handleDeleteFunction">删除</el-button>
          </div>
        </div>

        <el-tabs v-model="activeTab" class="detail-tabs">
          <el-tab-pane label="物模型信息" name="models">
            <el-alert class="tsl-alert" type="info" show-icon :closable="false">
              <template #title>物模型是云端对设备功能的抽象描述，覆盖了设备的属性、服务和事件。当前已增强默认值配置与发布校验。</template>
            </el-alert>
            <div class="detail-toolbar">
              <strong>物模型信息</strong>
              <div>
                <el-button data-iot-action="export-json" native-type="button" :icon="Download" @click="handleExport">JSON导出</el-button>
                <el-button data-iot-action="import-json" native-type="button" :icon="UploadFilled" @click="handleOpenImport">文本导入</el-button>
                <el-button data-iot-action="add-model" native-type="button" type="primary" :icon="Plus" @click="handleAddModel">添加物模型</el-button>
              </div>
            </div>
            <ModelTable />
          </el-tab-pane>
          <el-tab-pane label="关联硬件" name="hardware">
            <div class="table-panel">
              <HardwareOverrideTable :rows="hardwareOverrides" />
            </div>
          </el-tab-pane>
          <el-tab-pane label="发布记录" name="versions">
            <VersionTimeline :rows="versions" />
          </el-tab-pane>
        </el-tabs>
      </el-main>
    </el-container>
  </el-container>

  <CategoryDialog v-if="categoryDialogOpen" v-model="categoryDialogOpen" :category="editingCategory" @success="handleCategorySaved" />
  <FunctionDialog
    v-if="functionDialogOpen"
    v-model="functionDialogOpen"
    :category-options="categories.map((item) => item.name)"
    :current-category="selectedCategory?.name"
    :initial-name="editingFunctionName"
    :initial-remark="editingFunctionRemark"
    @success="handleFunctionSaved"
  />
  <ThingModelDrawer
    :key="modelDrawerKey"
    v-model="modelDrawerOpen"
    :model="editingModel"
    :function-options="functionOptions"
    @success="handleModelSaved"
  />
  <JsonImportDialog v-if="selectedCategory && importOpen" v-model="importOpen" :category-id="selectedCategory.id" @success="handleModelSaved" />
  <PublishDialog v-if="selectedCategory && publishOpen" v-model="publishOpen" :category-id="selectedCategory.id" @success="handlePublished" @navigate="handlePublishNavigate" />
  <HardwareOverrideDialog v-if="hardwareDialogOpen" v-model="hardwareDialogOpen" :override="editingOverride" @success="handleHardwareSaved" />
  <RequirementDocsDialog v-if="docsOpen" v-model="docsOpen" />
  <el-dialog v-if="exportDialogOpen" v-model="exportDialogOpen" title="JSON 导出结果" width="720px" append-to-body destroy-on-close :close-on-click-modal="false">
    <el-input v-model="exportContent" type="textarea" :rows="18" readonly />
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="exportDialogOpen = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, nextTick, onBeforeUnmount, onMounted, reactive, ref, toRaw, watch } from 'vue';
import {
  ArrowLeft,
  ArrowRight,
  CirclePlus,
  Connection,
  CopyDocument,
  Cpu,
  Delete,
  Document,
  Download,
  Edit,
  EditPen,
  Expand,
  Grid,
  Monitor,
  Plus,
  Refresh,
  Search,
  Tickets,
  Upload,
  UploadFilled
} from '@element-plus/icons-vue';
import {
  ElButton,
  ElDescriptions,
  ElDescriptionsItem,
  ElEmpty,
  ElMessage,
  ElMessageBox,
  ElSpace,
  ElTable,
  ElTableColumn,
  ElTag,
  ElTimeline,
  ElTimelineItem
} from 'element-plus';
import CategoryDialog from '@/components/CategoryDialog.vue';
import FunctionDialog from '@/components/FunctionDialog.vue';
import HardwareOverrideDialog from '@/components/HardwareOverrideDialog.vue';
import JsonImportDialog from '@/components/JsonImportDialog.vue';
import PublishDialog from '@/components/PublishDialog.vue';
import RequirementDocsDialog from '@/components/RequirementDocsDialog.vue';
import ThingModelDrawer from '@/components/ThingModelDrawer.vue';
import type {
  AuditLog,
  ChangeStatus,
  DeviceInstance,
  HardwareOverride,
  ProductCategory,
  PublishStatus,
  QueryParams,
  TemplateStatus,
  TemplateVersion,
  ThingModelDefinition,
  WorkflowStep
} from '@/types/iot';
import {
  addAuditLog,
  copyThingModel,
  createEmptyModel,
  deprecateThingModel,
  formatDataType,
  formatDefaultValue,
  formatModelType,
  initializeDeviceDefaults,
  listAuditLogs,
  listDeviceInstances,
  listHardwareOverrides,
  listProductCategories,
  listTemplateVersions,
  listThingModels,
  rollbackTemplateVersion
} from '@/api/iot/thingModel';

type ModuleKey = 'thing-model' | 'hardware' | 'devices' | 'audit';

interface FunctionCard {
  id: string;
  title: string;
  subtitle: string;
  statusText: string;
  ai: boolean;
}

const loading = ref(false);
const categories = ref<ProductCategory[]>([]);
const selectedCategoryId = ref('');
const categoryKeyword = ref('');
const modelList = ref<ThingModelDefinition[]>([]);
const allModels = ref<ThingModelDefinition[]>([]);
const total = ref(0);
const activeTab = ref('models');
const activeModule = ref<ModuleKey>('thing-model');
const detailMode = ref(false);
const categoryDialogOpen = ref(false);
const functionDialogOpen = ref(false);
const modelDrawerOpen = ref(false);
const modelDrawerKey = ref(0);
const importOpen = ref(false);
const publishOpen = ref(false);
const hardwareDialogOpen = ref(false);
const docsOpen = ref(false);
const exportDialogOpen = ref(false);
const exportContent = ref('');
const editingCategory = ref<ProductCategory | null>(null);
const editingModel = ref<ThingModelDefinition | null>(null);
const editingOverride = ref<HardwareOverride | null>(null);
const selectedFeature = ref<FunctionCard | null>(null);
const customFunctionNames = ref<string[]>([]);
const hiddenFunctionNames = ref<string[]>([]);
const renamedFunctionMap = ref<Record<string, string>>({});
const editingFunctionName = ref('');
const editingFunctionRemark = ref('');
const versions = ref<TemplateVersion[]>([]);
const hardwareOverrides = ref<HardwareOverride[]>([]);
const deviceInstances = ref<DeviceInstance[]>([]);
const auditLogs = ref<AuditLog[]>([]);
let lastDocumentActionAt = 0;

const queryParams = reactive<QueryParams>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  modelType: '',
  changeStatus: ''
});

const changeStatusMap: Record<ChangeStatus, string> = {
  none: '无变更',
  created: '新增',
  modified: '已修改',
  deprecated: '已废弃'
};
const publishStatusMap: Record<PublishStatus, string> = {
  draft: '草稿',
  pending: '待发布',
  published: '已发布',
  deprecated: '已废弃',
  rolled_back: '已回滚'
};
const accessModeMap = {
  r: '只读',
  rw: '读写',
  w: '只写'
};
const objectTypeMap = {
  category: '产品类目',
  model: '物模型',
  template: '模板版本',
  hardware: '硬件覆盖',
  device: '设备实例',
  import: 'JSON 导入',
  export: 'JSON 导出'
};

const selectedCategory = computed(() => categories.value.find((item) => item.id === selectedCategoryId.value));
const changedModels = computed(() => allModels.value.filter((item) => item.changeStatus !== 'none'));
const conflictOverrides = computed(() => hardwareOverrides.value.filter((item) => !item.valid));
const canPublish = computed(() => Boolean(selectedCategory.value && selectedCategory.value.draftChangeCount > 0));
const uninitializedDevices = computed(() => deviceInstances.value.filter((item) => !item.initialized));
const defaultEnabledCount = computed(() => allModels.value.filter((item) => item.defaultConfig.enabled).length);
const functionOptions = computed(() =>
  Array.from(
    new Set([...customFunctionNames.value, ...allModels.value.flatMap((item) => item.functionItems), '设备状态', '环境监测', '看护告警', '夜灯控制'])
  ).filter((name) => !hiddenFunctionNames.value.includes(name))
);
const functionCards = computed<FunctionCard[]>(() => {
  const names = Array.from(new Set(allModels.value.flatMap((item) => item.functionItems)));
  const defaultNames = ['隐私保护2', 'wifi设置2', '设备基础管理2', '云台控制2', '双向对讲2', '设备运维2', '画面管理2', '生活瞬间2', '工作模式2', 'SD卡2', '录像抓拍2', 'AI检测算法2', 'AI看护联动2'];
  const baseNames = Array.from(new Set([...customFunctionNames.value, ...(names.length ? names : defaultNames)]))
    .map((name) => renamedFunctionMap.value[name] || name)
    .filter((name) => !hiddenFunctionNames.value.includes(name));
  return baseNames.map((name, index) => ({
    id: `${name}_${index}`,
    title: name,
    subtitle: index === 11 ? 'AI检测算法汇总' : index === 12 ? '啼哭安抚2' : name,
    statusText: changedModels.value.length > 0 ? '未发布' : '待发布',
    ai: name.includes('AI')
  }));
});
const nextActionKey = computed(() => {
  if (allModels.value.length === 0) return 'model';
  if (defaultEnabledCount.value === 0) return 'default';
  if (changedModels.value.length > 0) return 'changes';
  if (conflictOverrides.value.length > 0) return 'hardware';
  if (uninitializedDevices.value.length > 0) return 'device';
  return 'audit';
});
const nextActionText = computed(() => {
  if (allModels.value.length === 0) return '当前产品类还没有物模型，建议先新增功能或导入物模型。';
  if (defaultEnabledCount.value === 0) return '当前物模型未启用默认值，请先补齐默认值策略。';
  if (changedModels.value.length > 0) return `当前有 ${changedModels.value.length} 条草稿变更，可进入功能详情核对并发布。`;
  if (conflictOverrides.value.length > 0) return `当前有 ${conflictOverrides.value.length} 个硬件覆盖冲突，需要修复后发布。`;
  return '流程已闭环，可查看设备初始化效果或审计日志。';
});
const nextActionButton = computed(() => {
  const map: Record<string, string> = {
    model: '新增功能',
    default: '查看物模型',
    changes: '进入详情',
    hardware: '修复覆盖',
    device: '查看设备',
    audit: '查看日志'
  };
  return map[nextActionKey.value] || '查看';
});
const workflowSteps = computed<WorkflowStep[]>(() => []);

const PanelHead = defineComponent({
  name: 'PanelHead',
  props: {
    title: { type: String, required: true },
    desc: { type: String, required: true }
  },
  setup(props, { slots }) {
    return () =>
      h('div', { class: 'panel-head' }, [
        h('div', [h('strong', props.title), h('span', props.desc)]),
        slots.default?.()
      ]);
  }
});

const ModelTable = defineComponent({
  name: 'ModelTable',
  setup() {
    return () =>
      h('div', { class: 'table-panel detail-table' }, [
        modelList.value.length
          ? h(ElTable, { data: modelList.value, height: 560, border: false, stripe: true, loading: loading.value }, () => [
              h(ElTableColumn, { label: '物模型名称', prop: 'name', minWidth: 180 }),
              h(ElTableColumn, { label: '标识符', prop: 'identifier', minWidth: 220 }),
              h(ElTableColumn, {
                label: '物模型类型',
                width: 130
              }, {
                default: ({ row }: { row: ThingModelDefinition }) => h(ElTag, { effect: 'plain', type: 'primary' }, () => formatModelType(row.modelType))
              }),
              h(ElTableColumn, {
                label: '数据类型',
                minWidth: 150
              }, {
                default: ({ row }: { row: ThingModelDefinition }) => formatDataType(row.dataType)
              }),
              h(ElTableColumn, {
                label: '数据定义',
                minWidth: 180
              }, {
                default: ({ row }: { row: ThingModelDefinition }) => formatDataDefinition(row)
              }),
              h(ElTableColumn, {
                label: '访问权限',
                width: 120
              }, {
                default: ({ row }: { row: ThingModelDefinition }) => accessModeMap[row.accessMode]
              }),
              h(ElTableColumn, {
                label: '备注',
                minWidth: 260,
                showOverflowTooltip: true
              }, {
                default: ({ row }: { row: ThingModelDefinition }) => row.description || '-'
              }),
              h(ElTableColumn, {
                label: '操作',
                width: 210,
                fixed: 'right'
              }, {
                default: ({ row }: { row: ThingModelDefinition }) =>
                  h(ElSpace, null, () => [
                    h(ElButton, {
                      link: true,
                      type: 'primary',
                      nativeType: 'button',
                      'data-iot-action': 'edit-model',
                      'data-iot-model-id': row.id,
                      onClick: (event: MouseEvent) => {
                      event.stopPropagation();
                      handleEditModel(row);
                    } }, () => '编辑'),
                    h(ElButton, { link: true, type: 'primary', nativeType: 'button', onClick: (event: MouseEvent) => {
                      event.stopPropagation();
                      handleCopyModel(row.id);
                    } }, () => '复制'),
                    h(ElButton, { link: true, type: 'danger', nativeType: 'button', onClick: (event: MouseEvent) => {
                      event.stopPropagation();
                      handleDeprecateModel(row.id);
                    } }, () => '删除')
                  ])
              })
            ])
          : h(ElEmpty, { description: queryParams.keyword ? '当前筛选条件下暂无物模型' : '暂无物模型' }, {
              default: () =>
                h(ElSpace, null, () => [
                  h(ElButton, { type: 'primary', nativeType: 'button', onClick: handleAddModel }, () => '添加物模型'),
                  queryParams.keyword ? h(ElButton, { nativeType: 'button', onClick: handleResetModelFilter }, () => '清空筛选') : null
                ])
            })
      ]);
  }
});

const HardwareOverrideTable = defineComponent({
  name: 'HardwareOverrideTable',
  props: {
    rows: {
      type: Array<HardwareOverride>,
      required: true
    }
  },
  setup(props) {
    return () =>
      props.rows.length
        ? h(ElTable, { data: props.rows, height: 520, border: false, stripe: true }, () => [
            h(ElTableColumn, { label: '硬件型号', prop: 'hardwareName', minWidth: 150 }),
            h(ElTableColumn, { label: '物模型标识符', prop: 'modelIdentifier', minWidth: 180 }),
            h(ElTableColumn, { label: '类目默认', minWidth: 120 }, { default: ({ row }: { row: HardwareOverride }) => formatDefaultValue(row.categoryDefault) }),
            h(ElTableColumn, { label: '硬件覆盖', minWidth: 120 }, { default: ({ row }: { row: HardwareOverride }) => formatDefaultValue(row.hardwareDefault) }),
            h(ElTableColumn, { label: '状态', width: 90 }, { default: ({ row }: { row: HardwareOverride }) => h(ElTag, { type: row.valid ? 'success' : 'danger' }, () => (row.valid ? '合法' : '冲突')) }),
            h(ElTableColumn, { label: '说明', prop: 'reason', minWidth: 220, showOverflowTooltip: true }),
            h(ElTableColumn, { label: '操作', width: 170, fixed: 'right' }, {
              default: ({ row }: { row: HardwareOverride }) =>
                h(ElSpace, null, () => [
                  h(ElButton, { link: true, type: row.valid ? 'primary' : 'danger', icon: Edit, onClick: () => openRepairOverride(row) }, () => (row.valid ? '编辑' : '修复')),
                  h(ElButton, { link: true, type: 'primary', onClick: () => handleViewModelByIdentifier(row.modelIdentifier) }, () => '查看模型')
                ])
            })
          ])
        : h(ElEmpty, { description: '暂无硬件覆盖配置' }, { default: () => h(ElButton, { type: 'primary', onClick: goModels }, () => '先维护物模型') });
  }
});

const DeviceTable = defineComponent({
  name: 'DeviceTable',
  setup() {
    return () =>
      h(ElTable, { data: deviceInstances.value, height: 520, stripe: true }, () => [
        h(ElTableColumn, { label: '设备名称', prop: 'deviceName', minWidth: 180 }),
        h(ElTableColumn, { label: '设备 SN', prop: 'deviceSn', minWidth: 180 }),
        h(ElTableColumn, { label: '硬件型号', prop: 'hardwareName', minWidth: 130 }),
        h(ElTableColumn, { label: '模板版本', prop: 'templateVersion', width: 110 }),
        h(ElTableColumn, { label: '初始化', width: 100 }, { default: ({ row }: { row: DeviceInstance }) => h(ElTag, { type: row.initialized ? 'success' : 'warning' }, () => (row.initialized ? '已初始化' : '待初始化')) }),
        h(ElTableColumn, { label: '默认值快照', minWidth: 260, showOverflowTooltip: true }, { default: ({ row }: { row: DeviceInstance }) => formatDefaultValue(row.defaultSnapshot) }),
        h(ElTableColumn, { label: '操作', width: 150, fixed: 'right' }, { default: ({ row }: { row: DeviceInstance }) => h(ElButton, { link: true, type: 'primary', icon: Upload, onClick: () => handleInitializeDevices(row.id) }, () => '模拟初始化') })
      ]);
  }
});

const AuditTable = defineComponent({
  name: 'AuditTable',
  setup() {
    return () =>
      h(ElTable, { data: auditLogs.value, height: 560, stripe: true }, () => [
        h(ElTableColumn, { label: '时间', prop: 'createdAt', minWidth: 160 }),
        h(ElTableColumn, { label: '操作', prop: 'action', width: 130 }),
        h(ElTableColumn, { label: '对象', minWidth: 180 }, { default: ({ row }: { row: AuditLog }) => `${row.objectName} / ${objectTypeMap[row.objectType]}` }),
        h(ElTableColumn, { label: '说明', prop: 'detail', minWidth: 280, showOverflowTooltip: true }),
        h(ElTableColumn, { label: '操作人', prop: 'operator', width: 120 })
      ]);
  }
});

const VersionTimeline = defineComponent({
  name: 'VersionTimeline',
  props: {
    rows: {
      type: Array<TemplateVersion>,
      required: true
    }
  },
  setup(props) {
    return () =>
      props.rows.length
        ? h(ElTimeline, { class: 'version-timeline' }, () =>
            props.rows.map((item) =>
              h(ElTimelineItem, { key: item.id, timestamp: item.publishedAt, placement: 'top' }, () =>
                h('div', { class: 'version-item' }, [
                  h('div', { class: 'version-item__head' }, [
                    h('div', [h('strong', item.version), h('span', item.releaseNote)]),
                    h(ElSpace, null, () => [
                      h(ElButton, { size: 'small', plain: true, onClick: () => handleViewVersion(item) }, () => '查看详情'),
                      h(ElButton, { size: 'small', type: 'warning', plain: true, onClick: () => handleRollbackVersion(item.id) }, () => '模拟回滚')
                    ])
                  ]),
                  h(ElDescriptions, { column: 4, size: 'small', border: true }, () => [
                    h(ElDescriptionsItem, { label: '模型数' }, () => item.modelCount),
                    h(ElDescriptionsItem, { label: '新增' }, () => item.changeSummary.created),
                    h(ElDescriptionsItem, { label: '修改' }, () => item.changeSummary.modified),
                    h(ElDescriptionsItem, { label: '影响设备' }, () => item.impact.deviceCount)
                  ])
                ])
              )
            )
          )
        : h(ElEmpty, { description: '暂无发布记录' });
  }
});

onMounted(async () => {
  document.addEventListener('pointerdown', handleDocumentPointerDown, true);
  document.addEventListener('click', handleDocumentClick, true);
  cleanupStaleOverlays();
  await refreshAll();
});

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleDocumentPointerDown, true);
  document.removeEventListener('click', handleDocumentClick, true);
});

watch(
  () => [categoryDialogOpen.value, functionDialogOpen.value, modelDrawerOpen.value, importOpen.value, publishOpen.value, hardwareDialogOpen.value, docsOpen.value, exportDialogOpen.value],
  async (states) => {
    if (states.some(Boolean)) {
      return;
    }
    await nextTick();
    cleanupStaleOverlays();
  }
);

function cleanupStaleOverlays() {
  const hasActivePopup = hasOpenPopup();
  if (hasActivePopup) return;

  document.querySelectorAll<HTMLElement>('.el-overlay').forEach((overlay) => {
    overlay.remove();
  });

  document.body.classList.remove('el-popup-parent--hidden');
}

function hasOpenPopup() {
  return (
    categoryDialogOpen.value ||
    functionDialogOpen.value ||
    modelDrawerOpen.value ||
    importOpen.value ||
    publishOpen.value ||
    hardwareDialogOpen.value ||
    docsOpen.value ||
    exportDialogOpen.value
  );
}

function handleDocumentPointerDown(event: PointerEvent) {
  const target = getEventElement(event);
  const actionTarget = target?.closest<HTMLElement>('[data-iot-action]');
  if (actionTarget && !hasOpenPopup()) {
    runDocumentAction(actionTarget, event);
    return;
  }

  if (hasOpenPopup()) return;
  if (target?.closest('.el-overlay') || document.body.classList.contains('el-popup-parent--hidden')) {
    cleanupStaleOverlays();
    const underlyingAction = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-iot-action]');
    if (underlyingAction) {
      runDocumentAction(underlyingAction, event);
    }
  }
}

function handleDocumentClick(event: MouseEvent) {
  const actionTarget = getEventElement(event)?.closest<HTMLElement>('[data-iot-action]');
  if (!actionTarget || hasOpenPopup()) return;
  runDocumentAction(actionTarget, event);
}

function getEventElement(event: Event) {
  const target = event.target;
  if (target instanceof Element) return target;
  if (target instanceof Node && target.parentElement instanceof Element) return target.parentElement;
  return null;
}

function runDocumentAction(actionTarget: HTMLElement, event: Event) {
  const action = actionTarget.dataset.iotAction;
  if (!action) return;
  const now = Date.now();
  if (now - lastDocumentActionAt < 250) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  lastDocumentActionAt = now;
  cleanupStaleOverlays();
  event.preventDefault();
  event.stopPropagation();

  if (action === 'add-model') {
    handleAddModel();
    return;
  }
  if (action === 'edit-model') {
    const row = findModelRowFromAction(actionTarget);
    if (row) handleEditModel(row);
    return;
  }
  if (action === 'import-json') {
    handleOpenImport();
    return;
  }
  if (action === 'export-json') {
    handleExport();
    return;
  }
  if (action === 'edit-function') {
    handleEditFunction();
    return;
  }
  if (action === 'delete-function') {
    handleDeleteFunction();
  }
}

function findModelRowFromAction(actionTarget: HTMLElement) {
  const modelId = actionTarget.dataset.iotModelId;
  if (modelId) {
    return modelList.value.find((item) => item.id === modelId) || null;
  }
  const rowElement = actionTarget.closest<HTMLTableRowElement>('tr');
  const rowIndex = rowElement?.rowIndex;
  if (!rowIndex || rowIndex < 1) return null;
  return modelList.value[rowIndex - 1] || null;
}

async function refreshAll() {
  await loadCategories();
  ensureSelectedCategory();
  await getList();
  await loadSideData();
}

async function handleCategorySaved() {
  categoryDialogOpen.value = false;
  categoryKeyword.value = '';
  await refreshAll();
}

async function loadCategories() {
  categories.value = await listProductCategories({ keyword: categoryKeyword.value });
  ensureSelectedCategory();
}

function ensureSelectedCategory() {
  if (!selectedCategoryId.value && categories.value.length > 0) selectedCategoryId.value = categories.value[0].id;
  if (selectedCategoryId.value && !categories.value.some((item) => item.id === selectedCategoryId.value)) selectedCategoryId.value = categories.value[0]?.id || '';
}

async function selectCategory(id: string) {
  selectedCategoryId.value = id;
  queryParams.pageNum = 1;
  detailMode.value = false;
  await getList();
  await loadSideData();
}

async function getList() {
  if (!selectedCategoryId.value) return;
  loading.value = true;
  try {
    const result = await listThingModels(selectedCategoryId.value, queryParams);
    modelList.value = result.rows;
    total.value = result.total;
  } finally {
    loading.value = false;
  }
}

async function loadSideData() {
  if (!selectedCategoryId.value) return;
  const allResult = await listThingModels(selectedCategoryId.value, { pageNum: 1, pageSize: 999, keyword: '', modelType: '', changeStatus: '' });
  allModels.value = allResult.rows;
  versions.value = await listTemplateVersions(selectedCategoryId.value);
  hardwareOverrides.value = await listHardwareOverrides(selectedCategoryId.value);
  deviceInstances.value = await listDeviceInstances(selectedCategoryId.value);
  auditLogs.value = await listAuditLogs(selectedCategoryId.value);
}

function handleModuleSelect(index: string) {
  if (index === 'thing-model') {
    handleSwitchModule('thing-model');
  }
}

function handleQuery() {
  queryParams.pageNum = 1;
  getList();
}

async function handleResetModelFilter() {
  queryParams.keyword = '';
  queryParams.modelType = '';
  queryParams.changeStatus = '';
  queryParams.pageNum = 1;
  await getList();
}

function handleBackToList() {
  detailMode.value = false;
  activeModule.value = 'thing-model';
  queryParams.keyword = '';
  getList();
}

function handleSwitchModule(module: ModuleKey) {
  activeModule.value = module;
  detailMode.value = false;
  if (module === 'thing-model') {
    queryParams.keyword = '';
    getList();
  }
  loadSideData();
}

function handleAddCategory() {
  editingCategory.value = null;
  categoryDialogOpen.value = true;
}

function handleEditCategory() {
  editingCategory.value = selectedCategory.value ? clonePlain(selectedCategory.value) : null;
  categoryDialogOpen.value = true;
}

function handleAddFunction() {
  editingFunctionName.value = '';
  editingFunctionRemark.value = '';
  functionDialogOpen.value = true;
}

function handleEditFunction() {
  editingFunctionName.value = selectedFeature.value?.title || '';
  editingFunctionRemark.value = selectedFeature.value?.subtitle || '';
  functionDialogOpen.value = true;
}

async function handleDeleteFunction() {
  if (!selectedFeature.value) {
    ElMessage.info('请先选择功能项');
    return;
  }
  await ElMessageBox.confirm(`确认删除功能项「${selectedFeature.value.title}」？原型中仅移除当前演示卡片，不删除已创建的物模型。`, '删除功能项', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  });
  const functionName = selectedFeature.value.title;
  customFunctionNames.value = customFunctionNames.value.filter((name) => name !== functionName);
  if (!hiddenFunctionNames.value.includes(functionName)) {
    hiddenFunctionNames.value.push(functionName);
  }
  ElMessage.success('功能项已删除');
  selectedFeature.value = null;
  detailMode.value = false;
  activeModule.value = 'thing-model';
}

function handleOpenImport() {
  if (!selectedCategory.value) {
    ElMessage.warning('请先选择产品类');
    return;
  }
  importOpen.value = true;
}

function handleOpenPublish() {
  if (!canPublish.value) {
    ElMessage.info('当前没有草稿变更，暂不可发布');
    return;
  }
  publishOpen.value = true;
}

function handleAddModel() {
  const category = selectedCategory.value || categories.value[0];
  if (!category) {
    ElMessage.warning('请先新增或选择产品类');
    return;
  }
  if (!selectedCategoryId.value) {
    selectedCategoryId.value = category.id;
  }
  const model = createEmptyModel(category.id, category.currentVersion);
  if (selectedFeature.value?.title) {
    model.functionItems = [selectedFeature.value.title];
  }
  openModelDrawer(model);
}

function handleEditModel(row: ThingModelDefinition) {
  openModelDrawer(clonePlain(row));
}

function openModelDrawer(model: ThingModelDefinition) {
  document.body.classList.remove('iot-no-popup');
  cleanupStaleOverlays();
  editingModel.value = model;
  modelDrawerOpen.value = false;
  modelDrawerKey.value += 1;
  nextTick(() => {
    modelDrawerOpen.value = true;
  });
}

async function handleCopyModel(id: string) {
  await copyThingModel(id);
  ElMessage.success('物模型已复制为草稿');
  await handleModelSaved();
}

async function handleDeprecateModel(id: string) {
  await ElMessageBox.confirm('删除后将进入草稿变更，发布前可在变更列表中核对影响范围。', '确认删除物模型', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  });
  await deprecateThingModel(id);
  ElMessage.success('物模型已标记为废弃');
  await handleModelSaved();
}

async function handleModelSaved() {
  modelDrawerOpen.value = false;
  await handleResetModelFilter();
  await loadCategories();
  ensureSelectedCategory();
  await loadSideData();
  activeTab.value = 'models';
  detailMode.value = true;
}

async function handleHardwareSaved() {
  await loadSideData();
}

async function handleExport() {
  const payload = JSON.stringify(modelList.value, null, 2);
  try {
    await navigator.clipboard.writeText(payload);
    ElMessage.success(`已复制 ${modelList.value.length} 条物模型 JSON 到剪贴板`);
  } catch {
    exportContent.value = payload;
    exportDialogOpen.value = true;
  }
  if (selectedCategory.value) {
    await addAuditLog({
      categoryId: selectedCategory.value.id,
      action: 'JSON 导出',
      objectType: 'export',
      objectName: selectedCategory.value.name,
      detail: `导出当前筛选结果 ${modelList.value.length} 条。`
    });
    await loadSideData();
  }
}

function handleWorkflowAction(key: string) {
  if (key === 'model') {
    handleAddFunction();
    return;
  }
  if (key === 'default' || key === 'changes') return openFeatureDetail(functionCards.value[0]);
  if (key === 'hardware') {
    handleSwitchModule('hardware');
    return;
  }
  if (key === 'device') {
    handleSwitchModule('devices');
    return;
  }
  handleSwitchModule('audit');
}

function openFeatureDetail(card?: FunctionCard) {
  selectedFeature.value = card || functionCards.value[0] || null;
  detailMode.value = true;
  activeTab.value = 'models';
}

function handleFunctionSaved(name: string) {
  if (editingFunctionName.value && editingFunctionName.value !== name) {
    customFunctionNames.value = customFunctionNames.value.map((item) => (item === editingFunctionName.value ? name : item));
    renamedFunctionMap.value = {
      ...renamedFunctionMap.value,
      [editingFunctionName.value]: name
    };
  }
  if (!customFunctionNames.value.includes(name)) {
    customFunctionNames.value.unshift(name);
  }
  hiddenFunctionNames.value = hiddenFunctionNames.value.filter((item) => item !== name);
  selectedFeature.value = {
    id: `${name}_${Date.now()}`,
    title: name,
    subtitle: editingFunctionRemark.value || name,
    statusText: '未发布',
    ai: name.includes('AI')
  };
  editingFunctionName.value = '';
  editingFunctionRemark.value = '';
  detailMode.value = true;
  activeTab.value = 'models';
}

function goModels() {
  handleSwitchModule('thing-model');
}

function handlePublishNavigate(target: 'models' | 'changes' | 'hardware') {
  publishOpen.value = false;
  if (target === 'hardware') handleSwitchModule('hardware');
  if (target === 'models' || target === 'changes') openFeatureDetail(selectedFeature.value || functionCards.value[0]);
}

async function handlePublished() {
  publishOpen.value = false;
  await refreshAll();
  detailMode.value = true;
  activeTab.value = 'versions';
}

function openRepairOverride(row?: HardwareOverride) {
  if (!row) {
    ElMessage.info('当前没有需要修复的硬件覆盖');
    return;
  }
  editingOverride.value = clonePlain(row);
  hardwareDialogOpen.value = true;
}

function clonePlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(toRaw(value))) as T;
}

function handleViewModelByIdentifier(identifier: string) {
  openFeatureDetail(functionCards.value[0]);
  queryParams.keyword = identifier;
  handleQuery();
}

async function handleInitializeDevices(deviceId?: string) {
  if (!selectedCategory.value) {
    ElMessage.warning('请先选择产品类');
    return;
  }
  const count = await initializeDeviceDefaults(selectedCategory.value.id, deviceId);
  ElMessage.success(`已初始化 ${count} 台设备的默认值快照`);
  await loadSideData();
}

async function handleRollbackVersion(versionId: string) {
  await ElMessageBox.confirm('这是原型内的模拟回滚，会写入审计日志并把当前版本标记为所选版本。', '模拟回滚模板', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  });
  await rollbackTemplateVersion(versionId);
  ElMessage.success('已完成模拟回滚');
  await refreshAll();
}

function handleViewVersion(item: TemplateVersion) {
  ElMessageBox.alert(
    `发布说明：${item.releaseNote}\n新增：${item.changeSummary.created}，修改：${item.changeSummary.modified}，废弃：${item.changeSummary.deprecated}，默认值变更：${item.changeSummary.defaultChanged}\n影响硬件：${item.impact.hardwareCount}，影响设备：${item.impact.deviceCount}`,
    `${item.version} 发布详情`,
    { confirmButtonText: '知道了' }
  );
}

function formatDataDefinition(row: ThingModelDefinition) {
  if (row.dataType === 'bool') {
    return `0-${row.dataSpec.falseText || '关'}; 1-${row.dataSpec.trueText || '开'}`;
  }
  if (row.dataType === 'enum') {
    return row.dataSpec.enumItems?.map((item) => `${item.value}-${item.label}`).join(';') || '-';
  }
  if (['int', 'float', 'double'].includes(row.dataType)) {
    const range = [row.dataSpec.min, row.dataSpec.max].filter((item) => item !== undefined).join('~');
    return `${range || '数值'}${row.dataSpec.unit || ''}`;
  }
  return formatDefaultValue(row.defaultConfig.value, row.dataSpec);
}

function getPublishStatusType(status: PublishStatus) {
  return status === 'published' ? 'success' : status === 'draft' ? 'warning' : status === 'deprecated' ? 'danger' : 'info';
}
</script>

<style scoped lang="scss">
.admin-shell {
  min-height: 100vh;
  background: linear-gradient(110deg, #eff7ff 0%, #f8fbff 44%, #eef4ff 100%);
}

.detail-mode .sidebar {
  display: none;
}

.detail-mode .topbar {
  padding: 0 8px;
  background: #fff;
}

.sidebar {
  background: linear-gradient(180deg, #f8fbff 0%, #edf5ff 100%);
  border-right: 1px solid #e4ecf7;
}

.brand {
  height: 82px;
  padding: 34px 12px 0;
  color: #111827;
  font-size: 16px;
  font-weight: 700;
}

.nav-menu {
  border-right: 0;
  background: transparent;

  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    height: 48px;
    padding-left: 12px !important;
    color: #1f2937;
    font-size: 14px;
  }

  :deep(.el-menu-item.is-active) {
    margin: 0 6px;
    padding-left: 36px !important;
    border-radius: 4px;
    background: #dbeafe;
    color: #1264ff;
  }
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px 0 28px;
  background: transparent;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #111827;
  font-size: 18px;
  font-weight: 700;
}

.topbar__actions {
  display: flex;
  gap: 12px;
}

.top-search {
  width: 300px;
}

.category-page {
  display: flex;
  min-height: calc(100vh - 88px);
  margin: 0 24px 18px;
  padding: 0;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
}

.category-panel {
  width: 224px;
  flex: 0 0 224px;
  padding: 18px 20px 24px;
  border-right: 1px solid #edf0f5;
}

.category-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.category-list {
  margin-top: 12px;
}

.category-item {
  display: block;
  width: 100%;
  height: 40px;
  padding: 0 16px;
  border: 0;
  border-left: 3px solid transparent;
  border-radius: 4px;
  background: transparent;
  color: #111827;
  text-align: left;
  cursor: pointer;

  &.active {
    border-left-color: #1264ff;
    background: #e8f1ff;
    color: #1264ff;
  }
}

.content {
  min-width: 0;
  flex: 1;
  padding: 20px 20px 16px;
}

.category-hero {
  display: flex;
  min-height: 78px;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-radius: 8px;
  background: radial-gradient(ellipse at 96% 18%, rgba(132, 205, 255, 0.34), transparent 20%),
    linear-gradient(90deg, #f2f7ff 0%, #eaf4ff 100%);

  h2 {
    margin: 0 0 10px;
    font-size: 18px;
  }

  p {
    display: inline-block;
    margin: 0 80px 0 0;
    color: #111827;
    font-size: 13px;
  }

  span {
    color: #6b7280;
  }
}

.process-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 14px 0 18px;
  padding: 10px 14px;
  border: 1px solid #e8eef8;
  border-radius: 6px;
  background: #fbfdff;

  strong,
  span {
    display: block;
  }

  span {
    margin-top: 4px;
    color: #6b7280;
  }
}

.process-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.feature-head,
.detail-toolbar,
.panel-head,
.version-item__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;

  strong {
    font-size: 16px;
  }

  span {
    display: block;
    margin-top: 4px;
    color: #6b7280;
    font-size: 13px;
  }
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(238px, 1fr));
  gap: 16px 20px;
}

.feature-card {
  min-height: 200px;
  padding: 16px 16px 18px;
  border: 1px solid #dbe3ef;
  border-radius: 8px;
  background: #fff;
  text-align: left;
  cursor: pointer;

  &:hover {
    border-color: #1264ff;
    box-shadow: 0 8px 18px rgba(18, 100, 255, 0.08);
  }

  strong {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 14px;
    color: #111827;
    font-size: 15px;
  }

  p {
    margin: 8px 0 0;
    color: #6b7280;
  }
}

.feature-image {
  position: relative;
  display: grid;
  height: 92px;
  place-items: center;
  border: 1px solid #dbe3ef;
  border-radius: 4px;
  background: #f6f9fd;
}

.mock-logo {
  color: #333;
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  text-align: center;

  em {
    font-size: 20px;
    font-style: normal;
  }
}

.ai-mark {
  color: #1275ff;
  font-size: 44px;
  font-weight: 800;
}

.corner-tag {
  position: absolute;
  top: 0;
  right: 0;
  padding: 2px 8px;
  background: #ff7a1a;
  color: #fff;
  font-size: 12px;
}

.page-foot {
  margin-top: 48px;
  color: #111827;
  text-align: right;
}

.detail-page {
  min-height: calc(100vh - 70px);
  padding: 0 18px 28px;
  background: #fff;
}

.detail-hero {
  position: relative;
  display: flex;
  gap: 22px;
  align-items: center;
  min-height: 120px;
  padding: 18px 20px;
  border-radius: 8px;
  background: radial-gradient(ellipse at 97% 24%, rgba(132, 205, 255, 0.36), transparent 18%), linear-gradient(90deg, #f5f8fc 0%, #edf5ff 100%);

  h2 {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 0 12px;
  }

  p {
    margin: 6px 0;
    color: #374151;
  }
}

.detail-icon {
  display: grid;
  width: 76px;
  height: 76px;
  place-items: center;
  border: 1px solid #dbe3ef;
  border-radius: 4px;
  background: #eef6ff;
  color: #1264ff;
  font-size: 26px;
  font-weight: 800;
}

.detail-hero__actions {
  position: absolute;
  top: 16px;
  right: 22px;
  display: flex;
  gap: 8px;
}

.detail-tabs {
  margin-top: 30px;

  :deep(.el-tabs__header) {
    margin: 0 0 24px;
  }

  :deep(.el-tabs__item) {
    min-width: 112px;
    height: 36px;
    padding: 0 20px;
    border: 1px solid #d9e1ee;
    background: #f5f7fb;
  }

  :deep(.el-tabs__item.is-active) {
    border-top: 3px solid #1264ff;
    background: #fff;
  }
}

.tsl-alert {
  margin-bottom: 18px;
}

.table-panel,
.detail-table {
  padding: 0;
  border-radius: 6px;
  background: #fff;

  :deep(.el-table th.el-table__cell) {
    height: 46px;
    background: #f2f5f8;
    color: #1f2937;
    font-weight: 500;
  }

  :deep(.el-table td.el-table__cell) {
    height: 46px;
    border-bottom: 0;
  }

  :deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
    background: #f4f7fb;
  }
}

.name-cell {
  strong,
  span {
    display: block;
  }

  span {
    margin-top: 3px;
    color: #6b7280;
    font-size: 12px;
  }
}

.version-item {
  padding: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fbfdff;
}

@media (max-width: 1440px) {
  .feature-grid {
    grid-template-columns: repeat(4, minmax(190px, 1fr));
  }
}

@media (max-width: 1100px) {
  .sidebar {
    display: none;
  }

  .category-page {
    flex-direction: column;
  }

  .category-panel {
    width: 100%;
    flex-basis: auto;
  }

  .feature-grid {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
  }
}
</style>
