import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { CardPrice } from '@/types';

// 特定カードの全状態の価格を取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const { cardId } = await params;
  const supabase = await createClient();

  // latest_card_pricesビューから該当カードの全状態を取得
  const { data, error } = await supabase
    .from('latest_card_prices')
    .select('*')
    .eq('card_id', cardId)
    .order('condition');

  if (error) {
    // ビューがない場合はcard_pricesテーブルから直接取得
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('card_prices')
      .select('*')
      .eq('card_id', cardId)
      .order('fetched_at', { ascending: false });

    if (fallbackError) {
      return NextResponse.json({ error: fallbackError.message }, { status: 500 });
    }

    // 状態ごとに最新の価格のみを返す
    const latestPrices = new Map<string, CardPrice>();
    for (const price of (fallbackData || []) as CardPrice[]) {
      if (!latestPrices.has(price.condition)) {
        latestPrices.set(price.condition, price);
      }
    }

    return NextResponse.json(Array.from(latestPrices.values()));
  }

  return NextResponse.json(data as CardPrice[]);
}
