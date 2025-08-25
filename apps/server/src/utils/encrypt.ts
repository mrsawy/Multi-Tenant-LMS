import { createHash } from 'crypto'

// In-memory storage (use Redis/database in production)
const storage = new Map()

// Base62 for URL-safe short codes
const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

function toBase62(num) {
    if (num === 0) return chars[0]
    let result = ''
    while (num > 0) {
        result = chars[num % 62] + result
        num = Math.floor(num / 62)
    }
    return result
}

function fromBase62(str) {
    let result = 0
    for (let i = 0; i < str.length; i++) {
        result = result * 62 + chars.indexOf(str[i])
    }
    return result
}

// Generate shortest possible ID
function generateShortId(text) {
    // Use hash to ensure uniqueness
    const hash = createHash('md5').update(text).digest('hex')
    
    // Convert first 8 hex chars to number, then to base62
    const num = parseInt(hash.substring(0, 8), 16)
    return toBase62(num)
}

export function shorten(text) {
    const id = generateShortId(text)
    storage.set(id, text)
    return id
}

export function restore(id) {
    if (!storage.has(id)) {
        throw new Error('ID not found')
    }
    return storage.get(id)
}

// Utility functions
export function clear() {
    storage.clear()
}

export function stats() {
    return { 
        count: storage.size,
        sampleIds: Array.from(storage.keys()).slice(0, 5)
    }
}

// Test function
export function test(text) {
    console.log(`Original: ${text.length} chars`)
    
    const short = shorten(text)
    console.log(`Shortened: "${short}" (${short.length} chars)`)
    
    const restored = restore(short)
    console.log(`Restored: ${restored.length} chars`)
    console.log(`Match: ${restored === text}`)
    
    return { short, restored, match: restored === text }
}