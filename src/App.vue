<script setup lang="ts">
import FolderNode from "@/components/FolderNode.vue";
import type { ContextMenu, FolderNode as IFolderNode } from "./types";
import { computed, nextTick, provide, ref, watch } from "vue";
import { useBuildFileTree } from "./composables/useBuildFileTree";

const { root, fileTree } = useBuildFileTree();

const test = ref<IFolderNode>({
  id: "1",
  type: "folder",
  name: "aaa",
  children: [
    {
      id: "2",
      type: "folder",
      name: "bbb",
      children: [],
    },
    {
      id: "3",
      type: "file",
      name: "ccc",
    },
    {
      id: "4",
      type: "folder",
      name: "bbb",
      children: [
        {
          id: "5",
          type: "file",
          name: "ccc",
        },
        {
          id: "6",
          type: "file",
          name: "ddd",
        },
      ],
    },
    {
      id: "7",
      type: "file",
      name: "ddd",
    },
    {
      id: "8",
      type: "folder",
      name: "bbb",
      children: [
        {
          id: "9",
          type: "folder",
          name: "bbb",
          children: [
            {
              id: "10",
              type: "file",
              name: "ccc",
            },
            {
              id: "11",
              type: "file",
              name: "ddd",
            },
          ],
        },
        {
          id: "12",
          type: "file",
          name: "ddd",
        },
      ],
    },
  ],
});

const f = async () => {
  root.value = test.value;
  await nextTick();
  console.log(fileTree.value);
};
watch(test, f, { immediate: true });

const contextMenu = ref<ContextMenu>({
  show: false,
  x: 0,
  y: 0,
  data: null,
});

const openContextMenu = (e: MouseEvent, data: any) => {
  contextMenu.value.show = false; // 先把当前菜单关了

  contextMenu.value.x = e.clientX;
  contextMenu.value.y = e.clientY;
  contextMenu.value.data = data;
  contextMenu.value.show = true;
};

const closeContextMenu = () => {
  contextMenu.value.show = false;
  contextMenu.value.data = null;
};
const state = computed(() => contextMenu.value.data);

provide("contextMenu", {
  state,
  openContextMenu,
  closeContextMenu,
});

// 由于是在 window 上监听，事件顺序是最后一个
// 肯定先让各个 DOM 的事件钩子能够执行，最后才关
window.addEventListener("click", closeContextMenu);

window.addEventListener(
  "contextmenu",
  (e) => {
    if (!(e.target as HTMLElement).closest("a")) {
      closeContextMenu();
    }
  },
  true
);
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
        <FolderNode :folder-node="test" non-collapsible />
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
          >{{ fileTree }}</textarea
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
  >
    <ul
      class="menu dropdown-content bg-base-100 rounded-box w-30 p-0 shadow-sm"
    >
      <li><a @click="closeContextMenu">Item 1</a></li>
      <li><a @click="closeContextMenu">Item 2</a></li>
    </ul>
  </div>
</template>

<style scoped></style>
