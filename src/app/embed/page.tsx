'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Innovation } from '@/types';
import Sidebar from '@/components/Sidebar';
import InnovationPanel from '@/components/InnovationPanel';

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-50">
      <div className="text-slate-400 text-sm">กำลังโหลดแผนที่...</div>
    </div>
  ),
});

export default function EmbedPage() {
  const searchParams = useSearchParams();
  const [innovations, setInnovations] = useState<Innovation[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedInnovation, setSelectedInnovation] = useState<Innovation | null>(null);
  const [activeProvinceIndex, setActiveProvinceIndex] = useState<number | null>(null);
  const [flyToTarget, setFlyToTarget] = useState<{
    center: [number, number];
    zoom: number;
    pitch: number;
    key: number;
  } | null>(null);

  const catParam = searchParams.get('cat');
  const showSidebar = searchParams.get('bar') !== '0';

  useEffect(() => {
    fetch('/api/innovations')
      .then((res) => res.json())
      .then(setInnovations);
  }, []);

  useEffect(() => {
    if (catParam) setActiveCategory(catParam);
  }, [catParam]);

  const handleSelectInnovation = useCallback((i: Innovation) => {
    setSelectedInnovation(i);
    setActiveProvinceIndex(null);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedInnovation(null);
  }, []);

  const handleProvinceClick = useCallback(
    (coord: [number, number], index: number) => {
      setActiveProvinceIndex(index);
      setSelectedInnovation(null);
      setFlyToTarget({
        center: coord,
        zoom: 12,
        pitch: 65,
        key: Date.now(),
      });
    },
    [],
  );

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      {/* Map */}
      <div className="absolute inset-0">
        <MapView
          innovations={innovations}
          activeCategory={activeCategory}
          selectedId={selectedInnovation?.id ?? null}
          onSelectInnovation={handleSelectInnovation}
          flyToTarget={flyToTarget}
        />
      </div>

      {/* Sidebar (same as main but without share/login/add) */}
      {showSidebar && (
        <Sidebar
          innovations={innovations}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          onProvinceClick={handleProvinceClick}
          activeProvinceIndex={activeProvinceIndex}
          onAddClick={() => {}}
          user={null}
          onLogout={() => {}}
          isEmbed
        />
      )}

      {/* Innovation detail side panel */}
      <InnovationPanel
        innovation={selectedInnovation}
        onClose={handleClosePanel}
      />
    </div>
  );
}
