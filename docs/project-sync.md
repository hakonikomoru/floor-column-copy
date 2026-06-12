# project-sync — Floor Column Copy

> ChatGPT / 他 AI 向けの同期用ドキュメント。**実装・レビュー・画像生成前に必ず読むこと。**
> 人間向けの概要は [README.md](../README.md)、Launcher 手順は [bedrock-dev-notes.md](./bedrock-dev-notes.md)。

<!-- sync:auto:meta:start -->
最終更新の想定リポジトリ: `hakonikomoru/floor-column-copy`（`main`・`f4d0626`・2026-06-12・`npm run sync:project-docs` 自動反映）
<!-- sync:auto:meta:end -->

---

## 1. 概要

| 項目 | 内容 |
| --- | --- |
| Repository | [`hakonikomoru/floor-column-copy`](https://github.com/hakonikomoru/floor-column-copy) |
| 名称 | Floor Column Copy（フロア・カラム・コピー） |
| 制作 | komolab - こもらぼ - |
| 種別 | Minecraft **統合版（Bedrock）** Script API アドオン |
| 実行環境 | Minecraft Launcher / 統合版 1.21 以降 |
| 目的 | 足元ブロックから**下方向（Y軸のみ）**にブロック列をコピーし、別地点へ貼り付ける建築支援 |

### 一言説明（画像生成・配布向け）

プレイヤーが立っている足元から真下へブロックの柱をコピーし、別の場所に同じ柱を復元するマジックワンド型ビルドツール。緑の「コピーの杖」で高さを選び、青の「貼り付けの杖」で即設置。

### ドキュメントの役割分担

| ファイル | 読者 | 用途 |
| --- | --- | --- |
| [README.md](../README.md) | 開発者・プレイヤー | 導入・使い方・コマンド早見 |
| [addon-description.md](./addon-description.md) | 配布・紹介 | 説明画像・短文コピペ用 |
| [bedrock-dev-notes.md](./bedrock-dev-notes.md) | 開発者 | Launcher パス・トラブルシュート |
| **project-sync.md**（本ファイル） | AI / ChatGPT | 構成・仕様・実装の正 |

---

## 2. ディレクトリ構成

> `<!-- sync:auto:... -->` ブロックは **`npm run sync:project-docs`** が上書きします（手編集しない）。

<!-- sync:auto:directory-tree:start -->
```
floor-column-copy/
├── behavior_packs/
│   └── floor_column_copy/
│       ├── functions/
│       │   └── fc/
│       ├── item_catalog/
│       │   └── crafting_item_catalog.json
│       ├── items/
│       │   ├── copy_wand.json
│       │   └── paste_wand.json
│       ├── manifest.json
│       ├── pack_icon.png
│       └── scripts/
│           ├── config.js
│           ├── copy.js
│           ├── main.js
│           ├── paste.js
│           ├── storage.js
│           └── ui.js
├── resource_packs/
│   └── floor_column_copy/
│       ├── manifest.json
│       ├── pack_icon.png
│       ├── texts/
│       │   ├── en_US.lang
│       │   ├── ja_JP.lang
│       │   └── languages.json
│       └── textures/
│           ├── item_texture.json
│           ├── items/
│           └── ui/
├── docs/
│   ├── addon-description.md
│   ├── bedrock-dev-notes.md
│   ├── images/
│   │   ├── description_en.png
│   │   └── description_ja.png
│   └── project-sync.md
├── scripts/
│   ├── install-bedrock-pack.mjs
│   ├── project-sync-core.mjs
│   ├── sync-bedrock-world-pack-lib.mjs
│   ├── sync-bedrock-world-pack.mjs
│   ├── sync-project-docs.mjs
│   ├── verify-bedrock-pack.mjs
│   └── watch-bedrock-world-pack.mjs
├── tests/
│   └── project-sync-core.test.mjs
```
<!-- sync:auto:directory-tree:end -->

---

## 3. ゲーム仕様（自動同期）

<!-- sync:auto:game-rules:start -->
> behavior_packs/floor_column_copy/scripts/config.js と ui.js から自動生成。仕様変更後は npm run sync:project-docs を実行。

### アイテム

| アイテム | ID | 操作 |
| --- | --- | --- |
| コピーの杖 | `floor_column_copy:copy_wand` | 右クリックで高さ選択メニュー |
| 貼り付けの杖 | `floor_column_copy:paste_wand` | 右クリックで即貼り付け |

### コピー仕様

- 起点: プレイヤー足元ブロック（`floor(location.y) - 1`）
- 方向: **下方向（Y 軸のみ）**。横（X/Z）には広がらない
- 最大高さ: **384 ブロック**（ワールド下限 `-64` も考慮してクランプ）
- 保持: `BlockPermutation`（向き・ブロック状態）
- 非対応: BlockEntity データ（チェスト中身・看板文字など）
- クリップボード: プレイヤー単位・同一ワールドセッション内

### コピー高さメニュー

| ボタン | 種別 | 内容 |
| --- | --- | --- |
| 1ブロック | プリセット | 1 ブロック |
| 3ブロック | プリセット | 3 ブロック |
| 5ブロック | プリセット | 5 ブロック |
| 10ブロック | プリセット | 10 ブロック |
| 数値入力 | 数値入力 | 1〜384（その場の上限でクランプ） |
| 最大 | 最大 | ワールド下限まで（上限 384） |

### 操作・コマンド

| 種別 | 入力 | Beta APIs |
| --- | --- | --- |
| 杖 | コピー/貼り付けの杖を使用（空中・ブロック上） | 不要 |
| スラッシュ | `/fc:give` `/fc:menu` `/fc:paste` `/fc:help` | 不要（1.21.80+） |
| 関数 | `/function fc/give` | 不要（チート ON） |
| 関数 | `/function fc/help` | 不要（チート ON） |
| 関数 | `/function fc/menu` | 不要（チート ON） |
| 関数 | `/function fc/paste` | 不要（チート ON） |
| scriptevent | `/scriptevent fc:give run` 等 | 不要（チート ON） |
| チャット | `!fc give` `!fc menu` `!fc paste` | **必要** |

### 初回配布

- 初回スポーン時にコピーの杖・貼り付けの杖を自動配布（`fc:starter_given` で再配布を抑制）
- クリエイティブアイテムタブ **Floor Column Copy** からも取得可

### ヘルプ文言（CONFIG.messages.help）

- 使い方: コピーの杖で高さを選び、貼り付けの杖で即貼り付け
- 杖の入手: クリエイティブアイテムタブ / /function fc/give / /fc:give
- メニュー: コピーの杖を使用 / /function fc/menu / /fc:menu

### パックバージョン

- script 表示: `1.0.3`
<!-- sync:auto:game-rules:end -->

---

## 4. 技術構成

| コンポーネント | パス |
| --- | --- |
| Behavior Pack | `behavior_packs/floor_column_copy/` |
| Resource Pack | `resource_packs/floor_column_copy/` |
| エントリ | `scripts/main.js` |
| 設定 | `scripts/config.js` |
| コピー処理 | `scripts/copy.js` |
| 貼り付け処理 | `scripts/paste.js` |
| UI | `scripts/ui.js` |
| クリップボード | `scripts/storage.js`（メモリ内 Map） |

### Script API 依存（manifest）

- `@minecraft/server` 1.11.0
- `@minecraft/server-ui` 1.2.0

### パック UUID

| パック | UUID |
| --- | --- |
| Behavior | `f1a2b3c4-d5e6-4f78-9a0b-1c2d3e4f5a6b` |
| Resource | `f4a5b6c7-d8e9-4fa1-2b3c-4d5e6f7a8b9c` |

---

## 5. ビジュアル・アセット

### パックアイコン

| ファイル | 配置 |
| --- | --- |
| `pack_icon.png` | `behavior_packs/floor_column_copy/` と `resource_packs/floor_column_copy/` のルート |

ワールド設定のパック一覧に表示される。変更時は manifest `version` を上げて OFF→ON。

### 説明画像（配布・README 用）

| ファイル | 言語 |
| --- | --- |
| `docs/images/description_ja.png` | 日本語 |
| `docs/images/description_en.png` | English |

[addon-description.md](./addon-description.md) と [README.md](../README.md) から参照。

### アイテムテクスチャ（16×16）

| ファイル | 内容 |
| --- | --- |
| `textures/items/copy_wand.png` | 緑の宝石＋重なった紙アイコン＋茶色の柄 |
| `textures/items/paste_wand.png` | 青の宝石＋クリップボードアイコン＋茶色の柄 |

### メニューアイコン（`textures/ui/menu/`）

| ファイル | 用途 |
| --- | --- |
| `height_1.png` | 1ブロック preset |
| `height_3.png` | 3ブロック preset |
| `height_5.png` | 5ブロック preset |
| `height_10.png` | 10ブロック preset |
| `custom_input.png` | 数値入力 |
| `max_height.png` | 最大 |

Material Icons ベースの白アイコン（フォーム UI 用）。

---

## 6. 手動で追記する内容

- 画像生成プロンプト例は ChatGPT 用に README / 本ファイルの「一言説明」を参照
- 仕様変更時は `config.js` / `ui.js` / `main.js` を直したあと **必ず** `npm run sync:project-docs`
- manifest `version` を上げたらワールドでパック OFF→ON または `sync:bedrock-world-pack`
