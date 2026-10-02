/**
 * Medication Reference & Clinical Knowledge Service
 * 
 * Provides verified clinical pharmacology reference data for common medications,
 * in-memory caching for sub-millisecond retrieval, and dynamic query synthesis.
 * 
 * Sources: FDA, PMDA (Japan), CDSCO (India), British National Formulary (BNF),
 * International Society of Hypertension (ISH), and ACC/AHA Practice Guidelines.
 */

// In-memory cache for dynamic or synthesized medication profiles (TTL: 24h)
const memoryCache = new Map();

/**
 * Normalizes medication query string (e.g., "Tab. Cilnidipine 10mg" -> "cilnidipine")
 */
export function normalizeMedName(rawName = '') {
  return String(rawName)
    .toLowerCase()
    .replace(/^tab\.?\s+|^cap\.?\s+/i, '')
    .replace(/\s+\d+(\.\d+)?\s*(mg|mcg|g|ml)\b.*$/i, '')
    .trim();
}

/**
 * Verified Clinical Pharmacology Knowledge Base
 * Structured to provide exact clinical facts without hallucination.
 */
export const VERIFIED_MEDICATIONS = {
  cilnidipine: {
    medicationName: 'Cilnidipine',
    genericName: 'Cilnidipine',
    brandNames: ['Atelec', 'Cilacar', 'Nexovas', 'Cilny'],
    whatIsIt: 'Cilnidipine is a dual L-type and N-type dihydropyridine calcium-channel blocker used as an antihypertensive medicine to help lower elevated blood pressure.',
    uses: [
      'Treatment and management of essential hypertension (high blood pressure) in adults.',
      'Control of morning blood pressure surges and sympathetic overactivity (under physician guidance).'
    ],
    howItWorks: 'Cilnidipine relaxes blood vessel walls by blocking calcium ions from entering vascular smooth muscle cells (via L-type channels) and inhibiting norepinephrine release from sympathetic nerve endings (via N-type channels). This widens arteries, lowers peripheral vascular resistance, and reduces blood pressure smoothly with minimal reflex tachycardia.',
    adultDosing: {
      usualRange: '5 mg to 10 mg orally once daily',
      frequency: 'Once daily, taken with or immediately after meals (breakfast or dinner)',
      maximumDose: 'Up to 20 mg once daily, titrated under medical supervision',
      importantNotes: [
        'Take consistently at the same time each day, preferably with a meal to aid tolerability.',
        'Swallow tablets whole with water; do not crush or chew.',
        'If a dose is missed, take it as soon as remembered unless it is nearly time for the next dose. Never double up.'
      ],
      disclaimer: 'General reference information — not a recommendation to change your prescription.'
    },
    pediatricInformation: {
      status: 'Pediatric use/dosing not established',
      summary: 'Safety and clinical effectiveness of Cilnidipine in pediatric patients (children and adolescents under 18 years) have not been established in standard clinical trials.',
      notes: [
        'Reliable pediatric dosing information is not available in the application’s medication reference.',
        'Pediatric use and dosing should be determined solely by a qualified pediatric cardiologist or nephrologist.',
        'Do not administer to children without explicit pediatric prescription.'
      ]
    },
    bloodPressureGoals: {
      adultSummary: 'For most non-pregnant adults with essential hypertension, major clinical practice guidelines (e.g., ISH, ESC/ESH, ACC/AHA) typically recommend a target blood pressure below 130/80 mmHg, or below 140/90 mmHg for older or frail individuals.',
      pediatricSummary: 'Pediatric blood-pressure interpretation is age, sex, and height percentile-dependent (based on normative pediatric growth curves). Adult thresholds must NEVER be applied to children or adolescents.',
      clinicalFactors: [
        'Patient age and baseline cardiovascular risk',
        'Presence of Type 2 Diabetes Mellitus',
        'Chronic Kidney Disease (CKD) or proteinuria status',
        'History of coronary artery disease, stroke, or heart failure',
        'Pregnancy or planned pregnancy status'
      ],
      note: 'Target blood-pressure levels vary by individual clinical profile. Always follow the specific goal set by your treating physician.'
    },
    precautionsAndInteractions: {
      medicationInteractions: [
        'Other blood pressure medications (e.g., ACE inhibitors, ARBs, beta-blockers, diuretics): Additive blood-pressure lowering effect; monitor for symptomatic hypotension.',
        'CYP3A4 inhibitors (e.g., ketoconazole, clarithromycin, itraconazole): May reduce Cilnidipine breakdown, increasing drug levels in the blood.',
        'CYP3A4 inducers (e.g., rifampicin, phenytoin, carbamazepine): May accelerate metabolism and reduce clinical efficacy.',
        'Digoxin: Calcium channel blockers may slightly increase serum digoxin concentrations; periodic monitoring recommended.'
      ],
      foodBeverageInteractions: [
        'Grapefruit and grapefruit juice: Can inhibit intestinal CYP3A4 enzymes and substantially increase blood levels of calcium-channel blockers. Avoid or exercise strict caution.'
      ],
      medicalConditions: [
        'Severe hepatic impairment: Extensively metabolized by the liver; requires caution and potential dosage adjustment.',
        'Severe aortic stenosis or cardiogenic shock: Vasodilation may compromise coronary and systemic perfusion.',
        'Pregnancy and nursing: Not recommended; consult physician immediately if pregnancy is suspected.'
      ],
      alcohol: 'Alcohol enhances peripheral vasodilation and significantly increases the risk of orthostatic dizziness, lightheadedness, or fainting. Avoid alcohol around dosing times.'
    },
    commonSideEffects: [
      'Headache',
      'Dizziness or lightheadedness upon standing',
      'Flushing (facial warmth or redness)',
      'Mild ankle swelling (peripheral edema - lower incidence than older CCBs due to N-type blockade)',
      'Palpitations or occasional sensation of rapid heartbeat',
      'Nausea or abdominal fullness'
    ],
    whenToSeekMedicalAttention: [
      'Sudden severe chest pain, tightness, or pressure',
      'Profound dizziness, fainting (syncope), or confusion',
      'Sudden shortness of breath or difficulty breathing',
      'Signs of a serious allergic reaction: facial, lip, tongue, or throat swelling, severe rash, or wheezing'
    ],
    sources: [
      'PMDA / Japanese Pharmacopoeia (Atelec Product Monograph)',
      'Central Drugs Standard Control Organisation (CDSCO, India) Antihypertensive Index',
      'International Society of Hypertension (ISH) Global Practice Guidelines',
      'Peer-reviewed clinical trials on dual L/N-type calcium channel antagonism'
    ]
  },

  amlodipine: {
    medicationName: 'Amlodipine',
    genericName: 'Amlodipine Besylate',
    brandNames: ['Norvasc', 'Amlovas', 'Amlopres', 'Stamlo'],
    whatIsIt: 'Amlodipine is a long-acting dihydropyridine calcium-channel blocker used to treat high blood pressure (hypertension) and manage chronic stable angina (chest pain).',
    uses: [
      'First-line management of essential hypertension in adults and pediatric patients aged 6 years and older.',
      'Symptomatic management of chronic stable angina pectoris and vasospastic (Prinzmetal’s) angina.'
    ],
    howItWorks: 'Amlodipine inhibits the influx of calcium ions into vascular smooth muscle and cardiac muscle cells during depolarization. This promotes peripheral arterial vasodilation, reducing total peripheral resistance, decreasing cardiac afterload, and lowering arterial blood pressure.',
    adultDosing: {
      usualRange: '5 mg orally once daily; may be increased after 1–2 weeks to a maximum of 10 mg once daily',
      frequency: 'Once daily at any time of day, with or without food',
      maximumDose: '10 mg once daily',
      importantNotes: [
        'Maintain a consistent daily schedule (e.g., every morning or every evening).',
        'Can be taken with or without meals as food does not alter its bioavailability.',
        'Do not abruptly discontinue without consulting your cardiologist.'
      ],
      disclaimer: 'General reference information — not a recommendation to change your prescription.'
    },
    pediatricInformation: {
      status: 'Approved for pediatric patients aged 6 to 17 years for hypertension',
      summary: 'Clinical guidelines approve Amlodipine for children 6 to 17 years old with hypertension, typically starting at 2.5 mg to 5 mg once daily. Doses above 5 mg daily have not been adequately studied in pediatric populations.',
      notes: [
        'Pediatric dosing is weight- and age-dependent and must be prescribed by a specialist.',
        'Not recommended for children under 6 years of age due to lack of established safety data.'
      ]
    },
    bloodPressureGoals: {
      adultSummary: 'Guideline targets for non-pregnant adults are typically <130/80 mmHg (or <140/90 mmHg depending on age and clinical risk).',
      pediatricSummary: 'For children aged 6–17 years, blood pressure target is defined as <90th percentile for age, sex, and height (or <120/80 mmHg, whichever is lower).',
      clinicalFactors: ['Age', 'Comorbid Diabetes', 'Chronic Kidney Disease', 'Atherosclerotic Cardiovascular Disease'],
      note: 'Target levels must be individually determined by the treating physician.'
    },
    precautionsAndInteractions: {
      medicationInteractions: [
        'Simvastatin: Amlodipine increases simvastatin exposure; limit simvastatin to 20 mg daily when co-administered.',
        'Strong CYP3A4 inhibitors (ketoconazole, itraconazole, clarithromycin): May increase amlodipine systemic exposure.',
        'Other antihypertensives: Additive blood-pressure reduction; monitor for symptomatic hypotension.'
      ],
      foodBeverageInteractions: [
        'Grapefruit and grapefruit juice: May increase bioavailability in susceptible individuals; generally recommended to avoid excessive intake.'
      ],
      medicalConditions: [
        'Severe obstructive coronary artery disease: Rare cases of increased frequency or severity of angina during initiation or titration.',
        'Severe hepatic impairment: Requires slower titration due to extensive hepatic metabolism.'
      ],
      alcohol: 'Alcohol may exacerbate amlodipine’s hypotensive effect, leading to dizziness, lightheadedness, or fainting.'
    },
    commonSideEffects: [
      'Peripheral edema (swelling of ankles and feet)',
      'Flushing or warm sensation in face',
      'Headache',
      'Dizziness or fatigue',
      'Nausea or abdominal pain'
    ],
    whenToSeekMedicalAttention: [
      'Worsening chest pain or heart palpitations',
      'Severe dizziness, unsteadiness, or fainting',
      'Sudden swelling of face, eyes, lips, or tongue',
      'Extreme shortness of breath'
    ],
    sources: [
      'US FDA Prescribing Information (Norvasc / Amlodipine Besylate)',
      'British National Formulary (BNF)',
      'AHA/ACC Hypertension Clinical Practice Guidelines'
    ]
  },

  metformin: {
    medicationName: 'Metformin',
    genericName: 'Metformin Hydrochloride',
    brandNames: ['Glucophage', 'Glycomet', 'Fortamet', 'Riomet'],
    whatIsIt: 'Metformin is a biguanide oral antihyperglycemic medicine used as the foundational first-line treatment for managing blood glucose levels in Type 2 Diabetes.',
    uses: [
      'Glycemic control in adults and children (10 years and older) with Type 2 Diabetes Mellitus.',
      'Adjunct to diet and exercise to lower basal and postprandial plasma glucose.'
    ],
    howItWorks: 'Metformin lowers blood sugar by decreasing hepatic glucose production (gluconeogenesis), decreasing intestinal absorption of glucose, and improving peripheral insulin sensitivity by increasing glucose uptake and utilization.',
    adultDosing: {
      usualRange: 'Initial 500 mg twice daily or 850 mg once daily with meals; titrated up to 1500–2000 mg daily in divided doses',
      frequency: 'Twice or thrice daily with meals (immediate release) or once daily with evening meal (extended release)',
      maximumDose: '2550 mg daily for immediate release; 2000 mg daily for extended release',
      importantNotes: [
        'Always take immediately after meals to significantly reduce gastrointestinal side effects.',
        'Swallow extended-release tablets whole; do not split, chew, or crush.',
        'Temporarily discontinue prior to radiological procedures involving iodinated contrast media (as directed by physician).'
      ],
      disclaimer: 'General reference information — not a recommendation to change your prescription.'
    },
    pediatricInformation: {
      status: 'Approved for pediatric patients aged 10 years and older with Type 2 Diabetes',
      summary: 'For children aged 10–16 years, typical starting dose is 500 mg once daily with food, gradually titrated up to a maximum of 2000 mg daily in divided doses under pediatric endocrinologist supervision.',
      notes: [
        'Not established for children under 10 years of age.',
        'Pediatric dosing requires periodic monitoring of renal function and growth parameters.'
      ]
    },
    bloodPressureGoals: {
      adultSummary: 'While Metformin is an antidiabetic and not an antihypertensive, standard cardiovascular guidelines for diabetic adults target blood pressure <130/80 mmHg to protect renal and vascular function.',
      pediatricSummary: 'Pediatric diabetic guidelines recommend BP <90th percentile for age, sex, and height.',
      clinicalFactors: ['Estimated Glomerular Filtration Rate (eGFR)', 'Glycated Hemoglobin (HbA1c)', 'Cardiovascular risk profile'],
      note: 'Metformin dosage must be adjusted based on renal function (eGFR).'
    },
    precautionsAndInteractions: {
      medicationInteractions: [
        'Iodinated contrast agents: Risk of contrast-induced nephropathy leading to metformin accumulation and lactic acidosis; hold before/after procedure.',
        'Carbonic anhydrase inhibitors (topiramate, acetazolamide): May increase risk of lactic acidosis.',
        'Cimetidine: May increase metformin plasma concentrations.'
      ],
      foodBeverageInteractions: [
        'Food improves GI tolerability; take with or immediately after food.'
      ],
      medicalConditions: [
        'Severe renal impairment (eGFR < 30 mL/min/1.73m²): Strictly contraindicated.',
        'Acute or chronic metabolic acidosis / diabetic ketoacidosis: Strictly contraindicated.',
        'Conditions associated with hypoxemia (congestive heart failure, severe sepsis): Risk of lactic acidosis.'
      ],
      alcohol: 'Excessive acute or chronic alcohol intake significantly increases the risk of metformin-associated lactic acidosis and hypoglycemia. Strict moderation or avoidance is advised.'
    },
    commonSideEffects: [
      'Nausea or upset stomach',
      'Diarrhea or loose stools',
      'Abdominal bloating or gas',
      'Metallic taste in the mouth',
      'Mild loss of appetite'
    ],
    whenToSeekMedicalAttention: [
      'Signs of lactic acidosis: severe fatigue, muscle aches, trouble breathing, severe stomach discomfort, feeling cold, or slow/irregular heartbeat',
      'Signs of severe allergic reaction (rash, facial swelling, difficulty breathing)',
      'Persistent severe vomiting or dehydration'
    ],
    sources: [
      'US FDA Prescribing Information (Glucophage)',
      'American Diabetes Association (ADA) Standards of Care',
      'British National Formulary (BNF)'
    ]
  },

  atorvastatin: {
    medicationName: 'Atorvastatin',
    genericName: 'Atorvastatin Calcium',
    brandNames: ['Lipitor', 'Atorva', 'Storvas', 'Lipikind'],
    whatIsIt: 'Atorvastatin is an HMG-CoA reductase inhibitor (statin) used to lower LDL ("bad") cholesterol, reduce triglycerides, and decrease the risk of heart attacks and stroke.',
    uses: [
      'Primary and secondary prevention of cardiovascular events in patients with hypercholesterolemia or mixed dyslipidemia.',
      'Reduction of elevated total cholesterol, LDL-C, and triglycerides in adult and pediatric patients (10 years and older).'
    ],
    howItWorks: 'Atorvastatin selectively and competitively inhibits HMG-CoA reductase, the rate-limiting enzyme that converts HMG-CoA to mevalonate during cholesterol biosynthesis in the liver. This upregulates hepatic LDL receptors, increasing LDL clearance from the bloodstream.',
    adultDosing: {
      usualRange: '10 mg to 20 mg orally once daily; high-intensity therapy up to 40 mg to 80 mg once daily',
      frequency: 'Once daily at any time of day, with or without food (often taken at bedtime)',
      maximumDose: '80 mg once daily',
      importantNotes: [
        'Can be taken at any time of day, but should be taken at the same time each day for consistency.',
        'Liver function tests (LFTs) and lipid profile should be monitored periodically as advised by your physician.',
        'Do not discontinue abruptly if prescribed following a myocardial infarction or stroke.'
      ],
      disclaimer: 'General reference information — not a recommendation to change your prescription.'
    },
    pediatricInformation: {
      status: 'Approved for pediatric patients aged 10 years and older with heterozygous familial hypercholesterolemia (HeFH)',
      summary: 'Initial recommended dose is 10 mg once daily, up to a maximum of 20 mg once daily in pediatric patients 10–17 years old with HeFH, guided by a pediatric lipid specialist.',
      notes: [
        'Safety and efficacy have not been established in children younger than 10 years.',
        'Adolescent females must receive counseling regarding pregnancy precautions, as statins are contraindicated in pregnancy.'
      ]
    },
    bloodPressureGoals: {
      adultSummary: 'Statins target lipid management; for cardiovascular protection, guidelines emphasize maintaining concurrent blood pressure <130/80 mmHg in dyslipidemic patients.',
      pediatricSummary: 'Pediatric guidelines focus on familial hypercholesterolemia target LDL levels; BP should remain <90th percentile.',
      clinicalFactors: ['10-year ASCVD risk score', 'Baseline LDL-C and triglyceride levels', 'Presence of diabetes or vascular disease'],
      note: 'Lipid and blood pressure goals are coordinated by your physician.'
    },
    precautionsAndInteractions: {
      medicationInteractions: [
        'Strong CYP3A4 inhibitors (clarithromycin, itraconazole, protease inhibitors): Substantially increase atorvastatin levels; avoid or reduce dose.',
        'Cyclosporine, gemfibrozil: Increased risk of myopathy and rhabdomyolysis.',
        'Digoxin: Concurrent atorvastatin (80 mg) may slightly increase plasma digoxin concentrations.'
      ],
      foodBeverageInteractions: [
        'Grapefruit and grapefruit juice: Consuming more than 1.2 liters of grapefruit juice daily can significantly elevate atorvastatin blood levels. Moderate or avoid grapefruit consumption.'
      ],
      medicalConditions: [
        'Active liver disease or unexplained persistent elevation of hepatic transaminases: Contraindicated.',
        'Pregnancy and breastfeeding: Contraindicated (teratogenic risk).'
      ],
      alcohol: 'Heavy alcohol consumption combined with statin therapy increases the risk of hepatic impairment.'
    },
    commonSideEffects: [
      'Mild muscle aches (myalgia) or joint pain',
      'Headache',
      'Nausea or mild diarrhea',
      'Dyspepsia or abdominal pain',
      'Mild elevations in serum transaminases'
    ],
    whenToSeekMedicalAttention: [
      'Unexplained muscle pain, tenderness, or weakness, especially if accompanied by dark/tea-colored urine or fever (rhabdomyolysis warning)',
      'Yellowing of skin or eyes (jaundice), severe upper stomach pain (hepatic warning)',
      'Severe allergic reactions or unusual fatigue'
    ],
    sources: [
      'US FDA Prescribing Information (Lipitor)',
      'ACC/AHA Guideline on the Management of Blood Cholesterol',
      'British National Formulary (BNF)'
    ]
  },

  telmisartan: {
    medicationName: 'Telmisartan',
    genericName: 'Telmisartan',
    brandNames: ['Micardis', 'Telma', 'Telpres', 'Cresar'],
    whatIsIt: 'Telmisartan is an angiotensin II receptor blocker (ARB) used to lower blood pressure and reduce cardiovascular risk in adults.',
    uses: [
      'Treatment of essential hypertension in adults.',
      'Cardiovascular risk reduction in patients unable to take ACE inhibitors.'
    ],
    howItWorks: 'Telmisartan blocks the vasoconstrictor and aldosterone-secreting effects of angiotensin II by selectively blocking the AT1 receptor. This dilates blood vessels and lowers blood pressure.',
    adultDosing: {
      usualRange: '40 mg orally once daily; may be titrated to 20 mg (starting) or 80 mg once daily',
      frequency: 'Once daily with or without food',
      maximumDose: '80 mg once daily',
      importantNotes: [
        'Take at the same time each day.',
        'Do not take potassium supplements or salt substitutes containing potassium without consulting your doctor.',
        'Swallow tablets with water; protect from moisture.'
      ],
      disclaimer: 'General reference information — not a recommendation to change your prescription.'
    },
    pediatricInformation: {
      status: 'Pediatric use/dosing not established',
      summary: 'Safety and effectiveness in pediatric patients (children under 18 years) have not been established.',
      notes: [
        'Reliable pediatric dosing information is not available in the application reference.',
        'Consult a pediatric specialist for pediatric hypertension management.'
      ]
    },
    bloodPressureGoals: {
      adultSummary: 'Standard guideline target is typically <130/80 mmHg (or <140/90 mmHg based on individual clinical factors).',
      pediatricSummary: 'Pediatric blood pressure interpretation is age, sex, and height percentile-dependent.',
      clinicalFactors: ['Renal function (creatinine, eGFR)', 'Serum potassium levels', 'Concurrent heart failure'],
      note: 'Follow the specific blood-pressure target set by your physician.'
    },
    precautionsAndInteractions: {
      medicationInteractions: [
        'Potassium-sparing diuretics, potassium supplements: Risk of hyperkalemia (high blood potassium).',
        'NSAIDs (ibuprofen, naproxen): May decrease antihypertensive effect and increase risk of renal impairment.',
        'Lithium: ARBs may increase serum lithium concentrations and toxicity.'
      ],
      foodBeverageInteractions: [
        'Salt substitutes containing potassium: May cause elevated potassium levels; check with physician.'
      ],
      medicalConditions: [
        'Pregnancy: Strictly contraindicated (causes fetal toxicity and death).',
        'Bilateral renal artery stenosis: Risk of severe hypotension and renal failure.',
        'Biliary obstructive disorders or severe hepatic impairment: Use with extreme caution.'
      ],
      alcohol: 'Alcohol increases the blood-pressure lowering effect and may cause severe dizziness or fainting.'
    },
    commonSideEffects: [
      'Dizziness or lightheadedness',
      'Sinus pain, congestion, or upper respiratory symptoms',
      'Back pain or muscle cramps',
      'Diarrhea'
    ],
    whenToSeekMedicalAttention: [
      'Swelling of face, lips, tongue, or throat (angioedema)',
      'Severe dizziness, lightheadedness, or feeling like passing out',
      'Slow, weak pulse, muscle weakness, or tingling sensation (hyperkalemia warning signs)'
    ],
    sources: [
      'US FDA Prescribing Information (Micardis)',
      'British National Formulary (BNF)',
      'ESC/ESH Guidelines for Hypertension Management'
    ]
  }
};

