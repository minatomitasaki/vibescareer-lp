# VibesCareer LP プロジェクト ハンドオフドキュメント

最終更新: 2026-04-28
このドキュメントは、別の AI エージェント / 開発者が本プロジェクトを引き継ぐための要約です。
詳細仕様は `design/SPEC.md`、当初ブリーフは `BRIEF.md` を参照してください。

---

## 1. プロジェクト概要

| 項目 | 内容 |
|---|---|
| サービス名 | VibesCareer（第二新卒向け人材紹介） |
| 運営会社 | ORGANIC GROUP（オーガニックグループ株式会社） |
| 代表 | 渡邉 大典 |
| 目的 | キャリア面談への送客（オプトインCV） |
| ターゲット | 20代前半〜後半の第二新卒（男女問わず） |
| 関連サービス | **VibesRadar**（外部診断、通常 ¥3,300 → LP経由で無料特典） |
| ドメイン | 未取得。当面 Vercel 自動発行ドメイン (`*.vercel.app`) |

### サービスの導線（要点）
診断コンテンツによる **自己理解 → 結果への納得 → 面談予約** で、第二新卒層の心理的ハードルを下げる。

---

## 2. ユーザーとの確定済み決定事項

| 項目 | 決定 |
|---|---|
| 作業ディレクトリ | `c:/Users/ORGANIC GROUP/Documents/claude-projects/vibescareer-lp/` |
| 着手順 | **A（堅実）**: ワイヤー忠実なデザイン → 実装の順 |
| メインカラー | **#FF6B00**（オレンジ） |
| アドバイザー名 | 5名目は **古澤 真波人**（BRIEF の「古塚」は誤り） |
| 開発ポート | **3100**（3000 はユーザーが他で使用） |
| ロゴ | クライアント未提供。**自作**（昇順3本バー＋上向き矢印 / SVG） |

---

## 3. 全体フロー（6画面）

```
1. 入口LP (/)
   ↓ [診断START！]
2. 診断 (/diagnosis)               Q1〜Q8 / 5段階リッカート
   ↓ [診断結果を見る →]
3. 分析中 (/analyzing)             3秒カウントダウン → 自動遷移
   ↓
4. 診断結果LP (/result/[id])       職種×職場 12パターン分岐
   ↓ [次へ進む]                   ※フォームは結果LPの最下部に内包
5. 日程調整 (/schedule)            TimeRex iframe
   ↓ TimeRex 予約完了
6. サンクス (/thanks)              LINE登録CTA
```

### 結果LPのID（職種×職場 = 12パターン）
- creative-speed / creative-stable
- support-speed / support-stable
- marketing-speed / marketing-stable
- planning-speed / planning-stable
- engineer-speed / engineer-stable
- sales-speed / sales-stable

---

## 4. 技術スタック

| 領域 | 採用技術 | バージョン |
|---|---|---|
| フレームワーク | **Next.js**（App Router / src ディレクトリ） | **16.2.4** |
| UIライブラリ | **React** | **19.2.4** |
| 言語 | TypeScript | 5.x |
| スタイル | **Tailwind CSS v4**（`@theme inline` 形式） | ^4 |
| フォント | Noto Sans JP（Google Fonts） | weights: 400/500/700/900 |
| ホスティング | Vercel | 未設定 |
| フォーム | Google Apps Script (GAS) → スプレッドシート | 未実装 |
| 日程調整 | TimeRex iframe 埋め込み | 未実装 |
| 計測 | Google Tag Manager → GA4 + Meta Pixel | 未実装 |

### 重要: Next.js 16 + Tailwind v4 の特徴
- `tailwind.config.js` は **使わない**。`src/app/globals.css` の `@theme inline { ... }` ブロックでトークンを定義する
- `--color-foo: #xxx;` の形で書けば、`bg-foo` `text-foo` 等のユーティリティクラスが自動生成される
- AGENTS.md にも「This is NOT the Next.js you know」と注意書きあり。`node_modules/next/dist/docs/` を参照すること

---

## 5. デザイントークン（実装済み）

`src/app/globals.css` に定義済み。

```css
/* ブランドカラー */
--color-brand-primary: #FF6B00;          /* メインオレンジ（CTA） */
--color-brand-primary-dark: #E55F00;     /* hover */
--color-brand-primary-light: #FFE5D1;    /* 背景アクセント */
--color-brand-accent: #1E73FF;           /* 結果LP職種名強調 */
--color-brand-accent-light: #E6F0FF;

/* サブCTA・補助カラー */
--color-cta-secondary: #22C55E;          /* VibesRadar特典CTA */
--color-cta-secondary-dark: #16A34A;
--color-cta-secondary-bg: #ECFDF5;
--color-line-green: #06C755;             /* LINE公式色 */

/* アクセント */
--color-accent-red: #FF3B3B;             /* 注釈・赤丸バッジ */
--color-accent-yellow: #FFD700;
--color-accent-soft-green: #BCEAB6;      /* その他適職カード */

/* テキスト・背景 */
--color-text-primary: #1A1A1A;
--color-text-secondary: #4A4A4A;
--color-text-muted: #8A8A8A;
--color-border-default: #E5E5E5;
--color-bg-form: #FFF8E7;                /* フォーム背景ベージュ */
--color-bg-subtle: #F7F7F7;
```

