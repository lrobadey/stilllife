import { useState, useCallback } from "react";

const HAIKU_DATA = {
  stasis: {
    id: "stasis",
    label: "Part I",
    title: "Stasis",
    subtitle: "Vast time, arrested motion, deep quiet",
    sonic: "Long tones · Drone fields · Sparse texture · Minimal pulse",
    accent: "#7BA7C2",
    accentDim: "rgba(123,167,194,0.12)",
    accentBorder: "rgba(123,167,194,0.35)",
    haikus: [
      { id: "s1", text: "stillness —\nfireflies are glowing over\ndeep water", note: "Names stillness directly; the glow is slow light, not flash. The dashes are themselves silence." },
      { id: "s2", text: "May rain\nfalls as if falling\ninto a sleep", note: "Hypnotic, somnolent. Rain becomes pure drone. The simile collapses motion into unconsciousness." },
      { id: "s3", text: "Evening snow falling,\na pair of mandarin ducks\non an ancient lake", note: "Geological timescale ('ancient'). Snow's descent is slow and even. The pairing suggests symmetry, suspension." },
      { id: "s4", text: "A willow;\nand two or three cows\nwaiting for the boat", note: "Time is fully suspended. The semicolon after willow is a held breath. Waiting is structural stasis." },
      { id: "s5", text: "looking down I see,\ncool in the moonlight,\n4000 houses", note: "Aerial, vast, cool — the scalar remove drains the scene of human urgency. 4000 houses is mass, not motion." },
    ],
  },
  emergence: {
    id: "emergence",
    label: "Part II",
    title: "Emergence",
    subtitle: "Buried pulse, interior states, life welling up",
    sonic: "Textural thickening · Interior harmony · Slow rhythmic emergence",
    accent: "#C8A96E",
    accentDim: "rgba(200,169,110,0.12)",
    accentBorder: "rgba(200,169,110,0.35)",
    haikus: [
      { id: "e1", text: "A mountain village\nunder the piled-up snow\nthe sound of water", note: "The sound of water is hidden — stillness on the surface with energy underneath. The perfect pivot image." },
      { id: "e2", text: "the moon is cool—\nfrogs' croaking\nwells up", note: "'Wells up' is the key verb — organic, upward, emergent. Sound rising from depth into air." },
      { id: "e3", text: "Lotus leaves in the pond\nride on water.\nRain in June", note: "Gentle motion. The leaves ride — passive but present. Rain establishes a pulse without urgency." },
      { id: "e4", text: "on a stormy night\nwhile reading a letter\nwavering mind", note: "The storm is background; the foreground is interior turbulence. Contained energy, psychological rather than kinetic." },
      { id: "e5", text: "loneliness\nafter the fireworks\nstars' shooting", note: "Aftermath structure — energy has already happened, now there's space + distant motion. Transition haiku toward Part III." },
    ],
  },
  energy: {
    id: "energy",
    label: "Part III",
    title: "Energy",
    subtitle: "Sudden events, kinetic imagery, rupture",
    sonic: "Rhythmic density · Timbral saturation · Momentum · Event-driven form",
    accent: "#C47A5A",
    accentDim: "rgba(196,122,90,0.12)",
    accentBorder: "rgba(196,122,90,0.35)",
    haikus: [
      { id: "n1", text: "the tree cut,\ndawn breaks early\nat my little window", note: "Rupture initiates the section. A past violent act opens into sudden light — before/after structure as compositional model." },
      { id: "n2", text: "Mountains in spring\noverlapping each other\nall round", note: "Visual accumulation and layering — compositionally dense. Luca's note: 'less still life, more nature-focused.'" },
      { id: "n3", text: "summer mountain\nall creatures are green\na red bridge", note: "The red bridge is a chromatic shock against the green mass. Vivid, populated, energetically saturated." },
      { id: "n4", text: "coolness—\na mountain stream splashes out\nbetween houses", note: "The most kinetically active water image in the set. 'Splashes out' is sudden, directional, energetic." },
      { id: "n5", text: "entangled with\nthe scattering cherry blossoms—\nthe wings of birds!", note: "Peak motion and density. Entanglement + scattering + wings + exclamation mark. This is the climax haiku of the whole collection." },
    ],
  },
};

const SECTIONS = ["stasis", "emergence", "energy"];

// States cycle: neutral → selected → rejected → neutral
const STATE_CYCLE = { neutral: "selected", selected: "rejected", rejected: "neutral" };

