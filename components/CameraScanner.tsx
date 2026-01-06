'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createWorker, Worker } from 'tesseract.js';
import type { CardWithOwnership } from '@/types';

interface CameraScannerProps {
  cards: CardWithOwnership[];
  onClose: () => void;
  onCardFound?: (card: CardWithOwnership) => void;
}

interface DetectedCard {
  card: CardWithOwnership;
  confidence: number;
}

export default function CameraScanner({ cards, onClose, onCardFound }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detectedCard, setDetectedCard] = useState<DetectedCard | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<string>('初期化中...');

  // カード番号のパターンマッチング
  // ポケカの番号形式: 001/078, 079/078, 232/SV-P, SV1S 079/078 など
  const parseCardNumber = useCallback((text: string): { cardNumber: string; seriesCode?: string; totalCards?: string } | null => {
    // テキストを大文字に正規化して処理
    const normalizedText = text.toUpperCase();

    // シリーズコード付きパターン (例: SV1S 079/078, SV2A 001/165)
    const seriesPattern = /(SV\d*[A-Z]*|M\d[A-Z]*|S\d+[A-Z]*)\s*(\d{2,3})\s*[\/\\]\s*(\d{2,3})/gi;
    const seriesMatches = normalizedText.matchAll(seriesPattern);

    for (const match of seriesMatches) {
      const seriesCode = match[1].toLowerCase();
      const cardNumber = match[2].replace(/^0+/, '') || '0';
      const totalCards = match[3];
      return { cardNumber, seriesCode, totalCards };
    }

    // 番号/総数 形式を探す (例: 079/078, 001/066)
    const numberPattern = /(\d{2,3})\s*[\/\\]\s*(\d{2,3}|SV-P)/gi;
    const matches = normalizedText.matchAll(numberPattern);

    for (const match of matches) {
      const cardNumber = match[1].replace(/^0+/, '') || '0';
      const totalCards = match[2];
      return { cardNumber, totalCards };
    }

    // プロモカード形式 (例: 232/SV-P)
    const promoPattern = /(\d{2,3})\s*[\/\\]\s*SV-P/gi;
    const promoMatches = normalizedText.matchAll(promoPattern);

    for (const match of promoMatches) {
      const cardNumber = match[1].replace(/^0+/, '') || '0';
      return { cardNumber, seriesCode: 'promo_sv' };
    }

    return null;
  }, []);

  // カードを検索
  const findCard = useCallback((cardNumber: string, seriesCode?: string): CardWithOwnership | null => {
    // カード番号で検索（先頭の0を除去して比較）
    const normalizedNumber = cardNumber.replace(/^0+/, '') || '0';

    const matchingCards = cards.filter(card => {
      const cardNum = card.card_number.replace(/^0+/, '') || '0';
      if (cardNum !== normalizedNumber) return false;

      // シリーズコードが指定されている場合はそれも確認
      if (seriesCode) {
        return card.series_code.toLowerCase() === seriesCode.toLowerCase();
      }
      return true;
    });

    // 複数マッチする場合は最初のものを返す
    return matchingCards[0] || null;
  }, [cards]);

  // OCRスキャン実行
  const performScan = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !workerRef.current || isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsScanning(true);
    setScanStatus('スキャン中...');

    try {
      // カメラ映像をキャンバスに描画
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      // カード左下の番号エリアだけを切り出し
      // ポケカの番号は左下にあるので、左下25%x15%の領域をスキャン
      const scanWidth = Math.floor(canvas.width * 0.4);  // 左側40%
      const scanHeight = Math.floor(canvas.height * 0.12); // 下部12%
      const scanX = 0;
      const scanY = canvas.height - scanHeight;

      const scanCanvas = document.createElement('canvas');
      scanCanvas.width = scanWidth;
      scanCanvas.height = scanHeight;
      const scanCtx = scanCanvas.getContext('2d');
      if (!scanCtx) return;

      scanCtx.drawImage(canvas, scanX, scanY, scanWidth, scanHeight, 0, 0, scanWidth, scanHeight);

      // 画像前処理: 反転＋コントラスト強調（白背景に黒文字にする）
      const imageData = scanCtx.getImageData(0, 0, scanCanvas.width, scanCanvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        // 閾値調整: カードの番号は比較的明るい色が多いので閾値を上げる
        // 白文字（明るい）を黒に、背景（暗い）を白に反転
        const bw = gray > 150 ? 0 : 255;
        data[i] = bw;
        data[i + 1] = bw;
        data[i + 2] = bw;
      }
      scanCtx.putImageData(imageData, 0, 0);

      // OCR実行
      const result = await workerRef.current.recognize(scanCanvas);
      const text = result.data.text;

      // デバッグ: OCR結果をコンソールに出力
      console.log('OCR Result:', text, 'Confidence:', result.data.confidence);

      // カード番号を解析
      const parsed = parseCardNumber(text);
      if (parsed) {
        console.log('Parsed:', parsed);
        const card = findCard(parsed.cardNumber, parsed.seriesCode);
        if (card) {
          setDetectedCard({
            card,
            confidence: result.data.confidence
          });
          setScanStatus(`検出: ${card.name}`);
          onCardFound?.(card);
        } else {
          setScanStatus(`番号検出: ${parsed.cardNumber}/${parsed.totalCards || '?'} (該当なし)`);
        }
      } else {
        // OCRテキストの一部を表示（デバッグ用）
        const shortText = text.replace(/\s+/g, ' ').trim().slice(0, 30);
        setScanStatus(shortText ? `読取中: ${shortText}...` : 'カードを探しています...');
      }
    } catch (err) {
      console.error('OCR scan error:', err);
      setScanStatus('スキャンエラー');
    } finally {
      setIsScanning(false);
    }
  }, [isScanning, parseCardNumber, findCard, onCardFound]);

  // カメラとOCR初期化
  useEffect(() => {
    let mounted = true;

    const initCamera = async () => {
      try {
        setScanStatus('カメラを起動中...');

        // カメラアクセス
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // 背面カメラ優先
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Tesseract.js Worker初期化
        setScanStatus('OCRエンジンを初期化中...');
        const worker = await createWorker('eng');

        if (!mounted) {
          await worker.terminate();
          return;
        }

        workerRef.current = worker;
        setIsLoading(false);
        setScanStatus('カードをかざしてください');

        // 定期スキャン開始（1秒間隔）
        scanIntervalRef.current = setInterval(() => {
          if (mounted) performScan();
        }, 1000);

      } catch (err) {
        console.error('Camera/OCR init error:', err);
        if (mounted) {
          if ((err as Error).name === 'NotAllowedError') {
            setError('カメラへのアクセスが拒否されました。設定でカメラへのアクセスを許可してください。');
          } else {
            setError('カメラの起動に失敗しました: ' + (err as Error).message);
          }
          setIsLoading(false);
        }
      }
    };

    initCamera();

    return () => {
      mounted = false;

      // スキャン停止
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }

      // カメラ停止
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Worker終了
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [performScan]);

  // ESCキーで閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // スクロール無効化
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* カメラビュー */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
        autoPlay
      />

      {/* スキャン用キャンバス（非表示） */}
      <canvas ref={canvasRef} className="hidden" />

      {/* スキャンフレーム - 左下のカード番号エリアをハイライト */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 暗幕で左下以外を覆う */}
        {/* 上部 88% */}
        <div className="absolute top-0 left-0 right-0 h-[88%] bg-black/40" />
        {/* 下部右側 60% */}
        <div className="absolute bottom-0 right-0 w-[60%] h-[12%] bg-black/40" />

        {/* スキャンエリア枠 - 左下40% x 12% */}
        <div className="absolute bottom-0 left-0 w-[40%] h-[12%] border-2 border-orange-500">
          {/* コーナーマーカー */}
          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-orange-500" />
          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-orange-500" />
          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-orange-500" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-orange-500" />

          {/* スキャンライン */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute w-full h-0.5 bg-orange-500/80 animate-pulse top-1/2" />
          </div>
        </div>

        {/* ガイドテキスト */}
        <div className="absolute bottom-[14%] left-4 text-white text-sm bg-black/60 px-3 py-1 rounded-full">
          カード番号を枠内に合わせてください
        </div>
      </div>

      {/* ローディング表示 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="text-center text-white">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg">{scanStatus}</p>
          </div>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="text-center text-white max-w-sm px-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-16 h-16 mx-auto mb-4 text-red-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            <p className="text-lg mb-4">{error}</p>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-orange-500 text-white rounded-full font-bold"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* スキャン状態表示 */}
      {!isLoading && !error && (
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="bg-black/60 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2">
            {isScanning && (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{scanStatus}</span>
          </div>
        </div>
      )}

      {/* 検出カードHUD */}
      {detectedCard && (
        <div className="absolute bottom-24 left-4 right-4">
          <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-4 border border-orange-500/50">
            <div className="flex items-center gap-4">
              {/* カード画像サムネイル */}
              <div className="w-20 h-28 relative flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={detectedCard.card.image_path || '/placeholder-card.png'}
                  alt={detectedCard.card.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>

              {/* カード情報 */}
              <div className="flex-1 text-white">
                <h3 className="text-lg font-bold mb-1">{detectedCard.card.name}</h3>
                <p className="text-sm text-white/70 mb-2">
                  {detectedCard.card.series_code.toUpperCase()} #{detectedCard.card.card_number} ({detectedCard.card.rarity})
                </p>

                <div className="flex items-center gap-4">
                  {/* 所持状態 */}
                  <div className={`flex items-center gap-1 ${detectedCard.card.owned ? 'text-green-400' : 'text-red-400'}`}>
                    {detectedCard.card.owned ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                        </svg>
                        <span className="font-bold">所持</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                        </svg>
                        <span className="font-bold">未所持</span>
                      </>
                    )}
                  </div>

                  {/* 価格 */}
                  {detectedCard.card.price !== undefined && (
                    <div className="flex items-center gap-1 text-orange-400">
                      <span className="font-bold">¥{detectedCard.card.price.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 閉じるボタン */}
      <button
        type="button"
        onClick={onClose}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 px-8 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold rounded-full flex items-center gap-2 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        閉じる
      </button>
    </div>
  );
}
