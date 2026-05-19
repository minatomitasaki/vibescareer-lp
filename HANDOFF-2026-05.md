# 引継ぎ: 2026-05 セッション (LP 全体構築 → Vercel デプロイ)

最終更新: 2026-05-19
セッション中に進めた内容と未解決事項をまとめる。
過去ログは [HANDOFF.md](HANDOFF.md) / [HANDOFF-diagnosis.md](HANDOFF-diagnosis.md) /
[HANDOFF-fv-inpaint.md](HANDOFF-fv-inpaint.md) を参照。

---

## 1. 環境・運用フロー

### ホスティング
- **GitHub**: https://github.com/minatomitasaki/vibescareer-lp (private)
- **Vercel**: https://vibescareer-lp-34nm.vercel.app
- `git push` で **Vercel が自動再デプロイ**(GitHub 連携)
- コミット author email は `257721179+minatomitasaki@users.noreply.github.com`
  (Vercel Hobby プランの collaborator block 回避のため)

### 開発サーバー
```powershell
& "C:\Program Files\nodejs\npm.cmd" --prefix "C:\Users\minato_mitasaki\Documents\claude-projects\vibescareer-lp" run dev
# → http://localhost:3100
```

### AI 画像生成
- モデル: **gpt-image-2** (ChatGPT Images 2.0)
- マニフェスト: [scripts/image-manifest.mjs](scripts/image-manifest.mjs)
- 実行: `node scripts/generate-images.mjs <file>` (`--force` で上書き)
- API key: `.env.local` の `OPENAI_API_KEY` (Vercel には不要、ローカル生成専用)

---

## 2. 完成済みのページ・機能

### ページ
- **`/`** 入口LP — 既存(FV / Section2 / Section3 を 1 枚絵 + CTA)
- **`/diagnosis`** 診断ページ — 既存
- **`/analyzing`** 分析中 — 既存
- **`/result/[id]`** 診断結果LP **(本セッションで全 Section 構築)**
- **`/schedule`** 日程調整 **(本セッションで新規追加、TimeRex 埋込)**
- **`/thanks`** 予約完了サンクス **(本セッションで新規追加)**

### 診断結果LP のセクション構成
1. **Section 1 ヒーロー**: 職種別 6 画像(`result-hero-<jobType>.png`)+ 「診断結果」見出し + 青枠の jobLabel + 適正年収カード(¥0 主役・pulse animation)
2. **Section 2-4 InsightSection**: 1 つの白カードに「あなたの持ち味 / プロからのアドバイス / その他の適職」を統合表示。英字 + 日本語の 2 行見出し
3. **Section 5/9/15 RadarBonusSection**: 1 枚画像 `result-radar-bonus.png` + CTA(`btn-cta-radar`)。背景 `#ECFDF3` で CTA まで一体化
4. **Section 10-17**: 悩み訴求 / 原因 / 意気込み / サービス紹介 / ロードマップ / FAQ / ラストメッセージ
5. **Section 18 フォーム**: `EntryForm` (client component) で GAS POST

### CTA ボタン
- 共通クラス `.btn-cta-radar`(緑→ティール→青緑グラデ、控えめ光沢、波動リング、pulse animation 1.4s)
- 入口LP の `<CtaButton>` も統一済み
- 立体感は控えめ(平面寄り)

### フォーム → スプレッドシート連携
- 送信先: Google Apps Script Web App
  `https://script.google.com/macros/s/AKfycbxdh39Lxmv0mQ55xzBU41OpZWykbVgq7pUouU83ieXMv9SzXQNWhBOxBiZ8kqeRqlZP/exec`
- 取得項目(12 列): 申込日時 / 診断結果ID / 姓 / 名 / メール / 電話 / 希望勤務地 / 希望転職時期 / 生年月日 / 最終学歴 / 学校名 / 専攻学科
- Content-Type は `text/plain` で送る(CORS preflight 回避)、`mode: "no-cors"` で fire-and-forget
- 送信後 `/schedule` へ `router.push`

