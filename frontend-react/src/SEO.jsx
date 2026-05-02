import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

export default function SEO() {
  const location = useLocation();
  const url = "https://siraj.software" + location.pathname;

  return (
    <Helmet>
      <link rel="canonical" href={url} />
    </Helmet>
  );
}
