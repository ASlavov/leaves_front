import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import LanguageSwitcher from '@/components/SidebarTopbar/LanguageSwitcher.vue';

// Mock useI18n globally or locally
const mockSetLocale = vi.fn();
const mockLocale = ref('el');

vi.mock('vue-i18n', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useI18n: () => ({
      locale: mockLocale,
      setLocale: mockSetLocale,
    }),
  };
});

describe('LanguageSwitcher.vue', () => {
  beforeEach(() => {
    mockLocale.value = 'el';
    mockSetLocale.mockClear();
  });

  it('displays the Greek flag when current locale is el', () => {
    const wrapper = mount(LanguageSwitcher);
    const img = wrapper.find('img');
    expect(img.attributes('alt')).toBe('Greek');
    expect(img.attributes('src')).toContain('gr.png');
  });

  it('displays the English flag when current locale is en', async () => {
    mockLocale.value = 'en';
    const wrapper = mount(LanguageSwitcher);
    const img = wrapper.find('img');
    expect(img.attributes('alt')).toBe('English');
    expect(img.attributes('src')).toContain('gb.png');
  });

  it('calls setLocale with "en" when clicking the flag if current is "el"', async () => {
    const wrapper = mount(LanguageSwitcher);
    await wrapper.find('button').trigger('click');
    expect(mockSetLocale).toHaveBeenCalledWith('en');
  });

  it('calls setLocale with "el" when clicking the flag if current is "en"', async () => {
    mockLocale.value = 'en';
    const wrapper = mount(LanguageSwitcher);
    await wrapper.find('button').trigger('click');
    expect(mockSetLocale).toHaveBeenCalledWith('el');
  });
});
