import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getAllDepartmentsComposable, newDepartmentComposable, editDepartmentComposable } from '@/composables/departmentsApiComposable';

export const useDepartmentsStore = defineStore('departmentsStore', () => {
    const departmentsData = ref([]);
    const loading = ref(false);
    const error = ref(null);

    const setError = (errorMessage) => {
        // Reset error to force reactivity
        error.value = null;
        setTimeout(() => {
            error.value = errorMessage; // Set the actual error message
        });
    };
    async function init() {
        try {
            if (!departmentsData.value.length) {
                await getAll();
            }
        } catch (err) {
            setError('Δεν μπορέσαμε να αρηκοποιήσουμε τα γκρουπς');
        }
    }

    async function getAll() {
        try {
            // Call the composable with the necessary parameters
            const result = await getAllDepartmentsComposable();

            if (result) {
                // Process the result and store it in departmentsData
                departmentsData.value = result;
            }
        } catch (err) {
            // Handle errors and set the error state
            setError('Δεν μπορέσαμε να φέρουμε τα γκρουπς');
        } finally {
            // Ensure loading is set to false and any post-processing is done
            loading.value = false;
        }
    }

    async function newDepartment(name, related_departments) {
        try {
            // Call the composable with the necessary parameters
            const result = await newDepartmentComposable(name, related_departments);

            if (result) {
                // Recall getAll to refresh the store data.
                await this.getAll();
            }
        } catch (err) {
            // Handle errors and set the error state
            setError('Δεν μπορέσαμε να δημιουργήσουμε νέο γκρουπ');
        } finally {
            // Ensure loading is set to false and any post-processing is done
            loading.value = false;
        }
    }

    async function editDepartment(name, department_id, related_departments) {
        try {
            // Call the composable with the necessary parameters
            const result = await editDepartmentComposable(name, department_id, related_departments);

            if (result) {
                // Recall getAll to refresh the store data.
                await this.getAll();
            }
        } catch (err) {
            // Handle errors and set the error state
            setError('Δεν μπορέσαμε να επεξεργαστούμε το γκρουπ που ζητήσατε');
        } finally {
            // Ensure loading is set to false and any post-processing is done
            loading.value = false;
        }
    }

    async function deleteDepartment(department_id) {
        try {
            // Call the composable with the necessary parameters
            const result = await deleteDepartmentComposable(department_id);

            if (result) {
                // Recall getAll to refresh the store data.
                await this.getAll();
            }
        } catch (err) {
            // Handle errors and set the error state
            setError('Δεν μπορέσαμε να σβήσουμε το γκρουπ που ζητήσατε');
        } finally {
            // Ensure loading is set to false and any post-processing is done
            loading.value = false;
        }
    }

    return { departmentsData, loading, error, getAll, init };
});