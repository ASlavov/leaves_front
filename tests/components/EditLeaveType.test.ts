import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import EditLeaveType from '@/components/Settings/EditLeaveType.vue';
import { createTestingPinia } from '@pinia/testing';
import { useLeavesStore } from '@/stores/leaves';
import { useLeavesTypesReactive } from '@/composables/leavesApiComposable';
import { ref } from 'vue';

vi.mock('@/composables/leavesApiComposable', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/composables/leavesApiComposable')>();
  return {
    ...actual,
    useLeavesTypesReactive: vi.fn(),
  };
});

const mockLeaveTypes = [
  {
    id: 1,
    name: 'Annual Leave',
    allow_rollover: true,
    depends_on_type_id: null,
    deleted_at: null,
    priority_level: 10,
    allow_wallet_overflow: false,
    overflow_leave_type_id: null,
    accrual_type: 'upfront',
    allow_negative_balance: false,
    max_negative_balance: 0,
    is_hourly: false,
    hours_per_day: 8,
    attachment_required_after_days: null,
  },
  {
    id: 2,
    name: 'Sick Leave',
    allow_rollover: false,
    depends_on_type_id: null,
    deleted_at: null,
    priority_level: 5,
    allow_wallet_overflow: false,
    overflow_leave_type_id: null,
    accrual_type: 'pro_rata_monthly',
    allow_negative_balance: true,
    max_negative_balance: 3,
    is_hourly: false,
    hours_per_day: 8,
    attachment_required_after_days: 3,
  },
];

