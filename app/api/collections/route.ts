import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_USER_ID } from '@/lib/constants';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);

  const owned = searchParams.get('owned');
  const seriesCode = searchParams.get('card__series_code');
  const rarity = searchParams.get('card__rarity');

  // 収集対象のレアリティを取得
  const { data: settings } = await supabase
    .from('collection_settings')
    .select('rarity')
    .eq('user_id', DEFAULT_USER_ID)
    .eq('is_collecting', true);

  const collectingRarities = (settings as { rarity: string }[] | null)?.map((s) => s.rarity) || [];

  // コレクションとカード情報を結合して取得
  let query = supabase
    .from('user_collections')
    .select(`
      id,
      user_id,
      card_id,
      owned,
      updated_at,
      cards!inner (
        id,
        card_number,
        series_code,
        name,
        rarity,
        image_path,
        created_at
      )
    `)
    .eq('user_id', DEFAULT_USER_ID);

  // 収集対象レアリティでフィルタ
  if (collectingRarities.length > 0) {
    query = query.in('cards.rarity', collectingRarities);
  }

  if (owned !== null) {
    query = query.eq('owned', owned === 'true');
  }

  if (seriesCode) {
    query = query.eq('cards.series_code', seriesCode);
  }

  if (rarity) {
    query = query.eq('cards.rarity', rarity);
  }

  const { data, error } = await query.order('updated_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // レスポンス形式を整形
  const collections = data?.map((item) => ({
    id: item.id,
    user_id: item.user_id,
    card: item.card_id,
    card_detail: item.cards,
    owned: item.owned,
    updated_at: item.updated_at,
  }));

  return NextResponse.json(collections);
}
