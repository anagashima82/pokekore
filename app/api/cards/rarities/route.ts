import { NextResponse } from 'next/server';
import { RARITY_CHOICES } from '@/lib/constants';

export async function GET() {
  return NextResponse.json(RARITY_CHOICES);
}
