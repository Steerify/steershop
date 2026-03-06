import { useEffect, useState } from "react";

// Accurate Nigeria boundary polygon (normalized to ~400x400 viewBox)
const nigeriaBorder: [number, number][] = [
  // Western border (Benin) - from south to north
  [68, 310], [65, 300], [62, 290], [58, 280], [55, 270], [53, 260],
  [52, 250], [55, 240], [58, 230], [60, 220], [58, 210], [55, 200],
  [52, 190], [50, 180], [48, 170], [50, 160], [55, 150], [58, 140],
  [62, 132], [68, 125], [75, 120], [82, 116],
  // Northern border (Niger) - west to east
  [90, 112], [100, 108], [110, 105], [120, 100], [130, 96], [140, 92],
  [150, 88], [160, 85], [170, 82], [180, 80], [190, 78], [200, 76],
  [210, 75], [220, 74], [230, 74], [240, 75], [250, 78], [260, 82],
  [270, 85], [280, 82], [290, 78], [300, 74], [310, 72],
  // Northeast (Lake Chad region)
  [318, 74], [325, 80], [330, 88], [335, 96], [338, 105], [340, 115],
  [338, 125], [335, 132], [330, 138],
  // Eastern border (Cameroon) - north to south
  [325, 145], [320, 155], [315, 165], [310, 175], [305, 185],
  [298, 195], [290, 205], [285, 212], [280, 220], [275, 228],
  [268, 235], [260, 242], [252, 248], [245, 255], [240, 262],
  [235, 268], [230, 275], [228, 282], [226, 288],
  // Southeast coast (Cross River / Calabar)
  [222, 295], [218, 300], [212, 305], [205, 308],
  // Niger Delta region (complex coastline)
  [198, 312], [190, 318], [182, 322], [175, 325], [168, 328],
  [160, 330], [152, 328], [145, 325], [140, 320], [135, 316],
  [130, 318], [125, 322], [120, 326], [115, 328],
  // Lagos coast
  [108, 326], [100, 322], [92, 318], [85, 315], [78, 312],
  [72, 312], [68, 310],
];

// Ray-casting point-in-polygon
const isInsideNigeria = (x: number, y: number): boolean => {
  let inside = false;
  const n = nigeriaBorder.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = nigeriaBorder[i][0], yi = nigeriaBorder[i][1];
    const xj = nigeriaBorder[j][0], yj = nigeriaBorder[j][1];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
};

// Generate dense dot grid
const generateDots = () => {
  const dots: [number, number][] = [];
  const spacing = 5;
  for (let x = 40; x <= 350; x += spacing) {
    for (let y = 65; y <= 340; y += spacing) {
      if (isInsideNigeria(x, y)) {
        dots.push([x, y]);
      }
    }
  }
  return dots;
};

const dots = generateDots();

const cities = [
  { name: "Lagos", x: 82, y: 308 },
  { name: "Abuja", x: 195, y: 185 },
  { name: "Kano", x: 230, y: 100 },
  { name: "Kaduna", x: 215, y: 135 },
  { name: "Port Harcourt", x: 185, y: 310 },
  { name: "Ibadan", x: 100, y: 275 },
  { name: "Enugu", x: 218, y: 260 },
  { name: "Benin City", x: 148, y: 285 },
  { name: "Maiduguri", x: 315, y: 105 },
  { name: "Ilorin", x: 120, y: 215 },
];

export const NigeriaDotMap = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`relative w-full h-full transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <svg
        viewBox="30 55 330 290"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Dense dot fill */}
        {dots.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={2}
            className="fill-primary dark:fill-primary"
            opacity={0.85}
          />
        ))}

        {/* City markers */}
        {cities.map((city) => (
          <g key={city.name}>
            {/* Pulse ring */}
            <circle cx={city.x} cy={city.y} r={3} className="fill-primary">
              <animate attributeName="r" from="3" to="10" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.6" to="0" dur="2.5s" repeatCount="indefinite" />
            </circle>
            {/* Core dot */}
            <circle cx={city.x} cy={city.y} r={3.5} className="fill-background" />
            <circle cx={city.x} cy={city.y} r={2.5} className="fill-primary" />
            {/* Label */}
            <text
              x={city.x + 7}
              y={city.y + 3}
              className="fill-foreground/70 dark:fill-foreground/60"
              style={{ fontSize: '6px', fontFamily: 'system-ui, sans-serif', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' as const }}
            >
              {city.name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};
