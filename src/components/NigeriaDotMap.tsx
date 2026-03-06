import { useEffect, useState } from "react";
import globalMap from "@/assets/global-dot-map.png";

export const NigeriaDotMap = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`relative w-full h-full transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <img
        src={globalMap}
        alt="Global dot map"
        className="w-full h-full object-contain mix-blend-multiply"
        loading="eager"
      />
    </div>
  );
};
