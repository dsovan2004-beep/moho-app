// Search grammar stays allowlisted; normalize typography without changing names in storage.
export function normalizeSearchApostrophes(value: string) {
  return value.replace(/[‘’ʼ＇]/gu, "'")
}

export function directoryTextSearch(query: string) {
  const term = normalizeSearchApostrophes(query)
    .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
    .replace(/\s+/g, ' ').trim().slice(0, 100)
  const variants = term.includes("'") ? [term, term.replace(/'/g, '’')] : [term]
  const fields = ['name', 'description', 'category', 'city', 'address']
  return {
    term,
    filter: term ? variants.flatMap(value => fields.map(field => `${field}.ilike.%${value}%`)).join(',') : '',
  }
}
