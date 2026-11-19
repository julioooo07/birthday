import { memo, useContext, useEffect, useMemo, useRef, useState } from "react";
import { SkyModeContext, SkyLevelContext, skyAt } from "./skyContext";

const PREVIEW_MINS = { morning: 9 * 60, afternoon: 15 * 60, sunset: 18 * 60, night: 22 * 60 };
const CYCLE = [null, "morning", "afternoon", "sunset", "night"];
const minutesNow = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};

export function SkyProvider({ codes = {}, children }) {
  const [override, setOverride] = useState(null);
  const [mins, setMins] = useState(minutesNow);
  const [armed, setArmed] = useState(false);
  const target = useMemo(() => skyAt(override ? PREVIEW_MINS[override] : mins), [override, mins]);

  // re-check the clock every 20 seconds so the sky keeps shifting while the page stays open
  useEffect(() => {
    const id = setInterval(() => setMins(minutesNow()), 20000);
    return () => clearInterval(id);
  }, []);

  // the sky starts as plain day for one frame, then eases to the real one.
  // The easing itself is a CSS transition (runs on the GPU, no React re-renders).
  useEffect(() => {
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setArmed(true));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, []);

  const level = useMemo(
    () => (armed ? { sunset: target.sunset, night: target.night } : { sunset: 0, night: 0 }),
    [armed, target.sunset, target.night]
  );

  // testing only: type a word anywhere to preview that time of day
  useEffect(() => {
    const words = Object.entries(codes)
      .filter(([, w]) => w)
      .map(([name, w]) => [name, String(w).toLowerCase()]);
    if (!words.length) return undefined;
    const keep = Math.max(...words.map(([, w]) => w.length));
    let typed = "";
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
      typed = (typed + e.key.toLowerCase()).slice(-keep);
      const hit = words.find(([, w]) => typed.endsWith(w));
      if (!hit) return;
      typed = "";
      const name = hit[0];
      if (name === "auto") setOverride(null);
      else if (name === "cycle") setOverride((o) => CYCLE[(CYCLE.indexOf(o) + 1) % CYCLE.length]);
      else if (PREVIEW_MINS[name] !== undefined) setOverride(name);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [codes]);

  return (
    <SkyModeContext.Provider value={target.mode}>
      <SkyLevelContext.Provider value={level}>
        {children}
        {override && (
          <div className="sky-badge" role="status">
            Sky preview: <strong>{override}</strong>. Type: {Object.entries(codes)
              .filter(([name, w]) => w && name !== "cycle")
              .map(([, w]) => w)
              .join(", ")}
          </div>
        )}
      </SkyLevelContext.Provider>
    </SkyModeContext.Provider>
  );
}

// the day look (clouds, tulips) fades out as the night fades in, so nothing pops
export function DayLayer({ page = false, children }) {
  const { night } = useContext(SkyLevelContext);
  const off = night > 0.99;
  const parked = useParked(off);
  return (
    <div
      className={`day-layer ${page ? "page" : ""} ${off ? "off" : ""} ${parked ? "parked" : ""}`}
      style={{ opacity: 1 - night }}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}

// true only once a layer has been faded out for a while: then its animations can be paused
function useParked(isOff, ms = 6300) {
  const [parked, setParked] = useState(false);
  useEffect(() => {
    if (!isOff) return undefined;
    const id = setTimeout(() => setParked(true), ms);
    return () => {
      clearTimeout(id);
      setParked(false);
    };
  }, [isOff, ms]);
  return isOff && parked;
}

export function SunsetLayer({ page = false }) {
  const { sunset } = useContext(SkyLevelContext);
  const off = sunset < 0.01;
  const parked = useParked(off);
  return (
    <div
      className={`sunset-layer ${page ? "page" : ""} ${off ? "off" : ""} ${parked ? "parked" : ""}`}
      style={{ opacity: sunset }}
      aria-hidden="true"
    >
      <div className="sun-glow" />
      <div className="rays" />
    </div>
  );
}

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCity(seed, o) {
  const rand = rng(seed);
  const buildings = [];
  const wins = [];
  const roofs = [];
  let x = -12;
  while (x < 1612) {
    const w = o.minW + rand() * (o.maxW - o.minW);
    const h = o.minH + rand() * (o.maxH - o.minH);
    const top = 320 - h;
    buildings.push({ x, top, w, h });
    const cols = Math.floor((w - 10) / 13);
    const rows = Math.floor((h - 18) / 17);
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if (rand() > o.lit) continue;
        const warm = rand() < 0.72;
        wins.push({
          x: x + 7 + c * 13,
          y: top + 10 + r * 17,
          color: warm ? (rand() < 0.5 ? "#ffd98a" : "#ffe9b8") : "#a9d2ff",
          blink: rand() < 0.05,
          dur: 2.5 + rand() * 5,
          delay: rand() * 6,
        });
      }
    }
    if (h > o.minH + (o.maxH - o.minH) * 0.7) roofs.push({ x: x + w / 2, y: top - 5, delay: rand() * 2 });
    x += w + rand() * 6;
  }
  return { buildings, wins, roofs };
}

