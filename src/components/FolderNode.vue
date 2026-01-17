<script setup lang="ts">
import { computed, inject, nextTick, ref, watch } from "vue";
import type { FileNode as IFileNode, FolderNode as IFolderNode } from "@/types";
import FileNode from "@/components/FileNode.vue";

const props = defineProps<{
  folderNode: IFolderNode;
}>();

const isLeaf = computed<boolean>(() => props.folderNode.children.length === 0);

const { state, openContextMenu } = inject("contextMenu") as any;

const { isRename, renameNode } = inject("rename") as any;

const setHoveredNodeId = inject("hover") as any;

const handleRightClick = (e: MouseEvent) => {
  openContextMenu(e, props.folderNode);
};

const newName = ref<string>(props.folderNode.name);

const isInRename = computed<boolean>(
  () => isRename.value && state.value?.id === props.folderNode.id
);

const inputRef = ref<HTMLInputElement | null>(null);

watch(isInRename, async (val) => {
  if (val) {
    await nextTick();
    inputRef.value?.focus();
    // 失焦的时候绑的是关闭重命名状态，所以这里必须要聚焦在输入框里
    // 从体验上来说重命名自动聚焦也是很正常的吧

    inputRef.value?.select();
  }
});

const handleInputBlur = (e: FocusEvent) => {
  const newName = (e.target as HTMLInputElement).value;
  if (newName && newName !== props.folderNode.name) {
    renameNode(props.folderNode.id, newName);
  }
  isRename.value = false;
};

const handleLeftClick = (e: MouseEvent) => {
  if (state.value && !isRename.value) {
    e.preventDefault();
    return;
  }
};
</script>

<template>
  <li
    :class="{ 'no-arrow': isLeaf }"
    @click="handleLeftClick"
    @mouseover.stop="setHoveredNodeId(props.folderNode.id)"
    @mouseleave="setHoveredNodeId(null)"
  >
    <details ref="detailsRef" open>
      <summary
        @contextmenu.prevent="handleRightClick"
        :class="{ 'menu-active': state?.id === props.folderNode.id }"
        class="whitespace-nowrap"
      >
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
        <input
          ref="inputRef"
          v-if="isInRename"
          type="text"
          placeholder="文件名"
          class="input input-xs text-black"
          v-model="newName"
          @blur="handleInputBlur"
          @keyup.enter="($event.target as HTMLInputElement).blur()"
        />
        <p v-else class="shrink-0">
          {{ props.folderNode.name }}
        </p>
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
