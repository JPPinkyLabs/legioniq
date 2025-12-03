import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Image as ImageIcon, Info } from "lucide-react";
import { useIsMobile } from "@/hooks/other/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const AdminRequestDetailsSkeleton = () => {
  const isMobile = useIsMobile();

  return (
    <div className={`flex ${isMobile ? 'flex-col' : 'gap-8'} w-full`}>
      <Tabs 
        defaultValue="overview"
        orientation={isMobile ? "horizontal" : "vertical"} 
        className={`flex ${isMobile ? 'flex-col' : 'gap-8'} w-full`}
      >
        <TabsList className={`${isMobile ? 'w-full grid grid-cols-4 gap-1 h-auto' : 'flex-col h-auto w-48'} ${isMobile ? 'items-center justify-center' : 'items-start justify-start'} bg-muted/50 p-1 ${isMobile ? '' : 'shrink-0 self-start'}`}>
          <TabsTrigger 
            value="overview" 
            className={`${isMobile ? 'flex-col items-center justify-center gap-1 h-auto py-2 min-h-[60px]' : 'w-full justify-start'} data-[state=active]:bg-background`}
            disabled
          >
            <Info className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4 mr-2'}`} />
            <span className={isMobile ? 'text-xs' : ''}>Overview</span>
          </TabsTrigger>
          <TabsTrigger 
            value="prompt" 
            className={`${isMobile ? 'flex-col items-center justify-center gap-1 h-auto py-2 min-h-[60px]' : 'w-full justify-start'} data-[state=active]:bg-background`}
            disabled
          >
            <FileText className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4 mr-2'}`} />
            <span className={isMobile ? 'text-xs' : ''}>Prompt</span>
          </TabsTrigger>
          <TabsTrigger 
            value="response" 
            className={`${isMobile ? 'flex-col items-center justify-center gap-1 h-auto py-2 min-h-[60px]' : 'w-full justify-start'} data-[state=active]:bg-background`}
            disabled
          >
            <FileText className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4 mr-2'}`} />
            <span className={isMobile ? 'text-xs' : ''}>Response</span>
          </TabsTrigger>
          <TabsTrigger 
            value="images" 
            className={`${isMobile ? 'flex-col items-center justify-center gap-1 h-auto py-2 min-h-[60px]' : 'w-full justify-start'} data-[state=active]:bg-background`}
            disabled
          >
            <ImageIcon className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4 mr-2'}`} />
            <span className={isMobile ? 'text-xs' : ''}>Images</span>
          </TabsTrigger>
        </TabsList>

        <div className={`${isMobile ? 'w-full mt-4' : 'flex-1 min-h-0'} w-full`}>
          <TabsContent value="overview" className={`${isMobile ? 'mt-0 pt-6' : 'mt-0'} overflow-hidden`}>
            <ScrollArea className="h-full">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <Skeleton className="h-6 w-48 bg-muted-foreground/30" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Skeleton className="h-4 w-20 bg-muted-foreground/30 mb-2" />
                        <Skeleton className="h-4 w-full bg-muted-foreground/30" />
                      </div>
                      <div>
                        <Skeleton className="h-4 w-20 bg-muted-foreground/30 mb-2" />
                        <Skeleton className="h-4 w-full bg-muted-foreground/30" />
                      </div>
                      <div>
                        <Skeleton className="h-4 w-20 bg-muted-foreground/30 mb-2" />
                        <Skeleton className="h-4 w-full bg-muted-foreground/30" />
                      </div>
                      <div>
                        <Skeleton className="h-4 w-20 bg-muted-foreground/30 mb-2" />
                        <Skeleton className="h-4 w-full bg-muted-foreground/30" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="prompt" className={`${isMobile ? 'mt-0 pt-6' : 'mt-0'} overflow-hidden`}>
            <ScrollArea className="h-full">
              <div className="w-full max-w-3xl mx-auto space-y-3 pb-[100px]">
                <Skeleton className="h-7 w-40 bg-muted-foreground/30" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-muted-foreground/30" />
                  <Skeleton className="h-4 w-full bg-muted-foreground/30" />
                  <Skeleton className="h-4 w-3/4 bg-muted-foreground/30" />
                  <Skeleton className="h-4 w-full bg-muted-foreground/30" />
                  <Skeleton className="h-4 w-5/6 bg-muted-foreground/30" />
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="response" className={`${isMobile ? 'mt-0 pt-6' : 'mt-0'} overflow-hidden`}>
            <div className="space-y-6">
              <div className="w-full max-w-3xl mx-auto pb-6">
                <Skeleton className="h-7 w-32 mb-3 bg-muted-foreground/30" />
                <div className="min-h-[400px] space-y-2 pt-4">
                  <Skeleton className="h-4 w-3/4 bg-muted-foreground/30" />
                  <Skeleton className="h-4 w-4/5 bg-muted-foreground/30" />
                  <Skeleton className="h-4 w-2/3 bg-muted-foreground/30" />
                  <Skeleton className="h-4 w-5/6 bg-muted-foreground/30" />
                  <Skeleton className="h-4 w-3/4 bg-muted-foreground/30" />
                  <Skeleton className="h-4 w-4/5 bg-muted-foreground/30" />
                  <Skeleton className="h-4 w-2/3 bg-muted-foreground/30" />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="images" className={`${isMobile ? 'mt-0 pt-6' : 'mt-0'} overflow-hidden`}>
            <ScrollArea className="h-full">
              <div className="w-full max-w-3xl mx-auto space-y-3 pb-[100px]">
                <Skeleton className="h-7 w-40 bg-muted-foreground/30" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton 
                      key={i} 
                      className="h-64 w-full rounded-lg bg-muted-foreground/30" 
                    />
                  ))}
                </div>

                {/* Extracted Text skeleton */}
                <div className="w-full max-w-3xl mx-auto space-y-3 pt-6">
                  <Skeleton className="h-7 w-40 bg-muted-foreground/30" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full bg-muted-foreground/30" />
                    <Skeleton className="h-4 w-full bg-muted-foreground/30" />
                    <Skeleton className="h-4 w-3/4 bg-muted-foreground/30" />
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};


