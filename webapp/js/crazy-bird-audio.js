(function () {
    class CrazyBirdAudio {
        constructor() {
            this.ctx = null;
            this.master = null;
            this.sfx = null;
            this.music = null;
            this.ambience = null;
            this.enabled = true;
            this.theme = 0;
            this.musicStep = 0;
            this.musicTimer = null;
            this.lastAim = 0;
            this.banks = [
                { tempo: 0.36, wave: "triangle", melody: [523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 440], bass: [130.81, 146.83, 164.81, 196] },
                { tempo: 0.4, wave: "sine", melody: [392, 493.88, 587.33, 659.25, 587.33, 493.88, 440, 392], bass: [98, 123.47, 146.83, 164.81] },
                { tempo: 0.34, wave: "sawtooth", melody: [329.63, 392, 493.88, 659.25, 493.88, 392, 349.23, 293.66], bass: [82.41, 98, 123.47, 146.83] },
                { tempo: 0.38, wave: "triangle", melody: [587.33, 659.25, 739.99, 880, 739.99, 659.25, 587.33, 493.88], bass: [146.83, 164.81, 185, 220] }
            ];
        }

        ensure() {
            if (this.ctx) {
                return this.ctx;
            }
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) {
                return null;
            }
            this.ctx = new AudioCtx();
            const compressor = this.ctx.createDynamicsCompressor();
            this.master = this.ctx.createGain();
            this.sfx = this.ctx.createGain();
            this.music = this.ctx.createGain();
            this.ambience = this.ctx.createGain();
            compressor.threshold.value = -12;
            compressor.knee.value = 10;
            compressor.ratio.value = 3.6;
            compressor.attack.value = 0.005;
            compressor.release.value = 0.26;
            this.master.gain.value = this.enabled ? 1.2 : 0;
            this.sfx.gain.value = 3.2;
            this.music.gain.value = 0.55;
            this.ambience.gain.value = 0.56;
            this.sfx.connect(compressor);
            this.music.connect(compressor);
            this.ambience.connect(compressor);
            compressor.connect(this.master);
            this.master.connect(this.ctx.destination);
            return this.ctx;
        }

        resume() {
            const ctx = this.ensure();
            if (ctx && ctx.state === "suspended") {
                ctx.resume();
            }
            if (this.enabled) {
                this.startMusic();
            }
        }

        setEnabled(value) {
            this.enabled = !!value;
            const ctx = this.ensure();
            if (!ctx || !this.master) {
                return;
            }
            this.master.gain.cancelScheduledValues(ctx.currentTime);
            this.master.gain.setTargetAtTime(this.enabled ? 1 : 0, ctx.currentTime, 0.05);
            if (this.enabled) {
                this.startMusic();
            } else {
                this.stopMusic();
            }
        }

        setTheme(level) {
            this.theme = Math.max(0, Number(level) || 0);
            this.musicStep = 0;
        }

        tone(options, output) {
            const ctx = this.ensure();
            const destination = output || this.sfx;
            if (!ctx || !this.enabled || !destination) {
                return;
            }
            const start = ctx.currentTime + (options.delay || 0);
            const duration = Math.max(options.duration || 0.12, 0.02);
            const end = start + duration;
            const oscillator = ctx.createOscillator();
            const gain = ctx.createGain();
            const from = Math.max(options.from || 220, 35);
            const to = Math.max(options.to || from, 35);
            oscillator.type = options.type || "triangle";
            oscillator.frequency.setValueAtTime(from, start);
            if (Math.abs(from - to) > 0.01) {
                oscillator.frequency.exponentialRampToValueAtTime(to, end);
            }
            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.exponentialRampToValueAtTime(Math.max(options.volume || 0.05, 0.0002), start + Math.min(0.025, duration * 0.35));
            gain.gain.exponentialRampToValueAtTime(0.0001, end);
            oscillator.connect(gain);
            gain.connect(destination);
            oscillator.start(start);
            oscillator.stop(end + 0.03);
        }

        burst(options, output) {
            const ctx = this.ensure();
            const destination = output || this.sfx;
            if (!ctx || !this.enabled || !destination) {
                return;
            }
            const start = ctx.currentTime + (options.delay || 0);
            const duration = options.duration || 0.12;
            const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < data.length; i += 1) {
                const decay = Math.pow(1 - i / data.length, options.decay || 1.4);
                data[i] = (Math.random() * 2 - 1) * decay;
            }
            const source = ctx.createBufferSource();
            const filter = ctx.createBiquadFilter();
            const gain = ctx.createGain();
            source.buffer = buffer;
            filter.type = options.filterType || "bandpass";
            filter.frequency.setValueAtTime(options.frequency || 540, start);
            filter.Q.value = options.q || 1.1;
            gain.gain.setValueAtTime(options.volume || 0.045, start);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
            source.connect(filter);
            filter.connect(gain);
            gain.connect(destination);
            source.start(start);
            source.stop(start + duration + 0.03);
        }

        chord(notes, duration, volume, delay, type, output) {
            notes.forEach((note, i) => {
                this.tone({ from: note, to: note * 1.003, duration: duration, volume: volume * (1 - i * 0.08), delay: (delay || 0) + i * 0.012, type: type || "triangle" }, output);
            });
        }

        startMusic(level) {
            if (typeof level === "number") {
                this.setTheme(level);
            }
            const ctx = this.ensure();
            if (!ctx || !this.enabled || this.musicTimer) {
                return;
            }
            const tick = () => {
                if (!this.enabled || !this.ctx) {
                    this.stopMusic();
                    return;
                }
                const bank = this.banks[this.theme % this.banks.length];
                const index = this.musicStep % bank.melody.length;
                const note = bank.melody[index];
                const bass = bank.bass[Math.floor(index / 2) % bank.bass.length];
                this.tone({ from: note, to: note * 1.006, duration: bank.tempo * 0.78, volume: 0.026, type: bank.wave }, this.music);
                if (index % 2 === 0) {
                    this.tone({ from: bass, to: bass * 0.998, duration: bank.tempo * 1.65, volume: 0.024, type: "sine" }, this.music);
                }
                if (index % 8 === 0) {
                    this.burst({ frequency: 1800, duration: 0.28, volume: 0.006, filterType: "highpass", decay: 2.4 }, this.ambience);
                }
                this.musicStep += 1;
                this.musicTimer = setTimeout(tick, bank.tempo * 1000);
            };
            tick();
        }

        stopMusic() {
            if (this.musicTimer) {
                clearTimeout(this.musicTimer);
                this.musicTimer = null;
            }
        }

        playButton() {
            this.tone({ from: 520, to: 760, duration: 0.07, volume: 0.025, type: "sine" });
            this.tone({ from: 760, to: 980, duration: 0.08, volume: 0.018, delay: 0.045, type: "triangle" });
        }

        playLevelStart(level) {
            this.setTheme(level);
            this.startMusic(level);
            this.chord([392, 493.88, 587.33], 0.16, 0.035, 0, "triangle");
            this.burst({ frequency: 1200, duration: 0.12, volume: 0.018, filterType: "highpass", delay: 0.08 });
        }

        playBirdReady() {
            this.tone({ from: 620, to: 520, duration: 0.08, volume: 0.025, type: "triangle" });
            this.tone({ from: 760, to: 620, duration: 0.08, volume: 0.018, delay: 0.04, type: "sine" });
        }

        playAim(power) {
            const ctx = this.ensure();
            if (!ctx || ctx.currentTime - this.lastAim < 0.09) {
                return;
            }
            this.lastAim = ctx.currentTime;
            const normalized = Math.max(0.15, Math.min(power / 100, 1));
            this.tone({ from: 160 + normalized * 120, to: 145 + normalized * 100, duration: 0.055, volume: 0.012 + normalized * 0.014, type: "triangle" });
        }

        playLaunch(power) {
            const normalized = Math.max(0.3, Math.min(power / 100, 1));
            this.tone({ from: 170 + normalized * 150, to: 360 + normalized * 260, duration: 0.18, volume: 0.062, type: "triangle" });
            this.tone({ from: 260 + normalized * 90, to: 820 + normalized * 240, duration: 0.12, volume: 0.032, delay: 0.04, type: "sine" });
            this.burst({ frequency: 680 + normalized * 360, duration: 0.12, volume: 0.028, filterType: "highpass" });
        }

        playImpact(intensity, material) {
            const volume = Math.min(0.09, 0.026 + intensity * 0.011);
            const frequency = material === "stone" ? 190 : material === "glass" ? 1250 : 420;
            const filterType = material === "stone" ? "lowpass" : material === "glass" ? "highpass" : "bandpass";
            this.burst({ frequency: frequency, duration: 0.09 + intensity * 0.012, volume: volume, filterType: filterType });
            if (material === "glass") {
                this.tone({ from: 1480, to: 760, duration: 0.08, volume: 0.025, type: "sine" });
            }
            if (material === "stone") {
                this.tone({ from: 140, to: 90, duration: 0.16, volume: 0.032, type: "square" });
            }
        }

        playDestroy(material) {
            if (material === "glass") {
                this.chord([1180, 1420, 1760], 0.13, 0.035, 0, "sine");
                this.burst({ frequency: 1680, duration: 0.15, volume: 0.045, filterType: "highpass" });
                return;
            }
            if (material === "stone") {
                this.tone({ from: 180, to: 72, duration: 0.26, volume: 0.065, type: "square" });
                this.burst({ frequency: 240, duration: 0.2, volume: 0.052, filterType: "lowpass" });
                return;
            }
            this.tone({ from: 340, to: 170, duration: 0.14, volume: 0.052, type: "triangle" });
            this.burst({ frequency: 430, duration: 0.12, volume: 0.04, filterType: "bandpass" });
        }

        playPigHit(damage) {
            const normalized = Math.max(0.25, Math.min(damage || 0.4, 1.4));
            this.tone({ from: 380 + normalized * 90, to: 290, duration: 0.09, volume: 0.025 + normalized * 0.01, type: "sawtooth" });
        }

        playPig() {
            this.tone({ from: 560, to: 300, duration: 0.14, volume: 0.055, type: "sawtooth" });
            this.tone({ from: 420, to: 220, duration: 0.16, volume: 0.03, delay: 0.09, type: "triangle" });
        }

        playCombo(combo) {
            const base = 520 + Math.min(combo || 1, 8) * 45;
            this.chord([base, base * 1.25, base * 1.5], 0.12, 0.026, 0, "triangle");
        }

        playSkill(kind) {
            if (kind === "split") {
                this.chord([760, 980, 1240], 0.16, 0.04, 0, "triangle");
                this.burst({ frequency: 1520, duration: 0.12, volume: 0.02, filterType: "highpass", delay: 0.04 });
                return;
            }
            if (kind === "shock") {
                this.tone({ from: 190, to: 58, duration: 0.32, volume: 0.08, type: "square" });
                this.burst({ frequency: 180, duration: 0.24, volume: 0.065, filterType: "lowpass" });
                this.burst({ frequency: 820, duration: 0.08, volume: 0.018, filterType: "bandpass", delay: 0.02 });
                return;
            }
            if (kind === "frost") {
                this.chord([880, 1174.66, 1567.98], 0.2, 0.035, 0, "sine");
                this.burst({ frequency: 2200, duration: 0.18, volume: 0.018, filterType: "highpass", decay: 2.2 });
                return;
            }
            if (kind === "pierce") {
                this.tone({ from: 520, to: 1420, duration: 0.12, volume: 0.05, type: "sawtooth" });
                this.burst({ frequency: 1600, duration: 0.07, volume: 0.026, filterType: "highpass", delay: 0.04 });
                return;
            }
            if (kind === "lift") {
                this.chord([440, 587.33, 739.99, 880], 0.3, 0.04, 0, "sine");
                this.tone({ from: 220, to: 880, duration: 0.42, volume: 0.055, type: "triangle", delay: 0.02 });
                this.burst({ frequency: 1400, duration: 0.22, volume: 0.022, filterType: "highpass", delay: 0.05 });
                return;
            }
            if (kind === "boomerang") {
                this.tone({ from: 560, to: 960, duration: 0.1, volume: 0.05, type: "sawtooth" });
                this.tone({ from: 960, to: 420, duration: 0.18, volume: 0.055, type: "sawtooth", delay: 0.12 });
                return;
            }
            if (kind === "teleport") {
                this.burst({ frequency: 2400, duration: 0.12, volume: 0.032, filterType: "highpass" });
                this.chord([880, 1320, 1760], 0.16, 0.035, 0.04, "triangle");
                return;
            }
            if (kind === "egg_drop") {
                this.tone({ from: 640, to: 200, duration: 0.22, volume: 0.05, type: "sine" });
                this.burst({ frequency: 260, duration: 0.14, volume: 0.045, filterType: "lowpass", delay: 0.22 });
                return;
            }
            if (kind === "inflate") {
                this.tone({ from: 160, to: 440, duration: 0.34, volume: 0.07, type: "sawtooth" });
                this.burst({ frequency: 320, duration: 0.16, volume: 0.03, filterType: "bandpass", delay: 0.08 });
                return;
            }
            if (kind === "heal") {
                this.chord([523.25, 659.25, 783.99, 1046.5], 0.36, 0.04, 0, "sine");
                this.chord([659.25, 830.61, 987.77, 1318.51], 0.26, 0.035, 0.2, "sine");
                return;
            }
            if (kind === "shield") {
                this.tone({ from: 440, to: 880, duration: 0.18, volume: 0.06, type: "square" });
                this.burst({ frequency: 1800, duration: 0.14, volume: 0.024, filterType: "bandpass", delay: 0.05 });
                return;
            }
            if (kind === "chain_lightning") {
                this.burst({ frequency: 2600, duration: 0.2, volume: 0.04, filterType: "highpass" });
                this.tone({ from: 1200, to: 380, duration: 0.16, volume: 0.05, type: "sawtooth", delay: 0.05 });
                this.burst({ frequency: 520, duration: 0.12, volume: 0.028, filterType: "bandpass", delay: 0.18 });
                return;
            }
            if (kind === "grapple") {
                this.tone({ from: 200, to: 560, duration: 0.3, volume: 0.055, type: "triangle" });
                this.burst({ frequency: 420, duration: 0.18, volume: 0.024, filterType: "bandpass", delay: 0.18 });
                return;
            }
            if (kind === "sandstorm") {
                this.burst({ frequency: 380, duration: 0.6, volume: 0.05, filterType: "bandpass" });
                this.tone({ from: 240, to: 160, duration: 0.5, volume: 0.04, type: "sawtooth", delay: 0.1 });
                return;
            }
            if (kind === "phase") {
                this.tone({ from: 880, to: 180, duration: 0.34, volume: 0.045, type: "sine" });
                this.burst({ frequency: 1400, duration: 0.22, volume: 0.02, filterType: "highpass", delay: 0.08 });
                return;
            }
            if (kind === "laser") {
                this.tone({ from: 1800, to: 600, duration: 0.24, volume: 0.07, type: "square" });
                this.burst({ frequency: 3000, duration: 0.1, volume: 0.03, filterType: "highpass" });
                return;
            }
            if (kind === "gravity_reverse") {
                this.tone({ from: 880, to: 220, duration: 0.38, volume: 0.052, type: "sine" });
                this.chord([330, 440], 0.26, 0.03, 0.18, "triangle");
                return;
            }
            if (kind === "shatter") {
                this.burst({ frequency: 3000, duration: 0.2, volume: 0.038, filterType: "highpass" });
                this.chord([1200, 1600, 2000, 2400], 0.16, 0.028, 0.04, "triangle");
                return;
            }
            if (kind === "homing") {
                this.tone({ from: 420, to: 1280, duration: 0.26, volume: 0.06, type: "sawtooth" });
                this.burst({ frequency: 800, duration: 0.2, volume: 0.026, filterType: "bandpass", delay: 0.12 });
                return;
            }
            if (kind === "magnet") {
                this.tone({ from: 160, to: 280, duration: 0.42, volume: 0.055, type: "sine" });
                this.burst({ frequency: 340, duration: 0.22, volume: 0.022, filterType: "bandpass", delay: 0.14 });
                return;
            }
            if (kind === "toxic_cloud") {
                this.burst({ frequency: 620, duration: 0.55, volume: 0.045, filterType: "bandpass" });
                this.tone({ from: 180, to: 260, duration: 0.42, volume: 0.038, type: "sawtooth", delay: 0.12 });
                return;
            }
            if (kind === "burn") {
                this.burst({ frequency: 920, duration: 0.32, volume: 0.045, filterType: "bandpass" });
                this.tone({ from: 480, to: 280, duration: 0.22, volume: 0.042, type: "sawtooth" });
                return;
            }
            if (kind === "sonic_boom") {
                this.tone({ from: 1600, to: 120, duration: 0.32, volume: 0.085, type: "sawtooth" });
                this.burst({ frequency: 320, duration: 0.2, volume: 0.055, filterType: "lowpass", delay: 0.08 });
                return;
            }
            if (kind === "ghost_dive") {
                this.tone({ from: 1040, to: 220, duration: 0.42, volume: 0.05, type: "sine" });
                this.burst({ frequency: 1600, duration: 0.22, volume: 0.022, filterType: "highpass", delay: 0.12 });
                return;
            }
            this.tone({ from: 360, to: 920, duration: 0.15, volume: 0.052, type: "triangle" });
            this.burst({ frequency: 980, duration: 0.08, volume: 0.018, filterType: "highpass" });
        }

        playWin() {
            this.chord([523.25, 659.25, 783.99], 0.16, 0.04, 0, "triangle");
            this.chord([659.25, 783.99, 1046.5], 0.18, 0.04, 0.16, "triangle");
            this.chord([783.99, 1046.5, 1318.51], 0.24, 0.045, 0.34, "sine");
        }

        playLose() {
            this.tone({ from: 260, to: 180, duration: 0.18, volume: 0.045, type: "square" });
            this.tone({ from: 180, to: 120, duration: 0.28, volume: 0.04, delay: 0.14, type: "triangle" });
            this.burst({ frequency: 180, duration: 0.22, volume: 0.035, filterType: "lowpass", delay: 0.08 });
        }
    }

    window.CrazyBirdAudio = CrazyBirdAudio;
})();
