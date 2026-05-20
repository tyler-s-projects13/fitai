import { useState, useRef, useEffect } from "react";

// ── Storage (localStorage) ────────────────────────────────────────────
function sGet(k) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } }
function sSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
function sDel(k) { try { localStorage.removeItem(k); } catch {} }

// ── Unit conversion helpers ───────────────────────────────────────────
const KG_TO_LBS = 2.20462;
const CM_PER_IN = 2.54;
function toDisplayW(kg, unit) { return unit === "lbs" ? +(kg * KG_TO_LBS).toFixed(1) : +parseFloat(kg).toFixed(1); }
function toKg(val, unit)      { return unit === "lbs" ? +(val / KG_TO_LBS).toFixed(2) : +parseFloat(val).toFixed(2); }
function ftInToCm(ft, inches)  { return Math.round((parseInt(ft || 0) * 12 + parseInt(inches || 0)) * CM_PER_IN); }

// ── Countries with unit systems ───────────────────────────────────────
// system "imperial" → weight: lbs, height: ft + in
// system "metric"   → weight: kg,  height: cm
const COUNTRIES = [
  { code:"US", flag:"🇺🇸", name:"United States",          system:"imperial" },
  { code:"GB", flag:"🇬🇧", name:"United Kingdom",          system:"imperial" },
  { code:"IE", flag:"🇮🇪", name:"Ireland",                 system:"imperial" },
  { code:"MM", flag:"🇲🇲", name:"Myanmar",                 system:"imperial" },
  { code:"LR", flag:"🇱🇷", name:"Liberia",                 system:"imperial" },
  { code:"AF", flag:"🇦🇫", name:"Afghanistan",             system:"metric" },
  { code:"AL", flag:"🇦🇱", name:"Albania",                 system:"metric" },
  { code:"DZ", flag:"🇩🇿", name:"Algeria",                 system:"metric" },
  { code:"AR", flag:"🇦🇷", name:"Argentina",               system:"metric" },
  { code:"AU", flag:"🇦🇺", name:"Australia",               system:"metric" },
  { code:"AT", flag:"🇦🇹", name:"Austria",                 system:"metric" },
  { code:"AZ", flag:"🇦🇿", name:"Azerbaijan",              system:"metric" },
  { code:"BH", flag:"🇧🇭", name:"Bahrain",                 system:"metric" },
  { code:"BD", flag:"🇧🇩", name:"Bangladesh",              system:"metric" },
  { code:"BE", flag:"🇧🇪", name:"Belgium",                 system:"metric" },
  { code:"BO", flag:"🇧🇴", name:"Bolivia",                 system:"metric" },
  { code:"BR", flag:"🇧🇷", name:"Brazil",                  system:"metric" },
  { code:"BG", flag:"🇧🇬", name:"Bulgaria",                system:"metric" },
  { code:"CA", flag:"🇨🇦", name:"Canada",                  system:"metric" },
  { code:"CL", flag:"🇨🇱", name:"Chile",                   system:"metric" },
  { code:"CN", flag:"🇨🇳", name:"China",                   system:"metric" },
  { code:"CO", flag:"🇨🇴", name:"Colombia",                system:"metric" },
  { code:"CR", flag:"🇨🇷", name:"Costa Rica",              system:"metric" },
  { code:"HR", flag:"🇭🇷", name:"Croatia",                 system:"metric" },
  { code:"CZ", flag:"🇨🇿", name:"Czech Republic",          system:"metric" },
  { code:"DK", flag:"🇩🇰", name:"Denmark",                 system:"metric" },
  { code:"DO", flag:"🇩🇴", name:"Dominican Republic",      system:"metric" },
  { code:"EC", flag:"🇪🇨", name:"Ecuador",                 system:"metric" },
  { code:"EG", flag:"🇪🇬", name:"Egypt",                   system:"metric" },
  { code:"ET", flag:"🇪🇹", name:"Ethiopia",                system:"metric" },
  { code:"FI", flag:"🇫🇮", name:"Finland",                 system:"metric" },
  { code:"FR", flag:"🇫🇷", name:"France",                  system:"metric" },
  { code:"GE", flag:"🇬🇪", name:"Georgia",                 system:"metric" },
  { code:"DE", flag:"🇩🇪", name:"Germany",                 system:"metric" },
  { code:"GH", flag:"🇬🇭", name:"Ghana",                   system:"metric" },
  { code:"GR", flag:"🇬🇷", name:"Greece",                  system:"metric" },
  { code:"GT", flag:"🇬🇹", name:"Guatemala",               system:"metric" },
  { code:"HU", flag:"🇭🇺", name:"Hungary",                 system:"metric" },
  { code:"IN", flag:"🇮🇳", name:"India",                   system:"metric" },
  { code:"ID", flag:"🇮🇩", name:"Indonesia",               system:"metric" },
  { code:"IR", flag:"🇮🇷", name:"Iran",                    system:"metric" },
  { code:"IQ", flag:"🇮🇶", name:"Iraq",                    system:"metric" },
  { code:"IL", flag:"🇮🇱", name:"Israel",                  system:"metric" },
  { code:"IT", flag:"🇮🇹", name:"Italy",                   system:"metric" },
  { code:"JP", flag:"🇯🇵", name:"Japan",                   system:"metric" },
  { code:"JO", flag:"🇯🇴", name:"Jordan",                  system:"metric" },
  { code:"KZ", flag:"🇰🇿", name:"Kazakhstan",              system:"metric" },
  { code:"KE", flag:"🇰🇪", name:"Kenya",                   system:"metric" },
  { code:"KW", flag:"🇰🇼", name:"Kuwait",                  system:"metric" },
  { code:"LB", flag:"🇱🇧", name:"Lebanon",                 system:"metric" },
  { code:"MY", flag:"🇲🇾", name:"Malaysia",                system:"metric" },
  { code:"MX", flag:"🇲🇽", name:"Mexico",                  system:"metric" },
  { code:"MA", flag:"🇲🇦", name:"Morocco",                 system:"metric" },
  { code:"NP", flag:"🇳🇵", name:"Nepal",                   system:"metric" },
  { code:"NL", flag:"🇳🇱", name:"Netherlands",             system:"metric" },
  { code:"NZ", flag:"🇳🇿", name:"New Zealand",             system:"metric" },
  { code:"NG", flag:"🇳🇬", name:"Nigeria",                 system:"metric" },
  { code:"NO", flag:"🇳🇴", name:"Norway",                  system:"metric" },
  { code:"PK", flag:"🇵🇰", name:"Pakistan",                system:"metric" },
  { code:"PE", flag:"🇵🇪", name:"Peru",                    system:"metric" },
  { code:"PH", flag:"🇵🇭", name:"Philippines",             system:"metric" },
  { code:"PL", flag:"🇵🇱", name:"Poland",                  system:"metric" },
  { code:"PT", flag:"🇵🇹", name:"Portugal",                system:"metric" },
  { code:"QA", flag:"🇶🇦", name:"Qatar",                   system:"metric" },
  { code:"RO", flag:"🇷🇴", name:"Romania",                 system:"metric" },
  { code:"RU", flag:"🇷🇺", name:"Russia",                  system:"metric" },
  { code:"SA", flag:"🇸🇦", name:"Saudi Arabia",            system:"metric" },
  { code:"SN", flag:"🇸🇳", name:"Senegal",                 system:"metric" },
  { code:"SG", flag:"🇸🇬", name:"Singapore",               system:"metric" },
  { code:"ZA", flag:"🇿🇦", name:"South Africa",            system:"metric" },
  { code:"KR", flag:"🇰🇷", name:"South Korea",             system:"metric" },
  { code:"ES", flag:"🇪🇸", name:"Spain",                   system:"metric" },
  { code:"LK", flag:"🇱🇰", name:"Sri Lanka",               system:"metric" },
  { code:"SE", flag:"🇸🇪", name:"Sweden",                  system:"metric" },
  { code:"CH", flag:"🇨🇭", name:"Switzerland",             system:"metric" },
  { code:"TW", flag:"🇹🇼", name:"Taiwan",                  system:"metric" },
  { code:"TZ", flag:"🇹🇿", name:"Tanzania",                system:"metric" },
  { code:"TH", flag:"🇹🇭", name:"Thailand",                system:"metric" },
  { code:"TN", flag:"🇹🇳", name:"Tunisia",                 system:"metric" },
  { code:"TR", flag:"🇹🇷", name:"Turkey",                  system:"metric" },
  { code:"UA", flag:"🇺🇦", name:"Ukraine",                 system:"metric" },
  { code:"AE", flag:"🇦🇪", name:"United Arab Emirates",    system:"metric" },
  { code:"UZ", flag:"🇺🇿", name:"Uzbekistan",              system:"metric" },
  { code:"VE", flag:"🇻🇪", name:"Venezuela",               system:"metric" },
  { code:"VN", flag:"🇻🇳", name:"Vietnam",                 system:"metric" },
  { code:"YE", flag:"🇾🇪", name:"Yemen",                   system:"metric" },
  { code:"ZW", flag:"🇿🇼", name:"Zimbabwe",                system:"metric" },
];