const ArcSVG = ({ stateCounts }) => {
  const pts = [
    { x: 60, y: 160 },
    { x: 220, y: 80 },
    { x: 380, y: 20 },
  ];
  const path = `M ${pts[0].x} ${pts[0].y} C 140,140 300,50 ${pts[2].x} ${pts[2].y}`;
  const sections = Object.values(HAIKU_DATA);
  return (
    <svg viewBox="0 0 440 200" style={{ width: "100%", maxWidth: 440, height: 90, display: "block" }}>
      <defs>
        <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7BA7C2" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#C8A96E" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#C47A5A" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="18" strokeLinecap="round" />
      <path d={path} fill="none" stroke="url(#arcGrad)" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 3" />
      {pts.map((pt, i) => (
        <g key={i}>
          <circle cx={pt.x} cy={pt.y} r={stateCounts[SECTIONS[i]] > 0 ? 10 : 6} fill={sections[i].accent} opacity={stateCounts[SECTIONS[i]] > 0 ? 0.9 : 0.3} />
          {stateCounts[SECTIONS[i]] > 0 && (
            <text x={pt.x} y={pt.y + 4} textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="monospace">
              {stateCounts[SECTIONS[i]]}
            </text>
          )}
          <text x={pt.x} y={pt.y + 22} textAnchor="middle" fill={sections[i].accent} fontSize="8.5" fontFamily="'Cormorant Garamond', Georgia, serif" letterSpacing="1" opacity="0.8">
            {sections[i].title.toUpperCase()}
          </text>
        </g>
      ))}
    </svg>
  );
};

