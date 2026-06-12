# Floor Column Copy

Minecraft Bedrock Edition 向け Script API アドオンです。  
プレイヤーが立っている足元ブロックから、**下方向（Y 軸のみ）** にブロック列をコピーし、別の地点へ貼り付けできます。

**Repository:** [github.com/hakonikomoru/floor-column-copy](https://github.com/hakonikomoru/floor-column-copy)

![Floor Column Copy 説明画像（日本語）](docs/images/description_ja.png)

説明画像（英語）: [docs/images/description_en.png](docs/images/description_en.png)  
配布・紹介文: [docs/addon-description.md](docs/addon-description.md)

## 機能

- **コピーの杖** (`floor_column_copy:copy_wand`) … 右クリックで高さ選択メニュー
- **貼り付けの杖** (`floor_column_copy:paste_wand`) … 右クリックで即貼り付け
- ブロックの向き・状態は `BlockPermutation` で保持（チェスト中身・看板文字などの BlockEntity は MVP 対象外）
- 最大コピー高さ: **384 ブロック**（ワールド下限も考慮）

## 必要環境

- Minecraft Bedrock Edition **1.21 以降**（**Minecraft Launcher / 統合版**）
- ワールドで **ビヘイビアパック＋リソースパック** の両方を適用
- **Beta APIs は不要**（`!fc` チャットを使う場合のみ ON）

## インストール

1. 次の 2 フォルダを Launcher の `com.mojang` に置く  
   - `behavior_packs/floor_column_copy`  
   - `resource_packs/floor_column_copy`
2. ワールド設定で **Floor Column Copy** をビヘイビア・リソースの **両方** に追加
3. ワールドに入る（初回スポーンで杖が自動配布）

リポジトリから直接つなぐ場合: `npm run install:bedrock-pack`（詳細は [docs/bedrock-dev-notes.md](docs/bedrock-dev-notes.md)）

```
%APPDATA%\Minecraft Bedrock\Users\Shared\games\com.mojang\
  behavior_packs\floor_column_copy\
  resource_packs\floor_column_copy\
```

## 使い方

### 1. 杖の入手

- **初回ワールド参加時**に自動配布
- **クリエイティブ** → 装備タブ → **Floor Column Copy**
- `/fc:give` または `/function fc/give`（チート ON）

### 2. コピー

1. コピーしたい地点に立つ
2. **コピーの杖** を手に持って右クリック
3. メニューから高さを選択
   - 1 / 3 / 5 / 10 ブロック
   - 数値入力（1〜384）
   - 最大（ワールド下限まで、上限 384）

### 3. 貼り付け

1. 貼り付け先に移動して立つ
2. **貼り付けの杖** を右クリック
3. 足元から下方向へ復元

コピーしていない状態で貼り付けると  
`コピーされたブロックがありません` と表示されます。

## コマンド一覧

| 方法 | コマンド | 備考 |
| --- | --- | --- |
| 杖 | コピー/貼り付けの杖を使用 | **基本操作（Beta 不要）** |
| スラッシュ | `/fc:give` `/fc:menu` `/fc:paste` | 1.21.80 以降 |
| 関数 | `/function fc/give` など | チート ON |
| scriptevent | `/scriptevent fc:give run` | チート ON |
| チャット | `!fc give` など | **Beta APIs** が必要 |

## ドキュメント（AI / ChatGPT 同期）

| ファイル | 用途 |
| --- | --- |
| [docs/project-sync.md](docs/project-sync.md) | **ChatGPT / AI 向け**の仕様・構成の正 |
| [docs/addon-description.md](docs/addon-description.md) | 配布・紹介用（説明画像・短文） |
| [docs/bedrock-dev-notes.md](docs/bedrock-dev-notes.md) | Launcher 導入・トラブルシュート |

仕様を変えたら `npm run sync:project-docs` で `project-sync.md` の自動セクションを更新してください。

## ファイル構成

```txt
AGENTS.md
docs/
  addon-description.md
  bedrock-dev-notes.md
  images/
    description_ja.png
    description_en.png
  project-sync.md
tests/
  project-sync-core.test.mjs
scripts/
  project-sync-core.mjs
  sync-project-docs.mjs
  install-bedrock-pack.mjs
  sync-bedrock-world-pack.mjs
  verify-bedrock-pack.mjs
  watch-bedrock-world-pack.mjs
behavior_packs/floor_column_copy/
  manifest.json
  functions/fc/
  items/
    copy_wand.json
    paste_wand.json
  item_catalog/
    crafting_item_catalog.json
  scripts/
    main.js
    config.js
    storage.js
    copy.js
    paste.js
    ui.js

resource_packs/floor_column_copy/
  manifest.json
  texts/
    ja_JP.lang
    en_US.lang
  textures/
    item_texture.json
    items/
      copy_wand.png
      paste_wand.png
```

## 注意

- 負荷対策のため、1 回のコピーは最大 384 ブロックです
- チャンク未読み込みなどで取得・設置に失敗したブロックはスキップまたはそこで停止します
- BlockEntity データ（チェスト中身など）はコピーされません
