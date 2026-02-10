export {};

declare global {
  export interface Window {
    /** NProgress instance */
    NProgress?: import('nprogress').NProgress;
    /** Loading bar instance */
    $loadingBar?: import('naive-ui').LoadingBarProviderInst;
    /** Dialog instance */
    $dialog?: import('naive-ui').DialogProviderInst;
    /** Message instance */
    $message?: import('naive-ui').MessageProviderInst;
    /** Notification instance */
    $notification?: import('naive-ui').NotificationProviderInst;
  }

  /** Build time of the project */
  export const BUILD_TIME: string;
}

declare module '*.vue' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: import('vue').DefineComponent<{}, {}, any>;
  export default component;
}

declare module 'matter-js' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Matter: any;
  export default Matter;
}

declare module 'motion-v' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const Motion: any;
}
