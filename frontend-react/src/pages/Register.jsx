import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import handleApiError from "../utils/handleApiError";

export default function Register() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await api.post("/auth/register", data);
      trackEvent("signup");

      toast.success("Account created");
      navigate("/login");
    } catch (err) {
      toast.error(handleApiError(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex bg-black text-white relative overflow-hidden">

        {/* LEFT SIDE (branding) */}
        <div className="hidden md:flex flex-col justify-center w-1/2 px-16 relative">

          <div className="absolute w-[600px] h-[600px] bg-yellow-400/10 blur-[160px] rounded-full top-[-200px] left-[-200px] animate-pulse" />
          <div className="absolute w-[500px] h-[500px] bg-purple-500/10 blur-[160px] rounded-full bottom-[-200px] right-[-200px] animate-pulse" />

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-extrabold leading-tight tracking-tight"
          >
            Join SIRAJ
          </motion.h1>

          <p className="mt-6 text-lg text-gray-400 max-w-md leading-relaxed">
            Not just registration.  
            <br />
            <span className="text-yellow-400">
              It’s the start of clarity.
            </span>
          </p>

          <div className="mt-10 space-y-3 text-sm text-gray-500">
            <p>⚡ AI that understands your state</p>
            <p>🧠 Context-aware guidance system</p>
            <p>🎯 Focused execution mindset</p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-1 items-center justify-center p-6">

          <motion.div
            className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 shadow-2xl relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >

            <div className="absolute inset-0 rounded-3xl border border-yellow-400/20 pointer-events-none" />

            <h2 className="text-3xl font-bold mb-2 text-center">
              Create Account
            </h2>

            <p className="text-center text-gray-400 text-sm mb-6">
              Start your journey with SIRAJ
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* NAME */}
              <input
                type="text"
                placeholder="Full Name"
                {...register("name", { required: true })}
                className="w-full p-4 rounded-xl bg-black/40 border border-white/10 focus:border-yellow-400 outline-none transition"
              />
              {errors.name && <p className="text-red-400 text-xs">Required</p>}

              {/* EMAIL */}
              <input
                type="email"
                placeholder="Email"
                {...register("email", { required: true })}
                className="w-full p-4 rounded-xl bg-black/40 border border-white/10 focus:border-yellow-400 outline-none transition"
              />
              {errors.email && <p className="text-red-400 text-xs">Required</p>}

              {/* PASSWORD */}
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Password"
                  {...register("password", { required: true, minLength: 6 })}
                  className="w-full p-4 rounded-xl bg-black/40 border border-white/10 focus:border-yellow-400 outline-none transition pr-12"
                />

                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-400"
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>

              {errors.password && (
                <p className="text-red-400 text-xs">Min 6 chars</p>
              )}

              {/* BUTTON */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold bg-yellow-400 text-black shadow-lg shadow-yellow-400/20 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Account"}
              </motion.button>

            </form>

            <div className="my-6 flex items-center gap-2 text-gray-500 text-xs">
              <div className="flex-1 h-px bg-white/10" />
              or
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <button className="w-full py-3 rounded-xl border border-white/10 hover:border-yellow-400 transition text-sm">
              Continue with Google (soon)
            </button>

            <p className="mt-5 text-center text-gray-400 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-yellow-400 hover:underline">
                Sign in
              </Link>
            </p>

          </motion.div>
        </div>
      </div>
  );
}
