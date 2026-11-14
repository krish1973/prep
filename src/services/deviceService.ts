/**
 * Device Hardware & Web API Service Wrapper
 * Capacitor-ready abstraction for camera, audio, haptics, sharing, and notifications.
 */

class DeviceService {
  // Tactile audio feedback using Web Audio API (zero external assets required)
  private audioCtx: AudioContext | null = null;

  private initAudio() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Tactile sound: Pack into bag (satisfying warm 'thump/drop')
  playPackSound() {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, this.audioCtx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.14);
      this.vibrate(20);
    } catch {
      // Audio context might be restricted before gesture
    }
  }

  // Tactile sound: Unpack item (gentle spring 'pop/lift')
  playUnpackSound() {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(360, this.audioCtx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.1);
      this.vibrate(15);
    } catch {
      // Audio fallback
    }
  }

  // Sound: Success / Event Done
  playSuccessSound() {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      [330, 440, 550, 660].forEach((freq, i) => {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, now + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (i + 1) * 0.07 + 0.15);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now + i * 0.07);
        osc.stop(now + (i + 1) * 0.07 + 0.15);
      });
      this.vibrate([30, 50, 40]);
    } catch {
      // Silent fallback
    }
  }

  // Haptic feedback
  vibrate(pattern: number | number[]) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignored
      }
    }
  }

  // Web Share API
  async shareContent(title: string, text: string, url?: string): Promise<boolean> {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: url || window.location.href
        });
        return true;
      } catch {
        return false;
      }
    }
    // Fallback: Copy to clipboard
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(`${title}\n${text}\n${url || window.location.href}`);
      alert('Copied to clipboard!');
      return true;
    }
    return false;
  }

  // Camera stream access
  async getCameraStream(): Promise<MediaStream | null> {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        return await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
      } catch (err) {
        console.warn('Camera access unavailable or denied:', err);
        return null;
      }
    }
    return null;
  }
}

export const deviceService = new DeviceService();
