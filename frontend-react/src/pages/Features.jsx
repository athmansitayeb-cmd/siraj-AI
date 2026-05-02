import { Helmet } from "react-helmet-async";

export default function Features() {
  return (
    <>
      <Helmet>
        <title>SIRAJ AI Features – AI Agents & Automation Tools</title>
        <meta
          name="description"
          content="Explore SIRAJ AI features including AI agents, automation engine, analytics dashboard, and API integrations."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://siraj.software/features" />
      </Helmet>

      <main className="p-10 text-white max-w-3xl">
        <h1>Features of SIRAJ AI</h1>

        <p>
          SIRAJ provides a set of intelligent tools designed to enhance productivity
          and automate complex workflows.
        </p>

        <h2>Core Features</h2>
        <ul>
          <li><strong>AI Chat Assistant:</strong> Smart conversational system</li>
          <li><strong>Automation Engine:</strong> Execute tasks automatically</li>
          <li><strong>Analytics Dashboard:</strong> Monitor usage and insights</li>
        </ul>

        <h2>Built for Developers</h2>
        <p>
          SIRAJ is designed to integrate easily with APIs and modern web applications.
        </p>
      </main>
    </>
  );
}
