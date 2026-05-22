# セッション引き継ぎ (PC 再起動用) — 2026-05-20

> このファイルは PC / VSCode 再起動後に Claude Code を起動した直後、最初に読ませる用です。
> 「`SESSION-HANDOFF.md` を読んで、続きから始めて」と指示すれば現状を把握できます。

---

## プロジェクト基本情報

| 項目 | 値 |
|---|---|
| パス | `C:\Users\minato_mitasaki\Documents\claude-projects\vibescareer-lp` |
| Git remote | `github.com/minatomitasaki/vibescareer-lp` |
| 本番 | `https://vibescareer-lp.vercel.app` |
| 最終 commit | `d9b7032` (docs: 画像生成ガイドに応用テクニック 3 件を追記) |
| 自動デプロイ | main に push → Vercel が 60〜90 秒でビルド |

---

## このセッションでやったこと (時系列まとめ)

1. **Vercel 本番環境変数の問題切り分け → 解決**
   - GOOGLE_OAUTH_* の Production 注入問題を解消
   - 加えて refresh_token のスコープ不足 (calendar.events のみ) → events + calendar.readonly に変更

2. **Google Calendar 自前予約フローの E2E テスト完了**
   - `/api/calendar/slots` (空き時間取得) + `/api/calendar/book` (予約 + Meet 自動付与)
   - 主催者: `daisuke_watanabe@organic-gr.com` (旧テスト主催者: `minato_mitasaki@organic-gr.com`)

3. **Slack Incoming Webhook 連携**
   - 環境変数 `SLACK_WEBHOOK_URL` を Vercel に登録
   - `/api/calendar/book` で予約成立時に通知 (best-effort)
   - 通知末尾に Google スプレッドシートのリンクを追加

4. **GAS シートに stage 列追加**
   - `form_submitted` (フォーム送信時) と `booking_confirmed` (予約成立時) を識別
   - GAS の `appendRow` に `payload.stage` 等を追加するよう変更

5. **成功事例 4 件のセクション全面リニューアル (Section 7)**
   - 写真をフォトリアルなオフィスワークシーンに刷新
   - Aさん→Yさん / Bさん→Dさん / Cさん→Nさん / Dさん→Eさん に改名 + 年齢調整 (25/24/24/26)
   - 金額部分を BEFORE/AFTER + UPバッジのインフォグラフィック画像 4 枚に
     - case1: 電力会社 420 → 広告代理店 600 (+180)
     - case2: 市役所公務員 380 → Webマーケター 480 (+100)
     - case3: 新聞記者 400 → セールスライター 470 (+70)
     - case4: 空港免税店 370 → 新規事業開発 450 (+80)
   - case3/case4 の体験談本文を新規執筆 (ロードマップ 3 STEP の文脈を踏まえて)
   - case3 は女性、case4 は女性、case1/case2 は男性

6. **アドバイザーカード調整 (Section 6)**
   - 帯のオレンジを 3 色グラデに調整 (`#ffd9b3 → #ff8533 → #ff6b00`)
   - キャッチフォントを Noto Serif JP weight 900

7. **セクション見出しの文字サイズ統一拡大**
   - `.section-eyebrow-block .ja`: 20px → 23px
   - `.en`: 11px → 12px、`.sub`: 11.5px → 12.5px

8. **取り扱い企業セクション (Section 8) をロゴ画像 2 列グリッドに変更**
   - 「5,000社以上！」→「10,000社以上！」(数字部分 30px)
   - PARTNER_LOGOS データに切り替え (10 ロゴ: BizReach, Speee, Sansan, Leverages, DYM, FLUX, kaonavi, UPSIDER, ASSIGN, Nahato)
   - 白カード → 白背景直置きのシンプル構成

9. **悩みセクション (Section 10) を参考 LP 風に再実装**
   - 一度画像化 (result-concerns-cards.png) を試したが見栄え悪く、HTML/CSS で再実装
   - CASE.01〜04 ラベル + オレンジ下線 + 太字本文の 2×2 グリッド
   - 強調語は `<strong>` で太字化
   - 背景グレー (bg-bg-subtle) を白 (bg-white) に変更

10. **CTA ボタンのホバー時アニメ停止を解除**
    - `.btn-cta-radar` / `.btn-cta-radar-orange` の `:hover` / `:active` で `animation-play-state: paused` を削除
    - ホバー中も pulse とリング波動が継続

11. **画像生成プロンプト設計ガイドを作成 (社員シェア用)**
    - `IMAGE-PROMPT-GUIDE.md` を新規作成
    - 7 パート構成テンプレ / ジャンル別 / 文字精度テクニック / トンマナ統一 / Inpainting / 参考画像活用
    - GitHub URL でシェア可能

---

## 未着手のタスク (再起動後の続き候補)

