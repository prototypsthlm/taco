<script lang="ts">
  import type { PageData, ActionData } from './$types'
  import TeamStats from '$lib/components/TeamStats.svelte'
  import TeamMemberList from '$lib/components/TeamMemberList.svelte'
  import TeamKeys from '$lib/components/TeamKeys.svelte'
  import TeamInvitationList from '$lib/components/TeamInvitationList.svelte'

  import TeamDefaultModel from '$lib/components/TeamDefaultModel.svelte'

  export let data: PageData
  export let form: ActionData

  $: isAdmin = data.userTeam.role !== 'MEMBER'
</script>

<header
  class="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8"
>
  <h1 class="text-lg font-semibold leading-7 text-white">Team {data.team?.name}</h1>
</header>

<div class="divide-y divide-white/5">
  <TeamStats team={data.team} numberChats={data.chatCount} />
  <TeamKeys userTeam={data.userTeam} team={data.team} form={form?.keySection} />
  <TeamInvitationList invitations={data.invitations} {isAdmin} form={form?.invitationSection} />
  <TeamMemberList team={data.team} userTeam={data.userTeam} form={form?.userSection} />
  <TeamDefaultModel models={data.availableModels} />
</div>
