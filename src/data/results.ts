// 診断結果LP のパターン別データ
// 職種 (6) × 職場 (2) = 12 パターン
//
// 現在は creative-speed のみ SPEC.md の例文を実装、他はプレースホルダ。
// 本実装時はユーザー監修のテキストに差し替える。
//
// 12 パターンの id:
//   creative-speed / creative-stable
//   support-speed  / support-stable
//   marketing-speed / marketing-stable
//   planning-speed / planning-stable
//   engineer-speed / engineer-stable
//   sales-speed    / sales-stable

export type JobType =
  | "creative"
  | "support"
  | "marketing"
  | "planning"
  | "engineer"
  | "sales";

export type WorkplaceType = "speed" | "stable";

export type ResultId = `${JobType}-${WorkplaceType}`;

export type OtherJob = {
  name: string;
  description: string;
};

export type ResultData = {
  id: ResultId;
  jobType: JobType;
  workplaceType: WorkplaceType;
  /** 青枠ボックス上の小さなサブテキスト (青字)。職場タイプで変動。 */
  workplaceSubLabel: string;
  /** 青枠ボックスのメインテキスト (大・青字)。職種で変動。 */
  jobLabel: string;
  /** 適正年収レンジ。職種×職場で変動。 */
  salaryRange: string;
  /** あなたの持ち味の本文 */
  strength: string;
  /** プロからのアドバイス本文 */
  advice: string;
  /**
   * その他の適職として表示する 2 つの職種タイプ (デフォルト 2 位 3 位)。
   * クライアント側で localStorage の診断結果 (jobDistances) があれば
   * その人専用の 2 位 3 位に差し替えられる。
   */
  otherJobs: [JobType, JobType];
};

// -----------------------------------------------------------------------------
// 6 職種それぞれの「その他の適職」用テキスト
// メイン職種以外として表示する際に再利用する
// -----------------------------------------------------------------------------
export const JOB_OTHER_DESCRIPTION: Record<JobType, OtherJob> = {
  creative: {
    name: "クリエイティブ職",
    description:
      "独自の発想や感性を起点に、自分なりの視点でアイデアを形に変えていく職種。表現や企画の領域で価値を生み出します。",
  },
  support: {
    name: "サポート職",
    description:
      "人の声に耳を傾け、組織と人のあいだに立ちながら、安心して働ける環境を整える職種。人事・労務などが該当します。",
  },
  marketing: {
    name: "マーケティング職",
    description:
      "市場とユーザーを読み解き、数字と感覚の両方を行き来しながら、商品やサービスの届け方を設計する職種。",
  },
  planning: {
    name: "企画・経営職",
    description:
      "事業や組織の全体像を俯瞰し、戦略や次の一手を構想して周囲を動かす職種。経営企画・事業企画などが該当します。",
  },
  engineer: {
    name: "エンジニア職",
    description:
      "技術を深く掘り下げ、仕組みを設計・実装によって形にする職種。プロダクトやシステムの土台を支えます。",
  },
  sales: {
    name: "セールス職",
    description:
      "相手の課題や本音を引き出し、信頼関係を積み重ねながら提案を成果に変える職種。法人・個人問わず活躍できます。",
  },
};

// -----------------------------------------------------------------------------
// 職場タイプ別のサブラベル (青枠ボックスの上の小さな青字)
// -----------------------------------------------------------------------------
const WORKPLACE_SUB_LABEL: Record<WorkplaceType, string> = {
  speed: "スピード感MAX！勢いある職場の",
  stable: "安定感◎！じっくり腰を据える職場の",
};

// -----------------------------------------------------------------------------
// 職種タイプ別のメインラベル (青枠ボックスの大きな青字)
// -----------------------------------------------------------------------------
const JOB_LABEL: Record<JobType, string> = {
  creative: "クリエイティブ職",
  support: "サポート職",
  marketing: "マーケティング職",
  planning: "企画・経営職",
  engineer: "エンジニア職",
  sales: "セールス職",
};

