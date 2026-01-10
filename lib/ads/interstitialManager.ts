const STORAGE_KEY = 'interstitialAdState';

interface InterstitialState {
  lastInterstitialDate: string;
  interstitialCountToday: number;
  lastInterstitialTime: number;
}

const MAX_DAILY_COUNT = 3;
const MIN_INTERVAL_MS = 5 * 60 * 1000; // 5分

function getState(): InterstitialState {
  if (typeof window === 'undefined') {
    return {
      lastInterstitialDate: '',
      interstitialCountToday: 0,
      lastInterstitialTime: 0,
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // パースエラー時はデフォルト値を返す
  }

  return {
    lastInterstitialDate: '',
    interstitialCountToday: 0,
    lastInterstitialTime: 0,
  };
}

function saveState(state: InterstitialState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * 日付が変わったらカウントをリセット
 */
export function resetDailyCountIfNeeded(): void {
  const state = getState();
  const today = getTodayString();

  if (state.lastInterstitialDate !== today) {
    saveState({
      lastInterstitialDate: today,
      interstitialCountToday: 0,
      lastInterstitialTime: state.lastInterstitialTime,
    });
  }
}

/**
 * インタースティシャル広告を表示可能かチェック
 */
export function canShowInterstitial(): boolean {
  if (typeof window === 'undefined') return false;

  resetDailyCountIfNeeded();
  const state = getState();
  const now = Date.now();

  // 1日の最大回数をチェック
  if (state.interstitialCountToday >= MAX_DAILY_COUNT) {
    return false;
  }

  // 前回表示から5分以上経過しているかチェック
  if (state.lastInterstitialTime && now - state.lastInterstitialTime < MIN_INTERVAL_MS) {
    return false;
  }

  return true;
}

/**
 * インタースティシャル広告の表示を記録
 */
export function recordInterstitialShown(): void {
  resetDailyCountIfNeeded();
  const state = getState();

  saveState({
    lastInterstitialDate: getTodayString(),
    interstitialCountToday: state.interstitialCountToday + 1,
    lastInterstitialTime: Date.now(),
  });
}

/**
 * 今日の残り表示回数を取得
 */
export function getRemainingCount(): number {
  resetDailyCountIfNeeded();
  const state = getState();
  return Math.max(0, MAX_DAILY_COUNT - state.interstitialCountToday);
}
