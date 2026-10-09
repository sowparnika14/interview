// Speech Recognition & Text to Speech service

export interface SpeechRecognitionHandlers {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onEnd: () => void;
}

// Check if Web Speech API is supported
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

let activeRecognition: any = null;

export function startSpeechRecognition(handlers: SpeechRecognitionHandlers): { stop: () => void } | null {
  if (!isSpeechRecognitionSupported()) {
    handlers.onError('Speech recognition is not supported in this browser. You can type your answers directly.');
    return null;
  }

  try {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      handlers.onResult(finalTranscript || interimTranscript, Boolean(finalTranscript));
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        handlers.onError('Microphone access was denied. Please allow microphone permissions or type your answer.');
      } else if (event.error === 'no-speech') {
        // quiet no-op
      } else {
        handlers.onError(`Audio recognition: ${event.error}`);
      }
    };

    recognition.onend = () => {
      handlers.onEnd();
    };

    recognition.start();
    activeRecognition = recognition;

    return {
      stop: () => {
        try {
          if (activeRecognition) {
            activeRecognition.stop();
            activeRecognition = null;
          }
        } catch (e) {
          console.warn('Error stopping speech recognition:', e);
        }
      }
    };
  } catch (err) {
    handlers.onError('Could not start microphone. You can type your answer.');
    return null;
  }
}

export function stopActiveRecognition(): void {
  if (activeRecognition) {
    try {
      activeRecognition.stop();
    } catch {}
    activeRecognition = null;
  }
}

// Text to speech helper
export function speakText(text: string, onEnd?: () => void): { cancel: () => void } {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return { cancel: () => {} };
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.05;

  // Prefer natural English voices
  const voices = window.speechSynthesis.getVoices();
  const naturalVoice = voices.find(v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')) && v.lang.startsWith('en')) || voices.find(v => v.lang.startsWith('en'));

  if (naturalVoice) {
    utterance.voice = naturalVoice;
  }

  if (onEnd) {
    utterance.onend = () => onEnd();
    utterance.onerror = () => onEnd();
  }

  window.speechSynthesis.speak(utterance);

  return {
    cancel: () => {
      window.speechSynthesis.cancel();
    }
  };
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
