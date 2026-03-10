'use client';

import { useEffect, useState } from 'react';
import { Innovation, CATEGORIES } from '@/types';

interface InnovationPanelProps {
  innovation: Innovation | null;
  onClose: () => void;
  user?: { username: string; role: string } | null;
  onUpdated?: () => void;
}

export default function InnovationPanel({ innovation, onClose, user, onUpdated }: InnovationPanelProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', innovator: '', desc: '', code: '', cat: '', lat: '', lng: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!innovation) {
      setEditing(false);
      return;
    }
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editing) setEditing(false);
        else onClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [innovation, onClose, editing]);

  useEffect(() => {
    if (innovation) {
      setForm({
        name: innovation.name,
        innovator: innovation.innovator || '',
        desc: innovation.desc,
        code: innovation.code,
        cat: innovation.cat,
        lat: String(innovation.lat),
        lng: String(innovation.lng),
      });
    }
  }, [innovation]);

  const style = innovation
    ? CATEGORIES[innovation.cat] || { color: '#64748b', icon: '', label: '', labelEn: '' }
    : null;

  const handleSave = async () => {
    if (!innovation) return;
    setSaving(true);
    try {
      const res = await fetch(`/innovationmap/api/innovations/${innovation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          innovator: form.innovator,
          desc: form.desc,
          code: form.code,
          cat: form.cat,
          lat: parseFloat(form.lat),
          lng: parseFloat(form.lng),
        }),
      });
      if (res.ok) {
        setEditing(false);
        onUpdated?.();
      }
    } finally {
      setSaving(false);
    }
  };

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
            {editing ? (
              /* Edit mode */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
                  <select
                    value={form.cat}
                    onChange={(e) => setForm({ ...form, cat: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    {Object.entries(CATEGORIES).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อนวัตกรรม</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อนวัตกร</label>
                  <input
                    type="text"
                    value={form.innovator}
                    onChange={(e) => setForm({ ...form, innovator: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
                  <textarea
                    value={form.desc}
                    onChange={(e) => setForm({ ...form, desc: e.target.value })}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">รหัสโครงการ</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ละติจูด</label>
                    <input
                      type="number"
                      step="any"
                      value={form.lat}
                      onChange={(e) => setForm({ ...form, lat: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ลองจิจูด</label>
                    <input
                      type="number"
                      step="any"
                      value={form.lng}
                      onChange={(e) => setForm({ ...form, lng: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold transition"
                  >
                    {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setForm({
                        name: innovation.name,
                        innovator: innovation.innovator || '',
                        desc: innovation.desc,
                        code: innovation.code,
                        cat: innovation.cat,
                        lat: String(innovation.lat),
                        lng: String(innovation.lng),
                      });
                    }}
                    className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium transition"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            ) : (
              /* View mode */
              <>
                {/* Category badge */}
                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] font-semibold mb-4"
                  style={{ backgroundColor: `${style.color}18`, color: style.color }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: style.color }}
                  />
                  {innovation.cat}
                </div>

                {/* Name */}
                <h2 className="text-[22px] font-bold text-gray-900 leading-[1.3] mb-2">
                  {innovation.name}
                </h2>

                {/* Innovator */}
                {innovation.innovator && (
                  <p className="text-[14px] text-gray-500 mb-3">
                    นวัตกร: {innovation.innovator}
                  </p>
                )}

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
                    {innovation.lat.toFixed(5)}, {innovation.lng.toFixed(5)}
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

                {/* Edit button for admin */}
                {user && (
                  <button
                    onClick={() => setEditing(true)}
                    className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition"
                  >
                    แก้ไขข้อมูล
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
