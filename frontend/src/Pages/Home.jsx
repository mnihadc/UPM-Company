import { useState, useEffect } from "react";
import { motion } from "framer-motion";

function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // 3-second delay

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <motion.div
        className="flex items-center justify-center h-screen bg-black text-white text-4xl font-bold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            UPM
          </motion.div>
          <motion.div
            className="mt-4 border-t-4 border-white border-solid rounded-full w-12 h-12 animate-spin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          ></motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="pt-10">
      <h1>Home</h1>
      <p>This is the home page content.</p>
    </div>
  );
}

export default Home;
