<template>
  <el-dialog
    v-model="visible"
    title="需求说明文档"
    width="min(1080px, 92vw)"
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
        <article class="markdown-preview" v-html="renderedContent" />
      </section>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { CopyDocument } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { requirementDocs } from '@/docs/requirements';

const visible = defineModel<boolean>({ required: true });
const activeDocId = ref(requirementDocs[0]?.id || '');

const activeDoc = computed(() => requirementDocs.find((doc) => doc.id === activeDocId.value) || requirementDocs[0]);
const renderedContent = computed(() => renderMarkdown(activeDoc.value.content));

async function handleCopy() {
  await navigator.clipboard.writeText(activeDoc.value.content);
  ElMessage.success('已复制需求文档内容');
}

function renderMarkdown(markdown: string) {
  const lines = markdown.split('\n');
  const html: string[] = [];
  let listStack: Array<'ul' | 'ol'> = [];

  const closeLists = (targetDepth = 0) => {
    while (listStack.length > targetDepth) {
      html.push(`</${listStack.pop()}>`);
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      closeLists();
      continue;
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      closeLists();
      const level = Math.min(heading[1].length, 4);
      html.push(`<h${level}>${escapeHtml(heading[2])}</h${level}>`);
      continue;
    }

    const unordered = line.match(/^(\s*)-\s+(.+)$/);
    if (unordered) {
      const depth = Math.floor(unordered[1].length / 3);
      syncListStack('ul', depth, listStack, html);
      html.push(`<li>${escapeHtml(unordered[2])}</li>`);
      continue;
    }

    const ordered = line.match(/^(\s*)\d+\.\s+(.+)$/);
    if (ordered) {
      const depth = Math.floor(ordered[1].length / 3);
      syncListStack('ol', depth, listStack, html);
      html.push(`<li>${escapeHtml(ordered[2])}</li>`);
      continue;
    }

    closeLists();
    html.push(`<p>${escapeHtml(trimmed)}</p>`);
  }

  closeLists();
  return html.join('');
}

function syncListStack(type: 'ul' | 'ol', depth: number, stack: Array<'ul' | 'ol'>, html: string[]) {
  while (stack.length > depth + 1) {
    html.push(`</${stack.pop()}>`);
  }
  while (stack.length < depth + 1) {
    stack.push(type);
    html.push(`<${type}>`);
  }
  if (stack[stack.length - 1] !== type) {
    html.push(`</${stack.pop()}>`);
    stack.push(type);
    html.push(`<${type}>`);
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
</script>

<style scoped lang="scss">
.docs-shell {
  display: grid;
  grid-template-columns: 248px minmax(0, 1fr);
  min-height: 68vh;
  max-height: 78vh;
}

.docs-nav {
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
  min-width: 0;
  padding: 20px 28px 28px;
  overflow: auto;
}

.docs-content__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 1px solid #edf1f7;

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
  color: #1f2937;
  line-height: 1.72;

  :deep(h1) {
    margin: 20px 0 14px;
    font-size: 24px;
  }

  :deep(h2) {
    margin: 24px 0 12px;
    padding-top: 10px;
    border-top: 1px solid #edf1f7;
    font-size: 19px;
  }

  :deep(h3) {
    margin: 18px 0 10px;
    font-size: 16px;
  }

  :deep(p) {
    margin: 8px 0;
  }

  :deep(ol),
  :deep(ul) {
    margin: 8px 0 12px;
    padding-left: 22px;
  }

  :deep(li) {
    margin: 4px 0;
  }
}

@media (max-width: 760px) {
  .docs-shell {
    display: block;
    max-height: none;
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
    max-height: 68vh;
    padding: 18px;
  }
}
</style>