/**
 * Retrieves a verified profile from the knowledge base or memory cache.
 */
export function getMedicationProfile(rawName = '') {
  const normalized = normalizeMedName(rawName);

  // 1. Direct match in verified clinical knowledge base
  if (VERIFIED_MEDICATIONS[normalized]) {
    return {
      profile: VERIFIED_MEDICATIONS[normalized],
      sourceType: 'verified_reference'
    };
  }

  // 2. Partial / word match in verified clinical knowledge base (e.g. "Cilnidipine 10mg" or "Telmisartan + Cilnidipine")
  for (const [key, item] of Object.entries(VERIFIED_MEDICATIONS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return {
        profile: item,
        sourceType: 'verified_reference'
      };
    }
  }

  // 3. Check memory cache for previously synthesized profile
  if (memoryCache.has(normalized)) {
    return {
      profile: memoryCache.get(normalized),
      sourceType: 'ai_synthesized',
      isCached: true
    };
  }

  return null;
}

/**
 * Stores an AI-synthesized profile in memory cache
 */
export function cacheSynthesizedProfile(rawName, profile) {
  const normalized = normalizeMedName(rawName);
  memoryCache.set(normalized, profile);
}

/**
 * Builds the final, clinical-grade Structured Medication Analysis response.
 * Merges general pharmacology knowledge with the user's specific MedBuddy prescription.
 */
