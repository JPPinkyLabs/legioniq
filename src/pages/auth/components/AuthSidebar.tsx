import { CosmicWavesShaders } from "@/components/ui/cosmic-waves-shaders";

const AuthSidebar = () => {
  return (
    <div className="hidden lg:block relative lg:h-screen">
      <CosmicWavesShaders
        speed={0.4}
        amplitude={1.0}
        frequency={1.0}
        starDensity={0.5}
        colorShift={0.2}
        className="absolute inset-0 h-full w-full"
      />
      <div className="relative z-10 h-full flex flex-col justify-center px-12 text-white">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="text-2xl tracking-tight font-medium text-white">Built by gamers, for gamers</div>
            <div className="text-base text-white/80">
              Everything happens privately and securely: no account access, no automation, no cheating — just pure intelligence applied to your gameplay.
            </div>
          </div>
        </div>

        <div className="mt-12 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-1 text-white">AI-Powered Analysis</h3>
              <p className="text-sm text-white/80">Detect patterns invisible to the human eye</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-1 text-white">100% Legal & Secure</h3>
              <p className="text-sm text-white/80">No bots, no automation, no account risk</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-1 text-white">Personalized Strategy</h3>
              <p className="text-sm text-white/80">Recommendations based on your style and goals</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSidebar;

