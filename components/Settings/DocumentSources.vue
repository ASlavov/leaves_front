<template>
  <div class="px-4 py-8 sm:px-10 dark:text-gray-100">
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold text-gray-800 dark:text-white">
          {{ $t('settings.documentSources') }}
        </h3>
      </div>

      <div class="grid gap-4 w-full md:w-1/2">
        <div
          class="flex items-center justify-between bg-white dark:bg-neutral-800 p-4 border border-gray-200 dark:border-neutral-700 rounded-lg"
        >
          <div>
            <div class="font-medium">Google Doc</div>
            <div class="text-sm text-gray-500">{{ $t('settings.googleDocNote') }}</div>
          </div>
          <SharedToggle v-model="sources.doc_source_google" @update:model-value="saveSettings" />
        </div>

        <div
          class="flex items-center justify-between bg-white dark:bg-neutral-800 p-4 border border-gray-200 dark:border-neutral-700 rounded-lg"
        >
          <div>
            <div class="font-medium">SharePoint</div>
            <div class="text-sm text-gray-500">{{ $t('settings.sharepointNote') }}</div>
          </div>
          <SharedToggle
            v-model="sources.doc_source_sharepoint"
            @update:model-value="saveSettings"
          />
        </div>

        <div
          class="flex items-center justify-between bg-white dark:bg-neutral-800 p-4 border border-gray-200 dark:border-neutral-700 rounded-lg"
        >
          <div>
            <div class="font-medium">File Upload</div>
            <div class="text-sm text-gray-500">{{ $t('settings.fileUploadNote') }}</div>
          </div>
          <SharedToggle v-model="sources.doc_source_file" @update:model-value="saveSettings" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useCentralStore } from '~/stores/centralStore';

const centralStore = useCentralStore();
const settingsStore = centralStore.settingsStore;

const sources = ref({
  doc_source_google: true,
  doc_source_sharepoint: true,
  doc_source_file: true,
});

// Sync from store to local ref
watch(
  () => settingsStore.documentSources,
  (newSources) => {
    if (newSources) {
      sources.value = { ...newSources };
    }
  },
  { immediate: true, deep: true },
);

const saveSettings = async () => {
  await settingsStore.updateDocumentSources(sources.value);
};
</script>
