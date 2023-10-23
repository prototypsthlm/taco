<script lang="ts">
  import type { TeamWithMembers } from '$lib/server/entities/team'

  export let team: TeamWithMembers
  export let numberChats: number
</script>

<div class="bg-gray-900">
  <div class="max-w-6xl">
    <div class="flex flex-col sm:flex-row gap-px bg-white/5">
      <div class="bg-gray-900 px-4 py-6 sm:px-6 lg:px-8 flex-grow">
        <p class="text-sm font-medium leading-6 text-gray-400">Number of team users</p>
        <p class="mt-2 flex items-baseline gap-x-2">
          <span class="text-4xl font-semibold tracking-tight text-white"
            >{team?.teamUsers?.length}</span
          >
        </p>
      </div>
      <div class="bg-gray-900 px-4 py-6 sm:px-6 lg:px-8 flex-grow">
        <p class="text-sm font-medium leading-6 text-gray-400">Number of chats</p>
        <p class="mt-2 flex items-baseline gap-x-2">
          <span class="text-4xl font-semibold tracking-tight text-white">{numberChats}</span>
        </p>
      </div>
      <div class="bg-gray-900 px-4 py-6 sm:px-6 lg:px-8 flex-grow">
        <p class="text-sm font-medium leading-6 text-gray-400">Team Created At</p>
        <p class="mt-2 flex items-baseline gap-x-2">
          <time
            datetime={team.createdAt?.toISOString()}
            class="text-4xl font-semibold tracking-tight text-white"
            >{team.createdAt?.toLocaleDateString()}</time
          >
        </p>
      </div>
    </div>
  </div>
</div>
