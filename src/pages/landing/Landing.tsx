import { Header, Hero, Features, Pricing, CTA, Footer } from "./components";

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <Features />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}

export default Landing;

