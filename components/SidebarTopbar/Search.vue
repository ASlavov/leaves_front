<template>
    <div class="relative w-full max-w-[600px] ms-auto">
        <!-- SearchBox -->
        <div class="relative">
            <div class="relative">
                <div class="absolute inset-y-0 start-0 flex items-center pointer-events-none z-20 ps-3.5">
                    <svg class="shrink-0 size-4 text-gray-400 dark:text-white/60" xmlns="http://www.w3.org/2000/svg"
                        width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.3-4.3"></path>
                    </svg>
                </div>
                <input
                    class="py-3 ps-10 pe-4 block w-full border border-gray-100 rounded-lg text-sm focus:outline-gray-200
dark:bg-neutral-800 dark:color-gray-100"
                    type="text" role="combobox" aria-expanded="true" placeholder="Αναζήτηση χρήστη..."
                    v-model="searchQuery" @focus="showDropdownVar = true" @input="filterResults">
            </div>

            <!-- SearchBox Dropdown -->
            <div class="absolute z-50 w-full bg-white border border-gray-200 mt-2" v-show="showDropdown">
                <div class="max-h-72 rounded-b-lg overflow-hidden overflow-y-auto">
                    <div v-for="(items, category) in groupedResults" :key="category">
                        <!-- Category heading -->
                        <div
                            class="px-4 py-2 bg-gray-100 text-gray-800 dark:bg-neutral-700 dark:text-neutral-200 font-semibold">
                            {{ category }}
                        </div>
                        <!-- Loop through items in the category -->
                        <div v-for="item in items" :key="item.id"
                            class="flex items-center cursor-pointer py-2 px-4 w-full text-sm text-gray-800 hover:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200"
                            @click="openModal(item)">
                            <div>{{ item.name }}</div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- End SearchBox Dropdown -->
        </div>

        <!-- Modal -->
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            @click.self="closeModal">
            <div class="bg-white p-6 rounded-lg w-full max-w-md relative">
                <button @click="closeModal"
                    class="absolute top-2 right-2 text-gray-500 hover:text-gray-700">&times;</button>
                <h2 class="text-lg font-bold mb-4">Πληροφορίες χρήστη</h2>

                <!-- User Profile Image -->
                <!-- <img :src="selectedUser.profile_image || 'default-profile-image.jpg'" :alt="selectedUser?.name"
                    class="rounded-full bg-gray-200 w-24 h-24 mb-4"> -->

                <!-- User Info -->
                <div class="pt-4 space-y-2">
                    <div><span class="font-bold">Όνομα: </span><span class="text-gray-500">{{ selectedUser.name.split(' ')[0] }}</span></div>
                    <div><span class="font-bold">Επώνυμο: </span><span class="text-gray-500">{{
                        selectedUser.name.split(' ').slice(1).join(' ') }}</span></div>
                    <div><span class="font-bold">Τίτλος: </span><span class="text-gray-500">{{
                        selectedUser?.profile?.job_title
                            }}</span></div>
                    <div><span class="font-bold">Email: </span><span class="text-gray-500">{{ selectedUser?.email
                            }}</span></div>
                    <div><span class="font-bold">Κινητό: </span><span class="text-gray-500">{{
                        selectedUser.profile?.phone
                            }}</span></div>
                    <div><span class="font-bold">Εσωτ. Τηλέφωνο: </span><span class="text-gray-500">{{
                        selectedUser?.profile?.internal_phone }}</span></div>
                    <div><span class="font-bold">Γκρουπ: </span><span class="text-gray-500">{{
                        selectedUser.department.name }}</span></div>
                </div>


                <!-- Next / Previous buttons -->
                <div v-if="hasMultipleUsers" class="mt-4 flex justify-between">
                    <button @click="previousUser" class="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                        :disabled="!hasPrevious">
                        &#8592; <!-- Unicode for Left Arrow -->
                    </button>
                    <button @click="nextUser" class="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                        :disabled="!hasNext">
                        &#8594; <!-- Unicode for Right Arrow -->
                    </button>
                </div>

            </div>
        </div>

        <!-- End Modal -->
    </div>
</template>

<script>
import { computed, ref, watch } from 'vue';
import { useCentralStore } from '@/stores/centralStore';

export default {
    name: 'Search',
    data() {
        return {
            searchQuery: '',
            showModal: false,
            showDropdownVar: false,
            selectedUser: null,
            currentIndex: 0,
            items: []  // This will be populated with allUsers
        };
    },
    setup() {
        const centralStore = useCentralStore();
        const userStore = centralStore.userStore;

        // Use computed to get all users
        const allUsers = computed(() => userStore.allUsers || []);

        return { allUsers };
    },
    computed: {
        showDropdown() {
            return this.showDropdownVar;
        },
        filteredResults() {
            if (this.searchQuery === '') {
                return this.items;
            }
            return this.items.filter(item =>
                item.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                item.department.name.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        },
        groupedResults() {
            return this.filteredResults.reduce((acc, item) => {
                const departmentName = item.department.name || 'Unknown'; // Use 'Unknown' if department name is missing
                if (!acc[departmentName]) {
                    acc[departmentName] = [];
                }
                acc[departmentName].push(item);
                return acc;
            }, {});
        },
        hasMultipleUsers() {
            return this.filteredResults.length > 1;
        },
        hasNext() {
            return this.currentIndex < this.filteredResults.length - 1;
        },
        hasPrevious() {
            return this.currentIndex > 0;
        }
    },
    methods: {
        openModal(user) {
            this.selectedUser = user;
            this.currentIndex = this.filteredResults.findIndex(item => item.id === user.id);
            this.showModal = true;
        },
        closeModal() {
            this.showModal = false;
        },
        nextUser() {
            if (this.hasNext) {
                this.currentIndex++;
                this.selectedUser = this.filteredResults[this.currentIndex];
            }
        },
        previousUser() {
            if (this.hasPrevious) {
                this.currentIndex--;
                this.selectedUser = this.filteredResults[this.currentIndex];
            }
        },
        handleClickOutside(event) {
            const modal = this.$el.querySelector('.fixed');
            const dropdown = this.$el.querySelector('.absolute.z-50');
            if (modal && !modal.contains(event.target)) {
                this.closeModal();
            }
            if (dropdown && !dropdown.contains(event.target)) {
                this.closeDropdown();
            }
        },
        closeDropdown() {
            this.showDropdownVar = false;
        }
    },
    watch: {
        allUsers(newVal) {
            this.items = newVal; // Sync items with allUsers
        }
    },
    mounted() {
        document.addEventListener('mousedown', this.handleClickOutside);
    },
    beforeUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }
};
</script>

<style>
/* Add any custom modal styles if necessary */
</style>
