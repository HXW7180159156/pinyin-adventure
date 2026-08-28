interface SpeakOptions {
  rate?: number
  pitch?: number
  onEnd?: () => void
  onError?: () => void
}

export const speakChinese = (text: string, options: SpeakOptions = {}): boolean => {
  if (
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
