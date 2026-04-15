### インストール（開発用）

```bash
git clone <repository-url>
cd changelog-push
npm install
npm run build
```

### ビルド
```bash
npm run build
```

### 実行
```bash
# 要 TEST_CHANGELOG.md
node dist/index.js --file TEST_CHANGELOG.md "feat: Add new authentication system"
```

### テスト
```bash
npm test
```
