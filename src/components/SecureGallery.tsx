// /src/components/SecureGallery.tsx
import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Image as ImageIcon, 
  Lock, 
  Unlock, 
  Plus, 
  Trash2, 
  Users, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  Upload, 
  UserCheck, 
  HelpCircle,
  FileCheck2,
  ExternalLink
} from 'lucide-react';
import { audio } from '../lib/audio';

interface GalleryPhoto {
  id: string;
  url: string;
  caption: string;
  createdAt: string;
  driveId?: string;
}

const DEFAULT_PHOTOS: GalleryPhoto[] = [
  {
    id: 'photo-1',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    caption: 'ESP32 BLE Node Array field deployment under testing protocols',
    createdAt: '2026-05-12T14:32:00Z'
  },
  {
    id: 'photo-2',
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
    caption: 'Hardware-in-the-loop parameter dashboard configuration',
    createdAt: '2026-06-01T09:15:00Z'
  },
  {
    id: 'photo-3',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    caption: 'Decrypted binary firmware buffer diagnostics',
    createdAt: '2026-06-20T18:45:00Z'
  }
];

const DEFAULT_EMAILS = [
  'anirvarti@gmail.com', // Admin Default
  'guest@aistudio.com',
  'examiner@university.edu'
];

export default function SecureGallery() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [permittedEmails, setPermittedEmails] = useState<string[]>([]);
  
  // Simulated Authentication State for Demonstration
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('anirvarti@gmail.com');
  const [newEmailInput, setNewEmailInput] = useState<string>('');
  const [newPhotoUrl, setNewPhotoUrl] = useState<string>('');
  const [newPhotoCaption, setNewPhotoCaption] = useState<string>('');
  
  // UI Helpers
  const [showAddForm, setShowAddForm] = useState(false);
  const [hoveredPhoto, setHoveredPhoto] = useState<string | null>(null);
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  // Load photos and permitted emails from localStorage
  useEffect(() => {
    const savedPhotos = localStorage.getItem('gallery_photos');
    if (savedPhotos) {
      setPhotos(JSON.parse(savedPhotos));
    } else {
      setPhotos(DEFAULT_PHOTOS);
      localStorage.setItem('gallery_photos', JSON.stringify(DEFAULT_PHOTOS));
    }

    const savedEmails = localStorage.getItem('gallery_permitted_emails');
    if (savedEmails) {
      setPermittedEmails(JSON.parse(savedEmails));
    } else {
      setPermittedEmails(DEFAULT_EMAILS);
      localStorage.setItem('gallery_permitted_emails', JSON.stringify(DEFAULT_EMAILS));
    }
  }, []);

  const savePhotos = (updatedPhotos: GalleryPhoto[]) => {
    setPhotos(updatedPhotos);
    localStorage.setItem('gallery_photos', JSON.stringify(updatedPhotos));
  };

  const savePermittedEmails = (updatedEmails: string[]) => {
    setPermittedEmails(updatedEmails);
    localStorage.setItem('gallery_permitted_emails', JSON.stringify(updatedEmails));
  };

  // Helper to parse Google Drive URLs and extract direct render links
  const resolveImageUrl = (inputUrl: string): { url: string; driveId?: string } => {
    if (!inputUrl) return { url: '' };

    // Regex to match Drive file IDs
    // Standard formats:
    // https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    // https://drive.google.com/open?id=FILE_ID
    const driveRegexes = [
      /\/file\/d\/([a-zA-Z0-9_-]+)/,
      /[?&]id=([a-zA-Z0-9_-]+)/,
      /drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/
    ];

    for (const regex of driveRegexes) {
      const match = inputUrl.match(regex);
      if (match && match[1]) {
        const driveId = match[1];
        // Return Google's direct image cache rendering endpoint
        return { 
          url: `https://lh3.googleusercontent.com/d/${driveId}`,
          driveId 
        };
      }
    }

    return { url: inputUrl };
  };

  const handleAddPhoto = (e: FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim() || !newPhotoCaption.trim()) {
      audio.playErrorSound();
      return;
    }

    const { url, driveId } = resolveImageUrl(newPhotoUrl.trim());

    const newPhoto: GalleryPhoto = {
      id: `photo-${Date.now()}`,
      url,
      caption: newPhotoCaption.trim(),
      createdAt: new Date().toISOString(),
      driveId
    };

    const updated = [newPhoto, ...photos];
    savePhotos(updated);
    
    // Play sci-fi notification sound
    audio.playChime(7);
    
    // Clear inputs
    setNewPhotoUrl('');
    setNewPhotoCaption('');
    setShowAddForm(false);
  };

  const handleDeletePhoto = (id: string) => {
    const updated = photos.filter(p => p.id !== id);
    savePhotos(updated);
    audio.playChime(2);
  };

  const handleAddEmail = (e: FormEvent) => {
    e.preventDefault();
    const email = newEmailInput.trim().toLowerCase();
    
    if (!email || !email.includes('@')) {
      audio.playErrorSound();
      return;
    }

    if (permittedEmails.includes(email)) {
      audio.playErrorSound();
      return;
    }

    const updated = [...permittedEmails, email];
    savePermittedEmails(updated);
    setNewEmailInput('');
    audio.playChime(5);
  };

  const handleDeleteEmail = (email: string) => {
    if (email === 'anirvarti@gmail.com') {
      audio.playErrorSound(); // Admin email cannot be removed
      return;
    }
    const updated = permittedEmails.filter(e => e !== email);
    savePermittedEmails(updated);
    audio.playChime(1);
  };

  // Check if current user is permitted to view the gallery
  const hasAccess = permittedEmails.includes(currentUserEmail.trim().toLowerCase()) || currentUserEmail.trim().toLowerCase() === 'anirvarti@gmail.com';
  const isAdmin = currentUserEmail.trim().toLowerCase() === 'anirvarti@gmail.com';

  return (
    <div className="space-y-6 flex flex-col select-none animate-fadeIn" id="secure-gallery-view">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#222222] pb-4 gap-4">
        <div className="space-y-1">
          <span className="font-mono text-xs text-[#10B981] tracking-widest uppercase font-bold">
            // SECURE ARCHIVE // CRYPTOGRAPHIC VAULT
          </span>
          <h2 className="text-4xl font-black tracking-tighter text-white font-sans uppercase">
            RESTRICTED GALLERY
          </h2>
        </div>
        
        {/* Dynamic Authorization Badge */}
        <div className={`flex items-center gap-2 border px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider ${
          hasAccess 
            ? 'bg-emerald-950/20 border-emerald-500/30 text-[#10B981]' 
            : 'bg-rose-950/20 border-rose-500/30 text-rose-500'
        }`}>
          {hasAccess ? <Unlock className="w-4 h-4 animate-pulse" /> : <Lock className="w-4 h-4" />}
          <span>{hasAccess ? 'ACCESS GRANTED' : 'ACCESS DENIED'}</span>
        </div>
      </div>

      {/* Simulator Control Panel (To demo access policies in real-time) */}
      <div className="border border-[#222222] bg-[#0c0c0c] p-4 rounded-none flex flex-col md:flex-row gap-4 items-center justify-between shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-none bg-[#121212] border border-[#222222]">
            <Users className="w-5 h-5 text-[#10B981]" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[9px] text-gray-500 uppercase tracking-widest font-bold">visitor terminal</span>
            <span className="font-mono text-xs text-white uppercase font-black">Identity Simulation Console</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <span className="font-mono text-[10px] text-gray-400">Current Visitor:</span>
          <select
            value={currentUserEmail}
            onChange={(e) => {
              setCurrentUserEmail(e.target.value);
              audio.playChime(6);
            }}
            className="bg-[#121212] border border-[#222222] text-[#10B981] font-mono text-xs px-3 py-1.5 focus:outline-none focus:border-[#10B981] interactive-node cursor-pointer uppercase font-black rounded-none"
          >
            <option value="anirvarti@gmail.com">anirvarti@gmail.com (ADMIN)</option>
            <option value="examiner@university.edu">examiner@university.edu (AUTHORIZED)</option>
            <option value="intruder@blackhat.org">intruder@blackhat.org (RESTRICTED)</option>
          </select>

          <button
            onClick={() => {
              audio.playChime(3);
              setInfoModalOpen(true);
            }}
            className="p-1.5 border border-[#222222] text-gray-400 hover:text-white hover:border-gray-500 transition-colors cursor-pointer interactive-node"
            title="Help & Drive integration info"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Gallery Main Stream */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {!hasAccess ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="border border-rose-950/40 bg-gradient-to-b from-[#18080c] via-[#0d0406] to-[#0c0c0c] p-8 text-center space-y-4 shadow-[0_0_30px_rgba(244,63,94,0.05)] rounded-none"
              >
                <div className="w-14 h-14 rounded-full border border-rose-500/20 bg-rose-500/5 mx-auto flex items-center justify-center">
                  <ShieldAlert className="w-7 h-7 text-rose-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-mono text-base font-black text-white tracking-widest uppercase">RESTRICTED SECURITY ZONE</h3>
                  <p className="font-mono text-xs text-gray-400 leading-relaxed max-w-md mx-auto">
                    The gallery is encrypted. Email address <span className="text-rose-500 underline font-bold">{currentUserEmail}</span> has not been authorized. Contact the Administrator to whitelist your Google Identity credentials.
                  </p>
                </div>
                <div className="pt-2">
                  <div className="inline-block border border-rose-500/30 px-4 py-2 font-mono text-[10px] text-rose-400 uppercase tracking-widest font-black bg-rose-500/5 select-none">
                    IP LOGGED // SHA256 BLOCK ACTIVE
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Admin controls to post photos */}
                {isAdmin && (
                  <div className="border border-[#222222] bg-[#121212]/30 p-5 rounded-none space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4 text-[#10B981]" />
                        <span className="font-mono text-xs font-black text-white tracking-wider uppercase">POST IMAGE LOGS</span>
                      </div>
                      <button
                        onClick={() => {
                          audio.playChime(4);
                          setShowAddForm(!showAddForm);
                        }}
                        className="font-mono text-[10px] text-[#10B981] border border-[#10B981]/20 px-3 py-1 bg-[#10B981]/5 hover:bg-[#10B981] hover:text-black transition-colors rounded-none font-bold uppercase tracking-widest cursor-pointer interactive-node"
                      >
                        {showAddForm ? 'COLLAPSE FORM' : 'ADD NEW LOG'}
                      </button>
                    </div>

                    <AnimatePresence>
                      {showAddForm && (
                        <motion.form
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          onSubmit={handleAddPhoto}
                          className="space-y-3.5 overflow-hidden"
                        >
                          <div className="space-y-1">
                            <label className="font-mono text-[9px] text-gray-500 tracking-wider uppercase font-bold block">
                              Image URL / Google Drive Shareable Link:
                            </label>
                            <input
                              type="text"
                              value={newPhotoUrl}
                              onChange={(e) => setNewPhotoUrl(e.target.value)}
                              placeholder="Paste Google Drive Link or direct Image URL..."
                              className="w-full bg-[#080808] border border-[#222222] font-mono text-xs px-3 py-2 text-white focus:outline-none focus:border-[#10B981] placeholder-gray-700 rounded-none"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-mono text-[9px] text-gray-500 tracking-wider uppercase font-bold block">
                              Diagnostic Caption / Description:
                            </label>
                            <input
                              type="text"
                              value={newPhotoCaption}
                              onChange={(e) => setNewPhotoCaption(e.target.value)}
                              placeholder="Specify physical deployment description..."
                              className="w-full bg-[#080808] border border-[#222222] font-mono text-xs px-3 py-2 text-white focus:outline-none focus:border-[#10B981] placeholder-gray-700 rounded-none"
                              required
                            />
                          </div>

                          <div className="pt-1 flex items-center justify-between">
                            <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest font-semibold block">
                              * Auto-resolves Google Drive links to direct embedded content format
                            </span>
                            <button
                              type="submit"
                              className="bg-[#10B981] text-black font-mono text-xs font-black tracking-widest uppercase px-4 py-2 hover:bg-[#059669] hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all cursor-pointer rounded-none flex items-center gap-2 interactive-node"
                            >
                              <Plus className="w-4 h-4" /> PUBLISH IMAGE
                            </button>
                          </div>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Photo Stream Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AnimatePresence mode="popLayout">
                    {photos.map((photo) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 20 }}
                        key={photo.id}
                        className="group border border-[#222222] bg-[#0c0c0c] hover:border-white/20 transition-all rounded-none overflow-hidden relative shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] flex flex-col justify-between select-none"
                        onMouseEnter={() => setHoveredPhoto(photo.id)}
                        onMouseLeave={() => setHoveredPhoto(null)}
                      >
                        {/* Image canvas with a vintage cyber CRT pattern line */}
                        <div className="aspect-video relative overflow-hidden bg-[#040404] border-b border-[#222222]">
                          <img
                            src={photo.url}
                            alt={photo.caption}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                          />
                          
                          {/* CRT Scanline Filter Effect */}
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-black/[0.04] pointer-events-none" />

                          {/* Top metadata tag */}
                          <div className="absolute top-2 left-2 flex items-center gap-1.5">
                            <span className="font-mono text-[8px] bg-black/85 border border-white/10 text-gray-400 px-1.5 py-0.5 rounded-none font-semibold">
                              {photo.driveId ? 'GD-SOURCE' : 'WEB-SOURCE'}
                            </span>
                            <span className="font-mono text-[8px] bg-[#10B981]/15 border border-[#10B981]/20 text-[#10B981] px-1.5 py-0.5 rounded-none font-bold">
                              SECURE
                            </span>
                          </div>

                          {/* Admin Action: delete overlay */}
                          {isAdmin && hoveredPhoto === photo.id && (
                            <button
                              onClick={() => handleDeletePhoto(photo.id)}
                              className="absolute top-2 right-2 p-1.5 bg-rose-950/90 border border-rose-500/40 text-rose-500 hover:bg-rose-500 hover:text-black hover:scale-105 transition-all cursor-pointer rounded-none shadow-md interactive-node"
                              title="Purge Image Logs"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Caption & Info Panel */}
                        <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                          <p className="font-mono text-[11px] text-gray-300 leading-relaxed uppercase tracking-wider">
                            {photo.caption}
                          </p>
                          <div className="flex items-center justify-between pt-2 border-t border-white/5">
                            <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest font-semibold">
                              CATALOG_TIMESTAMP:
                            </span>
                            <span className="font-mono text-[8px] text-gray-400 font-bold">
                              {new Date(photo.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Permission Controllers / Authorized Whitelist */}
        <div className="lg:col-span-4 space-y-6">
          <div className="border border-[#222222] bg-[#121212]/30 p-5 rounded-none space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Users className="w-4 h-4 text-[#10B981]" />
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-gray-500 uppercase tracking-wider font-bold">// ACCESS CONTROL LIST</span>
                <span className="font-mono text-xs text-white uppercase font-black">Authorized Gmails</span>
              </div>
            </div>

            <p className="font-mono text-[11px] text-gray-400 leading-relaxed uppercase tracking-wider">
              Only identity credentials listed in the cryptographic hash table below are authorized to decrypt the visual database stream.
            </p>

            {/* Email Authorize Form */}
            {isAdmin ? (
              <form onSubmit={handleAddEmail} className="flex gap-2">
                <input
                  type="email"
                  value={newEmailInput}
                  onChange={(e) => setNewEmailInput(e.target.value)}
                  placeholder="Enter visitor Gmail..."
                  className="flex-1 bg-[#080808] border border-[#222222] font-mono text-xs px-2.5 py-1.5 text-white focus:outline-none focus:border-[#10B981] placeholder-gray-700 rounded-none uppercase font-bold"
                  required
                />
                <button
                  type="submit"
                  className="bg-[#10B981] text-black p-1.5 hover:bg-[#059669] transition-colors rounded-none cursor-pointer flex items-center justify-center interactive-node"
                  title="Authorize credentials"
                >
                  <Plus className="w-4.5 h-4.5" />
                </button>
              </form>
            ) : (
              <div className="border border-yellow-950/30 bg-yellow-950/5 p-3 rounded-none">
                <span className="font-mono text-[9px] text-yellow-500 font-bold uppercase tracking-wider block">
                  // READ-ONLY ENVIRONMENT
                </span>
                <span className="font-mono text-[9px] text-gray-500 uppercase leading-relaxed block mt-1">
                  Whitelist modifications are restricted to Admin level access credentials only.
                </span>
              </div>
            )}

            {/* Email Whitelist Stream */}
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 terminal-scroll">
              <AnimatePresence initial={false}>
                {permittedEmails.map((email) => {
                  const isCurrent = currentUserEmail.toLowerCase() === email.toLowerCase();
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      key={email}
                      className={`flex items-center justify-between p-2.5 border font-mono text-[10px] uppercase font-bold rounded-none ${
                        isCurrent 
                          ? 'bg-[#10B981]/5 border-[#10B981]/40 text-[#10B981]' 
                          : 'bg-[#080808] border-[#222222] text-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <UserCheck className={`w-3.5 h-3.5 ${isCurrent ? 'text-[#10B981]' : 'text-gray-600'}`} />
                        <span className="truncate max-w-[150px]">{email}</span>
                      </div>

                      {isAdmin && email !== 'anirvarti@gmail.com' && (
                        <button
                          onClick={() => handleDeleteEmail(email)}
                          className="text-gray-600 hover:text-rose-500 transition-colors p-0.5 cursor-pointer interactive-node"
                          title="Purge Authority Hash"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>

      {/* Info / Google Drive Integration Help Modal overlay */}
      <AnimatePresence>
        {infoModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="border border-[#222222] bg-[#0c0c0c] max-w-lg w-full p-6 space-y-4 rounded-none shadow-[0_15px_50px_rgba(0,0,0,0.85)] relative"
            >
              <div className="flex items-center gap-2.5 border-b border-[#222222] pb-3">
                <FileCheck2 className="w-5 h-5 text-[#10B981]" />
                <h3 className="font-mono text-sm font-black text-white tracking-widest uppercase">GOOGLE DRIVE IMAGE LINKING PROTOCOL</h3>
              </div>

              <div className="space-y-3 font-mono text-[11px] text-gray-400 leading-relaxed uppercase">
                <p>
                  To link pictures directly from your personal <span className="text-white font-bold">Google Drive</span> storage:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-400">
                  <li>
                    Right-click your photo inside Google Drive and select <span className="text-white">Share</span>.
                  </li>
                  <li>
                    Change access permission to <span className="text-[#10B981] font-bold">Anyone with the link</span> (Viewer mode).
                  </li>
                  <li>
                    Copy the sharing link (e.g. <code className="text-gray-300 bg-[#121212] px-1 py-0.5">https://drive.google.com/file/d/IMAGE_ID/view...</code>).
                  </li>
                  <li>
                    Paste the copied URL directly into the upload form.
                  </li>
                </ol>
                <div className="p-3 bg-[#121212] border border-[#222222] text-[#10B981]/90 rounded-none text-[10px] space-y-1">
                  <span className="font-extrabold text-white block tracking-widest">// AUTO-DECODER ACTIVE:</span>
                  The system automatically extracts the raw Google file ID and transforms the link into high-performance embedded proxy vectors instantly.
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-[#222222]">
                <button
                  onClick={() => {
                    audio.playChime(1);
                    setInfoModalOpen(false);
                  }}
                  className="bg-transparent border border-gray-600 text-gray-400 hover:text-white hover:border-white px-4 py-1.5 font-mono text-xs rounded-none uppercase font-black cursor-pointer interactive-node"
                >
                  DISMISS
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
