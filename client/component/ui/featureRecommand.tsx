"use client";

import { motion, Variants } from "framer-motion";

function FeatureRecommend() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, 
      },
    },
  };

  const cardVariants:  Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 0.8,
      },
    },
  };

  return (
    <section className="relative py-24 px-6 lg:px-20 bg-slate-50 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-6xl mx-auto mb-16 text-center md:text-left"
      >
        <h3 className="text-sm font-bold tracking-widest text-[#3F1A84] uppercase mb-3">
          Why Choose Us
        </h3>
        <h1 className="font-bold text-4xl md:text-5xl text-slate-900 tracking-tight">
          Supercharge Your Profile
        </h1>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }} 
        className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        <motion.div
          variants={cardVariants}
          className="group relative overflow-hidden rounded-3xl bg-[linear-gradient(to_bottom_right,#322854,#3F1A84,#4739C4,#3140B3)] p-10 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-400"
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500"></div>
          <div className="relative z-10 flex flex-col items-start text-left">
            <h2 className="text-white font-bold text-2xl mb-3">Deep Repo Scan</h2>
            <p className="text-indigo-100/80 font-medium leading-relaxed">
              Go beyond simple language stats. Our AI deeply analyzes your
              commits and codebases to extract your true technical expertise.
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          className="group relative overflow-hidden rounded-3xl bg-[linear-gradient(to_bottom_right,#322854,#3F1A84,#4739C4,#3140B3)] p-10 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-400"
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500"></div>
          <div className="relative z-10 flex flex-col items-start text-left">
            <h2 className="text-white font-bold text-2xl mb-3">Visual Skill Mapping</h2>
            <p className="text-indigo-100/80 font-medium leading-relaxed">
              Transform complex GitHub data into stunning, easy-to-read graphs.
              Turn lines of code into a clear visual showcase of your abilities.
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          className="group relative overflow-hidden rounded-3xl bg-[linear-gradient(to_bottom_right,#322854,#3F1A84,#4739C4,#3140B3)] p-10 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-400"
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500"></div>
          <div className="relative z-10 flex flex-col items-start text-left">
            <h2 className="text-white font-bold text-2xl mb-3">HR-Friendly Profiles</h2>
            <p className="text-indigo-100/80 font-medium leading-relaxed">
              Showcase your experience in a format recruiters instantly
              understand. Bridge the gap between developer metrics and HR
              requirements.
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          className="group relative overflow-hidden rounded-3xl bg-[linear-gradient(to_bottom_right,#322854,#3F1A84,#4739C4,#3140B3)] p-10 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-400"
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500"></div>
          <div className="relative z-10 flex flex-col items-start text-left">
            <h2 className="text-white font-bold text-2xl mb-3">One-Link Resume</h2>
            <p className="text-indigo-100/80 font-medium leading-relaxed">
              Generate a sleek, personalized profile link in one click.
              Instantly ready to be attached to your resume, portfolio, or
              LinkedIn.
            </p>
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
}

export default FeatureRecommend;