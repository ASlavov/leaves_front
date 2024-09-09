import { defineStore, setActivePinia, createPinia } from 'pinia';
import { ref } from 'vue';
import { authUserComposable } from '@/composables/userApiComposable';

const pinia = createPinia();
export default { store: setActivePinia(pinia) }
export const useUserStore = defineStore('userStore', () => {
    const userData = ref({});
    const loading = ref(false);
    const error = ref(null);

    async function authUser(userName, userPass) {
        // Set loading to true at the start of the function
        loading.value = true;

        try {
            // Call the composable with the necessary parameters
            const result = await authUserComposable({
                email: userName,
                password: userPass,
            });

            if (result && result.userId) {
                // Process the result and store it in userData
                userData.value = { ...userData.value, userId: result.userId };
            }
        } catch (err) {
            // Handle errors and set the error state
            error.value = err;
            console.error('Error fetching response:', err);
        } finally {
            // Ensure loading is set to false and any post-processing is done
            loading.value = false;
        }
    }


    return { userData, loading, error, authUser };
});