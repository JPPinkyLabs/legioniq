import { useState, useEffect, useMemo } from "react";
import { useScreenshotUpload } from "@/hooks/screenshots/useScreenshotUpload";
import { useDailyUsage } from "@/hooks/usage/useDailyUsage";
import { useDailyLimitValidation } from "@/hooks/usage/useDailyLimitValidation";
import { useScreenshotAnalysis2 } from "@/hooks/screenshots/useScreenshotAnalysis2";
import { useTypingEffect } from "@/hooks/other/useTypingEffect";
import { type CategoryData } from "@/hooks/other/useCategories";
import type { CategoryAdvice } from "@/hooks/other/useCategoryAdvices";

const MAX_IMAGES = 5;

export function useHome() {
  // Screenshot upload
  const {
    screenshots,
    loading: uploadLoading,
    uploadScreenshot,
    removeScreenshot,
    clearScreenshots,
  } = useScreenshotUpload();

  // Screenshot analysis
  const {
    loading: analysisLoading,
    currentRequestId,
    aiResponse,
    error: analysisError,
    analyzeScreenshot,
    resetAnalysis,
  } = useScreenshotAnalysis2();

  // Selection states
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [selectedCategoryData, setSelectedCategoryData] = useState<CategoryData | undefined>(undefined);
  const [selectedAdvice, setSelectedAdvice] = useState<CategoryAdvice | undefined>(undefined);

  // Request states (stored when analysis starts)
  const [requestScreenshots, setRequestScreenshots] = useState<string[]>([]);
  const [requestCategoryData, setRequestCategoryData] = useState<CategoryData | undefined>(undefined);
  const [requestAdvice, setRequestAdvice] = useState<CategoryAdvice | undefined>(undefined);

  // Overlay state
  const [showAnalysisOverlay, setShowAnalysisOverlay] = useState(false);

  // Layout states
  const [isColumnLayout, setIsColumnLayout] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Daily usage
  const { canMakeRequest, currentImages, maxImages, isUnlimited } = useDailyUsage();

  const {
    remainingAfterSelection,
    dailyLimitExceeded,
    handleFileSelectWithValidation,
    validateAndHandleSend,
  } = useDailyLimitValidation({
    screenshots,
    currentImages,
    maxImages,
    isUnlimited,
  });

  // Category title text for typing effect
  const categoryTitleText = useMemo(() => {
    if (!requestCategoryData || !requestAdvice) return '';
    return `${requestCategoryData.label} (${requestAdvice.name})`;
  }, [requestCategoryData, requestAdvice]);

  // Typing effect for category label
  const { displayedText: categoryDisplayText, isComplete: categoryTypingComplete } = useTypingEffect({
    text: categoryTitleText,
    speed: 80,
    enabled: !!(requestCategoryData && requestAdvice && aiResponse && !analysisLoading),
  });

  // Computed values
  const canAddMoreImages = screenshots.length < MAX_IMAGES && remainingAfterSelection > 0 && !dailyLimitExceeded;
  const loading = uploadLoading || analysisLoading;
  const shouldShowOverlay = (isMobile || isColumnLayout) && showAnalysisOverlay && (analysisLoading || aiResponse || analysisError);
  const showCategoryInfo = !!(requestCategoryData && requestAdvice && aiResponse && !analysisLoading && currentRequestId);
  const showScreenshotsGallery = requestScreenshots.length > 0 && !!aiResponse && !analysisLoading;
  const isAnalysisActive = !analysisLoading && !analysisError && !!currentRequestId && !!aiResponse;

  // Layout detection effect
  useEffect(() => {
    const checkLayout = () => {
      const width = window.innerWidth;
      setIsColumnLayout(width <= 980);
      setIsMobile(width < 768);
    };
    
    checkLayout();
    window.addEventListener('resize', checkLayout);
    return () => window.removeEventListener('resize', checkLayout);
  }, []);

  // Auto-show overlay when resizing to mobile/tablet if there's an active analysis
  useEffect(() => {
    if (isMobile || isColumnLayout) {
      if (analysisLoading || aiResponse || analysisError) {
        setShowAnalysisOverlay(true);
      }
    }
  }, [isMobile, isColumnLayout, analysisLoading, aiResponse, analysisError]);

  // Handlers
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentCount = screenshots.length;
    await handleFileSelectWithValidation(e.target.files, uploadScreenshot, currentCount);
  };

  const handleSelectCategory = (categoryData: CategoryData) => {
    setSelectedCategoryId(categoryData.id);
    setSelectedCategoryData(categoryData);
    setSelectedAdvice(undefined);
  };

  const handleGenerate = async () => {
    if (!selectedCategoryData || screenshots.length === 0 || !selectedAdvice) {
      return;
    }

    if (!validateAndHandleSend()) {
      return;
    }

    // Store screenshots, category data and advice used for this request
    setRequestScreenshots([...screenshots]);
    setRequestCategoryData(selectedCategoryData);
    setRequestAdvice(selectedAdvice);
    
    // Show overlay when layout is in column mode (screen width <= 980px) or mobile (< 768px)
    if (window.innerWidth <= 980) {
      setShowAnalysisOverlay(true);
    }
    
    // Start analysis
    await analyzeScreenshot(
      selectedCategoryData.id,
      selectedAdvice.id,
      screenshots
    );

    // Clear screenshots from left column after starting analysis
    clearScreenshots();
    
    // Reset selected options (category and advice) after starting analysis
    setSelectedCategoryId(undefined);
    setSelectedCategoryData(undefined);
    setSelectedAdvice(undefined);
  };

  const clearAllState = () => {
    setSelectedCategoryId(undefined);
    setSelectedCategoryData(undefined);
    setSelectedAdvice(undefined);
    setRequestScreenshots([]);
    setRequestCategoryData(undefined);
    setRequestAdvice(undefined);
    clearScreenshots();
  };

  const handleBackToStep1 = () => {
    resetAnalysis();
    setShowAnalysisOverlay(false);
    clearAllState();
  };

  const handleCloseOverlay = () => {
    setShowAnalysisOverlay(false);
  };

  const handleViewFullAnalysis = () => {
    if (currentRequestId) {
      window.open(`/platform/history/requests/${currentRequestId}`, '_blank');
    }
  };

  const handleResetAnalysis = () => {
    resetAnalysis();
    setShowAnalysisOverlay(false);
    clearAllState();
  };

  return {
    // Upload
    screenshots,
    uploadLoading,
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
    analysisLoading,
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
    
    // Category Info (for conditional rendering)
    requestCategoryData,
    requestAdvice,
    
    // Computed
    loading,
    showCategoryInfo,
    showScreenshotsGallery,
    isAnalysisActive,
  };
}

export type UseHomeReturn = ReturnType<typeof useHome>;

