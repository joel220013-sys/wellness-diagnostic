-- ==============================================================================
-- WELLNESS DIAGNOSTIC — DEMONSTRATION SEED DATA
-- (Clearly marked demo/staging data, zero production/patient PII)
-- ==============================================================================

-- 1. Seed Diagnostic Tests (In INR ₹)
INSERT INTO public.tests (
    id, name, category, price, original_price, fasting_required, fasting_hours, tat, description, parameters_count, sample_type, is_popular, is_active
)
VALUES
('test_cbc', 'Complete Blood Count (CBC) with ESR', 'Hematology', 349.00, 500.00, false, 0, 'Same Day (6-8 hours)', 'Essential diagnostic screening covering 24 vital hematological parameters including Hemoglobin, Platelets, RBC, and WBC differential count.', 24, 'Whole Blood (EDTA Lavender Top)', true, true),
('test_lft', 'Liver Function Test (LFT) Comprehensive', 'Biochemistry', 699.00, 950.00, true, 12, 'Next Day Morning', 'Detailed hepatic panel evaluating SGOT/AST, SGPT/ALT, Bilirubin, Alkaline Phosphatase, and Serum Albumin.', 12, 'Serum (SST Gold Top)', true, true),
('test_kft', 'Kidney Function Test (KFT) with Electrolytes', 'Biochemistry', 749.00, 1050.00, true, 10, 'Same Day (8 hours)', 'Comprehensive renal panel measuring Blood Urea Nitrogen (BUN), Serum Creatinine, Uric Acid, Sodium, Potassium, and Chloride.', 8, 'Serum (SST Gold Top)', false, true),
('test_lipid', 'Lipid Profile Panel (Cardiac Risk Assessment)', 'Lipidology', 549.00, 800.00, true, 12, 'Same Day Evening', 'Evaluates cardiovascular risk assessing Total Cholesterol, HDL Good Cholesterol, LDL Bad Cholesterol, VLDL, and Triglycerides.', 7, 'Serum (SST Gold Top)', true, true),
('test_hba1c', 'HbA1c (Glycated Hemoglobin) Diabetes Monitor', 'Endocrinology', 499.00, 700.00, false, 0, '4 Hours Express', 'Golden standard monitor for 3-month average blood glucose control and prediabetes screening.', 2, 'Whole Blood (EDTA)', true, true),
('test_thyroid', 'Thyroid Profile Total (T3, T4, TSH Ultra)', 'Endocrinology', 449.00, 650.00, true, 8, 'Same Day Evening', 'Full evaluation of thyroid gland functioning and metabolism regulation hormones.', 3, 'Serum (SST Gold Top)', true, true),
('test_vitd', 'Vitamin D 25-Hydroxy (Bone & Immunity)', 'Vitamins', 899.00, 1400.00, false, 0, '24 Hours', 'Key marker for bone density, skeletal health, calcium absorption, and cellular immunity strength.', 1, 'Serum (SST Gold Top)', true, true),
('test_vitb12', 'Vitamin B12 Active (Cobalamin Level)', 'Vitamins', 799.00, 1200.00, true, 8, '24 Hours', 'Vital neuro-marker for nerve health, brain function, DNA synthesis, and red blood cell production.', 1, 'Serum (SST Gold Top)', false, true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    category = EXCLUDED.category;
