<script lang="ts">
  import type { PageData, ActionData } from './$types'
  import TeamStats from '$lib/components/TeamStats.svelte'
  import TeamMemberList from '$lib/components/TeamMemberList.svelte'
  import TeamKeys from '$lib/components/TeamKeys.svelte'
  import TeamInvitationList from '$lib/components/TeamInvitationList.svelte'

  export let data: PageData
  export let form: ActionData

  $: isAdmin = data.userTeam.role === "ADMIN"
</script>

<header
  class="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8"
>
  <h1 class="text-lg font-semibold leading-7 text-white">Team {data.userTeam.team.name}</h1>
</header>

<div class="divide-y divide-white/5">
  <TeamStats userTeam={data.userTeam} numberChats={data.chatCount} />
  <TeamKeys userTeam={data.userTeam} form={form?.keySection} />
  <TeamInvitationList invitations={data.invitations} isAdmin={isAdmin} form={form?.invitationSection} />
  <TeamMemberList userTeam={data.userTeam} form={form?.userSection} />
</div>
