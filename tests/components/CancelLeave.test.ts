import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import CancelLeave from '@/components/Home/CancelLeave.vue';
import { createTestingPinia } from '@pinia/testing';
import { useLeavesStore } from '@/stores/leaves';

describe('CancelLeave.vue', () => {
  let pinia: any;

  beforeEach(() => {
    pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        userStore: { userId: 1 },
        leavesStore: {
          leavesData: {
            currentUser: [
              {
                id: 101,
                leave_type_id: 1,
                start_date: '2026-04-10',
                end_date: '2026-04-12',
                status: 'pending',
              },
              {
                id: 102,
                leave_type_id: 2,
                start_date: '2026-05-01',
                end_date: '2026-05-05',
                status: 'approved',
              },
            ],
            leavesTypes: [
              { id: 1, name: 'Annual Leave' },
              { id: 2, name: 'Sick Leave' },
            ],
          },
        },
      },
    });
  });

  it('renders the trigger link', () => {
    const wrapper = mount(CancelLeave, {
      global: {
        plugins: [pinia],
        stubs: {
          Teleport: true,
        },
      },
    });
    expect(wrapper.find('a').text()).toContain('leaves.cancelLeave');
  });

  it('opens the modal and shows leaves to cancel', async () => {
    const wrapper = mount(CancelLeave, {
      global: {
        plugins: [pinia],
        stubs: {
          Teleport: true,
        },
      },
    });
    await wrapper.find('a').trigger('click');

    // In the test, Teleport is usually stubbed so the content is rendered inside the wrapper
    // We look for labels within the leaves list container
    const labels = wrapper.findAll('.cancel-leave .max-h-60 label');
    expect(labels.length).toBe(2);
    expect(labels[0].text()).toContain('Annual Leave');
    expect(labels[1].text()).toContain('Sick Leave');
  });

  it('submits cancellation for a selected leave', async () => {
    const leavesStore = useLeavesStore(pinia);
    const wrapper = mount(CancelLeave, {
      global: {
        plugins: [pinia],
        stubs: {
          Teleport: true,
        },
      },
    });
    await wrapper.find('a').trigger('click');

    // Select the first leave
    const radio = wrapper.find('input[type="radio"]');
    await radio.setChecked();

    await wrapper.find('textarea').setValue('Changed my mind');

    // Submit
    await wrapper.find('form').trigger('submit.prevent');

    expect(leavesStore.cancelLeave).toHaveBeenCalledWith(
      1, // userId
      101, // leaveId
      'cancelled',
      'Changed my mind',
    );
  });
});
