import React from 'react';
import Link from 'next/link';
import BrandLogo from '@/components/common/BrandLogo';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Heart, 
  Award,
  ExternalLink
} from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer className="bg-[#18352E] text-ivory-100 pt-16 pb-12 border-t border-botanical-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          {/* Col 1 & 2: Brand Information */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo size="md" showTagline={true} inverted={true} />
            <p className="text-sm text-ivory-200/80 leading-relaxed max-w-sm mt-4">
              Wellness Diagnostic is an advanced clinical diagnostic laboratory offering comprehensive routine & specialized blood testing with sterile, safe doorstep home sample collection across major metropolitan areas.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-peach-300 border border-white/15">
                <ShieldCheck className="w-3.5 h-3.5" />
                ISO 15189 Quality Standards
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-emerald-300 border border-white/15">
                <Award className="w-3.5 h-3.5" />
                NABL Accredited Labs
              </span>
            </div>
          </div>

          {/* Col 3: Quick Links */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-peach-300">
              Quick Navigation
            </p>
            <ul className="space-y-2 text-sm text-ivory-200/80">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/tests" className="hover:text-white transition-colors">Test Directory</Link></li>
              <li><Link href="/packages" className="hover:text-white transition-colors">Health Packages</Link></li>
              <li><Link href="/home-collection" className="hover:text-white transition-colors">Home Collection Guide</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Our Laboratory</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* Col 4: Portals */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-peach-300">
              Access Portals
            </p>
            <ul className="space-y-2 text-sm text-ivory-200/80">
              <li><Link href="/portal" className="hover:text-white transition-colors font-semibold">Portal Selection</Link></li>
              <li><Link href="/patient/login" className="hover:text-white transition-colors">Patient Portal</Link></li>
              <li><Link href="/patient/register" className="hover:text-white transition-colors">Patient Registration</Link></li>
              <li><Link href="/admin/login" className="hover:text-white transition-colors">Admin Portal</Link></li>
              <li><Link href="/driver/login" className="hover:text-white transition-colors">Phlebotomist / Driver Portal</Link></li>
            </ul>
          </div>

          {/* Col 5: Contact & Operating Hours */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-peach-300">
              Laboratory Contact
            </p>
            <div className="space-y-2.5 text-xs text-ivory-200/80">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-peach-400 flex-shrink-0 mt-0.5" />
                <span>Sector 14 Diagnostic Hub, Connaught Place, New Delhi 110001</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-peach-400 flex-shrink-0" />
                <span>1800-419-WELL (Toll Free)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-peach-400 flex-shrink-0" />
                <span>support@wellnessdiagnostic.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-peach-400 flex-shrink-0" />
                <span>Home Collection: 6:00 AM – 8:00 PM Daily</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-ivory-300/60 gap-4">
          <p>© {new Date().getFullYear()} Wellness Diagnostic Laboratory Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-ivory-200">Quality Policy</Link>
            <Link href="/contact" className="hover:text-ivory-200">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-ivory-200">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