describe('EditLeaveType.vue', () => {
  let pinia: any;

  beforeEach(() => {
    (useLeavesTypesReactive as any).mockReturnValue({
      data: ref(mockLeaveTypes),
      pending: ref(false),
    });

    pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        leavesStore: {
          leavesData: {
            leavesTypes: mockLeaveTypes,
          },
          loading: false,
        },
      },
    });
  });

  const mountComponent = (leaveTypeId?: number | string) =>
    mount(EditLeaveType, {
      props: { leaveTypeId },
      global: {
        plugins: [pinia],
        stubs: { Teleport: true },
      },
    });

  // ── initial render ────────────────────────────────────────────────────────

  it('renders name input', () => {
    const wrapper = mountComponent();
    expect(wrapper.find('input[type="text"]').exists()).toBe(true);
  });

  it('renders the save button with saveChanges label', () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain('common.saveChanges');
  });

  it('renders the allow rollover toggle button', () => {
    const wrapper = mountComponent();
    const roundButtons = wrapper.findAll('button').filter((b) =>
      b.element.className.includes('rounded-full'),
    );
    expect(roundButtons.length).toBeGreaterThan(0);
  });

  // ── advanced rules toggle ─────────────────────────────────────────────────

  it('advanced rules toggle button is visible by default', () => {
    const wrapper = mountComponent();
    const toggleBtn = wrapper.findAll('button').find((b) =>
      b.text().includes('settings.showAdvancedRules'),
    );
    expect(toggleBtn).toBeDefined();
  });

  it('clicking toggle button shows the hide-advanced-rules button text', async () => {
    const wrapper = mountComponent();
    const toggleBtn = wrapper.findAll('button').find((b) =>
      b.text().includes('settings.showAdvancedRules'),
    );
    await toggleBtn!.trigger('click');

    const hideBtn = wrapper.findAll('button').find((b) =>
      b.text().includes('settings.hideAdvancedRules'),
    );
    expect(hideBtn).toBeDefined();
  });

  it('priority level input is visible after expanding advanced rules', async () => {
    const wrapper = mountComponent();
    const toggleBtn = wrapper.findAll('button').find((b) =>
      b.text().includes('settings.showAdvancedRules'),
    );
    await toggleBtn!.trigger('click');

    const numericInputs = wrapper.findAll('input[type="number"]');
    expect(numericInputs.length).toBeGreaterThan(0);
  });

  // ── populating from existing leave type ────────────────────────────────────

  it('populates the name field when leaveTypeId is provided', async () => {
    const wrapper = mountComponent(1);
    await wrapper.vm.$nextTick();

    const nameInput = wrapper.find('input[type="text"]');
    expect((nameInput.element as HTMLInputElement).value).toBe('Annual Leave');
  });

  it('populates priority level from existing leave type', async () => {
    const wrapper = mountComponent(2); // Sick Leave has priority 5
    await wrapper.vm.$nextTick();

    const toggleBtn = wrapper.findAll('button').find((b) =>
      b.text().includes('settings.showAdvancedRules'),
    );
    await toggleBtn!.trigger('click');
    await wrapper.vm.$nextTick();

    const numericInputs = wrapper.findAll('input[type="number"]');
    const priorityInput = numericInputs[0];
    expect((priorityInput.element as HTMLInputElement).value).toBe('5');
  });

  it('selects pro_rata_monthly radio when accrualType is pro_rata_monthly', async () => {
    const wrapper = mountComponent(2); // Sick Leave
    await wrapper.vm.$nextTick();

    const toggleBtn = wrapper.findAll('button').find((b) =>
      b.text().includes('settings.showAdvancedRules'),
    );
    await toggleBtn!.trigger('click');
    await wrapper.vm.$nextTick();

    const proRataRadio = wrapper.find('input[value="pro_rata_monthly"]');
    expect((proRataRadio.element as HTMLInputElement).checked).toBe(true);
  });

  it('allowNegativeBalance checkbox is checked when existing type has it enabled', async () => {
    const wrapper = mountComponent(2); // Sick Leave: allow_negative_balance = true
    await wrapper.vm.$nextTick();

    const toggleBtn = wrapper.findAll('button').find((b) =>
      b.text().includes('settings.showAdvancedRules'),
    );
    await toggleBtn!.trigger('click');
    await wrapper.vm.$nextTick();

    // First checkbox in the advanced section is overflow, second is negative balance
    const checkboxes = wrapper.findAll('input[type="checkbox"]');
    const negBalCheckbox = checkboxes.find((c) => {
      const container = c.element.closest('.grid')?.textContent ?? '';
      return container.includes('settings.allowNegativeBalance');
    });
    expect(negBalCheckbox).toBeDefined();
    expect((negBalCheckbox!.element as HTMLInputElement).checked).toBe(true);
  });

  // ── conditional fields ────────────────────────────────────────────────────

  it('overflow leave type selector appears when allowWalletOverflow is checked', async () => {
    const wrapper = mountComponent();
    const toggleBtn = wrapper.findAll('button').find((b) =>
      b.text().includes('settings.showAdvancedRules'),
    );
    await toggleBtn!.trigger('click');
    await wrapper.vm.$nextTick();

    // Count CustomSelect components before
    const selectsBefore = wrapper.findAllComponents({ name: 'CustomSelect' }).length;

    // Check allowWalletOverflow checkbox
    const overflowCheckbox = wrapper.find('input[type="checkbox"]');
    await overflowCheckbox.setChecked(true);
    await wrapper.vm.$nextTick();

    // After checking overflow, the overflow type selector should appear
    const selectsAfter = wrapper.findAllComponents({ name: 'CustomSelect' }).length;
    expect(selectsAfter).toBeGreaterThan(selectsBefore);
  });

  it('maxNegativeBalance input appears when allowNegativeBalance is checked', async () => {
    const wrapper = mountComponent();
    const toggleBtn = wrapper.findAll('button').find((b) =>
      b.text().includes('settings.showAdvancedRules'),
    );
    await toggleBtn!.trigger('click');
    await wrapper.vm.$nextTick();

    const numericBefore = wrapper.findAll('input[type="number"]').length;

    // Second checkbox is allowNegativeBalance
    const checkboxes = wrapper.findAll('input[type="checkbox"]');
    await checkboxes[1].setChecked(true);
    await wrapper.vm.$nextTick();

    const numericAfter = wrapper.findAll('input[type="number"]').length;
    expect(numericAfter).toBeGreaterThan(numericBefore);
  });

  it('hoursPerDay input (step=0.5) appears when isHourly is checked', async () => {
    const wrapper = mountComponent();
    const toggleBtn = wrapper.findAll('button').find((b) =>
      b.text().includes('settings.showAdvancedRules'),
    );
    await toggleBtn!.trigger('click');
    await wrapper.vm.$nextTick();

    // isHourly is the first checkbox in the schedule section (third checkbox overall)
    const checkboxes = wrapper.findAll('input[type="checkbox"]');
    await checkboxes[checkboxes.length - 1].setChecked(true);
    await wrapper.vm.$nextTick();

    const hourlyInput = wrapper.find('input[step="0.5"]');
    expect(hourlyInput.exists()).toBe(true);
  });

  // ── create new leave type ──────────────────────────────────────────────────

  it('calls leavesStore.createLeaveType when no leaveTypeId prop is set', async () => {
    const leavesStore = useLeavesStore(pinia);
    const wrapper = mountComponent();

    await wrapper.find('input[type="text"]').setValue('Compassionate Leave');

    // Click save — find the button by text content
    const saveBtn = wrapper.findAll('button').find((b) =>
      b.text().includes('common.saveChanges'),
    );
    await saveBtn!.trigger('click');
    await wrapper.vm.$nextTick();

    expect(leavesStore.createLeaveType).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Compassionate Leave' }),
    );
    expect(leavesStore.updateLeaveType).not.toHaveBeenCalled();
  });

  it('creates leave type with all rules engine defaults', async () => {
    const leavesStore = useLeavesStore(pinia);
    const wrapper = mountComponent();

    await wrapper.find('input[type="text"]').setValue('Test Leave');
    const saveBtn = wrapper.findAll('button').find((b) =>
      b.text().includes('common.saveChanges'),
    );
    await saveBtn!.trigger('click');
    await wrapper.vm.$nextTick();

    expect(leavesStore.createLeaveType).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Leave',
        priorityLevel: 10,
        allowWalletOverflow: false,
        accrualType: 'upfront',
        allowNegativeBalance: false,
        maxNegativeBalance: 0,
        isHourly: false,
        hoursPerDay: 8,
      }),
    );
  });

  // ── update existing leave type ─────────────────────────────────────────────

  it('calls leavesStore.updateLeaveType when leaveTypeId prop is set', async () => {
    const leavesStore = useLeavesStore(pinia);
    const wrapper = mountComponent(1);
    await wrapper.vm.$nextTick();

    await wrapper.find('input[type="text"]').setValue('Annual Leave Updated');

    const saveBtn = wrapper.findAll('button').find((b) =>
      b.text().includes('common.saveChanges'),
    );
    await saveBtn!.trigger('click');
    await wrapper.vm.$nextTick();

    expect(leavesStore.updateLeaveType).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, name: 'Annual Leave Updated' }),
    );
    expect(leavesStore.createLeaveType).not.toHaveBeenCalled();
  });

  it('includes rules engine fields on update of existing type', async () => {
    const leavesStore = useLeavesStore(pinia);
    const wrapper = mountComponent(2); // Sick Leave: pro_rata, negative balance, attachment
    await wrapper.vm.$nextTick();

    const saveBtn = wrapper.findAll('button').find((b) =>
      b.text().includes('common.saveChanges'),
    );
    await saveBtn!.trigger('click');
    await wrapper.vm.$nextTick();

    expect(leavesStore.updateLeaveType).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 2,
        accrualType: 'pro_rata_monthly',
        allowNegativeBalance: true,
        maxNegativeBalance: 3,
        attachmentRequiredAfterDays: 3,
      }),
    );
  });

  it('does not call save when name is empty', async () => {
    const leavesStore = useLeavesStore(pinia);
    const wrapper = mountComponent();
    // name input is empty by default

    const saveBtn = wrapper.findAll('button').find((b) =>
      b.text().includes('common.saveChanges'),
    );
    await saveBtn!.trigger('click');

    expect(leavesStore.createLeaveType).not.toHaveBeenCalled();
    expect(leavesStore.updateLeaveType).not.toHaveBeenCalled();
  });

  // ── allow rollover toggle ─────────────────────────────────────────────────

  it('shows rollover-off warning when allowRollover is toggled off', async () => {
    const wrapper = mountComponent();

    // The rollover toggle is the first rounded-full button
    const rolloverBtn = wrapper.findAll('button').find((b) =>
      b.element.className.includes('rounded-full'),
    );
    await rolloverBtn!.trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('settings.allowRolloverOff');
  });

  it('does not show rollover warning when allowRollover is enabled (default)', () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).not.toContain('settings.allowRolloverOff');
  });
});
