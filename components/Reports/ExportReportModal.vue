<template>
  <SharedBaseModal v-model="isOpen">
    <div class="px-[30px] pb-[30px] pt-[10px]">
      <h3 class="text-[20px] font-bold text-black dark:text-white mb-[4px]">
        {{ $t('reports.export.title') }}
      </h3>
      <p class="text-[13px] text-gray-500 dark:text-neutral-400 mb-[20px]">
        {{ $t('reports.export.subtitle', { year }) }}
      </p>

      <div class="space-y-[16px]">
        <div>
          <label :class="labelClass">
            {{ $t('reports.export.employees') }}
            <span class="text-[#EA021A]">*</span>
          </label>
          <MiscCustomMultiSelect
            v-model="selectedUserIds"
            :options="userOptions"
            :placeholder="$t('reports.export.selectEmployees')"
          />
        </div>

        <div>
          <label :class="labelClass">
            {{ $t('reports.export.leaveTypes') }}
            <span class="text-[#EA021A]">*</span>
          </label>
          <MiscCustomMultiSelect
            v-model="selectedLeaveTypeIds"
            :options="leaveTypeOptions"
            :placeholder="$t('reports.export.selectLeaveTypes')"
          />
        </div>

        <div>
          <label :class="labelClass">
            {{ $t('reports.export.metrics') }}
            <span class="text-[#EA021A]">*</span>
          </label>
          <MiscCustomMultiSelect
            v-model="selectedMetrics"
            :options="metricOptions"
            :placeholder="$t('reports.export.selectMetrics')"
          />
          <p class="text-[12px] text-gray-500 dark:text-neutral-400 mt-[6px]">
            {{ $t('reports.export.metricsHint') }}
          </p>
        </div>
      </div>

      <div class="flex justify-end gap-[10px] mt-[24px]">
        <button
          type="button"
          class="inline-flex items-center justify-center py-[10px] px-[20px] rounded-[70px] border border-[#DFEAF2] dark:border-neutral-600 text-[14px] font-bold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-700 focus:outline-none"
          @click="isOpen = false"
        >
          {{ $t('common.cancel') }}
        </button>
        <button
          type="button"
          :disabled="!canGenerate || generating"
          :class="submitBtnClass"
          @click="generate"
        >
          <svg v-if="generating" class="animate-spin h-4 w-4 text-white mr-2" viewBox="0 0 24 24">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
              fill="none"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {{ generating ? $t('reports.export.generating') : $t('reports.export.generate') }}
        </button>
      </div>
    </div>
  </SharedBaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCentralStore } from '@/stores/centralStore';
import { useFormStyles } from '@/composables/useFormStyles';
import {
  getLeaveBalancesComposable,
  type LeaveBalancesResponse,
} from '@/composables/reportsApiComposable';

const { t } = useI18n();
const { $toast } = useNuxtApp() as any;
const { label: labelClass, submitBtn: submitBtnClass } = useFormStyles();

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  year: { type: Number as PropType<number>, required: true },
  initialUserIds: { type: Array as PropType<number[]>, default: () => [] },
  initialLeaveTypeIds: { type: Array as PropType<number[]>, default: () => [] },
});
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const centralStore = useCentralStore();
const userStore = centralStore.userStore;
const leavesStore = centralStore.leavesStore;

const selectedUserIds = ref<(number | string)[]>([]);
const selectedLeaveTypeIds = ref<(number | string)[]>([]);
const selectedMetrics = ref<(number | string)[]>(['remaining', 'taken']);
const generating = ref(false);

watch(isOpen, (open) => {
  if (!open) return;
  selectedUserIds.value = [...props.initialUserIds];
  selectedLeaveTypeIds.value = [...props.initialLeaveTypeIds];
  selectedMetrics.value = ['remaining', 'taken'];
});

const userOptions = computed(() =>
  (userStore.allUsers || []).map((u: any) => ({
    id: u.id,
    name: u.name || u.email,
    email: u.email,
  })),
);

const leaveTypeOptions = computed(() =>
  (leavesStore.leavesData?.leavesTypes || []).map((lt: any) => ({
    id: lt.id,
    name: lt.name,
  })),
);

const metricOptions = computed(() => [
  { id: 'remaining', name: t('reports.export.metricRemaining') },
  { id: 'taken', name: t('reports.export.metricTaken') },
]);

const canGenerate = computed(
  () =>
    selectedUserIds.value.length > 0 &&
    selectedLeaveTypeIds.value.length > 0 &&
    selectedMetrics.value.length > 0,
);

const metricLabel = (key: string) =>
  key === 'remaining' ? t('reports.export.metricRemaining') : t('reports.export.metricTaken');

const fmt = (n: number) => (Math.round(n * 100) / 100).toString();

