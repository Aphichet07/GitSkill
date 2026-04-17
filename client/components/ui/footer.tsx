function Footer() {
  return (
    <footer className="w-full bg-[#09090B] pt-24 pb-10 px-6 lg:px-20 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <h2 className="text-white text-2xl font-bold mb-4 tracking-tight">
              Git<span className="text-indigo-500">Skill.</span>
            </h2>
            <p className="text-slate-400 max-w-sm leading-relaxed mb-6">
              Turn your GitHub commits into a professional profile that
              recruiters love. Stand out 10x faster with zero manual setup.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                X
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                in
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                GH
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold tracking-wide mb-5">
              Product
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  How it Works
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  Changelog
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold tracking-wide mb-5">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} CodeNative Inc. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <span className="text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              All systems operational
            </span>
          </div>
        </div>

        <div className="mt-16 w-full flex justify-center items-end select-none pointer-events-none">
          <h1 className="font-black text-[28vw] md:text-[20vw] leading-none tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-white/10 to-[#09090B]">
            GITSKILL
          </h1>
        </div>
      </div>
    </footer>
  );
}

export default Footer;