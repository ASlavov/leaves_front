import { defineStore, setActivePinia, createPinia } from 'pinia';
import { ref } from 'vue';
import userApiComposable from '@/composables/userApiComposable';

const pinia = createPinia();
export default { store: setActivePinia(pinia) }
export const useUserStore = defineStore('userStore', () => {
    const userData = ref([]);
    const loading = ref(false);
    const error = ref(null);

    async function fetchUserCredentials(userId) {
        loading.value = true;
        const { load } = userApiComposable({
            "userId": userId
        });

        try {
            const result = await load();
            if (result.value) {
                console.log(result.value);
                userData.value = processApi(result);
            }
        } catch (err) {
            error.value = err;
            console.error('Error fetching response:', err);
        } finally {
            userData.value = processUserCredentials(result);
            loading.value = false;
        }
    }

    function processUserCredentials(result) {
        return {
            myValue: 'Test Val'
        }
    }

    function processApi(result) {
        return result;
    }

    return { userData, loading, error, fetchUserCredentials };
});