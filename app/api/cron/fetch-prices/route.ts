import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { scrapeCardRushPrice, getMockPrice } from '@/lib/price-scraper';

// Vercel Cronから呼び出されるエンドポイント
// vercel.jsonで設定: { "path": "/api/cron/fetch-prices", "schedule": "0 6 * * *" }

// スクレイピング間の遅延（ミリ秒）- サーバー負荷軽減のため
const SCRAPE_DELAY_MS = 500;

// モードを環境変数で切り替え（'scrape' | 'mock'）
const PRICE_MODE = process.env.PRICE_MODE || 'scrape';

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

    const typedCards = cards as { id: string; name: string; series_code: string; card_number: string }[];
    const priceRecords: { card_id: string; price: number; source: string; fetched_at: string }[] = [];
    let scrapedCount = 0;
    let failedCount = 0;

    if (PRICE_MODE === 'scrape') {
      // 実際のスクレイピング
      for (const card of typedCards) {
        const result = await scrapeCardRushPrice(card.series_code, card.card_number);

        if (result && result.price !== null) {
          priceRecords.push({
            card_id: card.id,
            price: result.price,
            source: 'cardrush',
            fetched_at: new Date().toISOString(),
          });
          scrapedCount++;
        } else {
          failedCount++;
        }

        // レート制限：リクエスト間に遅延を入れる
        await new Promise((resolve) => setTimeout(resolve, SCRAPE_DELAY_MS));
      }
    } else {
      // モックモード
      for (const card of typedCards) {
        priceRecords.push({
          card_id: card.id,
          price: getMockPrice(card.id),
          source: 'mock',
          fetched_at: new Date().toISOString(),
        });
      }
      scrapedCount = typedCards.length;
    }

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
      mode: PRICE_MODE,
      message: `Fetched prices for ${insertedCount} cards (scraped: ${scrapedCount}, failed: ${failedCount})`,
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
