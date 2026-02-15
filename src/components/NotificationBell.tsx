import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface PlatformUpdate {
  id: string;
  title: string;
  description: string | null;
  type: string;
  target_audience: string;
  created_at: string;
}

const STORAGE_KEY = "steersolo_last_seen_updates";

export const NotificationBell = ({ audience }: { audience: "entrepreneurs" | "customers" }) => {
  const [updates, setUpdates] = useState<PlatformUpdate[]>([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadUpdates();
  }, []);

  const loadUpdates = async () => {
    const { data, error } = await supabase
      .from("platform_updates")
      .select("*")
      .eq("is_active", true)
      .or(`target_audience.eq.all,target_audience.eq.${audience}`)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      setUpdates(data as PlatformUpdate[]);
      const lastSeen = localStorage.getItem(STORAGE_KEY);
      if (lastSeen) {
        const unseen = (data as PlatformUpdate[]).filter(u => new Date(u.created_at) > new Date(lastSeen));
        setUnseenCount(unseen.length);
      } else {
        setUnseenCount((data as PlatformUpdate[]).length);
      }
    }
  };

  const handleOpen = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
      setUnseenCount(0);
    }
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case "feature": return "🚀";
      case "improvement": return "✨";
      case "maintenance": return "🔧";
      default: return "📢";
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unseenCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {unseenCount > 9 ? "9+" : unseenCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b border-border">
          <h3 className="font-semibold text-sm">Platform Updates</h3>
        </div>
        <ScrollArea className="max-h-80">
          {updates.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground text-center">No updates yet</p>
          ) : (
            <div className="divide-y divide-border">
              {updates.map(update => (
                <div key={update.id} className="p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-2">
                    <span className="text-base mt-0.5">{typeIcon(update.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">{update.title}</p>
                      {update.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{update.description}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {format(new Date(update.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
