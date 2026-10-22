import uuid
from datetime import datetime
from typing import Dict, List, Any

# Clinical Tests Catalog in INR
INITIAL_TESTS: List[Dict[str, Any]] = [
    {
        "id": "test_cbc",
        "name": "Complete Blood Count (CBC) with ESR",
        "slug": "complete-blood-count-cbc",
        "description": "Essential diagnostic screening covering 24 vital hematological parameters including Hemoglobin, Platelets, RBC, and WBC differential count.",
        "category": "Hematology",
        "price": 349,
        "original_price": 500,
        "preparation_instructions": "No mandatory fasting required. Hydrate adequately with plain water.",
        "turnaround_description": "Same Day (6-8 hours)",
        "sample_type": "Whole Blood (EDTA Lavender Top)",
        "active": True
    },
    {
        "id": "test_lft",
        "name": "Liver Function Test (LFT) Comprehensive",
        "slug": "liver-function-test-lft",
        "description": "Detailed hepatic panel evaluating SGOT/AST, SGPT/ALT, Bilirubin (Total, Direct & Indirect), Alkaline Phosphatase, and Serum Albumin.",
        "category": "Biochemistry",
        "price": 699,
        "original_price": 950,
        "preparation_instructions": "10-12 hours overnight fasting strictly advised. Avoid alcohol 24h prior.",
        "turnaround_description": "Next Day Morning",
        "sample_type": "Serum (SST Gold Top)",
        "active": True
    },
    {
        "id": "test_kft",
        "name": "Kidney Function Test (KFT / RFT) with Electrolytes",
        "slug": "kidney-function-test-kft",
        "description": "Comprehensive renal panel measuring Blood Urea Nitrogen (BUN), Serum Creatinine, Uric Acid, Sodium, Potassium, and Chloride.",
        "category": "Biochemistry",
        "price": 749,
        "original_price": 1050,
        "preparation_instructions": "8-10 hours fasting recommended. Maintain normal fluid intake.",
        "turnaround_description": "Same Day (8 hours)",
        "sample_type": "Serum (SST Gold Top)",
        "active": True
    },
    {
        "id": "test_lipid",
        "name": "Lipid Profile Panel (Cardiac Risk Assessment)",
        "slug": "lipid-profile",
        "description": "Evaluates cardiovascular risk assessing Total Cholesterol, HDL Good Cholesterol, LDL Bad Cholesterol, VLDL, and Triglycerides.",
        "category": "Lipidology",
        "price": 549,
        "original_price": 800,
        "preparation_instructions": "Strict 12-hour overnight fasting required. Water is permitted.",
        "turnaround_description": "Same Day Evening",
        "sample_type": "Serum (SST Gold Top)",
        "active": True
    },
    {
        "id": "test_hba1c",
        "name": "HbA1c (Glycated Hemoglobin) Diabetes Monitor",
        "slug": "hba1c-glycated-hemoglobin",
        "description": "Gold standard diagnostic measuring 3-month average blood glucose control for diabetic monitoring and pre-diabetes screening.",
        "category": "Diabetes",
        "price": 449,
        "original_price": 650,
        "preparation_instructions": "Fasting not mandatory. Can be drawn any time of day.",
        "turnaround_description": "Same Day (4-6 hours)",
        "sample_type": "Whole Blood (EDTA Lavender Top)",
        "active": True
    },
    {
        "id": "test_tsh",
        "name": "Thyroid Profile Total (T3, T4, TSH Ultra-Sensitive)",
        "slug": "thyroid-profile-total",
        "description": "Complete endocrinology evaluation measuring Free/Total Triiodothyronine (T3), Thyroxine (T4), and Thyroid Stimulating Hormone (TSH).",
        "category": "Endocrinology",
        "price": 499,
        "original_price": 750,
        "preparation_instructions": "Early morning sample collection advised before taking thyroid medication.",
        "turnaround_description": "Next Day (12 hours)",
        "sample_type": "Serum (SST Gold Top)",
        "active": True
    },
    {
        "id": "test_vit_d",
        "name": "Vitamin D 25-Hydroxy (Total 25-OH)",
        "slug": "vitamin-d-total",
        "description": "Measures bioactive Vitamin D reserves essential for bone density, muscular strength, calcium absorption, and immune defenses.",
        "category": "Vitamins",
        "price": 899,
        "original_price": 1500,
        "preparation_instructions": "No specific fasting required.",
        "turnaround_description": "24 Hours",
        "sample_type": "Serum (SST Gold Top)",
        "active": True
    },
    {
        "id": "test_vit_b12",
        "name": "Vitamin B12 (Cyanocobalamin)",
        "slug": "vitamin-b12",
        "description": "Essential assessment of neurological health, cognitive function, nerve myelin maintenance, and red blood cell production.",
        "category": "Vitamins",
        "price": 799,
        "original_price": 1200,
        "preparation_instructions": "Overnight 8-hour fasting recommended.",
        "turnaround_description": "24 Hours",
        "sample_type": "Serum (SST Gold Top)",
        "active": True
    }
]

