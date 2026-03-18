import MainLayout from "../layout/MainLayout";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import api from "../services/api";

export default function ForgetPassword() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      await api.post("/auth/forgot-password", data);
      alert("Password reset link sent to your email!");
    } catch (err) {
      alert(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <MainLayout>
      <div className="relative z-10 flex justify-center items-center py-20">
        <motion.div
          className="bg-black/90 p-10 rounded-3xl shadow-2xl w-full max-w-md border-2 border-yellow-400 backdrop-blur-sm"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-4xl font-extrabold text-yellow-400 mb-6 text-center tracking-wide glitch">
            Reset Password
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <input
              type="email"
              placeholder="Email"
              {...register("email", { required: true })}
              className="w-full p-4 rounded-xl border border-yellow-400 bg-black text-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            />
            {errors.email && <p className="text-red-500 text-sm">Email is required</p>}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-yellow-400 text-black font-bold hover:brightness-110 transition-transform transform hover:scale-105"
            >
              Send Reset Link
            </button>
          </form>
        </motion.div>
      </div>
    </MainLayout>
  );
}
