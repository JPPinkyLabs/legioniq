import { Sparkles, RefreshCw } from "lucide-react";
import { Step1Upload, Step2Analysis } from "@/components/features/home-steps";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { AnalysisOverlay } from "@/components/features/analysis-overlay";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useHome } from "./hooks/useHome";
import { useState } from "react";

const Home = () => {
  const {
    // Upload
    screenshots,
    removeScreenshot,
    handleFileSelect,
    canAddMoreImages,
    
    // Selection
    selectedCategoryId,
    selectedCategoryData,
    selectedAdvice,
    handleSelectCategory,
    setSelectedAdvice,
    
    // Analysis
    currentRequestId,
    aiResponse,
    analysisError,
    requestScreenshots,
    handleGenerate,
    handleBackToStep1,
    handleResetAnalysis,
    handleViewFullAnalysis,
    
    // Overlay
    showAnalysisOverlay,
    shouldShowOverlay,
    handleCloseOverlay,
    
    // Layout
    isColumnLayout,
    
    // Typing Effect
    categoryDisplayText,
    categoryTypingComplete,
    
    // Daily Usage
    dailyLimitExceeded,
    canMakeRequest,
    remainingAfterSelection,
    maxImages,
    
    // Computed
    loading,
    showCategoryInfo,
    showScreenshotsGallery,
    isAnalysisActive,
  } = useHome();

  // Resize state
  const [isResizing, setIsResizing] = useState(false);
  const [isHoveringResizeHandle, setIsHoveringResizeHandle] = useState(false);
  const showResizeFeedback = isResizing || isHoveringResizeHandle;

  return (
    <div className="h-full w-full md:overflow-hidden">
      {/* Analysis Overlay for Mobile/Tablet Column Layout */}
      {shouldShowOverlay && (
        <AnalysisOverlay
          isOpen={showAnalysisOverlay}
          onClose={handleCloseOverlay}
          loading={loading}
          aiResponse={aiResponse}
          error={analysisError}
          requestId={currentRequestId}
          requestScreenshots={requestScreenshots}
          categoryDisplayText={categoryDisplayText}
          categoryTypingComplete={categoryTypingComplete}
          onViewFullAnalysis={handleViewFullAnalysis}
          onBack={handleBackToStep1}
        />
      )}

      {/* Mobile: Stacked layout */}
      <div className="md:hidden h-full flex flex-col">
        <div className="p-4 space-y-4 dark:bg-black flex-1">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl font-semibold text-foreground">
              Upload your screenshots
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Upload your game screenshots, select a category and advice type, and LegionIQ will analyze them using AI to provide you with detailed insights, gameplay tips, technical support, or strategic advice tailored to your needs.
            </p>
          </div>
          <Step1Upload
            screenshots={screenshots}
            onRemoveScreenshot={removeScreenshot}
            onFileSelect={handleFileSelect}
            canAddMoreImages={canAddMoreImages}
            dailyLimitExceeded={dailyLimitExceeded}
            canMakeRequest={canMakeRequest}
            remainingAfterSelection={remainingAfterSelection}
            maxImages={maxImages}
            loading={loading}
            selectedCategoryId={selectedCategoryId}
            selectedCategoryData={selectedCategoryData}
            onSelectCategory={handleSelectCategory}
            selectedAdvice={selectedAdvice}
            onSelectAdvice={setSelectedAdvice}
            onGenerate={handleGenerate}
          />
        </div>
      </div>

      {/* Desktop: Integrated layout - Editor left, Preview right - Visible from 768px+ */}
      <div className="hidden md:block h-screen dark:bg-black rounded-lg p-2">
        {isColumnLayout ? (
          // Single column layout for screens <= 980px
          <div className="flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 1rem)' }}>
            <ScrollArea className="h-full w-full">
              <div className="p-6 md:p-8 space-y-6">
                <div className="space-y-3">
                  <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
                    Upload your screenshots
                  </h1>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Upload your game screenshots, select a category and advice type, and LegionIQ will analyze them using AI to provide you with detailed insights, gameplay tips, technical support, or strategic advice tailored to your needs.
                  </p>
                </div>
                <Step1Upload
                  screenshots={screenshots}
                  onRemoveScreenshot={removeScreenshot}
                  onFileSelect={handleFileSelect}
                  canAddMoreImages={canAddMoreImages}
                  dailyLimitExceeded={dailyLimitExceeded}
                  canMakeRequest={canMakeRequest}
                  remainingAfterSelection={remainingAfterSelection}
                  maxImages={maxImages}
                  loading={loading}
                  selectedCategoryId={selectedCategoryId}
                  selectedCategoryData={selectedCategoryData}
                  onSelectCategory={handleSelectCategory}
                  selectedAdvice={selectedAdvice}
                  onSelectAdvice={setSelectedAdvice}
                  onGenerate={handleGenerate}
                />
              </div>
            </ScrollArea>
          </div>
        ) : (
          // Resizable two-column layout for larger screens
          <ResizablePanelGroup
            direction="horizontal"
            className="h-full rounded-lg"
            style={{ height: 'calc(100vh - 5rem)' }}
          >
            {/* Left side - Form/Editor */}
            <ResizablePanel 
              defaultSize={40} 
              minSize={30} 
              maxSize={40}
              className="flex flex-col overflow-hidden"
            >
              <ScrollArea className="h-full w-full">
                <div className="p-6 md:p-8 space-y-6">
                  <div className="space-y-3">
                    <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
                      Upload your screenshots
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base">
                      Upload your game screenshots, select a category and advice type, and LegionIQ will analyze them using AI to provide you with detailed insights, gameplay tips, technical support, or strategic advice tailored to your needs.
                    </p>
                  </div>
                  <Step1Upload
                    screenshots={screenshots}
                    onRemoveScreenshot={removeScreenshot}
                    onFileSelect={handleFileSelect}
                    canAddMoreImages={canAddMoreImages}
                    dailyLimitExceeded={dailyLimitExceeded}
                    canMakeRequest={canMakeRequest}
                    remainingAfterSelection={remainingAfterSelection}
                    maxImages={maxImages}
                    loading={loading}
                    selectedCategoryId={selectedCategoryId}
                    selectedCategoryData={selectedCategoryData}
                    onSelectCategory={handleSelectCategory}
                    selectedAdvice={selectedAdvice}
                    onSelectAdvice={setSelectedAdvice}
                    onGenerate={handleGenerate}
                  />
                </div>
              </ScrollArea>
            </ResizablePanel>

            {/* Resize Handle */}
            <ResizableHandle 
              withHandle={true}
              onDragging={setIsResizing}
              onMouseEnter={() => setIsHoveringResizeHandle(true)}
              onMouseLeave={() => setIsHoveringResizeHandle(false)}
              className="relative z-50 w-4 -mr-2 bg-transparent outline-none focus-visible:ring-0 ring-0 border-0 data-[resize-handle-state=drag]:bg-transparent hover:bg-transparent [&>div]:bg-background [&>div]:border-border [&>div]:shadow-sm [&>div]:h-8 [&>div]:w-4 [&>div]:rounded-full flex items-center justify-center" 
            />

            {/* Right side - Preview/Visualization */}
            <ResizablePanel 
              defaultSize={60} 
              minSize={30}
              maxSize={70}
              className={`flex flex-col rounded-lg overflow-hidden bg-background border transition-colors duration-300 ${
                showResizeFeedback ? 'border-primary ring-1 ring-primary/30 shadow-[0_0_15px_rgba(255,215,0,0.15)]' : 'border-border'
              }`}
            >
              <ScrollArea className="flex-1 h-full">
                <div className="p-6 space-y-6 relative">
                  {/* AI Badge and Actions */}
                  <div className="absolute top-3 right-3 z-30 flex items-center gap-2 pointer-events-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetAnalysis}
                      className="h-7 w-7 p-0"
                      title="Reset and start new analysis"
                      disabled={!currentRequestId || !aiResponse || loading}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleViewFullAnalysis}
                      className="h-7 text-xs"
                      disabled={!currentRequestId}
                    >
                      View full analysis
                    </Button>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted border border-border backdrop-blur-sm ${
                      isAnalysisActive ? '' : 'opacity-50'
                    }`}>
                      <Sparkles className={`h-3.5 w-3.5 text-foreground ${
                        isAnalysisActive ? 'animate-pulse' : ''
                      }`} />
                      <span className="text-xs font-medium text-foreground">AI Analysis</span>
                    </div>
                  </div>

                  {/* Category Info with Typing Effect - Only show after response is received */}
                  {showCategoryInfo && (
                    <div className="pt-8 pb-2">
                      <span className="text-lg font-semibold text-foreground block">
                        {categoryDisplayText}
                        {!categoryTypingComplete && <span className="animate-pulse">|</span>}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono mt-1 block">
                        {currentRequestId}
                      </span>
                    </div>
                  )}

                  {/* Screenshots Gallery */}
                  {showScreenshotsGallery && (
                    <div className="flex flex-wrap gap-2 pb-4">
                      {requestScreenshots.map((screenshot, index) => (
                        <div
                          key={index}
                          className="relative rounded-lg overflow-hidden border border-border"
                        >
                          <img
                            src={screenshot}
                            alt={`Screenshot ${index + 1}`}
                            className="w-24 h-24 object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* AI Response Content */}
                  <Step2Analysis
                    requestId={currentRequestId}
                    aiResponse={aiResponse}
                    error={analysisError}
                    loading={loading}
                    onBack={handleBackToStep1}
                  />
                </div>
              </ScrollArea>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
};

export default Home;

