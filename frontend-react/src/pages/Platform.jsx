import MarketingLayout from "../layouts/marketing";

export default function Platform() {
  return (
    <MarketingLayout>
      <div className="glass p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">
          SIRAJ Platform
        </h1>

        <p className="text-muted text-lg leading-relaxed">
          SIRAJ is a unified runtime for building autonomous AI systems with persistent memory, agent orchestration, and execution workflows.
        </p>
      </div>
    </MarketingLayout>
  );
}
