import { motion } from "framer-motion";
import { CheckCircle, XCircle, Activity, Clock, Zap, Shield, Eye, User } from "lucide-react";
import type { BB84Result } from "@/lib/quantumApi";

interface BB84ResultsPanelProps {
  result: BB84Result;
}

function BasisRow({ label, bits, bases, highlight }: { label: string; bits: number[]; bases: string[]; highlight?: boolean }) {
  return (
    <div className="space-y-1">
      <span className="font-display text-xs tracking-wider uppercase text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-1">
        {bits.map((bit, i) => (
          <span
            key={i}
            className={`inline-flex items-center justify-center w-7 h-7 rounded text-xs font-mono border ${
              highlight
                ? "border-destructive/40 bg-destructive/10 text-destructive"
                : "border-border bg-muted/30 text-foreground"
            }`}
            title={`Basis: ${bases[i]}`}
          >
            {bit}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-1">
        {bases.map((b, i) => (
          <span
            key={i}
            className="inline-flex items-center justify-center w-7 h-5 rounded text-[10px] font-mono text-muted-foreground"
          >
            {b === "+" ? "+" : "×"}
          </span>
        ))}
      </div>
    </div>
  );
}

function KeyComparison({ alice, bob, corrected }: { alice: number[]; bob: number[]; corrected: number[] }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[80px_1fr] gap-2 items-start">
        <span className="font-display text-xs tracking-wider text-muted-foreground pt-1">Alice</span>
        <div className="flex flex-wrap gap-1">
          {alice.map((bit, i) => (
            <span
              key={i}
              className={`inline-flex items-center justify-center w-7 h-7 rounded text-xs font-mono border ${
                bit !== bob[i]
                  ? "border-destructive/50 bg-destructive/10 text-destructive"
                  : "border-secondary/30 bg-secondary/10 text-secondary"
              }`}
            >
              {bit}
            </span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-[80px_1fr] gap-2 items-start">
        <span className="font-display text-xs tracking-wider text-muted-foreground pt-1">Bob</span>
        <div className="flex flex-wrap gap-1">
          {bob.map((bit, i) => (
            <span
              key={i}
              className={`inline-flex items-center justify-center w-7 h-7 rounded text-xs font-mono border ${
                bit !== alice[i]
                  ? "border-destructive/50 bg-destructive/10 text-destructive"
                  : "border-secondary/30 bg-secondary/10 text-secondary"
              }`}
            >
              {bit}
            </span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-[80px_1fr] gap-2 items-start">
        <span className="font-display text-xs tracking-wider text-muted-foreground pt-1">Corrected</span>
        <div className="flex flex-wrap gap-1">
          {corrected.map((bit, i) => (
            <span
              key={i}
              className="inline-flex items-center justify-center w-7 h-7 rounded text-xs font-mono border border-primary/30 bg-primary/10 text-primary"
            >
              {bit}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BB84ResultsPanel({ result }: BB84ResultsPanelProps) {
  const eveIntercepted = result.eve_bases.filter((b) => b !== null).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-panel p-6 space-y-6"
    >
      <h2 className="font-display text-lg tracking-widest uppercase text-primary text-glow-cyan">
        Complete BB84 Results
      </h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-panel p-3 text-center">
          <Zap className="w-4 h-4 text-primary mx-auto mb-1" />
          <div className="font-display text-lg text-primary">{result.parameters.qubits}</div>
          <div className="text-[10px] font-body text-muted-foreground">Qubits Sent</div>
        </div>
        <div className="glass-panel p-3 text-center">
          <Eye className="w-4 h-4 text-destructive mx-auto mb-1" />
          <div className="font-display text-lg text-destructive">{eveIntercepted}</div>
          <div className="text-[10px] font-body text-muted-foreground">Eve Intercepted</div>
        </div>
        <div className="glass-panel p-3 text-center">
          <Activity className="w-4 h-4 text-secondary mx-auto mb-1" />
          <div className={`font-display text-lg ${result.error_rate >= 20 ? "text-destructive" : "text-secondary"}`}>
            {result.error_rate.toFixed(1)}%
          </div>
          <div className="text-[10px] font-body text-muted-foreground">Error Rate</div>
        </div>
        <div className="glass-panel p-3 text-center">
          <Clock className="w-4 h-4 text-accent mx-auto mb-1" />
          <div className="font-display text-lg text-accent">{result.performance.total_time_sec}s</div>
          <div className="text-[10px] font-body text-muted-foreground">Total Time</div>
        </div>
      </div>

      {/* Eve Detection */}
      <div className={`flex items-center gap-3 p-3 rounded-lg border ${
        result.eve_detected
          ? "border-destructive/40 bg-destructive/5"
          : "border-secondary/40 bg-secondary/5"
      }`}>
        {result.eve_detected ? (
          <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
        ) : (
          <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0" />
        )}
        <div>
          <div className={`font-display text-sm tracking-wider ${result.eve_detected ? "text-destructive" : "text-secondary"}`}>
            {result.eve_detected ? "⚠ EVE DETECTED — KEY COMPROMISED" : "✓ CHANNEL SECURE — NO EAVESDROPPER"}
          </div>
          <div className="text-xs font-body text-muted-foreground mt-0.5">
            Error rate {result.error_rate.toFixed(1)}% {result.eve_detected ? "≥" : "<"} 20% threshold
          </div>
        </div>
      </div>

      {/* Alice's Bits & Bases */}
      <div className="space-y-4">
        <h3 className="font-display text-sm tracking-widest uppercase text-muted-foreground flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" /> Transmission Details
        </h3>

        <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
          <BasisRow label="Alice (Bits & Bases)" bits={result.alice_bits} bases={result.alice_bases} />
          <BasisRow
            label="Eve (Intercepted)"
            bits={result.eve_results.map((r) => r ?? -1)}
            bases={result.eve_bases.map((b) => b ?? "—")}
            highlight
          />
          <BasisRow label="Bob (Measured)" bits={result.bob_results} bases={result.bob_bases} />
        </div>
      </div>

      {/* Sifted Key Comparison */}
      <div className="space-y-3">
        <h3 className="font-display text-sm tracking-widest uppercase text-muted-foreground flex items-center gap-2">
          <User className="w-4 h-4 text-secondary" /> Sifted Key Comparison
        </h3>
        <p className="text-xs font-body text-muted-foreground">
          {result.sifted_key_alice.length} bits matched from {result.parameters.qubits} transmitted (
          {((result.sifted_key_alice.length / result.parameters.qubits) * 100).toFixed(1)}% sifting rate)
        </p>
        <KeyComparison
          alice={result.sifted_key_alice}
          bob={result.sifted_key_bob}
          corrected={result.corrected_key}
        />
      </div>

      {/* Final Secure Key */}
      <div className="space-y-2">
        <h3 className="font-display text-sm tracking-widest uppercase text-muted-foreground">
          Privacy-Amplified Key (SHA-256)
        </h3>
        {result.final_secure_key ? (
          <div className="bg-muted/30 border border-secondary/30 rounded-lg p-3">
            <code className="text-xs font-mono text-secondary break-all">{result.final_secure_key}</code>
          </div>
        ) : (
          <div className="bg-muted/30 border border-destructive/30 rounded-lg p-3">
            <code className="text-xs font-mono text-destructive">
              Key discarded — eavesdropping detected
            </code>
          </div>
        )}
      </div>

      {/* Performance */}
      <div className="flex gap-4 text-xs font-body text-muted-foreground border-t border-border pt-3">
        <span>⏱ {result.performance.total_time_sec}s total</span>
        <span>📊 {result.performance.bits_per_second} bits/sec</span>
        <span>🔧 Attack: {result.parameters.attack_type}</span>
        <span>📡 Noise: {result.parameters.noise}</span>
      </div>
    </motion.div>
  );
}
