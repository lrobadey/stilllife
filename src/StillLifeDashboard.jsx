import React, { useCallback, useEffect, useState } from "react";

const HAIKU_DATA = {
  stasis: {
    id: "stasis",
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

const SECTION_IDS = ["stasis", "emergence", "energy"];
const PART_LABELS = ["Part I", "Part II", "Part III"];
const SECTION_ENERGY_Y = {
  stasis: 214,
  emergence: 128,
  energy: 48,
};
const STORAGE_KEY = "still-life-form-state-v1";
const DEFAULT_SECTION_NOTES = { stasis: "", emergence: "", energy: "" };
const DEFAULT_VIEW = "columns";
const DEFAULT_SHOW_NOTES = true;

// States cycle: neutral -> selected -> rejected -> neutral
const STATE_CYCLE = { neutral: "selected", selected: "rejected", rejected: "neutral" };

const getPartLabel = (index) => PART_LABELS[index] || `Part ${index + 1}`;

const isValidSectionOrder = (value) =>
  Array.isArray(value) &&
  value.length === SECTION_IDS.length &&
  SECTION_IDS.every((id) => value.includes(id));

const sanitizeSectionNotes = (value) => {
  if (!value || typeof value !== "object") {
    return DEFAULT_SECTION_NOTES;
  }

  return SECTION_IDS.reduce((notes, sectionId) => {
    notes[sectionId] = typeof value[sectionId] === "string" ? value[sectionId] : "";
    return notes;
  }, {});
};

const loadPersistedState = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    return {
      haikuStates:
        parsed.haikuStates && typeof parsed.haikuStates === "object" ? parsed.haikuStates : {},
      sectionOrder: isValidSectionOrder(parsed.sectionOrder) ? parsed.sectionOrder : SECTION_IDS,
      sectionNotes: sanitizeSectionNotes(parsed.sectionNotes),
      formNote: typeof parsed.formNote === "string" ? parsed.formNote : "",
      showNotes: typeof parsed.showNotes === "boolean" ? parsed.showNotes : DEFAULT_SHOW_NOTES,
      view: parsed.view === "form" ? "form" : DEFAULT_VIEW,
    };
  } catch {
    return null;
  }
};

const buildArcPath = (points) =>
  points.reduce((path, point, index, arr) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }

    const prev = arr[index - 1];
    const prevPrev = arr[index - 2] || prev;
    const next = arr[index + 1] || point;
    const cp1x = prev.x + (point.x - prevPrev.x) / 6;
    const cp1y = prev.y + (point.y - prevPrev.y) / 6;
    const cp2x = point.x - (next.x - prev.x) / 6;
    const cp2y = point.y - (next.y - prev.y) / 6;

    return `${path} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${point.x} ${point.y}`;
  }, "");

