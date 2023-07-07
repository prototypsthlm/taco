<script lang="ts">
  export let numberMembers: number
  export let estimatedCost: number
  export let numberChats: number
  export let createdAt: Date | undefined
</script>

<div class="bg-gray-900">
  <div class="max-w-6xl">
    <div class="grid grid-cols-1 gap-px bg-white/5 sm:grid-cols-2 lg:grid-cols-4">
      <div class="bg-gray-900 px-4 py-6 sm:px-6 lg:px-8">
        <p class="text-sm font-medium leading-6 text-gray-400">Number of team members</p>
        <p class="mt-2 flex items-baseline gap-x-2">
          <span class="text-4xl font-semibold tracking-tight text-white">{numberMembers}</span>
        </p>
      </div>
      <div class="bg-gray-900 px-4 py-6 sm:px-6 lg:px-8">
        <p class="text-sm font-medium leading-6 text-gray-400">Estimated cost</p>
        <p class="mt-2 flex items-baseline gap-x-2">
          <span class="text-4xl font-semibold tracking-tight text-white">{estimatedCost}</span>
          <span class="text-sm text-gray-400">$</span>
        </p>
      </div>
      <div class="bg-gray-900 px-4 py-6 sm:px-6 lg:px-8">
        <p class="text-sm font-medium leading-6 text-gray-400">Number of chats</p>
        <p class="mt-2 flex items-baseline gap-x-2">
          <span class="text-4xl font-semibold tracking-tight text-white">{numberChats}</span>
        </p>
      </div>
      <div class="bg-gray-900 px-4 py-6 sm:px-6 lg:px-8">
        <p class="text-sm font-medium leading-6 text-gray-400">Team Created At</p>
        <p class="mt-2 flex items-baseline gap-x-2">
          <time
            datetime={createdAt.toISOString()}
            class="text-4xl font-semibold tracking-tight text-white"
            >{createdAt.toLocaleDateString()}</time
          >
        </p>
      </div>
    </div>
  </div>
</div>
