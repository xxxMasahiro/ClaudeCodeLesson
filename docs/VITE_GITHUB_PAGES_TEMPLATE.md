# Vite + GitHub Pages デプロイテンプレート（リポジトリ名非依存）

このドキュメントは、Vite プロジェクトを GitHub Pages にデプロイする際に、**リポジトリ名に依存しない構成**を実現するためのテンプレートです。

---

## 目的

Vite プロジェクトを GitHub Pages にデプロイする際、以下の問題を解決します：

- ❌ **よくある事故：** `base` 設定を忘れて、GitHub Pages が真っ白になる
- ❌ **手間：** リポジトリ名が変わるたびに `vite.config.js` を手動修正する必要がある
- ✅ **解決：** GitHub Actions から環境変数 `BASE` を注入し、リポジトリ名に自動対応

---

## 前提条件

- GitHub リポジトリが作成済み
- GitHub Pages の Source 設定が **GitHub Actions** になっている
  - Settings → Pages → Source: **GitHub Actions**
- Vite プロジェクトが既に存在している

---

## よくある事故：base 設定なしで真っ白になる

GitHub Pages は `https://ユーザー名.github.io/リポジトリ名/` というパスで公開されます。

Vite のデフォルト設定では `base: '/'` となっており、以下の問題が発生します：

```
❌ 想定パス: https://xxxmasahiro.github.io/MyApp/
❌ 実際のパス: https://xxxmasahiro.github.io/
→ アセットが読み込めず、真っ白な画面が表示される
```

---

## 解決方針：GitHub Actions から BASE 環境変数を注入

以下のアプローチで解決します：

1. **vite.config.js** で `process.env.BASE` を読み取り、未設定時は `/` をデフォルトとする
2. **GitHub Actions の deploy.yml** で `BASE` 環境変数にリポジトリ名を注入
3. これにより、ローカル開発時は `/`、GitHub Pages デプロイ時は `/リポジトリ名/` が自動適用される

---

## vite.config.js 完成形

```javascript
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.BASE ?? '/',
  plugins: [],
})
```

### ポイント

- `process.env.BASE ?? '/'`：環境変数 `BASE` が設定されていれば使用、なければ `/` をデフォルトとする
- **ローカル開発時**：`BASE` は未設定なので `base: '/'` となり、`http://localhost:5173/` で動作
- **GitHub Actions 実行時**：`BASE: /${{ github.event.repository.name }}/` が注入され、`base: '/リポジトリ名/'` となる

---

## GitHub Actions ワークフロー（deploy.yml）完成形

`.github/workflows/deploy.yml` を以下の内容で作成します：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build
        env:
          BASE: /${{ github.event.repository.name }}/

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 重要ポイント

**Build ステップに `env: BASE` を設定**

```yaml
- name: Build
  run: npm run build
  env:
    BASE: /${{ github.event.repository.name }}/
```

- `${{ github.event.repository.name }}`：GitHub Actions が自動で現在のリポジトリ名を提供
- 例：リポジトリ名が `MyApp` なら、`BASE: /MyApp/` が設定される

---

## 動作確認：npm run dev と GitHub Pages のパス差

### ローカル開発時（npm run dev）

```bash
npm run dev
```

- `BASE` 環境変数が未設定 → `base: '/'` となる
- `http://localhost:5173/` でアクセス可能
- アセットパスは `/assets/xxx.js` となる

### GitHub Pages 公開時

- GitHub Actions が `BASE: /リポジトリ名/` を注入
- ビルド結果は `base: '/リポジトリ名/'` となる
- `https://xxxmasahiro.github.io/リポジトリ名/` でアクセス可能
- アセットパスは `/リポジトリ名/assets/xxx.js` となる

---

## 使い方：新規プロジェクトにコピペして公開

### Step 1: vite.config.js を編集

```javascript
import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.BASE ?? '/',
  plugins: [],
})
```

### Step 2: .github/workflows/deploy.yml を作成

上記の完成形をコピペして配置

### Step 3: GitHub リポジトリにプッシュ

```bash
git add .
git commit -m "Add GitHub Pages deployment workflow"
git push
```

### Step 4: GitHub Pages の Source 設定を確認

1. GitHub リポジトリの Settings → Pages にアクセス
2. Source: **GitHub Actions** になっているか確認
3. なっていない場合は、**GitHub Actions** を選択

### Step 5: デプロイ完了を待つ

- GitHub の Actions タブで "Deploy to GitHub Pages" ワークフローが実行される
- 完了後、`https://ユーザー名.github.io/リポジトリ名/` にアクセスして確認

---

## チェックリスト

デプロイ前に以下を確認してください：

- [ ] `vite.config.js` に `base: process.env.BASE ?? '/'` が設定されている
- [ ] `.github/workflows/deploy.yml` が作成され、`env: BASE: /${{ github.event.repository.name }}/` が含まれている
- [ ] GitHub Pages の Source 設定が **GitHub Actions** になっている
- [ ] `package.json` に `"build": "vite build"` スクリプトが存在する
- [ ] `main` ブランチに変更が push されている
- [ ] GitHub Actions のワークフローが実行され、成功している

---

## トラブルシューティング

### 真っ白な画面が表示される

- `vite.config.js` の `base` 設定を確認
- GitHub Actions の Build ステップで `BASE` 環境変数が正しく注入されているか確認
- ブラウザの開発者ツール（F12）で、アセットの読み込みエラーがないか確認

### GitHub Actions が失敗する

- GitHub リポジトリの Settings → Actions → General で、Workflow permissions が **Read and write permissions** になっているか確認
- `npm run build` がローカルで成功するか確認

### デプロイは成功するが、404 エラーが出る

- GitHub Pages の Source 設定が **GitHub Actions** になっているか再確認
- ワークフローの `upload-pages-artifact` で `path: ./dist` が正しいか確認

---

## まとめ

このテンプレートを使用することで、以下のメリットが得られます：

✅ **リポジトリ名の変更に強い**：`vite.config.js` を手動修正する必要がない
✅ **ローカル開発がシンプル**：`npm run dev` で `base: '/'` が自動適用される
✅ **デプロイが自動化される**：`main` ブランチへの push だけで GitHub Pages に公開される

---

**作成日：** 2026-01-04
**対象環境：** Vite + GitHub Pages + GitHub Actions
