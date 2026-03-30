import { defineStore, setActivePinia, createPinia } from 'pinia';
import { ref } from 'vue';
import {
    addEntitledDaysForUserComposable,
    getEntitledDaysForUserComposable,
    deleteEntitledDaysForUserComposable,
    updateEntitledDaysForUserComposable,
    addEntitledDaysForMultipleUsersComposable,
    addEntitledRemoteDaysForMultipleUsersComposable,
    massDeleteEntitlementsComposable,
} from '@/composables/entitlementApiComposable';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/stores/user';
import type { Entitlement } from '~/types';

export const useEntitlementStore = defineStore('entitlementStore', () => {
    const entitledDaysData = ref<{ savedUsers: Record<string | number, Record<string | number, Entitlement[]>> }>({
        savedUsers: {},
    });
    const loading = ref(false);
    const error = ref<string | null>(null);
    const userStore = useUserStore();
    const { t } = useI18n();
    const isDataLoaded = ref(false);

    function reset() {
        entitledDaysData.value = {
            savedUsers: {},
        };
    }

    const setError = (errorMessage: string | null) => {
        error.value = errorMessage;
    };

    async function init() {
        isDataLoaded.value = false;
        try {
            //Nothing to init

            /*await Promise.all([
            ]).then(() => {
                isDataLoaded.value = true;
            });*/
            isDataLoaded.value = true;
        } catch (err) {
            setError(t('errors.entitlement.initFailed'));
        }
    }
    async function getEntitledDaysForUser(userId: string | number, forceRefresh = false): Promise<Record<number | string, Entitlement[]> | undefined> {
        // Check if data for this user is already cached
        if (!forceRefresh && entitledDaysData.value.savedUsers[userId]) {
            return entitledDaysData.value.savedUsers[userId];
        }

        try {
            loading.value = true;

            // Call the composable to fetch all entitlements for the user
            const result = await getEntitledDaysForUserComposable(userId);

            // Create an object to store entitlements, grouped by year
            const formattedResult: Record<number | string, Entitlement[]> = {};

            result.forEach((entitlement: Entitlement) => {
                // Get the year from the start_from date
                const year = new Date(entitlement.start_from).getFullYear();

                // Ensure the array for this year exists
                formattedResult[year] ??= [];

                // Push the entitlement into the correct year's array
                formattedResult[year].push(entitlement);
            });

            // Cache the grouped result
            entitledDaysData.value.savedUsers[userId] = formattedResult;

            return formattedResult;

        } catch (err) {
            // Handle errors and set the error state
            setError(t('errors.entitlement.fetchFailed'));
        } finally {
            loading.value = false;
        }
    }
    /*
        async function addEntitledDaysForUser(
            userId,
            leaveTypeId,
            entitledDays,
            startDate,
            endDate
        ) {
            try {
                loading.value = true;
                // Call the composable with the necessary parameters
                const year = new Date(startDate).getFullYear();
                const result = await addEntitledDaysForUserComposable({
                    ...arguments,
                    year,
                });
    
                if (result && result.entitlement) {
                    await getEntitledDaysForUser(userId, true);
                }
            } catch (err) {
                // Handle errors and set the error state
                setError(t('errors.entitlement.createFailed'));
            } finally {
                // Ensure loading is set to false and any post-processing is done
                loading.value = false;
            }
        }*/

    async function addEntitledDays(
        userIds: (string | number)[],
        leaveTypeId: string | number,
        entitledDays: number,
        startDate: string,
        endDate: string,
        rolloverPrevious = false,
        rolloverUntil = ''
    ) {
        try {
            loading.value = true;

            const year = new Date(startDate).getFullYear();
            if (leaveTypeId === 5) {
                await addEntitledRemoteDaysForMultipleUsersComposable({
                    userIds,
                    leaveTypeId,
                    entitledDays,
                    year,
                    startDate,
                    endDate,
                });
            } else {
                if (userIds.length > 1) {
                    await addEntitledDaysForMultipleUsersComposable({
                        userIds,
                        leaveTypeId,
                        entitledDays,
                        year,
                        startDate,
                        endDate,
                        rolloverPrevious,
                        rolloverUntil: rolloverUntil || undefined,
                    });
                } else {
                    const userId = userIds[0];
                    await addEntitledDaysForUserComposable({
                        userId,
                        leaveTypeId,
                        entitledDays,
                        year,
                        startDate,
                        endDate,
                        rolloverPrevious,
                        rolloverUntil: rolloverUntil || undefined,
                    });
                }
            }
            // After successful creation, clear the cache for all affected users
            // and refetch their data to ensure UI consistency.

            for (const id of userIds) {
                if (entitledDaysData.value.savedUsers[id]) {
                    await getEntitledDaysForUser(id, true);
                }
            }

        } catch (err) {
            setError(t('errors.entitlement.createFailed'));
            throw err; // Re-throw the error to be handled by the component
        } finally {
            loading.value = false;
        }
    }

    async function massAddRemoteDaysForUsers(
        userIds: (string | number)[], // <-- Accepts an array of user IDs
        leaveTypeId: string | number,
        entitledDays: number,
        startDate: string,
        endDate: string
    ) {
        try {
            loading.value = true;

            const year = new Date(startDate).getFullYear();

            // Call the bulk endpoint for multiple users
            if (leaveTypeId === 5) {
                await addEntitledRemoteDaysForMultipleUsersComposable({
                    userIds,
                    leaveTypeId,
                    entitledDays,
                    year,
                    startDate,
                    endDate
                });
            } else {
                // Should never be the case?!
                throw new Error(t('errors.common.somethingWentWrong'));
            }

            // After successful creation, clear the cache for all affected users
            // and refetch their data to ensure UI consistency.

            for (const id of userIds) {
                if (entitledDaysData.value.savedUsers[id]) {
                    await getEntitledDaysForUser(id, true);
                }
            }

        } catch (err) {
            setError(t('errors.entitlement.createFailed'));
            throw err; // Re-throw the error to be handled by the component
        } finally {
            loading.value = false;
        }
    }

    async function updateEntitledDaysForUser(
        entitlementId: string | number,
        userId: string | number,
        leaveTypeId: string | number,
        entitledDays: number,
        startDate: string,
        endDate: string
    ) {
        try {
            loading.value = true;
            const year = new Date(startDate).getFullYear();
            const result = await updateEntitledDaysForUserComposable({
                entitlementId,
                userId,
                leaveTypeId,
                entitledDays,
                startDate,
                endDate,
                year,
            });

            if (result && result.entitlement) {
                await getEntitledDaysForUser(userId, true);
            }
        } catch (err) {
            setError(t('errors.entitlement.updateFailed'));
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function deleteEntitledDaysForUser(userId: string | number, entitlementId: string | number) {
        try {
            loading.value = true;
            const result = await deleteEntitledDaysForUserComposable(entitlementId);

            if (result) {
                await getEntitledDaysForUser(userId, true);
            }
        } catch (err) {
            setError(t('errors.entitlement.deleteFailed'));
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function massDeleteEntitlements(
        leaveTypeId: string | number,
        year: number,
        userIds: (string | number)[] = [],
        dryRun = true,
        force = false
    ) {
        loading.value = true;
        try {
            return await massDeleteEntitlementsComposable({ leaveTypeId, year, userIds, dryRun, force });
        } catch (err) {
            setError(t('errors.entitlement.massDeleteFailed'));
            throw err;
        } finally {
            loading.value = false;
        }
    }

    return {
        entitledDaysData,
        loading,
        error,

        init,
        reset,
        addEntitledDays,
        deleteEntitledDaysForUser,
        getEntitledDaysForUser,
        updateEntitledDaysForUser,
        massDeleteEntitlements,
    };
});