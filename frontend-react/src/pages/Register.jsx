import MainLayout from "../layout/MainLayout";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import handleApiError from "../utils/handleApiError";

export default function Register() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async data => {
    try {
      await api.post("/auth/register", data);

      toast.success("Account created successfully");

      navigate("/login");
    } catch (err) {
      handleApiError(err, "Registration failed");
    }
  };

  return (
    <MainLayout>
      <div className="flex justify-center items-center py-20">
        <motion.div
          className="bg-black/90 p-10 rounded-3xl shadow-2xl w-full max-w-md border-2 border-yellow-400 backdrop-blur-sm"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-4xl font-extrabold text-yellow-400 mb-6 text-center tracking-wide glitch">
            Register
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <input
              type="text"
              placeholder="Full Name"
              {...register("name", { required: true })}
              className="w-full p-4 rounded-xl border border-yellow-400 bg-black text-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            />
            {errors.name && <p className="text-red-500 text-sm">Name is required</p>}

            <input
              type="email"
              placeholder="Email"
              {...register("email", { required: true })}
              className="w-full p-4 rounded-xl border border-yellow-400 bg-black text-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            />
            {errors.email && <p className="text-red-500 text-sm">Email is required</p>}

            <input
              type="password"
              placeholder="Password"
              {...register("password", { required: true, minLength: 6 })}
              className="w-full p-4 rounded-xl border border-yellow-400 bg-black text-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            />
            {errors.password && <p className="text-red-500 text-sm">Password must be at least 6 chars</p>}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-yellow-400 text-black font-bold hover:scale-105 transition-transform"
            >
              Create Account
            </button>
          </form>

          <p className="mt-5 text-center text-yellow-300">
            Already have an account?{" "}
            <Link to="/login" className="text-yellow-500 font-semibold hover:underline">
              Login
            </Link>
          </p>
        </motion.div>
      </div>
    </MainLayout>
  );
}
