// 個人情報保護方針 (/privacy)
//
// フォーム入力時の同意リンク (EntryForm の「個人情報取扱方針」) から遷移される。
// 人材紹介事業として最低限の項目を網羅した汎用フォーマット。
// 運営会社の正式名称・連絡先メールアドレス・有料職業紹介事業許可番号は確定し次第、
// 末尾の <PrivacyContact /> と「制定」「運営者」の表記を差し替えること。
import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "個人情報保護方針 | VibesCareer",
  description:
    "VibesCareer における個人情報の取り扱い方針です。取得する情報・利用目的・第三者提供・お問い合わせ窓口などを記載しています。",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <main className="lp-container bg-white">
      {/* ヘッダー: 入口LP / 結果LPと統一 */}
      <header className="relative px-4 py-3 flex items-center justify-start bg-white">
        <Link href="/lp01" aria-label="VibesCareer トップへ戻る">
          <Logo width={160} height={44} priority />
        </Link>
        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-primary/60 to-transparent" />
      </header>

      {/* タイトル */}
      <section className="px-5 pt-8 pb-2">
        <div className="section-eyebrow-block">
          <span className="en">PRIVACY POLICY</span>
          <h1 className="ja text-[22px]">
            <span className="marker">個人情報保護方針</span>
          </h1>
        </div>
        <p className="mt-5 text-[13.5px] leading-[1.95] text-text-secondary">
          VibesCareer
          (以下「当サービス」といいます)
          は、ご利用者の個人情報を適切に取り扱うことが社会的責務であると認識し、
          個人情報の保護に関する法律 (個人情報保護法) その他の関係法令を遵守し、
          以下のとおり個人情報保護方針を定めます。
        </p>
      </section>

      <div className="px-5 pb-10 pt-2 space-y-7">
        <Article num={1} title="取得する個人情報">
          <p>
            当サービスは、初回キャリアカウンセリングのお申込・予約および
            適性診断 (VibesRadar) の提供にあたり、以下の情報を取得します。
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>お名前 (姓・名)</li>
            <li>メールアドレス</li>
            <li>電話番号</li>
            <li>生年月日</li>
            <li>最終学歴・学校名・専攻学科</li>
            <li>希望勤務地・希望転職時期</li>
            <li>ご予約日時・カウンセリング内容</li>
            <li>
              アクセスログ、Cookie・端末識別子、IP アドレス、ブラウザの種類等の
              閲覧履歴情報
            </li>
          </ul>
        </Article>

        <Article num={2} title="個人情報の利用目的">
          <p>取得した個人情報は、以下の目的のために利用します。</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>転職支援サービス (キャリアカウンセリング) のご提供</li>
            <li>適性診断 VibesRadar のご提供および結果のご案内</li>
            <li>求人情報のご紹介および求人企業とのマッチング</li>
            <li>ご予約確認・各種ご連絡 (メール・電話・SMS 等)</li>
            <li>本人確認および不正利用の防止</li>
            <li>サービス改善・新機能開発のための統計データの作成</li>
            <li>法令または公的機関からの要請への対応</li>
          </ul>
        </Article>

        <Article num={3} title="第三者提供">
          <p>
            当サービスは、ご本人の同意を得た場合または法令に基づく場合を除き、
            個人情報を第三者へ提供することはありません。
          </p>
          <p className="mt-2">
            求人企業へのご応募・ご紹介にあたっては、ご本人の同意を得たうえで、
            応募意思の伝達および選考に必要な範囲で個人情報を提供します。
          </p>
        </Article>

        <Article num={4} title="業務委託">
          <p>
            当サービスは、利用目的の達成に必要な範囲で個人情報の取扱いの全部または
            一部を外部に委託する場合があります。委託先には個人情報を適切に管理する
            体制を求め、契約等によって取扱いを監督します。主な委託先は以下のとおりです。
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>カレンダー連携・予約管理 (Google LLC)</li>
            <li>応募・予約情報の保管 (Google LLC / Google Workspace)</li>
            <li>通知配信 (Slack Technologies, LLC ほか)</li>
            <li>サイトホスティング・配信 (Cloudflare, Inc.)</li>
          </ul>
        </Article>

        <Article num={5} title="安全管理措置">
          <p>
            当サービスは、取得した個人情報の漏えい・滅失・毀損を防止するため、
            以下の安全管理措置を講じます。
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              組織的措置:
              個人情報を取り扱う担当者および責任者を明確にし、取扱規程を整備します
            </li>
            <li>
              人的措置:
              個人情報を取り扱う担当者に対する教育・誓約を実施します
            </li>
            <li>
              物理的措置:
              個人情報を取り扱う区域への入退室管理および端末の盗難防止を行います
            </li>
            <li>
              技術的措置:
              アクセス制御、不正アクセス対策、通信の暗号化等を実施します
            </li>
          </ul>
        </Article>

        <Article num={6} title="開示・訂正・利用停止等の請求">
          <p>
            ご本人から、ご自身の個人情報について、開示・訂正・追加・削除・利用停止・
            消去・第三者提供の停止のご請求があった場合、当サービスはご本人で
            あることを確認のうえ、法令の定めに従い遅滞なく対応します。
            ご請求の方法については、末尾のお問い合わせ窓口までご連絡ください。
          </p>
        </Article>

        <Article num={7} title="Cookie・アクセスログ等の利用">
          <p>
            当サービスは、サービスの利便性向上、利用状況の分析、サービス改善等の
            目的で、Cookie・類似技術およびアクセスログを取得することがあります。
            これらは個人を直接特定する情報ではありませんが、本方針に基づいて適切に
            取り扱います。Cookie の利用はブラウザの設定により無効化できますが、
            一部の機能がご利用いただけなくなる場合があります。
          </p>
        </Article>

        <Article num={8} title="お問い合わせ窓口">
          <PrivacyContact />
        </Article>

        <Article num={9} title="本方針の改定">
          <p>
            当サービスは、法令の変更またはサービスの変更等に応じて、本方針を
            随時改定することがあります。改定後の方針は、本ページに掲載した時点から
            効力を生じるものとします。
          </p>
        </Article>

        <p className="text-[12px] text-text-muted text-right pt-3">
          制定日: 2026年5月22日
          <br />
          最終更新日: 2026年5月22日
        </p>

        <div className="pt-2 text-center">
          <Link
            href="/lp01"
            className="inline-block text-[13px] text-brand-primary underline"
          >
            ← VibesCareer トップへ戻る
          </Link>
        </div>
      </div>

      {/* フッター: 入口LPと同じシンプル構成 */}
      <footer className="relative px-4 py-9 flex flex-col items-center gap-3 bg-white">
        <span
          aria-hidden
          className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-primary/60 to-transparent"
        />
        <Logo width={140} height={40} />
        <p className="text-[11px] text-text-muted tracking-wider">
          © VibesCareer
        </p>
      </footer>
    </main>
  );
}

