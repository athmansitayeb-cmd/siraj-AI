import { useState, useEffect } from "react";
import { PLANS } from "../config/plans";
import { trackEvent } from "../analytics";

import { Section, Card, PrimaryButton } from "../components/ui/primitives";
import { heading, text } from "../design/typography";
import { Sparkles } from "lucide-react";

export default function Upgrade() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    trackEvent("view_upgrade");
  }, []);

  const upgrade = async (plan) => {
    try {
      setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section>

      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 mb-6">
          <Sparkles size={16} className="text-blue-500" />
          <span className={text.small}>SIRAJ PLANS</span>
        </div>

        <h1 className={heading.section}>Upgrade your system</h1>

        <p className={`${text.body} mt-6`}>
          Same platform. Higher intelligence level.
        </p>
      </div>

      {/* GRID */}
      <div className="grid lg:grid-cols-4 gap-6">

        {Object.values(PLANS).map((plan) => (
          <Card
            key={plan.id}
            className={`p-6 ${
              plan.popular ? "border border-blue-500/40" : ""
            }`}
          >
            <div className="mb-4 font-semibold">
              {plan.title}
            </div>

            <div className="text-3xl font-black mb-4">
              {plan.price === null ? "Custom" : `$${plan.price}`}
            </div>

            <div className="space-y-2 text-sm mb-6 text-muted">
              {plan.features.slice(0, 3).map((f) => (
                <div key={f}>• {f}</div>
              ))}
            </div>

            {plan.id !== "free" && (
              <PrimaryButton
                disabled={loading}
                onClick={() => upgrade(plan.id)}
                className="w-full"
              >
                Select
              </PrimaryButton>
            )}
          </Card>
        ))}

      </div>
    </Section>
  );
}
