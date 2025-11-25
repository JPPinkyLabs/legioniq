import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/other/use-mobile";
import { PrivacyContent } from "@/components/legal/PrivacyContent";

export const PrivacyTab = () => {
  const isMobile = useIsMobile();

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 pr-4">
        <PrivacyContent variant="modal" />
      </div>
    </ScrollArea>
  );
};

