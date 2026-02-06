import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { courseService } from "@/services/course.service";
import { rewardService } from "@/services/reward.service";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Award, BookOpen, CheckCircle2, Clock, Sparkles, Gift, ArrowLeft } from "lucide-react";
import { PageWrapper } from "@/components/PageWrapper";
import DOMPurify from "dompurify";

interface Course {
  id: string;
  title: string;
  description: string;
  content: string;
  image_url: string;
  video_url?: string;
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

const EntrepreneurCourses = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    if (!isAuthLoading) {
      if (user) {
        loadData();
      } else {
        navigate("/auth/login");
      }
    }
  }, [user, isAuthLoading, navigate]);

  const loadData = async () => {
    try {
      if (!user) return;
      const coursesData = await courseService.getCourses('shop_owner');
      const enrollmentsData = await courseService.getEnrollments();
      const pointsData = await rewardService.getUserPoints();
      setCourses(coursesData?.data || []);
      setEnrollments(enrollmentsData?.data || []);
      setTotalPoints(pointsData?.data?.total_points || 0);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to load courses", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      if (!user) return;
      await courseService.enrollInCourse(courseId);
      toast({ title: "Successfully enrolled!" });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleMarkComplete = async (enrollmentId: string) => {
    try {
      await courseService.markCourseComplete(enrollmentId);
      toast({ title: "Course completed! 🎉", description: "Points have been added to your account." });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getEnrollment = (courseId: string) => enrollments.find(e => e.course_id === courseId);

  const availableCourses = courses.filter(c => !getEnrollment(c.id));
  const inProgressCourses = courses.filter(c => {
    const enrollment = getEnrollment(c.id);
    return enrollment && !enrollment.completed_at;
  });
  const completedCourses = courses.filter(c => getEnrollment(c.id)?.completed_at);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageWrapper patternVariant="dots" patternOpacity={0.3}>
      {/* Top Nav */}
      <div className="border-b bg-card/95 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Tutorials & Courses
            </h1>
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 px-3 py-1.5 rounded-xl border border-primary/20">
            <Award className="w-4 h-4 text-primary" />
            <span className="font-bold text-primary text-sm">{totalPoints}</span>
            <span className="text-muted-foreground text-xs">pts</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Hero */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-accent/20 to-transparent rounded-full blur-3xl" />
          <CardContent className="p-6 relative">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your Learning Journey</p>
                  <p className="text-xl font-bold">
                    {completedCourses.length} of {courses.length} Courses Completed
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate("/customer/rewards")}>
                  <Gift className="w-4 h-4 mr-2" />
                  View Rewards
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="available" className="space-y-6">
          <TabsList className="bg-card border">
            <TabsTrigger value="available" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BookOpen className="w-4 h-4 mr-2" />
              Available ({availableCourses.length})
            </TabsTrigger>
            <TabsTrigger value="in-progress" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Clock className="w-4 h-4 mr-2" />
              In Progress ({inProgressCourses.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Completed ({completedCourses.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            {availableCourses.length === 0 ? (
              <Card className="border-primary/20">
                <CardContent className="py-12 text-center">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">All courses enrolled!</h3>
                  <p className="text-muted-foreground">Check In Progress or Completed tabs.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {availableCourses.map((course) => (
                  <Card key={course.id} className="flex flex-col">
                    {course.image_url && (
                      <img src={course.image_url} alt={course.title} className="w-full h-40 object-cover rounded-t-lg" />
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base line-clamp-2">{course.title}</CardTitle>
                        <Badge className="shrink-0 text-xs">
                          <Award className="w-3 h-3 mr-1" />
                          {course.reward_points}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2 text-xs">{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-end pt-0">
                      <Button onClick={() => handleEnroll(course.id)} className="w-full" size="sm">
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {inProgressCourses.map((course) => {
                  const enrollment = getEnrollment(course.id)!;
                  return (
                    <Card key={course.id} className="flex flex-col">
                      {course.image_url && (
                        <img src={course.image_url} alt={course.title} className="w-full h-40 object-cover rounded-t-lg" />
                      )}
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base line-clamp-2">{course.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col gap-3 pt-0">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span>{enrollment.progress}%</span>
                          </div>
                          <Progress value={enrollment.progress} />
                        </div>
                        <Button onClick={() => setSelectedCourse(course)} variant="outline" size="sm" className="w-full">
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedCourses.map((course) => {
                  const enrollment = getEnrollment(course.id)!;
                  return (
                    <Card key={course.id} className="flex flex-col border-primary/50">
                      {course.image_url && (
                        <img src={course.image_url} alt={course.title} className="w-full h-40 object-cover rounded-t-lg" />
                      )}
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base line-clamp-2">{course.title}</CardTitle>
                          <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                        </div>
                        <CardDescription className="text-xs">
                          Completed {new Date(enrollment.completed_at!).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Badge variant="secondary" className="w-full justify-center text-xs">
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
      </div>

      {/* Course Content Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{selectedCourse.title}</CardTitle>
                  <CardDescription>{selectedCourse.description}</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedCourse(null)}>✕</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedCourse.video_url && (
                <CourseVideo url={selectedCourse.video_url} />
              )}
              {selectedCourse.image_url && !selectedCourse.video_url && (
                <img src={selectedCourse.image_url} alt={selectedCourse.title} className="w-full h-48 object-cover rounded-lg" />
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
                <Button variant="outline" onClick={() => setSelectedCourse(null)}>Close</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PageWrapper>
  );
};

const isYouTubeUrl = (url: string) => /(?:youtube\.com|youtu\.be)/.test(url);

const getYouTubeEmbedUrl = (url: string) => {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
};

const CourseVideo = ({ url }: { url: string }) => {
  if (isYouTubeUrl(url)) {
    return (
      <iframe
        src={getYouTubeEmbedUrl(url)}
        className="w-full aspect-video rounded-lg"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }
  return (
    <video src={url} controls className="w-full rounded-lg" controlsList="nodownload" playsInline />
  );
};

const SanitizedContent = ({ content }: { content: string }) => {
  const sanitizedContent = useMemo(() => {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre', 'span', 'div'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel'],
      FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
    });
  }, [content]);

  return (
    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
  );
};

export default EntrepreneurCourses;
