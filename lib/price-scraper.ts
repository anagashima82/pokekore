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
 * カードラッシュで検索して価格を取得
 * 検索クエリ: "シリーズコード カード番号" (例: "SV7a 001")
 */
export async function scrapeCardRushPrice(
  seriesCode: string,
  cardNumber: string
): Promise<ScrapedPrice | null> {
  try {
    // 検索クエリを作成（シリーズコード + カード番号のみ）
    // 例: "SV7a 001" で検索すると {001/064} [SV7a] のカードがヒット
    const searchQuery = `${seriesCode} ${cardNumber}`;
    const searchUrl = `${CARDRUSH_BASE_URL}/product-list?keyword=${encodeURIComponent(searchQuery)}`;

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ja,en;q=0.9',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch from CardRush: ${response.status}`);
      return null;
    }

    const html = await response.text();

    // カード番号でマッチするか確認（例: {001/064} [SV7a]）
    // 番号の先頭ゼロを除去してマッチング（001 -> 1）
    const numWithoutLeadingZeros = cardNumber.replace(/^0+/, '');
    const cardPattern = new RegExp(
      `\\{0*${numWithoutLeadingZeros}/\\d+\\}\\s*\\[${seriesCode}\\]`,
      'i'
    );

    if (!cardPattern.test(html)) {
      // カードが見つからない場合
      return {
        cardNumber,
        seriesCode,
        price: null,
        source: 'cardrush',
      };
    }

    // 価格を抽出（"○○円(税込)" 形式）
    // 最初にマッチした価格を取得（通常は最安値が先に表示される）
    const priceMatch = html.match(/(\d{1,6})円\(税込\)/);

    if (priceMatch) {
      const price = parseInt(priceMatch[1], 10);
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
  cards: { id: string; seriesCode: string; cardNumber: string }[],
  delayMs: number = 1000
): Promise<Map<string, number | null>> {
  const results = new Map<string, number | null>();

  for (const card of cards) {
    const result = await scrapeCardRushPrice(
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

  // 50円〜3000円の範囲で現実的な価格を生成
  // 一般的なカードは50〜500円、レアは500〜1500円、高レアは1500〜3000円
  const basePrice = (hash % 60) * 50 + 50;
  return basePrice;
}
