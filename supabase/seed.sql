-- ==============================================================================
-- WELLNESS DIAGNOSTIC — DEMONSTRATION SEED DATA
-- (Clearly marked demo/staging data, zero production/patient PII)
-- ==============================================================================

-- 1. Seed Diagnostic Tests (In INR ₹)
INSERT INTO public.tests (id, name, slug, description, category, price, preparation_instructions, turnaround_description, sample_type, active)
VALUES
('pkg_full_body', 'Full Body Comprehensive Checkup', 'full-body-comprehensive-checkup', 'Complete hemogram, lipid profile, liver and kidney screening, thyroid profile, and fasting blood sugar.', 'Full Body', 1999.00, '10-12 hours overnight fasting mandatory. Plain water permitted.', '24 Hours', 'Blood (EDTA & Serum Gel Tube)', true),
('pkg_diabetes_care', 'Diabetes Advanced Profile', 'diabetes-advanced-profile', 'HbA1c glycated hemoglobin, average estimated blood glucose, and microalbuminuria screening.', 'Diabetes', 799.00, '8-10 hours fasting required. Morning medication post sample.', '12 Hours', 'Blood & Spot Urine', true),
('pkg_thyroid_eval', 'Thyroid Profile Total (T3, T4, TSH)', 'thyroid-profile-total', 'Comprehensive assessment of thyroid gland functioning and hormone secretion levels.', 'Thyroid', 499.00, 'Morning fasting sample recommended before 10 AM.', '12 Hours', 'Blood (Serum Gel Tube)', true),
('pkg_lipid_heart', 'Lipid Heart Health Profile', 'lipid-heart-health-profile', 'Total cholesterol, HDL, LDL, VLDL, and triglycerides risk assessment for cardiac health.', 'Cardiology', 599.00, 'Strict 12 hours fasting required. No fatty meals prior.', '12 Hours', 'Blood (Serum Gel Tube)', true),
('pkg_cbc_hemogram', 'Complete Hemogram (CBC + ESR)', 'complete-hemogram-cbc-esr', '24 hematological parameters including hemoglobin, platelets, WBC differentials, and infection markers.', 'Routine Hemogram', 399.00, 'No fasting required. Random blood sample accepted.', '6 Hours', 'Blood (EDTA Lavender Tube)', true),
('pkg_liver_function', 'Liver Function Test (LFT)', 'liver-function-test-lft', 'Bilirubin, SGOT/AST, SGPT/ALT, alkaline phosphatase, and protein albumin globulin ratio.', 'Liver Care', 699.00, 'Overnight fasting of 8 hours recommended.', '12 Hours', 'Blood (Serum Gel Tube)', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Diagnostic Packages
INSERT INTO public.packages (id, name, slug, description, price, active)
VALUES
('pkg_family_shield', 'Family Health Shield Package', 'family-health-shield-package', 'Comprehensive health checkup for up to 2 family members with 68 essential wellness parameters.', 2999.00, true),
('pkg_senior_wellness', 'Senior Citizen Specialized Health Package', 'senior-citizen-specialized-health-package', 'Targeted screening for cardiac health, bone mineral density, diabetes control, and renal health.', 2499.00, true)
ON CONFLICT (id) DO NOTHING;
