import legionIQLogo from "@/assets/legionIQ_logo_golden.png";

export function IntroductionStep() {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-8">
      <div className="flex flex-col items-center space-y-4">
        <img 
          src={legionIQLogo} 
          alt="Legion IQ" 
          className="h-24 w-24 object-contain"
        />
        <h1 className="text-2xl font-bold text-foreground">
          Welcome to Legion IQ
        </h1>
      </div>
      
      <div className="text-center space-y-4 max-w-md">
        <p className="text-base text-muted-foreground">
          We'd like to ask you a few quick questions to personalize your experience 
          and help us provide better recommendations.
        </p>
        <p className="text-sm text-muted-foreground">
          This will only take a minute.
        </p>
      </div>
    </div>
  );
}

