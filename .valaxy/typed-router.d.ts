/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck
// Generated by unplugin-vue-router. ‼️ DO NOT MODIFY THIS FILE ‼️
// It's recommended to commit this file.
// Make sure to add this file to your tsconfig.json file as an "includes" or "files" entry.

/// <reference types="unplugin-vue-router/client" />

import type {
  // type safe route locations
  RouteLocationTypedList,
  RouteLocationResolvedTypedList,
  RouteLocationNormalizedTypedList,
  RouteLocationNormalizedLoadedTypedList,
  RouteLocationAsString,
  RouteLocationAsRelativeTypedList,
  RouteLocationAsPathTypedList,

  // helper types
  // route definitions
  RouteRecordInfo,
  ParamValue,
  ParamValueOneOrMore,
  ParamValueZeroOrMore,
  ParamValueZeroOrOne,

  // vue-router extensions
  _RouterTyped,
  RouterLinkTyped,
  RouterLinkPropsTyped,
  NavigationGuard,
  UseLinkFnTyped,

  // data fetching
  _DataLoader,
  _DefineLoaderOptions,
} from 'unplugin-vue-router/types'

declare module 'vue-router/auto/routes' {
  export interface RouteNamedMap {
    '/': RouteRecordInfo<'/', '/', Record<never, never>, Record<never, never>>,
    '/[...path]': RouteRecordInfo<'/[...path]', '/:path(.*)', { path: ParamValue<true> }, { path: ParamValue<false> }>,
    '/404': RouteRecordInfo<'/404', '/404', Record<never, never>, Record<never, never>>,
    '/about/': RouteRecordInfo<'/about/', '/about', Record<never, never>, Record<never, never>>,
    '/archives/': RouteRecordInfo<'/archives/', '/archives', Record<never, never>, Record<never, never>>,
    '/bangumi/': RouteRecordInfo<'/bangumi/', '/bangumi', Record<never, never>, Record<never, never>>,
    '/categories/': RouteRecordInfo<'/categories/', '/categories', Record<never, never>, Record<never, never>>,
    '/links/': RouteRecordInfo<'/links/', '/links', Record<never, never>, Record<never, never>>,
    '/page/[page]': RouteRecordInfo<'/page/[page]', '/page/:page', { page: ParamValue<true> }, { page: ParamValue<false> }>,
    '/posts/cc1': RouteRecordInfo<'/posts/cc1', '/posts/cc1', Record<never, never>, Record<never, never>>,
    '/posts/Elasticsearch-basic': RouteRecordInfo<'/posts/Elasticsearch-basic', '/posts/Elasticsearch-basic', Record<never, never>, Record<never, never>>,
    '/posts/Front-and-rear-ends': RouteRecordInfo<'/posts/Front-and-rear-ends', '/posts/Front-and-rear-ends', Record<never, never>, Record<never, never>>,
    '/posts/high-accuracy': RouteRecordInfo<'/posts/high-accuracy', '/posts/high-accuracy', Record<never, never>, Record<never, never>>,
    '/posts/java-serialization': RouteRecordInfo<'/posts/java-serialization', '/posts/java-serialization', Record<never, never>, Record<never, never>>,
    '/posts/javascript-1': RouteRecordInfo<'/posts/javascript-1', '/posts/javascript-1', Record<never, never>, Record<never, never>>,
    '/posts/JavaScript-es6-1': RouteRecordInfo<'/posts/JavaScript-es6-1', '/posts/JavaScript-es6-1', Record<never, never>, Record<never, never>>,
    '/posts/JavaScript-export': RouteRecordInfo<'/posts/JavaScript-export', '/posts/JavaScript-export', Record<never, never>, Record<never, never>>,
    '/posts/linux-java8': RouteRecordInfo<'/posts/linux-java8', '/posts/linux-java8', Record<never, never>, Record<never, never>>,
    '/posts/linux-maven': RouteRecordInfo<'/posts/linux-maven', '/posts/linux-maven', Record<never, never>, Record<never, never>>,
    '/posts/Maven-aliyun': RouteRecordInfo<'/posts/Maven-aliyun', '/posts/Maven-aliyun', Record<never, never>, Record<never, never>>,
    '/posts/my-software': RouteRecordInfo<'/posts/my-software', '/posts/my-software', Record<never, never>, Record<never, never>>,
    '/posts/MySQL-id-auto': RouteRecordInfo<'/posts/MySQL-id-auto', '/posts/MySQL-id-auto', Record<never, never>, Record<never, never>>,
    '/posts/pows': RouteRecordInfo<'/posts/pows', '/posts/pows', Record<never, never>, Record<never, never>>,
    '/posts/proxy-configuration': RouteRecordInfo<'/posts/proxy-configuration', '/posts/proxy-configuration', Record<never, never>, Record<never, never>>,
    '/posts/Python-reptile-1': RouteRecordInfo<'/posts/Python-reptile-1', '/posts/Python-reptile-1', Record<never, never>, Record<never, never>>,
    '/posts/security-burteforce-pikachu': RouteRecordInfo<'/posts/security-burteforce-pikachu', '/posts/security-burteforce-pikachu', Record<never, never>, Record<never, never>>,
    '/posts/security-fileUpload': RouteRecordInfo<'/posts/security-fileUpload', '/posts/security-fileUpload', Record<never, never>, Record<never, never>>,
    '/posts/security-RCE': RouteRecordInfo<'/posts/security-RCE', '/posts/security-RCE', Record<never, never>, Record<never, never>>,
    '/posts/security-setup-pikachu': RouteRecordInfo<'/posts/security-setup-pikachu', '/posts/security-setup-pikachu', Record<never, never>, Record<never, never>>,
    '/posts/security-SQLInjection': RouteRecordInfo<'/posts/security-SQLInjection', '/posts/security-SQLInjection', Record<never, never>, Record<never, never>>,
    '/posts/socks5-basic': RouteRecordInfo<'/posts/socks5-basic', '/posts/socks5-basic', Record<never, never>, Record<never, never>>,
    '/posts/vueForceUpdate': RouteRecordInfo<'/posts/vueForceUpdate', '/posts/vueForceUpdate', Record<never, never>, Record<never, never>>,
    '/posts/vul-fastjson': RouteRecordInfo<'/posts/vul-fastjson', '/posts/vul-fastjson', Record<never, never>, Record<never, never>>,
    '/posts/vul-shiro': RouteRecordInfo<'/posts/vul-shiro', '/posts/vul-shiro', Record<never, never>, Record<never, never>>,
    '/posts/vulnhub-Lampiao': RouteRecordInfo<'/posts/vulnhub-Lampiao', '/posts/vulnhub-Lampiao', Record<never, never>, Record<never, never>>,
    '/posts/vx-application-yakit': RouteRecordInfo<'/posts/vx-application-yakit', '/posts/vx-application-yakit', Record<never, never>, Record<never, never>>,
    '/tags/': RouteRecordInfo<'/tags/', '/tags', Record<never, never>, Record<never, never>>,
  }
}

