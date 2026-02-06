import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Globe, Lock } from "lucide-react";

interface TemplateCardProps {
  template: {
    id: string;
    name: string;
    thumbnail_url: string | null;
    category: string;
    is_public: boolean;
    is_platform: boolean;
  };
  onPreview: (id: string) => void;
  onEdit: (id: string) => void;
}

export const TemplateCard = ({ template, onPreview, onEdit }: TemplateCardProps) => {
  const categoryColors: Record<string, string> = {
    promotional: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    product: "bg-green-500/10 text-green-600 border-green-500/20",
    event: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    sale: "bg-red-500/10 text-red-600 border-red-500/20",
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30">
      <div className="relative aspect-[4/5] bg-muted overflow-hidden">
        {template.thumbnail_url ? (
          <img
            src={template.thumbnail_url}
            alt={template.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
            <span className="text-4xl opacity-50">📄</span>
          </div>
        )}
        
        {/* Overlay with actions - always visible on mobile via active state */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onPreview(template.id)}
            className="h-10 min-w-[80px]"
          >
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </Button>
          <Button
            size="sm"
            onClick={() => onEdit(template.id)}
            className="h-10 min-w-[80px] bg-primary hover:bg-primary/90"
          >
            <Edit className="w-4 h-4 mr-1" />
            Use
          </Button>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {template.is_platform && (
            <Badge className="bg-primary/90 text-primary-foreground text-xs">
              Official
            </Badge>
          )}
          <Badge
            variant="outline"
            className={`text-xs ${categoryColors[template.category] || ""}`}
          >
            {template.category}
          </Badge>
        </div>

        <div className="absolute top-2 right-2">
          {template.is_public ? (
            <Globe className="w-4 h-4 text-white/80" />
          ) : (
            <Lock className="w-4 h-4 text-white/80" />
          )}
        </div>
      </div>

      <CardContent className="p-3">
        <h3 className="font-medium text-sm truncate">{template.name}</h3>
      </CardContent>
    </Card>
  );
};
