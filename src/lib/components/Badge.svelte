<script lang="ts">
  export let color = 'gray'

  let bgColorClass: string
  let textColorClass: string

  $: {
    switch (color) {
      case 'red':
        bgColorClass = 'bg-red-100'
        textColorClass = 'text-red-700'
        break
      case 'yellow':
        bgColorClass = 'bg-yellow-100'
        textColorClass = 'text-yellow-800'
        break
      case 'green':
        bgColorClass = 'bg-green-100'
        textColorClass = 'text-green-700'
        break
      case 'blue':
        bgColorClass = 'bg-blue-100'
        textColorClass = 'text-blue-700'
        break
      case 'indigo':
        bgColorClass = 'bg-indigo-100'
        textColorClass = 'text-indigo-700'
        break
      case 'purple':
        bgColorClass = 'bg-purple-100'
        textColorClass = 'text-purple-700'
        break
      case 'pink':
        bgColorClass = 'bg-pink-100'
        textColorClass = 'text-pink-700'
        break
      default:
        bgColorClass = 'bg-gray-100'
        textColorClass = 'text-gray-600'
    }
  }
</script>

<span
  class="{$$props.class} inline-flex items-center rounded-md px-2 py-1 text-xs font-medium {bgColorClass} {textColorClass}"
>
  <slot>Badge</slot>
</span>
