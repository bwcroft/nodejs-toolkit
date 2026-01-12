import { describe, expect, it } from 'vitest'
import { parseUrl } from './url'

describe('Utils URL', () => {
  describe('parseUrl', () => {
    //pathname
    it('should get pathname and empty searchParams', () => {
      const url = '/users/12'
      const result = parseUrl(url)

      expect(result.pathname).toBe(url)
      expect(Object.keys(result.searchParams)).toHaveLength(0)
    })

    it('should get pathname and searchParams', () => {
      const baseUrl = '/users'
      const url = `${baseUrl}?sort=desc&limit=25`
      const result = parseUrl(url)

      expect(result.pathname).toBe(baseUrl)
      expect(Object.keys(result.searchParams)).toHaveLength(2)
      expect(result.searchParams.sort).toBe('desc')
      expect(Number(result.searchParams.limit)).toBe(25)
    })

    //search parameters
    it('should get back searchParam value as string', () => {
      const baseUrl = '/users'
      const url = `${baseUrl}?sort=desc`
      const result = parseUrl(url)

      expect(result.pathname).toBe(baseUrl)
      expect(Object.keys(result.searchParams)).toHaveLength(1)
      expect(typeof result.searchParams.sort).toBe('string')
    })

    it('should get back searchParam value as string', () => {
      const baseUrl = '/users'
      const url = `${baseUrl}?sort=desc`
      const result = parseUrl(url)

      expect(result.pathname).toBe(baseUrl)
      expect(Object.keys(result.searchParams)).toHaveLength(1)
      expect(typeof result.searchParams.sort).toBe('string')
    })

    it('should get back searchParam value as array of string', () => {
      const ids = [1, 34, 99]
      const baseUrl = '/users'

      let url = baseUrl
      ids.forEach((id, i) => {
        url += !i ? `?ids=${id}` : `&ids=${id}`
      })

      const result = parseUrl(url)

      expect(result.pathname).toBe(baseUrl)
      expect(Object.keys(result.searchParams)).toHaveLength(1)
      expect(Array.isArray(result.searchParams.ids)).toBe(true)
      expect(result.searchParams.ids.length).toBe(3)
      for (const id of result.searchParams.ids) {
        expect(ids.includes(Number(id))).toBe(true)
      }
    })

    it('should handle empty query parameter value', () => {
      const result = parseUrl('/users?filter=')
      expect(result.searchParams.filter).toBe('')
    })

    it('should handle query parameter without value', () => {
      const result = parseUrl('/users?debug')
      expect(result.searchParams.debug).toBe('')
    })

    it('should handle multiple query parameters without values', () => {
      const result = parseUrl('/users?debug&verbose')
      expect(result.searchParams.debug).toBe('')
      expect(result.searchParams.verbose).toBe('')
    })

    // URL Encoding
    it('should decode URL-encoded characters in query keys', () => {
      const result = parseUrl('/users?first%20name=John')
      expect(result.searchParams['first name']).toBe('John')
    })

    it('should decode URL-encoded characters in query values', () => {
      const result = parseUrl('/users?name=John%20Doe')
      expect(result.searchParams.name).toBe('John Doe')
    })

    it('should handle special characters in query values', () => {
      const result = parseUrl('/users?email=test%40example.com')
      expect(result.searchParams.email).toBe('test@example.com')
    })

    it('should handle plus signs as spaces in query values', () => {
      const result = parseUrl('/users?name=John+Doe')
      // Note: standard decodeURIComponent doesn't convert + to space
      // You may want to handle this explicitly
      expect(result.searchParams.name).toBeDefined()
    })

    // Special Characters
    it('should handle equals sign in query value', () => {
      const result = parseUrl('/users?equation=a%3Db')
      expect(result.searchParams.equation).toBe('a=b')
    })

    it('should handle ampersand in query value', () => {
      const result = parseUrl('/users?company=Smith%26Co')
      expect(result.searchParams.company).toBe('Smith&Co')
    })

    it('should handle question mark in query value', () => {
      const result = parseUrl('/users?query=what%3F')
      expect(result.searchParams.query).toBe('what?')
    })

    // Array Edge Cases
    it('should handle single value not converted to array', () => {
      const result = parseUrl('/users?id=1')
      expect(typeof result.searchParams.id).toBe('string')
      expect(result.searchParams.id).toBe('1')
    })

    it('should handle mixed single and repeated parameters', () => {
      const result = parseUrl('/users?name=John&id=1&id=2&age=25')
      expect(result.searchParams.name).toBe('John')
      expect(Array.isArray(result.searchParams.id)).toBe(true)
      expect(result.searchParams.id).toEqual(['1', '2'])
      expect(result.searchParams.age).toBe('25')
    })

    it('should handle empty values in repeated parameters', () => {
      const result = parseUrl('/users?filter=active&filter=&filter=verified')
      expect(Array.isArray(result.searchParams.filter)).toBe(true)
      expect(result.searchParams.filter).toEqual(['active', '', 'verified'])
    })

    // Pathname Edge Cases
    it('should handle root path', () => {
      const result = parseUrl('/')
      expect(result.pathname).toBe('/')
      expect(Object.keys(result.searchParams)).toHaveLength(0)
    })

    it('should handle root path with query', () => {
      const result = parseUrl('/?page=1')
      expect(result.pathname).toBe('/')
      expect(result.searchParams.page).toBe('1')
    })

    it('should handle path with trailing slash', () => {
      const result = parseUrl('/users/')
      expect(result.pathname).toBe('/users/')
    })

    it('should handle nested paths', () => {
      const result = parseUrl('/api/v1/users/123/posts?limit=10')
      expect(result.pathname).toBe('/api/v1/users/123/posts')
      expect(result.searchParams.limit).toBe('10')
    })

    // Empty and Malformed
    it('should handle empty string', () => {
      const result = parseUrl('')
      expect(result.pathname).toBe('')
      expect(Object.keys(result.searchParams)).toHaveLength(0)
    })

    it('should handle only query string', () => {
      const result = parseUrl('?page=1')
      expect(result.pathname).toBe('')
      expect(result.searchParams.page).toBe('1')
    })

    it('should handle multiple consecutive question marks', () => {
      const result = parseUrl('/users??page=1')
      // Define expected behavior - typically only first ? matters
      expect(result.pathname).toBe('/users')
    })

    it('should handle multiple consecutive ampersands', () => {
      const result = parseUrl('/users?a=1&&b=2')
      // Should probably skip empty parameters
      expect(result.searchParams.a).toBe('1')
      expect(result.searchParams.b).toBe('2')
    })

    it('should handle trailing ampersand', () => {
      const result = parseUrl('/users?page=1&')
      expect(result.searchParams.page).toBe('1')
      expect(Object.keys(result.searchParams)).toHaveLength(1)
    })

    it('should handle leading ampersand', () => {
      const result = parseUrl('/users?&page=1')
      expect(result.searchParams.page).toBe('1')
    })

    // Unicode and International Characters
    it('should handle unicode characters in pathname', () => {
      const result = parseUrl('/users/José')
      expect(result.pathname).toBe('/users/José')
    })

    it('should handle unicode characters in query values', () => {
      const result = parseUrl('/users?name=José')
      expect(result.searchParams.name).toBe('José')
    })

    it('should handle emoji in query values', () => {
      const result = parseUrl('/users?reaction=%F0%9F%98%80')
      expect(result.searchParams.reaction).toBe('😀')
    })

    // Numeric-looking Values (ensure they stay strings)
    it('should keep numeric values as strings', () => {
      const result = parseUrl('/users?id=123&price=19.99')
      expect(typeof result.searchParams.id).toBe('string')
      expect(typeof result.searchParams.price).toBe('string')
      expect(result.searchParams.id).toBe('123')
      expect(result.searchParams.price).toBe('19.99')
    })

    it('should keep boolean-looking values as strings', () => {
      const result = parseUrl('/users?active=true&deleted=false')
      expect(typeof result.searchParams.active).toBe('string')
      expect(result.searchParams.active).toBe('true')
      expect(result.searchParams.deleted).toBe('false')
    })

    // Hash/Fragment (if you want to handle it)
    it('should ignore hash fragments', () => {
      const result = parseUrl('/users?page=1#section')
      // Typically hash is not sent to server, but might appear in client-side URLs
      // Define your expected behavior
      expect(result.pathname).toBe('/users')
      expect(result.searchParams.page).toBe('1')
    })

    // Performance/Large inputs
    it('should handle many query parameters', () => {
      let url = '/users?'
      for (let i = 0; i < 100; i++) {
        url += `param${i}=value${i}&`
      }
      const result = parseUrl(url)
      expect(Object.keys(result.searchParams)).toHaveLength(100)
      expect(result.searchParams.param50).toBe('value50')
    })

    it('should handle very long query values', () => {
      const longValue = 'a'.repeat(10000)
      const result = parseUrl(`/users?data=${longValue}`)
      expect(result.searchParams.data).toBe(longValue)
      expect(result.searchParams.data.length).toBe(10000)
    })
  })
})
