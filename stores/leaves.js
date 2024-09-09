import { defineStore, setActivePinia, createPinia } from 'pinia';
import { ref } from 'vue';
import { leavesComposable } from '@/composables/leavesApiComposable';

const pinia = createPinia();
export default { store: setActivePinia(pinia) }
export const useLeavesStore = defineStore('leavesStore', () => {
    const leavesData = ref([]);
    const loading = ref(false);
    const error = ref(null);


    async function getAll(userId) {

        try {
            // Call the composable with the necessary parameters
            const result = await leavesComposable(userId);

            if (result) {
                // Process the result and store it in userData
                leavesData.value.data = result;
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

    return { leavesData, loading, error, getAll };
});