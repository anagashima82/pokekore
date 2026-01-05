import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_USER_ID, RARITY_CHOICES } from '@/lib/constants';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ rarity: string }> }
) {
  const supabase = createClient();
  const { rarity } = await params;

  // リクエストボディを取得
  const body = await request.json();
  const isCollecting = body.is_collecting ?? true;

  // 既存の設定を確認
  const { data: existing } = await supabase
    .from('collection_settings')
    .select('*')
    .eq('user_id', DEFAULT_USER_ID)
    .eq('rarity', rarity)
    .single();

  type SettingRecord = { id: string; user_id: string; rarity: string; is_collecting: boolean };
  let result: SettingRecord;

  if (existing) {
    // 更新
    const existingRecord = existing as SettingRecord;
    const { data, error } = await supabase
      .from('collection_settings')
      .update({ is_collecting: isCollecting } as never)
      .eq('id', existingRecord.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    result = data as SettingRecord;
  } else {
    // 新規作成
    const { data, error } = await supabase
      .from('collection_settings')
      .insert({
        user_id: DEFAULT_USER_ID,
        rarity,
        is_collecting: isCollecting,
      } as never)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    result = data as SettingRecord;
  }

  // レアリティ表示名を追加
  const rarityInfo = RARITY_CHOICES.find((r) => r.code === result.rarity);

  return NextResponse.json({
    ...result,
    rarity_display: rarityInfo?.name || result.rarity,
  });
}
