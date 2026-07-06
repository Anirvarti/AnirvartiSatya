import React, { useState, useEffect, useRef } from 'react';
import { audio } from '../lib/audio';
import { 
  Cpu, 
  Key, 
  Check, 
  Gamepad2, 
  Info, 
  RefreshCw, 
  Sparkles,
  Clock,
  ArrowRight,
  Play,
  Square,
  Wand2,
  ListRestart
} from 'lucide-react';

interface DecryptionPuzzleProps {
  onUnlock: () => void;
  isUnlocked: boolean;
}

type PuzzleTab = 'puzzle' | 'guide';

// Transformer Algorithm types & constants
interface TransformerStep {
  name: string;
  title: string;
  description: string;
  badge: string;
}

const TRANSFORMER_STEPS: TransformerStep[] = [
  {
    name: "Embeddings",
    title: "1. Input → Embeddings",
    badge: "EMBED",
    description: "Convert input words (tokens) into dense mathematical vectors in a high-dimensional semantic space where similar words lie closer together."
  },
  {
    name: "Positional Encoding",
    title: "2. Positional Encoding",
    badge: "POSITION",
    description: "Since the Transformer processes all tokens in parallel, it lacks order awareness. We add sinusoidal wave patterns to inject position coordinates directly."
  },
  {
    name: "Self-Attention",
    title: "3. Self-Attention Core",
    badge: "ATTENTION",
    description: "The crown jewel. For each word, we project Queries (Q), Keys (K), and Values (V). Query-Key dot products produce dynamic attention maps."
  },
  {
    name: "Multi-Head Attention",
    title: "4. Multi-Head Attention",
    badge: "MULTI-HEAD",
    description: "Execute 8 or 16 attention steps in parallel. Different attention 'heads' specialize in grammatical links, coreference, or tense."
  },
  {
    name: "Feed-Forward Layer",
    title: "5. Feed-Forward Neural Net",
    badge: "FFN",
    description: "Pass each token representation independently through fully connected neural layers to perform deeper factual recall and feature transformations."
  },
  {
    name: "Layer Norm & Residual",
    title: "6. Residuals & Norm",
    badge: "RES+NORM",
    description: "Add back original token states (residual skip connection) and normalize values. This guarantees smooth gradient flow and prevents signal collapse."
  },
  {
    name: "Stacking Layers",
    title: "7. Stacking Layers",
    badge: "STACK",
    description: "Repeat the self-attention and FFN block N times (e.g. 96 layers). Lower layers map syntax; deep layers understand logical abstractions."
  },
  {
    name: "Output Projection",
    title: "8. Softmax Projection",
    badge: "OUTPUT",
    description: "Project final vectors back onto the vocabulary matrix. Apply a softmax function to generate relative next-token probability scores."
  }
];

const SENTENCE_PRESETS = [
  { text: "The animal didn't cross the street because it was too tired", label: "Coreference Pronoun" },
  { text: "Large language models project semantic coordinates in parallel", label: "Semantic Space NLP" },
  { text: "Quantum computing accelerates deep matrix tensor products", label: "High-Speed Hardware" },
  { text: "The database query executed quickly because it was cached", label: "Systems Caching" }
];

// Helper to get deterministic pseudo-random number based on a seed string
const seedRandom = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(Math.sin(hash)) % 1;
};

// Generates dynamic pseudo-attention weights for any list of words and active selected index
export function getDynamicAttentionWeights(selectedIdx: number, words: string[], headIdx: number = 0): number[] {
  if (words.length === 0) return [];
  
  const rawScores = words.map((word, idx) => {
    // 1. Self-attention base (always attend to itself a bit)
    if (idx === selectedIdx) {
      return headIdx === 0 ? 3.0 : 2.0;
    }
    
    const selWord = words[selectedIdx].toLowerCase();
    const targetWord = word.toLowerCase();
    
    // 2. Head-specific specialization rules
    if (headIdx === 0) {
      // Head 1: Coreference / Pronoun tracking (e.g. "it", "she", "he", "they", "this" -> nouns earlier in sequence)
      const pronouns = ["it", "she", "he", "they", "its", "them", "this", "him", "her"];
      if (pronouns.includes(selWord)) {
        const isPotentialNoun = targetWord.length >= 4 && !pronouns.includes(targetWord) && !["with", "from", "that", "this", "then", "because", "were", "been"].includes(targetWord);
        // Prioritize nouns before the pronoun
        if (isPotentialNoun && idx < selectedIdx) {
          return 5.0 - (selectedIdx - idx) * 0.25; // higher weight to closer nouns
        }
      }
    } else if (headIdx === 1) {
      // Head 2: Subject-Verb tracking
      if (Math.abs(idx - selectedIdx) === 1) return 4.0;
      if (targetWord.endsWith("ed") || targetWord.endsWith("ing") || targetWord.endsWith("es") || targetWord.endsWith("s")) return 3.5;
    } else if (headIdx === 2) {
      // Head 3: Semantic Context / Modifiers
      const sim = seedRandom(selWord + targetWord);
      if (sim > 0.65) return 3.2;
    } else if (headIdx === 3) {
      // Head 4: Attribute/Adjective link (e.g. "tired" -> "animal")
      if (idx === 1 || idx === 2) {
        if (selectedIdx >= words.length - 2) return 4.5;
      }
    }
    
    // Default base weight based on semantic hash similarity
    const baseHash = seedRandom(selWord + targetWord);
    return 0.5 + baseHash * 1.5;
  });
  
  // Apply Softmax normalization: exp(x) / sum(exp(x))
  const exps = rawScores.map(s => Math.exp(s));
  const sumExps = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / (sumExps || 1));
}

// Map a word to deterministic X and Y between 15% and 85% for high-fidelity interactive visualization
export function get2DProjection(word: string, index: number) {
  const cleanWord = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!cleanWord) {
    return { x: 15 + (index * 7) % 70, y: 15 + (index * 11) % 70 };
  }
  
  let hash1 = 0;
  let hash2 = 0;
  for (let i = 0; i < cleanWord.length; i++) {
    hash1 = cleanWord.charCodeAt(i) + ((hash1 << 5) - hash1);
    hash2 = cleanWord.charCodeAt(cleanWord.length - 1 - i) + ((hash2 << 7) - hash2);
  }
  
  const x = 15 + Math.abs(Math.sin(hash1)) * 70;
  const y = 15 + Math.abs(Math.cos(hash2)) * 70;
  return { x, y };
}

