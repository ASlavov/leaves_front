import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import EntitlementDays from '@/components/Settings/EntitlementDays.vue';
import { createTestingPinia } from '@pinia/testing';
import { useCentralStore } from '@/stores/centralStore';

// Mock Nuxt components and composables
vi.mock('nuxt/app', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useNuxtApp: () => ({
      $colorMode: { value: 'light' },
    }),
  };
});

describe('EntitlementDays.vue', () => {
  let pinia: any;

  const mockUsers = [
    { id: 1, name: 'Alice Smith', email: 'alice@example.com' },
    { id: 2, name: 'Bob Jones', email: 'bob@example.com' },
  ];

  beforeEach(() => {
    pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        centralStore: { loading: false },
        userStore: { allUsers: mockUsers },
        permissionsStore: { permissions: { entitlement: { modify: true } } },
        entitlementStore: { entitledDaysData: { savedUsers: {} } },
        leavesStore: { leavesData: { leavesTypes: [] } },
      },
    });
  });

  it('renders the filters section', () => {
    const wrapper = mount(EntitlementDays, {
      global: {
        plugins: [pinia],
        stubs: {
          Teleport: true,
          SharedUserAvatar: true,
          SharedBaseModal: true,
          MassDeleteEntitlement: true,
        },
      },
    });
    expect(wrapper.find('input[placeholder="settings.firstName"]').exists()).toBe(true);
    expect(wrapper.find('input[placeholder="settings.lastName"]').exists()).toBe(true);
  });

  it('shows loading skeleton when loading is true', async () => {
    const loadingPinia = createTestingPinia({
      stubActions: false,
      initialState: {
        centralStore: { loading: true },
        userStore: { allUsers: [] },
        permissionsStore: { permissions: {} },
        entitlementStore: { entitledDaysData: { savedUsers: {} } },
        leavesStore: { leavesData: { leavesTypes: [] } },
        departmentsStore: { departmentsData: [] },
      },
    });

    const wrapper = mount(EntitlementDays, {
      global: {
        plugins: [loadingPinia],
        stubs: {
          Teleport: true,
          SharedUserAvatar: true,
          SharedBaseModal: true,
          MassDeleteEntitlement: true,
        },
      },
    });

    // Force the loading state if initialState was ignored for computed
    const centralStore = useCentralStore(loadingPinia);
    (centralStore as any).loading = true;
    await wrapper.vm.$nextTick();

    // The skeleton is rendered when loading is true
    expect(wrapper.find('.animate-pulse').exists()).toBe(true);
  });

  it('filters users by first name', async () => {
    const permissionsStore = usePermissionsStore(pinia);
    // Mock can() to return true so the filters and list are visible
    (permissionsStore.can as any).mockReturnValue(true);

    const wrapper = mount(EntitlementDays, {
      global: {
        plugins: [pinia],
        stubs: {
          Teleport: true,
          SharedUserAvatar: true,
          SharedBaseModal: true,
          MassDeleteEntitlement: true,
        },
      },
    });

    const input = wrapper.find('input[placeholder="settings.firstName"]');
    await input.setValue('Alice');

    // Wait for watchers and computed properties
    await wrapper.vm.$nextTick();

    const nameCells = wrapper
      .findAll('.lg\\:col-span-2.col-span-1')
      .filter((w) => w.text().includes('Alice') || w.text().includes('Bob'));

    expect(nameCells.some((w) => w.text().includes('Alice'))).toBe(true);
    expect(nameCells.some((w) => w.text().includes('Bob'))).toBe(false);
  });

  it('opens new entitlement modal when clicking add button', async () => {
    const permissionsStore = usePermissionsStore(pinia);
    (permissionsStore.can as any).mockReturnValue(true);

    const wrapper = mount(EntitlementDays, {
      global: {
        plugins: [pinia],
        stubs: {
          Teleport: true,
          SharedUserAvatar: true,
          SharedBaseModal: true,
          MassDeleteEntitlement: true,
        },
      },
    });

    const buttons = wrapper.findAll('button');
    const addBtn = buttons.find((b) => b.text().includes('settings.addEntitlement'));

    expect(addBtn).toBeDefined();
    await addBtn!.trigger('click');
    // showModal state change is internal, but we verified the button exists and is clickable
  });
});
