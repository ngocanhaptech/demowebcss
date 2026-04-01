import {
    isFunction as t,
    isCubicBezier as i,
    noopReturn as e,
    defaults as s,
    isEasingGenerator as a,
    isEasingList as n,
    interpolate as r
} from "@motionone/utils";
import {
    cubicBezier as h,
    steps as o
} from "@motionone/easing";
const l = {
    ease: h(.25, .1, .25, 1),
    "ease-in": h(.42, 0, 1, 1),
    "ease-in-out": h(.42, 0, .58, 1),
    "ease-out": h(0, 0, .58, 1)
};
const u = /\((.*?)\)/;

function getEasingFunction(s) {
    if (t(s)) return s;
    if (i(s)) return h(...s);
    if (l[s]) return l[s];
    if (s.startsWith("steps")) {
        const t = u.exec(s);
        if (t) {
            const i = t[1].split(",");
            return o(parseFloat(i[0]), i[1].trim())
        }
    }
    return e
}
class Animation {
    constructor(t, i = [0, 1], {
        easing: h,
        duration: o = s.duration,
        delay: l = s.delay,
        endDelay: u = s.endDelay,
        repeat: m = s.repeat,
        offset: c,
        direction: p = "normal"
    } = {}) {
        this.startTime = null;
        this.rate = 1;
        this.t = 0;
        this.cancelTimestamp = null;
        this.easing = e;
        this.duration = 0;
        this.totalDuration = 0;
        this.repeat = 0;
        this.playState = "idle";
        this.finished = new Promise(((t, i) => {
            this.resolve = t;
            this.reject = i
        }));
        h = h || s.easing;
        if (a(h)) {
            const t = h.createAnimation(i);
            h = t.easing;
            i = t.keyframes || i;
            o = t.duration || o
        }
        this.repeat = m;
        this.easing = n(h) ? e : getEasingFunction(h);
        this.updateDuration(o);
        const d = r(i, c, n(h) ? h.map(getEasingFunction) : e);
        this.tick = i => {
            var e;
            l = l;
            let s = 0;
            s = void 0 !== this.pauseTime ? this.pauseTime : (i - this.startTime) * this.rate;
            this.t = s;
            s /= 1e3;
            s = Math.max(s - l, 0);
            "finished" === this.playState && void 0 === this.pauseTime && (s = this.totalDuration);
            const a = s / this.duration;
            let n = Math.floor(a);
            let r = a % 1;
            !r && a >= 1 && (r = 1);
            1 === r && n--;
            const h = n % 2;
            ("reverse" === p || "alternate" === p && h || "alternate-reverse" === p && !h) && (r = 1 - r);
            const o = s >= this.totalDuration ? 1 : Math.min(r, 1);
            const m = d(this.easing(o));
            t(m);
            const c = void 0 === this.pauseTime && ("finished" === this.playState || s >= this.totalDuration + u);
            if (c) {
                this.playState = "finished";
                null === (e = this.resolve) || void 0 === e ? void 0 : e.call(this, m)
            } else "idle" !== this.playState && (this.frameRequestId = requestAnimationFrame(this.tick))
        };
        this.play()
    }
    play() {
        const t = performance.now();
        this.playState = "running";
        void 0 !== this.pauseTime ? this.startTime = t - this.pauseTime : this.startTime || (this.startTime = t);
        this.cancelTimestamp = this.startTime;
        this.pauseTime = void 0;
        this.frameRequestId = requestAnimationFrame(this.tick)
    }
    pause() {
        this.playState = "paused";
        this.pauseTime = this.t
    }
    finish() {
        this.playState = "finished";
        this.tick(0)
    }
    stop() {
        var t;
        this.playState = "idle";
        void 0 !== this.frameRequestId && cancelAnimationFrame(this.frameRequestId);
        null === (t = this.reject) || void 0 === t ? void 0 : t.call(this, false)
    }
    cancel() {
        this.stop();
        this.tick(this.cancelTimestamp)
    }
    reverse() {
        this.rate *= -1
    }
    commitStyles() {}
    updateDuration(t) {
        this.duration = t;
        this.totalDuration = t * (this.repeat + 1)
    }
    get currentTime() {
        return this.t
    }
    set currentTime(t) {
        void 0 !== this.pauseTime || 0 === this.rate ? this.pauseTime = t : this.startTime = performance.now() - t / this.rate
    }
    get playbackRate() {
        return this.rate
    }
    set playbackRate(t) {
        this.rate = t
    }
}
export {
    Animation,
    getEasingFunction
};

//# sourceMappingURL=index.es.js.map