const HaikuCard = ({ haiku, sectionAccent, accentDim, accentBorder, status, onToggle, showNote }) => {
  const [noteOpen, setNoteOpen] = useState(false);

  const isSelected = status === "selected";
  const isRejected = status === "rejected";

  const cardStyle = {
    position: "relative",
    padding: "18px 20px 14px",
    marginBottom: 10,
    borderRadius: 4,
    cursor: "pointer",
    transition: "all 0.22s ease",
    border: isSelected
      ? `1px solid ${sectionAccent}`
      : isRejected
      ? "1px solid rgba(255,255,255,0.05)"
      : `1px solid rgba(255,255,255,0.08)`,
    background: isSelected
      ? accentDim
      : isRejected
      ? "rgba(0,0,0,0.2)"
      : "rgba(255,255,255,0.025)",
    opacity: isRejected ? 0.38 : 1,
  };

  const textStyle = {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: 15.5,
    lineHeight: 1.75,
    color: isSelected ? "#f0ebe0" : isRejected ? "#666" : "#c8c0b0",
    whiteSpace: "pre-line",
    textDecoration: isRejected ? "line-through" : "none",
    textDecorationColor: "rgba(150,150,150,0.5)",
    margin: 0,
    letterSpacing: "0.01em",
  };

  const badgeStyle = {
    position: "absolute",
    top: 10,
    right: 12,
    fontSize: 10,
    letterSpacing: "0.12em",
    fontFamily: "monospace",
    padding: "2px 6px",
    borderRadius: 2,
    ...(isSelected
      ? { background: sectionAccent, color: "#0a0907", fontWeight: "bold" }
      : isRejected
      ? { background: "rgba(255,255,255,0.06)", color: "#555" }
      : {}),
  };

  return (
    <div style={cardStyle} onClick={() => onToggle(haiku.id)}>
      {isSelected && <span style={badgeStyle}>SELECTED</span>}
      {isRejected && <span style={badgeStyle}>✕</span>}
      <p style={textStyle}>{haiku.text}</p>
      {showNote && (
        <div
          style={{ marginTop: 8 }}
          onClick={(e) => { e.stopPropagation(); setNoteOpen(!noteOpen); }}
        >
          <span style={{ fontSize: 10, letterSpacing: "0.1em", color: sectionAccent, opacity: 0.7, cursor: "pointer", fontFamily: "monospace" }}>
            {noteOpen ? "▾ NOTE" : "▸ NOTE"}
          </span>
          {noteOpen && (
            <p style={{ margin: "6px 0 0", fontSize: 11.5, color: "#888", fontFamily: "'Cormorant Garamond', Georgia, serif", lineHeight: 1.6, fontStyle: "italic" }}>
              {haiku.note}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default function StillLifeDashboard() {
  const [haikuStates, setHaikuStates] = useState({});
  const [sectionNotes, setSectionNotes] = useState({ stasis: "", emergence: "", energy: "" });
  const [formNote, setFormNote] = useState("");
  const [showNotes, setShowNotes] = useState(true);
  const [view, setView] = useState("columns"); // "columns" | "form"

  const toggleHaiku = useCallback((id) => {
    setHaikuStates((prev) => ({
      ...prev,
      [id]: STATE_CYCLE[prev[id] || "neutral"],
    }));
  }, []);

  const getStatus = (id) => haikuStates[id] || "neutral";

  const selectedBySection = {};
  SECTIONS.forEach((s) => {
    selectedBySection[s] = HAIKU_DATA[s].haikus.filter((h) => getStatus(h.id) === "selected");
  });

  const stateCounts = {};
  SECTIONS.forEach((s) => { stateCounts[s] = selectedBySection[s].length; });

  const totalSelected = Object.values(stateCounts).reduce((a, b) => a + b, 0);

  const resetAll = () => setHaikuStates({});

  const styles = {
    root: {
      minHeight: "100vh",
      background: "#0d0b09",
      color: "#c8c0b0",
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      padding: "0 0 60px",
    },
    header: {
      padding: "36px 40px 0",
      borderBottom: "1px solid rgba(255,255,255,0.07)",
      paddingBottom: 24,
    },
    eyebrow: {
      fontSize: 10,
      letterSpacing: "0.22em",
      color: "#6a6055",
      fontFamily: "monospace",
      marginBottom: 6,
    },
    title: {
      fontSize: 28,
      fontWeight: 400,
      color: "#e8e0d0",
      margin: 0,
      letterSpacing: "0.04em",
    },
    titleItalic: { fontStyle: "italic", color: "#a8a090" },
    meta: {
      fontSize: 13,
      color: "#5a5248",
      marginTop: 4,
      fontFamily: "monospace",
      letterSpacing: "0.05em",
    },
    nav: {
      display: "flex",
      gap: 24,
      marginTop: 20,
      alignItems: "center",
    },
    navBtn: (active) => ({
      fontSize: 10,
      letterSpacing: "0.18em",
      fontFamily: "monospace",
      padding: "5px 14px",
      border: active ? "1px solid rgba(255,255,255,0.25)" : "1px solid rgba(255,255,255,0.08)",
      borderRadius: 2,
      background: active ? "rgba(255,255,255,0.06)" : "transparent",
      color: active ? "#e0d8c8" : "#5a5248",
      cursor: "pointer",
      transition: "all 0.15s",
    }),
    toggleBtn: {
      fontSize: 10,
      letterSpacing: "0.14em",
      fontFamily: "monospace",
      padding: "5px 12px",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 2,
      background: "transparent",
      color: "#5a5248",
      cursor: "pointer",
      marginLeft: "auto",
    },
    resetBtn: {
      fontSize: 10,
      letterSpacing: "0.14em",
      fontFamily: "monospace",
      padding: "5px 12px",
      border: "1px solid rgba(196,122,90,0.2)",
      borderRadius: 2,
      background: "transparent",
      color: "#C47A5A",
      cursor: "pointer",
      opacity: totalSelected === 0 ? 0.3 : 1,
    },
    formPanel: {
      margin: "28px 40px",
      padding: "24px 28px",
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 4,
    },
    arcLabel: {
      fontSize: 10,
      letterSpacing: "0.2em",
      fontFamily: "monospace",
      color: "#4a4540",
      marginBottom: 12,
    },
    selectedList: {
      display: "flex",
      gap: 12,
      flexWrap: "wrap",
      marginTop: 16,
    },
    selectedChip: (accent) => ({
      fontSize: 11.5,
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontStyle: "italic",
      padding: "4px 10px",
      border: `1px solid ${accent}50`,
      borderRadius: 2,
      color: accent,
      background: `${accent}10`,
      whiteSpace: "nowrap",
    }),
    columnsGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: 20,
      padding: "0 40px",
      marginTop: 4,
    },
    column: (accent, accentDim) => ({
      position: "relative",
    }),
    colHeader: {
      padding: "20px 0 16px",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      marginBottom: 16,
    },
    colLabel: (accent) => ({
      fontSize: 9,
      letterSpacing: "0.25em",
      fontFamily: "monospace",
      color: accent,
      opacity: 0.8,
      marginBottom: 4,
    }),
    colTitle: {
      fontSize: 19,
      fontWeight: 400,
      color: "#e8e0d0",
      margin: "0 0 4px",
      letterSpacing: "0.03em",
    },
    colSubtitle: {
      fontSize: 12,
      color: "#5a5248",
      fontStyle: "italic",
      margin: "0 0 8px",
      lineHeight: 1.4,
    },
    sonicTag: (accent) => ({
      fontSize: 9.5,
      letterSpacing: "0.05em",
      fontFamily: "monospace",
      color: accent,
      opacity: 0.55,
      lineHeight: 1.5,
    }),
    notesInput: (accent) => ({
      width: "100%",
      marginTop: 14,
      background: "rgba(255,255,255,0.02)",
      border: `1px solid rgba(255,255,255,0.06)`,
      borderRadius: 3,
      padding: "10px 12px",
      color: "#8a8278",
      fontSize: 12,
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontStyle: "italic",
      resize: "vertical",
      minHeight: 60,
      outline: "none",
      boxSizing: "border-box",
      lineHeight: 1.6,
    }),
    formViewGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: 20,
      padding: "0 40px",
      marginTop: 4,
    },
    formSection: (accent, accentDim) => ({
      padding: "20px",
      background: accentDim,
      border: `1px solid ${accent}30`,
      borderRadius: 4,
    }),
    formSectionLabel: (accent) => ({
      fontSize: 9,
      letterSpacing: "0.25em",
      fontFamily: "monospace",
      color: accent,
      marginBottom: 12,
    }),
    formHaikuItem: (accent) => ({
      padding: "12px 14px",
      marginBottom: 8,
      background: "rgba(0,0,0,0.25)",
      borderLeft: `2px solid ${accent}`,
      borderRadius: "0 2px 2px 0",
    }),
    formHaikuText: {
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontSize: 13.5,
      lineHeight: 1.7,
      color: "#c8c0b0",
      whiteSpace: "pre-line",
      margin: 0,
    },
    emptyState: (accent) => ({
      fontSize: 11,
      fontFamily: "monospace",
      letterSpacing: "0.08em",
      color: accent,
      opacity: 0.25,
      textAlign: "center",
      padding: "20px 0",
    }),
    globalNotesArea: {
      margin: "0 40px",
      padding: "20px 24px",
      background: "rgba(255,255,255,0.015)",
      border: "1px solid rgba(255,255,255,0.05)",
      borderRadius: 4,
      marginTop: 20,
    },
  };

  const hint = (
    <p style={{ fontSize: 10, fontFamily: "monospace", letterSpacing: "0.1em", color: "#3a3530", marginTop: 10, marginBottom: 0 }}>
      CLICK CARD → SELECT &nbsp;·&nbsp; CLICK AGAIN → REJECT &nbsp;·&nbsp; CLICK AGAIN → RESET
    </p>
  );

  return (
    <div style={styles.root}>
      {/* HEADER */}
      <div style={styles.header}>
        <p style={styles.eyebrow}>CHAMBER ORCHESTRA · FORM PLANNING</p>
        <h1 style={styles.title}>
          <span style={styles.titleItalic}>Still Life</span>
          <span style={{ color: "#3a3530", margin: "0 14px" }}>—</span>
          <span style={{ fontSize: 16, color: "#6a6055", fontWeight: 300 }}>Masaoka Shiki · Haiku Classification</span>
        </h1>
        <p style={styles.meta}>{totalSelected} selected &nbsp;/&nbsp; 15 total</p>
        <div style={styles.nav}>
          <button style={styles.navBtn(view === "columns")} onClick={() => setView("columns")}>HAIKU CARDS</button>
          <button style={styles.navBtn(view === "form")} onClick={() => setView("form")}>FORM VIEW</button>
          <button style={styles.toggleBtn} onClick={() => setShowNotes(!showNotes)}>
            {showNotes ? "HIDE NOTES" : "SHOW NOTES"}
          </button>
          <button style={styles.resetBtn} onClick={resetAll} disabled={totalSelected === 0}>RESET ALL</button>
        </div>
      </div>

      {/* ARC PANEL */}
      <div style={styles.formPanel}>
        <p style={styles.arcLabel}>ENERGY ARC — SELECTED HAIKU PER SECTION</p>
        <ArcSVG stateCounts={stateCounts} />
        {totalSelected > 0 && (
          <div style={styles.selectedList}>
            {SECTIONS.map((s) =>
              selectedBySection[s].map((h) => (
                <span key={h.id} style={styles.selectedChip(HAIKU_DATA[s].accent)}>
                  {h.text.split("\n")[0]}…
                </span>
              ))
            )}
          </div>
        )}
        {totalSelected === 0 && (
          <p style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em", color: "#3a3530", marginTop: 10 }}>
            Select haiku from the cards below to populate the arc
          </p>
        )}
      </div>

      {/* COLUMNS VIEW */}
      {view === "columns" && (
        <>
          <div style={styles.columnsGrid}>
            {SECTIONS.map((sKey) => {
              const sec = HAIKU_DATA[sKey];
              return (
                <div key={sKey} style={styles.column(sec.accent, sec.accentDim)}>
                  <div style={styles.colHeader}>
                    <p style={styles.colLabel(sec.accent)}>{sec.label} &nbsp;·&nbsp; {sec.title.toUpperCase()}</p>
                    <h2 style={styles.colTitle}>{sec.subtitle}</h2>
                    <p style={styles.colSubtitle}>&nbsp;</p>
                    <p style={styles.sonicTag(sec.accent)}>{sec.sonic}</p>
                  </div>
                  {sec.haikus.map((h) => (
                    <HaikuCard
                      key={h.id}
                      haiku={h}
                      sectionAccent={sec.accent}
                      accentDim={sec.accentDim}
                      accentBorder={sec.accentBorder}
                      status={getStatus(h.id)}
                      onToggle={toggleHaiku}
                      showNote={showNotes}
                    />
                  ))}
                  {showNotes && (
                    <textarea
                      style={styles.notesInput(sec.accent)}
                      placeholder={`Compositional notes for ${sec.title.toLowerCase()}…`}
                      value={sectionNotes[sKey]}
                      onChange={(e) => setSectionNotes((prev) => ({ ...prev, [sKey]: e.target.value }))}
                    />
                  )}
                </div>
              );
            })}
          </div>
          {hint}
        </>
      )}

      {/* FORM VIEW */}
      {view === "form" && (
        <>
          <div style={styles.formViewGrid}>
            {SECTIONS.map((sKey) => {
              const sec = HAIKU_DATA[sKey];
              const selected = selectedBySection[sKey];
              return (
                <div key={sKey} style={styles.formSection(sec.accent, sec.accentDim)}>
                  <p style={styles.formSectionLabel(sec.accent)}>
                    {sec.label} &nbsp;·&nbsp; {sec.title.toUpperCase()} &nbsp;·&nbsp; {selected.length} HAIKU
                  </p>
                  {selected.length === 0 ? (
                    <p style={styles.emptyState(sec.accent)}>NO HAIKU SELECTED</p>
                  ) : (
                    selected.map((h, i) => (
                      <div key={h.id} style={styles.formHaikuItem(sec.accent)}>
                        <p style={{ ...styles.formHaikuText, color: sec.accent, fontSize: 9, fontFamily: "monospace", letterSpacing: "0.12em", marginBottom: 4 }}>
                          {String(i + 1).padStart(2, "0")}
                        </p>
                        <p style={styles.formHaikuText}>{h.text}</p>
                      </div>
                    ))
                  )}
                  {sectionNotes[sKey] && (
                    <div style={{ marginTop: 14, padding: "10px 12px", background: "rgba(0,0,0,0.2)", borderRadius: 3 }}>
                      <p style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.1em", color: sec.accent, opacity: 0.5, marginBottom: 4 }}>NOTES</p>
                      <p style={{ fontSize: 12.5, fontStyle: "italic", color: "#7a7268", fontFamily: "'Cormorant Garamond', Georgia, serif", margin: 0, lineHeight: 1.6 }}>
                        {sectionNotes[sKey]}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Global form note */}
          <div style={styles.globalNotesArea}>
            <p style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.2em", color: "#3a3530", marginBottom: 10 }}>GLOBAL FORM NOTES</p>
            <textarea
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                color: "#7a7268",
                fontSize: 13.5,
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontStyle: "italic",
                resize: "vertical",
                minHeight: 80,
                outline: "none",
                boxSizing: "border-box",
                lineHeight: 1.7,
              }}
              placeholder="Overall form, transitions, structural observations…"
              value={formNote}
              onChange={(e) => setFormNote(e.target.value)}
            />
          </div>
        </>
      )}
    </div>
  );
}
