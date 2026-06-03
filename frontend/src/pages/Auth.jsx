import SplineComponent from "../components/auth/Spline";
import LoginForm from "../components/auth/LoginForm";
import { motion } from "motion/react";

export default function Auth() {
  return (
    <div className="h-screen bg-black overflow-hidden">
      <div className="grid lg:grid-cols-2 h-full">

        {/* Left */}
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="hidden lg:flex items-center justify-center"
        >
          <SplineComponent />
        </motion.div>

        {/* Right */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="flex items-center justify-center p-6"
        >
          <LoginForm />
        </motion.div>

      </div>
    </div>
  );
}