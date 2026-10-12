import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

const TECHNOLOGIES = [
  { id: "photometry", label: "Photometry", fg: "#0B3E66", bd: "#1E63B4", bg: "#DDEAF7" },
  { id: "ise", label: "I.S.E", fg: "#1E5631", bd: "#2F8F4E", bg: "#DFF3E3" },
  { id: "clia", label: "C.L.I.A", fg: "#0E2238", bd: "#2C4863", bg: "#E1E7EC" },
  { id: "hplc", label: "H.P.L.C", fg: "#7A4E14", bd: "#B96E1D", bg: "#FBEAD3" },
  { id: "hematology", label: "Hematology", fg: "#7A3223", bd: "#B44637", bg: "#F5DFD9" },
  { id: "microscopy", label: "Microscopy", fg: "#1F4260", bd: "#3C6E96", bg: "#DCE9F3" },
  { id: "lcms-ms", label: "LCMS-MS", fg: "#5C1D82", bd: "#8E38C4", bg: "#F3E8FA" },
  { id: "icp-ms", label: "ICP-MS", fg: "#005A60", bd: "#028790", bg: "#DFF5F7" },
  { id: "manual", label: "Manual", fg: "#4A3B63", bd: "#7357A0", bg: "#ECE6F5" }
];

const SAMPLES = [
  { id: "serum", label: "Serum" },
  { id: "fluoride", label: "Fluoride" },
  { id: "edta", label: "EDTA" },
  { id: "urine", label: "Urine" },
  { id: "dbs", label: "DBS" },
  { id: "sebl", label: "Serum / Whole Blood" }
];

const CATEGORIES = [
  { id: "diabetes", label: "Diabetes" },
  { id: "liver-function", label: "Liver Function" },
  { id: "kidney-function", label: "Kidney Function" },
  { id: "electrolytes", label: "Electrolytes" },
  { id: "pancreatic-function", label: "Pancreatic Function" },
  { id: "metabolic-disorder", label: "Metabolic Disorder" },
  { id: "lipid-profile", label: "Lipid Profile" },
  { id: "thyroid", label: "Thyroid" },
  { id: "iron-studies", label: "Iron Studies" },
  { id: "vitamins", label: "Vitamins" },
  { id: "cardiac", label: "Cardiac Marker" },
  { id: "reproductive-hormones", label: "Reproductive & Endocrine Hormones" },
  { id: "pregnancy", label: "Pregnancy" },
  { id: "tumor-markers", label: "Tumor Markers" },
  { id: "infectious-disease", label: "Infectious Disease" },
  { id: "bone-metabolism", label: "Bone Metabolism" },
  { id: "allergy-immunology", label: "Allergy" },
  { id: "general-biochemistry", label: "General Biochemistry" },
  { id: "hematology", label: "Hematology" },
  { id: "urine", label: "Urine" },
  { id: "stress-hormone", label: "Stress Hormone" },
  { id: "thyroid-autoimmune", label: "Thyroid Autoimmune" },
  { id: "arthritis-autoimmune", label: "Arthritis Autoimmune" },
  { id: "infertility", label: "Infertility" },
  { id: "toxic-elements", label: "Toxic & Trace Elements" },
  { id: "torch-panel", label: "TORCH Infections" },
  { id: "maternal-fetal", label: "Maternal & Fetal Screening" },
  { id: "autoimmune", label: "Autoimmune & Immunology" },
  { id: "special-chemistry", label: "Special Chemistry" },
  { id: "tdm", label: "Therapeutic Drug Monitoring" }
];

const DEPARTMENTS = [
  { id: "biochemistry", label: "Biochemistry" },
  { id: "immunoassay", label: "Immunoassay / Serology" },
  { id: "hematology", label: "Hematology" },
  { id: "clinical-pathology", label: "Clinical Pathology" }
];

