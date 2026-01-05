// MVP版の固定ユーザーID
export const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

// レアリティ定義
export const RARITY_CHOICES = [
  { code: 'C', name: 'コモン' },
  { code: 'U', name: 'アンコモン' },
  { code: 'R', name: 'レア' },
  { code: 'RR', name: 'ダブルレア' },
  { code: 'RRR', name: 'トリプルレア' },
  { code: 'SR', name: 'スーパーレア' },
  { code: 'SAR', name: 'スペシャルアートレア' },
  { code: 'AR', name: 'アートレア' },
  { code: 'UR', name: 'ウルトラレア' },
  { code: 'SSR', name: 'シャイニースーパーレア' },
  { code: 'HR', name: 'ハイパーレア' },
  { code: 'CSR', name: 'キャラクタースーパーレア' },
] as const;

export type RarityCode = typeof RARITY_CHOICES[number]['code'];
