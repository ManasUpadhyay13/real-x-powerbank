"use client";

import { motion } from "framer-motion";

export default function ProductDetails() {
  return (
    <section className="relative z-10 bg-[#050505] pt-24 pb-48 text-white">
      <div className="mx-auto max-w-[1400px] px-6">
        
        {/* Header */}
        <div className="mb-32">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold tracking-tight text-white/90"
          >
            Technical<br/>Specifications
          </motion.h2>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10">
           <SpecItem label="Battery Capacity" value="20,000mAh" delay={0.1} />
           <SpecItem label="Max Output" value="140W PD 3.1" delay={0.2} />
           <SpecItem label="Ports" value="2x USB-C, 1x USB-A" delay={0.3} />
           <SpecItem label="Weight" value="320g" delay={0.4} />
           <SpecItem label="Recharge Time" value="45 Minutes" delay={0.5} />
           <SpecItem label="Cycles" value="1000+" delay={0.6} />
           <SpecItem label="Material" value="Aerospace Aluminum" delay={0.7} />
           <SpecItem label="Warranty" value="2 Years" delay={0.8} />
        </div>

        {/* Feature Highlights */}
        <div className="mt-48 grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard 
                title="Smart Temp Control"
                description="Active thermal monitoring ensures optimal performance and safety during high-wattage charging."
                delay={0.2}
            />
             <FeatureCard 
                title="Airline Safe"
                description="Under the 100Wh limit, making it the perfect travel companion for flights worldwide."
                delay={0.4}
            />
             <FeatureCard 
                title="Passthrough Charging"
                description="Charge the powerbank while simultaneously powering your devices."
                delay={0.6}
            />
        </div>

        {/* Closing */}
        <div className="mt-48 text-center">
            <h3 className="text-8xl md:text-[12rem] font-bold tracking-tighter text-white/5 select-none">
                REAL X
            </h3>
        </div>

      </div>
    </section>
  );
}

function SpecItem({ label, value, delay }: { label: string; value: string; delay: number }) {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.5 }}
            viewport={{ once: true }}
            className="group flex flex-col justify-between p-8 bg-[#050505] hover:bg-[#0a0a0a] transition-colors aspect-square md:aspect-auto md:h-64"
        >
            <span className="text-xs uppercase tracking-widest text-white/40">{label}</span>
            <span className="text-2xl md:text-3xl font-medium tracking-tight text-white/90 group-hover:text-white transition-colors">{value}</span>
        </motion.div>
    );
}

function FeatureCard({ title, description, delay }: { title: string; description: string; delay: number }) {
    return (
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           transition={{ delay, duration: 0.6 }}
           viewport={{ once: true }}
           className="border-t border-white/20 pt-8"
        >
            <h3 className="text-2xl font-semibold text-white/90 mb-4">{title}</h3>
            <p className="text-white/50 leading-relaxed text-lg">{description}</p>
        </motion.div>
    );
}
