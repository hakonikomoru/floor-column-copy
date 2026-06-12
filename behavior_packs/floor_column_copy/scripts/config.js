export const CONFIG = {
  namespace: "floor_column_copy",
  packVersion: "1.0.2",
  items: {
    copyWand: "floor_column_copy:copy_wand",
    pasteWand: "floor_column_copy:paste_wand",
  },
  dynamicProperties: {
    starterGiven: "fc:starter_given",
  },
  /** Maximum blocks copied downward in one operation. */
  maxCopyHeight: 384,
  /** Fallback when dimension.heightRange is unavailable. */
  defaultMinY: -64,
  messages: {
    prefix: "[FC]",
    ready: "Floor Column Copy 準備OK",
    noClipboard: "コピーされたブロックがありません",
    noBlocksToCopy: "コピーできるブロックがありません",
    dimensionMismatch: "別ディメンションからのコピーです（貼り付けは続行します）",
    copyDone: (count) => `コピー完了：${count}ブロック`,
    copyPartial: (count, requested) =>
      `コピー完了：${count}ブロック（要求 ${requested}、ワールド下限で打ち切り）`,
    pasteDone: (count) => `貼り付け完了：${count}ブロック`,
    pastePartial: (count, total) =>
      `貼り付け完了：${count}/${total}ブロック（途中で設置できませんでした）`,
    invalidHeight: (max) => `高さは1〜${max}の整数で入力してください`,
    giveDone: "コピーの杖と貼り付けの杖を付与しました",
    help: [
      "使い方: コピーの杖で高さを選び、貼り付けの杖で即貼り付け",
      "杖の入手: クリエイティブ装備タブ / /function fc/give / /fc:give",
      "メニュー: コピーの杖を使用 / /function fc/menu / /fc:menu",
    ],
  },
};
