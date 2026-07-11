import {
 BrainCircuit,
 Workflow,
 Database,
 Rocket
} from "lucide-react";

export default function About() {
 const pillars = [
 {
 icon: BrainCircuit,
 title: "AI Agents",
 description:
 "Build intelligent agents that understand goals, make decisions, and execute tasks."
 },
 {
 icon: Workflow,
 title: "Workflow Automation",
 description:
 "Transform repetitive processes into structured AI-powered workflows."
 },
 {
 icon: Database,
 title: "Memory Systems",
 description:
 "Enable agents to retain context, workspace knowledge, and task history."
 },
 {
 icon: Rocket,
 title: "Execution Runtime",
 description:
 "Run AI agents in real time with continuous task execution and monitoring."
 }
 ];

 return (
 <>

 {/* HERO */}

 <section className="max-w-4xl mx-auto text-center mb-20">

 <h1 className="text-6xl font-black mb-6">
 About SIRAJ
 </h1>

 <p className="text-xl text-muted">
 SIRAJ is an AI Agent Platform designed to help users build,
 deploy, and manage intelligent agents that automate tasks
 and execute workflows.
 </p>

 </section>

 {/* MISSION */}

 <section className="glass p-10 mb-16">

 <h2 className="text-3xl font-bold mb-4">
 Our Mission
 </h2>

 <p className="text-muted leading-relaxed">
 We believe AI should move beyond conversation and become capable
 of execution. SIRAJ is built to transform goals into actions
 through intelligent agents, memory systems, and workflow automation.
 </p>

 </section>

 {/* PILLARS */}

 <section className="grid md:grid-cols-2 gap-6">

 {pillars.map((item) => {
 const Icon = item.icon;

 return (
 <div
 key={item.title}
 className="glass p-8"
 >
 <Icon size={28} className="mb-4 text-blue-400" />

 <h3 className="font-bold text-xl mb-2">
 {item.title}
 </h3>

 <p className="text-muted">
 {item.description}
 </p>
 </div>
 );
 })}

 </section>

 </>
 );
}
