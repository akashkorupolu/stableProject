import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface ErrorRateGraphProps {
  data: { qubit: number; rate: number }[];
  currentRate: number;
}

export default function ErrorRateGraph({ data, currentRate }: ErrorRateGraphProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-panel p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg tracking-widest uppercase text-primary text-glow-cyan">
          Error Rate (QBER)
        </h2>
        <span
          className={`font-display text-2xl ${
            currentRate > 11
              ? "text-destructive text-glow-red"
              : "text-secondary text-glow-green"
          }`}
        >
          {currentRate.toFixed(1)}%
        </span>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="errorGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(188, 100%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(188, 100%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 15%)" />
            <XAxis
              dataKey="qubit"
              stroke="hsl(215, 20%, 35%)"
              fontSize={10}
              fontFamily="var(--font-body)"
            />
            <YAxis
              stroke="hsl(215, 20%, 35%)"
              fontSize={10}
              fontFamily="var(--font-body)"
              domain={[0, 30]}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(222, 40%, 8%)",
                border: "1px solid hsl(188, 100%, 50%, 0.3)",
                borderRadius: "8px",
                fontFamily: "var(--font-body)",
                color: "hsl(210, 40%, 92%)",
              }}
            />
            <ReferenceLine
              y={11}
              stroke="hsl(0, 85%, 55%)"
              strokeDasharray="5 5"
              label={{
                value: "Security Threshold",
                position: "insideTopRight",
                fill: "hsl(0, 85%, 55%)",
                fontSize: 10,
                fontFamily: "var(--font-body)",
              }}
            />
            <Area
              type="monotone"
              dataKey="rate"
              stroke="hsl(188, 100%, 50%)"
              fill="url(#errorGrad)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-muted-foreground font-body text-center">
        QBER &gt; 11% indicates eavesdropping detected — key must be discarded
      </p>
    </motion.div>
  );
}
