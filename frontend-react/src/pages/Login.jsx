import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import handleApiError from "../utils/handleApiError";
import { trackEvent } from "../analytics";

export default function Login() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const res = await api.post("/auth/login", data);
      localStorage.setItem("siraj_token", res.data.token);
      trackEvent("login", {
        method: "email"
      });

      toast.success("Welcome back");
      navigate("/dashboard", { replace: true });

    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

      <div className="min-h-screen flex bg-[#07111F] text-white relative overflow-hidden">

        {/* LEFT */}
        <div className="hidden md:flex flex-col justify-center w-1/2 px-16 relative">

          <div className="absolute w-[600px] h-[600px] bg-yellow-400/10 blur-[160px] rounded-full top-[-200px] left-[-200px] animate-pulse" />
          <div className="absolute w-[500px] h-[500px] bg-blue-500/10 blur-[160px] rounded-full bottom-[-200px] right-[-200px] animate-pulse" />

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-extrabold leading-tight tracking-tight"
          >
            SIRAJ
          </motion.h1>

          <p className="mt-6 text-lg text-gray-400 max-w-md">
            Intelligence that guides you when you're lost.
            <br />
            <span className="text-yellow-400">Not answers — direction.</span>
          </p>

        </div>

        {/* RIGHT */}
        <div className="flex flex-1 items-center justify-center p-6">

          <motion.div
            className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 shadow-2xl relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >

            <div className="absolute inset-0 rounded-3xl border border-yellow-400/20 pointer-events-none" />

            <h2 className="text-3xl font-bold text-center mb-6">
              Welcome Back
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              <input
                type="email"
                placeholder="Email"
                {...register("email", { required: true })}
                className="w-full p-4 rounded-xl bg-[#07111F]/40 border border-white/10 focus:border-yellow-400 outline-none"
              />
              {errors.email && <p className="text-red-400 text-xs">Required</p>}

              <div className="relative">

                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Password"
                  {...register("password", { required: true })}
                  className="w-full p-4 rounded-xl bg-[#07111F]/40 border border-white/10 focus:border-yellow-400 outline-none pr-12"
                />

                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-400"
                >
                  {showPass ? "🙈" : "👁️"}
                </button>

              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-yellow-400 text-black font-bold disabled:opacity-50"
              >
                {loading ? "Loading..." : "Sign In"}
              </button>

            </form>

            <div className="mt-5 text-center text-sm text-gray-400">
              <Link to="/forgot-password" className="hover:text-yellow-400">
                Forgot password?
              </Link>
            </div>

            <div className="mt-2 text-center text-sm text-gray-400">
              New here?{" "}
              <Link to="/register" className="text-yellow-400 hover:underline">
                Create account
              </Link>
            </div>

          </motion.div>
        </div>
      </div>
    </>
  );
}
