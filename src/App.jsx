import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useInView,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import "./App.css";
import mainPic from "./assets/MainPic.jpg";

/* ------------------------------------------------------------------
   EDIT YOUR CONTENT HERE
   - Photos: put images in /public and set src, e.g. "/photo1.jpg"
   - Music: put the mp3 files in src/music (see the "music engine" below)
------------------------------------------------------------------- */
const CONFIG = {
  name: "Ashley Nicole",
  nickname: "Leyley",
  from: "Hulyo",
  // Site opens at this moment (12:00 AM, Dec 1 2026, Philippine time)
  unlockAt: "2026-12-01T00:00:00+08:00",
  // Type this on the countdown screen to reveal the bypass button (set to "" to disable)
  bypassCode: "leyley",
  letter: [
    "Happy Happy Birthday My love!!! You’ve gone through so much with me, and without me, your whole life is such a beautiful thing to explore alam mo ba ‘yon?",
    "Knowing you for just how long made me realize already about what kind of person you are, and now that I’m courting you, I wanna know more and I want to build a genuine connection with you that exceeds the bounderies of our friendship.",
    "I just wanted to say that you’ve done a lot for me, more than you even remember. Every small supports, small details you do like remembering my favorites, my comfort foods, how I think, and especially how you handle me as a person and your special someone. Everything You do means so much more because you don’t even realize how big it is for me as someone who’d gone through a lot just to get to where i am at. And that’s the very thing I loved about you. Every loveable thing you do comes out of you very naturally like it’s your nature to do those things.",
    "And that’s why I’m so excited celebrating your day as you reach another mileston of your life, but most importantly, reaching another year of you existing. If I could blow candles to wish you every good things in life, it’ll be so much that it won’t fit the cake, but in one candle, I wish you the best in life, every little thing you’ve ever hoped for, hoped to achieve, hoped to get. I know you have the ability to have all those but i wanted you to know that, i may or may not be your wish, but not only me, all your loved ones are wishing you those as well.",
    "I hope kahit may work tayo prolly the day you’re reading this, is maenjoy mo parin yung birthday mo. Konting tiis nalang ley gragrad na tayo. Apaka swerte ko kasi nakilala, nakasama, at minamahal kita.",
    "Once again, Happy Birthdayyy My Woman!! We, I will always be here for you, supporting you, and will love you, just as much how you love us. Love yah my love",
  ],
  checklist: [
    { label: "This Web", done: true },
    { label: "Bouquet", done: false },
    { label: "Gifts", done: false },
    { label: "Hug from me :)", done: false },
  ],
  ask: {
    link: "Can I ask you something?",
    question: "Are you happy today?",
    glad: "I'm glad to hear it",
    no: "That's okay. You don't have to be. I'm here, and I hope this made your day a little brighter.",
    wish: "My birthday wish for you is to always be happy, whatever it is, whomever you are with, whatever you're doing, I hope you'll be happy. That's all I'll ever ask for you.",
    hugAsk: "You didn't receive a hug?",
    hugYes: "I did, thanks",
    hugNo: "No, we didn't see each other",
    hugMsg: "I'll hug you when I see you. Just know I miss you a lot.",
    final: "Happy Birthday, My love. I'll always be here, loving you. :)",
  },
  memories: [
    { caption: "Our first picture", src: "" },
    { caption: "Favorite date", src: "" },
    { caption: "Silly moment", src: "" },
    { caption: "Somewhere we went", src: "" },
    { caption: "Your best smile", src: "" },
    { caption: "Us, lately", src: "" },
    { caption: "Memory 7", src: "" },
    { caption: "Memory 8", src: "" },
    { caption: "Memory 9", src: "" },
    { caption: "Memory 10", src: "" },
    { caption: "Memory 11", src: "" },
    { caption: "Memory 12", src: "" },
    { caption: "Memory 13", src: "" },
    { caption: "Memory 14", src: "" },
    { caption: "Memory 15", src: "" },
    { caption: "Memory 16", src: "" },
    { caption: "Memory 17", src: "" },
    { caption: "Memory 18", src: "" },
    { caption: "Memory 19", src: "" },
    { caption: "Memory 20", src: "" },
  ],
  memoriesEnd: "To more memories with you, Love",
  // 5 letters, each opens from its own envelope
  letters: [
    {
      label: "Mariah",
      title: "My dearest Leyley,",
      body: [
        "Write your first letter here. Tell her what you were feeling when you wrote this.",
        "Add as many paragraphs as you want.",
      ],
    },
    {
      label: "Alliah",
      title: "Hi, my love,",
      body: ["Write your second letter here.", "Another paragraph, if you'd like."],
    },
    {
      label: "khat",
      title: "Hey you,",
      body: ["Write your third letter here.", "Another paragraph, if you'd like."],
    },
    {
      label: "kazy",
      title: "My happy girl,",
      body: ["Write your fourth letter here.", "Another paragraph, if you'd like."],
    },
    {
      label: "lexa",
      title: "To my forever,",
      body: ["Write your fifth letter here.", "Another paragraph, if you'd like."],
    },
  ],
};

const EASE = [0.22, 1, 0.36, 1];
const SPRING = { type: "spring", stiffness: 380, damping: 22 };

const STICKERS = {
  lotso: { src: "/lotso.png", fallback: "🐻" },
  patrick: { src: "/patrick.png", fallback: "⭐" },
};

const PLACEMENTS = [
  { type: "lotso", top: 4, left: 6, rot: -10 },
  { type: "patrick", top: 9, left: 82, rot: 12 },
  { type: "patrick", top: 30, left: 4, rot: 8 },
  { type: "lotso", top: 38, left: 86, rot: -8 },
  { type: "lotso", top: 55, left: 3, rot: 10 },
  { type: "patrick", top: 62, left: 84, rot: -12 },
  { type: "patrick", top: 80, left: 7, rot: -6 },
  { type: "lotso", top: 88, left: 80, rot: 9 },
];

