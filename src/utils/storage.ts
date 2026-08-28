export type StorageValidator<T> = (value: unknown) => value is T

const getStorage = (): Storage | null => {
  if (typeof window === 'undefined') return null

  try {
    return window.localStorage
  } catch {
    return null
  }
}

export const loadStoredValue = <T>(
  key: string,
  fallback: T,
  validator?: StorageValidator<T>,
): T => {
  const storage = getStorage()
  if (!storage) return fallback

  try {
    const rawValue = storage.getItem(key)
    if (!rawValue) return fallback

    const value: unknown = JSON.parse(rawValue)
    if (validator) return validator(value) ? value : fallback
    return value as T
  } catch {
    return fallback
  }
}

export const saveStoredValue = (key: string, value: unknown): boolean => {
  const storage = getStorage()
  if (!storage) return false

  try {
    storage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}
