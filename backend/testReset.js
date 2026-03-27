import axios from "axios";

const resetLink = "https://siraj.software/reset-password/eyJhbGciOiJIUzI1NiIsInR5cCI6IjY5YmViMzUxOTAwYWUzNDYzYmM2OTU0NSIsImlhdCI6MTc3NDE3MTQ0MywiZXhwIjoxNzc0MTcyMzQzfQ.G8EkvFdJiX1hXQyhkXD4-j_rnq-G5bS9De-qP1Lr_5c";

async function resetPassword() {
  try {
    const token = resetLink.split("/reset-password/")[1];
    const response = await axios.post(`https://siraj.software/api/auth/reset-password/${token}`, {
      password: "NewStrongPassword123!"
    });
    console.log("✅ Success:", response.data);
  } catch (err) {
    console.error("❌ Error:", err.response?.data || err.message);
  }
}

resetPassword();
