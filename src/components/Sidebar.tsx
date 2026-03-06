'use client';

import { useState, useMemo } from 'react';
import { Innovation, CATEGORIES, PROVINCES } from '@/types';
import Link from 'next/link';

interface SidebarProps {
  innovations: Innovation[];
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  onProvinceClick: (coord: [number, number], index: number) => void;
  activeProvinceIndex: number | null;
  onAddClick: () => void;
  user: { username: string; role: string } | null;
  onLogout: () => void;
  isEmbed?: boolean;
}

export default function Sidebar({
  innovations,
  activeCategory,
  onCategoryChange,
  onProvinceClick,
  activeProvinceIndex,
  onAddClick,
  user,
  onLogout,
  isEmbed = false,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(true);

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    innovations.forEach((i) => {
      counts[i.cat] = (counts[i.cat] || 0) + 1;
    });
    return counts;
  }, [innovations]);

  // Approximate province counts using nearest-center
  const provinceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    PROVINCES.forEach((p) => { counts[p.nameEn] = 0; });

    const items = activeCategory === 'all'
      ? innovations
      : innovations.filter((i) => i.cat === activeCategory);

    items.forEach((item) => {
      let minDist = Infinity;
      let nearest = '';
      PROVINCES.forEach((p) => {
        const dx = item.lng - p.coord[0];
        const dy = item.lat - p.coord[1];
        const dist = dx * dx + dy * dy;
        if (dist < minDist) {
          minDist = dist;
          nearest = p.nameEn;
        }
      });
      if (nearest) counts[nearest]++;
    });

    return counts;
  }, [innovations, activeCategory]);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="lg:hidden fixed top-4 left-4 z-30 bg-white shadow-lg rounded-xl px-3 py-2 text-sm font-medium text-slate-700 flex items-center gap-2 border border-slate-200"
      >
        {collapsed ? '☰' : '✕'} {collapsed ? `นวัตกรรม (${innovations.length})` : 'ปิด'}
      </button>

      {/* Sidebar - floating panel matching original design */}
      <aside
        className={`sidebar-panel fixed top-5 left-5 bottom-5 z-20 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl
          w-[360px] flex flex-col overflow-hidden transition-transform duration-300
          shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)]
          ${collapsed ? '-translate-x-[calc(100%+40px)]' : 'translate-x-0'}
          lg:translate-x-0
          max-lg:top-0 max-lg:left-0 max-lg:bottom-0 max-lg:rounded-none max-lg:w-[340px]`}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3 shrink-0">
          <h1 className="text-[21px] font-bold text-[#1E293B] leading-tight opacity-80 mb-2">
            กลุ่มนวัตกรรมเพื่อสังคม
          </h1>
          <p className="text-xs text-[#64748B] font-light leading-relaxed">
            adiCET — มหาวิทยาลัยราชภัฏเชียงใหม่
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              {innovations.length} นวัตกรรม
            </span>
            {user && (
              <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {user.username}
              </span>
            )}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto sidebar-scroll px-4 pb-2">
          {/* Category filters - list style matching original */}
          <div className="flex flex-col gap-[3px] mb-3">
            {/* "All" item */}
            <button
              onClick={() => onCategoryChange('all')}
              className="flex items-center gap-2 px-2.5 py-[5px] rounded-lg cursor-pointer transition-colors text-left w-full"
              style={{
                background: activeCategory === 'all' ? 'rgba(59,130,246,0.08)' : 'transparent',
              }}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: 'linear-gradient(135deg, #f97316, #3b82f6)' }}
              />
              <span className="flex-1 text-[17px] font-medium text-[#1E293B]">ทั้งหมด</span>
              <span className="text-[15px] text-[#94A3B8]">All</span>
              <span className="text-[17px] font-bold text-[#1E293B] pl-1">
                ({innovations.length})
              </span>
            </button>

            {/* Category items */}
            {Object.entries(CATEGORIES).map(([key, val]) => (
              <button
                key={key}
                onClick={() => onCategoryChange(activeCategory === key ? 'all' : key)}
                className="flex items-center gap-2 px-2.5 py-[5px] rounded-lg cursor-pointer transition-colors text-left w-full"
                style={{
                  background: activeCategory === key ? 'rgba(59,130,246,0.08)' : 'transparent',
                }}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: val.color }}
                />
                <span className="flex-1 text-[17px] font-medium text-[#1E293B]">{val.label}</span>
                <span className="text-[15px] text-[#94A3B8]">{val.labelEn}</span>
                <span className="text-[17px] font-bold text-[#1E293B] pl-1">
                  ({catCounts[key] || 0})
                </span>
              </button>
            ))}
          </div>

          {/* Province list */}
          <div className="border-t border-[#E2E8F0] pt-3">
            <h2 className="text-[0.85rem] font-semibold text-[#64748B] mb-3 pb-2 border-b border-[#E2E8F0] tracking-wider uppercase">
              จังหวัดทั้งหมด
            </h2>
            <div className="flex flex-col gap-[2px]">
              {PROVINCES.map((prov, index) => (
                <button
                  key={prov.nameEn}
                  onClick={() => onProvinceClick(prov.coord, index)}
                  className={`province-item flex items-center gap-2 px-2.5 py-[5px] rounded-lg cursor-pointer transition-all text-left w-full ${
                    activeProvinceIndex === index ? 'active' : ''
                  }`}
                >
                  <span className="flex-1 text-[17px] font-medium text-[#1E293B]">
                    {prov.name}
                  </span>
                  <span className="text-[15px] text-[#94A3B8]">{prov.nameEn}</span>
                  <span className="text-[17px] font-bold text-[#1E293B] pl-1">
                    ({provinceCounts[prov.nameEn] || 0})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        {!isEmbed && (
          <div className="p-4 border-t border-[#E2E8F0] space-y-2 shrink-0">
            {/* Share button */}
            <Link
              href="/share"
              className="w-full py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition flex items-center justify-center gap-2"
            >
              <span className="text-base">📤</span>
              แชร์ / ฝังแผนที่ (iframe)
            </Link>

            {user ? (
              <>
                <button
                  onClick={onAddClick}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition flex items-center justify-center gap-2"
                >
                  <span className="text-lg leading-none">+</span>
                  เพิ่มนวัตกรรมใหม่
                </button>
                <button
                  onClick={onLogout}
                  className="w-full py-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 text-xs font-medium transition"
                >
                  ออกจากระบบ ({user.username})
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold transition flex items-center justify-center gap-2"
              >
                เข้าสู่ระบบ (ผู้ดูแล)
              </Link>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
