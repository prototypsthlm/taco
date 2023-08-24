<script lang="ts">
  import type { PageData } from './$types'
  import { page } from '$app/stores'

  export let data: PageData
</script>

<div class="h-screen flex justify-center items-center isolate overflow-hidden bg-gray-900">
  <div class="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
    <div class="mx-auto max-w-2xl text-center">
      {#if !data.error}
        <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          <p class="pb-4">Hey {data.userName}</p>
          you have been invited to the team
          <p class="pt-4 text-5xl">{data.invitation.team.name}</p>
        </h2>
        <p class="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
          By accepting this invitation you will be added to the team. This invitation will be
          removed after use.
        </p>
        <div class="mt-10 flex items-center justify-center gap-x-6">
          <form method="post" action="?/acceptInvitation">
            <button
              type="submit"
              class="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >Accept Invitation
            </button>
            <input type="hidden" name="invitationId" value={data.invitation.id} />
          </form>
          <a href="/" class="text-sm font-semibold leading-6 text-white"
            >Decline <span aria-hidden="true">→</span></a
          >
        </div>
      {:else}
        <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {data.error.header}
        </h2>
        <p class="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
          {data.error.description}
        </p>
        <div class="mt-10 flex items-center justify-center gap-x-6">
          {#if data.error.showLoginButton}
            <a
              href="/signin?redirect={$page.url}"
              class="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >Sign in
            </a>
            <a href="/signup?redirect={$page.url}" class="text-sm font-semibold leading-6 text-white"
              >Register <span aria-hidden="true">→</span></a
            >
          {:else}
            <a
              href="/app"
              class="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >Back Home
            </a>
          {/if}
        </div>
      {/if}
    </div>
  </div>
  <svg
    viewBox="0 0 1024 1024"
    class="absolute left-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
    aria-hidden="true"
  >
    <circle
      cx="512"
      cy="512"
      r="512"
      fill="url(#8d958450-c69f-4251-94bc-4e091a323369)"
      fill-opacity="0.7"
    />
    <defs>
      <radialGradient id="8d958450-c69f-4251-94bc-4e091a323369">
        <stop stop-color="#7775D6" />
        <stop offset="1" stop-color="#E935C1" />
      </radialGradient>
    </defs>
  </svg>
</div>
