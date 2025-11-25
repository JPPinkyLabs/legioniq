import { useTheme } from "@/contexts/ThemeContext";
import legionLogo from "@/assets/legioniq-logo.png";
import legionLogoGolden from "@/assets/legionIQ_logo_golden.png";

const AuthHeader = () => {
  const { theme } = useTheme();
  const logo = theme === "dark" ? legionLogoGolden : legionLogo;

  return (
    <div className="flex flex-col items-center space-y-2 text-center">
      <img 
        src={logo} 
        alt="LegionIQ Logo" 
        className="w-16 h-16 object-contain mb-2"
      />
      <h1 className="text-3xl font-bold">Welcome to LegionIQ</h1>
      <p className="text-muted-foreground">
        Intelligence designed for fair competition
      </p>
    </div>
  );
};

export default AuthHeader;

