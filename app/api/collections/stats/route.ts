import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_USER_ID } from '@/lib/constants';

export async function GET() {
  const supabase = createClient();

  // 収集対象のレアリティを取得
  const { data: settings } = await supabase
    .from('collection_settings')
    .select('rarity')
    .eq('user_id', DEFAULT_USER_ID)
    .eq('is_collecting', true);

  const collectingRarities = (settings as { rarity: string }[] | null)?.map((s) => s.rarity) || [];

  if (collectingRarities.length === 0) {
    return NextResponse.json({
      total: 0,
      owned: 0,
      percentage: 0,
      by_series: [],
    });
  }

  // 全カード数を取得（収集対象レアリティのみ）
  const { count: totalCards } = await supabase
    .from('cards')
    .select('*', { count: 'exact', head: true })
    .in('rarity', collectingRarities);

  // 所持カード数を取得
  const { count: ownedCards } = await supabase
    .from('user_collections')
    .select('*, cards!inner(*)', { count: 'exact', head: true })
    .eq('user_id', DEFAULT_USER_ID)
    .eq('owned', true)
    .in('cards.rarity', collectingRarities);

  // シリーズ一覧を取得
  const { data: seriesData } = await supabase
    .from('cards')
    .select('series_code')
    .in('rarity', collectingRarities);

  const uniqueSeries = [...new Set((seriesData as { series_code: string }[] | null)?.map((d) => d.series_code) || [])];

  // シリーズ別統計を計算
  const bySeriesPromises = uniqueSeries.map(async (seriesCode) => {
    const { count: seriesTotal } = await supabase
      .from('cards')
      .select('*', { count: 'exact', head: true })
      .eq('series_code', seriesCode)
      .in('rarity', collectingRarities);

    const { count: seriesOwned } = await supabase
      .from('user_collections')
      .select('*, cards!inner(*)', { count: 'exact', head: true })
      .eq('user_id', DEFAULT_USER_ID)
      .eq('owned', true)
      .eq('cards.series_code', seriesCode)
      .in('cards.rarity', collectingRarities);

    const total = seriesTotal || 0;
    const owned = seriesOwned || 0;

    return {
      series_code: seriesCode,
      total,
      owned,
      percentage: total > 0 ? Math.round((owned / total) * 1000) / 10 : 0,
    };
  });

  const bySeries = await Promise.all(bySeriesPromises);

  // 0件のシリーズを除外してソート
  const filteredBySeries = bySeries
    .filter((s) => s.total > 0)
    .sort((a, b) => a.series_code.localeCompare(b.series_code));

  const total = totalCards || 0;
  const owned = ownedCards || 0;

  return NextResponse.json({
    total,
    owned,
    percentage: total > 0 ? Math.round((owned / total) * 1000) / 10 : 0,
    by_series: filteredBySeries,
  });
}
