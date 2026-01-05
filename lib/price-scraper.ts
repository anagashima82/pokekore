/**
 * カードラッシュからポケモンカードの価格を取得するスクレイパー
 *
 * 注意: スクレイピングは対象サイトの利用規約に従って行ってください。
 * 過度なリクエストは避け、適切な間隔を空けてください。
 */

interface ScrapedPrice {
  cardNumber: string;
  seriesCode: string;
  price: number | null;
  source: string;
}

// カードラッシュの検索URL
const CARDRUSH_BASE_URL = 'https://www.cardrush-pokemon.jp';

/**
 * カード名からカードラッシュで検索して価格を取得
 */
export async function scrapeCardRushPrice(
  cardName: string,
  seriesCode: string,
  cardNumber: string
): Promise<ScrapedPrice | null> {
  try {
    // 検索クエリを作成（カード名 + シリーズコード + カード番号）
    const searchQuery = `${cardName} ${seriesCode} ${cardNumber}`;
    const searchUrl = `${CARDRUSH_BASE_URL}/product-list?keyword=${encodeURIComponent(searchQuery)}`;

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PokekoreBot/1.0)',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch from CardRush: ${response.status}`);
      return null;
    }

    const html = await response.text();

    // 価格を抽出（簡易的な正規表現パターン）
    // 実際のHTMLストラクチャに合わせて調整が必要
    const priceMatch = html.match(/¥([0-9,]+)/);

    if (priceMatch) {
      const price = parseInt(priceMatch[1].replace(/,/g, ''), 10);
      return {
        cardNumber,
        seriesCode,
        price,
        source: 'cardrush',
      };
    }

    return {
      cardNumber,
      seriesCode,
      price: null,
      source: 'cardrush',
    };
  } catch (error) {
    console.error('Error scraping CardRush:', error);
    return null;
  }
}

/**
 * 複数カードの価格を取得（レート制限対応）
 */
export async function scrapeMultipleCards(
  cards: { id: string; name: string; seriesCode: string; cardNumber: string }[],
  delayMs: number = 1000
): Promise<Map<string, number | null>> {
  const results = new Map<string, number | null>();

  for (const card of cards) {
    const result = await scrapeCardRushPrice(
      card.name,
      card.seriesCode,
      card.cardNumber
    );

    if (result) {
      results.set(card.id, result.price);
    }

    // レート制限：リクエスト間に遅延を入れる
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  return results;
}

/**
 * モックデータを返す（開発・テスト用）
 * 実際のスクレイピングが許可されるまでの仮実装
 */
export function getMockPrice(cardId: string): number {
  // カードIDを基にした擬似的な価格生成
  const hash = cardId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // 100円〜50000円の範囲でランダム風の価格を生成
  const basePrice = (hash % 500) * 100;
  return Math.max(100, basePrice);
}
