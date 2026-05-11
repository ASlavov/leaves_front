<template>
  <div
    v-if="
      permissionsStore.can('profile_leave_balance', 'request_leave') ||
      permissionsStore.can('profile_leave_balance', 'cancel_leave')
    "
    class="container"
  >
    <div class="flex items-center justify-between flex-wrap gap-x-6 gap-y-3 py-6">
      <h3 class="font-black text-2xl text-gray-900 dark:text-white tracking-tight">
        {{ $t('leaves.balance') }}
      </h3>
      <div class="flex items-center gap-3 flex-wrap">
        <HomeMonthCarousel v-model="selectedMonthDate" />
        <NewLeave />
        <CancelLeave />
      </div>
    </div>

    <template v-if="loading && !leavesDataLoaded">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="i in 4"
          :key="i"
          class="h-[140px] border border-gray-100 dark:border-neutral-700 rounded-2xl animate-pulse bg-gray-50/50 dark:bg-neutral-800/50"
        ></div>
      </div>
    </template>
    <template v-else>
      <div
        v-if="leavesData.length !== 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Metrics
          v-for="(leave, index) in leavesData"
          :key="index"
          :leave="leave"
          :loading="leavesStore.loading"
        />
      </div>
      <div v-else class="text-center py-4 text-gray-600 dark:text-gray-100">
        {{ $t('leaves.noAvailableLeaves') }}
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import Metrics from '~/components/Home/Metrics.vue';
import NewLeave from '~/components/Home/NewLeave.vue';
import CancelLeave from '~/components/Home/CancelLeave.vue';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCentralStore } from '@/stores/centralStore';

const { locale } = useI18n();
const centralStore = useCentralStore();
const leavesStore = centralStore.leavesStore;
const permissionsStore = centralStore.permissionsStore;

const loading = computed(() => centralStore.loading && !centralStore.initialized);
const leavesDataLoaded = computed(() => leavesStore.isDataLoaded);

// ── Month carousel state ──────────────────────────────────────────────────────

const now = new Date();
const selectedMonthDate = ref({ month: now.getMonth() + 1, year: now.getFullYear() });

const selectedMonthLabel = computed(() => {
  const { month, year } = selectedMonthDate.value;
  const loc = locale.value === 'el' ? 'el-GR' : 'en-US';
  const opts: Intl.DateTimeFormatOptions = { month: 'long' };
  if (year !== now.getFullYear()) opts.year = 'numeric';
  return new Intl.DateTimeFormat(loc, opts).format(new Date(year, month - 1, 1));
});

// ── Per-month booking calculation ─────────────────────────────────────────────

function calendarDaysInMonth(
  startStr: string,
  endStr: string,
  month: number,
  year: number,
): number {
  // Parse as local dates to avoid UTC offset shift on YYYY-MM-DD strings
  const parse = (s: string) => {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
  };
  const start = parse(startStr);
  const end = parse(endStr);
  const mStart = new Date(year, month - 1, 1);
  const mEnd = new Date(year, month, 0); // last calendar day of month
  const cStart = start > mStart ? start : mStart;
  const cEnd = end < mEnd ? end : mEnd;
  if (cStart > cEnd) return 0;
  return Math.round((cEnd.getTime() - cStart.getTime()) / 86_400_000) + 1;
}

const userLeaves = computed(() =>
  Array.isArray(leavesStore.leavesData?.currentUser)
    ? (leavesStore.leavesData.currentUser as any[]).filter(
        (l) => l.status === 'approved' || l.status === 'pending',
      )
    : [],
);

// Map of leave_type_id → calendar days booked in the selected month
const bookedByTypeInMonth = computed(() => {
  const { month, year } = selectedMonthDate.value;
  const map: Record<string, number> = {};
  for (const leave of userLeaves.value) {
    const key = String(leave.leave_type_id);
    map[key] = (map[key] ?? 0) + calendarDaysInMonth(leave.start_date, leave.end_date, month, year);
  }
  return map;
});

// ── Grouped leave data (annual) enriched with month context ──────────────────

const groupedLeavesData = computed(() => {
  if (!leavesStore.leavesData?.leavesAvailableDays) return [];

  const groupedData = leavesStore.leavesData.leavesAvailableDays.reduce(
    (acc: Record<string, any>, leave: any) => {
      const typeId = leave.leave_type_id;
      if (!acc[typeId]) {
        acc[typeId] = {
          leave_type_id: typeId,
          leave_type_name: leave.leave_type_name,
          entitled_days: 0,
          remaining_days: 0,
        };
      }
      acc[typeId].entitled_days = Number(
        (acc[typeId].entitled_days + leave.entitled_days).toFixed(2),
      );
      acc[typeId].remaining_days = Number(
        (acc[typeId].remaining_days + leave.remaining_days).toFixed(2),
      );
      return acc;
    },
    {},
  );

  const allTypes = Object.values(groupedData) as any[];
  const visible = centralStore.dashboardPreferencesStore.visibleLeaveTypes(allTypes);

  return visible.map((entry: any) => {
    const typeId = String(entry.leave_type_id);
    const leaveType = (leavesStore.leavesData.leavesTypes as any[]).find(
      (lt) => String(lt.id) === typeId,
    );
    return {
      ...entry,
      accrual_type: leaveType?.accrual_type ?? 'upfront',
      monthly_allowance: Number((entry.entitled_days / 12).toFixed(2)),
      booked_in_month: bookedByTypeInMonth.value[typeId] ?? 0,
      month_label: selectedMonthLabel.value,
    };
  });
});

const leavesData = groupedLeavesData;
</script>
