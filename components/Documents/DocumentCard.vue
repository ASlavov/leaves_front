<template>
  <div
    class="flex flex-col bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-sm p-4 hover:shadow-md transition"
  >
    <div class="flex justify-between items-start mb-2">
      <!-- Icon + Title -->
      <div class="flex items-center gap-3">
        <div
          class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-neutral-700 text-xl"
        >
          <span v-if="document.source_type === 'google_doc'" class="text-blue-500">📄</span>
          <span v-else-if="document.source_type === 'sharepoint'" class="text-teal-600">🌐</span>
          <span v-else class="text-orange-500">📎</span>
        </div>
        <div>
          <h4
            class="font-semibold text-gray-900 dark:text-gray-100 break-words line-clamp-1"
            :title="document.title"
          >
            {{ document.title }}
          </h4>
          <p
            v-if="document.source_type === 'file' && document.file_size"
            class="text-xs text-gray-500"
          >
            {{ formatBytes(document.file_size) }}
          </p>
        </div>
      </div>
      <!-- Actions -->
      <div v-if="canModify" class="flex gap-2">
        <button
          class="text-gray-400 hover:text-blue-500 p-1"
          :title="$t('documents.edit')"
          @click="$emit('edit', document)"
        >
          ✏️
        </button>
        <button
          class="text-gray-400 hover:text-red-500 p-1"
          :title="$t('documents.deleteConfirm')"
          @click="confirmDelete"
        >
          🗑️
        </button>
      </div>
    </div>

    <div class="flex-grow flex flex-col gap-2">
      <!-- Target badge -->
      <div
        class="inline-flex max-w-max items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border"
        :class="
          document.target_type === 'all'
            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
            : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800'
        "
      >
        <span v-if="document.target_type === 'all'">🌐 {{ $t('documents.targetAll') }}</span>
        <span v-else class="flex items-center gap-1">
          👤 {{ document.target_user?.name || $t('documents.targetUser') }}
        </span>
      </div>

      <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 min-h-[2.5rem]">
        {{ document.description || '' }}
      </p>
    </div>

    <div
      class="mt-4 pt-3 border-t border-gray-100 dark:border-neutral-700 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400"
    >
      <div class="flex items-center gap-1">
        <span>{{ $t('documents.uploadedBy') }}</span>
        <span class="font-medium text-gray-700 dark:text-gray-300">{{
          document.uploader?.name || 'Unknown'
        }}</span>
      </div>
      <span>{{ new Date(document.created_at).toLocaleDateString() }}</span>
    </div>

    <div class="mt-3">
      <button
        v-if="document.source_type === 'file'"
        class="w-full py-2 bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-600 text-gray-800 dark:text-gray-200 rounded text-sm font-medium transition"
        @click="handleAction"
      >
        {{ $t('documents.download') }}
      </button>
      <button
        v-else
        class="w-full py-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded text-sm font-medium transition"
        @click="handleAction"
      >
        {{ $t('documents.open') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { CompanyDocument } from '~/types';
import { getDocumentDownloadUrl } from '~/composables/documentsApiComposable';
import { useCentralStore } from '~/stores/centralStore';

const props = defineProps({
  document: { type: Object as () => CompanyDocument, required: true },
});

const emit = defineEmits(['edit', 'delete']);

const { t } = useI18n();
const centralStore = useCentralStore();

const canModify = computed(() => centralStore.permissionsStore.can('company_documents', 'modify'));

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const handleAction = () => {
  if (props.document.source_type === 'file') {
    window.location.href = getDocumentDownloadUrl(props.document.id);
  } else if (props.document.url) {
    window.open(props.document.url, '_blank', 'noopener,noreferrer');
  }
};

const confirmDelete = () => {
  if (confirm(t('documents.deleteConfirm'))) {
    emit('delete', props.document.id);
  }
};
</script>
