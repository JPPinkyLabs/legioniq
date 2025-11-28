import { Sparkles, AlertCircle } from "lucide-react";
import { ImageSelector } from "@/components/features/ImageSelector";
import { CategorySelector } from "@/components/features/CategorySelector";
import { CategoryScreenshotsList } from "@/components/features/CategoryScreenshotsList";
import { CategoryAdvicesList } from "@/components/features/CategoryAdvicesList";
import { Button } from "@/components/ui/button";
import { type CategoryData } from "@/hooks/other/useCategories";
import type { CategoryAdvice } from "@/hooks/other/useCategoryAdvices";

interface Step1UploadProps {
  screenshots: string[];
  onRemoveScreenshot: (index: number) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  canAddMoreImages: boolean;
  dailyLimitExceeded: boolean;
  canMakeRequest: boolean;
  remainingAfterSelection: number;
  maxImages: number;
  loading: boolean;
  selectedCategoryId: string | undefined;
  selectedCategoryData: CategoryData | undefined;
  onSelectCategory: (categoryData: CategoryData) => void;
  selectedAdvice: CategoryAdvice | undefined;
  onSelectAdvice: (advice: CategoryAdvice | undefined) => void;
  onGenerate: () => void;
}

export const Step1Upload = ({
  screenshots,
  onRemoveScreenshot,
  onFileSelect,
  canAddMoreImages,
  dailyLimitExceeded,
  canMakeRequest,
  remainingAfterSelection,
  maxImages,
  loading,
  selectedCategoryId,
  selectedCategoryData,
  onSelectCategory,
  selectedAdvice,
  onSelectAdvice,
  onGenerate,
}: Step1UploadProps) => {
  const canGenerate = screenshots.length > 0 && !!selectedCategoryId && !!selectedAdvice && canMakeRequest && !dailyLimitExceeded;

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 md:gap-6">
        <ImageSelector
          screenshots={screenshots}
          onRemoveScreenshot={onRemoveScreenshot}
          onFileSelect={onFileSelect}
          canAddMoreImages={canAddMoreImages}
          dailyLimitExceeded={dailyLimitExceeded}
          remainingAfterSelection={remainingAfterSelection}
          maxImages={maxImages}
          loading={loading}
        />

        <CategorySelector
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={onSelectCategory}
        />

        {/* {selectedCategoryData && (
          <p className="text-xs md:text-sm text-muted-foreground">
            {selectedCategoryData.description}
          </p>
        )} */}

        <CategoryScreenshotsList selectedCategoryId={selectedCategoryId} />

        {selectedCategoryId && (
          <CategoryAdvicesList
            selectedCategoryId={selectedCategoryId}
            selectedAdvice={selectedAdvice}
            onSelectAdvice={onSelectAdvice}
          />
        )}

        {dailyLimitExceeded && (
          <div className="flex items-center gap-2 p-2 md:p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs md:text-sm">
            <AlertCircle className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
            <span>Daily limit reached. Please try again tomorrow.</span>
          </div>
        )}

        <Button
          className="w-full h-9 md:h-10 text-sm md:text-base"
          size="default"
          disabled={!canGenerate || loading || dailyLimitExceeded || !canMakeRequest}
          onClick={onGenerate}
        >
          <Sparkles className="h-4 w-4 md:h-4 md:w-4" />
          <span>Generate analysis</span>
        </Button>
      </div>
    </div>
  );
};
