'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Project } from '@/types';

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const allMedia: { type: 'image' | 'video'; src: string }[] = [];
  if (project.video) allMedia.push({ type: 'video', src: project.video });
  if (project.videos) project.videos.forEach((v) => allMedia.push({ type: 'video', src: v }));
  project.images.forEach((img) => allMedia.push({ type: 'image', src: img }));

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const activeMedia = allMedia[activeMediaIndex] || null;

  return (
    <div onClick={onClose} className="modal">
      <div className="modal__backdrop" />
      <div onClick={(e) => e.stopPropagation()} className="modal__container">
        <button onClick={onClose} className="modal__close">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        <div className="modal__body">
          <h2 className="modal__title">{project.title}</h2>

          {activeMedia && (
            <div style={{ marginBottom: '16px' }}>
              <div className="media-gallery__main">
                {activeMedia.type === 'video' ? (
                  <video src={activeMedia.src} controls style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <Image src={activeMedia.src} alt={project.title} fill className="object-contain" sizes="(max-width: 896px) 100vw, 896px" />
                )}
              </div>

              {allMedia.length > 1 && (
                <div className="media-gallery__thumbs">
                  {allMedia.map((media, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveMediaIndex(idx)}
                      className={`media-gallery__thumb ${idx === activeMediaIndex ? 'media-gallery__thumb--active' : ''}`}
                    >
                      {media.type === 'video' ? (
                        <div style={{ width: '100%', height: '100%', background: '#252b2d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#4cd6fb">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        </div>
                      ) : (
                        <Image src={media.src} alt="" fill className="object-cover" sizes="80px" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
            {project.demo && (
              <a href={project.demo} target="_blank" rel="noopener noreferrer" className="action-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Demo
              </a>
            )}
            {project.demos?.map((d, i) => (
              <a key={i} href={d} target="_blank" rel="noopener noreferrer" className="action-link">Demo {i + 1}</a>
            ))}
            {project.repos.frontend && (
              <a href={project.repos.frontend} target="_blank" rel="noopener noreferrer" className="action-link">Frontend</a>
            )}
            {project.repos.backend && (
              <a href={project.repos.backend} target="_blank" rel="noopener noreferrer" className="action-link">Backend</a>
            )}
            {project.repos.hardware && (
              <a href={project.repos.hardware} target="_blank" rel="noopener noreferrer" className="action-link">Hardware</a>
            )}
            {project.repos.deploy && (
              <a href={project.repos.deploy} target="_blank" rel="noopener noreferrer" className="action-link">Deploy</a>
            )}
          </div>

          <p style={{ color: '#dee3e6', lineHeight: 1.6, marginBottom: '24px' }}>{project.details}</p>

          {project.credentials && (
            <div className="credentials-box">
              <p className="credentials-box__label">Credenciales de prueba:</p>
              <p className="credentials-box__value">
                Email: {project.credentials.email} | Password: {project.credentials.password}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {project.technologies.map((tech) => (
              <span key={tech} className="chip chip--primary">{tech}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
