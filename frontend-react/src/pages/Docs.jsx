import { Helmet } from "react-helmet-async";

export default function Docs() {
  return (
<>
  <Helmet>
    <title>Documentation - SIRAJ AI Platform</title>
    <meta name="description" content="Complete documentation for SIRAJ AI assistant, API usage, and automation features." />
  </Helmet>

  <main className="p-10 text-white max-w-3xl">
    <h1>Documentation</h1>

    <p>
      Learn how to integrate and use SIRAJ AI platform for automation,
      AI chat systems, and workflow intelligence.
    </p>

    <h2>Getting Started</h2>
    <ul>
      <li>Authentication</li>
      <li>API usage</li>
      <li>AI chat integration</li>
    </ul>

    <h2>Developer Tools</h2>
    <p>
      SIRAJ provides API access for developers to build intelligent applications.
    </p>
  </main>
</>
  );
}
