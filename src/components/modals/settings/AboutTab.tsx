import { useFormatTime } from "@/hooks/formatting/useFormatTime";
import packageJson from "../../../../package.json";
import { ScrollArea } from "@/components/ui/scroll-area";

export const AboutTab = () => {
  const { currentTime, formatTime } = useFormatTime();
  const appVersion = packageJson.version;

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 pr-4">
        <div>
          <h2 className="text-2xl font-semibold mb-4">About LegionIQ</h2>
          <p className="text-sm text-foreground/90">
            AI-powered game analysis platform that helps players make smarter decisions.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-2">Application Version</h3>
            <p className="text-sm text-muted-foreground">v{appVersion}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">System Time</h3>
            <p className="text-sm text-muted-foreground">{formatTime(currentTime)}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Environment</h3>
            <p className="text-sm text-muted-foreground">
              {import.meta.env.MODE === 'production' ? 'Production' : 'Development'}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Built by</h3>
            <p className="text-sm text-muted-foreground">
              <a
                href="https://pinkylabs.io"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                PINKY LABS LLC
              </a>
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Support</h3>
            <p className="text-sm text-muted-foreground">
              <a
                href="https://pinkylabs.io/contact-us"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Contact us
              </a>
            </p>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

