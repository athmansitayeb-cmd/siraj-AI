import { Link } from "react-router-dom";

export default function AI() {
  return (
    <>

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
