
export const AVM_COMMON_GROUPS = {
  tsh: {
    label: 'Thyroid-Stimulating Hormone',
    count: 1,
    codes: ['UTSH'],
    parameters: []
  },
  mg: {
    label: 'Magnesium',
    count: 1,
    codes: ['MG'],
    parameters: []
  },
  phos: {
    label: 'Phosphorous',
    count: 1,
    codes: ['PHOS'],
    parameters: []
  },
  lipid: {
    label: 'Lipid Profile (10)',
    count: 10,
    codes: ['CHOL', 'TRIG', 'HCHO', 'LDL'],
    parameters: [
      'Total Cholesterol',
      'Triglycerides',
      'HDL Cholesterol - Direct',
      'LDL Cholesterol - Direct',
      'Total Cholesterol / HDL Cholesterol Ratio',
      'Triglycerides / HDL Cholesterol Ratio',
      'LDL Cholesterol / HDL Cholesterol Ratio',
      'HDL Cholesterol / LDL Cholesterol Ratio',
      'Non-HDL Cholesterol',
      'VLDL Cholesterol'
    ]
  },
  liver: {
    label: 'Liver Profile (12)',
    count: 12,
    codes: ['PROT', 'SALB', 'ALKP', 'BILD', 'BILT', 'SGPT', 'SGOT', 'GGT'],
    parameters: [
      'Protein - Total',
      'Albumin - Serum',
      'Alkaline Phosphatase',
      'Bilirubin - Direct',
      'Bilirubin - Total',
      'Alanine Transaminase',
      'Aspartate Aminotransferase',
      'Gamma Glutamyl Transferase',
      'Serum Globulin',
      'Serum Albumin / Globulin (A/G) Ratio',
      'Indirect Bilirubin',
      'SGOT / SGPT Ratio (AST/ALT Ratio)'
    ]
  },
  kidney: {
    label: 'Kidney Profile (8)',
    count: 8,
    codes: ['BUN', 'CALC', 'SCRE', 'URIC', 'UREA'],
    parameters: [
      'Uric Acid',
      'Serum Creatinine',
      'Calcium',
      'Urea',
      'Blood Urea Nitrogen',
      'BUN / Creatinine Ratio',
      'eGFR (for Adults only)',
      'Urea / Serum Creatinine Ratio'
    ]
  },
  iron: {
    label: 'Iron Profile (4)',
    count: 4,
    codes: ['IRON', 'TIBC'],
    parameters: [
      'Iron',
      'Total Iron Binding Capacity',
      'Transferrin Saturation (%)',
      'UIBC'
    ]
  },
  amylase: {
    label: 'Amylase',
    count: 1,
    codes: ['AMYL'],
    parameters: []
  },
  lipase: {
    label: 'Lipase',
    count: 1,
    codes: ['LASE'],
    parameters: []
  },
  hba1c: {
    label: 'HbA1c (Glycated Hemoglobin) (2)',
    count: 2,
    codes: ['A1C'],
    parameters: [
      'HbA1c (Glycated Hemoglobin)',
      'Estimated Average Glucose (eAG)'
    ]
  },
  cbc: {
    label: 'Complete Blood Count (CBC) (28)',
    count: 28,
    codes: ['CBC'],
    parameters: [
      'Hemoglobin',
      'Red Blood Cell Count',
      'Hematocrit (PCV)',
      'Mean Corpuscular Volume (MCV)',
      'Mean Corpuscular Hemoglobin (MCH)',
      'Mean Corpuscular Hemoglobin Concentration (MCHC)',
      'Red Cell Distribution Width – SD',
      'Red Cell Distribution Width – CV',
      'White Blood Cell Count',
      'Neutrophils',
      'Lymphocytes',
      'Monocytes',
      'Eosinophils',
      'Basophils',
      'Immature Granulocytes',
      'Nucleated Red Blood Cells',
      'Absolute Neutrophil Count',
      'Absolute Lymphocyte Count',
      'Absolute Monocyte Count',
      'Absolute Eosinophil Count',
      'Absolute Basophil Count',
      'Absolute Immature Granulocytes',
      'Absolute Nucleated Red Blood Cells',
      'Platelet Count',
      'Mean Platelet Volume (MPV)',
      'Platelet Distribution Width (PDW)',
      'Platelet Large Cell Ratio (P-LCR)',
      'Plateletcrit (PCT)'
    ]
  },
  vitb12: {
    label: 'Vitamin B12',
    count: 1,
    codes: ['VITB'],
    parameters: []
  },
  vitd: {
    label: '25-OH Vitamin D Total',
    count: 1,
    codes: ['VITDC'],
    parameters: []
  },
  ferritin: {
    label: 'Ferritin',
    count: 1,
    codes: ['FERR'],
    parameters: []
  },
  copper: {
    label: 'Serum Copper',
    count: 1,
    codes: ['SECU'],
    parameters: []
  },
  zinc: {
    label: 'Serum Zinc',
    count: 1,
    codes: ['SEZN'],
    parameters: []
  },
  crp: {
    label: 'C-Reactive Protein (CRP)',
    count: 1,
    codes: ['CRP'],
    parameters: []
  },
  apoa: {
    label: 'Apolipoprotein A1',
    count: 1,
    codes: ['APOA'],
    parameters: []
  },
  apob: {
    label: 'Apolipoprotein B',
    count: 1,
    codes: ['APOB'],
    parameters: []
  },
  aporatio: {
    label: 'Apo B / Apo A1 Ratio',
    count: 1,
    codes: [],
    parameters: []
  },
  lpa: {
    label: 'Lipoprotein (a)',
    count: 1,
    codes: ['LPA'],
    parameters: []
  },
  hscrp: {
    label: 'High Sensitivity CRP (hs-CRP)',
    count: 1,
    codes: ['HSCRP'],
    parameters: []
  },
  homo: {
    label: 'Homocysteine',
    count: 1,
    codes: ['HOMO'],
    parameters: []
  },
  bketo: {
    label: 'Blood Ketone (Beta-Hydroxybutyrate)',
    count: 1,
    codes: ['BKETO'],
    parameters: []
  },
  fruct: {
    label: 'Fructosamine',
    count: 1,
    codes: ['FRUCT'],
    parameters: []
  },
  rfac: {
    label: 'Rheumatoid Factor (RF)',
    count: 1,
    codes: ['RFAC'],
    parameters: []
  },
  foli: {
    label: 'Folic Acid (Serum Folate)',
    count: 1,
    codes: ['FOLI'],
    parameters: []
  }
};

