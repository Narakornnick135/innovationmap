'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Innovation } from '@/types';
import Sidebar from '@/components/Sidebar';
import InnovationPanel from '@/components/InnovationPanel';
import AddInnovationModal from '@/components/AddInnovationModal';

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100">
      <div className="text-slate-400 text-sm">กำลังโหลดแผนที่...</div>
    </div>
  ),
});

export default function Home() {
  const [innovations, setInnovations] = useState<Innovation[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedInnovation, setSelectedInnovation] = useState<Innovation | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [activeProvinceIndex, setActiveProvinceIndex] = useState<number | null>(null);
  const [flyToTarget, setFlyToTarget] = useState<{
    center: [number, number];
    zoom: number;
    pitch: number;
    key: number;
  } | null>(null);

  const fetchData = useCallback(async () => {
    const res = await fetch('/innovationmap/api/innovations');
    const data = await res.json();
    setInnovations(data);
  }, []);

  const fetchUser = useCallback(async () => {
    const res = await fetch('/innovationmap/api/auth/me');
    const data = await res.json();
    setUser(data.user);
  }, []);

  useEffect(() => {
    fetchData();
    fetchUser();
  }, [fetchData, fetchUser]);

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

  const handleResetView = useCallback(() => {
    setSelectedInnovation(null);
    setActiveProvinceIndex(null);
    setFlyToTarget({
      center: [99.3, 18.35],
      zoom: 6.3,
      pitch: 0,
      key: Date.now(),
    });
  }, []);

  const handleLogout = async () => {
    await fetch('/innovationmap/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  return (
    <main className="h-screen w-screen overflow-hidden relative">
      {/* Map fills entire screen */}
      <div className="absolute inset-0">
        <MapView
          innovations={innovations}
          activeCategory={activeCategory}
          selectedId={selectedInnovation?.id ?? null}
          onSelectInnovation={handleSelectInnovation}
          flyToTarget={flyToTarget}
        />
      </div>

      {/* Sidebar */}
      <Sidebar
        innovations={innovations}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        onProvinceClick={handleProvinceClick}
        activeProvinceIndex={activeProvinceIndex}
        onAddClick={() => setShowAddModal(true)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Innovation detail side panel (slides from right) */}
      <InnovationPanel
        innovation={selectedInnovation}
        onClose={handleClosePanel}
        user={user}
        onUpdated={fetchData}
      />

      {/* Reset view button */}
      <button
        onClick={handleResetView}
        className="reset-btn fixed bottom-10 left-1/2 -translate-x-1/2 z-10
          bg-white/90 backdrop-blur-md border border-slate-200
          rounded-full px-6 py-2.5 text-sm font-medium text-slate-600
          shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)]
          hover:-translate-y-0.5 transition-all cursor-pointer
          flex items-center gap-2"
      >
        มุมมองภาพรวม
      </button>

      {/* Add innovation modal (only when logged in) */}
      {showAddModal && user && (
        <AddInnovationModal
          onClose={() => setShowAddModal(false)}
          onAdded={fetchData}
        />
      )}
    </main>
  );
}
