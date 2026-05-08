import React from "react";

const Testimonials = ({ testimonials }) => {
  return (
    <section className="fixed inset-0 flex flex-col items-end md:items-center justify-center px-10 md:px-6 scene-testimonials pointer-events-none opacity-0 z-30 overflow-hidden bg-black">
      
      <div className="max-w-7xl w-full mx-auto flex flex-col items-end md:items-center gap-12 md:gap-20">
        
        {/* Slanted Header (Above Panels) */}
        <div className="testimonials-header text-right md:text-center w-full">
          <h2 className="font-black tracking-[0.4em] uppercase flex flex-col items-end md:items-center gap-2 md:gap-3">
            <span className="text-xl md:text-4xl text-white inline-block skew-x-[-3deg]">
              TESTIMONIALS
            </span>
          </h2>
        </div>

        {/* Square Panels Row */}
        <div className="relative z-10 w-full px-4 testimonial-container">
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-8">
            {testimonials.map((testimonial, idx) => (
              <div 
                key={testimonial.id}
                className={`testimonial-panel-${idx + 1} aspect-square w-full max-w-[350px] md:max-w-[320px] bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-sm p-8 md:p-10 flex flex-col justify-center pointer-events-auto hover:bg-white/[0.05] transition-all duration-700 group shrink-0`}
              >
                {/* Content Only */}
                <p className="text-white/50 text-sm md:text-base font-light tracking-wide leading-relaxed group-hover:text-white/70 transition-colors duration-500 text-center italic">
                  "{testimonial.content}"
                </p>

                {/* Bottom: Stats (Optional but user said remove user info, keeping stats for 'game' feel if appropriate, or removing if they meant all meta) */}
                <div className="mt-8 pt-4 border-t border-white/5 text-center">
                  <span className="text-white/40 font-mono text-[11px] tracking-widest uppercase">
                    {testimonial.stats}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </section>
  );
};

export default React.memo(Testimonials);
