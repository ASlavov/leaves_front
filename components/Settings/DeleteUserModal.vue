<template>
  <div class="px-[30px] pb-[30px] pt-[10px]">
    <h3 class="text-[20px] font-bold text-black dark:text-white mb-[8px]">
      {{ $t('settings.deleteUserTitle') }}
    </h3>
    <p class="text-[14px] text-gray-600 dark:text-neutral-400 mb-[20px]">
      {{ $t('settings.deleteUserWarning') }}
    </p>

    <div
      v-if="user"
      class="flex items-center gap-[12px] p-[12px] rounded-[8px] bg-gray-50 dark:bg-neutral-700/40 mb-[20px]"
    >
      <SharedUserAvatar :user="user" :size="40" />
      <div class="min-w-0">
        <p class="text-[14px] font-bold text-black dark:text-white truncate">
          {{ user.name }}
        </p>
        <p class="text-[12px] text-gray-500 dark:text-neutral-400 truncate">
          {{ user.email }}
        </p>
      </div>
    </div>

    <div class="mb-[20px]">
      <label :class="labelClass">
        {{ $t('settings.typeNameToConfirm', { name: user?.name || '' }) }}
      </label>
      <input
        v-model="confirmation"
        :class="inputClass"
        type="text"
        :placeholder="user?.name"
        autocomplete="off"
      />
    </div>

    <p class="text-[12px] text-amber-600 dark:text-amber-400 mb-[20px]">
      {{ $t('common.irreversibleAction') }}
    </p>

    <div class="flex gap-[10px] justify-end">
      <button
        type="button"
        class="inline-flex items-center justify-center py-[10px] px-[20px] rounded-[70px] border border-[#DFEAF2] dark:border-neutral-600 text-[14px] font-bold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-700 focus:outline-none"
        @click="emit('saved')"
      >
        {{ $t('common.cancel') }}
      </button>
      <button
        type="button"
        :disabled="!canSubmit || loading"
        class="inline-flex items-center justify-center py-[10px] px-[20px] rounded-[70px] bg-red-600 text-white text-[14px] font-bold hover:bg-red-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        @click="doDelete"
      >
        {{ loading ? $t('common.deleting') : $t('common.delete') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCentralStore } from '@/stores/centralStore';
import { useFormStyles } from '@/composables/useFormStyles';

const { t } = useI18n();
const { input: inputClass, label: labelClass } = useFormStyles();
const { $toast } = useNuxtApp() as any;
const centralStore = useCentralStore();
const { userStore } = centralStore;

const props = defineProps({
  userId: {
    type: [Number, String] as PropType<number | string | null>,
    default: null,
  },
});
const emit = defineEmits(['saved']);

const user = computed(() =>
  (userStore.allUsers || []).find((u: any) => String(u.id) === String(props.userId)),
);

const confirmation = ref('');
const loading = ref(false);

const canSubmit = computed(
  () =>
    user.value &&
    confirmation.value.trim().toLowerCase() === (user.value.name || '').trim().toLowerCase(),
);

const doDelete = async () => {
  if (!canSubmit.value || !props.userId) return;
  loading.value = true;
  try {
    await userStore.deleteUser(props.userId);
    $toast.success(t('settings.userDeletedSuccess'));
    emit('saved');
  } catch (err) {
    $toast.error(t('settings.userDeletedError'));
  } finally {
    loading.value = false;
  }
};
</script>
