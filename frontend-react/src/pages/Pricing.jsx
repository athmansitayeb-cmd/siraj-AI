import { Check, Sparkles, BrainCircuit, Shield, Rocket } from "lucide-react";
import MarketingLayout from "../layouts/marketing";

export default function Pricing() {
  const freeFeatures = [
    "Basic AI chat access",
    "Limited context memory",
    "Standard response system",
    "Single workspace",
    "Community access",
  ];

  const proFeatures = [
    "Persistent memory system",
    "Adaptive reasoning engine",
    "Long-term continuity",
    "Advanced workflows",
    "Priority runtime access",
    "Agent orchestration",
  ];

  const enterpriseFeatures = [
    "Private AI infrastructure",
    "Custom orchestration runtime",
    "Enterprise integrations",
    "Dedicated scaling support",
    "Advanced security layer",
    "Custom deployment",
  ];

  return (
    <MarketingLayout>
      <div className="grid lg:grid-cols-3 gap-7">

        {/* FREE */}
        <div className="glass p-8">
          <div className="flex items-center gap-2 mb-6 text-muted">
            <BrainCircuit size={18} />
            <span className="font-semibold">FREE</span>
          </div>

          <div className="text-4xl font-black mb-6">$0</div>

          <div className="space-y-3">
            {freeFeatures.map((f) => (
              <div key={f} className="flex gap-2 text-sm text-muted">
                <Check size={16} className="text-green-400 mt-1" />
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* PRO */}
        <div className="glass p-8 border border-blue-500/40 relative">

          <div className="absolute top-4 right-4 text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full">
            Popular
          </div>

          <div className="flex items-center gap-2 mb-6 text-blue-400">
            <Rocket size={18} />
            <span className="font-semibold">PRO</span>
          </div>

          <div className="text-5xl font-black">$5</div>
          <div className="text-muted text-sm mb-6">/ month</div>

          <div className="space-y-3">
            {proFeatures.map((f) => (
              <div key={f} className="flex gap-2 text-sm">
                <Check size={16} className="text-blue-400 mt-1" />
                {f}
              </div>
            ))}
          </div>

          <button className="btn-primary w-full mt-6">
            Upgrade
          </button>
        </div>

        {/* ENTERPRISE */}
        <div className="glass p-8">
          <div className="flex items-center gap-2 mb-6 text-muted">
            <Shield size={18} />
            <span className="font-semibold">ENTERPRISE</span>
          </div>

          <div className="text-4xl font-black mb-6">Custom</div>

          <div className="space-y-3">
            {enterpriseFeatures.map((f) => (
              <div key={f} className="flex gap-2 text-sm text-muted">
                <Check size={16} className="text-cyan-400 mt-1" />
                {f}
              </div>
            ))}
          </div>

          <button className="btn-ghost w-full mt-6">
            Contact Sales
          </button>
        </div>

      </div>
    </MarketingLayout>
  );
}
