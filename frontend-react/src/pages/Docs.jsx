import {
  Key,
  Code2,
  Webhook,
  BookOpen
} from "lucide-react";

import MarketingLayout from "../layouts/marketing";

export default function Docs() {
  const sections = [
    {
      icon: Key,
      title: "Authentication",
      description:
        "Secure access to SIRAJ APIs using authentication tokens and workspace permissions."
    },
    {
      icon: Code2,
      title: "API Reference",
      description:
        "Integrate AI agents, workflows, memory, and execution capabilities into your applications."
    },
    {
      icon: Webhook,
      title: "Automation & Webhooks",
      description:
        "Trigger workflows and connect external services through real-time events."
    },
    {
      icon: BookOpen,
      title: "Getting Started",
      description:
        "Learn how to create workspaces, build agents, and deploy automated workflows."
    }
  ];

  return (
    <MarketingLayout>

      <section className="text-center max-w-4xl mx-auto mb-20">

        <h1 className="text-6xl font-black mb-6">
          Developer Documentation
        </h1>

        <p className="text-xl text-muted">
          Everything you need to build on top of the SIRAJ AI Agent Platform.
        </p>

      </section>

      <section className="grid md:grid-cols-2 gap-6">

        {sections.map((item) => {
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

      <section className="glass p-10 mt-12 text-center">

        <h2 className="text-3xl font-bold mb-4">
          Start Building
        </h2>

        <p className="text-muted">
          Build AI agents, automate workflows, and integrate SIRAJ
          into your products using our APIs and developer tools.
        </p>

      </section>

    </MarketingLayout>
  );
}
