<script>
  import { page } from '$app/stores'
</script>

<div class="h-screen w-screen bg-gray-900">
  <main class="grid min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8">
    <div class="text-center">
      <p class="text-2xl font-semibold text-indigo-600">{$page.status}</p>
      <h1 class="mt-4 text-3xl font-bold tracking-tight text-accent sm:text-5xl">
        {$page.error?.message}
      </h1>
      {#if $page.status === 404}
        <p class="mt-6 text-base leading-7 text-gray-500">
          Sorry we could not find what your where looking for. Please try again
        </p>
      {:else}
        <p class="mt-6 text-base leading-7 text-gray-500">
          Sorry something went wrong. Please try again
        </p>
      {/if}
      <div class="mt-10 flex items-center justify-center gap-x-6">
        <a
          href="/app"
          class="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >Go back home</a
        >
      </div>
    </div>
  </main>
</div>
