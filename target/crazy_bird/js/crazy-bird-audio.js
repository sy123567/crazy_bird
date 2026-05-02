(function () {
    class CrazyBirdAudio {
        constructor() {
            this.ctx = null;
            this.master = null;
            this.enabled = true;
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
            this.master = this.ctx.createGain();
            this.master.gain.value = 0.17;
            this.master.connect(this.ctx.destination);
            return this.ctx;
        }

        resume() {
            const ctx = this.ensure();
            if (ctx && ctx.state === "suspended") {
                ctx.resume();
            }
        }

        setEnabled(value) {
            this.enabled = !!value;
            const ctx = this.ensure();
            if (!ctx || !this.master) {
                return;
            }
            this.master.gain.cancelScheduledValues(ctx.currentTime);
            this.master.gain.setValueAtTime(this.enabled ? 0.17 : 0, ctx.currentTime);
        }

        tone(options) {
            const ctx = this.ensure();
            if (!ctx || !this.enabled || !this.master) {
                return;
            }
            const start = ctx.currentTime + (options.delay || 0);
            const end = start + options.duration;
            const oscillator = ctx.createOscillator();
            const gain = ctx.createGain();
            oscillator.type = options.type || "triangle";
            oscillator.frequency.setValueAtTime(options.from, start);
            oscillator.frequency.exponentialRampToValueAtTime(Math.max(options.to || options.from, 35), end);
            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.exponentialRampToValueAtTime(Math.max(options.volume || 0.05, 0.0002), start + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, end);
            oscillator.connect(gain);
            gain.connect(this.master);
            oscillator.start(start);
            oscillator.stop(end + 0.02);
        }

        burst(options) {
            const ctx = this.ensure();
            if (!ctx || !this.enabled || !this.master) {
                return;
            }
            const start = ctx.currentTime + (options.delay || 0);
            const duration = options.duration || 0.12;
            const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < data.length; i += 1) {
                const decay = 1 - i / data.length;
                data[i] = (Math.random() * 2 - 1) * decay;
            }
            const source = ctx.createBufferSource();
            const filter = ctx.createBiquadFilter();
            const gain = ctx.createGain();
            source.buffer = buffer;
            filter.type = options.filterType || "bandpass";
            filter.frequency.setValueAtTime(options.frequency || 540, start);
            gain.gain.setValueAtTime(options.volume || 0.045, start);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
            source.connect(filter);
            filter.connect(gain);
            gain.connect(this.master);
            source.start(start);
            source.stop(start + duration + 0.02);
        }

        playLaunch(power) {
            const normalized = Math.max(0.3, Math.min(power / 100, 1));
            this.tone({ from: 180 + normalized * 140, to: 320 + normalized * 180, duration: 0.16, volume: 0.06, type: "triangle" });
            this.burst({ frequency: 520, duration: 0.08, volume: 0.02, filterType: "highpass" });
        }

        playImpact(intensity, material) {
            const volume = Math.min(0.075, 0.028 + intensity * 0.01);
            const frequency = material === "stone" ? 220 : material === "glass" ? 920 : 420;
            this.burst({ frequency: frequency, duration: 0.1 + intensity * 0.012, volume: volume, filterType: material === "glass" ? "highpass" : "bandpass" });
        }

        playDestroy(material) {
            if (material === "glass") {
                this.tone({ from: 1180, to: 520, duration: 0.12, volume: 0.05, type: "sine" });
                this.burst({ frequency: 1320, duration: 0.09, volume: 0.035, filterType: "highpass" });
                return;
            }
            if (material === "stone") {
                this.tone({ from: 180, to: 90, duration: 0.18, volume: 0.055, type: "square" });
                this.burst({ frequency: 260, duration: 0.11, volume: 0.04, filterType: "lowpass" });
                return;
            }
            this.tone({ from: 340, to: 180, duration: 0.12, volume: 0.048, type: "triangle" });
            this.burst({ frequency: 420, duration: 0.08, volume: 0.03, filterType: "bandpass" });
        }

        playPig() {
            this.tone({ from: 520, to: 320, duration: 0.12, volume: 0.05, type: "sawtooth" });
        }

        playSkill(kind) {
            if (kind === "split") {
                this.tone({ from: 880, to: 1240, duration: 0.11, volume: 0.045, type: "triangle" });
                this.tone({ from: 990, to: 1480, duration: 0.13, volume: 0.03, delay: 0.02, type: "sine" });
                return;
            }
            if (kind === "shock") {
                this.tone({ from: 180, to: 80, duration: 0.24, volume: 0.07, type: "square" });
                this.burst({ frequency: 210, duration: 0.16, volume: 0.05, filterType: "lowpass" });
                return;
            }
            if (kind === "frost") {
                this.tone({ from: 980, to: 540, duration: 0.2, volume: 0.05, type: "sine" });
                this.tone({ from: 660, to: 440, duration: 0.18, volume: 0.025, delay: 0.03, type: "triangle" });
                return;
            }
            this.tone({ from: 420, to: 760, duration: 0.14, volume: 0.05, type: "triangle" });
        }

        playWin() {
            this.tone({ from: 520, to: 680, duration: 0.14, volume: 0.05, type: "triangle" });
            this.tone({ from: 680, to: 920, duration: 0.14, volume: 0.05, delay: 0.15, type: "triangle" });
            this.tone({ from: 920, to: 1240, duration: 0.22, volume: 0.06, delay: 0.32, type: "sine" });
        }

        playLose() {
            this.tone({ from: 260, to: 180, duration: 0.18, volume: 0.045, type: "square" });
            this.tone({ from: 180, to: 120, duration: 0.28, volume: 0.04, delay: 0.14, type: "triangle" });
        }
    }

    window.CrazyBirdAudio = CrazyBirdAudio;
})();
