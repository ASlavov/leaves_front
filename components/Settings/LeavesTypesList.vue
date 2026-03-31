<template>
  <template v-if="loading">
    <div class="grid grid-cols-12 pt-[30px] max-w-[947px]">
      <div class="w-12 h-12 bg-gray-200 rounded-full col-span-2 mr-4 animate-pulse"></div>
      <div class="pt-4 space-y-2 col-span-10 animate-pulse">
        <p class="h-6 bg-gray-200 rounded w-full animate-pulse dark:bg-neutral-700"></p>
        <p class="h-6 bg-gray-100 rounded w-full animate-pulse dark:bg-neutral-600"></p>
        <p class="h-6 bg-gray-200 rounded w-full animate-pulse dark:bg-neutral-700"></p>
        <p class="h-6 bg-gray-100 rounded w-full animate-pulse dark:bg-neutral-600"></p>
        <p class="h-6 bg-gray-200 rounded w-full animate-pulse dark:bg-neutral-700"></p>
        <p class="h-6 bg-gray-100 rounded w-full animate-pulse dark:bg-neutral-600"></p>
        <p class="h-6 bg-gray-200 rounded w-full animate-pulse dark:bg-neutral-700"></p>
      </div>
    </div>
  </template>
  <template v-else>
    <div class="flex flex-col gap-[10px]">
      <div class="info-actions pb-5 flex gap-4 col-span-2 flex-wrap">
        <button
          v-if="permissionsStore.can('leave_types', 'modify')"
          class="py-3 inline-flex justify-center rounded-3xl border border-transparent bg-red-600 px-4 text-md font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none"
          @click="newLeaveType"
        >
          {{ $t('settings.addLeaveType') }}
        </button>
        <button
          class="py-3 inline-flex justify-center rounded-3xl border border-gray-300 dark:border-neutral-600 px-4 text-md font-medium text-gray-700 dark:text-neutral-300 shadow-sm hover:bg-gray-50 dark:hover:bg-neutral-700 focus:outline-none transition-colors"
          @click="toggleShowArchived"
        >
          {{ showArchived ? $t('settings.hideArchived') : $t('settings.showArchived') }}
        </button>
      </div>

      <div class="relative -m-4 p-4 mt-0">
        <div
          ref="scrollContainer"
          class="overflow-auto max-h-[50vh] grid gap-[10px] pr-[15px] -mr-[5px] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
        >
          <div
            v-for="leaveType in filteredLeavesTypes"
            :key="leaveType.id"
            :class="[
              'grid gap-[10px] grid-cols-2 lg:grid-cols-12 items-center border rounded-lg pl-[20px] pr-[30px] py-[10px] text-[#808080]',
              leaveType.deleted_at
                ? 'border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/50 opacity-60'
                : 'border-[#DFEAF2] hover:bg-neutral-100 dark:hover:bg-neutral-600',
            ]"
          >
            <div class="col-span-7 flex items-center gap-[10px]">
              <span>{{ leaveType.name || '' }}</span>
              <span
                v-if="leaveType.deleted_at"
                class="text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-neutral-500 bg-gray-100 dark:bg-neutral-700 px-2 py-0.5 rounded-full"
              >
                {{ $t('settings.archived') }}
              </span>
            </div>
            <div class="col-span-5 justify-self-end flex gap-[15px] items-center">
              <template v-if="permissionsStore.can('leave_types', 'modify')">
                <template v-if="!leaveType.deleted_at">
                  <a
                    class="cursor-pointer text-[#EA021A] font-bold underline text-sm"
                    @click="editLeaveType(leaveType.id)"
                  >
                    {{ $t('settings.editLeaveType') }}
                  </a>
                  <a
                    class="cursor-pointer text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300 font-bold underline text-sm transition-colors"
                    @click="confirmArchive(leaveType)"
                  >
                    {{ $t('settings.archive') }}
                  </a>
                </template>
                <a
                  v-else
                  class="cursor-pointer text-blue-500 hover:text-blue-700 dark:text-blue-400 font-bold underline text-sm transition-colors"
                  @click="handleRestore(leaveType.id)"
                >
                  {{ $t('settings.restore') }}
                </a>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>

  <!-- Edit / Add modal -->
  <SharedBaseModal v-model="showModal">
    <EditLeaveType :leave-type-id="bridgedLeaveTypeId" @saved="closeModal" />
  </SharedBaseModal>

  <!-- Archive confirmation modal -->
  <SharedBaseModal v-model="showArchiveConfirm" :title="$t('settings.archiveLeaveType')">
    <div class="px-[30px] pb-[30px] pt-[10px]">
      <p class="text-[14px] text-gray-600 dark:text-neutral-400 mb-[20px]">
        {{ $t('settings.archiveLeaveTypeConfirm', { name: archiveTarget?.name }) }}
      </p>
      <div class="flex gap-[12px]">
        <button
          :disabled="archiveLoading"
          class="inline-flex items-center justify-center py-[12px] px-[20px] rounded-[70px] bg-gray-700 hover:bg-gray-900 dark:bg-neutral-600 dark:hover:bg-neutral-500 text-[14px] font-bold text-white transition-colors focus:outline-none"
          @click="handleArchive"
        >
          <svg
            v-if="archiveLoading"
            class="animate-spin h-4 w-4 text-white mr-2"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
              fill="none"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {{ $t('settings.archive') }}
        </button>
        <button
          class="inline-flex items-center justify-center py-[12px] px-[20px] rounded-[70px] border border-gray-300 dark:border-neutral-600 text-[14px] font-bold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors focus:outline-none"
          @click="showArchiveConfirm = false"
        >
          {{ $t('common.cancel') }}
        </button>
      </div>
    </div>
  </SharedBaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useCentralStore } from '~/stores/centralStore';
