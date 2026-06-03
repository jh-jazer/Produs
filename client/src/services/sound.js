import useAuthStore from '../store/useAuthStore';

// Web Audio API Sound Engine
class SoundManager {
    constructor() {
        this.ctx = null;
        this.alarmInterval = null;
        
        // Background focus sound nodes
        this.bgSource = null;
        this.bgGain = null;
        this.bgFilter = null;
        this.bgLfo = null;
        this.bgLfoGain = null;
    }

    initContext() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return this.ctx;
    }

    isMuted() {
        const user = useAuthStore.getState().user;
        return user?.settings?.soundsEnabled === false;
    }

    play(type) {
        if (this.isMuted()) return;
        try {
            const ctx = this.initContext();
            const now = ctx.currentTime;
            
            const user = useAuthStore.getState().user;
            const soundVolume = user?.settings?.soundVolume ?? 1.0;

            const globalGain = ctx.createGain();
            globalGain.gain.value = soundVolume;
            globalGain.connect(ctx.destination);

            // Gain node to control volume
            const masterGain = ctx.createGain();
            masterGain.connect(globalGain);

            switch (type) {
                case 'click': {
                    // Very short subtle high-frequency transient click
                    const osc = ctx.createOscillator();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(1000, now);
                    osc.frequency.exponentialRampToValueAtTime(600, now + 0.04);
                    
                    masterGain.gain.setValueAtTime(0.04, now);
                    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
                    
                    osc.connect(masterGain);
                    osc.start(now);
                    osc.stop(now + 0.04);
                    break;
                }
                case 'navigation': {
                    // Soft swoosh/slide sound
                    const osc = ctx.createOscillator();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(450, now);
                    osc.frequency.exponentialRampToValueAtTime(650, now + 0.12);

                    masterGain.gain.setValueAtTime(0.05, now);
                    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

                    osc.connect(masterGain);
                    osc.start(now);
                    osc.stop(now + 0.12);
                    break;
                }
                case 'ding': {
                    // Satisfying metallic/crystal bell chime
                    const osc1 = ctx.createOscillator();
                    const osc2 = ctx.createOscillator();
                    const gain1 = ctx.createGain();
                    const gain2 = ctx.createGain();
                    
                    osc1.type = 'sine';
                    osc1.frequency.setValueAtTime(880, now); // A5 fundamental
                    
                    osc2.type = 'triangle';
                    osc2.frequency.setValueAtTime(1760, now); // A6 overtone
                    
                    gain1.gain.setValueAtTime(0.15, now);
                    gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
                    
                    gain2.gain.setValueAtTime(0.05, now);
                    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
                    
                    osc1.connect(gain1);
                    osc2.connect(gain2);
                    gain1.connect(masterGain);
                    gain2.connect(masterGain);
                    
                    osc1.start(now);
                    osc2.start(now);
                    osc1.stop(now + 1.2);
                    osc2.stop(now + 1.2);
                    break;
                }
                case 'pop': {
                    // Satisfying round pop
                    const osc = ctx.createOscillator();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(150, now);
                    osc.frequency.exponentialRampToValueAtTime(900, now + 0.08);

                    masterGain.gain.setValueAtTime(0.15, now);
                    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

                    osc.connect(masterGain);
                    osc.start(now);
                    osc.stop(now + 0.08);
                    break;
                }
                case 'notification': {
                    // Friendly C5 - G5 double chime
                    const osc = ctx.createOscillator();
                    osc.type = 'sine';
                    
                    // Two tones sequence
                    osc.frequency.setValueAtTime(523.25, now); // C5
                    osc.frequency.setValueAtTime(783.99, now + 0.15); // G5
                    
                    masterGain.gain.setValueAtTime(0.12, now);
                    masterGain.gain.setValueAtTime(0.12, now + 0.15);
                    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
                    
                    osc.connect(masterGain);
                    osc.start(now);
                    osc.stop(now + 0.6);
                    break;
                }
                case 'connectionAccepted': {
                    // Uplifting arpeggio C5 -> E5 -> G5 -> C6
                    const osc = ctx.createOscillator();
                    osc.type = 'sine';
                    
                    const notes = [523.25, 659.25, 783.99, 1046.50];
                    notes.forEach((freq, idx) => {
                        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
                    });
                    
                    masterGain.gain.setValueAtTime(0.12, now);
                    masterGain.gain.setValueAtTime(0.12, now + 0.3);
                    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
                    
                    osc.connect(masterGain);
                    osc.start(now);
                    osc.stop(now + 0.8);
                    break;
                }
                case 'xpGain': {
                    // Gold spark retro RPG sounds
                    const osc = ctx.createOscillator();
                    osc.type = 'triangle';
                    
                    // Rapid short frequency changes
                    const nowFreq = 1200;
                    for (let i = 0; i < 5; i++) {
                        osc.frequency.setValueAtTime(nowFreq + i * 200, now + i * 0.04);
                    }
                    
                    masterGain.gain.setValueAtTime(0.08, now);
                    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
                    
                    osc.connect(masterGain);
                    osc.start(now);
                    osc.stop(now + 0.22);
                    break;
                }
                case 'levelUp': {
                    // Rising retro 8-bit level up theme
                    const osc1 = ctx.createOscillator();
                    const osc2 = ctx.createOscillator();
                    osc1.type = 'sine';
                    osc2.type = 'triangle';
                    
                    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
                    notes.forEach((freq, idx) => {
                        osc1.frequency.setValueAtTime(freq, now + idx * 0.08);
                        osc2.frequency.setValueAtTime(freq * 1.5, now + idx * 0.08 + 0.04);
                    });
                    
                    masterGain.gain.setValueAtTime(0.1, now);
                    masterGain.gain.setValueAtTime(0.1, now + 0.4);
                    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);
                    
                    osc1.connect(masterGain);
                    osc2.connect(masterGain);
                    
                    osc1.start(now);
                    osc2.start(now);
                    osc1.stop(now + 1.0);
                    osc2.stop(now + 1.0);
                    break;
                }
                case 'evolution': {
                    // Deep synth swell rising up
                    const osc = ctx.createOscillator();
                    osc.type = 'sawtooth';
                    
                    const filter = ctx.createBiquadFilter();
                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(100, now);
                    filter.frequency.exponentialRampToValueAtTime(1200, now + 1.5);
                    
                    osc.frequency.setValueAtTime(80, now);
                    osc.frequency.linearRampToValueAtTime(220, now + 1.5);
                    
                    masterGain.gain.setValueAtTime(0.001, now);
                    masterGain.gain.linearRampToValueAtTime(0.15, now + 0.4);
                    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
                    
                    osc.connect(filter);
                    filter.connect(masterGain);
                    
                    osc.start(now);
                    osc.stop(now + 1.6);
                    break;
                }
                case 'timerStart': {
                    // Beep beep boop
                    const osc = ctx.createOscillator();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(600, now);
                    osc.frequency.setValueAtTime(600, now + 0.1);
                    osc.frequency.setValueAtTime(800, now + 0.2);
                    
                    masterGain.gain.setValueAtTime(0.08, now);
                    masterGain.gain.setValueAtTime(0.08, now + 0.2);
                    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                    
                    osc.connect(masterGain);
                    osc.start(now);
                    osc.stop(now + 0.4);
                    break;
                }
                default:
                    break;
            }
        } catch (e) {
            console.error('Error playing sound:', e);
        }
    }

    previewAlarm(alarmType) {
        if (this.isMuted()) return;
        this.playSingleAlarm(alarmType);
    }

    playSingleAlarm(alarmType) {
        try {
            const ctx = this.initContext();
            const now = ctx.currentTime;
            
            const user = useAuthStore.getState().user;
            const soundVolume = user?.settings?.soundVolume ?? 1.0;

            const globalGain = ctx.createGain();
            globalGain.gain.value = soundVolume;
            globalGain.connect(ctx.destination);

            const masterGain = ctx.createGain();
            masterGain.connect(globalGain);

            switch (alarmType) {
                case 'digital': {
                    // Repeating standard sharp alarm beep
                    const osc = ctx.createOscillator();
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(880, now);
                    
                    masterGain.gain.setValueAtTime(0.1, now);
                    masterGain.gain.setValueAtTime(0.001, now + 0.15);
                    masterGain.gain.setValueAtTime(0.1, now + 0.3);
                    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
                    
                    osc.connect(masterGain);
                    osc.start(now);
                    osc.stop(now + 0.5);
                    break;
                }
                case 'crystal': {
                    // Bright, sparkly bell chime
                    const osc = ctx.createOscillator();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(1046.50, now); // C6
                    osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.2); // E6
                    osc.frequency.exponentialRampToValueAtTime(1567.98, now + 0.4); // G6
                    
                    masterGain.gain.setValueAtTime(0.15, now);
                    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
                    
                    osc.connect(masterGain);
                    osc.start(now);
                    osc.stop(now + 1.25);
                    break;
                }
                case 'retro': {
                    // 8-bit laser frequency sweep downward
                    const osc = ctx.createOscillator();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(2000, now);
                    osc.frequency.exponentialRampToValueAtTime(150, now + 0.4);
                    
                    masterGain.gain.setValueAtTime(0.06, now);
                    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                    
                    osc.connect(masterGain);
                    osc.start(now);
                    osc.stop(now + 0.45);
                    break;
                }
                case 'pulse': {
                    // High-low-high alert pulse
                    const osc = ctx.createOscillator();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(440, now);
                    osc.frequency.linearRampToValueAtTime(660, now + 0.2);
                    osc.frequency.linearRampToValueAtTime(440, now + 0.4);
                    
                    masterGain.gain.setValueAtTime(0.12, now);
                    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
                    
                    osc.connect(masterGain);
                    osc.start(now);
                    osc.stop(now + 0.65);
                    break;
                }
                case 'zen': {
                    // Deep singing bowl gong sound
                    const osc1 = ctx.createOscillator();
                    const osc2 = ctx.createOscillator();
                    osc1.type = 'sine';
                    osc1.frequency.setValueAtTime(180, now);
                    
                    osc2.type = 'sine';
                    osc2.frequency.setValueAtTime(183, now); // detuned for beating effect
                    
                    masterGain.gain.setValueAtTime(0.2, now);
                    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
                    
                    osc1.connect(masterGain);
                    osc2.connect(masterGain);
                    
                    osc1.start(now);
                    osc2.start(now);
                    osc1.stop(now + 1.9);
                    osc2.stop(now + 1.9);
                    break;
                }
            }
        } catch (e) {
            console.error('Error playing single alarm:', e);
        }
    }

    startAlarm(alarmType) {
        this.stopAlarm();
        
        // Setup initial play
        this.playSingleAlarm(alarmType);
        
        // Schedule repeated plays
        let intervalMs = 1500;
        if (alarmType === 'digital') intervalMs = 900;
        else if (alarmType === 'zen') intervalMs = 2000;
        else if (alarmType === 'crystal') intervalMs = 1500;
        else if (alarmType === 'retro') intervalMs = 800;
        else if (alarmType === 'pulse') intervalMs = 1000;

        this.alarmInterval = setInterval(() => {
            if (this.isMuted()) return;
            this.playSingleAlarm(alarmType);
        }, intervalMs);
    }

    stopAlarm() {
        if (this.alarmInterval) {
            clearInterval(this.alarmInterval);
            this.alarmInterval = null;
        }
    }

    startFocusBackground(type) {
        this.stopFocusBackground();
        if (this.isMuted() || type === 'silence' || !type) return;

        try {
            const ctx = this.initContext();
            const now = ctx.currentTime;

            // Create buffer for white noise
            const sampleRate = ctx.sampleRate;
            const bufferSize = 2 * sampleRate;
            const noiseBuffer = ctx.createBuffer(1, bufferSize, sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }

            // Create source node
            this.bgSource = ctx.createBufferSource();
            this.bgSource.buffer = noiseBuffer;
            this.bgSource.loop = true;

            // Filter to make it pleasant
            this.bgFilter = ctx.createBiquadFilter();
            this.bgFilter.type = 'lowpass';

            // Gain node for volume control
            this.bgGain = ctx.createGain();

            if (type === 'white_noise') {
                // Gentle white noise hiss
                this.bgFilter.frequency.setValueAtTime(650, now);
                this.bgGain.gain.setValueAtTime(0.015, now);
            } else if (type === 'rain') {
                // Soothing rain patter (lower cutoff filter + amplitude modulation)
                this.bgFilter.frequency.setValueAtTime(350, now);
                this.bgGain.gain.setValueAtTime(0.025, now);

                // Add an LFO to modulate gain slightly to simulate changing intensity
                this.bgLfo = ctx.createOscillator();
                this.bgLfo.type = 'sine';
                this.bgLfo.frequency.setValueAtTime(0.12, now); // slow oscillation

                this.bgLfoGain = ctx.createGain();
                this.bgLfoGain.gain.setValueAtTime(0.008, now); // depth of modulation

                this.bgLfo.connect(this.bgLfoGain);
                this.bgLfoGain.connect(this.bgGain.gain); // modulate gain
                this.bgLfo.start(now);
            }

            // Connect nodes
            const user = useAuthStore.getState().user;
            const soundVolume = user?.settings?.soundVolume ?? 1.0;

            const globalGain = ctx.createGain();
            globalGain.gain.value = soundVolume;
            globalGain.connect(ctx.destination);

            this.bgSource.connect(this.bgFilter);
            this.bgFilter.connect(this.bgGain);
            this.bgGain.connect(globalGain);

            this.bgSource.start(now);
        } catch (e) {
            console.error('Error starting focus background:', e);
        }
    }

    stopFocusBackground() {
        try {
            if (this.bgSource) {
                this.bgSource.stop();
                this.bgSource.disconnect();
                this.bgSource = null;
            }
            if (this.bgFilter) {
                this.bgFilter.disconnect();
                this.bgFilter = null;
            }
            if (this.bgGain) {
                this.bgGain.disconnect();
                this.bgGain = null;
            }
            if (this.bgLfo) {
                this.bgLfo.stop();
                this.bgLfo.disconnect();
                this.bgLfo = null;
            }
            if (this.bgLfoGain) {
                this.bgLfoGain.disconnect();
                this.bgLfoGain = null;
            }
        } catch (e) {
            console.error('Error stopping focus background:', e);
        }
    }
}

export const soundManager = new SoundManager();
