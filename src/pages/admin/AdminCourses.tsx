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
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Check, X, AlertCircle } from "lucide-react";
import DOMPurify from "dompurify";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ImageUpload } from "@/components/ImageUpload";

export default function AdminCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    image_url: "",
    reward_points: "",
    is_active: true,
    target_audience: "customer" as "customer" | "shop_owner" | "all",
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading courses", variant: "destructive" });
      return;
    }

    setCourses(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Sanitize HTML content before saving to prevent XSS attacks
    const sanitizedContent = DOMPurify.sanitize(formData.content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre', 'span', 'div'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel'],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      ALLOW_DATA_ATTR: false,
      FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur']
    });

    const courseData = {
      ...formData,
      content: sanitizedContent,
      reward_points: parseInt(formData.reward_points) || 0,
      target_audience: formData.target_audience,
    };

    if (editingCourse) {
      const { error } = await supabase
        .from("courses")
        .update(courseData)
        .eq("id", editingCourse.id);

      if (error) {
        toast({ title: "Error updating course", variant: "destructive" });
        return;
      }

      toast({ title: "Course updated successfully" });
    } else {
      const { error } = await supabase
        .from("courses")
        .insert([courseData]);

      if (error) {
        toast({ title: "Error creating course", variant: "destructive" });
        return;
      }

      toast({ title: "Course created successfully" });
    }

    resetForm();
    fetchCourses();
  };

  const handleEdit = (course: any) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description || "",
      content: course.content,
      image_url: course.image_url || "",
      reward_points: course.reward_points?.toString() || "0",
      is_active: course.is_active,
      target_audience: course.target_audience || "customer",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Error deleting course", variant: "destructive" });
      return;
    }

    toast({ title: "Course deleted successfully" });
    fetchCourses();
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("courses")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      toast({ title: "Error updating status", variant: "destructive" });
      return;
    }

    toast({ title: "Status updated successfully" });
    fetchCourses();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      content: "",
      image_url: "",
      reward_points: "",
      is_active: true,
      target_audience: "customer",
    });
    setEditingCourse(null);
    setIsDialogOpen(false);
  };

  const getAudienceBadge = (audience: string) => {
    switch (audience) {
      case "shop_owner":
        return <Badge className="bg-purple-100 text-purple-700 border-purple-300">Shop Owners</Badge>;
      case "all":
        return <Badge className="bg-green-100 text-green-700 border-green-300">Everyone</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-700 border-blue-300">Customers</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Course Management</h1>
            <p className="text-muted-foreground">Create and manage learning courses with reward points</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCourse ? "Edit Course" : "Create New Course"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Course Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Short Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="content">Course Content (HTML supported)</Label>
                  <Alert className="mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      HTML content is automatically sanitized for security. Allowed tags: p, br, strong, em, u, headings, lists, links, images. Scripts and event handlers are removed.
                    </AlertDescription>
                  </Alert>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    rows={10}
                    placeholder="Enter course content. You can use HTML tags for formatting."
                  />
                </div>

                <div>
                  <ImageUpload
                    label="Course Image"
                    value={formData.image_url}
                    onChange={(url) => setFormData({ ...formData, image_url: url })}
                  />
                </div>

                <div>
                  <Label htmlFor="reward_points">Reward Points</Label>
                  <Input
                    id="reward_points"
                    type="number"
                    value={formData.reward_points}
                    onChange={(e) => setFormData({ ...formData, reward_points: e.target.value })}
                    required
                    min="0"
                  />
                </div>

                <div>
                  <Label htmlFor="target_audience">Target Audience</Label>
                  <select
                    id="target_audience"
                    value={formData.target_audience}
                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value as any })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="customer">Customers Only</option>
                    <option value="shop_owner">Shop Owners Only</option>
                    <option value="all">Everyone</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingCourse ? "Update Course" : "Create Course"}
                  </Button>
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
                <TableHead>Description</TableHead>
                <TableHead>Target Audience</TableHead>
                <TableHead>Reward Points</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell className="max-w-xs truncate">{course.description}</TableCell>
                  <TableCell>
                    {getAudienceBadge(course.target_audience)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{course.reward_points} pts</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={course.is_active ? "default" : "secondary"}>
                      {course.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(course)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleStatus(course.id, course.is_active)}
                      >
                        {course.is_active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(course.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