const AVM1_GROUPS = [
  AVM_COMMON_GROUPS.tsh,
  AVM_COMMON_GROUPS.mg,
  AVM_COMMON_GROUPS.phos,
  AVM_COMMON_GROUPS.lipid,
  AVM_COMMON_GROUPS.liver,
  AVM_COMMON_GROUPS.kidney,
  AVM_COMMON_GROUPS.iron,
];

const AVM2_GROUPS = [
  ...AVM1_GROUPS,
  AVM_COMMON_GROUPS.amylase,
  AVM_COMMON_GROUPS.lipase,
  AVM_COMMON_GROUPS.hba1c,
  AVM_COMMON_GROUPS.cbc,
];

const AVM3_GROUPS = [
  ...AVM2_GROUPS,
  AVM_COMMON_GROUPS.vitb12,
  AVM_COMMON_GROUPS.vitd,
  AVM_COMMON_GROUPS.ferritin,
  AVM_COMMON_GROUPS.copper,
  AVM_COMMON_GROUPS.zinc,
  AVM_COMMON_GROUPS.crp,
];

const AVM4_GROUPS = [
  ...AVM3_GROUPS,
  AVM_COMMON_GROUPS.apoa,
  AVM_COMMON_GROUPS.apob,
  AVM_COMMON_GROUPS.aporatio,
  AVM_COMMON_GROUPS.lpa,
  AVM_COMMON_GROUPS.hscrp,
];

const AVM5_GROUPS = [
  ...AVM4_GROUPS,
  AVM_COMMON_GROUPS.homo,
  AVM_COMMON_GROUPS.bketo,
  AVM_COMMON_GROUPS.fruct,
  AVM_COMMON_GROUPS.rfac,
  AVM_COMMON_GROUPS.foli,
];

