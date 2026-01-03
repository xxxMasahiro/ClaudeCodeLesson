# Claude Code Git Initial Push Template

このドキュメントは、Claude Code を使って Git リポジトリの初期セットアップから GitHub への初回 push までを行うためのテンプレートです。

## 前提条件

- WSL/Ubuntu 環境で Claude Code を使用
- GitHub アカウントを持っている
- SSH 鍵を使った認証を行う（推奨）
- Claude Code に自然言語で指示し、git コマンドは Claude Code が実行する

---

## セットアップフロー全体像

```
1. リポジトリ作成
2. .gitignore 確認
3. Git ユーザー情報設定
4. 初回コミット（Initial commit）
5. ブランチ名を main に変更
6. SSH 接続設定の確認と設定
7. リモート origin 設定
8. main ブランチを GitHub に push
```

---

## Step 1: リポジトリ作成

### 目的
GitHub 上に新しいリポジトリを作成し、ローカルで初期化する。

### Claude Code への指示例
```
このディレクトリを Git リポジトリとして初期化し、
GitHub に "プロジェクト名" という名前でリポジトリを作成したいです。
現在のディレクトリ構成を確認してください。
```

### 期待される結果
- `pwd` でカレントディレクトリ確認
- `ls -la` などでファイル構成確認
- GitHub 上にリポジトリが作成される（手動 or gh コマンド）

---

## Step 2: .gitignore の確認

### 目的
不要なファイル（`node_modules`, `dist` など）を Git 管理から除外する設定を確認する。

### Claude Code への指示例
```
.gitignore ファイルがあるか確認し、
node_modules と dist が除外されているか確認してください。
```

### 期待される結果
- `.gitignore` ファイルの内容が表示される
- 除外すべきファイル/ディレクトリが含まれていることを確認
- 必要なら追加・修正

---

## Step 3: Git ユーザー情報設定

### 目的
コミット時の author 情報を設定する。

### Claude Code への指示例
```
Git のユーザー情報を global に設定してください。
名前: [あなたの名前]
メールアドレス: [あなたのメールアドレス]
```

### 期待される結果
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```
が実行される。

---

## Step 4: 初回コミット

### 目的
すべてのファイルをステージングし、"Initial commit" でコミットする。

### Claude Code への指示例
```
初回コミットを作成してください。
- 全ファイルをステージングに追加
- コミットメッセージは "Initial commit"
- ブランチ名は main にする
```

### 期待される結果
```bash
git add .
git branch -M main
git commit -m "Initial commit"
```
が実行され、コミットが成功する。

---

## Step 5: SSH 接続設定の確認

### 目的
SSH 鍵が存在するか確認し、必要なら作成する。GitHub への SSH 接続を確認する。

### Claude Code への指示例
```
SSH 接続に切り替えたいです。

このリポジトリは [アカウント名] アカウントで push したいので、
git@github-[アカウント名] を使う前提で進めてください。

この環境で、
- SSH 鍵が既にあるか確認し
- 無ければ新しく生成し（既存の鍵がある場合は絶対に上書き・再生成しない）
- GitHub に公開鍵を登録し
- SSH config を確認・設定してください
```

### 期待される結果
- `~/.ssh/` 内のファイル一覧が表示される
- 既存の鍵（例: `id_ed25519_masahiro`）が確認される
- `~/.ssh/config` の内容が確認される
- 必要なら SSH config に以下のような設定が追加される：

```
Host github-masahiro
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_masahiro
  IdentitiesOnly yes
