require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getBreakdown() {
  // ARカードをシリーズ毎に取得
  const { data: cards, error } = await supabase
    .from('cards')
    .select('id, series_code')
    .eq('rarity', 'AR');

  if (error) {
    console.error('Error:', error);
    return;
  }

  // 価格データを取得（ユニークなcard_id、全件取得）
  const { data: prices, error: priceError } = await supabase
    .from('card_prices')
    .select('card_id')
    .limit(10000);

  if (priceError) {
    console.error('Price Error:', priceError);
    return;
  }

  // card_idをユニークにする
  const priceCardIds = new Set(prices.map(p => p.card_id));

  // シリーズ毎に集計
  const stats = {};
  for (const card of cards) {
    if (!stats[card.series_code]) {
      stats[card.series_code] = { total: 0, withPrice: 0 };
    }
    stats[card.series_code].total++;
    if (priceCardIds.has(card.id)) {
      stats[card.series_code].withPrice++;
    }
  }

  // ソートして表示
  const sorted = Object.entries(stats).sort((a, b) => a[0].localeCompare(b[0]));

  console.log('シリーズ   | AR総数 | 価格取得 | 成功率');
  console.log('-----------|--------|----------|-------');

  let totalCards = 0;
  let totalWithPrice = 0;

  for (const [series, data] of sorted) {
    const rate = Math.round((data.withPrice / data.total) * 100);
    console.log(series.padEnd(10) + ' | ' + String(data.total).padStart(6) + ' | ' + String(data.withPrice).padStart(8) + ' | ' + rate + '%');
    totalCards += data.total;
    totalWithPrice += data.withPrice;
  }

  console.log('-----------|--------|----------|-------');
  console.log('合計       | ' + String(totalCards).padStart(6) + ' | ' + String(totalWithPrice).padStart(8) + ' | ' + Math.round((totalWithPrice / totalCards) * 100) + '%');
}

getBreakdown();
