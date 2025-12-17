import { Crown } from "lucide-react";

const CrownIcon = () => {
  return (
    <div className="relative animate-float">
      {/* Glow effect */}
      <div className="absolute inset-0 blur-xl bg-gold/30 rounded-full scale-150" />
      
      {/* Crown icon */}
      <Crown 
        className="relative w-20 h-20 md:w-24 md:h-24 text-gold drop-shadow-lg"
        strokeWidth={1.5}
      />
    </div>
  );
};

export default CrownIcon;
