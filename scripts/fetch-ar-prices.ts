/**
 * ARカードの価格を一括取得するスクリプト
 *
 * 使用方法:
 * npx ts-node --transpile-only scripts/fetch-ar-prices.ts
 *
 * または環境変数を指定して:
 * SUPABASE_URL=xxx SUPABASE_SERVICE_KEY=xxx npx ts-node --transpile-only scripts/fetch-ar-prices.ts
 */

import { createClient } from '@supabase/supabase-js';

// カードラッシュのベースURL
const CARDRUSH_BASE_URL = 'https://www.cardrush-pokemon.jp';

// スクレイピング間の遅延（ミリ秒）
const SCRAPE_DELAY_MS = 500;

// シリーズごとのノーマルカード総枚数
// カードラッシュの検索形式: 【AR】{079/078} の「/078」部分に使用
const SERIES_TOTAL_CARDS: Record<string, number | string> = {
  'sv1s': 78,
  'sv1v': 78,
  'sv1a': 73,
  'sv2d': 71,
  'sv2p': 71,
  'sv2a': 165,
  'sv3': 62,
  'sv3a': 62,
  'sv4k': 66,
  'sv4m': 66,
  'sv4a': 190,
  'sv5k': 71,
  'sv5m': 71,
  'sv5a': 66,
  'sv6': 64,
  'sv6a': 64,
  'sv7': 64,
  'sv7a': 70,
  'sv8': 106,
  'sv8a': 90,
  'promo': 'SV-P',
};

// Supabase設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('環境変数が設定されていません:');
  console.error('NEXT_PUBLIC_SUPABASE_URL または SUPABASE_URL');
  console.error('SUPABASE_SERVICE_ROLE_KEY または SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ScrapedPrice {
  cardNumber: string;
  seriesCode: string;
  price: number | null;
  condition: string;
  source: string;
}

interface ScrapedPriceResult {
  cardNumber: string;
  seriesCode: string;
  prices: ScrapedPrice[];
}

async function scrapeCardRushPrice(
  seriesCode: string,
  cardNumber: string,
  rarity?: string
): Promise<ScrapedPriceResult | null> {
  try {
    // カード番号を3桁に0埋め（例: 79 → 079）
    const paddedCardNumber = cardNumber.padStart(3, '0');
    // シリーズコードを大文字に変換（例: sv1s → SV1S）
    const upperSeriesCode = seriesCode.toUpperCase();
    const lowerSeriesCode = seriesCode.toLowerCase();

    // シリーズの総枚数を取得
    const totalCards = SERIES_TOTAL_CARDS[lowerSeriesCode];

    // 検索クエリを作成
    // 形式: 【AR】{079/078} [SV1S] または 【AR】{232/SV-P}（プロモ）
    let searchQuery: string;
    if (upperSeriesCode === 'PROMO' || totalCards === 'SV-P') {
      // プロモカード: 【AR】{232/SV-P}
      searchQuery = rarity ? `【${rarity}】{${paddedCardNumber}/SV-P}` : `{${paddedCardNumber}/SV-P}`;
    } else if (totalCards !== undefined && rarity) {
      // 通常シリーズ: 【AR】{079/078} [SV1S]
      const paddedTotal = String(totalCards).padStart(3, '0');
      searchQuery = `【${rarity}】{${paddedCardNumber}/${paddedTotal}} [${upperSeriesCode}]`;
    } else if (totalCards !== undefined) {
      // レアリティなし: {079/078} [SV1S]
      const paddedTotal = String(totalCards).padStart(3, '0');
      searchQuery = `{${paddedCardNumber}/${paddedTotal}} [${upperSeriesCode}]`;
    } else if (rarity) {
      // 未知のシリーズ（レアリティあり）: 旧形式
      searchQuery = `【${rarity}】{${paddedCardNumber}} [${upperSeriesCode}]`;
    } else {
      // 未知のシリーズ（レアリティなし）: 旧形式
      searchQuery = `{${paddedCardNumber}} [${upperSeriesCode}]`;
    }

    const searchUrl = `${CARDRUSH_BASE_URL}/product-list?keyword=${encodeURIComponent(searchQuery)}`;

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ja,en;q=0.9',
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();

    const numWithoutLeadingZeros = cardNumber.replace(/^0+/, '') || '0';
    const cardNumberPattern = new RegExp(`\\{0*${numWithoutLeadingZeros}/\\d+\\}`, 'i');

    if (!cardNumberPattern.test(html)) {
      return { cardNumber, seriesCode, prices: [] };
    }

    const prices: ScrapedPrice[] = [];
    const goodsNameRegex = /<span class="goods_name">([\s\S]*?)<\/span><\/span>/g;
    // 価格にはカンマが含まれる場合がある（例: 2,180円）
    const priceRegex = /<span class="figure">([\d,]+)円<\/span>/g;

    const goodsNames: string[] = [];
    const priceValues: number[] = [];

    let match;
    while ((match = goodsNameRegex.exec(html)) !== null) {
      const plainText = match[1].replace(/<[^>]*>/g, '');
      goodsNames.push(plainText);
    }

    while ((match = priceRegex.exec(html)) !== null) {
      // カンマを除去して数値に変換
      priceValues.push(parseInt(match[1].replace(/,/g, ''), 10));
    }

    const minLength = Math.min(goodsNames.length, priceValues.length);
    for (let i = 0; i < minLength; i++) {
      const goodsName = goodsNames[i];
      const price = priceValues[i];

      if (!cardNumberPattern.test(goodsName)) {
        continue;
      }

      const conditionMatch = goodsName.match(/〔状態([^〕]+)〕/);
      const condition = conditionMatch ? conditionMatch[1] : 'normal';

      prices.push({
        cardNumber,
        seriesCode,
        price,
        condition,
        source: 'cardrush',
      });
    }

    return { cardNumber, seriesCode, prices };
  } catch (error) {
    console.error(`Error scraping ${seriesCode} ${cardNumber}:`, error);
    return null;
  }
}