// -----------------------------------------------------------------------------
// 12 パターンのデータ本体
// -----------------------------------------------------------------------------
export const RESULT_DATA: Record<ResultId, ResultData> = {
  // ===== creative =====
  "creative-speed": {
    id: "creative-speed",
    jobType: "creative",
    workplaceType: "speed",
    workplaceSubLabel: WORKPLACE_SUB_LABEL.speed,
    jobLabel: JOB_LABEL.creative,
    salaryRange: "500〜600万円",
    strength:
      "あなたは、自分の中にある「こうしたら面白い」という感覚を、形にして人に届けることができる人です。流行や正解を追いかけるのではなく、自分の視点や違和感を起点にアイデアを膨らませ、それを伝わるカタチに落とし込めるのが強みです。スピード感のある環境では、その発想と実行力が一気に開花します。",
    advice:
      "あなたに向いているのは、決まった手順を正確に繰り返す職場ではなく、ゼロから企画を立ち上げ、世に問うサイクルが速い職場です。意思決定が早く、自分の案がそのまま世に出るスタートアップや新規事業の現場で、感性と行動力の両方を活かしましょう。一人で抱え込むより、仲間と意見をぶつけ合いながら磨き上げるスタイルが合っています。",
    otherJobs: ["marketing", "support"],
  },
  "creative-stable": {
    id: "creative-stable",
    jobType: "creative",
    workplaceType: "stable",
    workplaceSubLabel: WORKPLACE_SUB_LABEL.stable,
    jobLabel: JOB_LABEL.creative,
    salaryRange: "480〜580万円",
    strength:
      "あなたは、一つのテーマを深く掘り下げて、丁寧にアウトプットを磨き上げられる人です。瞬発的な発想だけでなく、何度も試作して仕上げていく粘り強さを持っています。腰を据えて制作に集中できる環境では、表現の解像度がぐっと上がり、長く愛される作品やプロダクトを生み出す力を発揮します。",
    advice:
      "ベンチャーのような変化の速い現場よりも、ブランドや世界観を時間をかけて育てていける老舗企業・インハウスクリエイティブ・受託制作会社の中核がフィットします。短期的な数字だけで評価されない、品質や継続性を大切にする職場で、専門性を深めながらキャリアを積み上げていきましょう。",
    otherJobs: ["marketing", "support"],
  },

  // ===== support =====
  "support-speed": {
    id: "support-speed",
    jobType: "support",
    workplaceType: "speed",
    workplaceSubLabel: WORKPLACE_SUB_LABEL.speed,
    jobLabel: JOB_LABEL.support,
    salaryRange: "420〜520万円",
    strength:
      "あなたは、人の話に耳を傾け、相手の立場に立って考えるのが自然にできる人です。困っている人がいると放っておけず、関係者の間に入って物事を前に進める役回りが得意。組織が急成長して混乱しがちな場面でも、人と人をつなぎ直しながら、現場の空気をやわらかく保つ力を持っています。",
    advice:
      "ルーチンを淡々とこなす職場よりも、組織が伸び盛りで毎日のように仕組みが変わるような環境が向いています。スタートアップや急成長企業の人事・採用・労務といったポジションで、制度づくりや人材集めの両方に関わると力を発揮します。「人を支える」ことを軸に、変化の真ん中で働く道を選びましょう。",
    otherJobs: ["sales", "marketing"],
  },
  "support-stable": {
    id: "support-stable",
    jobType: "support",
    workplaceType: "stable",
    workplaceSubLabel: WORKPLACE_SUB_LABEL.stable,
    jobLabel: JOB_LABEL.support,
    salaryRange: "400〜500万円",
    strength:
      "あなたは、相手の感情の機微に敏感で、安心感を与えるコミュニケーションができる人です。短期的な成果よりも、信頼関係を長く積み重ねることにやりがいを感じます。誰かのキャリアや働き方に長く寄り添う場面で、地に足のついた支援ができるのがあなたの大きな武器です。",
    advice:
      "あなたには、組織の歴史が長く、社員一人ひとりと長期的に向き合う風土のある職場が向いています。大手企業や老舗企業の人事・労務、社内コミュニケーション、制度運用といったポジションで、土台を支える仕事に深く根を張りましょう。派手さよりも、誠実さと継続性が評価される環境で本領を発揮します。",
    otherJobs: ["sales", "marketing"],
  },

  // ===== marketing =====
  "marketing-speed": {
    id: "marketing-speed",
    jobType: "marketing",
    workplaceType: "speed",
    workplaceSubLabel: WORKPLACE_SUB_LABEL.speed,
    jobLabel: JOB_LABEL.marketing,
    salaryRange: "520〜650万円",
    strength:
      "あなたは、数字を読み解きながら「人の心がどう動くか」までイメージできる、両利きのタイプです。データを見るだけ・気持ちを語るだけのどちらにも偏らず、ロジックと共感を行き来できるのが強み。打ち手をすぐに試して数字で検証していくサイクルにも自然と乗れる人です。",
    advice:
      "あなたに向いているのは、施策のリリース・効果検証・改善が短いサイクルで回る現場です。スタートアップや事業会社のグロースチーム、新規プロダクトのマーケなど、自分の打ち手で売上やユーザー数が動く環境を選びましょう。小さく作って速く回す姿勢が評価されるカルチャーで、強みが最大化されます。",
    otherJobs: ["creative", "support"],
  },
  "marketing-stable": {
    id: "marketing-stable",
    jobType: "marketing",
    workplaceType: "stable",
    workplaceSubLabel: WORKPLACE_SUB_LABEL.stable,
    jobLabel: JOB_LABEL.marketing,
    salaryRange: "500〜620万円",
    strength:
      "あなたは、目の前の数字に振り回されず、半年先・一年先のブランドや市場の姿を描いて動ける人です。緻密に調査し、戦略を組み立て、関係部署を巻き込んでじっくり実行に移す力があります。短期施策よりも、土台を作り続ける仕事で深い充実感を得るタイプです。",
    advice:
      "向いているのは、ブランドや商品を長く育てている事業会社・大手メーカー・インハウスマーケ部門です。広告代理店のような瞬発力勝負よりも、市場理解と戦略性が問われるブランドマーケティングや事業企画系のポジションで、戦略の精度をじっくり磨いていきましょう。",
    otherJobs: ["creative", "support"],
  },

  // ===== planning =====
  "planning-speed": {
    id: "planning-speed",
    jobType: "planning",
    workplaceType: "speed",
    workplaceSubLabel: WORKPLACE_SUB_LABEL.speed,
    jobLabel: JOB_LABEL.planning,
    salaryRange: "550〜700万円",
    strength:
      "あなたは、自分の中にビジョンを持ち、それを言葉にして人を動かせる人です。物事の全体像を素早く掴み、優先順位を決め、足りないピースを見つけてはチームに役割を渡す。経営者や事業責任者と並走しながら、「次の一手」を一緒に考えるポジションでこそ、本来の力が発揮されます。",
    advice:
      "あなたに向いているのは、組織のフェーズが日々変わっていくスタートアップや、新規事業の立ち上げチームです。社長室・経営企画・事業企画といった役回りで、戦略を描くだけでなく、自分自身も現場に降りて手を動かす働き方が合っています。経営目線で物事を考える経験を早く積めばあるほど、市場価値も飛躍します。",
    otherJobs: ["sales", "engineer"],
  },
  "planning-stable": {
    id: "planning-stable",
    jobType: "planning",
    workplaceType: "stable",
    workplaceSubLabel: WORKPLACE_SUB_LABEL.stable,
    jobLabel: JOB_LABEL.planning,
    salaryRange: "520〜680万円",
    strength:
      "あなたは、組織全体を俯瞰して見渡し、リスクとリターンを冷静に天秤にかけられる人です。短期の派手な動きよりも、5 年・10 年単位での会社の方向性を考えるのが得意。データと現場感覚の両方を踏まえ、ぶれない判断軸で意思決定をサポートできるのが強みです。",
    advice:
      "向いているのは、中堅以上の事業会社や歴史のある企業の経営企画・経営管理ポジションです。意思決定のサイクルは長めでも、その分一つひとつの判断が大きなインパクトを持つ環境で、戦略立案・予算管理・組織設計の経験を着実に積みましょう。落ち着いた立ち位置から会社を支えるキャリアが向いています。",
    otherJobs: ["sales", "engineer"],
  },

  // ===== engineer =====
  "engineer-speed": {
    id: "engineer-speed",
    jobType: "engineer",
    workplaceType: "speed",
    workplaceSubLabel: WORKPLACE_SUB_LABEL.speed,
    jobLabel: JOB_LABEL.engineer,
    salaryRange: "550〜700万円",
    strength:
      "あなたは、未知の技術や仕様書を前にしても臆さず、自分で手を動かしながら理解していけるタイプです。完璧な計画よりも、小さく作って動かしてみる中で答えを見つける姿勢が強み。一人で抱え込まず、チームと情報を共有しながら最短距離でプロダクトを育てられる人です。",
    advice:
      "あなたに向いているのは、Web 系スタートアップや SaaS プロダクトの開発チームです。役割を区切らずフロント・バックエンド・インフラを横断しながら、必要に応じてプロダクト設計にも関われる環境を選びましょう。技術選定の自由度が高く、自分の判断がプロダクトに直結する規模感のチームが、成長を加速させます。",
    otherJobs: ["planning", "creative"],
  },
  "engineer-stable": {
    id: "engineer-stable",
    jobType: "engineer",
    workplaceType: "stable",
    workplaceSubLabel: WORKPLACE_SUB_LABEL.stable,
    jobLabel: JOB_LABEL.engineer,
    salaryRange: "500〜650万円",
    strength:
      "あなたは、複雑なシステムをきちんと構造化して整理し、長く運用できる形に落とし込める人です。目先の派手な成果より、品質・テスト・保守性といった「あとから効いてくる」要素を大切にできるのが強み。地に足のついた設計とコードで、組織のシステム基盤を支える役割が向いています。",
    advice:
      "あなたには、大規模な社内システムやインフラを扱う事業会社・SIer・大手 IT 企業のエンジニアリング部門が向いています。短いリリースサイクルで突っ走るより、要件定義から設計・実装・運用までを丁寧に積み上げていく現場で、技術力と信頼を同時に積み重ねていきましょう。長く一つのプロダクトに関わるキャリアが向いています。",
    otherJobs: ["planning", "creative"],
  },

  // ===== sales =====
  "sales-speed": {
    id: "sales-speed",
    jobType: "sales",
    workplaceType: "speed",
    workplaceSubLabel: WORKPLACE_SUB_LABEL.speed,
    jobLabel: JOB_LABEL.sales,
    salaryRange: "500〜650万円",
    strength:
      "あなたは、初対面の相手とも自然に距離を縮め、相手の本音を引き出しながら提案を組み立てられる人です。台本通りの営業ではなく、その場で相手の課題に合わせて話を組み立てる柔軟さがあります。数字目標があると逆に燃えるタイプで、小さな成功体験を積み重ねながら一気に成長できる人材です。",
    advice:
      "向いているのは、商材も組織も日々変化する SaaS 系・人材系・新規事業系のスタートアップやベンチャー営業職です。新規開拓・インサイドセールス・フィールドセールス・カスタマーサクセスといった役割を行き来しながら、自分の営業スタイルを早めに確立しましょう。インセンティブや裁量が大きい環境ほど力を発揮します。",
    otherJobs: ["support", "planning"],
  },
  "sales-stable": {
    id: "sales-stable",
    jobType: "sales",
    workplaceType: "stable",
    workplaceSubLabel: WORKPLACE_SUB_LABEL.stable,
    jobLabel: JOB_LABEL.sales,
    salaryRange: "470〜600万円",
    strength:
      "あなたは、相手と一度信頼関係を結ぶと、長期に渡って深く付き合っていけるタイプです。短期勝負の押し売りではなく、相手の事業や状況をじっくり理解しながら、何度も提案を重ねていける粘り強さが強み。担当顧客から「またあなたにお願いしたい」と言われ続ける、息の長い営業に向いています。",
    advice:
      "あなたには、メーカー・金融・大手商社といった、長期取引が前提の業界の法人営業がフィットします。担当領域が広く、すぐに数字が出なくても腰を据えて関係構築できる環境で、業界知識と人脈の両方を積み上げていきましょう。同じ顧客を 5 年・10 年と担当する中で、確かなプロフェッショナルになっていけます。",
    otherJobs: ["support", "planning"],
  },
};

/** すべての結果 id を返す (generateStaticParams 用) */
export function allResultIds(): ResultId[] {
  return Object.keys(RESULT_DATA) as ResultId[];
}

/** id が有効な ResultId か判定 */
export function isResultId(id: string): id is ResultId {
  return id in RESULT_DATA;
}
