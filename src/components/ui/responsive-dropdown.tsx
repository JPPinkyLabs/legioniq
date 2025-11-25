import * as React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuGroup } from "@/components/ui/dropdown-menu";
import { Drawer, DrawerContent, DrawerFooter, DrawerTrigger, DrawerClose, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/other/use-mobile";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface ResponsiveDropdownItem {
  label: string | React.ReactNode; // Allow ReactNode for complex labels
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
  separator?: boolean; // Add separator after this item
}

interface ResponsiveDropdownProps {
  trigger: React.ReactNode;
  items: ResponsiveDropdownItem[];
  align?: 'start' | 'center' | 'end';
  header?: React.ReactNode; // Optional header content (e.g., user info)
  sideOffset?: number; // Offset from trigger
}

export function ResponsiveDropdown({
  trigger,
  items,
  align = "end",
  header,
  sideOffset = 4
}: ResponsiveDropdownProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const handleItemClick = (onClick?: () => void, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (onClick) {
      onClick();
    }
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen && isMobile) {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && activeElement.blur) {
        activeElement.blur();
      }
    }
  }, [isOpen, isMobile]);

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild onClick={(e) => e.stopPropagation()}>
          {trigger}
        </DrawerTrigger>
        <DrawerContent 
          className="border-0 max-h-[80vh] flex flex-col z-[150]"
          onPointerDownOutside={() => setIsOpen(false)}
        >
          <div className="sr-only">
            <DrawerTitle>Options</DrawerTitle>
            <DrawerDescription>Select an action from the menu</DrawerDescription>
          </div>
          {header && (
            <div className="px-6 pt-6 pb-4">
              {header}
            </div>
          )}
          <div className="flex-1 p-6 space-y-3 overflow-y-auto">
            {items.map((item, index) => {
              const content = typeof item.label === 'string' ? (
                <>
                  {item.icon && (
                    <span className="mr-5 text-xl">
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </>
              ) : (
                item.label
              );
              
              const className = `w-full justify-start h-16 text-lg font-normal px-6 rounded-xl ${
                item.variant === 'destructive' 
                  ? 'text-destructive hover:text-destructive hover:bg-destructive/10' 
                  : 'text-foreground hover:bg-accent'
              }`;
              
              const buttonElement = item.href ? (
                <Button
                  key={index}
                  variant="ghost"
                  className={className}
                  disabled={item.disabled}
                  asChild
                >
                  <Link to={item.href} onClick={(e) => handleItemClick(item.onClick, e)}>
                    {content}
                  </Link>
                </Button>
              ) : (
                <Button
                  key={index}
                  variant="ghost"
                  className={className}
                  onClick={(e) => handleItemClick(item.onClick, e)}
                  disabled={item.disabled}
                >
                  {content}
                </Button>
              );

              return (
                <div key={index}>
                  {buttonElement}
                  {item.separator && index < items.length - 1 && (
                    <div className="h-px bg-muted my-3" />
                  )}
                </div>
              );
            })}
          </div>
          
          <DrawerFooter className="p-6 bg-background">
            <DrawerClose asChild>
              <Button
                variant="outline"
                className="w-full h-14 text-lg rounded-full"
                onClick={(e) => e.stopPropagation()}
              >
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          {trigger}
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align} sideOffset={sideOffset} className="max-w-xs rounded-2xl p-1.5">
          {header && (
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="px-2 py-1.5">
                {header}
              </div>
            </DropdownMenuLabel>
          )}
          <DropdownMenuGroup className="space-y-1">
            {items.map((item, index) => {
            const content = typeof item.label === 'string' ? (
              <>
                {item.icon && (
                  <span className="mr-2">
                    {item.icon}
                  </span>
                )}
                {item.label}
              </>
            ) : (
              item.label
            );
            
            const baseItemClassName = 'rounded-[calc(1rem-6px)] text-xs';
            const itemClassName = typeof item.label !== 'string' 
              ? `${baseItemClassName} ${item.variant === 'destructive' ? 'text-destructive focus:text-destructive' : ''} items-start`
              : `${baseItemClassName} ${item.variant === 'destructive' ? 'text-destructive focus:text-destructive' : ''}`;

            const menuItem = item.href ? (
              <DropdownMenuItem
                key={index}
                className={itemClassName}
                disabled={item.disabled}
                asChild
              >
                <Link to={item.href} onClick={(e) => handleItemClick(item.onClick, e)}>
                  {content}
                </Link>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                key={index}
                onClick={(e) => handleItemClick(item.onClick, e)}
                className={itemClassName}
                disabled={item.disabled}
              >
                {content}
              </DropdownMenuItem>
            );

            return (
              <React.Fragment key={index}>
                {menuItem}
                {item.separator && index < items.length - 1 && (
                  <DropdownMenuSeparator />
                )}
              </React.Fragment>
            );
          })}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

