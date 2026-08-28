interface SpeakOptions {
  rate?: number
  pitch?: number
  onEnd?: () => void
  onError?: () => void
}

let speechEnabled = true

export const setSpeechEnabled = (enabled: boolean) => {
  speechEnabled = enabled
  if (!enabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

export const speakChinese = (text: string, options: SpeakOptions = {}): boolean => {
  if (
    !speechEnabled
    ||
    typeof window === 'undefined'
    || !('speechSynthesis' in window)
    || !('SpeechSynthesisUtterance' in window)
  ) {
    options.onError?.()
    return false
  }

  try {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    utterance.rate = options.rate ?? 0.8
    utterance.pitch = options.pitch ?? 1
    utterance.onend = () => options.onEnd?.()
    utterance.onerror = () => options.onError?.()
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
    return true
  } catch {
    options.onError?.()
    return false
  }
}