```

- 公開鍵（`.pub` ファイル）の内容が表示され、GitHub に登録するよう指示される

---

## Step 6: リモート origin を SSH URL に設定

### 目的
リモートリポジトリを SSH 接続用の URL に設定する。

### Claude Code への指示例
```
このリポジトリの origin を SSH URL に変更してください。
git@github-[アカウント名]:[ユーザー名]/[リポジトリ名].git
```

### 期待される結果
```bash
git remote set-url origin git@github-masahiro:xxxMasahiro/RepoName.git
git remote -v
```
が実行され、origin が SSH URL に変更される。

---

## Step 7: main ブランチを GitHub に push

### 目的
ローカルの main ブランチを GitHub のリモートリポジトリに push する。

### Claude Code への指示例
```
main ブランチを origin に push してください。
push 時にパスフレーズを求められたら入力します。
```

### 期待される結果
```bash
git push -u origin main
```
が実行される。

### ⚠️ Claude Code 環境の制約

**Claude Code 環境では、SSH パスフレーズ入力が必要な場合に以下のエラーが発生します：**

```
ssh_askpass: exec(/usr/bin/ssh-askpass): No such file or directory
git@github.com: Permission denied (publickey).
```

**これは Claude Code の対話的入力の制約によるものです。**

---

## 通常の Ubuntu ターミナルに切り替える判断基準

以下の場合は、**通常の Ubuntu ターミナルで操作を完了させる**ことを推奨します：

### ケース 1: SSH パスフレーズ入力が必要な場合
- `git push` 時に `Permission denied (publickey)` エラーが出る
- SSH 鍵にパスフレーズが設定されている

**対処法：**
通常のターミナルで以下を実行：
```bash
cd /path/to/your/repository
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519_masahiro  # パスフレーズ入力
git push -u origin main
```

### ケース 2: 対話的な確認が必要な git 操作
- `git rebase -i` のような対話的操作
- エディタ起動が必要な操作

**対処法：**
通常のターミナルで直接実行する。

### ケース 3: gh コマンドで認証が必要な場合
- `gh pr create` などで GitHub CLI の認証が必要

**対処法：**
通常のターミナルで `gh auth login` を実行してから作業する。

---

## 完了確認

以下のコマンドで push が成功したか確認できます：

```bash
git log --oneline -5
git branch -a
```

`remotes/origin/main` が表示されれば push 成功です。

---

## このテンプレートを使うときの注意点

### ✅ DO: やるべきこと

1. **各ステップで何をしているか Claude Code に明確に伝える**
   - 「〜を確認してください」
   - 「〜を設定してください」
   - 「〜を実行してください」

2. **SSH 鍵は既存のものを使う前提で指示する**
   - 「既存の鍵がある場合は絶対に上書き・再生成しない」と明示

3. **push 時の制約を理解する**
   - Claude Code では SSH パスフレーズ入力ができない
   - 通常のターミナルで push を完了させることを想定

4. **段階的に進める**
   - 一度に複数の操作を依頼せず、ステップごとに確認

5. **Git 設定は global に統一**
   - `git config --global` で設定することで、他のリポジトリでも使える

### ❌ DON'T: アンチパターン

1. **SSH 鍵の再生成を無闇に指示しない**
   - 既存の鍵が存在する場合、それを使う
   - 再生成すると GitHub への再登録が必要

2. **パスフレーズ入力を Claude Code に期待しない**
   - 対話的入力は Claude Code の制約
   - ssh-agent への鍵追加は通常のターミナルで実行

3. **複数アカウントの SSH 鍵管理を曖昧にしない**
   - `git@github-masahiro`, `git@github-takumi` のように明確に区別
   - 使用するアカウントを Claude Code に明示する

4. **git コマンドを自分で入力しない**
   - Claude Code がコマンドを実行する前提
   - 人間は自然言語で指示のみ

5. **エラーが出ても諦めない**
   - SSH 接続エラーは環境の制約
   - 通常のターミナルで解決できる

---

## まとめ

このテンプレートは、Claude Code を「開発アシスタント」として活用し、Git の初期セットアップを自然言語で指示しながら進めるためのガイドです。

**Claude Code の強み：**
- Git コマンドの実行を自然言語で指示できる
- ファイル確認・編集を並行して行える
- 各ステップの説明を受けながら進められる

**Claude Code の制約：**
- 対話的入力（パスフレーズなど）はサポートされない
- ssh-agent への鍵追加は通常のターミナルで行う必要がある

**最適な使い方：**
- 設定・確認作業は Claude Code に任せる
- パスフレーズ入力が必要な push は通常のターミナルで実行
- 両者を適切に使い分けることで、効率的な開発フローを実現できる

---

## 関連テンプレート

- [Vite + GitHub Pages デプロイテンプレート](../docs/VITE_GITHUB_PAGES_TEMPLATE.md) - リポジトリ名非依存で Vite プロジェクトを GitHub Pages にデプロイする方法

---

**作成日：** 2026-01-03
**対象環境：** WSL/Ubuntu + Claude Code
**Git 運用：** main ブランチ + SSH 認証
