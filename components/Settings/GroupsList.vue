<template>
  <template v-if="loading">

    <!-- Loading Skeletons -->
    <div class="grid grid-cols-12 pt-[30px] max-w-[947px]">
      <div class="w-12 h-12 bg-gray-200 rounded-full col-span-2 mr-4 animate-pulse"></div>
      <!-- Info Details Skeleton -->
      <div class="pt-4 space-y-2 col-span-10 animate-pulse">
        <p class="h-6 bg-gray-200 rounded w-full animate-pulse dark:bg-neutral-700"></p>
        <p class="h-6 bg-gray-100 rounded w-full animate-pulse dark:bg-neutral-600"></p>
        <p class="h-6 bg-gray-200 rounded w-full animate-pulse dark:bg-neutral-700"></p>
        <p class="h-6 bg-gray-100 rounded w-full animate-pulse dark:bg-neutral-600"></p>
        <p class="h-6 bg-gray-200 rounded w-full animate-pulse dark:bg-neutral-700"></p>
        <p class="h-6 bg-gray-100 rounded w-full animate-pulse dark:bg-neutral-600"></p>
        <p class="h-6 bg-gray-200 rounded w-full animate-pulse dark:bg-neutral-700"></p>
      </div>
    </div>
  </template>
  <template v-else>
    <div class="flex flex-col gap-[10px]">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12 items-center pl-[20px] pr-[50px] py-[10px] gap-[10px] font-bold">
        <div class="sm:col-span-2 md:col-span-4 lg:col-span-1">
          Filter By:
        </div>

        <!-- First Name Filter -->
        <div class="lg:col-span-2 text-black dark:text-white">
          <div class="max-w-full -ml-4 inline-flex group border border-gray-200 rounded-lg transition-all focus-within:border-gray-400 transition-all hover:border-gray-400 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500">
            <input
                v-model="filters.firstName"
                :class="`py-3 px-4 text-[16px] w-full bg-transparent border-none outline-0 ${filters.firstName ? '' : 'rounded-r-lg'} rounded-l-lg text-sm focus:outline-none dark:bg-neutral-900 dark:text-neutral-400`"
                type="text"
                placeholder="Όνομα"
            />
            <button
                v-if="filters.firstName"
                @click="filters.firstName = ''"
                class="px-3 py-3 text-[13px] bg-white border-l border-gray-200 rounded-r-lg text-red-500 hover:bg-gray-100 transition-all dark:hover:bg-neutral-700 focus:outline-none dark:bg-neutral-900 dark:border-neutral-700"
            >
              &times;
            </button>
          </div>
        </div>

        <!-- Last Name Filter -->
        <div class="lg:col-span-2 text-black dark:text-white">
          <div class="max-w-full -ml-4 inline-flex group border border-gray-200 rounded-lg transition-all focus-within:border-gray-400 transition-all hover:border-gray-400 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500">
            <input
                v-model="filters.lastName"
                :class="`py-3 px-4 text-[16px] w-full bg-transparent border-none outline-0 ${filters.lastName ? '' : 'rounded-r-lg'} rounded-l-lg text-sm focus:outline-none dark:bg-neutral-900 dark:text-neutral-400`"
                type="text"
                placeholder="Επώνυμο"
            />
            <button
                v-if="filters.lastName"
                @click="filters.lastName = ''"
                class="px-3 py-3 text-[13px] bg-white border-l border-gray-200 rounded-r-lg text-red-500 hover:bg-gray-100 transition-all dark:hover:bg-neutral-700 focus:outline-none dark:bg-neutral-900 dark:border-neutral-700"
            >
              &times;
            </button>
          </div>
        </div>

        <!-- Title Filter -->
        <div class="lg:col-span-2 text-black dark:text-white">
          <div class="max-w-full -ml-4 inline-flex group border border-gray-200 rounded-lg transition-all focus-within:border-gray-400 transition-all hover:border-gray-400 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500">
            <input
                v-model="filters.job_title"
                :class="`py-3 px-4 text-[16px] w-full bg-transparent border-none outline-0 ${filters.job_title ? '' : 'rounded-r-lg'} rounded-l-lg text-sm focus:outline-none dark:bg-neutral-900 dark:text-neutral-400`"
                type="text"
                placeholder="Τίτλος"
            />
            <button
                v-if="filters.job_title"
                @click="filters.job_title = ''"
                class="px-3 py-3 text-[13px] bg-white border-l border-gray-200 rounded-r-lg text-red-500 hover:bg-gray-100 transition-all dark:hover:bg-neutral-700 focus:outline-none dark:bg-neutral-900 dark:border-neutral-700"
            >
              &times;
            </button>
          </div>
        </div>

        <!-- Department Filter -->
        <div class="lg:col-span-2 text-black dark:text-white">
          <div class="max-w-full -ml-4 inline-flex group border border-gray-200 rounded-lg transition-all focus-within:border-gray-400 transition-all hover:border-gray-400 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500">
            <input
                v-model="filters.department"
                :class="`py-3 px-4 text-[16px] w-full bg-transparent border-none outline-0 ${filters.department ? '' : 'rounded-r-lg'} rounded-l-lg text-sm focus:outline-none dark:bg-neutral-900 dark:text-neutral-400`"
                type="text"
                placeholder="Γκρούπ"
            />
            <button
                v-if="filters.department"
                @click="filters.department = ''"
                class="px-3 py-3 text-[13px] bg-white border-l border-gray-200 rounded-r-lg text-red-500 hover:bg-gray-100 transition-all dark:hover:bg-neutral-700 focus:outline-none dark:bg-neutral-900 dark:border-neutral-700"
            >
              &times;
            </button>
          </div>
        </div>

        <div class="lg:col-span-3 lg:justify-self-end items-center">
          <button
              v-if="filters.firstName || filters.lastName || filters.job_title || filters.department"
              @click="
                filters.firstName = '';
                filters.lastName  = '';
                filters.job_title  = '';
                filters.department = '';
              "
              class="text-red-500"
          >
            &times; Clear all
          </button>
        </div>
      </div>
      <!-- Filter Toggle Section -->
