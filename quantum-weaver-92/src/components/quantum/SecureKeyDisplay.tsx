import { motion } from "framer-motion";
import { Lock, Unlock } from "lucide-react";

interface SecureKeyDisplayProps {
  secureKey: number[];
  errorRate: number;
}

export default function SecureKeyDisplay({ secureKey, errorRate }: SecureKeyDisplayProps) {
  const isSecure = errorRate <= 11;
  const keyString = secureKey.join("");
  const chunks = keyString.match(/.{1,8}/g) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-panel p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg tracking-widest uppercase text-primary text-glow-cyan">
          Secure Key
        </h2>
        <div
          className={`flex items-center gap-2 text-sm font-display ${
            isSecure
              ? "text-secondary text-glow-green"
              : "text-destructive text-glow-red"
          }`}
        >
          {isSecure ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          {isSecure ? "SECURE" : "COMPROMISED"}
        </div>
      </div>

      <div className="min-h-[80px] rounded-md bg-muted/30 border border-border p-4 font-mono text-sm">
        {secureKey.length === 0 ? (
          <span className="text-muted-foreground">
            Awaiting key generation...
          </span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {chunks.map((chunk, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`${
                  isSecure ? "text-secondary" : "text-destructive"
                }`}
              >
                {chunk}
              </motion.span>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between text-xs font-body text-muted-foreground">
        <span>Key Length: {secureKey.length} bits</span>
        <span>
          Status:{" "}
          <span className={isSecure ? "text-secondary" : "text-destructive"}>
            {isSecure ? "Usable for encryption" : "Discard — Eve detected"}
          </span>
        </span>
      </div>
    </motion.div>
  );
}
