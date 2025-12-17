import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CrownIcon from "@/components/CrownIcon";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-radial flex items-center justify-center relative overflow-hidden">
      {/* Subtle gold accent overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-gold/5 pointer-events-none" />
      
      {/* Decorative corner accents */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-gold/20 m-8" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-gold/20 m-8" />
      
      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-12">
        {/* Crown Icon */}
        <div className="mb-8 animate-fade-in">
          <CrownIcon className="w-20 h-20 md:w-24 md:h-24" />
        </div>

        {/* Title */}
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-widest text-gold-gradient mb-6 animate-fade-in-delay text-center">
          VIP CLUB
        </h1>

        {/* Decorative line */}
        <div className="w-32 h-px bg-gradient-to-r from-transparent via-gold to-transparent mb-8 animate-fade-in-delay" />

        {/* Welcome text in Chinese */}
        <p className="text-muted-foreground text-lg md:text-xl font-light tracking-wide mb-12 animate-fade-in-delay-2 text-center">
          欢迎来到尊贵的 VIP 会员专区
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 animate-fade-in-delay-2">
          <Button
            variant="vipGold"
            size="xl"
            onClick={() => navigate("/members")}
            className="min-w-[180px] cursor-pointer"
          >
            Members
          </Button>
          
          <Button
            variant="vipOutline"
            size="xl"
            onClick={() => navigate("/vip")}
            className="min-w-[180px] cursor-pointer"
          >
            VIP
          </Button>
        </div>

        {/* Subtle footer text */}
        <p className="mt-16 text-muted-foreground/50 text-sm tracking-widest uppercase animate-fade-in-delay-2">
          Exclusive Access Only
        </p>
      </div>
    </div>
  );
};

export default Index;
