import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PHRASES } from "./Phrases.js";

const EASE = [0.22, 1, 0.36, 1];
const SPRING = { type: "spring", stiffness: 380, damping: 22 };

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------------------------- scrunched paper ---------------------------- */

const PAPER = ["#fffdf8", "#dce8ff", "#ffdbe7"];

function makeBall(seed) {
  const r = rng(seed * 7919 + 13);
  const n = 11;
  const f = (v) => v.toFixed(1);
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (Math.PI * 2 * i) / n + r() * 0.3;
    const rad = 34 + r() * 14;
    return [50 + Math.cos(a) * rad, 50 + Math.sin(a) * rad];
  });
  const c = [50 + (r() - 0.5) * 12, 50 + (r() - 0.5) * 12];
  return {
    base: PAPER[Math.floor(r() * PAPER.length)],
    outline: pts.map((p) => `${f(p[0])},${f(p[1])}`).join(" "),
    facets: pts.map((p, i) => {
      const q = pts[(i + 1) % n];
      return {
        d: `M${f(c[0])} ${f(c[1])}L${f(p[0])} ${f(p[1])}L${f(q[0])} ${f(q[1])}Z`,
        light: r() > 0.5,
        a: 0.18 + r() * 0.3,
      };
    }),
    creases: Array.from({ length: 4 }, () => {
      const p = pts[Math.floor(r() * n)];
      const q = pts[Math.floor(r() * n)];
      return `M${f(p[0])} ${f(p[1])}L${f(50 + (r() - 0.5) * 20)} ${f(50 + (r() - 0.5) * 20)}L${f(q[0])} ${f(q[1])}`;
    }),
  };
}
const BALLS = Array.from({ length: 24 }, (_, i) => makeBall(i + 1));

function Ball({ ball }) {
  return (
    <>
      <polygon points={ball.outline} fill={ball.base} stroke="rgba(15,42,92,0.32)" strokeWidth="1" strokeLinejoin="round" />
      {ball.facets.map((f, i) => (
        <path key={i} d={f.d} fill={f.light ? `rgba(255,255,255,${Math.min(1, f.a + 0.4)})` : `rgba(90,120,185,${f.a * 0.9})`} />
      ))}
      {ball.creases.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="rgba(15,42,92,0.26)" strokeWidth="0.8" strokeLinejoin="round" />
      ))}
    </>
  );
}

/* ---------------------------------- jar ---------------------------------- */

const JAR_BODY =
  "M88 40 H172 V66 C208 72 228 92 228 124 V276 C228 306 210 320 180 320 H80 C50 320 32 306 32 276 V124 C32 92 52 72 88 66 Z";

const JAR_BALLS = (() => {
  const r = rng(99);
  const out = [];
  let row = 0;
  for (let y = 298; y > 112; y -= 30) {
    const offset = row % 2 ? 20 : 0;
    for (let x = 62 + offset; x < 216; x += 40) {
      const skip = y < 160 ? r() < 0.55 : y < 205 ? r() < 0.25 : false;
      if (skip) continue;
      out.push({
        x: x + (r() - 0.5) * 8,
        y: y + (r() - 0.5) * 6,
        rot: r() * 360,
        s: 0.46 + r() * 0.18,
        ball: Math.floor(r() * BALLS.length),
      });
    }
    row += 1;
  }
  return out;
})();

function JarSvg() {
  return (
    <svg className="jar" viewBox="0 0 260 330" aria-hidden="true">
      <defs>
        <clipPath id="jarClip">
          <path d={JAR_BODY} />
        </clipPath>
      </defs>

      <g clipPath="url(#jarClip)">
        <rect x="30" y="60" width="200" height="262" fill="rgba(214,230,255,0.35)" />
        {JAR_BALLS.map((b, i) => (
          <g key={i} transform={`translate(${b.x.toFixed(1)} ${b.y.toFixed(1)}) rotate(${b.rot.toFixed(0)}) scale(${b.s.toFixed(2)}) translate(-50 -50)`}>
            <Ball ball={BALLS[b.ball]} />
          </g>
        ))}
      </g>

      {/* glass */}
      <path d={JAR_BODY} fill="rgba(255,255,255,0.22)" stroke="rgba(140,175,230,0.95)" strokeWidth="3" />
      <path d="M50 128 V272" stroke="rgba(255,255,255,0.7)" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M52 108 C54 96 62 88 76 82" stroke="rgba(255,255,255,0.8)" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M210 140 V236" stroke="rgba(255,255,255,0.4)" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* label */}
      <rect x="80" y="212" width="100" height="56" rx="7" fill="#fffdf8" stroke="rgba(15,42,92,0.25)" />
      <text x="130" y="241" textAnchor="middle" className="jar-label-big">{PHRASES.length}</text>
      <text x="130" y="259" textAnchor="middle" className="jar-label-small">little notes &#9829;</text>

      {/* lid */}
      <rect x="76" y="12" width="108" height="32" rx="9" fill="#f58fb0" />
      <rect x="76" y="12" width="108" height="10" rx="5" fill="rgba(255,255,255,0.35)" />
      <path d="M92 20 V40 M108 20 V40 M124 20 V40 M140 20 V40 M156 20 V40 M172 20 V40" stroke="rgba(184,58,99,0.35)" strokeWidth="2" />
    </svg>
  );
}

/* ------------------------------- the note -------------------------------- */

const CREASES = [
  "M0 22 L38 30 L100 18",
  "M0 58 L45 52 L100 64",
  "M24 0 L30 44 L20 100",
  "M72 0 L66 40 L78 100",
  "M0 100 L52 46 L100 0",
];

