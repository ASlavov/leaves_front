import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import NewLeave from '@/components/Home/NewLeave.vue';
import { createTestingPinia } from '@pinia/testing';
import { useLeavesStore } from '@/stores/leaves';
import { useUserStore } from '@/stores/user';

// Mock flatpickr
vi.mock('flatpickr', () => ({
  default: vi.fn(() => ({
    destroy: vi.fn(),
  })),
}));

describe('NewLeave.vue', () => {
  let pinia: any;

  beforeEach(() => {
    pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        userStore: { userId: 1 },
        leavesStore: {
          leavesData: {
            leavesAvailableDays: [
              { leave_type_id: 1, leave_type_name: 'Annual Leave', remaining_days: 10 },
            ],
            leavesTypes: [{ id: 1, name: 'Annual Leave' }],
          },
        },
        workWeekStore: { days: [1, 2, 3, 4, 5] },
        holidaysStore: { holidays: [] },
      },
    });
  });

  it('renders the open modal button', () => {
    const wrapper = mount(NewLeave, {
      global: {
        plugins: [pinia],
      },
    });
    expect(wrapper.find('button').text()).toContain('leaves.newLeaveRequest');
  });

  it('opens the modal when button is clicked', async () => {
    const wrapper = mount(NewLeave, {
      global: {
        plugins: [pinia],
      },
    });
    await wrapper.find('button').trigger('click');
    expect(wrapper.find('#new-leave-modal').exists()).toBe(true);
  });

  it('submits a new leave request', async () => {
    const leavesStore = useLeavesStore(pinia);
    const wrapper = mount(NewLeave, {
      global: {
        plugins: [pinia],
      },
    });

    // Open modal
    await wrapper.find('button').trigger('click');

    // Set form values
    const select = wrapper.find('select');
    await select.setValue('1');

    // Mock dates (normally set by flatpickr)
    // Since we mocked flatpickr, we need to manually set the refs if we want to test submit
    // But NewLeave.vue uses internal refs bound to v-model
    // However, startDate/endDate are also updated by flatpickr onChange

    // We can find the inputs and set values
    const inputs = wrapper.findAll('input');
    await inputs[0].setValue('2026-04-01'); // fromDate
    await inputs[1].setValue('2026-04-05'); // toDate

    await wrapper.find('textarea').setValue('Test comment');

    // Submit form
    await wrapper.find('form').trigger('submit.prevent');

    expect(leavesStore.newLeave).toHaveBeenCalledWith(
      1, // userId
      1, // leave_type_id
      '2026-04-01',
      '2026-04-05',
      'Test comment',
    );
  });
});
