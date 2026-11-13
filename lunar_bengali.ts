type Payload =
  | { mode: "forward"; jdn: number; gregorian: { year: number; month: number; day: number } }
  | { mode: "reverse"; calendar: "hijri" | "bengali"; year: number; month: number; day: number };

const arg: Payload = JSON.parse(process.argv[2]);

const HIJRI_MONTHS = ["Muharram","Safar","Rabi' al-Awwal","Rabi' al-Thani",
  "Jumada al-Awwal","Jumada al-Thani","Rajab","Sha'ban","Ramadan","Shawwal",
  "Dhu al-Qi'dah","Dhu al-Hijjah"];
const BN_MONTHS = ["Boishakh (বৈশাখ)","Jyoishtho (জ্যৈষ্ঠ)","Asharh (আষাঢ়)","Shrabon (শ্রাবণ)",
  "Bhadro (ভাদ্র)","Ashshin (আশ্বিন)","Kartik (কার্তিক)","Ogrohayon (অগ্রহায়ণ)",
  "Poush (পৌষ)","Magh (মাঘ)","Falgun (ফাল্গুন)","Choitro (চৈত্র)"];

const isGregLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

function getBengali(gY: number, gM: number, gD: number): string {
  const leap = isGregLeap(gY);
  const bd   = (gM < 4 || (gM === 4 && gD < 14)) ? gY - 594 : gY - 593;
  const days = [31,31,31,31,31,31,30,30,30,30, leap ? 30 : 29, 30];
  const startYear = (gM < 4 || (gM === 4 && gD < 14)) ? gY - 1 : gY;
  let elapsed = Math.floor((Date.UTC(gY, gM - 1, gD) - Date.UTC(startYear, 3, 14)) / 86400000);
  for (let i = 0; i < 12; i++) {
    if (elapsed < days[i]) return `${elapsed + 1} ${BN_MONTHS[i]}, ${bd} বঙ্গাব্দ`;
    elapsed -= days[i];
  }
  return "";
}

function getHijri(jdn: number): string {
  const l  = jdn - 1948440 + 10632;
  const n  = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j  = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719)
           + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50)
                - Math.floor(j / 16)     * Math.floor((15238 * j) / 43) + 29;
  const m  = Math.floor((24 * l3) / 709);
  return `${l3 - Math.floor((709 * m) / 24)} ${HIJRI_MONTHS[m - 1]}, ${30 * n + j - 30} AH`;
}

const hijriToJdn = (y: number, m: number, d: number) =>
  d + Math.ceil(29.5 * (m - 1)) + 354 * (y - 1) + Math.floor((3 + 11 * y) / 30) + 1948439;

function bengaliToJdn(y: number, m: number, d: number): number {
  const gregStart = y + 593;               // Bengali year Y starts 14 April Y+593
  const falgun    = isGregLeap(gregStart + 1) ? 30 : 29;
  const days      = [31,31,31,31,31,31,30,30,30,30,falgun,30];
  let offset = 0;
  for (let i = 0; i < m - 1; i++) offset += days[i];

  const a  = Math.floor((14 - 4) / 12);
  const yy = gregStart + 4800 - a;
  const mm = 4 + 12 * a - 3;
  const jdnStart = 14 + Math.floor((153 * mm + 2) / 5) + 365 * yy
                 + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  return jdnStart + offset + (d - 1);
}

if (arg.mode === "forward") {
  console.log(JSON.stringify({
    bengali: getBengali(arg.gregorian.year, arg.gregorian.month, arg.gregorian.day),
    hijri:   getHijri(arg.jdn),
  }));
} else if (arg.mode === "reverse") {
  const { calendar, year, month, day } = arg;
  const jdn = calendar === "hijri" ? hijriToJdn(year, month, day)
            : calendar === "bengali" ? bengaliToJdn(year, month, day)
            : (() => { throw new Error(`Unknown lunar calendar: ${calendar}`); })();
  console.log(JSON.stringify({ jdn }));
} else {
  throw new Error(`Unknown mode: ${(arg as any).mode}`);
}
