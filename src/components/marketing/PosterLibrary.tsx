import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { TemplateCard } from "./TemplateCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Loader2 } from "lucide-react";

interface PosterTemplate {
  id: string;
  name: string;
  thumbnail_url: string | null;
  category: string;
  is_public: boolean;
  is_platform: boolean;
  creator_id: string | null;
}

interface PosterLibraryProps {
  onSelectTemplate: (templateId: string) => void;
  onPreviewTemplate: (templateId: string) => void;
}

const categories = [
  { value: "all", label: "All" },
  { value: "promotional", label: "Promotional" },
  { value: "product", label: "Product" },
  { value: "sale", label: "Sale" },
  { value: "event", label: "Event" },
];

export const PosterLibrary = ({ onSelectTemplate, onPreviewTemplate }: PosterLibraryProps) => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<PosterTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    fetchTemplates();
  }, [user]);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from("poster_templates")
        .select("id, name, thumbnail_url, category, is_public, is_platform, creator_id")
        .order("created_at", { ascending: false });

      // Show public, platform, or user's own templates
      if (user) {
        query = query.or(`is_public.eq.true,is_platform.eq.true,creator_id.eq.${user.id}`);
      } else {
        query = query.or("is_public.eq.true,is_platform.eq.true");
      }

      const { data, error } = await query;

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || template.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <div className="overflow-x-auto -mx-2 px-2">
            <TabsList className="h-10 w-max">
              {categories.map((cat) => (
                <TabsTrigger key={cat.value} value={cat.value} className="text-xs sm:text-sm whitespace-nowrap">
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No templates found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your search or category filter
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onPreview={onPreviewTemplate}
              onEdit={onSelectTemplate}
            />
          ))}
        </div>
      )}
    </div>
  );
};
