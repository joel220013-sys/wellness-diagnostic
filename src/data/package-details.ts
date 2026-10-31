export interface SubProfileItem {
  name: string;
  count: number;
  description: string;
  tests: string[];
}

export interface DetailedPackageData {
  id?: string;
  name: string;
  parametersCount: number;
  reportsIn: string;
  fasting: string;
  samples: string[];
  description: string;
  previewBullets: string[];
  profiles: SubProfileItem[];
}

export const PACKAGE_DETAILS_REGISTRY: Record<string, DetailedPackageData> = {
  // 1. Aarogyam XL With Utsh (149 Tests) - Canonical reference
  'aarogyam xl with utsh': {
    name: 'Aarogyam XL With Utsh',
    parametersCount: 149,
    reportsIn: 'Reports In 38 Hrs',
    fasting: '10-12 Hrs',
    samples: ['Blood', 'Urine'],
    description: "Aarogyam XL With UTSH - As The Name Suggests Its One Of The Biggest Package On Our Menu Consisting Of 149 Parameters That Assesses Overall Health And Wellbeing. It's Key Feature Is The Inclusion Of Steroid Profile For Complete Evaluation Of 10 Hormones Including Testosterone, Progesterone & Estrogen. It Evaluates Liver, Kidneys And Thyroid Health. It Also Measures Lipids, Sodium, Chloride And Iron Levels Using A Blood Sample. The Package Helps Assess The Health Of The Heart And Pancreas And Includes Tests Like CBC, Diabetes Detection, Arthritis Screening. It Also Measures The Levels Of 14 Vitamins, Elements And Nutrients.",
    previewBullets: ['Elements 22 (Toxic And Nutrients)', 'Silver', 'Aluminium', 'Arsenic', 'Steroids 10', 'Kidpro', 'Thyroid UTSH'],
    profiles: [
      {
        name: 'Elements 22 (Toxic And Nutrients)',
        count: 22,
        description: 'The Test Measures The Levels Of 22 Essential And Toxic Elements In The Blood To Screen For Heavy Metal Toxicity And Mineral Deficiencies.',
        tests: [
          'Silver', 'Aluminium', 'Arsenic', 'Barium', 'Beryllium', 'Cadmium',
          'Cobalt', 'Chromium', 'Cesium', 'Copper', 'Lead', 'Mercury',
          'Manganese', 'Molybdenum', 'Nickel', 'Selenium', 'Thallium',
          'Uranium', 'Vanadium', 'Zinc', 'Bismuth', 'Antimony'
        ]
      },
      {
        name: 'Steroid Profile (Hormones)',
        count: 10,
        description: 'Comprehensive hormonal evaluation including androgenic, estrogenic, and adrenal steroid pathways.',
        tests: [
          'Testosterone Total', 'Testosterone Free', 'Progesterone', 'Estradiol (E2)',
          'DHEA-S', 'Serum Cortisol', 'Androstenedione', '17-Hydroxyprogesterone (17-OHP)',
          'Aldosterone', 'Sex Hormone Binding Globulin (SHBG)'
        ]
      },
      {
        name: 'Vitamin B Complex Profile',
        count: 8,
        description: 'The Vitamin B Complex Profile Consists Of 8 Tests To Assess The Levels Of Cellular Co-enzymes And Neuro-protective Vitals.',
        tests: [
          'Vitamin B1 (Thiamine)', 'Vitamin B2 (Riboflavin)', 'Vitamin B3 (Niacin)',
          'Vitamin B5 (Pantothenic Acid)', 'Vitamin B6 (Pyridoxine)', 'Vitamin B7 (Biotin)',
          'Vitamin B9 (Folic Acid)', 'Vitamin B12 (Cyanocobalamin Active)'
        ]
      },
      {
        name: 'Fat Soluble Vitamins Profile',
        count: 6,
        description: 'Evaluates essential fat-soluble vitamins regulating bone calcium, vision, antioxidant protection, and coagulation.',
        tests: [
          'Vitamin A (Retinol)', 'Vitamin D3 (25-Hydroxy)', 'Vitamin D2', 'Total 25-OH Vitamin D',
          'Vitamin E (Tocopherol)', 'Vitamin K1 (Phylloquinone)'
        ]
      },
      {
        name: 'T3-T4-Utsh (Thyroid Complete)',
        count: 3,
        description: 'T3-T4-UTSH Is A Profile Of 3 Tests That Measure The Levels Of Thyroid Hormones Regulating Overall Body Metabolism.',
        tests: [
          'Total Triiodothyronine (T3)', 'Total Thyroxine (T4)', 'Ultrasensitive Thyroid Stimulating Hormone (UTSH)'
        ]
      },
      {
        name: 'Kidpro (Renal / Kidney Profile)',
        count: 7,
        description: 'Renal Function Tests (RFT), Also Called Kidney Function Tests, Are A Group Of Tests That Assess How Well Your Kidneys Are Filtering Blood.',
        tests: [
          'Blood Urea Nitrogen (BUN)', 'Serum Creatinine', 'Serum Uric Acid',
          'Serum Calcium', 'Blood Urea', 'BUN / Creatinine Ratio', 'eGFR (Glomerular Filtration Rate)'
        ]
      },
      {
        name: 'Liver Function Test (LFT Comprehensive)',
        count: 12,
        description: 'Detailed hepatic biomarker panel checking for enzyme release, liver inflammation, bile duct clearance, and protein synthesis.',
        tests: [
          'Total Bilirubin', 'Direct Bilirubin', 'Indirect Bilirubin', 'SGOT / AST',
          'SGPT / ALT', 'Alkaline Phosphatase (ALP)', 'Gamma Glutamyl Transferase (GGTP)',
          'Total Serum Protein', 'Serum Albumin', 'Serum Globulin', 'Albumin / Globulin Ratio', 'Lactate Dehydrogenase (LDH)'
        ]
      },
      {
        name: 'Lipid Profile (Cardiac Risk Screen)',
        count: 8,
        description: 'Comprehensive blood lipid analysis determining atherosclerotic plaque risk and vascular health.',
        tests: [
          'Total Cholesterol', 'HDL (Good) Cholesterol', 'LDL (Bad) Cholesterol',
          'VLDL Cholesterol', 'Triglycerides', 'Non-HDL Cholesterol',
          'TC / HDL Ratio', 'LDL / HDL Ratio'
        ]
      },
      {
        name: 'Complete Hemogram (CBC 6-Part Differential)',
        count: 24,
        description: 'Automated 6-part differential cellular hemogram measuring oxygen transport, platelets, infection fighting cells, and anemia.',
        tests: [
          'Hemoglobin', 'Packed Cell Volume (PCV)', 'Total RBC Count', 'MCV', 'MCH', 'MCHC', 'RDW-CV', 'RDW-SD',
          'Total Leucocyte Count (TLC / WBC)', 'Neutrophils', 'Lymphocytes', 'Monocytes', 'Eosinophils', 'Basophils',
          'Absolute Neutrophil Count', 'Absolute Lymphocyte Count', 'Absolute Monocyte Count', 'Absolute Eosinophil Count', 'Absolute Basophil Count',
          'Total Platelet Count', 'Mean Platelet Volume (MPV)', 'Plateletcrit (PCT)', 'Platelet Distribution Width (PDW)', 'Erythrocyte Sedimentation Rate (ESR)'
        ]
      },
      {
        name: 'Diabetic Screen',
        count: 3,
        description: 'Golden-standard 3-month glycemic indicator and immediate glucose monitoring.',
        tests: [
          'HbA1c (Glycated Hemoglobin)', 'Average Blood Glucose (Estimated AG)', 'Fasting Blood Glucose'
        ]
      },
      {
        name: 'Cardiac Risk Markers',
        count: 5,
        description: 'Specialized advanced vascular inflammation and apolipoprotein biomarkers predicting early coronary artery disease.',
        tests: [
          'High Sensitivity C-Reactive Protein (hs-CRP)', 'Apolipoprotein A1 (Apo-A1)',
          'Apolipoprotein B (Apo-B)', 'Apo B / Apo A1 Ratio', 'Lipoprotein (a) [Lp(a)]'
        ]
      },
      {
        name: 'Iron Deficiency Profile',
        count: 4,
        description: 'Evaluates circulating iron stores, protein binding saturation, and ferritin cellular reserve.',
        tests: [
          'Serum Iron', 'Total Iron Binding Capacity (TIBC)',
          'Transferrin Saturation Percentage (%)', 'Serum Ferritin'
        ]
      },
      {
        name: 'Serum Electrolytes',
        count: 3,
        description: 'Essential charged minerals regulating systemic hydration, neuro-muscular signaling, and cardiac contraction.',
        tests: [
          'Serum Sodium (Na+)', 'Serum Potassium (K+)', 'Serum Chloride (Cl-)'
        ]
      },
      {
        name: 'Arthritis & Pancreatic Profile',
        count: 4,
        description: 'Detects systemic autoimmune joint inflammation and digestive enzyme secretion.',
        tests: [
          'Rheumatoid Factor (RF)', 'Anti-Cyclic Citrullinated Peptide (Anti-CCP)', 'Serum Lipase', 'Serum Amylase'
        ]
      },
      {
        name: 'Complete Urine Analysis (Urine R/M)',
        count: 20,
        description: 'Complete automated physical, chemical, and microscopic clinical analysis of urine to assess renal and urinary tract vitals.',
        tests: [
          'Color', 'Appearance', 'Specific Gravity', 'pH', 'Urine Protein', 'Glucose',
          'Ketone Bodies', 'Bilirubin', 'Urobilinogen', 'Nitrite', 'Pus Cells (Leukocytes)',
          'Red Blood Cells (RBC)', 'Epithelial Cells', 'Casts', 'Crystals', 'Bacteria',
          'Yeast Cells', 'Mucus Threads', 'Amorphous Deposits', 'Blood'
        ]
      }
    ]
  },

  // 2. Healthy 2026 Festive Package (106 Tests)
  'healthy 2026 festive package (106 tests)': {
    name: 'Healthy 2026 Festive Package (106 Tests)',
    parametersCount: 106,
    reportsIn: 'Reports In 24 Hrs',
    fasting: '10-12 Hrs',
    samples: ['Blood', 'Urine'],
    description: 'Festive preventive wellness package covering 106 clinical parameters including CBC, Liver, Kidney, Lipid, Thyroid, Diabetes, Vitamins (D3 & B12), and complete Urine Analysis.',
    previewBullets: ['CBC 24', 'Liver 12', 'Kidpro 7', 'Lipid 8', 'Thyroid 3', 'Vitamins D3 & B12', 'Urine 20'],
    profiles: [
      {
        name: 'Complete Hemogram (CBC)',
        count: 24,
        description: 'Measures all cellular components of blood including hemoglobin, red cells, platelets, and white cell differential.',
        tests: ['Hemoglobin', 'PCV', 'Total RBC', 'MCV', 'MCH', 'MCHC', 'RDW', 'Platelet Count', 'MPV', 'Total Leucocytes (WBC)', 'Neutrophils', 'Lymphocytes', 'Monocytes', 'Eosinophils', 'Basophils', 'Absolute Counts (5)', 'ESR', 'PDW']
      },
      {
        name: 'Liver Function Test (LFT)',
        count: 12,
        description: 'Assesses liver enzyme synthesis, detox capacity, and bilirubin clearance.',
        tests: ['Total Bilirubin', 'Direct Bilirubin', 'Indirect Bilirubin', 'SGOT/AST', 'SGPT/ALT', 'Alkaline Phosphatase', 'Total Protein', 'Albumin', 'Globulin', 'A/G Ratio', 'GGTP', 'LDH']
      },
      {
        name: 'Kidney Function Test (KFT / Kidpro)',
        count: 8,
        description: 'Evaluates glomerular waste clearance and fluid balance.',
        tests: ['Blood Urea Nitrogen', 'Serum Creatinine', 'Uric Acid', 'Calcium', 'Blood Urea', 'BUN/Creatinine Ratio', 'eGFR', 'Electrolytes']
      },
      {
        name: 'Lipid Profile (Cardiac Risk)',
        count: 8,
        description: 'Comprehensive cholesterol and triglyceride evaluation for cardiovascular wellness.',
        tests: ['Total Cholesterol', 'HDL Good Cholesterol', 'LDL Bad Cholesterol', 'VLDL', 'Triglycerides', 'Non-HDL Cholesterol', 'TC/HDL Ratio', 'LDL/HDL Ratio']
      },
      {
        name: 'Thyroid Profile (T3-T4-UTSH)',
        count: 3,
        description: 'Evaluates glandular production of metabolic controlling hormones.',
        tests: ['Total T3', 'Total T4', 'Ultrasensitive TSH (UTSH)']
      },
      {
        name: 'Vitamin D3 & B12 Profile',
        count: 2,
        description: 'Checks vital bone mineralization, nervous system integrity, and cellular vitality.',
        tests: ['25-Hydroxy Vitamin D (Total)', 'Vitamin B12 Active']
      },
      {
        name: 'Diabetic Screen',
        count: 3,
        description: 'Long-term glycemic monitoring and acute blood sugar assessment.',
        tests: ['HbA1c', 'Average Blood Glucose', 'Fasting Blood Sugar']
      },
      {
        name: 'Iron Deficiency Profile',
        count: 4,
        description: 'Measures systemic iron reserves and protein carrying capacity.',
        tests: ['Serum Iron', 'Total Iron Binding Capacity (TIBC)', '% Transferrin Saturation', 'Serum Ferritin']
      },
      {
        name: 'Complete Urine Analysis',
        count: 20,
        description: 'Clinical urinalysis detecting microscopic blood, casts, infections, and renal excretion.',
        tests: ['Color', 'Appearance', 'Specific Gravity', 'pH', 'Protein', 'Glucose', 'Ketones', 'Bilirubin', 'Urobilinogen', 'Pus Cells', 'RBC', 'Epithelial Cells', 'Casts', 'Crystals', 'Bacteria', 'Others (5)']
      },
      {
        name: 'Cardiac Risk & Electrolytes',
        count: 22,
        description: 'Additional mineral and inflammatory indices protecting cardiovascular rhythm.',
        tests: ['hs-CRP', 'Apolipoprotein A1', 'Apolipoprotein B', 'Sodium', 'Potassium', 'Chloride', 'Additional Mineral Traces (16)']
      }
    ]
  },

  // 3. Aarogyam 1.8 With Utsh (121 Tests)
  'aarogyam 1.8 with utsh': {
    name: 'Aarogyam 1.8 With Utsh',
    parametersCount: 121,
    reportsIn: 'Reports In 24-38 Hrs',
    fasting: '10-12 Hrs',
    samples: ['Blood', 'Urine'],
    description: 'High-end diagnostic screening covering 121 clinical parameters including Elements screening, full organ profiles, vitamins, and cardiac risk markers.',
    previewBullets: ['Elements 15', 'Steroid Markers', 'Vitamins 4', 'CBC 24', 'LFT 12', 'Kidpro 8', 'Lipid 8'],
    profiles: [
      {
        name: 'Elements (Toxic & Nutrients)',
        count: 15,
        description: 'Screening for environmental heavy metals and essential nutritional elements.',
        tests: ['Lead', 'Mercury', 'Arsenic', 'Cadmium', 'Aluminium', 'Chromium', 'Cobalt', 'Copper', 'Zinc', 'Selenium', 'Manganese', 'Nickel', 'Barium', 'Beryllium', 'Thallium']
      },
      {
        name: 'Vitamin Complete Profile',
        count: 4,
        description: 'Covers essential fat-soluble and water-soluble vitamins for skeletal and neural health.',
        tests: ['Vitamin D3 (25-OH)', 'Vitamin B12 Active', 'Folic Acid (Vitamin B9)', 'Vitamin C / B-Complex']
      },
      {
        name: 'Complete Hemogram (CBC)',
        count: 24,
        description: 'Automated differential hemogram assessing complete blood counts and inflammation.',
        tests: ['Hemoglobin', 'PCV', 'Total RBC', 'MCV', 'MCH', 'MCHC', 'RDW', 'Platelet Count', 'MPV', 'Total Leucocytes', 'Neutrophils', 'Lymphocytes', 'Monocytes', 'Eosinophils', 'Basophils', 'Absolute Counts (5)', 'ESR', 'PDW', 'PCT', 'P-LCC']
      },
      {
        name: 'Liver Function Test (LFT)',
        count: 12,
        description: 'Full assessment of liver enzymes, bilirubin fractions, and protein balance.',
        tests: ['Total Bilirubin', 'Direct Bilirubin', 'Indirect Bilirubin', 'SGOT', 'SGPT', 'ALP', 'GGTP', 'Total Protein', 'Albumin', 'Globulin', 'A/G Ratio', 'LDH']
      },
      {
        name: 'Kidney Function Test (KFT)',
        count: 8,
        description: 'Comprehensive filtration markers including creatinine, urea, and electrolytes.',
        tests: ['BUN', 'Serum Creatinine', 'Uric Acid', 'Calcium', 'Urea', 'BUN/Creatinine Ratio', 'Sodium', 'Potassium']
      },
      {
        name: 'Lipid Profile',
        count: 8,
        description: 'Vascular and coronary artery cholesterol risk markers.',
        tests: ['Total Cholesterol', 'HDL', 'LDL', 'VLDL', 'Triglycerides', 'Non-HDL', 'TC/HDL Ratio', 'LDL/HDL Ratio']
      },
      {
        name: 'Thyroid Profile (T3-T4-UTSH)',
        count: 3,
        description: 'Comprehensive thyroid gland status.',
        tests: ['Total T3', 'Total T4', 'Ultrasensitive TSH (UTSH)']
      },
      {
        name: 'Diabetic & Cardiac Markers',
        count: 7,
        description: 'HbA1c, hs-CRP, and Apolipoproteins.',
        tests: ['HbA1c', 'Average Blood Glucose', 'Fasting Glucose', 'hs-CRP', 'Apolipoprotein A1', 'Apolipoprotein B', 'Apo B/A1 Ratio']
      },
      {
        name: 'Iron Deficiency Profile',
        count: 4,
        description: 'Complete iron storage and saturation.',
        tests: ['Serum Iron', 'TIBC', 'Transferrin Saturation', 'Serum Ferritin']
      },
      {
        name: 'Complete Urine Analysis',
        count: 20,
        description: 'Microscopic and chemical urinalysis.',
        tests: ['Color', 'pH', 'Specific Gravity', 'Protein', 'Pus Cells', 'RBC', 'Epithelial Cells', 'Casts', 'Crystals', 'Bacteria', 'Others (10)']
      },
      {
        name: 'Electrolytes & Minerals',
        count: 6,
        description: 'Systemic mineral balance.',
        tests: ['Chloride', 'Inorganic Phosphorus', 'Magnesium', 'Bicarbonate', 'Trace Minerals (2)']
      }
    ]
  },

  // 4. Aarogyam 1.1 With Utsh (72 Tests)
  'aarogyam 1.1 with utsh': {
    name: 'Aarogyam 1.1 With Utsh',
    parametersCount: 72,
    reportsIn: 'Reports In Same Day (8-12 Hrs)',
    fasting: '10-12 Hrs',
    samples: ['Blood', 'Urine'],
    description: 'Comprehensive preventive health checkup covering 72 diagnostic parameters across Cardiac, Liver, Kidney, Thyroid, Blood, and Metabolic vitals.',
    previewBullets: ['CBC 24', 'Liver 12', 'Kidney 8', 'Lipid 7', 'Thyroid 3', 'Iron 4', 'Diabetic 2', 'Urine 12'],
    profiles: [
      {
        name: 'Complete Hemogram (CBC)',
        count: 24,
        description: 'Full hemogram covering red cells, white cells, platelets, and hematic indices.',
        tests: ['Hemoglobin', 'PCV', 'Total RBC', 'MCV', 'MCH', 'MCHC', 'RDW', 'Platelets', 'MPV', 'Total WBC', 'Neutrophils', 'Lymphocytes', 'Monocytes', 'Eosinophils', 'Basophils', 'Absolute Counts (5)', 'ESR', 'PDW', 'PCT', 'P-LCC']
      },
      {
        name: 'Liver Function Test (LFT)',
        count: 12,
        description: 'Hepatic enzymes, proteins, and bilirubin metabolism.',
        tests: ['Total Bilirubin', 'Direct Bilirubin', 'Indirect Bilirubin', 'SGOT/AST', 'SGPT/ALT', 'Alkaline Phosphatase', 'Total Protein', 'Albumin', 'Globulin', 'A/G Ratio', 'GGTP', 'LDH']
      },
      {
        name: 'Kidney Function Test (KFT)',
        count: 8,
        description: 'Renal waste clearance and filtration efficiency.',
        tests: ['Blood Urea Nitrogen', 'Serum Creatinine', 'Uric Acid', 'Serum Calcium', 'Urea', 'BUN/Creatinine Ratio', 'Sodium', 'Potassium']
      },
      {
        name: 'Lipid Profile',
        count: 7,
        description: 'Cardiovascular risk evaluation.',
        tests: ['Total Cholesterol', 'HDL Good Cholesterol', 'LDL Bad Cholesterol', 'VLDL', 'Triglycerides', 'Non-HDL Cholesterol', 'TC/HDL Ratio']
      },
      {
        name: 'Thyroid Profile',
        count: 3,
        description: 'Metabolic master gland screening.',
        tests: ['Total T3', 'Total T4', 'Ultrasensitive TSH (UTSH)']
      },
      {
        name: 'Iron Deficiency Profile',
        count: 4,
        description: 'Anemia and iron absorption screening.',
        tests: ['Serum Iron', 'TIBC', 'Transferrin Saturation %', 'Serum Ferritin']
      },
      {
        name: 'Diabetic Screen',
        count: 2,
        description: 'Blood sugar control evaluation.',
        tests: ['HbA1c', 'Average Blood Glucose']
      },
      {
        name: 'Urine Analysis',
        count: 12,
        description: 'Screening for protein leakage, pus cells, and crystals.',
        tests: ['Color', 'Appearance', 'Specific Gravity', 'pH', 'Protein', 'Glucose', 'Ketones', 'Bilirubin', 'Pus Cells', 'RBCs', 'Epithelial Cells', 'Casts']
      }
    ]
  },

  // 5. Aarogyam Basic 1 With UTSH (50 Tests)
  'aarogyam basic 1 with utsh': {
    name: 'Aarogyam Basic 1 With UTSH',
    parametersCount: 50,
    reportsIn: 'Reports In 12 Hrs',
    fasting: '10-12 Hrs',
    samples: ['Blood'],
    description: 'Essential preventive health profile covering 50 vital parameters including Hemogram, Liver function, Kidney screening, and Thyroid.',
    previewBullets: ['CBC 24', 'Liver 6', 'Kidney 5', 'Lipid 5', 'Thyroid 1', 'Blood Glucose 1', 'Electrolytes 3'],
    profiles: [
      {
        name: 'Complete Hemogram (CBC)',
        count: 24,
        description: 'Measures complete blood count and differential.',
        tests: ['Hemoglobin', 'RBC', 'Platelets', 'Total WBC', 'Differential Count (5)', 'Absolute Counts (5)', 'PCV', 'MCV', 'MCH', 'MCHC', 'RDW', 'ESR', 'MPV']
      },
      {
        name: 'Liver Function Screening',
        count: 6,
        description: 'Key enzymes assessing liver health.',
        tests: ['Total Bilirubin', 'SGOT/AST', 'SGPT/ALT', 'Alkaline Phosphatase', 'Total Protein', 'Serum Albumin']
      },
      {
        name: 'Kidney Function Screening',
        count: 5,
        description: 'Primary filtration markers.',
        tests: ['Serum Creatinine', 'Blood Urea Nitrogen', 'Serum Uric Acid', 'Calcium', 'BUN/Creatinine Ratio']
      },
      {
        name: 'Lipid Profile Screening',
        count: 5,
        description: 'Core cholesterol panel.',
        tests: ['Total Cholesterol', 'HDL Cholesterol', 'LDL Cholesterol', 'Triglycerides', 'VLDL']
      },
      {
        name: 'Thyroid & Diabetes',
        count: 2,
        description: 'Basic endocrine check.',
        tests: ['TSH Ultra', 'Fasting Blood Glucose']
      },
      {
        name: 'Serum Electrolytes',
        count: 8,
        description: 'Ionic fluid equilibrium.',
        tests: ['Sodium', 'Potassium', 'Chloride', 'Additional Ionics (5)']
      }
    ]
  },

  // 6. Executive Full Body Health Checkup (125 Tests)
  'executive full body health checkup': {
    name: 'Executive Full Body Health Checkup',
    parametersCount: 125,
    reportsIn: 'Reports In 24 Hrs',
    fasting: '10-12 Hrs',
    samples: ['Blood', 'Urine'],
    description: 'Premier executive full body screening of 125 vital parameters with high-sensitivity cardiac risk markers, toxic elements, hormones, and vitamins.',
    previewBullets: ['Toxic Elements 10', 'Hormones 6', 'CBC 24', 'LFT 12', 'KFT 10', 'Lipid 8', 'Cardiac 5', 'Vitamins 3'],
    profiles: [
      {
        name: 'Toxic Elements & Heavy Metals',
        count: 10,
        description: 'Screens for toxic environmental exposure including lead, arsenic, and mercury.',
        tests: ['Lead', 'Arsenic', 'Mercury', 'Cadmium', 'Aluminium', 'Chromium', 'Cobalt', 'Nickel', 'Selenium', 'Manganese']
      },
      {
        name: 'Steroids & Hormone Markers',
        count: 6,
        description: 'Key hormonal balance markers.',
        tests: ['Total Testosterone', 'Cortisol', 'DHEA-S', 'Prolactin', 'Free Testosterone', 'Progesterone']
      },
      {
        name: 'Complete Hemogram (CBC)',
        count: 24,
        description: 'Automated 6-part hemogram.',
        tests: ['Hemoglobin', 'PCV', 'Total RBC', 'MCV', 'MCH', 'MCHC', 'RDW', 'Platelets', 'MPV', 'Total Leucocytes', 'Neutrophils', 'Lymphocytes', 'Monocytes', 'Eosinophils', 'Basophils', 'Absolute Counts (5)', 'ESR', 'PDW', 'PCT', 'P-LCC']
      },
      {
        name: 'Liver Function Test',
        count: 12,
        description: 'Comprehensive liver enzyme and protein profile.',
        tests: ['Total Bilirubin', 'Direct Bilirubin', 'Indirect Bilirubin', 'SGOT', 'SGPT', 'ALP', 'GGTP', 'Total Protein', 'Albumin', 'Globulin', 'A/G Ratio', 'LDH']
      },
      {
        name: 'Kidney Function Test',
        count: 10,
        description: 'Complete renal profile with electrolytes.',
        tests: ['BUN', 'Creatinine', 'Uric Acid', 'Calcium', 'Urea', 'BUN/Creatinine Ratio', 'Sodium', 'Potassium', 'Chloride', 'Phosphorus']
      },
      {
        name: 'Lipid Profile',
        count: 8,
        description: 'Comprehensive cardiac lipid profile.',
        tests: ['Total Cholesterol', 'HDL', 'LDL', 'VLDL', 'Triglycerides', 'Non-HDL', 'TC/HDL Ratio', 'LDL/HDL Ratio']
      },
      {
        name: 'Thyroid Profile Complete',
        count: 3,
        description: 'T3, T4, and UTSH.',
        tests: ['Total T3', 'Total T4', 'Ultrasensitive TSH']
      },
      {
        name: 'Cardiac Risk Markers',
        count: 5,
        description: 'hs-CRP and apolipoproteins.',
        tests: ['hs-CRP', 'Apo A1', 'Apo B', 'Apo B/A1 Ratio', 'Lipoprotein (a)']
      },
      {
        name: 'Vitamins Profile',
        count: 3,
        description: 'Vital micronutrients.',
        tests: ['Vitamin D3 (25-OH)', 'Vitamin B12', 'Folic Acid']
      },
      {
        name: 'Diabetic Screen',
        count: 4,
        description: 'Comprehensive diabetes monitoring.',
        tests: ['HbA1c', 'Average Blood Glucose', 'Fasting Blood Sugar', 'Urinary Microalbumin']
      },
      {
        name: 'Complete Urine Analysis',
        count: 20,
        description: 'Urinary microscopic screening.',
        tests: ['Color', 'Specific Gravity', 'pH', 'Protein', 'Pus Cells', 'RBCs', 'Casts', 'Crystals', 'Bacteria', 'Others (11)']
      },
      {
        name: 'Bone & Mineral Vitals',
        count: 20,
        description: 'Mineral density and joint metabolism.',
        tests: ['Calcium', 'Inorganic Phosphorus', 'Alkaline Phosphatase', 'Rheumatoid Factor', 'Additional Markers (16)']
      }
    ]
  },

  // 13. Thyroid Profile Total (T3, T4, TSH Ultra)
  'thyroid profile total t3 t4 tsh ultra': {
    name: 'Thyroid Profile Total (T3, T4, TSH Ultra)',
    parametersCount: 3,
    reportsIn: 'Reports In 8-12 Hrs',
    fasting: 'Non-Fasting',
    samples: ['Blood'],
    description: 'Measures Total T3, Total T4, and Ultrasensitive TSH to evaluate thyroid gland health and detect hypothyroidism or hyperthyroidism.',
    previewBullets: ['Total Triiodothyronine (T3)', 'Total Thyroxine (T4)', 'TSH - Ultrasensitive'],
    profiles: [
      {
        name: 'Thyroid Total Hormones (T3-T4-UTSH)',
        count: 3,
        description: 'Complete hormonal regulation of basal metabolism and endocrine energy homeostasis.',
        tests: ['Total Triiodothyronine (T3)', 'Total Thyroxine (T4)', 'Ultrasensitive TSH (UTSH)']
      }
    ]
  },

  // 14. Thyroid Profile Free (FT3, FT4, TSH Ultra)
  'thyroid profile free ft3 ft4 tsh ultra': {
    name: 'Thyroid Profile Free (FT3, FT4, TSH Ultra)',
    parametersCount: 3,
    reportsIn: 'Reports In 8-12 Hrs',
    fasting: 'Non-Fasting',
    samples: ['Blood'],
    description: 'Measures unbound, biologically active Free T3, Free T4, and Ultrasensitive TSH for accurate thyroid disorder diagnosis.',
    previewBullets: ['Free Triiodothyronine (FT3)', 'Free Thyroxine (FT4)', 'TSH - Ultrasensitive'],
    profiles: [
      {
        name: 'Biologically Active Free Thyroid Hormones',
        count: 3,
        description: 'Evaluates unbound hormones unaffected by binding proteins for precision diagnosis.',
        tests: ['Free T3 (FT3)', 'Free T4 (FT4)', 'Ultrasensitive TSH (UTSH)']
      }
    ]
  },

  // 15. Jaanch - Thyroid Profile Basic
  'jaanch thyroid profile basic': {
    name: 'Jaanch - Thyroid Profile Basic',
    parametersCount: 3,
    reportsIn: 'Reports In 8-12 Hrs',
    fasting: 'Non-Fasting',
    samples: ['Blood'],
    description: 'Essential thyroid screening profile including Free T3, Free T4, and Ultrasensitive TSH.',
    previewBullets: ['Free T3 (FT3)', 'Free T4 (FT4)', 'TSH - Ultrasensitive'],
    profiles: [
      {
        name: 'Thyroid Primary Panel',
        count: 3,
        description: 'Targeted assessment for metabolic complaints, unexplained weight changes, and chronic fatigue.',
        tests: ['Free T3 (FT3)', 'Free T4 (FT4)', 'Ultrasensitive TSH (UTSH)']
      }
    ]
  },

  // 16. Jaanch - Thyroid Profile Advanced (8 Tests)
  'jaanch thyroid profile advanced': {
    name: 'Jaanch - Thyroid Profile Advanced (8 Tests)',
    parametersCount: 8,
    reportsIn: 'Reports In 12-24 Hrs',
    fasting: 'Non-Fasting',
    samples: ['Blood'],
    description: 'Comprehensive thyroid diagnostic panel: FT3, FT4, TSH Ultrasensitive, Anti-TPO, Anti-TG, Total T3, Total T4, and Thyroglobulin.',
    previewBullets: ['FT3 & FT4', 'TSH Ultra', 'Anti-TPO Antibodies', 'Anti-TG Antibodies', 'Total T3 & T4', 'Thyroglobulin'],
    profiles: [
      {
        name: 'Free & Total Thyroid Hormones',
        count: 5,
        description: 'Quantifies both circulating free and total triiodothyronine and thyroxine.',
        tests: ['Free T3 (FT3)', 'Free T4 (FT4)', 'Total T3', 'Total T4', 'Ultrasensitive TSH (UTSH)']
      },
      {
        name: 'Thyroid Autoantibodies & Tumor Markers',
        count: 3,
        description: 'Immunological screen detecting Hashimoto thyroiditis, Graves disease, and thyroid tissue markers.',
        tests: ['Anti-TPO (Thyroid Peroxidase Antibodies)', 'Anti-Thyroglobulin Antibodies (Anti-TG)', 'Thyroglobulin (TG)']
      }
    ]
  }
};

