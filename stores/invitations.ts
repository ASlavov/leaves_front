import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Invitation } from '~/types';
import {
    getInvitationsComposable,
    createInvitationComposable,
    updateInvitationStatusComposable,
    deleteInvitationComposable,
} from '@/composables/invitationsApiComposable';

export const useInvitationsStore = defineStore('invitationsStore', () => {
    const sent = ref<Invitation[]>([]);
    const received = ref<Invitation[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const { t } = useI18n();

    const setError = (msg: string | null) => { error.value = msg; };

    function reset() {
        sent.value = [];
        received.value = [];
        error.value = null;
    }

    async function fetchInvitations() {
        loading.value = true;
        try {
            const data = await getInvitationsComposable();
            sent.value = data.sent;
            received.value = data.received;
        } catch (err: any) {
            setError(t('errors.invitations.fetchFailed'));
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function sendInvitation(userIdFrom: number | string, userIdsTo: (number | string)[]) {
        try {
            const res = await createInvitationComposable(userIdFrom, userIdsTo);
            for (const inv of res.invitations) {
                if (!sent.value.find(s => String(s.id) === String(inv.id))) {
                    sent.value.unshift(inv);
                }
            }
            return res;
        } catch (err: any) {
            setError(t('errors.invitations.sendFailed'));
            throw err;
        }
    }

    async function respondToInvitation(id: number | string, userId: number | string, status: 'accepted' | 'declined') {
        try {
            const res = await updateInvitationStatusComposable(id, userId, status);
            const idx = received.value.findIndex(r => String(r.id) === String(id));
            if (idx !== -1) received.value[idx] = { ...received.value[idx], status };
            return res;
        } catch (err: any) {
            setError(t('errors.invitations.respondFailed'));
            throw err;
        }
    }

    async function revokeInvitation(id: number | string) {
        try {
            await deleteInvitationComposable(id);
            sent.value = sent.value.filter(s => String(s.id) !== String(id));
            received.value = received.value.filter(r => String(r.id) !== String(id));
        } catch (err: any) {
            setError(t('errors.invitations.revokeFailed'));
            throw err;
        }
    }

    return {
        sent,
        received,
        loading,
        error,
        reset,
        fetchInvitations,
        sendInvitation,
        respondToInvitation,
        revokeInvitation,
    };
});
