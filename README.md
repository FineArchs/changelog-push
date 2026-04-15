# chlog-push

`chlog-push` は、`CHANGELOG.md` に変更内容の断片（フラグメント）を柔軟に挿入するための CLI ツールです。バージョン、セクション、カインド（種別）を自動で判別または指定して、適切な位置に追記します。

## 特徴

- **自動位置決定**: バージョンやセクションが既存の場合はその配下に、存在しない場合は新規作成して挿入します。
- **柔軟な入力**: コマンドライン引数、オプション、またはファイルから変更内容を読み込めます。
- **制約チェック**: `--new-version` や `--existing-section` などのオプションで、意図しない重複や欠落を防止できます。
- **TypeScript & Vitest**: 型安全な実装と自動テストにより、信頼性の高い操作を提供します。

## インストール

```bash
npm install -g FineArchs/changelog-push#dist

# プロジェクトローカル
npm install -D FineArchs/changelog-push#dist
```

## 使用法

```bash
# 基本的な使用方法（Unreleased セクションに追加）
npx chlog-push "feat: Add new authentication system"

# バージョンとセクションを指定して追加
npx chlog-push -v "1.2.0" -s "Features" "Add user profile page"

# 断片フォーマットを使用して一括指定
npx chlog-push "## 1.3.0\n### bugfixes\n- fix: corrected login layout"

# ファイルから読み込み
npx chlog-push -i fragment.md
```

### オプション一覧

| オプション | 短縮 | 説明 |
|---|---|---|
| `--version-num <v>` | `-v` | バージョン番号を指定 |
| `--section <s>` | `-s` | セクション名（例: Features, Bugfixes）を指定 |
| `--kind <k>` | `-k` | 変更種別（例: feat, fix）を指定 |
| `--body <text>` | `-b` | 挿入する本文を指定 |
| `--new-version` | | バージョンが既に存在する場合にエラー |
| `--existing-version` | | バージョンが存在しない場合にエラー |
| `--file <path>` | | `CHANGELOG.md` のパスを指定（デフォルト: `./CHANGELOG.md`） |
| `--dry-run` | | ファイルを書き換えずに結果を出力 |
| `--quiet` | | 出力を最小限に抑える |

## ライセンス

ISC
