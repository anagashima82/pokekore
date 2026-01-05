import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);

  const seriesCode = searchParams.get('series_code');
  const rarity = searchParams.get('rarity');

  let query = supabase
    .from('cards')
    .select('*')
    .order('series_code')
    .order('card_number');

  if (seriesCode) {
    query = query.eq('series_code', seriesCode);
  }

  if (rarity) {
    query = query.eq('rarity', rarity);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
