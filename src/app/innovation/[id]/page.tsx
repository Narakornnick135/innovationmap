import { getInnovationById } from '@/lib/data';
import { CATEGORIES } from '@/types';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function InnovationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const innovation = getInnovationById(Number(id));

  if (!innovation) notFound();

  const style = CATEGORIES[innovation.cat] || { color: '#64748b', icon: '📌', label: '' };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header
        className="relative px-6 py-12 text-center"
        style={{ background: `linear-gradient(135deg, ${style.color}, ${style.color}cc)` }}
      >
        <Link
          href="/"
          className="absolute top-4 left-4 text-white/70 hover:text-white text-sm flex items-center gap-1 transition"
        >
          ← กลับแผนที่
        </Link>

        <div className="inline-block bg-white/20 text-white text-xs font-mono px-3 py-1 rounded-full mb-4 tracking-wider">
          {innovation.code}
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-white max-w-2xl mx-auto leading-tight">
          {innovation.name}
        </h1>

        <div className="mt-4 inline-flex items-center gap-2 bg-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg"
          style={{ color: style.color }}
        >
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: style.color }} />
          {style.icon} {innovation.cat}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
            <span className="text-xl">📋</span> รายละเอียด
          </h2>
          <p className="text-slate-600 leading-relaxed">{innovation.desc}</p>
        </section>

        <hr className="border-slate-200" />

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
            <span className="text-xl">📍</span> พิกัด
          </h2>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-mono text-slate-500 text-sm">
              {innovation.lat.toFixed(5)}, {innovation.lng.toFixed(5)}
            </span>
            <a
              href={`https://www.google.com/maps?q=${innovation.lat},${innovation.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium px-4 py-2 rounded-lg transition"
              style={{ backgroundColor: `${style.color}15`, color: style.color }}
            >
              เปิดใน Google Maps →
            </a>
          </div>
        </section>

        <hr className="border-slate-200" />

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
            <span className="text-xl">{style.icon}</span> กลุ่มนวัตกรรม
          </h2>
          <div className="inline-flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-200">
            <span className="text-3xl">{style.icon}</span>
            <div>
              <div className="font-semibold text-slate-800">{innovation.cat}</div>
              <div className="text-xs text-slate-400">รหัส {innovation.code}</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
