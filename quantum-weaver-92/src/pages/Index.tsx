import { useQuantumSimulation } from "@/hooks/useQuantumSimulation";
import ControlPanel from "@/components/quantum/ControlPanel";
import NetworkVisualization from "@/components/quantum/NetworkVisualization";
import ErrorRateGraph from "@/components/quantum/ErrorRateGraph";
import SecureKeyDisplay from "@/components/quantum/SecureKeyDisplay";
import BB84ResultsPanel from "@/components/quantum/BB84ResultsPanel";
import { motion } from "framer-motion";
import { Atom } from "lucide-react";

export default function Index() {
  const { config, setConfig, state, start, stop, reset } = useQuantumSimulation();

  return (
    <div className="min-h-screen bg-background quantum-grid-bg">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <Atom className="w-8 h-8 text-primary" />
          </motion.div>
          <div>
            <h1 className="font-display text-xl tracking-[0.3em] uppercase text-primary text-glow-cyan">
              Quantum Network Simulator
            </h1>
            <p className="text-xs font-body text-muted-foreground tracking-wider">
              BB84 Quantum Key Distribution — FastAPI + Qiskit Backend
            </p>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="container max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Control Panel - Left */}
          <div className="lg:col-span-4">
            <ControlPanel
              config={config}
              setConfig={setConfig}
              isRunning={state.isRunning}
              loading={state.loading}
              error={state.error}
              onStart={start}
              onStop={stop}
              onReset={reset}
            />
          </div>

          {/* Right side */}
          <div className="lg:col-span-8 space-y-6">
            <NetworkVisualization
              qubits={state.qubits}
              totalSent={state.totalSent}
              totalIntercepted={state.totalIntercepted}
            />
            <ErrorRateGraph
              data={state.errorRates}
              currentRate={state.currentErrorRate}
            />
            <SecureKeyDisplay
              secureKey={state.secureKey}
              errorRate={state.currentErrorRate}
            />

            {/* Full API Results */}
            {state.apiResult && (
              <BB84ResultsPanel result={state.apiResult} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
