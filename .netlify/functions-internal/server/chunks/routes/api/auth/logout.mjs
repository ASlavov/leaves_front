import { d as defineEventHandler, i as getCookie, j as deleteCookie } from '../../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'jsonwebtoken';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const logout = defineEventHandler(async (event) => {
  const userAuthed = getCookie(event, 'auth_token');
  if (userAuthed) {
    deleteCookie(event, 'auth_token');
    deleteCookie(event, 'user_authed');
    return {
      authenticated: false,
      message: 'Logged out',
    };
  }
  return {
    authenticated: false,
  };
});

export { logout as default };
//# sourceMappingURL=logout.mjs.map
