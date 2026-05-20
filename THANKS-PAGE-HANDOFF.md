# `/thanks` ページ デザイン調整 引継ぎ書

> このファイルは PC 別タブで Claude Code を起動して `/thanks` ページのデザイン調整を進めるためのものです。
> 「`THANKS-PAGE-HANDOFF.md` を読んで、続きから作業します」と伝えれば即作業開始できます。

---

## プロジェクト基本情報

| 項目 | 値 |
|---|---|
| パス | `C:\Users\minato_mitasaki\Documents\claude-projects\vibescareer-lp` |
| Git remote | `github.com/minatomitasaki/vibescareer-lp` (Public) |
| 本番 URL | `https://vibescareer-lp.vercel.app/thanks` |
| 自動デプロイ | main に push → Vercel が 60〜90 秒でビルド |

---

## 対象ファイル

| ファイル | 役割 |
|---|---|
| `src/app/thanks/page.tsx` | `/thanks` ページのメイン JSX |
| `src/app/globals.css` | グローバル CSS (Tailwind v4 + 自前クラス) |
| `src/app/layout.tsx` | 全ページ共通レイアウト (フォント設定など) |
| `src/components/Logo.tsx` | ロゴコンポーネント |

---

## `/thanks` ページの現状構造 (3 セクション構成)

```
<main className="lp-container bg-white">
  <header>           ← ロゴ + 下線オレンジグラデ
  <section>          ← (1) 完了見出し: ✓アイコン + 「ご予約ありがとうございます」 + 説明文
  <section>          ← (2) 今後の流れ: 3 STEP リスト (VibesRadar受検 → カウンセリング → キャリア設計)
  <section>          ← (3) LINE 登録 CTA: 「直通 LINE 登録はこちら」ボタン
</main>
```

### 現状の主な装飾

- 完了見出し: ✓ アイコン (オレンジ円) + 22px 見出し + 説明文 2 段落
- 今後の流れ: `bg-bg-form` のクリーム背景の枠内に、番号付きの 3 ステップ縦並び (各ステップは丸番号 + タイトル + 補足、ステップ間に下矢印 ↓)
- LINE CTA: 緑のボタン (`bg-line-green`) + 案内文
- 全体ヘッダーは入口LPと統一 (ロゴ + 下線オレンジグラデ)

### TODO 残し

- `LINE_REGISTER_URL = "https://line.me/R/ti/p/@vibescareer"` は仮値。本番 LINE 公式アカウントの URL に差し替え必要

---

## ブランドカラー・フォント (LP 全体で統一されている)

### カラー (globals.css の `:root` で定義)

| 変数 | 値 | 用途 |
|---|---|---|
| `--color-brand-primary` | `#ff6b00` | メインオレンジ (CTA / アクセント) |
| `--color-brand-primary-light` | `#ffe5d1` | 薄オレンジ (背景ハイライト) |
| `--color-text-primary` | (ほぼ黒) | 本文メイン |
| `--color-text-secondary` | (グレー寄り) | 本文サブ |
| `--color-text-muted` | (薄グレー) | 注釈 |
| `--color-bg-form` | (薄クリーム) | フォーム / 流れカードの背景 |
| `--color-line-green` | LINE 緑 | LINE CTA ボタン |

### グラデーション (LP 全体で頻出)

- 濃いオレンジ: `linear-gradient(135deg, #ffd9b3 0%, #ff8533 55%, #ff6b00 100%)`
- 薄いオレンジ: `linear-gradient(180deg, #FFFAF2 0%, #FFFFFF 100%)`

### フォント (`layout.tsx` で読み込み)

- 本文: `Noto Sans JP` (CSS 変数: `--font-noto-sans-jp`)
- 英字: `Inter` (CSS 変数: `--font-inter`、`--font-display` 経由で使用)
- セリフ (アドバイザーキャッチ専用): `Noto Serif JP` (CSS 変数: `--font-serif-jp`、`--font-serif` 経由)

---

## 他ページのデザイン傾向 (参考: 統一感を保つために)

### 結果LP (`/result/[id]`) で確立しているスタイル

- セクション見出しブロック (`.section-eyebrow-block`): 英字 eyebrow + メイン見出し + サブテキスト
- カード式コンテンツ:
  - `.concern-card` (CASE.01〜04): 白背景 / 角丸 / 軽い影 / 中央寄せ / オレンジ下線ラベル
  - `.service-point-card` (POINT.01〜03): 白背景 / 角丸 / 軽い影 / 左寄せ / オレンジ下線ラベル
  - `.advisor-card`: オレンジグラデのヘッダー帯 + 経歴ボックス
  - `.success-case-card`: 写真 + タイトル + インフォグラフィック画像 + 本文
- CTA ボタン:
  - `.btn-cta-radar` (緑系、VibesRadar 受け取り)
  - `.btn-cta-radar-orange` (オレンジ系)
  - `.btn-3d-orange`
  - すべて `cta-radar-pulse` で「ふわふわ」アニメ + `::after` でリング波動 (ホバー時も継続)
- マーキー要素 (横流れ):
  - `.partners-marquee-*` (ロゴ無限スクロール)
  - `.service-intro-marquee-*` (Section 13 上部の「VibesCareer」横流し)
- 背景装飾ドット: `.service-intro-decor-dot` (絶対配置、薄オレンジ)

