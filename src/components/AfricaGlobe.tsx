import React from 'react';
import { cn } from "@/lib/utils";

export const AfricaGlobe = ({ className }: { className?: string }) => {
  return (
    <div className={cn("relative w-full h-full flex items-center justify-center overflow-hidden", className)}>
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-accent/10 to-transparent blur-3xl rounded-full animate-float opacity-50" />
      
      {/* Animated Orbiting Rings */}
      <div className="absolute w-[120%] h-[120%] border border-primary/10 rounded-full animate-spin-slow" />
      <div className="absolute w-[140%] h-[140%] border border-accent/5 rounded-full animate-spin-slow direction-reverse" style={{ animationDuration: '12s' }} />
      
      {/* Globe Container */}
      <div className="relative w-full h-full max-w-[500px] max-h-[500px] aspect-square">
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full drop-shadow-2xl"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Grid / Latitudes & Longitudes */}
          <g className="text-muted-foreground/10">
            {[...Array(8)].map((_, i) => (
              <ellipse key={`lat-${i}`} cx="200" cy="200" rx="180" ry={20 + i * 40} stroke="currentColor" strokeWidth="0.5" fill="none" />
            ))}
            {[...Array(8)].map((_, i) => (
              <ellipse key={`lon-${i}`} cx="200" cy="200" rx={20 + i * 40} ry="180" stroke="currentColor" strokeWidth="0.5" fill="none" />
            ))}
          </g>

          {/* Africa Path (Simplified/Stylized) */}
          <g className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <path
              d="M175 140 C165 145, 160 155, 165 170 C168 185, 175 195, 185 205 C195 215, 210 235, 215 250 C220 265, 230 280, 240 290 C250 285, 260 270, 265 255 C270 240, 285 230, 300 220 C315 210, 325 200, 320 180 C315 160, 310 145, 290 135 C270 125, 250 115, 230 115 C210 115, 190 130, 175 140 Z"
              fill="url(#africa-gradient)"
              className="drop-shadow-[0_0_20px_rgba(var(--accent),0.3)]"
            />
            {/* Connection Lines from Africa to World */}
            <g className="text-accent">
              <path d="M230 150 Q280 80 350 100" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" className="animate-pulse-soft">
                <animate attributeName="stroke-dashoffset" from="0" to="20" dur="2s" repeatCount="indefinite" />
              </path>
              <path d="M210 220 Q120 200 80 250" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" className="animate-pulse-soft">
                 <animate attributeName="stroke-dashoffset" from="20" to="0" dur="3s" repeatCount="indefinite" />
              </path>
              <path d="M250 280 Q320 320 380 280" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" className="animate-pulse-soft">
                 <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="2.5s" repeatCount="indefinite" />
              </path>
            </g>
            
            {/* Dynamic Pulsing Points */}
            <circle cx="230" cy="180" r="4" fill="white" className="animate-ping" />
            <circle cx="230" cy="180" r="3" fill="var(--gold)" />
            
            <circle cx="215" cy="240" r="3" fill="white" className="animate-ping" style={{ animationDelay: '0.5s' }} />
            <circle cx="215" cy="240" r="2" fill="var(--accent)" />
          </g>

          <defs>
            <linearGradient id="africa-gradient" x1="165" y1="115" x2="320" y2="290" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--primary)" />
              <stop offset="50%" stopColor="var(--accent)" />
              <stop offset="100%" stopColor="var(--gold)" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Floating Marketing Particles */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDuration: `${3 + Math.random() * 5}s`,
            animationDelay: `${Math.random() * 2}s`
          }}
        />
      ))}
    </div>
  );
};