const techMap = {
  'PHOTOMETRY': 'photometry',
  'I.S.E': 'ise',
  'C.L.I.A': 'clia',
  'E.C.L.I.A': 'clia',
  'H.P.L.C': 'hplc',
  'HEMATOLOGY': 'hematology',
  'MICROSCOPY': 'microscopy',
  'LCMS-MS': 'lcms-ms',
  'ICP-MS': 'icp-ms',
  'MANUAL': 'manual'
};

const sampleMap = {
  'SERUM': 'serum',
  'FLUORIDE': 'fluoride',
  'EDTA': 'edta',
  'URINE': 'urine',
  'DBS': 'dbs',
  'SEBL': 'sebl'
};

function formatTitle(s) {
  if (!s) return '';
  const acronyms = new Set(['IGG', 'IGM', 'IGA', 'AFP', 'CEA', 'PSA', 'FPSA', 'NSE', 'HE4', 'DHEA-S', 'DHEA',
    'ACTH', 'PTH', 'HGH', 'AMH', 'FSH', 'LH', 'PRL', 'TSH', 'FT3', 'FT4', 'TT3', 'TT4',
    'T3', 'T4', 'FBHCG', 'PAPPA', 'BHCG', 'UE3', 'E3', 'CK-MB', 'CPK', 'BNP', 'PROBNP',
    'P1NP', 'IL-6', 'PCT', 'TB', 'EBV', 'HAV', 'HEV', 'HBEAG', 'HBSAG',
    'ADA', 'LCMS-MS', 'ICP-MS', 'EDTA', 'DBS', 'CBC', 'CUA', 'HBA1C', 'FBS', 'PPBS',
    'RBS', 'LDH', 'GGT', 'SGOT', 'SGPT', 'AST', 'ALT', 'TIBC', 'UIBC', 'EGFR', 'BUN']);
  const words = String(s).trim().split(/\s+/);
  return words.map(w => {
    const clean = w.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (acronyms.has(clean)) return w;
    if (w.length > 1 && w === w.toUpperCase()) return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    return w;
  }).join(' ');
}

function stripParenthesesCount(name) {
  return String(name || '').replace(/\s*\(\s*(?:\d+|\d+\+\d+|T\d+)\s*\)\s*$/i, '').trim();
}

function cleanProfileTitle(name) {
  const stripped = stripParenthesesCount(name);
  const words = stripped.split(/\s+/);
  return words.map(w => {
    const u = w.toUpperCase();
    if (['AVM', 'ERP', 'BMP', 'SMP', 'AMP', 'PCOD', 'DM', 'TM', 'QM'].includes(u)) return u;
    if (['and', 'with', 'to', 'for', 'of', 'in'].includes(w.toLowerCase())) return w.toLowerCase();
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  }).join(' ');
}

function getCrlCategory(code, desc) {
  const c = String(code || '').toUpperCase();
  const d = String(desc || '').toLowerCase();
  if (c.startsWith('BTE')) return ['toxic-elements', 'biochemistry'];
  if (c.startsWith('TX_') || c.startsWith('CM_') || c.startsWith('HS') || c.startsWith('RB_') || c.startsWith('HC_')) {
    return ['torch-panel', 'immunoassay'];
  }
  if (['measles', 'mumps', 'ebv', 'hav', 'hev', 'dengue', 'syphilis', 'tb', 'h.pylori', 'varicella', 'covid', 'sars', 'hepatitis'].some(k => d.includes(k))) {
    return ['infectious-disease', 'immunoassay'];
  }
  if (['afp', 'ca 19', 'ca 15', 'ca 72', 'cyfra', 'psa', 'nse', 'he4', 'pivka', 'tumor'].some(k => d.includes(k))) {
    return ['tumor-markers', 'immunoassay'];
  }
  if (d.includes('vitamin') || d.includes('vit')) {
    return ['vitamins', 'biochemistry'];
  }
  if (['testosterone', 'estriol', 'progesterone', 'dhea', 'growth hormone', 'acth', 'aldosterone', 'renin', 'androstenedione', 'proinsulin'].some(k => d.includes(k))) {
    return ['reproductive-hormones', 'immunoassay'];
  }
  if (['estriol', 'inhibin', 'fbhcg', 'pappa', 'double marker', 'triple marker'].some(k => d.includes(k))) {
    return ['maternal-fetal', 'immunoassay'];
  }
  if (['anti nuclear', 'ana', 'dsdna', 'tissue transglutaminase', 'islet', 'anti-gad', 'iaa', 'scl-70'].some(k => d.includes(k))) {
    return ['autoimmune', 'immunoassay'];
  }
  if (['pth', 'ostase', 'osteocalcin', 'p1np', 'b-ctx', 'calcitonin'].some(k => d.includes(k))) {
    return ['bone-metabolism', 'immunoassay'];
  }
  if (['troponin', 'ck-mb', 'probnp', 'd dimer'].some(k => d.includes(k))) {
    return ['cardiac', 'immunoassay'];
  }
  if (['cyclosporine', 'tacrolimus', 'digoxin'].some(k => d.includes(k))) {
    return ['tdm', 'immunoassay'];
  }
  if (['thyroglobulin', 'tsh receptor'].some(k => d.includes(k))) {
    return ['thyroid', 'immunoassay'];
  }
  return ['special-chemistry', 'biochemistry'];
}

