import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">利用規約</h1>

        <div className="prose prose-sm text-gray-600 space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">1. サービスについて</h2>
            <p>
              ポケコレ（以下「本アプリ」）は、ポケモンカードのコレクション管理を目的とした
              無料のウェブアプリケーションです。本アプリはポケモンカードの公式サービスではなく、
              株式会社ポケモンとは一切関係のない非公式アプリです。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">2. 利用条件</h2>
            <p>本アプリを利用するにあたり、以下の条件に同意いただく必要があります。</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>本規約のすべての条項に同意すること</li>
              <li>正確な情報でアカウント登録を行うこと</li>
              <li>他者の権利を侵害しないこと</li>
              <li>不正アクセスや本アプリの運営を妨害しないこと</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">3. 禁止事項</h2>
            <p>以下の行為を禁止します。</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>法令または公序良俗に違反する行為</li>
              <li>他のユーザーまたは第三者の権利を侵害する行為</li>
              <li>本アプリのサーバーやネットワークに過度な負荷をかける行為</li>
              <li>本アプリの運営を妨害する行為</li>
              <li>不正なアクセスやデータの改ざん</li>
              <li>商業目的での利用（事前許可なく）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">4. 価格情報について</h2>
            <p>
              本アプリで表示されるカードの参考価格は、カードラッシュ等の外部サイトから取得した
              参考情報であり、実際の取引価格を保証するものではありません。
              カードの売買は自己責任で行ってください。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">5. 免責事項</h2>
            <p>
              本アプリは「現状のまま」で提供され、以下について一切の保証をしません。
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>サービスの継続性、安定性</li>
              <li>情報の正確性、完全性</li>
              <li>特定目的への適合性</li>
              <li>データの保全（バックアップはユーザーの責任で行ってください）</li>
            </ul>
            <p className="mt-2">
              本アプリの利用により生じた損害について、運営者は一切の責任を負いません。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">6. 知的財産権</h2>
            <p>
              ポケモンカードに関する知的財産権は、株式会社ポケモンおよび関連会社に帰属します。
              本アプリは、ファン活動として非営利目的で運営されています。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">7. サービスの変更・終了</h2>
            <p>
              運営者は、事前の通知なく本アプリの内容を変更、または提供を終了することがあります。
              これによりユーザーに生じた損害について、運営者は責任を負いません。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">8. 規約の変更</h2>
            <p>
              本規約は、必要に応じて変更することがあります。
              変更後の規約は、本アプリ上に掲載した時点で効力を生じます。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">9. 準拠法・管轄裁判所</h2>
            <p>
              本規約は日本法に準拠します。本アプリに関する紛争は、
              東京地方裁判所を第一審の専属的合意管轄裁判所とします。
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
