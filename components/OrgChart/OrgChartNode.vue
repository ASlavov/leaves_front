<template>
  <div class="org-node flex flex-col items-center">
    <!-- Node Box -->
    <div
      class="relative flex flex-col items-center p-3 border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-lg shadow-sm min-w-[200px] hover:shadow-md transition-shadow"
    >
      <UserAvatar :user="node.user as any" class="mb-2" />
      <div class="font-bold text-gray-900 dark:text-gray-100 text-sm">
        {{ node.user?.name || 'Unknown' }}
      </div>
      <div class="text-xs text-gray-500 dark:text-gray-400">
        {{ node.user?.job_title || 'Employee' }}
      </div>

      <!-- Edit Controls -->
      <div
        v-if="editMode"
        class="mt-3 flex gap-2 w-full justify-center border-t border-gray-100 dark:border-neutral-700 pt-2"
      >
        <button
          class="text-xs text-blue-600 hover:underline"
          :title="$t('orgChart.addChild')"
          @click.stop="$emit('add-child', node.id)"
        >
          + Child
        </button>
        <button
          v-if="node.parent_id !== null"
          class="text-xs text-green-600 hover:underline"
          :title="$t('orgChart.addSibling')"
          @click.stop="$emit('add-sibling', node.id)"
        >
          + Peer
        </button>
        <button
          class="text-xs text-red-600 hover:underline"
          :title="$t('orgChart.removePerson')"
          @click.stop="$emit('remove', node.id)"
        >
          Rem
        </button>
      </div>
      <div
        v-if="editMode && node.parent_id !== null"
        class="mt-1 flex gap-2 w-full justify-between px-2"
      >
        <button
          class="text-gray-400 hover:text-black dark:hover:text-white"
          @click.stop="$emit('move', { id: node.id, dir: -1 })"
        >
          &larr;
        </button>
        <button
          class="text-gray-400 hover:text-black dark:hover:text-white"
          @click.stop="$emit('move', { id: node.id, dir: 1 })"
        >
          &rarr;
        </button>
      </div>
    </div>

    <!-- Children -->
    <div v-if="node.children && node.children.length > 0" class="flex gap-4 mt-8 relative">
      <!-- Vertical line dropping from parent down to the horizontal plane -->
      <div
        class="absolute w-px h-4 bg-gray-300 dark:bg-neutral-600 top-[-2rem] left-1/2 transform -translate-x-1/2"
      ></div>

      <div
        v-for="(child, index) in node.children"
        :key="child.id"
        class="relative flex flex-col items-center"
      >
        <!-- Vertical connector line to parent plane -->
        <div
          class="absolute w-px h-4 bg-gray-300 dark:bg-neutral-600 top-[-1rem] left-1/2 transform -translate-x-1/2"
        ></div>

        <!-- Horizontal lines resolving perfectly across gap-4 (half gap = 0.5rem) -->
        <template v-if="node.children.length > 1">
          <!-- First Child: right to parent connection -->
          <div
            v-if="index === 0"
            class="absolute h-px bg-gray-300 dark:bg-neutral-600 top-[-1rem] left-1/2 right-[-0.5rem]"
          ></div>

          <!-- Last Child: left to parent connection -->
          <div
            v-else-if="index === node.children.length - 1"
            class="absolute h-px bg-gray-300 dark:bg-neutral-600 top-[-1rem] left-[-0.5rem] right-1/2"
          ></div>

          <!-- Middle Child: span both left and right gaps -->
          <div
            v-else
            class="absolute h-px bg-gray-300 dark:bg-neutral-600 top-[-1rem] left-[-0.5rem] right-[-0.5rem]"
          ></div>
        </template>

        <OrgChartNode
          :node="child"
          :edit-mode="editMode"
          :depth="depth + 1"
          @add-child="$emit('add-child', $event)"
          @add-sibling="$emit('add-sibling', $event)"
          @remove="$emit('remove', $event)"
          @move="$emit('move', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import UserAvatar from '~/components/shared/UserAvatar.vue';
import type { OrgChartTreeNode } from '~/types';

defineProps({
  node: { type: Object as () => OrgChartTreeNode, required: true },
  editMode: { type: Boolean, default: false },
  depth: { type: Number, default: 0 },
});

defineEmits(['add-child', 'add-sibling', 'remove', 'move']);
</script>

<style scoped>
/* Stylings handled dynamically with Vue inline nodes for proper layout intersection. */
</style>
