<template>
  <div class="bg-white rounded-lg duration-300 p-4 flex-1 flex flex-col dark:bg-neutral-800 dark:text-gray-100">
    <div class="flex-1">
      <template v-if="componentLoading">
        <div class="grid grid-cols-12 pt-[30px] max-w-[947px]">
          <div class="w-12 h-12 bg-gray-200 rounded-full col-span-2 mr-4 animate-pulse"></div>
          <div class="pt-4 space-y-2 col-span-10 animate-pulse">
            <p class="h-4 bg-gray-200 rounded w-1/3 animate-pulse dark:bg-neutral-700"></p>
            <p class="h-4 bg-gray-200 rounded w-1/2 animate-pulse dark:bg-neutral-700"></p>
            <p class="h-4 bg-gray-200 rounded w-1/4 animate-pulse dark:bg-neutral-700"></p>
            <p class="h-4 bg-gray-200 rounded w-2/3 animate-pulse dark:bg-neutral-700"></p>
            <p class="h-4 bg-gray-200 rounded w-1/2 animate-pulse dark:bg-neutral-700"></p>
            <p class="h-4 bg-gray-200 rounded w-1/4 animate-pulse dark:bg-neutral-700"></p>
            <p class="h-4 bg-gray-200 rounded w-1/3 animate-pulse dark:bg-neutral-700"></p>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="grid grid-cols-12 pt-[30px] max-w-[947px]">
          <div class="grid grid-cols-2 col-span-12 lg:col-span-10 gap-y-[15px] gap-x-[25px]">
            <div class="w-full col-span-2 sm:col-span-1">
              <label class="block text-sm font-bold mb-2 text-black dark:text-white">ÎŒÎ½Î¿Î¼Î± Î“ÎºÏÎ¿Ï…Ï€</label>
              <input v-model="formGroupName" type="text" class="py-3 px-4 block w-full border-gray-200 border rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400" placeholder="ÎŒÎ½Î¿Î¼Î±">
            </div>
            <div class="w-full col-span-2 sm:col-span-1">
              <CustomSelect
                  v-model="formSelectedDepartmentHead"
                  :options="availableFormUsers"
                  label="Î¥Ï€ÎµÏÎ¸Ï…Î½Î¿Ï‚ Î“ÎºÏÎ¿Ï…Ï€"
                  placeholder="Î•Ï€Î¹Î»Î­Î¾Ï„Îµ Î¥Ï€ÎµÏÎ¸Ï…Î½Î¿"
                  selectId="department-head-select"
              />
            </div>

            <div class="col-span-2">
              <div class="block text-sm font-bold mb-2 text-black dark:text-white">
                Î§ÏÎ®ÏƒÏ„ÎµÏ‚
              </div>
              <CustomMultiSelect
                  v-model="formUsers"
                  :options="allUsers"
                  placeholder="Î•Ï€Î¹Î»Î­Î¾Ï„Îµ Ï‡ÏÎ®ÏƒÏ„ÎµÏ‚"
              />
            </div>

            <div class="info-actions pt-10 pb-5 flex gap-4 col-span-2">
              <button @click="submitForm"
                      class="py-3 inline-flex justify-center rounded-3xl border border-transparent bg-red-600 py-2 px-4 text-md font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none">
                Î‘Ï€Î¿Î¸Î®ÎºÎµÏ…ÏƒÎ· Î‘Î»Î»Î±Î³ÏŽÎ½
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from 'vue-router';
import { useCentralStore } from '@/stores/centralStore';
import CustomSelect from '@/components/misc/CustomSelect.vue';
import CustomMultiSelect from '@/components/misc/CustomMultiSelect.vue';

const router = useRouter();
const centralStore = useCentralStore();
const userStore = centralStore.userStore;
const departmentsStore = centralStore.departmentsStore;

// Loading state
const loadingUsers = computed(() => userStore.loading);
const loadingGroup = ref(false);
const componentLoading = computed(() => loadingUsers.value || loadingGroup.value);

