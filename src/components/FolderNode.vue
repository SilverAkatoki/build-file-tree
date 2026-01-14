<script setup lang="ts">
import { computed } from "vue";
import type { FileNode as IFileNode, FolderNode as IFolderNode } from "@/types";
import FileNode from "@/components/FileNode.vue";

const props = defineProps<{
  folderNode: IFolderNode;
}>();
const isLeaf = computed<boolean>(() => props.folderNode.children.length === 0);
</script>

<template>
  <li :class="{ 'no-arrow': isLeaf }">
    <details ref="detailsRef" open>
      <summary>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="h-4 w-4"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
          />
        </svg>
        {{ props.folderNode.name }}
      </summary>
      <ul v-for="child in props.folderNode.children">
        <FileNode
          v-if="child.type === 'file'"
          :file-node="child as IFileNode"
        />
        <FolderNode v-else :folder-node="child as IFolderNode" />
      </ul>
    </details>
  </li>
</template>

<style scoped lang="css">
.no-arrow :where(details) > summary::after {
  display: none;
}
</style>
