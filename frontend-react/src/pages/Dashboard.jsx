import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import {
  Cpu,
  Brain,
  ArrowRight,
  Sparkles,
  Activity,
  Layers3,
  ShieldCheck,
  Workflow,
} from "lucide-react";

export default function Dashboard() {

const stats = [
  {
    title: "AI Agents",
    value: "Ready",
    icon: Brain,
    desc: "Create and deploy intelligent agents."
  },
  {
    title: "Memory",
    value: "Active",
    icon: Layers3,
    desc: "Persistent context across sessions."
  },
  {
    title: "Workspaces",
    value: "Online",
    icon: Workflow,
    desc: "Dedicated environments for every agent."
  }
];

const modules = [
  {
    title: "Agent Builder",
    icon: Brain,
    desc: "Create and configure AI agents."
  },
  {
    title: "Workspaces",
    icon: Workflow,
    desc: "Organize tasks and agent activities."
  },
  {
    title: "Security",
    icon: ShieldCheck,
    desc: "Manage authentication and permissions."
  }
];

  return (
    <div className="relative min-h-screen px-6 py-12 max-w-7xl mx-auto">

      {/* BACKGROUND */}
      <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#2563eb10_1px,transparent_1px),linear-gradient(to_bottom,#2563eb10_1px,transparent_1px)] bg-[size:42px_42px]" />

      <div className="absolute top-[-250px] left-[-200px] w-[500px] h-[500px] rounded-full blur-[140px] opacity-20 bg-blue-500" />

      <div className="absolute bottom-[-250px] right-[-200px] w-[500px] h-[500px] rounded-full blur-[140px] opacity-10 bg-cyan-400" />

      <div className="relative z-10">

        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col xl:flex-row items-start justify-between gap-10 mb-12"
        >
          {/* LEFT */}
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 mb-6">
              <Sparkles size={15} className="text-[var(--primary)]" />
              <span className="text-sm text-muted">
                AI Agent Platform
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[1.05] mb-6">
              Manage Your
              <br />
              AI Agents
            </h1>

            <p className="text-lg text-muted leading-relaxed max-w-2xl">
              Create, manage, and run AI agents that automate tasks,
              execute workflows, and help you get work done.
            </p>
          </div>

          {/* RIGHT STATUS */}
          <div className="glass p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xs tracking-[0.25em] text-faint mb-2">
                  PLATFORM STATUS
                </div>
                <h3 className="text-2xl font-bold">Ready</h3>
              </div>

              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-50 text-[var(--primary)]">
                <Cpu size={24} />
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">AI Agents</span>
                <span className="text-green-600 font-medium">Online</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted">Memory</span>
                <span className="text-green-600 font-medium">Synced</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted">Workspaces</span>
                <span className="text-green-600 font-medium">Stable</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* STATS */}
        <div className="grid md:grid-cols-3 gap-5 mb-12">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-50 text-[var(--primary)]">
                    <Icon size={22} />
                  </div>

                  <div className="text-xs tracking-[0.2em] text-faint">
                    ACTIVE
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-2">
                  {item.title}
                </h3>

                <div className="text-3xl font-black mb-3">
                  {item.value}
                </div>

                <p className="text-sm text-muted leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* MODULES */}
        <div className="glass p-8 mb-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-xs tracking-[0.25em] text-faint mb-2">
                PLATFORM TOOLS
              </div>
              <h2 className="text-3xl font-bold">
               Build and Manage Agents
              </h2>
            </div>

            <Link to="/intent" className="btn-primary">
              Launch Workspace
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {modules.map((m) => {
              const Icon = m.icon;

              return (
                <div
                  key={m.title}
                  className="card p-6 hover:translate-y-[-3px] transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-50 text-[var(--primary)] mb-5">
                    <Icon size={22} />
                  </div>

                  <h3 className="text-lg font-semibold mb-3">
                    {m.title}
                  </h3>

                  <p className="text-sm text-muted leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="grid md:grid-cols-2 gap-5">
          <Link
            to="/chat"
            className="glass p-7 hover:translate-y-[-3px] transition-all group"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[var(--primary)] flex items-center justify-center">
                <Brain size={24} />
              </div>

              <ArrowRight
                size={20}
                className="text-muted transition-transform group-hover:translate-x-1"
              />
            </div>

            <h3 className="text-2xl font-bold mb-3">
              Open Workspace
            </h3>

            <p className="text-muted leading-relaxed">
              Continue working with your AI agents and active workflows.
            </p>
          </Link>

          <Link
            to="/upgrade"
            className="glass p-7 hover:translate-y-[-3px] transition-all group"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[var(--primary)] flex items-center justify-center">
                <Sparkles size={24} />
              </div>

              <ArrowRight
                size={20}
                className="text-muted transition-transform group-hover:translate-x-1"
              />
            </div>

            <h3 className="text-2xl font-bold mb-3">
              Upgrade Plan
            </h3>

            <p className="text-muted leading-relaxed">
              Unlock more agents, larger memory, advanced automation and premium features.
            </p>
          </Link>
        </div>

      </div>
    </div>
  );
}
