import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Check, X, FolderOpen, Video, Youtube, Instagram } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  is_active: boolean;
  sort_order: number;
}

interface Tutorial {
  id: string;
  title: string;
  description: string | null;
  content: string;
  image_url: string | null;
  video_url: string | null;
  reward_points: number;
  is_active: boolean;
  target_audience: string;
  collection_id: string | null;
  social_links: Record<string, string> | null;
}

export default function AdminCourses() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false);
  const [isTutorialDialogOpen, setIsTutorialDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [editingTutorial, setEditingTutorial] = useState<Tutorial | null>(null);
  const { toast } = useToast();

  const [collectionForm, setCollectionForm] = useState({
    name: "",
    description: "",
    cover_image_url: "",
    is_active: true,
    sort_order: "0",
  });

  const [tutorialForm, setTutorialForm] = useState({
    title: "",
    description: "",
    video_url: "",
    image_url: "",
    reward_points: "0",
    is_active: true,
    target_audience: "all" as string,
    collection_id: "" as string,
    youtube_url: "",
    instagram_url: "",
    tiktok_url: "",
  });

  useEffect(() => {
    fetchCollections();
    fetchTutorials();
  }, []);

  const fetchCollections = async () => {
    const { data } = await supabase
      .from("tutorial_collections")
      .select("*")
      .order("sort_order", { ascending: true });
    setCollections((data as Collection[]) || []);
  };

  const fetchTutorials = async () => {
    const { data } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });
    setTutorials((data as Tutorial[]) || []);
  };

  // Collection CRUD
  const handleCollectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: collectionForm.name,
      description: collectionForm.description || null,
      cover_image_url: collectionForm.cover_image_url || null,
      is_active: collectionForm.is_active,
      sort_order: parseInt(collectionForm.sort_order) || 0,
    };

    if (editingCollection) {
      const { error } = await supabase.from("tutorial_collections").update(payload).eq("id", editingCollection.id);
      if (error) { toast({ title: "Error updating collection", variant: "destructive" }); return; }
      toast({ title: "Collection updated" });
    } else {
      const { error } = await supabase.from("tutorial_collections").insert([payload]);
      if (error) { toast({ title: "Error creating collection", variant: "destructive" }); return; }
      toast({ title: "Collection created" });
    }
    resetCollectionForm();
    fetchCollections();
  };

  const handleDeleteCollection = async (id: string) => {
    if (!confirm("Delete this collection? Videos inside will be unassigned.")) return;
    const { error } = await supabase.from("tutorial_collections").delete().eq("id", id);
    if (error) { toast({ title: "Error deleting", variant: "destructive" }); return; }
    toast({ title: "Collection deleted" });
    fetchCollections();
  };

  const resetCollectionForm = () => {
    setCollectionForm({ name: "", description: "", cover_image_url: "", is_active: true, sort_order: "0" });
    setEditingCollection(null);
    setIsCollectionDialogOpen(false);
  };

  // Tutorial CRUD
  const handleTutorialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const socialLinks: Record<string, string> = {};
    if (tutorialForm.youtube_url) socialLinks.youtube = tutorialForm.youtube_url;
    if (tutorialForm.instagram_url) socialLinks.instagram = tutorialForm.instagram_url;
    if (tutorialForm.tiktok_url) socialLinks.tiktok = tutorialForm.tiktok_url;

    const payload = {
      title: tutorialForm.title,
      description: tutorialForm.description || null,
      content: tutorialForm.description || "Video tutorial", // content is required
      video_url: tutorialForm.video_url || null,
      image_url: tutorialForm.image_url || null,
      reward_points: parseInt(tutorialForm.reward_points) || 0,
      is_active: tutorialForm.is_active,
      target_audience: tutorialForm.target_audience,
      collection_id: tutorialForm.collection_id || null,
      social_links: Object.keys(socialLinks).length > 0 ? socialLinks : null,
    };

    if (editingTutorial) {
      const { error } = await supabase.from("courses").update(payload).eq("id", editingTutorial.id);
      if (error) { toast({ title: "Error updating tutorial", variant: "destructive" }); return; }
      toast({ title: "Tutorial updated" });
    } else {
      const { error } = await supabase.from("courses").insert([payload]);
      if (error) { toast({ title: "Error creating tutorial", variant: "destructive" }); return; }
      toast({ title: "Tutorial created" });
    }
    resetTutorialForm();
    fetchTutorials();
  };

  const handleEditTutorial = (t: Tutorial) => {
    setEditingTutorial(t);
    const sl = (t.social_links || {}) as Record<string, string>;
    setTutorialForm({
      title: t.title,
      description: t.description || "",
      video_url: t.video_url || "",
      image_url: t.image_url || "",
      reward_points: t.reward_points?.toString() || "0",
      is_active: t.is_active,
      target_audience: t.target_audience || "all",
      collection_id: t.collection_id || "",
      youtube_url: sl.youtube || "",
      instagram_url: sl.instagram || "",
      tiktok_url: sl.tiktok || "",
    });
    setIsTutorialDialogOpen(true);
  };

  const handleDeleteTutorial = async (id: string) => {
    if (!confirm("Delete this tutorial?")) return;
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) { toast({ title: "Error deleting", variant: "destructive" }); return; }
    toast({ title: "Tutorial deleted" });
    fetchTutorials();
  };

  const toggleTutorialStatus = async (id: string, current: boolean) => {
    await supabase.from("courses").update({ is_active: !current }).eq("id", id);
    fetchTutorials();
  };

  const resetTutorialForm = () => {
    setTutorialForm({ title: "", description: "", video_url: "", image_url: "", reward_points: "0", is_active: true, target_audience: "all", collection_id: "", youtube_url: "", instagram_url: "", tiktok_url: "" });
    setEditingTutorial(null);
    setIsTutorialDialogOpen(false);
  };

  const getCollectionName = (id: string | null) => collections.find(c => c.id === id)?.name || "Uncategorized";

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Tutorial Manager</h1>
          <p className="text-muted-foreground">Manage video tutorial collections with social media links</p>
        </div>

        <Tabs defaultValue="collections" className="space-y-4">
          <TabsList>
            <TabsTrigger value="collections">
              <FolderOpen className="w-4 h-4 mr-2" />
              Collections
            </TabsTrigger>
            <TabsTrigger value="videos">
              <Video className="w-4 h-4 mr-2" />
              Videos
            </TabsTrigger>
          </TabsList>

          {/* Collections Tab */}
          <TabsContent value="collections" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isCollectionDialogOpen} onOpenChange={setIsCollectionDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetCollectionForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Collection
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{editingCollection ? "Edit Collection" : "New Collection"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCollectionSubmit} className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <Input value={collectionForm.name} onChange={e => setCollectionForm({ ...collectionForm, name: e.target.value })} required placeholder="e.g. Essentials" />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea value={collectionForm.description} onChange={e => setCollectionForm({ ...collectionForm, description: e.target.value })} rows={2} />
                    </div>
                    <ImageUpload label="Cover Image" value={collectionForm.cover_image_url} onChange={url => setCollectionForm({ ...collectionForm, cover_image_url: url })} />
                    <div>
                      <Label>Sort Order</Label>
                      <Input type="number" value={collectionForm.sort_order} onChange={e => setCollectionForm({ ...collectionForm, sort_order: e.target.value })} />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={collectionForm.is_active} onChange={e => setCollectionForm({ ...collectionForm, is_active: e.target.checked })} />
                      <Label>Active</Label>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={resetCollectionForm}>Cancel</Button>
                      <Button type="submit">{editingCollection ? "Update" : "Create"}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Videos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collections.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{c.description}</TableCell>
                      <TableCell>{c.sort_order}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{tutorials.filter(t => t.collection_id === c.id).length}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={c.is_active ? "default" : "secondary"}>{c.is_active ? "Active" : "Inactive"}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => {
                            setEditingCollection(c);
                            setCollectionForm({ name: c.name, description: c.description || "", cover_image_url: c.cover_image_url || "", is_active: c.is_active, sort_order: c.sort_order.toString() });
                            setIsCollectionDialogOpen(true);
                          }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteCollection(c.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {collections.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No collections yet. Create your first one!</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isTutorialDialogOpen} onOpenChange={setIsTutorialDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetTutorialForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Video Tutorial
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingTutorial ? "Edit Tutorial" : "New Video Tutorial"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleTutorialSubmit} className="space-y-4">
                    <div>
                      <Label>Title</Label>
                      <Input value={tutorialForm.title} onChange={e => setTutorialForm({ ...tutorialForm, title: e.target.value })} required />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea value={tutorialForm.description} onChange={e => setTutorialForm({ ...tutorialForm, description: e.target.value })} rows={2} placeholder="Short description of the video" />
                    </div>
                    <div>
                      <Label>Video URL (YouTube, TikTok, Instagram, or direct MP4)</Label>
                      <Input value={tutorialForm.video_url} onChange={e => setTutorialForm({ ...tutorialForm, video_url: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." />
                    </div>
                    <ImageUpload label="Thumbnail Image" value={tutorialForm.image_url} onChange={url => setTutorialForm({ ...tutorialForm, image_url: url })} />
                    <div>
                      <Label>Collection</Label>
                      <Select value={tutorialForm.collection_id} onValueChange={v => setTutorialForm({ ...tutorialForm, collection_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Select a collection" /></SelectTrigger>
                        <SelectContent>
                          {collections.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Social Links */}
                    <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                      <Label className="text-sm font-semibold">Social Media Links (for Follow/Subscribe CTAs)</Label>
                      <div className="flex items-center gap-2">
                        <Youtube className="w-4 h-4 text-red-500 shrink-0" />
                        <Input value={tutorialForm.youtube_url} onChange={e => setTutorialForm({ ...tutorialForm, youtube_url: e.target.value })} placeholder="YouTube channel URL" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Instagram className="w-4 h-4 text-pink-500 shrink-0" />
                        <Input value={tutorialForm.instagram_url} onChange={e => setTutorialForm({ ...tutorialForm, instagram_url: e.target.value })} placeholder="Instagram profile URL" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-foreground shrink-0" />
                        <Input value={tutorialForm.tiktok_url} onChange={e => setTutorialForm({ ...tutorialForm, tiktok_url: e.target.value })} placeholder="TikTok profile URL" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Reward Points</Label>
                        <Input type="number" value={tutorialForm.reward_points} onChange={e => setTutorialForm({ ...tutorialForm, reward_points: e.target.value })} min="0" />
                      </div>
                      <div>
                        <Label>Target Audience</Label>
                        <select value={tutorialForm.target_audience} onChange={e => setTutorialForm({ ...tutorialForm, target_audience: e.target.value })} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                          <option value="customer">Customers</option>
                          <option value="shop_owner">Shop Owners</option>
                          <option value="all">Everyone</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={tutorialForm.is_active} onChange={e => setTutorialForm({ ...tutorialForm, is_active: e.target.checked })} />
                      <Label>Active</Label>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={resetTutorialForm}>Cancel</Button>
                      <Button type="submit">{editingTutorial ? "Update" : "Create"}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Collection</TableHead>
                    <TableHead>Video</TableHead>
                    <TableHead>Social Links</TableHead>
                    <TableHead>Audience</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tutorials.map(t => {
                    const sl = (t.social_links || {}) as Record<string, string>;
                    return (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium max-w-[150px] truncate">{t.title}</TableCell>
                        <TableCell><Badge variant="outline">{getCollectionName(t.collection_id)}</Badge></TableCell>
                        <TableCell>{t.video_url ? <Badge className="bg-blue-100 text-blue-700 border-blue-300">🎬 Video</Badge> : "—"}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {sl.youtube && <Youtube className="w-4 h-4 text-red-500" />}
                            {sl.instagram && <Instagram className="w-4 h-4 text-pink-500" />}
                            {sl.tiktok && <Video className="w-4 h-4" />}
                            {!sl.youtube && !sl.instagram && !sl.tiktok && <span className="text-muted-foreground text-xs">—</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {t.target_audience === "shop_owner" ? "Shop Owners" : t.target_audience === "all" ? "Everyone" : "Customers"}
                          </Badge>
                        </TableCell>
                        <TableCell><Badge variant="secondary">{t.reward_points} pts</Badge></TableCell>
                        <TableCell><Badge variant={t.is_active ? "default" : "secondary"}>{t.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => handleEditTutorial(t)}><Edit className="w-4 h-4" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => toggleTutorialStatus(t.id, t.is_active)}>
                              {t.is_active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteTutorial(t.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {tutorials.length === 0 && (
                    <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No tutorials yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
