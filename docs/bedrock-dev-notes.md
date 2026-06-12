# 統合版（Bedrock）開発・動作確認メモ

> Minecraft **Launcher（統合版）** での開発手順。動作確認・トラブルシュート時は README の前にここを読む。

---

## 1. データフォルダ（Launcher 版）

| 起動方法 | パック置き場（Windows） |
| --- | --- |
| **Launcher（本プロジェクト想定）** | `%APPDATA%\Minecraft Bedrock\Users\Shared\games\com.mojang\` |
| Store 直起動（参考） | `%LOCALAPPDATA%\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang\` |

- ワールドは `Users\<アカウントID>\games\com.mojang\minecraftWorlds\<ID>\` にあることもある。
- パック適用は `world_behavior_packs.json` / `world_resource_packs.json` の UUID（`manifest.json` の `header.uuid`）で紐づく。

### 開発用：ジャンクションでリポジトリ直結

コピーせず、編集を即反映する:

```bash
npm run install:bedrock-pack
```

PowerShell で `npm` が実行ポリシーで拒否される場合は **`npm.cmd run install:bedrock-pack`** または **`node scripts/install-bedrock-pack.mjs`** を使う。

`install:bedrock-pack` は **Shared と各アカウント** の次の 4 箇所へジャンクションを張る:

- `behavior_packs/floor_column_copy`
- `development_behavior_packs/floor_column_copy`
- `resource_packs/floor_column_copy`
- `development_resource_packs/floor_column_copy`

---

## 2. ワールド設定（必須）

| 設定 | 理由 |
| --- | --- |
| ビヘイビアパック **Floor Column Copy** | スクリプト本体 |
| リソースパック **Floor Column Copy** | 杖テクスチャ・メニューアイコン |
| **Beta APIs**（実験的機能） | `!fc` チャットコマンド（`chatSend`）に必要 |
| チート ON（推奨） | クリエイティブでのテストが楽 |

- 実験的機能は **ワールド作成時に ON** が確実。後から付けた場合は **新規ワールド** を検討。
- スクリプトやテクスチャを直したあとは **ワールド退出 → 再入場**（できればゲーム再起動）。

### パック説明が更新されないとき

1. `npm run sync:bedrock-world-pack`（該当ワールドの `world_*_packs.json` の version も同期）
2. **`manifest.json` の `header.version` を上げる**（behavior / resource 両方）
3. **マイクラを完全終了**
4. まだ古い場合: ワールド設定でパックを **一度 OFF → ON**

---

## 3. 開発コマンド

| npm スクリプト | 内容 |
| --- | --- |
| `npm run install:bedrock-pack` | Launcher の各 `com.mojang` へジャンクション作成 |
| `npm run verify:bedrock-pack` | リポジトリと配置先のパックを確認 |
| `npm run sync:bedrock-world-pack` | パック適用済みワールドへコピー同期 |
| `npm run dev:bedrock` | ファイル監視 → 自動同期 |

`sync:bedrock-world-pack` / `dev:bedrock` は、ワールド設定で **Floor Column Copy** を一度適用したあとで使う。

---

## 4. 動作確認

1. `npm run install:bedrock-pack`
2. 新規ワールド（Beta APIs ON）→ ビヘイビア＋リソース両方を適用
3. ワールド入室 → チャットで `!fc give`
4. コピーの杖でメニュー、貼り付けの杖で設置

コンテンツログ（設定 → 作成者 → 有効化）に `[FC] Floor Column Copy loaded` が出ればスクリプト読み込み OK。

---

## 5. トラブルシュート

| 症状 | 対処 |
| --- | --- |
| パックが一覧に出ない | `npm run install:bedrock-pack` → Launcher 再起動 |
| `!fc` が効かない | Beta APIs を ON |
| 杖の見た目がおかしい | リソースパックも有効化しているか確認 |
| 編集が反映されない | `npm run sync:bedrock-world-pack` または `dev:bedrock`、ゲーム再起動 |
| 何も反応しない | コンテンツログで Script エラーを確認 |

---

## 6. manifest の API バージョン

`behavior_packs/floor_column_copy/manifest.json` の dependencies:

- `@minecraft/server` **1.11.0**
- `@minecraft/server-ui` **1.2.0**

ゲームが提供する API より新しい版を指定すると、スクリプトが読み込まれないことがある。
