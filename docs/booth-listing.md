# BOOTH 商品情報（コピペ用）

Number Block の販売ページ構成に合わせた Floor Column Copy 用の記入例です。  
BOOTH「商品情報を編集」へそのまま貼れます。

**制作:** komolab - こもらぼ -  
**バージョン:** 1.0.4  
**配布ファイル:** `dist/FloorColumnCopy_v1.0.4.zip`（BOOTH は zip のみ可の場合はこちら。`npm run pack:mcaddon` で生成。同内容の `.mcaddon` もあり）

---

## 販売方法

ダウンロード販売

---

## 商品名

```txt
【統合版】Floor Column Copy｜足元から下方向コピーの建築アドオン
```

---

## 商品画像

| 優先 | ファイル | 用途 |
| --- | --- | --- |
| 1（サムネイル） | `docs/images/description_ja.png` | 商品一覧のメイン画像 |
| 2 | `docs/images/description_en.png` | 海外向け説明 |
| 3 | `behavior_packs/floor_column_copy/pack_icon.png` | アイコン寄り（任意） |

---

## カテゴリ

ゲーム関連商品

---

## 年齢制限

全年齢

---

## 商品紹介文（description）

下の枠内をそのまま BOOTH の「商品紹介文」へ貼り付けてください。  
（実際の掲載文と同じ内容です）

```txt
【Floor Column Copy】

足元ブロックから「下方向だけ」にブロック列をコピーし、別の場所へ貼り付ける
Minecraft 統合版（Bedrock）向けの建築支援アドオンです。

コピーの杖で高さを選び、貼り付けの杖で即復元。
クリエイティブ建築や地形の複製ショートカットに使えます。


■ できること
・コピーの杖で高さ選択（1 / 3 / 5 / 10・数値入力・最大）
・貼り付けの杖で即ペースト
・ブロックの向き・状態を保持
・初回参加時に杖を自動配布（または /fc:give）


■ 対応環境
・Minecraft 統合版（Bedrock）1.21 以降
・Windows / コンソール / モバイルなど統合版クライアント
・Beta APIs 不要（通常利用）
・日本語 / 英語対応（ゲーム言語に合わせて表示）


■ 導入方法
1. ダウンロードしたファイル（.mcaddon または zip）を開く／展開する
2. ワールド設定で「Floor Column Copy」を
　・ビヘイビアパック
　・リソースパック
　の両方に追加してON
3. ワールドに入る
4. 杖が無ければ /fc:give または /function fc/give（チートON時）


■ 使い方
1. コピーしたい場所に立つ
2. 「コピーの杖」を使って高さを選ぶ
3. 貼り付けたい場所に移動する
4. 「貼り付けの杖」を使う


■ 注意事項（必ずお読みください）
・コピーは下方向（Y軸）のみです。横方向には広がりません
・最大コピー高さは 384 ブロックです
・チェストの中身・看板の文字など BlockEntity データはコピーしません
・本商品は Minecraft 公式 Marketplace の商品ではありません
・Microsoft / Mojang とは無関係の個人制作アドオンです
・再配布・転売・他サイトへの再アップロードは禁止です
・購入者本人の利用（実況・動画投稿は可／クレジット任意）


■ サポート
不具合や導入で困ったときは、BOOTHのメッセージ機能でご連絡ください。
可能な範囲で対応します。


制作: komolab - こもらぼ -
バージョン: 1.0.4


■ 導入の参考（公式）
アドオン（ビヘイビア／リソースパック）の一般的な入れ方は、こちらも参照してください。
https://learn.microsoft.com/ja-jp/minecraft/creator/documents/gettingstarted?view=minecraft-bedrock-stable

本商品は ZIP 配布です。
・ZIPの拡張子を .mcaddon に変更してダブルクリック
　または
・展開して floor_column_copy_bp / floor_column_copy_rp を
　behavior_packs / resource_packs に配置
したあと、ワールド設定で両方をONにしてください。
```

---

## タグ

```txt
ツール
クリエイティブ
建築
Minecraft
マインクラフト
アドオン
addon
Mod
統合版
Bedrock
コピー
貼り付け
ペースト
杖
ワンド
```

---

## イベント

なし

---

## 価格（案）

```txt
300
```

円（必要に応じて変更。500 円帯も可）

---

## その他フォーム項目

| 項目 | 推奨 |
| --- | --- |
| 日本国外への販売 | 許可する／対象にする（選択肢に合わせて） |
| 代理購入サービスの掲載許可 | **許可しない**（ダウンロード販売向け） |
| バリエーション | なし |
| 限定販売数 | 0（無制限） |
| 購入者1人あたりの注文可能数 | 0（制限なし） |

---

## 作品ファイル

```bash
npm run pack:mcaddon
```

| ファイル | 用途 |
| --- | --- |
| `dist/FloorColumnCopy_v1.0.4.zip` | **BOOTH 作品ファイル（zip のみ可の場合）** |
| `dist/FloorColumnCopy_v1.0.4.mcaddon` | 同内容（.mcaddon が上げられる場合） |
| `dist/README_BUYER.txt` | 購入者向け導入手順 |

---

## English short blurb（海外向け併記用・任意）

BOOTH 説明の末尾や画像キャプション用。

```txt
【Floor Column Copy】
A Bedrock Edition building utility that copies a vertical column of blocks downward from under your feet and pastes it elsewhere.
Use the Copy Wand to choose height, then the Paste Wand to restore instantly.
Japanese / English UI. No Beta APIs required for normal use.
```
