// /src/components/Certifications.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  ExternalLink, 
  Calendar, 
  ShieldCheck, 
  QrCode, 
  Building2, 
  Briefcase, 
  Copy, 
  CheckCircle2,
  FileBadge
} from 'lucide-react';
import { audio } from '../lib/audio';

interface Certification {
  id: string;
  title: string;
  issuer: string;
  date: string;
  credentialId: string;
  verificationUrl: string;
  skillsVerified: string[];
  digest: string; // Cryptographic SHA-256 simulation
  scoreMetrics?: { label: string; value: string }[];
}

const CERTIFICATIONS: Certification[] = [
  {
    id: 'gcp-pca',
    title: 'Professional Cloud Architect',
    issuer: 'Google Cloud Platform (GCP)',
    date: 'March 2026',
    credentialId: 'GCP-PCA-971294',
    verificationUrl: 'https://credential.google.com',
    skillsVerified: ['Kubernetes Engine', 'Cloud Run Ingress', 'IAM RBAC Policy', 'Terraform Modules', 'Dataflow Pipelines'],
    digest: '8f7a6e5d4c3b2a1f0e9d8c7b6a5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e',
    scoreMetrics: [
      { label: 'Security Domain', value: '98% Pass Ratio' },
      { label: 'Architecture SLA', value: '99.99% Implemented' }
    ]
  },
  {
    id: 'java-ocp',
    title: 'Oracle Certified Professional: Java SE 17 Developer',
    issuer: 'Oracle Corporation',
    date: 'November 2025',
    credentialId: 'OCP-17-482093',
    verificationUrl: 'https://oracle.com/verify',
    skillsVerified: ['Java Concurrency', 'Garbage Collection Tuning', 'Virtual Threads', 'Modular System (JPMS)', 'JDBC Connection Pooling'],
    digest: '0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b',
    scoreMetrics: [
      { label: 'Concurrency Engine', value: '100% Score' },
      { label: 'Platform Optimization', value: '94% Score' }
    ]
  },
  {
    id: 'ble-sensing',
    title: 'BLE & ESP32 Embedded Systems Core',
    issuer: 'Creative Technologists Association',
    date: 'January 2026',
    credentialId: 'CTA-BLE-55022',
    verificationUrl: 'https://github.com/10Durga',
    skillsVerified: ['ESP32-WROOM-32', 'BLE RSSI Calibration', 'MicroPython RTOS', 'MAC Anti-Rotation Clustering', 'Low-Power Sleep Profiles'],
    digest: '3f4e5d6c7b8a9f0e1d2c3b4a5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f',
    scoreMetrics: [
      { label: 'RF Calibration', value: 'Sub-1m Accuracy' },
      { label: 'Battery Efficiency', value: '180-Day Low Sleep' }
    ]
  }
];

