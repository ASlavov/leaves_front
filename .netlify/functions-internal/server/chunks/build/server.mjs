import { ref, computed, hasInjectionContext, getCurrentInstance, inject, toValue, reactive, watch, onServerPrefetch, shallowRef, toRef, nextTick, unref, defineComponent, createElementBlock, provide, cloneVNode, h, Suspense, Fragment, createApp, shallowReactive, onErrorCaptured, createVNode, resolveDynamicComponent, effectScope, isReadonly, isRef, isShallow, isReactive, toRaw, defineAsyncComponent, mergeProps, getCurrentScope, useSSRContext } from 'vue';
import { x as hasProtocol, y as isScriptProtocol, z as joinURL, w as withQuery, A as sanitizeStatusCode, B as getContext, C as destr, D as klona, E as parse, F as getRequestHeader, G as isEqual, H as hash, s as setCookie, i as getCookie, j as deleteCookie, h as createError$1, $ as $fetch$1, I as createHooks, J as executeAsync, K as toRouteMatcher, L as createRouter$1, M as defu } from '../_/nitro.mjs';
import { u as useHead$1, h as headSymbol, b as baseURL } from '../routes/renderer.mjs';
import { defineStore, createPinia, setActivePinia, shouldHydrate } from 'pinia';
import { useRouter as useRouter$1, RouterView, createMemoryHistory, createRouter, START_LOCATION } from 'vue-router';
import { deepPickUnsafe, deepOmitUnsafe } from 'deep-pick-omit';
import { ssrRenderSuspense, ssrRenderComponent, ssrRenderVNode, ssrRenderAttrs } from 'vue/server-renderer';
import { isPlainObject } from '@vue/shared';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'jsonwebtoken';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';

const DEBOUNCE_DEFAULTS = {
  trailing: true
};
function debounce(fn, wait = 25, options = {}) {
  options = { ...DEBOUNCE_DEFAULTS, ...options };
  if (!Number.isFinite(wait)) {
    throw new TypeError("Expected `wait` to be a finite number");
  }
  let leadingValue;
  let timeout;
  let resolveList = [];
  let currentPromise;
  let trailingArgs;
  const applyFn = (_this, args) => {
    currentPromise = _applyPromised(fn, _this, args);
    currentPromise.finally(() => {
      currentPromise = null;
      if (options.trailing && trailingArgs && !timeout) {
        const promise = applyFn(_this, trailingArgs);
        trailingArgs = null;
        return promise;
      }
    });
    return currentPromise;
  };
  return function(...args) {
    if (currentPromise) {
      if (options.trailing) {
        trailingArgs = args;
      }
      return currentPromise;
    }
    return new Promise((resolve) => {
      const shouldCallNow = !timeout && options.leading;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        timeout = null;
        const promise = options.leading ? leadingValue : applyFn(this, args);
        for (const _resolve of resolveList) {
          _resolve(promise);
        }
        resolveList = [];
      }, wait);
      if (shouldCallNow) {
        leadingValue = applyFn(this, args);
        resolve(leadingValue);
      } else {
        resolveList.push(resolve);
      }
    });
  };
}
async function _applyPromised(fn, _this, args) {
  return await fn.apply(_this, args);
}

