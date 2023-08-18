import { decodeChunkData, encodeChunkData } from '$lib/utils/stream'
import { describe, expect, it } from 'vitest'

describe('Chunk Data Functions', () => {
  it('decodeChunkData correctly decodes chunk data', () => {
    const chunkString = new TextEncoder().encode(
      'data: {"id":"chatcmpl-7oXSL4mqY1NgPubWTsnEBzMmDTC3L","object":"chat.completion.chunk","created":1692279361,"model":"gpt-3.5-turbo-0613","choices":[{"index":0,"delta":{"content":" you"},"finish_reason":null}]}\n' +
        '\n' +
        'data: [DONE]\n' +
        '\n'
    )
    const result = decodeChunkData(chunkString)

    expect(result).toEqual([
      '{"id":"chatcmpl-7oXSL4mqY1NgPubWTsnEBzMmDTC3L","object":"chat.completion.chunk","created":1692279361,"model":"gpt-3.5-turbo-0613","choices":[{"index":0,"delta":{"content":" you"},"finish_reason":null}]}',
      '[DONE]',
    ])
  })

  // Now let's test the encodeChunkData function
  it('encodeChunkData correctly encodes data array into chunk format', () => {
    const data = [
      '{"id":"chatcmpl-7oXSL4mqY1NgPubWTsnEBzMmDTC3L","object":"chat.completion.chunk","created":1692279361,"model":"gpt-3.5-turbo-0613","choices":[{"index":0,"delta":{"content":" you"},"finish_reason":null}]}',
      '[DONE]',
    ]

    const encoded = encodeChunkData(data)
    const result = new TextDecoder().decode(encoded)

    expect(result).toBe(
      'data: {"id":"chatcmpl-7oXSL4mqY1NgPubWTsnEBzMmDTC3L","object":"chat.completion.chunk","created":1692279361,"model":"gpt-3.5-turbo-0613","choices":[{"index":0,"delta":{"content":" you"},"finish_reason":null}]}\n' +
        '\n' +
        'data: [DONE]\n' +
        '\n'
    )
  })
})
