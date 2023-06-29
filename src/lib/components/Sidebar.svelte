<!-- THIS CAN COMPLETELLY BE WIPED JUST DEMO CONENT FOR THE SIDEBAR -->
<script lang="ts">
  import {
    CalendarIcon,
    ChartPieIcon,
    DocumentDuplicateIcon,
    FolderIcon,
    HomeIcon,
    UsersIcon,
  } from '@babeard/svelte-heroicons/outline'
  import classNames from 'classnames'

  const navigation = [
    { name: 'Dashboard', href: '#', icon: HomeIcon, current: true },
    { name: 'Team', href: '#', icon: UsersIcon, current: false },
    { name: 'Projects', href: '#', icon: FolderIcon, current: false },
    { name: 'Calendar', href: '#', icon: CalendarIcon, current: false },
    { name: 'Documents', href: '#', icon: DocumentDuplicateIcon, current: false },
    { name: 'Reports', href: '#', icon: ChartPieIcon, current: false },
  ]
  const teams = [
    { id: 1, name: 'Heroicons', href: '#', initial: 'H', current: false },
    { id: 2, name: 'Tailwind Labs', href: '#', initial: 'T', current: false },
    { id: 3, name: 'Workcation', href: '#', initial: 'W', current: false },
  ]
</script>

<div class="side-foo-1">
  <div role="list" class="-mx-2 space-y-1">
    {#each navigation as item}
      <div>
        <a
          href={item.href}
          class={classNames(
            item.current
              ? 'bg-gray-800 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800',
            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
          )}
        >
          <svelte:component this={item.icon} class="h-6 w-6 shrink-0" aria-hidden="true" />
          {item.name}
        </a>
      </div>
    {/each}
  </div>
</div>
<div class="side-foo-2">
  <div class="text-xs font-semibold leading-6 text-gray-400">Your teams</div>
  <div role="list" class="-mx-2 mt-2 space-y-1">
    {#each teams as team}
      <div>
        <a
          href={team.href}
          class={classNames(
            team.current
              ? 'bg-gray-800 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800',
            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
          )}
        >
          <span
            class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white"
          >
            {team.initial}
          </span>
          <span class="truncate">{team.name}</span>
        </a>
      </div>
    {/each}
  </div>
</div>
