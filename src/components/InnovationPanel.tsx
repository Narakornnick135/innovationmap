'use client';

import { useEffect } from 'react';
import { Innovation, CATEGORIES } from '@/types';

interface InnovationPanelProps {
  innovation: Innovation | null;
  onClose: () => void;
}

export default function InnovationPanel({ innovation, onClose }: InnovationPanelProps) {
  useEffect(() => {
    if (!innovation) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [innovation, onClose]);

  const style = innovation
    ? CATEGORIES[innovation.cat] || { color: '#64748b', icon: '📌', label: '', labelEn: '' }
    : null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${
          innovation ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel - matches original: 50vw from right, mobile full width */}
      <div className={`innovation-panel ${innovation ? 'open' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-200 bg-[#fafafa] shrink-0">
          <span className="font-semibold text-gray-500 text-sm">รายละเอียดนวัตกรรม</span>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 text-lg transition"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        {innovation && style && (
          <div className="flex-1 overflow-y-auto px-7 py-7">
            {/* Category badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] font-semibold mb-4"
              style={{ backgroundColor: `${style.color}18`, color: style.color }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: style.color }}
              />
              {style.icon} {innovation.cat}
            </div>

            {/* Name */}
            <h2 className="text-[22px] font-bold text-gray-900 leading-[1.3] mb-3">
              {innovation.name}
            </h2>

            {/* Description */}
            <p className="text-[15px] text-gray-600 leading-[1.7] mb-5">
              {innovation.desc}
            </p>

            {/* Code */}
            <div className="text-xs text-gray-400 font-mono mb-6">
              รหัสโครงการ: {innovation.code}
            </div>

            <hr className="border-gray-200 mb-6" />

            {/* Coordinates */}
            <div className="mb-6">
              <div className="text-sm font-semibold text-gray-700 mb-2">พิกัด</div>
              <div className="text-sm text-gray-500 font-mono mb-3">
                📍 {innovation.lat.toFixed(5)}, {innovation.lng.toFixed(5)}
              </div>
              <a
                href={`https://www.google.com/maps?q=${innovation.lat},${innovation.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition"
                style={{ backgroundColor: `${style.color}15`, color: style.color }}
              >
                เปิดใน Google Maps ↗
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
