"use client";
import { useState, useRef, useEffect } from "react";

function TextSlide() {
  const [isVisible, setIsVisible] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    if (textRef.current) {
      observer.observe(textRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen w-full px-20 pt-40 bg-[linear-gradient(to_right,#322854,#3F1A84,#4F45AA,#3140B3)]">
      <div
        ref={textRef}
        className={`max-w-5xl transition-all duration-1000 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
      >
        <h1 className="font-medium text-5xl text-white leading-tight">
          Build a stunning developer portfolio with zero manual setup, or prove
          your skills to recruiters 10x faster with just one link.
        </h1>
      </div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none pointer-events-none flex">
        <div
          className="flex w-max"
          style={{ animation: "scrollLeft 30s linear infinite" }}
        >
          <h1 className="text-[#a287d4] tracking-widest text-[250px] uppercase font-bold whitespace-nowrap pr-16">
            Code-Driven. Friendly. Insightful. Clear.
          </h1>

          <h1 className="text-[#a287d4] tracking-widest text-[250px] uppercase font-bold whitespace-nowrap pr-16">
            Code-Driven. Friendly. Insightful. Clear.
          </h1>
        </div>

        <style>{`
    @keyframes scrollLeft {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); } 
    }
  `}</style>
      </div>
    </div>
  );
}

export default TextSlide;