const excelPath = path.resolve('CRL TEST MENU FINAL 07.10.2026 (KKK).xlsx');
const buf = fs.readFileSync(excelPath);
const wb = XLSX.read(buf, { type: 'buffer' });

const lplSheet = wb.Sheets['LPL TESTS'];
const lplRows = XLSX.utils.sheet_to_json(lplSheet, { header: 1 });
const lplTests = [];
for (let r = 1; r < lplRows.length; r++) {
  const row = lplRows[r];
  if (!row || row[0] === undefined || row[0] === null || row[0] === '') continue;
  const sr = Number(row[0]);
  const code = String(row[1] || '').trim();
  const desc = String(row[2] || '').trim();
  const techRaw = String(row[3] || 'PHOTOMETRY').trim().toUpperCase();
  const sampleRaw = String(row[4] || 'SERUM').trim().toUpperCase();
  const cprt = row[5] !== undefined && row[5] !== null ? Number(Number(row[5]).toFixed(2)) : 0;
  const rawB2b = row[6] !== undefined && row[6] !== null ? Number(row[6]) : 0;
  const b2b = Number((rawB2b * 0.5).toFixed(2));
  const b2c = row[7] !== undefined && row[7] !== null ? Math.round(Number(row[7])) : 0;
  const analyzer = row[8] ? String(row[8]).trim() : null;

  let fasting = null;
  const dLower = desc.toLowerCase();
  if (dLower.includes('fasting') || code.toUpperCase() === 'FBS') {
    fasting = true;
  } else if (dLower.includes('postprandial') || dLower.includes('ppbs') || dLower.includes('random')) {
    fasting = false;
  }

  let name = formatTitle(desc);
  const uCode = code.toUpperCase();
  if (uCode === 'VITB') name = "Vitamin B12";
  else if (uCode === 'VITDC') name = "25-OH Vitamin D Total";
  else if (uCode === 'TROP') name = "Troponin";
  else if (uCode === 'UTSH') name = "Thyroid-Stimulating Hormone (TSH)";
  else if (uCode === 'TT3') name = "Total Triiodothyronine (T3)";
  else if (uCode === 'TT4') name = "Total Thyroxine (T4)";
  else if (uCode === 'FT3') name = "Free Triiodothyronine (FT3)";
  else if (uCode === 'FT4') name = "Free Thyroxine (FT4)";

  lplTests.push({
    sr,
    code,
    name,
    aliases: [name, desc, code],
    techId: techMap[techRaw] || 'photometry',
    sampleId: sampleMap[sampleRaw] || 'serum',
    b2b,
    b2c,
    cprt,
    categoryId: 'general-biochemistry',
    departmentId: 'biochemistry',
    displayOrder: sr,
    fastingRequired: fasting,
    homeCollection: true,
    reportType: "Digital",
    container: null,
    sampleVolume: null,
    tat: null,
    analyzer,
    processedAt: "LPL",
    active: true
  });
}

