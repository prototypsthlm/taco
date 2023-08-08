declare module 'svelte-autosize' {
  declare const action: {
    (node: any): {
      destroy(): void
    }
    update: any
    destroy: any
  }
  export default action
}