declare module 'vue-router/auto' {
  import type { RouteNamedMap } from 'vue-router/auto/routes'

  export type RouterTyped = _RouterTyped<RouteNamedMap>

  /**
   * Type safe version of `RouteLocationNormalized` (the type of `to` and `from` in navigation guards).
   * Allows passing the name of the route to be passed as a generic.
   */
  export type RouteLocationNormalized<Name extends keyof RouteNamedMap = keyof RouteNamedMap> = RouteLocationNormalizedTypedList<RouteNamedMap>[Name]

  /**
   * Type safe version of `RouteLocationNormalizedLoaded` (the return type of `useRoute()`).
   * Allows passing the name of the route to be passed as a generic.
   */
  export type RouteLocationNormalizedLoaded<Name extends keyof RouteNamedMap = keyof RouteNamedMap> = RouteLocationNormalizedLoadedTypedList<RouteNamedMap>[Name]

  /**
   * Type safe version of `RouteLocationResolved` (the returned route of `router.resolve()`).
   * Allows passing the name of the route to be passed as a generic.
   */
  export type RouteLocationResolved<Name extends keyof RouteNamedMap = keyof RouteNamedMap> = RouteLocationResolvedTypedList<RouteNamedMap>[Name]

  /**
   * Type safe version of `RouteLocation` . Allows passing the name of the route to be passed as a generic.
   */
  export type RouteLocation<Name extends keyof RouteNamedMap = keyof RouteNamedMap> = RouteLocationTypedList<RouteNamedMap>[Name]