const crlSheet = wb.Sheets['CRL TESTS'];
const crlRows = XLSX.utils.sheet_to_json(crlSheet, { header: 1 });
const crlTests = [];
for (let r = 1; r < crlRows.length; r++) {
  const row = crlRows[r];
  if (!row || row[0] === undefined || row[0] === null || row[0] === '') continue;
  const sr = Number(row[0]);
  const rawCode = String(row[1] || '').trim();
  const desc = String(row[2] || '').trim();
  const techRaw = String(row[3] || 'C.L.I.A').trim().toUpperCase();
  const sampleRaw = String(row[4] || 'SERUM').trim().toUpperCase();
  const fastingRaw = String(row[5] || 'Non-Fasting').trim();
  const cprt = row[6] !== undefined && row[6] !== null ? Number(Number(row[6]).toFixed(2)) : 0;
  const b2b = row[7] !== undefined && row[7] !== null ? Math.round(Number(row[7])) : 0;
  const b2c = row[8] !== undefined && row[8] !== null ? Math.round(Number(row[8])) : 0;
  const analyzer = row[9] ? String(row[9]).trim() : null;

  let code = rawCode;
  let displayCode = rawCode;
  if (code.toUpperCase() === 'CA199') {
    code = 'CA199_CRL';
    displayCode = 'CA199';
  }

  const fLower = fastingRaw.toLowerCase();
  const fasting = fLower.includes('fasting') && !fLower.includes('non');
  const [catId, deptId] = getCrlCategory(rawCode, desc);

  let cleanName = formatTitle(desc);
  if (rawCode.toUpperCase().startsWith('BTE')) {
    cleanName = desc.charAt(0).toUpperCase() + desc.slice(1).toLowerCase();
  }

  const aliases = [cleanName, desc, rawCode];
  if (displayCode !== code) aliases.push(code);

  crlTests.push({
    sr: lplTests.length + sr,
    code,
    displayCode,
    name: cleanName,
    aliases,
    techId: techMap[techRaw] || 'clia',
    sampleId: sampleMap[sampleRaw] || 'serum',
    b2b,
    b2c,
    cprt,
    categoryId: catId,
    departmentId: deptId,
    displayOrder: lplTests.length + sr,
    fastingRequired: fasting,
    homeCollection: true,
    reportType: "Digital",
    container: null,
    sampleVolume: null,
    tat: null,
    analyzer,
    processedAt: "CRL",
    active: true
  });
}

const allTests = [...lplTests, ...crlTests];
const allByCode = {};
allTests.forEach(t => {
  allByCode[t.code.toUpperCase()] = t;
  if (t.displayCode) allByCode[t.displayCode.toUpperCase()] = t;
});

const codeSynonyms = {
  'VB12': 'VITB',
  'VITDT': 'VITDC',
  'T3': 'TT3',
  'T4': 'TT4',
  'TSH': 'UTSH',
  'HBA': 'A1C',
  'HEMO': 'CBC',
  'LIPID': 'CHOL',
  'INHIBIN A': 'INHIB',
  'STANDARD BIO PROFILE': 'BMP',
};

function resolveCode(tok) {
  const u = String(tok || '').trim().toUpperCase();
  if (allByCode[u]) return allByCode[u].code;
  if (codeSynonyms[u] && allByCode[codeSynonyms[u]]) return allByCode[codeSynonyms[u]].code;
  return u;
}

function tokenize(str) {
  if (!str) return [];
  return String(str)
    .split(/[\+,\-]+|\s+(?:and|with|Profile|PROFILE)\s+/i)
    .map(t => t.trim())
    .filter(Boolean);
}

const packages = [];

