import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { loadStoredValue, saveStoredValue, type StorageValidator } from '../utils/storage'

export const usePersistentState = <T>(
  key: string,
  initialValue: T,
  validator?: StorageValidator<T>,
): [T, Dispatch<SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => loadStoredValue(key, initialValue, validator))

  useEffect(() => {
    saveStoredValue(key, value)
  }, [key, value])

  return [value, setValue]
}
