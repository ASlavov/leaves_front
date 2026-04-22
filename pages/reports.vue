<template>
  <SidebarTopbarSidebar />
  <div class="w-full lg:ps-64 bg-red min-h-dvh-64 dark:bg-neutral-900">
    <div class="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <!-- Toolbar -->
      <div class="flex flex-wrap items-end gap-[12px]">
        <div class="w-[160px]">
          <label :class="labelClass">{{ $t('reports.year') }}</label>
          <MiscCustomSelect
            v-model="yearStr"
            :options="yearOptions"
            :placeholder="$t('reports.year')"
            select-id="reports-year"
          />
        </div>
        <div class="min-w-[240px] flex-1">
          <label :class="labelClass">{{ $t('reports.departments') }}</label>
          <MiscCustomMultiSelect
            v-model="selectedDeptIds"
            :options="deptOptions"
            :placeholder="$t('reports.allDepartments')"
          />
        </div>
        <div class="min-w-[240px] flex-1">
          <label :class="labelClass">{{ $t('reports.leaveTypes') }}</label>
          <MiscCustomMultiSelect
            v-model="selectedTypeIds"
            :options="typeOptions"
            :placeholder="$t('reports.allLeaveTypes')"
          />
        </div>
        <button
          type="button"
          class="h-[40px] px-[16px] rounded-[8px] border border-[#DFEAF2] dark:border-neutral-600 text-[14px] font-bold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-700 focus:outline-none"
          @click="customizeOpen = true"
        >
          {{ $t('reports.customize') }}
        </button>
        <button
          v-if="permissionsStore.can('reports', 'export')"
          type="button"
          class="h-[40px] px-[16px] rounded-[8px] bg-[#EA021A] text-white text-[14px] font-bold hover:bg-[#EA021A]/90 focus:outline-none"
          @click="exportModalOpen = true"
        >
          {{ $t('reports.exportPdf') }}
        </button>
      </div>

      <!-- Widget grid -->
      <div class="grid grid-cols-12 gap-[12px]">
        <div
          v-for="w in visibleWidgets"
          :key="w.key"
          :class="['col-span-12', w.span || 'lg:col-span-6']"
        >
          <component
            :is="w.component"
            :summary="reportsStore.summary"
            :loading="reportsStore.loading"
          />
        </div>
      </div>
    </div>

    <ExportReportModal
      v-model="exportModalOpen"
      :year="Number(yearStr)"
      :initial-leave-type-ids="selectedTypeIds"
    />

    <!-- Customize modal -->
    <SharedBaseModal v-model="customizeOpen">
      <div class="px-[30px] pb-[30px] pt-[10px]">
        <h3 class="text-[20px] font-bold text-black dark:text-white mb-[16px]">
          {{ $t('reports.customize') }}
        </h3>
        <MiscCustomMultiSelect
          v-model="enabledWidgetKeys"
          :options="widgetOptions"
          :placeholder="$t('reports.selectWidgets')"
        />
        <div class="flex justify-end gap-[10px] mt-[20px]">
          <button type="button" :class="submitBtnClass" @click="saveCustomization">
            {{ $t('common.saveChanges') }}
          </button>
        </div>
      </div>
    </SharedBaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, markRaw } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCentralStore } from '@/stores/centralStore';
import { useFormStyles } from '@/composables/useFormStyles';
import { useReportsStore } from '@/stores/reports';
import LeavesByMonth from '@/components/Reports/LeavesByMonth.vue';
import LeavesByDepartment from '@/components/Reports/LeavesByDepartment.vue';
import LeaveTypeShare from '@/components/Reports/LeaveTypeShare.vue';
import TopUsers from '@/components/Reports/TopUsers.vue';
import PendingQueue from '@/components/Reports/PendingQueue.vue';
import Headcount from '@/components/Reports/Headcount.vue';
import ExportReportModal from '@/components/Reports/ExportReportModal.vue';

definePageMeta({ middleware: ['auth'] as any }); // if an auth middleware exists

const { t } = useI18n();
const { label: labelClass, submitBtn: submitBtnClass } = useFormStyles();
const centralStore = useCentralStore();
const { permissionsStore, departmentsStore, leavesStore } = centralStore;
const reportsStore = useReportsStore();

const now = new Date();
const yearStr = ref(String(now.getFullYear()));
const selectedDeptIds = ref<number[]>([]);
const selectedTypeIds = ref<number[]>([]);
const customizeOpen = ref(false);
const exportModalOpen = ref(false);

const yearOptions = computed(() =>
  Array.from({ length: 6 }, (_, i) => now.getFullYear() - 3 + i).map((y) => ({
    id: String(y),
    name: String(y),
  })),
);
const deptOptions = computed(() =>
  (departmentsStore.departmentsData || []).map((d: any) => ({ id: d.id, name: d.name })),
);
const typeOptions = computed(() =>
  (leavesStore.leavesData?.leavesTypes || []).map((lt: any) => ({ id: lt.id, name: lt.name })),
);

const widgetDefs = [
  { key: 'leavesByMonth', component: markRaw(LeavesByMonth), span: 'lg:col-span-8' },
  { key: 'pendingQueue', component: markRaw(PendingQueue), span: 'lg:col-span-4' },
  { key: 'leavesByDepartment', component: markRaw(LeavesByDepartment), span: 'lg:col-span-6' },
  { key: 'leaveTypeShare', component: markRaw(LeaveTypeShare), span: 'lg:col-span-6' },
  { key: 'topUsers', component: markRaw(TopUsers), span: 'lg:col-span-8' },
  { key: 'headcount', component: markRaw(Headcount), span: 'lg:col-span-4' },
];

const LS_KEY = 'reports.visibleWidgets';
const enabledWidgetKeys = ref<(string | number)[]>(widgetDefs.map((w) => w.key));

onMounted(() => {
  const saved = localStorage.getItem(LS_KEY);
  if (saved) {
    try {
      enabledWidgetKeys.value = JSON.parse(saved);
    } catch (_e) {
      /* ignore invalid JSON in localStorage */
    }
  }
});

const widgetOptions = computed(() =>
  widgetDefs.map((w) => ({ id: w.key, name: t(`reports.widgets.${w.key}`) })),
);
const visibleWidgets = computed(() =>
  widgetDefs.filter((w) => enabledWidgetKeys.value.includes(w.key)),
);
const saveCustomization = () => {
  localStorage.setItem(LS_KEY, JSON.stringify(enabledWidgetKeys.value));
  customizeOpen.value = false;
};

const fetchData = () => {
  reportsStore.fetchSummary(
    Number(yearStr.value),
    selectedDeptIds.value.map(Number),
    selectedTypeIds.value.map(Number),
  );
};

watch([yearStr, selectedDeptIds, selectedTypeIds], fetchData, { immediate: true });
</script>

<style>
.min-h-dvh-64 {
  min-height: calc(100dvh - 66px);
}
</style>
