import {
 BrainCircuit,
 Workflow,
 Rocket,
 Database,
 ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function AI() {
 const features = [
 {
 icon: BrainCircuit,
 title: "AI Agents",
 description:
 "Create intelligent agents that understand goals, make decisions, and execute tasks."
 },
 {
 icon: Workflow,
 title: "Workflow Automation",
 description:
 "Turn complex processes into automated workflows powered by AI."
 },
 {
 icon: Database,
 title: "Persistent Memory",
 description:
 "Agents remember context, history, and workspace knowledge across sessions."
 },
 {
 icon: Rocket,
 title: "Real-Time Execution",
 description:
 "Run tasks, coordinate actions, and manage workflows instantly."
 }
 ];

 return (
 <>

 {/* HERO */}

 <section className="text-center max-w-4xl mx-auto mb-20">

 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)]/10 mb-6 text-sm text-muted">
 AI Agent Platform
 </div>

 <h1 className="text-6xl font-black mb-6">
 Build AI Agents That
 <br />
 Execute Real Work
 </h1>

 <p className="text-xl text-muted max-w-3xl mx-auto">
 SIRAJ helps you create AI agents that automate workflows,
 manage tasks, use memory, and execute actions in real time.
 </p>

 <div className="flex justify-center gap-4 mt-10">

 <Link to="/intent" className="btn-primary">
 Launch Workspace
 </Link>

 <Link to="/pricing" className="btn-ghost">
 View Pricing
 </Link>

 </div>
 </section>

 {/* FEATURES */}

 <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">

 {features.map((item) => {
 const Icon = item.icon;

 return (
 <div
 key={item.title}
 className="glass p-6"
 >
 <Icon size={28} className="mb-4 text-blue-400" />

 <h3 className="font-bold text-lg mb-2">
 {item.title}
 </h3>

 <p className="text-sm text-muted">
 {item.description}
 </p>
 </div>
 );
 })}
 </section>

 {/* CTA */}

 <section className="glass p-10 text-center">

 <h2 className="text-4xl font-black mb-4">
 Start Building with SIRAJ
 </h2>

 <p className="text-muted max-w-2xl mx-auto mb-8">
 Create AI agents, automate workflows,
 and turn ideas into execution.
 </p>

 <Link
 to="/intent"
 className="btn-primary inline-flex items-center gap-2"
 >
 Get Started
 <ArrowRight size={18} />
 </Link>

 </section>

 </>
 );
}
