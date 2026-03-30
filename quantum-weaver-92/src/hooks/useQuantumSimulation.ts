import { useState, useCallback, useRef, useEffect } from "react";
import { runBB84, toggleEve, type BB84Result } from "@/lib/quantumApi";

export interface Qubit {
  id: number;
  basis: "rectilinear" | "diagonal";
  value: 0 | 1;
  intercepted: boolean;
  progress: number;
  phase: "alice-eve" | "eve-bob" | "arrived";
}

export interface SimulationConfig {
  numQubits: number;
  eveInterceptRate: number;
  transmissionSpeed: number;
  protocol: "bb84" | "e91";
  noiseLevel: number;
  attackType: "intercept" | "partial" | "none";
}

export interface SimulationState {
  isRunning: boolean;
  qubits: Qubit[];
  secureKey: number[];
  errorRates: { qubit: number; rate: number }[];
  totalSent: number;
  totalIntercepted: number;
  currentErrorRate: number;
  apiResult: BB84Result | null;
  loading: boolean;
  error: string | null;
}

const BASES: Qubit["basis"][] = ["rectilinear", "diagonal"];

export function useQuantumSimulation() {
  const [config, setConfig] = useState<SimulationConfig>({
    numQubits: 50,
    eveInterceptRate: 30,
    transmissionSpeed: 50,
    protocol: "bb84",
    noiseLevel: 0.02,
    attackType: "intercept",
  });

  const [state, setState] = useState<SimulationState>({
    isRunning: false,
    qubits: [],
    secureKey: [],
    errorRates: [],
    totalSent: 0,
    totalIntercepted: 0,
    currentErrorRate: 0,
    apiResult: null,
    loading: false,
    error: null,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const qubitIdRef = useRef(0);
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animate qubits based on API result data
  const animateFromResult = useCallback((result: BB84Result) => {
    const { alice_bits, alice_bases, eve_bases, bob_results } = result;
    const total = alice_bits.length;
    let index = 0;

    // Clear previous animation
    if (animationRef.current) clearInterval(animationRef.current);

    const speed = Math.max(50, 300 - config.transmissionSpeed * 2.5);

    animationRef.current = setInterval(() => {
      if (index >= total) {
        if (animationRef.current) clearInterval(animationRef.current);
        setState((prev) => ({ ...prev, isRunning: false }));
        return;
      }

      const i = index;
      const intercepted = eve_bases[i] !== null;
      const basis = alice_bases[i] === "+" ? "rectilinear" : "diagonal";

      const newQubit: Qubit = {
        id: qubitIdRef.current++,
        basis: basis as Qubit["basis"],
        value: alice_bits[i] as 0 | 1,
        intercepted,
        progress: 0,
        phase: "alice-eve",
      };

      const interceptedSoFar = eve_bases.slice(0, i + 1).filter((b) => b !== null).length;
      const errorRate = i > 0 ? (interceptedSoFar / (i + 1)) * 25 : 0;

      setState((prev) => ({
        ...prev,
        qubits: [...prev.qubits.slice(-30), newQubit],
        totalSent: i + 1,
        totalIntercepted: interceptedSoFar,
        currentErrorRate: result.error_rate,
        errorRates:
          (i + 1) % 3 === 0
            ? [...prev.errorRates.slice(-19), { qubit: i + 1, rate: errorRate }]
            : prev.errorRates,
      }));

      index++;
    }, speed);
  }, [config.transmissionSpeed]);

  // Qubit progress animation
  useEffect(() => {
    if (!state.isRunning && !animationRef.current) return;

    const progressInterval = setInterval(() => {
      setState((prev) => {
        const speed = config.transmissionSpeed / 500;
        const updatedQubits = prev.qubits
          .map((q) => {
            const newProgress = Math.min(q.progress + speed, 1);
            let phase = q.phase;
            if (newProgress >= 1) phase = "arrived";
            else if (newProgress >= 0.5) phase = "eve-bob";
            return { ...q, progress: newProgress, phase } as Qubit;
          })
          .filter((q) => q.progress < 1.05);

        return { ...prev, qubits: updatedQubits };
      });
    }, 30);

    return () => clearInterval(progressInterval);
  }, [state.isRunning, config.transmissionSpeed]);

  const start = useCallback(async () => {
    setState((prev) => ({ ...prev, isRunning: true, loading: true, error: null, apiResult: null }));

    try {
      // Toggle Eve on the backend
      const eveEnabled = config.eveInterceptRate > 0;
      await toggleEve(eveEnabled, config.attackType);

      // Run the BB84 simulation
      const result = await runBB84({
        n: config.numQubits,
        noise: config.noiseLevel,
        attack_prob: config.eveInterceptRate / 100,
        speed: 0.001, // minimal server-side delay
      });

      setState((prev) => ({
        ...prev,
        loading: false,
        apiResult: result,
        secureKey: result.corrected_key,
      }));

      // Animate the transmission
      animateFromResult(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Connection failed";
      setState((prev) => ({
        ...prev,
        isRunning: false,
        loading: false,
        error: `Backend error: ${message}. Make sure your FastAPI server is running.`,
      }));
    }
  }, [config, animateFromResult]);

  const stop = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: false }));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stop();
    qubitIdRef.current = 0;
    setState({
      isRunning: false,
      qubits: [],
      secureKey: [],
      errorRates: [],
      totalSent: 0,
      totalIntercepted: 0,
      currentErrorRate: 0,
      apiResult: null,
      loading: false,
      error: null,
    });
  }, [stop]);

  return { config, setConfig, state, start, stop, reset };
}
