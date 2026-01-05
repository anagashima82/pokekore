import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('cards')
    .select('series_code')
    .order('series_code');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 重複を除去してシリーズコードのみの配列を返す
  const uniqueSeries = [...new Set((data as { series_code: string }[]).map((d) => d.series_code))];

  return NextResponse.json(uniqueSeries);
}