const FAR = makeCity(7, { minW: 40, maxW: 90, minH: 70, maxH: 210, lit: 0.28 });
const NEAR = makeCity(21, { minW: 54, maxW: 120, minH: 80, maxH: 260, lit: 0.5 });
const STARS = (() => {
  const r = rng(5);
  return Array.from({ length: 90 }, () => ({
    left: r() * 100,
    top: r() * 58,
    size: 1 + r() * 2,
    dur: 2 + r() * 4,
    delay: r() * 5,
  }));
})();

function Skyline({ city, fill, cls, dim }) {
  return (
    <svg className={`skyline ${cls}`} viewBox="0 0 1600 320" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      {city.buildings.map((b, i) => (
        <rect key={i} x={b.x} y={b.top} width={b.w} height={b.h} fill={fill} />
      ))}
      <g opacity={dim}>
        {city.wins.map((w, i) => (
          <rect
            key={i}
            x={w.x}
            y={w.y}
            width="6"
            height="8"
            rx="1"
            fill={w.color}
            className={w.blink ? "win blink" : "win"}
            style={w.blink ? { animationDuration: `${w.dur}s`, animationDelay: `${w.delay}s` } : undefined}
          />
        ))}
      </g>
      {city.roofs.map((r, i) => (
        <circle key={i} cx={r.x} cy={r.y} r="2.4" className="roof-light" style={{ animationDelay: `${r.delay}s` }} />
      ))}
    </svg>
  );
}

