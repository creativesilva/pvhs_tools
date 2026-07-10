// PVHS Schedule Data — single source of truth
// Loaded by countdown.html and canvas-card.html
// Update this file once; all embeds update automatically.

const timeZone = "America/Los_Angeles";

// Full 2026-27 school year: 180 days (Sem 1 Aug 13–Dec 18, 85 days · Sem 2 Jan 14–Jun 9, 95 days)
const schoolDays = [
  // ── SEMESTER 1 (85 days) ──────────────────────────────────────────
  // August 2026 (13) — First day Aug 13
  "2026-08-13","2026-08-14","2026-08-17","2026-08-18","2026-08-19","2026-08-20","2026-08-21","2026-08-24","2026-08-25","2026-08-26","2026-08-27","2026-08-28","2026-08-31",
  // September 2026 (21) — Sep 7 Labor Day
  "2026-09-01","2026-09-02","2026-09-03","2026-09-04","2026-09-08","2026-09-09","2026-09-10","2026-09-11","2026-09-14","2026-09-15","2026-09-16","2026-09-17","2026-09-18","2026-09-21","2026-09-22","2026-09-23","2026-09-24","2026-09-25","2026-09-28","2026-09-29","2026-09-30",
  // October 2026 (22)
  "2026-10-01","2026-10-02","2026-10-05","2026-10-06","2026-10-07","2026-10-08","2026-10-09","2026-10-12","2026-10-13","2026-10-14","2026-10-15","2026-10-16","2026-10-19","2026-10-20","2026-10-21","2026-10-22","2026-10-23","2026-10-26","2026-10-27","2026-10-28","2026-10-29","2026-10-30",
  // November 2026 (15) — Nov 11 Veterans Day, Nov 23-27 Thanksgiving
  "2026-11-02","2026-11-03","2026-11-04","2026-11-05","2026-11-06","2026-11-09","2026-11-10","2026-11-12","2026-11-13","2026-11-16","2026-11-17","2026-11-18","2026-11-19","2026-11-20","2026-11-30",
  // December 2026 (14) — Finals Dec 16-18, Winter Break Dec 21+
  "2026-12-01","2026-12-02","2026-12-03","2026-12-04","2026-12-07","2026-12-08","2026-12-09","2026-12-10","2026-12-11","2026-12-14","2026-12-15","2026-12-16","2026-12-17","2026-12-18",
  // ── SEMESTER 2 (95 days) — Students return Jan 14 ──────────────────
  "2027-01-14","2027-01-15","2027-01-19","2027-01-20","2027-01-21","2027-01-22","2027-01-25","2027-01-26","2027-01-27","2027-01-28","2027-01-29","2027-02-01","2027-02-02","2027-02-03","2027-02-04","2027-02-05","2027-02-09","2027-02-10","2027-02-11","2027-02-12","2027-02-16","2027-02-17","2027-02-18","2027-02-19","2027-02-22","2027-02-23","2027-02-24","2027-02-25","2027-02-26","2027-03-01","2027-03-02","2027-03-03","2027-03-04","2027-03-05","2027-03-08","2027-03-09","2027-03-10","2027-03-11","2027-03-12","2027-03-15","2027-03-16","2027-03-17","2027-03-18","2027-03-19","2027-03-22","2027-03-23","2027-03-24","2027-03-25","2027-04-05","2027-04-06","2027-04-07","2027-04-08","2027-04-09","2027-04-12","2027-04-13","2027-04-14","2027-04-15","2027-04-16","2027-04-19","2027-04-20","2027-04-21","2027-04-22","2027-04-23","2027-04-26","2027-04-27","2027-04-28","2027-04-29","2027-04-30","2027-05-03","2027-05-04","2027-05-05","2027-05-06","2027-05-07","2027-05-10","2027-05-11","2027-05-12","2027-05-13","2027-05-14","2027-05-17","2027-05-18","2027-05-19","2027-05-20","2027-05-21","2027-05-24","2027-05-25","2027-05-26","2027-05-27","2027-05-28","2027-06-01","2027-06-02","2027-06-03","2027-06-04","2027-06-07","2027-06-08","2027-06-09"
];

