// PVHS Schedule Data — single source of truth
// Loaded by countdown.html and canvas-card.html
// Update this file once; all embeds update automatically.

const timeZone = "America/Los_Angeles";

// Full 2025-26 school year: 85 days (Sem 1, Aug 14–Dec 19) + 95 days (Sem 2, Jan 15–Jun 10) = 180 total
const schoolDays = [
  // ── SEMESTER 1 (85 days) ──────────────────────────────────────────
  // August 2025 (12)
  "2025-08-14","2025-08-15","2025-08-18","2025-08-19","2025-08-20","2025-08-21","2025-08-22","2025-08-25","2025-08-26","2025-08-27","2025-08-28","2025-08-29",
  // September 2025 (21)
  "2025-09-02","2025-09-03","2025-09-04","2025-09-05","2025-09-08","2025-09-09","2025-09-10","2025-09-11","2025-09-12","2025-09-15","2025-09-16","2025-09-17","2025-09-18","2025-09-19","2025-09-22","2025-09-23","2025-09-24","2025-09-25","2025-09-26","2025-09-29","2025-09-30",
  // October 2025 (23)
  "2025-10-01","2025-10-02","2025-10-03","2025-10-06","2025-10-07","2025-10-08","2025-10-09","2025-10-10","2025-10-13","2025-10-14","2025-10-15","2025-10-16","2025-10-17","2025-10-20","2025-10-21","2025-10-22","2025-10-23","2025-10-24","2025-10-27","2025-10-28","2025-10-29","2025-10-30","2025-10-31",
  // November 2025 (14)
  "2025-11-03","2025-11-04","2025-11-05","2025-11-06","2025-11-07","2025-11-10","2025-11-12","2025-11-13","2025-11-14","2025-11-17","2025-11-18","2025-11-19","2025-11-20","2025-11-21",
  // December 2025 (15)
  "2025-12-01","2025-12-02","2025-12-03","2025-12-04","2025-12-05","2025-12-08","2025-12-09","2025-12-10","2025-12-11","2025-12-12","2025-12-15","2025-12-16","2025-12-17","2025-12-18","2025-12-19",
  // ── SEMESTER 2 (95 days) ──────────────────────────────────────────
  "2026-01-15","2026-01-16","2026-01-20","2026-01-21","2026-01-22","2026-01-23","2026-01-26","2026-01-27","2026-01-28","2026-01-29","2026-01-30","2026-02-02","2026-02-03","2026-02-04","2026-02-05","2026-02-06","2026-02-10","2026-02-11","2026-02-12","2026-02-13","2026-02-17","2026-02-18","2026-02-19","2026-02-20","2026-02-23","2026-02-24","2026-02-25","2026-02-26","2026-02-27","2026-03-02","2026-03-03","2026-03-04","2026-03-05","2026-03-06","2026-03-09","2026-03-10","2026-03-11","2026-03-12","2026-03-13","2026-03-16","2026-03-17","2026-03-18","2026-03-19","2026-03-20","2026-03-23","2026-03-24","2026-03-25","2026-03-26","2026-03-27","2026-03-30","2026-03-31","2026-04-01","2026-04-02","2026-04-13","2026-04-14","2026-04-15","2026-04-16","2026-04-17","2026-04-20","2026-04-21","2026-04-22","2026-04-23","2026-04-24","2026-04-27","2026-04-28","2026-04-29","2026-04-30","2026-05-01","2026-05-04","2026-05-05","2026-05-06","2026-05-07","2026-05-08","2026-05-11","2026-05-12","2026-05-13","2026-05-14","2026-05-15","2026-05-18","2026-05-19","2026-05-20","2026-05-21","2026-05-22","2026-05-26","2026-05-27","2026-05-28","2026-05-29","2026-06-01","2026-06-02","2026-06-03","2026-06-04","2026-06-05","2026-06-08","2026-06-09","2026-06-10"
];

const minimumDays = new Set([
  "2025-08-29","2025-09-19","2025-10-31",
  "2026-02-27","2026-04-02","2026-04-24"
]);

const finalsDays = new Set([
  "2025-12-17","2025-12-18","2025-12-19",
  "2026-06-08","2026-06-09","2026-06-10"
]);

