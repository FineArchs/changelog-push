# CHANGELOG-push

## 概要
CHANGELOG.mdに変更内容の断片を挿入するNode.jsコマンドラインツール。バージョン指定による柔軟な挿入機能と段階的な更新をサポートする。

## コマンド形式

```bash
npx chlog-push [options] <changelog-fragment>
```

## オプション

```
  -v, --version <v>           バージョン番号
  -s, --section <s>           セクション名
  -k, --kind <k>              カインド名
  -b, --body <text>           挿入断片テキスト
  --new-version               バージョン番号がない・既存のものの場合にエラー
  --new-section               セクション名がない・バージョン内で既存の場合にエラー
  --new-kind                  カインド名がない・セクション内で既存の場合にエラー
  --existing-version          バージョン番号がない・既存でないものの場合にエラー
  --existing-section          セクション名がない・バージョン内で既存でない場合にエラー
  --existing-kind             カインド名がない・セクション内で既存でない場合にエラー
  -i, --input <path>          Changelog断片をファイルから読み込む
  --file <path>               CHANGELOG.mdのパス（デフォルト: ./CHANGELOG.md）
  --dry-run                   ドライラン（ファイル変更なし）
  --quiet                     出力を最小化
  -h, --help                  ヘルプ表示
```

## 使用例

```bash
# 断片をテキストで直接指定
npx chlog-push "## 1.2.0\n### Frontend\n- feat: New feature description"

# オプションで構成要素を指定
npx chlog-push -v "1.2.0" -s "Frontend" -k "feat" "New feature description"

# ファイルから読み込み
npx chlog-push -i fragment.md

# 新規バージョンのみ作成可能
npx chlog-push --new-version "## 1.3.0" "### Features\n- New feature"

# 既存バージョンのみに追加
npx chlog-push --existing-version -v "1.2.0" -s "Bugfixes" "- fix: Critical issue"
```

## 断片（Fragment）フォーマット仕様

断片は以下の正規表現にマッチする形式：

```regex
(## <version>\n)?(### <section>\n)?(- |* )?(<kind>: )?<body>
```

### 構成要素

| 要素 | 必須 | 説明 | 例 |
|------|------|------|-----|
| `## <version>` | ✗ | バージョン見出し | `## 1.2.0` |
| `### <section>` | ✗ | セクション見出し | `### Features`, `### Bugfixes` |
| `<kind>:` | ✗ | 変更種別 | `feat:`, `fix:`, `docs:` |
| `<body>` | ✓ | 変更内容本体 | `Add new API endpoint` |

### フォーマット例

```
feat: Add authentication support
- Security: Password encryption implemented
### Performance\n- Optimization: Cache invalidation
## 2.0.0\n### Breaking Changes\n- Remove deprecated API v1
```

---

## CHANGELOG.md 構造

想定される標準フォーマット：

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

## [1.2.0] - 2024-04-15

### Features
- New feature A
- New feature B

### Bugfixes
- Fixed issue X
- Fixed issue Y

### Performance
- Optimized query Z

## [1.1.0] - 2024-03-01

### Features
- Feature C
```

---

## 挿入ロジック

段階的に処理し、各レベル（バージョン/セクション/カインド）で制約オプションをチェック。指定されたバージョンやセクション等が存在しない場合は新規作成、既存の場合は配下に追加。

### 処理フロー

**1. バージョンレベル**

- 指定なし → Unreleased に追加
- 指定あり → 存在確認
  - 既存 + `--new-version` → エラー終了
  - 未存在 + `--existing-version` → エラー終了
  - 既存 → 既存バージョン配下に処理継続
  - 未存在 → 新規バージョン作成後に処理継続

**2. セクションレベル（バージョン確定後）**

- 指定なし → バージョン直下に追加
- 指定あり → 存在確認
  - 既存 + `--new-section` → エラー終了
  - 未存在 + `--existing-section` → エラー終了
  - 既存 → 既存セクション配下に処理継続
  - 未存在 → 新規セクション作成後に処理継続

**3. カインドレベル（セクション確定後）**

- 指定なし → セクション直下に追加
- 指定あり → 存在確認
  - 既存 + `--new-kind` → エラー終了
  - 未存在 + `--existing-kind` → エラー終了
  - 既存 → 既存カインド行に追加
  - 未存在 → 新規カインド行作成後に処理継続

**4. 本体追加**

- 最終確定位置に body をリスト項目として追加

---

## エラーハンドリング

| エラー | 条件 | 対応 |
|--------|------|------|
| VERSION_ALREADY_EXISTS | --new-* で既存バージョン | エラー終了 |
| VERSION_NOT_FOUND | --existing-* で未存在バージョン | エラー終了 |
| INVALID_FRAGMENT | Changelog断片のフォーマット不正 | エラー終了 |
| INVALID_CHANGELOG | CHANGELOG.mdのフォーマット不正 | エラー終了 |
| CHANGELOG_NOT_FOUND | CHANGELOG.md不在 | エラー終了 |

---

## 実装チェックリスト

- [ ] コマンドパーサー実装（commander.js等）
- [ ] CHANGELOG.mdファイル読み書き機能
- [ ] バージョン/セクション/カインド検索・マッチング機能
- [ ] 断片フォーマットバリデーション
- [ ] 統合挿入ロジック実装（4段階フロー）
  - [ ] バージョンレベル処理＆制約チェック
  - [ ] セクションレベル処理＆制約チェック
  - [ ] カインドレベル処理＆制約チェック
  - [ ] 本体追加処理
- [ ] エラーハンドリング＆メッセージ
- [ ] ドライラン機能
- [ ] ユニットテスト