### TimeRex
- 公開予約 URL: `https://timerex.net/s/minato_mitasaki_7fd9/fb6f1caa`
- 公式 JS 埋め込み(`https://asset.timerex.net/js/embed.js` + `TimerexCalendar()`)で iframe X-Frame-Options を回避
- 予約完了時に `onBookingComplete` で `/thanks` へリダイレクト
- 実装: [src/components/TimerexEmbed.tsx](src/components/TimerexEmbed.tsx)

---

## 3. 未解決・本番リリース前にやること

### A. 法務・コンプライアンス
- [ ] **フッターの法的表示**(特商法 / プライバシーポリシー / 有料職業紹介許可番号 / 個人情報取扱)
- [ ] `/privacy` `/terms` `/tokushoho` `/company` ページ作成
- [ ] フォーム送信前の同意チェック(現在は HTML5 required のみ)

### B. 連携・外部 URL の本番値差し替え
- [ ] **LINE 公式アカウント URL**: [src/app/thanks/page.tsx:11](src/app/thanks/page.tsx#L11) の `LINE_REGISTER_URL` (現在は仮)
- [ ] TimeRex 予約完了 → /thanks 遷移の実機テスト
- [ ] 計測タグ: GTM / GA4 / Meta Pixel の設定

### C. デザイン微調整候補
- [ ] **/thanks ページのデザイン**(現在は最低限の構成、デザイン未調整)
- [ ] VibesRadar ロゴの精度: AI 生成では `Radar` のフォントが完全には一致しない。
      公式ロゴ画像 [public/images/vibes-radar-logo.png](public/images/vibes-radar-logo.png)
      を HTML 側でオーバーレイする選択肢あり
- [ ] 結果LP 12 パターン本文の運用者監修(現在は AI 生成テキスト)

### D. ロジック実装
- [ ] **診断スコア → resultId のマッピング本実装**
      ([src/lib/diagnosis-scoring.ts](src/lib/diagnosis-scoring.ts) は仮実装)
- [ ] 結果LP の 12 パターンへの正しい遷移

### E. 運用設定
- [ ] Vercel Pro へのアップグレード(商用利用するなら必須、現在 Hobby)
- [ ] 独自ドメイン取得 + Vercel に紐付け
- [ ] 環境変数の Vercel 設定(現在は不要だが、後で API key 等が増えたら)

---

## 4. 既知の注意点

### Hot reload と Turbopack キャッシュ
- 大きな構造変更後は `.next` をクリアして `npm.cmd run dev` し直す
- 開発時は `next.config.ts` で `Cache-Control: no-store` & `images.unoptimized: true` 設定済み

### ImagePlaceholder
- 本番 (Vercel) では `fs.access` をスキップして常に `<Image>` を返す
  (serverless ランタイムから public/ にアクセス不可のため)
- 開発時のみ `?v=<mtime>` でキャッシュバスティング

### Next.js Image localPatterns
- `next.config.ts` で `localPatterns` に `?v=*` を許可済み

### コミット規約
- Co-Authored-By 行は維持
- 日本語コミットメッセージ OK
- author email は `257721179+minatomitasaki@users.noreply.github.com`(GitHub noreply)で固定

### Vercel Hobby の制約
- 「コミット author の email が GitHub 認証アカウントと一致しない」と
  デプロイブロックされる。必ず上記の noreply メールでコミットする

---

## 5. Claude Code 設定

### 音声入力の日本語化
[C:\Users\minato_mitasaki\.claude\settings.json](C:\Users\minato_mitasaki\.claude\settings.json) に
```json
"language": "japanese"
```
を追加済み(2026-05-19)。VSCode のウィンドウリロードで反映。

---

## 6. 次のセッション開始時のチェックリスト

1. このファイルを最初に読む
2. [HANDOFF.md](HANDOFF.md) の項目で本セッションで未解決のものを確認
3. `git status` で未コミット差分がないか確認
4. dev server が動いていなければ起動
5. Vercel ダッシュボードで最新デプロイが healthy か確認
6. ユーザーに次の優先タスクを質問

---

以上。重要な決定は本ファイル + Git commit 履歴(`git log --oneline`)で追える。