const minimumDays = new Set([
  "2026-08-28","2026-09-25","2026-11-06",
  "2027-02-26","2027-03-25","2027-04-16"
]);

// Finals dates confirmed (Dec 16-18, 2026 · Jun 7-9, 2027) — schedule not yet published.
// Kept empty so these days default to their regular / collaboration schedule until finalized.
const finalsDays = new Set([
  // "2026-12-16","2026-12-17","2026-12-18",
  // "2027-06-07","2027-06-08","2027-06-09"
]);

const schedules = {
  regular: [ {l:"1ST PERIOD",s:"08:30",e:"09:20"},{l:"PASSING",s:"09:20",e:"09:30"},{l:"2ND PERIOD",s:"09:30",e:"10:20"},{l:"NUTRITION",s:"10:20",e:"10:35"},{l:"3RD PERIOD",s:"10:35",e:"11:25"},{l:"PASSING",s:"11:25",e:"11:35"},{l:"4TH PERIOD",s:"11:35",e:"12:25"},{l:"LUNCH",s:"12:25",e:"13:05"},{l:"5TH PERIOD",s:"13:05",e:"13:55"},{l:"PASSING",s:"13:55",e:"14:05"},{l:"6TH PERIOD",s:"14:05",e:"14:55"},{l:"PASSING",s:"14:55",e:"15:05"},{l:"7TH PERIOD",s:"15:05",e:"15:55"} ],
  monday:  [ {l:"1ST PERIOD",s:"08:30",e:"09:10"},{l:"PASSING",s:"09:10",e:"09:20"},{l:"2ND PERIOD",s:"09:20",e:"10:00"},{l:"NUTRITION",s:"10:00",e:"10:15"},{l:"3RD PERIOD",s:"10:15",e:"10:55"},{l:"PASSING",s:"10:55",e:"11:05"},{l:"4TH PERIOD",s:"11:05",e:"11:45"},{l:"LUNCH",s:"11:45",e:"12:25"},{l:"5TH PERIOD",s:"12:25",e:"13:05"},{l:"PASSING",s:"13:05",e:"13:15"},{l:"6TH PERIOD",s:"13:15",e:"13:55"},{l:"PASSING",s:"13:55",e:"14:05"},{l:"7TH PERIOD",s:"14:05",e:"14:45"},{l:"DEPT. COLLABORATION",s:"14:45",e:"15:55"} ],
  minimum: [ {l:"1ST PERIOD",s:"08:30",e:"09:00"},{l:"PASSING",s:"09:00",e:"09:10"},{l:"2ND PERIOD",s:"09:10",e:"09:40"},{l:"NUTRITION",s:"09:40",e:"09:55"},{l:"3RD PERIOD",s:"09:55",e:"10:25"},{l:"PASSING",s:"10:25",e:"10:35"},{l:"4TH PERIOD",s:"10:35",e:"11:05"},{l:"LUNCH",s:"11:05",e:"11:45"},{l:"5TH PERIOD",s:"11:45",e:"12:15"},{l:"PASSING",s:"12:15",e:"12:25"},{l:"6TH PERIOD",s:"12:25",e:"12:55"},{l:"PASSING",s:"12:55",e:"13:05"},{l:"7TH PERIOD",s:"13:05",e:"13:35"} ],
  finals_1:[ {l:"1ST PERIOD",s:"08:30",e:"10:20"},{l:"BREAK",s:"10:20",e:"10:30"},{l:"2ND PERIOD",s:"10:40",e:"12:30"},{l:"LUNCH",s:"12:30",e:"13:00"},{l:"7TH PERIOD",s:"13:10",e:"15:00"} ],
  finals_2:[ {l:"3RD PERIOD",s:"08:30",e:"10:25"},{l:"LUNCH",s:"10:25",e:"10:55"},{l:"4TH PERIOD",s:"11:05",e:"13:00"} ],
  finals_3:[ {l:"5TH PERIOD",s:"08:30",e:"10:25"},{l:"LUNCH",s:"10:25",e:"10:55"},{l:"6TH PERIOD",s:"11:05",e:"13:00"} ],
  rally:   [ {l:"1ST PERIOD",s:"08:30",e:"09:10"},{l:"PASSING",s:"09:10",e:"09:20"},{l:"2ND PERIOD",s:"09:20",e:"10:00"},{l:"NUTRITION",s:"10:00",e:"10:05"},{l:"PASSING",s:"10:05",e:"10:15"},{l:"3RD PERIOD",s:"10:15",e:"10:55"},{l:"PASSING",s:"10:55",e:"11:05"},{l:"4TH PERIOD",s:"11:05",e:"11:45"},{l:"LUNCH",s:"11:45",e:"12:15"},{l:"PASSING",s:"12:15",e:"12:25"},{l:"5TH PERIOD / RALLY 1",s:"12:25",e:"13:15"},{l:"PASSING",s:"13:15",e:"13:25"},{l:"5TH PERIOD / RALLY 2",s:"13:25",e:"14:15"},{l:"PASSING",s:"14:15",e:"14:25"},{l:"6TH PERIOD",s:"14:25",e:"15:05"},{l:"PASSING",s:"15:05",e:"15:15"},{l:"7TH PERIOD",s:"15:15",e:"15:55"} ],
  graduation: [
    {l:"☕ BREAKFAST & COFFEE",    s:"07:30", e:"08:30"},
    {l:"STUDENT DROP-OFF OPENS",   s:"09:15", e:"10:30"},
    {l:"TEACHERS REPORT TO GYM",   s:"10:30", e:"10:50"},
    {l:"STUDENT LINEUP",           s:"10:50", e:"11:20"},
    {l:"PROCESSIONAL STAGING",     s:"11:20", e:"11:30"},
    {l:"🎓 GRADUATION CEREMONY",   s:"11:30", e:"13:00"}
  ]
};

