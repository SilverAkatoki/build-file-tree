<script setup lang="ts">
import type { ContextMenu, FolderNode as IFolderNode, NodeType } from "@/types";
import { computed, nextTick, provide, ref, watch } from "vue";
import { useBuildFileTree } from "@/composables/useBuildFileTree";
import FolderNode from "@/components/FolderNode.vue";

import { generate } from "short-uuid";

const { root, fileTree: showedFileTree } = useBuildFileTree();

const fileTree = ref<IFolderNode>({
  id: generate(),
  type: "folder",
  name: "这是根文件夹",
  children: [
    {
      id: generate(),
      type: "folder",
      name: "这是空文件夹",
      children: [],
    },
    {
      id: generate(),
      type: "file",
      name: "这是一个文件",
    },
    {
      id: generate(),
      type: "folder",
      name: "这是有东西的文件夹",
      children: [
        {
          id: generate(),
          type: "file",
          name: "这是一个文件",
        },
        {
          id: generate(),
          type: "file",
          name: "这是另一个文件",
        },
      ],
    },
  ],
});

const updatedShowFileTree = async () => {
  root.value = fileTree.value;
  await nextTick();
};
watch(fileTree, updatedShowFileTree, { deep: true, immediate: true });

const contextMenu = ref<ContextMenu>({
  show: false,
  x: 0,
  y: 0,
  data: null,
});

const isClickFolder = computed<boolean>(
  () => contextMenu.value.data?.type === "folder"
);

const isClickRoot = computed<boolean>(
  () => contextMenu.value.data?.id === fileTree.value.id
);

const openContextMenu = (e: MouseEvent, data: any) => {
  contextMenu.value.show = false; // 先把当前菜单关了

  isRename.value = false;

  contextMenu.value.x = e.clientX;
  contextMenu.value.y = e.clientY;
  contextMenu.value.data = data;
  contextMenu.value.show = true;
};

const closeContextMenu = () => (contextMenu.value.show = false);

const state = computed(() => contextMenu.value.data);

const isRename = ref<boolean>(false);

const renameNode = (id: string, newName: string) => {
  const findAndRename = (nodes: any) => {
    if (nodes.id === id) {
      nodes.name = newName;
      return true;
    }
    if (nodes.children) {
      for (const child of nodes.children) {
        if (findAndRename(child)) return true;
      }
    }
    return false;
  };

  findAndRename(fileTree.value);
};

const deleteNode = (id: string) => {
  const findAndDelete = (parent: IFolderNode) => {
    if (!parent.children) return false;

    const index = parent.children.findIndex((child) => child.id === id);
    if (index !== -1) {
      parent.children.splice(index, 1);
      return true;
    }

    for (const child of parent.children) {
      if (child.type === "folder") {
        if (findAndDelete(child as IFolderNode)) return true;
      }
    }
    return false;
  };

  findAndDelete(fileTree.value);
};

const newNode = (parentId: string, type: NodeType) => {
  const findAndAddChildNode = (parent: IFolderNode, type: NodeType) => {
    if (parentId === parent.id) {
      if (type === "file") {
        parent.children.push({
          id: `${generate()}`,
          name: "文件",
          type: "file",
        });
      } else {
        parent.children.push({
          id: `${generate()}`,
          name: "文件夹",
          type: "folder",
          children: [],
        });
      }

      return true;
    }

    for (const child of parent.children) {
      if (child.type === "folder") {
        if (findAndAddChildNode(child as IFolderNode, type)) return true;
      }
    }
    return false;
  };

  findAndAddChildNode(fileTree.value, type);
};

provide("rename", {
  isRename,
  renameNode,
});

const resetContextMenu = () => {
  contextMenu.value.data = null;
  closeContextMenu();
  isRename.value = false;
};

provide("contextMenu", {
  state,
  openContextMenu,
  resetContextMenu,
});

// 由于是在 window 上监听，事件顺序是最后一个
// 肯定先让各个 DOM 的事件钩子能够执行，最后才关
window.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;

  if (target.closest("input")) return;

  if (target.closest("a")) {
    if (!isRename.value) {
      closeContextMenu();
      contextMenu.value.data = null;
    }
    return;
  }
  resetContextMenu();
});

window.addEventListener(
  "contextmenu",
  (e) => {
    if (!(e.target as HTMLElement).closest("a")) {
      resetContextMenu();
    }
  },
  true
);

const handleRename = () => {
  isRename.value = true;
  closeContextMenu();
  // 这里要保留操作菜单的上下文，所以不能直接重置
};

const handleDelete = () => {
  if (state.value?.id) {
    deleteNode(state.value.id);
    resetContextMenu();
  }
};

const handleNewFile = () => {
  if (state.value?.id) {
    newNode(state.value.id, "file");
    resetContextMenu();
  }
};

const handleNewFolder = () => {
  if (state.value?.id) {
    newNode(state.value.id, "folder");
    resetContextMenu();
  }
};
</script>

<template>
  <div class="flex h-lvh w-full gap-4 overflow-hidden bg-base-100 p-32">
    <section
      class="flex min-w-0 flex-1 flex-col overflow-hidden rounded-box bg-base-200"
    >
      <header class="border-b border-base-300 px-4 py-2 text-sm font-semibold">
        文件树
      </header>
      <ul class="menu menu-xs flex-1 overflow-auto p-2 w-full">
        <FolderNode :folder-node="fileTree" non-collapsible />
      </ul>
    </section>
    <section
      class="flex min-w-0 flex-1 flex-col overflow-hidden rounded-box bg-base-200"
    >
      <header class="border-b border-base-300 px-4 py-2 text-sm font-semibold">
        预览
      </header>
      <div class="flex-1 overflow-auto p-4">
        <textarea
          readonly="true"
          class="textarea textarea-ghost bg-white h-full w-full min-h-0 resize-none font-mono leading-none"
          placeholder="在这里复制文件树"
          >{{ showedFileTree }}</textarea
        >
      </div>
    </section>
  </div>
  <div
    class="fixed z-10"
    v-if="contextMenu.show"
    :style="{
      left: contextMenu.x + 'px',
      top: contextMenu.y + 'px',
    }"
    @click.stop
  >
    <ul
      class="menu dropdown-content bg-base-100 rounded-box w-30 p-0 shadow-sm"
    >
      <li v-show="isClickFolder">
        <a @click="handleNewFolder">新建文件夹</a>
      </li>
      <li v-show="isClickFolder">
        <a @click="handleNewFile">新建文件</a>
      </li>
      <li><a @click="handleRename">重命名</a></li>
      <li v-show="!isClickRoot">
        <a class="bg-red-700 text-white" @click="handleDelete">删除</a>
      </li>
    </ul>
  </div>
</template>

<style scoped></style>
