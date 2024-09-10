import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as console from "node:console";

export const useUserStore = defineStore('userStore', () => {
    const userId = ref(null);
    const loading = ref(false);
    const profile = ref({});  // You can add more user-related data here

    // Function to set the userId
    function setUserId(id) {
        userId.value = id;
    }

    // Optionally, load user profile data based on userId
    async function loadUserProfile() {
        if (userId.value) {
            try {
                const result = await $fetch(`/api/user/${userId.value}`);
                profile.value = result;
            } catch (err) {
                console.error('Error fetching user profile:', err);
            }
        }
    }


    return { userId, profile, setUserId, loading, loadUserProfile };
});
