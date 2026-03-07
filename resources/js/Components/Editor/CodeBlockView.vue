<script setup lang="ts">
import { ref, computed } from 'vue'
import { NodeViewContent, NodeViewWrapper } from '@tiptap/vue-3'
import { Copy, Check } from 'lucide-vue-next'

const props = defineProps<{
    node: any
    updateAttributes: (attrs: Record<string, any>) => void
    extension: any
}>()

const copied = ref(false)

const language = computed(() => props.node.attrs.language || 'plaintext')

function copyCode() {
    const text = props.node.textContent
    navigator.clipboard.writeText(text).then(() => {
        copied.value = true
        setTimeout(() => {
            copied.value = false
        }, 2000)
    })
}
</script>

<template>
    <NodeViewWrapper class="code-block-wrapper" as="div">
        <button
            class="code-block-copy-btn"
            :title="copied ? 'Copiado!' : 'Copiar código'"
            @click="copyCode"
            contenteditable="false"
        >
            <Check v-if="copied" :size="14" />
            <Copy v-else :size="14" />
        </button>
        <pre><NodeViewContent as="code" :class="language ? `language-${language}` : ''" /></pre>
    </NodeViewWrapper>
</template>
