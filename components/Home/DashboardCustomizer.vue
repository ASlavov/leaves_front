<template>
  <BaseModal
    :model-value="true"
    :title="$t('dashboard.customizeTitle')"
    max-width="max-w-lg"
    @update:model-value="cancel"
  >
    <div class="p-4 space-y-4">
      <div class="border-b border-gray-200 dark:border-neutral-700">
        <nav class="flex space-x-4" aria-label="Tabs">
          <button
            :class="[
              activeTab === 'sections'
                ? 'border-[#EA021A] text-[#EA021A]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
            ]"
            @click="activeTab = 'sections'"
          >
            {{ $t('dashboard.tabSections') }}
          </button>
          <button
            :class="[
              activeTab === 'leave_balance'
                ? 'border-[#EA021A] text-[#EA021A]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
            ]"
            @click="activeTab = 'leave_balance'"
          >
            {{ $t('dashboard.tabLeaveBalance') }}
          </button>
        </nav>
      </div>

      <!-- Sections Tab -->
      <div v-show="activeTab === 'sections'" class="space-y-2">
        <template v-for="(section, index) in localDraft.sectionOrder" :key="section">
          <div
            v-if="section !== 'pending_actions' || hasPendingActionsPerm"
            class="flex items-center justify-between p-3 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded shadow-sm"
            :class="{ 'opacity-50': isSectionHidden(section) }"
          >
            <div class="flex items-center gap-3">
              <button
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                @click="toggleSectionVisibility(section)"
              >
                <!-- Eye Icon Vis/Hidden -->
                <svg
                  v-if="!isSectionHidden(section)"
                  class="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943-9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                  />
                </svg>
              </button>
              <span class="font-medium text-sm dark:text-gray-200">
                {{ getSectionLabel(section) }}
              </span>
            </div>
            <div class="flex items-center gap-1">
              <button
                :disabled="index === 0"
                class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30"
                @click="moveSection(index, -1)"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </button>
              <button
                :disabled="index === localDraft.sectionOrder.length - 1"
                class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30"
                @click="moveSection(index, 1)"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </template>
      </div>

      <!-- Leave Balance Tab -->
      <div
        v-show="activeTab === 'leave_balance'"
        class="space-y-2 max-h-[50vh] overflow-y-auto pr-1"
      >
        <template v-if="allLeaveTypes.length > 0">
          <div
            v-for="(leave, index) in allLeaveTypes"
            :key="leave.leave_type_id"
            class="flex items-center justify-between p-3 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded shadow-sm"
            :class="{ 'opacity-50': isLeaveHidden(leave.leave_type_id) }"
          >
            <div class="flex items-center gap-3">
              <button
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                @click="toggleLeaveVisibility(leave.leave_type_id)"
              >
                <!-- Eye Icon Vis/Hidden -->
                <svg
                  v-if="!isLeaveHidden(leave.leave_type_id)"
                  class="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943-9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                  />
                </svg>
              </button>
              <span class="font-medium text-sm dark:text-gray-200">
                {{ leave.leave_type_name }}
              </span>
            </div>
            <div class="flex items-center gap-1">
              <button
                :disabled="index === 0"
                class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30"
                @click="moveLeave(index, -1)"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </button>
              <button
                :disabled="index === allLeaveTypes.length - 1"
                class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30"
                @click="moveLeave(index, 1)"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="text-sm text-gray-500 py-4 text-center">
            {{ $t('dashboard.noLeaveTypes') }}
          </div>
        </template>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="p-4 border-t border-gray-200 dark:border-neutral-700 mt-2">
      <div class="flex flex-col sm:flex-row gap-3 justify-end w-full">
        <button
          class="sm:mr-auto justify-center inline-flex px-4 py-2 border border-gray-300 dark:border-neutral-600 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none dark:bg-neutral-800 dark:text-gray-200 dark:hover:bg-neutral-700"
          @click="resetDefaults"
        >
          {{ $t('dashboard.resetDefaults') }}
        </button>
        <button
          class="justify-center inline-flex px-4 py-2 border border-gray-300 dark:border-neutral-600 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none dark:bg-neutral-800 dark:text-gray-200 dark:hover:bg-neutral-700"
          @click="cancel"
        >
          {{ $t('common.cancel') }}
        </button>
        <button
          class="justify-center inline-flex px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#EA021A] hover:bg-[#EA021A]/80 focus:outline-none"
          @click="save"
        >
          {{ $t('common.save') }}
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseModal from '~/components/shared/BaseModal.vue';
import { useCentralStore } from '~/stores/centralStore';
import { DEFAULT_DASHBOARD_PREFERENCES } from '~/types';
import type { DashboardPreferences, DashboardSection } from '~/types';

