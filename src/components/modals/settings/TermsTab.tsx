import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/other/use-mobile";
import { TermsContent } from "@/components/legal/TermsContent";

export const TermsTab = () => {
  const isMobile = useIsMobile();

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 pr-4">
        <TermsContent variant="modal" />
      </div>
    </ScrollArea>
  );
};

