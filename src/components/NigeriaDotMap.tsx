import { useEffect, useState } from "react";

const cities = [
  { name: "Lagos", x: 130, y: 295, delay: 0 },
  { name: "Abuja", x: 220, y: 225, delay: 0.5 },
  { name: "Port Harcourt", x: 195, y: 310, delay: 1 },
  { name: "Kano", x: 235, y: 130, delay: 1.5 },
];

// Simplified Nigeria outline as dot coordinates (approximate boundary)
const nigeriaOutline: [number, number][] = [
  [115,270],[110,260],[105,250],[100,240],[95,230],[95,220],[100,210],[105,200],
  [110,195],[115,190],[120,185],[125,180],[130,175],[140,170],[150,165],[160,160],
  [170,155],[180,150],[190,145],[200,140],[210,135],[220,130],[230,125],[240,120],
  [250,125],[260,130],[270,135],[280,140],[290,150],[295,160],[300,170],[305,180],
  [305,190],[300,200],[295,210],[290,220],[285,230],[280,240],[275,250],[270,260],
  [265,270],[260,280],[255,290],[250,295],[240,300],[230,305],[220,310],[210,315],
  [200,320],[190,325],[180,320],[170,315],[160,310],[150,305],[140,300],[130,295],
  [120,285],[115,275],
];

// Fill dots within the outline
const generateFillDots = () => {
  const dots: [number, number][] = [];
  const spacing = 8;
  for (let x = 85; x <= 315; x += spacing) {
    for (let y = 110; y <= 335; y += spacing) {
      // Simple point-in-polygon approximation using bounding
      const inBounds = 
        x >= 90 && x <= 310 &&
        y >= 115 && y <= 330 &&
        // Rough shape constraints
        (y < 200 ? x > 100 + (200 - y) * 0.3 && x < 300 - (200 - y) * 0.2 :
         y < 260 ? x > 95 && x < 305 :
         x > 110 + (y - 260) * 0.3 && x < 260 - (y - 260) * 0.2);
      if (inBounds) {
        dots.push([x, y]);
      }
    }
  }
  return dots;
};

const fillDots = generateFillDots();

export const NigeriaDotMap = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`relative w-full h-full transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <svg
        viewBox="60 80 280 280"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Fill dots */}
        {fillDots.map(([x, y], i) => (
          <circle
            key={`fill-${i}`}
            cx={x}
            cy={y}
            r={1.5}
            className="fill-accent/15 dark:fill-accent/25"
            style={{ animationDelay: `${i * 5}ms` }}
          />
        ))}

        {/* Outline dots (brighter) */}
        {nigeriaOutline.map(([x, y], i) => (
          <circle
            key={`outline-${i}`}
            cx={x}
            cy={y}
            r={2}
            className="fill-accent/30 dark:fill-accent/50"
          />
        ))}

        {/* Connection lines radiating from cities */}
        {cities.map((city, i) => (
          <g key={`line-${i}`}>
            <line
              x1={city.x}
              y1={city.y}
              x2={city.x + (i % 2 === 0 ? 60 : -50)}
              y2={city.y + (i < 2 ? 30 : -25)}
              stroke="hsl(var(--accent))"
              strokeOpacity={0.15}
              strokeWidth={0.8}
              strokeDasharray="4 4"
              className="dark:stroke-accent/25"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to="-8"
                dur="2s"
                repeatCount="indefinite"
              />
            </line>
          </g>
        ))}

        {/* City markers with pulse */}
        {cities.map((city) => (
          <g key={city.name}>
            {/* Ping ring */}
            <circle
              cx={city.x}
              cy={city.y}
              r={4}
              className="fill-accent/40"
            >
              <animate
                attributeName="r"
                from="4"
                to="14"
                dur="2s"
                begin={`${city.delay}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                from="0.5"
                to="0"
                dur="2s"
                begin={`${city.delay}s`}
                repeatCount="indefinite"
              />
            </circle>
            {/* Core dot */}
            <circle
              cx={city.x}
              cy={city.y}
              r={3.5}
              className="fill-accent"
            />
            <circle
              cx={city.x}
              cy={city.y}
              r={1.5}
              className="fill-accent-foreground dark:fill-background"
            />
            {/* Label */}
            <text
              x={city.x + 8}
              y={city.y + 3}
              className="fill-muted-foreground text-[7px] font-medium"
              style={{ fontFamily: 'sans-serif' }}
            >
              {city.name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};