  /**
   * Type safe version of `RouteLocationRaw` . Allows passing the name of the route to be passed as a generic.
   */
  export type RouteLocationRaw<Name extends keyof RouteNamedMap = keyof RouteNamedMap> =
    | RouteLocationAsString<RouteNamedMap>
    | RouteLocationAsRelativeTypedList<RouteNamedMap>[Name]
    | RouteLocationAsPathTypedList<RouteNamedMap>[Name]

  /**
   * Generate a type safe params for a route location. Requires the name of the route to be passed as a generic.
   */
  export type RouteParams<Name extends keyof RouteNamedMap> = RouteNamedMap[Name]['params']
  /**
   * Generate a type safe raw params for a route location. Requires the name of the route to be passed as a generic.
   */
  export type RouteParamsRaw<Name extends keyof RouteNamedMap> = RouteNamedMap[Name]['paramsRaw']

  export function useRouter(): RouterTyped
  export function useRoute<Name extends keyof RouteNamedMap = keyof RouteNamedMap>(name?: Name): RouteLocationNormalizedLoadedTypedList<RouteNamedMap>[Name]

  export const useLink: UseLinkFnTyped<RouteNamedMap>

  export function onBeforeRouteLeave(guard: NavigationGuard<RouteNamedMap>): void
  export function onBeforeRouteUpdate(guard: NavigationGuard<RouteNamedMap>): void

  export const RouterLink: RouterLinkTyped<RouteNamedMap>
  export const RouterLinkProps: RouterLinkPropsTyped<RouteNamedMap>

  // Experimental Data Fetching

  export function defineLoader<
    P extends Promise<any>,
    Name extends keyof RouteNamedMap = keyof RouteNamedMap,
    isLazy extends boolean = false,
  >(
    name: Name,
    loader: (route: RouteLocationNormalizedLoaded<Name>) => P,
    options?: _DefineLoaderOptions<isLazy>,
  ): _DataLoader<Awaited<P>, isLazy>
  export function defineLoader<
    P extends Promise<any>,
    isLazy extends boolean = false,
  >(
    loader: (route: RouteLocationNormalizedLoaded) => P,
    options?: _DefineLoaderOptions<isLazy>,
  ): _DataLoader<Awaited<P>, isLazy>

  export {
    _definePage as definePage,
    _HasDataLoaderMeta as HasDataLoaderMeta,
    _setupDataFetchingGuard as setupDataFetchingGuard,
    _stopDataFetchingScope as stopDataFetchingScope,
  } from 'unplugin-vue-router/runtime'
}

declare module 'vue-router' {
  import type { RouteNamedMap } from 'vue-router/auto/routes'

  export interface TypesConfig {
    beforeRouteUpdate: NavigationGuard<RouteNamedMap>
    beforeRouteLeave: NavigationGuard<RouteNamedMap>

    $route: RouteLocationNormalizedLoadedTypedList<RouteNamedMap>[keyof RouteNamedMap]
    $router: _RouterTyped<RouteNamedMap>

    RouterLink: RouterLinkTyped<RouteNamedMap>
  }
}
