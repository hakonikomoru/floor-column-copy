# 統合版（Bedrock）動作確認メモ

> Minecraft **Launcher（統合版）** での導入・確認手順。

---

## 1. インストール（プレイ用）

1. `behavior_packs/floor_column_copy` と `resource_packs/floor_column_copy` を Launcher の `com.mojang` に置く  
   （または `npm run install:bedrock-pack` でジャンクション）
2. ワールド設定で **ビヘイビア＋リソース両方** の **Floor Column Copy** を有効化
3. ワールドに入る → 初回スポーン時に杖が自動配布される

**開発用パック（development_behavior_packs）は不要です。** 通常の behavior / resource パックだけで動きます。

### Launcher のパス（Windows）

```
%APPDATA%\Minecraft Bedrock\Users\Shared\games\com.mojang\
```

アカウント別フォルダ（`Users\<ID>\games\com.mojang\`）を使っている場合は、そちらにも同様に配置してください。

---

## 2. 操作の優先順（Beta APIs 不要）

| 優先 | 方法 | 入力 |
| --- | --- | --- |
| ① | **杖** | コピー/貼り付けの杖を使用（空中・ブロック上どちらでも可） |
| ② | **カスタムコマンド** | `/fc:give` `/fc:menu` `/fc:paste`（ゲーム 1.21.80 以降） |
| ③ | **関数** | `/function fc/give` など（チート ON） |
| ④ | **scriptevent** | `/scriptevent fc:give run`（チート ON） |
| ⑤ | **チャット** | `!fc give`（**Beta APIs** が必要） |

杖の使用と `/fc:*` / `/function fc/*` だけで完結します。Beta APIs は `!fc` チャットを使いたい場合のみ必要です。

---

## 3. リポジトリ開発者向け

| npm スクリプト | 内容 |
| --- | --- |
| `npm run install:bedrock-pack` | Launcher へジャンクション作成 |
| `npm run verify:bedrock-pack` | 配置確認 |
| `npm run sync:bedrock-world-pack` | 適用済みワールドへコピー同期 |
| `npm run dev:bedrock` | ファイル監視 → 自動同期 |
| `npm run pack:mcaddon` | BOOTH 用 `.mcaddon` / `.zip` を `dist/` に生成 |

`sync` / `dev:bedrock` はスクリプト編集を即反映したいときだけ使います。通常プレイでは不要です。

### BOOTH 配布

- 作品ファイル: `dist/FloorColumnCopy_v*.zip`（または `.mcaddon`）
- 商品名・紹介文・タグ: [booth-listing.md](./booth-listing.md)
- 説明画像・短文: [addon-description.md](./addon-description.md)

---

## 4. 動作確認チェックリスト

| 確認 | OK の目安 |
| --- | --- |
| スクリプト起動 | コンテンツログに `[FC] Floor Column Copy loaded` |
| 杖の配布 | 初回スポーン or `/fc:give` で 2 種の杖 |
| コピー | コピーの杖 → 高さメニュー → `コピー完了：Nブロック` |
| 貼り付け | 貼り付けの杖 → `貼り付け完了：Nブロック` |

---

## 5. トラブルシュート

| 症状 | 対処 |
| --- | --- |
| 何も反応しない | ビヘイビア＋リソース両方を有効化。マイクラ再起動 |
| 杖が出ない | `/fc:give` または `/function fc/give` |
| メニューが出ない | コンテンツログで Script エラーを確認 |
| 編集が反映されない | manifest の version を上げてパック OFF→ON、または `sync:bedrock-world-pack` |
| `!fc` だけ効かない | Beta APIs を ON（他の方法は Beta 不要） |

---

## 6. AI 向け同期ドキュメント

- **[project-sync.md](./project-sync.md)** … ChatGPT / 他 AI 向けの仕様・構成の正
- 仕様変更後は **`npm run sync:project-docs`** で自動セクション（メタ・ディレクトリ・ゲーム仕様）を更新

---

## 7. 仕様上の制限

- 1 回のコピーは最大 384 ブロック（ワールド下限で打ち切りあり）
- BlockEntity データ（チェスト中身・看板文字など）はコピーされない
- 別ディメンションへの貼り付けは警告を出して続行する
