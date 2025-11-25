import { Upload, Image as ImageIcon, Sparkles, Brain } from "lucide-react";

export const HomeHeader = () => {
  return (
    <div className="text-center mb-12">
      {/* Icons */}
      <div className="flex items-center justify-center gap-8 mb-8 flex-wrap">
        <div className="flex flex-col items-center gap-2 group">
          <Upload className="w-10 h-10 text-primary transition-transform group-hover:scale-110" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-7 h-7 text-primary" />
            <Sparkles className="w-6 h-6 text-primary/70" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 group">
          <Brain className="w-10 h-10 text-primary transition-transform group-hover:scale-110" />
        </div>
      </div>
      
      <h1 className="text-4xl font-semibold mb-3 text-foreground">
        How can I help you today?
      </h1>
      <p className="text-muted-foreground text-base max-w-2xl mx-auto">
        Upload your game screenshots, select a category, and our AI will provide you with detailed analysis, gameplay tips, technical support, or strategic advice.
      </p>
    </div>
  );
};

