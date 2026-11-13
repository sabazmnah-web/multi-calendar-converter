const arg = JSON.parse(process.argv[2]);

const COPTIC_MONTHS = ["Thout","Paopi","Hathor","Koiak","Tobi","Meshir",
  "Paremhat","Parmouti","Pashons","Paoni","Epip","Mesori","Pi Kogi Enavot"];
const EGYPT_MONTHS = ["I Akhet (Thoth)","II Akhet (Phaophi)","III Akhet (Athyr)","IV Akhet (Choiak)",
  "I Peret (Tybi)","II Peret (Mechir)","III Peret (Phamenoth)","IV Peret (Pharmuthi)",
  "I Shemu (Pachons)","II Shemu (Payni)","III Shemu (Epiphi)","IV Shemu (Mesore)",
  "Epagomenal Days (Hryw Rnpt)"];

const COPTIC_EPOCH = 1825030;
const EGYPT_EPOCH  = 1448638;

const getJulian = jdn => {
  const c = jdn + 32082;
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day   = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year  = d - 4800 + Math.floor(m / 10);
  return `${String(day).padStart(2,'0')}-${String(month).padStart(2,'0')}-${year}`;
};

const getCoptic = jdn => {
  const year = Math.floor((4 * (jdn - COPTIC_EPOCH) + 1463) / 1461);
  const dayOfYear = jdn - (COPTIC_EPOCH + 365 * (year - 1) + Math.floor(year / 4));
  return `${(dayOfYear % 30) + 1} ${COPTIC_MONTHS[Math.floor(dayOfYear / 30)]}, ${year} AM`;
};

const getAncientEgyptian = jdn => {
  const daysSinceEpoch = jdn - EGYPT_EPOCH;
  const year = Math.floor(daysSinceEpoch / 365) + 1;
  const dayOfYear = ((daysSinceEpoch % 365) + 365) % 365;
  return `${(dayOfYear % 30) + 1} ${EGYPT_MONTHS[Math.floor(dayOfYear / 30)]} (Year ${year} Nabonassar)`;
};

const julianToJdn = (y, m, d) => {
  const a  = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - 32083;
};

const copticToJdn = (y, m, d) =>
  COPTIC_EPOCH + 365 * (y - 1) + Math.floor(y / 4) + 30 * (m - 1) + (d - 1);

const egyptianToJdn = (y, m, d) =>
  EGYPT_EPOCH + 365 * (y - 1) + 30 * (m - 1) + (d - 1);

if (arg.mode === "forward") {
  console.log(JSON.stringify({
    julian:   getJulian(arg.jdn),
    coptic:   getCoptic(arg.jdn),
    egyptian: getAncientEgyptian(arg.jdn),
  }));
} else if (arg.mode === "reverse") {
  const { calendar, year, month, day } = arg;
  const map = { julian: julianToJdn, coptic: copticToJdn, egyptian: egyptianToJdn };
  if (!map[calendar]) throw new Error(`Unknown solar calendar: ${calendar}`);
  console.log(JSON.stringify({ jdn: map[calendar](year, month, day) }));
}