### 1. Slack 通知の本番動作確認 (pending)
- フォーム送信 → 予約 → Slack 通知の最終 E2E テスト
- 環境変数も Webhook も設定済みなので、フォーム送って通知が来るか試すだけ

### 2. 悩みセクション以降の参考 LP 風リファイン
- **方針**: https://tarushiru.jp/career01 の構成を踏襲。CSS は VibesCareer のオレンジで独自実装 (アイデアレベルの参考、丸コピーは避ける)
- 対象セクション:
  - Section 11: 悩みの原因「3 人に 1 人が早期離職」
  - Section 12: 意気込みコピー (オレンジ全面ステートメント)
  - Section 13: サービス紹介「VibesCareer はどんなサービス？」
  - Section 14: 転職成功までのロードマップ 3 STEP
  - Section 16: FAQ
  - Section 17: ラストメッセージ

### 3. 法務系ページ (未着手)
- `/privacy` (プライバシーポリシー)
- `/terms` (利用規約)
- `/tokushoho` (特定商取引法)
- `/company` (会社概要)

---

## 重要ドキュメント

| ファイル | 用途 |
|---|---|
| `SESSION-HANDOFF.md` (これ) | 再起動後の引き継ぎ |
| `IMAGE-PROMPT-GUIDE.md` | 画像生成プロンプト設計ガイド (社員シェア用) |
| `IMAGE-GEN-HANDOFF.md` | 別タブで画像生成する際の引き継ぎ |
| `HANDOFF-2026-05.md` | 初期 Calendar 連携時の引き継ぎ (古い、参考用) |
| `src/data/landing.ts` | SUCCESS_CASES / PARTNER_LOGOS / ADVISORS / VIBES_RADAR_FEATURES |
| `src/data/results.ts` | RESULT_DATA (12 パターン) |
| `scripts/image-manifest.mjs` | AI 画像生成のマニフェスト |
| `scripts/generate-images.mjs` | `npm run gen:images` の実体 |

---

## 重要な設定・前提

| 項目 | 値 |
|---|---|
| OAuth 主催者 | `daisuke_watanabe@organic-gr.com` (2026-05-22 に minato_mitasaki@organic-gr.com から切替) |
| Calendar スコープ | `calendar.events` + `calendar.readonly` |
| Slack アプリ | `VibesCareer_予約通知` (Incoming Webhook) |
| GAS シート | `https://docs.google.com/spreadsheets/d/1n0r6uED1J7PFeNhC5PQqqt5RWNEHBCHRuPIrhmLf9SQ/edit` |
| GAS payload に追加された列 | `stage`, `bookingStartISO`, `bookingEndISO`, `bookingMeetUrl` |
| 本番ドメイン | `career.vibesradar.ai` (Cloudflare Workers + OpenNext。LP は `/lp01/` 配下) |
| `.env.local` のキー | `OPENAI_API_KEY`, `GOOGLE_OAUTH_*`, `GOOGLE_CALENDAR_ID`, `SLACK_WEBHOOK_URL` |

---

## 再起動後に最初に確認すること

1. **VSCode を開く**: `C:\Users\minato_mitasaki\Documents\claude-projects\vibescareer-lp`
2. **Git の状態を確認**:
   ```bash
   git -C "C:/Users/minato_mitasaki/Documents/claude-projects/vibescareer-lp" status
   git -C "C:/Users/minato_mitasaki/Documents/claude-projects/vibescareer-lp" log --oneline -5
   ```
   working tree が clean で、最終 commit が `d9b7032` 付近なら問題なし
3. **Vercel デプロイが Ready か確認** (ダッシュボードで最新ビルドの状態)
4. **本番 LP を強制リロード**: https://vibescareer-lp.vercel.app/result/planning-stable

---

## 進行中の方針 (アーキテクチャ・デザイン)

- **ブランドカラー**: ベース `#ff6b00` (オレンジ)、グラデは `#ffd9b3 → #ff8533 → #ff6b00`
- **背景色トーン**: warm cream / beige (`#fffaf2`, `#fff6ec`)
- **フォント**:
  - 本文: Noto Sans JP
  - 英字: Inter
  - セリフ (アドバイザーキャッチ): Noto Serif JP weight 900
- **画像生成**: OpenAI gpt-image-2、warm cream / beige / soft orange のカラーパレットで全画像統一
- **セクション構造の参考**: tarushiru.jp/career01 (悩みセクション以降)
- **コーディング方針**: アイデア・構造レベルの参考に留め、CSS はオリジナル実装

---

## 引き継ぎ時の Claude Code への伝え方

再起動後の VSCode で Claude Code を起動したら、こう伝えれば即続けられます:

```
SESSION-HANDOFF.md を読んで、続きから作業します。
次は [作業したい項目] をやりたい。
```

例:
```
SESSION-HANDOFF.md を読んで、続きから作業します。
次は Section 11 (悩みの原因) を参考 LP 風にリファインしたい。
```
