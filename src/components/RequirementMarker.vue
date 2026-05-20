<template>
  <el-popover
    v-if="showRequirementMarkers"
    :placement="placement"
    :width="width"
    trigger="click"
    popper-class="requirement-marker-popper"
    :show-arrow="true"
  >
    <template #reference>
      <button class="requirement-marker" :class="[`requirement-marker--${tone}`, { 'is-inline': inline }]" type="button" :aria-label="`查看需求标注 ${marker.code}`">
        <span>{{ marker.code }}</span>
        <em>需求</em>
      </button>
    </template>

    <article class="marker-card">
      <header>
        <span>{{ marker.code }}</span>
        <strong>{{ marker.title }}</strong>
      </header>
      <p>{{ marker.summary }}</p>
      <ul>
        <li v-for="point in marker.points" :key="point">{{ point }}</li>
      </ul>
      <footer>
        <strong>验收：</strong>{{ marker.acceptance }}
        <small>{{ marker.source }}</small>
      </footer>
    </article>
  </el-popover>
</template>

<script setup lang="ts">
import { computed, inject, type Ref } from 'vue';
import { getRequirementMarker, type RequirementMarkerDoc } from '@/docs/requirementMarkers';

const props = withDefaults(
  defineProps<{
    id: string;
    inline?: boolean;
    placement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'right';
    width?: number;
    tone?: 'red' | 'blue' | 'amber';
  }>(),
  {
    inline: false,
    placement: 'top',
    width: 320,
    tone: 'red'
  }
);

const fallbackMarker: RequirementMarkerDoc = {
  id: props.id,
  code: 'REQ',
  title: '需求标注',
  summary: '该操作暂无细化说明。',
  points: ['可在需求说明文档中补充对应规则。'],
  acceptance: '补齐后在此处展示。',
  source: '需求说明'
};

const marker = computed(() => getRequirementMarker(props.id) || fallbackMarker);
const showRequirementMarkers = inject<Ref<boolean>>('showRequirementMarkers', computed(() => true));
</script>

<style scoped lang="scss">
.requirement-marker {
  display: inline-flex;
  min-width: 58px;
  height: 24px;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0 8px;
  border: 1px solid #bfdbfe;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  box-shadow: none;
  cursor: pointer;
  vertical-align: middle;
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;

  span {
    font-size: 11px;
    font-weight: 800;
    line-height: 1;
  }

  em {
    font-size: 11px;
    font-style: normal;
    font-weight: 600;
  }

  &:hover {
    border-color: #60a5fa;
    background: #dbeafe;
    transform: translateY(-1px);
  }

  &.is-inline {
    margin-left: 6px;
  }
}

.requirement-marker--blue {
  border-color: #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
}

.requirement-marker--amber {
  border-color: #fde68a;
  background: #fffbeb;
  color: #92400e;
}

.requirement-marker--red {
  border-color: #fecaca;
  background: #fff1f2;
  color: #be123c;
}

.marker-card {
  color: #1f2937;

  header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  header span {
    display: inline-grid;
    min-width: 30px;
    height: 22px;
    place-items: center;
    border-radius: 999px;
    background: #fee2e2;
    color: #b91c1c;
    font-size: 11px;
    font-weight: 800;
  }

  header strong {
    font-size: 15px;
  }

  p {
    margin: 0 0 8px;
    color: #4b5563;
    line-height: 1.55;
  }

  ul {
    margin: 0 0 10px;
    padding-left: 18px;
  }

  li {
    margin: 5px 0;
    color: #374151;
    line-height: 1.5;
  }

  footer {
    display: block;
    padding-top: 9px;
    border-top: 1px solid #edf2f7;
    color: #111827;
    line-height: 1.5;
  }

  footer small {
    display: block;
    margin-top: 6px;
    color: #8a95a6;
    font-size: 12px;
  }
}
</style>
