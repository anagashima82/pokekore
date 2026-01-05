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
  condition: string; // 'normal' | 'A-' | 'B' など
  source: string;
}

interface ScrapedPriceResult {
  cardNumber: string;
  seriesCode: string;
  prices: ScrapedPrice[];
}

// カードラッシュの検索URL
const CARDRUSH_BASE_URL = 'https://www.cardrush-pokemon.jp';

/**
 * カードラッシュで検索して価格を取得（複数状態対応）
 * 検索クエリ: "【レアリティ】{カード番号} [シリーズコード]" 形式
 */
export async function scrapeCardRushPrice(
  seriesCode: string,
  cardNumber: string,
  rarity?: string
): Promise<ScrapedPriceResult | null> {
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
    const numWithoutLeadingZeros = cardNumber.replace(/^0+/, '') || '0';
    const cardNumberPattern = new RegExp(
      `\\{0*${numWithoutLeadingZeros}/\\d+\\}`,
      'i'
    );

    const cardFound = cardNumberPattern.test(html);
    console.log(`[Scrape] Card pattern: ${cardNumberPattern}, Found: ${cardFound}`);

    if (!cardFound) {
      console.log(`[Scrape] Card not found.`);
      return {
        cardNumber,
        seriesCode,
        prices: [],
      };
    }

    // 商品名と価格のペアを抽出
    // 形式: <span class="goods_name">〔状態A-〕ダストダス<span ...>【AR】{075/066}</span></span>
    //       ...
    //       <span class="figure">350円</span>
    const prices: ScrapedPrice[] = [];

    // 商品ブロック全体を抽出（goods_nameの開始から2つ目の</span>まで、ネストを考慮）
    // パターン: <span class="goods_name">...内容...</span></span>
    const goodsNameRegex = /<span class="goods_name">([\s\S]*?)<\/span><\/span>/g;
    const priceRegex = /<span class="figure">(\d{1,6})円<\/span>/g;

    const goodsNames: string[] = [];
    const priceValues: number[] = [];

    let match;
    while ((match = goodsNameRegex.exec(html)) !== null) {
      // HTMLタグを除去してプレーンテキストを取得
      const plainText = match[1].replace(/<[^>]*>/g, '');
      goodsNames.push(plainText);
    }

    while ((match = priceRegex.exec(html)) !== null) {
      priceValues.push(parseInt(match[1], 10));
    }

    console.log(`[Scrape] Found ${goodsNames.length} products, ${priceValues.length} prices`);

    // 商品名と価格を対応付け
    const minLength = Math.min(goodsNames.length, priceValues.length);
    for (let i = 0; i < minLength; i++) {
      const goodsName = goodsNames[i];
      const price = priceValues[i];

      // このカードに関連する商品かチェック（プレーンテキストでマッチ）
      if (!cardNumberPattern.test(goodsName)) {
        continue;
      }

      // 状態を抽出（「〔状態A-〕」「〔状態B〕」など）
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

    console.log(`[Scrape] Extracted ${prices.length} prices for card ${cardNumber}`);

    return {
      cardNumber,
      seriesCode,
      prices,
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
