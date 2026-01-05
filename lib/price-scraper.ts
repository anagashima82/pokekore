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
 * 検索クエリ: "【レアリティ】{カード番号} [シリーズコード]" 形式
 */
export async function scrapeCardRushPrice(
  seriesCode: string,
  cardNumber: string,
  rarity?: string
): Promise<ScrapedPrice | null> {
  try {
    // シリーズコードは大文字に変換（m1l -> M1L）
    const upperSeriesCode = seriesCode.toUpperCase();

    // 検索クエリを作成
    // 形式: 【AR】{064/063} [M1L] のような形式で検索
    // 総数が不明なので、カード番号のみで部分一致検索
    let searchQuery: string;
    if (rarity) {
      // レアリティがある場合: 【AR】{064 [M1L]
      searchQuery = `【${rarity}】{${cardNumber} [${upperSeriesCode}]`;
    } else {
      // レアリティがない場合: {064 [M1L]
      searchQuery = `{${cardNumber} [${upperSeriesCode}]`;
    }
    const searchUrl = `${CARDRUSH_BASE_URL}/product-list?keyword=${encodeURIComponent(searchQuery)}`;

    console.log(`[Scrape] Query: "${searchQuery}" URL: ${searchUrl}`);

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ja,en;q=0.9',
      },
    });

    if (!response.ok) {
      console.error(`[Scrape] Failed to fetch from CardRush: ${response.status}`);
      return null;
    }

    const html = await response.text();
    console.log(`[Scrape] HTML length: ${html.length} chars`);

    // カード番号でマッチするか確認
    // 形式1: {001/064} [SV7a] - シリーズコードがブラケットで続く場合
    // 形式2: {064/063} - シリーズコードがタイトルに含まれない場合
    const numWithoutLeadingZeros = cardNumber.replace(/^0+/, '') || '0';

    // まずカード番号だけでマッチを確認
    const cardNumberPattern = new RegExp(
      `\\{0*${numWithoutLeadingZeros}/\\d+\\}`,
      'i'
    );

    const cardFound = cardNumberPattern.test(html);
    console.log(`[Scrape] Card pattern: ${cardNumberPattern}, Found: ${cardFound}`);

    if (!cardFound) {
      // カードが見つからない場合 - HTMLの一部を出力してデバッグ
      const snippet = html.substring(0, 500);
      console.log(`[Scrape] Card not found. HTML snippet: ${snippet}`);
      return {
        cardNumber,
        seriesCode,
        price: null,
        source: 'cardrush',
      };
    }

    // 価格を抽出
    // 形式: <span class="figure">380円</span><span class="tax_label list_tax_label">(税込)</span>
    const priceMatch = html.match(/<span class="figure">(\d{1,6})円<\/span>/);

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
