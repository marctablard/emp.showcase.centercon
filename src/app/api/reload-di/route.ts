import { NextResponse } from 'next/server';
import { register } from '@/instrumentation';

export async function POST() {
  register();
  return NextResponse.json({ status: 'ok', reloaded: true });
}
