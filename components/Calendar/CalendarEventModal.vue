<template>
  <BaseModal v-model="isOpen" :title="$t('calendar.eventDetails')">
    <div v-if="event" class="p-6 space-y-4">
      <div class="flex items-center gap-4 mb-6">
        <SharedUserAvatar
          :first-name="user?.name?.split(' ')[0] || ''"
          :last-name="user?.name?.split(' ')[1] || ''"
          :profile-image="user?.profile?.profile_image_base64 || ''"
          class="w-12 h-12"
        />
        <div>
          <div class="font-medium text-lg dark:text-white">{{ user?.name || event.title }}</div>
          <div class="text-sm text-gray-500">{{ typeName }}</div>
        </div>
      </div>

      <div
        class="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-neutral-800 p-4 rounded-lg border border-gray-100 dark:border-neutral-700"
      >
        <div>
          <div class="text-xs text-gray-500 mb-1">{{ $t('common.startDate') }}</div>
          <div class="font-medium dark:text-white">{{ formatDate(event.start) }}</div>
        </div>
        <div>
          <div class="text-xs text-gray-500 mb-1">{{ $t('common.endDate') }}</div>
          <div class="font-medium dark:text-white">{{ formatDate(event.end) }}</div>
        </div>
      </div>

      <div class="flex justify-between items-center mt-4">
        <span
          class="px-3 py-1 text-sm font-medium rounded-full"
          :class="{
            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400':
              event.extendedProps.status === 'approved',
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400':
              event.extendedProps.status === 'pending',
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400':
              event.extendedProps.status === 'declined',
          }"
        >
          {{ $t(`leaves.${event.extendedProps.status}`) }}
        </span>
      </div>

      <div
        v-if="canAccept && event.extendedProps.status === 'pending'"
        class="flex gap-3 pt-6 border-t border-gray-200 dark:border-neutral-700 mt-6"
      >
        <button
          class="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors"
          :disabled="isProcessing"
          @click="accept"
        >
          {{ $t('leaves.approveLeave') }}
        </button>
        <button
          class="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
          :disabled="isProcessing"
          @click="decline"
        >
          {{ $t('leaves.rejectLeave') }}
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCentralStore } from '~/stores/centralStore';
import BaseModal from '~/components/shared/BaseModal.vue';
import SharedUserAvatar from '~/components/shared/UserAvatar.vue';
import { format, parseISO } from 'date-fns';
import type { User } from '~/types';

const props = defineProps({
  event: { type: Object, required: true },
});

const emit = defineEmits(['close', 'refresh']);

const isOpen = computed({
  get: () => !!props.event,
  set: (val) => {
    if (!val) emit('close');
  },
});

const centralStore = useCentralStore();
const userStore = centralStore.userStore;
const leavesStore = centralStore.leavesStore;
const permissionsStore = centralStore.permissionsStore;

const isProcessing = ref(false);

const user = computed(() => {
  return userStore.allUsers.find((u: User) => u.id === props.event.extendedProps.userId);
});

const typeName = computed(() => {
  const typeId = props.event.extendedProps.leaveTypeId;
  const t = leavesStore.leavesData.leavesTypes.find((lt: any) => lt.id === typeId);
  return t ? t.name : '';
});

const canAccept = computed(() => permissionsStore.can('profile_leave_balance', 'accept_leave'));

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy');
  } catch (e) {
    return dateStr;
  }
};

const accept = async () => {
  isProcessing.value = true;
  try {
    await leavesStore.approveLeave(
      props.event.extendedProps.userId,
      props.event.id,
      'approved',
      '',
    );
    emit('refresh');
    isOpen.value = false;
  } catch (e) {
    console.error(e);
  } finally {
    isProcessing.value = false;
  }
};

const decline = async () => {
  isProcessing.value = true;
  try {
    await leavesStore.declineLeave(
      props.event.extendedProps.userId,
      props.event.id,
      'rejected',
      '',
    );
    emit('refresh');
    isOpen.value = false;
  } catch (e) {
    console.error(e);
  } finally {
    isProcessing.value = false;
  }
};
</script>
