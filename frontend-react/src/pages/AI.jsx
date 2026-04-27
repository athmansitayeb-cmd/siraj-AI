import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function AI() {
  return (
    <>
      <Helmet>
        <title>AI Assistant Platform - SIRAJ</title>
        <meta name="description" content="SIRAJ is an advanced AI assistant platform for intelligent automation and decision support." />
      </Helmet>

      <h1>AI Assistant Platform</h1>

      <h2>What is SIRAJ?</h2>
      <p>SIRAJ is an advanced AI assistant designed to guide users, automate workflows, and provide intelligent insights.</p>

      <h2>Features</h2>
      <ul>
        <li>Conversational AI</li>
        <li>Automation</li>
        <li>Decision support</li>
      </ul>

      <h2>Explore</h2>
      <Link to="/pricing">Pricing</Link> |{" "}
      <Link to="/docs">Docs</Link>
    </>
  );
}