export default function DecryptionPuzzle({ onUnlock, isUnlocked }: DecryptionPuzzleProps) {
  const [activeSubTab, setActiveSubTab] = useState<PuzzleTab>('puzzle');
  
  // Custom Interactive Sentence playground state
  const [sentenceInput, setSentenceInput] = useState<string>("The animal didn't cross the street because it was too tired");
  const [currentSentence, setCurrentSentence] = useState<string>("The animal didn't cross the street because it was too tired");
  
  const currentWords = currentSentence.trim().split(/\s+/).filter(w => w.trim().length > 0).slice(0, 12);

  // Transformer Visualizer States
  const [isTuned, setIsTuned] = useState<boolean>(false);
  const [transformerStep, setTransformerStep] = useState<number>(0);
  const [selectedWordIndex, setSelectedWordIndex] = useState<number>(7); // Default to 'it'
  const [transformerIsRunning, setTransformerIsRunning] = useState<boolean>(false);
  const [activeHeadIndex, setActiveHeadIndex] = useState<number>(0);
  const [transformerLog, setTransformerLog] = useState<string>("Ready to begin Transformer flow simulation.");
  const transformerStopRef = useRef<boolean>(false);

  const applySentence = (newSentence: string) => {
    const trimmed = newSentence.trim();
    if (!trimmed) return;
    setCurrentSentence(trimmed);
    setSentenceInput(trimmed);
    const wordsList = trimmed.split(/\s+/).filter(w => w.trim().length > 0).slice(0, 12);
    // Find pronoun index or default to index 0 or middle
    const pronouns = ["it", "she", "he", "they", "its", "them", "this", "him", "her"];
    const foundPronounIdx = wordsList.findIndex(w => pronouns.includes(w.toLowerCase()));
    if (foundPronounIdx !== -1) {
      setSelectedWordIndex(foundPronounIdx);
    } else {
      setSelectedWordIndex(Math.min(wordsList.length - 1, Math.floor(wordsList.length / 2)));
    }
    audio.playChime(2);
    setTransformerLog(`Injected new sentence. Sequence token length: ${wordsList.length}. Click steps or run simulation!`);
  };

  const initTransformer = () => {
    setTransformerStep(0);
    setCurrentSentence("The animal didn't cross the street because it was too tired");
    setSentenceInput("The animal didn't cross the street because it was too tired");
    setSelectedWordIndex(7);
    setTransformerIsRunning(false);
    setActiveHeadIndex(0);
    setTransformerLog("Transformer visualization initialized. Select steps or run auto flow.");
    setIsTuned(false);
  };

  const runTransformerSimulation = async () => {
    if (transformerIsRunning) return;
    setTransformerIsRunning(true);
    transformerStopRef.current = false;
    setIsTuned(false);

    let currentStep = 0;
    while (currentStep < TRANSFORMER_STEPS.length) {
      if (transformerStopRef.current) {
        setTransformerIsRunning(false);
        return;
      }

      setTransformerStep(currentStep);
      const stepInfo = TRANSFORMER_STEPS[currentStep];
      audio.playChime((currentStep % 4) + 1);
      setTransformerLog(`Simulating step: ${stepInfo.name.toUpperCase()} ...`);

      // Sleep to let user witness high-speed parallel computation visualization
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (transformerStopRef.current) {
        setTransformerIsRunning(false);
        return;
      }

      audio.playHarp(currentStep * 2);
      currentStep++;
    }

    if (!transformerStopRef.current) {
      setTransformerStep(TRANSFORMER_STEPS.length - 1);
      setTransformerIsRunning(false);
      setIsTuned(true);
      audio.playSuccessSound();
      setTransformerLog("Transformer flow completed! Attention maps fully optimized.");
    }
  };

  useEffect(() => {
    initTransformer();
  }, []);

  // Game states for Puzzle 2 (Timing Lockpick Game)
  const [scanPos, setScanPos] = useState<number>(0);
  const [scanDirection, setScanDirection] = useState<'right' | 'left'>('right');
  const [lockpickLevel, setLockpickLevel] = useState<number>(1); // Level 1, 2, 3
  const [lockpickProgress, setLockpickProgress] = useState<boolean[]>([false, false, false]);
  const [lockpickSolved, setLockpickSolved] = useState<boolean>(false);

  // Total bypass unlocked state
  const [keyRevealed, setKeyRevealed] = useState<boolean>(false);
  const DECRYPT_KEY = "ANIRVARTI_D3CRYPT_99";

  // Scanner speed increases with lockpickLevel
  useEffect(() => {
    if (lockpickSolved || isUnlocked || activeSubTab !== 'puzzle') return;

    let id: number;
    const update = () => {
      setScanPos((prev) => {
        const speed = 1.0 + lockpickLevel * 0.45;
        let next = prev;
        if (scanDirection === 'right') {
          next = prev + speed;
          if (next >= 100) {
            next = 100;
            setScanDirection('left');
          }
        } else {
          next = prev - speed;
          if (next <= 0) {
            next = 0;
            setScanDirection('right');
          }
        }
        return next;
      });
      id = requestAnimationFrame(update);
    };
    id = requestAnimationFrame(update);
    return () => cancelAnimationFrame(id);
  }, [scanDirection, lockpickLevel, lockpickSolved, isUnlocked, activeSubTab]);

  // Target boundaries based on active lockpick level
  const getTargetBounds = () => {
    if (lockpickLevel === 1) return { min: 40, max: 60 };
    if (lockpickLevel === 2) return { min: 25, max: 40 };
    return { min: 70, max: 83 }; // Level 3
  };

  // Click handler for lockpick timing attempt
  const handleLockpickAttempt = () => {
    if (lockpickSolved || isUnlocked) return;

    const { min, max } = getTargetBounds();

    if (scanPos >= min && scanPos <= max) {
      // Successful hit!
      audio.playChime(lockpickLevel + 1);
      const nextProgress = [...lockpickProgress];
      nextProgress[lockpickLevel - 1] = true;
      setLockpickProgress(nextProgress);

      if (lockpickLevel < 3) {
        setLockpickLevel((prev) => prev + 1);
      } else {
        audio.playSuccessSound();
        setLockpickSolved(true);
        setKeyRevealed(true);
      }
    } else {
      // Missed timing
      audio.playErrorSound();
    }
  };

  const handleAutofillAndBypass = () => {
    audio.playSuccessSound();
    onUnlock();
  };

  const resetGame = () => {
    audio.playChime(1);
    initTransformer();
    setLockpickLevel(1);
    setLockpickProgress([false, false, false]);
    setLockpickSolved(false);
    setKeyRevealed(false);
    setScanPos(0);
    setScanDirection('right');
  };

  const { min: activeMin, max: activeMax } = getTargetBounds();

  return (
    <div className="w-full border border-[#222222] bg-[#0c0c0c] text-white p-5 md:p-6 select-none relative overflow-hidden flex flex-col gap-5">
      {/* Visual cyber mesh background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05),transparent_70%)] pointer-events-none" />

      {/* Header section with diagnostic branding */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#222222] pb-4 z-10">
        <div>
          <span className="font-mono text-[10px] text-[#10B981] tracking-widest font-bold uppercase block">// DECIPHER COMPANION INTERACTIVE v1.0</span>
          <h3 className="text-xl font-black font-sans tracking-tight uppercase mt-0.5 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#10B981] animate-pulse" /> Access Decryption Terminal
          </h3>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-[#121212] border border-[#222222] p-1">
          <button
            onClick={() => { audio.playChime(2); setActiveSubTab('puzzle'); }}
            className={`font-mono text-[10px] px-3 py-1.5 uppercase font-bold tracking-widest transition-all ${
              activeSubTab === 'puzzle' 
                ? 'bg-[#10B981] text-black shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-3 h-3 inline mr-1.5" /> Game/Puzzle
          </button>
          <button
            onClick={() => { audio.playChime(2); setActiveSubTab('guide'); }}
            className={`font-mono text-[10px] px-3 py-1.5 uppercase font-bold tracking-widest transition-all ${
              activeSubTab === 'guide' 
                ? 'bg-[#10B981] text-black shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Info className="w-3 h-3 inline mr-1.5" /> Step-by-Step Guide
          </button>
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="z-10 min-h-[310px]">
        {activeSubTab === 'puzzle' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Guide intro */}
            <div className="bg-[#121212]/70 border border-[#222222] p-3 text-left">
              <span className="font-mono text-[10px] text-yellow-500 font-bold block uppercase mb-1">// COGNITIVE OVERRIDE SYSTEM</span>
              <p className="font-mono text-xs text-gray-400 leading-normal">
                If you are a non-technical recruiter or looking for a fast bypass, you can solve this cyber mini-puzzle to directly reveal the security decryption code, or copy it instantly to unlock my full portfolio!
              </p>
            </div>

            {/* Puzzles Container */}
            <div className="grid grid-cols-1 gap-6 items-stretch">
              
              {/* Puzzle 1: Transformer Algorithm Visualizer */}
              <div className="border border-[#222222] bg-[#121212]/40 p-5 flex flex-col justify-between text-left relative overflow-hidden min-h-[580px]">
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-gray-500 font-bold uppercase tracking-wider">// PUZZLE 01 // TRANSFORMER ARCHITECTURE FLOW</span>
                    {isTuned ? (
                      <span className="font-mono text-[9px] text-[#10B981] font-black border border-[#10B981]/30 px-1.5 py-0.5 bg-[#10B981]/10 uppercase animate-pulse">SYNCHRONIZED</span>
                    ) : transformerIsRunning ? (
                      <span className="font-mono text-[9px] text-[#06b6d4] font-black border border-[#06b6d4]/30 px-1.5 py-0.5 bg-[#06b6d4]/10 uppercase animate-pulse">OPTIMIZING MAPS</span>
                    ) : (
                      <span className="font-mono text-[9px] text-yellow-500 font-black border border-yellow-500/30 px-1.5 py-0.5 bg-yellow-500/10 uppercase">UNSYNCHRONIZED</span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-sans text-sm font-bold text-white uppercase tracking-wider">Transformer Block Explorer</h4>
                    <p className="font-mono text-[10px] text-gray-400 leading-relaxed uppercase mt-1">
                      Instead of reading sequential words, the model attends to all words simultaneously. Type any sentence below or choose a preset to trace how vectors process live!
                    </p>
                  </div>

                  {/* Interactive Sentence Custom Inputs & Preset Chips */}
                  <div className="space-y-3 p-3 border border-white/5 bg-neutral-950/80 rounded-sm">
                    <div className="flex flex-col gap-1.5">
                      <span className="font-mono text-[7.5px] text-[#10B981] font-bold uppercase tracking-wider flex items-center gap-1">
                        <Wand2 className="w-3 h-3 text-[#10B981]" /> Inject Custom Sentence (Max 12 Words)
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={sentenceInput}
                          onChange={(e) => setSentenceInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') applySentence(sentenceInput); }}
                          disabled={transformerIsRunning}
                          placeholder="Type your own sentence here..."
                          className="flex-1 px-2.5 py-1 text-xs font-mono bg-black border border-white/10 text-white rounded-none focus:outline-none focus:border-[#10B981]/80 focus:shadow-[0_0_8px_rgba(16,185,129,0.1)] transition-all"
                        />
                        <button
                          onClick={() => applySentence(sentenceInput)}
                          disabled={transformerIsRunning}
                          className="px-3 py-1 font-mono text-[10px] uppercase font-bold tracking-wider bg-[#10B981]/20 hover:bg-[#10B981] text-[#10B981] hover:text-black border border-[#10B981]/30 transition-all rounded-none shrink-0"
                        >
                          Apply
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="font-mono text-[7.5px] text-gray-500 font-bold uppercase block tracking-wider">Or choose educational presets:</span>
                      <div className="flex flex-wrap gap-1">
                        {SENTENCE_PRESETS.map((p, idx) => {
                          const isActive = currentSentence === p.text;
                          return (
                            <button
                              key={idx}
                              onClick={() => applySentence(p.text)}
                              disabled={transformerIsRunning}
                              className={`px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-tighter border transition-all ${
                                isActive
                                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold shadow-[0_0_6px_rgba(6,182,212,0.1)]'
                                  : 'bg-black/30 text-gray-400 border-white/5 hover:text-white hover:border-white/10'
                              }`}
                            >
                              {p.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Step Selector (Sub-steps 0 to 7) */}
                  <div className="flex gap-1 overflow-x-auto pb-2 border-b border-white/5 select-none shrink-0 scrollbar-none">
                    {TRANSFORMER_STEPS.map((step, idx) => {
                      const isActive = transformerStep === idx;
                      return (
                        <button
                          key={step.name}
                          onClick={() => {
                            if (!transformerIsRunning) {
                              setTransformerStep(idx);
                              audio.playChime(1);
                            }
                          }}
                          disabled={transformerIsRunning}
                          className={`px-3 py-1.5 font-mono text-[9px] uppercase tracking-wider border shrink-0 transition-all ${
                            isActive
                              ? 'bg-[#10B981] text-black border-[#10B981] font-bold shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                              : 'bg-black/40 text-gray-400 border-white/5 hover:text-white hover:border-white/10'
                          }`}
                        >
                          {step.badge}
                        </button>
                      );
                    })}
                  </div>

                  {/* Step Info Banner */}
                  <div className="bg-neutral-950/60 border border-white/5 p-3 rounded-sm">
                    <span className="font-mono text-[9px] text-[#10B981] font-bold uppercase block">
                      {TRANSFORMER_STEPS[transformerStep].title}
                    </span>
                    <p className="font-mono text-[10px] text-gray-300 leading-relaxed mt-1 uppercase">
                      {TRANSFORMER_STEPS[transformerStep].description}
                    </p>
                  </div>

                  {/* Live Step Component Output Stage */}
                  <div className="min-h-[300px] bg-[#070707] border border-white/5 p-4 relative rounded-sm flex flex-col justify-between overflow-hidden">
                    
                    {/* STEP 0: Embeddings */}
                    {transformerStep === 0 && (
                      <div className="space-y-4">
                        <span className="font-mono text-[8px] text-gray-500 font-bold uppercase block tracking-wider">// DENSE VECTOR REPRESENTATIONS & SEMANTIC HYPERSPACE</span>
                        
                        {/* Interactive Sentence tags */}
                        <div className="flex flex-wrap gap-1.5">
                          {currentWords.map((word, idx) => {
                            const isSel = idx === selectedWordIndex;
                            return (
                              <button
                                key={idx}
                                onClick={() => { setSelectedWordIndex(idx); audio.playChime(1); }}
                                className={`px-2 py-1 font-mono text-[10px] uppercase font-semibold transition-all border ${
                                  isSel 
                                    ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.15)]' 
                                    : 'bg-black/30 text-gray-400 border-white/5 hover:border-white/15'
                                }`}
                              >
                                {word}
                              </button>
                            );
                          })}
                        </div>

                        {/* Interactive Semantic Space Scatter Map */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="h-28 border border-[#222222] bg-neutral-950 relative rounded-sm overflow-hidden flex items-center justify-center">
                            {/* SVG Grid lines */}
                            <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                              <line x1="20" y1="0" x2="20" y2="100" stroke="white" strokeWidth="0.5" />
                              <line x1="40" y1="0" x2="40" y2="100" stroke="white" strokeWidth="0.5" />
                              <line x1="60" y1="0" x2="60" y2="100" stroke="white" strokeWidth="0.5" />
                              <line x1="80" y1="0" x2="80" y2="100" stroke="white" strokeWidth="0.5" />
                              <line x1="0" y1="25" x2="100" y2="25" stroke="white" strokeWidth="0.5" />
                              <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.5" />
                              <line x1="0" y1="75" x2="100" y2="75" stroke="white" strokeWidth="0.5" />
                            </svg>

                            {/* Semantic nodes plotting */}
                            {currentWords.map((word, i) => {
                              const cleanWord = word.replace(/[^a-zA-Z]/g, "");
                              const { x, y } = get2DProjection(cleanWord, i);
                              const isTargetWord = i === selectedWordIndex;
                              return (
                                <div 
                                  key={i} 
                                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 transition-all duration-300"
                                  style={{ left: `${x}%`, top: `${y}%` }}
                                >
                                  <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                    isTargetWord 
                                      ? 'bg-[#10B981] scale-125 shadow-[0_0_12px_#10B981]' 
                                      : 'bg-gray-600/60'
                                  }`} />
                                  <span className={`font-mono text-[7px] mt-1 tracking-tighter uppercase px-1 py-0.5 rounded-xs transition-all whitespace-nowrap ${
                                    isTargetWord ? 'text-[#10B981] bg-[#10B981]/15 font-bold border border-[#10B981]/30' : 'text-gray-500 bg-black/40 border border-white/5'
                                  }`}>
                                    {word}
                                  </span>
                                </div>
                              );
                            })}
                            <span className="absolute bottom-1 left-2 font-mono text-[6px] text-gray-500 uppercase tracking-widest">// MULTI-DIMENSIONAL PROJECTION</span>
                          </div>

                          {/* Dense Vector Stats View */}
                          <div className="bg-neutral-950 border border-white/5 p-3 font-mono text-[9px] space-y-2 rounded-sm flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between text-gray-500 text-[8px] font-bold">
                                <span>TOKEN: "{currentWords[selectedWordIndex]}"</span>
                                <span className="text-[#10B981]">DIM_SIZE: 768 (D_MODEL)</span>
                              </div>
                              <div className="text-[#10B981] break-all leading-tight font-bold mt-1 uppercase tracking-widest text-[8.5px]">
                                {(() => {
                                  const word = currentWords[selectedWordIndex] || "it";
                                  const seed = seedRandom(word);
                                  const seed2 = seedRandom(word + "2");
                                  const seed3 = seedRandom(word + "3");
                                  return `[ ${seed.toFixed(4)}, ${(-seed2).toFixed(4)}, ${seed3.toFixed(4)}, ..., ${(-seed*seed3).toFixed(4)} ]`;
                                })()}
                              </div>
                            </div>
                            <p className="text-[8px] text-gray-400 leading-normal uppercase">
                              Word embeddings convert textual symbols into mathematical coordinates where distance equates to conceptual similarity.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 1: Positional Encoding */}
                    {transformerStep === 1 && (
                      <div className="space-y-4">
                        <span className="font-mono text-[8px] text-gray-500 font-bold uppercase block tracking-wider">// SINUSOIDAL COORDINATE INJECTION</span>
                        
                        {/* Sinusoidal Pattern Graph simulation */}
                        <div className="h-28 border border-[#222222] bg-neutral-950 relative rounded-sm flex flex-col justify-between p-2">
                          <div className="absolute inset-0 flex items-center justify-center opacity-70">
                            <svg className="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
                              {/* Grid lines */}
                              <line x1="0" y1="30" x2="200" y2="30" stroke="#222222" strokeWidth="0.5" />
                              <line x1="50" y1="0" x2="50" y2="60" stroke="#222222" strokeWidth="0.5" />
                              <line x1="100" y1="0" x2="100" y2="60" stroke="#222222" strokeWidth="0.5" />
                              <line x1="150" y1="0" x2="150" y2="60" stroke="#222222" strokeWidth="0.5" />
                              
                              {/* Sine wave (Emerald) */}
                              <path 
                                d="M 0,30 Q 25,5 50,30 T 100,30 T 150,30 T 200,30" 
                                fill="none" 
                                stroke="#10B981" 
                                strokeWidth="1" 
                              />
                              {/* Cosine wave (Cyan) */}
                              <path 
                                d="M 0,5 Q 25,30 50,55 T 100,5 T 150,55 T 200,5" 
                                fill="none" 
                                stroke="#06b6d4" 
                                strokeWidth="0.8" 
                                strokeDasharray="3 3"
                              />

                              {/* Plot points for ALL words in currentWords */}
                              {currentWords.map((word, idx) => {
                                const posX = 15 + (idx / Math.max(1, currentWords.length - 1)) * 170;
                                const posY = 30 + Math.sin(idx * 1.5) * 18;
                                const isSel = idx === selectedWordIndex;
                                return (
                                  <g key={idx}>
                                    <circle 
                                      cx={posX} 
                                      cy={posY} 
                                      r={isSel ? "4.5" : "2.5"} 
                                      fill={isSel ? "#10B981" : "#555555"} 
                                      className={isSel ? "animate-pulse" : ""} 
                                    />
                                    {isSel && <circle cx={posX} cy={posY} r="1.5" fill="white" />}
                                    <text 
                                      x={posX} 
                                      y={posY - 7} 
                                      textAnchor="middle" 
                                      className={`font-mono text-[5.5px] font-black uppercase tracking-tighter ${isSel ? 'fill-[#10B981]' : 'fill-gray-500'}`}
                                    >
                                      {word.slice(0, 5)}
                                    </text>
                                  </g>
                                );
                              })}
                            </svg>
                          </div>

                          <div className="flex justify-between items-start z-10">
                            <span className="font-mono text-[7px] text-[#10B981] font-bold uppercase tracking-widest">// FREQUENCY MATCH GRANTED</span>
                            <span className="font-mono text-[7px] text-gray-500 uppercase">POS_{selectedWordIndex} active</span>
                          </div>

                          <span className="z-10 font-mono text-[8px] text-gray-500 bg-black/60 px-1 py-0.5 rounded-xs self-start">
                            PE(pos, 2i) = sin(pos / 10000^(2i/d))
                          </span>
                        </div>

                        <div className="bg-neutral-950 border border-white/5 p-2.5 font-mono text-[9px] space-y-1.5 rounded-sm">
                          <div className="flex justify-between text-gray-500 text-[8px] font-bold">
                            <span>WORD: "{currentWords[selectedWordIndex]}" AT SEQUENCE INDEX: {selectedWordIndex}</span>
                            <span className="text-[#06b6d4]">FREQ_STAMP</span>
                          </div>
                          <div className="text-[#06b6d4] break-all leading-tight font-bold text-[8px] uppercase tracking-wider">
                            {`COORD_VECTOR: [ ${Math.sin(selectedWordIndex * 1.5).toFixed(4)}, ${Math.cos(selectedWordIndex * 1.5).toFixed(4)}, ${Math.sin(selectedWordIndex * 2.5).toFixed(4)}, ${Math.cos(selectedWordIndex * 2.5).toFixed(4)} ]`}
                          </div>
                          <p className="text-[8px] text-gray-400 leading-normal uppercase">
                            Injects static geometric wave coordinates directly into the token coordinates to represent word order, allowing parallel training.
                          </p>
                        </div>
                      </div>
                    )}                    {/* STEP 2: Self-Attention Core */}
                    {transformerStep === 2 && (
                      <div className="space-y-4">
                        <span className="font-mono text-[8px] text-gray-500 font-bold uppercase block tracking-wider">// REAL-TIME MATRIX ATTENTION SCORING</span>
                        
                        <div className="space-y-2">
                          <span className="font-mono text-[7.5px] text-gray-400 block">// Attention weights centered on word: "{currentWords[selectedWordIndex]}"</span>
                          
                          <div className="flex flex-wrap gap-1.5">
                            {currentWords.map((word, idx) => {
                              const isSel = idx === selectedWordIndex;
                              const weights = getDynamicAttentionWeights(selectedWordIndex, currentWords, 0);
                              const weight = weights[idx] || 0.05;
                              const bgCol = isSel ? 'rgba(16, 185, 129, 0.35)' : `rgba(16, 185, 129, ${weight * 0.95})`;
                              const borderCol = isSel ? '#10B981' : weight > 0.15 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255, 255, 255, 0.05)';
                              return (
                                <button
                                  key={idx}
                                  onClick={() => { setSelectedWordIndex(idx); audio.playChime(1); }}
                                  className="px-2.5 py-1.5 font-mono text-[9px] transition-all border shrink-0 text-white font-black flex items-center gap-1 hover:border-[#10B981] rounded-none bg-black"
                                  style={{ backgroundColor: bgCol, borderColor: borderCol }}
                                  title={`Weight: ${(weight * 100).toFixed(1)}%`}
                                >
                                  <span>{word}</span> 
                                  <span className="text-[7.5px] text-[#10B981] font-black">{(weight * 100).toFixed(0)}%</span>
                                </button>
                              );
                            })}
                          </div>

                          <div className="bg-neutral-950 p-2 border border-white/5 rounded-sm">
                            <p className="text-[7.5px] text-gray-400 leading-normal uppercase">
                              {(() => {
                                const pronouns = ["it", "she", "he", "they", "its", "them", "this", "him", "her"];
                                const selWord = currentWords[selectedWordIndex]?.toLowerCase();
                                if (pronouns.includes(selWord)) {
                                  const weights = getDynamicAttentionWeights(selectedWordIndex, currentWords, 0);
                                  let maxIdx = 0;
                                  let maxVal = -1;
                                  weights.forEach((w, idx) => {
                                    if (idx !== selectedWordIndex && w > maxVal) {
                                      maxVal = w;
                                      maxIdx = idx;
                                    }
                                  });
                                  const noun = currentWords[maxIdx];
                                  return (
                                    <span className="text-[#10B981] font-black tracking-wider bg-[#10B981]/5 px-1.5 py-1 block border border-[#10B981]/20">
                                      SUCCESS: PRONOUN "{currentWords[selectedWordIndex]}" ATTENDS STRONGLY TO NOUN "{noun}" ({(maxVal * 100).toFixed(0)}%) RESOLVING COREFERENCE!
                                    </span>
                                  );
                                }
                                return (
                                  <span>Calculated: Attention(Q, K, V) = Softmax( Q · K^T / √d_k ) · V</span>
                                );
                              })()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: Multi-Head Attention */}
                    {transformerStep === 3 && (
                      <div className="space-y-4">
                        <span className="font-mono text-[8px] text-gray-500 font-bold uppercase block tracking-wider">// PARALLEL REPRESENTATION SUBSPACE EXPLOITS</span>
                        
                        <div className="grid grid-cols-2 gap-2 pb-1 border-b border-white/5">
                          {[
                            { name: "Head 1 (Coreference)", desc: "Tracks pronouns back to nouns ('it' → nouns)." },
                            { name: "Head 2 (Subject-Verb)", desc: "Tracks actor action relationship (adjoining tokens)." },
                            { name: "Head 3 (Semantic Context)", desc: "Tracks modifiers & abstract space features." },
                            { name: "Head 4 (Adjective Link)", desc: "Tracks descriptive connections across sequence." }
                          ].map((head, idx) => {
                            const isAct = activeHeadIndex === idx;
                            return (
                              <button
                                key={idx}
                                onClick={() => { setActiveHeadIndex(idx); audio.playChime(1); }}
                                className={`p-2 text-left border rounded-none transition-all ${
                                  isAct 
                                    ? 'bg-[#10B981]/15 border-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.15)]' 
                                    : 'bg-black/30 border-white/5 hover:border-white/10'
                                }`}
                              >
                                <span className={`font-mono text-[8.5px] font-black block ${isAct ? 'text-[#10B981]' : 'text-gray-300'}`}>{head.name}</span>
                                <span className="font-mono text-[7px] text-gray-500 block uppercase tracking-tighter mt-0.5">{head.desc}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Focus distribution levels */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
                            {currentWords.map((w, i) => {
                              const weights = getDynamicAttentionWeights(selectedWordIndex, currentWords, activeHeadIndex);
                              const weight = weights[i] || 0.02;
                              return (
                                <div 
                                  key={i} 
                                  className={`h-6 text-[8.5px] px-2.5 flex items-center justify-between rounded-none shrink-0 border transition-all ${
                                    weight > 0.25 
                                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold shadow-[0_0_6px_rgba(6,182,212,0.15)]' 
                                      : 'bg-black/40 text-gray-500 border-white/5'
                                  }`}
                                >
                                  <span className="uppercase">{w}</span>
                                  <span className="text-[7.5px] text-cyan-400 ml-1.5 font-black">{(weight*100).toFixed(0)}%</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 4: Feed-Forward Layer */}
                    {transformerStep === 4 && (
                      <div className="space-y-4">
                        <span className="font-mono text-[8px] text-gray-500 font-bold uppercase block tracking-wider">// MULTI-LAYER PERCEPTRON (MLP) FACT MEMORY STORAGE</span>
                        
                        {/* Feed forward block diagram */}
                        <div className="flex flex-col md:flex-row justify-between items-stretch gap-2.5 bg-neutral-950 p-3 border border-[#222222] rounded-sm select-none">
                          <div className="flex-1 bg-black/40 border border-white/5 p-2 flex flex-col justify-between rounded-sm">
                            <span className="font-mono text-[7px] text-[#10B981] font-bold uppercase block">// STAGE 1: EXPANSION</span>
                            <div className="font-mono text-[9px] text-white font-bold mt-1 uppercase">Linear Layer (W1)</div>
                            <span className="font-mono text-[8px] text-gray-500">768 Dim → 2048 Dim</span>
                            <div className="mt-1 font-mono text-[7.5px] text-gray-500 truncate">
                              Input: "{currentWords[selectedWordIndex]}" embed
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-center font-bold text-[#10B981] text-xs py-1 md:py-0">
                            →
                          </div>

                          <div className="flex-1 bg-black/40 border border-white/5 p-2 flex flex-col justify-between rounded-sm">
                            <span className="font-mono text-[7px] text-cyan-400 font-bold uppercase block">// STAGE 2: ACTIVATION</span>
                            <div className="font-mono text-[9px] text-white font-bold mt-1 uppercase">GELU Non-Linearity</div>
                            <span className="font-mono text-[8px] text-gray-500">f(x) = x * cdf(x)</span>
                            <div className="mt-1 font-mono text-[7.5px] text-cyan-400 font-black">
                              Active: {(seedRandom(currentWords[selectedWordIndex] || "it") * 1024 + 512).toFixed(0)} / 2048 Neurons
                            </div>
                          </div>

                          <div className="flex items-center justify-center font-bold text-[#10B981] text-xs py-1 md:py-0">
                            →
                          </div>

                          <div className="flex-1 bg-black/40 border border-[#10B981]/20 p-2 flex flex-col justify-between rounded-sm">
                            <span className="font-mono text-[7px] text-[#10B981] font-bold uppercase block">// STAGE 3: PROJECTION</span>
                            <div className="font-mono text-[9px] text-white font-bold mt-1 uppercase">Linear Layer (W2)</div>
                            <span className="font-mono text-[8px] text-[#10B981] font-bold">2048 Dim → 768 Dim</span>
                            <div className="mt-1 font-mono text-[7.5px] text-[#10B981] font-bold">
                              Shifted context applied
                            </div>
                          </div>
                        </div>

                        <div className="bg-neutral-950 border border-white/5 p-2.5 font-mono text-[8.5px] space-y-1 rounded-sm">
                          <span className="text-gray-500 uppercase font-bold block">MATHEMATICAL TRANSFORM:</span>
                          <code className="text-emerald-400 block font-bold text-[8.5px] bg-black/50 p-1 border border-white/5">
                            FFN(x) = GeLU( x · W_1 + b_1 ) · W_2 + b_2
                          </code>
                          <p className="text-[8px] text-gray-400 leading-normal uppercase">
                            Processes each token vector individually. This acts as a factual database query, fetching semantic rules and modifying tokens depending on the computed attention context.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* STEP 5: Layer Norm & Residual */}
                    {transformerStep === 5 && (
                      <div className="space-y-4">
                        <span className="font-mono text-[8px] text-gray-500 font-bold uppercase block tracking-wider">// RESIDUAL SKIP CIRCUITS & LAYER STABILIZATION</span>

                        <div className="bg-neutral-950 border border-white/5 p-3 font-mono text-[8.5px] space-y-2 rounded-sm">
                          <div className="flex justify-between items-center text-[#10B981] font-black border-b border-white/5 pb-1">
                            <span className="tracking-wider uppercase">LayerNorm( x + SubLayer(x) )</span>
                            <span className="text-gray-500">[PREVENTS GRADIENT EXPLOSION]</span>
                          </div>
                          
                          {/* Flow Diagram representation */}
                          <div className="p-2 border border-[#222222] bg-black/50 flex flex-col gap-1.5 rounded-sm">
                            <div className="flex justify-between text-gray-500 text-[8px] font-bold">
                              <span>INPUT X (EMBEDDING FOR "{currentWords[selectedWordIndex]?.toUpperCase()}")</span>
                              <span>SUBLAYER_OUT (ATTENTION/FFN IMPACT)</span>
                            </div>
                            <div className="flex items-center justify-between text-gray-300 font-bold">
                              {(() => {
                                const word = currentWords[selectedWordIndex] || "it";
                                const s1 = seedRandom(word + "In");
                                const s2 = seedRandom(word + "In2");
                                const s3 = seedRandom(word + "In3");
                                const e1 = seedRandom(word + "Out");
                                const e2 = seedRandom(word + "Out2");
                                const e3 = seedRandom(word + "Out3");

                                return (
                                  <>
                                    <span>[ {s1.toFixed(3)}, {s2.toFixed(3)}, {s3.toFixed(3)} ]</span>
                                    <span className="text-[#10B981] text-xs">+</span>
                                    <span>[ {e1.toFixed(3)}, {e2.toFixed(3)}, {e3.toFixed(3)} ]</span>
                                  </>
                                );
                              })()}
                            </div>
                            <div className="border-t border-[#222222] pt-1.5 flex flex-col sm:flex-row justify-between items-start sm:items-center text-[8px] font-bold text-[#06b6d4] gap-1">
                              {(() => {
                                const word = currentWords[selectedWordIndex] || "it";
                                const s1 = seedRandom(word + "In");
                                const s2 = seedRandom(word + "In2");
                                const s3 = seedRandom(word + "In3");
                                const e1 = seedRandom(word + "Out");
                                const e2 = seedRandom(word + "Out2");
                                const e3 = seedRandom(word + "Out3");

                                const sum1 = s1 + e1;
                                const sum2 = s2 + e2;
                                const sum3 = s3 + e3;
                                const mean = (sum1 + sum2 + sum3) / 3;
                                const variance = ((sum1-mean)**2 + (sum2-mean)**2 + (sum3-mean)**2) / 3;
                                const std = Math.sqrt(variance) || 1;

                                const norm1 = (sum1 - mean) / std;
                                const norm2 = (sum2 - mean) / std;
                                const norm3 = (sum3 - mean) / std;

                                return (
                                  <>
                                    <span>SUMMED VECTOR: [ {sum1.toFixed(3)}, {sum2.toFixed(3)}, {sum3.toFixed(3)} ]</span>
                                    <span className="text-[#10B981]">LAYER_NORMED (μ=0, σ=1): [ {norm1.toFixed(3)}, {norm2.toFixed(3)}, {norm3.toFixed(3)} ]</span>
                                  </>
                                );
                              })()}
                            </div>
                          </div>

                          <p className="text-gray-400 leading-relaxed uppercase">
                            Residual connections carry the original vector signal directly to downstream levels without modification. This guarantees backpropagation gradients flow safely during deep neural training.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* STEP 6: Stacking Layers */}
                    {transformerStep === 6 && (
                      <div className="space-y-4">
                        <span className="font-mono text-[8px] text-gray-500 font-bold uppercase block tracking-wider">// DEEP ARCHITECTURE LAYER PYRAMID</span>
                        
                        {/* Interactive Stack representation */}
                        <div className="grid grid-cols-6 gap-2 h-16 items-end border-b border-white/5 pb-2">
                          <div className="bg-neutral-900 border border-white/10 h-6 flex items-center justify-center font-mono text-[7px] text-gray-500 uppercase font-bold rounded-sm">L1-12</div>
                          <div className="bg-neutral-900 border border-white/10 h-8 flex items-center justify-center font-mono text-[7px] text-gray-500 uppercase font-bold rounded-sm">L13-36</div>
                          <div className="bg-[#10B981]/15 border border-[#10B981]/40 h-11 flex items-center justify-center font-mono text-[7px] text-[#10B981] uppercase font-bold rounded-sm">L37-64</div>
                          <div className="bg-[#10B981]/25 border border-[#10B981]/50 h-12 flex items-center justify-center font-mono text-[7px] text-[#10B981] uppercase font-bold rounded-sm">L65-80</div>
                          <div className="bg-cyan-500/20 border border-cyan-500/40 h-14 flex items-center justify-center font-mono text-[7px] text-cyan-400 uppercase font-bold rounded-sm animate-pulse">L81-96</div>
                          <div className="bg-cyan-500/40 border border-cyan-500/60 h-16 flex items-center justify-center font-mono text-[8px] text-white font-black uppercase rounded-sm">OUT</div>
                        </div>

                        <div className="bg-neutral-950 border border-white/5 p-2.5 font-mono text-[8.5px] space-y-1.5 rounded-sm">
                          <span className="text-gray-500 uppercase font-bold block">// HEURISTIC HIERARCHY FOR CURRENT SENTENCE</span>
                          <p className="text-gray-300 leading-normal uppercase">
                            Early blocks parse syntax of "{currentWords[0] || 'word'}"; middle layers map pronoun coreferences for "{currentWords.find(w => ["it", "she", "he", "they"].includes(w.toLowerCase())) || 'it'}"; deepest blocks prepare the next-token prediction space.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* STEP 7: Output Projection */}
                    {transformerStep === 7 && (
                      <div className="space-y-4">
                        <span className="font-mono text-[8px] text-gray-500 font-bold uppercase block tracking-wider">// NEXT WORD TOKEN PREDICTION DISTRIBUTION</span>
                        
                        <div className="bg-neutral-950 border border-[#222222] p-3 font-mono text-[9px] space-y-2.5 rounded-sm">
                          <div className="flex justify-between items-center border-b border-white/5 pb-1 font-bold">
                            <span className="text-[#10B981] font-black uppercase text-[10px]">Predicted Target Tokens</span>
                            <span className="text-gray-500 uppercase text-[8px]">Probability CONF</span>
                          </div>
                          
                          <div className="space-y-2">
                            {(() => {
                              const sentenceKey = currentSentence.toLowerCase();
                              let predictions = [
                                { token: '". "', prob: 84.2 },
                                { token: '"and"', prob: 5.2 },
                                { token: '"but"', prob: 2.8 }
                              ];
                              if (sentenceKey.includes("cross the street")) {
                                predictions = [
                                  { token: '". "', prob: 84.2 },
                                  { token: '"and"', prob: 5.2 },
                                  { token: '"but"', prob: 2.8 }
                                ];
                              } else if (sentenceKey.includes("eat the fish")) {
                                predictions = [
                                  { token: '"delicious"', prob: 71.5 },
                                  { token: '". "', prob: 18.1 },
                                  { token: '"fresh"', prob: 4.3 }
                                ];
                              } else {
                                const lastWord = currentWords[currentWords.length - 1] || "token";
                                const seed = seedRandom(lastWord);
                                const p1 = (seed * 50 + 30);
                                const p2 = ((100 - p1) * 0.7);
                                const p3 = (100 - p1 - p2);
                                predictions = [
                                  { token: `"${lastWord ? 'next' : '.'}"`, prob: p1 },
                                  { token: '"and"', prob: p2 },
                                  { token: '"but"', prob: p3 }
                                ];
                              }

                              return predictions.map((pred, idx) => (
                                <div key={idx} className={`flex justify-between items-center ${idx === 0 ? 'text-[10px] text-white font-black' : 'text-gray-400 text-[9px]'}`}>
                                  <span>{idx + 1}. {pred.token}</span>
                                  <div className="flex items-center gap-3">
                                    <div className="w-24 bg-neutral-900 h-2 border border-white/10 overflow-hidden rounded-xs">
                                      <div className={`h-full ${idx === 0 ? 'bg-gradient-to-r from-[#10B981] to-emerald-400' : 'bg-gray-500'}`} style={{ width: `${pred.prob}%` }} />
                                    </div>
                                    <span className={`${idx === 0 ? 'text-[#10B981] font-black' : 'text-gray-400'} w-8 text-right`}>{pred.prob.toFixed(1)}%</span>
                                  </div>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      </div>
                    )}

                    <span className="absolute bottom-1 right-2 font-mono text-[7px] text-gray-600 uppercase font-bold select-none tracking-widest">
                      STATE_VIS // PHASE {transformerStep + 1} OF 8
                    </span>
                  </div>

                  {/* Transformer execution block */}
                  <div className="space-y-1.5">
                    <span className="font-mono text-[7px] text-gray-500 font-bold uppercase block">Interactive Sentence Playground</span>
                    <div className="p-2 border border-white/5 bg-black/40 rounded-sm">
                      <p className="font-mono text-[10px] text-gray-300 uppercase leading-relaxed text-center">
                        {currentWords.map((word, idx) => {
                          const isSel = idx === selectedWordIndex;
                          const pronouns = ["it", "she", "he", "they", "its", "them", "this", "him", "her"];
                          const isPronoun = pronouns.includes(word.toLowerCase());
                          return (
                            <span 
                              key={idx} 
                              onClick={() => { setSelectedWordIndex(idx); audio.playChime(1); }}
                              className={`cursor-pointer transition-all mx-0.5 px-0.5 rounded-sm ${
                                isSel 
                                  ? 'bg-[#10B981]/20 text-[#10B981] font-black underline decoration-double' 
                                  : isPronoun 
                                    ? 'text-cyan-400 underline decoration-dashed hover:bg-cyan-500/10'
                                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              {word}
                            </span>
                          );
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Simulation Control Trigger Button */}
                <div className="mt-4 pt-3 border-t border-white/5 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${isTuned ? 'bg-[#10B981] animate-pulse' : transformerIsRunning ? 'bg-cyan-400 animate-pulse' : 'bg-yellow-500'}`} />
                    <span className="font-mono text-[8px] text-gray-500 uppercase leading-none select-none truncate">
                      {transformerLog}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={transformerIsRunning ? () => { transformerStopRef.current = true; setTransformerIsRunning(false); } : runTransformerSimulation}
                      className={`flex-1 font-mono text-[10px] py-1.5 uppercase font-black tracking-widest transition-all border flex items-center justify-center gap-1.5 ${
                        transformerIsRunning 
                          ? 'bg-rose-500/10 border-rose-500/30 hover:bg-rose-500 hover:text-black text-rose-500' 
                          : 'bg-[#10B981]/10 border-[#10B981]/30 hover:bg-[#10B981] hover:text-black text-[#10B981]'
                      }`}
                    >
                      {transformerIsRunning ? (
                        <>
                          <Square className="w-3 h-3" /> Stop Optimization
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3" /> Run Transformer Flow
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={initTransformer}
                      disabled={transformerIsRunning}
                      className="px-2.5 py-1.5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-40 rounded-none transition-colors"
                      title="Reset Explorer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Unlock revealing module */}
            <div className="border border-[#222222] bg-[#121212]/90 p-4 text-center space-y-4">
              {isUnlocked ? (
                <div className="space-y-1">
                  <span className="font-mono text-xs text-[#10B981] font-bold block uppercase tracking-widest flex items-center justify-center gap-1.5">
                    <Check className="w-4 h-4" /> REPOSITORY CLEARANCE GRANTED
                  </span>
                  <p className="font-mono text-[11px] text-gray-500 uppercase leading-normal">
                    You have unlocked administrative access to all hidden portfolio projects, contact codes, and metrics. Use the navigation buttons above to explore!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3">
                  {/* Status conditions */}
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${isTuned ? 'bg-[#10B981]' : 'bg-[#222222]'}`} />
                    <span className="font-mono text-[10px] text-[#10B981] uppercase font-bold">Transformer Optimizer Synchronized</span>
                  </div>

                  {/* Ultimate Unlock Reveal Panel */}
                  {isTuned || keyRevealed ? (
                    <div className="w-full bg-[#10B981]/5 border border-[#10B981] p-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-scaleUp">
                      <div className="text-left space-y-1">
                        <span className="font-mono text-[10px] text-[#10B981] font-bold tracking-widest block uppercase">// DECRYPTION ACCESS KEY RECOVERED</span>
                        <div className="flex items-center gap-2">
                          <Key className="w-4 h-4 text-[#10B981]" />
                          <code className="font-mono text-sm font-black text-white bg-black px-2.5 py-1 border border-white/10 tracking-widest select-all">
                            {DECRYPT_KEY}
                          </code>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleAutofillAndBypass}
                          className="font-mono text-xs bg-[#10B981] hover:bg-[#10B981]/90 text-black font-black px-4 py-2 uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        >
                          <Sparkles className="w-4 h-4" /> Auto Bypass & Unlock
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full flex flex-col items-center gap-2">
                      <p className="font-mono text-[11px] text-gray-500 uppercase leading-relaxed max-w-lg">
                        Optimize the Transformer flow to automatically unlock the key, or use the shortcut key helper below if you want instant access without gaming.
                      </p>
                      <button
                        onClick={() => {
                          audio.playSuccessSound();
                          setKeyRevealed(true);
                        }}
                        className="font-mono text-[10px] text-[#10B981]/80 hover:text-[#10B981] hover:underline uppercase font-bold tracking-widest"
                      >
                        [ Bypass puzzle and reveal bypass key instantly ]
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeSubTab === 'guide' && (
          <div className="space-y-4 text-left animate-fadeIn">
            <div className="bg-[#121212] border border-[#222222] p-4 space-y-3">
              <span className="font-mono text-xs text-[#10B981] font-bold block uppercase tracking-widest">// MAINFRAME DIRECTORY NAVIGATION GUIDE</span>
              <p className="font-mono text-xs text-gray-400 leading-relaxed uppercase">
                Welcome to my interactive developer mainframe. To unlock full access using standard terminal command-line operations, follow this complete operational protocol:
              </p>

              <div className="space-y-3 pt-2">
                {/* Step 1 */}
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[10px] text-[#10B981] font-bold font-mono shrink-0 mt-0.5">1</div>
                  <div className="space-y-1">
                    <span className="font-mono text-xs font-bold text-white uppercase">List mainframe directories & mapping nodes</span>
                    <p className="font-mono text-[11px] text-gray-500 uppercase leading-relaxed">
                      Type <code className="text-emerald-400 font-bold bg-black/40 px-1 py-0.5 border border-white/5 font-mono">ls</code> in the terminal command line below, then press enter. This reveals the files stored on the local storage cluster.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[10px] text-[#10B981] font-bold font-mono shrink-0 mt-0.5">2</div>
                  <div className="space-y-1">
                    <span className="font-mono text-xs font-bold text-white uppercase">Scan diagnostic configurations for key</span>
                    <p className="font-mono text-[11px] text-gray-500 uppercase leading-relaxed">
                      Read the configuration log file using the command <code className="text-emerald-400 font-bold bg-black/40 px-1 py-0.5 border border-white/5 font-mono">cat system_logs.cfg</code>. Look for the system generated <span className="text-[#10B981]">ACCESS_KEY</span> string located inside the security parameters.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[10px] text-[#10B981] font-bold font-mono shrink-0 mt-0.5">3</div>
                  <div className="space-y-1">
                    <span className="font-mono text-xs font-bold text-white uppercase">Initialize cryptographic decryption bypass</span>
                    <p className="font-mono text-[11px] text-gray-500 uppercase leading-relaxed">
                      Apply the recovered security key to unlock the restricted sectors. Type: <br />
                      <code className="text-emerald-400 font-bold bg-black/40 px-2 py-1 border border-white/5 block font-mono mt-1 text-center select-all">
                        unlock {DECRYPT_KEY}
                      </code>
                    </p>
                  </div>
                </div>
              </div>

              {/* Convenience buttons for recruiters */}
              <div className="pt-4 border-t border-white/5 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`unlock ${DECRYPT_KEY}`);
                    audio.playChime(2);
                  }}
                  className="font-mono text-[10px] bg-[#121212] border border-[#222222] hover:border-[#10B981] px-3 py-1.5 text-white flex items-center gap-1.5 uppercase transition-all"
                >
                  Copy bypass command
                </button>
                <button
                  onClick={handleAutofillAndBypass}
                  className="font-mono text-[10px] bg-[#10B981]/10 border border-[#10B981]/30 hover:bg-[#10B981]/25 px-3 py-1.5 text-[#10B981] flex items-center gap-1.5 uppercase transition-all"
                >
                  Interactive auto-inject & bypass
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Futuristic footer layout lines */}
      <div className="border-t border-[#222222] pt-3 flex flex-col md:flex-row items-center justify-between font-mono text-[9px] text-gray-500 uppercase gap-2 z-10">
        <span>TRANSMISSION NODE STATUS: SECURE CLIENT PERSISTENCE // COMPILING_OK</span>
        <span>NO SERVER APIs COMMITTED</span>
      </div>
    </div>
  );
}
