<script>
  import FeatureBox from '$lib/components/FeatureBox.svelte'
</script>

<div
  class="flex flex-col gap-16 justify-center items-center bg-secondary min-w-screen min-h-screen"
>
  <div class="font-bold text-accent text-center">
    <h3 class="text-7xl">Prototyps</h3>
    <h1 class="text-8xl">LLM Portal 🌀</h1>
    <p class="text-accent text-2xl mt-8">Use the large language model to increase your poductivity</p>
  </div>

  <div class="flex justify-center gap-8 max-w-7xl flex-wrap">
    <FeatureBox
      title="Chat with ChatGPT"
      description="Chat with a GPT-3 powered chatbot!"
      emoji="💬"
      isImplemented={false}
    />
    <FeatureBox
      title="One API key for everything"
      description="Use one API key for the whole team and safe costs!"
      emoji="📉"
      isImplemented={false}
    />
    <FeatureBox
      title="Personalities for the LLM"
      description="Improve your answers by giving the LLM a right personality from the start!"
      emoji="👥"
      isImplemented={false}
    />
    <FeatureBox
      title="Quality of Life improvements"
      description="Improvments like favorite chats, reactions on messages and more!"
      emoji="💫"
      isImplemented={false}
    />
    <FeatureBox
      title="Keep chat histories in a database"
      description="Chats are saved in a database and can be accessed later!"
      emoji="🗃️"
      isImplemented={false}
    />
    <FeatureBox
      title="Shared Chats"
      description="Share you chat with a team member and write in the same chat live!"
      emoji="🔗"
      isImplemented={false}
    />
  </div>


</div>
