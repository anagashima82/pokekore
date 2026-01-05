import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getMockPrice } from '@/lib/price-scraper';

// Vercel Cronから呼び出されるエンドポイント
// vercel.jsonで設定: { "path": "/api/cron/fetch-prices", "schedule": "0 6 * * *" }

export async function GET(request: NextRequest) {
  // Cron認証（Vercel Cronは CRON_SECRET ヘッダーを送信）
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createServiceClient();

    // 全カードを取得
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('id, name, series_code, card_number');

    if (cardsError) {
      return NextResponse.json({ error: cardsError.message }, { status: 500 });
    }

    if (!cards || cards.length === 0) {
      return NextResponse.json({ message: 'No cards found' });
    }

    // 価格データを収集（現在はモックデータ）
    const priceRecords = (cards as { id: string; name: string; series_code: string; card_number: string }[]).map((card) => ({
      card_id: card.id,
      price: getMockPrice(card.id),
      source: 'mock', // 本番では 'cardrush' に変更
      fetched_at: new Date().toISOString(),
    }));

    // バッチインサート（500件ずつ）
    const batchSize = 500;
    let insertedCount = 0;

    for (let i = 0; i < priceRecords.length; i += batchSize) {
      const batch = priceRecords.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from('card_prices')
        .insert(batch as never[]);

      if (insertError) {
        console.error(`Batch insert error at ${i}:`, insertError);
        continue;
      }

      insertedCount += batch.length;
    }

    return NextResponse.json({
      success: true,
      message: `Fetched prices for ${insertedCount} cards`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POSTも許可（手動実行用）
export async function POST(request: NextRequest) {
  return GET(request);
}
