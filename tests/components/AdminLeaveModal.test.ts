import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import AdminLeaveModal from '@/components/Leaves/AdminLeaveModal.vue';
import { createTestingPinia } from '@pinia/testing';
import { useAdminStore } from '@/stores/admin';

describe('AdminLeaveModal.vue', () => {
  let pinia: any;

  beforeEach(() => {
    pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        userStore: {
          userId: 1,
          allUsers: [
            { id: 3, name: 'Alice Smith' },
            { id: 4, name: 'Bob Jones' },
          ],
        },
        leavesStore: {
          leavesData: {
            leavesTypes: [
              { id: 1, name: 'Annual Leave' },
              { id: 2, name: 'Sick Leave' },
            ],
          },
        },
        adminStore: { loading: false, error: null },
      },
    });
  });

  const mountModal = (modelValue = true) =>
    mount(AdminLeaveModal, {
      props: { modelValue },
      global: {
        plugins: [pinia],
        stubs: { Teleport: true },
      },
    });

  // ── rendering ──────────────────────────────────────────────────────────────

  it('renders the form when modelValue is true', () => {
    const wrapper = mountModal(true);
    expect(wrapper.find('form').exists()).toBe(true);
  });

  it('renders two date inputs for start and end date', () => {
    const wrapper = mountModal();
    const dateInputs = wrapper.findAll('input[type="date"]');
    expect(dateInputs).toHaveLength(2);
  });

  it('renders a textarea for administrative reason', () => {
    const wrapper = mountModal();
    expect(wrapper.find('textarea').exists()).toBe(true);
  });

  it('renders two CustomSelect components (user + leave type)', () => {
    const wrapper = mountModal();
    const selects = wrapper.findAllComponents({ name: 'CustomSelect' });
    expect(selects).toHaveLength(2);
  });

  it('passes user options from userStore.allUsers to the first CustomSelect', () => {
    const wrapper = mountModal();
    const selects = wrapper.findAllComponents({ name: 'CustomSelect' });
    const options = selects[0].props('options') as { id: number; name: string }[];
    const names = options.map((o) => o.name);
    expect(names).toContain('Alice Smith');
    expect(names).toContain('Bob Jones');
  });

  it('passes leave type options from leavesStore to the second CustomSelect', () => {
    const wrapper = mountModal();
    const selects = wrapper.findAllComponents({ name: 'CustomSelect' });
    const options = selects[1].props('options') as { id: number; name: string }[];
    const names = options.map((o) => o.name);
    expect(names).toContain('Annual Leave');
    expect(names).toContain('Sick Leave');
  });

  // ── submit guard ───────────────────────────────────────────────────────────

  it('does not call recordAdministrativeLeave when form is empty', async () => {
    const adminStore = useAdminStore(pinia);
    const wrapper = mountModal();
    await wrapper.find('form').trigger('submit.prevent');
    expect(adminStore.recordAdministrativeLeave).not.toHaveBeenCalled();
  });

  it('does not call recordAdministrativeLeave when startDate is missing', async () => {
    const adminStore = useAdminStore(pinia);
    const wrapper = mountModal();

    // Set userId via v-model emit on the real CustomSelect component
    const selects = wrapper.findAllComponents({ name: 'CustomSelect' });
    selects[0].vm.$emit('update:modelValue', '3');
    await wrapper.vm.$nextTick();

    await wrapper.findAll('input[type="date"]')[1].setValue('2026-05-05');
    await wrapper.find('textarea').setValue('Back-filling records');

    await wrapper.find('form').trigger('submit.prevent');
    expect(adminStore.recordAdministrativeLeave).not.toHaveBeenCalled();
  });

  it('does not call recordAdministrativeLeave when administrativeReason is empty', async () => {
    const adminStore = useAdminStore(pinia);
    const wrapper = mountModal();

    const selects = wrapper.findAllComponents({ name: 'CustomSelect' });
    selects[0].vm.$emit('update:modelValue', '3');
    await wrapper.vm.$nextTick();

    await wrapper.findAll('input[type="date"]')[0].setValue('2026-05-01');
    await wrapper.findAll('input[type="date"]')[1].setValue('2026-05-05');
    // textarea left empty

    await wrapper.find('form').trigger('submit.prevent');
    expect(adminStore.recordAdministrativeLeave).not.toHaveBeenCalled();
  });

  // ── successful submission ─────────────────────────────────────────────────

  it('calls recordAdministrativeLeave with the correct payload on valid submission', async () => {
    const adminStore = useAdminStore(pinia);
    const wrapper = mountModal();

    const selects = wrapper.findAllComponents({ name: 'CustomSelect' });
    selects[0].vm.$emit('update:modelValue', '3');
    await wrapper.vm.$nextTick();

    await wrapper.findAll('input[type="date"]')[0].setValue('2026-05-01');
    await wrapper.findAll('input[type="date"]')[1].setValue('2026-05-05');
    await wrapper.find('textarea').setValue('Administrative correction');
    await wrapper.vm.$nextTick();

    await wrapper.find('form').trigger('submit.prevent');
    await wrapper.vm.$nextTick();

    expect(adminStore.recordAdministrativeLeave).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: '3',
        startDate: '2026-05-01',
        endDate: '2026-05-05',
        administrativeReason: 'Administrative correction',
      }),
    );
  });

  it('emits saved event after successful submission', async () => {
    const adminStore = useAdminStore(pinia);
    (adminStore.recordAdministrativeLeave as any).mockResolvedValue({ message: 'ok' });

    const wrapper = mountModal();

    const selects = wrapper.findAllComponents({ name: 'CustomSelect' });
    selects[0].vm.$emit('update:modelValue', '3');
    await wrapper.vm.$nextTick();

    await wrapper.findAll('input[type="date"]')[0].setValue('2026-05-01');
    await wrapper.findAll('input[type="date"]')[1].setValue('2026-05-05');
    await wrapper.find('textarea').setValue('Administrative correction');
    await wrapper.vm.$nextTick();

    await wrapper.find('form').trigger('submit.prevent');
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('saved')).toBeTruthy();
  });

  // ── loading state ─────────────────────────────────────────────────────────

  it('submit button is disabled when loading is true', () => {
    pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        userStore: { userId: 1, allUsers: [] },
        leavesStore: { leavesData: { leavesTypes: [] } },
        adminStore: { loading: true, error: null },
      },
    });

    const wrapper = mountModal();
    const submitBtn = wrapper.find('button[type="submit"]');
    expect(submitBtn.attributes('disabled')).toBeDefined();
  });

  it('submit button is enabled when loading is false', () => {
    const wrapper = mountModal();
    const submitBtn = wrapper.find('button[type="submit"]');
    expect(submitBtn.attributes('disabled')).toBeUndefined();
  });
});
