import {
 BrainCircuit,
 Workflow,
 Database,
 Rocket,
 Network,
 Wrench
} from "lucide-react";

export default function Features() {
 const features = [
 {
 icon: BrainCircuit,
 title: "AI Agents",
 description:
 "Build intelligent agents that understand goals, reason through tasks, and take action."
 },
 {
 icon: Workflow,
 title: "Workflow Automation",
 description:
 "Create automated workflows that execute multi-step processes with minimal human input."
 },
 {
 icon: Database,
 title: "Persistent Memory",
 description:
 "Store context, workspace knowledge, and task history across sessions."
 },
 {
 icon: Wrench,
 title: "Tool Integration",
 description:
 "Connect agents to APIs, services, and external tools to perform real-world actions."
 },
 {
 icon: Network,
 title: "Agent Orchestration",
 description:
 "Coordinate multiple agents working together on complex workflows."
 },
 {
 icon: Rocket,
 title: "Real-Time Execution",
 description:
 "Execute tasks, monitor progress, and manage workflows instantly."
 }
 ];

 return (
 <>

 <section className="text-center max-w-4xl mx-auto mb-20">

 <h1 className="text-6xl font-black mb-6">
 SIRAJ Features
 </h1>

 <p className="text-xl text-muted">
 Everything you need to build, deploy, and manage AI agents
 that automate real work.
 </p>

 </section>

 <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

 {features.map((item) => {
 const Icon = item.icon;

 return (
 <div
 key={item.title}
 className="glass p-8"
 >
 <Icon
 size={28}
 className="mb-4 text-blue-400"
 />

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
