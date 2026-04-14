<template>
  <div class="user-list-container p-4">
    <div class="flex flex-col sm:flex-row justify-between items-center mb-6">
      <h2 class="text-2xl font-bold dark:text-gray-100">{{ $t('settings.permissions') }}</h2>
    </div>

    <!-- Desktop Table (md+) -->
    <div class="hidden md:block overflow-x-auto rounded-lg shadow border dark:border-neutral-700">
      <div class="bg-white min-w-[480px] dark:bg-neutral-800">
        <div
          class="grid grid-cols-5 bg-gray-100 p-4 font-bold text-sm uppercase dark:bg-neutral-900 border-b dark:border-neutral-700 text-center"
        >
          <div class="col-span-1 text-left">{{ $t('settings.permissions') }}</div>
          <div v-for="role in roles" :key="role.key" class="col-span-1">{{ role.name }}</div>
        </div>

        <div class="divide-y divide-gray-200 dark:divide-neutral-700">
          <div
            v-for="(category, categoryKey) in permissionCategories"
            :key="categoryKey"
            class="contents"
          >
            <div
              class="bg-gray-50 px-4 py-2 font-bold text-xs uppercase text-gray-500 dark:bg-neutral-800/50 dark:text-neutral-400 border-b dark:border-neutral-700"
            >
              {{ category.label }}
            </div>

            <div
              v-for="(action, actionKey) in category.actions"
              :key="actionKey"
              class="grid grid-cols-5 p-4 items-center hover:bg-gray-50 transition-colors dark:hover:bg-neutral-700"
            >
              <div class="col-span-1 font-medium text-sm dark:text-gray-200">
                {{ action.label }}
              </div>
              <div v-for="role in roles" :key="role.key" class="col-span-1 flex justify-center">
                <div
                  class="w-6 h-6 rounded-full flex items-center justify-center transition-colors shadow-inner"
                  :class="
                    hasPermission(role.key, categoryKey, actionKey)
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400'
                      : 'bg-red-50 text-red-300 dark:bg-red-900/20 dark:text-red-800'
                  "
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      :d="
                        hasPermission(role.key, categoryKey, actionKey)
                          ? 'M5 13l4 4L19 7'
                          : 'M6 18L18 6M6 6l12 12'
                      "
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Slider (<md): one card per role, swipe to navigate -->
    <div ref="sliderRef" class="md:hidden relative overflow-hidden pb-2">
      <div
        class="flex will-change-transform"
        :class="{ 'transition-transform duration-300 ease-out': !isDragging }"
        :style="{ transform: `translateX(calc(10% - ${currentSlide * 80}% + ${dragOffset}px))` }"
        @touchstart.passive="onTouchStart"
        @touchmove.passive="onTouchMove"
        @touchend="onTouchEnd"
      >
        <div
          v-for="(role, idx) in roles"
          :key="role.key"
          class="w-[80%] flex-shrink-0 relative"
          :class="{ 'pointer-events-none select-none': idx !== currentSlide }"
        >
          <!-- Frosted-glass dim overlay for non-active slides -->
          <div
            v-if="idx !== currentSlide"
            class="absolute inset-0 bg-white/55 dark:bg-neutral-900/55 z-10 rounded-lg pointer-events-none transition-opacity duration-300"
          />

          <!-- Role card -->
          <div
            class="mx-2 bg-white dark:bg-neutral-800 rounded-lg shadow-md border border-gray-200 dark:border-neutral-700 overflow-hidden"
          >
            <!-- Role name header -->
            <div
              class="bg-gray-100 dark:bg-neutral-900 px-4 py-3 text-center font-bold text-sm uppercase tracking-wide text-gray-700 dark:text-neutral-300 border-b border-gray-200 dark:border-neutral-700"
            >
              {{ role.name }}
            </div>

            <!-- Permission categories -->
            <div
              v-for="(category, categoryKey) in permissionCategories"
              :key="categoryKey"
              class="border-t border-gray-200 dark:border-neutral-700 first:border-t-0"
            >
              <div
                class="bg-gray-50 dark:bg-neutral-800/60 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500"
              >
                {{ category.label }}
              </div>
              <div
                v-for="(action, actionKey) in category.actions"
                :key="actionKey"
                class="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-neutral-700/50 first:border-t-0"
              >
                <span class="text-sm text-gray-700 dark:text-gray-200">{{ action.label }}</span>
                <div
                  class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-inner transition-colors"
                  :class="
                    hasPermission(role.key, categoryKey, actionKey)
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400'
                      : 'bg-red-50 text-red-300 dark:bg-red-900/20 dark:text-red-800'
                  "
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      :d="
                        hasPermission(role.key, categoryKey, actionKey)
                          ? 'M5 13l4 4L19 7'
                          : 'M6 18L18 6M6 6l12 12'
                      "
                    />
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
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCentralStore } from '@/stores/centralStore';

