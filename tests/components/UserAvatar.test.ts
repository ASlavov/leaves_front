import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import UserAvatar from '@/components/shared/UserAvatar.vue';
import type { User } from '@/types';

describe('UserAvatar.vue', () => {
  const mockUser: User = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    profile: {
      profile_image_base64: null,
    },
  } as any;

  it('renders initials when no image is provided', () => {
    const wrapper = mount(UserAvatar, {
      props: {
        user: mockUser,
        size: 40,
      },
    });
    expect(wrapper.text()).toBe('JD');
    expect(wrapper.find('img').exists()).toBe(false);
  });

  it('renders image when profile_image_base64 is provided', () => {
    const userWithImage = {
      ...mockUser,
      profile: {
        profile_image_base64: 'data:image/png;base64,xxx',
      },
    };
    const wrapper = mount(UserAvatar, {
      props: {
        user: userWithImage as any,
      },
    });
    const img = wrapper.find('img');
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toBe('data:image/png;base64,xxx');
    expect(wrapper.find('span').exists()).toBe(false);
  });

  it('applies the correct size to the container', () => {
    const wrapper = mount(UserAvatar, {
      props: {
        user: mockUser,
        size: 50,
      },
    });
    const div = wrapper.find('div');
    expect(div.element.style.width).toBe('50px');
    expect(div.element.style.height).toBe('50px');
  });

  it('returns empty string for initials if user name is missing', () => {
    const wrapper = mount(UserAvatar, {
      props: {
        user: { ...mockUser, name: '' } as any,
      },
    });
    expect(wrapper.text()).toBe('');
  });
});
