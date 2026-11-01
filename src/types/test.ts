export type TestCategory = 
  | 'All'
  | 'Popular'
  | 'Health Packages'
  | 'Full Body Checkups'
  | 'Full Body'
  | 'Diabetes'
  | 'Thyroid'
  | 'Lipid'
  | 'Liver'
  | 'Kidney'
  | 'Vitamin'
  | 'Hormone'
  | 'Routine Hemogram'
  | 'Cardiology'
  | 'Liver Care'
  | 'Others'
  | string;

export interface TestParameterItem {
  code?: string;
  name: string;
  type?: string;
  groupName?: string;
}

export interface DiagnosticTest {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: TestCategory;
  price: number; // in INR
  original_price?: number;
  preparation_instructions?: string;
  fasting_required?: boolean;
  fasting_hours?: number;
  turnaround_description: string; // e.g. "12-24 Hours"
  sample_type: string; // e.g. "Blood (EDTA & Serum)"
  parameters_count?: number;
  parameters_list?: TestParameterItem[] | string[];
  active: boolean;
  popular?: boolean;
  icon_name?: string;
  created_at?: string;
}

export interface DiagnosticPackage {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number; // in INR
  original_price?: number;
  active: boolean;
  included_tests?: string[]; // test IDs
  turnaround_description?: string;
  sample_type?: string;
  preparation_instructions?: string;
  fasting_required?: boolean;
  fasting_hours?: number;
  parameters_count?: number;
  popular?: boolean;
}
