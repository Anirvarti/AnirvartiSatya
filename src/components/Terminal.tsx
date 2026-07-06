import React, { useState, useRef, useEffect } from 'react';
import { TerminalLine } from '../types';
import { audio } from '../lib/audio';

interface TerminalProps {
  onUnlock: () => void;
  onLock?: () => void;
  isUnlocked: boolean;
}

const FILES: Record<string, string> = {
  'README.txt': `================================================================================
ACCESS PROTOCOL DEVIATION DETECTED
================================================================================

Authorized credentials for "PROJECTS" and "CONTACT" sectors are currently restricted.

TO DECRYPT SECTORS:
1. Scan standard system diagnostic structures for credentials.
2. Search 'system_logs.cfg' using 'grep' or 'cat' commands.
3. Once the clearance code is identified, initialize unlock:
   
   unlock <security_key_string>

================================================================================`,

  'system_logs.cfg': `[2026-06-24 13:00:10] SYSTEM STATUS: BOOTING INSTANCE [CORE_NODE_V4_PROD]
[2026-06-24 13:00:11] MOUNTING PERSISTENT DISKS... OK
[2026-06-24 13:00:11] INITIALIZING VIRTUAL FILE FRAMEWORKS... OK
[2026-06-24 13:00:12] WARNING: DIRECTORY '/var/cache/shaders' RESIDUE CLEARED
[2026-06-24 13:00:14] PORT HOVER OVERRIDE ON PORT 3000 CONNECTED
[2026-06-24 13:00:14] CONFIGURING KERNEL PARALLEL PIPELINES...
[2026-06-24 13:00:15] LOAD AVERAGE: [0.08, 0.12, 0.05]
[2026-06-24 13:00:18] SECURE KERNEL ENCRYPTING REPOSITORY SYSTOLS...
[2026-06-24 13:00:19] [SECURE] MEMORY CACHE FLUSHED SUCCESSFULLY
[2026-06-24 13:00:20] [SECURE] INTEGRATION CREDENTIAL GENERATED
[2026-06-24 13:00:20] [SECURE] ACCESS_KEY=ANIRVARTI_D3CRYPT_99
[2026-06-24 13:00:21] INTERNAL COMPILER ENVELOPE ENFORCED
[2026-06-24 13:00:22] PRE-RENDERING CONSTELLATION MESHES... OK (70 NODES)
[2026-06-24 13:00:24] SYNTHESIZING BACKGROUND AMBIENT DRONE: 49.0Hz Triangle
[2026-06-24 13:00:25] SCHEDULER ACTIVE: ATMOSPHERIC CHIME EMISSION RATIO LFO [0.04Hz]
[2026-06-24 13:00:28] NOTICE: ALL SYSTEMS REGISTERED TO CLOUD RUN INGRESS PORTAL`,

  'access_vault.key': `01000001 01001110 01001001 01010010 01010110 01000001
01010010 01010100 01001001 01011111 01000100 00110011
01000011 01010010 01011001 01010000 01010100 01011111 00111001 00111001 00001010
------------------------------------------------------
[ENCRYPTED HEX PAYLOAD] CAFE D00D DEADBEEF FFFE 10B9 81FF
DECRYPTION INTERRUPTED: EXECUTABLE BLOCKED BY FIREWALL POLICY.
RUN 'unlock [ACCESS_KEY]' BINARY AS ADMIN TO SECURE PAYLOAD.`,

  'de_queue_metrics.txt': `================================================================================
DE-QUEUE // SYSTEM SIMULATION AND PHYSICAL HARDWARE LOGS
================================================================================
Hardware Core: ESP32-WROOM-32 & Raspberry Pi Zero 2W
Target Facility: NIST Canteen Ingress/Egress Scanning
Active Duration: 63.8 Minutes
Completed Cycles: 294 scan cycles

ALGORITHM: MRPC (MAC-Rotation-aware Proximity Clustering)
MAC address overcounting flaw: Corrected from 8.42x to 0.04x error rate.
Theoretical Privacy validation: Fano's inequality reconstruction bound < 18.2%.
Compliance check: DPDP Act 2023 certified.

SCENARIO OUTCOME (SIMULATION ANALYSIS):
- Airport Terminal: 78.2% crowd variance reduction
- Shopping Mall Ingress: 74.7% crowd variance reduction
- Hospital Ward Corridors: 79.5% crowd variance reduction
================================================================================`,

  'kirana_ml_billing.txt': `================================================================================
PROJECT: KIRANA ML-POWERED BILLING SYSTEM (IISER BERHAMPUR)
================================================================================
Stack: React.js frontend, Spring Boot backend, MySQL, AWS Cloud, Razorpay
Visual Capture API: Camera-based frame extraction with object detection.

SYSTEM ARCHITECTURE DETAILS:
1. ML Object Detection: Camera feeds parse inventory item structures in real-time.
2. Spring Boot Core: Thread-safe billing queue syncing transaction hashes securely.
3. Razorpay Webhooks: Confirms payment states with instantaneous visual notifications.
================================================================================`
};

