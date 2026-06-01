import { useState, useEffect } from "react";
import { Sparkles, BrainCircuit, Check, Rocket, Shield } from "lucide-react";
import { trackEvent } from "../analytics";

import {
  Section,
  Card,
  PrimaryButton,
} from "../components/ui/primitives";

import { heading, text } from "../design/typography";

export default function Upgrade() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    trackEvent("view_upgrade");
  }, []);

  const upgrade = async (plan) => {
    try {
      setLoading(true);

      trackEvent("start_checkout", {
        plan,
        currency: "USD",
        value: plan === "pro_yearly" ? 40 : 5,
      });

      const token = localStorage.getItem("siraj_token");

      const res = await fetch(
        "https://siraj.software/api/paypal/subscription/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({ plan }),
        }
      );

      const data = await res.json();

      if (data?.approveLink) {
        window.location.href = data.approveLink;
      }
    } catch (err) {
      console.error("Upgrade error:", err);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    "Persistent memory system",
    "Adaptive guidance",
    "Long-term continuity",
    "Priority runtime access",
    "Advanced orchestration",
    "Deeper reasoning",
  ];

  return (
    <Section>
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 mb-6">
          <Sparkles size={16} className="text-blue-500" />
          <span className={text.small}>SIRAJ PRO</span>
        </div>

        <h1 className={heading.section}>Upgrade to PRO</h1>

        <p className={`${text.body} mt-6`}>
          Persistent intelligence, memory and adaptive reasoning across workflows.
        </p>
      </div>

      {/* GRID */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* FEATURES */}
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <BrainCircuit className="text-blue-500" />
            <h2 className="text-xl font-semibold">Capabilities</h2>
          </div>

          <div className="space-y-4">
            {features.map((f) => (
              <div key={f} className="flex gap-3">
                <Check className="text-green-500" size={18} />
                <span className={text.muted}>{f}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* ACTION */}
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Rocket className="text-blue-500" />
            <h2 className="text-xl font-semibold">Plans</h2>
          </div>

          <div className="space-y-4">
            <PrimaryButton
              disabled={loading}
              onClick={() => upgrade("pro_monthly")}
              className="w-full"
            >
              Monthly $5
            </PrimaryButton>

            <PrimaryButton
              disabled={loading}
              onClick={() => upgrade("pro_yearly")}
              className="w-full opacity-90"
            >
              Yearly $40
            </PrimaryButton>
          </div>

          <div className="mt-6 flex gap-2 items-center text-sm text-slate-500">
            <Shield size={16} />
            Secure PayPal subscription
          </div>
        </Card>
      </div>
    </Section>
  );
}
