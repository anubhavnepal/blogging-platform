'use client'

import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Undo, 
  Redo 
} from 'lucide-react'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || 'Type or paste your publication content freely here...',
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-emerald max-w-none min-h-[280px] p-4 text-slate-200 text-sm focus:outline-none leading-relaxed font-sans',
      },
    },
  })

  // Sync content when updated outside (e.g. initial edit load)
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      // Avoid resetting selection if content is equivalent
      if (editor.getText() === '' && content === '') return
      if (editor.getHTML() !== content) {
        editor.commands.setContent(content)
      }
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden focus-within:border-emerald-500/60 transition">
      {/* WYSIWYG Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-900/90 border-b border-slate-800 text-slate-300">
        <button
          type="button"
          title="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-slate-800 transition ${editor.isActive('bold') ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40' : 'text-slate-400'}`}
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          title="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-slate-800 transition ${editor.isActive('italic') ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40' : 'text-slate-400'}`}
        >
          <Italic className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-slate-800 mx-1" />

        <button
          type="button"
          title="Main Heading (H1)"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-slate-800 transition ${editor.isActive('heading', { level: 1 }) ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40' : 'text-slate-400'}`}
        >
          <Heading1 className="w-4 h-4" />
        </button>

        <button
          type="button"
          title="Subheading (H2)"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-slate-800 transition ${editor.isActive('heading', { level: 2 }) ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40' : 'text-slate-400'}`}
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-slate-800 mx-1" />

        <button
          type="button"
          title="Bullet List"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-slate-800 transition ${editor.isActive('bulletList') ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40' : 'text-slate-400'}`}
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          title="Numbered List"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-slate-800 transition ${editor.isActive('orderedList') ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40' : 'text-slate-400'}`}
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <button
          type="button"
          title="Blockquote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-slate-800 transition ${editor.isActive('blockquote') ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40' : 'text-slate-400'}`}
        >
          <Quote className="w-4 h-4" />
        </button>

        <button
          type="button"
          title="Code Block"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded hover:bg-slate-800 transition ${editor.isActive('codeBlock') ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40' : 'text-slate-400'}`}
        >
          <Code className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-slate-800 mx-1 ml-auto" />

        <button
          type="button"
          title="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-slate-800 text-slate-400 disabled:opacity-30 transition"
        >
          <Undo className="w-4 h-4" />
        </button>

        <button
          type="button"
          title="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-slate-800 text-slate-400 disabled:opacity-30 transition"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Editable Area */}
      <EditorContent editor={editor} />
    </div>
  )
}