### CTA ボタンの色分け
| 用途 | 色 | 例 |
|---|---|---|
| メインCTA（診断・送信） | オレンジ | 「診断START！」「次へ進む」 |
| 特典CTA（VibesRadar） | 緑 | 「いますぐチケットを受け取る」 |
| LINE登録 | LINE緑 | 「LINE登録はこちら」 |

### LP最大幅
**480px 中央寄せ**（モバイルファースト・スマホ流入想定）。`globals.css` の `.lp-container` クラスで実装。

---

## 6. プロジェクトファイル構造

```
vibescareer-lp/
├── BRIEF.md                          ← 当初プロジェクトブリーフ
├── HANDOFF.md                        ← このファイル
├── CLAUDE.md / AGENTS.md             ← Next.js 16 デフォルト指示
├── design/
│   ├── SPEC.md                       ← 画面仕様書（最重要、必ず読む）
│   ├── 01_entry-lp.png.png           ← Figma エクスポート（縮小版・参考）
│   ├── 02_diagnosis.png
│   ├── 03_analyzing.png
│   └── 04_result-lp.png
├── src/
│   ├── app/
│   │   ├── layout.tsx                ← Noto Sans JP / lang="ja"
│   │   ├── globals.css               ← Tailwind v4 トークン定義
│   │   └── page.tsx                  ← 入口LP（ヒーロー部分のみ実装、後述の理由で要差し替え）
│   └── components/
│       ├── Logo.tsx                  ← VibesCareer ロゴ（昇順3本バー + 矢印 SVG）
│       └── illustrations/            ← 自作SVGイラスト（クオリティ低い、要差し替え）
│           ├── HeroBusinessman.tsx
│           ├── HeroStairs.tsx
│           ├── PhoneCharacters.tsx
│           └── TeamFour.tsx
├── public/                           ← 画像素材未配置
├── package.json                      ← scripts.dev = "next dev -p 3100"
├── postcss.config.mjs
├── next.config.ts
└── tsconfig.json
```

---

## 7. 各画面の仕様（要点）

詳細は `design/SPEC.md` 参照。以下は要点のみ。

### 入口LP (/)
3セクション構成：
1. **ヒーロー**: 吹き出し / 「適職・適正年収 15秒診断」 / 訴求バッジ3つ（赤丸円形、二重線）/ 階段イラスト / CTA
2. **15秒診断でわかること**: 3ステップカード（赤枠角丸＋番号丸印） / CTA
3. **権威性訴求**: 「77万人」「2026年最新の適性診断」 / ★箇条書き3つ / CTA

### 診断 (/diagnosis)
- ヘッダー: オレンジ帯「適職×適正年収診断」+ プログレスバー（X/8）
- Q1〜Q8 の5段階リッカート（円形ラジオボタン）
- 仮スコアリング: Q1,Q2,Q5,Q6 → 職種軸 / Q3,Q4,Q7,Q8 → 職場軸
- CTA「診断結果を見る →」

### 分析中 (/analyzing)
- 「分析中...」+ 「残り◯秒で完了します。」
- **3秒カウントダウン後に自動遷移**

### 診断結果LP (/result/[id])  ← 最重要・最大規模
**可変ブロック（職種×職場 12パターンで差し替え）**:
1. 診断結果ヘッダー（青枠の職種名 + 適正年収オレンジボックス）
2. 【あなたの持ち味】
3. 【プロからのアドバイス】
4. 【その他の適職】（緑カード × 2、横並び。ランキング形式不採用）

**固定ブロック**:
5. VibesRadar 特典カード（¥3,300 → ¥0、緑CTA「いますぐチケットを受け取る」）
6. アドバイザー紹介 5名（渡邉・松下・三浦・山内・古澤）
7. 第２新卒の転職成功事例 4件（Before/After年収＋UPバッジ）
8. 取り扱い企業 5,000社（Timee/MEDLEY/AnyMind/Mile他、横スクロール）
9. VibesRadar 特典カード（**2回目・再掲**）
10. 悩み訴求（4つの悩みカード）
11. 悩みの原因（3人に1人が早期離職）
12. 意気込みコピー
13. サービス紹介
14. 転職成功までのロードマップ（3 STEP）
15. VibesRadar 特典カード（**3回目・再掲**）
16. FAQ 7問
17. ラストメッセージ（渡邉氏）
18. **フォーム**（結果LPに内包・お名前/メール/電話・GAS送信）