const lplP = XLSX.utils.sheet_to_json(wb.Sheets['LPL PROFILE'], { header: 1 });
for (let r = 1; r < lplP.length; r++) {
  const row = lplP[r];
  if (!row || !row[1] || row[4] === undefined) continue;
  const name = String(row[1]).trim();
  const contents = String(row[2] || '').trim();
  const b2c = Math.round(Number(row[5]));
  const b2b = Math.round(b2c * 0.5);

  const pId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  let resolvedCodes = tokenize(contents).map(resolveCode).filter(c => allByCode[c.toUpperCase()]);

  const nLower = name.toLowerCase();
  if (nLower.includes('advance thyroid')) {
    resolvedCodes = ["TT3", "TT4", "UTSH", "FT3", "FT4"];
  } else if (nLower.includes('total thyoid') || nLower.includes('total thyroid')) {
    resolvedCodes = ["TT3", "TT4", "UTSH"];
  } else if (nLower.includes('vitamin profile')) {
    resolvedCodes = ["VITDC", "VITB"];
  }

  packages.push({
    id: pId,
    name: cleanProfileTitle(name),
    rawName: name,
    description: `Comprehensive ${name} panel processed at Local Processing Laboratory.`,
    categoryId: "general-biochemistry",
    processedAt: "LPL",
    category: "LPL",
    cprt,
    pricing: { b2b, b2c },
    codes: resolvedCodes,
    contentsText: contents,
    active: true
  });
}

const crlP = XLSX.utils.sheet_to_json(wb.Sheets['CRL PROFILE'], { header: 1 });
for (let r = 1; r < crlP.length; r++) {
  const row = crlP[r];
  if (!row || !row[2] || row[6] === undefined) continue;
  const code = row[1] ? String(row[1]).trim() : null;
  const name = String(row[2]).trim();
  const sample = row[3] ? String(row[3]).trim() : 'SERUM';
  const cprt = row[5] !== undefined ? Number(Number(row[5]).toFixed(2)) : 0;
  const b2b = Math.round(Number(row[6]));
  const b2c = Math.round(Number(row[7]));
  const contents = row[14] ? String(row[14]).trim() : '';

  const pId = `crl-${String(code || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
  let resolvedCodes = tokenize(contents).map(resolveCode).filter(c => allByCode[c.toUpperCase()]);
  let calculatedParams = [];

  const uCode = (code || '').toUpperCase();
  if (uCode === 'E22') {
    resolvedCodes = crlTests.filter(t => t.code.startsWith('BTE')).map(t => t.code);
  } else if (uCode === 'VBC') {
    resolvedCodes = ["VITB1", "VITB2", "VITB3", "VITB5", "VITB6", "VITB7", "VITB9", "VITB"];
  } else if (uCode === 'VDP') {
    resolvedCodes = ["VITDC", "VITD3"];
    calculatedParams = ["Vitamin D2 (Ergocalciferol)"];
  } else if (uCode === 'FSV') {
    resolvedCodes = ["VITA", "VITDC", "VITD3", "VITE", "VITK"];
    calculatedParams = ["Vitamin D2 (Ergocalciferol)"];
  } else if (uCode === 'CVP') {
    resolvedCodes = ["VITA", "VITDC", "VITD3", "VITE", "VITK", "VITB1", "VITB2", "VITB3", "VITB5", "VITB6", "VITB7", "VITB9", "VITB"];
    calculatedParams = ["Vitamin D2 (Ergocalciferol)"];
  } else if (uCode === 'ATP') {
    resolvedCodes = ["TT3", "TT4", "UTSH", "FT3", "FT4", "AMA"];
  } else if (uCode === 'QM') {
    resolvedCodes = ["BHCG", "AFP", "E3", "INHIB"];
  }

  let cleanN = cleanProfileTitle(name);
  const nLower = name.toLowerCase();
  if (nLower.includes('8 to 13 weeks')) {
    cleanN = "Double Marker Profile (8 to 13 Weeks)";
  } else if (nLower.includes('14 to 22 weeks') && nLower.includes('triple')) {
    cleanN = "Triple Marker Profile (14 to 22 Weeks)";
  } else if (nLower.includes('14 to 22 weeks') && nLower.includes('quad')) {
    cleanN = "Quadruple Marker Profile (14 to 22 Weeks)";
  }

  packages.push({
    id: pId,
    code,
    name: cleanN,
    rawName: name,
    description: `${name} panel processed at Central Reference Laboratory.`,
    categoryId: "special-chemistry",
    processedAt: "CRL",
    category: "CRL",
    sample,
    cprt,
    pricing: { b2b, b2c },
    codes: resolvedCodes,
    calculatedParams,
    contentsText: contents,
    active: true
  });
}

const spP = XLSX.utils.sheet_to_json(wb.Sheets['SPECIALITY PROFILE'], { header: 1 });
for (let r = 1; r < spP.length; r++) {
  const row = spP[r];
  if (!row || !row[1] || (row[4] === undefined && row[5] === undefined)) continue;
  const name = String(row[1]).trim();
  const contents = String(row[2] || '').trim();
  const cprt = row[3] !== undefined ? Number(Number(row[3]).toFixed(2)) : 0;
  const rawB2b = row[4] !== undefined ? Math.round(Number(row[4])) : 0;
  const roundB2b = row[5] !== undefined ? Math.round(Number(row[5])) : rawB2b;
  const rawB2c = row[6] !== undefined ? Math.round(Number(row[6])) : 0;
  const roundB2c = row[7] !== undefined ? Math.round(Number(row[7])) : rawB2c;

  const pId = `sp-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
  const resolvedCodes = tokenize(contents).map(resolveCode).filter(c => allByCode[c.toUpperCase()]);
  const cleanN = cleanProfileTitle(name);

  packages.push({
    id: pId,
    name: cleanN,
    rawName: name,
    description: `Speciality Diagnostic Panel: ${cleanN}.`,
    categoryId: "special-chemistry",
    processedAt: "CRL",
    category: "Speciality",
    cprt,
    pricing: { b2b: roundB2b, b2c: roundB2c },
    rawPricing: { b2b: rawB2b, b2c: rawB2c },
    codes: resolvedCodes,
    contentsText: contents,
    active: true
  });
}

