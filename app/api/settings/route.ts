import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_USER_ID, RARITY_CHOICES } from '@/lib/constants';

export async function GET() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('collection_settings')
    .select('*')
    .eq('user_id', DEFAULT_USER_ID)
    .order('rarity');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // レアリティ表示名を追加
  type SettingRecord = { id: string; user_id: string; rarity: string; is_collecting: boolean };
  const settings = (data as SettingRecord[] | null)?.map((item) => {
    const rarityInfo = RARITY_CHOICES.find((r) => r.code === item.rarity);
    return {
      ...item,
      rarity_display: rarityInfo?.name || item.rarity,
    };
  });

  return NextResponse.json(settings);
}
