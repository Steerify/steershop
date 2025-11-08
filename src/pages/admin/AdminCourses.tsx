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
import { Plus, Edit, Trash2, Check, X } from "lucide-react";

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

    const courseData = {
      ...formData,
      reward_points: parseInt(formData.reward_points) || 0,
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
    });
    setEditingCourse(null);
    setIsDialogOpen(false);
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
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
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