export const PROFILE_DEFINITIONS = {
  'avm-1-profile': {
    testCount: 37,
    groups: AVM1_GROUPS
  },
  'avm-2-profile': {
    testCount: 69,
    groups: AVM2_GROUPS
  },
  'avm-3-profile': {
    testCount: 74,
    groups: AVM3_GROUPS
  },
  'avm-4-profile': {
    testCount: 79,
    groups: AVM4_GROUPS
  },
  'avm-5-profile': {
    testCount: 84,
    groups: AVM5_GROUPS
  },
  'lipid-profile': {
    testCount: 10,
    groups: [AVM_COMMON_GROUPS.lipid]
  },
  'liver-profile': {
    testCount: 12,
    groups: [AVM_COMMON_GROUPS.liver]
  },
  'kidney-profile': {
    testCount: 8,
    groups: [AVM_COMMON_GROUPS.kidney]
  },
  'iron-profile': {
    testCount: 4,
    groups: [AVM_COMMON_GROUPS.iron]
  },
  'pancreatic-profile': {
    testCount: 2,
    groups: [AVM_COMMON_GROUPS.amylase, AVM_COMMON_GROUPS.lipase]
  },
  'total-thyoid-profile': {
    testCount: 3,
    groups: [
      { label: 'Total Triiodothyronine (T3)', count: 1, codes: ['TT3'], parameters: [] },
      { label: 'Total Thyroxine (T4)', count: 1, codes: ['TT4'], parameters: [] },
      { label: 'Thyroid-Stimulating Hormone (TSH)', count: 1, codes: ['UTSH'], parameters: [] }
    ]
  },
  'advance-thyroid-profile': {
    testCount: 5,
    groups: [
      { label: 'Total Triiodothyronine (T3)', count: 1, codes: ['TT3'], parameters: [] },
      { label: 'Total Thyroxine (T4)', count: 1, codes: ['TT4'], parameters: [] },
      { label: 'Thyroid-Stimulating Hormone (TSH)', count: 1, codes: ['UTSH'], parameters: [] },
      { label: 'Free Triiodothyronine (FT3)', count: 1, codes: ['FT3'], parameters: [] },
      { label: 'Free Thyroxine (FT4)', count: 1, codes: ['FT4'], parameters: [] }
    ]
  },
  'vitamin-profile': {
    testCount: 2,
    groups: [AVM_COMMON_GROUPS.vitb12, AVM_COMMON_GROUPS.vitd]
  }
};

export function cleanProfileName(name) {
  return (name || '').replace(/\s*\(\s*(?:\d+|\d+\+\d+|T\d+)\s*\)\s*$/i, '').trim();
}

export function cleanTestName(name) {
  return (name || '').replace(/\s*\([^)]*\)\s*$/, '').trim();
}

export function getProfileTestCount(pkg, catalogTestsByCode = {}) {
  if (!pkg) return 0;
  const pId = pkg.id;
  if (PROFILE_DEFINITIONS[pId]) {
    return PROFILE_DEFINITIONS[pId].testCount;
  }

  if (pkg.groups && pkg.groups.length) {
    return pkg.groups.reduce((acc, g) => acc + (g.count || (g.parameters ? g.parameters.length : 1)), 0);
  }

  const codes = pkg.codes || [];
  if (codes.length > 0) {
    const codeParamSum = codes.reduce((sum, c) => {
      const t = catalogTestsByCode[c] || catalogTestsByCode[c.toUpperCase()];
      return sum + (t?.paramCount || 1);
    }, 0);
    const calcCount = pkg.calculatedParams ? pkg.calculatedParams.length : 0;
    return codeParamSum + calcCount;
  }

  const match = pkg.name && pkg.name.match(/\((\d+)\)/);
  if (match) return parseInt(match[1], 10);

  return 1;
}

export function getProfileGroups(pkg, catalogTestsByCode = {}) {
  if (!pkg) return [];
  const pId = pkg.id;
  if (PROFILE_DEFINITIONS[pId]) {
    return PROFILE_DEFINITIONS[pId].groups;
  }

  if (pkg.groups && pkg.groups.length) {
    return pkg.groups;
  }

  const codes = pkg.codes || [];
  if (codes.length > 0) {
    return codes.map(c => {
      const t = catalogTestsByCode[c] || catalogTestsByCode[c.toUpperCase()];
      const testName = t ? cleanTestName(t.name) : c;
      return {
        label: testName,
        count: 1,
        codes: [c],
        parameters: []
      };
    });
  }

  if (pkg.contentsText) {
    const tokens = pkg.contentsText.split(/[\+,]+/).map(s => s.trim()).filter(Boolean);
    return tokens.map(t => ({
      label: t,
      count: 1,
      codes: [],
      parameters: []
    }));
  }

  return [];
}

export const AVM_TIER_ORDER = {
  'avm-1-profile': 1,
  'avm-2-profile': 2,
  'avm-3-profile': 3,
  'avm-4-profile': 4,
  'avm-5-profile': 5,
};

export function getProfileAllCodes(pkg, catalogTestsByCode = {}) {
  if (!pkg) return [];
  const pId = pkg.id;
  const def = PROFILE_DEFINITIONS[pId];
  const set = new Set((pkg.codes || []).map(x => x.toUpperCase()));

  if (def && def.groups) {
    for (const g of def.groups) {
      if (g.codes) {
        for (const code of g.codes) set.add(code.toUpperCase());
      }
    }
  }

  if (pkg.groups && pkg.groups.length) {
    for (const g of pkg.groups) {
      if (g.codes) {
        for (const code of g.codes) set.add(code.toUpperCase());
      }
    }
  }

  return Array.from(set);
}