export default function Terminal({ onUnlock, onLock, isUnlocked }: TerminalProps) {
  const [history, setHistory] = useState<TerminalLine[]>([
    { text: '=======================================================', type: 'system' },
    { text: '   ANIRVARTI INTELLECT_SHELL v2.84_CINEMATIC', type: 'system' },
    { text: '   AUTHORIZED SECURITY GATEWAY: CLASSIFIED DATA REPOS', type: 'system' },
    { text: '=======================================================', type: 'system' },
    { text: 'Type "help" to list available mainframe executables.', type: 'output' },
    { text: 'Sector "PROJECTS" and "CONTACT" are currently [RESTRICTED].', type: 'error' },
    { text: 'Ready for client security credentials...', type: 'output' },
  ]);

  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyPointer, setHistoryPointer] = useState<number>(-1);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Scroll to bottom whenever history changes
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history]);

  const handleTerminalClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const executeCommand = async (fullCmd: string) => {
    const trimmed = fullCmd.trim();
    if (!trimmed) return;

    // Add to history
    setHistory(prev => [...prev, { text: `guest@anirvarti.sh:~$ ${fullCmd}`, type: 'input' }]);
    
    // Add to command arrow history
    const newCmdHistory = [trimmed, ...commandHistory.filter(c => c !== trimmed)].slice(0, 50);
    setCommandHistory(newCmdHistory);
    setHistoryPointer(-1); // Reset pointer

    const parts = trimmed.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    audio.playInputSound();

    switch (command) {
      case 'help':
        setHistory(prev => [
          ...prev,
          { text: 'Available mainframe executables:', type: 'system' },
          { text: '  help                        Display this security gateway support manifest.', type: 'output' },
          { text: '  ls                          List directory index mappings.', type: 'output' },
          { text: '  cat [filename]              Inspect character contents of specified mapping.', type: 'output' },
          { text: '  grep [pattern] [filename]   Search file mappings for regular pattern matches.', type: 'output' },
          { text: '  clear                       Flush mainframe display memories.', type: 'output' },
          { text: '  unlock [security_key]       Trigger decryption logic to authorize credentials.', type: 'output' },
          { text: '  lock                        Revoke active authentication status & lock gateway.', type: 'output' },
        ]);
        break;

      case 'ls':
        setHistory(prev => [
          ...prev,
          { text: '-r--r--r--   1 root   staff      760 Jun 24 13:00 README.txt', type: 'output' },
          { text: '-r--r--r--   1 root   staff     1205 Jun 24 13:00 system_logs.cfg', type: 'output' },
          { text: '-r--r--r--   1 root   staff      394 Jun 24 13:00 access_vault.key', type: 'output' },
          { text: '-r--r--r--   1 root   staff      920 Jun 24 13:00 de_queue_metrics.txt', type: 'output' },
          { text: '-r--r--r--   1 root   staff      810 Jun 24 13:00 kirana_ml_billing.txt', type: 'output' },
        ]);
        break;

      case 'cat':
        if (args.length === 0) {
          setHistory(prev => [...prev, { text: 'Usage: cat [filename]', type: 'error' }]);
        } else {
          const fileName = args[0];
          if (FILES[fileName]) {
            setHistory(prev => [
              ...prev,
              ...FILES[fileName].split('\n').map(line => ({ text: line, type: 'output' as const }))
            ]);
          } else {
            setHistory(prev => [...prev, { text: `cat: ${fileName}: No such file or directory.`, type: 'error' }]);
          }
        }
        break;

      case 'grep':
        if (args.length < 2) {
          setHistory(prev => [...prev, { text: 'Usage: grep [pattern] [filename]', type: 'error' }]);
        } else {
          const pattern = args[0].toLowerCase();
          const fileName = args[1];
          if (FILES[fileName]) {
            const lines = FILES[fileName].split('\n');
            const matches = lines.filter(line => line.toLowerCase().includes(pattern));
            if (matches.length > 0) {
              setHistory(prev => [
                ...prev,
                ...matches.map(line => ({ text: line, type: 'success' as const }))
              ]);
            } else {
              setHistory(prev => [...prev, { text: 'grep: No matches found.', type: 'output' }]);
            }
          } else {
            setHistory(prev => [...prev, { text: `grep: ${fileName}: No such file or directory.`, type: 'error' }]);
          }
        }
        break;

      case 'clear':
        setHistory([]);
        break;

      case 'unlock':
        if (args.length === 0) {
          setHistory(prev => [...prev, { text: 'Usage: unlock [security_key]', type: 'error' }]);
        } else {
          const key = args[0];
          if (key === 'ANIRVARTI_D3CRYPT_99') {
            if (isUnlocked) {
              setHistory(prev => [...prev, { text: 'System already fully decrypted. ACCESS_GRANTED.', type: 'success' }]);
              break;
            }
            // Trigger beautiful animated decryption
            setIsDecrypting(true);
            setHistory(prev => [
              ...prev,
              { text: '[INITIALIZING SECTOR DECRYPTION SEQUENCE...]', type: 'system' }
            ]);

            // Phase 1
            setTimeout(() => {
              setHistory(prev => [...prev, { text: '  - Reading system partition block indices... OK', type: 'output' }]);
              audio.playInputSound();
            }, 400);

            // Phase 2
            setTimeout(() => {
              setHistory(prev => [...prev, { text: '  - Compiling cryptography hashes & salt vectors... OK', type: 'output' }]);
              audio.playInputSound();
            }, 900);

            // Phase 3
            setTimeout(() => {
              setHistory(prev => [...prev, { text: '  - Bypassing remote firewall routing tables... DETECTING ENTRANCES', type: 'system' }]);
              audio.playInputSound();
            }, 1400);

            // Phase 4
            setTimeout(() => {
              setHistory(prev => [
                ...prev, 
                { text: '  - Injecting payload parameters... STAGE 3 CONFIRMED', type: 'system' },
                { text: '  - [MATCH SUCCESS] ACCESS_KEY matches server salt root hash.', type: 'success' }
              ]);
              audio.playSuccessSound();
            }, 1950);

            // Final Phase: Complete
            setTimeout(() => {
              setIsDecrypting(false);
              setHistory(prev => [
                ...prev,
                { text: '========================================================', type: 'success' },
                { text: '   DECRYPTION COMPLETE. SENSITIVE REPOSITORIES REVEALED.', type: 'success' },
                { text: '   PORTFOLIO ROUTING CHANNELS RE-CONNECTED IN REALTIME.', type: 'success' },
                { text: '========================================================', type: 'success' },
              ]);
              onUnlock();
            }, 2600);

          } else {
            audio.playErrorSound();
            setHistory(prev => [
              ...prev,
              { text: 'ACCESS DENIED: Cryptographic security validation signature failed.', type: 'error' },
              { text: 'Check \'system_logs.cfg\' file mappings for correct authorization key.', type: 'output' }
            ]);
          }
        }
        break;

      case 'lock':
        if (!isUnlocked) {
          audio.playErrorSound();
          setHistory(prev => [...prev, { text: 'ACCESS ERROR: Mainframe is already fully locked.', type: 'error' }]);
        } else {
          audio.playSuccessSound();
          setHistory(prev => [
            ...prev,
            { text: '[LOCK SEQUENCE INITIATED...]', type: 'system' },
            { text: '  - Revoking active authentication credentials... OK', type: 'output' },
            { text: '  - Cleaning local access state variables... OK', type: 'output' },
            { text: '  - Re-applying firewall gateway security blocks... SYSTEM LOCKED', type: 'error' }
          ]);
          onLock?.();
        }
        break;

      default:
        setHistory(prev => [
          ...prev,
          { text: `sh: command not found: ${command}. Type "help" for mainframe indices.`, type: 'error' }
        ]);
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Auto click trigger simple feedback noise on any keypress
    audio.playInputSound();

    if (e.key === 'Enter') {
      executeCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      
      const nextPointer = historyPointer + 1;
      if (nextPointer < commandHistory.length) {
        setHistoryPointer(nextPointer);
        setInput(commandHistory[nextPointer]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextPointer = historyPointer - 1;
      if (nextPointer >= 0) {
        setHistoryPointer(nextPointer);
        setInput(commandHistory[nextPointer]);
      } else {
        setHistoryPointer(-1);
        setInput('');
      }
    }
  };

  return (
    <div
      onClick={handleTerminalClick}
      className="w-full h-[480px] bg-[#0c0c0c]/90 border border-emerald-950/40 rounded-xl flex flex-col overflow-hidden font-mono text-sm emerald-glow cursor-text backdrop-blur-md relative"
      id="terminal-emulator-container"
    >
      {/* Terminal Title Bar */}
      <div className="bg-[#121212] border-b border-white/5 px-4 py-2 flex items-center justify-between select-none shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ef4444]/60" />
          <div className="w-3 h-3 rounded-full bg-[#f59e0b]/60" />
          <div className="w-3 h-3 rounded-full bg-[#10b981]/60 animate-pulse" />
          <span className="text-gray-500 text-xs ml-2 tracking-widest font-sans">SECURITY_GATEWAY@ANIRVARTI</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-500/50">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
          <span>PORT 3000 // ESTABLISHED</span>
        </div>
      </div>

      {/* Terminal History Output */}
      <div
        ref={containerRef}
        className="flex-1 p-5 overflow-y-auto space-y-2 terminal-scroll"
        id="terminal-history"
      >
        {history.map((line, idx) => {
          let colorClass = 'text-gray-300';
          if (line.type === 'input') colorClass = 'text-white font-medium';
          else if (line.type === 'error') colorClass = 'text-rose-500/90 font-semibold';
          else if (line.type === 'success') colorClass = 'text-[#10B981] font-semibold emerald-glow-text';
          else if (line.type === 'system') colorClass = 'text-emerald-600/70';

          return (
            <div key={idx} className={`${colorClass} leading-relaxed whitespace-pre-wrap`}>
              {line.text}
            </div>
          );
        })}

        {isDecrypting && (
          <div className="flex items-center gap-2 text-emerald-500 mt-2">
            <span className="w-2.5 h-2.5 bg-[#10b981] rounded-full animate-ping" />
            <span className="animate-pulse">DECRYPTING SYSTEM DIRECTORIES... SYSTEM IN STEADY STATE</span>
          </div>
        )}
      </div>

      <div className="bg-[#090909]/80 border-t border-white/5 p-4 flex items-center gap-2 shrink-0">
        <span className="text-[#10B981] font-bold select-none">guest@anirvarti.sh:~$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          disabled={isDecrypting}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isDecrypting ? "Securing channel..." : "Type 'help' to begin, or bypass decryption..."}
          className="flex-1 bg-transparent border-none outline-none text-white font-mono placeholder-emerald-900/40 selection:bg-emerald-500/20"
          id="terminal-stdin-field"
          autoFocus
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
        />
      </div>
    </div>
  );
}