const props = defineProps({
  groupId: {
    type: [Number, String],
    required: false,
  },
});

// Reactive variables for form fields
const formGroupName = ref('');
const formSelectedDepartmentHead = ref('');
const formUsers = ref([]);

// Reactive variable to store all users
const allUsers = computed(() => userStore.allUsers.map(user => {
  const nameSplit = user.name.trim().split(' ');
  const firstName = nameSplit.slice(0, -1).join(' ') || nameSplit[0];
  const lastName = nameSplit.slice(-1).join(' ') || '';
  return {
    ...user,
    firstName,
    lastName,
    // Note: Icon logic should be in a dedicated component for best practice
  };
}));

// Watch for changes in groupId and fetch data
watch(
    () => props.groupId,
    async (newGroupId) => {
      //console.log(newGroupId);
      if (newGroupId) {
        loadingGroup.value = true;
        try {
          const dptData = await departmentsStore.loadGroupById(newGroupId);
          //console.log(dptData);
          if (dptData) {
            initializeFormFields(dptData);
          }
        } catch (error) {
          //console.error('Error fetching department data:', error);
          useNuxtApp().$toast.error('Error fetching department data.', {
            position: "bottom-right",
            autoClose: 5000,
          });
        } finally {
          loadingGroup.value = false;
        }
      }
    },
    { immediate: true }
);

function initializeFormFields(dptData) {
  formGroupName.value = dptData.name;
  /*formUsers.value = allUsers.value
      .filter(user => dptData.users.some(memberId => memberId === user.id))
      .map(user => user.id);*/
  formUsers.value = dptData.users.map(user => user.id);
//console.log(formUsers.value);
  // Set the correct head using the head ID from dptData
  formSelectedDepartmentHead.value = dptData.head || null;
}

const availableFormUsers = computed(() => {
  return allUsers.value.filter(user => formUsers.value.includes(user.id));
});

const submitForm = async () => {
  // Check if any required fields are empty
  if (!formGroupName.value || !formSelectedDepartmentHead.value || formUsers.value.length === 0) {
    useNuxtApp().$toast.error('Î Î±ÏÎ±ÎºÎ±Î»ÏŽ ÏƒÏ…Î¼Ï€Î»Î·ÏÏŽÏƒÏ„Îµ ÏŒÎ»Î± Ï„Î± Ï…Ï€Î¿Ï‡ÏÎµÏ‰Ï„Î¹ÎºÎ¬ Ï€ÎµÎ´Î¯Î±.', {
      position: "bottom-right",
      autoClose: 5000,
    });
    return; // Stop the function if validation fails
  }

  const groupId = props.groupId;
  const groupName = formGroupName.value;
  const head = formSelectedDepartmentHead.value;
  const members = formUsers.value;

  try {
    if(!groupId) {
      await departmentsStore.newDepartment(
          groupName,
          head,
          members
      );
    } else {
      await departmentsStore.editDepartment(
          groupId,
          groupName,
          head,
          members
      );
    }
    useNuxtApp().$toast.success('Î¤Î¿ Î³ÎºÏÎ¿Ï…Ï€ ÎµÎ½Î·Î¼ÎµÏÏŽÎ¸Î·ÎºÎµ ÎµÏ€Î¹Ï„Ï…Ï‡ÏŽÏ‚!', {
      position: "bottom-right",
      autoClose: 5000,
    });
  } catch (error) {
    //console.error('Submission error:', error);
    useNuxtApp().$toast.error('Î”ÎµÎ½ Î¼Ï€Î¿ÏÎ­ÏƒÎ±Î¼Îµ Î½Î± Î±Ï€Î¿Î¸Î·ÎºÎµÏÏƒÎ¿Ï…Î¼Îµ Ï„Î¿ Î³ÎºÏÎ¿Ï…Ï€!', {
      position: "bottom-right",
      autoClose: 5000,
    });
  }
};
</script>

<style scoped>
/* Additional styles if needed */
</style>