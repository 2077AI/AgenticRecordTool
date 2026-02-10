declare const  __APP_ENV__: {
  baseURL: string,
  url: string
  domain: string
}
declare module 'ali-oss'

/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}