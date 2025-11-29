import { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle, Image as ImageIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ErrorEmpty } from "@/components/ErrorEmpty";
import { HistoryDetailsSkeleton } from "@/components/skeletons/HistoryDetailsSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { useRequest } from "@/hooks/requests/useRequest";
import { useFormattedDate } from "@/hooks/formatting/useFormattedDate";
import { useSignedImageUrls } from "./hooks/useSignedImageUrls";
import { FeedbackBanner } from "@/components/features/FeedbackBanner";
import { ChatMessage } from "@/components/features/ChatMessage";
import { ConversationMessage } from "@/components/features/ConversationView";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai/conversation';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUserUtils } from "@/hooks/auth/useUserUtils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/other/use-mobile";
import { getCategoryColorClasses } from "@/lib/category-colors";

const Details = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { request, isLoading, error, refetch } = useRequest(id);
  const { getUserName } = useUserUtils();
  const userName = getUserName();
  const [isBannerClosed, setIsBannerClosed] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const isMobile = useIsMobile();
  
  // Normalize image_url to array
  const imageUrls = useMemo(() => {
    if (!request?.image_url) return [];
    return Array.isArray(request.image_url) ? request.image_url : [request.image_url];
  }, [request?.image_url]);
  
  const { signedUrls, isLoading: isLoadingImages } = useSignedImageUrls(imageUrls);
  const [imageLoadStates, setImageLoadStates] = useState<boolean[]>([]);
  
  // Reset image load states when signedUrls change
  useEffect(() => {
    if (signedUrls.length > 0) {
      setImageLoadStates(new Array(signedUrls.length).fill(false));
    } else {
      setImageLoadStates([]);
    }
  }, [signedUrls.length]);
  
  // Call useFormattedDate hook unconditionally (before early returns)
  const formattedDate = useFormattedDate(request?.created_at || new Date().toISOString());
  
  // Build messages array similar to ConversationView - MUST be before early returns
  const messages: ConversationMessage[] = useMemo(() => {
    if (!request) return [];
    
    const msgs: ConversationMessage[] = [];
    
    // AI response message only (no user message)
    if (request.model_response) {
      msgs.push({
        id: `assistant-${request.id}`,
        from: 'assistant',
        content: request.model_response,
        timestamp: new Date(request.created_at),
        requestId: request.id,
      });
    }

    return msgs;
  }, [request]);
  
  const showBanner = request && !request.rating && !isBannerClosed;
  const categoryLabel = request?.category?.label || '';
  const adviceName = request?.advice?.name;
  const categoryTitle = adviceName 
    ? `${categoryLabel} (${adviceName})` 
    : categoryLabel;
  const categoryColor = request ? getCategoryColorClasses(request.category?.color) : '';

  const BackButton = () => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate("/platform/history")}
      className="text-muted-foreground hover:text-foreground -ml-2"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back
    </Button>
  );

  return (
    <ScrollArea className="h-full">
      <div className="px-5 mx-4 md:mx-6 lg:mx-8 max-w-5xl md:max-w-5xl lg:max-w-5xl xl:max-w-5xl 2xl:max-w-8xl 2xl:mx-auto py-3">
        <div className="space-y-6">
        <div className="space-y-3">
          <BackButton />
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="space-y-1">
              {isLoading ? (
                <>
                  <Skeleton className="h-9 w-64 bg-muted-foreground/30" />
                  <Skeleton className="h-5 w-40 bg-muted-foreground/30" />
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-bold">
                    {categoryTitle || 'Request Details'}
                  </h1>
                  {request?.id && (
                    <p className="text-xs text-muted-foreground font-mono">
                      {request.id}
                    </p>
                  )}
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-muted-foreground">
                      {formattedDate}
                    </p>
                  </div>
                </>
              )}
            </div>
            {!isLoading && request && (
              <Badge variant="outline" className={categoryColor}>
                {categoryTitle}
              </Badge>
            )}
          </div>
        </div>

        {isLoading ? (
          <HistoryDetailsSkeleton />
        ) : error ? (
          <ErrorEmpty
            icon={AlertCircle}
            title="Error loading request"
            description={
              error instanceof Error
                ? error.message
                : "Failed to load the request. Please try again."
            }
            buttons={[
              {
                label: "Try Again",
                onClick: () => refetch(),
                variant: "default",
              },
              {
                label: "Go Back",
                onClick: () => navigate("/platform/history"),
                variant: "outline",
              },
            ]}
          />
        ) : !request ? (
          <ErrorEmpty
            icon={AlertCircle}
            title="Request not found"
            description="The request you're looking for doesn't exist or has been removed."
            buttons={[
              {
                label: "Go Back",
                onClick: () => navigate("/platform/history"),
                variant: "outline",
              },
            ]}
          />
        ) : (
          <>
            {imageUrls.length > 0 ? (
              <div className={`flex ${isMobile ? 'flex-col' : 'gap-8'} w-full`}>
                <Tabs 
                  value={activeTab} 
                  onValueChange={setActiveTab} 
                  orientation={isMobile ? "horizontal" : "vertical"} 
                  className={`flex ${isMobile ? 'flex-col' : 'gap-8'} w-full`}
                >
                  <TabsList className={`${isMobile ? 'w-full grid grid-cols-2 gap-1 h-auto' : 'flex-col h-auto w-48'} ${isMobile ? 'items-center justify-center' : 'items-start justify-start'} bg-muted/50 p-1 ${isMobile ? '' : 'shrink-0 self-start'}`}>
                    <TabsTrigger 
                      value="details" 
                      className={`${isMobile ? 'flex-col items-center justify-center gap-1 h-auto py-2 min-h-[60px]' : 'w-full justify-start'} data-[state=active]:bg-background`}
                    >
                      <FileText className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4 mr-2'}`} />
                      <span className={isMobile ? 'text-xs' : ''}>Details</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="images" 
                      className={`${isMobile ? 'flex-col items-center justify-center gap-1 h-auto py-2 min-h-[60px]' : 'w-full justify-start'} data-[state=active]:bg-background`}
                    >
                      <ImageIcon className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4 mr-2'}`} />
                      <span className={isMobile ? 'text-xs' : ''}>Images</span>
                    </TabsTrigger>
                  </TabsList>

                  <div className={`${isMobile ? 'w-full mt-4' : 'flex-1 min-h-0'} w-full`}>
                    <TabsContent value="details" className={`${isMobile ? 'mt-0 pt-6' : 'mt-0'} overflow-hidden`}>
                      <div className="space-y-6">

                        <div className="w-full max-w-3xl mx-auto pb-6">
                          <h2 className="text-xl font-semibold mb-3">AI Response</h2>
                          <div className="min-h-[400px] overflow-hidden">
                            <Conversation className="relative w-full h-full">
                              <ScrollArea className="h-full">
                                <ConversationContent className="text-left pl-0 pt-0">
                                  {messages.map((message, index) => (
                                    <ChatMessage
                                      key={message.id}
                                      message={message}
                                      userName={userName}
                                      isTyping={false}
                                      skipTypingEffect={true}
                                      hideActions={true}
                                      messageClassName={index === 0 ? "pt-0 pb-4" : undefined}
                                    />
                                  ))}
                                </ConversationContent>
                              </ScrollArea>
                              <ConversationScrollButton />
                            </Conversation>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="images" className={`${isMobile ? 'mt-0 pt-6' : 'mt-0'} overflow-hidden`}>
                      <ScrollArea className="h-full">
                        <div className="w-full max-w-3xl mx-auto space-y-3 pb-[100px]">
                          <h2 className="text-xl font-semibold">Attached Images</h2>
                          {(isLoadingImages || signedUrls.length === 0 || imageLoadStates.length !== signedUrls.length || imageLoadStates.some(loaded => !loaded)) && imageUrls.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {imageUrls.map((_, index) => (
                                <div key={index} className="relative">
                                  <Skeleton 
                                    className="h-64 w-full rounded-lg bg-muted-foreground/30" 
                                  />
                                  {signedUrls[index] && (
                                    <img
                                      src={signedUrls[index]}
                                      alt={`Screenshot ${index + 1}`}
                                      className="absolute inset-0 w-full h-full object-contain opacity-0 transition-opacity duration-200"
                                      onLoad={(e) => {
                                        setImageLoadStates(prev => {
                                          const newStates = [...prev];
                                          newStates[index] = true;
                                          return newStates;
                                        });
                                        e.currentTarget.classList.remove('opacity-0');
                                        e.currentTarget.classList.add('opacity-100');
                                      }}
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : signedUrls.length > 0 && imageLoadStates.length === signedUrls.length && imageLoadStates.every(loaded => loaded) ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {signedUrls.map((url, index) => (
                                <div
                                  key={index}
                                  className="rounded-lg overflow-hidden border border-border/50 bg-muted/20"
                                >
                                  <img
                                    src={url}
                                    alt={`Screenshot ${index + 1}`}
                                    className="w-full h-auto object-contain max-h-64"
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No images available.</p>
                          )}

                          {/* Extracted Text Section */}
                          <div className="w-full max-w-3xl mx-auto space-y-3 pt-6">
                            <h2 className="text-xl font-semibold">Extracted Text</h2>
                            {request.ocr_text ? (
                              <p className="text-sm text-foreground whitespace-normal break-words leading-relaxed">
                                {request.ocr_text.split(/\s+/).join(' ')}
                              </p>
                            ) : (
                              <p className="text-sm text-muted-foreground">No text was extracted from the screenshot.</p>
                            )}
                          </div>
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            ) : (
              <div className="space-y-6">

                <div className="w-full max-w-3xl mx-auto pb-6">
                  <h2 className="text-xl font-semibold mb-3">AI Response</h2>
                  <div className="min-h-[400px] overflow-hidden">
                    <Conversation className="relative w-full h-full">
                      <ScrollArea className="h-full">
                        <ConversationContent className="text-left pl-0 pt-0">
                          {messages.map((message, index) => (
                            <ChatMessage
                              key={message.id}
                              message={message}
                              userName={userName}
                              isTyping={false}
                              skipTypingEffect={true}
                              hideActions={true}
                              messageClassName={index === 0 ? "pt-0 pb-4" : undefined}
                            />
                          ))}
                        </ConversationContent>
                      </ScrollArea>
                      <ConversationScrollButton />
                    </Conversation>
                  </div>
                </div>

              </div>
            )}
          </>
        )}
        </div>

        {showBanner && id && (
          <FeedbackBanner
            requestId={id}
            onClose={() => setIsBannerClosed(true)}
          />
        )}
      </div>
    </ScrollArea>
  );
};

export default Details;