### 全体トンマナ

- メインカラー: warm orange `#ff6b00`
- 背景: warm cream (`#FFFAF2`) ベース or 純白
- 装飾: 薄オレンジドット / マーキーテキスト / 細ペン線のイラスト
- アクセント色: 必要な箇所のみライトブルー `#7EC8E3` (悩み訴求の涙など)

---

## 既存の汎用 CSS クラス (`/thanks` で再利用候補)

| クラス | 用途 |
|---|---|
| `.section-eyebrow-block` | 英字 + メイン見出し + サブのブロック |
| `.section-eyebrow-block .en` | 英字ラベル (オレンジ太字) |
| `.section-eyebrow-block .ja` | 日本語メイン見出し |
| `.section-eyebrow-block .ja .marker` | 蛍光マーカー風アンダーライン |
| `.section-eyebrow-block .sub` | 補足テキスト |
| `.lp-container` | LP 幅制限 (max-width: 480px) |
| `.btn-cta-radar` / `.btn-cta-radar-orange` | CTA ボタン |
| `.btn-3d-orange` | 3D 風オレンジボタン |

---

## デザイン調整で考えられる方向性 (候補)

### A. 完了見出しをよりリッチに
- ✓ アイコンを大きく / アニメーション付き (チェックマークが描かれる演出)
- 紙吹雪 (confetti) 装飾を周りに散らす
- 「ご予約ありがとうございます」をマーカー風背景 + 大型フォント化
- 背景に warm cream のグラデーション

### B. 今後の流れをロードマップ風に
- 結果 LP の Section 14「ロードマップ」(`RoadmapSection`) と同じスタイルに揃える
- STEP 1〜3 をカード化 (`STEP X` ラベル + タイトル + 説明)
- ステップ間の ↓ をオレンジの太い線 or アニメーションに

### C. LINE CTA をブラッシュアップ
- 直通 LINE 感を出す装飾 (代表のミニ顔写真 / フキダシ)
- ボタンを `cta-pulse` 系のふわふわアニメ付きに
- 「優先対応」訴求を強化 (バッジ表示など)

### D. ヒーロー画像追加
- 完了見出しの上にお祝い系のイラスト (花束 / クラッカー / 笑顔の若手)
- `IMAGE-PROMPT-GUIDE.md` のテンプレに沿って生成 (`result-` のフラットベクター調と統一)

### E. 法務リンク追加 (Footer 化)
- 特商法 / プライバシー / 利用規約 / 会社概要 へのリンクを下部に
- ※ これらのページは未作成なので、404 を避けるため後回しでも OK

---

## 別タブで作業する際の注意点

### Git の流れ (競合回避)

1. 作業開始前に **pull** で最新を取得:
   ```bash
   git -C "C:/Users/minato_mitasaki/Documents/claude-projects/vibescareer-lp" pull origin main
   ```
2. `/thanks` ページ関連の編集 (`src/app/thanks/page.tsx`, `src/app/globals.css` の `/thanks` 関連スタイルだけ) に絞る
3. メインタブで作業中の他ファイル (主に `src/app/result/[id]/page.tsx` や `image-manifest.mjs`) は **触らない**
4. 編集が終わったら commit & push 前に **再度 pull**:
   ```bash
   git -C "..." pull --rebase origin main
   git -C "..." add -A
   git -C "..." commit -m "..."
   git -C "..." push origin main
   ```
5. もし conflict が出たら、`/thanks` ページ部分だけ自分の変更を残して解決

### 画像生成する場合

`IMAGE-PROMPT-GUIDE.md` の手法に従い、新規エントリを `scripts/image-manifest.mjs` の末尾に追加してから生成:

```bash
npm --prefix "C:/Users/minato_mitasaki/Documents/claude-projects/vibescareer-lp" run gen:images -- thanks-hero.png
```

ファイル名は `thanks-XXX.png` プレフィックスで揃えると分かりやすい。

---

## ローカル開発サーバーで確認したい時

```bash
npm --prefix "C:/Users/minato_mitasaki/Documents/claude-projects/vibescareer-lp" run dev
```

→ `http://localhost:3000/thanks` で確認

本番確認:
- `https://vibescareer-lp.vercel.app/thanks`

---

## 重要ドキュメント (関連)

| ファイル | 内容 |
|---|---|
| `THANKS-PAGE-HANDOFF.md` (これ) | `/thanks` 専用引継ぎ |
| `SESSION-HANDOFF.md` | プロジェクト全体の引継ぎ (現状サマリ) |
| `IMAGE-PROMPT-GUIDE.md` | 画像生成プロンプト設計ガイド (社員シェア用) |
| `IMAGE-GEN-HANDOFF.md` | 別タブで画像生成する際の引継ぎ |

---

## 起動時に Claude Code に渡す文章 (テンプレ)

```
THANKS-PAGE-HANDOFF.md を読んで、続きから作業します。
次は [完了見出しをリッチに / 今後の流れをロードマップ風に / LINE CTA 強化 / ヒーロー画像追加 / 等] をやりたい。
```

例:
```
THANKS-PAGE-HANDOFF.md を読んで、続きから作業します。
完了見出しを「結果LP の section-eyebrow-block」と同じトンマナに統一して、
左右に紙吹雪の装飾を散らしたい。
```
