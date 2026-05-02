import { Helmet } from "react-helmet-async";

export default function About() {
  return (
    <>
      <Helmet>
        <title>About SIRAJ AI – Intelligent Automation Platform</title>
        <meta
          name="description"
          content="Learn about SIRAJ AI, an advanced platform for building AI agents, automating workflows, and improving productivity."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://siraj.software/about" />
      </Helmet>

      <main className="p-10 text-white max-w-3xl">
        <h1>About SIRAJ AI Platform</h1>

        <p>
          SIRAJ is an advanced artificial intelligence platform designed to
          assist users in automation, communication, and intelligent decision-making.
        </p>

        <h2>Our Mission</h2>
        <p>
          To build a smart AI system that helps users interact, learn, and automate
          tasks efficiently using modern machine learning technologies.
        </p>

        <h2>What SIRAJ Does</h2>
        <ul>
          <li>AI-powered conversational assistant</li>
          <li>Workflow automation tools</li>
          <li>Real-time data interaction</li>
        </ul>
      </main>
    </>
  );
}
