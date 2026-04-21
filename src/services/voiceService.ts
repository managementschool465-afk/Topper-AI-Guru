export class VoiceService {
  private synth: SpeechSynthesis = window.speechSynthesis;
  private recognition: any;

  constructor() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
    }
  }

  speak(text: string, lang: string = 'hi-IN'): Promise<void> {
    return new Promise((resolve) => {
      this.synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.onend = () => resolve();
      this.synth.speak(utterance);
    });
  }

  listen(lang: string = 'hi-IN'): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) return reject("Not supported");
      this.recognition.lang = lang;
      this.recognition.onresult = (e: any) => resolve(e.results[0][0].transcript);
      this.recognition.onerror = (e: any) => reject(e.error);
      this.recognition.start();
    });
  }
}
export const voiceService = new VoiceService();