// =====================================================
// 各条文の共通レイアウト
// 番号バッジ + 見出し + 本文
// =====================================================
function Article({
  num,
  title,
  children,
}: {
  num: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="flex items-baseline gap-2 text-[15.5px] font-bold text-text-primary mb-2">
        <span className="inline-flex items-center justify-center min-w-[1.6rem] h-[1.6rem] rounded-full bg-brand-primary text-white text-[12px] font-black">
          {num}
        </span>
        <span>{title}</span>
      </h2>
      <div className="text-[13.5px] leading-[1.95] text-text-secondary">
        {children}
      </div>
    </section>
  );
}

// =====================================================
// お問い合わせ窓口
// 運営者名・問い合わせ先メールアドレスが確定し次第ここを差し替えること。
// =====================================================
function PrivacyContact() {
  return (
    <div className="bg-bg-form/60 rounded-lg px-4 py-4 border border-border-default">
      <p>
        個人情報の取扱いおよび本方針に関するお問い合わせは、以下までご連絡ください。
      </p>
      <dl className="mt-3 text-[13px] leading-[1.9] space-y-1">
        <div className="flex gap-2">
          <dt className="font-bold text-text-primary min-w-[5.5rem]">
            サービス名
          </dt>
          <dd>VibesCareer</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-bold text-text-primary min-w-[5.5rem]">
            運営
          </dt>
          <dd>VibesCareer 運営事務局</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-bold text-text-primary min-w-[5.5rem]">
            受付時間
          </dt>
          <dd>平日 10:00 〜 19:00 (土日祝・年末年始を除く)</dd>
        </div>
      </dl>
      <p className="mt-3 text-[12px] text-text-muted leading-[1.8]">
        ※ お問い合わせ専用メールアドレスは現在準備中です。ご予約済みの方は、
        担当アドバイザーへ直接ご連絡ください。
      </p>
    </div>
  );
}
