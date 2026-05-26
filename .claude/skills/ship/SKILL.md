---
name: ship
description: 「ここまでをコミット & push して」を 1 ターンで完結させる。型チェック → 別タブ作業を巻き込まない選択的 stage → 日本語コミットメッセージ生成 → push → Cloudflare 反映予定時間の報告まで。トリガ例「コミットして push」「ここまで push」「これ反映しといて」「ship して」
---

# ship Skill

このプロジェクトの「コミット → push → Cloudflare 反映通知」を 1 つのコマンドで完結させる。

複数タブ並走している前提なので、**別タブの作業ファイルを巻き込まない**ことが最重要。

## ワークフロー

### Step 1: 現状把握

```bash
git status
git log --oneline -3   # 直近の push 済みコミットを確認
```

`modified` / `Untracked files` を全部リストアップ。

### Step 2: 「私のスコープ」と「別タブのスコープ」を判別

- **本タブ (= 私) が触ったファイル** = 今のコンテキストの会話で Read/Edit/Write したファイル
- **別タブで進行中のファイル** = 触ってないのに modified になっているファイル

別タブの典型的なファイル (このプロジェクトでは):
- `.github/workflows/register-vibesradar.yml`
- `VIBESRADAR-AUTOMATION.md`
- `scripts/register-vibesradar.mjs`
- `src/lib/dispatch-vibesradar.ts`
- `src/app/api/calendar/book/route.ts` (VibesRadar 連携で別タブが触りがち)
- `src/components/EntryForm.tsx` (シート連携メタで別タブが触りがち)

**触っていないファイルは絶対に add しない**。間違って add すると、別タブのコミットと混在してメッセージが矛盾する。

### Step 3: 型チェック (push 前必須)

```powershell
npx --prefix "C:/Users/minato_mitasaki/Documents/claude-projects/vibescareer-lp" --no-install tsc -p "C:/Users/minato_mitasaki/Documents/claude-projects/vibescareer-lp/tsconfig.json" --noEmit
```

無音なら通過。エラーが出たら commit せず、修正してから再実行。

### Step 4: 選択的 stage

```bash
git add <file1> <file2> <file3>   # 明示的に列挙
```

⚠️ `git add -A` / `git add .` / `git add -u` は使わない (別タブ作業を巻き込む)。

### Step 5: コミット (日本語 + HEREDOC + Co-Authored-By 必須)

プレフィックスを必ず付ける (AGENTS.md 規約):
- `feat:` 新機能
- `fix:` バグ修正
- `style:` 見た目・体裁
- `refactor:` 機能変更なしの整理
- `docs:` ドキュメントのみ
- `chore:` ビルド / 設定 / 雑務
- `content:` 文言・コンテンツ差し替え

1 コミット 1 目的。タイトル 1 行 + 空行 + 詳細 body。最後に Co-Authored-By。

```bash
git commit -m "$(cat <<'EOF'
<prefix>: タイトル (50-72 文字以内)

- 何を変えたか (箇条書きで簡潔に)
- なぜ変えたか (背景・意図、bug 修正なら原因)
- 副作用や注意点があれば明記

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

### Step 6: push

```bash
git push origin main
```

push の出力 (例: `abc123..def456  main -> main`) を確認。

### Step 7: 反映通知 + 次のアクション

ユーザーに 1-3 行で報告:

```
push 完了 (`<short-hash>`)。Cloudflare Workers Builds が 3〜5 分で
デプロイします。アクティブになったら <URL> をハードリロード
(Ctrl+Shift+R) で動作確認してください。
```

確認すべき URL を具体的に提示 (該当する変更が反映されるページ)。

POP / モーダル系の修正なら「シークレットウィンドウで開いて、sessionStorage の抑制を回避」のヒントも添える。

## 禁止事項 (AGENTS.md より)

- `git push --force` / `git reset --hard` / ブランチ削除 (ユーザー明示指示なし)
- `--no-verify` で hook スキップ
- `--no-gpg-sign` で署名スキップ
- `git add -A` / `git add .` で無差別 stage
- secret 情報 (refresh_token / Webhook URL / API キー) をコミットメッセージや add 対象に入れる
- `.env.local` を add する (`.gitignore` で除外済み)
- Windows ローカルから `npm run cf:deploy` / `wrangler deploy` を直接実行する (= 本番が壊れる過去事例あり、必ず git push 経由)

## エッジケース

- **コミット対象が 0 ファイル**: 「変更なし、push スキップ」と報告
- **既に push 済み (origin/main..HEAD が空)**: コミットだけして報告
- **マージ競合**: `git pull --rebase origin main` を提案、ユーザー確認後に実行
- **別タブが先に push した場合**: `git pull --rebase origin main` 後、再 push
- **本タブで触ったファイルが別タブのコミットに巻き込まれている**: その旨を素直に報告 (force push で修復しない)
