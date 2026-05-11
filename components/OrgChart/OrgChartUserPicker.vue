<template>
  <BaseModal v-model="isOpen" :title="$t('orgChart.pickUser')">
    <div class="p-4 space-y-4">
      <input
        v-model="search"
        type="text"
        :placeholder="$t('orgChart.searchUsers')"
        :class="styles.input"
      />
      <div v-if="filteredUsers.length === 0" class="text-gray-500">
        {{ $t('orgChart.noUsers') }}
      </div>
      <div class="max-h-60 overflow-y-auto space-y-2">
        <div
          v-for="user in filteredUsers"
          :key="user.id"
          class="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer rounded"
          @click="selectUser(user.id)"
        >
          <UserAvatar :user="user" />
          <div class="font-medium dark:text-gray-200">{{ user.name }}</div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import BaseModal from '~/components/shared/BaseModal.vue';
import UserAvatar from '~/components/shared/UserAvatar.vue';
import { useCentralStore } from '~/stores/centralStore';
import { useFormStyles } from '~/composables/useFormStyles';

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  excludeUserIds: { type: Array as () => number[], default: () => [] },
});
const emit = defineEmits(['update:modelValue', 'select']);

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const centralStore = useCentralStore();
const search = ref('');
const styles = useFormStyles();

const filteredUsers = computed(() => {
  const query = search.value.toLowerCase();
  const allUsers = centralStore.userStore.allUsers || centralStore.userStore.users || [];
  return allUsers.filter((u: any) => {
    if (props.excludeUserIds.includes(u.id as number)) return false;
    return u.name?.toLowerCase().includes(query) || u.email?.toLowerCase().includes(query);
  });
});

const selectUser = (userId: number) => {
  emit('select', userId);
  isOpen.value = false;
  search.value = ''; // reset search
};
</script>
