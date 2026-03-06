import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const USERS_PATH = path.join(process.cwd(), 'src', 'data', 'users.json');
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'adicet-innovation-map-secret-key-2024');
const COOKIE_NAME = 'auth-token';

interface User {
  username: string;
  password: string;
  role: string;
}

function getUsers(): User[] {
  const raw = fs.readFileSync(USERS_PATH, 'utf-8');
  return JSON.parse(raw);
}

export async function authenticate(username: string, password: string): Promise<{ success: boolean; error?: string }> {
  const users = getUsers();
  const user = users.find((u) => u.username === username);
  if (!user) return { success: false, error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' };

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return { success: false, error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' };

  const token = await new SignJWT({ username: user.username, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return { success: true };
}

export async function getSession(): Promise<{ username: string; role: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    return { username: payload.username as string, role: payload.role as string };
  } catch {
    return null;
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
