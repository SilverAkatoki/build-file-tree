import { computed, ref, watch } from "vue";
import type { FolderNode as IFolderNode, BaseNode } from "@/types";

export const useBuildFileTree = () => {
  const root = ref<IFolderNode | null>(null);
  const fileTreeArr = ref<string[]>([]);

  const dfs = (node: BaseNode, prefix: string = "", isLastNode: boolean, isRoot: boolean): void => {
    if (isRoot) {
      fileTreeArr.value.push(node.name);
    } else {
      const connector = isLastNode ? '└── ' : '├── ';
      const line = `${prefix}${connector}${node.name}`;
      fileTreeArr.value.push(line);
    }


    if (node.type === "folder") {
      const folderNode = node as IFolderNode;
      const children = folderNode.children;
      const newPrefix = (() => {
        if (isRoot) {
          return "";
        } else {
          return prefix + (isLastNode ? "    " : "│   ");
        }

      })();

      children.forEach((child, index) => {
        const isLastChild = index === children.length - 1;
        dfs(child, newPrefix, isLastChild, false);
      });
    }
  };

  watch(
    root,
    (newRoot) => {
      if (newRoot) {
        fileTreeArr.value = [];
        dfs(newRoot, "", true, true);
      }
    },
    { deep: true }
  );


  const fileTree = computed<string>(() => fileTreeArr.value.join("\n"));
  return {
    root, fileTree
  }
};