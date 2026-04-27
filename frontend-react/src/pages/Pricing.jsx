import { Helmet } from "react-helmet-async";

export default function Pricing() {
  return (
    <>
      <Helmet>
        <title>Pricing - SIRAJ AI Assistant Platform</title>
        <meta
          name="description"
          content="Flexible pricing plans for SIRAJ AI platform for automation, productivity, and intelligent workflows."
        />
      </Helmet>

      <main className="p-10 text-white max-w-3xl">
        <h1>Pricing Plans</h1>

        <p>
          SIRAJ AI offers scalable pricing plans for individuals, developers, and businesses
          looking to integrate AI automation and intelligent workflows.
        </p>

        <h2>Plans</h2>
        <ul>
          <li>Free Plan - Basic AI assistant features</li>
          <li>Pro Plan - Automation and advanced AI tools</li>
          <li>Enterprise - Full API access and integrations</li>
        </ul>

        <h2>Why Choose SIRAJ?</h2>
        <p>
          Built for productivity, automation, and intelligent decision-making.
        </p>
      </main>
    </>
  );
}