const generate = async () => {
  if (!canGenerate.value) return;
  generating.value = true;
  try {
    const response: LeaveBalancesResponse = await getLeaveBalancesComposable(
      props.year,
      selectedUserIds.value,
      selectedLeaveTypeIds.value,
    );

    if (!response?.rows) {
      throw new Error('Malformed response from /api/reports/leave-balances');
    }

    // Pass the HTML string directly to html2pdf rather than a manually-created element.
    // When given a string, html2pdf creates its own container sized exactly to the PDF
    // usable area (page width minus margins), so `width:100%` on the table fills it
    // correctly and no dimension/offset mismatch occurs.
    const html2pdf = (await import('html2pdf.js')).default;
    await html2pdf()
      .set({
        margin: 10,
        filename: `leave-report-${props.year}-${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: 'png', quality: 1 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape', compress: true },
      })
      .from(renderTableHtml(response))
      .save();

    isOpen.value = false;
  } catch (err) {
    console.error('Report generation failed:', err);
    $toast.error(t('reports.export.generateFailed'));
  } finally {
    generating.value = false;
  }
};

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const renderTableHtml = (response: LeaveBalancesResponse): string => {
  const metrics = selectedMetrics.value.map(String);

  // Keep the selection order: users/types as chosen in the modal, not whatever the backend
  // returns. Fall back to the backend's lists for display names.
  const userMap = new Map(response.users.map((u) => [String(u.id), u]));
  const typeMap = new Map(response.leave_types.map((lt) => [String(lt.id), lt]));
  const rowMap = new Map<string, (typeof response.rows)[number]>();
  for (const r of response.rows) {
    rowMap.set(`${r.user_id}:${r.leave_type_id}`, r);
  }

  const userIds = selectedUserIds.value.map(String).filter((id) => userMap.has(id));
  const typeIds = selectedLeaveTypeIds.value.map(String).filter((id) => typeMap.has(id));

  const thStyle =
    'padding:8px 10px;border:1px solid #cbd5e1;background:#f1f5f9;text-align:left;font-size:12px;font-weight:700;vertical-align:bottom;';
  const thNumStyle = thStyle + 'text-align:right;';
  const typeCaptionStyle =
    'display:block;font-size:10px;font-weight:500;color:#64748b;margin-bottom:2px;';
  const tdStyle = 'padding:6px 10px;border:1px solid #e2e8f0;font-size:12px;vertical-align:top;';
  const tdNumStyle = tdStyle + 'text-align:right;font-variant-numeric:tabular-nums;';

  // Flat single-row header — html2canvas has a long-standing bug where rowspan cells collide
  // with colspan cells in the same row and collapse to zero width.
  const headerCells = typeIds
    .flatMap((tid) =>
      metrics.map(
        (m) =>
          `<th style="${thNumStyle}">
            <span style="${typeCaptionStyle}">${escapeHtml(typeMap.get(tid)!.name)}</span>
            ${escapeHtml(metricLabel(m))}
          </th>`,
      ),
    )
    .join('');

  const totalCols = 1 + typeIds.length * metrics.length;

  const bodyRows = userIds.length
    ? userIds
        .map((uid) => {
          const cells = typeIds
            .map((tid) => {
              const row = rowMap.get(`${uid}:${tid}`);
              const remaining = row ? Number(row.remaining) : 0;
              const taken = row ? Number(row.taken) : 0;
              return metrics
                .map((m) => {
                  const value = m === 'remaining' ? remaining : taken;
                  return `<td style="${tdNumStyle}">${fmt(value)}</td>`;
                })
                .join('');
            })
            .join('');
          return `<tr><td style="${tdStyle}font-weight:600;">${escapeHtml(
            userMap.get(uid)!.name,
          )}</td>${cells}</tr>`;
        })
        .join('')
    : `<tr><td colspan="${totalCols}" style="${tdStyle}text-align:center;color:#64748b;">${escapeHtml(
        t('reports.export.noData'),
      )}</td></tr>`;

  // Stacked (non-flex) header — html2canvas can drop flex children unpredictably.
  return `
    <div style="margin-bottom:16px;">
      <h1 style="margin:0 0 4px 0;font-size:20px;font-weight:700;">${escapeHtml(
        t('reports.export.title'),
      )}</h1>
      <div style="font-size:12px;color:#475569;">
        ${escapeHtml(t('reports.export.subtitle', { year: props.year }))}
        &nbsp;·&nbsp;
        ${escapeHtml(t('reports.export.generatedOn', { date: new Date().toLocaleDateString() }))}
      </div>
    </div>
    <table style="width:100%;border-collapse:collapse;table-layout:auto;">
      <thead>
        <tr>
          <th style="${thStyle}">${escapeHtml(t('reports.export.employee'))}</th>
          ${headerCells}
        </tr>
      </thead>
      <tbody>${bodyRows}</tbody>
    </table>
  `;
};
</script>
