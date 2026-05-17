import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import api from "../services/api";
import toast from "react-hot-toast";
import handleApiError from "../utils/handleApiError";

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async data => {
    try {
      await api.post("/auth/forgot-password", data);

      toast.success("Reset link sent to email");
    } catch (err) {
      handleApiError(err, "Failed to send reset link");
    }
  };

  return (
    <>
  
      <div className="flex justify-center items-center py-20">
        <motion.div
          className="bg-[#07111F] p-10 rounded-3xl shadow-2xl w-full max-w-md border border-yellow-400"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-extrabold text-yellow-400 mb-6 text-center">
            Forgot Password
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <input
              type="email"
              placeholder="Email"
              {...register("email", { required: true })}
              className="w-full p-3 rounded-xl border border-yellow-400 bg-[#07111F] text-yellow-400"
            />
            {errors.email && <p className="text-red-500 text-sm">Email is required</p>}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-yellow-400 text-black font-bold hover:scale-105"
            >
              Send Reset Link
            </button>
          </form>
        </motion.div>
      </div>
    </>
  );
}
