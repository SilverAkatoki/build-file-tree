<script setup lang="ts">
import FolderNode from "@/components/FolderNode.vue";
import type { FolderNode as IFolderNode } from "./types";

const test: IFolderNode = {
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
      type: "file",
      name: "ddd",
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
  ],
};
</script>

<template>
  <div class="flex w-full h-lvh items-center justify-center">
    <ul class="menu menu-xs bg-base-200 rounded-box max-w-xs w-full">
      <FolderNode :folder-node="test" />
    </ul>
  </div>
</template>

<style scoped></style>