### 日程調整 (/schedule)
- 「初回カウンセリングの日程調整」
- TimeRex iframe 埋め込み
- 予約完了で `/thanks` へ

### サンクス (/thanks)
- 「ご予約ありがとうございます」
- 予約日程表示
- ▼今後の流れ（VibesRadar受検 → カウンセリング → キャリア設計）
- LINE登録CTA「LINE登録はこちら」

---

## 8. 進捗状況

### ✅ 完了
- [x] BRIEF.md / SPEC.md 作成
- [x] 全画面の仕様化（Figmaから読み取り）
- [x] Next.js 16 + Tailwind v4 プロジェクト初期化
- [x] デザイントークンを globals.css に定義
- [x] VibesCareer ロゴ作成（昇順3本バー + 上向き矢印 SVG）
- [x] dev server (port 3100) 起動確認
- [x] **入口LPのヒーロー部分のみ** 暫定実装

### ⚠️ 部分的に実装済み（クオリティ要再考）
- [~] **入口LPのヒーローセクション**:
  - レイアウト・テキスト・装飾（吹き出し、二重円バッジ、青ダブルアンダーライン、立体CTA）は実装済み
  - **しかし自作SVGイラストのクオリティが低く、ユーザーから「全然だめ」と却下された**
  - イラスト素材を差し替える必要あり

### ❌ 未着手
- [ ] 入口LP Section 2（15秒診断でわかること）
- [ ] 入口LP Section 3（権威性訴求）
- [ ] 診断ページ（/diagnosis）
- [ ] 分析中ページ（/analyzing）
- [ ] 診断結果LP（/result/[id]）
- [ ] 日程調整ページ（/schedule）
- [ ] サンクスページ（/thanks）
- [ ] 診断ロジック本実装（仮: Q1,Q2,Q5,Q6→職種 / Q3,Q4,Q7,Q8→職場）
- [ ] 12パターン結果データのJSON整備
- [ ] フォーム → GAS連携
- [ ] TimeRex iframe 埋め込み
- [ ] GTM 設置（GA4 + Meta Pixel）
- [ ] 取り扱い企業ロゴ（仮 → 本番差し替え）
- [ ] CMS導入（運用者向けコンテンツ編集 / microCMS等を想定）
- [ ] Vercel 連携・自動デプロイ

---

## 9. 残課題（テキスト・素材レベル）

ユーザーから書き起こし/差し替えが必要な項目：
- [ ] アドバイザー4「山内 那津子」氏のキャッチコピー・経歴（現在は松下氏の流用）
- [ ] アドバイザー1 渡邉氏の所属歴「株式会社あした」表記の正式名称確認
- [ ] アドバイザー5 古澤氏の担当領域「浦邸落材」の正式表記確認
- [ ] 転職成功事例 3・4件目の本文（現在 `hogehoge` プレースホルダ）
- [ ] 転職成功事例の年収UP額のバラつかせ（現在4件すべて180万UP → 100/150/200万UP等推奨）
- [ ] 取り扱い企業の本番ロゴ
- [ ] ヒーロー部分の数字出典（2,400社・5,000人 の根拠）
- [ ] 「3人に1人が早期離職」統計の正確な出典明記
- [ ] FAQ 7問の最終確認

---

## 9.5. 🔴 本番リリース前の法的・運用要件（フッター関連）

**現状フッターは削除されている**（[src/app/page.tsx](src/app/page.tsx) のコメント参照）。
本番公開前に必ずフッターを復活させ、下記の法的に必要なリンクを設置すること。

### 必須項目（人材紹介事業のため）

| 項目 | 必須度 | 内容・備考 |
|---|---|---|
| **特定商取引法に基づく表記** | 🔴 必須 | 課金がなくても、人材紹介業の法的責任表示として推奨 |
| **プライバシーポリシー** | 🔴 必須 | フォームで個人情報（氏名・メール・電話）を取得するため必須 |
| **有料職業紹介事業許可番号** | 🔴 必須 | 厚労省登録番号（「許○○-○○○○○○○」形式）を必ず表示 |
| **個人情報の取扱いについて** | 🔴 必須 | フォーム送信前の同意取得 + フッターからのリンク |
| 会社概要 | 🟡 推奨 | 信頼性向上 |
| 利用規約 | 🟡 推奨 | 診断結果の取扱い・サービス利用条件 |
| 運営者情報 | 🟡 推奨 | 「運営: ORGANIC GROUP（オーガニックグループ株式会社）」 |

