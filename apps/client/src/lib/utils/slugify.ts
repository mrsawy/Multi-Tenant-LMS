export function slugify(text: string): string {
    return text
        .toString()
        .normalize("NFD")                     // Normalize accented characters
        .replace(/[\u0300-\u036f]/g, "")      // Remove accents
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")         // Remove non-alphanumeric chars
        .replace(/\s+/g, "-")                 // Replace spaces with dashes
        .replace(/-+/g, "-");                 // Collapse multiple dashes
}
