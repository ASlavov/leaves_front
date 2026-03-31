import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import FilterInput from '@/components/misc/FilterInput.vue';

describe('FilterInput.vue', () => {
  it('renders a text input when type is text', () => {
    const wrapper = mount(FilterInput, {
      props: {
        modelValue: '',
        type: 'text',
        placeholder: 'Search...',
      },
    });
    const input = wrapper.find('input');
    expect(input.exists()).toBe(true);
    expect(input.attributes('type')).toBe('text');
    expect(input.attributes('placeholder')).toBe('Search...');
  });

  it('emits update:modelValue when input changes', async () => {
    const wrapper = mount(FilterInput, {
      props: {
        modelValue: '',
        type: 'text',
      },
    });
    const input = wrapper.find('input');
    await input.setValue('test');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['test']);
  });

  it('renders a clear button when modelValue is not empty', () => {
    const wrapper = mount(FilterInput, {
      props: {
        modelValue: 'some search',
        type: 'text',
      },
    });
    const button = wrapper.find('button');
    expect(button.exists()).toBe(true);
    expect(button.text()).toBe('×');
  });

  it('clears input when clear button is clicked', async () => {
    const wrapper = mount(FilterInput, {
      props: {
        modelValue: 'some search',
        type: 'text',
      },
    });
    const button = wrapper.find('button');
    await button.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')!.slice(-1)[0]).toEqual(['']);
  });

  it('renders a date input when type is date', () => {
    const wrapper = mount(FilterInput, {
      props: {
        modelValue: '',
        type: 'date',
      },
    });
    const input = wrapper.find('input');
    expect(input.exists()).toBe(true);
    expect(input.attributes('type')).toBe('date');
  });
});
