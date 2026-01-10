'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <form className="space-y-6" onSubmit={handleLogin}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            メールアドレス
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            パスワード
          </label>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Link
            href="/auth/reset-password"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            パスワードをお忘れですか？
          </Link>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">または</span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/signup"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
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
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-500">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
          <p className="text-gray-600 text-xs mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">
      {/* ヒーローセクション */}
      <div className="pt-8 pb-6 px-4 text-center">
        <h1 className="text-4xl font-bold text-blue-500 mb-2">ポケコレ</h1>
        <p className="text-gray-600 text-sm">ポケモンカード コレクション管理アプリ</p>
      </div>

      {/* アプリ説明 */}
      <div className="px-4 pb-6">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-6 text-white text-center">
            <p className="text-lg font-medium">あなたのポケカコレクションを</p>
            <p className="text-lg font-medium">かんたん管理</p>
          </div>
          <div className="p-4">
            <p className="text-gray-600 text-sm leading-relaxed">
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
          <h2 className="text-lg font-bold text-gray-800 mb-3 text-center">主な機能</h2>
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
      <div className="px-4 pb-6">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-xl font-semibold text-gray-900 mb-4">
            ログイン
          </h2>
          <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-lg" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>

      {/* フッター */}
      <footer className="bg-gray-100 py-6 px-4 mt-8">
        <div className="max-w-md mx-auto">
          <div className="flex justify-center gap-6 text-sm text-gray-600 mb-4">
            <Link href="/privacy" className="hover:text-blue-500">プライバシーポリシー</Link>
            <Link href="/terms" className="hover:text-blue-500">利用規約</Link>
          </div>
          <p className="text-center text-xs text-gray-500">
            ポケコレはポケモンカードのコレクション管理を目的とした非公式アプリです。
          </p>
          <p className="text-center text-xs text-gray-400 mt-2">
            &copy; 2025 ポケコレ
          </p>
        </div>
      </footer>
    </div>
  );
}
