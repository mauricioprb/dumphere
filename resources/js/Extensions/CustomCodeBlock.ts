import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import type { Component } from 'vue'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import CodeBlockView from '@/Components/Editor/CodeBlockView.vue'

export const CustomCodeBlock = CodeBlockLowlight.extend({
    addNodeView() {
        return VueNodeViewRenderer(CodeBlockView as Component)
    },

    addProseMirrorPlugins() {
        const parentPlugins = this.parent?.() ?? []

        return [
            ...parentPlugins,
            new Plugin({
                key: new PluginKey('codeBlockClipboard'),
                props: {
                    handleDOMEvents: {
                        copy(view, event) {
                            const { state } = view
                            const { from, to } = state.selection

                            const $from = state.doc.resolve(from)
                            const $to = state.doc.resolve(to)

                            const fromNode = $from.node($from.depth)
                            const toNode = $to.node($to.depth)

                            if (
                                fromNode === toNode &&
                                fromNode.type.name === 'codeBlock'
                            ) {
                                const text = state.doc.textBetween(from, to, '\n')
                                event.clipboardData?.setData('text/plain', text)
                                event.preventDefault()
                                return true
                            }

                            return false
                        },
                        cut(view, event) {
                            const { state } = view
                            const { from, to } = state.selection

                            const $from = state.doc.resolve(from)
                            const $to = state.doc.resolve(to)

                            const fromNode = $from.node($from.depth)
                            const toNode = $to.node($to.depth)

                            if (
                                fromNode === toNode &&
                                fromNode.type.name === 'codeBlock'
                            ) {
                                const text = state.doc.textBetween(from, to, '\n')
                                event.clipboardData?.setData('text/plain', text)
                                event.preventDefault()

                                const tr = state.tr.deleteSelection()
                                view.dispatch(tr)
                                return true
                            }

                            return false
                        },
                    },
                },
            }),
        ]
    },
})
