<template>
  <el-dialog
    v-model="visible"
    title="需求说明文档"
    width="min(1120px, 92vw)"
    class="requirement-docs-dialog"
    append-to-body
    destroy-on-close
  >
    <div class="docs-shell">
      <aside class="docs-nav">
        <button
          v-for="doc in requirementDocs"
          :key="doc.id"
          class="docs-nav__item"
          :class="{ active: doc.id === activeDocId }"
          type="button"
          @click="activeDocId = doc.id"
        >
          <strong>{{ doc.title }}</strong>
          <span>{{ doc.sourceName }}</span>
        </button>
      </aside>

      <section class="docs-content">
        <div class="docs-content__head">
          <div>
            <h2>{{ activeDoc.title }}</h2>
            <span>{{ activeDoc.sourceName }}</span>
          </div>
          <el-button :icon="CopyDocument" @click="handleCopy">复制全文</el-button>
        </div>
        <article class="markdown-preview">
          <template v-for="(block, index) in docBlocks" :key="`${block.type}-${index}-${block.text}`">
            <component :is="block.type" v-if="isHeading(block.type)" class="doc-heading">
              {{ block.text }}
            </component>
            <p v-else-if="block.type === 'p'">{{ block.text }}</p>
            <div
              v-else
              class="doc-list-line"
              :class="{ ordered: block.type === 'ol', unordered: block.type === 'ul' }"
              :style="{ paddingLeft: `${block.depth * 22}px` }"
            >
              <span class="doc-list-marker">{{ block.marker }}</span>
              <span>{{ block.text }}</span>
            </div>
          </template>
        </article>
      </section>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { CopyDocument } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { requirementDocs } from '@/docs/requirements';

interface DocBlock {
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'ol' | 'ul';
  text: string;
  depth: number;
  marker: string;
}

const visible = defineModel<boolean>({ required: true });
const activeDocId = ref(requirementDocs[0]?.id || '');

const activeDoc = computed(() => requirementDocs.find((doc) => doc.id === activeDocId.value) || requirementDocs[0]);
const docBlocks = computed(() => parseMarkdown(activeDoc.value.content));

async function handleCopy() {
  await navigator.clipboard.writeText(activeDoc.value.content);
  ElMessage.success('已复制需求文档内容');
}

function parseMarkdown(markdown: string): DocBlock[] {
  const lines = markdown.split('\n');
  const blocks: DocBlock[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      continue;
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      const level = Math.min(heading[1].length, 4);
      blocks.push({ type: `h${level}` as DocBlock['type'], text: cleanInline(heading[2]), depth: 0, marker: '' });
      continue;
    }

    const unordered = line.match(/^(\s*)-\s+(.+)$/);
    if (unordered) {
      blocks.push({
        type: 'ul',
        text: cleanInline(unordered[2]),
        depth: getIndentDepth(unordered[1]),
        marker: '•'
      });
      continue;
    }

    const ordered = line.match(/^(\s*)\d+\.\s+(.+)$/);
    if (ordered) {
      blocks.push({
        type: 'ol',
        text: cleanInline(ordered[2]),
        depth: getIndentDepth(ordered[1]),
        marker: `${trimmed.split('.')[0]}.`
      });
      continue;
    }

    blocks.push({ type: 'p', text: cleanInline(trimmed), depth: 0, marker: '' });
  }

  return blocks;
}

function isHeading(type: DocBlock['type']) {
  return ['h1', 'h2', 'h3', 'h4'].includes(type);
}

function getIndentDepth(spaces: string) {
  return Math.min(Math.floor(spaces.length / 3), 3);
}

function cleanInline(value: string) {
  return value.replace(/\*\*(.*?)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1');
}
</script>

<style scoped lang="scss">
.docs-shell {
  display: grid;
  grid-template-columns: 248px minmax(0, 1fr);
  height: min(78vh, 760px);
  min-height: 560px;
  overflow: hidden;
}

.docs-nav {
  overflow: auto;
  padding: 16px 14px;
  border-right: 1px solid #e5eaf3;
  background: #f8fafc;
}

.docs-nav__item {
  display: block;
  width: 100%;
  margin-bottom: 10px;
  padding: 12px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: #18202f;
  text-align: left;
  cursor: pointer;

  strong,
  span {
    display: block;
  }

  strong {
    font-size: 14px;
  }

  span {
    margin-top: 6px;
    color: #64748b;
    font-size: 12px;
    word-break: break-all;
  }

  &.active {
    border-color: #bfdbfe;
    background: #eaf3ff;
    color: #1264ff;
  }
}

.docs-content {
  display: flex;
  min-height: 0;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
}

.docs-content__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 0 0 auto;
  gap: 20px;
  padding: 20px 28px 14px;
  border-bottom: 1px solid #edf1f7;
  background: #fff;

  h2 {
    margin: 0;
    font-size: 20px;
  }

  span {
    display: block;
    margin-top: 6px;
    color: #64748b;
    font-size: 13px;
  }
}

.markdown-preview {
  min-height: 0;
  padding: 18px 32px 34px;
  overflow: auto;
  color: #1f2937;
  line-height: 1.72;

  h1 {
    margin: 20px 0 14px;
    font-size: 24px;
  }

  h2 {
    margin: 24px 0 12px;
    padding-top: 10px;
    border-top: 1px solid #edf1f7;
    font-size: 19px;
  }

  h3 {
    margin: 18px 0 10px;
    font-size: 16px;
  }

  h4 {
    margin: 16px 0 8px;
    font-size: 15px;
  }

  p {
    margin: 8px 0;
  }
}

.doc-list-line {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  gap: 2px;
  margin: 5px 0;
  line-height: 1.65;
}

.doc-list-marker {
  color: #475569;
  text-align: right;
  white-space: nowrap;
}

@media (max-width: 760px) {
  .docs-shell {
    display: block;
    height: 78vh;
    min-height: 0;
  }

  .docs-nav {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    border-right: 0;
    border-bottom: 1px solid #e5eaf3;
  }

  .docs-nav__item {
    min-width: 190px;
  }

  .docs-content {
    height: calc(78vh - 92px);
  }

  .docs-content__head {
    align-items: flex-start;
    padding: 16px 18px 12px;
  }

  .markdown-preview {
    padding: 14px 18px 28px;
  }
}
</style>
