<script setup lang="ts">
import type {
  ContextMenu,
  FileSystemNode,
  FolderNode as IFolderNode,
  NodeType,
} from "@/types";
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  provide,
  ref,
  watch,
} from "vue";
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
  () => contextMenu.value.data?.type === "folder",
);

const isClickRoot = computed<boolean>(
  () => contextMenu.value.data?.id === fileTree.value.id,
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

// 反正只是绑定操作事件，肯定是 DOM 渲染完了才会触发，不用 onMounted 包裹也可以

// 由于是在 window 上监听，事件顺序是最后一个
// 肯定先让各个 DOM 的事件钩子能够执行，最后才关

const handleClickOutside = (e: PointerEvent) => {
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
};

const handleRightClickOutside = (e: PointerEvent) => {
  if (!(e.target as HTMLElement).closest("a")) {
    resetContextMenu();
  }
};

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

const hoveredNodeId = ref<string | null>(null);

const setHoveredNodeId = (id: string | null) => (hoveredNodeId.value = id);

provide("hover", setHoveredNodeId);

const handleKeyRename = (e: KeyboardEvent) => {
  if (document.activeElement?.tagName === "INPUT") return;

  if (e.key !== "F2") return;

  e.preventDefault();

  if (!hoveredNodeId.value) return;

  const findNode = (nodes: any, id: string): FileSystemNode | null => {
    if (nodes.id === id) {
      return nodes;
    }
    if (!nodes.children) return null;
    for (const child of nodes.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
    return null;
  };

  contextMenu.value.data = findNode(fileTree.value, hoveredNodeId.value);
  isRename.value = true;
};

const handleKeyRenameOut = (e: KeyboardEvent) => {
  if (document.activeElement?.tagName !== "INPUT") return;

  if (e.key !== "Escape") return;

  e.preventDefault();

  isRename.value = false;
  resetContextMenu();
};

onMounted(() => {
  window.addEventListener("click", handleClickOutside);
  window.addEventListener("contextmenu", handleRightClickOutside, true);
  window.addEventListener("keydown", handleKeyRename);
  window.addEventListener("keydown", handleKeyRenameOut);
});

onUnmounted(() => {
  window.removeEventListener("click", handleClickOutside);
  window.removeEventListener("contextmenu", handleRightClickOutside, true);
  window.removeEventListener("keydown", handleKeyRename);
  window.removeEventListener("keydown", handleKeyRenameOut);
});

const isCopyTooltipOpen = ref(false);

const handleCopy = async () => {
  if (!showedFileTree.value) return;

  try {
    await navigator.clipboard.writeText(showedFileTree.value);
  } catch (error) {
    console.error("复制失败", error);
    return;
  }

  isCopyTooltipOpen.value = true;
  window.setTimeout(() => {
    isCopyTooltipOpen.value = false;
  }, 1500);
};
</script>

<template>
  <div
    class="flex h-lvh w-full gap-4 overflow-hidden bg-base-100 pt-32 pb-32 pl-64 pr-64"
  >
    <section
      class="flex min-w-0 flex-1 flex-col overflow-hidden rounded-box bg-base-200"
    >
      <header
        class="flex h-12 items-center gap-2 border-b border-base-300 px-4 text-sm font-semibold select-none"
      >
        文件树
      </header>
      <ul class="menu menu-xs flex-1 overflow-auto p-2 w-full">
        <FolderNode :folder-node="fileTree" non-collapsible />
      </ul>
    </section>
    <section
      class="flex min-w-0 flex-1 flex-col overflow-hidden rounded-box bg-base-200"
    >
      <header
        class="flex h-12 items-center gap-2 border-b border-base-300 px-4 text-sm font-semibold"
      >
        <span class="select-none">预览</span>
        <div
          class="ml-auto"
          :class="[
            isCopyTooltipOpen ? 'tooltip tooltip-left tooltip-open' : '',
          ]"
          :data-tip="isCopyTooltipOpen ? '已复制' : undefined"
        >
          <button
            class="btn btn-xs text-base-content"
            type="button"
            @click="handleCopy"
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="4"
                y="8"
                width="12"
                height="12"
                rx="1"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M8 6V5C8 4.44772 8.44772 4 9 4H19C19.5523 4 20 4.44772 20 5V15C20 15.5523 19.5523 16 19 16H18"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-dasharray="2 2"
              />
            </svg>
          </button>
        </div>
      </header>
      <div class="flex-1 overflow-auto p-4">
        <textarea
          readonly
          class="textarea textarea-ghos h-full w-full min-h-0 resize-none font-mono whitespace-pre overflow-auto"
          placeholder="文件树"
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
