import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { CardPrice } from '@/types';

// 全カードの全状態の最新価格を取得
export async function GET() {
  const supabase = await createClient();

  // latest_card_pricesビューから全データを取得
  const { data, error } = await supabase
    .from('latest_card_prices')
    .select('*')
    .order('card_id')
    .order('condition');

  if (error) {
    // ビューがない場合はcard_pricesテーブルから直接取得
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('card_prices')
      .select('*')
      .order('fetched_at', { ascending: false });

    if (fallbackError) {
      return NextResponse.json({ error: fallbackError.message }, { status: 500 });
    }

    // カード・状態ごとに最新の価格のみを返す
    const latestPrices = new Map<string, CardPrice>();
    for (const price of (fallbackData || []) as CardPrice[]) {
      const key = `${price.card_id}-${price.condition}`;
      if (!latestPrices.has(key)) {
        latestPrices.set(key, price);
      }
    }

    return NextResponse.json(Array.from(latestPrices.values()));
  }

  return NextResponse.json(data as CardPrice[]);
}
