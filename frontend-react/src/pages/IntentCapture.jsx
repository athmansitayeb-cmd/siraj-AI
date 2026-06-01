import { useNavigate } from "react-router-dom";
import { trackEvent } from "../analytics";
import { motion } from "framer-motion";

import {
  Bot,
  Briefcase,
  PenSquare,
  Headphones,
  Code2,
  Search,
  TrendingUp,
  Sparkles
} from "lucide-react";

import { UI } from "../ui/registry";

export default function IntentCapture() {
  const navigate = useNavigate();

  const intents = [
    {
      title: "Personal Assistant",
      description:
        "Manage tasks, planning, reminders, and daily productivity.",
      icon: <Bot size={20} />
    },
    {
      title: "Customer Support",
      description:
        "Handle customer inquiries, support tickets, and responses.",
      icon: <Headphones size={20} />
    },
    {
      title: "Content Creation",
      description:
        "Generate articles, marketing content, and creative assets.",
      icon: <PenSquare size={20} />
    },
    {
      title: "Business Automation",
      description:
        "Automate repetitive processes and operational workflows.",
      icon: <Briefcase size={20} />
    },
    {
      title: "Coding Agent",
      description:
        "Build, debug, and manage software development tasks.",
      icon: <Code2 size={20} />
    },
    {
      title: "Research Agent",
      description:
        "Collect information, analyze data, and generate insights.",
      icon: <Search size={20} />
    },
    {
      title: "Sales Assistant",
      description:
        "Support lead generation, outreach, and sales workflows.",
      icon: <TrendingUp size={20} />
    },
    {
      title: "Custom Agent",
      description:
        "Create an agent tailored to your unique goals and workflows.",
      icon: <Sparkles size={20} />
    }
  ];

  const selectIntent = async (intent) => {
    try {
      trackEvent("intent_selected", { intent });

      const res = await fetch("/api/workspace/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer " + localStorage.getItem("siraj_token")
        },
        body: JSON.stringify({ intent })
      });

      const data = await res.json();

      console.log("WORKSPACE RESPONSE:", data);

      const workspaceId = data._id || data.id;

      if (!workspaceId) {
        console.error("No workspace id returned");
        return;
      }

      localStorage.setItem("workspace_id", workspaceId);

      navigate(`/chat/${workspaceId}`);

    } catch (e) {
      console.error("INTENT ERROR:", e);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">

      <div className="w-full max-w-6xl">

        {/* HEADER */}
        <div className="text-center mb-14">

          <UI.Card className="inline-flex items-center gap-2 px-4 py-2 mb-6">

            <div className="w-2 h-2 rounded-full bg-[var(--success)]" />

            <span className="text-sm text-muted">
              Workspace Initialization
            </span>

          </UI.Card>

          <h1 className="text-5xl font-bold tracking-tight mb-5">
            What kind of AI Agent do you want to create?
          </h1>

          <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Select a starting point and SIRAJ will create a workspace
            configured for your AI agent.
          </p>

        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

          {intents.map((item) => (
            <motion.div
              key={item.title}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => selectIntent(item.title)}
              className="cursor-pointer"
            >
              <UI.Card
                className="
                  h-full
                  cursor-pointer
                  transition-all
                  duration-300
                  hover:shadow-medium
                "
              >

                <div
                  className="
                    w-14 h-14 rounded-2xl
                    flex items-center justify-center
                    mb-5
                    bg-[var(--bg-2)]
                    text-[var(--primary)]
                  "
                >
                  {item.icon}
                </div>

                <h2 className="text-xl font-semibold mb-3">
                  {item.title}
                </h2>

                <p className="text-sm text-muted leading-relaxed">
                  {item.description}
                </p>

              </UI.Card>
            </motion.div>
          ))}

        </div>

      </div>

    </div>
  );
}
