import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CrownIconProps {
  className?: string;
}

const CrownIcon = ({ className }: CrownIconProps) => {
  return (
    <div className={cn("relative animate-float", className)}>
      {/* Glow effect */}
      <div className="absolute inset-0 blur-xl bg-gold/30 rounded-full scale-150" />
      
      {/* Crown icon */}
      <Crown 
        className="relative w-full h-full text-gold drop-shadow-lg"
        strokeWidth={1.5}
      />
    </div>
  );
};

export default CrownIcon;