const emit = defineEmits(['close']);
const { t } = useI18n();
const centralStore = useCentralStore();
const dashboardStore = centralStore.dashboardPreferencesStore;
const permissionsStore = centralStore.permissionsStore;
const leavesStore = centralStore.leavesStore;

const activeTab = ref<'sections' | 'leave_balance'>('sections');

const hasPendingActionsPerm = computed(() =>
  permissionsStore.can('profile_leave_balance', 'accept_leave'),
);

// Create local draft clone
const localDraft = ref<DashboardPreferences>(
  JSON.parse(JSON.stringify(dashboardStore.preferences)),
);

// Extract distinct leave types from current wallet balances
const availableLeaves = computed(() => {
  if (!leavesStore.leavesData?.leavesAvailableDays) return [];
  const map = new Map();
  leavesStore.leavesData.leavesAvailableDays.forEach((l: any) => {
    map.set(l.leave_type_id, {
      leave_type_id: l.leave_type_id,
      leave_type_name: l.leave_type_name,
    });
  });
  return Array.from(map.values());
});

// Re-generate ordered array of all leave types applying the saved pins
const allLeaveTypes = computed(() => {
  const types = [...availableLeaves.value];
  types.sort((a, b) => {
    const idxA = localDraft.value.leaveTypeOrder.indexOf(a.leave_type_id);
    const idxB = localDraft.value.leaveTypeOrder.indexOf(b.leave_type_id);

    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.leave_type_id - b.leave_type_id;
  });
  return types;
});

// Broadcast changes to trigger live preview
watch(
  localDraft,
  (newDraft) => {
    dashboardStore.startPreview(newDraft);
  },
  { deep: true },
);

onBeforeUnmount(() => {
  dashboardStore.cancelPreview();
});

const getSectionLabel = (section: DashboardSection) => {
  if (section === 'leave_balance') return t('dashboard.sectionLeaveBalance');
  if (section === 'profile_info') return t('dashboard.sectionProfileInfo');
  if (section === 'pending_actions') return t('dashboard.sectionPendingActions');
  return section;
};

const isSectionHidden = (section: DashboardSection) =>
  localDraft.value.hiddenSections.includes(section);

const toggleSectionVisibility = (section: DashboardSection) => {
  if (isSectionHidden(section)) {
    localDraft.value.hiddenSections = localDraft.value.hiddenSections.filter((s) => s !== section);
  } else {
    localDraft.value.hiddenSections.push(section);
  }
};

const moveSection = (index: number, dir: -1 | 1) => {
  const target = index + dir;
  if (target < 0 || target >= localDraft.value.sectionOrder.length) return;
  const temp = localDraft.value.sectionOrder[index];
  localDraft.value.sectionOrder[index] = localDraft.value.sectionOrder[target];
  localDraft.value.sectionOrder[target] = temp;
};

const isLeaveHidden = (id: number) => localDraft.value.hiddenLeaveTypes.includes(id);

const toggleLeaveVisibility = (id: number) => {
  if (isLeaveHidden(id)) {
    localDraft.value.hiddenLeaveTypes = localDraft.value.hiddenLeaveTypes.filter((i) => i !== id);
  } else {
    localDraft.value.hiddenLeaveTypes.push(id);
  }
};

const moveLeave = (index: number, dir: -1 | 1) => {
  const types = [...allLeaveTypes.value];
  const target = index + dir;
  if (target < 0 || target >= types.length) return;

  const temp = types[index];
  types[index] = types[target];
  types[target] = temp;

  localDraft.value.leaveTypeOrder = types.map((t) => t.leave_type_id);
};

const resetDefaults = () => {
  localDraft.value = JSON.parse(JSON.stringify(DEFAULT_DASHBOARD_PREFERENCES));
};

const cancel = () => {
  dashboardStore.cancelPreview();
  emit('close');
};

const save = async () => {
  try {
    await dashboardStore.savePreferences(localDraft.value);
    (useNuxtApp() as any).$toast?.success(t('dashboard.saveSuccess'));
    emit('close');
  } catch (e) {
    // handled by store
  }
};
</script>
