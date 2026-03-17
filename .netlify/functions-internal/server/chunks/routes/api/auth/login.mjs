import { d as defineEventHandler, e as useRuntimeConfig, r as readBody, f as createJWT, s as setCookie, h as createError } from '../../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'jsonwebtoken';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const login = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  try {
    const result = await $fetch(`${config.public.apiBase}${config.public.auth.auth}`, {
      method: "POST",
      body: {
        email: body.email,
        password: body.password
      },
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": config.apiSecret
      }
    });
    if (typeof result === "string") {
      throw new Error(result);
    } else {
      const {
        user_id,
        token
      } = result;
      const authToken = createJWT(user_id, token);
      setCookie(event, "auth_token", authToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 15
      });
      setCookie(event, "user_authed", "true", {
        httpOnly: false,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 15
      });
      return { userId: user_id, message: "Authenticated successfully" };
    }
    throw new Error(`Authentication failed`);
  } catch (error) {
    console.error("Authentication error:", error);
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication failed"
    });
  }
});

export { login as default };
//# sourceMappingURL=login.mjs.map
