/**
 * プレミアム会員かどうかを判定
 * 現時点ではlocalStorageで簡易実装（後でSupabaseの課金情報と連携）
 */
export function isPremiumUser(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('isPremium') === 'true';
}

/**
 * プレミアム会員フラグを設定（テスト用）
 */
export function setPremiumUser(isPremium: boolean): void {
  if (typeof window === 'undefined') return;
  if (isPremium) {
    localStorage.setItem('isPremium', 'true');
  } else {
    localStorage.removeItem('isPremium');
  }
}
