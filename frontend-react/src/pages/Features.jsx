import MarketingLayout from "../layouts/marketing";

export default function Features() {
  return (
    <MarketingLayout>
      <div className="grid md:grid-cols-3 gap-6">

        <div className="glass p-6">
          <h3 className="font-bold mb-2">AI Engine</h3>
          <p className="text-muted">
            Context-aware reasoning system.
          </p>
        </div>

        <div className="glass p-6">
          <h3 className="font-bold mb-2">Automation</h3>
          <p className="text-muted">
            Workflow execution layer.
          </p>
        </div>

        <div className="glass p-6">
          <h3 className="font-bold mb-2">Memory</h3>
          <p className="text-muted">
            Persistent intelligence layer.
          </p>
        </div>

      </div>
    </MarketingLayout>
  );
}
