import { describe, expect, it } from 'vitest'
import { size } from 'lodash'

import api from '../dist'

describe('scraper', () => {
  it('should return extra information about a specific anime', async () => {
    const result = await api.getExtraInfo('tokyo-ghoul')
    expect(result).toBeDefined()
    expect(result).toHaveProperty('extra')
  })

  it('should return search results for a query', async () => {
    const result = await api.search('tokyo ghoul')
    expect(result).toBeDefined()
    if (result)
      expect(size(result.animes)).toBeGreaterThan(0)
  })

  it('should return servers for streaming an anime', async () => {
    const result = await api.getAnimeServers('tokyo-ghoulre', 1)
    expect(result).toBeDefined()
    expect(size(result)).toBeGreaterThan(0)
  })
})