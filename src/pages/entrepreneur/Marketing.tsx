import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@/components/PageWrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useMarketingAccess } from "@/hooks/useMarketingAccess";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PosterLibrary } from "@/components/marketing/PosterLibrary";
import { AIAssistant } from "@/components/marketing/AIAssistant";
import { TemplateCard } from "@/components/marketing/TemplateCard";
import {
  Wand2,
  Lock,
  Clock,
  Plus,
  Sparkles,
  Image,
  ArrowLeft,
  Loader2,
  Crown,
} from "lucide-react";
import logo from "@/assets/steersolo-logo.jpg";

interface UserPoster {
  id: string;
  name: string;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

const Marketing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const access = useMarketingAccess();
  const [activeTab, setActiveTab] = useState("my-posters");
  const [myPosters, setMyPosters] = useState<UserPoster[]>([]);
  const [isLoadingPosters, setIsLoadingPosters] = useState(true);
  const [shopData, setShopData] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (user) {
      fetchShopData();
      fetchMyPosters();
    }
  }, [user]);

  const fetchShopData = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("shops")
      .select("id, shop_name")
      .eq("owner_id", user.id)
      .single();

    if (data) {
      setShopData({ id: data.id, name: data.shop_name });
    }
  };

  const fetchMyPosters = async () => {
    if (!user) return;
    setIsLoadingPosters(true);
    try {
      const { data } = await supabase
        .from("user_posters")
        .select("id, name, thumbnail_url, created_at, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      setMyPosters(data || []);
    } catch (error) {
      console.error("Error fetching posters:", error);
    } finally {
      setIsLoadingPosters(false);
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    navigate(`/marketing/editor?template=${templateId}`);
  };

  const handlePreviewTemplate = (templateId: string) => {
    // For now, just navigate to editor
    handleSelectTemplate(templateId);
  };

  const handleEditPoster = (posterId: string) => {
    navigate(`/marketing/editor/${posterId}`);
  };

  const handleCreateNew = () => {
    navigate("/marketing/editor");
  };

  // Loading state
  if (access.isLoading) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageWrapper>
    );
  }

  // Access denied state
  if (!access.canAccess) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
              <CardTitle className="flex items-center justify-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                Business Plan Required
              </CardTitle>
              <CardDescription>{access.reason}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium">Auto Marketing Tool includes:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Poster templates library</li>
                  <li>✓ Lightweight canvas editor</li>
                  <li>✓ AI-powered copy generation</li>
                  <li>✓ Community templates</li>
                </ul>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={() => navigate("/pricing")} className="w-full">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Business
                </Button>
                <Button variant="outline" onClick={() => navigate("/dashboard")} className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper patternVariant="dots" patternOpacity={0.3}>
      {/* Header */}
      <nav className="bg-card/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50">
        <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg overflow-hidden">
                  <img src={logo} alt="SteerSolo" className="w-full h-full object-cover" />
                </div>
                <span className="font-heading font-bold text-lg sm:text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Auto Marketing
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {access.isTrialActive && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                  <Clock className="w-3 h-3 mr-1" />
                  {access.trialDaysRemaining}d trial
                </Badge>
              )}
              {access.isBusinessUser && (
                <Badge className="bg-gradient-to-r from-primary to-accent">
                  <Crown className="w-3 h-3 mr-1" />
                  Business
                </Badge>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold mb-2">
            Create Marketing Materials
          </h1>
          <p className="text-muted-foreground">
            Design stunning posters and marketing content for your business
          </p>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <TabsList>
              <TabsTrigger value="my-posters">
                <Image className="w-4 h-4 mr-2" />
                My Posters
              </TabsTrigger>
              <TabsTrigger value="templates">
                <Wand2 className="w-4 h-4 mr-2" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="ai">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Assistant
              </TabsTrigger>
            </TabsList>

            <Button onClick={handleCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </Button>
          </div>

          <TabsContent value="my-posters">
            {isLoadingPosters ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : myPosters.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Image className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No posters yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create your first marketing poster to get started
                  </p>
                  <Button onClick={handleCreateNew}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Poster
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {myPosters.map((poster) => (
                  <TemplateCard
                    key={poster.id}
                    template={{
                      id: poster.id,
                      name: poster.name,
                      thumbnail_url: poster.thumbnail_url,
                      category: "my-poster",
                      is_public: false,
                      is_platform: false,
                    }}
                    onPreview={handleEditPoster}
                    onEdit={handleEditPoster}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates">
            <PosterLibrary
              onSelectTemplate={handleSelectTemplate}
              onPreviewTemplate={handlePreviewTemplate}
            />
          </TabsContent>

          <TabsContent value="ai">
            <div className="max-w-xl mx-auto">
              <AIAssistant shopName={shopData?.name || "My Shop"} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  );
};

export default Marketing;
