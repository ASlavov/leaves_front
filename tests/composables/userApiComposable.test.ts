import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import retryFetch from '~/utils/retryFetch';
import getUserProfileComposable, {
  getAllUsersComposable,
  editUserComposable,
  addUserComposable,
  updatePasswordComposable,
} from '~/composables/userApiComposable';

vi.mock('~/utils/retryFetch', () => ({ default: vi.fn() }));

const mockFetch = vi.mocked(retryFetch);

describe('userApiComposable', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue({} as any);
  });

  afterEach(() => vi.clearAllMocks());

  it('getUserProfileComposable — POST with userId in body', async () => {
    await getUserProfileComposable(42);
    expect(mockFetch).toHaveBeenCalledWith('/api/user/getProfile', {
      method: 'POST',
      body: { userId: 42 },
    });
  });

  it('getAllUsersComposable — POST with no body', async () => {
    await getAllUsersComposable();
    expect(mockFetch).toHaveBeenCalledWith('/api/user/getAllUsers', {
      method: 'POST',
    });
  });

  it('editUserComposable — POST with spread body', async () => {
    const body = { user_id: 1, name: 'Alice', email: 'a@b.com' };
    await editUserComposable(body as any);
    expect(mockFetch).toHaveBeenCalledWith('/api/user/editUser', {
      method: 'POST',
      body,
    });
  });

  it('addUserComposable — POST with spread body', async () => {
    const body = { name: 'Bob', email: 'b@b.com', password: 'pass', department_id: 1, role_id: 4 };
    await addUserComposable(body as any);
    expect(mockFetch).toHaveBeenCalledWith('/api/user/addUser', {
      method: 'POST',
      body,
    });
  });

  it('updatePasswordComposable — POST with spread body', async () => {
    const body = { user_id: 1, old_password: 'old', password: 'new' };
    await updatePasswordComposable(body as any);
    expect(mockFetch).toHaveBeenCalledWith('/api/user/updatePassword', {
      method: 'POST',
      body,
    });
  });
});
