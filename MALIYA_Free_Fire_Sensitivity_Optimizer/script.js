const $ = (id) => document.getElementById(id);
$("year").textContent = new Date().getFullYear();

function detectOS(ua) {
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Android/i.test(ua)) return "Android";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Mac OS/i.test(ua)) return "macOS";
  if (/Linux/i.test(ua)) return "Linux";
  return "Not identified";
}
function detectBrowser(ua) {
  if (/Edg\//.test(ua)) return "Microsoft Edge";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return "Safari";
  return "Other / unidentified";
}
$("scanBtn").addEventListener("click", () => {
  const btn = $("scanBtn");
  btn.disabled = true;
  btn.textContent = "ANALYZING DEVICE...";
  $("scanHint").textContent = "Checking browser-accessible device information...";
  const ua = navigator.userAgent || "";
  setTimeout(() => {
    $("osValue").textContent = detectOS(ua);
    $("resolutionValue").textContent = `${screen.width} × ${screen.height}`;
    $("pixelValue").textContent = String(window.devicePixelRatio || "Unknown");
    $("browserValue").textContent = detectBrowser(ua);
    $("memoryValue").textContent = navigator.deviceMemory ? `About ${navigator.deviceMemory} GB (browser hint)` : "Not exposed by browser";
    $("cpuValue").textContent = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} logical threads (hint)` : "Not exposed by browser";
    $("scanHint").textContent = "Device check complete. Add your exact model below for a closer match.";
    btn.disabled = false;
    btn.innerHTML = 'SCAN AGAIN <span>↻</span>';
  }, 1100);
});

const clamp = (n) => Math.max(0, Math.min(200, Math.round(n)));
let currentProfile = null;
function generateProfile() {
  const brand = $("brand").value;
  const model = $("model").value.trim();
  const performance = $("performance").value;
  const style = $("playstyle").value;
  const feel = Number($("feel").value);
  // These are illustrative starting-point presets, not measured or officially validated device settings.
  const base = performance === "entry" ? 155 : performance === "strong" ? 178 : 168;
  const styleAdjust = style === "rush" ? 9 : style === "precise" ? -9 : 0;
  const feelAdjust = (feel - 2) * 8;
  const brandAdjust = brand === "iPhone" ? 2 : 0;
  const general = clamp(base + styleAdjust + feelAdjust + brandAdjust);
  const values = {
    "General": general,
    "Red Dot": clamp(general - 9),
    "2X Scope": clamp(general - 19),
    "4X Scope": clamp(general - 32),
    "Sniper Scope": clamp(general - 65),
    "Free Look": clamp(general - 5)
  };
  currentProfile = {brand, model: model || "Model not specified", performance, style, feel, values, createdAt: new Date().toISOString()};
  $("profileSummary").textContent = `${currentProfile.brand} · ${currentProfile.model} · ${performanceLabel(performance)} · ${styleLabel(style)}`;
  $("matchLabel").textContent = performance === "strong" ? "HIGH PERFORMANCE" : performance === "entry" ? "ENTRY LEVEL" : "BALANCED";
  $("sensitivityGrid").innerHTML = "";
  Object.entries(values).forEach(([name, value]) => {
    const card = document.createElement("div");
    card.className = "sensitivity-card";
    const label = document.createElement("span"); label.textContent = name.toUpperCase();
    const number = document.createElement("strong"); number.textContent = value;
    const meter = document.createElement("div"); meter.className = "meter";
    const fill = document.createElement("i"); fill.style.width = `${value / 2}%`;
    meter.appendChild(fill); card.append(label, number, meter); $("sensitivityGrid").appendChild(card);
  });
  $("results").hidden = false;
  $("savedNote").textContent = "";
  $("results").scrollIntoView({behavior:"smooth", block:"start"});
}
function performanceLabel(v){return v==="entry"?"Entry-level":v==="strong"?"High performance":"Balanced";}
function styleLabel(v){return v==="rush"?"Aggressive / Rush":v==="precise"?"Precise / Controlled":"Balanced";}
$("generateBtn").addEventListener("click", generateProfile);
$("copyBtn").addEventListener("click", async () => {
  if (!currentProfile) return;
  const lines = ["MALIYA SENSITIVITY STARTING PROFILE", `${currentProfile.brand} - ${currentProfile.model}`, ...Object.entries(currentProfile.values).map(([k,v])=>`${k}: ${v}`), "", "Suggested starting values only; test and adjust in Training Mode."];
  try { await navigator.clipboard.writeText(lines.join("\n")); $("copyBtn").textContent = "COPIED ✓"; }
  catch { $("savedNote").textContent = "Clipboard access was blocked. You can select and copy the values manually."; }
});
$("saveBtn").addEventListener("click", () => {
  if (!currentProfile) return;
  try { localStorage.setItem("maliyaSensitivityProfile", JSON.stringify(currentProfile)); $("savedNote").textContent = "Profile saved on this device in this browser."; }
  catch { $("savedNote").textContent = "This browser does not allow local saving."; }
});
$("resetBtn").addEventListener("click", () => {
  $("results").hidden = true;
  $("generator").scrollIntoView({behavior:"smooth"});
});
try {
  const saved = JSON.parse(localStorage.getItem("maliyaSensitivityProfile") || "null");
  if (saved) $("savedNote").textContent = `A saved profile is available for ${saved.model}. Generate a new profile to replace it.`;
} catch {}
