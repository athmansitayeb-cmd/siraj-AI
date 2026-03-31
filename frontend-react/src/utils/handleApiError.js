export default function handleApiError(err) {
  if (!err) return "Unknown error";

  if (err.response) {
    return (
      err.response.data?.msg ||
      err.response.data?.message ||
      err.response.data?.error ||
      "Server error"
    );
  }

  if (err.request) {
    return "Network error";
  }

  return err.message || "Unexpected error";
}
