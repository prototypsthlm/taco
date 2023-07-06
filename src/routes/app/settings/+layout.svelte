<script lang="ts">
  import AppShell from '$lib/components/AppShell.svelte'
  import Sidebar from '$lib/components/Sidebar.svelte'
  import classNames from 'classnames'
  import type { LayoutData } from './$types'
  import { page } from '$app/stores'

  export let data: LayoutData
</script>

<AppShell user={data.user}>
  <Sidebar slot="sidebar" />
  <div slot="main" class="min-h-screen bg-gray-900">
    <main>
      <header class="border-b border-white/5">
        <!-- Secondary navigation -->
        <nav class="flex overflow-x-auto py-4">
          <ul
            class="flex min-w-full flex-none gap-x-6 px-4 text-sm font-semibold leading-6 text-gray-400 sm:px-6 lg:px-8"
          >
            <li>
              <a
                href="/app/settings/account"
                class={classNames({ 'text-indigo-400': $page?.url?.pathname?.includes('account') })}
                >Account</a
              >
            </li>
            <li>
              <a
                href="/app/settings/teams"
                class={classNames({ 'text-indigo-400': $page?.url?.pathname?.includes('teams') })}
                >Teams</a
              >
            </li>
          </ul>
        </nav>
      </header>
      <slot />
    </main>
  </div>
</AppShell>
