export const CONFIG = {
  namespace: "floor_column_copy",
  items: {
    copyWand: "floor_column_copy:copy_wand",
    pasteWand: "floor_column_copy:paste_wand",
  },
  /** Maximum blocks copied downward in one operation. */
  maxCopyHeight: 384,
  /** Fallback when dimension.heightRange is unavailable. */
  defaultMinY: -64,
  messages: {
    prefix: "[FC]",
    noClipboard: "コピーされたブロックがありません",
    copyDone: (count) => `コピー完了：${count}ブロック`,
    pasteDone: (count) => `貼り付け完了：${count}ブロック`,
    invalidHeight: "高さは1〜384の整数で入力してください",
    giveDone: "コピーの杖と貼り付けの杖を付与しました",
    help: "使い方: コピーの杖で高さを選び、貼り付けの杖で即貼り付け。`!fc give` で杖を入手",
  },
};
