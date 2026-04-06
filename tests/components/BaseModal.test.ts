import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import BaseModal from '@/components/shared/BaseModal.vue';

describe('BaseModal.vue', () => {
  it('renders when modelValue is true', () => {
    const wrapper = mount(BaseModal, {
      props: {
        modelValue: true,
      },
      global: {
        stubs: {
          Teleport: true,
        },
      },
    });
    expect(wrapper.find('.fixed').exists()).toBe(true);
  });

  it('does not render when modelValue is false', () => {
    const wrapper = mount(BaseModal, {
      props: {
        modelValue: false,
      },
      global: {
        stubs: {
          Teleport: true,
        },
      },
    });
    expect(wrapper.find('.fixed').exists()).toBe(false);
  });

  it('emits update:modelValue with false when clicking background', async () => {
    const wrapper = mount(BaseModal, {
      props: {
        modelValue: true,
      },
      global: {
        stubs: {
          Teleport: true,
        },
      },
    });
    await wrapper.find('.fixed').trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([false]);
  });

  it('renders the title when provided', () => {
    const wrapper = mount(BaseModal, {
      props: {
        modelValue: true,
        title: 'Test Modal',
      },
      global: {
        stubs: {
          Teleport: true,
        },
      },
    });
    expect(wrapper.find('h2').text()).toBe('Test Modal');
  });

  it('renders slot content', () => {
    const wrapper = mount(BaseModal, {
      props: {
        modelValue: true,
      },
      slots: {
        default: '<div id="slot-content">Hello</div>',
      },
      global: {
        stubs: {
          Teleport: true,
        },
      },
    });
    expect(wrapper.find('#slot-content').exists()).toBe(true);
    expect(wrapper.find('#slot-content').text()).toBe('Hello');
  });
});
