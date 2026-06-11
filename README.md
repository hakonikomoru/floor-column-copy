# Floor Column Copy

Minecraft Bedrock Edition 向け Script API アドオンです。  
プレイヤーが立っている足元ブロックから、**下方向（Y 軸のみ）** にブロック列をコピーし、別の地点へ貼り付けできます。

## 機能

- **コピーの杖** (`floor_column_copy:copy_wand`) … 右クリックで高さ選択メニュー
- **貼り付けの杖** (`floor_column_copy:paste_wand`) … 右クリックで即貼り付け
- ブロックの向き・状態は `BlockPermutation` で保持（チェスト中身・看板文字などの BlockEntity は MVP 対象外）
- 最大コピー高さ: **384 ブロック**（ワールド下限も考慮）

## 必要環境

- Minecraft Bedrock Edition **1.21 以降**
- ワールドで **Beta APIs（実験的ゲームプレイ）** を有効化（Script API 利用のため）

## インストール

1. このリポジトリの以下 2 パックを、Minecraft の開発者フォルダへコピーします。
   - `behavior_packs/floor_column_copy`
   - `resource_packs/floor_column_copy`
2. ワールド設定 → ビヘイビアパック / リソースパック から **Floor Column Copy** を有効化
3. ワールドを開き、動作確認

### 開発者フォルダ（Windows 例）

```
%LOCALAPPDATA%\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang\
  behavior_packs\
  resource_packs\
```

## 使い方

### 1. 杖の入手（テスト用・推奨）

チャットで:

```
!fc give
```

コピーの杖と貼り付けの杖がインベントリに入ります。

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

## 補助コマンド（任意）

| コマンド | 内容 |
| --- | --- |
| `!fc give` | 2 種類の杖を付与 |
| `!fc menu` | コピー高さメニューを開く |
| `!fc paste` | 即貼り付け |
| `!fc` | ヘルプ表示 |

## クリエイティブインベントリ

装備タブの **Floor Column Copy** グループに 2 種類の杖が表示されます。  
表示されない場合は `!fc give` を使ってください。

## ファイル構成

```txt
behavior_packs/floor_column_copy/
  manifest.json
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
