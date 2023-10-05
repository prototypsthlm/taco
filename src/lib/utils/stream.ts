export const decodeChunkData = (chunk: Uint8Array) => {
  const chunkString = new TextDecoder().decode(chunk)

  return chunkString
    .split('\n\n')
    .map((x) => {
      const match = x.match(/data: (.*?)(?:\n\n|$)/)
      return match ? match[1] : null
    })
    .filter((x) => x !== null) as string[]
}

export const encodeChunkData = (data: string[]) => {
  const formatted = data.map((x) => {
    return `data: ${x}`
  })
  return new TextEncoder().encode(`${formatted.join('\n\n')}\n\n`)
}

export type Delta = {
  choices: [{ delta: { content?: string } }]
}

export const extractDelta = (data: Delta) => {
  const [{ delta }] = data.choices

  return delta.content
}
