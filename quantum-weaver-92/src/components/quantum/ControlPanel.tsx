import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Square, RotateCcw, Loader2 } from "lucide-react";
import type { SimulationConfig } from "@/hooks/useQuantumSimulation";

interface ControlPanelProps {
  config: SimulationConfig;
  setConfig: (config: SimulationConfig) => void;
  isRunning: boolean;
  loading: boolean;
  error: string | null;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
}

export default function ControlPanel({
  config,
  setConfig,
  isRunning,
  loading,
  error,
  onStart,
  onStop,
  onReset,
}: ControlPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6 space-y-6"
    >
      <h2 className="font-display text-lg tracking-widest uppercase text-primary text-glow-cyan">
        Control Panel
      </h2>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs font-body text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="font-body text-sm text-muted-foreground flex justify-between">
            <span>Qubits to Send</span>
            <span className="text-primary">{config.numQubits}</span>
          </label>
          <Slider
            value={[config.numQubits]}
            onValueChange={([v]) => setConfig({ ...config, numQubits: v })}
            min={10}
            max={200}
            step={10}
            disabled={isRunning}
            className="[&_[role=slider]]:bg-primary [&_[role=slider]]:glow-cyan"
          />
        </div>

        <div className="space-y-2">
          <label className="font-body text-sm text-muted-foreground flex justify-between">
            <span>Eve Intercept Rate</span>
            <span className="text-destructive">{config.eveInterceptRate}%</span>
          </label>
          <Slider
            value={[config.eveInterceptRate]}
            onValueChange={([v]) => setConfig({ ...config, eveInterceptRate: v })}
            min={0}
            max={100}
            step={5}
            disabled={isRunning}
            className="[&_[role=slider]]:bg-destructive [&_[role=slider]]:glow-red"
          />
        </div>

        <div className="space-y-2">
          <label className="font-body text-sm text-muted-foreground flex justify-between">
            <span>Noise Level</span>
            <span className="text-accent">{(config.noiseLevel * 100).toFixed(0)}%</span>
          </label>
          <Slider
            value={[config.noiseLevel * 100]}
            onValueChange={([v]) => setConfig({ ...config, noiseLevel: v / 100 })}
            min={0}
            max={20}
            step={1}
            disabled={isRunning}
            className="[&_[role=slider]]:bg-accent"
          />
        </div>

        <div className="space-y-2">
          <label className="font-body text-sm text-muted-foreground flex justify-between">
            <span>Animation Speed</span>
            <span className="text-secondary">{config.transmissionSpeed}%</span>
          </label>
          <Slider
            value={[config.transmissionSpeed]}
            onValueChange={([v]) => setConfig({ ...config, transmissionSpeed: v })}
            min={10}
            max={100}
            step={5}
            disabled={isRunning}
            className="[&_[role=slider]]:bg-secondary [&_[role=slider]]:glow-green"
          />
        </div>

        <div className="space-y-2">
          <label className="font-body text-sm text-muted-foreground">Attack Type</label>
          <select
            value={config.attackType}
            onChange={(e) =>
              setConfig({ ...config, attackType: e.target.value as "intercept" | "partial" | "none" })
            }
            disabled={isRunning}
            className="w-full rounded-md bg-muted border border-border px-3 py-2 text-sm text-foreground font-body focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
          >
            <option value="intercept">Intercept & Resend</option>
            <option value="partial">Partial Intercept</option>
            <option value="none">No Attack</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="font-body text-sm text-muted-foreground">Protocol</label>
          <select
            value={config.protocol}
            onChange={(e) =>
              setConfig({ ...config, protocol: e.target.value as "bb84" | "e91" })
            }
            disabled={isRunning}
            className="w-full rounded-md bg-muted border border-border px-3 py-2 text-sm text-foreground font-body focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
          >
            <option value="bb84">BB84</option>
            <option value="e91">E91</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3">
        {!isRunning ? (
          <Button
            onClick={onStart}
            disabled={loading}
            className="flex-1 bg-primary text-primary-foreground font-display tracking-wider glow-cyan hover:bg-primary/80"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Simulating...</>
            ) : (
              <><Play className="w-4 h-4 mr-2" /> Run Simulation</>
            )}
          </Button>
        ) : (
          <Button
            onClick={onStop}
            className="flex-1 bg-destructive text-destructive-foreground font-display tracking-wider glow-red hover:bg-destructive/80"
          >
            <Square className="w-4 h-4 mr-2" /> Stop
          </Button>
        )}
        <Button
          onClick={onReset}
          variant="outline"
          className="border-border text-muted-foreground font-display tracking-wider hover:bg-muted"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      <p className="text-[10px] font-body text-muted-foreground text-center">
        Backend: FastAPI + Qiskit Aer
      </p>
    </motion.div>
  );
}
