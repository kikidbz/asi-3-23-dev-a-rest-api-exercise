const extract = (keys) => {
  const subExtract = (obj) =>
    Array.isArray(obj)
      ? obj.map(subExtract)
      : keys.reduce((sanitized, key) => ({ ...sanitized, [key]: obj[key] }), {})

  return subExtract
}

export const sanitizeUser = extract([
  "id",
  "firstName",
  "lastName",
  "email",
  "role",
])

export const sanitizeRole = extract(["id", "name", "permissionLevel"])

export const sanitizeMenu = extract(["id", "name", "pages"])

export const sanitizePage = extract([
  "id",
  "title",
  "content",
  "url",
  "creator",
  "modifier",
  "published",
  "Status",
])
