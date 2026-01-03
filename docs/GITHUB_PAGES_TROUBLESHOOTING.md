# GitHub Pages トラブルシューティング

Vite + GitHub Pages + GitHub Actions でよくあるトラブルの早見表です。

---

## 問題1：真っ白な画面が表示される（CSS/JS が 404）

### 原因
- Vite の `base` 設定が GitHub Pages のパス構造と合っていない
- ビルド時に `BASE` 環境変数が正しく注入されていない
- アセットパスが `/assets/xxx.js` となっているが、実際には `/リポジトリ名/assets/xxx.js` でないと読み込めない

### 確認方法
1. ブラウザの開発者ツール（F12）→ Network タブを開く
2. CSS/JS ファイルが 404 エラーになっているか確認
3. デプロイされた `dist/index.html` の中身を確認（GitHub リポジトリの Actions → Artifacts からダウンロード可能）
4. `<script src="/assets/xxx.js">` のようになっている場合は `base` 設定が `/` のまま

### 対処法
1. `vite.config.js` に以下が設定されているか確認：
   ```javascript
   export default defineConfig({
     base: process.env.BASE ?? '/',
   })
   ```

2. `.github/workflows/deploy.yml` の Build ステップに `env: BASE` が設定されているか確認：
   ```yaml
   - name: Build
     run: npm run build
     env:
       BASE: /${{ github.event.repository.name }}/
   ```

3. 上記を修正後、再度 `git push` してワークフローを再実行

---

## 問題2：Actions の build は成功するが deploy が失敗する

### 原因
- GitHub Pages の Source 設定が **GitHub Actions** になっていない
- Pages の権限（permissions）が不足している
- Environment の承認設定が有効になっている

### 確認方法
1. GitHub リポジトリの **Settings → Pages** を開く
2. **Source** が **GitHub Actions** になっているか確認
3. **Actions → 失敗したワークフロー** を開いてエラーメッセージを確認
4. `Error: No uploaded artifact was found!` などのエラーがないか確認

### 対処法
1. **Settings → Pages → Source** を **GitHub Actions** に変更
2. `deploy.yml` の `permissions` が以下のようになっているか確認：
   ```yaml
   permissions:
     contents: read
     pages: write
     id-token: write
   ```

3. **Settings → Actions → General → Workflow permissions** が **Read and write permissions** になっているか確認
4. Actions の失敗したワークフローを開き、**Re-run all jobs** をクリック

**Note:** 初回デプロイ時は Environment の承認が必要な場合があります。その場合は Actions タブから手動で承認してください。

---

## 問題3：デプロイは成功するが反映されない・古いまま

### 原因
- ブラウザのキャッシュが残っている
- GitHub Pages の CDN キャッシュが更新されていない
- ワークフローが実行されていない（push が反映されていない）

### 確認方法
1. GitHub の **Actions** タブで最新のワークフローが実行され、成功しているか確認
2. ワークフローの実行時刻と自分の push 時刻が一致しているか確認
3. ブラウザのシークレットモード（プライベートブラウジング）で開いて確認

### 対処法
1. **ブラウザキャッシュをクリア**
   - Chrome/Edge: `Ctrl + Shift + R`（スーパーリロード）
   - Firefox: `Ctrl + F5`
   - または、シークレットモードで開く

2. **Actions を再実行**
   - GitHub の **Actions** タブ → 該当ワークフロー → **Re-run all jobs**

3. **数分待つ**
   - GitHub Pages の CDN キャッシュが更新されるまで 1〜5 分程度かかることがある

---

## 問題4：dist/ をコミットすべきか？

### 原則：コミットしない

GitHub Actions がビルドを行うため、`dist/` ディレクトリはコミット不要です。

### 理由
- ビルド成果物（dist/）は `.gitignore` に追加すべき
- GitHub Actions の Build ステップで `npm run build` が実行され、`dist/` が自動生成される
- ローカルでビルドしたものと Actions でビルドしたものが混在すると混乱の元

### .gitignore に追加
```
# Build output
dist/
```

### 例外：GitHub Actions を使わない場合
もし GitHub Actions を使わず、手動で `dist/` をデプロイする場合のみ、`dist/` をコミットする必要があります。しかし、推奨されません。

---

## 公開 URL の見つけ方

### 方法1：Settings → Pages から確認
1. GitHub リポジトリの **Settings → Pages** を開く
2. 「Your site is live at」の下に表示される URL を確認
3. 通常は `https://ユーザー名.github.io/リポジトリ名/` の形式

### 方法2：Actions の実行結果から確認
1. GitHub の **Actions** タブを開く
2. 成功した「Deploy to GitHub Pages」ワークフローをクリック
3. **deploy** ジョブの **Deploy to GitHub Pages** ステップに URL が表示される

### 方法3：リポジトリの About に表示
1. リポジトリのトップページ右側の **About** → ⚙（設定アイコン）をクリック
2. **Use your GitHub Pages website** にチェックを入れる
3. Save すると、About セクションに公開 URL が表示される

---

## チェックリスト：デプロイ前の確認項目

デプロイがうまくいかない場合、以下を順番に確認してください：

- [ ] `vite.config.js` に `base: process.env.BASE ?? '/'` が設定されている
- [ ] `.github/workflows/deploy.yml` の Build ステップに `env: BASE: /${{ github.event.repository.name }}/` がある
- [ ] GitHub Pages の **Settings → Pages → Source** が **GitHub Actions** になっている
- [ ] `package.json` に `"build": "vite build"` スクリプトが存在する
- [ ] `.gitignore` に `dist/` が含まれている（dist/ はコミットしない）
- [ ] `main` ブランチに変更が push されている
- [ ] GitHub Actions のワークフローが実行され、成功している
- [ ] ブラウザのキャッシュをクリアして確認している

---

## さらに詳しく

### 関連ドキュメント
- [VITE_GITHUB_PAGES_TEMPLATE.md](./VITE_GITHUB_PAGES_TEMPLATE.md) - デプロイ手順の詳細
- [CLAUDE_CODE_GIT_INITIAL_PUSH.md](./CLAUDE_CODE_GIT_INITIAL_PUSH.md) - Git 初期セットアップ手順
- [docs/README.md](./README.md) - ドキュメント索引

### 公式ドキュメント
- [Vite - Deploying a Static Site](https://vitejs.dev/guide/static-deploy.html#github-pages)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions - Deploying to GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-with-a-custom-github-actions-workflow)

---

**更新日：** 2026-01-04
**対象：** Vite + GitHub Pages + GitHub Actions
