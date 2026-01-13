import { ref } from "vue";
import { type FolderNode as IFolderNode, type BaseNode } from "@/types";

export const useBuildFileTree = () => {
  const root = ref<IFolderNode | null>(null);
  const fileTree = ref<string>("");

  // 构建文件树
  // 算法题，来喽

  return {
    root, fileTree
  }
};