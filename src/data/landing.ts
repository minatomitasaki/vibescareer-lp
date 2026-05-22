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
  /** 肩書き。VibesCareer 代表のみ表示し、他のアドバイザーでは未設定 */
  role?: string;
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
      "人事コンサル会社にて50社以上の人事制度設計・組織改革を支援",
      "未経験でWEBマーケターに転職後、1年で約4億円の個人売上を創出",
      "人事責任者として100名超の採用・育成を牽引後、VibesCareerを創業",
    ],
  },
  {
    id: "matsushita",
    name: "松下 敬亮",
    catchphrase: "運任せの転職ではなく マッチ率 100% の転職を約束します。",
    bio: [
      "大阪市立大学（現・大阪公立大学）卒",
      "トヨタ自動車にてグローバルマーケティングに従事、海外市場での販売戦略を担当",
      "ベンチャー企業に転職後、わずか2年でグループ会社の代表取締役に就任",
      "マーケ戦略を自ら設計・実行し、年商50億円企業へと成長させた",
    ],
  },
  {
    id: "miura",
    name: "三浦 美咲",
    catchphrase:
      "一人では気づけなかった可能性まで一緒に丁寧に見つけていきます。",
    bio: [
      "一橋大学卒",
      "大手アパレルにてブランドマネージャーとして複数ブランドのP&L管理・戦略立案を担当",
      "マーケターに転職後、医薬品・サプリ事業の事業責任者へ抜擢",
      "福岡マーケ支部を立ち上げ、統括責任者として組織を牽引",
    ],
  },
  {
    id: "furusawa",
    name: "古澤 真波人",
    catchphrase:
      "転職しないという選択もある。あなたにとって最善の道を考えます。",
    bio: [
      "九州大学法学部卒",
      "レバレジーズで新卒・第二新卒採用、キャリアアドバイザー",
      "年商100億の大手通販会社に転職後、HR領域と通販事業を牽引",
      "パーソナル適性検査『VibesRadar』の開発責任者を務める",
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
      "社会人3年目で2社目。「今の会社に長くいたくない。でも次は？」と焦る中、VibesCareer 代表の渡邉さんに支援いただきました。強みやポテンシャルを見極めた上で最適な転職先を提案いただき、面接対策も的確。未経験ながらマーケターとしての素質をアピールでき、無事内定。本当に感謝しています。",
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
    body:
      "新聞記者にやりがいはあったものの、「書く力を違う形で活かしたい」と転職を決意。他社では同業界の求人ばかり紹介され、可能性を狭められている気がしていました。VibesCareer では VibesRadar で「言語化力 × 論理構成力」という強みを可視化し、未経験のセールスライティング業界への挑戦を後押し。応募書類から面接対策まで伴走いただき、第一志望から内定獲得。文章で「人を動かす」面白さを毎日感じています。",
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
    body:
      "空港免税店で接客・販売の最前線にいましたが、「ゼロから事業を作る側に回りたい」気持ちが強くなる一方。未経験では無謀かと諦めかけたところ、VibesCareer のアドバイザーが私の経験を「現場感覚 × 顧客理解」という独自の強みに翻訳してくれました。VibesRadar での自己分析を踏まえたキャリア設計で自信を持って選考に臨み、第一志望から内定。今は事業をゼロから創る面白さに毎日刺激を受けています。",
  },
];

// -----------------------------------------------------------------------------
// 取り扱い企業 (Section 8) — 紹介企業ロゴ群
// 各企業の公式ロゴを public/images 配下に配置して 2 列グリッドで表示する。
// -----------------------------------------------------------------------------
export type PartnerLogo = {
  name: string;
  file: string;
};

export const PARTNER_LOGOS: PartnerLogo[] = [
  { name: "BizReach", file: "/images/partner-logo-bizreach.svg" },
  { name: "Speee", file: "/images/partner-logo-speee.png" },
  { name: "Sansan", file: "/images/partner-logo-sansan.svg" },
  { name: "Leverages", file: "/images/partner-logo-leverages.svg" },
  { name: "DYM", file: "/images/partner-logo-dym.svg" },
  { name: "FLUX", file: "/images/partner-logo-flux.svg" },
  { name: "kaonavi", file: "/images/partner-logo-kaonavi.svg" },
  { name: "UPSIDER", file: "/images/partner-logo-upsider.svg" },
  { name: "ASSIGN", file: "/images/partner-logo-assign.svg" },
  { name: "Nahato", file: "/images/partner-logo-nahato.png" },
];