const TULIPS = Array.from({ length: 18 }, (_, i) => ({
  left: 2 + i * 5.4,
  scale: 0.7 + ((i * 37) % 5) / 10,
  delay: ((i * 53) % 10) / 8,
  sway: 3 + ((i * 29) % 7) / 2,
  tone: i % 2 ? "a" : "b",
}));

const CONFETTI_COLORS = ["#2f6fe4", "#9cc4ff", "#ffd36b", "#ff9aa8", "#0f2a5c", "#6fa8f7"];

const heroParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.2, delayChildren: 0.8 } },
};
const heroChild = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1, ease: EASE } },
};

/* ---------------------------- small pieces ---------------------------- */

// Fades and slides in gradually, tied to how far she has scrolled
function Reveal({ as = "div", y = 80, start = 1, end = 0.5, className, children }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: [`0 ${start}`, `0 ${end}`] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 28, mass: 0.5 });
  const opacity = useTransform(p, [0, 1], [0, 1]);
  const translateY = useTransform(p, [0, 1], [y, 0]);
  const Tag = motion[as];

  return (
    <Tag ref={ref} className={className} style={{ opacity, y: translateY }}>
      {children}
    </Tag>
  );
}

/* ---------------------------- drifting clouds ---------------------------- */

const CLOUDS = [
  { top: 6, w: 260, dur: 52, phase: 0.1, op: 0.28, blur: 0 },
  { top: 18, w: 180, dur: 70, phase: 0.55, op: 0.18, blur: 1.5 },
  { top: 30, w: 340, dur: 46, phase: 0.8, op: 0.22, blur: 0 },
  { top: 44, w: 200, dur: 84, phase: 0.3, op: 0.14, blur: 2 },
  { top: 12, w: 140, dur: 38, phase: 0.95, op: 0.24, blur: 1 },
  { top: 52, w: 300, dur: 64, phase: 0.65, op: 0.16, blur: 1.5 },
  { top: 24, w: 220, dur: 44, phase: 0.4, op: 0.2, blur: 0.5 },
];

function Clouds() {
  return (
    <div className="clouds" aria-hidden="true">
      {CLOUDS.map((c, i) => (
        <div
          key={i}
          className="cloud"
          style={{
            top: `${c.top}%`,
            width: c.w,
            opacity: c.op,
            filter: c.blur ? `blur(${c.blur}px)` : undefined,
            "--dur": `${c.dur}s`,
            "--delay": `${-c.dur * c.phase}s`,
            "--rest": `${c.phase * 90}vw`,
          }}
        >
          <svg viewBox="0 0 220 90" className="cloud-svg" style={{ "--bob": `${5 + (i % 3) * 2}s` }}>
            <g>
              <ellipse cx="110" cy="68" rx="102" ry="20" />
              <circle cx="60" cy="54" r="26" />
              <circle cx="104" cy="38" r="34" />
              <circle cx="150" cy="52" r="27" />
            </g>
          </svg>
        </div>
      ))}
    </div>
  );
}