<!--      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12 items-center pl-[20px] pr-[50px] py-[10px] gap-[10px] font-bold">
        <div class="sm:col-span-2 md:col-span-4 lg:col-span-1 flex items-center cursor-pointer" @click="toggleFilters">
          <span>Filter By:</span>
          &lt;!&ndash; Filled Triangle SVG &ndash;&gt;
          <svg
              :class="`ml-2 transform transition-transform duration-300 ${showFilters ? '' : 'rotate-180'}`"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="currentColor"
          >
            <polygon points="5,0 15,10 5,20" />
          </svg>
        </div>

        &lt;!&ndash; Filters Section &ndash;&gt;
        <transition class="grid-cols-8" name="slide-left">
          <div
              v-if="showFilters"
              class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12 items-center pl-[20px] pr-[50px] py-[10px] gap-[10px] font-bold"
          >
            &lt;!&ndash; First Name Filter &ndash;&gt;
            <div class="lg:col-span-2 text-black dark:text-white">
              &lt;!&ndash; Your existing filter input and button &ndash;&gt;
              <div class="max-w-full -ml-4 inline-flex group border border-gray-200 rounded-lg transition-all focus-within:border-gray-400 hover:border-gray-400 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500">
                <input
                    v-model="filters.firstName"
                    :class="`py-3 px-4 text-[16px] w-full bg-transparent border-none outline-0 ${filters.firstName ? '' : 'rounded-r-lg'} rounded-l-lg text-sm focus:outline-none dark:bg-neutral-900 dark:text-neutral-400`"
                    type="text"
                    placeholder="Όνομα"
                />
                <button
                    v-if="filters.firstName"
                    @click="filters.firstName = ''"
                    class="px-3 py-3 text-[13px] bg-white border-l border-gray-200 rounded-r-lg text-red-500 hover:bg-gray-100 transition-all dark:hover:bg-neutral-700 focus:outline-none dark:bg-neutral-900 dark:border-neutral-700"
                >
                  &times;
                </button>
              </div>
            </div>

            &lt;!&ndash; Last Name Filter &ndash;&gt;
            <div class="lg:col-span-2 text-black dark:text-white">
              &lt;!&ndash; Your existing filter input and button &ndash;&gt;
              <div class="max-w-full -ml-4 inline-flex group border border-gray-200 rounded-lg transition-all focus-within:border-gray-400 hover:border-gray-400 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500">
                <input
                    v-model="filters.lastName"
                    :class="`py-3 px-4 text-[16px] w-full bg-transparent border-none outline-0 ${filters.lastName ? '' : 'rounded-r-lg'} rounded-l-lg text-sm focus:outline-none dark:bg-neutral-900 dark:text-neutral-400`"
                    type="text"
                    placeholder="Επώνυμο"
                />
                <button
                    v-if="filters.lastName"
                    @click="filters.lastName = ''"
                    class="px-3 py-3 text-[13px] bg-white border-l border-gray-200 rounded-r-lg text-red-500 hover:bg-gray-100 transition-all dark:hover:bg-neutral-700 focus:outline-none dark:bg-neutral-900 dark:border-neutral-700"
                >
                  &times;
                </button>
              </div>
            </div>

            &lt;!&ndash; Title Filter &ndash;&gt;
            <div class="lg:col-span-2 text-black dark:text-white">
              &lt;!&ndash; Your existing filter input and button &ndash;&gt;
              <div class="max-w-full -ml-4 inline-flex group border border-gray-200 rounded-lg transition-all focus-within:border-gray-400 hover:border-gray-400 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500">
                <input
                    v-model="filters.job_title"
                    :class="`py-3 px-4 text-[16px] w-full bg-transparent border-none outline-0 ${filters.job_title ? '' : 'rounded-r-lg'} rounded-l-lg text-sm focus:outline-none dark:bg-neutral-900 dark:text-neutral-400`"
                    type="text"
                    placeholder="Τίτλος"
                />
                <button
                    v-if="filters.job_title"
                    @click="filters.job_title = ''"
                    class="px-3 py-3 text-[13px] bg-white border-l border-gray-200 rounded-r-lg text-red-500 hover:bg-gray-100 transition-all dark:hover:bg-neutral-700 focus:outline-none dark:bg-neutral-900 dark:border-neutral-700"
                >
                  &times;
                </button>
              </div>
            </div>

            &lt;!&ndash; Department Filter &ndash;&gt;
            <div class="lg:col-span-2 text-black dark:text-white">
              &lt;!&ndash; Your existing filter input and button &ndash;&gt;
              <div class="max-w-full -ml-4 inline-flex group border border-gray-200 rounded-lg transition-all focus-within:border-gray-400 hover:border-gray-400 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500">
                <input
                    v-model="filters.department"
                    :class="`py-3 px-4 text-[16px] w-full bg-transparent border-none outline-0 ${filters.department ? '' : 'rounded-r-lg'} rounded-l-lg text-sm focus:outline-none dark:bg-neutral-900 dark:text-neutral-400`"
                    type="text"
                    placeholder="Γκρούπ"
                />
                <button
                    v-if="filters.department"
                    @click="filters.department = ''"
                    class="px-3 py-3 text-[13px] bg-white border-l border-gray-200 rounded-r-lg text-red-500 hover:bg-gray-100 transition-all dark:hover:bg-neutral-700 focus:outline-none dark:bg-neutral-900 dark:border-neutral-700"
                >
                  &times;
                </button>
              </div>
            </div>
          </div>
        </transition>

        &lt;!&ndash; "Clear all" Button &ndash;&gt;
        <div class="lg:col-span-3 lg:justify-self-end items-center">
          <button
              v-if="filters.firstName || filters.lastName || filters.job_title || filters.department"
              @click="
              filters.firstName = '';
              filters.lastName  = '';
              filters.job_title  = '';
              filters.department = '';
            "
              class="text-red-500"
          >
            &times; Clear all
          </button>
        </div>
      </div>-->


      <div class="grid grid-cols-2 lg:grid-cols-12 items-center pl-[20px] pr-[50px] py-[10px] gap-[10px] font-bold">
        <div class="col-span-1">
          Sort By:
        </div>
        <!-- First Name Sort Button -->
        <div
            @click="sortBy('firstName')"
            class="cursor-pointer col-span-2 text-black dark:text-white flex items-center"
        >
          Όνομα
          <span v-if="currentSortKey === 'firstName'" class="ml-1">
            <svg v-if="sortDirection" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <!-- Up Arrow -->
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M5 15l7-7 7 7"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <!-- Down Arrow -->
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 9l-7 7-7-7"/>
            </svg>
          </span>
        </div>
        <!-- Last Name Sort Button -->
        <div
            @click="sortBy('lastName')"
            class="cursor-pointer col-span-2 text-black dark:text-white flex items-center"
        >
          Επώνυμο
          <span v-if="currentSortKey === 'lastName'" class="ml-1">
            <svg v-if="sortDirection" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <!-- Up Arrow -->
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M5 15l7-7 7 7"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <!-- Down Arrow -->
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 9l-7 7-7-7"/>
            </svg>
          </span>
        </div>
        <!-- First Name Sort Button -->
        <div
            @click="sortBy('job_title')"
            class="cursor-pointer col-span-2 text-black dark:text-white flex items-center"
        >
          Τίτλος
          <span v-if="currentSortKey === 'job_title'" class="ml-1">
            <svg v-if="sortDirection" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <!-- Up Arrow -->
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M5 15l7-7 7 7"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <!-- Down Arrow -->
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 9l-7 7-7-7"/>
            </svg>
          </span>
        </div>
        <!-- First Name Sort Button -->
        <div
            @click="sortBy('department')"
            class="cursor-pointer col-span-2 text-black dark:text-white flex items-center"
        >
          Γκρούπ
          <span v-if="currentSortKey === 'department'" class="ml-1">
            <svg v-if="sortDirection" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <!-- Up Arrow -->
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M5 15l7-7 7 7"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <!-- Down Arrow -->
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 9l-7 7-7-7"/>
            </svg>
          </span>
        </div>
      </div>
      <div class="-m-4 p-4 mt-0">
        <div ref="scrollContainer"
             class="overflow-y-auto max-h-[50vh] pr-[15px] flex flex-col gap-[50px] -mr-[5px] [&::-webkit-scrollbar]:w-2
                  [&::-webkit-scrollbar-track]:rounded-full
                  [&::-webkit-scrollbar-track]:bg-gray-100
                  [&::-webkit-scrollbar-thumb]:rounded-full
                  [&::-webkit-scrollbar-thumb]:bg-gray-300
                  dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                  dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
          <div v-for="group in filteredGroups" :key="group.id" :class="group.users.length === 0 ? 'hidden' : ''">
            <div v-if="group.users.length" class="grid grid-cols-2 gap-[10px]">
              <div class="h-7 translate-x-[-20px] justify-start items-center gap-5  flex">
                <div class="w-1 h-7 bg-[#ea021a] rounded-lg"></div>
                <div class="text-black dark:text-white text-xl font-bold font-['Roboto']">{{ group.name }}</div>
              </div>

              <div class="justify-self-end flex gap-[25px] items-center">
                <a v-if="canEditGroup()" @click="editGroup(group.id)" class="cursor-pointer text-[#EA021A] font-bold underline">Επεξεργασία Γκρουπ</a>
                <svg v-if="canDeleteGroup()" @click="deleteGroup(group.id)" class="cursor-pointer" xmlns="http://www.w3.org/2000/svg" width="16" height="19" viewBox="0 0 16 19" fill="none">
                  <path d="M13.4104 14.3631L14.1604 14.3698L13.4104 14.3631ZM1 3.58333C0.585786 3.58333 0.25 3.91912 0.25 4.33333C0.25 4.74755 0.585786 5.08333 1 5.08333V3.58333ZM14.3333 5.08333C14.7475 5.08333 15.0833 4.74755 15.0833 4.33333C15.0833 3.91912 14.7475 3.58333 14.3333 3.58333V5.08333ZM6.75 7.66667C6.75 7.25245 6.41421 6.91667 6 6.91667C5.58579 6.91667 5.25 7.25245 5.25 7.66667H6.75ZM5.25 14.3333C5.25 14.7475 5.58579 15.0833 6 15.0833C6.41421 15.0833 6.75 14.7475 6.75 14.3333H5.25ZM10.0833 7.66667C10.0833 7.25245 9.74755 6.91667 9.33333 6.91667C8.91912 6.91667 8.58333 7.25245 8.58333 7.66667H10.0833ZM8.58333 14.3333C8.58333 14.7475 8.91912 15.0833 9.33333 15.0833C9.74755 15.0833 10.0833 14.7475 10.0833 14.3333H8.58333ZM12.75 4.32664L12.6605 14.3564L14.1604 14.3698L14.25 4.34003L12.75 4.32664ZM10.0772 16.9167H5.16667V18.4167H10.0772V16.9167ZM1.08333 4.33333V14.3333H2.58333V4.33333H1.08333ZM1 5.08333H1.83333V3.58333H1V5.08333ZM1.83333 5.08333H4.33333V3.58333H1.83333V5.08333ZM4.33333 5.08333H11V3.58333H4.33333V5.08333ZM11 5.08333H13.5V3.58333H11V5.08333ZM13.5 5.08333H14.3333V3.58333H13.5V5.08333ZM5.08333 3.96296C5.08333 2.82138 6.15445 1.75 7.66667 1.75V0.25C5.49699 0.25 3.58333 1.83175 3.58333 3.96296H5.08333ZM7.66667 1.75C9.17889 1.75 10.25 2.82138 10.25 3.96296H11.75C11.75 1.83174 9.83634 0.25 7.66667 0.25V1.75ZM3.58333 3.96296V4.33333H5.08333V3.96296H3.58333ZM10.25 3.96296V4.33333H11.75V3.96296H10.25ZM5.16667 16.9167C3.73993 16.9167 2.58333 15.7601 2.58333 14.3333H1.08333C1.08333 16.5885 2.9115 18.4167 5.16667 18.4167V16.9167ZM12.6605 14.3564C12.6478 15.7741 11.495 16.9167 10.0772 16.9167V18.4167C12.3182 18.4167 14.1404 16.6106 14.1604 14.3698L12.6605 14.3564ZM5.25 7.66667V14.3333H6.75V7.66667H5.25ZM8.58333 7.66667V14.3333H10.0833V7.66667H8.58333Z" :fill="theme === 'light' ? 'black' : 'white'"/>
                </svg>
              </div>
              <div v-for="user in group.users" :key="user.id" class="col-span-2 grid gap-[10px] grid-cols-2 lg:grid-cols-12 items-center border border-[#DFEAF2] rounded-lg pl-[20px] pr-[30px] py-[10px] hover:bg-neutral-100 dark:hover:bg-neutral-600 text-[#808080]">
                <div class="w-[50px] h-[50px] bg-gray-300 rounded-full mr-4 flex items-center justify-center col-span-1 ">
                  <img v-if="user.profile.profile_image" :src="user.profile.profile_image" />
                  <span v-else class="text-white font-bold">
                      {{ user.firstName.charAt(0) || '' }}{{ user.lastName?.charAt(0) || '' }}
                  </span>
                </div>
                <div class="col-span-2">
                  {{ user.firstName || '' }}
                </div>
                <div class="col-span-2">
                  {{ user.lastName || '' }}
                </div>
                <div class="col-span-2">
                  {{ user?.profile?.job_title || '' }}
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Fade effect at the top -->
<!--        <div
            v-if="showTopFade"
            class="pointer-events-none absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-gray-100 to-transparent dark:from-neutral-900 dark:to-transparent"
        ></div>

        &lt;!&ndash; Fade effect at the bottom &ndash;&gt;
        <div
            v-if="showBottomFade"
            class="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-100 to-transparent dark:from-neutral-900 dark:to-transparent"
        ></div>-->
      </div>
    </div>
  </template>

  <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @click.self="closeModal"
  >
    <div class="bg-white dark:bg-neutral-700 p-2 rounded-lg w-full max-w-[900px] relative">
      <button
          @click="closeModal"
          class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
      >
        &times;
      </button>
      <!-- Conditionally render EditUser or DeleteUser component -->
      <component :is="modalComponent" :groupId="selectedGroupId" />
    </div>
  </div>

