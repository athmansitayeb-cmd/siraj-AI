import { Check } from "lucide-react";
import MarketingLayout from "../layouts/marketing";
import { PLANS } from "../config/plans";

export default function Pricing() {
  return (
    <MarketingLayout>
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-5xl font-black mb-4">
          Pricing for Autonomous AI Systems
        </h1>

        <p className="text-muted text-lg">
          One system. Multiple levels of intelligence and execution power.
        </p>
      </div>

      {/* GRID */}
      <div className="grid lg:grid-cols-4 gap-7">

        {Object.values(PLANS).map((plan) => (
          <div
            key={plan.id}
            className={`glass p-8 ${
              plan.popular ? "border border-blue-500/40 relative" : ""
            }`}
          >
            {plan.popular && (
              <div className="absolute top-4 right-4 text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full">
                Popular
              </div>
            )}

            <div className="flex items-center gap-2 mb-6">
              <span className="font-semibold">{plan.title}</span>
            </div>

            <div className="text-4xl font-black mb-6">
              {plan.price === null ? "Custom" : `$${plan.price}`}
            </div>

            <div className="space-y-3 text-sm">
              {plan.features.map((f) => (
                <div key={f} className="flex gap-2 text-muted">
                  <Check size={16} className="mt-1" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        ))}

      </div>
    </MarketingLayout>
  );
}
