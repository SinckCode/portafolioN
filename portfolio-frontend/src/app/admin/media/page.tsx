'use client';

import { useState, useRef } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface UploadedFile {
  url: string;
  filename: string;
}

export default function AdminMedia() {
  const { accessToken } = useAuth();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(fileList: FileList) {
    setUploading(true);

    for (const file of Array.from(fileList)) {
      try {
        const data = await api.uploadFile(file, accessToken!) as any;
        setFiles(prev => [...prev, { url: data.url, filename: file.name }]);
      } catch { /* empty */ }
    }
    setUploading(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files);
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
  }

  return (
    <div>
      <h1 className="admin-page__title mb-6">Media</h1>

      <div
        onDragOver={e => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`admin-card border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors mb-6 ${
          dragActive ? 'border-[#00b4d8] bg-[#00b4d8]/5' : 'border-[#2a2d35] hover:border-[#00b4d8]/50'
        }`}
      >
        <svg className="w-12 h-12 text-[#2a2d35] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="admin-form__label">{uploading ? 'Subiendo...' : 'Arrastra archivos aqui o haz clic para seleccionar'}</p>
        <p className="admin-form__label mt-1">JPG, PNG, WebP, GIF, MP4 - Max 10MB</p>
        <input ref={inputRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={e => e.target.files && handleUpload(e.target.files)} />
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {files.map((f, i) => (
            <div key={i} className="admin-card rounded-lg overflow-hidden group">
              <div className="aspect-square glass-card flex items-center justify-center">
                <img src={f.url} alt={f.filename} className="w-full h-full object-cover" />
              </div>
              <div className="p-2">
                <p className="text-xs truncate">{f.filename}</p>
                <button onClick={() => copyUrl(f.url)} className="btn btn--primary text-xs mt-1">Copiar URL</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {files.length === 0 && !uploading && (
        <div className="admin-card rounded-xl p-8 text-center">
          <p className="admin-form__label">No hay archivos subidos en esta sesion</p>
        </div>
      )}
    </div>
  );
}