import EditLeaveType from '~/components/Settings/EditLeaveType.vue';
import SharedBaseModal from '~/components/shared/BaseModal.vue';
import { extractApiError } from '@/utils/extractApiError';
import { useLeavesTypesReactive } from '@/composables/leavesApiComposable';
import type { LeaveType } from '~/types';

const centralStore = useCentralStore();
const leavesStore = centralStore.leavesStore;
const permissionsStore = centralStore.permissionsStore;

// Use reactive fetching
const { data: remoteLeaves, pending, refresh } = useLeavesTypesReactive(true); // Get all (including archived)

const loading = computed(() => pending.value || centralStore.loading);

const showModal = ref(false);
const selectedLeaveTypeId = ref<string | number | null>(null);

const showArchived = ref(false);
const showArchiveConfirm = ref(false);
const archiveTarget = ref<LeaveType | null>(null);
const archiveLoading = ref(false);

const allLeaves = ref<LeaveType[]>([]);

// Mixin remote leaves from composable AND store
const leavesToProcess = computed(
  () => remoteLeaves.value || leavesStore.leavesData.leavesTypes || [],
);

watch(
  leavesToProcess,
  (leaves) => {
    if (!leaves) return;
    allLeaves.value = leaves;
    // Sync back to store
    leavesStore.leavesData.leavesTypes = leaves;
  },
  { immediate: true },
);

const filteredLeavesTypes = computed(() => {
  if (showArchived.value) return allLeaves.value;
  return allLeaves.value.filter((lt) => !lt.deleted_at);
});

const toggleShowArchived = () => {
  showArchived.value = !showArchived.value;
};

const newLeaveType = () => {
  selectedLeaveTypeId.value = null;
  showModal.value = true;
};

const editLeaveType = (leaveTypeId: string | number) => {
  selectedLeaveTypeId.value = leaveTypeId;
  showModal.value = true;
};

const confirmArchive = (leaveType: LeaveType) => {
  archiveTarget.value = leaveType;
  showArchiveConfirm.value = true;
};

const handleArchive = async () => {
  if (!archiveTarget.value) return;
  archiveLoading.value = true;
  try {
    await leavesStore.deleteLeaveType(archiveTarget.value.id);
    (useNuxtApp() as any).$toast.success(
      (useNuxtApp() as any).$i18n.t('settings.leaveTypeArchived'),
    );
    showArchiveConfirm.value = false;
    archiveTarget.value = null;
    await refresh();
  } catch (error) {
    const { type, message } = extractApiError(error);
    (useNuxtApp() as any).$toast.error(
      type === 'user' && message
        ? message
        : (useNuxtApp() as any).$i18n.t('errors.leaves.deleteTypeFailed'),
    );
  } finally {
    archiveLoading.value = false;
  }
};

const handleRestore = async (leaveTypeId: string | number) => {
  try {
    await leavesStore.restoreLeaveType(leaveTypeId);
    (useNuxtApp() as any).$toast.success(
      (useNuxtApp() as any).$i18n.t('settings.leaveTypeRestored'),
    );
    await refresh();
  } catch (error) {
    const { type, message } = extractApiError(error);
    (useNuxtApp() as any).$toast.error(
      type === 'user' && message
        ? message
        : (useNuxtApp() as any).$i18n.t('errors.leaves.restoreTypeFailed'),
    );
  }
};

const closeModal = async () => {
  showModal.value = false;
  selectedLeaveTypeId.value = null;
  await refresh();
};

const bridgedLeaveTypeId = computed(() => selectedLeaveTypeId.value ?? undefined);
</script>