### 関連ページの実装も必要

- `/privacy` — プライバシーポリシー本文
- `/terms` — 利用規約本文
- `/tokushoho` — 特定商取引法に基づく表記
- `/company` — 会社概要（既存サイトへの外部リンクでも可）

### フォーム送信時の同意チェック

[src/app/result/[id]/page.tsx](src/app/result/[id]/page.tsx)（未実装）に内包される
フォームには、送信ボタン上に **「個人情報の取扱いに同意する」チェックボックス** を必須実装。

---

## 10. 重要な引き継ぎポイント・学び

### ⚠️ 過去にやって失敗したこと
1. **絵文字（🔍📈👨‍💼）でイラストを代用** → 「Figmaのイメージと全然違う」と却下
2. **SVG で自作したフラットイラスト** → 「全然だめ」と却下。AIが描くSVG人物画はクオリティに限界がある
3. **ポート3000で起動** → ユーザーが他のテスト用で使用していたため衝突。**3100に変更**

### 💡 イラスト・画像の調達方針
本AIエージェントは画像生成ができない。以下のいずれかでクオリティを担保すること：
- **(推奨) Figma の本物イラストを PNG/SVG エクスポートして `public/images/` に配置**
- 無料素材サイト（unDraw / Loose Drawing / freepik）から流用
- ユーザーが Midjourney / DALL-E / Adobe Firefly 等で生成 → 組み込み

### 💡 デザインの参考サイト
ユーザーがデザインの方向性として **https://tarushiru.jp/career01** を参照したいと言っている。
本AIから WebFetch では JS レンダリング後のコンテンツが取れず、タイトルしか読めなかった。
**ユーザーにスクリーンショットを依頼する** のが現実的。

### 💡 Cursor の Visual Editor 機能
ユーザーは Cursor の Inspect/Edit モードで自分でも CSS や Tailwind クラスを直接編集できる。
本AIが書いたコードを後でユーザーが直接調整する可能性がある。
- → コードは **読みやすく、Tailwindクラスを直書きする** 方がユーザーが触りやすい
- → 過度な抽象化（コンポーネント細分化など）は避ける

### 💡 開発時編集 vs 運用時CMS
- **開発時の編集**: Claude Code との対話 + Cursor Visual Editor で対応可（追加実装不要）
- **運用時のCMS**: 別途実装が必要。**未決定**（候補: microCMS / Tina CMS / Builder.io）
  - 第二新卒向けLPの運用想定なら **microCMS（日本語UI）** が第一候補

### 💡 結果LPと診断ロジックの本実装
- 12パターンの結果テキストはユーザーがワイヤーから読み取り → 後で本実装に差し替え
- 仮スコアリング: Q1,Q2,Q5,Q6 → 職種軸 / Q3,Q4,Q7,Q8 → 職場軸
- 本実装はユーザーと共同設計予定

---

## 11. 即座に着手できるタスク

引き継ぎ後、以下から優先度順に進めることを推奨：

### 優先度 高
1. **イラスト素材の調達方針をユーザーと再確定する**
   - 現在の自作SVGは却下されている
   - Figma エクスポート / 素材サイト / AI生成 のどれか
2. **入口LP のヒーロー部分のイラスト差し替え**
   - 素材確定後、`public/images/` に配置 → `<Image>` で読み込み
3. **入口LP Section 2（15秒診断でわかること）の実装**
4. **入口LP Section 3（権威性訴求）の実装**

### 優先度 中
5. 診断ページ・分析中ページ・サンクスページの実装（軽量）
6. 診断結果LP の固定ブロック実装
7. フォーム → GAS連携
8. TimeRex iframe 埋め込み

### 優先度 低（本実装フェーズ）
9. 12パターン結果データのJSON整備＋本ロジック実装
10. CMS導入
11. GTM 設置
12. Vercel 本番デプロイ

---

## 12. 開発・確認手順

```bash
# 開発サーバ起動（port 3100）
cd "c:/Users/ORGANIC GROUP/Documents/claude-projects/vibescareer-lp"
npm run dev

# ブラウザで確認
# → http://localhost:3100
```

ホットリロード対応。コードを編集すると自動でブラウザに反映される。

---

## 13. 参考リンク

- 当初ブリーフ: `BRIEF.md`
- 詳細仕様書: `design/SPEC.md`
- Figma エクスポート画像: `design/*.png`
- 参考サイト（ユーザー推奨）: https://tarushiru.jp/career01
- Figma URL: https://www.figma.com/design/PgVpVebR6wfm8YYAVcy4G9/

---

以上。このドキュメントと `design/SPEC.md` を読めば、引き継ぎ後すぐに作業を再開できます。
