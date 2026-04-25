import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { EMOJI_TO_FILENAME, EMOJI_REGEX } from './EmojiMap'

const pluginKey = new PluginKey<DecorationSet>('emoji')

function buildDecorations(doc: any): DecorationSet {
    const decorations: Decoration[] = []

    doc.descendants((node: any, pos: number) => {
        if (node.type.name === 'codeBlock') return false
        if (!node.isText || !node.text) return

        // Skip text nodes with code mark
        if (node.marks?.some((m: any) => m.type.name === 'code')) return

        const regex = new RegExp(EMOJI_REGEX.source, 'gu')
        let match: RegExpExecArray | null

        while ((match = regex.exec(node.text)) !== null) {
            const emoji = match[0]
            const name = EMOJI_TO_FILENAME[emoji]
            if (!name) continue

            const from = pos + match.index
            const to = from + emoji.length

            const imgSrc = `/images/emojis/${name}`
            const imgAlt = emoji

            decorations.push(
                Decoration.widget(from, () => {
                    const el = document.createElement('img')
                    el.src = imgSrc
                    el.className = 'emoji-img'
                    el.alt = imgAlt
                    el.draggable = false
                    return el
                }, { side: -1, key: `mw${from}` })
            )
            decorations.push(
                Decoration.inline(from, to, { class: 'emoji-char' }, { key: `mi${from}` })
            )
        }
    })

    return DecorationSet.create(doc, decorations)
}

export const EmojiPlugin = Extension.create({
    name: 'emojiPlugin',

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: pluginKey,
                state: {
                    init(_, { doc }) {
                        return buildDecorations(doc)
                    },
                    apply(tr, old) {
                        if (!tr.docChanged) return old.map(tr.mapping, tr.doc)
                        return buildDecorations(tr.doc)
                    },
                },
                props: {
                    decorations(state) {
                        return pluginKey.getState(state)
                    },
                },
            }),
        ]
    },
})
