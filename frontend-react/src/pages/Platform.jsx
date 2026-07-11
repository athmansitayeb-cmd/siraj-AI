import {
 BrainCircuit,
 Workflow,
 Database,
 Rocket
} from "lucide-react";

export default function Platform() {
 const components = [
 {
 icon: BrainCircuit,
 title: "AI Agents",
 description:
 "Create intelligent agents that understand goals and execute tasks."
 },
 {
 icon: Workflow,
 title: "Workflow Engine",
 description:
 "Automate multi-step processes and repetitive work."
 },
 {
 icon: Database,
 title: "Persistent Memory",
 description:
 "Store context, history, and workspace knowledge across sessions."
 },
 {
 icon: Rocket,
 title: "Execution Runtime",
 description:
 "Run and monitor AI agents in real time."
 }
 ];

 return (
 <>

 <section className="text-center max-w-4xl mx-auto mb-20">

 <h1 className="text-6xl font-black mb-6">
 SIRAJ Platform
 </h1>

 <p className="text-xl text-muted">
 A complete platform for building, deploying, and managing AI agents
 that automate tasks and execute workflows.
 </p>

 </section>

 <section className="grid md:grid-cols-2 gap-6">

 {components.map((item) => {
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
