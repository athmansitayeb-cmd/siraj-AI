import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import api from "../services/api";
import toast from "react-hot-toast";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import handleApiError from "../utils/handleApiError";

export default function ResetPassword() {
  const { token } = useParams();
  const [params] = useSearchParams();
  const email = params.get("email");

  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      await api.post("/auth/reset-password", {
        token,
        email,
        newPassword: data.password,
      });

      toast.success("Password updated");
      navigate("/login");
    } catch (err) {
      toast.error(handleApiError(err, "Password update failed"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07111F] text-white p-6">
      <motion.div
        className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <h1 className="text-3xl font-bold text-center mb-6">
          Reset Password
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <input
            type="password"
            placeholder="New Password"
            {...register("password", { required: true, minLength: 6 })}
            className="w-full p-4 rounded-xl bg-[#07111F]/40 border border-white/10 focus:border-yellow-400 outline-none"
          />

          {errors.password && (
            <p className="text-red-400 text-xs">
              Password must be at least 6 characters
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-yellow-400 text-black font-bold"
          >
            Update Password
          </button>
        </form>
      </motion.div>
    </div>
  );
}
