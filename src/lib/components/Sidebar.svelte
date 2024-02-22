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
  import { onMount } from 'svelte'

  export let user: UserWithUserTeamsActiveTeamAndChats

  type ChatObject = {
    [key: string]: any[]
    label: string
    isOpen: boolean
  }

  type KeyObject = {
    [key: string | number]: boolean
  }

  $: chats = [
    ...(user?.sharedChats
      .filter((x) => x.chat.owner.teamId == user.activeUserTeam?.teamId)
      .map((x) => x.chat) || []),
    ...(user.activeUserTeam?.chats || []),
  ].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())

  //BEFORE: {today:[],yesterday:[]...}
  //Should return a list of objects like so: [{today:[chat1,chat2,chat3],label:Today, isOpen:true},{...}]
  $: chatsGroupedByTime = chats?.reduce((chatObjects: ChatObject[], chat) => {
    const category = categorizeDate(chat.updatedAt).category
    const label = categorizeDate(chat.updatedAt).label
    const isOpen = categorizeDate(chat.updatedAt).isOpen
    // Check if an object with the same category already exists in chatObjects
    const found = chatObjects.find((object) => object.label === 'today')
    if (found) {
      chatObjects[label] = label
    }
    return chatObjects
    //where category matches in chatData:
    //push chat there
    //return chatData
  }, [])

  onMount(() => {
    console.log('chatObjects', chatsGroupedByTime)
  })

  const getTitle = (interval: any) => {
    const titleMap: { [key: string]: string } = {
      today: 'Today',
      yesterday: 'Yesterday',
      previousSevenDays: 'Previous 7 Days',
      lastMonth: 'Previous 30 Days',
    }
    return typeof interval === 'number' ? interval : titleMap[interval]
  }

  $: getCurrentCategoryKeys = () => {
    const keys = Object.keys(chatsGroupedByTime)
    const keysObject: KeyObject = keys.reduce((keysObjectAcc, key) => {
      keysObjectAcc[key] = ['today', 'yesterday', 'previousSevenDays'].includes(key)
      return keysObjectAcc
    }, {} as KeyObject)
    return keysObject
  }

  $: currentCategoryState = getCurrentCategoryKeys()

  function toggleCategoryState(interval: any) {
    currentCategoryState[interval] = !currentCategoryState[interval]
    return currentCategoryState
  }
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
          {#each Object.entries(chatsGroupedByTime) as [interval, chats]}
            {#if chats.length > 0}
              <div class="flex relative items-center">
                <p class="flex-none text-xs text-gray-600">{getTitle(interval)}</p>
                <div class="right-0 absolute">
                  {#if currentCategoryState[interval]}
                    <ChevronUpIcon
                      class="h-3 w-3 text-white"
                      on:click={() => toggleCategoryState(interval)}
                    />
                  {:else}
                    <ChevronDownIcon
                      class="h-3 w-3 text-white"
                      on:click={() => toggleCategoryState(interval)}
                    />
                  {/if}
                </div>
              </div>
              {#each chats as chat}
                <div class={currentCategoryState[interval] ? '' : 'hidden'}>
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
