import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import AdminLeaveModal from '@/components/Leaves/AdminLeaveModal.vue';
import { createTestingPinia } from '@pinia/testing';
import { useAdminStore } from '@/stores/admin';

// AdminLeaveModal has two SharedFlatpickrInput instances (start + end date).
// Capture each flatpickr onChange so we can trigger date changes from tests.
const fpCallbacks: Array<(dates: Date[]) => void> = [];

vi.mock('flatpickr', () => ({
  default: vi.fn().mockImplementation((_el: any, opts: any) => {
    fpCallbacks.push(opts.onChange);
    return { destroy: vi.fn(), setDate: vi.fn() };
  }),
}));
vi.mock('flatpickr/dist/flatpickr.min.css', () => ({}));

const setStartDate = async (dateStr: string) => {
  fpCallbacks[0]?.([new Date(dateStr)]);
  await nextTick();
};
const setEndDate = async (dateStr: string) => {
  fpCallbacks[1]?.([new Date(dateStr)]);
  await nextTick();
};

describe('AdminLeaveModal.vue', () => {
  let pinia: any;

  beforeEach(() => {
    fpCallbacks.length = 0;
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
      global: { plugins: [pinia], stubs: { Teleport: true } },
    });

  // ── rendering ──────────────────────────────────────────────────────────────

  it('renders the form when modelValue is true', () => {
    const wrapper = mountModal(true);
    expect(wrapper.find('form').exists()).toBe(true);
  });

  it('renders two SharedFlatpickrInput date fields', () => {
    mountModal();
    // Two FlatpickrInput components mount → two flatpickr instances created
    expect(fpCallbacks).toHaveLength(2);
  });

  it('renders a textarea for administrative reason', () => {
    const wrapper = mountModal();
    expect(wrapper.find('textarea').exists()).toBe(true);
  });

  it('renders a CustomMultiSelect for user selection and a CustomSelect for leave type', () => {
    const wrapper = mountModal();
    expect(wrapper.findComponent({ name: 'CustomMultiSelect' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'CustomSelect' }).exists()).toBe(true);
  });

  it('passes user options from userStore.allUsers to the CustomMultiSelect', () => {
    const wrapper = mountModal();
    const options = wrapper.findComponent({ name: 'CustomMultiSelect' }).props('options') as any[];
    expect(options.map((o) => o.name)).toContain('Alice Smith');
    expect(options.map((o) => o.name)).toContain('Bob Jones');
  });

  it('passes leave type options from leavesStore to the CustomSelect', () => {
    const wrapper = mountModal();
    const options = wrapper.findComponent({ name: 'CustomSelect' }).props('options') as any[];
    expect(options.map((o) => o.name)).toContain('Annual Leave');
    expect(options.map((o) => o.name)).toContain('Sick Leave');
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
    wrapper.findComponent({ name: 'CustomMultiSelect' }).vm.$emit('update:modelValue', [3]);
    await nextTick();
    await setEndDate('2026-05-05');
    await wrapper.find('textarea').setValue('Back-filling records');
    await wrapper.find('form').trigger('submit.prevent');
    expect(adminStore.recordAdministrativeLeave).not.toHaveBeenCalled();
  });

  it('does not call recordAdministrativeLeave when administrativeReason is empty', async () => {
    const adminStore = useAdminStore(pinia);
    const wrapper = mountModal();
    wrapper.findComponent({ name: 'CustomMultiSelect' }).vm.$emit('update:modelValue', [3]);
    await nextTick();
    await setStartDate('2026-05-01');
    await setEndDate('2026-05-05');
    // textarea left empty
    await wrapper.find('form').trigger('submit.prevent');
    expect(adminStore.recordAdministrativeLeave).not.toHaveBeenCalled();
  });

  // ── successful submission ─────────────────────────────────────────────────

  // Helper: fill the form using direct state manipulation (bypasses component
  // event chain) and verify canSubmit is true before submitting.
  const fillFormAndSubmit = async (wrapper: ReturnType<typeof mountModal>) => {
    const vm = wrapper.vm as any;
    vm.payload.userIds = [3];
    vm.payload.startDate = '2026-05-01';
    vm.payload.endDate = '2026-05-05';
    vm.payload.administrativeReason = 'Administrative correction';
    await nextTick();
    // Confirm button is now enabled (canSubmit = true)
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined();
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();
  };

  it('calls recordAdministrativeLeave with the correct payload on valid submission', async () => {
    const adminStore = useAdminStore(pinia);
    const wrapper = mountModal();
    await fillFormAndSubmit(wrapper);
    expect(adminStore.recordAdministrativeLeave).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 3,
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
    await fillFormAndSubmit(wrapper);
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
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
  });

  it('submit button is disabled when form is empty (isValid gate)', () => {
    const wrapper = mountModal();
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
  });
});
