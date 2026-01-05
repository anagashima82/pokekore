import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { RARITY_CHOICES } from '@/lib/constants';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';

// 新規ユーザーの初期設定を行う
export async function POST() {
  const { user, error: authError } = await getAuthUser();
  if (authError || !user) {
    return unauthorizedResponse();
  }

  const supabase = await createClient();

  // 既存の設定を確認
  const { data: existingSettings } = await supabase
    .from('collection_settings')
    .select('id')
    .eq('user_id', user.id)
    .limit(1);

  // 既に設定がある場合はスキップ
  if (existingSettings && existingSettings.length > 0) {
    return NextResponse.json({ message: 'Already initialized' });
  }

  // デフォルトの収集設定を作成（ARのみ収集対象）
  const defaultSettings = RARITY_CHOICES.map((rarity) => ({
    user_id: user.id,
    rarity: rarity.code,
    is_collecting: rarity.code === 'AR', // ARのみデフォルトでON
  }));

  const { error } = await supabase
    .from('collection_settings')
    .insert(defaultSettings as never[]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Initialized successfully' });
}