const { t } = useI18n();
const centralStore = useCentralStore();
const permissionsStore = centralStore.permissionsStore;

const roles = computed(() => permissionsStore.allRoles);

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

  if (dragOffset.value < -threshold && currentSlide.value < roles.value.length - 1) {
    currentSlide.value++;
  } else if (dragOffset.value > threshold && currentSlide.value > 0) {
    currentSlide.value--;
  }

  dragOffset.value = 0;
};
// ─────────────────────────────────────────────────────────────────────────────

interface PermissionAction {
  label: string;
}

interface PermissionCategory {
  label: string;
  actions: Record<string, PermissionAction>;
}

const permissionCategories = computed<Record<string, PermissionCategory>>(() => ({
  profile_leave_balance: {
    label: t('settings.permissionsLeaves'),
    actions: {
      view: { label: t('common.view') },
      request_leave: { label: t('leaves.requestLeave') },
      cancel_leave: { label: t('leaves.cancelLeave') },
      accept_leave: { label: t('leaves.approveLeave') },
      decline_leave: { label: t('leaves.rejectLeave') },
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
    actions: {
      view: { label: t('common.view') },
      modify: { label: t('common.modify') },
    },
  },
  entitlement: {
    label: t('settings.entitledDays'),
    actions: {
      view: { label: t('common.view') },
      modify: { label: t('common.modify') },
    },
  },
  group: {
    label: t('settings.departments'),
    actions: {
      view: { label: t('common.view') },
      modify: { label: t('common.modify') },
    },
  },
  leave_types: {
    label: t('settings.leaveTypes'),
    actions: {
      view: { label: t('common.view') },
      modify: { label: t('common.modify') },
    },
  },
  work_week: {
    label: t('settings.workWeek'),
    actions: {
      view: { label: t('common.view') },
      modify: { label: t('common.modify') },
    },
  },
  public_holidays: {
    label: t('settings.publicHolidays'),
    actions: {
      view: { label: t('common.view') },
      modify: { label: t('common.modify') },
    },
  },
  invitations: {
    label: t('settings.invitations'),
    actions: {
      view: { label: t('common.view') },
      modify: { label: t('common.modify') },
    },
  },
  org_chart: {
    label: t('permissions.orgChart.label'),
    actions: {
      view: { label: t('permissions.orgChart.view') },
      modify: { label: t('permissions.orgChart.modify') },
    },
  },
  company_documents: {
    label: t('permissions.companyDocuments.label'),
    actions: {
      view: { label: t('permissions.companyDocuments.view') },
      modify: { label: t('permissions.companyDocuments.modify') },
    },
  },
}));

const hasPermission = (roleKey: string, category: string, action: string) => {
  const storePermissions = permissionsStore.permissions as Record<string, Record<string, string[]>>;
  const categoryPermissions = storePermissions[category];
  if (!categoryPermissions) return false;

  const allowedRoles = categoryPermissions[action];
  if (!allowedRoles) return false;

  return allowedRoles.includes(roleKey);
};
</script>