</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useCentralStore } from '~/stores/centralStore.js';
import EditGroup from '@/components/Settings/EditGroup.vue';
// import DeleteGroup from '@/components/Settings/DeleteGroup.vue'; // Uncomment when available

// Access the necessary stores
const centralStore = useCentralStore();
const userStore = centralStore.userStore;
const departmentsStore = centralStore.departmentsStore;

// Reactive variables for modal management
const showModal = ref(false);
const modalType = ref(''); // 'edit' or 'delete'
const selectedGroupId = ref(null);

// Compute the current theme
const theme = computed(() => {
  const { $colorMode } = useNuxtApp();
  return $colorMode?.value || 'light';
});
const showFilters = ref(true);

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};
// Loading state from userStore
const loading = computed(() => centralStore.loading);

// Reactive variable to store all users
const allUsers = ref([]);

// Process users to extract firstName and lastName
watch(
    () => userStore.allUsers,
    (users) => {
      allUsers.value = users.map(user => {
        // Extract firstName and lastName from user.name
        const nameSplit = user.name.trim().split(' ');
        const firstName = nameSplit.slice(0, -1).join(' ') || nameSplit[0];
        const lastName = nameSplit.slice(-1).join(' ') || '';

        // Return a new user object with firstName and lastName added
        return {
          ...user,
          firstName,
          lastName,
        };
      });
    },
    { immediate: true }
);