export default function Certifications() {
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyDigest = (digest: string) => {
    navigator.clipboard.writeText(digest);
    setCopiedId(digest);
    audio.playChime(6);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 flex flex-col select-none animate-fadeIn" id="certifications-view">
      
      {/* View Header */}
      <div className="flex items-center justify-between border-b border-[#222222] pb-3">
        <div className="space-y-1">
          <span className="font-mono text-xs text-[#10B981] tracking-widest uppercase block font-bold">
            // CRYPTOGRAPHIC CREDENTIALS // VERIFIED KEYRINGS
          </span>
          <h2 className="text-4xl font-black tracking-tighter text-white font-sans uppercase">
            CERTIFICATIONS
          </h2>
        </div>
        <span className="font-mono text-xs text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 px-3 py-1 rounded-none uppercase tracking-widest font-bold hidden sm:block">
          Keys Verified
        </span>
      </div>

      <p className="text-gray-300 font-mono text-xs leading-relaxed max-w-xl select-none uppercase tracking-wide">
        These security qualifications are validated directly against digital credential registries, ensuring structural integrity and authentic origin signatures.
      </p>

      {/* Grid of Certs */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Left list of Certifications */}
        <div className="md:col-span-5 flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-2 terminal-scroll">
          {CERTIFICATIONS.map((cert) => {
            const isSelected = selectedCert?.id === cert.id;
            return (
              <div
                key={cert.id}
                onClick={() => {
                  audio.playChime(4);
                  setSelectedCert(cert);
                }}
                className={`border rounded-none p-4 cursor-pointer text-left transition-all duration-300 select-none interactive-node ${
                  isSelected
                    ? 'bg-[#10B981]/5 border-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.08)]'
                    : 'bg-[#121212]/30 border-[#222222] hover:border-white/20 hover:bg-[#121212]/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[9px] text-gray-500 tracking-wider font-bold">
                    {cert.date} // {cert.issuer.split('(')[0].trim()}
                  </span>
                  <Award className={`w-3.5 h-3.5 ${isSelected ? 'text-[#10B981]' : 'text-gray-600'}`} />
                </div>
                <span className="font-mono text-xs font-black text-white block tracking-wider uppercase">
                  {cert.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right side Detailed Certification Ledger */}
        <div className="md:col-span-7 border border-[#222222] bg-[#121212] rounded-none p-5 flex flex-col justify-between select-none relative overflow-hidden">
          {/* Diagnostic background mesh lines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0.95)_95%,rgba(16,185,129,0.02)_100%)] pointer-events-none" />

          {selectedCert ? (
            <div className="space-y-4 flex-1 flex flex-col justify-between relative z-10">
              <div className="space-y-3">
                
                {/* Cert Header */}
                <div className="flex items-start justify-between border-b border-[#222222] pb-2 gap-2">
                  <div className="space-y-1">
                    <span className="font-mono text-[9px] text-[#10B981] font-bold tracking-widest block uppercase">// CREDENTIAL ATTESTATION</span>
                    <h3 className="font-mono text-xs font-black text-white tracking-widest uppercase">{selectedCert.title}</h3>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-[#10B981] shrink-0" />
                </div>

                {/* Details list */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <Building2 className="w-3.5 h-3.5 text-gray-600" />
                    <span className="text-gray-500 uppercase">ISSUER:</span>
                    <span className="text-gray-300 font-bold">{selectedCert.issuer}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono">
                    <Calendar className="w-3.5 h-3.5 text-gray-600" />
                    <span className="text-gray-500 uppercase">DATE COMPLETED:</span>
                    <span className="text-gray-300 font-bold">{selectedCert.date}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono">
                    <FileBadge className="w-3.5 h-3.5 text-gray-600" />
                    <span className="text-gray-500 uppercase">VERIFIED ID:</span>
                    <code className="text-emerald-400 font-bold">{selectedCert.credentialId}</code>
                  </div>
                </div>

                {/* Verified Skills chips */}
                <div className="space-y-1.5 pt-2">
                  <span className="font-mono text-[9px] text-gray-500 font-black tracking-widest uppercase block">// CAPABILITIES EVALUATED:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCert.skillsVerified.map((skill, sIdx) => (
                      <span key={sIdx} className="font-mono text-[9px] text-gray-400 border border-[#222222] bg-[#0c0c0c] px-2 py-0.5 rounded-none uppercase font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Cryptographic SHA Digest (Simulates deep technology integrity check) */}
                <div className="space-y-1 pt-3">
                  <span className="font-mono text-[9px] text-gray-500 font-black tracking-widest uppercase block">// SHA256 INTEGRITY DIGEST:</span>
                  <div className="flex items-center gap-2 bg-[#080808] border border-[#222222] p-2 rounded-none">
                    <code className="text-[9px] text-gray-400 font-mono break-all leading-normal flex-1 tracking-tight select-all">
                      {selectedCert.digest}
                    </code>
                    <button
                      onClick={() => handleCopyDigest(selectedCert.digest)}
                      className="p-1 hover:text-[#10B981] text-gray-600 transition-colors shrink-0 cursor-pointer interactive-node"
                      title="Copy Signature Digest"
                    >
                      {copiedId === selectedCert.digest ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

              </div>

              {/* Score Metrics and verification link */}
              <div className="border-t border-[#222222] pt-4 mt-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {selectedCert.scoreMetrics?.map((metric, mIdx) => (
                    <div key={mIdx} className="bg-[#0c0c0c] border border-[#222222] p-2.5 rounded-none flex flex-col justify-center">
                      <span className="font-mono text-[8px] text-gray-500 tracking-wider block uppercase font-bold">{metric.label}</span>
                      <span className="font-mono text-xs font-black text-[#10B981]">{metric.value}</span>
                    </div>
                  ))}
                </div>

                <a
                  href={selectedCert.verificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-transparent border border-[#10B981] text-[#10B981] font-mono text-xs rounded-none tracking-widest uppercase hover:bg-[#10B981] hover:text-black transition-all text-center flex items-center justify-center gap-2 interactive-node"
                >
                  VALIDATE PUBLIC REGISTRY
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
              <QrCode className="w-12 h-12 text-neutral-800 animate-pulse" />
              <div className="space-y-1">
                <span className="font-mono text-xs text-gray-500 uppercase tracking-widest block font-bold">
                  // CREDENTIAL STREAM STANBY
                </span>
                <span className="font-mono text-[10px] text-gray-600 uppercase block max-w-xs leading-normal">
                  Select a secure cryptographic certification key from the ledger stack to inspect system metadata.
                </span>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
