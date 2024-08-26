export async function testOpenAiAPIKey(testApiKey: string): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Say this is a test!' }],
        temperature: 0.7,
      }),
    })
    if (response.status === 200) {
      return 'The API key is valid.'
    } else {
      return `The API key is invalid or has insufficient permissions. Status code: ${response.status}.`
    }
  } catch (error) {
    return 'An error occurred while testing the API key.'
  }
}
