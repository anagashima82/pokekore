import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">プライバシーポリシー</h1>

        <div className="prose prose-sm text-gray-600 space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">1. 収集する情報</h2>
            <p>
              ポケコレ（以下「本アプリ」）は、サービス提供のために以下の情報を収集します。
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>メールアドレス（アカウント登録・認証用）</li>
              <li>カードコレクション情報（所持状況、お気に入り設定）</li>
              <li>利用状況に関する情報（アクセスログ等）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">2. 情報の利用目的</h2>
            <p>収集した情報は、以下の目的で利用します。</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>本アプリのサービス提供・運営</li>
              <li>ユーザーサポートへの対応</li>
              <li>サービス改善のための分析</li>
              <li>重要なお知らせの送信</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">3. 第三者への提供</h2>
            <p>
              本アプリは、以下の場合を除き、収集した個人情報を第三者に提供しません。
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>ユーザーの同意がある場合</li>
              <li>法令に基づく場合</li>
              <li>サービス運営に必要な業務委託先への提供</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">4. 広告について</h2>
            <p>
              本アプリでは、Google AdSenseによる広告を表示しています。
              Google AdSenseは、Cookieを使用してユーザーの興味に基づいた広告を表示することがあります。
              詳細はGoogleのプライバシーポリシーをご確認ください。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">5. データの保管</h2>
            <p>
              ユーザーデータは、Supabase（クラウドデータベースサービス）に安全に保管されます。
              適切なセキュリティ対策を講じ、不正アクセスや漏洩を防止しています。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">6. お問い合わせ</h2>
            <p>
              プライバシーに関するご質問やお問い合わせは、アプリ内のフィードバック機能よりご連絡ください。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">7. 改定</h2>
            <p>
              本ポリシーは、必要に応じて改定することがあります。
              重要な変更がある場合は、アプリ内でお知らせします。
            </p>
          </section>

          <p className="text-sm text-gray-500 mt-8">
            最終更新日: 2025年1月10日
          </p>
        </div>

        <div className="mt-8 pt-6 border-t">
          <Link href="/login" className="text-blue-500 hover:text-blue-600 text-sm">
            ← ログインページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
