import { motion } from "motion/react";

export default function LoginForm() {
  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="
        w-full
        max-w-md
        rounded-3xl
        border
        border-white/10
        bg-white/5
        backdrop-blur-xl
        p-8
      "
    >
      <h1 className="text-3xl font-bold text-white mb-2">
        Welcome Back
      </h1>

      <p className="text-gray-400 mb-6">
        Login to your workspace
      </p>

      <form className="space-y-4">

        <input
          type="email"
          placeholder="Email"
          className="
            w-full
            p-3
            rounded-xl
            bg-black/30
            border
            border-white/10
            text-white
          "
        />

        <input
          type="password"
          placeholder="Password"
          className="
            w-full
            p-3
            rounded-xl
            bg-black/30
            border
            border-white/10
            text-white
          "
        />

        <button
          className="
            w-full
            p-3
            rounded-xl
            bg-blue-600
            text-white
            hover:bg-blue-700
            transition
          "
        >
          Login
        </button>

      </form>
    </motion.div>
  );
}