const schedules = {
  regular: [ {l:"1ST PERIOD",s:"08:30",e:"09:20"},{l:"PASSING",s:"09:20",e:"09:30"},{l:"2ND PERIOD",s:"09:30",e:"10:20"},{l:"NUTRITION",s:"10:20",e:"10:35"},{l:"3RD PERIOD",s:"10:35",e:"11:25"},{l:"PASSING",s:"11:25",e:"11:35"},{l:"4TH PERIOD",s:"11:35",e:"12:25"},{l:"LUNCH",s:"12:25",e:"13:05"},{l:"5TH PERIOD",s:"13:05",e:"13:55"},{l:"PASSING",s:"13:55",e:"14:05"},{l:"6TH PERIOD",s:"14:05",e:"14:55"},{l:"PASSING",s:"14:55",e:"15:05"},{l:"7TH PERIOD",s:"15:05",e:"15:55"} ],
  monday:  [ {l:"1ST PERIOD",s:"08:30",e:"09:10"},{l:"PASSING",s:"09:10",e:"09:20"},{l:"2ND PERIOD",s:"09:20",e:"10:00"},{l:"NUTRITION",s:"10:00",e:"10:15"},{l:"3RD PERIOD",s:"10:15",e:"10:55"},{l:"PASSING",s:"10:55",e:"11:05"},{l:"4TH PERIOD",s:"11:05",e:"11:45"},{l:"LUNCH",s:"11:45",e:"12:25"},{l:"5TH PERIOD",s:"12:25",e:"13:05"},{l:"PASSING",s:"13:05",e:"13:15"},{l:"6TH PERIOD",s:"13:15",e:"13:55"},{l:"PASSING",s:"13:55",e:"14:05"},{l:"7TH PERIOD",s:"14:05",e:"14:45"},{l:"DEPT. COLLABORATION",s:"14:45",e:"15:55"} ],
  minimum: [ {l:"1ST PERIOD",s:"08:30",e:"09:00"},{l:"PASSING",s:"09:00",e:"09:10"},{l:"2ND PERIOD",s:"09:10",e:"09:40"},{l:"NUTRITION",s:"09:40",e:"09:55"},{l:"3RD PERIOD",s:"09:55",e:"10:25"},{l:"PASSING",s:"10:25",e:"10:35"},{l:"4TH PERIOD",s:"10:35",e:"11:05"},{l:"LUNCH",s:"11:05",e:"11:45"},{l:"5TH PERIOD",s:"11:45",e:"12:15"},{l:"PASSING",s:"12:15",e:"12:25"},{l:"6TH PERIOD",s:"12:25",e:"12:55"},{l:"PASSING",s:"12:55",e:"13:05"},{l:"7TH PERIOD",s:"13:05",e:"13:35"} ],
  finals_1:[ {l:"1ST PERIOD",s:"08:30",e:"10:20"},{l:"BREAK",s:"10:20",e:"10:30"},{l:"2ND PERIOD",s:"10:40",e:"12:30"},{l:"LUNCH",s:"12:30",e:"13:00"},{l:"7TH PERIOD",s:"13:10",e:"15:00"} ],
  finals_2:[ {l:"3RD PERIOD",s:"08:30",e:"10:25"},{l:"LUNCH",s:"10:25",e:"10:55"},{l:"4TH PERIOD",s:"11:05",e:"13:00"} ],
  finals_3:[ {l:"5TH PERIOD",s:"08:30",e:"10:25"},{l:"LUNCH",s:"10:25",e:"10:55"},{l:"6TH PERIOD",s:"11:05",e:"13:00"} ],
  rally:   [ {l:"1ST PERIOD",s:"08:30",e:"09:10"},{l:"PASSING",s:"09:10",e:"09:20"},{l:"2ND PERIOD",s:"09:20",e:"10:00"},{l:"NUTRITION",s:"10:00",e:"10:05"},{l:"PASSING",s:"10:05",e:"10:15"},{l:"3RD PERIOD",s:"10:15",e:"10:55"},{l:"PASSING",s:"10:55",e:"11:05"},{l:"4TH PERIOD",s:"11:05",e:"11:45"},{l:"LUNCH",s:"11:45",e:"12:15"},{l:"PASSING",s:"12:15",e:"12:25"},{l:"5TH PERIOD / RALLY 1",s:"12:25",e:"13:15"},{l:"PASSING",s:"13:15",e:"13:25"},{l:"5TH PERIOD / RALLY 2",s:"13:25",e:"14:15"},{l:"PASSING",s:"14:15",e:"14:25"},{l:"6TH PERIOD",s:"14:25",e:"15:05"},{l:"PASSING",s:"15:05",e:"15:15"},{l:"7TH PERIOD",s:"15:15",e:"15:55"} ]
};

