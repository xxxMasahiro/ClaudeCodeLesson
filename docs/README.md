# ドキュメント：再現テンプレート集

このディレクトリには、Claude Code を使った開発フローや GitHub Pages 公開の手順を「後から再現できる形」でまとめたテンプレート集があります。
初めて GitHub にプロジェクトを公開する方、Vite プロジェクトを GitHub Pages にデプロイする方向けのガイドです。

---

## 目的別の読む順番

### 初回 push したい
→ **[CLAUDE_CODE_GIT_INITIAL_PUSH.md](./CLAUDE_CODE_GIT_INITIAL_PUSH.md)**
Claude Code を使って Git リポジトリを初期化し、GitHub に初回 push するまでの手順

### Vite を GitHub Pages に公開したい
→ **[VITE_GITHUB_PAGES_TEMPLATE.md](./VITE_GITHUB_PAGES_TEMPLATE.md)**
リポジトリ名非依存で Vite プロジェクトを GitHub Pages にデプロイする方法（BASE 環境変数注入方式）

### つまずいたら
→ **[GITHUB_PAGES_TROUBLESHOOTING.md](./GITHUB_PAGES_TROUBLESHOOTING.md)**
Vite + GitHub Pages + GitHub Actions でよくあるトラブルの早見表と対処法

---

## ファイル一覧

| ファイル名 | 内容 |
|-----------|------|
| [CLAUDE_CODE_GIT_INITIAL_PUSH.md](./CLAUDE_CODE_GIT_INITIAL_PUSH.md) | Git 初期セットアップ～初回 push 手順 |
| [VITE_GITHUB_PAGES_TEMPLATE.md](./VITE_GITHUB_PAGES_TEMPLATE.md) | Vite + GitHub Pages デプロイテンプレート |
| [GITHUB_PAGES_TROUBLESHOOTING.md](./GITHUB_PAGES_TROUBLESHOOTING.md) | GitHub Pages トラブルシューティング |

---

## 更新ルール

- 各テンプレートは「手順」に集中し、過度に詳細化しない
- トラブルや FAQ は `GITHUB_PAGES_TROUBLESHOOTING.md` に集約する
- テンプレートファイルは増やしすぎず、必要に応じて既存ファイルを整理・統合する
