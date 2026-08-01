import { Extension, type Editor, type Range } from '@tiptap/core';
import { VueRenderer } from '@tiptap/vue-3';
import tippy, { type GetReferenceClientRect, type Instance as TippyInstance } from 'tippy.js';
import Suggestion, { type SuggestionKeyDownProps, type SuggestionProps } from '@tiptap/suggestion';
import SlashCommandMenu from '@/Components/Editor/SlashCommandMenu.vue';
import { EMOJIS } from '@/Extensions/EmojiMap';

let menuSequence = 0;

export interface SlashCommandItem {
    titleKey: string;
    descKey: string;
    icon: string;
    searchTerms: string[];
    command: (props: SlashCommandContext) => void;
}

interface SlashCommandContext {
    editor: Editor;
    range: Range;
}

interface SlashMenuExposed {
    onKeyDown: (event: KeyboardEvent) => boolean;
}

type SlashSuggestionProps = SuggestionProps<SlashCommandItem, SlashCommandItem>;

const emojiItems: SlashCommandItem[] = EMOJIS.map((def) => ({
    titleKey: def.label,
    descKey: def.labelPt,
    icon: `emoji:${def.filename}`,
    searchTerms: def.searchTerms,
    command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).insertContent(def.emoji[0]).run();
    },
}));

const defaultItems: SlashCommandItem[] = [
    {
        titleKey: 'slash.heading1',
        descKey: 'slash.heading1Desc',
        icon: 'Heading1',
        searchTerms: ['heading', 'h1', 'title', 'titulo', 'título'],
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
        },
    },
    {
        titleKey: 'slash.heading2',
        descKey: 'slash.heading2Desc',
        icon: 'Heading2',
        searchTerms: ['heading', 'h2', 'subtitle', 'subtitulo', 'subtítulo'],
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
        },
    },
    {
        titleKey: 'slash.heading3',
        descKey: 'slash.heading3Desc',
        icon: 'Heading3',
        searchTerms: ['heading', 'h3', 'titulo', 'título'],
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
        },
    },
    {
        titleKey: 'slash.bulletList',
        descKey: 'slash.bulletListDesc',
        icon: 'List',
        searchTerms: ['bullet', 'list', 'unordered', 'lista', 'marcadores'],
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleBulletList().run();
        },
    },
    {
        titleKey: 'slash.orderedList',
        descKey: 'slash.orderedListDesc',
        icon: 'ListOrdered',
        searchTerms: ['ordered', 'list', 'numbered', 'numerada', 'lista'],
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleOrderedList().run();
        },
    },
    {
        titleKey: 'slash.taskList',
        descKey: 'slash.taskListDesc',
        icon: 'ListChecks',
        searchTerms: ['task', 'todo', 'checklist', 'checkbox', 'tarefa', 'tarefas'],
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleTaskList().run();
        },
    },
    {
        titleKey: 'slash.blockquote',
        descKey: 'slash.blockquoteDesc',
        icon: 'Quote',
        searchTerms: ['quote', 'blockquote', 'citação', 'citacao'],
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleBlockquote().run();
        },
    },
    {
        titleKey: 'slash.codeBlock',
        descKey: 'slash.codeBlockDesc',
        icon: 'Braces',
        searchTerms: ['code', 'codeblock', 'código', 'codigo'],
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
        },
    },
    {
        titleKey: 'slash.horizontalRule',
        descKey: 'slash.horizontalRuleDesc',
        icon: 'Minus',
        searchTerms: ['horizontal', 'rule', 'divider', 'separator', 'divisor', 'linha'],
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setHorizontalRule().run();
        },
    },
    {
        titleKey: 'slash.table',
        descKey: 'slash.tableDesc',
        icon: 'Table',
        searchTerms: ['table', 'grid', 'tabela'],
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        },
    },
    {
        titleKey: 'slash.image',
        descKey: 'slash.imageDesc',
        icon: 'ImageIcon',
        searchTerms: ['image', 'img', 'picture', 'photo', 'imagem', 'foto'],
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).run();
            window.dispatchEvent(new CustomEvent('open-image-modal', { detail: { editor } }));
        },
    },
];

