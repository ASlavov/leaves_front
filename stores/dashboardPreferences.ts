import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DashboardPreferences, DashboardSection } from '~/types';
import { DEFAULT_DASHBOARD_PREFERENCES } from '~/types';
import {
  getDashboardPreferencesComposable,
  updateDashboardPreferencesComposable,
} from '~/composables/userApiComposable';

export const useDashboardPreferencesStore = defineStore('dashboardPreferencesStore', () => {
  const { t } = useI18n();

  const preferences = ref<DashboardPreferences>(
    JSON.parse(JSON.stringify(DEFAULT_DASHBOARD_PREFERENCES)),
  );
  const previewPreferences = ref<DashboardPreferences | null>(null);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const setError = (msg: string | null) => {
    error.value = msg;
  };

  const reset = () => {
    preferences.value = JSON.parse(JSON.stringify(DEFAULT_DASHBOARD_PREFERENCES));
    previewPreferences.value = null;
    error.value = null;
    loading.value = false;
  };

  const activePreferences = computed<DashboardPreferences>(
    () => previewPreferences.value ?? preferences.value,
  );

  const orderedSections = computed<DashboardSection[]>(() => {
    return activePreferences.value.sectionOrder.filter(
      (section) => !activePreferences.value.hiddenSections.includes(section),
    );
  });

  const visibleLeaveTypes = (allTypes: any[]) => {
    // filter hidden
    const visible = allTypes.filter(
      (typeObj) => !activePreferences.value.hiddenLeaveTypes.includes(typeObj.leave_type_id),
    );
    // sort by preferred order
    visible.sort((a, b) => {
      const idxA = activePreferences.value.leaveTypeOrder.indexOf(a.leave_type_id);
      const idxB = activePreferences.value.leaveTypeOrder.indexOf(b.leave_type_id);

      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.leave_type_id - b.leave_type_id;
    });
    return visible;
  };

  const fetchPreferences = async () => {
    try {
      loading.value = true;
      setError(null);
      const res = await getDashboardPreferencesComposable();

      const merged = JSON.parse(JSON.stringify(DEFAULT_DASHBOARD_PREFERENCES));
      if (res && typeof res === 'object') {
        if (res.sectionOrder) merged.sectionOrder = res.sectionOrder;
        if (res.hiddenSections) merged.hiddenSections = res.hiddenSections;
        if (res.leaveTypeOrder) merged.leaveTypeOrder = res.leaveTypeOrder;
        if (res.hiddenLeaveTypes) merged.hiddenLeaveTypes = res.hiddenLeaveTypes;
      }
      preferences.value = merged;
    } catch (err: any) {
      console.error('Failed to fetch dashboard preferences', err);
      // Fails silently back to defaults
    } finally {
      loading.value = false;
    }
  };

  const savePreferences = async (prefs: DashboardPreferences) => {
    try {
      loading.value = true;
      setError(null);
      const res = await updateDashboardPreferencesComposable(prefs);

      const merged = JSON.parse(JSON.stringify(DEFAULT_DASHBOARD_PREFERENCES));
      if (res && typeof res === 'object') {
        if (res.sectionOrder) merged.sectionOrder = res.sectionOrder;
        if (res.hiddenSections) merged.hiddenSections = res.hiddenSections;
        if (res.leaveTypeOrder) merged.leaveTypeOrder = res.leaveTypeOrder;
        if (res.hiddenLeaveTypes) merged.hiddenLeaveTypes = res.hiddenLeaveTypes;
      }
      preferences.value = merged;
      previewPreferences.value = null; // Exit preview mode
    } catch (err: any) {
      console.error('Failed to save dashboard preferences', err);
      setError(t('dashboard.saveFailed'));
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const startPreview = (draft: DashboardPreferences) => {
    previewPreferences.value = JSON.parse(JSON.stringify(draft));
  };

  const cancelPreview = () => {
    previewPreferences.value = null;
  };

  return {
    preferences,
    previewPreferences,
    loading,
    error,
    activePreferences,
    orderedSections,
    visibleLeaveTypes,
    fetchPreferences,
    savePreferences,
    startPreview,
    cancelPreview,
    reset,
  };
});
