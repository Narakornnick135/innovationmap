'use client';

import { useState } from 'react';
import { CATEGORIES } from '@/types';
import Link from 'next/link';

export default function SharePage() {
  const [selectedCat, setSelectedCat] = useState('all');
  const [showBar, setShowBar] = useState(true);
  const [width, setWidth] = useState('100%');
  const [height, setHeight] = useState('500');
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const params = new URLSearchParams();
  if (selectedCat !== 'all') params.set('cat', selectedCat);
  if (!showBar) params.set('bar', '0');
  const queryString = params.toString();
  const embedUrl = `${baseUrl}/embed${queryString ? '?' + queryString : ''}`;

  const iframeCode = `<iframe src="${embedUrl}" width="${width}" height="${height}px" frameborder="0" style="border:1px solid #e2e8f0;border-radius:12px;" allowfullscreen></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(iframeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-800">แชร์แผนที่นวัตกรรม</h1>
            <p className="text-xs text-slate-400">สร้างโค้ด iframe เพื่อนำแผนที่ไปแสดงในเว็บอื่น</p>
          </div>
          <Link
            href="/"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            ← กลับแผนที่
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 grid lg:grid-cols-2 gap-8">
        {/* Settings */}
        <div className="space-y-6">
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="font-semibold text-slate-800 mb-4">ตั้งค่าแผนที่</h2>

            {/* Category filter */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-600 mb-2">กลุ่มนวัตกรรมที่แสดง</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCat('all')}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition
                    ${selectedCat === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}
                >
                  ทั้งหมด
                </button>
                {Object.entries(CATEGORIES).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCat(key)}
                    className="text-xs px-3 py-1.5 rounded-full font-medium transition flex items-center gap-1"
                    style={
                      selectedCat === key
                        ? { backgroundColor: val.color, color: 'white' }
                        : { backgroundColor: `${val.color}12`, color: val.color }
                    }
                  >
                    {val.icon} {val.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Show bar toggle */}
            <div className="mb-5">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBar}
                  onChange={(e) => setShowBar(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-200"
                />
                <span className="text-sm text-slate-700">แสดงแถบเลือกกลุ่มนวัตกรรม</span>
              </label>
            </div>

            {/* Size */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">ความกว้าง</label>
                <input
                  type="text"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">ความสูง (px)</label>
                <input
                  type="text"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 font-mono"
                />
              </div>
            </div>
          </section>

          {/* Code output */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-slate-800">โค้ด iframe</h2>
              <button
                onClick={handleCopy}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                  copied
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copied ? 'คัดลอกแล้ว!' : 'คัดลอกโค้ด'}
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-300 text-xs p-4 rounded-xl overflow-x-auto leading-relaxed">
              <code>{iframeCode}</code>
            </pre>

            <div className="mt-3">
              <a
                href={embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:underline"
              >
                เปิด URL ตรงๆ ↗
              </a>
            </div>
          </section>
        </div>

        {/* Preview */}
        <div>
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 sticky top-6">
            <h2 className="font-semibold text-slate-800 mb-3">ตัวอย่าง</h2>
            <div
              className="rounded-xl overflow-hidden border border-slate-200"
              style={{ height: `${Math.min(parseInt(height) || 500, 600)}px` }}
            >
              <iframe
                src={embedUrl}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
