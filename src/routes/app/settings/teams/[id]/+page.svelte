<script lang="ts">
  import type { PageData, ActionData } from './$types'
  import TeamStats from '$lib/components/TeamStats.svelte'
  import TeamMemberList from '$lib/components/TeamMemberList.svelte'
  import TeamKeys from '$lib/components/TeamKeys.svelte'

  export let data: PageData
  export let form: ActionData
</script>

<header
  class="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8"
>
  <h1 class="text-lg font-semibold leading-7 text-white">Team {data.team.name}</h1>
</header>

<div class="divide-y divide-white/5">
  <TeamStats
    estimatedCost={data.estimatedCost}
    numberChats={data.chatCount}
    numberMembers={data?.members?.length || 0}
    createdAt={data.team.createdAt}
  />
  <TeamKeys
    isAdmin={data.isAdmin}
    form={form?.keySection}
    team={data.team}
  />
  <div class="px-4 sm:px-6 lg:px-8 max-w-6xl">
    <TeamMemberList
      userId={data.userId}
      form={form?.userSection}
      members={data.members}
      isAdmin={data.isAdmin}
    />
  </div>
</div>
