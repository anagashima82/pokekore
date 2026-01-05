import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { user, error: authError } = await getAuthUser();
  if (authError || !user) {
    return unauthorizedResponse();
  }

  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const owned = searchParams.get('owned');
  const seriesCode = searchParams.get('card__series_code');
  const rarity = searchParams.get('card__rarity');

  // 収集対象のレアリティを取得
  const { data: settings } = await supabase
    .from('collection_settings')
    .select('rarity')
    .eq('user_id', user.id)
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
      is_favorite,
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
    .eq('user_id', user.id);

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
  type CollectionWithCard = {
    id: string;
    user_id: string;
    card_id: string;
    owned: boolean;
    is_favorite: boolean;
    updated_at: string;
    cards: unknown;
  };
  const collections = (data as CollectionWithCard[] | null)?.map((item) => ({
    id: item.id,
    user_id: item.user_id,
    card: item.card_id,
    card_detail: item.cards,
    owned: item.owned,
    is_favorite: item.is_favorite,
    updated_at: item.updated_at,
  }));

  return NextResponse.json(collections);
}
