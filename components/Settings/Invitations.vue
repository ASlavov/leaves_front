<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <h2 class="text-2xl font-bold dark:text-gray-100">{{ $t('invitations.title') }}</h2>
      <button
        type="button"
        class="inline-flex items-center gap-x-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 focus:outline-none transition-colors"
        @click="openSendModal"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
        </svg>
        {{ $t('invitations.sendNew') }}
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Sent Invitations -->
      <div class="bg-white rounded-lg shadow border dark:bg-neutral-800 dark:border-neutral-700">
        <div class="px-5 py-4 border-b dark:border-neutral-700">
          <h3 class="font-semibold text-gray-800 dark:text-gray-100">{{ $t('invitations.sent') }}</h3>
          <p class="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">{{ $t('invitations.sentDesc') }}</p>
        </div>
        <div class="divide-y dark:divide-neutral-700">
          <div v-if="!invitationsStore.sent.length" class="px-5 py-8 text-center text-sm text-gray-400 dark:text-neutral-500">
            {{ $t('invitations.noSent') }}
          </div>
          <div
            v-for="inv in invitationsStore.sent"
            :key="inv.id"
            class="flex items-center gap-3 px-5 py-3"
          >
            <SharedUserAvatar :user="inv.receiver" :size="36" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{{ inv.receiver?.name || inv.receiver?.email }}</p>
              <p class="text-xs text-gray-500 dark:text-neutral-400 truncate">{{ inv.receiver?.email }}</p>
            </div>
            <span :class="statusBadgeClass(inv.status)" class="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full">
              {{ $t('invitations.status.' + inv.status) }}
            </span>
            <button
              type="button"
              class="shrink-0 size-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors focus:outline-none"
              :aria-label="$t('invitations.revoke')"
              @click="confirmRevoke(inv)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Received Invitations -->
      <div class="bg-white rounded-lg shadow border dark:bg-neutral-800 dark:border-neutral-700">
        <div class="px-5 py-4 border-b dark:border-neutral-700">
          <h3 class="font-semibold text-gray-800 dark:text-gray-100">{{ $t('invitations.received') }}</h3>
          <p class="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">{{ $t('invitations.receivedDesc') }}</p>
        </div>
        <div class="divide-y dark:divide-neutral-700">
          <div v-if="!invitationsStore.received.length" class="px-5 py-8 text-center text-sm text-gray-400 dark:text-neutral-500">
            {{ $t('invitations.noReceived') }}
          </div>
          <div
            v-for="inv in invitationsStore.received"
            :key="inv.id"
            class="flex items-center gap-3 px-5 py-3"
          >
            <SharedUserAvatar :user="inv.sender" :size="36" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{{ inv.sender?.name || inv.sender?.email }}</p>
              <p class="text-xs text-gray-500 dark:text-neutral-400 truncate">{{ inv.sender?.email }}</p>
            </div>

            <template v-if="inv.status === 'pending'">
              <button
                type="button"
                class="shrink-0 text-xs font-medium px-2.5 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 transition-colors focus:outline-none"
                :disabled="respondingId === inv.id"
                @click="respond(inv, 'accepted')"
              >
                {{ $t('invitations.accept') }}
              </button>
              <button
                type="button"
                class="shrink-0 text-xs font-medium px-2.5 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors focus:outline-none"
                :disabled="respondingId === inv.id"
                @click="respond(inv, 'declined')"
              >
                {{ $t('invitations.decline') }}
              </button>
            </template>
            <span v-else :class="statusBadgeClass(inv.status)" class="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full">
              {{ $t('invitations.status.' + inv.status) }}
            </span>

            <button
              type="button"
              class="shrink-0 size-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors focus:outline-none"
              :aria-label="$t('invitations.revoke')"
              @click="confirmRevoke(inv)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Send Invitation Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="sendModalOpen"
          class="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center overflow-y-auto"
          @click.self="sendModalOpen = false"
        >
          <div class="sm:max-w-md w-full m-4 bg-white rounded-xl shadow-lg dark:bg-neutral-800 dark:text-gray-100">
            <div class="flex items-center justify-between px-5 py-4 border-b dark:border-neutral-700">
              <h3 class="font-bold text-gray-800 dark:text-white">{{ $t('invitations.sendNew') }}</h3>
              <button type="button" class="size-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-gray-600 dark:text-neutral-300 focus:outline-none" @click="sendModalOpen = false">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
              </button>
            </div>

            <div class="p-5 space-y-4">
              <p class="text-sm text-gray-600 dark:text-neutral-400">{{ $t('invitations.sendModalDesc') }}</p>

              <!-- Search -->
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
                <input
                  v-model="userSearch"
                  type="text"
                  :placeholder="$t('invitations.searchUsers')"
                  class="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-red-400 dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-100 dark:placeholder-neutral-400"
                />
              </div>

              <!-- User list -->
              <div class="max-h-60 overflow-y-auto space-y-1 border border-gray-100 rounded-lg dark:border-neutral-700 p-1">
                <div v-if="!selectableUsers.length" class="py-6 text-center text-sm text-gray-400 dark:text-neutral-500">
                  {{ $t('invitations.noUsersToInvite') }}
                </div>
                <label
                  v-for="user in selectableUsers"
                  :key="user.id"
                  class="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  <input
                    type="checkbox"
                    :value="user.id"
                    v-model="selectedUserIds"
                    class="rounded border-gray-300 text-red-600 focus:ring-red-500 dark:border-neutral-600 dark:bg-neutral-700"
                  />
                  <SharedUserAvatar :user="user" :size="32" />
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{{ user.name || user.email }}</p>
                    <p class="text-xs text-gray-500 dark:text-neutral-400 truncate">{{ user.email }}</p>
                  </div>
                </label>
              </div>

              <div class="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  class="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700 focus:outline-none"
                  @click="sendModalOpen = false"
                >
                  {{ $t('common.cancel') }}
                </button>
                <button
                  type="button"
                  class="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  :disabled="!selectedUserIds.length || sending"
                  @click="sendInvitations"
                >
                  {{ sending ? $t('common.sending') : $t('invitations.send') }}
                  <span v-if="selectedUserIds.length" class="ml-1 text-xs opacity-80">({{ selectedUserIds.length }})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Revoke Confirm Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="revokeTarget"
          class="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center"
          @click.self="revokeTarget = null"
        >
          <div class="sm:max-w-sm w-full m-4 bg-white rounded-xl shadow-lg dark:bg-neutral-800 dark:text-gray-100">
            <div class="px-5 pt-5 pb-3">
              <h3 class="font-bold text-gray-800 dark:text-white mb-2">{{ $t('invitations.revokeConfirmTitle') }}</h3>
              <p class="text-sm text-gray-600 dark:text-neutral-400">{{ $t('invitations.revokeConfirmDesc') }}</p>
            </div>
            <div class="flex justify-end gap-2 px-5 pb-5">
              <button type="button" class="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700 focus:outline-none" @click="revokeTarget = null">
                {{ $t('common.cancel') }}
              </button>
              <button type="button" class="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 focus:outline-none disabled:opacity-50 transition-colors" :disabled="revoking" @click="doRevoke">
                {{ $t('invitations.revoke') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCentralStore } from '@/stores/centralStore';

const { t } = useI18n();
const centralStore = useCentralStore();
const invitationsStore = centralStore.invitationsStore;
const userStore = centralStore.userStore;

const currentUserId = computed(() => userStore.userId);

// --- Send modal ---
const sendModalOpen = ref(false);
const userSearch = ref('');
const selectedUserIds = ref([]);
const sending = ref(false);

const alreadyInvitedIds = computed(() => {
  const ids = new Set();
  for (const inv of invitationsStore.sent) {
    if (inv.status === 'pending' || inv.status === 'accepted') {
      ids.add(String(inv.user_id_to));
    }
  }
  return ids;
});

const selectableUsers = computed(() => {
  const search = userSearch.value.trim().toLowerCase();
  return (userStore.allUsers || []).filter(u => {
    if (String(u.id) === String(currentUserId.value)) return false;
    if (alreadyInvitedIds.value.has(String(u.id))) return false;
    if (!search) return true;
    return (u.name || '').toLowerCase().includes(search) || (u.email || '').toLowerCase().includes(search);
  });
});

function openSendModal() {
  userSearch.value = '';
  selectedUserIds.value = [];
  sendModalOpen.value = true;
}

async function sendInvitations() {
  if (!selectedUserIds.value.length) return;
  sending.value = true;
  try {
    await invitationsStore.sendInvitation(currentUserId.value, selectedUserIds.value);
    useNuxtApp().$toast.success(t('invitations.sendSuccess'), { position: 'bottom-right', autoClose: 4000 });
    sendModalOpen.value = false;
  } catch {
    useNuxtApp().$toast.error(t('invitations.sendError'), { position: 'bottom-right', autoClose: 4000 });
  } finally {
    sending.value = false;
  }
}

// --- Respond to received invitation ---
const respondingId = ref(null);

async function respond(inv, status) {
  respondingId.value = inv.id;
  try {
    await invitationsStore.respondToInvitation(inv.id, currentUserId.value, status);
    useNuxtApp().$toast.success(
      status === 'accepted' ? t('invitations.acceptSuccess') : t('invitations.declineSuccess'),
      { position: 'bottom-right', autoClose: 4000 },
    );
  } catch {
    useNuxtApp().$toast.error(t('invitations.respondError'), { position: 'bottom-right', autoClose: 4000 });
  } finally {
    respondingId.value = null;
  }
}

// --- Revoke ---
const revokeTarget = ref(null);
const revoking = ref(false);

function confirmRevoke(inv) {
  revokeTarget.value = inv;
}

async function doRevoke() {
  if (!revokeTarget.value) return;
  revoking.value = true;
  try {
    await invitationsStore.revokeInvitation(revokeTarget.value.id);
    useNuxtApp().$toast.success(t('invitations.revokeSuccess'), { position: 'bottom-right', autoClose: 4000 });
    revokeTarget.value = null;
  } catch {
    useNuxtApp().$toast.error(t('invitations.revokeError'), { position: 'bottom-right', autoClose: 4000 });
  } finally {
    revoking.value = false;
  }
}

// --- Helpers ---
function statusBadgeClass(status) {
  if (status === 'accepted') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  if (status === 'declined') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
