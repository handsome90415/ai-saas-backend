import { ApiError } from '@/lib/api'

describe('ApiError', () => {
  it('stores message and status', () => {
    const err = new ApiError('Not found', 404)
    expect(err.message).toBe('Not found')
    expect(err.status).toBe(404)
    expect(err.name).toBe('ApiError')
  })
})
