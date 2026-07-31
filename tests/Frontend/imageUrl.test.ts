import { describe, expect, it } from 'vitest'
import { normalizeImageUrl } from '../../resources/js/Lib/imageUrl'

describe('normalizeImageUrl', () => {
    it('accepts only HTTP image locations', () => {
        expect(normalizeImageUrl('https://example.com/image.png')).toBe('https://example.com/image.png')
        expect(normalizeImageUrl('http://localhost/image.png')).toBe('http://localhost/image.png')
        expect(normalizeImageUrl('http://example.com/image.png')).toBeNull()
        expect(normalizeImageUrl('javascript:alert(1)')).toBeNull()
        expect(normalizeImageUrl('data:image/png;base64,AAAA')).toBeNull()
        expect(normalizeImageUrl('not a url')).toBeNull()
    })
})
