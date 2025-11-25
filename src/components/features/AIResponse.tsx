import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AIResponseProps {
  response: string;
  ocrText: string | null;
  screenshot: string | null;
}

const AIResponse = ({ response, ocrText, screenshot }: AIResponseProps) => {
  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-electric-blue" />
            AI Analysis Results
          </CardTitle>
          <CardDescription>
            Here's your personalized gaming assistance based on the screenshot
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="response" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="response">AI Response</TabsTrigger>
              <TabsTrigger value="ocr">Extracted Text</TabsTrigger>
              <TabsTrigger value="screenshot">Screenshot</TabsTrigger>
            </TabsList>

            <TabsContent value="response" className="space-y-4 mt-4">
              <div className="prose prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                  {response}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ocr" className="mt-4">
              {ocrText ? (
                <div className="bg-muted/20 rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Extracted Text from Screenshot
                    </span>
                  </div>
                  <pre className="whitespace-pre-wrap text-sm text-foreground font-mono">
                    {ocrText}
                  </pre>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No text was extracted from the screenshot
                </p>
              )}
            </TabsContent>

            <TabsContent value="screenshot" className="mt-4">
              {screenshot && (
                <div className="rounded-lg overflow-hidden border border-border">
                  <img
                    src={screenshot}
                    alt="Game screenshot"
                    className="w-full h-auto max-h-96 object-contain bg-muted/20"
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIResponse;