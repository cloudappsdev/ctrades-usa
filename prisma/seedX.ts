import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { TRADE_CATEGORIES } from "../src/app/contractors/register/options";
import { CITIES } from "@/src/lib/cities";

// A second batch on top of seed.ts. Self-contained rather than importing the
// helpers from seed.ts, because that module calls main() on import.
const COUNT = 350;
const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;

/**
 * Deterministic PRNG (mulberry32) rather than Math.random, so a given seed
 * always produces the same names, trades, and cities. Only the timestamps move,
 * since they're anchored to the current run's clock.
 */
function makeRandom(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Different seed from seed.ts (20260827) so this batch isn't a rerun of the
// same 300 names with 50 more appended.
const random = makeRandom(20260901);

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(random() * items.length)];
}

function chance(probability: number) {
  return random() < probability;
}

const SURNAMES = [
  "Alvarez",
  "Bishop",
  "Calderon",
  "Doyle",
  "Ellsworth",
  "Fontaine",
  "Gallagher",
  "Hoffman",
  "Ibarra",
  "Jankowski",
  "Kowalski",
  "Lindqvist",
  "Marchetti",
  "Nakamura",
  "Okafor",
  "Petrov",
  "Quintero",
  "Rasmussen",
  "Salazar",
  "Thibodeaux",
  "Ustinov",
  "Vandenberg",
  "Whitaker",
  "Xiong",
  "Yamamoto",
  "Zabala",
  "Brennan",
  "Castellanos",
  "Delgado",
  "Eriksen",
  "Faulkner",
  "Guzman",
  "Hollister",
  "Iverson",
  "Kirkland",
  "Lombardi",
  "Mendoza",
  "Novak",
  "Ortega",
  "Pemberton",
] as const;

const FIRST_NAMES = [
  "Marcus",
  "Dana",
  "Rafael",
  "Priya",
  "Joel",
  "Simone",
  "Curtis",
  "Talia",
  "Bo",
  "Adaeze",
  "Hank",
  "Yusuf",
  "Renata",
  "Dwight",
  "Lena",
  "Omar",
  "Cheryl",
  "Nate",
  "Imani",
  "Gus",
  "Marisol",
  "Theo",
  "Fern",
  "Duane",
  "Alina",
  "Roscoe",
  "Bianca",
  "Levi",
  "Noor",
  "Wade",
] as const;

/** Words a shop would actually put on a truck, keyed by trade. */
const TRADE_WORDS: Record<string, string> = {
  plumbing: "Plumbing",
  windows: "Window",
  electric: "Electric",
  carpentry: "Carpentry",
  roofing: "Roofing",
  hvac: "Heating & Air",
  masonry: "Masonry",
  painting: "Painting",
  landscaping: "Landscaping",
};

const BUSINESS_SUFFIXES = [
  "LLC",
  "Inc.",
  "& Sons",
  "Co.",
  "Services",
  "Contractors",
  "Group",
  "",
] as const;

const CITY_PREFIXES = ["North", "South", "East", "West", "Old"] as const;
const CITY_SUFFIXES = ["Heights", "Park", "Grove", "Ridge", "Springs"] as const;

/** Strip the "-TX" style state suffix, leaving "Winston-Salem" alone. */
function bareCityName(city: string) {
  return city.replace(/-[A-Z]{2}$/, "");
}

/**
 * A plausible city inside the metro: usually the metro's own city, sometimes a
 * neighboring locality derived from it.
 */
function cityWithin(metroArea: string) {
  const base = bareCityName(metroArea);

  if (chance(0.55)) return base;
  if (chance(0.5)) return `${pick(CITY_PREFIXES)} ${base}`;
  return `${base} ${pick(CITY_SUFFIXES)}`;
}

const SERVICE_LISTS: Record<string, string> = {
  plumbing:
    "Repipes, water heater installation, drain cleaning, leak detection, fixture replacement",
  windows:
    "Window replacement, storm windows, screen repair, glass replacement, weatherproofing",
  electric:
    "Panel upgrades, EV charger installation, rewiring, lighting design, generator hookup",
  carpentry:
    "Framing, trim and molding, custom built-ins, deck construction, door hanging",
  roofing:
    "Tear-off and reroof, shingle repair, flashing, gutter installation, leak inspection",
  hvac: "AC installation, furnace repair, ductwork, heat pumps, seasonal maintenance",
  masonry:
    "Brick repair, stone veneer, retaining walls, tuckpointing, chimney rebuilds",
  painting:
    "Interior repaint, exterior repaint, cabinet refinishing, drywall patching, staining",
  landscaping:
    "Design and install, irrigation, sod and seeding, hardscape, seasonal cleanup",
};

function aboutText(
  name: string,
  trade: string,
  city: string,
  years: number,
  isBusiness: boolean,
) {
  const word = (TRADE_WORDS[trade] ?? trade).toLowerCase();

  return isBusiness
    ? `${name} has served the ${city} area for ${years} years. Licensed, bonded, and insured, with a crew that handles residential ${word} work from small repairs to full replacements.`
    : `Owner-operated ${word} work in and around ${city}. ${years} years on the tools, licensed and insured, and every job is one I show up to myself.`;
}

function buildContractors(now: Date) {
  const rows = [];

  for (let i = 0; i < COUNT; i += 1) {
    const isBusiness = chance(0.62);
    const trade = pick(TRADE_CATEGORIES);
    const metroArea = pick(CITIES);
    const city = cityWithin(metroArea);
    const surname = pick(SURNAMES);
    const years = 2 + Math.floor(random() * 34);

    const tradeWord = TRADE_WORDS[trade] ?? trade;
    const suffix = pick(BUSINESS_SUFFIXES);

    const cName = isBusiness
      ? `${surname} ${tradeWord}${suffix ? ` ${suffix}` : ""}`
      : `${pick(FIRST_NAMES)} ${surname}`;

    rows.push({
      cName,
      contractorType: isBusiness
        ? ("BUSINESS" as const)
        : ("INDIVIDUAL" as const),
      // Stored lowercase to match how the register action normalizes input.
      tradeCategory: trade,
      metroArea,
      city,
      about: aboutText(
        cName,
        trade,
        bareCityName(metroArea),
        years,
        isBusiness,
      ),
      services: SERVICE_LISTS[trade] ?? null,
      // Uniformly spread across the last ten days.
      mostRecentlyActive: new Date(now.getTime() - random() * TEN_DAYS_MS),
    });
  }

  return rows;
}

/** `tsx prisma/seedX.ts --dry-run` prints a sample without touching the database. */
function dryRun() {
  const rows = buildContractors(new Date());
  const byType = rows.filter((r) => r.contractorType === "BUSINESS").length;

  console.log(`Generated ${rows.length} rows (no database writes).`);
  console.log(`BUSINESS: ${byType}  INDIVIDUAL: ${rows.length - byType}`);
  console.log(`Distinct names: ${new Set(rows.map((r) => r.cName)).size}`);
  console.log(
    `Distinct metro areas: ${new Set(rows.map((r) => r.metroArea)).size}`,
  );
  console.log(
    `Trades used: ${new Set(rows.map((r) => r.tradeCategory)).size} of ${TRADE_CATEGORIES.length}`,
  );

  const sorted = [...rows].sort(
    (a, b) => a.mostRecentlyActive.getTime() - b.mostRecentlyActive.getTime(),
  );
  console.log(`Oldest active: ${sorted[0].mostRecentlyActive.toISOString()}`);
  console.log(
    `Newest active: ${sorted[sorted.length - 1].mostRecentlyActive.toISOString()}`,
  );

  // Day-by-day histogram, so it's easy to see the spread covers all ten days.
  const now = Date.now();
  const perDay = new Array(10).fill(0);
  for (const row of rows) {
    const dayAgo = Math.floor(
      (now - row.mostRecentlyActive.getTime()) / 86_400_000,
    );
    perDay[Math.min(Math.max(dayAgo, 0), 9)] += 1;
  }
  console.log("\nRows per day (0 = today):");
  perDay.forEach((n, day) => console.log(`  -${day}d: ${n}`));

  console.log("\nFirst 5 rows:");
  for (const row of rows.slice(0, 5)) {
    console.log(
      `  ${row.cName} | ${row.contractorType} | ${row.tradeCategory} | ${row.city}, ${row.metroArea} | ${row.mostRecentlyActive.toISOString()}`,
    );
  }
}

async function main() {
  if (process.argv.includes("--dry-run")) {
    dryRun();
    return;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const before = await prisma.contractor.count();
    const rows = buildContractors(new Date());

    const { count } = await prisma.contractor.createMany({ data: rows });
    const after = await prisma.contractor.count();

    const oldest = rows.reduce(
      (min, r) => (r.mostRecentlyActive < min ? r.mostRecentlyActive : min),
      rows[0].mostRecentlyActive,
    );
    const newest = rows.reduce(
      (max, r) => (r.mostRecentlyActive > max ? r.mostRecentlyActive : max),
      rows[0].mostRecentlyActive,
    );

    console.log(`Inserted ${count} contractors (${before} → ${after} rows).`);
    console.log(
      `mostRecentlyActive spans ${oldest.toISOString()} → ${newest.toISOString()}`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Not top-level await: the project has no `"type": "module"`, so tsx compiles
// this to CJS where top-level await isn't available.
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
