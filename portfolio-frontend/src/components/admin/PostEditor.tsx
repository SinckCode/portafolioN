'use client';

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { commands, type ICommand, type TextAreaTextApi } from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

// Editor visual de markdown (toolbar tipo Word + preview en vivo).
// El comando de imagen sube el archivo al API e inserta el markdown.

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/api$/, '');

interface PostEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: number;
}

export default function PostEditor({ value, onChange, height = 420 }: PostEditorProps) {
  const { accessToken } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textApiRef = useRef<TextAreaTextApi | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !accessToken) return;

    const textApi = textApiRef.current;
    try {
      const { url } = (await api.uploadFile(file, accessToken)) as { url: string };
      const absolute = url.startsWith('/uploads') ? `${API_ORIGIN}${url}` : url;
      const markdown = `\n![${file.name.replace(/\.[^.]+$/, '')}](${absolute})\n`;
      if (textApi) {
        textApi.replaceSelection(markdown);
      } else {
        onChange(`${value}${markdown}`);
      }
    } catch {
      alert('No se pudo subir la imagen');
    }
  };

  // Comando custom: abre el file picker y recuerda dónde insertar
  const imageUpload: ICommand = {
    name: 'upload-image',
    keyCommand: 'upload-image',
    buttonProps: { 'aria-label': 'Subir imagen', title: 'Subir imagen' },
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    execute: (_state, textApi) => {
      textApiRef.current = textApi;
      fileInputRef.current?.click();
    },
  };

  return (
    <div className="post-editor" data-color-mode="dark">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />
      <MDEditor
        value={value}
        onChange={(v) => onChange(v || '')}
        height={height}
        preview="live"
        commands={[
          commands.bold,
          commands.italic,
          commands.strikethrough,
          commands.divider,
          commands.title2,
          commands.title3,
          commands.divider,
          commands.link,
          commands.quote,
          commands.code,
          commands.codeBlock,
          imageUpload,
          commands.divider,
          commands.unorderedListCommand,
          commands.orderedListCommand,
          commands.checkedListCommand,
        ]}
      />
    </div>
  );
}
