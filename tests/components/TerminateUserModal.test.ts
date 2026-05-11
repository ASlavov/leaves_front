import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import TerminateUserModal from '@/components/Settings/TerminateUserModal.vue';
import { createTestingPinia } from '@pinia/testing';
import { useAdminStore } from '@/stores/admin';

// Capture the flatpickr onChange callback so we can trigger it in tests.
// FlatpickrInput uses flatpickr's own event system (not DOM events), so
// setValue() on the raw input doesn't propagate through v-model.
let fpOnChange: ((dates: Date[]) => void) | undefined;

vi.mock('flatpickr', () => ({
  default: vi.fn().mockImplementation((_el: any, opts: any) => {
    fpOnChange = opts.onChange;
    return { destroy: vi.fn(), setDate: vi.fn() };
  }),
}));
vi.mock('flatpickr/dist/flatpickr.min.css', () => ({}));

const setDate = async (dateStr: string) => {
  fpOnChange?.([new Date(dateStr)]);
  await nextTick();
};

const mockPreviewData = {
  user_name: 'Jane Doe',
  termination_date: '2026-08-31',
  worked_days_in_year: 120,
  prorated_entitlements: [
    { leave_type_name: 'Annual Leave', new_total_days: 8, consumed_days: 5 },
  ],
  upcoming_leaves_to_cancel: 2,
};

describe('TerminateUserModal.vue', () => {
  let pinia: any;

  beforeEach(() => {
    fpOnChange = undefined;
    pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: { adminStore: { loading: false, error: null } },
    });
  });

  const mountModal = (userId: number | string = 7, modelValue = true) =>
    mount(TerminateUserModal, {
      props: { modelValue, userId },
      global: { plugins: [pinia], stubs: { Teleport: true } },
    });

  it('shows step 1 with date input on initial render', () => {
    const wrapper = mountModal();
    expect(wrapper.find('input:not([type=checkbox])').exists()).toBe(true);
  });

  it('Preview Impact button is disabled when terminationDate is empty', () => {
    const wrapper = mountModal();
    expect(wrapper.find('button[disabled]').exists()).toBe(true);
  });

  it('Preview Impact button is enabled after entering a date', async () => {
    const wrapper = mountModal();
    await setDate('2026-08-31');
    const previewBtn = wrapper.findAll('button').find((b) => b.text().includes('settings.previewImpact'));
    expect(previewBtn).toBeDefined();
    expect(previewBtn!.attributes('disabled')).toBeUndefined();
  });

  it('calls previewTermination with userId and terminationDate on button click', async () => {
    const adminStore = useAdminStore(pinia);
    (adminStore.previewTermination as any).mockResolvedValue(mockPreviewData);
    const wrapper = mountModal(7);
    await setDate('2026-08-31');
    const previewBtn = wrapper.findAll('button').find((b) => b.text().includes('settings.previewImpact'));
    await previewBtn!.trigger('click');
    expect(adminStore.previewTermination).toHaveBeenCalledWith(7, '2026-08-31');
  });

  const advanceToStep2 = async (adminStore: any, userId: number | string = 7) => {
    (adminStore.previewTermination as any).mockResolvedValue(mockPreviewData);
    const wrapper = mountModal(userId);
    await setDate('2026-08-31');
    const previewBtn = wrapper.findAll('button').find((b) => b.text().includes('settings.previewImpact'));
    await previewBtn!.trigger('click');
    await nextTick();
    return wrapper;
  };

  it('advances to step 2 and shows preview data after successful preview', async () => {
    const adminStore = useAdminStore(pinia);
    const wrapper = await advanceToStep2(adminStore);
    expect(wrapper.text()).toContain('Jane Doe');
    expect(wrapper.text()).toContain('2026-08-31');
  });

  it('shows prorated entitlements list in step 2', async () => {
    const adminStore = useAdminStore(pinia);
    const wrapper = await advanceToStep2(adminStore);
    expect(wrapper.text()).toContain('Annual Leave');
  });

  it('confirms termination button is disabled without checkbox checked', async () => {
    const adminStore = useAdminStore(pinia);
    const wrapper = await advanceToStep2(adminStore);
    const confirmBtn = wrapper.findAll('button').find((b) => b.text().includes('settings.terminateConfirmBtn'));
    expect(confirmBtn).toBeDefined();
    expect(confirmBtn!.attributes('disabled')).toBeDefined();
  });

  it('confirm button is enabled when checkbox is checked', async () => {
    const adminStore = useAdminStore(pinia);
    const wrapper = await advanceToStep2(adminStore);
    await wrapper.find('input[type="checkbox"]').setChecked(true);
    const confirmBtn = wrapper.findAll('button').find((b) => b.text().includes('settings.terminateConfirmBtn'));
    expect(confirmBtn!.attributes('disabled')).toBeUndefined();
  });

  it('calls terminateUser with userId and terminationDate when confirmed', async () => {
    const adminStore = useAdminStore(pinia);
    (adminStore.terminateUser as any).mockResolvedValue({ message: 'ok' });
    const wrapper = await advanceToStep2(adminStore, 7);
    await wrapper.find('input[type="checkbox"]').setChecked(true);
    const confirmBtn = wrapper.findAll('button').find((b) => b.text().includes('settings.terminateConfirmBtn'));
    await confirmBtn!.trigger('click');
    expect(adminStore.terminateUser).toHaveBeenCalledWith(7, '2026-08-31');
  });

  it('emits terminated event after successful confirmation', async () => {
    const adminStore = useAdminStore(pinia);
    (adminStore.terminateUser as any).mockResolvedValue({ message: 'ok' });
    const wrapper = await advanceToStep2(adminStore);
    await wrapper.find('input[type="checkbox"]').setChecked(true);
    const confirmBtn = wrapper.findAll('button').find((b) => b.text().includes('settings.terminateConfirmBtn'));
    await confirmBtn!.trigger('click');
    await nextTick();
    expect(wrapper.emitted('terminated')).toBeTruthy();
  });

  it('going back from step 2 returns to step 1', async () => {
    const adminStore = useAdminStore(pinia);
    const wrapper = await advanceToStep2(adminStore);
    const backBtn = wrapper.findAll('button').find((b) => b.text().includes('common.back'));
    await backBtn!.trigger('click');
    await nextTick();
    expect(wrapper.find('input:not([type=checkbox])').exists()).toBe(true);
    expect(wrapper.text()).not.toContain('Jane Doe');
  });

  it('accepts a string userId prop and passes it to previewTermination', async () => {
    const adminStore = useAdminStore(pinia);
    await advanceToStep2(adminStore, '42');
    expect(adminStore.previewTermination).toHaveBeenCalledWith('42', '2026-08-31');
  });
});
