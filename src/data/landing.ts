// 診断結果LP の固定ブロック用データ
// (Section 5-18 で使用される)
// 仕様: design/SPEC.md セクション 4 を参照
//
// 注: 本番テキスト・素材は要差し替え (HANDOFF.md 残課題参照)

// -----------------------------------------------------------------------------
// VibesRadar 特典カードの特徴 3 つ (Section 5/9/15 共通)
// -----------------------------------------------------------------------------
export const VIBES_RADAR_FEATURES = [
  {
    icon: "💎",
    title: "8 つのポテンシャルタイプ",
    desc: "あなたが潜在的に秘めている 8 つの「ポテンシャルタイプ」を可視化！",
  },
  {
    icon: "📊",
    title: "全 48 項目を測定",
    desc: "性格・価値観・志向性・ストレス耐性など全 48 項目を漏れなく測定！",
  },
  {
    icon: "🔍",
    title: "5 つのネガティブアラート",
    desc: "あなたの弱点もすべて丸わかり！5 つの「ネガティブアラート」で自己理解を深める！",
  },
] as const;

// -----------------------------------------------------------------------------
// アドバイザー 5 名 (Section 6)
// -----------------------------------------------------------------------------
export type Advisor = {
  id: string;
  role: string;
  name: string;
  catchphrase: string;
  bio: string[];
};

export const ADVISORS: Advisor[] = [
  {
    id: "watanabe",
    role: "VibesCareer 代表",
    name: "渡邉 大典",
    catchphrase: "あなたに秘められた才能を軸に最適なキャリア設計を構築します。",
    bio: [
      "神戸大学卒",
      "株式会社あした で人事コンサルタント",
      "オーガニックグループ人事部長で 100 人規模の採用・社員育成",
      "社内ベンチャーで VibesCareer を創業",
    ],
  },
  {
    id: "matsushita",
    role: "薬院オーガニック 代表",
    name: "松下 敬亮",
    catchphrase: "運任せの転職ではなく マッチ率 100% の転職を約束します。",
    bio: [
      "大阪市立大学卒",
      "トヨタ自動車でグローバルマーケティング",
      "薬院オーガニックに転職後 2 年目で代表取締役",
      "売上 50 億円企業に成長",
    ],
  },
  {
    id: "miura",
    role: "ORGANIC GROUP 事業責任者",
    name: "三浦 美咲",
    catchphrase:
      "一人では気づけなかった可能性まで一緒に丁寧に見つけていきます。",
    bio: [
      "一橋大学卒",
      "有名アパレルでブランドマネージャー",
      "オーガニックグループ転職後、医薬品・サプリ事業の責任者",
    ],
  },
  {
    id: "furusawa",
    role: "ORGANIC GROUP 事業責任者",
    name: "古澤 真波人",
    catchphrase:
      "転職しないという選択もある。あなたにとって最善の道を考えます。",
    bio: [
      "九州大学法学部卒",
      "レバレジーズで新卒・第二新卒採用、キャリアアドバイザー",
      "オーガニックグループに転職後、IR 領域・浦邸落材 の責任者",
    ],
  },
];

// -----------------------------------------------------------------------------
// 転職成功事例 4 件 (Section 7)
// -----------------------------------------------------------------------------
export type SuccessCase = {
  id: string;
  /** 仮名 (本番で実名 or 仮名に差し替え予定) */
  name: string;
  age: number;
  /** AI 生成 or 実写人物の写真パス。public/images 配下 */
  photo: string;
  /** BEFORE→AFTER + UPバッジを 1 枚に統合したインフォグラフィック画像 */
  salaryInfographic: string;
  /** 太字タイトル: "内定X社! ○○から△△へ" */
  title: string;
  beforeCompany: string;
  /** 年収 (万円単位の数値)。alt テキスト等で使う */
  beforeAmount: number;
  afterCompany: string;
  afterAmount: number;
  /** 年収差額 (万円単位の数値)。alt テキスト等で使う */
  salaryUpAmount: number;
  offers: string; // 例: "3 社"
  body: string;
};

export const SUCCESS_CASES: SuccessCase[] = [
  {
    id: "case1",
    name: "Yさん",
    age: 25,
    photo: "/images/success-case-1.png",
    salaryInfographic: "/images/success-case-1-salary.png",
    title: "内定3社! 電力会社から広告代理店プランナーへ",
    beforeCompany: "電力会社",
    beforeAmount: 420,
    afterCompany: "広告代理店",
    afterAmount: 600,
    salaryUpAmount: 180,
    offers: "3 社",
    body:
      "他社の転職支援サービスでは、同業種での転職ばかりを紹介する中、VibesCareer のアドバイザーさんは私の意思をくみ取って、未経験職種への挑戦を支援してくれました。その結果、第一志望の企業から内定を獲得。本当にやりたかった仕事ができて、毎日充実しています。",
  },
  {
    id: "case2",
    name: "Dさん",
    age: 24,
    photo: "/images/success-case-2.png",
    salaryInfographic: "/images/success-case-2-salary.png",
    title: "内定4社! 市役所公務員から Web マーケターへ未経験挑戦",
    beforeCompany: "市役所公務員",
    beforeAmount: 380,
    afterCompany: "Webマーケター",
    afterAmount: 480,
    salaryUpAmount: 100,
    offers: "4 社",
    body:
      "社会人3年目で2社目。「今の会社に長くいたくない。でも次は？」と焦る中、VibesCareer 代表の渡邉さんに支援いただきました。求人を紹介するだけで終わるサービスが多い中、ここでは自分の強みやポテンシャルを見極めながら、最適な転職先を提案いただけました。面接対策も的確で、未経験ながらもマーケターとしての素質をアピールできた結果、無事内定。本当に感謝しています。",
  },
  {
    id: "case3",
    name: "Nさん",
    age: 24,
    photo: "/images/success-case-3.png",
    salaryInfographic: "/images/success-case-3-salary.png",
    title: "内定3社! 新聞記者からセールスライターへ転身",
    beforeCompany: "新聞記者",
    beforeAmount: 400,
    afterCompany: "セールスライター",
    afterAmount: 470,
    salaryUpAmount: 70,
    offers: "3 社",
    // 仮テキスト・要差し替え (HANDOFF.md 残課題)
    body:
      "（仮）面接対策から内定後の交渉までしっかり伴走していただきました。文章で人を動かす仕事に挑戦できて毎日が楽しいです。",
  },
  {
    id: "case4",
    name: "Eさん",
    age: 26,
    photo: "/images/success-case-4.png",
    salaryInfographic: "/images/success-case-4-salary.png",
    title: "内定3社! 免税店スタッフから新規事業開発へ",
    beforeCompany: "空港免税店",
    beforeAmount: 370,
    afterCompany: "新規事業開発",
    afterAmount: 450,
    salaryUpAmount: 80,
    offers: "3 社",
    // 仮テキスト・要差し替え (HANDOFF.md 残課題)
    body:
      "（仮）自分のキャリアを言語化することから始められ、納得感を持って転職活動できました。新しい挑戦が本当に楽しい。",
  },
];

// -----------------------------------------------------------------------------
// 取り扱い企業 (Section 8) — 5,000 社以上、代表ロゴ群
// 本番では実ロゴ画像に差し替え。Phase 2 ではテキストプレースホルダで一旦表示。
// -----------------------------------------------------------------------------
export const PARTNER_COMPANIES = [
  "Timee",
  "MEDLEY",
  "Speee",
  "AnyMind",
  "楽ラクス",
  "パーソルキャリア",
  "シェアフル",
  "M&A総合研究所",
  "X Mile",
] as const;
