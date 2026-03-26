<template>
  <div :class="asModal ? '' : 'bg-white rounded-lg duration-300 p-4 flex-1 flex flex-col dark:bg-neutral-800 dark:text-gray-100'">
    <div class="flex-1">
      <template v-if="componentLoading">
        <div class="px-[30px] py-[30px] flex flex-wrap gap-[15px]">
          <div v-for="i in 3" :key="i" class="w-[300px]">
            <div class="h-[14px] bg-gray-200 dark:bg-neutral-700 rounded w-1/3 mb-[8px] animate-pulse"></div>
            <div class="h-[40px] bg-gray-200 dark:bg-neutral-700 rounded-[8px] animate-pulse"></div>
          </div>
          <div class="w-full">
            <div class="h-[14px] bg-gray-200 dark:bg-neutral-700 rounded w-1/4 mb-[8px] animate-pulse"></div>
            <div class="h-[40px] bg-gray-200 dark:bg-neutral-700 rounded-[8px] animate-pulse"></div>
          </div>
        </div>
      </template>
      <template v-else>
        <div :class="asModal ? 'px-[30px] pb-[30px] pt-[10px]' : 'grid grid-cols-12 pt-[30px] max-w-[947px]'">
          <div :class="asModal ? 'flex flex-wrap gap-[15px]' : 'grid grid-cols-2 col-span-12 lg:col-span-10 gap-y-[15px] gap-x-[25px]'">
            <!-- Group Name -->
            <div :class="asModal ? 'w-[300px]' : 'w-full col-span-2 sm:col-span-1'">
              <label :class="labelClass">{{ $t('settings.groupName') }} <span class="text-[#EA021A]">*</span></label>
              <input v-model="formGroupName" type="text" :class="inputClass" :placeholder="$t('settings.groupName')">
            </div>
            <!-- Group Head -->
            <div :class="asModal ? 'w-[300px]' : 'w-full col-span-2 sm:col-span-1'">
              <CustomSelect
                v-model="formSelectedDepartmentHead"
                :options="availableFormUsers"
                :label="$t('settings.groupHead') + ' <span class=\'text-[#EA021A]\'>*</span>'"
                :placeholder="$t('settings.selectHead')"
                selectId="department-head-select"
              />
            </div>
            <!-- Members -->
            <div :class="asModal ? 'w-full' : 'col-span-2'">
              <div :class="labelClass">{{ $t('settings.users') }}</div>
              <CustomMultiSelect
                v-model="formUsers"
                :options="allUsers"
                :placeholder="$t('settings.selectUsers')"
              />
            </div>
            <!-- Submit -->
            <div :class="asModal ? 'w-full pt-[15px]' : 'info-actions pt-10 pb-5 flex gap-4 col-span-2'">
              <button @click="submitForm" :class="submitBtnClass">
                {{ $t('settings.saveChanges') }}
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useCentralStore } from '@/stores/centralStore';
import CustomSelect from '@/components/misc/CustomSelect.vue';
import CustomMultiSelect from '@/components/misc/CustomMultiSelect.vue';
import { useFormStyles } from '@/composables/useFormStyles';

const { t } = useI18n();
const router = useRouter();
const centralStore = useCentralStore();
const userStore = centralStore.userStore;
const departmentsStore = centralStore.departmentsStore;

const { input: inputClass, label: labelClass, submitBtn: submitBtnClass } = useFormStyles();

const loadingUsers = computed(() => userStore.loading);
const loadingGroup = ref(false);
const componentLoading = computed(() => loadingUsers.value || loadingGroup.value);

const props = defineProps({
  groupId: {
    type: [Number, String],
    required: false,
  },
  asModal: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['saved']);

const formGroupName = ref('');
const formSelectedDepartmentHead = ref('');
const formUsers = ref([]);

const allUsers = computed(() => userStore.allUsers.map(user => {
  const nameSplit = user.name.trim().split(' ');
  const firstName = nameSplit.slice(0, -1).join(' ') || nameSplit[0];
  const lastName = nameSplit.slice(-1).join(' ') || '';
  return { ...user, firstName, lastName };
}));

watch(
    () => props.groupId,
    async (newGroupId) => {
      if (newGroupId) {
        loadingGroup.value = true;
        try {
          const dptData = await departmentsStore.loadGroupById(newGroupId);
          if (dptData) {
            initializeFormFields(dptData);
          }
        } catch (error) {
          useNuxtApp().$toast.error('Error fetching department data.', { position: "bottom-right", autoClose: 5000 });
        } finally {
          loadingGroup.value = false;
        }
      }
    },
    { immediate: true }
);

function initializeFormFields(dptData) {
  formGroupName.value = dptData.name;
  formUsers.value = dptData.users?.map(user => user.id) || [];
  formSelectedDepartmentHead.value = dptData.head || null;
}

const availableFormUsers = computed(() => {
  return allUsers.value.filter(user => formUsers.value.includes(user.id));
});

const submitForm = async () => {
  if (!formGroupName.value || !formSelectedDepartmentHead.value || formUsers.value.length === 0) {
    useNuxtApp().$toast.error(t('settings.fillRequiredFields'), { position: "bottom-right", autoClose: 5000 });
    return;
  }

  const groupId = props.groupId;
  const groupName = formGroupName.value;
  const head = formSelectedDepartmentHead.value;
  const members = formUsers.value;

  try {
    if (!groupId) {
      await departmentsStore.newDepartment(groupName, head, members);
    } else {
      await departmentsStore.editDepartment(groupId, groupName, head, members);
    }
    useNuxtApp().$toast.success(t('settings.groupUpdated'), { position: "bottom-right", autoClose: 5000 });
    emit('saved');
  } catch (error) {
    useNuxtApp().$toast.error(t('settings.saveGroupError'), { position: "bottom-right", autoClose: 5000 });
  }
};
</script>

<style scoped>
/* Additional styles if needed */
</style>
