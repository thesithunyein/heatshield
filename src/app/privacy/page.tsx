"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#09090B]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 pt-[100px] pb-16">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-xs text-white/30 mb-8">Last updated: August 27, 2026</p>

        <div className="space-y-6 text-sm text-white/50 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-white/80 mb-2">1. Information We Collect</h2>
            <p>HeatShield collects minimal data to provide temperature intelligence services:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/40">
              <li><strong className="text-white/60">Location data</strong> — City/coordinates you select for temperature lookups (not stored)</li>
              <li><strong className="text-white/60">Usage data</strong> — Anonymous analytics (pages viewed, features used)</li>
              <li><strong className="text-white/60">Email addresses</strong> — Only if you subscribe to updates (stored securely, never shared)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/80 mb-2">2. How We Use Your Data</h2>
            <ul className="list-disc list-inside space-y-1 text-white/40">
              <li>To provide real-time temperature data and heat risk assessments</li>
              <li>To improve HeatShield&apos;s accuracy and user experience</li>
              <li>To send product updates (only if you subscribed)</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/80 mb-2">3. Data Sharing</h2>
            <p>We do not sell, trade, or share your personal information with third parties except:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/40">
              <li><strong className="text-white/60">FortyGuard API</strong> — Temperature lookups are sent to FortyGuard for processing (subject to their privacy policy)</li>
              <li><strong className="text-white/60">Legal requirements</strong> — When required by law or to protect rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/80 mb-2">4. Data Security</h2>
            <p>We implement industry-standard security measures including encrypted data transmission (HTTPS), secure API key management, and regular security audits. No payment data is collected.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/80 mb-2">5. Cookies</h2>
            <p>HeatShield uses essential cookies for functionality. We do not use tracking cookies or third-party advertising cookies.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/80 mb-2">6. Your Rights</h2>
            <ul className="list-disc list-inside space-y-1 text-white/40">
              <li>Access the data we hold about you</li>
              <li>Request deletion of your data</li>
              <li>Unsubscribe from communications at any time</li>
              <li>Opt out of analytics collection</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/80 mb-2">7. Children&apos;s Privacy</h2>
            <p>HeatShield is not directed at children under 13. We do not knowingly collect data from children.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/80 mb-2">8. Changes to This Policy</h2>
            <p>We may update this policy periodically. Changes will be posted on this page with an updated date.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/80 mb-2">9. Contact</h2>
            <p>For privacy-related inquiries: <a href="mailto:sithunyein.mailto@gmail.com" className="text-[#60A5FA] hover:underline">sithunyein.mailto@gmail.com</a></p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-white/[0.06]">
          <Link href="/" className="text-xs text-white/30 hover:text-white/60 transition-colors">
            &larr; Back to HeatShield
          </Link>
        </div>
      </main>
    </div>
  );
}