function getSystem(code) { return COUNTRIES.find(c => c.code === code)?.system || "metric"; }

// ── Image resize helper ───────────────────────────────────────────────
function resizeImg(dataUrl, maxW = 480) {
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => {
      const r = Math.min(1, maxW / img.width);
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * r); c.height = Math.round(img.height * r);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      res(c.toDataURL("image/jpeg", 0.72));
    };
    img.src = dataUrl;
  });
}

// ── Week phase ────────────────────────────────────────────────────────
function weekPhase(w) {
  if (w <= 4)  return { label:"Foundation",           color:"#4A9EFF", note:"Master form and build consistency",      weight:"base weight", sets:0 };
  if (w <= 8)  return { label:"Progressive Overload", color:"#C8F135", note:"Increase load 5% on compound lifts",     weight:"+5%",         sets:1 };
  if (w <= 12) return { label:"Peak Phase",            color:"#FF7A5A", note:"Push intensity — increase load by 10%", weight:"+10%",        sets:1 };
  return              { label:"Advanced",              color:"#D678FF", note:"Periodize and push to new limits",      weight:"+15%",        sets:2 };
}

// ── Grocery list helper ───────────────────────────────────────────────
function buildGroceryList(meals) {
  if (!meals?.length) return [];
  const seen = new Set();
  return meals.flatMap(m => m.items || []).filter(item => {
    const key = item.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20);
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });
}

// ── Weight Chart ──────────────────────────────────────────────────────
function WeightChart({ checkins, unit }) {
  if (checkins.length < 2) return null;
  const A = "#C8F135";
  const weights = checkins.map(c => toDisplayW(c.weight, unit));
  const minW = Math.min(...weights) - 1, maxW = Math.max(...weights) + 1;
  const W = 320, H = 90;
  const pts = weights.map((w, i) => {
    const x = 16 + (i / (weights.length - 1)) * (W - 32);
    const y = H - 12 - ((w - minW) / (maxW - minW || 1)) * (H - 24);
    return [Math.round(x), Math.round(y)];
  });
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display:"block", margin:"0.5rem 0 0.25rem" }}>
      <polyline points={pts.map(p => p.join(",")).join(" ")} fill="none" stroke={A} strokeWidth="2" strokeLinejoin="round" />
      {pts.map(([x,y],i) => <circle key={i} cx={x} cy={y} r="3" fill={A} />)}
      <text x="16" y={H} fill="#555" fontSize="9">{checkins[0].date}</text>
      <text x={W-16} y={H} fill="#555" fontSize="9" textAnchor="end">{checkins[checkins.length-1].date}</text>
      <text x={pts[pts.length-1][0]} y={pts[pts.length-1][1]-8} fill={A} fontSize="10" textAnchor="middle" fontWeight="700">
        {toDisplayW(checkins[checkins.length-1].weight, unit)}{unit}
      </text>
    </svg>
  );
}

// ── Constants ─────────────────────────────────────────────────────────
const A = "#C8F135";
const GOALS_LIST = [
  { id:"lean",      label:"Get Lean",     desc:"Burn fat, stay toned",  emoji:"⚡" },
  { id:"bulk",      label:"Bulk Up",      desc:"Gain mass and size",    emoji:"🏋️" },
  { id:"muscle",    label:"Build Muscle", desc:"Sculpt and define",     emoji:"💪" },
  { id:"endurance", label:"Endurance",    desc:"Cardio & stamina",      emoji:"🏃" },
];
const ACTIVITY = [
  { id:"sedentary", label:"Sedentary",   desc:"Desk job, minimal movement" },
  { id:"light",     label:"Light",       desc:"1–2 workouts/week" },
  { id:"moderate",  label:"Moderate",    desc:"3–5 workouts/week" },
  { id:"active",    label:"Very Active", desc:"Daily training" },
];
const LOAD_STEPS = [
  "Analyzing your body composition",
  "Calculating optimal training zones",
  "Designing your workout split",
  "Building your nutrition blueprint",
  "Finalizing your personalized plan",
];
const SCHEMA = `{"bodyAnalysis":"string","weeklyWorkout":[{"day":"Monday","focus":"Chest","duration":"50 mins","exercises":[{"name":"Bench Press","sets":4,"reps":"8-10","rest":"90s","notes":"tip"}]}],"mealPlan":{"dailyCalories":2400,"macros":{"protein":"180g","carbs":"250g","fats":"70g"},"meals":[{"meal":"Breakfast","time":"7:30 AM","items":["item"],"calories":520}]},"tips":["tip1","tip2"]}`;

