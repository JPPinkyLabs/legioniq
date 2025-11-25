import { ChatRating } from "@/components/features/ChatRating";

interface AnalysisActionsProps {
  requestId: string;
}

export const AnalysisActions = ({ requestId }: AnalysisActionsProps) => {
  return (
    <div>
      <ChatRating requestId={requestId} />
    </div>
  );
};