export const SlashCommands = Extension.create({
    name: 'slashCommands',

    addOptions() {
        return {
            suggestion: {
                char: '/',
                startOfLine: false,
                items: ({ query }: { query: string }) => {
                    const q = query.toLowerCase();
                    if (!q) return defaultItems;
                    const allItems = [...defaultItems, ...emojiItems];
                    return allItems.filter(
                        (item) =>
                            item.searchTerms.some((term) => term.includes(q)) ||
                            item.titleKey.toLowerCase().includes(q),
                    );
                },
                render: () => {
                    let component: VueRenderer | null = null;
                    let popup: TippyInstance | null = null;
                    let activeEditor: Editor | null = null;
                    const menuId = `slash-command-menu-${++menuSequence}`;

                    const setEditorMenuState = (editor: Editor | null, expanded: boolean) => {
                        const editorElement = editor?.view?.dom as HTMLElement | undefined;
                        if (!editorElement) return;

                        if (expanded) {
                            editorElement.setAttribute('aria-autocomplete', 'list');
                            editorElement.setAttribute('aria-haspopup', 'listbox');
                            editorElement.setAttribute('aria-controls', menuId);
                            editorElement.setAttribute('aria-expanded', 'true');
                        } else {
                            editorElement.removeAttribute('aria-autocomplete');
                            editorElement.removeAttribute('aria-haspopup');
                            editorElement.removeAttribute('aria-controls');
                            editorElement.removeAttribute('aria-expanded');
                            editorElement.removeAttribute('aria-activedescendant');
                        }
                    };

                    return {
                        onStart: (props: SlashSuggestionProps) => {
                            activeEditor = props.editor;
                            component = new VueRenderer(SlashCommandMenu, {
                                props: { ...props, menuId },
                                editor: props.editor,
                            });

                            if (!props.clientRect || !component.element) return;
                            setEditorMenuState(props.editor, true);

                            popup = tippy(document.body, {
                                getReferenceClientRect: requireClientRect(props.clientRect),
                                appendTo: () => document.body,
                                content: component.element as Element,
                                showOnCreate: true,
                                interactive: true,
                                trigger: 'manual',
                                placement: 'bottom-start',
                                animation: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                                    ? false
                                    : 'shift-away',
                                duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                                    ? 0
                                    : [150, 100],
                                theme: 'slash-menu',
                            });
                        },

                        onUpdate: (props: SlashSuggestionProps) => {
                            component?.updateProps({ ...props, menuId });
                            setEditorMenuState(props.editor, true);

                            if (popup && props.clientRect) {
                                popup.setProps({
                                    getReferenceClientRect: requireClientRect(props.clientRect),
                                });
                            }
                        },

                        onKeyDown: (props: SuggestionKeyDownProps) => {
                            if (props.event.key === 'Escape') {
                                popup?.hide();
                                return true;
                            }
                            return (component?.ref as SlashMenuExposed | undefined)?.onKeyDown(props.event) ?? false;
                        },

                        onExit: () => {
                            setEditorMenuState(activeEditor, false);
                            activeEditor = null;
                            popup?.destroy();
                            component?.destroy();
                        },
                    };
                },
                command: ({ editor, range, props }: SlashCommandContext & { props: SlashCommandItem }) => {
                    props.command({ editor, range });
                },
            },
        };
    },

    addProseMirrorPlugins() {
        const { suggestion } = this.options;

        return [
            Suggestion({
                editor: this.editor,
                ...suggestion,
            }),
        ];
    },
});

function requireClientRect(clientRect: () => DOMRect | null): GetReferenceClientRect {
    return () => clientRect() ?? new DOMRect();
}
