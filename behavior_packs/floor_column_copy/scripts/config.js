export const CONFIG = {
  namespace: "floor_column_copy",
  packVersion: "1.0.4",
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
};
