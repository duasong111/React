"use client";

import { motion, useInView, animate } from "framer-motion";
import { useRef, useEffect, useState } from "react";

function AnimatedCounter({
  value,
  suffix = "",
  label,
}: {
  value: number;
  suffix?: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, value, {
      duration: 2,
      ease: "easeOut",
      onUpdate(latest) {
        setDisplayValue(Math.round(latest));
      },
    });
    return () => controls.stop();
  }, [isInView, value]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
        <span className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
          {displayValue.toLocaleString()}
        </span>
        <span className="text-primary">{suffix}</span>
      </div>
      <p className="mt-3 text-muted-foreground text-sm sm:text-base">{label}</p>
    </div>
  );
}

const stats = [
  { value: 10000, suffix: "+", label: "活跃用户" },
  { value: 99, suffix: "%", label: "正常运行时间" },
  { value: 50, suffix: "ms", label: "平均响应时间" },
  { value: 500, suffix: "+", label: "企业客户" },
];

export default function Stats() {
  return (
    <section id="stats" className="relative py-32 px-6">
      {/* Background accent */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            用数据说话
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            我们的平台已被全球用户信赖。
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-12"
        >
          {stats.map((stat) => (
            <AnimatedCounter
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