// 2026-27 finals schedule TBD — map kept empty so those days default to regular schedule
const finalsMap = {
  // "2026-12-16":"finals_1","2026-12-17":"finals_2","2026-12-18":"finals_3",
  // "2027-06-07":"finals_1","2027-06-08":"finals_2","2027-06-09":"finals_3"
};

// Rally + graduation schedules for 2026-27 not yet confirmed — map kept empty
const specialDayMap = {
  // "2027-06-10": { key:"graduation", label:"GRADUATION DAY 🎓" }
};

const currentBreaks = [
  { name:"Summer Break",           start:"2026-06-11", end:"2026-08-12", emoji:"☀️" },
  { name:"Labor Day Weekend",      start:"2026-09-05", end:"2026-09-07", emoji:"🇺🇸" },
  { name:"Veterans Day",           start:"2026-11-11", end:"2026-11-11", emoji:"🎖️" },
  { name:"Thanksgiving Break",     start:"2026-11-21", end:"2026-11-29", emoji:"🦃" },
  { name:"Winter Break",           start:"2026-12-19", end:"2027-01-13", emoji:"❄️" },
  { name:"MLK Day Weekend",        start:"2027-01-16", end:"2027-01-18", emoji:"✊" },
  { name:"Lincoln's Birthday",     start:"2027-02-06", end:"2027-02-08", emoji:"🎩" },
  { name:"Presidents' Day Weekend",start:"2027-02-13", end:"2027-02-15", emoji:"🇺🇸" },
  { name:"Spring Break",           start:"2027-03-26", end:"2027-04-04", emoji:"🌸" },
  { name:"Memorial Day Weekend",   start:"2027-05-29", end:"2027-05-31", emoji:"🇺🇸" },
  { name:"Summer Break",           start:"2027-06-10", end:"2027-08-31", emoji:"☀️" }
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
