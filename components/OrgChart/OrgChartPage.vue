<template>
  <div class="flex flex-col h-full overflow-x-auto p-4 sm:p-6 lg:p-8">
    <div class="flex justify-between items-center mb-6 min-w-max">
      <h3 class="font-semibold text-xl dark:text-gray-100">
        {{ $t('orgChart.title') }}
      </h3>
      <div v-if="permissionsStore.can('org_chart', 'modify')" class="flex gap-3">
        <template v-if="!editMode">
          <button
            class="inline-flex justify-center rounded-[70px] border shrink-0 border-transparent bg-[#EA021A] py-[15px] px-[20px] text-[14px] font-medium text-white shadow-sm hover:bg-[#EA021A]/80 focus:outline-none"
            @click="editMode = true"
          >
            {{ $t('orgChart.editMode') }}
          </button>
        </template>
        <template v-else>
          <button
            class="inline-flex justify-center rounded-[70px] border shrink-0 border-transparent bg-[#EA021A] py-[15px] px-[20px] text-[14px] font-medium text-white shadow-sm hover:bg-[#EA021A]/80 focus:outline-none"
            @click="cancelEdit"
          >
            {{ $t('orgChart.cancelEdit') }}
          </button>
          <button
            class="inline-flex justify-center rounded-[70px] border shrink-0 border-transparent bg-[#EA021A] py-[15px] px-[20px] text-[14px] font-medium text-white shadow-sm focus:outline-none bg-green-700 hover:bg-green-700/80 transition"
            @click="save"
          >
            {{ $t('orgChart.saveChart') }}
          </button>
        </template>
      </div>
    </div>

    <!-- Toolbar + Banner -->
    <div
      v-if="editMode"
      class="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 rounded flex justify-between items-center min-w-max"
    >
      <span>{{ $t('orgChart.unsavedChanges') }}</span>
      <button
        class="px-3 py-1 bg-white dark:bg-neutral-800 border border-yellow-300 dark:border-yellow-700 rounded hover:shadow-sm"
        @click="addRootNode"
      >
        {{ $t('orgChart.addRoot') }}
      </button>
    </div>

    <div class="flex-grow flex justify-center items-start overflow-visible min-w-max">
      <template v-if="centralStore.orgChartStore.loading && !editMode">
        <div class="animate-pulse space-y-4 flex flex-col items-center">
          <div class="w-48 h-16 bg-gray-200 dark:bg-neutral-700 rounded"></div>
          <div class="w-px h-8 bg-gray-200 dark:bg-neutral-700"></div>
          <div class="flex gap-4">
            <div class="w-48 h-16 bg-gray-200 dark:bg-neutral-700 rounded"></div>
            <div class="w-48 h-16 bg-gray-200 dark:bg-neutral-700 rounded"></div>
          </div>
        </div>
      </template>

      <div v-else-if="localTree.length > 0" class="flex gap-16 relative mt-4">
        <div v-for="(rootNode, index) in localTree" :key="rootNode.id" class="relative">
          <template v-if="localTree.length > 1">
            <div
              class="absolute w-px h-4 bg-gray-300 dark:bg-neutral-600 top-[-1rem] left-1/2 transform -translate-x-1/2"
            ></div>

            <!-- Horizontal lines across gap-16 (half gap = 2rem) -->
            <div
              v-if="index === 0"
              class="absolute h-px bg-gray-300 dark:bg-neutral-600 top-[-1rem] left-1/2 right-[-2rem]"
            ></div>
            <div
              v-else-if="index === localTree.length - 1"
              class="absolute h-px bg-gray-300 dark:bg-neutral-600 top-[-1rem] left-[-2rem] right-1/2"
            ></div>
            <div
              v-else
              class="absolute h-px bg-gray-300 dark:bg-neutral-600 top-[-1rem] left-[-2rem] right-[-2rem]"
            ></div>
          </template>

          <OrgChartNode
            :node="rootNode"
            :edit-mode="editMode"
            @add-child="showPicker($event, false)"
            @add-sibling="showPicker($event, true)"
            @remove="removeNode"
            @move="moveNode"
          />
        </div>
      </div>

      <div v-else class="text-gray-500 text-center py-20">
        {{ $t('orgChart.empty') }}
      </div>
    </div>

    <!-- User Picker Modal -->
    <OrgChartUserPicker
      v-model="pickerOpen"
      :exclude-user-ids="placedUserIds"
      @select="onUserPicked"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import OrgChartNode from './OrgChartNode.vue';
import OrgChartUserPicker from './OrgChartUserPicker.vue';
import { useCentralStore } from '~/stores/centralStore';
import type { OrgChartNode as FlatNode } from '~/types';

