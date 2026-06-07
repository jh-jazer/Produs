import useAuthStore from '../store/useAuthStore';

// Web Audio API Sound Engine
class SoundManager {
    constructor() {
        this.ctx = null;
        this.alarmInterval = null;
        
        // Background focus sound nodes
        this.bgSource = null;
        this.bgSource2 = null;
        this.bgGain = null;
        this.bgGain2 = null;
        this.bgGain3 = null;
        this.bgFilter = null;
        this.bgFilter2 = null;
        this.bgLfo = null;
        this.bgLfo2 = null;
        this.bgLfoGain = null;
        this.bgLfoGain2 = null;
        this.bgVolumeGain = null;
        this.bgOsc1 = null;
        this.bgOsc2 = null;
        this.bgFilterLfoGain = null;
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

    getVolume() {
        const user = useAuthStore.getState().user;
        const vol = user?.settings?.soundVolume;
        return typeof vol === 'number' ? vol : 0.5;
    }

    getBgVolume() {
        const user = useAuthStore.getState().user;
        const vol = user?.settings?.bgVolume;
        return typeof vol === 'number' ? vol : 0.5;
    }

    getAlarmVolume() {
        const user = useAuthStore.getState().user;
        const vol = user?.settings?.alarmVolume;
        return typeof vol === 'number' ? vol : 0.5;
    }

    setBgVolume(volume) {
        if (this.ctx && this.bgVolumeGain) {
            try {
                const now = this.ctx.currentTime;
                this.bgVolumeGain.gain.setValueAtTime(volume, now);
            } catch (e) {
                console.error('Error updating live bg volume:', e);
            }
        }
    }

    setVolume(volume) {
        this.setBgVolume(volume);
    }

    play(type) {
        if (this.isMuted()) return;
        try {
            const ctx = this.initContext();
            const now = ctx.currentTime;
            
            // Volume control node
            const volumeGain = ctx.createGain();
            volumeGain.gain.setValueAtTime(this.getAlarmVolume(), now);
            volumeGain.connect(ctx.destination);

            // Gain node to control volume
            const masterGain = ctx.createGain();
            masterGain.connect(volumeGain);

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
                case 'pageTurn': {
                    // Synthesize a soft book page turn/rustle sound
                    const bufferSize = ctx.sampleRate * 0.45; // ~450ms duration
                    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                    const data = buffer.getChannelData(0);
                    
                    // Fill with pink-ish noise (filtered white noise) to make it softer
                    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
                    for (let i = 0; i < bufferSize; i++) {
                        const white = Math.random() * 2 - 1;
                        // Pink noise filter approximation
                        b0 = 0.99886 * b0 + white * 0.0555179;
                        b1 = 0.99332 * b1 + white * 0.0750759;
                        b2 = 0.96900 * b2 + white * 0.1538520;
                        b3 = 0.86650 * b3 + white * 0.3104856;
                        b4 = 0.55000 * b4 + white * 0.5329522;
                        b5 = -0.7616 * b5 - white * 0.0168980;
                        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                        data[i] *= 0.11; // scale down
                        b6 = white * 0.115926;
                    }
                    
                    const noiseSource = ctx.createBufferSource();
                    noiseSource.buffer = buffer;
                    
                    // Bandpass/Lowpass filter sweep to simulate the friction of paper sliding
                    const filter = ctx.createBiquadFilter();
                    filter.type = 'bandpass';
                    // Start around 400Hz, peak around 900Hz, then fall to 200Hz
                    filter.frequency.setValueAtTime(400, now);
                    filter.frequency.exponentialRampToValueAtTime(900, now + 0.15);
                    filter.frequency.exponentialRampToValueAtTime(200, now + 0.4);
                    filter.Q.setValueAtTime(1.0, now);
                    
                    // Gain envelope for the swoosh
                    const noiseGain = ctx.createGain();
                    noiseGain.gain.setValueAtTime(0.001, now);
                    noiseGain.gain.linearRampToValueAtTime(0.22, now + 0.15); // soft swell
                    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45); // decay
                    
                    // Add a very subtle low frequency helper tone to give it the "flap" weight
                    const lowOsc = ctx.createOscillator();
                    lowOsc.type = 'triangle';
                    lowOsc.frequency.setValueAtTime(80, now);
                    lowOsc.frequency.linearRampToValueAtTime(50, now + 0.3);
                    
                    const lowGain = ctx.createGain();
                    lowGain.gain.setValueAtTime(0.001, now);
                    lowGain.gain.linearRampToValueAtTime(0.06, now + 0.1);
                    lowGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                    
                    // Connections
                    noiseSource.connect(filter);
                    filter.connect(noiseGain);
                    noiseGain.connect(masterGain);
                    
                    lowOsc.connect(lowGain);
                    lowGain.connect(masterGain);
                    
                    // Play
                    noiseSource.start(now);
                    noiseSource.stop(now + 0.45);
                    lowOsc.start(now);
                    lowOsc.stop(now + 0.35);
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
            
            const volumeGain = ctx.createGain();
            volumeGain.gain.setValueAtTime(this.getAlarmVolume(), now);
            volumeGain.connect(ctx.destination);

            const masterGain = ctx.createGain();
            masterGain.connect(volumeGain);

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

            if (type === 'thunderstorm') {
                const sampleRate = ctx.sampleRate;
                const bufferSize = 2 * sampleRate;
                
                // Create white noise buffer for rain
                const whiteBuffer = ctx.createBuffer(1, bufferSize, sampleRate);
                const whiteOutput = whiteBuffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    whiteOutput[i] = Math.random() * 2 - 1;
                }

                // Create brown noise buffer for thunder
                const brownBuffer = ctx.createBuffer(1, bufferSize, sampleRate);
                const brownOutput = brownBuffer.getChannelData(0);
                let lastOut = 0.0;
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    brownOutput[i] = (lastOut + (0.025 * white)) / 1.025;
                    lastOut = brownOutput[i];
                    brownOutput[i] *= 3.5; // loss compensation
                }

                // Rain path
                const rainSource = ctx.createBufferSource();
                rainSource.buffer = whiteBuffer;
                rainSource.loop = true;
                
                const rainFilter = ctx.createBiquadFilter();
                rainFilter.type = 'lowpass';
                rainFilter.frequency.setValueAtTime(550, now); // slightly darker rain
                
                const rainGain = ctx.createGain();
                rainGain.gain.setValueAtTime(0.06, now);
                
                // Rain intensity modulation
                this.bgLfo = ctx.createOscillator();
                this.bgLfo.type = 'sine';
                this.bgLfo.frequency.setValueAtTime(0.1, now);
                
                this.bgLfoGain = ctx.createGain();
                this.bgLfoGain.gain.setValueAtTime(0.02, now);
                
                this.bgLfo.connect(this.bgLfoGain);
                this.bgLfoGain.connect(rainGain.gain);
                
                // Thunder path
                const thunderSource = ctx.createBufferSource();
                thunderSource.buffer = brownBuffer;
                thunderSource.loop = true;
                
                const thunderFilter = ctx.createBiquadFilter();
                thunderFilter.type = 'lowpass';
                thunderFilter.frequency.setValueAtTime(80, now); // deep sub bass rumble
                
                const thunderGain = ctx.createGain();
                thunderGain.gain.setValueAtTime(0.12, now);
                
                // Thunder intensity modulation (rolling thunder slow wave)
                this.bgLfo2 = ctx.createOscillator();
                this.bgLfo2.type = 'sine';
                this.bgLfo2.frequency.setValueAtTime(0.04, now); // 25s cycle
                
                this.bgLfoGain2 = ctx.createGain();
                this.bgLfoGain2.gain.setValueAtTime(0.12, now);
                
                this.bgLfo2.connect(this.bgLfoGain2);
                this.bgLfoGain2.connect(thunderGain.gain);
                
                // Connect paths
                rainSource.connect(rainFilter);
                rainFilter.connect(rainGain);
                
                thunderSource.connect(thunderFilter);
                thunderFilter.connect(thunderGain);
                
                // Master mix gain
                this.bgGain = ctx.createGain();
                this.bgGain.gain.setValueAtTime(1.0, now);
                
                rainGain.connect(this.bgGain);
                thunderGain.connect(this.bgGain);
                
                // Save nodes for cleanup
                this.bgSource = rainSource;
                this.bgSource2 = thunderSource;
                this.bgFilter = rainFilter;
                this.bgFilter2 = thunderFilter;
                this.bgGain2 = rainGain;
                this.bgGain3 = thunderGain;
                
                this.bgVolumeGain = ctx.createGain();
                this.bgVolumeGain.gain.setValueAtTime(this.getBgVolume(), now);
                this.bgGain.connect(this.bgVolumeGain);
                this.bgVolumeGain.connect(ctx.destination);
                
                rainSource.start(now);
                thunderSource.start(now);
                this.bgLfo.start(now);
                this.bgLfo2.start(now);
            } else {
                // Create buffer for white or brown noise
                const sampleRate = ctx.sampleRate;
                const bufferSize = 2 * sampleRate;
                const noiseBuffer = ctx.createBuffer(1, bufferSize, sampleRate);
                const output = noiseBuffer.getChannelData(0);

                if (type === 'brown_noise') {
                    let lastOut = 0.0;
                    for (let i = 0; i < bufferSize; i++) {
                        const white = Math.random() * 2 - 1;
                        output[i] = (lastOut + (0.025 * white)) / 1.025;
                        lastOut = output[i];
                        output[i] *= 3.5; // loss compensation
                    }
                } else {
                    for (let i = 0; i < bufferSize; i++) {
                        output[i] = Math.random() * 2 - 1;
                    }
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
                    this.bgFilter.frequency.setValueAtTime(1000, now);
                    this.bgGain.gain.setValueAtTime(0.05, now);
                } else if (type === 'brown_noise') {
                    // Warm, deep low-frequency rumble
                    this.bgFilter.frequency.setValueAtTime(320, now);
                    this.bgGain.gain.setValueAtTime(0.12, now);
                } else if (type === 'rain') {
                    // Soothing rain patter (lower cutoff filter + amplitude modulation)
                    this.bgFilter.frequency.setValueAtTime(700, now);
                    this.bgGain.gain.setValueAtTime(0.08, now);

                    // Add an LFO to modulate gain slightly to simulate changing intensity
                    this.bgLfo = ctx.createOscillator();
                    this.bgLfo.type = 'sine';
                    this.bgLfo.frequency.setValueAtTime(0.12, now); // slow oscillation

                    this.bgLfoGain = ctx.createGain();
                    this.bgLfoGain.gain.setValueAtTime(0.025, now); // depth of modulation

                    this.bgLfo.connect(this.bgLfoGain);
                    this.bgLfoGain.connect(this.bgGain.gain); // modulate gain
                    this.bgLfo.start(now);
                } else if (type === 'ocean_waves') {
                    // Ocean waves crashing: slow gain & filter modulation
                    this.bgFilter.frequency.setValueAtTime(450, now);
                    this.bgGain.gain.setValueAtTime(0.06, now);

                    // LFO to modulate gain (waves fading in/out)
                    this.bgLfo = ctx.createOscillator();
                    this.bgLfo.type = 'sine';
                    this.bgLfo.frequency.setValueAtTime(0.12, now); // slow wave cycle

                    this.bgLfoGain = ctx.createGain();
                    this.bgLfoGain.gain.setValueAtTime(0.045, now);

                    this.bgLfo.connect(this.bgLfoGain);
                    this.bgLfoGain.connect(this.bgGain.gain);

                    // Modulate the filter frequency for sweeping wave crash effect
                    this.bgFilterLfoGain = ctx.createGain();
                    this.bgFilterLfoGain.gain.setValueAtTime(250, now);
                    
                    this.bgLfo.connect(this.bgFilterLfoGain);
                    this.bgFilterLfoGain.connect(this.bgFilter.frequency);

                    this.bgLfo.start(now);
                }

                // Connect nodes
                this.bgSource.connect(this.bgFilter);
                this.bgFilter.connect(this.bgGain);
                
                // Create volume control node
                this.bgVolumeGain = ctx.createGain();
                this.bgVolumeGain.gain.setValueAtTime(this.getBgVolume(), now);

                this.bgGain.connect(this.bgVolumeGain);
                this.bgVolumeGain.connect(ctx.destination);

                this.bgSource.start(now);
            }
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
            if (this.bgSource2) {
                this.bgSource2.stop();
                this.bgSource2.disconnect();
                this.bgSource2 = null;
            }
            if (this.bgOsc1) {
                this.bgOsc1.stop();
                this.bgOsc1.disconnect();
                this.bgOsc1 = null;
            }
            if (this.bgOsc2) {
                this.bgOsc2.stop();
                this.bgOsc2.disconnect();
                this.bgOsc2 = null;
            }
            if (this.bgFilter) {
                this.bgFilter.disconnect();
                this.bgFilter = null;
            }
            if (this.bgFilter2) {
                this.bgFilter2.disconnect();
                this.bgFilter2 = null;
            }
            if (this.bgGain) {
                this.bgGain.disconnect();
                this.bgGain = null;
            }
            if (this.bgGain2) {
                this.bgGain2.disconnect();
                this.bgGain2 = null;
            }
            if (this.bgGain3) {
                this.bgGain3.disconnect();
                this.bgGain3 = null;
            }
            if (this.bgVolumeGain) {
                this.bgVolumeGain.disconnect();
                this.bgVolumeGain = null;
            }
            if (this.bgLfo) {
                this.bgLfo.stop();
                this.bgLfo.disconnect();
                this.bgLfo = null;
            }
            if (this.bgLfo2) {
                this.bgLfo2.stop();
                this.bgLfo2.disconnect();
                this.bgLfo2 = null;
            }
            if (this.bgLfoGain) {
                this.bgLfoGain.disconnect();
                this.bgLfoGain = null;
            }
            if (this.bgLfoGain2) {
                this.bgLfoGain2.disconnect();
                this.bgLfoGain2 = null;
            }
            if (this.bgFilterLfoGain) {
                this.bgFilterLfoGain.disconnect();
                this.bgFilterLfoGain = null;
            }
        } catch (e) {
            console.error('Error stopping focus background:', e);
        }
    }
}

export const soundManager = new SoundManager();
