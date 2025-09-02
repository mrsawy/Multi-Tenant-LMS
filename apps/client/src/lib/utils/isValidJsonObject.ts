export default function isValidJsonObject(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    try {
        const parsed = JSON.parse(value);
        return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed);
    } catch {
        return false;
    }
}
