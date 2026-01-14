<script setup lang="ts">
import FolderNode from "@/components/FolderNode.vue";
import type { FolderNode as IFolderNode } from "./types";
import { nextTick, ref, watch } from "vue";
import { useBuildFileTree } from "./composables/useBuildFileTree";

const { root, fileTree } = useBuildFileTree();

const test = ref<IFolderNode>({
  type: "folder",
  name: "aaa",
  children: [
    {
      type: "folder",
      name: "bbb",
      children: [],
    },
    {
      type: "file",
      name: "ccc",
    },
    {
      type: "folder",
      name: "bbb",
      children: [
        {
          type: "file",
          name: "ccc",
        },
        {
          type: "file",
          name: "ddd",
        },
      ],
    },
    {
      type: "file",
      name: "ddd",
    },
    {
      type: "folder",
      name: "bbb",
      children: [
        {
          type: "folder",
          name: "bbb",
          children: [
            {
              type: "file",
              name: "ccc",
            },
            {
              type: "file",
              name: "ddd",
            },
          ],
        },
        {
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
          class="textarea textarea-bordered h-full w-full min-h-0 resize-none font-mono leading-none"
          placeholder="在这里复制文件树"
          >{{ fileTree }}</textarea
        >
      </div>
    </section>
  </div>
</template>

<style scoped></style>
