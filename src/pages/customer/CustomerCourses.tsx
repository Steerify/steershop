import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { CustomerSidebar } from "@/components/CustomerSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Award, BookOpen, CheckCircle2, Lock } from "lucide-react";
import DOMPurify from "dompurify";

interface Course {
  id: string;
  title: string;
  description: string;
  content: string;
  image_url: string;
  reward_points: number;
  is_active: boolean;
}

interface Enrollment {
  id: string;
  course_id: string;
  progress: number;
  completed_at: string | null;
  reward_claimed: boolean;
}

const CustomerCourses = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        navigate("/auth/login");
        return;
      }

      // Load courses
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (coursesError) throw coursesError;

      // Load enrollments
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from("course_enrollments")
        .select("*")
        .eq("user_id", user.id);

      if (enrollmentsError) throw enrollmentsError;

      // Load points
      const { data: pointsData } = await supabase
        .from("rewards_points")
        .select("total_points")
        .eq("user_id", user.id)
        .maybeSingle();

      setCourses(coursesData || []);
      setEnrollments(enrollmentsData || []);
      setTotalPoints(pointsData?.total_points || 0);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load courses",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("course_enrollments")
        .insert([{ user_id: user.id, course_id: courseId, progress: 0 }]);

      if (error) throw error;

      toast({ title: "Successfully enrolled in course!" });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleMarkComplete = async (enrollmentId: string) => {
    try {
      const { error } = await supabase
        .from("course_enrollments")
        .update({ progress: 100, completed_at: new Date().toISOString() })
        .eq("id", enrollmentId);

      if (error) throw error;

      toast({
        title: "Course completed!",
        description: "Points have been added to your account.",
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getEnrollment = (courseId: string) => {
    return enrollments.find(e => e.course_id === courseId);
  };

  const availableCourses = courses.filter(c => !getEnrollment(c.id));
  const inProgressCourses = courses.filter(c => {
    const enrollment = getEnrollment(c.id);
    return enrollment && !enrollment.completed_at;
  });
  const completedCourses = courses.filter(c => {
    const enrollment = getEnrollment(c.id);
    return enrollment?.completed_at;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <CustomerSidebar />
        
        <div className="flex-1">
          <header className="h-16 border-b bg-card flex items-center px-6 justify-between">
            <div className="flex items-center">
              <SidebarTrigger className="mr-4" />
              <h1 className="text-2xl font-bold">Learning Courses</h1>
            </div>
            <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg">
              <Award className="w-5 h-5 text-primary" />
              <span className="font-semibold">{totalPoints} Points</span>
            </div>
          </header>

          <main className="p-6">
            <Tabs defaultValue="available" className="space-y-6">
              <TabsList>
                <TabsTrigger value="available">
                  Available ({availableCourses.length})
                </TabsTrigger>
                <TabsTrigger value="in-progress">
                  In Progress ({inProgressCourses.length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({completedCourses.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="available" className="space-y-4">
                {availableCourses.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No available courses at the moment</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {availableCourses.map((course) => (
                      <Card key={course.id} className="flex flex-col">
                        {course.image_url && (
                          <img
                            src={course.image_url}
                            alt={course.title}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                        )}
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                            <Badge className="shrink-0">
                              <Award className="w-3 h-3 mr-1" />
                              {course.reward_points}
                            </Badge>
                          </div>
                          <CardDescription className="line-clamp-2">
                            {course.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-end">
                          <Button onClick={() => handleEnroll(course.id)} className="w-full">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Enroll Now
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="in-progress" className="space-y-4">
                {inProgressCourses.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No courses in progress</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {inProgressCourses.map((course) => {
                      const enrollment = getEnrollment(course.id)!;
                      return (
                        <Card key={course.id} className="flex flex-col">
                          {course.image_url && (
                            <img
                              src={course.image_url}
                              alt={course.title}
                              className="w-full h-48 object-cover rounded-t-lg"
                            />
                          )}
                          <CardHeader>
                            <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                            <CardDescription className="line-clamp-2">
                              {course.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="flex-1 flex flex-col gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>Progress</span>
                                <span className="font-medium">{enrollment.progress}%</span>
                              </div>
                              <Progress value={enrollment.progress} />
                            </div>
                            <Button
                              onClick={() => setSelectedCourse(course)}
                              variant="outline"
                              className="w-full"
                            >
                              Continue Learning
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                {completedCourses.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No completed courses yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {completedCourses.map((course) => {
                      const enrollment = getEnrollment(course.id)!;
                      return (
                        <Card key={course.id} className="flex flex-col border-primary/50">
                          {course.image_url && (
                            <img
                              src={course.image_url}
                              alt={course.title}
                              className="w-full h-48 object-cover rounded-t-lg"
                            />
                          )}
                          <CardHeader>
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                            </div>
                            <CardDescription className="line-clamp-2">
                              Completed on {new Date(enrollment.completed_at!).toLocaleDateString()}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Badge variant="secondary" className="w-full justify-center">
                              <Award className="w-3 h-3 mr-1" />
                              {course.reward_points} Points Earned
                            </Badge>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      {/* Course Content Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{selectedCourse.title}</CardTitle>
                  <CardDescription>{selectedCourse.description}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCourse(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedCourse.image_url && (
                <img
                  src={selectedCourse.image_url}
                  alt={selectedCourse.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}
              <SanitizedContent content={selectedCourse.content} />
              <div className="flex gap-4 pt-4 border-t">
                <Button
                  onClick={() => {
                    const enrollment = getEnrollment(selectedCourse.id);
                    if (enrollment) {
                      handleMarkComplete(enrollment.id);
                      setSelectedCourse(null);
                    }
                  }}
                  className="flex-1"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark as Complete
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedCourse(null)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </SidebarProvider>
  );
};

// Sanitized content component to prevent XSS attacks
const SanitizedContent = ({ content }: { content: string }) => {
  const sanitizedContent = useMemo(() => {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre', 'span', 'div'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel'],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      ALLOW_DATA_ATTR: false,
      ADD_ATTR: ['target'],
      FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur']
    });
  }, [content]);

  return (
    <div
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};

export default CustomerCourses;
