<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="drawer-fade">
      <div v-if="open" class="lg:hidden fixed inset-0 z-[69] bg-black/50" @click="open = false" />
    </Transition>
    <!-- Drawer panel -->
    <Transition name="drawer-slide">
      <div
        v-if="open"
        class="lg:hidden fixed inset-y-0 right-0 z-[70] w-[85vw] max-w-[360px] bg-white dark:bg-neutral-900 shadow-xl flex flex-col"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-neutral-700"
        >
          <span class="font-bold text-base dark:text-white">{{ t('settings.filters') }}</span>
          <button
            class="text-gray-400 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-white"
            @click="open = false"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <!-- Scrollable body -->
        <div class="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
          <!-- Filters section -->
          <div>
            <div
              class="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 mb-3"
            >
              {{ t('settings.filters') }}
            </div>
            <div class="flex flex-col gap-3">
              <div
                v-for="field in filterFields"
                :key="field.key"
                class="inline-flex w-full group border border-gray-200 rounded-lg transition-all focus-within:border-gray-400 hover:border-gray-400 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500"
              >
                <input
                  :value="localFilters[field.key]"
                  :class="`py-3 px-4 text-[16px] w-full bg-transparent border-none outline-0 ${localFilters[field.key] ? '' : 'rounded-r-lg'} rounded-l-lg text-sm focus:outline-none dark:bg-neutral-900 dark:text-neutral-400`"
                  type="text"
                  :placeholder="field.placeholder"
                  @input="localFilters[field.key] = ($event.target as HTMLInputElement).value"
                />
                <button
                  v-if="localFilters[field.key]"
                  class="px-3 py-3 text-[13px] bg-white border-l border-gray-200 rounded-r-lg text-red-500 hover:bg-gray-100 transition-all dark:hover:bg-neutral-700 focus:outline-none dark:bg-neutral-900 dark:border-neutral-700"
                  @click="localFilters[field.key] = ''"
                >
                  &times;
                </button>
              </div>
              <button
                v-if="activeFilterCount > 0"
                class="text-red-500 text-sm self-start"
                @click="clearAll"
              >
                &times; {{ t('settings.clearFilters') }}
              </button>
            </div>
          </div>
          <!-- Sort section -->
          <div>
            <div
              class="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 mb-3"
            >
              {{ t('settings.sortBy') }}
            </div>
            <div
              class="border border-gray-200 dark:border-neutral-700 rounded-lg overflow-hidden divide-y divide-gray-100 dark:divide-neutral-700"
            >
              <button
                v-for="field in sortFields"
                :key="field.key"
                class="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                :class="
                  sortKey === field.key ? 'text-red-600 dark:text-red-400' : 'dark:text-white'
                "
                @click="$emit('sort', field.key)"
              >
                <span>{{ field.label }}</span>
                <svg
                  v-if="sortKey === field.key"
                  class="w-4 h-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    :d="sortAsc ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
    <!-- Floating action button -->
    <button
      class="lg:hidden fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full bg-red-600 text-white shadow-lg flex items-center justify-center hover:bg-red-700 active:bg-red-800 transition-colors"
      @click="open = true"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
        />
      </svg>
      <span
        v-if="activeFilterCount > 0"
        class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-red-600 text-xs font-bold flex items-center justify-center leading-none"
        >{{ activeFilterCount }}</span
      >
    </button>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

interface FilterField {
  key: string;
  placeholder: string;
}

interface SortField {
  key: string;
  label: string;
}

const props = defineProps<{
  modelValue: Record<string, string>;
  filterFields: FilterField[];
  sortFields: SortField[];
  sortKey: string;
  sortAsc: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: Record<string, string>): void;
  (e: 'sort', key: string): void;
}>();

const { t } = useI18n();

const open = ref(false);

const localFilters = reactive<Record<string, string>>({ ...props.modelValue });

watch(
  () => props.modelValue,
  (val) => Object.assign(localFilters, val),
  { deep: true },
);

watch(localFilters, (val) => emit('update:modelValue', { ...val }), { deep: true });

const activeFilterCount = computed(() => Object.values(localFilters).filter(Boolean).length);

const clearAll = () => {
  Object.keys(localFilters).forEach((k) => (localFilters[k] = ''));
};
</script>

<style scoped>
.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.3s ease-out;
}
.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}
</style>