// Reactive variables for sorting
const sortDirection = ref(true); // true for ascending, false for descending
const currentSortKey = ref('firstName'); // The key currently being sorted by

// Function to handle sorting when a sort button is clicked
const sortBy = (sortingKey) => {
  if (currentSortKey.value === sortingKey) {
    // Toggle sort direction if the same key is clicked
    sortDirection.value = !sortDirection.value;
  } else {
    // Set new sort key and reset to ascending order
    currentSortKey.value = sortingKey;
    sortDirection.value = true;
  }
};

// Define sorting functions
const sortByFunctions = {
  'firstName': (a, b) => a.firstName.localeCompare(b.firstName),
  'lastName': (a, b) => a.lastName.localeCompare(b.lastName),
  'job_title': (a, b) => (a.profile?.job_title || '').localeCompare(b.profile?.job_title || ''),
  'department': (a, b) => (a.name || '').localeCompare(b.name || ''),
};

// Define filters
const filters = ref({
  firstName: '',
  lastName: '',
  department: '',
  job_title: '',
});

// Computed property for filtered and sorted users
const filteredUsers = computed(() => {
  // Filter users based on filters (currently empty)
  let users = allUsers.value.filter((user) =>
      (filters.value.firstName !== '' ? user.firstName.toLowerCase().includes(filters.value.firstName.toLowerCase()) : true)
      && (filters.value.lastName !== '' ? user.lastName.toLowerCase().includes(filters.value.lastName.toLowerCase()) : true)
      && (filters.value.department !== '' ? user?.department?.name.toLowerCase().includes(filters.value.department.toLowerCase()) : true)
      && (filters.value.job_title !== '' ? user?.profile?.job_title.toLowerCase().includes(filters.value.job_title.toLowerCase()) : true)
  );

  // Apply sorting if a valid sort key is selected
  if (currentSortKey.value && currentSortKey.value !== 'department' && sortByFunctions[currentSortKey.value] ) {
    users = users.slice().sort((a, b) => {
      const result = sortByFunctions[currentSortKey.value](a, b);
      return sortDirection.value ? result : -result;
    });
  }

  return users;
});

