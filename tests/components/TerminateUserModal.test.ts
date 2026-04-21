import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import TerminateUserModal from '@/components/Settings/TerminateUserModal.vue';
import { createTestingPinia } from '@pinia/testing';
import { useAdminStore } from '@/stores/admin';

const stubSharedBaseModal = {
  template: '<div><slot /></div>',
  props: ['modelValue'],
  emits: ['update:modelValue'],
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
    pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        adminStore: { loading: false, error: null },
      },
    });
  });

  const mountModal = (userId: number | string = 7, modelValue = true) =>
    mount(TerminateUserModal, {
      props: { modelValue, userId },
      global: {
        plugins: [pinia],
        stubs: { Teleport: true },
      },
    });

  // ── step 1: date entry ────────────────────────────────────────────────────

  it('shows step 1 with date input on initial render', () => {
    const wrapper = mountModal();
    expect(wrapper.find('input[type="date"]').exists()).toBe(true);
  });

  it('Preview Impact button is disabled when terminationDate is empty', () => {
    const wrapper = mountModal();
    const previewBtn = wrapper.find('button[disabled]');
    expect(previewBtn.exists()).toBe(true);
  });

  it('Preview Impact button is enabled after entering a date', async () => {
    const wrapper = mountModal();
    await wrapper.find('input[type="date"]').setValue('2026-08-31');

    // The button should no longer be disabled (no disabled attribute)
    const buttons = wrapper.findAll('button');
    const previewBtn = buttons.find((b) => b.text().includes('settings.previewImpact'));
    expect(previewBtn).toBeDefined();
    expect(previewBtn!.attributes('disabled')).toBeUndefined();
  });

  it('calls previewTermination with userId and terminationDate on button click', async () => {
    const adminStore = useAdminStore(pinia);
    (adminStore.previewTermination as any).mockResolvedValue(mockPreviewData);

    const wrapper = mountModal(7);
    await wrapper.find('input[type="date"]').setValue('2026-08-31');

    const buttons = wrapper.findAll('button');
    const previewBtn = buttons.find((b) => b.text().includes('settings.previewImpact'));
    await previewBtn!.trigger('click');

    expect(adminStore.previewTermination).toHaveBeenCalledWith(7, '2026-08-31');
  });

  // ── step 2: preview & confirm ─────────────────────────────────────────────

  it('advances to step 2 and shows preview data after successful preview', async () => {
    const adminStore = useAdminStore(pinia);
    (adminStore.previewTermination as any).mockResolvedValue(mockPreviewData);

    const wrapper = mountModal(7);
    await wrapper.find('input[type="date"]').setValue('2026-08-31');

    const buttons = wrapper.findAll('button');
    const previewBtn = buttons.find((b) => b.text().includes('settings.previewImpact'));
    await previewBtn!.trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Jane Doe');
    expect(wrapper.text()).toContain('2026-08-31');
  });

  it('shows prorated entitlements list in step 2', async () => {
    const adminStore = useAdminStore(pinia);
    (adminStore.previewTermination as any).mockResolvedValue(mockPreviewData);

    const wrapper = mountModal(7);
    await wrapper.find('input[type="date"]').setValue('2026-08-31');
    const previewBtn = wrapper.findAll('button').find((b) => b.text().includes('settings.previewImpact'));
    await previewBtn!.trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Annual Leave');
  });

  it('confirms termination button is disabled without checkbox checked', async () => {
    const adminStore = useAdminStore(pinia);
    (adminStore.previewTermination as any).mockResolvedValue(mockPreviewData);

    const wrapper = mountModal(7);
    await wrapper.find('input[type="date"]').setValue('2026-08-31');
    const previewBtn = wrapper.findAll('button').find((b) => b.text().includes('settings.previewImpact'));
    await previewBtn!.trigger('click');
    await wrapper.vm.$nextTick();

    const confirmBtn = wrapper.findAll('button').find((b) =>
      b.text().includes('settings.terminateConfirmBtn'),
    );
    expect(confirmBtn).toBeDefined();
    expect(confirmBtn!.attributes('disabled')).toBeDefined();
  });

  it('confirm button is enabled when checkbox is checked', async () => {
    const adminStore = useAdminStore(pinia);
    (adminStore.previewTermination as any).mockResolvedValue(mockPreviewData);

    const wrapper = mountModal(7);
    await wrapper.find('input[type="date"]').setValue('2026-08-31');
    const previewBtn = wrapper.findAll('button').find((b) => b.text().includes('settings.previewImpact'));
    await previewBtn!.trigger('click');
    await wrapper.vm.$nextTick();

    await wrapper.find('input[type="checkbox"]').setChecked(true);

    const confirmBtn = wrapper.findAll('button').find((b) =>
      b.text().includes('settings.terminateConfirmBtn'),
    );
    expect(confirmBtn!.attributes('disabled')).toBeUndefined();
  });

  it('calls terminateUser with userId and terminationDate when confirmed', async () => {
    const adminStore = useAdminStore(pinia);
    (adminStore.previewTermination as any).mockResolvedValue(mockPreviewData);
    (adminStore.terminateUser as any).mockResolvedValue({ message: 'ok' });

    const wrapper = mountModal(7);
    await wrapper.find('input[type="date"]').setValue('2026-08-31');
    const previewBtn = wrapper.findAll('button').find((b) => b.text().includes('settings.previewImpact'));
    await previewBtn!.trigger('click');
    await wrapper.vm.$nextTick();

    await wrapper.find('input[type="checkbox"]').setChecked(true);

    const confirmBtn = wrapper.findAll('button').find((b) =>
      b.text().includes('settings.terminateConfirmBtn'),
    );
    await confirmBtn!.trigger('click');

    expect(adminStore.terminateUser).toHaveBeenCalledWith(7, '2026-08-31');
  });

  it('emits terminated event after successful confirmation', async () => {
    const adminStore = useAdminStore(pinia);
    (adminStore.previewTermination as any).mockResolvedValue(mockPreviewData);
    (adminStore.terminateUser as any).mockResolvedValue({ message: 'ok' });

    const wrapper = mountModal(7);
    await wrapper.find('input[type="date"]').setValue('2026-08-31');
    const previewBtn = wrapper.findAll('button').find((b) => b.text().includes('settings.previewImpact'));
    await previewBtn!.trigger('click');
    await wrapper.vm.$nextTick();

    await wrapper.find('input[type="checkbox"]').setChecked(true);
    const confirmBtn = wrapper.findAll('button').find((b) =>
      b.text().includes('settings.terminateConfirmBtn'),
    );
    await confirmBtn!.trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('terminated')).toBeTruthy();
  });

  // ── back navigation ───────────────────────────────────────────────────────

  it('going back from step 2 returns to step 1', async () => {
    const adminStore = useAdminStore(pinia);
    (adminStore.previewTermination as any).mockResolvedValue(mockPreviewData);

    const wrapper = mountModal(7);
    await wrapper.find('input[type="date"]').setValue('2026-08-31');
    const previewBtn = wrapper.findAll('button').find((b) => b.text().includes('settings.previewImpact'));
    await previewBtn!.trigger('click');
    await wrapper.vm.$nextTick();

    const backBtn = wrapper.findAll('button').find((b) => b.text().includes('common.back'));
    expect(backBtn).toBeDefined();
    await backBtn!.trigger('click');
    await wrapper.vm.$nextTick();

    // Step 1 should be visible again
    expect(wrapper.find('input[type="date"]').exists()).toBe(true);
    expect(wrapper.text()).not.toContain('Jane Doe');
  });

  // ── accepts string userId ─────────────────────────────────────────────────

  it('accepts a string userId prop and passes it to previewTermination', async () => {
    const adminStore = useAdminStore(pinia);
    (adminStore.previewTermination as any).mockResolvedValue(mockPreviewData);

    const wrapper = mountModal('42');
    await wrapper.find('input[type="date"]').setValue('2026-06-15');
    const previewBtn = wrapper.findAll('button').find((b) => b.text().includes('settings.previewImpact'));
    await previewBtn!.trigger('click');

    expect(adminStore.previewTermination).toHaveBeenCalledWith('42', '2026-06-15');
  });
});