// ── Shared styles ─────────────────────────────────────────────────────
const inp  = { width:"100%", background:"#1A1D1E", border:"1.5px solid #2A2D30", borderRadius:10, padding:"0.75rem 1rem", color:"#F0F2F4", fontSize:"0.95rem", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box" };
const lbl  = { display:"block", fontSize:"0.72rem", fontWeight:700, letterSpacing:"0.09em", textTransform:"uppercase", color:"#8A8F95", marginBottom:7 };
const btnP = { background:A, color:"#0C0E10", border:"none", padding:"0.95rem 1.75rem", borderRadius:12, fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:"0.95rem", cursor:"pointer", display:"inline-flex", alignItems:"center", gap:8 };
const btnS = { background:"transparent", color:"#F0F2F4", border:"1.5px solid #2A2D30", padding:"0.85rem 1.4rem", borderRadius:12, fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:"0.9rem", cursor:"pointer", display:"inline-flex", alignItems:"center", gap:8 };
const card = { background:"#1A1D1E", border:"1.5px solid #2A2D30", borderRadius:14, overflow:"hidden" };

const Tag  = ({ children, color="#1C2010", text=A }) => (
  <span style={{ background:color, color:text, fontSize:"0.7rem", fontWeight:700, padding:"3px 9px", borderRadius:20, whiteSpace:"nowrap" }}>{children}</span>
);
const SLbl = ({ children }) => (
  <div style={{ fontSize:"0.72rem", fontWeight:700, letterSpacing:"0.09em", textTransform:"uppercase", color:"#8A8F95", marginBottom:8 }}>{children}</div>
);

// ── App ───────────────────────────────────────────────────────────────
export default function App() {
  const [step,       setStep]       = useState(0);
  const [photo,      setPhoto]      = useState(null);
  const [photoB64,   setPhotoB64]   = useState(null);
  const [photoMime,  setPhotoMime]  = useState("image/jpeg");
  const [lStep,      setLStep]      = useState(0);
  const [goals,      setGoals]      = useState({
    age:"", gender:"male",
    height:"",    // cm — metric mode
    heightFt:"",  // feet — imperial mode
    heightIn:"",  // inches — imperial mode
    weight:"", targetWeight:"",
    fitnessGoal:"lean", activityLevel:"moderate",
    dietaryPrefs:"", timeframe:"12",
  });
  const [plan,       setPlan]       = useState(null);
  const [tab,        setTab]        = useState("workout");
  const [openDay,    setOpenDay]    = useState(0);
  const [error,      setError]      = useState(null);
  const [week,       setWeek]       = useState(1);
  const [progPhotos, setProgPhotos] = useState([]);
  const [checkins,   setCheckins]   = useState([]);
  const [newCI,      setNewCI]      = useState({ weight:"", note:"" });
  const [adjusting,  setAdjusting]  = useState(false);
  const [country,    setCountry]    = useState("US");
  const [unit,       setUnit]       = useState("lbs");      // "kg" | "lbs"
  const [hSys,       setHSys]       = useState("imperial"); // "metric" | "imperial"
  const [doneExs,    setDoneExs]    = useState({});
  const [copied,     setCopied]     = useState(false);
  const fileRef = useRef(null);
  const progRef = useRef(null);

  // ── Load persisted state ──────────────────────────────────────────
  useEffect(() => {
    const p  = sGet("fa:plan");    if (p)  { setPlan(p); setStep(4); }
    const w  = sGet("fa:week");    if (w)  setWeek(w);
    const pp = sGet("fa:photos");  if (pp) setProgPhotos(pp);
    const ci = sGet("fa:checkins");if (ci) setCheckins(ci);
    const g  = sGet("fa:goals");   if (g)  setGoals(prev => ({ ...prev, ...g }));
    const u  = sGet("fa:unit");    if (u)  setUnit(u);
    const hs = sGet("fa:hsys");    if (hs) setHSys(hs);
    const co = sGet("fa:country"); if (co) setCountry(co);
    const de = sGet("fa:done");    if (de) setDoneExs(de);
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  // ── Country change → auto-switch units ───────────────────────────
  const handleCountry = (code) => {
    const sys     = getSystem(code);
    const newUnit = sys === "imperial" ? "lbs" : "kg";
    const newHSys = sys === "imperial" ? "imperial" : "metric";
    setCountry(code); sSet("fa:country", code);
    setUnit(newUnit); sSet("fa:unit", newUnit);
    setHSys(newHSys); sSet("fa:hsys", newHSys);
  };

  // Manual overrides still available
  const toggleWeightUnit = () => { const n = unit === "kg" ? "lbs" : "kg"; setUnit(n); sSet("fa:unit", n); };
  const toggleHeightSys  = () => { const n = hSys === "metric" ? "imperial" : "metric"; setHSys(n); sSet("fa:hsys", n); };

  const setG = (k, v) => setGoals(g => ({ ...g, [k]: v }));

  // Compute height in cm for the API (always stored/sent in cm)
  const heightToCm = () => {
    if (hSys === "imperial") {
      const cm = ftInToCm(goals.heightFt, goals.heightIn);
      return cm > 0 ? cm : null;
    }
    return goals.height ? parseFloat(goals.height) : null;
  };

  // ── File handlers ─────────────────────────────────────────────────
  const handlePhoto = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = async (ev) => {
      const d = await resizeImg(ev.target.result, 900);
      setPhoto(d); setPhotoB64(d.split(",")[1]); setPhotoMime("image/jpeg");
    };
    r.readAsDataURL(f);
  };

  const handleProgPhoto = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = async (ev) => {
      const d = await resizeImg(ev.target.result, 480);
      const entry = { id:Date.now(), dataUrl:d, label:`Week ${week}`, date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) };
      const updated = [...progPhotos.slice(-11), entry];
      setProgPhotos(updated); sSet("fa:photos", updated);
    };
    r.readAsDataURL(f);
  };

  const delProgPhoto = (id) => { const u = progPhotos.filter(p => p.id !== id); setProgPhotos(u); sSet("fa:photos", u); };

  const addCheckin = () => {
    if (!newCI.weight) return;
    const weightKg = toKg(parseFloat(newCI.weight), unit);
    const entry = { id:Date.now(), date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"}), weight:weightKg, note:newCI.note, week };
    const updated = [...checkins, entry];
    setCheckins(updated); sSet("fa:checkins", updated); setNewCI({ weight:"", note:"" });
  };

  const delCheckin = (id) => { const u = checkins.filter(c => c.id !== id); setCheckins(u); sSet("fa:checkins", u); };

  const completeWeek = () => {
    const total = parseInt(goals.timeframe) || 12;
    if (week >= total) return;
    const next = week + 1;
    setWeek(next); sSet("fa:week", next);
    setDoneExs({}); sDel("fa:done");
  };

  const toggleExercise = (key) => {
    const u = { ...doneExs };
    if (u[key]) { delete u[key]; } else { u[key] = true; }
    setDoneExs(u); sSet("fa:done", u);
  };

  const animateLoad = () => {
    let i = 0; setLStep(0);
    const tick = () => { if (i < LOAD_STEPS.length - 1) { i++; setLStep(i); setTimeout(tick, 750 + Math.random() * 450); } };
    setTimeout(tick, 700);
  };

  // ── API call ──────────────────────────────────────────────────────
  const callAPI = async (messages, sys) => {
    let res;
    try {
      res = await fetch("/api/chat", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ model:"claude-sonnet-4-5", max_tokens:4000, system:sys, messages }),
      });
    } catch { throw new Error("Network error — check your internet connection and try again."); }
    let data;
    try { data = await res.json(); } catch { throw new Error(`Server error (${res.status}). Please try again.`); }
    if (!res.ok) {
      if (res.status === 401) throw new Error("Invalid API key. Check ANTHROPIC_API_KEY in Vercel.");
      if (res.status === 429) throw new Error("Rate limit reached. Wait a moment and try again.");
      if (res.status === 500) throw new Error("API key may not be set. Add ANTHROPIC_API_KEY to Vercel environment variables.");
      throw new Error(`API error (${res.status}): ${data?.error || "Unknown"}`);
    }
    const raw = data.content?.find(b => b.type === "text")?.text || "";
    try { return JSON.parse(raw.replace(/```json[\s\S]*?```|```/g,"").trim()); }
    catch { throw new Error("Parse error: " + raw.slice(0, 200)); }
  };

  const generate = async () => {
    setStep(3); setError(null); animateLoad();
    sSet("fa:goals", goals); sDel("fa:plan");
    try {
      const hCm = heightToCm();
      const wKg = goals.weight       ? toKg(parseFloat(goals.weight), unit)       : null;
      const tKg = goals.targetWeight ? toKg(parseFloat(goals.targetWeight), unit) : null;
      const countryName = COUNTRIES.find(c => c.code === country)?.name || "";
      const imgBlock = photoB64 ? [{ type:"image", source:{ type:"base64", media_type:photoMime, data:photoB64 } }] : [];
      const parsed = await callAPI(
        [{ role:"user", content:[...imgBlock, { type:"text", text:`${photoB64?"Analyze the body in this photo and ":""}create a personalized 7-day fitness plan.\nCountry:${countryName} Age:${goals.age||"?"} Gender:${goals.gender} Height:${hCm?hCm+"cm":"?"} Weight:${wKg?wKg+"kg":"?"} Target:${tKg?tKg+"kg":"?"} Goal:${goals.fitnessGoal} Activity:${goals.activityLevel} Timeframe:${goals.timeframe}wks Diet:${goals.dietaryPrefs||"none"}\nReturn ONLY valid JSON (no markdown):\n${SCHEMA}` }] }],
        "You are an elite fitness coach and nutritionist. Return only valid JSON, no markdown, no backticks, no extra text before or after the JSON."
      );
      setPlan(parsed); sSet("fa:plan", parsed); setStep(4); setTab("workout"); setOpenDay(0);
    } catch (err) { setError(err.message || "Generation failed. Please try again."); setStep(2); }
  };

  const adjustPlan = async () => {
    if (!checkins.length) return;
    setAdjusting(true); setStep(3); setError(null); animateLoad();
    const latest = checkins[checkins.length-1];
    const delta  = checkins.length > 1 ? (latest.weight - checkins[0].weight).toFixed(1) : 0;
    try {
      const imgBlocks = progPhotos.length >= 2
        ? [{ type:"image", source:{ type:"base64", media_type:"image/jpeg", data:progPhotos[0].dataUrl.split(",")[1] } },
           { type:"image", source:{ type:"base64", media_type:"image/jpeg", data:progPhotos[progPhotos.length-1].dataUrl.split(",")[1] } }]
        : [];
      const parsed = await callAPI(
        [{ role:"user", content:[...imgBlocks, { type:"text", text:`Adjust this plan based on real progress.\nCurrent week:${week} Weight change:${delta>0?"+":""}${delta}kg Latest:${latest.weight}kg Goal:${goals.fitnessGoal} Notes:"${latest.note||"none"}"\n${imgBlocks.length>=2?"First image=starting photo, second=current.":""}\nReturn ONLY valid JSON:\n${SCHEMA}` }] }],
        "You are an elite fitness coach. Adapt plans from real-world progress. Return only valid JSON."
      );
      setPlan(parsed); sSet("fa:plan", parsed); setStep(4); setTab("workout"); setOpenDay(0); setAdjusting(false);
    } catch (err) { setError(err.message || "Adjustment failed. Please try again."); setStep(4); setAdjusting(false); }
  };

  const copyPlan = () => {
    if (!plan) return;
    let t = "=== MY FITAI PLAN ===\n\n";
    if (plan.bodyAnalysis) t += `BODY ANALYSIS:\n${plan.bodyAnalysis}\n\n`;
    t += "WORKOUT PLAN:\n";
    plan.weeklyWorkout?.forEach(d => {
      t += `\n${d.day} — ${d.focus} (${d.duration})\n`;
      if (!d.exercises?.length) { t += "  • Rest day\n"; return; }
      d.exercises.forEach(ex => t += `  • ${ex.name}: ${ex.sets}×${ex.reps} | Rest: ${ex.rest}${ex.notes?` | ${ex.notes}`:""}\n`);
    });
    const mp = plan.mealPlan;
    if (mp) {
      t += `\nNUTRITION:\nDaily: ${mp.dailyCalories} kcal | P:${mp.macros?.protein} C:${mp.macros?.carbs} F:${mp.macros?.fats}\n`;
      mp.meals?.forEach(m => { t += `\n${m.meal} (${m.time}) — ${m.calories} kcal\n`; m.items?.forEach(i => t += `  • ${i}\n`); });
    }
    navigator.clipboard.writeText(t).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }).catch(() => {});
  };

  // ── Derived ───────────────────────────────────────────────────────
  const phase        = weekPhase(week);
  const totalWeeks   = parseInt(goals.timeframe) || 12;
  const weekPct      = Math.min(100, Math.round(((week-1)/totalWeeks)*100));
  const groceries    = buildGroceryList(plan?.mealPlan?.meals);
  const planComplete = week >= totalWeeks;
  const selCountry   = COUNTRIES.find(c => c.code === country);
  const dayProgress  = (di) => {
    const exs = plan?.weeklyWorkout?.[di]?.exercises || [];
    return { done:exs.filter((_,ei) => doneExs[`${di}-${ei}`]).length, total:exs.length };
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:"#0C0E10", color:"#F0F2F4", fontFamily:"'DM Sans',sans-serif", paddingBottom:"5rem" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      {/* Header */}
      <div style={{ padding:"1.5rem 1.5rem 0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.4rem", letterSpacing:"-0.03em", color:A }}>
          FIT<span style={{ color:"#F0F2F4" }}>AI</span>
        </span>
        {step > 0 && step < 4 && (
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            {[1,2,3].map(n => <div key={n} style={{ width:step===n?24:8, height:8, borderRadius:4, transition:"all 0.3s", background:step>n?A:step===n?A:"#2A2D30" }} />)}
          </div>
        )}
        {step === 4 && (
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {selCountry && <span style={{ fontSize:"1.1rem" }} title={selCountry.name}>{selCountry.flag}</span>}
            <button onClick={toggleWeightUnit} title="Toggle weight unit" style={{ background:"#1A1D1E", border:"1px solid #2A2D30", borderRadius:20, padding:"3px 10px", fontSize:"0.72rem", fontWeight:700, color:"#8A8F95", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>{unit}</button>
            <Tag color="#1C2010">{phase.label}</Tag>
            <span style={{ color:"#8A8F95", fontSize:"0.8rem" }}>Wk {week}</span>
          </div>
        )}
      </div>

      {/* Welcome */}
      {step === 0 && (
        <div style={{ padding:"4rem 1.5rem 2rem", maxWidth:500 }}>
          <span style={{ display:"inline-block", background:"#1C2010", color:A, fontSize:"0.72rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", padding:"5px 12px", borderRadius:20, marginBottom:"1.5rem" }}>AI-Powered Fitness</span>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(2.2rem,7vw,3.4rem)", lineHeight:1.08, letterSpacing:"-0.04em", margin:"0 0 1.2rem" }}>
            Your body.<br />Your <span style={{ color:A }}>plan.</span><br />Zero guesswork.
          </h1>
          <p style={{ color:"#8A8F95", fontSize:"1rem", lineHeight:1.65, margin:"0 0 1.25rem", maxWidth:400 }}>
            Upload a photo, share your goals, and get a precision workout and meal plan. Track progress week-by-week and let AI auto-adjust as you improve.
          </p>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", margin:"0 0 2rem" }}>
            {["📸 Body photo analysis","📅 Week-by-week progression","▶ Exercise demo videos","✓ Check-in & plan adjustment"].map(f => (
              <span key={f} style={{ background:"#1A1D1E", border:"1px solid #2A2D30", borderRadius:20, padding:"5px 11px", fontSize:"0.76rem", color:"#8A8F95" }}>{f}</span>
            ))}
          </div>
          <button style={btnP} onClick={() => setStep(1)}>Build My Plan →</button>
        </div>
      )}

      {/* Photo */}
      {step === 1 && (
        <div style={{ padding:"2rem 1.5rem 0", maxWidth:540 }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.7rem", letterSpacing:"-0.03em", margin:"0 0 0.4rem" }}>Your photo</h2>
          <p style={{ color:"#8A8F95", fontSize:"0.9rem", margin:"0 0 1.75rem" }}>A full-body photo helps AI analyze your composition. Optional but recommended.</p>
          <div style={{ border:`2px dashed ${photo?A:"#2A2D30"}`, borderRadius:16, padding:"2.5rem 1.5rem", textAlign:"center", cursor:"pointer" }} onClick={() => fileRef.current?.click()}>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} />
            {photo ? (
              <>
                <img src={photo} alt="preview" style={{ width:"100%", borderRadius:12, maxHeight:320, objectFit:"cover", display:"block" }} />
                <div style={{ marginTop:12, color:A, fontSize:"0.82rem", fontWeight:600 }}>✓ Photo added — tap to change</div>
              </>
            ) : (
              <>
                <div style={{ fontSize:"2.5rem", marginBottom:"0.75rem" }}>📸</div>
                <div style={{ fontWeight:700, marginBottom:6 }}>Upload or take a photo</div>
                <div style={{ color:"#8A8F95", fontSize:"0.88rem" }}>Tap to select from camera or gallery</div>
                <div style={{ color:"#555", fontSize:"0.76rem", marginTop:5 }}>Full-body preferred · JPG PNG HEIC</div>
              </>
            )}
          </div>
          <div style={{ display:"flex", gap:10, marginTop:"1.75rem", flexWrap:"wrap" }}>
            <button style={btnP} onClick={() => setStep(2)}>{photo?"Continue →":"Skip, no photo →"}</button>
          </div>
        </div>
      )}

      {/* Goals */}
      {step === 2 && (
        <div style={{ padding:"2rem 1.5rem 0", maxWidth:560 }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.7rem", letterSpacing:"-0.03em", margin:"0 0 0.4rem" }}>Your goals</h2>
          <p style={{ color:"#8A8F95", fontSize:"0.9rem", margin:"0 0 1.5rem" }}>Tell us about yourself so we can build the right plan.</p>
          {error && <div style={{ background:"#2A1010", border:"1px solid #5A2020", borderRadius:10, padding:"0.9rem 1.1rem", marginBottom:"1rem", color:"#F07070", fontSize:"0.875rem" }}>{error}</div>}

          {/* ── Country + unit selector ── */}
          <div style={{ ...card, padding:"1rem 1.1rem", marginBottom:"1.5rem", border:`1.5px solid ${A}33` }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
              <div style={{ fontSize:"0.72rem", fontWeight:700, letterSpacing:"0.09em", textTransform:"uppercase", color:A }}>📍 Country / Units</div>
              <div style={{ display:"flex", gap:6 }}>
                <span style={{ background:"#0C0E10", border:`1px solid ${A}44`, borderRadius:20, padding:"2px 9px", fontSize:"0.69rem", fontWeight:700, color:A }}>
                  {hSys === "imperial" ? "ft / in" : "cm"}
                </span>
                <span style={{ background:"#0C0E10", border:`1px solid ${A}44`, borderRadius:20, padding:"2px 9px", fontSize:"0.69rem", fontWeight:700, color:A }}>
                  {unit}
                </span>
              </div>
            </div>

            <select
              style={{ ...inp, appearance:"none", cursor:"pointer", marginBottom:10 }}
              value={country}
              onChange={e => handleCountry(e.target.value)}
            >
              <optgroup label="── Imperial (lbs · ft / in) ──">
                {COUNTRIES.filter(c => c.system === "imperial").map(c => (
                  <option key={c.code} value={c.code}>{c.flag}  {c.name}</option>
                ))}
              </optgroup>
              <optgroup label="── Metric (kg · cm) ──">
                {COUNTRIES.filter(c => c.system === "metric").sort((a,b) => a.name.localeCompare(b.name)).map(c => (
                  <option key={c.code} value={c.code}>{c.flag}  {c.name}</option>
                ))}
              </optgroup>
            </select>

            <div style={{ display:"flex", gap:8 }}>
              <button onClick={toggleHeightSys} style={{ background:"#0C0E10", border:"1px solid #2A2D30", borderRadius:8, padding:"5px 12px", fontSize:"0.73rem", fontWeight:600, color:"#8A8F95", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                Height: {hSys === "imperial" ? "ft/in" : "cm"} ⇄
              </button>
              <button onClick={toggleWeightUnit} style={{ background:"#0C0E10", border:"1px solid #2A2D30", borderRadius:8, padding:"5px 12px", fontSize:"0.73rem", fontWeight:600, color:"#8A8F95", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                Weight: {unit} ⇄
              </button>
            </div>
          </div>

          <SLbl>Primary fitness goal</SLbl>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:"1.5rem" }}>
            {GOALS_LIST.map(g => (
              <div key={g.id} style={{ background:goals.fitnessGoal===g.id?"#1C2010":"#1A1D1E", border:`1.5px solid ${goals.fitnessGoal===g.id?A:"#2A2D30"}`, borderRadius:12, padding:"1rem", cursor:"pointer", transition:"all 0.2s" }} onClick={() => setG("fitnessGoal",g.id)}>
                <div style={{ fontSize:"1.4rem", marginBottom:6 }}>{g.emoji}</div>
                <div style={{ fontWeight:700, fontSize:"0.9rem" }}>{g.label}</div>
                <div style={{ fontSize:"0.76rem", color:"#8A8F95", marginTop:2 }}>{g.desc}</div>
              </div>
            ))}
          </div>

          <SLbl>Activity level</SLbl>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:"1.5rem" }}>
            {ACTIVITY.map(a => (
              <div key={a.id} style={{ background:goals.activityLevel===a.id?"#1C2010":"#1A1D1E", border:`1.5px solid ${goals.activityLevel===a.id?A:"#2A2D30"}`, borderRadius:10, padding:"0.75rem 0.9rem", cursor:"pointer", transition:"all 0.2s" }} onClick={() => setG("activityLevel",a.id)}>
                <div style={{ fontWeight:600, fontSize:"0.85rem" }}>{a.label}</div>
                <div style={{ fontSize:"0.74rem", color:"#8A8F95", marginTop:2 }}>{a.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:"1.25rem" }}>
            <div>
              <div style={lbl}>Gender</div>
              <select style={{ ...inp, appearance:"none" }} value={goals.gender} onChange={e => setG("gender",e.target.value)}>
                <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
              </select>
            </div>
            <div><div style={lbl}>Age</div><input style={inp} type="number" placeholder="e.g. 28" value={goals.age} onChange={e => setG("age",e.target.value)} /></div>
          </div>

          {/* Height — cm or ft+in depending on hSys */}
          <div style={{ marginBottom:"1.25rem" }}>
            <div style={lbl}>Height ({hSys === "imperial" ? "ft / in" : "cm"})</div>
            {hSys === "imperial" ? (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <input style={inp} type="number" placeholder="ft  (e.g. 5)"  min="3" max="8"
                  value={goals.heightFt} onChange={e => setG("heightFt", e.target.value)} />
                <input style={inp} type="number" placeholder="in  (e.g. 11)" min="0" max="11"
                  value={goals.heightIn} onChange={e => setG("heightIn", e.target.value)} />
              </div>
            ) : (
              <input style={inp} type="number" placeholder="e.g. 175" value={goals.height} onChange={e => setG("height",e.target.value)} />
            )}
          </div>

          {/* Weight — label shows current unit */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:"1.25rem" }}>
            <div>
              <div style={lbl}>Current weight ({unit})</div>
              <input style={inp} type="number" placeholder={unit==="lbs"?"e.g. 176":"e.g. 80"} value={goals.weight} onChange={e => setG("weight",e.target.value)} />
            </div>
            <div>
              <div style={lbl}>Target weight ({unit})</div>
              <input style={inp} type="number" placeholder={unit==="lbs"?"e.g. 158":"e.g. 72"} value={goals.targetWeight} onChange={e => setG("targetWeight",e.target.value)} />
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:"1.25rem" }}>
            <div><div style={lbl}>Timeframe (weeks)</div><input style={inp} type="number" placeholder="e.g. 12" value={goals.timeframe} onChange={e => setG("timeframe",e.target.value)} /></div>
            <div><div style={lbl}>Diet / restrictions</div><input style={inp} type="text" placeholder="e.g. vegan, keto…" value={goals.dietaryPrefs} onChange={e => setG("dietaryPrefs",e.target.value)} /></div>
          </div>

          <div style={{ display:"flex", gap:10, marginTop:"2rem", flexWrap:"wrap" }}>
            <button style={btnP} onClick={generate}>Generate My Plan →</button>
            <button style={btnS} onClick={() => setStep(1)}>← Back</button>
          </div>
        </div>
      )}

      {/* Loading */}
      {step === 3 && (
        <div style={{ padding:"5rem 1.5rem 2rem", maxWidth:480 }}>
          <div style={{ width:32, height:32, border:"3px solid #2A2D30", borderTop:`3px solid ${A}`, borderRadius:"50%", animation:"spin 0.8s linear infinite", marginBottom:"2rem" }} />
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"2rem", letterSpacing:"-0.03em", margin:"0 0 0.5rem" }}>{adjusting?"Adjusting your plan":"Building your plan"}</h2>
          <p style={{ color:"#8A8F95", fontSize:"0.9rem", margin:"0 0 3rem" }}>{adjusting?"Analyzing your progress to refine your program…":"AI is crafting a precision plan for your body and goals…"}</p>
          {LOAD_STEPS.map((ls,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"0.85rem 1rem", background:i===lStep?"#1A1D1E":"transparent", borderRadius:10, marginBottom:4, transition:"all 0.4s" }}>
              <div style={{ width:10, height:10, borderRadius:"50%", flexShrink:0, background:i<=lStep?A:"#2A2D30", boxShadow:i===lStep?`0 0 10px ${A}`:"none" }} />
              <span style={{ fontSize:"0.9rem", color:i<=lStep?"#F0F2F4":"#555" }}>{ls}</span>
              {i < lStep  && <span style={{ marginLeft:"auto", color:A, fontSize:"0.8rem" }}>✓</span>}
              {i === lStep && <span style={{ marginLeft:"auto", color:A, fontSize:"0.8rem", animation:"pulse 1.2s infinite" }}>…</span>}
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {step === 4 && plan && (
        <div style={{ padding:"2rem 1.5rem 0", maxWidth:560, animation:"fadeIn 0.4s ease" }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", margin:"0 0 0.35rem" }}>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.7rem", letterSpacing:"-0.03em", margin:0 }}>Your plan</h2>
            <button onClick={copyPlan} style={{ background:copied?"#1C2010":"#1A1D1E", border:`1px solid ${copied?A:"#2A2D30"}`, borderRadius:8, padding:"6px 12px", fontSize:"0.75rem", fontWeight:600, color:copied?A:"#8A8F95", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s", flexShrink:0 }}>
              {copied?"✓ Copied!":"📋 Copy"}
            </button>
          </div>
          <p style={{ color:"#8A8F95", fontSize:"0.85rem", margin:"0 0 1.25rem" }}>Personalized for your body & goals · Saved to this device</p>

          {plan.bodyAnalysis && (
            <div style={{ ...card, padding:"1.1rem 1.25rem", marginBottom:"1.25rem" }}>
              <div style={{ fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:A, marginBottom:8 }}>Body Analysis</div>
              <p style={{ color:"#B0B5BC", fontSize:"0.9rem", lineHeight:1.7 }}>{plan.bodyAnalysis}</p>
            </div>
          )}

          {/* Tab strip */}
          <div style={{ display:"flex", gap:3, background:"#1A1D1E", padding:4, borderRadius:12, marginBottom:"1.5rem" }}>
            {[["workout","💪","Workout"],["meal","🥗","Meals"],["progress","📷","Progress"],["checkin","📊","Check-in"],["tips","💡","Tips"]].map(([id,icon,label]) => (
              <button key={id} style={{ flex:1, padding:"0.55rem 2px", borderRadius:9, border:"none", cursor:"pointer", background:tab===id?A:"transparent", color:tab===id?"#0C0E10":"#8A8F95", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:"0.62rem", transition:"all 0.2s", lineHeight:1.4, display:"flex", flexDirection:"column", alignItems:"center", gap:1 }} onClick={() => setTab(id)}>
                <span style={{ fontSize:"0.85rem" }}>{icon}</span><span>{label}</span>
              </button>
            ))}
          </div>

          {/* Workout tab */}
          {tab === "workout" && (
            <>
              <div style={{ background:"#141617", border:`1px solid ${phase.color}33`, borderRadius:12, padding:"0.9rem 1.1rem", marginBottom:"1.25rem" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                  <div>
                    <span style={{ fontWeight:700, fontSize:"0.9rem" }}>Week {week}</span>
                    <span style={{ margin:"0 8px", color:"#333" }}>·</span>
                    <span style={{ fontSize:"0.82rem", color:phase.color, fontWeight:600 }}>{phase.label}</span>
                  </div>
                  <button style={{ background:planComplete?"#1A1D1E":A, color:planComplete?"#555":"#0C0E10", border:planComplete?"1px solid #2A2D30":"none", padding:"5px 12px", borderRadius:20, fontSize:"0.74rem", fontWeight:700, cursor:planComplete?"not-allowed":"pointer" }} onClick={completeWeek} disabled={planComplete}>
                    {planComplete?"🎉 Plan Complete!":"Mark Complete →"}
                  </button>
                </div>
                <div style={{ fontSize:"0.78rem", color:"#8A8F95", marginBottom:8 }}>{phase.note}</div>
                <div style={{ background:"#0C0E10", borderRadius:6, height:5, overflow:"hidden" }}>
                  <div style={{ width:`${weekPct}%`, height:"100%", background:phase.color, borderRadius:6, transition:"width 0.6s" }} />
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:4, fontSize:"0.71rem", color:"#555" }}>
                  <span>Week 1</span><span>{weekPct}% complete</span><span>Week {totalWeeks}</span>
                </div>
              </div>

              {plan.weeklyWorkout?.map((day,di) => {
                const isRest = !day.exercises?.length;
                const { done, total } = dayProgress(di);
                const allDone = total > 0 && done === total;
                return (
                  <div key={di} style={{ ...card, marginBottom:"0.65rem", border:`1.5px solid ${allDone?A+"55":"#2A2D30"}` }}>
                    <div style={{ padding:"0.9rem 1.1rem", display:"flex", alignItems:"center", justifyContent:"space-between", cursor:isRest?"default":"pointer" }} onClick={() => !isRest && setOpenDay(openDay===di?-1:di)}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontWeight:700, fontSize:"0.9rem" }}>{day.day}</span>
                        {!isRest && total > 0 && (
                          <span style={{ fontSize:"0.7rem", fontWeight:700, color:allDone?A:"#555", background:allDone?"#1C2010":"#0C0E10", border:`1px solid ${allDone?A+"44":"#2A2D30"}`, borderRadius:20, padding:"1px 7px" }}>{done}/{total}</span>
                        )}
                      </div>
                      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                        <Tag color={isRest?"#161819":"#1C2010"} text={isRest?"#555":A}>{isRest?"Rest":day.focus}</Tag>
                        {!isRest && <span style={{ color:"#555", fontSize:"0.8rem" }}>{day.duration}</span>}
                        {!isRest && <span style={{ color:"#555", fontSize:"0.85rem" }}>{openDay===di?"▲":"▼"}</span>}
                      </div>
                    </div>
                    {isRest && <div style={{ padding:"0 1.1rem 0.85rem", color:"#555", fontSize:"0.82rem" }}>Recovery day · stretch, foam roll, or light walk 🧘</div>}
                    {!isRest && openDay === di && (
                      <div style={{ borderTop:"1px solid #1F2224", padding:"0.75rem 1.1rem 1rem" }}>
                        {week > 4 && (
                          <div style={{ background:"#141617", border:`1px solid ${phase.color}44`, borderRadius:8, padding:"6px 10px", marginBottom:10, fontSize:"0.74rem", color:phase.color }}>
                            {phase.label}: target <strong>{phase.weight}</strong> more on compounds{phase.sets>0?` · +${phase.sets} set`:""}
                          </div>
                        )}
                        {day.exercises.map((ex,ei) => {
                          const key = `${di}-${ei}`;
                          const done = !!doneExs[key];
                          return (
                            <div key={ei} style={{ display:"grid", gridTemplateColumns:"22px 1fr auto", alignItems:"start", gap:8, padding:"0.65rem 0", borderBottom:ei<day.exercises.length-1?"1px solid #1F2224":"none", opacity:done?0.45:1, transition:"opacity 0.2s" }}>
                              <button onClick={() => toggleExercise(key)} style={{ width:20, height:20, borderRadius:5, border:`2px solid ${done?A:"#2A2D30"}`, background:done?A:"transparent", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:3, transition:"all 0.15s" }}>
                                {done && <span style={{ color:"#0C0E10", fontSize:"0.6rem", fontWeight:900 }}>✓</span>}
                              </button>
                              <div>
                                <div style={{ fontWeight:600, fontSize:"0.88rem", textDecoration:done?"line-through":"none" }}>{ex.name}</div>
                                {ex.notes && <div style={{ color:"#8A8F95", fontSize:"0.76rem", marginTop:3 }}>{ex.notes}</div>}
                              </div>
                              <div style={{ display:"flex", gap:5, alignItems:"center", flexWrap:"wrap", justifyContent:"flex-end" }}>
                                {ex.sets && <span style={{ background:"#0C0E10", border:"1px solid #2A2D30", borderRadius:6, padding:"2px 7px", fontSize:"0.7rem", color:"#8A8F95" }}>{week>4?ex.sets+phase.sets:ex.sets}×</span>}
                                {ex.reps && <span style={{ background:"#0C0E10", border:"1px solid #2A2D30", borderRadius:6, padding:"2px 7px", fontSize:"0.7rem", color:"#8A8F95" }}>{ex.reps}</span>}
                                {ex.rest && <span style={{ background:"#0C0E10", border:"1px solid #2A2D30", borderRadius:6, padding:"2px 7px", fontSize:"0.7rem", color:"#555" }}>{ex.rest}</span>}
                                <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name+" exercise proper form tutorial")}`} target="_blank" rel="noreferrer" style={{ background:"#1C2010", color:A, fontSize:"0.7rem", fontWeight:700, padding:"3px 8px", borderRadius:20, textDecoration:"none", whiteSpace:"nowrap" }}>▶ Demo</a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* Meals tab */}
          {tab === "meal" && (
            <>
              {plan.mealPlan?.macros && (
                <>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.75rem" }}>
                    <SLbl>Daily targets</SLbl>
                    <Tag>{plan.mealPlan.dailyCalories} kcal</Tag>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:"1.25rem" }}>
                    {Object.entries(plan.mealPlan.macros).map(([k,v]) => (
                      <div key={k} style={{ background:"#1A1D1E", borderRadius:12, padding:"0.9rem 1rem", textAlign:"center" }}>
                        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.35rem", color:A }}>{v}</div>
                        <div style={{ color:"#8A8F95", fontSize:"0.7rem", textTransform:"uppercase", letterSpacing:"0.08em", marginTop:3 }}>{k}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {plan.mealPlan?.meals?.map((meal,mi) => (
                <div key={mi} style={{ ...card, marginBottom:"0.65rem" }}>
                  <div style={{ padding:"0.85rem 1.1rem", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid #1F2224" }}>
                    <span style={{ fontWeight:700, fontSize:"0.9rem" }}>{meal.meal}</span>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <span style={{ color:"#555", fontSize:"0.78rem" }}>{meal.time}</span>
                      {meal.calories && <Tag>{meal.calories} kcal</Tag>}
                    </div>
                  </div>
                  <div style={{ padding:"0.75rem 1.1rem" }}>
                    {meal.items?.map((item,ii) => (
                      <div key={ii} style={{ color:"#B0B5BC", fontSize:"0.85rem", padding:"4px 0", display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:5, height:5, borderRadius:"50%", background:A, flexShrink:0 }} />{item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {groceries.length > 0 && (
                <div style={{ marginTop:"1.75rem" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                    <SLbl>Grocery list ({groceries.length} items)</SLbl>
                    <button onClick={() => navigator.clipboard.writeText(groceries.map((g,i) => `${i+1}. ${g}`).join("\n")).catch(()=>{})} style={{ background:"#1A1D1E", border:"1px solid #2A2D30", borderRadius:8, padding:"4px 10px", fontSize:"0.72rem", fontWeight:600, color:"#8A8F95", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>📋 Copy list</button>
                  </div>
                  <div style={{ ...card, padding:"0.85rem 1.1rem" }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"3px 20px" }}>
                      {groceries.map((item,i) => (
                        <div key={i} style={{ color:"#B0B5BC", fontSize:"0.82rem", padding:"3px 0", display:"flex", alignItems:"center", gap:7 }}>
                          <div style={{ width:4, height:4, borderRadius:"50%", background:"#2A2D30", flexShrink:0 }} />{item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Progress tab */}
          {tab === "progress" && (
            <>
              <input ref={progRef} type="file" accept="image/*" capture="environment" onChange={handleProgPhoto} />
              {progPhotos.length >= 2 && (
                <div style={{ marginBottom:"1.5rem" }}>
                  <SLbl>Before vs Now</SLbl>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    {[progPhotos[0], progPhotos[progPhotos.length-1]].map((p,i) => (
                      <div key={p.id} style={{ ...card }}>
                        <img src={p.dataUrl} alt={p.label} style={{ width:"100%", display:"block", aspectRatio:"3/4", objectFit:"cover" }} />
                        <div style={{ padding:"8px 10px", textAlign:"center" }}>
                          <div style={{ fontWeight:700, fontSize:"0.78rem", color:i===0?"#8A8F95":A }}>{i===0?"Starting":"Current"}</div>
                          <div style={{ fontSize:"0.72rem", color:"#555", marginTop:2 }}>{p.date} · {p.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {checkins.length >= 2 && (
                    <div style={{ marginTop:10, ...card, padding:"0.75rem 1rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ fontSize:"0.78rem", color:"#8A8F95" }}>Weight change since start</span>
                      <span style={{ fontWeight:700, color:(checkins[checkins.length-1].weight-checkins[0].weight)<0?"#4AFC9A":"#FF7A5A" }}>
                        {(checkins[checkins.length-1].weight-checkins[0].weight)>0?"+":""}
                        {toDisplayW(Math.abs(checkins[checkins.length-1].weight-checkins[0].weight),unit).toFixed(1)} {unit}
                      </span>
                    </div>
                  )}
                </div>
              )}
              {progPhotos.length > 0 && (
                <div style={{ marginBottom:"1.5rem" }}>
                  <SLbl>Timeline ({progPhotos.length}/12)</SLbl>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                    {progPhotos.map(p => (
                      <div key={p.id} style={{ ...card, position:"relative" }}>
                        <img src={p.dataUrl} alt={p.label} style={{ width:"100%", display:"block", aspectRatio:"1/1", objectFit:"cover" }} />
                        <div style={{ padding:"6px 8px" }}>
                          <div style={{ fontSize:"0.74rem", fontWeight:700, color:A }}>{p.label}</div>
                          <div style={{ fontSize:"0.68rem", color:"#555" }}>{p.date}</div>
                        </div>
                        <button onClick={() => delProgPhoto(p.id)} style={{ position:"absolute", top:5, right:5, background:"rgba(0,0,0,0.75)", border:"none", borderRadius:"50%", width:22, height:22, cursor:"pointer", color:"#F0F2F4", fontSize:"0.7rem", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {progPhotos.length === 0 && (
                <div style={{ textAlign:"center", padding:"3rem 1rem", color:"#555", marginBottom:"1.5rem" }}>
                  <div style={{ fontSize:"2.5rem", marginBottom:"0.75rem" }}>📷</div>
                  <div style={{ fontWeight:600, marginBottom:6 }}>No progress photos yet</div>
                  <div style={{ fontSize:"0.85rem" }}>Add your first to start tracking your transformation</div>
                </div>
              )}
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                <button style={btnP} onClick={() => progRef.current?.click()}>+ Add Progress Photo</button>
                {progPhotos.length > 0 && <button style={btnS} onClick={() => { setProgPhotos([]); sDel("fa:photos"); }}>Clear All</button>}
              </div>
            </>
          )}

          {/* Check-in tab */}
          {tab === "checkin" && (
            <>
              <div style={{ ...card, padding:"1.1rem 1.25rem", marginBottom:"1.25rem" }}>
                <SLbl>Log today's check-in</SLbl>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                  <div>
                    <div style={lbl}>Weight ({unit})</div>
                    <input style={inp} type="number" placeholder={unit==="lbs"?"e.g. 173":"e.g. 78.5"} value={newCI.weight} onChange={e => setNewCI(c => ({ ...c, weight:e.target.value }))} />
                  </div>
                  <div><div style={lbl}>Week</div><div style={{ ...inp, cursor:"default", color:"#8A8F95", display:"flex", alignItems:"center" }}>Week {week}</div></div>
                </div>
                <div style={{ marginBottom:12 }}>
                  <div style={lbl}>Notes (optional)</div>
                  <textarea style={{ ...inp, resize:"vertical", minHeight:64 }} placeholder="Energy levels, soreness, how you're feeling…" value={newCI.note} onChange={e => setNewCI(c => ({ ...c, note:e.target.value }))} />
                </div>
                <button style={btnP} onClick={addCheckin} disabled={!newCI.weight}>Log Check-in ✓</button>
              </div>

              {checkins.length >= 2 && (
                <div style={{ ...card, padding:"1rem 1.25rem", marginBottom:"1.25rem" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                    <SLbl>Weight trend</SLbl>
                    <div style={{ display:"flex", gap:12 }}>
                      <span style={{ fontSize:"0.78rem", color:"#8A8F95" }}>Start: <strong style={{ color:"#F0F2F4" }}>{toDisplayW(checkins[0].weight,unit)}{unit}</strong></span>
                      <span style={{ fontSize:"0.78rem", color:"#8A8F95" }}>Now: <strong style={{ color:A }}>{toDisplayW(checkins[checkins.length-1].weight,unit)}{unit}</strong></span>
                    </div>
                  </div>
                  <WeightChart checkins={checkins} unit={unit} />
                </div>
              )}

              {checkins.length > 0 ? (
                <div style={{ marginBottom:"1.25rem" }}>
                  <SLbl>History ({checkins.length} entries)</SLbl>
                  {[...checkins].reverse().map(ci => (
                    <div key={ci.id} style={{ ...card, padding:"0.85rem 1rem", marginBottom:"0.5rem", display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
                      <div>
                        <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:ci.note?4:0 }}>
                          <span style={{ fontWeight:700, color:A }}>{toDisplayW(ci.weight,unit)}{unit}</span>
                          <Tag color="#1A1D1E" text="#8A8F95">Wk {ci.week}</Tag>
                          <span style={{ fontSize:"0.78rem", color:"#555" }}>{ci.date}</span>
                        </div>
                        {ci.note && <div style={{ fontSize:"0.8rem", color:"#8A8F95" }}>{ci.note}</div>}
                      </div>
                      <button onClick={() => delCheckin(ci.id)} style={{ background:"none", border:"none", color:"#444", cursor:"pointer", fontSize:"0.85rem", padding:4 }}>✕</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign:"center", padding:"2.5rem 1rem", color:"#555", marginBottom:"1.25rem" }}>
                  <div style={{ fontSize:"2rem", marginBottom:"0.6rem" }}>📊</div>
                  <div style={{ fontWeight:600, marginBottom:4 }}>No check-ins yet</div>
                  <div style={{ fontSize:"0.85rem" }}>Log your first entry above</div>
                </div>
              )}

              {checkins.length >= 2 && (
                <div style={{ background:"#141617", border:`1px solid ${A}33`, borderRadius:12, padding:"1rem 1.25rem" }}>
                  <div style={{ fontWeight:700, fontSize:"0.9rem", marginBottom:6 }}>Adjust plan with your progress</div>
                  <p style={{ color:"#8A8F95", fontSize:"0.82rem", lineHeight:1.6, marginBottom:12 }}>
                    AI will analyze your {checkins.length} check-in{checkins.length>1?"s":""}{progPhotos.length>=2?" and before/after photos":""} to recalibrate your workout and nutrition for the next phase.
                  </p>
                  <button style={btnP} onClick={adjustPlan}>Recalibrate Plan with AI →</button>
                </div>
              )}
            </>
          )}

          {/* Tips tab */}
          {tab === "tips" && (
            <>
              <SLbl>Pro tips for your goals</SLbl>
              {plan.tips?.map((tip,ti) => (
                <div key={ti} style={{ background:"#1A1D1E", borderLeft:`3px solid ${A}`, borderRadius:"0 10px 10px 0", padding:"0.75rem 1rem", marginBottom:"0.5rem" }}>
                  <p style={{ color:"#B0B5BC", fontSize:"0.85rem", lineHeight:1.7 }}>{tip}</p>
                </div>
              ))}
            </>
          )}

          <div style={{ display:"flex", gap:10, marginTop:"2.5rem", flexWrap:"wrap" }}>
            <button style={btnP} onClick={() => { setStep(2); setPlan(null); setError(null); }}>Regenerate Plan →</button>
            <button style={btnS} onClick={() => { setStep(0); setPhoto(null); setPhotoB64(null); setPlan(null); setError(null); setWeek(1); setProgPhotos([]); setCheckins([]); setDoneExs({}); sDel("fa:plan"); sDel("fa:week"); sDel("fa:photos"); sDel("fa:checkins"); sDel("fa:done"); }}>Start Over</button>
          </div>
        </div>
      )}
    </div>
  );
}
