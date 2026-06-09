"use client";

import { motion } from "framer-motion";
import { Zap, Shield, Palette, Gauge, Globe, Blocks } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "极致性能",
    description: "服务端渲染 + 流式传输，首屏加载快如闪电。",
    gradient: "from-yellow-500/20 to-orange-500/20",
    iconColor: "text-yellow-500",
  },
  {
    icon: Shield,
    title: "安全可靠",
    description: "内置安全防护，CSRF、XSS 自动防御，安心上线。",
    gradient: "from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-500",
  },
  {
    icon: Palette,
    title: "精美设计",
    description: "Tailwind CSS + shadcn/ui，轻松打造专业级 UI。",
    gradient: "from-pink-500/20 to-rose-500/20",
    iconColor: "text-pink-500",
  },
  {
    icon: Gauge,
    title: "开发体验",
    description: "热更新、TypeScript 支持、智能提示，效率翻倍。",
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-500",
  },
  {
    icon: Globe,
    title: "全球化部署",
    description: "一键部署到 Vercel、AWS 或自托管服务器。",
    gradient: "from-violet-500/20 to-purple-500/20",
    iconColor: "text-violet-500",
  },
  {
    icon: Blocks,
    title: "灵活扩展",
    description: "丰富的插件生态和 API，按需扩展无极限。",
    gradient: "from-amber-500/20 to-yellow-500/20",
    iconColor: "text-amber-500",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export default function Features() {
  return (
    <section id="features" className="relative py-32 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            为什么选择我们
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            我们提供全套现代化工具链，让你专注于创造价值。
          </p>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 hover:border-border hover:shadow-xl transition-all duration-300"
            >
              {/* Glow effect on hover */}
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl`}
              />

              <div
                className={`inline-flex items-center justify-center size-12 rounded-xl bg-gradient-to-br ${feature.gradient} mb-6`}
              >
                <feature.icon className={`size-6 ${feature.iconColor}`} />
              </div>

              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
