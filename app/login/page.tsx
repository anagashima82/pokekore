'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

// スタイル定数
const styles = {
  // カード共通スタイル
  card: 'bg-white rounded-[16px] border border-[#e8eaeb] shadow-[0_2px_8px_rgba(0,0,0,0.04)]',
  // ボタン共通スタイル
  buttonPrimary: 'w-full flex justify-center py-3 px-4 rounded-[999px] text-sm font-medium text-white bg-[#bbebeb] hover:bg-[#a8dede] active:bg-[#95d1d1] focus:outline-none focus:ring-[4px] focus:ring-[rgba(187,235,235,0.55)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200',
  buttonSecondary: 'w-full flex items-center justify-center gap-3 py-3 px-4 rounded-[999px] border border-[#e8eaeb] bg-white text-sm font-medium text-[#585e5f] hover:bg-[#f6f7f8] active:bg-[#eef0f1] focus:outline-none focus:ring-[4px] focus:ring-[rgba(187,235,235,0.55)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200',
  // 入力欄スタイル
  input: 'appearance-none block w-full px-4 py-3 border border-[#e8eaeb] rounded-[12px] text-[#585e5f] placeholder-[#a0a5a7] focus:outline-none focus:border-[#bbebeb] focus:ring-[4px] focus:ring-[rgba(187,235,235,0.55)] text-sm transition-all duration-200',
  // ラベルスタイル
  label: 'block text-sm font-medium text-[#585e5f] mb-2',
  // リンクスタイル
  link: 'text-sm text-[#7ab8b8] hover:text-[#5fa3a3] transition-colors duration-200',
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsGoogleLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (error) {
      setError(error.message);
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className={`${styles.card} py-8 px-6`}>
      <form className="space-y-5" onSubmit={handleLogin}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[12px] text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className={styles.label}>
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            placeholder="example@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className={styles.label}>
            パスワード
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            placeholder="パスワードを入力"
          />
        </div>

        <div className="flex items-center justify-end">
          <Link href="/auth/reset-password" className={styles.link}>
            パスワードをお忘れですか？
          </Link>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className={styles.buttonPrimary}
          >
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#e8eaeb]" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-[#a0a5a7]">または</span>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className={styles.buttonSecondary}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isGoogleLoading ? 'ログイン中...' : 'Googleでログイン'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <Link href="/signup" className={styles.link}>
            アカウントをお持ちでない方はこちら
          </Link>
        </div>
      </div>
    </div>
  );
}

// 機能紹介カード
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className={`${styles.card} p-4`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-[#e8f7f7] rounded-[12px] flex items-center justify-center text-[#7ab8b8]">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-[#585e5f] text-sm">{title}</h3>
          <p className="text-[#8a9092] text-xs mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f6f7f8] font-[family-name:var(--font-noto-sans-jp),var(--font-inter),sans-serif]">
      {/* ヒーローセクション */}
      <div className="pt-10 pb-8 px-4 text-center">
        <h1 className="text-4xl font-bold text-[#7ab8b8] mb-2 tracking-tight">ポケコレ</h1>
        <p className="text-[#8a9092] text-sm">ポケモンカード コレクション管理アプリ</p>
      </div>

      {/* アプリ説明 */}
      <div className="px-4 pb-6">
        <div className={`max-w-md mx-auto ${styles.card} overflow-hidden`}>
          <div className="bg-gradient-to-r from-[#bbebeb] to-[#a8dede] px-5 py-6 text-white text-center">
            <p className="text-lg font-medium">あなたのポケカコレクションを</p>
            <p className="text-lg font-medium">かんたん管理</p>
          </div>
          <div className="p-5">
            <p className="text-[#585e5f] text-sm leading-relaxed">
              ポケコレは、ポケモンカードのコレクション状況を視覚的に管理できる無料アプリです。
              AR（アートレア）カードの所持状況をシリーズごとに一目で確認でき、
              カードラッシュの参考価格も表示されます。
            </p>
          </div>
        </div>
      </div>

      {/* 機能紹介 */}
      <div className="px-4 pb-6">
        <div className="max-w-md mx-auto">
          <h2 className="text-lg font-bold text-[#585e5f] mb-4 text-center">主な機能</h2>
          <div className="space-y-3">
            <FeatureCard
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-8.25ZM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-2.25Z" />
                </svg>
              }
              title="コレクション管理"
              description="シリーズごとにカードの所持状況を視覚的に管理。未所持カードはグレー表示で一目瞭然。"
            />
            <FeatureCard
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              }
              title="参考価格表示"
              description="カードラッシュの参考価格をリアルタイム表示。コレクションの価値を把握できます。"
            />
            <FeatureCard
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
              }
              title="収集進捗の可視化"
              description="シリーズごとの収集率をプログレスバーで表示。コンプリートを目指そう！"
            />
            <FeatureCard
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
              }
              title="お気に入り機能"
              description="お気に入りのカードをマーク。欲しいカードリストとしても活用できます。"
            />
          </div>
        </div>
      </div>

      {/* ログインフォーム */}
      <div className="px-4 pb-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-xl font-semibold text-[#585e5f] mb-5">
            ログイン
          </h2>
          <Suspense fallback={<div className="animate-pulse bg-[#e8eaeb] h-64 rounded-[16px]" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>

      {/* フッター */}
      <footer className="bg-[#eef0f1] py-6 px-4 mt-4">
        <div className="max-w-md mx-auto">
          <div className="flex justify-center gap-6 text-sm text-[#8a9092] mb-4">
            <Link href="/privacy" className="hover:text-[#7ab8b8] transition-colors duration-200">プライバシーポリシー</Link>
            <Link href="/terms" className="hover:text-[#7ab8b8] transition-colors duration-200">利用規約</Link>
          </div>
          <p className="text-center text-xs text-[#a0a5a7]">
            ポケコレはポケモンカードのコレクション管理を目的とした非公式アプリです。
          </p>
          <p className="text-center text-xs text-[#b8bcbe] mt-2">
            &copy; 2025 ポケコレ
          </p>
        </div>
      </footer>
    </div>
  );
}
