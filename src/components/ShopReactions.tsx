import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ShopReactionsProps {
  shopId: string;
  className?: string;
}

const REACTIONS = [
  { type: "fire", emoji: "🔥", label: "Hot!" },
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "wow", emoji: "😲", label: "Wow" },
  { type: "cool", emoji: "😎", label: "Cool" },
  { type: "star", emoji: "⭐", label: "Amazing" },
] as const;

type ReactionType = typeof REACTIONS[number]["type"];

interface ReactionCount {
  reaction_type: ReactionType;
  count: number;
}

export const ShopReactions = ({ shopId, className }: ShopReactionsProps) => {
  const { toast } = useToast();
  const [reactionCounts, setReactionCounts] = useState<Record<ReactionType, number>>({
    fire: 0,
    love: 0,
    wow: 0,
    cool: 0,
    star: 0,
  });
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchReactions();
    fetchUserReaction();
  }, [shopId]);

  const fetchReactions = async () => {
    try {
      const { data, error } = await supabase
        .from("shop_reactions")
        .select("reaction_type")
        .eq("shop_id", shopId);

      if (error) throw error;

      const counts: Record<ReactionType, number> = {
        fire: 0,
        love: 0,
        wow: 0,
        cool: 0,
        star: 0,
      };

      data?.forEach((r) => {
        if (r.reaction_type in counts) {
          counts[r.reaction_type as ReactionType]++;
        }
      });

      setReactionCounts(counts);
    } catch (error) {
      console.error("Error fetching reactions:", error);
    }
  };

  const fetchUserReaction = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("shop_reactions")
        .select("reaction_type")
        .eq("shop_id", shopId)
        .eq("customer_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setUserReaction(data?.reaction_type as ReactionType | null);
    } catch (error) {
      console.error("Error fetching user reaction:", error);
    }
  };

  const handleReaction = async (type: ReactionType) => {
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Please log in",
          description: "You need to be logged in to react to shops",
          variant: "destructive",
        });
        return;
      }

      if (userReaction === type) {
        // Remove reaction
        const { error } = await supabase
          .from("shop_reactions")
          .delete()
          .eq("shop_id", shopId)
          .eq("customer_id", user.id);

        if (error) throw error;

        setUserReaction(null);
        setReactionCounts(prev => ({
          ...prev,
          [type]: Math.max(0, prev[type] - 1),
        }));
      } else {
        // Add or update reaction
        const { error } = await supabase
          .from("shop_reactions")
          .upsert({
            shop_id: shopId,
            customer_id: user.id,
            reaction_type: type,
          }, {
            onConflict: "shop_id,customer_id",
          });

        if (error) throw error;

        // Update counts
        setReactionCounts(prev => {
          const newCounts = { ...prev };
          if (userReaction) {
            newCounts[userReaction] = Math.max(0, newCounts[userReaction] - 1);
          }
          newCounts[type]++;
          return newCounts;
        });
        setUserReaction(type);
      }
    } catch (error: any) {
      console.error("Error updating reaction:", error);
      toast({
        title: "Error",
        description: "Failed to update reaction",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalReactions = Object.values(reactionCounts).reduce((a, b) => a + b, 0);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-1 flex-wrap">
        {REACTIONS.map(({ type, emoji, label }) => (
          <Button
            key={type}
            variant="ghost"
            size="sm"
            disabled={isLoading}
            onClick={() => handleReaction(type)}
            className={cn(
              "h-8 px-2 gap-1 transition-all hover:scale-110",
              userReaction === type && "bg-accent/20 ring-1 ring-accent"
            )}
            title={label}
          >
            <span className="text-lg">{emoji}</span>
            {reactionCounts[type] > 0 && (
              <span className="text-xs text-muted-foreground">
                {reactionCounts[type]}
              </span>
            )}
          </Button>
        ))}
      </div>
      {totalReactions > 0 && (
        <p className="text-xs text-muted-foreground">
          {totalReactions} {totalReactions === 1 ? "reaction" : "reactions"}
        </p>
      )}
    </div>
  );
};
