import React, { useState, useEffect, useRef } from "react";
import { audio } from "../lib/audio";
import { Play, Square, RefreshCw } from "lucide-react";

interface AlgorithmMatrixProps {
  onProgress: (amount: number, source: string) => void;
  isActive: boolean;
}

type Mode = "sorting" | "pathfinding" | "scheduling";
type SortAlgo = "bubble" | "selection" | "insertion" | "merge" | "quick";

const ARRAY_SIZE = 16;
const GRID_COLS = 12;
const GRID_ROWS = 8;

interface Process {
  id: string;
  color: string;
  borderClass: string;
  bgClass: string;
  shadowClass: string;
  arrivalTime: number;
  burstTime: number;
  remainingTime: number;
  waitingTime: number;
  turnaroundTime: number;
  completionTime: number;
  started: boolean;
}

interface GanttBlock {
  pid: string;
  color: string;
  startTime: number;
  endTime: number;
}

export default function AlgorithmMatrix({
  onProgress,
  isActive,
}: AlgorithmMatrixProps) {
  const [mode, setMode] = useState<Mode>("sorting");
  const [sortAlgo, setSortAlgo] = useState<SortAlgo>("bubble");

  // Sorting State
  const [array, setArray] = useState<number[]>([]);
  const [activeIndices, setActiveIndices] = useState<number[]>([]);

  // Pathfinding State
  type Node = {
    r: number;
    c: number;
    isWall: boolean;
    isVisited: boolean;
    isPath: boolean;
  };
  const [grid, setGrid] = useState<Node[][]>([]);

  // Scheduling (Round-Robin) State
  const [processes, setProcesses] = useState<Process[]>([]);
  const [readyQueue, setReadyQueue] = useState<string[]>([]);
  const [activeProcessId, setActiveProcessId] = useState<string | null>(null);
  const [timeQuantum, setTimeQuantum] = useState<number>(3);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [ganttChart, setGanttChart] = useState<GanttBlock[]>([]);
  const [quantumRemaining, setQuantumRemaining] = useState<number>(3);

  const [isRunning, setIsRunning] = useState(false);
  const [speedMs, setSpeedMs] = useState<number>(400); // Base speed
  const [arraySize, setArraySize] = useState<number>(16);
  const [explanation, setExplanation] = useState<string>(
    "Select an algorithm and click start to visualize and listen to the logic.",
  );

  const stopRef = useRef(false);

  const handleSortAlgoChange = (algo: SortAlgo) => {
    setSortAlgo(algo);
    let algoContext = "";
    if (algo === "bubble")
      algoContext =
        "Bubble Sort: Simple but slow (O(n²)). Use for educational purposes or nearly sorted small arrays.";
    if (algo === "selection")
      algoContext =
        "Selection Sort: O(n²). Performs well on small lists. Minimizes the number of swaps.";
    if (algo === "insertion")
      algoContext =
        "Insertion Sort: O(n²). Great for small data sets or nearly sorted data. Used in TimSort.";
    if (algo === "merge")
      algoContext =
        "Merge Sort: Divide & Conquer (O(n log n)). Stable sort, good for large datasets and linked lists. High memory usage.";
    if (algo === "quick")
      algoContext =
        "Quick Sort: Divide & Conquer (O(n log n) average). Very fast in practice. Good for large arrays. Not stable.";
    setExplanation(algoContext);
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    if (newMode === "sorting") {
      resetSorting();
      handleSortAlgoChange(sortAlgo);
    } else if (newMode === "pathfinding") {
      resetGrid();
      setExplanation(
        "Dijkstra's Algorithm: Finds the shortest path from start to target. Used in GPS navigation, network routing protocols (OSPF), and game AI.",
      );
    } else {
      resetScheduling();
    }
  };

  useEffect(() => {
    if (mode === "sorting") {
      resetSorting();
    }
  }, [arraySize]);

  useEffect(() => {
    resetSorting();
    resetGrid();
    resetScheduling();
    handleSortAlgoChange("bubble");
  }, []);

  const resetSorting = () => {
    const newArr = Array.from(
      { length: arraySize },
      () => Math.floor(Math.random() * 80) + 20,
    );
    setArray(newArr);
    setActiveIndices([]);
    setExplanation("Array randomized. Ready to sort.");
  };

  const resetGrid = () => {
    const newGrid: Node[][] = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      const row: Node[] = [];
      for (let c = 0; c < GRID_COLS; c++) {
        row.push({
          r,
          c,
          isWall: Math.random() < 0.2,
          isVisited: false,
          isPath: false,
        });
      }
      newGrid.push(row);
    }
    // Ensure start and end are clear
    newGrid[0][0].isWall = false;
    newGrid[GRID_ROWS - 1][GRID_COLS - 1].isWall = false;
    setGrid(newGrid);
    setExplanation("Grid randomized. Ready for Dijkstra.");
  };

  const PROCESS_COLORS = [
    { text: "#10B981", border: "border-[#10B981]/50", bg: "bg-[#10B981]/10", shadow: "shadow-[0_0_15px_rgba(16,185,129,0.2)]" }, // Emerald
    { text: "#DFBA5A", border: "border-[#DFBA5A]/50", bg: "bg-[#DFBA5A]/10", shadow: "shadow-[0_0_15px_rgba(223,186,90,0.2)]" }, // Gold
    { text: "#f43f5e", border: "border-[#f43f5e]/50", bg: "bg-[#f43f5e]/10", shadow: "shadow-[0_0_15px_rgba(244,63,94,0.2)]" }, // Rose
    { text: "#06b6d4", border: "border-[#06b6d4]/50", bg: "bg-[#06b6d4]/10", shadow: "shadow-[0_0_15px_rgba(6,182,212,0.2)]" }, // Cyan
    { text: "#a855f7", border: "border-[#a855f7]/50", bg: "bg-[#a855f7]/10", shadow: "shadow-[0_0_15px_rgba(168,85,247,0.2)]" }, // Purple
  ];

  const resetScheduling = () => {
    const numProcesses = 5;
    const newProcesses: Process[] = Array.from({ length: numProcesses }, (_, i) => {
      const burst = Math.floor(Math.random() * 6) + 3; // 3 to 8
      const arrival = i * 2; // Arrive at 0, 2, 4, 6, 8
      return {
        id: `P${i + 1}`,
        color: PROCESS_COLORS[i % PROCESS_COLORS.length].text,
        borderClass: PROCESS_COLORS[i % PROCESS_COLORS.length].border,
        bgClass: PROCESS_COLORS[i % PROCESS_COLORS.length].bg,
        shadowClass: PROCESS_COLORS[i % PROCESS_COLORS.length].shadow,
        arrivalTime: arrival,
        burstTime: burst,
        remainingTime: burst,
        waitingTime: 0,
        turnaroundTime: 0,
        completionTime: 0,
        started: false,
      };
    });
    setProcesses(newProcesses);
    setReadyQueue([]);
    setActiveProcessId(null);
    setCurrentTime(0);
    setGanttChart([]);
    setQuantumRemaining(timeQuantum);
    setExplanation("Round-Robin configuration randomized (Quantum = " + timeQuantum + "). Click MCB MAIN switch to begin CPU scheduling simulation.");
  };

  const sleep = (baseMs: number) => {
    // scale baseMs based on speedMs. If baseMs is 400, and speedMs is 400, multiplier is 1.
    const multiplier = speedMs / 400;
    return new Promise((resolve) => setTimeout(resolve, baseMs * multiplier));
  };

  const playNoteForValue = (val: number, maxVal: number = 100) => {
    if (!audio.getPlayingStatus()) audio.toggle(true);
    // map value to note index 0-8 for harp
    const note = Math.floor((val / maxVal) * 8);
    audio.playHarp(note);
  };

  const runBubbleSort = async () => {
    setIsRunning(true);
    stopRef.current = false;
    let arr = [...array];
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        if (stopRef.current) return setIsRunning(false);
        setActiveIndices([j, j + 1]);
        setExplanation(
          `Comparing arr[${j}] (${arr[j]}) and arr[${j + 1}] (${arr[j + 1]}).`,
        );
        playNoteForValue(arr[j]);
        await sleep(600);

        if (arr[j] > arr[j + 1]) {
          setExplanation(`Swapping because ${arr[j]} > ${arr[j + 1]}.`);
          audio.playDrum("kick");
          let temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          setArray([...arr]);
          onProgress(1, "sort-swap");
          await sleep(600);
        }
      }
    }
    setActiveIndices([]);
    setExplanation("Bubble Sort complete! The array is fully sorted.");
    setIsRunning(false);
  };

  const runSelectionSort = async () => {
    setIsRunning(true);
    stopRef.current = false;
    let arr = [...array];
    for (let i = 0; i < arr.length; i++) {
      let minIdx = i;
      setExplanation(
        `Looking for the minimum element starting from index ${i}.`,
      );
      for (let j = i + 1; j < arr.length; j++) {
        if (stopRef.current) return setIsRunning(false);
        setActiveIndices([minIdx, j]);
        playNoteForValue(arr[j]);
        await sleep(400);
        if (arr[j] < arr[minIdx]) {
          minIdx = j;
          setExplanation(`Found new minimum: ${arr[j]} at index ${j}.`);
        }
      }
      if (minIdx !== i) {
        setExplanation(`Swapping minimum ${arr[minIdx]} with ${arr[i]}.`);
        audio.playDrum("snare");
        let temp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = temp;
        setArray([...arr]);
        onProgress(2, "sort-swap");
        await sleep(600);
      }
    }
    setActiveIndices([]);
    setExplanation("Selection Sort complete!");
    setIsRunning(false);
  };

  const runInsertionSort = async () => {
    setIsRunning(true);
    stopRef.current = false;
    let arr = [...array];
    for (let i = 1; i < arr.length; i++) {
      let key = arr[i];
      let j = i - 1;
      setExplanation(`Inserting ${key} into the sorted portion of the array.`);
      while (j >= 0 && arr[j] > key) {
        if (stopRef.current) return setIsRunning(false);
        setActiveIndices([j, j + 1]);
        playNoteForValue(arr[j]);
        arr[j + 1] = arr[j];
        setArray([...arr]);
        setExplanation(`Moving ${arr[j]} to the right.`);
        await sleep(400);
        j = j - 1;
      }
      arr[j + 1] = key;
      setArray([...arr]);
      audio.playDrum("kick");
      onProgress(1, "sort-insert");
      await sleep(400);
    }
    setActiveIndices([]);
    setExplanation("Insertion Sort complete!");
    setIsRunning(false);
  };

  const runMergeSort = async () => {
    setIsRunning(true);
    stopRef.current = false;
    let arr = [...array];

    const merge = async (l: number, m: number, r: number) => {
      let n1 = m - l + 1;
      let n2 = r - m;
      let L = new Array(n1);
      let R = new Array(n2);
      for (let i = 0; i < n1; i++) L[i] = arr[l + i];
      for (let j = 0; j < n2; j++) R[j] = arr[m + 1 + j];

      let i = 0,
        j = 0,
        k = l;
      while (i < n1 && j < n2) {
        if (stopRef.current) return;
        setActiveIndices([k]);
        setExplanation(`Merging: comparing ${L[i]} and ${R[j]}.`);
        playNoteForValue(L[i]);
        await sleep(500);

        if (L[i] <= R[j]) {
          arr[k] = L[i];
          i++;
        } else {
          arr[k] = R[j];
          j++;
        }
        setArray([...arr]);
        audio.playDrum("hihat");
        onProgress(1, "sort-merge");
        k++;
      }
      while (i < n1) {
        if (stopRef.current) return;
        arr[k] = L[i];
        setArray([...arr]);
        i++;
        k++;
        await sleep(200);
      }
      while (j < n2) {
        if (stopRef.current) return;
        arr[k] = R[j];
        setArray([...arr]);
        j++;
        k++;
        await sleep(200);
      }
    };

    const sort = async (l: number, r: number) => {
      if (l >= r) return;
      let m = l + Math.floor((r - l) / 2);
      await sort(l, m);
      await sort(m + 1, r);
      await merge(l, m, r);
    };

    await sort(0, arr.length - 1);
    if (!stopRef.current) {
      setActiveIndices([]);
      setExplanation("Merge Sort complete!");
    }
    setIsRunning(false);
  };

  const runQuickSort = async () => {
    setIsRunning(true);
    stopRef.current = false;
    let arr = [...array];

    const partition = async (low: number, high: number) => {
      let pivot = arr[high];
      let i = low - 1;
      setExplanation(`Partitioning around pivot ${pivot}.`);
      for (let j = low; j < high; j++) {
        if (stopRef.current) return i + 1;
        setActiveIndices([j, high]);
        playNoteForValue(arr[j]);
        await sleep(400);
        if (arr[j] < pivot) {
          i++;
          let temp = arr[i];
          arr[i] = arr[j];
          arr[j] = temp;
          setArray([...arr]);
          setExplanation(`Swapped ${arr[i]} and ${arr[j]}.`);
          audio.playDrum("kick");
          onProgress(1, "sort-quick");
          await sleep(400);
        }
      }
      let temp = arr[i + 1];
      arr[i + 1] = arr[high];
      arr[high] = temp;
      setArray([...arr]);
      audio.playDrum("snare");
      return i + 1;
    };

    const sort = async (low: number, high: number) => {
      if (low < high) {
        let pi = await partition(low, high);
        await sort(low, pi - 1);
        await sort(pi + 1, high);
      }
    };

    await sort(0, arr.length - 1);
    if (!stopRef.current) {
      setActiveIndices([]);
      setExplanation("Quick Sort complete!");
    }
    setIsRunning(false);
  };

  const runDijkstra = async () => {
    setIsRunning(true);
    stopRef.current = false;
    let currentGrid = [...grid.map((row) => [...row])];
    
    // Clear previous runs
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        currentGrid[r][c].isVisited = false;
        currentGrid[r][c].isPath = false;
      }
    }
    setGrid([...currentGrid.map((row) => [...row])]);

    type QNode = { r: number; c: number; dist: number; prev: QNode | null };
    const dist: number[][] = Array(GRID_ROWS)
      .fill(0)
      .map(() => Array(GRID_COLS).fill(Infinity));
    dist[0][0] = 0;

    let q: QNode[] = [{ r: 0, c: 0, dist: 0, prev: null }];
    const visited = new Set<string>();

    const dr = [-1, 1, 0, 0];
    const dc = [0, 0, -1, 1];

    let endNode: QNode | null = null;

    while (q.length > 0) {
      if (stopRef.current) return setIsRunning(false);
      q.sort((a, b) => a.dist - b.dist);
      const u = q.shift()!;

      const key = `${u.r},${u.c}`;
      if (visited.has(key)) continue;
      visited.add(key);

      currentGrid[u.r][u.c].isVisited = true;
      setGrid([...currentGrid.map((row) => [...row])]);

      setExplanation(`Visiting Node [${u.r}, ${u.c}] with distance ${u.dist}.`);
      playNoteForValue(u.dist, 30);
      onProgress(1, "dijkstra-visit");
      await sleep(200);

      if (u.r === GRID_ROWS - 1 && u.c === GRID_COLS - 1) {
        endNode = u;
        break;
      }

      for (let i = 0; i < 4; i++) {
        const nr = u.r + dr[i];
        const nc = u.c + dc[i];
        if (
          nr >= 0 &&
          nr < GRID_ROWS &&
          nc >= 0 &&
          nc < GRID_COLS &&
          !currentGrid[nr][nc].isWall
        ) {
          if (dist[u.r][u.c] + 1 < dist[nr][nc]) {
            dist[nr][nc] = dist[u.r][u.c] + 1;
            q.push({ r: nr, c: nc, dist: dist[nr][nc], prev: u });
          }
        }
      }
    }

    if (endNode) {
      setExplanation("Path found! Tracing back...");
      audio.playSuccessSound();
      let curr: QNode | null = endNode;
      while (curr) {
        if (stopRef.current) return setIsRunning(false);
        currentGrid[curr.r][curr.c].isPath = true;
        setGrid([...currentGrid.map((row) => [...row])]);
        audio.playBass(1);
        onProgress(2, "dijkstra-path");
        await sleep(300);
        curr = curr.prev;
      }
      setExplanation(
        "Dijkstra's Algorithm complete! The shortest path is highlighted.",
      );
    } else {
      setExplanation(
        "No valid path found. The destination is blocked by walls.",
      );
    }
    setIsRunning(false);
  };

  const runRoundRobin = async () => {
    setIsRunning(true);
    stopRef.current = false;

    let localProcesses: Process[] = processes.map((p) => ({
      ...p,
      remainingTime: p.burstTime,
      waitingTime: 0,
      turnaroundTime: 0,
      completionTime: 0,
    }));

    let queue: string[] = [];
    let currentActiveId: string | null = null;
    let localQuantumRemaining = timeQuantum;
    let localGantt: GanttBlock[] = [];
    let time = 0;
    let finishedCount = 0;

    const MAX_CLOCK = 100;

    const checkArrivals = (timestamp: number) => {
      const arrived = localProcesses.filter(
        (p) => p.arrivalTime === timestamp && p.remainingTime > 0 && !queue.includes(p.id) && p.id !== currentActiveId
      );
      arrived.sort((a, b) => a.id.localeCompare(b.id));
      arrived.forEach((p) => {
        queue.push(p.id);
      });
    };

    while (finishedCount < localProcesses.length && time < MAX_CLOCK) {
      if (stopRef.current) {
        setIsRunning(false);
        return;
      }

      checkArrivals(time);

      if (currentActiveId === null) {
        if (queue.length > 0) {
          currentActiveId = queue.shift()!;
          localQuantumRemaining = timeQuantum;

          const procIdx = localProcesses.findIndex(p => p.id === currentActiveId);
          audio.playDrum("snare");
          audio.playChime(procIdx * 2 + 2);
          setExplanation(`Time ${time}: CPU scheduled ${currentActiveId} from Ready Queue. Allocating Quantum = ${timeQuantum}.`);
        } else {
          setExplanation(`Time ${time}: CPU Core is currently IDLE. Waiting for processes to arrive...`);
          audio.playDrum("hihat");
        }
      }

      setProcesses(JSON.parse(JSON.stringify(localProcesses)));
      setReadyQueue([...queue]);
      setActiveProcessId(currentActiveId);
      setCurrentTime(time);
      setQuantumRemaining(currentActiveId ? localQuantumRemaining : 0);
      setGanttChart([...localGantt]);

      onProgress(1, "rr-tick");
      await sleep(1000); // respects Speed slider via multiplier

      if (currentActiveId !== null) {
        const activePIdx = localProcesses.findIndex(p => p.id === currentActiveId);
        const activeP = localProcesses[activePIdx];

        const lastBlock = localGantt[localGantt.length - 1];
        if (lastBlock && lastBlock.pid === currentActiveId) {
          lastBlock.endTime = time + 1;
        } else {
          localGantt.push({
            pid: currentActiveId,
            color: activeP.color,
            startTime: time,
            endTime: time + 1,
          });
        }

        audio.playHarp(activePIdx * 2);

        activeP.remainingTime -= 1;
        localQuantumRemaining -= 1;

        queue.forEach((pid) => {
          const qP = localProcesses.find((p) => p.id === pid);
          if (qP) {
            qP.waitingTime += 1;
          }
        });

        if (activeP.remainingTime === 0) {
          activeP.completionTime = time + 1;
          activeP.turnaroundTime = activeP.completionTime - activeP.arrivalTime;
          activeP.waitingTime = activeP.turnaroundTime - activeP.burstTime;
          finishedCount++;

          setExplanation(`Time ${time + 1}: Process ${currentActiveId} has completed! (WT = ${activeP.waitingTime} ticks, TAT = ${activeP.turnaroundTime} ticks).`);
          audio.playSuccessSound();

          currentActiveId = null;
        } else if (localQuantumRemaining === 0) {
          setExplanation(`Time ${time + 1}: Process ${currentActiveId} quantum expired. Preempting process.`);
          checkArrivals(time + 1);
          queue.push(currentActiveId);
          currentActiveId = null;
        }
      }

      time++;
    }

    if (!stopRef.current && finishedCount === localProcesses.length) {
      const totalWait = localProcesses.reduce((sum, p) => sum + p.waitingTime, 0);
      const totalTAT = localProcesses.reduce((sum, p) => sum + p.turnaroundTime, 0);
      const avgWait = (totalWait / localProcesses.length).toFixed(1);
      const avgTAT = (totalTAT / localProcesses.length).toFixed(1);

      setProcesses(JSON.parse(JSON.stringify(localProcesses)));
      setReadyQueue([]);
      setActiveProcessId(null);
      setCurrentTime(time);
      setQuantumRemaining(0);
      setGanttChart([...localGantt]);

      setExplanation(`Round-Robin Scheduling completed! Avg Waiting Time = ${avgWait} ticks | Avg Turnaround Time = ${avgTAT} ticks. Ideal fairness scheduling used virtually everywhere.`);
      audio.playSuccessSound();
    }
    setIsRunning(false);
  };

  const handleStart = () => {
    if (isRunning) {
      stopRef.current = true;
      return;
    }
    if (!audio.getPlayingStatus()) {
      audio.toggle(true);
    }
    if (mode === "sorting") {
      if (sortAlgo === "bubble") runBubbleSort();
      if (sortAlgo === "selection") runSelectionSort();
      if (sortAlgo === "insertion") runInsertionSort();
      if (sortAlgo === "merge") runMergeSort();
      if (sortAlgo === "quick") runQuickSort();
    } else if (mode === "pathfinding") {
      runDijkstra();
    } else {
      runRoundRobin();
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2">
          <button
            onClick={() => handleModeChange("sorting")}
            className={`font-mono text-[9px] px-3 py-1 border uppercase tracking-wider ${mode === "sorting" ? "bg-[#10B981]/20 border-[#10B981] text-[#10B981]" : "border-white/10 text-gray-500 hover:text-white"}`}
          >
            Sorting
          </button>
          <button
            onClick={() => handleModeChange("pathfinding")}
            className={`font-mono text-[9px] px-3 py-1 border uppercase tracking-wider ${mode === "pathfinding" ? "bg-[#10B981]/20 border-[#10B981] text-[#10B981]" : "border-white/10 text-gray-500 hover:text-white"}`}
          >
            Pathfinding (Dijkstra)
          </button>
          <button
            onClick={() => handleModeChange("scheduling")}
            className={`font-mono text-[9px] px-3 py-1 border uppercase tracking-wider ${mode === "scheduling" ? "bg-[#10B981]/20 border-[#10B981] text-[#10B981]" : "border-white/10 text-gray-500 hover:text-white"}`}
          >
            Scheduling (Round-Robin)
          </button>
        </div>

        {mode === "sorting" && (
          <div className="flex gap-2">
            {(
              [
                "bubble",
                "selection",
                "insertion",
                "merge",
                "quick",
              ] as SortAlgo[]
            ).map((algo) => (
              <button
                key={algo}
                onClick={() => handleSortAlgoChange(algo)}
                disabled={isRunning}
                className={`font-mono text-[8px] px-2 py-1 border uppercase ${sortAlgo === algo ? "border-[#10B981] text-[#10B981]" : "border-white/10 text-gray-500"} disabled:opacity-50`}
              >
                {algo}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 mr-2 bg-[#111] border border-white/5 px-3 py-1.5 rounded-sm">
            {mode === "sorting" && (
              <div className="flex items-center gap-2 border-r border-white/10 pr-4">
                <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest">
                  Size
                </span>
                <input
                  type="range"
                  min="8"
                  max="64"
                  step="1"
                  value={arraySize}
                  onChange={(e) => setArraySize(Number(e.target.value))}
                  disabled={isRunning}
                  className="w-16 accent-[#10B981] disabled:opacity-50"
                />
              </div>
            )}
            {mode === "scheduling" && (
              <div className="flex items-center gap-2 border-r border-white/10 pr-4">
                <span className="font-mono text-[8px] text-[#DFBA5A] uppercase tracking-widest font-black">
                  Quantum
                </span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={timeQuantum}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setTimeQuantum(val);
                    setQuantumRemaining(val);
                  }}
                  disabled={isRunning}
                  className="w-12 accent-[#DFBA5A] disabled:opacity-50"
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest">
                Speed
              </span>
              <input
                type="range"
                min="100"
                max="1000"
                step="100"
                value={1100 - speedMs} // reverse slider visual: larger value means faster (lower sleep)
                onChange={(e) => setSpeedMs(1100 - Number(e.target.value))}
                disabled={isRunning}
                className="w-16 accent-[#10B981] disabled:opacity-50"
              />
            </div>
          </div>

          <button
            onClick={
              mode === "sorting"
                ? resetSorting
                : mode === "pathfinding"
                ? resetGrid
                : resetScheduling
            }
            disabled={isRunning}
            className="p-1 border border-white/10 text-gray-400 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* MCB Breaker Switch */}
          <div className="flex flex-col items-center gap-1">
            <span className="font-mono text-[6px] text-gray-500 uppercase font-black tracking-widest">
              MCB MAIN
            </span>
            <button
              onClick={handleStart}
              className={`relative w-8 h-12 border-2 border-white/10 bg-[#0a0a0a] overflow-hidden flex flex-col justify-center items-center transition-all ${isRunning ? "shadow-[0_0_15px_rgba(16,185,129,0.3)]" : ""}`}
            >
              {/* Switch Track */}
              <div className="absolute inset-y-1 inset-x-2 bg-black border border-white/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]" />

              {/* Toggle Body */}
              <div
                className={`absolute inset-x-1 h-6 transition-all duration-200 shadow-md border ${
                  isRunning
                    ? "top-1 bg-[#10B981] border-[#10B981]/50 shadow-[0_4px_0_rgba(0,0,0,0.5)]"
                    : "bottom-1 bg-[#f43f5e] border-[#f43f5e]/50 shadow-[0_-4px_0_rgba(0,0,0,0.5)]"
                }`}
              >
                {/* Ridges */}
                <div className="absolute inset-x-1 top-1 h-0.5 bg-white/20" />
                <div className="absolute inset-x-1 top-2.5 h-0.5 bg-white/20" />
                <div className="absolute inset-x-1 top-4 h-0.5 bg-white/20" />
              </div>
            </button>
            <span
              className={`font-mono text-[7px] uppercase font-black ${isRunning ? "text-[#10B981]" : "text-[#f43f5e]"}`}
            >
              {isRunning ? "ON / ACTIVE" : "OFF / RESET"}
            </span>
          </div>
        </div>
      </div>

      {/* Visualizer Area */}
      <div className="relative flex-1 bg-[#080808] border border-white/5 overflow-hidden flex items-end justify-center p-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
        {mode === "sorting" && (
          <div className="flex items-end gap-0.5 w-full h-full relative z-10">
            {array.map((val, idx) => {
              const maxVal = Math.max(...array, 100);
              const valPercentage = val / maxVal;
              // Color based on height (dark deep colors, blue to purple)
              const hue = 220 + valPercentage * 60; // 220 (blue) to 280 (purple)
              const lightness = 10 + valPercentage * 20; // 10% to 30% lightness

              return (
                <div
                  key={idx}
                  className={`flex-1 transition-all duration-300 flex flex-col justify-start pt-2 items-center border-t border-white/20 ${
                    activeIndices.includes(idx)
                      ? "bg-white z-20 scale-[1.02]"
                      : "opacity-100"
                  }`}
                  style={{
                    height: `${val}%`,
                    backgroundColor: activeIndices.includes(idx)
                      ? "white"
                      : `hsl(${hue}, 80%, ${lightness}%)`,
                    boxShadow: activeIndices.includes(idx)
                      ? "0 0 20px rgba(255,255,255,0.9)"
                      : `0 0 15px hsla(${hue}, 80%, ${lightness}%, 0.5)`,
                  }}
                >
                  {arraySize <= 32 && (
                    <span
                      className={`font-mono text-[9px] font-black tracking-tighter ${activeIndices.includes(idx) ? "text-black" : "text-white drop-shadow-md"}`}
                    >
                      {val}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {mode === "pathfinding" && (
          <div className="w-full h-full flex flex-col gap-0.5">
            {grid.map((row, rIdx) => (
              <div key={rIdx} className="flex flex-1 gap-0.5">
                {row.map((node, cIdx) => {
                  const isStart = rIdx === 0 && cIdx === 0;
                  const isEnd =
                    rIdx === GRID_ROWS - 1 && cIdx === GRID_COLS - 1;
                  let bg = "bg-[#1a1a1a]";
                  if (isStart || isEnd)
                    bg = "bg-[#f43f5e] shadow-[0_0_15px_#f43f5e] z-10";
                  else if (node.isPath)
                    bg =
                      "bg-white shadow-[0_0_15px_white] z-10 scale-[1.05] transition-transform";
                  else if (node.isVisited)
                    bg =
                      "bg-gradient-to-br from-[#10B981]/80 to-[#047857]/60 shadow-[0_0_8px_rgba(16,185,129,0.3)]";
                  else if (node.isWall)
                    bg = "bg-gray-800 border border-white/5";

                  return (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className={`flex-1 transition-all duration-300 ${bg}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {mode === "scheduling" && (
          <div className="w-full h-full flex flex-col gap-4 text-white overflow-y-auto max-h-[440px] p-2 terminal-scroll">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 w-full">
              {/* Ready Queue & CPU */}
              <div className="md:col-span-7 flex flex-col gap-3">
                {/* CPU Core */}
                <div className="bg-[#0b0b0b] border border-white/5 p-4 flex flex-col items-center justify-center relative rounded-md min-h-[140px] shadow-lg">
                  {/* Futuristic grid backing */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />
                  
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${activeProcessId ? "bg-[#10B981] animate-pulse" : "bg-red-500 animate-ping"}`} />
                    <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest font-black">CPU CORE MULTITHREAD</span>
                  </div>

                  {activeProcessId ? (
                    (() => {
                      const activeProc = processes.find(p => p.id === activeProcessId);
                      return (
                        <div className="flex flex-col items-center gap-2 z-10">
                          <div 
                            className="w-16 h-16 rounded-full flex items-center justify-center font-mono font-black text-lg border-2 border-dashed animate-[spin_10s_linear_infinite]"
                            style={{ 
                              borderColor: activeProc?.color,
                              boxShadow: `0 0 20px ${activeProc?.color}33`,
                            }}
                          >
                            <span className="animate-[spin_reverse_10s_linear_infinite]" style={{ color: activeProc?.color }}>
                              {activeProcessId}
                            </span>
                          </div>
                          <div className="text-center font-mono uppercase tracking-wider">
                            <div className="text-xs font-bold animate-pulse" style={{ color: activeProc?.color }}>
                              EXECUTING {activeProcessId}
                            </div>
                            <div className="text-[9px] text-gray-400 mt-1 flex gap-3">
                              <span>BURST LEFT: {activeProc?.remainingTime}</span>
                              <span className="text-[#DFBA5A]">QUANTUM LEFT: {quantumRemaining}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="flex flex-col items-center gap-2 z-10 text-gray-600">
                      <div className="w-14 h-14 rounded-full border border-gray-800/80 flex items-center justify-center font-mono font-black text-xs bg-black/40">
                        OFF
                      </div>
                      <div className="font-mono text-[9px] uppercase tracking-widest text-red-500 font-bold">
                        CPU STANDBY / IDLE
                      </div>
                    </div>
                  )}
                </div>

                {/* Ready Queue Trail */}
                <div className="bg-[#0b0b0b] border border-white/5 p-3 rounded-md flex flex-col gap-2 min-h-[85px]">
                  <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest font-black text-left">Ready Queue (FIFO)</span>
                  <div className="flex gap-2 items-center flex-1 overflow-x-auto min-h-[40px] py-1">
                    {readyQueue.length > 0 ? (
                      readyQueue.map((pid, idx) => {
                        const proc = processes.find(p => p.id === pid);
                        return (
                          <div key={`${pid}-${idx}`} className="flex items-center gap-2 shrink-0">
                            <div 
                              className="px-3 py-1.5 font-mono text-[10px] font-black border uppercase tracking-wider relative flex items-center justify-center"
                              style={{ 
                                borderColor: proc?.color, 
                                color: proc?.color,
                                background: `${proc?.color}15`
                              }}
                            >
                              {pid}
                              <span className="absolute -top-1.5 -right-1.5 bg-black border border-white/10 text-[6px] font-mono px-1 rounded-full text-gray-400">
                                {idx}
                              </span>
                            </div>
                            {idx < readyQueue.length - 1 && (
                              <span className="text-gray-700 font-mono text-xs">→</span>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <span className="font-mono text-[9px] text-gray-600 uppercase tracking-widest italic my-auto text-left">
                        No processes in queue.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Processes Table */}
              <div className="md:col-span-5 flex flex-col gap-2 bg-[#0b0b0b] border border-white/5 p-3 rounded-md">
                <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest font-black text-left">Process Control Blocks (PCB)</span>
                <div className="flex flex-col gap-2">
                  {processes.map((p) => {
                    const isCurrent = p.id === activeProcessId;
                    const progress = (p.remainingTime / p.burstTime) * 100;
                    return (
                      <div 
                        key={p.id} 
                        className={`flex flex-col gap-1 p-2 border text-left ${isCurrent ? "border-white bg-white/5" : "border-white/5 bg-black/20"} transition-all duration-300`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 inline-block" style={{ backgroundColor: p.color }} />
                            <span style={{ color: p.color }} className="font-black">{p.id}</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-400 text-[9px]">
                            <span>ARR: {p.arrivalTime}</span>
                            <span>BURST: {p.burstTime}</span>
                            {p.completionTime > 0 && (
                              <>
                                <span className="text-emerald-400">WT: {p.waitingTime}</span>
                                <span className="text-cyan-400 font-black">TAT: {p.turnaroundTime}</span>
                              </>
                            )}
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div className="w-full h-1.5 bg-neutral-900 border border-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full transition-all duration-300"
                            style={{ 
                              width: `${progress}%`, 
                              backgroundColor: p.color,
                              boxShadow: `0 0 8px ${p.color}`
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Gantt Chart History */}
            <div className="bg-[#0b0b0b] border border-white/5 p-3 rounded-md flex flex-col gap-2 w-full mt-auto">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest font-black">Visual CPU Gantt Chart Timeline</span>
                <span className="font-mono text-[9px] text-gray-400 font-bold">Clock Ticks: {currentTime}</span>
              </div>
              <div className="flex border border-white/10 h-11 w-full overflow-x-auto bg-black/40 relative">
                {ganttChart.length > 0 ? (
                  ganttChart.map((block, idx) => {
                    const duration = block.endTime - block.startTime;
                    return (
                      <div 
                        key={idx} 
                        className="h-full flex flex-col justify-between items-center border-r border-white/10 p-1 shrink-0 relative select-none"
                        style={{ 
                          backgroundColor: `${block.color}15`,
                          width: `${duration * 24}px`
                        }}
                      >
                        <span className="font-mono text-[9px] font-black" style={{ color: block.color }}>
                          {block.pid}
                        </span>
                        <div className="flex justify-between w-full font-mono text-[6px] text-gray-500 px-0.5 absolute bottom-0.5 left-0 right-0">
                          <span>{block.startTime}</span>
                          <span>{block.endTime}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="m-auto font-mono text-[9px] text-gray-600 uppercase tracking-widest italic">
                    Timeline idle. Run simulation to construct timeline slices.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Explanation Log */}
      <div className="bg-[#111] border border-white/10 p-4 h-24 flex items-start overflow-y-auto shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)]">
        <p className="font-mono text-[11px] font-bold leading-relaxed whitespace-pre-wrap text-left w-full">
          <span className="text-pink-500 mr-2 text-sm drop-shadow-[0_0_5px_rgba(236,72,153,0.8)]">
            {">"}
          </span>
          <span className="bg-gradient-to-r from-cyan-300 via-emerald-300 to-emerald-400 bg-clip-text text-transparent drop-shadow-sm">
            {explanation}
          </span>
        </p>
      </div>
    </div>
  );
}