# Health Packages Catalog in INR
INITIAL_PACKAGES: List[Dict[str, Any]] = [
    {
        "id": "pkg_wellness_essential",
        "name": "Wellness Essential Health Package",
        "slug": "wellness-essential-package",
        "description": "Complete 58-parameter preventive body checkup including CBC, LFT, KFT, Lipid Profile, Blood Glucose, and Urine Routine.",
        "price": 1499,
        "original_price": 3499,
        "preparation_instructions": "10-12 hours overnight fasting required. Water is allowed.",
        "tests_included": [
            "Complete Blood Count (CBC with ESR - 24 Parameters)",
            "Liver Function Test (LFT - 11 Parameters)",
            "Kidney Function Test (KFT/RFT - 8 Parameters)",
            "Lipid Profile (Cardiac Risk - 8 Parameters)",
            "Fasting Blood Sugar (Glucose)"
        ],
        "active": True
    },
    {
        "id": "pkg_senior_citizen",
        "name": "Senior Citizen Comprehensive Panel",
        "slug": "senior-citizen-comprehensive",
        "description": "84-parameter executive geriatric panel for age 50+, covering vital organ functions, bone markers, cardiac indicators, and vitamins.",
        "price": 2999,
        "original_price": 6500,
        "preparation_instructions": "10-12 hours fasting required. Morning collection recommended.",
        "tests_included": [
            "Complete Blood Count (CBC) with ESR",
            "Comprehensive Liver Function Panel",
            "Kidney Function & Electrolytes (Na, K, Cl)",
            "Lipid Profile & Atherogenic Risk Index",
            "HbA1c (3-Month Sugar Average)",
            "Thyroid Profile (T3, T4, TSH)",
            "Vitamin D3 & Vitamin B12 Levels",
            "Serum Calcium & Phosphorus"
        ],
        "active": True
    }
]

# In-Memory Clinical State
DB: Dict[str, Any] = {
    "tests": INITIAL_TESTS,
    "packages": INITIAL_PACKAGES,
    "addresses": [
        {
            "id": "addr_1",
            "patient_id": "user_patient_1",
            "label": "Home",
            "recipient_name": "Sarah Jenkins",
            "phone": "+91 98765 43210",
            "address_line_1": "Flat 402, Greenfield Residences, Sector 65",
            "address_line_2": "Golf Course Extension Road",
            "locality": "Sector 65",
            "city": "Gurugram",
            "state": "Haryana",
            "postal_code": "122018",
            "latitude": 28.4022,
            "longitude": 77.0654,
            "landmark": "Near Emerald Plaza Gate 2",
            "access_instructions": "Intercom code #402. Disinfect kit at door.",
            "is_default": True
        }
    ],
    "bookings": [
        {
            "id": "b_1001",
            "booking_reference": "WD-2026-8841",
            "patient_id": "user_patient_1",
            "patient_name": "Sarah Jenkins",
            "patient_phone": "+91 98765 43210",
            "patient_email": "patient@wellness.com",
            "status": "Assigned",
            "scheduled_date": "2026-10-22",
            "scheduled_slot": "07:30 AM - 08:30 AM",
            "address_snapshot": {
                "address_line_1": "Flat 402, Greenfield Residences, Sector 65",
                "locality": "Sector 65",
                "city": "Gurugram",
                "postal_code": "122018",
                "latitude": 28.4022,
                "longitude": 77.0654
            },
            "subtotal": 1048,
            "collection_fee": 0,
            "tax_amount": 0,
            "total_amount": 1048,
            "payment_status": "Pending",
            "assigned_driver_id": "drv_1",
            "assigned_driver_name": "Rajesh Kumar (Senior Phlebotomist)",
            "assigned_driver_phone": "+91 98111 22334",
            "items": [
                {
                    "test_id": "test_cbc",
                    "item_name": "Complete Blood Count (CBC) with ESR",
                    "unit_price": 349,
                    "quantity": 1,
                    "line_total": 349
                },
                {
                    "test_id": "test_lft",
                    "item_name": "Liver Function Test (LFT) Comprehensive",
                    "unit_price": 699,
                    "quantity": 1,
                    "line_total": 699
                }
            ],
            "created_at": "2026-10-21T10:00:00Z"
        }
    ],
    "drivers": [
        {
            "id": "drv_1",
            "name": "Rajesh Kumar",
            "phone": "+91 98111 22334",
            "badge_number": "PHLEB-DEL-041",
            "cooler_serial": "COLD-BOX-8891-B",
            "active": True
        },
        {
            "id": "drv_2",
            "name": "Amit Sharma",
            "phone": "+91 98222 33445",
            "badge_number": "PHLEB-DEL-089",
            "cooler_serial": "COLD-BOX-7721-A",
            "active": True
        }
    ],
    "events": [
        {
            "id": "evt_1",
            "booking_id": "b_1001",
            "event_type": "BOOKING_CREATED",
            "actor_name": "Sarah Jenkins",
            "notes": "Appointment scheduled for home collection.",
            "timestamp": "2026-10-21T10:00:00Z"
        },
        {
            "id": "evt_2",
            "booking_id": "b_1001",
            "event_type": "DRIVER_ASSIGNED",
            "actor_name": "Dr. Eleanor Vance (Admin)",
            "notes": "Phlebotomist Rajesh Kumar dispatched for morning slot.",
            "timestamp": "2026-10-21T10:30:00Z"
        }
    ],
    "reports": [
        {
            "id": "rep_991",
            "booking_id": "b_1001",
            "patient_id": "user_patient_1",
            "test_name": "Complete Blood Count & Liver Panel",
            "download_url": "/reports/mock-report.pdf",
            "file_size": "342 KB",
            "release_status": "Released",
            "pathologist_signoff": "Dr. Eleanor Vance, MD (Pathology)",
            "created_at": "2026-10-21T11:00:00Z"
        }
    ],
    "invoices": [
        {
            "id": "inv_8801",
            "invoice_number": "INV-2026-8801",
            "booking_id": "b_1001",
            "patient_id": "user_patient_1",
            "patient_name": "Sarah Jenkins",
            "amount": 1048,
            "status": "Paid Online",
            "created_at": "2026-10-21T10:00:00Z"
        }
    ]
}
