import sys, os, json, re
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))
from app.data import supabase_db


with open(r'c:\Users\User\Documents\wellness diagnostic\scratch\parsed_catalog.json', 'r', encoding='utf-8') as f:
    packages = json.load(f)

with open(r'c:\Users\User\Documents\wellness diagnostic\scratch\parsed_blood_tests.json', 'r', encoding='utf-8') as f:
    blood_tests = json.load(f)

# Helper to deduce metadata
def get_metadata(slug, title, category, price):
    title_lower = title.lower()
    
    # Parameters count
    param_count = 1
    if '1.8' in title_lower: param_count = 121
    elif '1.7' in title_lower: param_count = 118
    elif '1.6' in title_lower: param_count = 108
    elif '1.5' in title_lower: param_count = 105
    elif '1.4' in title_lower: param_count = 98
    elif '1.2' in title_lower: param_count = 84
    elif '1.1' in title_lower: param_count = 72
    elif 'xl' in title_lower: param_count = 140
    elif 'master plus' in title_lower: param_count = 142
    elif 'aarogyam e' in title_lower: param_count = 102
    elif 'aarogyam d' in title_lower: param_count = 94
    elif 'aarogyam c' in title_lower: param_count = 86
    elif 'aarogyam b' in title_lower: param_count = 60
    elif 'aarogyam a' in title_lower: param_count = 36
    elif 'female' in title_lower: param_count = 95
    elif 'male' in title_lower or 'purush' in title_lower: param_count = 92
    elif 'screen 1+1' in title_lower: param_count = 84
    elif 'full body' in title_lower: param_count = 75
    elif 'fever' in title_lower: param_count = 18
    elif 'diabetic' in title_lower: param_count = 12
    elif 'cardiac' in title_lower or 'heart' in title_lower: param_count = 14
    elif 'allergy' in title_lower: param_count = 35
    elif 'cancer' in title_lower: param_count = 8
    elif 'thyroid' in title_lower: param_count = 3
    elif 'lipid' in title_lower: param_count = 7
    elif 'hemogram' in title_lower or 'cbc' in title_lower: param_count = 24
    elif 'urine' in title_lower: param_count = 15
    elif 'hair' in title_lower or 'skin' in title_lower: param_count = 16
    elif 'senior' in title_lower: param_count = 88
    
    # Fasting requirement
    fasting_required = False
    fasting_hours = 0
    if any(k in title_lower for k in ['fasting', 'aarogyam', 'full body', 'lipid', 'diabetic', 'cardiac', 'sugar', 'glucose', 'master', 'senior']):
        if 'non fasting' not in title_lower:
            fasting_required = True
            fasting_hours = 10 if ('aarogyam' in title_lower or 'full body' in title_lower) else 8
            
    # Sample type
    sample_type = 'Blood (EDTA & Serum)'
    if 'urine' in title_lower and 'blood' not in title_lower and 'aarogyam' not in title_lower:
        sample_type = 'Urine (Sterile Container)'
    elif any(k in title_lower for k in ['aarogyam', 'full body', 'screen', 'comprehensive', 'fever', 'senior', 'master']):
        sample_type = 'Blood (EDTA & Serum) + Urine'
    elif 'sugar' in title_lower or 'hba1c' in title_lower:
        sample_type = 'Whole Blood (Sodium Fluoride / EDTA)'
        
    # Popular
    is_popular = any(k in title_lower for k in ['1.8', '1.1', '1.4', 'aarogyam b', 'female', 'male', 'full body checkup', 'hba1c', 'cbc', 'thyroid', 'lipid', 'screen 1+1'])
    
    # Turnaround time
    tat = 'Same Day (8-12 Hours)'
    if any(k in title_lower for k in ['allergy', 'biopsy', 'culture', 'genetic', 'extended', 'intolerance', 'elements']):
        tat = '48-72 Hours'
    elif any(k in title_lower for k in ['1.8', '1.7', 'xl', 'master', 'advanced', 'hormone', 'vitamins']):
        tat = '24 Hours'
        
    # Description
    desc = f"Certified NABL & ISO accredited {title} from Thyrocare Davangere. Covers {param_count} vital parameters with free certified phlebotomist home collection."
    if 'aarogyam' in title_lower:
        desc = f"Comprehensive preventive health checkup covering {param_count} diagnostic parameters across Cardiac, Liver, Kidney, Thyroid, Blood, and Metabolic vitals."
    elif 'fever' in title_lower:
        desc = f"Targeted fever diagnostic panel evaluating {param_count} markers including Dengue, Malaria, Typhoid, CBC, and inflammatory indicators."
    elif 'diabetic' in title_lower:
        desc = f"Complete metabolic and glycemic health assessment screening blood sugar control, HbA1c, microalbuminuria, and organ health."
        
    # Icon name
    icon_name = 'activity'
    if 'heart' in title_lower or 'cardiac' in title_lower or 'lipid' in title_lower: icon_name = 'heart'
    elif 'blood' in title_lower or 'cbc' in title_lower or 'hemogram' in title_lower: icon_name = 'droplet'
    elif 'aarogyam' in title_lower or 'full body' in title_lower: icon_name = 'shield'
    elif 'vitamin' in title_lower or 'bone' in title_lower: icon_name = 'sun'
    
    return {
        'parameters_count': param_count,
        'fasting_required': fasting_required,
        'fasting_hours': fasting_hours,
        'sample_type': sample_type,
        'is_popular': is_popular,
        'tat': tat,
        'description': desc,
        'icon_name': icon_name
    }

