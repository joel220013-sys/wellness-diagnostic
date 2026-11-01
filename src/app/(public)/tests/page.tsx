'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ArrowLeft, Heart, Droplet, Activity, CircleDot, Shield, Cpu, Sun, Sparkles, FlaskConical } from 'lucide-react';
import BrandLogo from '@/components/common/BrandLogo';
import PublicHeader from '@/components/layout/public-header';
import { useData } from '@/context/DataContext';
import { TestCategory } from '@/types';

export default function TestsCatalogPage() {
  const router = useRouter();
  const { tests, toggleSelectTest, isTestSelected } = useData();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: string[] = [
    'All',
    'Popular',
    'Full Body',
    'Blood Test',
    'Diabetes',
    'Thyroid',
    'Lipid',
    'Jaanch',
    'Vitamins',
    'Liver',
    'Kidney',
    'Hematology',
  ];

  const filteredTests = tests.filter((t) => {
    const catLower = (t.category || '').toLowerCase();
    const selLower = selectedCategory.toLowerCase();
    const nameLower = (t.name || '').toLowerCase();

    let matchesCat = selectedCategory === 'All';
    if (!matchesCat) {
      if (selectedCategory === 'Popular') {
        matchesCat = !!t.popular;
      } else if (selectedCategory === 'Thyroid') {
        matchesCat =
          catLower.includes('thyroid') ||
          catLower.includes('endocrin') ||
          nameLower.includes('thyroid') ||
          nameLower.includes('tsh') ||
          nameLower.includes('t3') ||
          nameLower.includes('t4') ||
          nameLower.includes('anti-tpo') ||
          nameLower.includes('anti-tg') ||
          nameLower.includes('thyroglobulin');
      } else if (selectedCategory === 'Kidney') {
        matchesCat =
          catLower.includes('kidney') ||
          catLower.includes('renal') ||
          nameLower.includes('kidney') ||
          nameLower.includes('renal') ||
          nameLower.includes('kft') ||
          nameLower.includes('kidpro') ||
          nameLower.includes('creatinine') ||
          nameLower.includes('microalbumin') ||
          nameLower.includes('uric acid') ||
          nameLower.includes('urea');
      } else if (selectedCategory === 'Lipid') {
        matchesCat =
          catLower.includes('lipid') ||
          catLower.includes('cardiac') ||
          nameLower.includes('lipid') ||
          nameLower.includes('cholesterol') ||
          nameLower.includes('triglyceride') ||
          nameLower.includes('hdl') ||
          nameLower.includes('ldl') ||
          nameLower.includes('vldl') ||
          nameLower.includes('cardiac') ||
          nameLower.includes('apolipoprotein');
      } else if (selectedCategory === 'Liver') {
        matchesCat =
          catLower.includes('liver') ||
          catLower.includes('hepatic') ||
          nameLower.includes('liver') ||
          nameLower.includes('lft') ||
          nameLower.includes('hepatic') ||
          nameLower.includes('bilirubin') ||
          nameLower.includes('sgot') ||
          nameLower.includes('sgpt') ||
          nameLower.includes('alkaline phosphatase') ||
          nameLower.includes('ggt');
      } else if (selectedCategory === 'Diabetes') {
        matchesCat =
          catLower.includes('diabet') ||
          nameLower.includes('diabet') ||
          nameLower.includes('glucose') ||
          nameLower.includes('sugar') ||
          nameLower.includes('hba1c') ||
          nameLower.includes('insulin');
      } else if (selectedCategory === 'Vitamins') {
        matchesCat =
          catLower.includes('vitamin') ||
          nameLower.includes('vitamin') ||
          nameLower.includes('vit ') ||
          nameLower.includes('vit-') ||
          nameLower.includes('vitd') ||
          nameLower.includes('vitb') ||
          nameLower.includes('folate') ||
          nameLower.includes('folic acid') ||
          nameLower.includes('biotin') ||
          nameLower.includes('cobalamin');
      } else if (selectedCategory === 'Hematology') {
        matchesCat =
          catLower.includes('hematolog') ||
          catLower.includes('haematolog') ||
          nameLower.includes('cbc') ||
          nameLower.includes('hemogram') ||
          nameLower.includes('hemoglobin') ||
          nameLower.includes('esr') ||
          nameLower.includes('platelet');
      } else if (selectedCategory === 'Full Body' || selectedCategory === 'Full Body Checkups') {
        matchesCat =
          catLower.includes('package') ||
          catLower.includes('checkup') ||
          catLower.includes('full body') ||
          catLower.includes('health package') ||
          (t.id && t.id.startsWith('pkg_')) ||
          nameLower.includes('aarogyam') ||
          nameLower.includes('package') ||
          nameLower.includes('profile') ||
          nameLower.includes('checkup');
      } else if (selectedCategory === 'Jaanch') {
        matchesCat =
          catLower.includes('jaanch') ||
          nameLower.includes('jaanch');
      } else if (selectedCategory === 'Blood Test') {
        matchesCat =
          catLower.includes('blood') ||
          (t.sample_type || '').toLowerCase().includes('blood');
      } else {
        matchesCat = catLower.includes(selLower);
      }
    }

    const matchesSearch =
      (t.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-ivory-200 text-botanical-900 selection:bg-botanical-200 flex flex-col justify-between">
      <PublicHeader />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-botanical-950">
              Diagnostic Test Catalog
            </h1>
            <p className="text-xs sm:text-sm text-botanical-800/80 mt-1">
              Select verified clinical tests. Certified doorstep sample collection across the city.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-botanical-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tests..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-ivory-300 focus:ring-2 focus:ring-botanical-500 bg-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-botanical-500 text-white shadow-soft-sm'
                  : 'bg-white text-botanical-800 hover:bg-ivory-100 border border-ivory-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredTests.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-ivory-300 shadow-soft-sm space-y-3">
            <FlaskConical className="w-12 h-12 text-botanical-400 mx-auto" />
            <h3 className="text-base font-bold text-botanical-950">No diagnostic tests found</h3>
            <p className="text-xs text-botanical-700/80 max-w-sm mx-auto">
              {searchQuery ? `We couldn't find any tests matching "${searchQuery}".` : 'There are currently no tests listed in this category.'}
            </p>
            {(searchQuery || selectedCategory !== 'All') && (
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="mt-2 px-4 py-2 rounded-xl bg-botanical-500 text-white font-bold text-xs shadow-soft"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTests.map((test) => {
              const isSelected = isTestSelected(test.id);

              return (
                <div
                  key={test.id}
                  className="bg-white rounded-2xl p-5 border border-ivory-300 shadow-soft-card flex flex-col justify-between hover:border-botanical-300 hover:shadow-soft transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-botanical-50 text-botanical-700 border border-botanical-100">
                        {test.category}
                      </span>
                      {test.popular && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-peach-100 text-peach-800">
                          Popular
                        </span>
                      )}
                    </div>

                    <Link href={`/tests/${test.id}`} className="hover:text-botanical-600">
                      <h3 className="font-bold text-base text-botanical-950">{test.name}</h3>
                    </Link>
                    <p className="text-xs text-botanical-800/75 mt-1 line-clamp-2">{test.description}</p>

                    <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-botanical-700">
                      <span className="px-2 py-0.5 rounded bg-ivory-100 border border-ivory-200">
                        {test.parameters_count} Parameters
                      </span>
                      <span className="px-2 py-0.5 rounded bg-ivory-100 border border-ivory-200">
                        TAT: {test.turnaround_description}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-ivory-200 flex items-center justify-between">
                    <div>
                      <span className="text-lg font-extrabold text-botanical-950 font-mono">
                        ₹{test.price.toLocaleString('en-IN')}
                      </span>
                      {Boolean(test.original_price && test.original_price > test.price) && (
                        <span className="text-xs text-botanical-600/60 line-through ml-1.5">
                          ₹{test.original_price?.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/tests/${test.id}`}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-ivory-300 hover:bg-ivory-100"
                      >
                        Details
                      </Link>
                      <button
                        onClick={() => toggleSelectTest(test)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-botanical-500 text-white'
                            : 'bg-botanical-50 hover:bg-botanical-100 text-botanical-700 border border-botanical-200'
                        }`}
                      >
                        {isSelected ? '✓ Added' : '+ Add'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="py-4 text-center text-xs text-botanical-700/60 border-t border-ivory-300 bg-white/40">
        Wellness Diagnostic Test Catalog • Accurate NABL Reports
      </footer>
    </div>
  );
}
