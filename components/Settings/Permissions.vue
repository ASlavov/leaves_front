<template>
  <div class="user-list-container p-4">
    <div class="flex flex-col sm:flex-row justify-between items-center mb-6">
      <h2 class="text-2xl font-bold dark:text-gray-100">{{ $t('settings.permissions') }}</h2>
      <button
        v-if="isAdminView"
        class="mt-4 sm:mt-0 bg-[#EA021A] text-white px-4 py-2 rounded font-medium hover:bg-red-700 transition disabled:opacity-50"
        :disabled="isSaving || !hasUnsavedChanges"
        @click="saveChanges"
      >
        <span v-if="isSaving">{{ $t('common.saveChanges') }}...</span>
        <span v-else>{{ $t('common.saveChanges') }}</span>
      </button>
    </div>

    <!-- Desktop Table (md+) -->
    <div class="hidden md:block overflow-x-auto rounded-lg shadow border dark:border-neutral-700">
      <div class="bg-white min-w-[480px] dark:bg-neutral-800">
        <div class="grid grid-cols-5 bg-gray-100 p-4 font-bold text-sm uppercase dark:bg-neutral-900 border-b dark:border-neutral-700 text-center">
          <div class="col-span-1 text-left">{{ $t('settings.permissions') }}</div>
          <div v-for="role in roles" :key="role.key" class="col-span-1">{{ role.name }}</div>
        </div>

        <div class="divide-y divide-gray-200 dark:divide-neutral-700">
          <div v-for="(category, categoryKey) in permissionCategories" :key="categoryKey" class="contents">
            <div class="bg-gray-50 px-4 py-2 font-bold text-xs uppercase text-gray-500 dark:bg-neutral-800/50 dark:text-neutral-400 border-b dark:border-neutral-700">
              {{ category.label }}
            </div>

            <div v-for="(action, actionKey) in category.actions" :key="actionKey" class="grid grid-cols-5 p-4 items-center hover:bg-gray-50 transition-colors dark:hover:bg-neutral-700">
              <div class="col-span-1 font-medium text-sm dark:text-gray-200">
                {{ action.label }}
              </div>
              <div v-for="role in roles" :key="role.key" class="col-span-1 flex justify-center">
                <input
                  v-if="isAdminView"
                  type="checkbox"
                  class="h-5 w-5 rounded text-[#EA021A] focus:ring-[#EA021A] disabled:opacity-50"
                  :disabled="isInputDisabled(role.key, actionKey)"
                  :checked="hasPermission(role.key, String(categoryKey), String(actionKey))"
                  @change="togglePermission(role.key, String(categoryKey), String(actionKey), ($event.target as HTMLInputElement).checked)"
                />
                <!-- View mode -->
                <div v-else class="w-6 h-6 rounded-full flex items-center justify-center transition-colors shadow-inner"
                  :class="hasPermission(role.key, String(categoryKey), String(actionKey)) ? 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400' : 'bg-red-50 text-red-300 dark:bg-red-900/20 dark:text-red-800'"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="hasPermission(role.key, String(categoryKey), String(actionKey)) ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Slider (<md) same logic via checkboxes -->
    <div ref="sliderRef" class="md:hidden relative overflow-hidden pb-2">
      <div class="flex will-change-transform" :class="{ 'transition-transform duration-300 ease-out': !isDragging }" :style="{ transform: `translateX(calc(10% - ${currentSlide * 80}% + ${dragOffset}px))` }" @touchstart.passive="onTouchStart" @touchmove.passive="onTouchMove" @touchend="onTouchEnd">
        <div v-for="(role, idx) in roles" :key="role.key" class="w-[80%] flex-shrink-0 relative" :class="{ 'pointer-events-none select-none': idx !== currentSlide }">
          <div v-if="idx !== currentSlide" class="absolute inset-0 bg-white/55 dark:bg-neutral-900/55 z-10 rounded-lg pointer-events-none transition-opacity duration-300" />
          <div class="mx-2 bg-white dark:bg-neutral-800 rounded-lg shadow-md border border-gray-200 dark:border-neutral-700 overflow-hidden">
            <div class="bg-gray-100 dark:bg-neutral-900 px-4 py-3 text-center font-bold text-sm uppercase tracking-wide text-gray-700 dark:text-neutral-300 border-b border-gray-200 dark:border-neutral-700">
              {{ role.name }}
            </div>
            <div v-for="(category, categoryKey) in permissionCategories" :key="categoryKey" class="border-t border-gray-200 dark:border-neutral-700 first:border-t-0">
              <div class="bg-gray-50 dark:bg-neutral-800/60 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500">
                {{ category.label }}
              </div>
              <div v-for="(action, actionKey) in category.actions" :key="actionKey" class="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-neutral-700/50 first:border-t-0">
                <span class="text-sm text-gray-700 dark:text-gray-200">{{ action.label }}</span>
                <input
                  v-if="isAdminView"
                  type="checkbox"
                  class="h-5 w-5 rounded text-[#EA021A] focus:ring-[#EA021A] disabled:opacity-50"
                  :disabled="isInputDisabled(role.key, actionKey)"
                  :checked="hasPermission(role.key, String(categoryKey), String(actionKey))"
                  @change="togglePermission(role.key, String(categoryKey), String(actionKey), ($event.target as HTMLInputElement).checked)"
                />
                <div v-else class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-inner transition-colors"
                  :class="hasPermission(role.key, String(categoryKey), String(actionKey)) ? 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400' : 'bg-red-50 text-red-300 dark:bg-red-900/20 dark:text-red-800'"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="hasPermission(role.key, String(categoryKey), String(actionKey)) ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCentralStore } from '@/stores/centralStore';
