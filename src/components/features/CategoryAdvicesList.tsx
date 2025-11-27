import { useCategoryAdvices } from "@/hooks/other/useCategoryAdvices";
import { CategoryAdvicesSkeleton } from "@/components/skeletons/CategoryAdvicesSkeleton";
import { cn } from "@/lib/utils";
import type { CategoryAdvice } from "@/hooks/other/useCategoryAdvices";

const AdviceBadge = ({
  advice,
  isSelected,
  onClick,
}: {
  advice: CategoryAdvice;
  isSelected: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 md:gap-2 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full border text-xs md:text-xs font-medium transition-all shrink-0",
        isSelected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background hover:bg-accent text-foreground"
      )}
      title={advice.description}
    >
      <span>{advice.name}</span>
    </button>
  );
};

interface CategoryAdvicesListProps {
  selectedCategoryId: string | undefined;
  selectedAdvice: CategoryAdvice | undefined;
  onSelectAdvice: (advice: CategoryAdvice | undefined) => void;
}

export const CategoryAdvicesList = ({
  selectedCategoryId,
  selectedAdvice,
  onSelectAdvice,
}: CategoryAdvicesListProps) => {
  const { advices, isLoading } = useCategoryAdvices({
    categoryId: selectedCategoryId,
    enabled: !!selectedCategoryId,
  });

  return (
    <div className="space-y-2 md:space-y-3">
      <h3 className="text-sm md:text-sm font-medium">Advice Types</h3>
      {!selectedCategoryId ? (
        <p className="text-xs md:text-sm text-muted-foreground">Select category first</p>
      ) : isLoading ? (
        <CategoryAdvicesSkeleton />
      ) : advices.length === 0 ? (
        <p className="text-xs md:text-sm text-muted-foreground">No advice types available</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {advices.map((advice) => (
              <AdviceBadge
                key={advice.id}
                advice={advice}
                isSelected={selectedAdvice?.id === advice.id}
                onClick={() => onSelectAdvice(selectedAdvice?.id === advice.id ? undefined : advice)}
              />
            ))}
          </div>
          {selectedAdvice && (
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              {selectedAdvice.description}
            </p>
          )}
        </>
      )}
    </div>
  );
};