export function isProfileIncludedIn(subPkg, superPkg, catalogTestsByCode = {}) {
  if (!subPkg || !superPkg || subPkg.id === superPkg.id) return false;

  const subTier = AVM_TIER_ORDER[subPkg.id];
  const superTier = AVM_TIER_ORDER[superPkg.id];
  if (subTier && superTier) {
    return subTier < superTier;
  }

  if (superTier && superTier >= 1) {
    if (['lipid-profile', 'liver-profile', 'kidney-profile', 'iron-profile'].includes(subPkg.id)) return true;
  }
  if (superTier && superTier >= 2) {
    if (subPkg.id === 'pancreatic-profile') return true;
  }
  if (superTier && superTier >= 3) {
    if (subPkg.id === 'vitamin-profile') return true;
  }

  if (subPkg.id === 'total-thyoid-profile' && ['advance-thyroid-profile', 'crl-atp'].includes(superPkg.id)) {
    return true;
  }

  const subCodes = getProfileAllCodes(subPkg, catalogTestsByCode);
  const superCodes = getProfileAllCodes(superPkg, catalogTestsByCode);
  if (subCodes.length > 0 && superCodes.length > 0) {
    const isSubset = subCodes.every(c => superCodes.includes(c));
    if (isSubset && getProfileTestCount(subPkg, catalogTestsByCode) < getProfileTestCount(superPkg, catalogTestsByCode)) {
      return true;
    }
  }

  return false;
}

export function isBiggerThan(a, b, catalogTestsByCode = {}) {
  if (!a || !b) return false;
  return getProfileTestCount(a, catalogTestsByCode) > getProfileTestCount(b, catalogTestsByCode);
}

export function doProfilesOverlap(pkgA, pkgB, catalogTestsByCode = {}) {
  if (!pkgA || !pkgB) return false;
  if (pkgA.id === pkgB.id) return true;

  if (AVM_TIER_ORDER[pkgA.id] && AVM_TIER_ORDER[pkgB.id]) {
    return true;
  }

  if (isProfileIncludedIn(pkgA, pkgB, catalogTestsByCode) || isProfileIncludedIn(pkgB, pkgA, catalogTestsByCode)) {
    return true;
  }

  const codesA = getProfileAllCodes(pkgA, catalogTestsByCode);
  const codesB = getProfileAllCodes(pkgB, catalogTestsByCode);
  if (codesA.length > 0 && codesB.length > 0) {
    return codesA.some(c => codesB.includes(c));
  }

  return false;
}

export function coveringPackage(pkg, cartPackages = new Set(), packageById = {}, catalogTestsByCode = {}) {
  if (!pkg || !cartPackages || !cartPackages.size) return null;
  if (cartPackages.has(pkg.id)) return null;

  for (const activeId of cartPackages) {
    if (activeId === pkg.id) continue;
    const activePkg = packageById[activeId];
    if (activePkg && doProfilesOverlap(pkg, activePkg, catalogTestsByCode)) {
      return activePkg;
    }
  }
  return null;
}

export function blockingPackage(pkg, cartPackages = new Set(), packageById = {}, catalogTestsByCode = {}) {
  const covering = coveringPackage(pkg, cartPackages, packageById, catalogTestsByCode);
  if (!covering) return null;
  return covering;
}

export function packageOwning(testCode, cartPackages = new Set(), packageById = {}, catalogTestsByCode = {}) {
  if (!testCode || !cartPackages || !cartPackages.size) return null;
  const upper = testCode.toUpperCase();

  for (const activeId of cartPackages) {
    const pkg = packageById[activeId];
    if (!pkg) continue;
    const allCodes = getProfileAllCodes(pkg, catalogTestsByCode);
    if (allCodes.includes(upper)) {
      return pkg;
    }
  }
  return null;
}

export function sanitizeStoredPackages(rawPackageIds = [], packagesList = []) {
  const packageById = Object.fromEntries((packagesList || []).map(p => [p.id, p]));
  const sorted = Array.from(new Set(rawPackageIds))
    .map(id => packageById[id])
    .filter(Boolean)
    .sort((a, b) => getProfileTestCount(b) - getProfileTestCount(a));

  const valid = new Set();
  for (const pkg of sorted) {
    const isCovered = Array.from(valid).some(activeId => {
      const active = packageById[activeId];
      return active && doProfilesOverlap(pkg, active);
    });
    if (!isCovered) {
      valid.add(pkg.id);
    }
  }
  return valid;
}
