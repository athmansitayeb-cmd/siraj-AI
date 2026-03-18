import MainLayout from "../layout/MainLayout";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import api from "../services/api";

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      await api.post("/auth/forgot-password", data);
      alert("Check your email to reset password!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send reset link");
    }
  };

  return (
    <MainLayout>
      <div className="flex justify-center items-center py-20">
        <motion.div
          className="bg-black p-10 rounded-3xl shadow-2xl w-full max-w-md border border-yellow-400"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-extrabold text-yellow-400 mb-6 text-center">Forgot Password</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <input
              type="email"
              placeholder="Email"
              {...register("email", { required: true })}
              className="w-full p-3 rounded-xl border border-yellow-400 bg-black text-yellow-400 focus:ring-yellow-400"
            />
            {errors.email && <p className="text-red-500 text-sm">Email is required</p>}

            <button type="submit" className="w-full py-3 rounded-xl bg-yellow-400 text-black font-bold hover:brightness-110 transition">
              Send Reset Link
            </button>
          </form>
        </motion.div>
      </div>
    </MainLayout>
  );
}