function JarBtn({ ghost, children, ...props }) {
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

// ball flies in -> shakes -> unscrunches into a paper -> the phrase appears
function NoteStage({ note, onAnother, onClose }) {
  const [stage, setStage] = useState("ball"); // ball -> shake -> open -> read

  useEffect(() => {
    const t1 = setTimeout(() => setStage("shake"), 950);
    const t2 = setTimeout(() => setStage("open"), 1650);
    const t3 = setTimeout(() => setStage("read"), 3300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const ballAnimate =
    stage === "ball"
      ? { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }
      : { opacity: 1, x: [0, -6, 6, -4, 4, 0], y: 0, scale: [1, 1.04, 1, 1.04, 1], rotate: [0, -12, 12, -8, 8, 0] };
  const ballTransition =
    stage === "ball" ? { type: "spring", stiffness: 70, damping: 11 } : { duration: 0.65, ease: "easeInOut" };

  const showPaper = stage === "open" || stage === "read";

  return (
    <motion.div
      className="note-stage"
      exit={{ opacity: 0, y: -30, scale: 0.92, transition: { duration: 0.3, ease: EASE } }}
    >
      <div className="note-area">
        {!showPaper && (
          <motion.div
            className="note-ball"
            initial={{ opacity: 0, x: -50, y: 230, scale: 0.3, rotate: -70 }}
            animate={ballAnimate}
            transition={ballTransition}
          >
            <svg viewBox="0 0 100 100" aria-hidden="true">
              <Ball ball={BALLS[note.ball]} />
            </svg>
          </motion.div>
        )}

        {showPaper && (
          <>
            <motion.div
              className="note-ball"
              initial={{ opacity: 1, scale: 1, rotate: 0 }}
              animate={{ opacity: [1, 1, 0], scale: [1, 1.2, 0.55], rotate: [0, -14, 24] }}
              transition={{ duration: 0.8, ease: EASE }}
              style={{ pointerEvents: "none" }}
            >
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <Ball ball={BALLS[note.ball]} />
              </svg>
            </motion.div>

            <motion.article
              className="note-paper"
              initial={{ opacity: 0, scale: 0.3, rotate: -18, rotateX: 60 }}
              animate={{ opacity: 1, scale: 1, rotate: -1.5, rotateX: 0 }}
              transition={{ type: "spring", stiffness: 70, damping: 13, delay: 0.3 }}
            >
              <svg className="creases" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                {CREASES.map((d, i) => (
                  <motion.path
                    key={i}
                    d={d}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0.15 }}
                    transition={{ delay: 0.8, duration: 1.8, ease: EASE }}
                  />
                ))}
              </svg>
              <motion.p
                className="note-text"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.8, ease: EASE }}
              >
                {note.text}
              </motion.p>
              <motion.span
                className="note-from"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6, duration: 0.8, ease: EASE }}
              >
                &mdash; Hulyo &hearts;
              </motion.span>
            </motion.article>
          </>
        )}
      </div>

      <div className="note-actions">
        {stage === "read" && (
          <motion.div
            className="note-actions-row"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <JarBtn ghost onClick={onAnother}>Another one</JarBtn>
            <JarBtn onClick={onClose}>Close</JarBtn>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function NoteModal({ note, onClose, onAnother }) {
  useEffect(() => {
    document.body.classList.add("modal-open");
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      className="ask-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <button className="ask-close" onClick={onClose} aria-label="Close note">&#10005;</button>
      <AnimatePresence mode="wait">
        <NoteStage key={note.id} note={note} onAnother={onAnother} onClose={onClose} />
      </AnimatePresence>
    </motion.div>
  );
}

/* ------------------------------- the section ------------------------------- */

export default function Jar({ Reveal }) {
  const [note, setNote] = useState(null);
  const [read, setRead] = useState(0);
  const usedRef = useRef(new Set());
  const counter = useRef(0);

  // a random note she has not read yet (starts over once all of them were read)
  const pick = useCallback(() => {
    let pool = PHRASES.map((_, i) => i).filter((i) => !usedRef.current.has(i));
    if (pool.length === 0) {
      usedRef.current.clear();
      pool = PHRASES.map((_, i) => i);
    }
    const i = pool[Math.floor(Math.random() * pool.length)];
    usedRef.current.add(i);
    counter.current += 1;
    setRead(usedRef.current.size);
    setNote({ id: counter.current, text: PHRASES[i], ball: Math.floor(Math.random() * BALLS.length) });
  }, []);
  const close = useCallback(() => setNote(null), []);

  return (
    <section className="jar-section">
      <Reveal as="h3">A jar of little notes</Reveal>
      <Reveal as="p" className="jar-sub" y={30} start={1} end={0.8}>
        {PHRASES.length} love notes, just for you. Tap the jar whenever you need one.
      </Reveal>

      <Reveal y={60} start={1} end={0.75}>
        <motion.button
          className="jar-btn"
          onClick={pick}
          aria-label="Pick a love note from the jar"
          animate={{ rotate: [-1.2, 1.2, -1.2] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          <JarSvg />
        </motion.button>
      </Reveal>

      <p className="jar-count">
        {read === 0
          ? "Tap the jar"
          : read === PHRASES.length
            ? `You've read all ${PHRASES.length} \u2665`
            : `${read} of ${PHRASES.length} read`}
      </p>

      <AnimatePresence>{note && <NoteModal key="note" note={note} onClose={close} onAnother={pick} />}</AnimatePresence>
    </section>
  );
}