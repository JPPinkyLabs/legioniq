export const ChatLoadingMessage = () => {
  return (
    <div className="flex items-center gap-1.5 py-2">
      <div className="flex gap-1.5">
        <div 
          className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-[pulse-dot_1.4s_ease-in-out_infinite]"
          style={{ animationDelay: '0ms' }}
        />
        <div 
          className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-[pulse-dot_1.4s_ease-in-out_infinite]"
          style={{ animationDelay: '200ms' }}
        />
        <div 
          className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-[pulse-dot_1.4s_ease-in-out_infinite]"
          style={{ animationDelay: '400ms' }}
        />
      </div>
    </div>
  );
};