const finalsMap = {
  "2025-12-17":"finals_1","2025-12-18":"finals_2","2025-12-19":"finals_3",
  "2026-06-08":"finals_1","2026-06-09":"finals_2","2026-06-10":"finals_3"
};

const specialDayMap = {
  "2026-05-29": { key:"rally", label:"ALL SCHOOL RALLY" }
};

const currentBreaks = [
  { name:"Labor Day Weekend",      start:"2025-08-30", end:"2025-09-01", emoji:"🇺🇸" },
  { name:"Thanksgiving Break",     start:"2025-11-22", end:"2025-11-30", emoji:"🦃" },
  { name:"Winter Break",           start:"2025-12-20", end:"2026-01-14", emoji:"❄️" },
  { name:"MLK Day Weekend",        start:"2026-01-17", end:"2026-01-19", emoji:"✊" },
  { name:"Lincoln's Birthday",     start:"2026-02-07", end:"2026-02-09", emoji:"🎩" },
  { name:"Presidents' Day Weekend",start:"2026-02-14", end:"2026-02-16", emoji:"🇺🇸" },
  { name:"Spring Break",           start:"2026-04-03", end:"2026-04-12", emoji:"🌸" },
  { name:"Memorial Day Weekend",   start:"2026-05-23", end:"2026-05-25", emoji:"🇺🇸" },
  { name:"Summer Break",           start:"2026-06-11", end:"2026-08-31", emoji:"☀️" }
];

// ── Shared helper functions ────────────────────────────────────────────────

function parseToSec(t) {
  const [h, m] = t.split(":").map(Number);
  return (h * 3600) + (m * 60);
}

function formatTime(sec, forceHH = false) {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  if (h > 0 || forceHH) return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

function getNow() {
  const now = new Date();
  const dateStr  = new Intl.DateTimeFormat("en-CA",  { timeZone, year:"numeric", month:"2-digit", day:"2-digit" }).format(now);
  const weekday  = new Intl.DateTimeFormat("en-US",  { timeZone, weekday:"long" }).format(now);
  const longDate = new Intl.DateTimeFormat("en-US",  { timeZone, weekday:"long", month:"long", day:"numeric", year:"numeric" }).format(now);
  const parts    = new Intl.DateTimeFormat("en-US",  { timeZone, hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:false }).formatToParts(now);
  const h = Number(parts.find(p => p.type === "hour").value);
  const m = Number(parts.find(p => p.type === "minute").value);
  const s = Number(parts.find(p => p.type === "second").value);
  return { dateStr, weekday, longDate, totalSec: (h * 3600) + (m * 60) + s };
}

function isInstructionalPeriod(label) { return /PERIOD/i.test(label); }
function isPassingBlock(label)        { return /PASSING/i.test(label); }

function getScheduleType(dStr) {
  if (finalsDays.has(dStr)) return "FINALS SCHEDULE";
  if (specialDayMap[dStr])  return specialDayMap[dStr].label;
  if (minimumDays.has(dStr)) return "MINIMUM DAY";
  const d  = new Date(dStr + "T12:00:00");
  const wd = new Intl.DateTimeFormat("en-US", { timeZone, weekday:"long" }).format(d);
  if (wd === "Monday") return "COLLABORATION";
  return "REGULAR";
}

function getScheduleBlocks(dStr) {
  if (finalsMap[dStr])      return schedules[finalsMap[dStr]];
  if (specialDayMap[dStr])  return schedules[specialDayMap[dStr].key];
  if (minimumDays.has(dStr)) return schedules.minimum;
  const d  = new Date(dStr + "T12:00:00");
  const wd = new Intl.DateTimeFormat("en-US", { timeZone, weekday:"long" }).format(d);
  if (wd === "Monday") return schedules.monday;
  return schedules.regular;
}