const { t } = useI18n();
const centralStore = useCentralStore();
const permissionsStore = centralStore.permissionsStore;

const editMode = ref(false);
const pickerOpen = ref(false);
const pendingParentId = ref<number | null>(null);

// Local working copy of flat nodes
const localNodes = ref<FlatNode[]>([]);
const nextTempId = ref(10000);

onMounted(() => {
  centralStore.orgChartStore.fetchOrgChart();
});

watch(
  () => centralStore.orgChartStore.nodes,
  (newNodes) => {
    if (!editMode.value) {
      localNodes.value = JSON.parse(JSON.stringify(newNodes));
      const maxId =
        newNodes.length > 0 ? Math.max(...newNodes.map((n: any) => Number(n.id) || 0)) : 10000;
      nextTempId.value = maxId + 10;
    }
  },
  { immediate: true, deep: true },
);

const cancelEdit = () => {
  localNodes.value = JSON.parse(JSON.stringify(centralStore.orgChartStore.nodes));
  editMode.value = false;
};

const save = async () => {
  try {
    const payload = localNodes.value.map((n) => ({
      id: n.id,
      user_id: n.user_id,
      parent_id: n.parent_id,
      position: n.position,
    }));
    await centralStore.orgChartStore.saveOrgChart(payload);
    editMode.value = false;
    // alert toast Success inside store perhaps, or here
    (useNuxtApp() as any).$toast?.success(t('orgChart.saveSuccess'));
  } catch (e) {
    // error handled via store setError
  }
};

const localTree = computed(() => {
  const map = new Map();
  const treeNodes: any[] = [];

  localNodes.value.forEach((n) => {
    map.set(n.id, { ...n, children: [] });
  });

  localNodes.value.forEach((n) => {
    const treeNode = map.get(n.id);
    if (n.parent_id === null || !map.has(n.parent_id)) {
      treeNodes.push(treeNode);
    } else {
      map.get(n.parent_id).children.push(treeNode);
    }
  });

  const sortChildren = (nodes: any[]) => {
    nodes.sort((a, b) => a.position - b.position);
    nodes.forEach((n) => sortChildren(n.children));
  };
  sortChildren(treeNodes);
  return treeNodes;
});

const placedUserIds = computed(() => localNodes.value.map((n) => n.user_id));

const addRootNode = () => {
  pendingParentId.value = null;
  pickerOpen.value = true;
};

const showPicker = (parentId: number, siblingMode: boolean) => {
  pendingParentId.value = siblingMode
    ? (localNodes.value.find((n) => n.id === parentId)?.parent_id ?? null)
    : parentId;
  pickerOpen.value = true;
};

const onUserPicked = (userId: number) => {
  const parentId = pendingParentId.value;
  const siblings = localNodes.value.filter((n) => n.parent_id === parentId);
  const position = siblings.length > 0 ? Math.max(...siblings.map((n) => n.position)) + 1 : 0;

  const user =
    centralStore.userStore.allUsers?.find((u: any) => u.id === userId) ||
    centralStore.userStore.allUsers?.find((u: any) => u.id === userId);

  localNodes.value.push({
    id: nextTempId.value++,
    user_id: userId,
    parent_id: parentId,
    position,
    user,
  } as any);
};

const removeNode = (id: number) => {
  if (confirm(t('orgChart.removeConfirm'))) {
    // Cascading delete
    const idsToRemove = new Set([id]);
    let added = true;
    while (added) {
      added = false;
      localNodes.value.forEach((n) => {
        if (n.parent_id !== null && idsToRemove.has(n.parent_id) && !idsToRemove.has(n.id)) {
          idsToRemove.add(n.id);
          added = true;
        }
      });
    }
    localNodes.value = localNodes.value.filter((n) => !idsToRemove.has(n.id));
  }
};

const moveNode = ({ id, dir }: { id: number; dir: -1 | 1 }) => {
  const node = localNodes.value.find((n) => n.id === id);
  if (!node) return;
  const siblings = localNodes.value
    .filter((n) => n.parent_id === node.parent_id)
    .sort((a, b) => a.position - b.position);
  const idx = siblings.findIndex((n) => n.id === id);
  if (idx < 0) return;
  if (dir === -1 && idx > 0) {
    const swap = siblings[idx - 1];
    const temp = node.position;
    node.position = swap.position;
    swap.position = temp;
  } else if (dir === 1 && idx < siblings.length - 1) {
    const swap = siblings[idx + 1];
    const temp = node.position;
    node.position = swap.position;
    swap.position = temp;
  }
};
</script>
