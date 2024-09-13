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
                    class="py-3 ps-10 pe-4 block w-full border border-gray-100 rounded-lg text-sm focus:outline-gray-200"
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
                            <img :src="item.image" :alt="item.name"
                                class="rounded-full bg-gray-200 size-6 overflow-hidden me-2.5">
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
                <h2 class="text-lg font-bold mb-4">User Information</h2>
                <img :src="selectedUser.image" :alt="selectedUser.name" class="rounded-full bg-gray-200 w-24 h-24 mb-4">
                <p><strong>Name:</strong> {{ selectedUser.name }}</p>
                <p><strong>Category:</strong> {{ selectedUser.category }}</p>

                <!-- Next / Previous buttons -->
                <div v-if="hasMultipleUsers" class="mt-4 flex justify-between">
                    <button @click="previousUser" class="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                        :disabled="!hasPrevious">Previous</button>
                    <button @click="nextUser" class="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                        :disabled="!hasNext">Next</button>
                </div>
            </div>
        </div>
        <!-- End Modal -->
    </div>
</template>

<script>
export default {
    name: 'Search',
    data() {
        return {
            searchQuery: '',
            showModal: false,
            showDropdownVar: false,
            selectedUser: null,
            currentIndex: 0,
            items: [
                {
                    "name": "Ella Lauda",
                    "image": "https://images.unsplash.com/photo-1659482634023-2c4fda99ac0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2.5&w=320&h=320&q=80",
                    "category": "designer",
                    "url": "#"
                },
                {
                    "name": "David Harrison",
                    "image": "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2.5&w=320&h=320&q=80",
                    "category": "designer",
                    "url": "#"
                },
                {
                    "name": "James Collins",
                    "image": "https://images.unsplash.com/photo-1659482633369-9fe69af50bfb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2.5&w=320&h=320&q=80",
                    "category": "backend",
                    "url": "#"
                },
                {
                    "name": "Costa Quinn",
                    "image": "https://images.unsplash.com/photo-1601935111741-ae98b2b230b0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2.5&w=320&h=320&q=80",
                    "category": "backend",
                    "url": "#"
                },
                {
                    "name": "Lewis Clarke",
                    "image": "https://images.unsplash.com/photo-1679412330254-90cb240038c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2.5&w=320&h=320&q=80",
                    "category": "backend",
                    "url": "#"
                },
                {
                    "name": "Mia Maya",
                    "image": "https://images.unsplash.com/photo-1670272505340-d906d8d77d03?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2.5&w=320&h=320&q=80",
                    "category": "backend",
                    "url": "#"
                }
            ]
        };
    },
    computed: {
        showDropdown() {
            return this.showDropdownVar
        },
        filteredResults() {
            if (this.searchQuery === '') {
                return this.items;
            }
            return this.items.filter(item =>
                item.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                item.category.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        },
        groupedResults() {
            return this.filteredResults.reduce((acc, item) => {
                if (!acc[item.category]) {
                    acc[item.category] = [];
                }
                acc[item.category].push(item);
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
            if(dropdown && !dropdown.contains(event.target)) {
                this.closeDropdown();
            }
        },
        closeDropdown() {
            this.showDropdownVar = false;
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