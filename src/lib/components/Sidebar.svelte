<script lang="ts">
  import ChatLink from '$lib/components/ChatLink.svelte'
  import Gravatar from '$lib/components/Gravatar.svelte'
  import type { UserWithUserTeamsActiveTeamAndChats } from '$lib/server/entities/user'
  import { isSidebarOpen } from '$lib/stores/general'
  import {
    ChevronRightIcon,
    PlusIcon,
    ChevronDownIcon,
    ChevronUpIcon,
  } from '@babeard/svelte-heroicons/solid'
  import { categorizeDate } from '$lib/utils/time'

  export let user: UserWithUserTeamsActiveTeamAndChats

  type ChatObject = {
    chats: any[]
    key: string
    label: string
    isOpen: boolean
  }

  $: chats = [
    ...(user?.sharedChats
      .filter((x) => x.chat.owner.teamId == user.activeUserTeam?.teamId)
      .map((x) => x.chat) || []),
    ...(user.activeUserTeam?.chats || []),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  $: chatsGroupedByTime = chats?.reduce((chatObjects: ChatObject[], chat) => {
    const { key, label, isOpen } = categorizeDate(chat.createdAt)
    const foundObject = chatObjects.find((obj) => obj.key === key)
    if (foundObject) {
      foundObject.chats.push(chat)
    } else {
      chatObjects.push({
        key: key,
        label: label,
        isOpen: isOpen,
        chats: [chat],
      })
    }
    return chatObjects
  }, [])
</script>

<aside class="flex flex-col grow overflow-hidden h-full">
  {#if user.activeUserTeam}
    <a href="/app/settings/teams" class="flex justify-between items-center w-full">
      <div class="flex gap-2 items-center">
        <Gravatar class="w-8 h-8 rounded-lg" value={user.activeUserTeam.team?.name} />
        <div class="flex flex-col items-start leading-none">
          <p class="text-gray-400 text-opacity-60 text-xs">Selected Team</p>
          <p class="text-white">{user.activeUserTeam.team?.name}</p>
        </div>
      </div>
      <ChevronRightIcon class="h-4 w-4 text-white" />
    </a>
    {#if user?.activeUserTeam}
      <a
        href="/app"
        class="mt-6 px-2 py-4 sm:px-4 lg:px-6 hover:bg-neutral-100 hover:bg-opacity-10 bg-opacity-10 rounded-lg border-2 border-white border-opacity-20 flex items-center gap-x-3"
        on:click={() => isSidebarOpen.set(false)}
      >
        <PlusIcon class="h-6 w-6 text-white flex-none" />
        <h3 class="flex-auto truncate text-lg font-semibold leading-6 text-white">New Chat</h3>
      </a>
      {#if chats.length}
        <ul class="overflow-auto grow flex flex-col gap-2 pt-2">
          {#each chatsGroupedByTime as chatGroup}
            {#if chatGroup.chats.length > 0}
              <div class="flex relative items-center">
                <p class="flex-none text-xs text-gray-600">{chatGroup.label}</p>
                <div class="right-0 absolute">
                  {#if chatGroup.isOpen}
                    <ChevronUpIcon
                      class="h-3 w-3 text-white"
                      on:click={() => (chatGroup.isOpen = !chatGroup.isOpen)}
                    />
                  {:else}
                    <ChevronDownIcon
                      class="h-3 w-3 text-white"
                      on:click={() => (chatGroup.isOpen = !chatGroup.isOpen)}
                    />
                  {/if}
                </div>
              </div>
              {#each chatGroup.chats as chat}
                <div class={chatGroup.isOpen ? '' : 'hidden'}>
                  <ChatLink {chat} {user} />
                </div>
              {/each}
            {/if}
          {/each}
        </ul>
      {/if}
    {/if}
  {:else}
    <p class="text-white mt-4 text-opacity-60 text-center">No team selected</p>
  {/if}
</aside>