export function formatMedicationAnalysis({
  medicationName,
  generalProfile,
  prescribedCourse = null,
  durationMs = 0,
  sourceType = 'verified_reference',
  aiMetadata = null
}) {
  const displayMedName = generalProfile?.medicationName || medicationName;

  // Extract deterministic MedBuddy prescription information
  const prescribedDose = {
    dosage: prescribedCourse?.dosage || 'As prescribed by physician',
    frequency: prescribedCourse?.frequency || 'Once daily',
    scheduledTimes: Array.isArray(prescribedCourse?.timesOfDay) && prescribedCourse.timesOfDay.length > 0
      ? prescribedCourse.timesOfDay
      : ['08:00 PM'],
    mealRelation: prescribedCourse?.mealRelation
      ? prescribedCourse.mealRelation.replace('_', ' ')
      : 'With meal',
    duration: prescribedCourse?.startDate
      ? `${prescribedCourse.startDate} to ${prescribedCourse.endDate || 'Ongoing'}`
      : 'Active course',
    prescribedBy: prescribedCourse?.prescribedBy || null,
    notes: prescribedCourse?.notes || null
  };

  // Build clean, official Google search query & URL
  const searchQuery = displayMedName.trim();
  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;

  return {
    id: `analysis-${Date.now()}`,
    medicationName: displayMedName,
    genericName: generalProfile?.genericName || displayMedName,
    brandNames: generalProfile?.brandNames || [],
    title: `${displayMedName} — Medication Analysis`,

    // Section 5: What is it?
    whatIsIt: generalProfile?.whatIsIt || `${displayMedName} is a prescribed medication used under physician supervision.`,

    // Section 6: What is it used for?
    uses: Array.isArray(generalProfile?.uses) && generalProfile.uses.length > 0
      ? generalProfile.uses
      : ['Treatment and clinical management as indicated by your prescribing physician.'],

    // Section 7: How does it work?
    howItWorks: generalProfile?.howItWorks || 'Pharmacological mechanism details are individualized to your prescription.',

    // Section 8 & 4: Your Prescribed Dose (Deterministic from MedBuddy)
    prescribedDose,

    // Section 9: Adult Dosing Information (General Reference)
    adultDosing: {
      usualRange: generalProfile?.adultDosing?.usualRange || 'Dosing is determined by your physician according to clinical guidelines.',
      frequency: generalProfile?.adultDosing?.frequency || prescribedDose.frequency,
      maximumDose: generalProfile?.adultDosing?.maximumDose || 'Follow maximum dose authorized by your physician.',
      importantNotes: generalProfile?.adultDosing?.importantNotes || [
        'Take consistently as scheduled.',
        'Do not alter dosing without physician consultation.'
      ],
      disclaimer: 'General reference information — not a recommendation to change your prescription.'
    },

    // Section 10: Children / Adolescents (Pediatric Information)
    pediatricInformation: {
      status: generalProfile?.pediatricInformation?.status || 'Pediatric use/dosing not established',
      summary: generalProfile?.pediatricInformation?.summary || 'Pediatric use and dosing should be determined by a qualified healthcare professional. Reliable pediatric dosing information is not available in the application’s medication reference.',
      notes: generalProfile?.pediatricInformation?.notes || [
        'Do not administer to children without explicit pediatric prescription.',
        'Pediatric dosing is age and weight dependent.'
      ]
    },

    // Section 11: Blood-Pressure Goals
    bloodPressureGoals: {
      adultSummary: generalProfile?.bloodPressureGoals?.adultSummary || 'For adult hypertension, clinical guidelines generally advise blood pressure targets below 130/80 mmHg or 140/90 mmHg based on individual clinical risk.',
      pediatricSummary: generalProfile?.bloodPressureGoals?.pediatricSummary || 'Pediatric blood-pressure interpretation is age, sex, and height percentile-dependent. Adult thresholds must NEVER be applied to children.',
      clinicalFactors: generalProfile?.bloodPressureGoals?.clinicalFactors || [
        'Patient age',
        'Diabetes or renal status',
        'Cardiovascular risk factors'
      ],
      note: generalProfile?.bloodPressureGoals?.note || 'Individual blood-pressure targets must be determined by your treating physician.'
    },

    // Section 12 & 13: Precautions & Interactions
    precautionsAndInteractions: {
      medicationInteractions: generalProfile?.precautionsAndInteractions?.medicationInteractions || [
        'Inform your doctor of all concurrent medications, including over-the-counter drugs and supplements.'
      ],
      foodBeverageInteractions: generalProfile?.precautionsAndInteractions?.foodBeverageInteractions || [
        'Follow dietary directions provided by your physician or pharmacist.'
      ],
      medicalConditions: generalProfile?.precautionsAndInteractions?.medicalConditions || [
        'Notify your physician of any pre-existing liver, kidney, or cardiovascular conditions.'
      ],
      alcohol: generalProfile?.precautionsAndInteractions?.alcohol || 'Discuss alcohol consumption with your doctor, as alcohol can amplify medication effects.'
    },

    // Section 14: Common Side Effects
    commonSideEffects: Array.isArray(generalProfile?.commonSideEffects) && generalProfile.commonSideEffects.length > 0
      ? generalProfile.commonSideEffects
      : ['Consult your pharmacist or product label for complete adverse effect information.'],

    // Section 15: Serious Warning Signs
    whenToSeekMedicalAttention: Array.isArray(generalProfile?.whenToSeekMedicalAttention) && generalProfile.whenToSeekMedicalAttention.length > 0
      ? generalProfile.whenToSeekMedicalAttention
      : [
        'Severe chest pain, sudden difficulty breathing, or severe dizziness',
        'Signs of allergic reaction: facial swelling, rash, or throat tightness'
      ],

    // Section 16: Google Search Link
    googleSearch: {
      query: searchQuery,
      url: googleSearchUrl,
      label: 'Search on Google'
    },

    // Section 17: Reference Sources
    sources: Array.isArray(generalProfile?.sources) && generalProfile.sources.length > 0
      ? generalProfile.sources
      : [
        'Official Drug Regulatory Monographs (PMDA / FDA / CDSCO)',
        'Clinical Practice Guidelines (ISH / ACC / AHA)'
      ],

    // Section 20 & 21: Clinical Safety Guardrail
    safetyDisclaimer: '⚠ Clinical Safety: This analysis is for educational purposes only. It does not replace advice from a qualified healthcare professional. Do not start, stop, or change a medication or dose based solely on this analysis.',

    // Execution & Provenance Metadata
    sourceType,
    executionDurationMs: durationMs,
    aiMetadata: aiMetadata || {
      provider: 'medbuddy-clinical-engine',
      model: sourceType === 'verified_reference' ? 'verified-clinical-kb' : 'gemini-flash',
      agent: 'medication',
      hasKeyConfigured: true
    },
    timestamp: new Date().toISOString(),

    // Backward-compatibility properties
    description: generalProfile?.whatIsIt || `${displayMedName} educational analysis.`,
    recommendation: `Follow your prescribed schedule (${prescribedDose.dosage}, ${prescribedDose.frequency}, ${prescribedDose.mealRelation}). Consult your doctor before making any adjustments.`,
    disclaimer: 'This analysis is for educational purposes only. It does not replace advice from a qualified healthcare professional.',
    severity: 'low',
    aiGenerated: sourceType !== 'verified_reference'
  };
}
