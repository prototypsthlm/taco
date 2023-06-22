<script>
  import ChatInput from '$lib/components/ChatInput.svelte'
  import Question from '$lib/components/Question.svelte'
  import Answer from '$lib/components/Answer.svelte'
  import { onMount } from 'svelte'

  export let data

  onMount(async () => {
    if (!data.chat.messages[0].answer) {
      data.chat = await fetch(`http://localhost:5173/app/chat/${data.chatId}?/fetchFirstAnswer`, {
        method: 'POST',
        body: JSON.stringify({
          question: data.chat.messages[0].question,
        }),
      }).then((res) => res.json())
    }
  })

  function handleMessage(event) {
    const message = event.detail

    data.chat.messages.push({
      question: message,
      id: 0,
      model: null,
      temperature: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      answer: null,
      chatId: 0,
      authorId: null
    })

    console.log(data.chat.messages)
  }

  $: messages = data.chat.messages
</script>

<div class="flex flex-col justify-between items-center h-full w-full">
  <div class="flex flex-col w-full h-full overflow-scroll">
    {#each messages as message}
      <Question text={message.question} author={message.author} />
      <Answer text={message.answer} />
    {/each}
  </div>

  <div class="m-4 md:m-8 w-full">
    <form method="POST" action="?/sendMessage" novalidate>
      <ChatInput on:message={handleMessage} />
    </form>
  </div>
</div>