const techById = Object.fromEntries(TECHNOLOGIES.map(t => [t.id, t]));
const sampleById = Object.fromEntries(SAMPLES.map(s => [s.id, s]));
const categoryById = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));
const departmentById = Object.fromEntries(DEPARTMENTS.map(d => [d.id, d]));

const joined = allTests.map(t => ({
  ...t,
  displayCode: t.displayCode || t.code,
  tech: techById[t.techId] ? techById[t.techId].label : t.techId,
  sample: sampleById[t.sampleId] ? sampleById[t.sampleId].label : t.sampleId,
  category: categoryById[t.categoryId] ? categoryById[t.categoryId].label : null,
  department: departmentById[t.departmentId] ? departmentById[t.departmentId].label : null,
  processedAt: t.processedAt || "LPL",
}));

const catalogData = {
  tests: joined,
  packages,
  technologies: TECHNOLOGIES,
  samples: SAMPLES,
  categories: CATEGORIES,
  departments: DEPARTMENTS,
  priceBands: [
    { id: "under-200", label: "Under ₹200", max: 199 },
    { id: "200-500", label: "₹200 – ₹500", min: 200, max: 500 },
    { id: "500-1000", label: "₹500 – ₹1,000", min: 501, max: 1000 },
    { id: "above-1000", label: "Above ₹1,000", min: 1001 },
  ],
  conflictGroups: [
    {
      id: "blood-sugar",
      label: "Blood Sugar",
      note: "Same glucose analyte under different collection conditions — choose the one that matches your patient's state.",
      codes: ["FBS", "PPBS", "RBS"],
    },
    {
      id: "fasting-insulin",
      label: "Fasting Insulin",
      note: "Fasting Insulin needs a fasting sample — it can't be drawn alongside a post-meal or random blood sugar.",
      codes: ["INSFA", "PPBS", "RBS"],
    },
  ]
};

fs.mkdirSync('lib', { recursive: true });
fs.writeFileSync('lib/catalog.json', JSON.stringify(catalogData, null, 2));
console.log(`Saved catalog.json with ${joined.length} tests and ${packages.length} packages.`);