function Tulips({ mode }) {
  return (
    <div className={`tulips ${mode}`} aria-hidden="true">
      {TULIPS.map((t, i) => (
        <motion.div
          className="tulip"
          key={i}
          style={{ left: `${t.left}%`, originX: 0.5, originY: 1, "--sway": `${t.sway}s`, "--wind": `${-(t.left / 100) * 4}s`, "--lag": `${(t.left / 100) * 1.4}s` }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: t.scale, opacity: 1 }}
          transition={{ type: "spring", stiffness: 80, damping: 11, delay: t.delay }}
        >
          <svg viewBox="0 0 40 100" className="tulip-svg">
            <g className="gust">
              <path className="stem" d="M20 100 C19 80 21 62 20 40" />
              <path className="leaf" d="M20 92 C8 86 6 70 9 60 C16 66 20 78 20 92 Z" />
              <path className="leaf" d="M20 88 C32 82 34 68 31 58 C24 64 20 74 20 88 Z" />
              <path className={`petal ${t.tone}`} d="M20 40 C7 38 5 20 9 8 L15 17 L20 4 L25 17 L31 8 C35 20 33 38 20 40 Z" />
              <path className="petal-front" d="M20 40 C14 36 14 22 20 4 C26 22 26 36 20 40 Z" />
            </g>
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

function Sticker({ type, top, left, rot, i }) {
  const [failed, setFailed] = useState(false);
  const { src, fallback } = STICKERS[type];
  const common = {
    className: "sticker",
    style: { top: `${top}%`, left: `${left}%`, rotate: rot },
    animate: { y: [0, -8, 0] },
    transition: { duration: 4 + (i % 4), repeat: Infinity, ease: "easeInOut", delay: (i % 3) * 0.5 },
  };
  return failed ? (
    <motion.span {...common}>{fallback}</motion.span>
  ) : (
    <motion.img {...common} src={src} alt="" onError={() => setFailed(true)} />
  );
}

function Btn({ children, ghost, ...props }) {
  return (
    <motion.button
      className={`btn ${ghost ? "ghost" : ""}`}
      whileHover={{ y: -2, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={SPRING}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// Random values are created in a click handler (not during render)
function makePieces() {
  return Array.from({ length: 44 }, () => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.3;
    const dist = 90 + Math.random() * 160;
    return {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      fall: 120 + Math.random() * 120,
      rot: (Math.random() - 0.5) * 720,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      w: 6 + Math.random() * 5,
      delay: Math.random() * 0.12,
    };
  });
}

function Confetti({ pieces }) {
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="confetti-piece"
          style={{ background: p.color, width: p.w, height: p.w * 1.6 }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{
            x: [0, p.x, p.x * 1.15],
            y: [0, p.y, p.y + p.fall],
            opacity: [1, 1, 0],
            rotate: [0, p.rot * 0.5, p.rot],
          }}
          transition={{ duration: 1.8, ease: "easeOut", times: [0, 0.45, 1], delay: p.delay }}
        />
      ))}
    </div>
  );
}

function Cake() {
  const [lit, setLit] = useState(true);
  const [burst, setBurst] = useState(0);
  const [pieces, setPieces] = useState([]);
  const candles = [96, 120, 144];

  const toggle = () => {
    if (lit) {
      setPieces(makePieces());
      setBurst((b) => b + 1);
    }
    setLit((v) => !v);
  };

  return (
    <Reveal as="section" className="cake-section">
      <h3>Make a wish</h3>

      <AnimatePresence mode="wait">
        <motion.p
          key={lit}
          className="cake-note"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          {lit
            ? "Close your eyes, make a wish, then blow out the candles."
            : `Hope your wish comes true, ${CONFIG.nickname}.`}
        </motion.p>
      </AnimatePresence>

      <div className="cake-wrap">
        <svg viewBox="0 0 240 220" className="cake" role="img" aria-label="Birthday cake">
          <ellipse cx="120" cy="207" rx="108" ry="9" fill="#d3e3ff" />
          <rect x="30" y="140" width="180" height="64" rx="12" fill="#8db8ff" />
          <rect x="55" y="98" width="130" height="46" rx="10" fill="#b9d4ff" />
          <rect x="80" y="66" width="80" height="36" rx="9" fill="#e3eeff" />
          <path d="M30 152 q15 18 30 0 q15 18 30 0 q15 18 30 0 q15 18 30 0 q15 18 30 0 q15 18 30 0 V140 H30 Z" fill="#fff" />
          <path d="M55 108 q13 16 26 0 q13 16 26 0 q13 16 26 0 q13 16 26 0 q13 16 26 0 V98 H55 Z" fill="#fff" />
          <path d="M80 76 q10 14 20 0 q10 14 20 0 q10 14 20 0 q10 14 20 0 V66 H80 Z" fill="#fff" />
          {candles.map((cx) => (
            <g key={cx}>
              <rect x={cx - 3.5} y="44" width="7" height="24" rx="2" fill="#4f86ee" />
              <g className={`flame ${lit ? "" : "out"}`}>
                <circle cx={cx} cy="32" r="13" className="glow" />
                <path
                  className="flame-shape"
                  d={`M${cx} 20 C${cx + 6} 28 ${cx + 6} 38 ${cx} 42 C${cx - 6} 38 ${cx - 6} 28 ${cx} 20 Z`}
                />
              </g>
            </g>
          ))}
        </svg>
        {burst > 0 && <Confetti key={burst} pieces={pieces} />}
      </div>

      <Btn onClick={toggle}>{lit ? "Blow out the candles" : "Light them again"}</Btn>
    </Reveal>
  );
}

/* ---------------------------- music engine ----------------------------
   Little Things plays as soon as the browser allows it (browsers block sound
   until the first click / key press), then crossfades into I Like Me Better
   when the birthday page opens. Files are found by name in src/music.
------------------------------------------------------------------------- */

const musicFiles = import.meta.glob("./music/*.{mp3,m4a,wav,ogg}", {
  eager: true,
  query: "?url",
  import: "default",
});
const findTrack = (re) => Object.entries(musicFiles).find(([path]) => re.test(path))?.[1] || "";
const TRACKS = {
  intro: findTrack(/little things/i),
  main: findTrack(/like me better/i),
};
if (import.meta.env.DEV && !(TRACKS.intro && TRACKS.main)) {
  console.warn(
    "[music] Could not find both songs in src/music. Found:",
    Object.keys(musicFiles),
    "- move the 'music' folder into birthday/src/"
  );
}
const VOLUME = 0.6;
const FADE_MS = 1600;

const music = (() => {
  const audios = {};
  const listeners = new Set();
  const state = { track: "intro", enabled: true, playing: false };
  let snapshot = { ...state };
  let started = false;
  let unlockOff = null;
  let switchId = 0;

  const emit = () => {
    snapshot = { ...state };
    listeners.forEach((l) => l());
  };
  const audioFor = (name) => {
    if (!TRACKS[name]) return null;
    if (!audios[name]) {
      const a = new Audio(TRACKS[name]);
      a.loop = true;
      a.preload = "auto";
      a.volume = 0;
      audios[name] = a;
    }
    return audios[name];
  };
  const fade = (a, to, ms, done) => {
    clearInterval(a._fade);
    const from = a.volume;
    const steps = Math.max(1, Math.round(ms / 50));
    let i = 0;
    a._fade = setInterval(() => {
      i += 1;
      a.volume = Math.min(1, Math.max(0, from + ((to - from) * i) / steps));
      if (i >= steps) {
        clearInterval(a._fade);
        done?.();
      }
    }, 50);
  };
  // start the current track (fading in); resolves false if the browser blocks it
  const playCurrent = () => {
    const name = state.track;
    const a = audioFor(name);
    if (!a || !state.enabled) return Promise.resolve(false);
    // another song is still fading out: wait, switchTo starts this one once it has stopped
    if (Object.entries(audios).some(([n, x]) => n !== name && !x.paused)) return Promise.resolve(true);
    if (!a.paused) {
      fade(a, VOLUME, FADE_MS);
      return Promise.resolve(true);
    }
    a.volume = 0;
    return a
      .play()
      .then(() => {
        if (state.track !== name || !state.enabled) {
          // the track changed (or music was paused) while the browser was starting this one
          a.pause();
          return false;
        }
        fade(a, VOLUME, FADE_MS);
        state.playing = true;
        emit();
        return true;
      })
      .catch(() => false);
  };
  const armUnlock = () => {
    if (unlockOff) return;
    const events = ["pointerdown", "keydown", "touchstart"];
    const onFirst = (e) => {
      if (e.target?.closest?.(".music")) return; // the music button handles itself
      playCurrent().then((ok) => ok && unlockOff?.());
    };
    events.forEach((ev) => window.addEventListener(ev, onFirst));
    unlockOff = () => {
      events.forEach((ev) => window.removeEventListener(ev, onFirst));
      unlockOff = null;
    };
  };

  return {
    subscribe: (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    getSnapshot: () => snapshot,
    hasAudio: () => Boolean(TRACKS.intro || TRACKS.main),
    init() {
      if (started) return;
      started = true;
      playCurrent().then((ok) => !ok && armUnlock());
    },
    // make sure the current track is playing; if the browser blocks it, start on the next click/key
    ensure() {
      playCurrent().then((ok) => !ok && armUnlock());
    },
    // one song at a time: fade the old one out, pause it, then start the new one
    switchTo(name) {
      if (state.track === name) return;
      const prev = audioFor(state.track);
      state.track = name;
      const id = ++switchId;
      const startNext = () => {
        if (id !== switchId) return; // a newer switch took over
        const next = audioFor(name);
        if (!next) {
          state.playing = false;
          emit();
          return;
        }
        next.currentTime = 0;
        if (state.enabled) playCurrent().then((ok) => !ok && armUnlock());
      };
      if (prev && !prev.paused) {
        fade(prev, 0, 900, () => {
          prev.pause();
          startNext();
        });
      } else {
        startNext();
      }
      emit();
    },
    toggle() {
      const a = audioFor(state.track);
      if (!a) return;
      if (state.playing) {
        state.enabled = false;
        state.playing = false;
        emit();
        fade(a, 0, 400, () => a.pause());
      } else {
        state.enabled = true;
        playCurrent();
      }
    },
  };
})();

function MusicButton() {
  const { playing } = useSyncExternalStore(music.subscribe, music.getSnapshot);
  if (!music.hasAudio()) return null;
  return (
    <motion.button
      className="music"
      onClick={() => music.toggle()}
      aria-label={playing ? "Pause music" : "Play music"}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      transition={SPRING}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l11-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="17" cy="16" r="3" />
        {!playing && <line x1="3" y1="3" x2="21" y2="21" />}
      </svg>
    </motion.button>
  );
}

function Checklist({ done, setDone }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -35% 0px" });
  const toggle = (i) => setDone((d) => d.map((v, j) => (j === i ? !v : v)));

  return (
    <section className="checklist" ref={ref}>
      <Reveal as="h3">Birthday Checklist:</Reveal>
      <ul>
        {CONFIG.checklist.map((item, i) => {
          const on = done[i] && inView;
          return (
            <Reveal as="li" key={item.label} y={40} start={0.98 - i * 0.03} end={0.85 - i * 0.03}>
              <button className="check-row" role="checkbox" aria-checked={done[i]} onClick={() => toggle(i)}>
                <span className={`check-box ${on ? "on" : ""}`}>
                  <svg viewBox="0 0 24 24">
                    <motion.path
                      d="M5 12.5l4.5 4.5L19 7.5"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={false}
                      animate={{ pathLength: on ? 1 : 0 }}
                      transition={{ duration: 0.45, ease: EASE, delay: i === 0 ? 0.6 : 0 }}
                    />
                  </svg>
                </span>
                <span className="check-label">{item.label}</span>
              </button>
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}

function Smiley() {
  return (
    <motion.svg
      viewBox="0 0 120 120"
      className="smiley"
      aria-hidden="true"
      initial={{ scale: 0, rotate: -25, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      exit={{ scale: 0.6, opacity: 0 }}
      transition={{ type: "spring", stiffness: 150, damping: 11 }}
    >
      <circle cx="60" cy="60" r="52" fill="#ffd36b" stroke="#f2b84b" strokeWidth="3" />
      <motion.circle
        cx="32" cy="70" r="8" fill="#ff9a9a"
        initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} transition={{ delay: 0.6, duration: 0.5 }}
      />
      <motion.circle
        cx="88" cy="70" r="8" fill="#ff9a9a"
        initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} transition={{ delay: 0.6, duration: 0.5 }}
      />
      {[42, 78].map((cx) => (
        <motion.ellipse
          key={cx}
          cx={cx} cy="48" rx="6" ry="9" fill="#0f2a5c"
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: [0, 1, 1, 0.1, 1] }}
          transition={{ duration: 1.8, times: [0, 0.2, 0.7, 0.8, 0.9], delay: 0.2 }}
        />
      ))}
      <motion.path
        d="M34 68 Q60 100 86 68"
        fill="none" stroke="#0f2a5c" strokeWidth="6" strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.7, ease: EASE }}
      />
    </motion.svg>
  );
}

function NextBtn({ onClick }) {
  return (
    <motion.button
      className="next-btn"
      onClick={onClick}
      aria-label="Next"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      transition={SPRING}
    >
      <motion.svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{ x: [0, 4, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M5 12h14" />
        <path d="M13 6l6 6-6 6" />
      </motion.svg>
    </motion.button>
  );
}

function Ticket({ children, stub }) {
  return (
    <motion.div
      className="ticket"
      initial={{ opacity: 0, y: 50, rotate: -4, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
      exit={{ opacity: 0, y: -40, rotate: 3, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 170, damping: 18 }}
    >
      <div className="ticket-main">{children}</div>
      <div className="ticket-stub">{stub}</div>
    </motion.div>
  );
}

const HEARTS = Array.from({ length: 9 }, (_, i) => ({
  x: (i - 4) * 24 + ((i * 37) % 11),
  delay: i * 0.25,
  size: 18 + ((i * 7) % 14),
}));

function HugAnim() {
  return (
    <motion.div
      className="hug"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 160, damping: 14 }}
      aria-hidden="true"
    >
      <motion.span
        className="hug-emoji"
        animate={{ scale: [1, 1.18, 1, 1.18, 1], rotate: [0, -8, 0, 8, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        🤗
      </motion.span>
      {HEARTS.map((h, i) => (
        <motion.span
          key={i}
          className="hug-heart"
          style={{ left: `calc(50% + ${h.x}px)`, fontSize: h.size }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: -170, opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: h.delay, ease: "easeOut" }}
        >
          ♥
        </motion.span>
      ))}
    </motion.div>
  );
}

function AskFlow({ onClose, hugged }) {
  const [step, setStep] = useState(hugged ? "q" : "hug");
  const [pieces, setPieces] = useState([]);
  const A = CONFIG.ask;

  useEffect(() => {
    document.body.classList.add("modal-open");
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  useEffect(() => {
    if (step !== "smile") return;
    const t = setTimeout(() => setStep("glad"), 3200);
    return () => clearTimeout(t);
  }, [step]);

  useEffect(() => {
    if (step !== "hugAnim") return;
    const t = setTimeout(() => setStep("hugMsg"), 3400);
    return () => clearTimeout(t);
  }, [step]);

  const goFinal = () => {
    setPieces(makePieces());
    setStep("final");
  };

  return (
    <motion.div
      className="ask-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <button className="ask-close" onClick={onClose} aria-label="Close">✕</button>

      <AnimatePresence mode="wait">
        {step === "hug" && (
          <Ticket
            key="hug"
            stub={
              <div className="stub-choices">
                <Btn onClick={() => setStep("q")}>{A.hugYes}</Btn>
                <Btn ghost onClick={() => setStep("hugAnim")}>{A.hugNo}</Btn>
              </div>
            }
          >
            <h2>{A.hugAsk}</h2>
          </Ticket>
        )}

        {step === "hugAnim" && <HugAnim key="hugAnim" />}

        {step === "hugMsg" && (
          <Ticket key="hugMsg" stub={<NextBtn onClick={() => setStep("q")} />}>
            <p className="ticket-wish">{A.hugMsg}</p>
          </Ticket>
        )}

        {step === "q" && (
          <Ticket
            key="q"
            stub={
              <>
                <Btn onClick={() => setStep("smile")}>Yes</Btn>
                <Btn ghost onClick={() => setStep("no")}>No</Btn>
              </>
            }
          >
            <h2>{A.question}</h2>
          </Ticket>
        )}

        {step === "smile" && <Smiley key="smile" />}

        {step === "glad" && (
          <Ticket key="glad" stub={<NextBtn onClick={() => setStep("wish")} />}>
            <h2>{A.glad}</h2>
          </Ticket>
        )}

        {step === "no" && (
          <Ticket key="no" stub={<NextBtn onClick={() => setStep("wish")} />}>
            <p className="ticket-wish">{A.no}</p>
          </Ticket>
        )}

        {step === "wish" && (
          <Ticket key="wish" stub={<NextBtn onClick={goFinal} />}>
            <p className="ticket-wish">{A.wish}</p>
          </Ticket>
        )}

        {step === "final" && (
          <Ticket key="final" stub={<Btn ghost onClick={onClose}>Close</Btn>}>
            <h2>{A.final}</h2>
            <Confetti pieces={pieces} />
          </Ticket>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ------------------------------- app ------------------------------- */

/* ---------------------------- memories strip ---------------------------- */

function Memories({ onOpen }) {
  const trackRef = useRef(null);
  const nudge = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 620), behavior: "smooth" });
  };

  return (
    <section className="memories wide">
      <Reveal as="h3">Our memories</Reveal>
      <Reveal as="p" className="strip-hint" y={30} start={1} end={0.8}>
        Swipe or use the arrows &rarr;
      </Reveal>

      <div className="strip-wrap">
        <button className="strip-arrow left" onClick={() => nudge(-1)} aria-label="Previous photos">
          &#8249;
        </button>

        <div className="strip" ref={trackRef} tabIndex={0} aria-label="Memories, scroll sideways">
          {CONFIG.memories.map((m, i) => (
            <motion.div
              key={m.caption}
              className={`frame strip-item ${m.src ? "clickable" : ""}`}
              style={{ rotate: i % 2 ? 1.2 : -1.2 }}
              onClick={() => m.src && onOpen(m)}
              whileHover={{
                rotate: 0,
                y: -6,
                scale: 1.02,
                transition: { type: "spring", stiffness: 300, damping: 20 },
              }}
            >
              {m.src ? <img src={m.src} alt={m.caption} loading="lazy" /> : <div className="ph">Add photo</div>}
              <span>{m.caption}</span>
            </motion.div>
          ))}

          <div className="frame strip-item end-frame" style={{ rotate: CONFIG.memories.length % 2 ? 1.2 : -1.2 }}>
            <div className="end-body">
              <p>{CONFIG.memoriesEnd}</p>
            </div>
            <span>&hearts;</span>
          </div>
        </div>

        <button className="strip-arrow right" onClick={() => nudge(1)} aria-label="Next photos">
          &#8250;
        </button>
      </div>
    </section>
  );
}

/* ---------------------------- envelope letters ---------------------------- */

function Envelope({ open, name }) {
  return (
    <div className="env">
      <div className="env-back" />
      <motion.div
        className="env-note"
        initial={false}
        animate={{ y: open ? "-42%" : "0%" }}
        transition={{ duration: 0.7, ease: EASE, delay: open ? 0.45 : 0 }}
      />
      <div className="env-front" />
      {name && <span className="env-name">{name}</span>}
      <motion.div
        className="env-flap"
        initial={false}
        animate={{ rotateX: open ? 180 : 0, zIndex: open ? 0 : 3 }}
        transition={{
          rotateX: { duration: 0.7, ease: EASE },
          zIndex: { delay: open ? 0.3 : 0, duration: 0 },
        }}
      />
      <motion.span
        className="env-seal"
        initial={false}
        animate={{ opacity: open ? 0 : 1, scale: open ? 0.6 : 1 }}
        transition={{ duration: 0.25 }}
      >
        &hearts;
      </motion.span>
    </div>
  );
}

function LetterModal({ letter, onClose }) {
  const [stage, setStage] = useState("closed"); // closed -> opening -> paper
  const scrollRef = useRef(null);
  const [edges, setEdges] = useState({ top: false, bottom: false });

  const updateEdges = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setEdges({
      top: el.scrollTop > 6,
      bottom: el.scrollTop + el.clientHeight < el.scrollHeight - 6,
    });
  }, []);

  useEffect(() => {
    if (stage !== "paper") return;
    updateEdges();
    window.addEventListener("resize", updateEdges);
    return () => window.removeEventListener("resize", updateEdges);
  }, [stage, updateEdges]);

  useEffect(() => {
    document.body.classList.add("modal-open");
    const t1 = setTimeout(() => setStage("opening"), 450);
    const t2 = setTimeout(() => setStage("paper"), 1700);
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("modal-open");
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      className="ask-overlay"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="letter-stage" onClick={(e) => e.stopPropagation()}>
        <motion.div
          className="env-big"
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={
            stage === "paper"
              ? { opacity: 0, y: 90, scale: 0.9 }
              : { opacity: 1, y: 0, scale: 1 }
          }
          transition={{ duration: 0.6, ease: EASE }}
          style={{ pointerEvents: "none" }}
        >
          <Envelope open={stage !== "closed"} />
        </motion.div>

        {stage === "paper" && (
          <motion.div
            className="paper-wrap"
            initial={{ opacity: 0, y: 160, scale: 0.55 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            <article className="paper" ref={scrollRef} onScroll={updateEdges} tabIndex={0}>
              <h2>{letter.title}</h2>
              {letter.body.map((p, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ root: scrollRef, once: true, amount: 0.1 }}
                  transition={{ duration: 0.6, ease: EASE }}
                >
                  {p}
                </motion.p>
              ))}
              <motion.p
                className="paper-sign"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ root: scrollRef, once: true, amount: 0.1 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                &mdash; {CONFIG.from}
              </motion.p>
            </article>
            <div className={`paper-fade top ${edges.top ? "on" : ""}`} aria-hidden="true" />
            <div className={`paper-fade bottom ${edges.bottom ? "on" : ""}`} aria-hidden="true" />
          </motion.div>
        )}
      </div>

      <button className="ask-close" onClick={onClose} aria-label="Close letter">
        &#10005;
      </button>
    </motion.div>
  );
}

const RESTS = [-3, 4, -5, 2, -4];

function Letters() {
  // order[last] is the letter on top of the pile
  const [order, setOrder] = useState(() => CONFIG.letters.map((_, i) => i).reverse());
  const [active, setActive] = useState(null);
  const activeRef = useRef(null);

  const open = (i) => {
    activeRef.current = i;
    setActive(i);
  };
  const close = useCallback(() => {
    const cur = activeRef.current;
    if (cur !== null) setOrder((o) => [cur, ...o.filter((x) => x !== cur)]); // opened letter goes to the back
    activeRef.current = null;
    setActive(null);
  }, []);
  const bringToTop = (i) => setOrder((o) => [...o.filter((x) => x !== i), i]);

  const topIndex = order[order.length - 1];

  return (
    <section className="letters">
      <Reveal as="h3">Letters for you</Reveal>
      <Reveal as="p" className="letters-sub" y={30} start={1} end={0.8}>
        A little stack, just for you. Tap the top one to open it.
      </Reveal>

      <Reveal y={70} start={1} end={0.72}>
        <div className="pile">
          {CONFIG.letters.map((l, i) => {
            const d = order.length - 1 - order.indexOf(i); // 0 = top
            const isTop = d === 0;
            return (
              <motion.button
                key={l.label}
                className="pile-item"
                style={{ zIndex: 10 - d }}
                disabled={!isTop}
                tabIndex={isTop ? 0 : -1}
                initial={false}
                animate={{
                  y: -d * 14,
                  x: (d % 2 ? 1 : -1) * d * 6,
                  rotate: isTop ? RESTS[i % RESTS.length] * 0.4 : RESTS[i % RESTS.length],
                  scale: 1 - d * 0.035,
                }}
                whileHover={isTop ? { y: -d * 14 - 10, rotate: 0 } : undefined}
                whileTap={isTop ? { scale: 0.97 } : undefined}
                transition={SPRING}
                onClick={() => isTop && open(i)}
                aria-label={isTop ? `Open letter from ${l.label}` : undefined}
              >
                <Envelope open={false} name={l.label} />
              </motion.button>
            );
          })}
        </div>
      </Reveal>

      <div className="pile-nav" role="group" aria-label="Choose which letter is on top">
        {CONFIG.letters.map((l, i) => (
          <button
            key={l.label}
            className={`pile-chip ${topIndex === i ? "on" : ""}`}
            onClick={() => bringToTop(i)}
            aria-pressed={topIndex === i}
          >
            {l.label}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {active !== null && <LetterModal key="letter" letter={CONFIG.letters[active]} onClose={close} />}
      </AnimatePresence>
    </section>
  );
}

/* ---------------------------- tied scroll letter ---------------------------- */

function TiedScroll({ stage, bodyH = 0, children }) {
  const unrolled = stage === "unroll" || stage === "read";
  return (
    <div className="tscroll">
      <div className="roller" />
      {children && (
        <motion.div
          className="tpaper"
          initial={false}
          animate={{ height: unrolled ? bodyH : 0 }}
          transition={{ duration: 1.3, ease: EASE }}
        >
          {children}
        </motion.div>
      )}
      <div className="roller" />

      <motion.div
        className="tie"
        initial={false}
        animate={
          stage === "tied"
            ? { x: 0, y: 0, rotate: 0, opacity: 1 }
            : { x: [0, -10, 10, 0, 170], y: [0, 0, 0, 0, 70], rotate: [0, -3, 3, 0, 16], opacity: [1, 1, 1, 1, 0] }
        }
        transition={{ duration: 1.1, times: [0, 0.2, 0.4, 0.55, 1], ease: "easeInOut" }}
        style={{ pointerEvents: "none" }}
      >
        <div className="tie-band" />
        <svg className="bow" viewBox="0 0 100 70" aria-hidden="true">
          <path className="bow-tail" d="M47 38 C42 50 36 60 29 68 L43 66 L51 44 Z" />
          <path className="bow-tail" d="M53 38 C58 50 64 60 71 68 L57 66 L49 44 Z" />
          <path className="bow-loop" d="M50 35 C30 5 6 10 10 32 C13 52 36 46 50 35 Z" />
          <path className="bow-loop" d="M50 35 C70 5 94 10 90 32 C87 52 64 46 50 35 Z" />
          <circle className="bow-knot" cx="50" cy="36" r="7.5" />
        </svg>
      </motion.div>
    </div>
  );
}

function TiedLetterModal({ onClose }) {
  const [stage, setStage] = useState("tied"); // tied -> untie -> unroll -> read
  const scrollRef = useRef(null);
  const [edges, setEdges] = useState({ top: false, bottom: false });
  const bodyH = useMemo(() => Math.round(Math.min(window.innerHeight * 0.66, 620)), []);

  const updateEdges = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setEdges({
      top: el.scrollTop > 6,
      bottom: el.scrollTop + el.clientHeight < el.scrollHeight - 6,
    });
  }, []);

  useEffect(() => {
    document.body.classList.add("modal-open");
    const t1 = setTimeout(() => setStage("untie"), 700);
    const t2 = setTimeout(() => setStage("unroll"), 1900);
    const t3 = setTimeout(() => {
      setStage("read");
      updateEdges();
    }, 3300);
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("modal-open");
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, updateEdges]);

  const reveal = {
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { root: scrollRef, once: true, amount: 0.1 },
    transition: { duration: 0.6, ease: EASE },
  };

  return (
    <motion.div
      className="ask-overlay blur-overlay"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="tscroll-modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 50, scale: 0.85 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <TiedScroll stage={stage} bodyH={bodyH}>
          <article className="paper" ref={scrollRef} onScroll={updateEdges} tabIndex={0}>
            <h2>Hey Love!</h2>
            {CONFIG.letter.map((p, i) => (
              <motion.p key={i} {...reveal}>
                {p}
              </motion.p>
            ))}
            <motion.p className="paper-sign" {...reveal}>
              &mdash; {CONFIG.from}
            </motion.p>
          </article>
          <div className={`paper-fade top ${edges.top ? "on" : ""}`} aria-hidden="true" />
          <div className={`paper-fade bottom ${edges.bottom ? "on" : ""}`} aria-hidden="true" />
        </TiedScroll>
      </motion.div>

      <button className="ask-close" onClick={onClose} aria-label="Close letter">
        &#10005;
      </button>
    </motion.div>
  );
}

function TiedLetter() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  return (
    <>
      <motion.button
        className="tied-btn"
        whileHover={{ y: -6, rotate: -1 }}
        whileTap={{ scale: 0.97 }}
        transition={SPRING}
        onClick={() => setOpen(true)}
        aria-label="Untie the ribbon and read my letter"
      >
        <TiedScroll stage="tied" />
      </motion.button>
      <AnimatePresence>{open && <TiedLetterModal key="tied" onClose={close} />}</AnimatePresence>
    </>
  );
}

/* ---------------------------- countdown gate ---------------------------- */

const UNLOCK_AT = new Date(CONFIG.unlockAt).getTime();

function timeParts(ms) {
  const t = Math.max(0, Math.floor(ms / 1000));
  return {
    Days: Math.floor(t / 86400),
    Hours: Math.floor((t % 86400) / 3600),
    Minutes: Math.floor((t % 3600) / 60),
    Seconds: t % 60,
  };
}

function Gate({ left, onBypass }) {
  const [revealed, setRevealed] = useState(false);
  const typed = useRef("");
  const parts = timeParts(left);
  const ready = left <= 0;

  // Typing the secret code anywhere on the page makes the bypass button appear
  useEffect(() => {
    const secret = (CONFIG.bypassCode || "").toLowerCase();
    if (!secret) return;
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
      typed.current = (typed.current + e.key.toLowerCase()).slice(-secret.length);
      if (typed.current === secret) setRevealed(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <MotionConfig reducedMotion="never">
      <div className="intro gate">
        <Clouds />
        <Tulips mode="on-dark" />
        <motion.div
          className="intro-card gate-card"
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <div className="step">
            <h1 className="big">{ready ? `It’s time, ${CONFIG.nickname}!` : `Not just yet, ${CONFIG.nickname}…`}</h1>
            <p className="gate-sub">{ready ? "Your surprise is ready." : "Something special opens on December 1."}</p>

            <div className="count" role="timer" aria-live="off">
              {Object.entries(parts).map(([label, value]) => (
                <div className="count-unit" key={label}>
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.strong
                      key={value}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.25, ease: EASE }}
                    >
                      {String(value).padStart(2, "0")}
                    </motion.strong>
                  </AnimatePresence>
                  <span>{label}</span>
                </div>
              ))}
            </div>

            <div className="code-area">
              <AnimatePresence>
                {(revealed || ready) && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  >
                    <Btn onClick={onBypass}>{ready ? "Open it" : "Hey Hulyo"}</Btn>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </MotionConfig>
  );
}

function Birthday() {
  // 0-3 = intro cards, 4 = site expanding from the button, 5 = site
  const [step, setStep] = useState(0);
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [origin, setOrigin] = useState({ x: 0, y: 0, r: 0 });
  const [lightbox, setLightbox] = useState(null);
  const [askOpen, setAskOpen] = useState(false);
  const [checked, setChecked] = useState(() => CONFIG.checklist.map((c) => c.done));
  const hugIndex = CONFIG.checklist.findIndex((c) => /hug/i.test(c.label));
  const hugged = hugIndex < 0 || checked[hugIndex];
  const closeAsk = useCallback(() => setAskOpen(false), []);

  // "Are you Ashley Nicole?" opens -> Little Things plays
  useEffect(() => {
    music.ensure();
  }, []);

  const { scrollY, scrollYProgress } = useScroll();
  const bgY = useTransform(scrollY, [0, 900], [0, 140]);
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  const dodge = () =>
    setNoPos({ x: Math.random() * 160 - 80, y: Math.random() * 80 - 40 });

  const openSite = (e) => {
    const b = e.currentTarget.getBoundingClientRect();
    const x = b.left + b.width / 2;
    const y = b.top + b.height / 2;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const r = Math.max(Math.hypot(x, y), Math.hypot(w - x, y), Math.hypot(x, h - y), Math.hypot(w - x, h - y));
    setOrigin({ x, y, r });
    setStep(4);
    music.switchTo("main");
  };

  useEffect(() => {
    document.body.classList.toggle("locked", step < 5);
    if (step === 4) window.scrollTo(0, 0);
  }, [step]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => e.key === "Escape" && setLightbox(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  const circle = (r) => `circle(${r}px at ${origin.x}px ${origin.y}px)`;
  const clip =
    step < 4 ? circle(0) : step === 4 ? [circle(0), circle(origin.r)] : "inset(0px 0px 0px 0px)";

  const renderStep = () => {
    if (step === 0)
      return (
        <>
          <h1>Are you {CONFIG.name}?</h1>
          <div className="actions">
            <Btn onClick={() => setStep(1)}>Yes</Btn>
            <motion.button
              className="btn ghost"
              animate={{ x: noPos.x, y: noPos.y }}
              transition={{ type: "spring", stiffness: 220, damping: 16 }}
              onHoverStart={dodge}
              onClick={dodge}
            >
              No
            </motion.button>
          </div>
        </>
      );
    if (step === 1)
      return (
        <>
          <h1>{CONFIG.nickname}??</h1>
          <div className="actions">
            <Btn onClick={() => setStep(2)}>Yes, it's me</Btn>
          </div>
        </>
      );
    if (step === 2)
      return (
        <>
          <h1 className="big">
            WOAH {CONFIG.from.toUpperCase()} GAVE THIS ALR?<br />HAPPY HAPPY BIRTHDAYYYYY!!!
          </h1>
          <div className="actions">
            <Btn onClick={() => setStep(3)}>Thank you</Btn>
          </div>
        </>
      );
    return (
      <>
        <h1 className="big">
          Because it's your birthday already, {CONFIG.from} made this ahead of
          time. Do you want to look at it already?
        </h1>
        <div className="actions">
          <Btn onClick={openSite}>Yes, show me</Btn>
        </div>
      </>
    );
  };

  return (
    <MotionConfig reducedMotion="never">
      <div className={`app ${step === 4 ? "opening" : ""}`}>
        {/* INTRO */}
        <div className={`intro ${step === 5 ? "hide" : ""}`}>
          <Clouds />
          <Tulips mode="on-dark" />
          <motion.div
            className="intro-card"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={step === 4 ? { opacity: 0, scale: 0.9, y: 0 } : { opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                className="step"
                key={Math.min(step, 3)}
                initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* SITE */}
        <motion.div
          className="site"
          initial={false}
          animate={{ clipPath: clip }}
          transition={step === 5 ? { duration: 0 } : { duration: 1.5, ease: [0.65, 0, 0.25, 1] }}
          onAnimationComplete={() => step === 4 && setStep(5)}
        >
          <motion.div
            className="hero-bg"
            aria-hidden="true"
            style={{ "--hero-img": `url(${mainPic})`, y: bgY }}
            initial={{ opacity: 0, scale: 1.12 }}
            animate={step >= 4 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.12 }}
            transition={{ duration: 2.2, ease: EASE }}
          />

          {step >= 4 && <Tulips mode="on-light" />}

          <div className="sticker-layer" aria-hidden="true">
            {PLACEMENTS.map((p, i) => (
              <Sticker key={i} i={i} {...p} />
            ))}
          </div>

          <main>
            <motion.header
              className="hero"
              variants={heroParent}
              initial="hidden"
              animate={step >= 4 ? "show" : "hidden"}
            >
              <motion.p className="kicker" variants={heroChild}>Happy birthday</motion.p>
              <motion.h2 variants={heroChild}>{CONFIG.name}</motion.h2>
              <motion.p className="sub" variants={heroChild}>Made with love, from {CONFIG.from}.</motion.p>
            </motion.header>

            <section className="letter">
              <Reveal as="h3">Hey Love!</Reveal>
              <Reveal as="p" className="letter-sub" y={30} start={1} end={0.8}>
                I wrote you something. Untie the ribbon to read it.
              </Reveal>
              <Reveal y={60} start={1} end={0.75}>
                <TiedLetter />
              </Reveal>
            </section>

            <Cake />

            <Memories onOpen={setLightbox} />

            <Letters />

            <Checklist done={checked} setDone={setChecked} />

            <Reveal as="section" className="ask" y={40} start={1} end={0.85}>
              <motion.button
                className="ask-link"
                onClick={() => setAskOpen(true)}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              >
                {CONFIG.ask.link}
              </motion.button>
            </Reveal>

            <footer aria-hidden="true" />
          </main>
        </motion.div>

        {step === 5 && <motion.div className="progress" style={{ scaleX: progress }} />}

        {/* ASK FLOW */}
        <AnimatePresence>{askOpen && <AskFlow key="ask" onClose={closeAsk} hugged={hugged} />}</AnimatePresence>

        {/* LIGHTBOX */}
        <AnimatePresence>
          {lightbox && (
            <motion.div
              className="lightbox"
              onClick={() => setLightbox(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <motion.figure
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.35, ease: EASE }}
                onClick={(e) => e.stopPropagation()}
              >
                <img src={lightbox.src} alt={lightbox.caption} />
                <figcaption>{lightbox.caption}</figcaption>
              </motion.figure>
              <button className="lightbox-close" onClick={() => setLightbox(null)} aria-label="Close photo">
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}

export default function App() {
  // Unlock lives only in memory: every reload / restart starts on the countdown again.
  const [unlocked, setUnlocked] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => music.init(), []);

  useEffect(() => {
    if (unlocked) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [unlocked]);

  return (
    <>
      {unlocked ? <Birthday /> : <Gate left={UNLOCK_AT - now} onBypass={() => {
          music.ensure(); // runs inside the click, so the browser allows sound
          setUnlocked(true);
        }} />}
      <MusicButton />
    </>
  );
}