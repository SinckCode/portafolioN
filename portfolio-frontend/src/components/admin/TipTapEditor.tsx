'use client';

import { useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/extension-bubble-menu';
import { StarterKit } from '@tiptap/starter-kit';
import { Image as TiptapImage } from '@tiptap/extension-image';
import { Link as TiptapLink } from '@tiptap/extension-link';
import { Placeholder } from '@tiptap/extension-placeholder';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Youtube } from '@tiptap/extension-youtube';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { TextAlign } from '@tiptap/extension-text-align';
import { common, createLowlight } from 'lowlight';
import { CalloutNode } from './tiptap-extensions/callout-node';
import {
  Bold, Italic, Strikethrough, Code, Link as LinkIcon,
  Heading1, Heading2, Heading3, List, ListOrdered, ListChecks,
  Quote, CodeXml, ImagePlus, Youtube as YoutubeIcon,
  Table as TableIcon, Minus, Undo, Redo, AlertCircle,
  Pilcrow,
} from 'lucide-react';
import './tiptap-editor.scss';

const lowlight = createLowlight(common);

interface TipTapEditorProps {
  value: string;
  onChange: (html: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

export default function TipTapEditor({ value, onChange, onImageUpload }: TipTapEditorProps) {
  const bubbleRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      TiptapImage.configure({ inline: false, allowBase64: false }),
      TiptapLink.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: 'Escribe algo...' }),
      CodeBlockLowlight.configure({ lowlight }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Youtube.configure({ inline: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      CalloutNode,
      BubbleMenu.configure({
        element: bubbleRef.current ?? undefined,
      }),
    ],
    content: value,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
    editorProps: {
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (files?.length && files[0].type.startsWith('image/') && onImageUpload) {
          event.preventDefault();
          onImageUpload(files[0]).then((url) => {
            const { tr } = view.state;
            const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
            if (pos !== undefined) {
              const node = view.state.schema.nodes.image.create({ src: url });
              view.dispatch(tr.insert(pos, node));
            }
          });
          return true;
        }
        return false;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items || !onImageUpload) return false;
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) {
              onImageUpload(file).then((url) => {
                editor?.chain().focus().setImage({ src: url }).run();
              });
            }
            return true;
          }
        }
        return false;
      },
    },
  });

  // Update bubble menu element ref after mount
  useEffect(() => {
    if (editor && bubbleRef.current) {
      const bubbleExt = editor.extensionManager.extensions.find(
        (ext) => ext.name === 'bubbleMenu'
      );
      if (bubbleExt) {
        bubbleExt.options.element = bubbleRef.current;
      }
    }
  }, [editor]);

  if (!editor) return null;

  const addImage = async () => {
    if (!onImageUpload) {
      const url = prompt('URL de la imagen:');
      if (url) editor.chain().focus().setImage({ src: url }).run();
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        const url = await onImageUpload(file);
        editor.chain().focus().setImage({ src: url }).run();
      }
    };
    input.click();
  };

  const addYoutube = () => {
    const url = prompt('URL del video de YouTube:');
    if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const addCallout = (type: 'info' | 'warning' | 'error' | 'success') => {
    editor.chain().focus().insertContent({
      type: 'callout',
      attrs: { type },
      content: [{ type: 'paragraph' }],
    }).run();
  };

  const setLink = () => {
    const prev = editor.getAttributes('link').href;
    const url = prompt('URL del enlace:', prev || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  const Btn = ({ active, onClick, title, children }: {
    active?: boolean; onClick: () => void; title: string; children: React.ReactNode;
  }) => (
    <button
      type="button"
      className={`tiptap-btn ${active ? 'is-active' : ''}`}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );

  const s = 16;

  return (
    <div className="tiptap-wrapper">
      {/* Bubble Menu (positioned by TipTap extension) */}
      <div ref={bubbleRef} className="tiptap-bubble" style={{ visibility: 'hidden' }}>
        <Btn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Negrita"><Bold size={14} /></Btn>
        <Btn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Cursiva"><Italic size={14} /></Btn>
        <Btn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Tachado"><Strikethrough size={14} /></Btn>
        <Btn active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} title="Código"><Code size={14} /></Btn>
        <Btn active={editor.isActive('link')} onClick={setLink} title="Enlace"><LinkIcon size={14} /></Btn>
      </div>

      {/* Toolbar */}
      <div className="tiptap-toolbar">
        <div className="tiptap-toolbar__group">
          <Btn onClick={() => editor.chain().focus().undo().run()} title="Deshacer"><Undo size={s} /></Btn>
          <Btn onClick={() => editor.chain().focus().redo().run()} title="Rehacer"><Redo size={s} /></Btn>
        </div>

        <div className="tiptap-toolbar__group">
          <Btn active={editor.isActive('paragraph')} onClick={() => editor.chain().focus().setParagraph().run()} title="Párrafo"><Pilcrow size={s} /></Btn>
          <Btn active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="H1"><Heading1 size={s} /></Btn>
          <Btn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="H2"><Heading2 size={s} /></Btn>
          <Btn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="H3"><Heading3 size={s} /></Btn>
        </div>

        <div className="tiptap-toolbar__group">
          <Btn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Negrita"><Bold size={s} /></Btn>
          <Btn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Cursiva"><Italic size={s} /></Btn>
          <Btn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Tachado"><Strikethrough size={s} /></Btn>
          <Btn active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} title="Código inline"><Code size={s} /></Btn>
          <Btn active={editor.isActive('link')} onClick={setLink} title="Enlace"><LinkIcon size={s} /></Btn>
        </div>

        <div className="tiptap-toolbar__group">
          <Btn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Lista"><List size={s} /></Btn>
          <Btn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Lista numerada"><ListOrdered size={s} /></Btn>
          <Btn active={editor.isActive('taskList')} onClick={() => editor.chain().focus().toggleTaskList().run()} title="Checklist"><ListChecks size={s} /></Btn>
        </div>

        <div className="tiptap-toolbar__group">
          <Btn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Cita"><Quote size={s} /></Btn>
          <Btn active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Bloque de código"><CodeXml size={s} /></Btn>
          <Btn onClick={addImage} title="Imagen"><ImagePlus size={s} /></Btn>
          <Btn onClick={addYoutube} title="YouTube"><YoutubeIcon size={s} /></Btn>
          <Btn onClick={addTable} title="Tabla"><TableIcon size={s} /></Btn>
          <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Línea divisora"><Minus size={s} /></Btn>
        </div>

        <div className="tiptap-toolbar__group">
          <Btn onClick={() => addCallout('info')} title="Callout Info"><AlertCircle size={s} /></Btn>
        </div>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} className="tiptap-content" />
    </div>
  );
}
