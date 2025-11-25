import { useState } from "react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, Shield, FileText, Info } from "lucide-react";
import { useIsMobile } from "@/hooks/other/use-mobile";
import { AccountTab } from "./settings/AccountTab";
import { PrivacyTab } from "./settings/PrivacyTab";
import { TermsTab } from "./settings/TermsTab";
import { AboutTab } from "./settings/AboutTab";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const [activeTab, setActiveTab] = useState("account");
  const isMobile = useIsMobile();

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
      description="Manage your account settings and preferences"
      className="sm:max-w-4xl"
    >
      <div className={`flex ${isMobile ? 'flex-col' : 'gap-4'} ${isMobile ? '' : 'h-[70vh]'} ${isMobile ? '' : '-mx-6 -mb-6 px-6 pb-6'}`}>
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          orientation={isMobile ? "horizontal" : "vertical"} 
          className={`flex ${isMobile ? 'flex-col' : 'gap-4'} w-full ${isMobile ? '' : 'h-full'}`}
        >
          <TabsList className={`${isMobile ? 'w-full grid grid-cols-4 gap-1 h-auto' : 'flex-col h-auto w-48'} ${isMobile ? 'items-center justify-center' : 'items-start justify-start'} bg-muted/50 p-1 ${isMobile ? '' : 'shrink-0'}`}>
            <TabsTrigger 
              value="account" 
              className={`${isMobile ? 'flex-col items-center justify-center gap-1 h-auto py-2 min-h-[60px]' : 'w-full justify-start'} data-[state=active]:bg-background`}
            >
              <User className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4 mr-2'}`} />
              <span className={isMobile ? 'text-xs' : ''}>Account</span>
            </TabsTrigger>
            <TabsTrigger 
              value="privacy" 
              className={`${isMobile ? 'flex-col items-center justify-center gap-1 h-auto py-2 min-h-[60px]' : 'w-full justify-start'} data-[state=active]:bg-background`}
            >
              <Shield className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4 mr-2'}`} />
              <span className={isMobile ? 'text-xs' : ''}>Privacy</span>
            </TabsTrigger>
            <TabsTrigger 
              value="terms" 
              className={`${isMobile ? 'flex-col items-center justify-center gap-1 h-auto py-2 min-h-[60px]' : 'w-full justify-start'} data-[state=active]:bg-background`}
            >
              <FileText className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4 mr-2'}`} />
              <span className={isMobile ? 'text-xs' : ''}>Terms</span>
            </TabsTrigger>
            <TabsTrigger 
              value="about" 
              className={`${isMobile ? 'flex-col items-center justify-center gap-1 h-auto py-2 min-h-[60px]' : 'w-full justify-start'} data-[state=active]:bg-background`}
            >
              <Info className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4 mr-2'}`} />
              <span className={isMobile ? 'text-xs' : ''}>About</span>
            </TabsTrigger>
          </TabsList>

          <div className={`${isMobile ? 'w-full mt-4' : 'flex-1 min-h-0'} ${isMobile ? '' : 'h-full'}`}>
            <TabsContent value="account" className={`${isMobile ? 'mt-0 pt-6' : 'mt-0 h-full'} overflow-hidden`}>
              <AccountTab />
            </TabsContent>
            <TabsContent value="privacy" className={`${isMobile ? 'mt-0 pt-6' : 'mt-0 h-full'} overflow-hidden`}>
              <PrivacyTab />
            </TabsContent>
            <TabsContent value="terms" className={`${isMobile ? 'mt-0 pt-6' : 'mt-0 h-full'} overflow-hidden`}>
              <TermsTab />
            </TabsContent>
            <TabsContent value="about" className={`${isMobile ? 'mt-0 pt-6' : 'mt-0 h-full'} overflow-hidden`}>
              <AboutTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </ResponsiveModal>
  );
};

