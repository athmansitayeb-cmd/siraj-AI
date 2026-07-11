import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import api from "../services/api";
import toast from "react-hot-toast";
import handleApiError from "../utils/handleApiError";

export default function ForgotPassword() {
 const { register, handleSubmit, formState: { errors } } = useForm();

 const onSubmit = async (data) => {
 try {
 await api.post("/auth/forgot-password", data);
 toast.success("Reset link sent to email");
 } catch (err) {
 toast.error(handleApiError(err, "Failed to send reset link"));
 }
 };

 return (
 <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text)] p-6">
 <motion.div
 className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-[var(--border)]/10 rounded-3xl p-10 shadow-2xl"
 initial={{ scale: 0.9, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 >
 <h1 className="text-3xl font-bold text-center mb-6">
 Forgot Password
 </h1>

 <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
 <input
 type="email"
 placeholder="Email"
 {...register("email", { required: true })}
 className="w-full p-4 rounded-xl bg-[var(--bg)]/40 border border-[var(--border)]/10 focus:border-yellow-400 outline-none"
 />

 {errors.email && (
 <p className="text-red-400 text-xs">Email is required</p>
 )}

 <button
 type="submit"
 className="w-full py-3 rounded-xl bg-yellow-400 text-black font-bold"
 >
 Send Reset Link
 </button>
 </form>
 </motion.div>
 </div>
 );
}
