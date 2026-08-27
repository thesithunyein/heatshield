"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#09090B]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 pt-[100px] pb-16">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-xs text-white/30 mb-8">Last updated: August 27, 2026</p>

        <div className="space-y-6 text-sm text-white/50 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-white/80 mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using HeatShield, you agree to these Terms of Service. If you do not agree, do not use the service.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/80 mb-2">2. Description of Service</h2>
            <p>HeatShield is an urban heat intelligence platform that provides real-time temperature data, heat risk assessments, and cooling center recommendations using the FortyGuard Temperature API. The service is provided for informational purposes.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/80 mb-2">3. Important Disclaimer</h2>
            <div className="rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 p-4 mt-2">
              <p className="text-[#F87171] font-medium text-xs">NOT A SUBSTITUTE FOR PROFESSIONAL ADVICE</p>
              <p className="mt-1 text-white/40 text-xs">HeatShield provides temperature data and general heat safety information. It is NOT a substitute for professional medical, emergency, or government advice. Always follow official guidance from local authorities and emergency services.</p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/80 mb-2">4. Data Accuracy</h2>
            <p>Temperature data is sourced from the FortyGuard API and is provided &quot;as is.&quot; We strive for accuracy but cannot guarantee real-time precision. Heat risk assessments are algorithmic estimates, not definitive risk evaluations.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/80 mb-2">5. User Responsibilities</h2>
            <ul className="list-disc list-inside space-y-1 text-white/40">
              <li>Use HeatShield for lawful purposes only</li>
              <li>Do not attempt to disrupt or overload the service</li>
              <li>Do not scrape, crawl, or automatedly extract data without permission</li>
              <li>Do not misrepresent HeatShield data as official government or medical advice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/80 mb-2">6. Limitation of Liability</h2>
            <p>HeatShield and its creators are not liable for any damages, injuries, or losses resulting from use of the service. Temperature data and risk assessments are informational only.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/80 mb-2">7. Intellectual Property</h2>
            <p>HeatShield is open source under the MIT License. The FortyGuard Temperature API is used under FortyGuard&apos;s terms of service.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/80 mb-2">8. Third-Party Services</h2>
            <p>HeatShield uses third-party services (FortyGuard API, Featherless AI, Vercel) which have their own terms of service. We are not responsible for their availability or accuracy.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/80 mb-2">9. Termination</h2>
            <p>We reserve the right to suspend or terminate access to HeatShield at any time without notice.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/80 mb-2">10. Changes to Terms</h2>
            <p>We may update these terms at any time. Continued use of HeatShield constitutes acceptance of updated terms.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/80 mb-2">11. Contact</h2>
            <p>For questions about these terms: <a href="mailto:sithunyein.mailto@gmail.com" className="text-[#60A5FA] hover:underline">sithunyein.mailto@gmail.com</a></p>
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
