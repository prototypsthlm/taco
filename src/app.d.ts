// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { UserBySessionId } from '$lib/server/entities/user'

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      currentUser: UserBySessionId
    }
    // interface PageData {}
    // interface Platform {}
  }
}

export {}
