'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import type { CollectionStats } from '@/types';

interface HeaderProps {
  stats?: CollectionStats;
  onCameraOpen?: () => void;
}

export default function Header({ stats, onCameraOpen }: HeaderProps) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-white border-b border-[#e8eaeb] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#7ab8b8] tracking-tight">
              ポケコレ
            </h1>
            {stats && (
              <div className="flex items-center gap-2 text-sm bg-[#e8f7f7] text-[#5fa3a3] rounded-full px-3 py-1">
                <span>
                  {stats.owned} / {stats.total}
                </span>
                <span className="font-semibold">{stats.percentage}%</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* カメラスキャンボタン */}
            <button
              type="button"
              onClick={onCameraOpen}
              className="p-2 rounded-full bg-[#bbebeb] hover:bg-[#a8dede] active:bg-[#95d1d1] text-white transition-all duration-200"
              aria-label="カメラでスキャン"
              title="カメラでスキャン"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                />
              </svg>
            </button>

            {(user || isLoggingOut) && (
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isLoggingOut
                    ? 'bg-[#e8eaeb] cursor-not-allowed'
                    : 'bg-[#f6f7f8] hover:bg-[#eef0f1]'
                } text-[#7ab8b8]`}
                aria-label="ログアウト"
                title="ログアウト"
              >
                {isLoggingOut ? (
                  <div className="w-6 h-6 animate-spin rounded-full border-2 border-[#bbebeb] border-t-transparent" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                    />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