import type { FullPermissionMatrix } from '@/types/permissions';

const { t } = useI18n();
const centralStore = useCentralStore();
const permissionsStore = centralStore.permissionsStore;
const { $toast } = useNuxtApp() as unknown as { $toast: any };

const roles = computed(() => permissionsStore.allRoles);
const isAdminView = computed(() => permissionsStore.isAdmin());

const localMatrix = ref<FullPermissionMatrix>({});
const isSaving = ref(false);
const hasUnsavedChanges = ref(false);

onMounted(async () => {
  if (isAdminView.value) {
    await permissionsStore.fetchFullMatrix();
    localMatrix.value = JSON.parse(JSON.stringify(permissionsStore.fullMatrix));
  } else {
    // If NOT admin, the UI just shows checkmarks based on standard can() or requires fullMatrix to show others.
    // Actually, only fullMatrix contains other roles. Non-admins cannot see fullMatrix via API. 
    // They will only see their own matrix. So non-admins shouldn't access this page optimally, or the table will show empty for other roles.
    // The requirement says "admin players editable". The BFF route GET /api/permissions is admin-only.
  }
});

const isInputDisabled = (roleKey: string, actionKey: string | number) => {
  // (a) Admin column is entirely read-only
  if (roleKey === 'admin') return true;
  return false;
};

const hasPermission = (roleKey: string, category: string, action: string) => {
  if (!isAdminView.value) return permissionsStore.can(category, action);
  const allowedRoles = localMatrix.value?.[category]?.[action];
  if (!allowedRoles) return false;
  return allowedRoles.includes(roleKey);
};

const togglePermission = (roleKey: string, category: string, action: string, checked: boolean) => {
  hasUnsavedChanges.value = true;
  
  if (!localMatrix.value[category]) {
    localMatrix.value[category] = {};
  }
  if (!localMatrix.value[category][action]) {
    localMatrix.value[category][action] = [];
  }

  const allowedRoles = localMatrix.value[category][action];

  if (checked) {
    if (!allowedRoles.includes(roleKey)) allowedRoles.push(roleKey);
    // (c) if 'modify' enabled, 'view' must also be enabled. (Actually modify is locked, but theoretically)
    // if action is modifying something and view exists, enable view.
    if (action === 'modify' && localMatrix.value[category]['view']) {
       if (!localMatrix.value[category]['view'].includes(roleKey)) {
         localMatrix.value[category]['view'].push(roleKey);
       }
    }
  } else {
    const idx = allowedRoles.indexOf(roleKey);
    if (idx > -1) allowedRoles.splice(idx, 1);
    
    // (c) disabling 'view' while 'modify' is on should auto-disable 'modify'
    if (action === 'view' && localMatrix.value[category]['modify']) {
        const modIdx = localMatrix.value[category]['modify'].indexOf(roleKey);
        if (modIdx > -1) localMatrix.value[category]['modify'].splice(modIdx, 1);
    }
  }
};

