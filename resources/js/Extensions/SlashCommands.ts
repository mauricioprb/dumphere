import { Extension } from '@tiptap/core'
import { VueRenderer } from '@tiptap/vue-3'
import tippy, { type Instance as TippyInstance } from 'tippy.js'
import Suggestion from '@tiptap/suggestion'
import SlashCommandMenu from '@/Components/Editor/SlashCommandMenu.vue'
import { EMOJIS } from '@/Extensions/EmojiMap'

export interface SlashCommandItem {
    titleKey: string
    descKey: string
    icon: string
    searchTerms: string[]
    command: (props: { editor: any; range: any }) => void
}

const emojiItems: SlashCommandItem[] = EMOJIS.map((def) => ({
    titleKey: def.label as any,
    descKey: def.labelPt as any,
    icon: `emoji:${def.filename}`,
    searchTerms: def.searchTerms,
    command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).insertContent(def.emoji[0]).run()
    },
}))

const defaultItems: SlashCommandItem[] = [
    {
        titleKey: 'slash.heading1',
        descKey: 'slash.heading1Desc',
        icon: 'Heading1',
        searchTerms: ['heading', 'h1', 'title', 'titulo', 'título'],
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run()
        },
    },
    {
        titleKey: 'slash.heading2',
        descKey: 'slash.heading2Desc',
        icon: 'Heading2',
        searchTerms: ['heading', 'h2', 'subtitle', 'subtitulo', 'subtítulo'],
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run()
        },
    },
    {
        titleKey: 'slash.heading3',
        descKey: 'slash.heading3Desc',
        icon: 'Heading3',
        searchTerms: ['heading', 'h3', 'titulo', 'título'],
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run()
        },
    },
    {
        titleKey: 'slash.bulletList',
        descKey: 'slash.bulletListDesc',
        icon: 'List',
        searchTerms: ['bullet', 'list', 'unordered', 'lista', 'marcadores'],
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleBulletList().run()
        },
    },
    {
        titleKey: 'slash.orderedList',
        descKey: 'slash.orderedListDesc',
        icon: 'ListOrdered',
        searchTerms: ['ordered', 'list', 'numbered', 'numerada', 'lista'],
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleOrderedList().run()
        },
    },
    {
        titleKey: 'slash.taskList',
        descKey: 'slash.taskListDesc',
        icon: 'ListChecks',
        searchTerms: ['task', 'todo', 'checklist', 'checkbox', 'tarefa', 'tarefas'],
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleTaskList().run()
        },
    },
    {
        titleKey: 'slash.blockquote',
        descKey: 'slash.blockquoteDesc',
        icon: 'Quote',
        searchTerms: ['quote', 'blockquote', 'citação', 'citacao'],
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleBlockquote().run()
        },
    },
    {
        titleKey: 'slash.codeBlock',
        descKey: 'slash.codeBlockDesc',
        icon: 'Braces',
        searchTerms: ['code', 'codeblock', 'código', 'codigo'],
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
        },
    },
    {
        titleKey: 'slash.horizontalRule',
        descKey: 'slash.horizontalRuleDesc',
        icon: 'Minus',
        searchTerms: ['horizontal', 'rule', 'divider', 'separator', 'divisor', 'linha'],
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setHorizontalRule().run()
        },
    },
    {
        titleKey: 'slash.table',
        descKey: 'slash.tableDesc',
        icon: 'Table',
        searchTerms: ['table', 'grid', 'tabela'],
        command: ({ editor, range }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
        },
    },
    {
        titleKey: 'slash.image',
        descKey: 'slash.imageDesc',
        icon: 'ImageIcon',
        searchTerms: ['image', 'img', 'picture', 'photo', 'imagem', 'foto'],
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).run()
            window.dispatchEvent(new CustomEvent('open-image-modal', { detail: { editor } }))
        },
    },
]

export const SlashCommands = Extension.create({
    name: 'slashCommands',

    addOptions() {
        return {
            suggestion: {
                char: '/',
                startOfLine: false,
                items: ({ query }: { query: string }) => {
                    const q = query.toLowerCase()
                    if (!q) return defaultItems
                    const allItems = [...defaultItems, ...emojiItems]
                    return allItems.filter((item) =>
                        item.searchTerms.some((term) => term.includes(q)) ||
                        item.titleKey.toLowerCase().includes(q)
                    )
                },
                render: () => {
                    let component: VueRenderer | null = null
                    let popup: TippyInstance | null = null

                    return {
                        onStart: (props: any) => {
                            component = new VueRenderer(SlashCommandMenu, {
                                props,
                                editor: props.editor,
                            })

                            if (!props.clientRect || !component.element) return

                            popup = tippy(document.body, {
                                getReferenceClientRect: props.clientRect,
                                appendTo: () => document.body,
                                content: component.element as Element,
                                showOnCreate: true,
                                interactive: true,
                                trigger: 'manual',
                                placement: 'bottom-start',
                                animation: 'shift-away',
                                theme: 'slash-menu',
                            })
                        },

                        onUpdate: (props: any) => {
                            component?.updateProps(props)

                            if (popup && props.clientRect) {
                                popup.setProps({
                                    getReferenceClientRect: props.clientRect,
                                })
                            }
                        },

                        onKeyDown: (props: any) => {
                            if (props.event.key === 'Escape') {
                                popup?.hide()
                                return true
                            }
                            return (component?.ref as any)?.onKeyDown(props.event) ?? false
                        },

                        onExit: () => {
                            popup?.destroy()
                            component?.destroy()
                        },
                    }
                },
                command: ({ editor, range, props }: any) => {
                    props.command({ editor, range })
                },
            },
        }
    },

    addProseMirrorPlugins() {
        const { suggestion } = this.options

        return [
            Suggestion({
                editor: this.editor,
                ...suggestion,
            }),
        ]
    },
})