conn = supabase_db.get_connection()
if not conn:
    print("Error: Could not connect to Supabase!")
    exit(1)

cursor = conn.cursor()

merged_items = {}
# 1. Add packages
for p in packages:
    slug = p['slug']
    title = p['title'].replace('&#8211;', '–').replace('&amp;', '&').strip()
    price = p['price']
    orig_price = p['original_price'] or price
    cat = p['category']
    if cat not in ['Full Body Checkups', 'Jaanch Packages', 'Diabetes', 'Heart Profiles', 'Special Packages']:
        cat = 'Full Body Checkups'
    merged_items[slug] = {
        'id': f"pkg_{slug.replace('-', '_')}",
        'name': title,
        'category': cat,
        'price': price,
        'original_price': orig_price,
        'meta': get_metadata(slug, title, cat, price)
    }

# 2. Add blood tests
for b in blood_tests:
    slug = b['slug']
    title = b['title'].replace('&#8211;', '–').replace('&amp;', '&').strip()
    price = b['price']
    orig_price = b['original_price'] or price
    if slug not in merged_items:
        cat = 'Blood Test'
        if any(k in title.lower() for k in ['sugar', 'glucose', 'hba1c']): cat = 'Diabetes'
        elif any(k in title.lower() for k in ['thyroid', 't3', 't4', 'tsh']): cat = 'Thyroid'
        elif any(k in title.lower() for k in ['lipid', 'cholesterol', 'cardiac']): cat = 'Lipid'
        elif any(k in title.lower() for k in ['vitamin', 'calcium', 'bone']): cat = 'Vitamins'
        elif any(k in title.lower() for k in ['cbc', 'hemogram', 'esr', 'platelet', 'blood']): cat = 'Hematology'
        elif any(k in title.lower() for k in ['liver', 'sgot', 'sgpt', 'bilirubin']): cat = 'Liver'
        elif any(k in title.lower() for k in ['kidney', 'creatinine', 'urea']): cat = 'Kidney'
        
        merged_items[slug] = {
            'id': f"test_{slug.replace('-', '_')}",
            'name': title,
            'category': cat,
            'price': price,
            'original_price': orig_price,
            'meta': get_metadata(slug, title, cat, price)
        }

print(f"Total curated items to upsert: {len(merged_items)}")

upsert_query = """
INSERT INTO public.tests (
    id, name, category, price, original_price, fasting_required, fasting_hours,
    tat, description, parameters_count, sample_type, is_popular, icon_name, is_active
)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    fasting_required = EXCLUDED.fasting_required,
    fasting_hours = EXCLUDED.fasting_hours,
    tat = EXCLUDED.tat,
    description = EXCLUDED.description,
    parameters_count = EXCLUDED.parameters_count,
    sample_type = EXCLUDED.sample_type,
    is_popular = EXCLUDED.is_popular,
    icon_name = EXCLUDED.icon_name,
    is_active = EXCLUDED.is_active;
"""

success_count = 0
for slug, item in merged_items.items():
    meta = item['meta']
    try:
        cursor.execute(upsert_query, (
            item['id'],
            item['name'],
            item['category'],
            item['price'],
            item['original_price'],
            meta['fasting_required'],
            meta['fasting_hours'],
            meta['tat'],
            meta['description'],
            meta['parameters_count'],
            meta['sample_type'],
            meta['is_popular'],
            meta['icon_name'],
            True
        ))
        success_count += 1
    except Exception as e:
        print(f"Error upserting {item['name']}: {e}")

cursor.close()
conn.close()
print(f"Successfully upserted {success_count} tests/packages into Supabase!")