async function main() {
  console.log('ARカードの価格取得を開始します...\n');

  // ARカードを取得
  const { data: cards, error: cardsError } = await supabase
    .from('cards')
    .select('id, name, series_code, card_number, rarity')
    .eq('rarity', 'AR');

  if (cardsError) {
    console.error('カード取得エラー:', cardsError);
    process.exit(1);
  }

  if (!cards || cards.length === 0) {
    console.log('ARカードが見つかりませんでした');
    process.exit(0);
  }

  console.log(`ARカード: ${cards.length}枚\n`);

  const today = new Date().toISOString().split('T')[0];
  const priceRecords: { card_id: string; price: number; condition: string; source: string; fetched_at: string; fetched_date: string }[] = [];
  let successCount = 0;
  let failCount = 0;
  let totalPrices = 0;

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const progress = `[${i + 1}/${cards.length}]`;

    const result = await scrapeCardRushPrice(card.series_code, card.card_number, card.rarity);

    if (result && result.prices.length > 0) {
      for (const priceData of result.prices) {
        priceRecords.push({
          card_id: card.id,
          price: priceData.price!,
          condition: priceData.condition,
          source: 'cardrush',
          fetched_at: new Date().toISOString(),
          fetched_date: today,
        });
        totalPrices++;
      }
      successCount++;
      console.log(`${progress} ✓ ${card.name} - ${result.prices.length}件の価格`);
    } else {
      failCount++;
      console.log(`${progress} ✗ ${card.name} - 価格なし`);
    }

    // レート制限
    await new Promise(resolve => setTimeout(resolve, SCRAPE_DELAY_MS));
  }

  console.log('\n--- 結果 ---');
  console.log(`成功: ${successCount}枚`);
  console.log(`失敗: ${failCount}枚`);
  console.log(`価格レコード: ${totalPrices}件`);

  if (priceRecords.length === 0) {
    console.log('\n保存する価格データがありません');
    process.exit(0);
  }

  // 今日のARカードの価格を削除
  const cardIds = [...new Set(priceRecords.map(r => r.card_id))];
  console.log(`\n既存データを削除中...`);

  const { error: deleteError } = await supabase
    .from('card_prices')
    .delete()
    .eq('fetched_date', today)
    .in('card_id', cardIds);

  if (deleteError) {
    console.error('削除エラー:', deleteError);
  }

  // バッチインサート
  console.log(`価格データを保存中...`);
  const batchSize = 500;
  let insertedCount = 0;

  for (let i = 0; i < priceRecords.length; i += batchSize) {
    const batch = priceRecords.slice(i, i + batchSize);
    const { error: insertError } = await supabase
      .from('card_prices')
      .insert(batch);

    if (insertError) {
      console.error(`バッチ ${i} インサートエラー:`, insertError);
      continue;
    }

    insertedCount += batch.length;
  }

  console.log(`\n保存完了: ${insertedCount}件`);
}

main().catch(console.error);