if (!globalThis.$fetch) {
  globalThis.$fetch = $fetch$1.create({
    baseURL: baseURL()
  });
}
if (!("global" in globalThis)) {
  globalThis.global = globalThis;
}
const nuxtLinkDefaults = { "componentName": "NuxtLink" };
const asyncDataDefaults = { "value": null, "errorValue": null, "deep": true };
const fetchDefaults = {};
const appId = "nuxt-app";
function getNuxtAppCtx(id = appId) {
  return getContext(id, {
    asyncContext: false
  });
}
const NuxtPluginIndicator = "__nuxt_plugin";
function createNuxtApp(options) {
  var _a;
  let hydratingCount = 0;
  const nuxtApp = {
    _id: options.id || appId || "nuxt-app",
    _scope: effectScope(),
    provide: void 0,
    globalName: "nuxt",
    versions: {
      get nuxt() {
        return "3.17.5";
      },
      get vue() {
        return nuxtApp.vueApp.version;
      }
    },
    payload: shallowReactive({
      ...((_a = options.ssrContext) == null ? void 0 : _a.payload) || {},
      data: shallowReactive({}),
      state: reactive({}),
      once: /* @__PURE__ */ new Set(),
      _errors: shallowReactive({})
    }),
    static: {
      data: {}
    },
    runWithContext(fn) {
      if (nuxtApp._scope.active && !getCurrentScope()) {
        return nuxtApp._scope.run(() => callWithNuxt(nuxtApp, fn));
      }
      return callWithNuxt(nuxtApp, fn);
    },
    isHydrating: false,
    deferHydration() {
      if (!nuxtApp.isHydrating) {
        return () => {
        };
      }
      hydratingCount++;
      let called = false;
      return () => {
        if (called) {
          return;
        }
        called = true;
        hydratingCount--;
        if (hydratingCount === 0) {
          nuxtApp.isHydrating = false;
          return nuxtApp.callHook("app:suspense:resolve");
        }
      };
    },
    _asyncDataPromises: {},
    _asyncData: shallowReactive({}),
    _payloadRevivers: {},
    ...options
  };
  {
    nuxtApp.payload.serverRendered = true;
  }
  if (nuxtApp.ssrContext) {
    nuxtApp.payload.path = nuxtApp.ssrContext.url;
    nuxtApp.ssrContext.nuxt = nuxtApp;
    nuxtApp.ssrContext.payload = nuxtApp.payload;
    nuxtApp.ssrContext.config = {
      public: nuxtApp.ssrContext.runtimeConfig.public,
      app: nuxtApp.ssrContext.runtimeConfig.app
    };
  }
  nuxtApp.hooks = createHooks();
  nuxtApp.hook = nuxtApp.hooks.hook;
  {
    const contextCaller = async function(hooks, args) {
      for (const hook of hooks) {
        await nuxtApp.runWithContext(() => hook(...args));
      }
    };
    nuxtApp.hooks.callHook = (name, ...args) => nuxtApp.hooks.callHookWith(contextCaller, name, ...args);
  }
  nuxtApp.callHook = nuxtApp.hooks.callHook;
  nuxtApp.provide = (name, value) => {
    const $name = "$" + name;
    defineGetter(nuxtApp, $name, value);
    defineGetter(nuxtApp.vueApp.config.globalProperties, $name, value);
  };
  defineGetter(nuxtApp.vueApp, "$nuxt", nuxtApp);
  defineGetter(nuxtApp.vueApp.config.globalProperties, "$nuxt", nuxtApp);
  const runtimeConfig = options.ssrContext.runtimeConfig;
  nuxtApp.provide("config", runtimeConfig);
  return nuxtApp;
}
function registerPluginHooks(nuxtApp, plugin2) {
  if (plugin2.hooks) {
    nuxtApp.hooks.addHooks(plugin2.hooks);
  }
}
async function applyPlugin(nuxtApp, plugin2) {
  if (typeof plugin2 === "function") {
    const { provide: provide2 } = await nuxtApp.runWithContext(() => plugin2(nuxtApp)) || {};
    if (provide2 && typeof provide2 === "object") {
      for (const key in provide2) {
        nuxtApp.provide(key, provide2[key]);
      }
    }
  }
}
async function applyPlugins(nuxtApp, plugins2) {
  var _a, _b, _c, _d;
  const resolvedPlugins = /* @__PURE__ */ new Set();
  const unresolvedPlugins = [];
  const parallels = [];
  const errors = [];
  let promiseDepth = 0;
  async function executePlugin(plugin2) {
    var _a2;
    const unresolvedPluginsForThisPlugin = ((_a2 = plugin2.dependsOn) == null ? void 0 : _a2.filter((name) => plugins2.some((p) => p._name === name) && !resolvedPlugins.has(name))) ?? [];
    if (unresolvedPluginsForThisPlugin.length > 0) {
      unresolvedPlugins.push([new Set(unresolvedPluginsForThisPlugin), plugin2]);
    } else {
      const promise = applyPlugin(nuxtApp, plugin2).then(async () => {
        if (plugin2._name) {
          resolvedPlugins.add(plugin2._name);
          await Promise.all(unresolvedPlugins.map(async ([dependsOn, unexecutedPlugin]) => {
            if (dependsOn.has(plugin2._name)) {
              dependsOn.delete(plugin2._name);
              if (dependsOn.size === 0) {
                promiseDepth++;
                await executePlugin(unexecutedPlugin);
              }
            }
          }));
        }
      });
      if (plugin2.parallel) {
        parallels.push(promise.catch((e) => errors.push(e)));
      } else {
        await promise;
      }
    }
  }
  for (const plugin2 of plugins2) {
    if (((_a = nuxtApp.ssrContext) == null ? void 0 : _a.islandContext) && ((_b = plugin2.env) == null ? void 0 : _b.islands) === false) {
      continue;
    }
    registerPluginHooks(nuxtApp, plugin2);
  }
  for (const plugin2 of plugins2) {
    if (((_c = nuxtApp.ssrContext) == null ? void 0 : _c.islandContext) && ((_d = plugin2.env) == null ? void 0 : _d.islands) === false) {
      continue;
    }
    await executePlugin(plugin2);
  }
  await Promise.all(parallels);
  if (promiseDepth) {
    for (let i = 0; i < promiseDepth; i++) {
      await Promise.all(parallels);
    }
  }
  if (errors.length) {
    throw errors[0];
  }
}
// @__NO_SIDE_EFFECTS__
function defineNuxtPlugin(plugin2) {
  if (typeof plugin2 === "function") {
    return plugin2;
  }
  const _name = plugin2._name || plugin2.name;
  delete plugin2.name;
  return Object.assign(plugin2.setup || (() => {
  }), plugin2, { [NuxtPluginIndicator]: true, _name });
}
const definePayloadPlugin = defineNuxtPlugin;
function callWithNuxt(nuxt, setup, args) {
  const fn = () => setup();
  const nuxtAppCtx = getNuxtAppCtx(nuxt._id);
  {
    return nuxt.vueApp.runWithContext(() => nuxtAppCtx.callAsync(nuxt, fn));
  }
}
function tryUseNuxtApp(id) {
  var _a;
  let nuxtAppInstance;
  if (hasInjectionContext()) {
    nuxtAppInstance = (_a = getCurrentInstance()) == null ? void 0 : _a.appContext.app.$nuxt;
  }
  nuxtAppInstance || (nuxtAppInstance = getNuxtAppCtx(id).tryUse());
  return nuxtAppInstance || null;
}
function useNuxtApp(id) {
  const nuxtAppInstance = tryUseNuxtApp(id);
  if (!nuxtAppInstance) {
    {
      throw new Error("[nuxt] instance unavailable");
    }
  }
  return nuxtAppInstance;
}
// @__NO_SIDE_EFFECTS__
function useRuntimeConfig(_event) {
  return useNuxtApp().$config;
}
function defineGetter(obj, key, val) {
  Object.defineProperty(obj, key, { get: () => val });
}
const LayoutMetaSymbol = Symbol("layout-meta");
const PageRouteSymbol = Symbol("route");
const useRouter = () => {
  var _a;
  return (_a = useNuxtApp()) == null ? void 0 : _a.$router;
};
const useRoute = () => {
  if (hasInjectionContext()) {
    return inject(PageRouteSymbol, useNuxtApp()._route);
  }
  return useNuxtApp()._route;
};
// @__NO_SIDE_EFFECTS__
function defineNuxtRouteMiddleware(middleware) {
  return middleware;
}
const isProcessingMiddleware = () => {
  try {
    if (useNuxtApp()._processingMiddleware) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
};
const URL_QUOTE_RE = /"/g;
const navigateTo = (to, options) => {
  to || (to = "/");
  const toPath = typeof to === "string" ? to : "path" in to ? resolveRouteObject(to) : useRouter().resolve(to).href;
  const isExternalHost = hasProtocol(toPath, { acceptRelative: true });
  const isExternal = (options == null ? void 0 : options.external) || isExternalHost;
  if (isExternal) {
    if (!(options == null ? void 0 : options.external)) {
      throw new Error("Navigating to an external URL is not allowed by default. Use `navigateTo(url, { external: true })`.");
    }
    const { protocol } = new URL(toPath, "http://localhost");
    if (protocol && isScriptProtocol(protocol)) {
      throw new Error(`Cannot navigate to a URL with '${protocol}' protocol.`);
    }
  }
  const inMiddleware = isProcessingMiddleware();
  const router = useRouter();
  const nuxtApp = useNuxtApp();
  {
    if (nuxtApp.ssrContext) {
      const fullPath = typeof to === "string" || isExternal ? toPath : router.resolve(to).fullPath || "/";
      const location2 = isExternal ? toPath : joinURL((/* @__PURE__ */ useRuntimeConfig()).app.baseURL, fullPath);
      const redirect = async function(response) {
        await nuxtApp.callHook("app:redirected");
        const encodedLoc = location2.replace(URL_QUOTE_RE, "%22");
        const encodedHeader = encodeURL(location2, isExternalHost);
        nuxtApp.ssrContext._renderResponse = {
          statusCode: sanitizeStatusCode((options == null ? void 0 : options.redirectCode) || 302, 302),
          body: `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`,
          headers: { location: encodedHeader }
        };
        return response;
      };
      if (!isExternal && inMiddleware) {
        router.afterEach((final) => final.fullPath === fullPath ? redirect(false) : void 0);
        return to;
      }
      return redirect(!inMiddleware ? void 0 : (
        /* abort route navigation */
        false
      ));
    }
  }
  if (isExternal) {
    nuxtApp._scope.stop();
    if (options == null ? void 0 : options.replace) {
      (void 0).replace(toPath);
    } else {
      (void 0).href = toPath;
    }
    if (inMiddleware) {
      if (!nuxtApp.isHydrating) {
        return false;
      }
      return new Promise(() => {
      });
    }
    return Promise.resolve();
  }
  return (options == null ? void 0 : options.replace) ? router.replace(to) : router.push(to);
};
function resolveRouteObject(to) {
  return withQuery(to.path || "", to.query || {}) + (to.hash || "");
}
function encodeURL(location2, isExternalHost = false) {
  const url = new URL(location2, "http://localhost");
  if (!isExternalHost) {
    return url.pathname + url.search + url.hash;
  }
  if (location2.startsWith("//")) {
    return url.toString().replace(url.protocol, "");
  }
  return url.toString();
}
const NUXT_ERROR_SIGNATURE = "__nuxt_error";
const useError = () => toRef(useNuxtApp().payload, "error");
const showError = (error) => {
  const nuxtError = createError(error);
  try {
    const nuxtApp = useNuxtApp();
    const error2 = useError();
    if (false) ;
    error2.value || (error2.value = nuxtError);
  } catch {
    throw nuxtError;
  }
  return nuxtError;
};
const isNuxtError = (error) => !!error && typeof error === "object" && NUXT_ERROR_SIGNATURE in error;
const createError = (error) => {
  const nuxtError = createError$1(error);
  Object.defineProperty(nuxtError, NUXT_ERROR_SIGNATURE, {
    value: true,
    configurable: false,
    writable: false
  });
  return nuxtError;
};
function injectHead(nuxtApp) {
  var _a;
  const nuxt = nuxtApp || tryUseNuxtApp();
  return ((_a = nuxt == null ? void 0 : nuxt.ssrContext) == null ? void 0 : _a.head) || (nuxt == null ? void 0 : nuxt.runWithContext(() => {
    if (hasInjectionContext()) {
      return inject(headSymbol);
    }
  }));
}
function useHead(input, options = {}) {
  const head = injectHead(options.nuxt);
  if (head) {
    return useHead$1(input, { head, ...options });
  }
}
async function getRouteRules(arg) {
  const path = typeof arg === "string" ? arg : arg.path;
  {
    useNuxtApp().ssrContext._preloadManifest = true;
    const _routeRulesMatcher = toRouteMatcher(
      createRouter$1({ routes: (/* @__PURE__ */ useRuntimeConfig()).nitro.routeRules })
    );
    return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
  }
}
function definePayloadReducer(name, reduce) {
  {
    useNuxtApp().ssrContext._payloadReducers[name] = reduce;
  }
}
const payloadPlugin = definePayloadPlugin(() => {
  definePayloadReducer(
    "skipHydrate",
    // We need to return something truthy to be treated as a match
    (data) => !shouldHydrate(data) && 1
  );
});
const unhead_k2P3m_ZDyjlr2mMYnoDPwavjsDN8hBlk9cFai0bbopU = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:head",
  enforce: "pre",
  setup(nuxtApp) {
    const head = nuxtApp.ssrContext.head;
    nuxtApp.vueApp.use(head);
  }
});
function toArray(value) {
  return Array.isArray(value) ? value : [value];
}
const _routes = [
  {
    name: "home",
    path: "/home",
    component: () => import('./home-C9ukUyfY.mjs')
  },
  {
    name: "calendar",
    path: "/calendar",
    component: () => import('./calendar-hHIEONAQ.mjs')
  },
  {
    name: "settings",
    path: "/settings",
    component: () => import('./settings-ek0nhANl.mjs')
  },
  {
    name: "auth-login",
    path: "/auth/login",
    component: () => import('./login-CPmiFCeb.mjs')
  },
  {
    name: "yearly-leaves",
    path: "/yearly-leaves",
    component: () => import('./yearly-leaves-DIXsbFk0.mjs')
  },
  {
    name: "auth-forgot-password",
    path: "/auth/forgot-password",
    component: () => import('./forgot-password-ChO7P9kL.mjs')
  }
];
const ROUTE_KEY_PARENTHESES_RE = /(:\w+)\([^)]+\)/g;
const ROUTE_KEY_SYMBOLS_RE = /(:\w+)[?+*]/g;
const ROUTE_KEY_NORMAL_RE = /:\w+/g;
function generateRouteKey(route) {
  const source = (route == null ? void 0 : route.meta.key) ?? route.path.replace(ROUTE_KEY_PARENTHESES_RE, "$1").replace(ROUTE_KEY_SYMBOLS_RE, "$1").replace(ROUTE_KEY_NORMAL_RE, (r) => {
    var _a;
    return ((_a = route.params[r.slice(1)]) == null ? void 0 : _a.toString()) || "";
  });
  return typeof source === "function" ? source(route) : source;
}
function isChangingPage(to, from) {
  if (to === from || from === START_LOCATION) {
    return false;
  }
  if (generateRouteKey(to) !== generateRouteKey(from)) {
    return true;
  }
  const areComponentsSame = to.matched.every(
    (comp, index) => {
      var _a, _b;
      return comp.components && comp.components.default === ((_b = (_a = from.matched[index]) == null ? void 0 : _a.components) == null ? void 0 : _b.default);
    }
  );
  if (areComponentsSame) {
    return false;
  }
  return true;
}
const routerOptions0 = {
  scrollBehavior(to, from, savedPosition) {
    var _a;
    const nuxtApp = useNuxtApp();
    const behavior = ((_a = useRouter().options) == null ? void 0 : _a.scrollBehaviorType) ?? "auto";
    if (to.path === from.path) {
      if (from.hash && !to.hash) {
        return { left: 0, top: 0 };
      }
      if (to.hash) {
        return { el: to.hash, top: _getHashElementScrollMarginTop(to.hash), behavior };
      }
      return false;
    }
    const routeAllowsScrollToTop = typeof to.meta.scrollToTop === "function" ? to.meta.scrollToTop(to, from) : to.meta.scrollToTop;
    if (routeAllowsScrollToTop === false) {
      return false;
    }
    let position = savedPosition || void 0;
    if (!position && isChangingPage(to, from)) {
      position = { left: 0, top: 0 };
    }
    const hookToWait = nuxtApp._runningTransition ? "page:transition:finish" : "page:loading:end";
    return new Promise((resolve) => {
      if (from === START_LOCATION) {
        resolve(_calculatePosition(to, "instant", position));
        return;
      }
      nuxtApp.hooks.hookOnce(hookToWait, () => {
        requestAnimationFrame(() => resolve(_calculatePosition(to, "instant", position)));
      });
    });
  }
};
function _getHashElementScrollMarginTop(selector) {
  try {
    const elem = (void 0).querySelector(selector);
    if (elem) {
      return (Number.parseFloat(getComputedStyle(elem).scrollMarginTop) || 0) + (Number.parseFloat(getComputedStyle((void 0).documentElement).scrollPaddingTop) || 0);
    }
  } catch {
  }
  return 0;
}
function _calculatePosition(to, scrollBehaviorType, position) {
  if (position) {
    return position;
  }
  if (to.hash) {
    return {
      el: to.hash,
      top: _getHashElementScrollMarginTop(to.hash),
      behavior: scrollBehaviorType
    };
  }
  return { left: 0, top: 0, behavior: scrollBehaviorType };
}
const routerOptions1 = {
  scrollBehavior(to, from, savedPosition) {
    if (to.path.startsWith("/settings")) {
      return false;
    }
    if (savedPosition) {
      return savedPosition;
    } else if (to.hash) {
      return { el: to.hash };
    } else {
      return { top: 0 };
    }
  }
};
const configRouterOptions = {
  hashMode: false,
  scrollBehaviorType: "auto"
};
const hashMode = routerOptions0.hashMode ?? false;
const routerOptions = {
  ...configRouterOptions,
  ...routerOptions0,
  ...routerOptions1
};
const validate = /* @__PURE__ */ defineNuxtRouteMiddleware(async (to, from) => {
  var _a;
  let __temp, __restore;
  if (!((_a = to.meta) == null ? void 0 : _a.validate)) {
    return;
  }
  const result = ([__temp, __restore] = executeAsync(() => Promise.resolve(to.meta.validate(to))), __temp = await __temp, __restore(), __temp);
  if (result === true) {
    return;
  }
  const error = createError({
    fatal: false,
    statusCode: result && result.statusCode || 404,
    statusMessage: result && result.statusMessage || `Page Not Found: ${to.fullPath}`,
    data: {
      path: to.fullPath
    }
  });
  return error;
});
function useRequestEvent(nuxtApp) {
  var _a;
  nuxtApp || (nuxtApp = useNuxtApp());
  return (_a = nuxtApp.ssrContext) == null ? void 0 : _a.event;
}
function useRequestFetch() {
  var _a;
  return ((_a = useRequestEvent()) == null ? void 0 : _a.$fetch) || globalThis.$fetch;
}
const CookieDefaults = {
  path: "/",
  watch: true,
  decode: (val) => destr(decodeURIComponent(val)),
  encode: (val) => encodeURIComponent(typeof val === "string" ? val : JSON.stringify(val))
};
function useCookie(name, _opts) {
  var _a;
  const opts = { ...CookieDefaults, ..._opts };
  opts.filter ?? (opts.filter = (key) => key === name);
  const cookies2 = readRawCookies(opts) || {};
  let delay;
  if (opts.maxAge !== void 0) {
    delay = opts.maxAge * 1e3;
  } else if (opts.expires) {
    delay = opts.expires.getTime() - Date.now();
  }
  const hasExpired = delay !== void 0 && delay <= 0;
  const cookieValue = klona(hasExpired ? void 0 : cookies2[name] ?? ((_a = opts.default) == null ? void 0 : _a.call(opts)));
  const cookie = ref(cookieValue);
  {
    const nuxtApp = useNuxtApp();
    const writeFinalCookieValue = () => {
      if (opts.readonly || isEqual(cookie.value, cookies2[name])) {
        return;
      }
      nuxtApp._cookies || (nuxtApp._cookies = {});
      if (name in nuxtApp._cookies) {
        if (isEqual(cookie.value, nuxtApp._cookies[name])) {
          return;
        }
      }
      nuxtApp._cookies[name] = cookie.value;
      writeServerCookie(useRequestEvent(nuxtApp), name, cookie.value, opts);
    };
    const unhook = nuxtApp.hooks.hookOnce("app:rendered", writeFinalCookieValue);
    nuxtApp.hooks.hookOnce("app:error", () => {
      unhook();
      return writeFinalCookieValue();
    });
  }
  return cookie;
}
function readRawCookies(opts = {}) {
  {
    return parse(getRequestHeader(useRequestEvent(), "cookie") || "", opts);
  }
}
function writeServerCookie(event, name, value, opts = {}) {
  if (event) {
    if (value !== null && value !== void 0) {
      return setCookie(event, name, value, opts);
    }
    if (getCookie(event, name) !== void 0) {
      return deleteCookie(event, name, opts);
    }
  }
}
const auth_45global = /* @__PURE__ */ defineNuxtRouteMiddleware(async (to, from) => {
  const publicPaths = ["/auth/login", "/auth/forgot-password"];
  const isPublicPath = publicPaths.includes(to.path);
  const fromPublicPath = publicPaths.includes(from.path);
  const userAuthed = useCookie("user_authed");
  const isAuthenticated = !!userAuthed.value;
  if (isAuthenticated && isPublicPath && !fromPublicPath) {
    return navigateTo("/home");
  }
  if (!isAuthenticated && !isPublicPath && !fromPublicPath) {
    return navigateTo("/auth/login");
  }
});
const manifest_45route_45rule = /* @__PURE__ */ defineNuxtRouteMiddleware(async (to) => {
  {
    return;
  }
});
const globalMiddleware = [
  validate,
  auth_45global,
  manifest_45route_45rule
];
const namedMiddleware = {};
const plugin$1 = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:router",
  enforce: "pre",
  async setup(nuxtApp) {
    var _a, _b, _c;
    let __temp, __restore;
    let routerBase = (/* @__PURE__ */ useRuntimeConfig()).app.baseURL;
    if (hashMode && !routerBase.includes("#")) {
      routerBase += "#";
    }
    const history = ((_a = routerOptions.history) == null ? void 0 : _a.call(routerOptions, routerBase)) ?? createMemoryHistory(routerBase);
    const routes = routerOptions.routes ? ([__temp, __restore] = executeAsync(() => routerOptions.routes(_routes)), __temp = await __temp, __restore(), __temp) ?? _routes : _routes;
    let startPosition;
    const router = createRouter({
      ...routerOptions,
      scrollBehavior: (to, from, savedPosition) => {
        if (from === START_LOCATION) {
          startPosition = savedPosition;
          return;
        }
        if (routerOptions.scrollBehavior) {
          router.options.scrollBehavior = routerOptions.scrollBehavior;
          if ("scrollRestoration" in (void 0).history) {
            const unsub = router.beforeEach(() => {
              unsub();
              (void 0).history.scrollRestoration = "manual";
            });
          }
          return routerOptions.scrollBehavior(to, START_LOCATION, startPosition || savedPosition);
        }
      },
      history,
      routes
    });
    nuxtApp.vueApp.use(router);
    const previousRoute = shallowRef(router.currentRoute.value);
    router.afterEach((_to, from) => {
      previousRoute.value = from;
    });
    Object.defineProperty(nuxtApp.vueApp.config.globalProperties, "previousRoute", {
      get: () => previousRoute.value
    });
    const initialURL = nuxtApp.ssrContext.url;
    const _route = shallowRef(router.currentRoute.value);
    const syncCurrentRoute = () => {
      _route.value = router.currentRoute.value;
    };
    nuxtApp.hook("page:finish", syncCurrentRoute);
    router.afterEach((to, from) => {
      var _a2, _b2, _c2, _d;
      if (((_b2 = (_a2 = to.matched[0]) == null ? void 0 : _a2.components) == null ? void 0 : _b2.default) === ((_d = (_c2 = from.matched[0]) == null ? void 0 : _c2.components) == null ? void 0 : _d.default)) {
        syncCurrentRoute();
      }
    });
    const route = {};
    for (const key in _route.value) {
      Object.defineProperty(route, key, {
        get: () => _route.value[key],
        enumerable: true
      });
    }
    nuxtApp._route = shallowReactive(route);
    nuxtApp._middleware || (nuxtApp._middleware = {
      global: [],
      named: {}
    });
    useError();
    if (!((_b = nuxtApp.ssrContext) == null ? void 0 : _b.islandContext)) {
      router.afterEach(async (to, _from, failure) => {
        delete nuxtApp._processingMiddleware;
        if (failure) {
          await nuxtApp.callHook("page:loading:end");
        }
        if ((failure == null ? void 0 : failure.type) === 4) {
          return;
        }
        if (to.redirectedFrom && to.fullPath !== initialURL) {
          await nuxtApp.runWithContext(() => navigateTo(to.fullPath || "/"));
        }
      });
    }
    try {
      if (true) {
        ;
        [__temp, __restore] = executeAsync(() => router.push(initialURL)), await __temp, __restore();
        ;
      }
      ;
      [__temp, __restore] = executeAsync(() => router.isReady()), await __temp, __restore();
      ;
    } catch (error2) {
      [__temp, __restore] = executeAsync(() => nuxtApp.runWithContext(() => showError(error2))), await __temp, __restore();
    }
    const resolvedInitialRoute = router.currentRoute.value;
    syncCurrentRoute();
    if ((_c = nuxtApp.ssrContext) == null ? void 0 : _c.islandContext) {
      return { provide: { router } };
    }
    const initialLayout = nuxtApp.payload.state._layout;
    router.beforeEach(async (to, from) => {
      var _a2, _b2;
      await nuxtApp.callHook("page:loading:start");
      to.meta = reactive(to.meta);
      if (nuxtApp.isHydrating && initialLayout && !isReadonly(to.meta.layout)) {
        to.meta.layout = initialLayout;
      }
      nuxtApp._processingMiddleware = true;
      if (!((_a2 = nuxtApp.ssrContext) == null ? void 0 : _a2.islandContext)) {
        const middlewareEntries = /* @__PURE__ */ new Set([...globalMiddleware, ...nuxtApp._middleware.global]);
        for (const component of to.matched) {
          const componentMiddleware = component.meta.middleware;
          if (!componentMiddleware) {
            continue;
          }
          for (const entry2 of toArray(componentMiddleware)) {
            middlewareEntries.add(entry2);
          }
        }
        {
          const routeRules = await nuxtApp.runWithContext(() => getRouteRules({ path: to.path }));
          if (routeRules.appMiddleware) {
            for (const key in routeRules.appMiddleware) {
              if (routeRules.appMiddleware[key]) {
                middlewareEntries.add(key);
              } else {
                middlewareEntries.delete(key);
              }
            }
          }
        }
        for (const entry2 of middlewareEntries) {
          const middleware = typeof entry2 === "string" ? nuxtApp._middleware.named[entry2] || await ((_b2 = namedMiddleware[entry2]) == null ? void 0 : _b2.call(namedMiddleware).then((r) => r.default || r)) : entry2;
          if (!middleware) {
            throw new Error(`Unknown route middleware: '${entry2}'.`);
          }
          try {
            const result = await nuxtApp.runWithContext(() => middleware(to, from));
            if (true) {
              if (result === false || result instanceof Error) {
                const error2 = result || createError({
                  statusCode: 404,
                  statusMessage: `Page Not Found: ${initialURL}`
                });
                await nuxtApp.runWithContext(() => showError(error2));
                return false;
              }
            }
            if (result === true) {
              continue;
            }
            if (result === false) {
              return result;
            }
            if (result) {
              if (isNuxtError(result) && result.fatal) {
                await nuxtApp.runWithContext(() => showError(result));
              }
              return result;
            }
          } catch (err) {
            const error2 = createError(err);
            if (error2.fatal) {
              await nuxtApp.runWithContext(() => showError(error2));
            }
            return error2;
          }
        }
      }
    });
    router.onError(async () => {
      delete nuxtApp._processingMiddleware;
      await nuxtApp.callHook("page:loading:end");
    });
    router.afterEach(async (to, _from) => {
      if (to.matched.length === 0) {
        await nuxtApp.runWithContext(() => showError(createError({
          statusCode: 404,
          fatal: false,
          statusMessage: `Page not found: ${to.fullPath}`,
          data: {
            path: to.fullPath
          }
        })));
      }
    });
    nuxtApp.hooks.hookOnce("app:created", async () => {
      try {
        if ("name" in resolvedInitialRoute) {
          resolvedInitialRoute.name = void 0;
        }
        await router.replace({
          ...resolvedInitialRoute,
          force: true
        });
        router.options.scrollBehavior = routerOptions.scrollBehavior;
      } catch (error2) {
        await nuxtApp.runWithContext(() => showError(error2));
      }
    });
    return { provide: { router } };
  }
});
const reducers = [
  ["NuxtError", (data) => isNuxtError(data) && data.toJSON()],
  ["EmptyShallowRef", (data) => isRef(data) && isShallow(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["EmptyRef", (data) => isRef(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["ShallowRef", (data) => isRef(data) && isShallow(data) && data.value],
  ["ShallowReactive", (data) => isReactive(data) && isShallow(data) && toRaw(data)],
  ["Ref", (data) => isRef(data) && data.value],
  ["Reactive", (data) => isReactive(data) && toRaw(data)]
];
const revive_payload_server_MVtmlZaQpj6ApFmshWfUWl5PehCebzaBf2NuRMiIbms = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:revive-payload:server",
  setup() {
    for (const [reducer, fn] of reducers) {
      definePayloadReducer(reducer, fn);
    }
  }
});
defineComponent({
  name: "ServerPlaceholder",
  render() {
    return createElementBlock("div");
  }
});
const clientOnlySymbol = Symbol.for("nuxt:client-only");
defineComponent({
  name: "ClientOnly",
  inheritAttrs: false,
  props: ["fallback", "placeholder", "placeholderTag", "fallbackTag"],
  setup(props, { slots, attrs }) {
    const mounted = shallowRef(false);
    const vm = getCurrentInstance();
    if (vm) {
      vm._nuxtClientOnly = true;
    }
    provide(clientOnlySymbol, true);
    return () => {
      var _a;
      if (mounted.value) {
        const vnodes = (_a = slots.default) == null ? void 0 : _a.call(slots);
        if (vnodes && vnodes.length === 1) {
          return [cloneVNode(vnodes[0], attrs)];
        }
        return vnodes;
      }
      const slot = slots.fallback || slots.placeholder;
      if (slot) {
        return h(slot);
      }
      const fallbackStr = props.fallback || props.placeholder || "";
      const fallbackTag = props.fallbackTag || props.placeholderTag || "span";
      return createElementBlock(fallbackTag, attrs, fallbackStr);
    };
  }
});
const isDefer = (dedupe) => dedupe === "defer" || dedupe === false;
function useAsyncData(...args) {
  var _a;
  const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
  if (_isAutoKeyNeeded(args[0], args[1])) {
    args.unshift(autoKey);
  }
  let [_key, _handler, options = {}] = args;
  const key = computed(() => toValue(_key));
  if (typeof key.value !== "string") {
    throw new TypeError("[nuxt] [useAsyncData] key must be a string.");
  }
  if (typeof _handler !== "function") {
    throw new TypeError("[nuxt] [useAsyncData] handler must be a function.");
  }
  const nuxtApp = useNuxtApp();
  options.server ?? (options.server = true);
  options.default ?? (options.default = getDefault);
  options.getCachedData ?? (options.getCachedData = getDefaultCachedData);
  options.lazy ?? (options.lazy = false);
  options.immediate ?? (options.immediate = true);
  options.deep ?? (options.deep = asyncDataDefaults.deep);
  options.dedupe ?? (options.dedupe = "cancel");
  options._functionName || "useAsyncData";
  nuxtApp._asyncData[key.value];
  const initialFetchOptions = { cause: "initial", dedupe: options.dedupe };
  if (!((_a = nuxtApp._asyncData[key.value]) == null ? void 0 : _a._init)) {
    initialFetchOptions.cachedData = options.getCachedData(key.value, nuxtApp, { cause: "initial" });
    nuxtApp._asyncData[key.value] = createAsyncData(nuxtApp, key.value, _handler, options, initialFetchOptions.cachedData);
  }
  const asyncData = nuxtApp._asyncData[key.value];
  asyncData._deps++;
  const initialFetch = () => nuxtApp._asyncData[key.value].execute(initialFetchOptions);
  const fetchOnServer = options.server !== false && nuxtApp.payload.serverRendered;
  if (fetchOnServer && options.immediate) {
    const promise = initialFetch();
    if (getCurrentInstance()) {
      onServerPrefetch(() => promise);
    } else {
      nuxtApp.hook("app:created", async () => {
        await promise;
      });
    }
  }
  const asyncReturn = {
    data: writableComputedRef(() => {
      var _a2;
      return (_a2 = nuxtApp._asyncData[key.value]) == null ? void 0 : _a2.data;
    }),
    pending: writableComputedRef(() => {
      var _a2;
      return (_a2 = nuxtApp._asyncData[key.value]) == null ? void 0 : _a2.pending;
    }),
    status: writableComputedRef(() => {
      var _a2;
      return (_a2 = nuxtApp._asyncData[key.value]) == null ? void 0 : _a2.status;
    }),
    error: writableComputedRef(() => {
      var _a2;
      return (_a2 = nuxtApp._asyncData[key.value]) == null ? void 0 : _a2.error;
    }),
    refresh: (...args2) => nuxtApp._asyncData[key.value].execute(...args2),
    execute: (...args2) => nuxtApp._asyncData[key.value].execute(...args2),
    clear: () => clearNuxtDataByKey(nuxtApp, key.value)
  };
  const asyncDataPromise = Promise.resolve(nuxtApp._asyncDataPromises[key.value]).then(() => asyncReturn);
  Object.assign(asyncDataPromise, asyncReturn);
  return asyncDataPromise;
}
function writableComputedRef(getter) {
  return computed({
    get() {
      var _a;
      return (_a = getter()) == null ? void 0 : _a.value;
    },
    set(value) {
      const ref2 = getter();
      if (ref2) {
        ref2.value = value;
      }
    }
  });
}
function _isAutoKeyNeeded(keyOrFetcher, fetcher) {
  if (typeof keyOrFetcher === "string") {
    return false;
  }
  if (typeof keyOrFetcher === "object" && keyOrFetcher !== null) {
    return false;
  }
  if (typeof keyOrFetcher === "function" && typeof fetcher === "function") {
    return false;
  }
  return true;
}
function clearNuxtDataByKey(nuxtApp, key) {
  if (key in nuxtApp.payload.data) {
    nuxtApp.payload.data[key] = void 0;
  }
  if (key in nuxtApp.payload._errors) {
    nuxtApp.payload._errors[key] = asyncDataDefaults.errorValue;
  }
  if (nuxtApp._asyncData[key]) {
    nuxtApp._asyncData[key].data.value = void 0;
    nuxtApp._asyncData[key].error.value = asyncDataDefaults.errorValue;
    {
      nuxtApp._asyncData[key].pending.value = false;
    }
    nuxtApp._asyncData[key].status.value = "idle";
  }
  if (key in nuxtApp._asyncDataPromises) {
    if (nuxtApp._asyncDataPromises[key]) {
      nuxtApp._asyncDataPromises[key].cancelled = true;
    }
    nuxtApp._asyncDataPromises[key] = void 0;
  }
}
function pick(obj, keys) {
  const newObj = {};
  for (const key of keys) {
    newObj[key] = obj[key];
  }
  return newObj;
}
function createAsyncData(nuxtApp, key, _handler, options, initialCachedData) {
  var _a;
  (_a = nuxtApp.payload._errors)[key] ?? (_a[key] = asyncDataDefaults.errorValue);
  const hasCustomGetCachedData = options.getCachedData !== getDefaultCachedData;
  const handler = _handler ;
  const _ref = options.deep ? ref : shallowRef;
  const hasCachedData = initialCachedData != null;
  const unsubRefreshAsyncData = nuxtApp.hook("app:data:refresh", async (keys) => {
    if (!keys || keys.includes(key)) {
      await asyncData.execute({ cause: "refresh:hook" });
    }
  });
  const asyncData = {
    data: _ref(hasCachedData ? initialCachedData : options.default()),
    pending: shallowRef(!hasCachedData),
    error: toRef(nuxtApp.payload._errors, key),
    status: shallowRef("idle"),
    execute: (opts = {}) => {
      if (nuxtApp._asyncDataPromises[key]) {
        if (isDefer(opts.dedupe ?? options.dedupe)) {
          return nuxtApp._asyncDataPromises[key];
        }
        nuxtApp._asyncDataPromises[key].cancelled = true;
      }
      if (opts.cause === "initial" || nuxtApp.isHydrating) {
        const cachedData = "cachedData" in opts ? opts.cachedData : options.getCachedData(key, nuxtApp, { cause: opts.cause ?? "refresh:manual" });
        if (cachedData != null) {
          nuxtApp.payload.data[key] = asyncData.data.value = cachedData;
          asyncData.error.value = asyncDataDefaults.errorValue;
          asyncData.status.value = "success";
          return Promise.resolve(cachedData);
        }
      }
      {
        asyncData.pending.value = true;
      }
      asyncData.status.value = "pending";
      const promise = new Promise(
        (resolve, reject) => {
          try {
            resolve(handler(nuxtApp));
          } catch (err) {
            reject(err);
          }
        }
      ).then(async (_result) => {
        if (promise.cancelled) {
          return nuxtApp._asyncDataPromises[key];
        }
        let result = _result;
        if (options.transform) {
          result = await options.transform(_result);
        }
        if (options.pick) {
          result = pick(result, options.pick);
        }
        nuxtApp.payload.data[key] = result;
        asyncData.data.value = result;
        asyncData.error.value = asyncDataDefaults.errorValue;
        asyncData.status.value = "success";
      }).catch((error) => {
        if (promise.cancelled) {
          return nuxtApp._asyncDataPromises[key];
        }
        asyncData.error.value = createError(error);
        asyncData.data.value = unref(options.default());
        asyncData.status.value = "error";
      }).finally(() => {
        if (promise.cancelled) {
          return;
        }
        {
          asyncData.pending.value = false;
        }
        delete nuxtApp._asyncDataPromises[key];
      });
      nuxtApp._asyncDataPromises[key] = promise;
      return nuxtApp._asyncDataPromises[key];
    },
    _execute: debounce((...args) => asyncData.execute(...args), 0, { leading: true }),
    _default: options.default,
    _deps: 0,
    _init: true,
    _hash: void 0,
    _off: () => {
      var _a2;
      unsubRefreshAsyncData();
      if ((_a2 = nuxtApp._asyncData[key]) == null ? void 0 : _a2._init) {
        nuxtApp._asyncData[key]._init = false;
      }
      if (!hasCustomGetCachedData) {
        nextTick(() => {
          var _a3;
          if (!((_a3 = nuxtApp._asyncData[key]) == null ? void 0 : _a3._init)) {
            clearNuxtDataByKey(nuxtApp, key);
            asyncData.execute = () => Promise.resolve();
            asyncData.data.value = asyncDataDefaults.value;
          }
        });
      }
    }
  };
  return asyncData;
}
const getDefault = () => asyncDataDefaults.value;
const getDefaultCachedData = (key, nuxtApp, ctx) => {
  if (nuxtApp.isHydrating) {
    return nuxtApp.payload.data[key];
  }
  if (ctx.cause !== "refresh:manual" && ctx.cause !== "refresh:hook") {
    return nuxtApp.static.data[key];
  }
};
const useStateKeyPrefix = "$s";
function useState(...args) {
  const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
  if (typeof args[0] !== "string") {
    args.unshift(autoKey);
  }
  const [_key, init] = args;
  if (!_key || typeof _key !== "string") {
    throw new TypeError("[nuxt] [useState] key must be a string: " + _key);
  }
  if (init !== void 0 && typeof init !== "function") {
    throw new Error("[nuxt] [useState] init must be a function: " + init);
  }
  const key = useStateKeyPrefix + _key;
  const nuxtApp = useNuxtApp();
  const state = toRef(nuxtApp.payload.state, key);
  if (state.value === void 0 && init) {
    const initialValue = init();
    if (isRef(initialValue)) {
      nuxtApp.payload.state[key] = initialValue;
      return initialValue;
    }
    state.value = initialValue;
  }
  return state;
}
function useFetch(request, arg1, arg2) {
  const [opts = {}, autoKey] = [{}, arg1];
  const _request = computed(() => toValue(request));
  const key = computed(() => toValue(opts.key) || "$f" + hash([autoKey, typeof _request.value === "string" ? _request.value : "", ...generateOptionSegments(opts)]));
  if (!opts.baseURL && typeof _request.value === "string" && (_request.value[0] === "/" && _request.value[1] === "/")) {
    throw new Error('[nuxt] [useFetch] the request URL must not start with "//".');
  }
  const {
    server,
    lazy,
    default: defaultFn,
    transform,
    pick: pick2,
    watch: watchSources,
    immediate,
    getCachedData,
    deep,
    dedupe,
    ...fetchOptions
  } = opts;
  const _fetchOptions = reactive({
    ...fetchDefaults,
    ...fetchOptions,
    cache: typeof opts.cache === "boolean" ? void 0 : opts.cache
  });
  const _asyncDataOptions = {
    server,
    lazy,
    default: defaultFn,
    transform,
    pick: pick2,
    immediate,
    getCachedData,
    deep,
    dedupe,
    watch: watchSources === false ? [] : [...watchSources || [], _fetchOptions]
  };
  if (!immediate) {
    let setImmediate = function() {
      _asyncDataOptions.immediate = true;
    };
    watch(key, setImmediate, { flush: "sync", once: true });
    watch([...watchSources || [], _fetchOptions], setImmediate, { flush: "sync", once: true });
  }
  let controller;
  const asyncData = useAsyncData(watchSources === false ? key.value : key, () => {
    var _a;
    (_a = controller == null ? void 0 : controller.abort) == null ? void 0 : _a.call(controller, new DOMException("Request aborted as another request to the same endpoint was initiated.", "AbortError"));
    controller = typeof AbortController !== "undefined" ? new AbortController() : {};
    const timeoutLength = toValue(opts.timeout);
    let timeoutId;
    if (timeoutLength) {
      timeoutId = setTimeout(() => controller.abort(new DOMException("Request aborted due to timeout.", "AbortError")), timeoutLength);
      controller.signal.onabort = () => clearTimeout(timeoutId);
    }
    let _$fetch = opts.$fetch || globalThis.$fetch;
    if (!opts.$fetch) {
      const isLocalFetch = typeof _request.value === "string" && _request.value[0] === "/" && (!toValue(opts.baseURL) || toValue(opts.baseURL)[0] === "/");
      if (isLocalFetch) {
        _$fetch = useRequestFetch();
      }
    }
    return _$fetch(_request.value, { signal: controller.signal, ..._fetchOptions }).finally(() => {
      clearTimeout(timeoutId);
    });
  }, _asyncDataOptions);
  return asyncData;
}
function generateOptionSegments(opts) {
  var _a;
  const segments = [
    ((_a = toValue(opts.method)) == null ? void 0 : _a.toUpperCase()) || "GET",
    toValue(opts.baseURL)
  ];
  for (const _obj of [opts.params || opts.query]) {
    const obj = toValue(_obj);
    if (!obj) {
      continue;
    }
    const unwrapped = {};
    for (const [key, value] of Object.entries(obj)) {
      unwrapped[toValue(key)] = toValue(value);
    }
    segments.push(unwrapped);
  }
  if (opts.body) {
    const value = toValue(opts.body);
    if (!value) {
      segments.push(hash(value));
    } else if (value instanceof ArrayBuffer) {
      segments.push(hash(Object.fromEntries([...new Uint8Array(value).entries()].map(([k, v]) => [k, v.toString()]))));
    } else if (value instanceof FormData) {
      const obj = {};
      for (const entry2 of value.entries()) {
        const [key, val] = entry2;
        obj[key] = val instanceof File ? val.name : val;
      }
      segments.push(hash(obj));
    } else if (isPlainObject(value)) {
      segments.push(hash(reactive(value)));
    } else {
      try {
        segments.push(hash(value));
      } catch {
        console.warn("[useFetch] Failed to hash body", value);
      }
    }
  }
  return segments;
}
const plugin = /* @__PURE__ */ defineNuxtPlugin({
  name: "pinia",
  setup(nuxtApp) {
    const pinia = createPinia();
    nuxtApp.vueApp.use(pinia);
    setActivePinia(pinia);
    {
      nuxtApp.payload.pinia = toRaw(pinia.state.value);
    }
    return {
      provide: {
        pinia
      }
    };
  }
});
const components_plugin_z4hgvsiddfKkfXTP6M8M4zG5Cb7sGnDhcryKVM45Di4 = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:global-components"
});
function hydrateStore(store, {
  storage,
  serializer,
  key,
  debug,
  pick: pick2,
  omit,
  beforeHydrate,
  afterHydrate
}, context, runHooks = true) {
  try {
    if (runHooks)
      beforeHydrate == null ? void 0 : beforeHydrate(context);
    const fromStorage = storage.getItem(key);
    if (fromStorage) {
      const deserialized = serializer.deserialize(fromStorage);
      const picked = pick2 ? deepPickUnsafe(deserialized, pick2) : deserialized;
      const omitted = omit ? deepOmitUnsafe(picked, omit) : picked;
      store.$patch(omitted);
    }
    if (runHooks)
      afterHydrate == null ? void 0 : afterHydrate(context);
  } catch (error) {
    if (debug)
      console.error("[pinia-plugin-persistedstate]", error);
  }
}
function persistState(state, {
  storage,
  serializer,
  key,
  debug,
  pick: pick2,
  omit
}) {
  try {
    const picked = pick2 ? deepPickUnsafe(state, pick2) : state;
    const omitted = omit ? deepOmitUnsafe(picked, omit) : picked;
    const toStorage = serializer.serialize(omitted);
    storage.setItem(key, toStorage);
  } catch (error) {
    if (debug)
      console.error("[pinia-plugin-persistedstate]", error);
  }
}
function createPersistence(context, optionsParser, auto) {
  const { pinia, store, options: { persist = auto } } = context;
  if (!persist)
    return;
  if (!(store.$id in pinia.state.value)) {
    const originalStore = pinia._s.get(store.$id.replace("__hot:", ""));
    if (originalStore)
      void Promise.resolve().then(() => originalStore.$persist());
    return;
  }
  const persistenceOptions = Array.isArray(persist) ? persist : persist === true ? [{}] : [persist];
  const persistences = persistenceOptions.map(optionsParser);
  store.$hydrate = ({ runHooks = true } = {}) => {
    persistences.forEach((p) => {
      hydrateStore(store, p, context, runHooks);
    });
  };
  store.$persist = () => {
    persistences.forEach((p) => {
      persistState(store.$state, p);
    });
  };
  persistences.forEach((p) => {
    hydrateStore(store, p, context);
    store.$subscribe(
      (_mutation, state) => persistState(state, p),
      { detached: true }
    );
  });
}
function cookies(options) {
  return {
    getItem: (key) => useCookie(
      key,
      {
        ...options ?? (/* @__PURE__ */ useRuntimeConfig()).public.piniaPluginPersistedstate.cookieOptions ?? {},
        decode: (options == null ? void 0 : options.decode) ?? decodeURIComponent,
        readonly: true
      }
    ).value,
    setItem: (key, value) => useCookie(
      key,
      {
        ...options ?? (/* @__PURE__ */ useRuntimeConfig()).public.piniaPluginPersistedstate.cookieOptions ?? {},
        encode: (options == null ? void 0 : options.encode) ?? encodeURIComponent
      }
    ).value = value
  };
}
function localStorage() {
  return {
    getItem: (key) => null,
    setItem: (key, value) => null
  };
}
function sessionStorage() {
  return {
    getItem: (key) => null,
    setItem: (key, value) => null
  };
}
const storages = {
  cookies,
  localStorage,
  sessionStorage
};
function piniaPlugin(context) {
  const config = /* @__PURE__ */ useRuntimeConfig();
  const options = config.public.piniaPluginPersistedstate;
  createPersistence(
    context,
    (p) => ({
      key: options.key ? options.key.replace(/%id/g, p.key ?? context.store.$id) : p.key ?? context.store.$id,
      debug: p.debug ?? options.debug ?? false,
      serializer: p.serializer ?? {
        serialize: (data) => JSON.stringify(data),
        deserialize: (data) => destr(data)
      },
      storage: p.storage ?? (options.storage ? options.storage === "cookies" ? storages.cookies(options.cookieOptions) : storages[options.storage]() : storages.cookies()),
      beforeHydrate: p.beforeHydrate,
      afterHydrate: p.afterHydrate,
      pick: p.pick,
      omit: p.omit
    }),
    options.auto ?? false
  );
}
const plugin_jjl2DFTrQxMG7TqNyE_rvcIV8r2uFVLO_Sius2B7lXg = /* @__PURE__ */ defineNuxtPlugin({
  name: "pinia-plugin-persistedstate",
  setup({ $pinia }) {
    $pinia.use(piniaPlugin);
  }
});
const preference = "system";
const plugin_server_9Ca9_HhnjAGwBWpwAydRauMHxWoxTDY60BrArRnXN_A = /* @__PURE__ */ defineNuxtPlugin((nuxtApp) => {
  var _a;
  const colorMode = ((_a = nuxtApp.ssrContext) == null ? void 0 : _a.islandContext) ? ref({}) : useState("color-mode", () => reactive({
    preference,
    value: preference,
    unknown: true,
    forced: false
  })).value;
  const htmlAttrs = {};
  {
    useHead({ htmlAttrs });
  }
  useRouter().afterEach((to) => {
    const forcedColorMode = to.meta.colorMode;
    if (forcedColorMode && forcedColorMode !== "system") {
      colorMode.value = htmlAttrs["data-color-mode-forced"] = forcedColorMode;
      colorMode.forced = true;
    } else if (forcedColorMode === "system") {
      console.warn("You cannot force the colorMode to system at the page level.");
    }
  });
  nuxtApp.provide("colorMode", colorMode);
});
const plugins = [
  payloadPlugin,
  unhead_k2P3m_ZDyjlr2mMYnoDPwavjsDN8hBlk9cFai0bbopU,
  plugin$1,
  revive_payload_server_MVtmlZaQpj6ApFmshWfUWl5PehCebzaBf2NuRMiIbms,
  plugin,
  components_plugin_z4hgvsiddfKkfXTP6M8M4zG5Cb7sGnDhcryKVM45Di4,
  plugin_jjl2DFTrQxMG7TqNyE_rvcIV8r2uFVLO_Sius2B7lXg,
  plugin_server_9Ca9_HhnjAGwBWpwAydRauMHxWoxTDY60BrArRnXN_A
];
const defineRouteProvider = (name = "RouteProvider") => defineComponent({
  name,
  props: {
    route: {
      type: Object,
      required: true
    },
    vnode: Object,
    vnodeRef: Object,
    renderKey: String,
    trackRootNodes: Boolean
  },
  setup(props) {
    const previousKey = props.renderKey;
    const previousRoute = props.route;
    const route = {};
    for (const key in props.route) {
      Object.defineProperty(route, key, {
        get: () => previousKey === props.renderKey ? props.route[key] : previousRoute[key],
        enumerable: true
      });
    }
    provide(PageRouteSymbol, shallowReactive(route));
    return () => {
      if (!props.vnode) {
        return props.vnode;
      }
      return h(props.vnode, { ref: props.vnodeRef });
    };
  }
});
const RouteProvider = defineRouteProvider();
const __nuxt_component_0 = defineComponent({
  name: "NuxtPage",
  inheritAttrs: false,
  props: {
    name: {
      type: String
    },
    transition: {
      type: [Boolean, Object],
      default: void 0
    },
    keepalive: {
      type: [Boolean, Object],
      default: void 0
    },
    route: {
      type: Object
    },
    pageKey: {
      type: [Function, String],
      default: null
    }
  },
  setup(props, { attrs, slots, expose }) {
    const nuxtApp = useNuxtApp();
    const pageRef = ref();
    inject(PageRouteSymbol, null);
    expose({ pageRef });
    inject(LayoutMetaSymbol, null);
    nuxtApp.deferHydration();
    return () => {
      return h(RouterView, { name: props.name, route: props.route, ...attrs }, {
        default: (routeProps) => {
          return h(Suspense, { suspensible: true }, {
            default() {
              return h(RouteProvider, {
                vnode: slots.default ? normalizeSlot(slots.default, routeProps) : routeProps.Component,
                route: routeProps.route,
                vnodeRef: pageRef
              });
            }
          });
        }
      });
    };
  }
});
function normalizeSlot(slot, data) {
  const slotContent = slot(data);
  return slotContent.length === 1 ? h(slotContent[0]) : h(Fragment, void 0, slotContent);
}
async function retryFetch(url, options = {}, retries = 3, delay = 1e3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await $fetch(url, options);
      if (response && response.statusCode === 403) {
        console.log("Received statusCode 403 in response data - handling error");
        useFetch("/api/auth/logout", "$oFCJvC2ay0");
        retries = 0;
        return;
      }
      if (response && response.statusCode === 422) {
        console.log("Received statusCode 422 in response data - handling error");
        retries = 0;
        return;
      }
      if (response && response.statusCode === 500) {
        console.log("Received statusCode 500 in response data - handling error");
        retries = 0;
        return;
      }
      return response;
    } catch (error) {
      if (error.message === "403 Forbidden") {
        return error;
      }
      if (error.statusCode === 422) {
        console.log("Received statusCode 422 in response data - handling error");
        retries = 0;
        return error;
      }
      if (i === retries - 1) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
}
const getUserProfileComposable = async (userId) => {
  return retryFetch("/api/user/getProfile", {
    method: "POST",
    body: {
      userId
    }
  });
};
const getAllUsersComposable = async () => {
  return retryFetch("/api/user/getAllUsers", {
    method: "POST"
  });
};
const editUserComposable = async (body) => {
  return retryFetch("/api/user/editUser", {
    method: "POST",
    body: {
      ...body
    }
  });
};
const updatePasswordComposable = async (body) => {
  return retryFetch("/api/user/updatePassword", {
    method: "POST",
    body: {
      ...body
    }
  });
};
const getUserLeavesComposable = (userId) => {
  return retryFetch("/api/leaves/getLeavesByUser", {
    method: "POST",
    body: { userId }
  });
};
const newLeaveComposable = (body) => {
  return retryFetch("/api/leaves/newLeave", {
    method: "POST",
    body: {
      ...body
    }
  });
};
const cancelLeaveComposable = (body) => {
  return retryFetch("/api/leaves/processLeave", {
    method: "POST",
    body: {
      ...body
    }
  });
};
const adminLeaveActionComposable = (body) => {
  return retryFetch("/api/leaves/processLeave", {
    method: "POST",
    body: {
      ...body
    }
  });
};
const getLeavesTypesComposable = () => {
  return retryFetch("/api/leaves/getLeavesTypes", {
    method: "POST"
  });
};
const getLeavesStatusesComposable = () => {
  return retryFetch("/api/leaves/getLeavesStatuses", {
    method: "POST"
  });
};
const getLeavesAvailableDaysComposable = (userId) => {
  return retryFetch("/api/leaves/getLeavesAvailableDays", {
    method: "POST",
    body: {
      userId
    }
  });
};
const getAllUserLeavesComposable = () => {
  return retryFetch("/api/leaves/getAllForAllUsers", {
    method: "POST"
  });
};
const useUserStore = defineStore("userStore", () => {
  const userId = ref(null);
  const loading = ref(false);
  const permissions = ref({});
  const userInfo = ref({});
  const allUsers = ref([]);
  const error = ref(null);
  function reset() {
    userInfo.value = {};
    allUsers.value = [];
  }
  const setError = (errorMessage) => {
    error.value = errorMessage;
  };
  function setUserId(id) {
    userId.value = id;
  }
  function hasPermission(permission) {
    return permissions.value[permission] === true;
  }
  async function loadUserProfile() {
    if (userId.value) {
      try {
        loading.value = true;
        const fullProfile = await getUserProfileComposable(userId.value);
        permissions.value = {
          "edit_user": true,
          "delete_user": true,
          "view_leaves": false,
          "view_all_users": false,
          "edit_department": true
        };
        userInfo.value = fullProfile;
      } catch (err) {
        setError("Δεν μπορέσαμε να φέρουμε το προφίλ σας");
      } finally {
        loading.value = false;
      }
    }
  }
  async function loadUserProfileById(userId2) {
    return allUsers.value.find((element) => element.id === userId2) || [];
  }
  async function editUser(userId2, userName, userEmail, userDepartment, userRole, userPhone, userInternalPhone, userTitle, userTitleDescription, userImage) {
    try {
      loading.value = true;
      const result = await editUserComposable({
        userId: userId2,
        userName,
        userEmail,
        userDepartment,
        userRole,
        userPhone,
        userInternalPhone,
        userTitle,
        userTitleDescription,
        userImage
      });
      if (result) {
        if (result.errors) {
          throw new Error();
        }
        if (userId2 === this.userId) {
          await loadUserProfile();
        } else {
          await getAllUsers();
        }
      }
    } catch (err) {
      setError("Δεν μπορέσαμε να επεξεργαστούμε τον χρήστη");
    } finally {
      loading.value = false;
    }
  }
  async function updatePassword(data) {
    const {
      userId: userId2,
      oldPass,
      newPass
    } = data;
    try {
      loading.value = true;
      const result = await updatePasswordComposable({
        userId: userId2,
        oldPass,
        newPass
      });
      if (result) {
      }
    } catch (err) {
      setError("Δεν μπορέσαμε να αλλάξουμε τον κωδικό σας");
    } finally {
      loading.value = false;
    }
  }
  async function getAllUsers() {
    if (userId.value) {
      try {
        loading.value = true;
        allUsers.value = Object.values(await getAllUsersComposable(userId.value));
      } catch (err) {
        setError("Δεν μπορέσαμε να φέρουμε το προφίλ σας");
      } finally {
        loading.value = false;
      }
    }
  }
  async function init() {
    try {
      if (!Object.keys(userInfo.value).length) {
        loading.value = true;
        await loadUserProfile();
      }
      if (!allUsers.value.length) {
        await getAllUsers();
      }
    } catch (err) {
      setError("Δεν μπορέσαμε να αρχικοποιήσουμε το προφίλ σας");
    } finally {
      loading.value = false;
    }
  }
  return {
    userId,
    reset,
    userInfo,
    permissions,
    hasPermission,
    editUser,
    setUserId,
    loading,
    loadUserProfile,
    loadUserProfileById,
    init,
    error,
    allUsers,
    getAllUsers,
    updatePassword
  };
});
const authUserComposable = async (params) => {
  try {
    const response = await retryFetch("/api/auth/login", {
      method: "POST",
      body: {
        email: params.email,
        password: params.password
      }
    });
    if (response.userId) {
      return response;
    }
    throw new Error("Invalid credentials");
  } catch (error) {
    throw new Error("Invalid credentials");
  }
};
const refreshSessionComposable = async () => {
  try {
    const result = await retryFetch("/api/auth/refreshSession", {
      method: "GET"
    });
    return result;
  } catch (error) {
    throw new Error("Failed to restore session");
  }
};
const logoutUserComposable = async () => {
  try {
    const result = await retryFetch("/api/auth/logout", {
      method: "GET"
    });
    return result;
  } catch (error) {
    throw new Error("Failed to delete session");
  }
};
const updateUserPasswordComposable = async (body) => {
  try {
    return await retryFetch("/api/auth/updatePassword", {
      method: "POST",
      body
    });
  } catch (error) {
    throw new Error("Failed to update password");
  }
};
const meComposable = async () => {
  try {
    return await retryFetch("/api/me", {
      method: "POST"
    });
  } catch (error) {
    throw new Error("Failed to get self data");
  }
};
const useAuthStore = defineStore("authStore", () => {
  const loading = ref(false);
  const error = ref(null);
  computed(() => !!token.value);
  const userStore = useUserStore();
  const setError = (errorMessage) => {
    error.value = errorMessage;
  };
  async function hasSession() {
    loading.value = true;
    try {
      const authToken = useCookie("auth_token");
      return !!authToken.value;
    } catch (err) {
      setError("No session found for user");
    } finally {
      loading.value = false;
    }
  }
  async function authUserWrapper(userName, userPass) {
    loading.value = true;
    try {
      const result = await authUserComposable({ email: userName, password: userPass });
      if (result && result.userId) {
        userStore.setUserId(result.userId);
        return true;
      }
      return false;
    } catch (err) {
      setError("Μη έγκυρος e-mail ή κωδικός");
      throw new Error("Authentication failed");
    } finally {
      loading.value = false;
    }
  }
  async function restoreSession() {
    try {
      const result = await refreshSessionComposable();
      if (result && result.userId) {
        userStore.setUserId(result.userId);
      } else {
        const router = useRouter$1();
        await router.push("/auth/login");
      }
    } catch (err) {
      setError("Δεν βρήκαμε υπάρχουσα συνεδρίαση");
    }
  }
  async function updatePassword(userId, oldPass, newPass) {
    try {
      const result = await updateUserPasswordComposable({
        userId,
        oldPass,
        newPass
      });
      if (result) {
        return result;
      }
    } catch (err) {
      setError("Δεν βρήκαμε υπάρχουσα συνεδρίαση");
    }
  }
  async function logout() {
    try {
      await logoutUserComposable();
    } catch (err) {
      setError("Δεν μπορέσαμε να σας αποσυνδέσουμε");
    }
  }
  async function me() {
    try {
      const response = await meComposable();
      if (response && response.userId) {
        userStore.setUserId(response.userId);
      }
    } catch (err) {
      setError("Δεν μπορέσαμε να φέρουμε τα δεδομένα σας");
    }
  }
  return { loading, error, authUser: authUserWrapper, me, updatePassword, restoreSession, hasSession, logout };
});
const useLeavesStore = defineStore("leavesStore", () => {
  const leavesData = ref({
    currentUser: {},
    leavesTypes: [],
    leavesStatuses: {},
    leavesAvailableDays: [],
    allUsers: []
  });
  const loading = ref(false);
  const error = ref(null);
  useUserStore();
  const isDataLoaded = ref(false);
  function reset() {
    leavesData.value = {
      currentUser: {},
      leavesTypes: [],
      leavesStatuses: {},
      leavesAvailableDays: [],
      allUsers: []
    };
  }
  const setError = (errorMessage) => {
    error.value = errorMessage;
  };
  async function init(userId) {
    isDataLoaded.value = false;
    try {
      await Promise.all([
        !Object.keys(leavesData.value.currentUser).length && getAll(userId),
        !leavesData.value.leavesTypes.length && getLeavesTypes(),
        !Object.keys(leavesData.value.leavesStatuses).length && getLeavesStatuses(),
        !Object.keys(leavesData.value.leavesAvailableDays).length && getLeavesAvailableDays(userId)
      ]).then(() => {
        isDataLoaded.value = true;
      });
    } catch (err) {
      setError("Δεν μπορέσαμε να αρχικοποιήσουμε τα δεδομένα αδειών σας");
    }
  }
  async function getAllByUserId(userId) {
    try {
      loading.value = true;
      return await getUserLeavesComposable(userId);
    } catch (err) {
      setError("Δεν μπορέσαμε να φέρουμε τις άδειες σας");
    } finally {
    }
  }
  async function getAll(userId) {
    try {
      loading.value = true;
      const result = await getUserLeavesComposable(userId);
      if (result) {
        leavesData.value.currentUser = result;
      }
    } catch (err) {
      setError("Δεν μπορέσαμε να φέρουμε τις άδειες σας");
    } finally {
      loading.value = false;
    }
  }
  async function newLeave(userId, leaveTypeId, startDate, endDate, reason) {
    try {
      loading.value = true;
      const result = await newLeaveComposable({ userId, leaveTypeId, startDate, endDate, reason });
      if (result) {
        await getAll(userId);
        await getLeavesAvailableDays(userId);
      }
    } catch (err) {
      setError("Δεν μπορέσαμε να δημιουργήσουμε νέα άδεια");
    } finally {
      loading.value = false;
    }
  }
  async function getAllUsers() {
    try {
      loading.value = true;
      const result = await getAllUserLeavesComposable();
      if (result) {
        leavesData.value.allUsers = result;
      }
    } catch (err) {
      setError("Δεν μπορέσαμε να ακυρώσουμε την άδεια");
    } finally {
      loading.value = false;
    }
  }
  async function cancelLeave(userId, leaveId, status, reason) {
    try {
      loading.value = true;
      const result = await cancelLeaveComposable({ userId, leaveId, status, reason });
      if (result) {
        await getAll(userId);
      }
    } catch (err) {
      setError("Δεν μπορέσαμε να ακυρώσουμε την άδεια");
    } finally {
      loading.value = false;
    }
  }
  async function getLeavesTypes() {
    try {
      loading.value = true;
      const result = await getLeavesTypesComposable();
      if (result) {
        leavesData.value.leavesTypes = result;
      }
    } catch (err) {
      setError("Δεν μπορέσαμε να φέρουμε τους τύπους αδειών");
    } finally {
      loading.value = false;
    }
  }
  async function getLeavesStatuses() {
    try {
      loading.value = true;
      const result = await getLeavesStatusesComposable();
      if (result) {
        leavesData.value.leavesStatuses = result;
      }
    } catch (err) {
      setError("Δεν μπορέσαμε να φέρουμε τις διαθέσιμες ενέργειες αδειών");
    } finally {
      loading.value = false;
    }
  }
  async function getLeavesAvailableDays(userId) {
    try {
      const result = await getLeavesAvailableDaysComposable(userId);
      if (result) {
        leavesData.value.leavesAvailableDays = result;
      }
    } catch (err) {
      setError("Δεν μπορέσαμε να φέρουμε τις υπολοιπόμενες ήμερες αδειών σας");
    } finally {
      loading.value = false;
    }
  }
  async function approveLeave(userId, leaveId, status, reason) {
    try {
      loading.value = true;
      const result = await adminLeaveActionComposable({ userId, leaveId, status, reason });
      if (result) {
        await getAll(userId);
      }
    } catch (err) {
      setError("Δεν μπορέσαμε να εγκρύνουμε την άδεια");
    } finally {
      loading.value = false;
    }
  }
  async function declineLeave(userId, leaveId, status, reason) {
    try {
      loading.value = true;
      const result = await adminLeaveActionComposable({ userId, leaveId, status, reason });
      if (result) {
        await getAll(userId);
      }
    } catch (err) {
      setError("Δεν μπορέσαμε να απορρίψουμε την άδεια");
    } finally {
      loading.value = false;
    }
  }
  return {
    leavesData,
    loading,
    error,
    isDataLoaded,
    init,
    reset,
    getAll,
    newLeave,
    cancelLeave,
    getAllByUserId,
    getLeavesTypes,
    getAllUsers,
    getLeavesStatuses,
    getLeavesAvailableDays,
    approveLeave,
    declineLeave
  };
});
const getEntitledDaysForUserComposable = (userId) => {
  return retryFetch("/api/entitlement/get", {
    method: "POST",
    body: {
      userId
    }
  });
};
const addEntitledDaysForUserComposable = (body) => {
  return retryFetch("/api/entitlement/add", {
    method: "POST",
    body: {
      ...body
    }
  });
};
const addEntitledDaysForMultipleUsersComposable = (body) => {
  return retryFetch("/api/entitlement/massLeaves", {
    method: "POST",
    body: {
      ...body
    }
  });
};
const addEntitledRemoteDaysForMultipleUsersComposable = (body) => {
  return retryFetch("/api/entitlement/massRemote", {
    method: "POST",
    body: {
      ...body
    }
  });
};
const updateEntitledDaysForUserComposable = (body) => {
  return retryFetch("/api/entitlement/update", {
    method: "POST",
    body: {
      ...body
    }
  });
};
const deleteEntitledDaysForUserComposable = (entitlementId) => {
  return retryFetch("/api/entitlement/delete", {
    method: "POST",
    body: {
      entitlementId
    }
  });
};
const useEntitlementStore = defineStore("entitlementStore", () => {
  const entitledDaysData = ref({
    savedUsers: []
  });
  const loading = ref(false);
  const error = ref(null);
  useUserStore();
  const isDataLoaded = ref(false);
  function reset() {
    entitledDaysData.value = {
      savedUsers: []
    };
  }
  const setError = (errorMessage) => {
    error.value = errorMessage;
  };
  async function init() {
    isDataLoaded.value = false;
    try {
      isDataLoaded.value = true;
    } catch (err) {
      setError("Δεν μπορέσαμε να αρχικοποιήσουμε τα δεδομένα αδειών σας");
    }
  }
  async function getEntitledDaysForUser(userId, forceRefresh = false) {
    if (!forceRefresh && entitledDaysData.value.savedUsers[userId]) {
      return entitledDaysData.value.savedUsers[userId];
    }
    try {
      loading.value = true;
      const result = await getEntitledDaysForUserComposable(userId);
      const formattedResult = {};
      result.forEach((entitlement) => {
        const year = new Date(entitlement.start_from).getFullYear();
        formattedResult[year] ?? (formattedResult[year] = []);
        formattedResult[year].push(entitlement);
      });
      entitledDaysData.value.savedUsers[userId] = formattedResult;
      return formattedResult;
    } catch (err) {
      setError("Δεν μπορέσαμε να φέρουμε τις άδειες σας");
    } finally {
      loading.value = false;
    }
  }
  async function addEntitledDays(userIds, leaveTypeId, entitledDays, startDate, endDate) {
    try {
      loading.value = true;
      const year = new Date(startDate).getFullYear();
      if (leaveTypeId === 5) {
        await addEntitledRemoteDaysForMultipleUsersComposable({
          userIds,
          leaveTypeId,
          entitledDays,
          year,
          startDate,
          endDate
        });
      } else {
        if (userIds.length > 1) {
          await addEntitledDaysForMultipleUsersComposable({
            userIds,
            leaveTypeId,
            entitledDays,
            year,
            startDate,
            endDate
          });
        } else {
          const userId = userIds[0];
          await addEntitledDaysForUserComposable({
            userId,
            leaveTypeId,
            entitledDays,
            year,
            startDate,
            endDate
          });
        }
      }
      for (const id of userIds) {
        if (entitledDaysData.value.savedUsers[id]) {
          await getEntitledDaysForUser(id, true);
        }
      }
    } catch (err) {
      setError("Δεν μπορέσαμε να δημιουργήσουμε νέα άδεια/ες");
      throw err;
    } finally {
      loading.value = false;
    }
  }
  async function updateEntitledDaysForUser(entitlementId, userId, leaveTypeId, entitledDays, startDate, endDate) {
    try {
      loading.value = true;
      const year = new Date(startDate).getFullYear();
      const result = await updateEntitledDaysForUserComposable({
        entitlementId,
        userId,
        leaveTypeId,
        entitledDays,
        startDate,
        endDate,
        year
      });
      if (result && result.entitlement) {
        await getEntitledDaysForUser(userId, true);
      }
    } catch (err) {
      setError("Δεν μπορέσαμε να δημιουργήσουμε νέα άδεια");
    } finally {
      loading.value = false;
    }
  }
  async function deleteEntitledDaysForUser(userId, entitlementId) {
    try {
      loading.value = true;
      const result = await deleteEntitledDaysForUserComposable(entitlementId);
      if (result) {
        await getEntitledDaysForUser(userId, true);
      }
    } catch (err) {
      setError("Δεν μπορέσαμε να δημιουργήσουμε νέα άδεια");
    } finally {
      loading.value = false;
    }
  }
  return {
    entitledDaysData,
    loading,
    error,
    init,
    reset,
    addEntitledDays,
    deleteEntitledDaysForUser,
    getEntitledDaysForUser,
    updateEntitledDaysForUser
  };
});
const getAllDepartmentsComposable = () => {
  return retryFetch("/api/departments/getAll", {
    method: "POST"
  });
};
const newDepartmentComposable = (body) => {
  return retryFetch("/api/departments/newDepartment", {
    method: "POST",
    body
  });
};
const editDepartmentComposable = (body) => {
  return retryFetch("/api/departments/editDepartment", {
    method: "POST",
    body
  });
};
const deleteDepartmentComposable = (department_id) => {
  return retryFetch("/api/departments/deleteDepartment", {
    method: "POST",
    body: {
      department_id
    }
  });
};
const useDepartmentsStore = defineStore("departmentsStore", () => {
  const departmentsData = ref([]);
  const loading = ref(false);
  const error = ref(null);
  function reset() {
    departmentsData.value = [];
  }
  const setError = (errorMessage) => {
    error.value = errorMessage;
  };
  async function init() {
    try {
      if (!departmentsData.value.length) {
        await getAll();
      }
    } catch (err) {
      setError("Δεν μπορέσαμε να αρηκοποιήσουμε τα γκρουπς");
    }
  }
  async function getAll() {
    try {
      const result = await getAllDepartmentsComposable();
      if (result) {
        departmentsData.value = result;
      }
    } catch (err) {
      setError("Δεν μπορέσαμε να φέρουμε τα γκρουπς");
    } finally {
      loading.value = false;
    }
  }
  function loadGroupById(groupId) {
    return departmentsData.value.find((group) => group.id === groupId) || {};
  }
  async function newDepartment(groupName, head, members) {
    try {
      const result = await newDepartmentComposable({
        groupName,
        head,
        members
      });
      if (result) {
        await this.getAll();
      }
    } catch (err) {
      setError("Δεν μπορέσαμε να δημιουργήσουμε νέο γκρουπ");
    } finally {
      loading.value = false;
    }
  }
  async function editDepartment(groupId, groupName, head, members) {
    try {
      const result = await editDepartmentComposable({
        groupId,
        groupName,
        head,
        members
      });
      if (result) {
        await this.getAll();
      }
    } catch (err) {
      setError("Δεν μπορέσαμε να επεξεργαστούμε το γκρουπ που ζητήσατε");
    } finally {
      loading.value = false;
    }
  }
  async function deleteDepartment(department_id) {
    try {
      const result = await deleteDepartmentComposable(department_id);
      if (result) {
        await this.getAll();
      }
    } catch (err) {
      setError("Δεν μπορέσαμε να σβήσουμε το γκρουπ που ζητήσατε");
    } finally {
      loading.value = false;
    }
  }
  return {
    init,
    reset,
    getAll,
    loadGroupById,
    newDepartment,
    editDepartment,
    deleteDepartment,
    departmentsData,
    loading,
    error
  };
});
const getNotificationsComposable = (userId) => {
  return retryFetch("/api/notifications/getNotifications", {
    method: "POST",
    body: {
      userId
    }
  });
};
const markNotificationReadComposable = (notificationId) => {
  return retryFetch("/api/notifications/markedRead", {
    method: "POST",
    body: {
      notificationId
    }
  });
};
const markNotificationUnreadComposable = (notificationId) => {
  return retryFetch("/api/notifications/markedUnread", {
    method: "POST",
    body: {
      notificationId
    }
  });
};
const intervalError = "[nuxt] `setInterval` should not be used on the server. Consider wrapping it with an `onNuxtReady`, `onBeforeMount` or `onMounted` lifecycle hook, or ensure you only call it in the browser by checking `false`.";
const setInterval = () => {
  console.error(intervalError);
};
const useNotificationsStore = defineStore("notificationsStore", () => {
  const notificationsData = ref({});
  const loading = ref(false);
  const error = ref(null);
  let notificationsActive = false;
  let intervalId;
  const userStore = useUserStore();
  function reset() {
    notificationsData.value = {};
  }
  const setError = (errorMessage) => {
    error.value = errorMessage;
  };
  async function init() {
    try {
      if (!notificationsData.value.length) {
        await getNotifications();
      }
      notificationsActive = true;
      beginPolling();
    } catch (err) {
      setError(err);
    }
  }
  async function getNotifications() {
    try {
      const result = await getNotificationsComposable(userStore.userId);
      if (result) {
        notificationsData.value = result;
      }
    } catch (err) {
      setError(err);
    } finally {
      loading.value = false;
    }
  }
  async function changeNotificationStatus(notificationId) {
    try {
      const notificationStatus = notificationsData.value.find((notif) => notif.id === notificationId).is_read;
      let result;
      if (notificationStatus) {
        result = await markNotificationUnreadComposable(notificationId);
      } else {
        result = await markNotificationReadComposable(notificationId);
      }
      if (result) {
        notificationsData.value = result;
      }
    } catch (err) {
      setError(err);
    } finally {
      loading.value = false;
    }
  }
  function beginPolling() {
    if (notificationsActive) {
      intervalId = setInterval();
      return () => clearInterval(intervalId);
    }
  }
  function stopPollingNotifications() {
    if (notificationsActive) {
      notificationsActive = false;
      clearInterval(intervalId);
    }
  }
  return { notificationsData, loading, error, getNotifications, beginPolling, init, reset, stopPollingNotifications, notificationsActive, changeNotificationStatus };
});
const usePermissionsStore = defineStore("permissionsStore", () => {
  const userStore = useUserStore();
  const permissions = {
    profile_leave_balance: {
      view: ["admin", "hr-manager", "head", "user"],
      request_leave: ["hr-manager", "head", "user"],
      cancel_leave: ["hr-manager", "head", "user"],
      accept_leave: ["admin", "hr-manager", "head"],
      decline_leave: ["admin", "hr-manager", "head"]
    },
    profile_info: {
      view: ["admin", "hr-manager", "head", "user"],
      modify: ["admin", "hr-manager", "head", "user"],
      change_password: ["admin", "hr-manager", "head", "user"]
    },
    all_users: {
      view: ["admin", "hr-manager", "head", "user"],
      modify: ["admin", "hr-manager"]
    },
    group: {
      view: ["admin", "hr-manager", "head", "user"],
      modify: ["admin", "hr-manager"]
    },
    entitlement: {
      view: ["admin", "hr-manager", "head"],
      modify: ["admin", "hr-manager"]
    },
    leave_types: {
      view: ["admin", "hr-manager", "head"],
      modify: ["admin", "hr-manager"]
    },
    permissions: {
      view: ["admin"],
      modify: ["admin"]
    }
  };
  const userRoles = computed(() => {
    var _a;
    const roles = ((_a = userStore.userInfo) == null ? void 0 : _a.roles) || [];
    return roles.map((role) => role.name);
  });
  const hasRole = (roleName) => {
    return userRoles.value.includes(roleName);
  };
  const isAdmin = () => {
    return userStore.userInfo.roles.some((role) => role.name === "admin");
  };
  const can = (category, action) => {
    const categoryPermissions = permissions[category];
    if (!categoryPermissions) {
      return false;
    }
    const allowedRoles = categoryPermissions[action];
    if (!allowedRoles) {
      return false;
    }
    return userRoles.value.some((role) => allowedRoles.includes(role));
  };
  return {
    hasRole,
    can,
    userRoles,
    isAdmin,
    permissions
  };
});
const useCentralStore = defineStore("centralStore", () => {
  const authStore = useAuthStore();
  const userStore = useUserStore();
  const leavesStore = useLeavesStore();
  const entitlementStore = useEntitlementStore();
  const departmentsStore = useDepartmentsStore();
  const notificationsStore = useNotificationsStore();
  const permissionsStore = usePermissionsStore();
  const error = ref(null);
  const loading = computed(
    () => authStore.loading || userStore.loading || leavesStore.loading || departmentsStore.loading || notificationsStore.loading
  );
  const initialized = ref(false);
  const setError = (errorMessage) => {
    error.value = errorMessage;
  };
  const { $toast } = useNuxtApp();
  async function init() {
    try {
      console.log("im here");
      if (userStore.userId) {
        console.log("userId:", userStore.userId);
        await Promise.all([
          userStore.init(),
          departmentsStore.init(),
          notificationsStore.init()
        ]);
        await Promise.all([
          userStore.getAllUsers(),
          leavesStore.init(userStore.userId),
          entitlementStore.init()
        ]);
        initialized.value = true;
      } else {
        throw new Error("No user id");
      }
    } catch (err) {
      setError("Δεν μπορέσαμε να αρχικοποιήσουμε τα δεδομένα σας");
      initialized.value = false;
    }
  }
  async function logout() {
    try {
      userStore.reset();
      leavesStore.reset();
      departmentsStore.reset();
      notificationsStore.reset();
      entitlementStore.reset();
      initialized.value = false;
      await authStore.logout();
    } catch (e) {
    } finally {
    }
  }
  const dynamicProxyHandler = {
    get(target, prop) {
      if (prop in target) {
        const value = target[prop];
        if (typeof value === "function") {
          return value.bind(target);
        } else {
          return value;
        }
      }
      return void 0;
    }
  };
  const proxiedAuthStore = new Proxy(authStore, dynamicProxyHandler);
  const proxiedUserStore = new Proxy(userStore, dynamicProxyHandler);
  const proxiedLeavesStore = new Proxy(leavesStore, dynamicProxyHandler);
  const proxiedDepartmentsStore = new Proxy(departmentsStore, dynamicProxyHandler);
  const proxiedNotificationsStore = new Proxy(notificationsStore, dynamicProxyHandler);
  const proxiedPermissionsStore = new Proxy(permissionsStore, dynamicProxyHandler);
  const proxiedEntitlementStore = new Proxy(entitlementStore, dynamicProxyHandler);
  return {
    error,
    loading,
    initialized,
    init,
    logout,
    authStore: proxiedAuthStore,
    userStore: proxiedUserStore,
    leavesStore: proxiedLeavesStore,
    departmentsStore: proxiedDepartmentsStore,
    notificationsStore: proxiedNotificationsStore,
    permissionsStore: proxiedPermissionsStore,
    entitlementStore: proxiedEntitlementStore
  };
});
const _sfc_main$2 = {
  __name: "app",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      htmlAttrs: {
        lang: "el"
      }
    });
    const router = useRouter$1();
    const centralStore = useCentralStore();
    const userStore = centralStore.userStore;
    centralStore.leavesStore;
    const authStore = centralStore.authStore;
    const userAuthed = useCookie("user_authed");
    const runInitCode = async () => {
      try {
        console.log("runInitCode: userAuthed =", userAuthed.value);
        if (userAuthed.value === true) {
          await authStore.me();
          if (!centralStore.initialized) {
            await centralStore.init();
            console.log("initialized");
          }
        }
      } catch (error) {
        console.error("runInitCode error:", error);
        useNuxtApp().$toast.error(error, {
          position: "bottom-right",
          autoClose: 5e3
        });
      }
    };
    computed(() => userStore.userId);
    router.afterEach(async (to, from) => {
      await runInitCode();
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtPage = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "h-full mt-auto" }, _attrs))}><main class="bg-gray-100">`);
      _push(ssrRenderComponent(_component_NuxtPage, null, null, _parent));
      _push(`</main></div>`);
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("app.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = {
  __name: "nuxt-error-page",
  __ssrInlineRender: true,
  props: {
    error: Object
  },
  setup(__props) {
    const props = __props;
    const _error = props.error;
    _error.stack ? _error.stack.split("\n").splice(1).map((line) => {
      const text = line.replace("webpack:/", "").replace(".vue", ".js").trim();
      return {
        text,
        internal: line.includes("node_modules") && !line.includes(".cache") || line.includes("internal") || line.includes("new Promise")
      };
    }).map((i) => `<span class="stack${i.internal ? " internal" : ""}">${i.text}</span>`).join("\n") : "";
    const statusCode = Number(_error.statusCode || 500);
    const is404 = statusCode === 404;
    const statusMessage = _error.statusMessage ?? (is404 ? "Page Not Found" : "Internal Server Error");
    const description = _error.message || _error.toString();
    const stack = void 0;
    const _Error404 = defineAsyncComponent(() => import('./error-404-DIGSETxS.mjs'));
    const _Error = defineAsyncComponent(() => import('./error-500-Dk92FlK8.mjs'));
    const ErrorTemplate = is404 ? _Error404 : _Error;
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(ErrorTemplate), mergeProps({ statusCode: unref(statusCode), statusMessage: unref(statusMessage), description: unref(description), stack: unref(stack) }, _attrs), null, _parent));
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-error-page.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "nuxt-root",
  __ssrInlineRender: true,
  setup(__props) {
    const IslandRenderer = () => null;
    const nuxtApp = useNuxtApp();
    nuxtApp.deferHydration();
    nuxtApp.ssrContext.url;
    const SingleRenderer = false;
    provide(PageRouteSymbol, useRoute());
    nuxtApp.hooks.callHookWith((hooks) => hooks.map((hook) => hook()), "vue:setup");
    const error = useError();
    const abortRender = error.value && !nuxtApp.ssrContext.error;
    onErrorCaptured((err, target, info) => {
      nuxtApp.hooks.callHook("vue:error", err, target, info).catch((hookError) => console.error("[nuxt] Error in `vue:error` hook", hookError));
      {
        const p = nuxtApp.runWithContext(() => showError(err));
        onServerPrefetch(() => p);
        return false;
      }
    });
    const islandContext = nuxtApp.ssrContext.islandContext;
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderSuspense(_push, {
        default: () => {
          if (unref(abortRender)) {
            _push(`<div></div>`);
          } else if (unref(error)) {
            _push(ssrRenderComponent(unref(_sfc_main$1), { error: unref(error) }, null, _parent));
          } else if (unref(islandContext)) {
            _push(ssrRenderComponent(unref(IslandRenderer), { context: unref(islandContext) }, null, _parent));
          } else if (unref(SingleRenderer)) {
            ssrRenderVNode(_push, createVNode(resolveDynamicComponent(unref(SingleRenderer)), null, null), _parent);
          } else {
            _push(ssrRenderComponent(unref(_sfc_main$2), null, null, _parent));
          }
        },
        _: 1
      });
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-root.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
let entry;
{
  entry = async function createNuxtAppServer(ssrContext) {
    var _a;
    const vueApp = createApp(_sfc_main);
    const nuxt = createNuxtApp({ vueApp, ssrContext });
    try {
      await applyPlugins(nuxt, plugins);
      await nuxt.hooks.callHook("app:created", vueApp);
    } catch (error) {
      await nuxt.hooks.callHook("app:error", error);
      (_a = nuxt.payload).error || (_a.error = createError(error));
    }
    if (ssrContext == null ? void 0 : ssrContext._renderResponse) {
      throw new Error("skipping render");
    }
    return vueApp;
  };
}
const entry$1 = (ssrContext) => entry(ssrContext);

export { useCentralStore as a, useNuxtApp as b, usePermissionsStore as c, useAuthStore as d, entry$1 as default, useNotificationsStore as e, useRouter as f, useRuntimeConfig as g, hashMode as h, nuxtLinkDefaults as i, navigateTo as n, resolveRouteObject as r, useHead as u };
//# sourceMappingURL=server.mjs.map
