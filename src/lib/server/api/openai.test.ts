import { retryWithExponentialBackoff } from '$lib/server/api/openai' // Update with your actual path
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('retryWithExponentialBackoff', () => {
  let mockFunc: any

  beforeEach(() => {
    mockFunc = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('retries the function on a 429 status with exponential delay', async () => {
    mockFunc
      .mockResolvedValueOnce({
        status: 429,
        json: async () => ({ message: 'Rate limit' }),
      })
      .mockResolvedValue({
        status: 200,
        json: async () => ({ message: 'OK' }),
      })

    const retriedFunc = retryWithExponentialBackoff(mockFunc, {
      initialDelay: 0,
      exponentialBase: 0,
      jitter: false,
    })

    const response = await retriedFunc()

    expect(response.status).toBe(200)
    expect(mockFunc).toHaveBeenCalledTimes(2)
  })

  it('stops retrying after maxRetries', async () => {
    mockFunc.mockResolvedValue({
      status: 429,
      json: async () => ({ message: 'Rate limit' }),
    })

    const retriedFunc = retryWithExponentialBackoff(mockFunc, {
      initialDelay: 1,
      exponentialBase: 1,
      jitter: false,
      maxRetries: 2,
    })

    await retriedFunc()

    expect(mockFunc).toHaveBeenCalledTimes(3)
  })
})
