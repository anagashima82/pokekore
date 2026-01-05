import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_USER_ID } from '@/lib/constants';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const supabase = createClient();
  const { cardId } = await params;

  // カードの存在確認
  const { data: card, error: cardError } = await supabase
    .from('cards')
    .select('*')
    .eq('id', cardId)
    .single();

  if (cardError || !card) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 });
  }

  // 既存のコレクションを取得
  const { data: existing } = await supabase
    .from('user_collections')
    .select('*')
    .eq('user_id', DEFAULT_USER_ID)
    .eq('card_id', cardId)
    .single();

  type CollectionRecord = {
    id: string;
    user_id: string;
    card_id: string;
    owned: boolean;
    updated_at: string;
  };

  let result: CollectionRecord;

  if (existing) {
    // 既存のコレクションがあれば、所持状態をトグル
    const existingRecord = existing as CollectionRecord;
    const { data, error } = await supabase
      .from('user_collections')
      .update({ owned: !existingRecord.owned, updated_at: new Date().toISOString() } as never)
      .eq('id', existingRecord.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    result = data as CollectionRecord;
  } else {
    // 新規作成（初回は所持済みとして登録）
    const { data, error } = await supabase
      .from('user_collections')
      .insert({
        user_id: DEFAULT_USER_ID,
        card_id: cardId,
        owned: true,
      } as never)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    result = data as CollectionRecord;
  }

  // カード情報を含めてレスポンス
  return NextResponse.json({
    id: result.id,
    user_id: result.user_id,
    card: result.card_id,
    card_detail: card,
    owned: result.owned,
    updated_at: result.updated_at,
  });
}
