export interface RequirementMarkerDoc {
  id: string;
  code: string;
  title: string;
  summary: string;
  points: string[];
  acceptance: string;
  source: string;
}

export const requirementMarkers: Record<string, RequirementMarkerDoc> = {
  'category-manage': {
    id: 'category-manage',
    code: 'R1',
    title: '产品类目是模板容器',
    summary: '类目不只是左侧分组，应承载当前模板版本、发布状态、关联硬件与物模型数量。',
    points: ['新增/编辑类目时应沉淀品类名称、编码、适用产品线、关联硬件、描述和当前模板版本。', '类目下的物模型后续可被硬件型号继承或覆盖。'],
    acceptance: '保存后类目应进入草稿或变更状态，并可继续维护物模型模板。',
    source: '默认值优化需求分析 6.1 / 7.1'
  },
  'function-manage': {
    id: 'function-manage',
    code: 'R2',
    title: '功能项只做业务归类',
    summary: '功能项用于展示和归类能力，不应成为物模型定义、发布和硬件关联的唯一承载对象。',
    points: ['一个功能项可以关联多个物模型。', '后续更新物模型时不应要求重新创建功能项。'],
    acceptance: '新增或编辑功能项后，可直接进入详情维护物模型，而不是重复配置整套定义。',
    source: '默认值优化需求分析 3.1 / 5'
  },
  'workflow-guide': {
    id: 'workflow-guide',
    code: 'R3',
    title: '闭环流程指引',
    summary: '页面应引导用户按“建模板、配默认值、处理覆盖、发布、生效、审计”的顺序完成闭环。',
    points: ['有草稿变更时优先核对变更并发布。', '存在硬件覆盖冲突时需要先修复再发布。', '未初始化设备需要触发默认值快照。'],
    acceptance: '流程按钮应根据当前类目的数据状态给出下一步动作。',
    source: '默认值优化需求分析 6'
  },
  'model-template': {
    id: 'model-template',
    code: 'R4',
    title: '物模型模板维护',
    summary: '物模型应作为产品类目模板的核心资产维护，包含属性、服务、事件及其默认值策略。',
    points: ['支持手动新增、编辑、复制、删除/废弃和 JSON 导入。', '字段需包含名称、标识符、类型、数据定义、访问权限、功能分组、默认值策略和状态。'],
    acceptance: '保存后生成草稿变更，发布前可在列表中核对影响范围。',
    source: '默认值优化需求分析 6.2 / 10.3'
  },
  'model-copy-delete': {
    id: 'model-copy-delete',
    code: 'R5',
    title: '复用与废弃规则',
    summary: '复制用于降低重复配置成本，删除应进入草稿废弃变更，不应直接破坏线上版本。',
    points: ['复制后生成新的草稿物模型。', '删除后在发布前仍应可核对差异与影响范围。'],
    acceptance: '复制/删除操作应写入变更状态，并进入发布校验链路。',
    source: '默认值优化需求分析 3.2 / 8'
  },
  'json-import-export': {
    id: 'json-import-export',
    code: 'R6',
    title: 'JSON 导入导出',
    summary: '导入导出用于与后端接口、模板库和历史版本联调，必须支持默认值字段。',
    points: ['导入时校验标识符、数据类型、默认值合法性。', '导出结果应包含当前筛选到的物模型定义。'],
    acceptance: '有效数据导入后保存为草稿；无效数据阻断并给出原因。',
    source: '默认值优化需求分析 P1 / 10.2'
  },
  'model-basic': {
    id: 'model-basic',
    code: 'R7',
    title: '定义设备能力归属',
    summary: '先区分属性、服务、事件，避免访问权限、默认值策略和发布校验混在一起。',
    points: ['属性通常支持读写并参与设备初始化。', '服务用于控制台调试或快捷操作。', '事件用于上报示例，不作为运行默认值下发。'],
    acceptance: '切换类型时应自动调整访问权限和默认值策略限制。',
    source: '默认值优化需求分析 6.2 / 7.3'
  },
  'model-schema': {
    id: 'model-schema',
    code: 'R8',
    title: 'TSL 数据定义',
    summary: '数据类型和数据定义是默认值校验、硬件覆盖校验和设备解析的共同约束。',
    points: ['枚举值发布后应保持稳定。', '数值默认值必须位于最小值和最大值之间。', '数组和结构体需要约束子字段。'],
    acceptance: '保存和发布前必须校验数据类型合法性、标识符唯一性和默认值范围。',
    source: '默认值优化需求分析 6.3 / 6.4'
  },
  'model-defaults': {
    id: 'model-defaults',
    code: 'R9',
    title: '默认值策略',
    summary: '默认值不是一个简单字段，而是类目模板、硬件覆盖、设备实例之间的继承策略。',
    points: ['支持启用默认值、空值策略、下发策略、硬件覆盖和设备覆盖。', '设备初始化时按用户配置、硬件覆盖、类目默认、系统兜底的优先级计算。'],
    acceptance: '默认值必须符合数据定义；发布后可用于 App 展示兜底和设备初始化快照。',
    source: '默认值优化需求分析 3.3 / 6.3 / 6.6'
  },
  'model-governance': {
    id: 'model-governance',
    code: 'R10',
    title: '治理与草稿变更',
    summary: '已发布版本不可直接改，后续调整应先保存为草稿，再经过发布校验生效。',
    points: ['记录是否必填、默认展示、排序和兼容策略。', '保存后写入草稿变更，发布后生成不可变版本。'],
    acceptance: '关键能力可设置锁定策略，删除或修改需提示影响范围。',
    source: '默认值优化需求分析 3.4 / 8'
  },
  'hardware-overrides': {
    id: 'hardware-overrides',
    code: 'R11',
    title: '硬件默认值覆盖',
    summary: '不同硬件型号可以基于类目模板覆盖部分默认值，但不能突破数据定义约束。',
    points: ['覆盖值必须通过数据类型、枚举范围和数值范围校验。', '冲突项应阻断模板发布。'],
    acceptance: '修复、恢复类目默认或清空覆盖后，冲突状态应解除。',
    source: '默认值优化需求分析 5 / 8'
  },
  'device-init': {
    id: 'device-init',
    code: 'R12',
    title: '设备初始化快照',
    summary: '设备首次绑定、激活或模板升级时，应计算最终默认值并写入快照。',
    points: ['计算优先级：用户配置 > 硬件覆盖 > 类目模板默认值 > 系统兜底。', '快照用于 App 初始展示、云端规则计算、设备下发和问题追溯。'],
    acceptance: '初始化后设备应显示已初始化，并可看到默认值快照。',
    source: '默认值优化需求分析 6.6'
  },
  'publish-check': {
    id: 'publish-check',
    code: 'R13',
    title: '发布前校验',
    summary: '发布前必须展示变更摘要、默认值合法性、硬件覆盖冲突和影响范围。',
    points: ['校验标识符唯一性、数据类型合法性、默认值范围和硬件覆盖冲突。', '发布通过后生成新的模板版本。'],
    acceptance: '有阻断项时禁用确定发布，并提供跳转修复入口。',
    source: '默认值优化需求分析 6.4 / 7.4'
  },
  'publish-note-sync': {
    id: 'publish-note-sync',
    code: 'R14',
    title: '发布说明与同步策略',
    summary: '发布动作需要留下版本说明，并明确是否同步硬件覆盖和触发初始化任务。',
    points: ['发布说明进入版本记录和审计日志。', '同步策略决定模板变更如何影响硬件型号和设备实例。'],
    acceptance: '发布成功后进入发布记录，可查看版本影响范围。',
    source: '默认值优化需求分析 6.5 / 8'
  },
  'version-history': {
    id: 'version-history',
    code: 'R15',
    title: '版本记录与回滚',
    summary: '每次发布应生成不可变版本，支持差异查看、影响范围查看和模拟回滚。',
    points: ['版本记录需要展示新增、修改、废弃和影响设备数。', '回滚动作应写入审计日志。'],
    acceptance: '发布后可在版本记录中查看详情，并能触发模拟回滚。',
    source: '默认值优化需求分析 3.4 / P2'
  },
  'audit-log': {
    id: 'audit-log',
    code: 'R16',
    title: '审计日志',
    summary: '类目、物模型、硬件覆盖、发布和初始化等关键操作都应留痕。',
    points: ['记录操作时间、对象、动作、说明和操作人。', '用于定位默认值来源、版本发布和初始化问题。'],
    acceptance: '关键操作完成后可在审计日志中追踪。',
    source: '默认值优化需求分析 8 / 10.1'
  }
};

export function getRequirementMarker(id: string) {
  return requirementMarkers[id];
}
