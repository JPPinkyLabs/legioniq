import { LucideIcon, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface ButtonConfig {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline" | "link" | "ghost" | "destructive" | "secondary";
}

interface ErrorEmptyProps {
  icon: LucideIcon;
  title: string;
  description: string;
  buttons?: ButtonConfig[];
  linkLabel?: string;
  linkHref?: string;
  onLinkClick?: () => void;
}

export const ErrorEmpty = ({
  icon: Icon,
  title,
  description,
  buttons = [],
  linkLabel,
  linkHref,
  onLinkClick,
}: ErrorEmptyProps) => {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {buttons.length > 0 && (
        <EmptyContent>
          <div className="flex gap-2">
            {buttons.map((button, index) => (
              <Button
                key={index}
                variant={button.variant || "default"}
                onClick={button.onClick}
              >
                {button.label}
              </Button>
            ))}
          </div>
        </EmptyContent>
      )}
      {(linkLabel || linkHref) && (
        <Button
          variant="link"
          asChild={!!linkHref}
          className="text-muted-foreground"
          size="sm"
          onClick={onLinkClick}
        >
          {linkHref ? (
            <a href={linkHref}>
              {linkLabel} <ArrowUpRight className="inline w-4 h-4" />
            </a>
          ) : (
            <span>
              {linkLabel} <ArrowUpRight className="inline w-4 h-4" />
            </span>
          )}
        </Button>
      )}
    </Empty>
  );
};

