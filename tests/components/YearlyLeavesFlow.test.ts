import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import YearlyLeaves from '@/components/Leaves/YearlyLeaves.vue';
import { createTestingPinia } from '@pinia/testing';
import { useLeavesStore } from '@/stores/leaves';
import { usePermissionsStore } from '@/stores/permissions';
import { CheckIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import {
  useAllUserLeavesReactive,
  useLeavesTypesReactive,
  useLeavesStatusesReactive,
} from '@/composables/leavesApiComposable';
import { ref } from 'vue';

vi.mock('@/composables/leavesApiComposable', () => ({
  useAllUserLeavesReactive: vi.fn(),
  useLeavesTypesReactive: vi.fn(),
  useLeavesStatusesReactive: vi.fn(),
}));

describe('YearlyLeavesFlow.test.ts', () => {
  let pinia: any;

  const mockLeaves = [
    {
      id: 1,
      user_id: 2,
      leave_type_id: 1,
      start_date: '2026-06-01',
      end_date: '2026-06-03',
      status: 'pending',
      user: { id: 2, name: 'John Doe' },
    },
  ];

  beforeEach(() => {
    (useAllUserLeavesReactive as any).mockReturnValue({
      data: ref([{ id: 2, name: 'John Doe', leaves: mockLeaves, department_id: 1 }]),
      pending: ref(false),
      refresh: vi.fn(),
    });
    (useLeavesTypesReactive as any).mockReturnValue({
      data: ref([{ id: 1, name: 'Annual Leave' }]),
      pending: ref(false),
      refresh: vi.fn(),
    });
    (useLeavesStatusesReactive as any).mockReturnValue({
      data: ref([{ id: 1, name: 'pending' }]),
      pending: ref(false),
      refresh: vi.fn(),
    });

    pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        userStore: { userId: 1 },
        leavesStore: {
          leavesData: {
            allUsers: [{ id: 2, name: 'John Doe', leaves: mockLeaves }],
            leavesTypes: [{ id: 1, name: 'Annual Leave' }],
            leavesStatuses: [],
          },
        },
        permissionsStore: {
          permissions: {
            profile_leave_balance: {
              accept_leave: ['admin'],
            },
          },
        },
        departmentsStore: { departmentsData: [] },
      },
    });
  });

  it('allows admin to approve a leave', async () => {
    const leavesStore = useLeavesStore(pinia);
    const permissionsStore = usePermissionsStore(pinia);

    (permissionsStore.can as any).mockImplementation((cat: string, act: string) => {
      return cat === 'profile_leave_balance' && act === 'accept_leave';
    });
    (permissionsStore.isAdmin as any).mockReturnValue(true);

    const wrapper = mount(YearlyLeaves, {
      global: {
        plugins: [pinia],
        stubs: {
          SharedUserAvatar: true,
          CheckIcon: true,
          XMarkIcon: true,
          MiscCustomSelect: true,
          NuxtLink: true,
        },
      },
    });

    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 200));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('John Doe');

    const buttons = wrapper.findAll('button');
    const approveBtn = buttons.find((b) => b.findComponent(CheckIcon).exists());

    expect(approveBtn).toBeDefined();
    await approveBtn!.trigger('click');

    expect(leavesStore.approveLeave).toHaveBeenCalledWith(
      2, // userId
      1, // leaveId
      'approved',
      '',
    );
  });

  it('allows admin to reject a leave with a comment', async () => {
    const leavesStore = useLeavesStore(pinia);
    const permissionsStore = usePermissionsStore(pinia);

    (permissionsStore.can as any).mockImplementation((cat: string, act: string) => {
      return cat === 'profile_leave_balance' && act === 'accept_leave';
    });
    (permissionsStore.isAdmin as any).mockReturnValue(true);

    const wrapper = mount(YearlyLeaves, {
      global: {
        plugins: [pinia],
        stubs: {
          SharedUserAvatar: true,
          CheckIcon: true,
          XMarkIcon: true,
          MiscCustomSelect: true,
          NuxtLink: true,
        },
      },
    });

    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 300));
    await wrapper.vm.$nextTick();

    const commentInput = wrapper.find('input[type="text"]');
    expect(commentInput.exists()).toBe(true);
    await commentInput.setValue('Not enough staff');

    // Decline button has specific background color class
    const declineBtn = wrapper.find('button[class*="bg-[#FF455F26]"]');
    expect(declineBtn.exists()).toBe(true);
    await declineBtn.trigger('click');

    expect(leavesStore.declineLeave).toHaveBeenCalledWith(
      2, // userId
      1, // leaveId
      'rejected',
      'Not enough staff',
    );
  });
});
