import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  Sparkles,
  ArrowRight,
  BrainCircuit,
  Workflow,
  Blocks,
  ShieldCheck,
  Cpu,
  Globe,
} from "lucide-react";

import {
  Card,
  PrimaryButton,
} from "../components/ui/primitives";

import { containers } from "../design/tokens";
import { heading, text } from "../design/typography";

export default function LandingPage() {
  const { isAuthenticated = false } = useAuth() || {};
  const navigate = useNavigate();

  const features = [
    {
      icon: BrainCircuit,
      title: "Reasoning Engine",
      desc: "Multi-layer cognitive orchestration designed for autonomous reasoning and execution.",
    },
    {
      icon: Workflow,
      title: "Agent Runtime",
      desc: "AI agents capable of planning, delegation, execution, and reflection.",
    },
    {
      icon: Blocks,
      title: "Memory Infrastructure",
      desc: "Persistent memory enabling continuity and long-term intelligence.",
    },
    {
      icon: ShieldCheck,
      title: "Runtime Governance",
      desc: "Built-in safeguards, permissions, and execution control layers.",
    },
  ];

  return (
    <div className="relative overflow-hidden">

      {/* BACKGROUND */}
<div className="absolute top-0 left-0 w-[700px] h-[700px] bg-blue-400/10 blur-[120px] rounded-full pointer-events-none" />

<div className="absolute right-0 top-[10%] w-[600px] h-[600px] bg-cyan-300/10 blur-[120px] rounded-full pointer-events-none" />

      {/* HERO */}
      <div className={containers.page}>

        <div className="max-w-5xl mx-auto text-center">

          {/* BADGE */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full">
              <Sparkles size={14} />
              <span className="text-sm text-muted">
                Autonomous AI Infrastructure
              </span>
            </div>
          </motion.div>

          {/* TITLE */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`${heading.hero} mt-8`}
          >
            Build AI systems
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-400 bg-clip-text text-transparent">
              that reason, execute, evolve
            </span>
          </motion.h1>

          {/* SUBTITLE */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${text.body} max-w-3xl mx-auto mt-6`}
          >
            SIRAJ is an autonomous AI runtime for orchestrating agents,
            memory systems, and scalable intelligent workflows.
          </motion.p>

{/* CTA */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.3 }}
  className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
>

  <button
    onClick={() => {
       navigate(isAuthenticated ? "/dashboard" : "/login");
     }}
    className="
      px-6 py-3 rounded-2xl
      bg-gradient-to-r from-blue-600 to-cyan-500
      text-white font-semibold
      shadow-[0_10px_30px_rgba(37,99,235,0.25)]
      hover:scale-[1.02]
      active:scale-[0.98]
      transition-all duration-300
      cursor-pointer
    "
  >
    Launch Workspace
  </button>

  <button
    onClick={() => window.location.href = "/platform"}
    className="
      px-6 py-3 rounded-xl
      border border-slate-200/20
      text-sm text-white
      hover:bg-white/10
      transition
      cursor-pointer
    "
  >
    Explore Platform
  </button>

</motion.div>

          {/* TRUST LINE */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-14 flex flex-wrap justify-center gap-8 text-sm text-muted"
          >
            <div className="flex items-center gap-2">
              <Cpu size={16} />
              Multi-Agent Runtime
            </div>

            <div className="flex items-center gap-2">
              <Globe size={16} />
              Scalable Infrastructure
            </div>

            <div className="flex items-center gap-2">
              <Sparkles size={16} />
              Persistent Intelligence
            </div>
          </motion.div>

        </div>
      </div>

      {/* FEATURES */}
      <div className={containers.page}>

        <div className="max-w-3xl">
          <div className="text-sm text-muted tracking-[0.2em]">
            CORE CAPABILITIES
          </div>

          <h2 className={`${heading.section} mt-4`}>
            Infrastructure for autonomous intelligence
          </h2>

          <p className={`${text.body} mt-6`}>
            SIRAJ unifies runtime orchestration, reasoning, memory systems,
            and execution pipelines into one AI platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-14">
          {features.map((f, i) => {
            const Icon = f.icon;

            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="p-8 h-full">

                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white">
                    <Icon size={22} />
                  </div>

                  <h3 className="text-xl font-semibold mt-6">
                    {f.title}
                  </h3>

                  <p className={`${text.body} mt-3`}>
                    {f.desc}
                  </p>

                </Card>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
