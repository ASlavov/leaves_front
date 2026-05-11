<template>
  <div class="container">
    <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-12 gap-4">
      <div
        :class="canRequestLeave ? 'lg:col-span-3' : 'xl:col-span-3'"
        class="flex flex-col col-span-12"
      >
        <ProfileInfo />
      </div>
      <div
        :class="canRequestLeave ? 'lg:col-span-3' : 'xl:col-span-3'"
        class="flex flex-col col-span-12"
      >
        <UserGroupInfo />
      </div>
      <div
        v-if="
          permissionsStore.can('profile_leave_balance', 'request_leave') ||
          permissionsStore.can('profile_leave_balance', 'cancel_leave')
        "
        class="lg:col-span-6 flex flex-col"
      >
        <h3 class="py-4 font-bold text-[16px] text-[#212121] dark:text-gray-100">
          {{ $t('leaves.yearlyLeaves') }}
        </h3>
        <div class="flex-1 space-y-3 max-h-[392px] h-full overflow-y-auto">
          <LeavesYearInfo />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ProfileInfo from '~/components/Home/ProfileInfo.vue';
import UserGroupInfo from '~/components/Home/UserGroupInfo.vue';
import LeavesYearInfo from '~/components/Home/LeavesYearInfo.vue';
import { useCentralStore } from '@/stores/centralStore.js';

const centralStore = useCentralStore();
const permissionsStore = centralStore.permissionsStore;

const canRequestLeave = computed(() => {
  return (
    permissionsStore.can('profile_leave_balance', 'request_leave') ||
    permissionsStore.can('profile_leave_balance', 'cancel_leave')
  );
});
</script>