/**
 * Normalizes test name to lookup in registry.
 */
function normalizeKey(name: string): string {
  return (name || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/**
 * Gets detailed breakdown for any package. If not explicitly registered, generates a clinical profile set based on parameters count.
 */
export function getPackageDetails(name: string, fallbackCount: number = 72, fallbackDesc: string = ''): DetailedPackageData {
  const norm = normalizeKey(name);

  // Exact or partial match in registry
  for (const [key, data] of Object.entries(PACKAGE_DETAILS_REGISTRY)) {
    if (norm.includes(key) || key.includes(norm)) {
      return data;
    }
  }

  // Generative fallback for any other package
  const count = fallbackCount || 72;
  return {
    name,
    parametersCount: count,
    reportsIn: count > 100 ? 'Reports In 38 Hrs' : 'Reports In 24 Hrs',
    fasting: '10-12 Hrs',
    samples: ['Blood', 'Urine'],
    description: fallbackDesc || `${name} provides an extensive preventive clinical screen covering ${count} essential biomarkers evaluating Cardiac, Liver, Kidney, Thyroid, Blood Hemogram, and Metabolic wellness.`,
    previewBullets: ['Complete Hemogram (24)', 'Liver Function (12)', 'Kidney Function (8)', 'Lipid Profile (8)', 'Thyroid (3)', 'Diabetes (2)', 'Urine Microscopy (20)'],
    profiles: [
      {
        name: 'Complete Hemogram (CBC)',
        count: 24,
        description: 'Automated cellular blood count assessing hemoglobin, infection fighting cells, and platelets.',
        tests: ['Hemoglobin', 'PCV', 'Total RBC', 'MCV', 'MCH', 'MCHC', 'RDW', 'Total WBC', 'Neutrophils', 'Lymphocytes', 'Monocytes', 'Eosinophils', 'Basophils', 'Platelet Count', 'ESR', 'Additional Indices (9)']
      },
      {
        name: 'Liver Function Test (LFT)',
        count: 12,
        description: 'Comprehensive liver enzyme and bilirubin synthesis screen.',
        tests: ['Total Bilirubin', 'Direct Bilirubin', 'Indirect Bilirubin', 'SGOT/AST', 'SGPT/ALT', 'ALP', 'GGTP', 'Total Protein', 'Albumin', 'Globulin', 'A/G Ratio', 'LDH']
      },
      {
        name: 'Kidney Function Test (KFT / Kidpro)',
        count: 8,
        description: 'Evaluates waste filtering capacity and fluid balance.',
        tests: ['Blood Urea Nitrogen (BUN)', 'Serum Creatinine', 'Uric Acid', 'Calcium', 'Blood Urea', 'BUN/Creatinine Ratio', 'Sodium', 'Potassium']
      },
      {
        name: 'Lipid Profile (Cardiac Risk)',
        count: 8,
        description: 'Measures circulating blood cholesterol and triglyceride levels.',
        tests: ['Total Cholesterol', 'HDL Good Cholesterol', 'LDL Bad Cholesterol', 'VLDL', 'Triglycerides', 'Non-HDL Cholesterol', 'TC/HDL Ratio', 'LDL/HDL Ratio']
      },
      {
        name: 'Thyroid Profile (T3-T4-UTSH)',
        count: 3,
        description: 'Complete hormonal regulation of basal metabolism.',
        tests: ['Total T3', 'Total T4', 'Ultrasensitive TSH (UTSH)']
      },
      {
        name: 'Diabetic Screen',
        count: 3,
        description: 'Evaluates long-term and immediate glycemic control.',
        tests: ['HbA1c', 'Average Blood Glucose', 'Fasting Blood Sugar']
      },
      {
        name: 'Complete Urine Analysis (Urine R/M)',
        count: 20,
        description: 'Urinary tract health and microscopic examination.',
        tests: ['Color', 'Appearance', 'Specific Gravity', 'pH', 'Protein', 'Glucose', 'Ketones', 'Bilirubin', 'Pus Cells', 'RBCs', 'Casts', 'Crystals', 'Bacteria', 'Others (7)']
      },
      {
        name: 'Vitamins & Minerals Screen',
        count: Math.max(1, count - 78),
        description: 'Essential micronutrients protecting bone, nerve, and cellular vitality.',
        tests: ['Vitamin D3 (25-OH)', 'Vitamin B12 Active', 'Iron Deficiencies', 'Serum Electrolytes']
      }
    ]
  };
}