function Car() {
  return (
    <div className="car">
      <svg viewBox="0 0 160 70" aria-hidden="true">
        <defs>
          <linearGradient id="carBeam" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff3b8" stopOpacity="0.6" />
            <stop offset="1" stopColor="#fff3b8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points="150,42 340,14 340,72" fill="url(#carBeam)" />
        <g className="car-body">
          <path
            d="M8 54 L8 42 Q8 35 17 33 L40 29 Q48 14 66 12 L100 12 Q118 12 128 29 L146 33 Q156 35 156 45 L156 54 Z"
            fill="#e5557f"
          />
          <path d="M52 29 Q58 18 68 18 L84 18 L84 29 Z" fill="#cfe6ff" opacity="0.9" />
          <path d="M90 18 L100 18 Q110 18 118 29 L90 29 Z" fill="#cfe6ff" opacity="0.9" />
          <circle cx="152" cy="43" r="9" fill="#fff6c8" opacity="0.35" />
          <circle cx="152" cy="43" r="4" fill="#fff6c8" />
          <circle cx="9" cy="42" r="7" fill="#ff3b4f" opacity="0.3" />
          <rect x="6" y="40" width="6" height="5" rx="1.5" fill="#ff3b4f" />
        </g>
        {[36, 122].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy="55" r="11" fill="#0a0c16" />
            <g className="wheel">
              <circle cx={cx} cy="55" r="6.5" fill="#9aa6c8" />
              <path d={`M${cx} 49 V61 M${cx - 6} 55 H${cx + 6}`} stroke="#0a0c16" strokeWidth="2" />
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}

const NightLayers = memo(function NightLayers() {
  return (
    <>
      {STARS.map((s, i) => (
        <span
          key={i}
          className="star"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
      <div className="moon" />
      <Skyline city={FAR} fill="#0d1533" cls="far" dim={0.55} />
      <Skyline city={NEAR} fill="#05070f" cls="near" dim={1} />
      {[8, 28, 48, 68, 88].map((l) => (
        <span className="lamp" key={l} style={{ left: `${l}%` }} />
      ))}
      <div className="road" />
      <Car />
    </>
  );
});

export function NightScene() {
  const { night } = useContext(SkyLevelContext);
  const off = night < 0.01;
  const parked = useParked(off);
  return (
    <div className={`night-scene ${off ? "off" : ""} ${parked ? "parked" : ""}`} style={{ opacity: night }} aria-hidden="true">
      <NightLayers />
    </div>
  );
}

const FW_COLORS = ["#ff9aa8", "#ffd36b", "#9cc4ff", "#ffffff", "#6fa8f7", "#ffb0d0", "#ffe9a8", "#b9a2ff"];

export function Fireworks() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const GRAVITY = 520;
    const rockets = [];
    const sparks = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = performance.now();
    let wait = 0;
    const pick = () => FW_COLORS[Math.floor(Math.random() * FW_COLORS.length)];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const launch = () => {
      const targetY = h * (0.12 + Math.random() * 0.38);
      rockets.push({
        x: w * (0.08 + Math.random() * 0.84),
        y: h + 6,
        vx: (Math.random() - 0.5) * 50,
        vy: -Math.sqrt(2 * GRAVITY * (h - targetY)),
        color: pick(),
      });
    };

    const explode = (r) => {
      const n = 70 + Math.floor(Math.random() * 50);
      const base = 120 + Math.random() * 160;
      const c1 = pick();
      const c2 = Math.random() < 0.5 ? pick() : c1;
      const ring = Math.random() < 0.35;
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n + Math.random() * 0.1;
        const sp = ring ? base : base * (0.25 + Math.random() * 0.75);
        sparks.push({
          x: r.x,
          y: r.y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 0,
          max: 1.1 + Math.random() * 0.9,
          color: i % 3 === 0 ? c2 : c1,
          size: 1.6 + Math.random() * 1.4,
        });
      }
    };

    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // wipe the canvas and redraw: every spark is drawn as a short streak along its
      // velocity, which looks like a trail without ever leaving ghosts behind
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";

      wait -= dt;
      if (wait <= 0 && sparks.length < 1100) {
        launch();
        wait = 0.35 + Math.random() * 0.7;
      }

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.vy += GRAVITY * dt;
        r.x += r.vx * dt;
        r.y += r.vy * dt;
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = "#fff3c4";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(r.x - r.vx * 0.06, r.y - r.vy * 0.06);
        ctx.lineTo(r.x, r.y);
        ctx.stroke();
        if (r.vy >= -25) {
          explode(r);
          rockets.splice(i, 1);
        }
      }

      const drag = Math.pow(0.28, dt);
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life += dt;
        if (s.life >= s.max) {
          sparks.splice(i, 1);
          continue;
        }
        s.vx *= drag;
        s.vy = s.vy * drag + 150 * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        const k = 1 - s.life / s.max;
        ctx.globalAlpha = Math.pow(k, 1.5);
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.size * 1.3;
        ctx.beginPath();
        ctx.moveTo(s.x - s.vx * 0.07, s.y - s.vy * 0.07);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener("resize", resize);
    launch();
    launch();
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="fireworks" aria-hidden="true" />;
}