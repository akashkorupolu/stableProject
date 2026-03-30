import { motion, AnimatePresence } from "framer-motion";
import type { Qubit } from "@/hooks/useQuantumSimulation";
import { Shield, User, Eye } from "lucide-react";

interface NetworkVisualizationProps {
  qubits: Qubit[];
  totalSent: number;
  totalIntercepted: number;
}

function NodeLabel({
  label,
  icon: Icon,
  color,
  position,
}: {
  label: string;
  icon: typeof User;
  color: string;
  position: "left" | "center" | "right";
}) {
  const posClass =
    position === "left"
      ? "left-0"
      : position === "right"
      ? "right-0"
      : "left-1/2 -translate-x-1/2";

  return (
    <div className={`absolute ${posClass} -top-14 flex flex-col items-center gap-1`}>
      <div
        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${color}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <span className="font-display text-xs tracking-widest uppercase">{label}</span>
    </div>
  );
}

export default function NetworkVisualization({
  qubits,
  totalSent,
  totalIntercepted,
}: NetworkVisualizationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-panel p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg tracking-widest uppercase text-primary text-glow-cyan">
          Live Transmission
        </h2>
        <div className="flex gap-4 text-xs font-body">
          <span className="text-muted-foreground">
            Sent: <span className="text-primary">{totalSent}</span>
          </span>
          <span className="text-muted-foreground">
            Intercepted: <span className="text-destructive">{totalIntercepted}</span>
          </span>
        </div>
      </div>

      {/* Network line */}
      <div className="relative h-32 mt-8">
        {/* Node labels */}
        <NodeLabel
          label="Alice"
          icon={Shield}
          color="border-quantum-cyan text-quantum-cyan"
          position="left"
        />
        <NodeLabel
          label="Eve"
          icon={Eye}
          color="border-quantum-red text-quantum-red"
          position="center"
        />
        <NodeLabel
          label="Bob"
          icon={User}
          color="border-quantum-green text-quantum-green"
          position="right"
        />

        {/* Transmission line */}
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-quantum-cyan via-quantum-red to-quantum-green opacity-30" />

        {/* Node dots on line */}
        <div className="absolute top-1/2 left-0 w-3 h-3 -translate-y-1/2 rounded-full bg-quantum-cyan glow-cyan" />
        <div className="absolute top-1/2 left-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-quantum-red glow-red" />
        <div className="absolute top-1/2 right-0 w-3 h-3 -translate-y-1/2 rounded-full bg-quantum-green glow-green" />

        {/* Animated qubits */}
        <AnimatePresence>
          {qubits.map((qubit) => (
            <motion.div
              key={qubit.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute top-1/2 -translate-y-1/2"
              style={{
                left: `${qubit.progress * 100}%`,
                transform: `translateX(-50%) translateY(-50%)`,
              }}
            >
              <div
                className={`w-3 h-3 rounded-full ${
                  qubit.intercepted
                    ? "bg-quantum-red glow-red"
                    : "bg-quantum-cyan glow-cyan"
                }`}
              />
              {/* Particle trail */}
              <div
                className={`absolute top-1/2 -translate-y-1/2 -left-4 w-4 h-1 rounded-full opacity-40 ${
                  qubit.intercepted ? "bg-quantum-red" : "bg-quantum-cyan"
                }`}
                style={{ filter: "blur(2px)" }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Basis legend */}
      <div className="flex gap-6 justify-center text-xs font-body text-muted-foreground pt-2">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-quantum-cyan glow-cyan" /> Normal Qubit
        </span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-quantum-red glow-red" /> Intercepted
        </span>
      </div>
    </motion.div>
  );
}
