<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/vue-3';
import type { Node } from '@tiptap/pm/model';
import { Copy, Check } from '@lucide/vue';
import { useI18n } from '@/Composables/useI18n';

const props = defineProps<{
    node: Node;
}>();

const { t } = useI18n();
const copyState = ref<'idle' | 'copied' | 'failed'>('idle');
let resetTimer: ReturnType<typeof setTimeout> | null = null;

const language = computed(() => props.node.attrs.language || 'plaintext');
const copyLabel = computed(() => {
    if (copyState.value === 'copied') return t('code.copied');
    if (copyState.value === 'failed') return t('code.copyFailed');
    return t('code.copy');
});

async function copyCode() {
    const text = props.node.textContent;

    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
        } else {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.setAttribute('readonly', '');
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            const copied = document.execCommand('copy');
            textarea.remove();
            if (!copied) throw new Error('Copy command failed');
        }
        copyState.value = 'copied';
    } catch {
        copyState.value = 'failed';
    }

    if (resetTimer) clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
        copyState.value = 'idle';
    }, 2000);
}

onUnmounted(() => {
    if (resetTimer) clearTimeout(resetTimer);
});
</script>

<template>
    <NodeViewWrapper class="code-block-wrapper" as="div">
        <button
            type="button"
            class="code-block-copy-btn"
            :aria-label="copyLabel"
            :title="copyLabel"
            contenteditable="false"
            @click="copyCode"
        >
            <Check v-if="copyState === 'copied'" :size="16" aria-hidden="true" />
            <Copy v-else :size="14" aria-hidden="true" />
        </button>
        <pre><NodeViewContent as="code" :class="language ? `language-${language}` : ''" /></pre>
    </NodeViewWrapper>
</template>