const saveChanges = async () => {
  isSaving.value = true;
  try {
    await permissionsStore.updateMatrix(localMatrix.value);
    $toast.success(t('settings.permissionsSaved', 'Permissions saved successfully!'));
    hasUnsavedChanges.value = false;
  } catch (error) {
    $toast.error(t('settings.permissionsSaveError', 'Failed to save permissions.'));
  } finally {
    isSaving.value = false;
  }
};

// ── Slider ────────────────────────────────────────────────────────────────────
const sliderRef = ref<HTMLElement | null>(null);
const currentSlide = ref(0);
const dragOffset = ref(0);
const isDragging = ref(false);
let touchStartX = 0;

const onTouchStart = (e: TouchEvent) => {
  touchStartX = e.touches[0].clientX;
  isDragging.value = true;
};
const onTouchMove = (e: TouchEvent) => {
  dragOffset.value = e.touches[0].clientX - touchStartX;
};
const onTouchEnd = () => {
  isDragging.value = false;
  const containerWidth = sliderRef.value?.offsetWidth ?? 320;
  const threshold = containerWidth * 0.2;
  if (dragOffset.value < -threshold && currentSlide.value < roles.value.length - 1) currentSlide.value++;
  else if (dragOffset.value > threshold && currentSlide.value > 0) currentSlide.value--;
  dragOffset.value = 0;
};
// ─────────────────────────────────────────────────────────────────────────────

interface PermissionAction { label: string; }
interface PermissionCategory { label: string; actions: Record<string, PermissionAction>; }

const permissionCategories = computed<Record<string, PermissionCategory>>(() => ({
  profile_leave_balance: {
    label: t('settings.permissionsLeaves'),
    actions: {
      view: { label: t('common.view') },
      request_leave: { label: t('leaves.requestLeave') },
      cancel_leave: { label: t('leaves.cancelLeave') },
      accept_leave: { label: t('leaves.approveLeave') },
      decline_leave: { label: t('leaves.rejectLeave') },
      record_admin_leave: { label: t('permissions.recordAdminLeave') },
    },
  },
  profile_info: {
    label: t('settings.userProfile'),
    actions: {
      view: { label: t('common.view') },
      modify: { label: t('common.modify') },
      change_password: { label: t('settings.changePassword') },
    },
  },
  all_users: {
    label: t('settings.allUsers'),
    actions: { view: { label: t('common.view') }, modify: { label: t('common.modify') } },
  },
  entitlement: {
    label: t('settings.entitledDays'),
    actions: { view: { label: t('common.view') }, modify: { label: t('common.modify') } },
  },
  group: {
    label: t('settings.departments'),
    actions: { view: { label: t('common.view') }, modify: { label: t('common.modify') } },
  },
  leave_types: {
    label: t('settings.leaveTypes'),
    actions: { view: { label: t('common.view') }, modify: { label: t('common.modify') } },
  },
  work_week: {
    label: t('settings.workWeek'),
    actions: { view: { label: t('common.view') }, modify: { label: t('common.modify') } },
  },
  public_holidays: {
    label: t('settings.publicHolidays'),
    actions: { view: { label: t('common.view') }, modify: { label: t('common.modify') } },
  },
  invitations: {
    label: t('settings.invitations'),
    actions: { view: { label: t('common.view') }, modify: { label: t('common.modify') } },
  },
  org_chart: {
    label: t('permissions.orgChart.label'),
    actions: { view: { label: t('permissions.orgChart.view') }, modify: { label: t('permissions.orgChart.modify') } },
  },
  company_documents: {
    label: t('permissions.companyDocuments.label'),
    actions: { view: { label: t('permissions.companyDocuments.view') }, modify: { label: t('permissions.companyDocuments.modify') } },
  },
  reports: {
    label: t('permissions.reports.label'),
    actions: { view: { label: t('permissions.reports.view') }, export: { label: t('permissions.reports.export') } },
  },
}));
</script>
