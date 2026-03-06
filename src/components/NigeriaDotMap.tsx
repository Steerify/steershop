import { useEffect, useState } from "react";
import nigeriaMap from "@/assets/nigeria-dot-map.png";

export const NigeriaDotMap = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`relative w-full h-full transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <img
        src={nigeriaMap}
        alt="Nigeria dot map showing major cities"
        className="w-full h-full object-contain"
        loading="eager"
      />
    </div>
  );
};