const ArcSVG = ({ orderedSections, stateCounts }) => {
  const width = 1200;
  const height = 280;
  const left = 96;
  const right = width - 96;
  const step = orderedSections.length > 1 ? (right - left) / (orderedSections.length - 1) : 0;
  const points = orderedSections.map((section, index) => ({
    x: left + step * index,
    y: SECTION_ENERGY_Y[section.id] || height / 2,
    section,
  }));
  const path = buildArcPath(points);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: "100%", height: "auto", aspectRatio: `${width} / ${height}`, display: "block" }}
    >
      <defs>
        <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          {orderedSections.map((section, index) => (
            <stop
              key={section.id}
              offset={`${orderedSections.length === 1 ? 0 : (index / (orderedSections.length - 1)) * 100}%`}
              stopColor={section.accent}
              stopOpacity={index === orderedSections.length - 1 ? 0.92 : 0.72}
            />
          ))}
        </linearGradient>
        <filter id="arcGlow" x="-10%" y="-25%" width="120%" height="150%">
          <feGaussianBlur stdDeviation="5" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path d={path} fill="none" stroke="rgba(255,255,255,0.045)" strokeWidth="34" strokeLinecap="round" />
      <path d={path} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" strokeLinecap="round" />
      <path d={path} fill="none" stroke="url(#arcGrad)" strokeWidth="4" strokeLinecap="round" strokeDasharray="10 10" filter="url(#arcGlow)" />
      {points.map(({ x, y, section }, index) => {
        const count = stateCounts[section.id];
        return (
          <g key={section.id}>
            <circle cx={x} cy={y} r={count > 0 ? 16 : 10} fill={section.accent} opacity={count > 0 ? 0.94 : 0.36} />
            <circle cx={x} cy={y} r={count > 0 ? 24 : 18} fill="none" stroke={section.accent} strokeOpacity={count > 0 ? 0.34 : 0.14} />
            {count > 0 && (
              <text x={x} y={y + 5} textAnchor="middle" fill="#0d0b09" fontSize="12" fontWeight="bold" fontFamily="monospace">
                {count}
              </text>
            )}
            <text x={x} y={height - 32} textAnchor="middle" fill={section.accent} fontSize="11" fontFamily="monospace" letterSpacing="3" opacity="0.76">
              {getPartLabel(index).toUpperCase()}
            </text>
            <text
              x={x}
              y={height - 12}
              textAnchor="middle"
              fill={section.accent}
              fontSize="13"
              fontFamily="'Cormorant Garamond', Georgia, serif"
              letterSpacing="1.6"
              opacity="0.92"
            >
              {section.title.toUpperCase()}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const HaikuCard = ({ haiku, sectionAccent, accentDim, status, onToggle, showNote }) => {
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
        : "1px solid rgba(255,255,255,0.08)",
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
      {isRejected && <span style={badgeStyle}>X</span>}
      <p style={textStyle}>{haiku.text}</p>
      {showNote && (
        <div
          style={{ marginTop: 8 }}
          onClick={(e) => {
            e.stopPropagation();
            setNoteOpen(!noteOpen);
          }}
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
  const [persistedState] = useState(() => loadPersistedState());
  const [haikuStates, setHaikuStates] = useState(persistedState?.haikuStates ?? {});
  const [sectionOrder, setSectionOrder] = useState(persistedState?.sectionOrder ?? SECTION_IDS);
  const [draggedSectionId, setDraggedSectionId] = useState(null);
  const [dropTargetId, setDropTargetId] = useState(null);
  const [sectionNotes, setSectionNotes] = useState(persistedState?.sectionNotes ?? DEFAULT_SECTION_NOTES);
  const [formNote, setFormNote] = useState(persistedState?.formNote ?? "");
  const [showNotes, setShowNotes] = useState(persistedState?.showNotes ?? DEFAULT_SHOW_NOTES);
  const [view, setView] = useState(persistedState?.view ?? DEFAULT_VIEW);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        haikuStates,
        sectionOrder,
        sectionNotes,
        formNote,
        showNotes,
        view,
      }),
    );
  }, [formNote, haikuStates, sectionNotes, sectionOrder, showNotes, view]);

  const toggleHaiku = useCallback((id) => {
    setHaikuStates((prev) => ({
      ...prev,
      [id]: STATE_CYCLE[prev[id] || "neutral"],
    }));
  }, []);

  const reorderSections = useCallback((draggedId, targetId) => {
    if (!draggedId || !targetId || draggedId === targetId) {
      return;
    }

    setSectionOrder((prev) => {
      const next = prev.filter((id) => id !== draggedId);
      const targetIndex = next.indexOf(targetId);
      next.splice(targetIndex, 0, draggedId);
      return next;
    });
  }, []);

  const handleSectionDrop = useCallback(
    (targetId) => {
      reorderSections(draggedSectionId, targetId);
      setDraggedSectionId(null);
      setDropTargetId(null);
    },
    [draggedSectionId, reorderSections],
  );

  const getStatus = (id) => haikuStates[id] || "neutral";

  const selectedBySection = {};
  SECTION_IDS.forEach((sectionId) => {
    selectedBySection[sectionId] = HAIKU_DATA[sectionId].haikus.filter((haiku) => getStatus(haiku.id) === "selected");
  });

  const stateCounts = {};
  SECTION_IDS.forEach((sectionId) => {
    stateCounts[sectionId] = selectedBySection[sectionId].length;
  });

  const totalSelected = Object.values(stateCounts).reduce((sum, count) => sum + count, 0);

  const orderedSections = sectionOrder.map((sectionId, index) => ({
    ...HAIKU_DATA[sectionId],
    partLabel: getPartLabel(index),
  }));

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
      flexWrap: "wrap",
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
      marginTop: 18,
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
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: 20,
      padding: "0 40px",
      marginTop: 4,
    },
    column: {
      position: "relative",
      minWidth: 0,
    },
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
    notesInput: {
      width: "100%",
      marginTop: 14,
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.06)",
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
    },
    formViewGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: 20,
      padding: "0 40px",
      marginTop: 4,
    },
    formSection: (accent, accentDim, isDragged, isDropTarget) => ({
      padding: "20px",
      background: isDragged ? "rgba(255,255,255,0.035)" : accentDim,
      border: isDropTarget ? `1px solid ${accent}` : `1px solid ${accent}30`,
      borderRadius: 4,
      boxShadow: isDropTarget ? `0 0 0 1px ${accent}40` : "none",
      opacity: isDragged ? 0.55 : 1,
      transform: isDropTarget ? "translateY(-3px)" : "translateY(0)",
      transition: "transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease",
      minWidth: 0,
    }),
    formSectionHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 12,
      cursor: "grab",
      userSelect: "none",
    },
    dragHint: {
      fontSize: 9,
      letterSpacing: "0.18em",
      fontFamily: "monospace",
      color: "#5a5248",
      whiteSpace: "nowrap",
    },
    formSectionLabel: (accent) => ({
      fontSize: 9,
      letterSpacing: "0.25em",
      fontFamily: "monospace",
      color: accent,
      margin: 0,
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
    partNotesGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: 20,
      padding: "0 40px",
      marginTop: 20,
    },
    partNotesPanel: (accent, accentDim) => ({
      padding: "18px 20px",
      background: accentDim,
      border: `1px solid ${accent}30`,
      borderRadius: 4,
      minWidth: 0,
    }),
    partNotesLabel: (accent) => ({
      fontSize: 9,
      letterSpacing: "0.22em",
      fontFamily: "monospace",
      color: accent,
      margin: "0 0 6px",
    }),
    partNotesTitle: {
      fontSize: 15,
      color: "#d6cfbf",
      margin: "0 0 12px",
      letterSpacing: "0.03em",
    },
    formNotesInput: {
      width: "100%",
      background: "rgba(0,0,0,0.18)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 3,
      padding: "10px 12px",
      color: "#8a8278",
      fontSize: 12.5,
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontStyle: "italic",
      resize: "vertical",
      minHeight: 82,
      outline: "none",
      boxSizing: "border-box",
      lineHeight: 1.65,
    },
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
    <p style={{ fontSize: 10, fontFamily: "monospace", letterSpacing: "0.1em", color: "#3a3530", marginTop: 10, marginBottom: 0, padding: "0 40px" }}>
      CLICK CARD {"->"} SELECT · CLICK AGAIN {"->"} REJECT · CLICK AGAIN {"->"} RESET
    </p>
  );

  return (
    <div style={styles.root}>
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

      <div style={styles.formPanel}>
        <p style={styles.arcLabel}>ENERGY ARC — CURRENT SECTION ORDER + SELECTED HAIKU</p>
        <ArcSVG orderedSections={orderedSections} stateCounts={stateCounts} />
        {totalSelected > 0 && (
          <div style={styles.selectedList}>
            {orderedSections.map((section) =>
              selectedBySection[section.id].map((haiku) => (
                <span key={haiku.id} style={styles.selectedChip(section.accent)}>
                  {section.partLabel} · {haiku.text.split("\n")[0]}…
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

      {view === "columns" && (
        <>
          <div style={styles.columnsGrid}>
            {orderedSections.map((section) => (
              <div key={section.id} style={styles.column}>
                <div style={styles.colHeader}>
                  <p style={styles.colLabel(section.accent)}>{section.partLabel} &nbsp;·&nbsp; {section.title.toUpperCase()}</p>
                  <h2 style={styles.colTitle}>{section.subtitle}</h2>
                  <p style={styles.colSubtitle}>&nbsp;</p>
                  <p style={styles.sonicTag(section.accent)}>{section.sonic}</p>
                </div>
                {section.haikus.map((haiku) => (
                  <HaikuCard
                    key={haiku.id}
                    haiku={haiku}
                    sectionAccent={section.accent}
                    accentDim={section.accentDim}
                    status={getStatus(haiku.id)}
                    onToggle={toggleHaiku}
                    showNote={showNotes}
                  />
                ))}
                {showNotes && (
                  <textarea
                    style={styles.notesInput}
                    placeholder={`Compositional notes for ${section.partLabel.toLowerCase()} · ${section.title.toLowerCase()}…`}
                    value={sectionNotes[section.id]}
                    onChange={(e) => setSectionNotes((prev) => ({ ...prev, [section.id]: e.target.value }))}
                  />
                )}
              </div>
            ))}
          </div>
          {hint}
        </>
      )}

      {view === "form" && (
        <>
          <div style={styles.formViewGrid}>
            {orderedSections.map((section) => {
              const selected = selectedBySection[section.id];
              const isDragged = draggedSectionId === section.id;
              const isDropTarget = dropTargetId === section.id && draggedSectionId !== section.id;

              return (
                <div
                  key={section.id}
                  style={styles.formSection(section.accent, section.accentDim, isDragged, isDropTarget)}
                  draggable
                  onDragStart={() => {
                    setDraggedSectionId(section.id);
                    setDropTargetId(section.id);
                  }}
                  onDragEnter={() => {
                    if (draggedSectionId && draggedSectionId !== section.id) {
                      setDropTargetId(section.id);
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (draggedSectionId && draggedSectionId !== section.id) {
                      setDropTargetId(section.id);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleSectionDrop(section.id);
                  }}
                  onDragEnd={() => {
                    setDraggedSectionId(null);
                    setDropTargetId(null);
                  }}
                >
                  <div style={styles.formSectionHeader}>
                    <p style={styles.formSectionLabel(section.accent)}>
                      {section.partLabel} &nbsp;·&nbsp; {section.title.toUpperCase()} &nbsp;·&nbsp; {selected.length} HAIKU
                    </p>
                    <span style={styles.dragHint}>DRAG TO REORDER</span>
                  </div>
                  {selected.length === 0 ? (
                    <p style={styles.emptyState(section.accent)}>NO HAIKU SELECTED</p>
                  ) : (
                    selected.map((haiku, index) => (
                      <div key={haiku.id} style={styles.formHaikuItem(section.accent)}>
                        <p style={{ ...styles.formHaikuText, color: section.accent, fontSize: 9, fontFamily: "monospace", letterSpacing: "0.12em", marginBottom: 4 }}>
                          {String(index + 1).padStart(2, "0")}
                        </p>
                        <p style={styles.formHaikuText}>{haiku.text}</p>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
          <div style={styles.partNotesGrid}>
            {orderedSections.map((section) => (
              <div key={`${section.id}-notes`} style={styles.partNotesPanel(section.accent, section.accentDim)}>
                <p style={styles.partNotesLabel(section.accent)}>
                  {section.partLabel} &nbsp;·&nbsp; {section.title.toUpperCase()}
                </p>
                <p style={styles.partNotesTitle}>Part notes / annotation</p>
                <textarea
                  style={styles.formNotesInput}
                  placeholder={`Compositional notes for ${section.partLabel.toLowerCase()} · ${section.title.toLowerCase()}…`}
                  value={sectionNotes[section.id]}
                  onChange={(e) => setSectionNotes((prev) => ({ ...prev, [section.id]: e.target.value }))}
                />
              </div>
            ))}
          </div>
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
