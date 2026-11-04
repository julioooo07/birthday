import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import "./App.css";
import mainPic from "./assets/MainPic.jpg";

/* ------------------------------------------------------------------
   EDIT YOUR CONTENT HERE
   - Photos: put images in /public and set src, e.g. "/photo1.jpg"
   - Music (optional): put a file at /public/music.mp3
------------------------------------------------------------------- */
const CONFIG = {
  name: "Ashley Nicole",
  nickname: "Leyley",
  from: "Hulyo",
  music: "/music.mp3",
  letter: [
    "Write your message here. Tell her what she means to you, your favorite things about her, and what you wish for her this year.",
    "Add as many paragraphs as you want. Happy birthday, my love.",
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
    final: "Happy Birthday, My love. I'll always be here, loving you. :)",
  },
  memories: [
    { caption: "Our first picture", src: "" },
    { caption: "Favorite date", src: "" },
    { caption: "Silly moment", src: "" },
    { caption: "Somewhere we went", src: "" },
    { caption: "Your best smile", src: "" },
    { caption: "Us, lately", src: "" },
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

const CONFETTI_COLORS = ["#2f6fe4", "#9cc4ff", "#ffffff", "#0f2a5c", "#6fa8f7"];

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
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: [`0 ${start}`, `0 ${end}`] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 28, mass: 0.5 });
  const opacity = useTransform(p, [0, 1], [0, 1]);
  const translateY = useTransform(p, [0, 1], [y, 0]);
  const Tag = motion[as];

  if (reduce) return <Tag className={className}>{children}</Tag>;
  return (
    <Tag ref={ref} className={className} style={{ opacity, y: translateY }}>
      {children}
    </Tag>
  );
}

function Tulips({ mode }) {
  return (
    <div className={`tulips ${mode}`} aria-hidden="true">
      {TULIPS.map((t, i) => (
        <motion.div
          className="tulip"
          key={i}
          style={{ left: `${t.left}%`, originX: 0.5, originY: 1, "--sway": `${t.sway}s` }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: t.scale, opacity: 1 }}
          transition={{ type: "spring", stiffness: 80, damping: 11, delay: t.delay }}
        >
          <svg viewBox="0 0 40 100" className="tulip-svg">
            <path className="stem" d="M20 100 C19 80 21 62 20 40" />
            <path className="leaf" d="M20 92 C8 86 6 70 9 60 C16 66 20 78 20 92 Z" />
            <path className="leaf" d="M20 88 C32 82 34 68 31 58 C24 64 20 74 20 88 Z" />
            <path className={`petal ${t.tone}`} d="M20 40 C7 38 5 20 9 8 L15 17 L20 4 L25 17 L31 8 C35 20 33 38 20 40 Z" />
            <path className="petal-front" d="M20 40 C14 36 14 22 20 4 C26 22 26 36 20 40 Z" />
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

function MusicButton({ audioRef, playing, setPlaying }) {
  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play().then(() => setPlaying(true)).catch(() => {});
    }
  };
  return (
    <motion.button
      className="music"
      onClick={toggle}
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

function Checklist() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -35% 0px" });
  const [done, setDone] = useState(() => CONFIG.checklist.map((c) => c.done));
  const toggle = (i) => setDone((d) => d.map((v, j) => (j === i ? !v : v)));

  return (
    <section className="checklist" ref={ref}>
      <Reveal as="h3">Birthday Checklist:</Reveal>
      <ul>
        {CONFIG.checklist.map((item, i) => {
          const on = done[i] && inView;
          return (
            <Reveal as="li" key={item.label} y={40} start={0.95 - i * 0.08} end={0.6 - i * 0.08}>
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
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
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

function AskFlow({ onClose }) {
  const [step, setStep] = useState("q");
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
    const t = setTimeout(() => setStep("glad"), 2100);
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

export default function App() {
  // 0-3 = intro cards, 4 = site expanding from the button, 5 = site
  const [step, setStep] = useState(0);
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [origin, setOrigin] = useState({ x: 0, y: 0, r: 0 });
  const [lightbox, setLightbox] = useState(null);
  const [askOpen, setAskOpen] = useState(false);
  const closeAsk = useCallback(() => setAskOpen(false), []);
  const [playing, setPlaying] = useState(false);
  const [hasAudio, setHasAudio] = useState(true);
  const audioRef = useRef(null);

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
    audioRef.current?.play().then(() => setPlaying(true)).catch(() => {});
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
    <MotionConfig reducedMotion="user">
      <div className={`app ${step === 4 ? "opening" : ""}`}>
        <audio
          ref={audioRef}
          src={CONFIG.music}
          loop
          preload="auto"
          onError={() => setHasAudio(false)}
        />

        {/* INTRO */}
        <div className={`intro ${step === 5 ? "hide" : ""}`}>
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
              <Reveal as="h3">For you</Reveal>
              {CONFIG.letter.map((para, i) => (
                <Reveal as="p" key={i} y={50} start={0.95 - i * 0.1} end={0.55 - i * 0.1}>
                  {para}
                </Reveal>
              ))}
              <Reveal
                as="p"
                className="sign"
                y={50}
                start={0.95 - CONFIG.letter.length * 0.1}
                end={0.55 - CONFIG.letter.length * 0.1}
              >
                — {CONFIG.from}
              </Reveal>
            </section>

            <Cake />

            <section className="memories">
              <Reveal as="h3">Our memories</Reveal>
              <div className="grid">
                {CONFIG.memories.map((m, i) => (
                  <Reveal key={m.caption} y={90} start={0.95 - (i % 3) * 0.12} end={0.55 - (i % 3) * 0.12}>
                    <motion.div
                      className={`frame ${m.src ? "clickable" : ""}`}
                      style={{ rotate: i % 2 ? 1.2 : -1.2 }}
                      onClick={() => m.src && setLightbox(m)}
                      whileHover={{
                        rotate: 0,
                        y: -6,
                        scale: 1.02,
                        transition: { type: "spring", stiffness: 300, damping: 20 },
                      }}
                    >
                      {m.src ? (
                        <img src={m.src} alt={m.caption} loading="lazy" />
                      ) : (
                        <div className="ph">Add photo</div>
                      )}
                      <span>{m.caption}</span>
                    </motion.div>
                  </Reveal>
                ))}
              </div>
            </section>

            <Checklist />

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
        {step === 5 && hasAudio && (
          <MusicButton audioRef={audioRef} playing={playing} setPlaying={setPlaying} />
        )}

        {/* ASK FLOW */}
        <AnimatePresence>{askOpen && <AskFlow key="ask" onClose={closeAsk} />}</AnimatePresence>

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