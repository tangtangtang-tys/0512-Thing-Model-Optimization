<template>
  <el-popover
    :placement="placement"
    :width="width"
    trigger="click"
    popper-class="requirement-marker-popper"
    :show-arrow="true"
  >
    <template #reference>
      <button class="requirement-marker" :class="[`requirement-marker--${tone}`, { 'is-inline': inline }]" type="button" :aria-label="`查看需求标注 ${marker.code}`">
        <span>{{ marker.code }}</span>
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
import { computed } from 'vue';
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
</script>

<style scoped lang="scss">
.requirement-marker {
  display: inline-grid;
  width: 24px;
  height: 24px;
  place-items: center;
  padding: 0;
  border: 2px solid #fff;
  border-radius: 50%;
  background: #ef4444;
  color: #fff;
  box-shadow: 0 4px 12px rgba(185, 28, 28, 0.28);
  cursor: pointer;
  vertical-align: middle;

  span {
    font-size: 10px;
    font-weight: 800;
    line-height: 1;
  }

  &:hover {
    transform: translateY(-1px);
  }

  &.is-inline {
    margin-left: 6px;
  }
}

.requirement-marker--blue {
  background: #2563eb;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.24);
}

.requirement-marker--amber {
  background: #d97706;
  box-shadow: 0 4px 12px rgba(217, 119, 6, 0.24);
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