const filteredGroups = computed(() => {
  let groups = departmentsStore.departmentsData.map(department => {
    return {
      ...department,
      users: [
          ...filteredUsers.value.filter(user => user?.department.id === department.id)
      ],
    };
  });

  if (currentSortKey.value && currentSortKey.value === 'department' && sortByFunctions[currentSortKey.value]) {
    groups = groups.slice().sort((a, b) => {
      const result = sortByFunctions[currentSortKey.value](a, b);
      return sortDirection.value ? result : -result;
    });
  }

  return groups;
});

// Functions to handle edit and delete actions
function canEditGroup() {
  // Check if the current user has 'edit_user' permission
  // You can add additional logic if needed, such as checking departments
  return userStore.hasPermission('edit_user');
}

function canDeleteGroup() {
  return userStore.hasPermission('delete_user');
}


const editGroup = (groupId) => {
  selectedGroupId.value = groupId;
  modalType.value = 'edit';
  showModal.value = true;
};

const deleteGroup = (groupId) => {
  selectedGroupId.value = groupId;
  modalType.value = 'delete';
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedGroupId.value = null;
  modalType.value = '';
};

// Compute the component to render in the modal
const modalComponent = computed(() => {
  return modalType.value === 'edit' ? EditGroup : DeleteGroup;
});
</script>

<script>
</script>

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease-out;
}
.slide-left-enter-from {
  transform: translateX(-100%);
}
.slide-left-enter-to {
  transform: translateX(0);
}
.slide-left-leave-from {
  transform: translateX(0);
}
.slide-left-leave-to {
  transform: translateX(-100%);
}

/* Include any other existing styles */
</style>