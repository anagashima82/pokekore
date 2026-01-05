import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { CardPrice } from '@/types';

// 最新価格一覧を取得（normal状態のみ）
export async function GET() {
  const supabase = await createClient();

  // latest_card_pricesビューからnormal状態のみ取得
  const { data, error } = await supabase
    .from('latest_card_prices')
    .select('*')
    .eq('condition', 'normal');

  if (error) {
    // ビューがない場合はcard_pricesテーブルから直接取得
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('card_prices')
      .select('*')
      .eq('condition', 'normal')
      .order('fetched_at', { ascending: false });

    if (fallbackError) {
      return NextResponse.json({ error: fallbackError.message }, { status: 500 });
    }

    // カードごとに最新の価格のみを返す
    const latestPrices = new Map<string, CardPrice>();
    for (const price of (fallbackData || []) as CardPrice[]) {
      if (!latestPrices.has(price.card_id)) {
        latestPrices.set(price.card_id, price);
      }
    }

    return NextResponse.json(Array.from(latestPrices.values()));
  }

  return NextResponse.json(data as CardPrice[]);
}
