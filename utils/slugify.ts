export function slugify(input: string): string {
  const s = String(input ?? "")
    .trim()
    .toLowerCase();
  return (
    s
      .normalize("NFD")
      // Remove combining diacritics (more compatible than \p{Diacritic})
      .replace(/[\u0300-\u036f]/g, "")
      // Replace anything non-alphanumeric with dashes
      .replace(/[^a-z0-9]+/g, "-")
      // Trim leading/trailing dashes
      .replace(/^-+|-+$/g, "")
  );
}
