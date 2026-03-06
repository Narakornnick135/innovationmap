import { NextRequest, NextResponse } from 'next/server';
import { getInnovations, addInnovation } from '@/lib/data';
import { getSession } from '@/lib/auth';

export async function GET() {
  const innovations = getInnovations();
  return NextResponse.json(innovations);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อน' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { code, cat, name, desc, lat, lng } = body;

    if (!code || !cat || !name || !desc || lat == null || lng == null) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบ' }, { status: 400 });
    }

    const newItem = addInnovation({ code, cat, name, desc, lat: Number(lat), lng: Number(lng) });
    return NextResponse.json(newItem, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
  }
}
