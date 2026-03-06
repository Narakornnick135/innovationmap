import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">ไม่พบหน้าที่ต้องการ</h2>
        <p className="text-slate-500 mb-4">หน้าที่คุณค้นหาไม่มีอยู่ในระบบ</p>
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← กลับหน้าแผนที่
        </Link>
      </div>
    </div>
  );
}
