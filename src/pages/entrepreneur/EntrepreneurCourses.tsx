import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { courseService } from "@/services/course.service";
import { rewardService } from "@/services/reward.service";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Award, BookOpen, CheckCircle2, Clock, Gift, ArrowLeft, ArrowRight, Youtube, Instagram, Video, Play, ExternalLink } from "lucide-react";
import { PageWrapper } from "@/components/PageWrapper";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
}

interface Course {
  id: string;
  title: string;
  description: string;
  content: string;
  image_url: string;
  video_url?: string;
  reward_points: number;
  is_active: boolean;
  collection_id: string | null;
  social_links: Record<string, string> | null;
}

interface Enrollment {
  id: string;
  course_id: string;
  progress: number;
  completed_at: string | null;
  reward_claimed: boolean;
}

const isYouTubeUrl = (url: string) => /(?:youtube\.com|youtu\.be)/.test(url);
const getYouTubeEmbedUrl = (url: string) => {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
};

const CourseVideo = ({ url }: { url: string }) => {
  if (isYouTubeUrl(url)) {
    return <iframe src={getYouTubeEmbedUrl(url)} className="w-full aspect-video rounded-lg" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />;
  }
  return <video src={url} controls className="w-full rounded-lg" controlsList="nodownload" playsInline />;
};

const SocialCTAs = ({ links }: { links: Record<string, string> }) => {
  if (!links || Object.keys(links).length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {links.youtube && (
        <a href={links.youtube} target="_blank" rel="noopener noreferrer">
          <Button size="sm" variant="outline" className="gap-2 text-red-500 border-red-200 hover:bg-red-50">
            <Youtube className="w-4 h-4" /> Subscribe
          </Button>
        </a>
      )}
      {links.instagram && (
        <a href={links.instagram} target="_blank" rel="noopener noreferrer">
          <Button size="sm" variant="outline" className="gap-2 text-pink-500 border-pink-200 hover:bg-pink-50">
            <Instagram className="w-4 h-4" /> Follow
          </Button>
        </a>
      )}
      {links.tiktok && (
        <a href={links.tiktok} target="_blank" rel="noopener noreferrer">
          <Button size="sm" variant="outline" className="gap-2 border-foreground/20">
            <Video className="w-4 h-4" /> Follow on TikTok
          </Button>
        </a>
      )}
    </div>
  );
};

const EntrepreneurCourses = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    if (!isAuthLoading) {
      if (user) loadData();
      else navigate("/auth/login");
    }
  }, [user, isAuthLoading, navigate]);

  const loadData = async () => {
    try {
      if (!user) return;
      const [collectionsRes, coursesData, enrollmentsData, pointsData] = await Promise.all([
        supabase.from("tutorial_collections").select("*").eq("is_active", true).order("sort_order"),
        courseService.getCourses('shop_owner'),
        courseService.getEnrollments(),
        rewardService.getUserPoints(),
      ]);
      setCollections((collectionsRes.data as Collection[]) || []);
      setCourses((coursesData?.data || []) as Course[]);
      setEnrollments(enrollmentsData?.data || []);
      setTotalPoints(pointsData?.data?.total_points || 0);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      if (!user) return;
      await courseService.enrollInCourse(courseId);
      toast({ title: "Enrolled!" });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleMarkComplete = async (enrollmentId: string) => {
    try {
      await courseService.markCourseComplete(enrollmentId);
      toast({ title: "Course completed! 🎉", description: "Points added to your account." });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getEnrollment = (courseId: string) => enrollments.find(e => e.course_id === courseId);

  const collectionCourses = selectedCollection
    ? courses.filter(c => c.collection_id === selectedCollection.id)
    : [];

  // Uncategorized courses
  const uncategorizedCourses = courses.filter(c => !c.collection_id);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <PageWrapper patternVariant="dots" patternOpacity={0.3}>
      {/* Top Nav */}
      <div className="border-b bg-card/95 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => selectedCollection ? setSelectedCollection(null) : navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {selectedCollection ? selectedCollection.name : "Video Tutorials"}
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
                  <Play className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Watch, Learn & Grow</p>
                  <p className="text-xl font-bold">{collections.length} Collections · {courses.length} Videos</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/customer/rewards")}>
                <Gift className="w-4 h-4 mr-2" /> View Rewards
              </Button>
            </div>
          </CardContent>
        </Card>

        {!selectedCollection ? (
          /* Collections Grid */
          <div className="space-y-6">
            {collections.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {collections.map(c => {
                  const count = courses.filter(co => co.collection_id === c.id).length;
                  return (
                    <Card key={c.id} className="cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all group" onClick={() => setSelectedCollection(c)}>
                      {c.cover_image_url && (
                        <div className="h-40 overflow-hidden rounded-t-lg">
                          <img src={c.cover_image_url} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                      )}
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{c.name}</CardTitle>
                          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <CardDescription className="line-clamp-2">{c.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Badge variant="secondary">{count} {count === 1 ? "video" : "videos"}</Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Uncategorized */}
            {uncategorizedCourses.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">More Videos</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {uncategorizedCourses.map(course => (
                    <VideoCard key={course.id} course={course} enrollment={getEnrollment(course.id)} onEnroll={handleEnroll} onView={setSelectedCourse} onComplete={handleMarkComplete} />
                  ))}
                </div>
              </div>
            )}

            {collections.length === 0 && uncategorizedCourses.length === 0 && (
              <Card><CardContent className="py-12 text-center">
                <Play className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Tutorials Coming Soon!</h3>
                <p className="text-muted-foreground">Video tutorials to grow your business are on the way.</p>
              </CardContent></Card>
            )}
          </div>
        ) : (
          /* Collection Videos */
          <div className="space-y-4">
            {selectedCollection.description && (
              <p className="text-muted-foreground">{selectedCollection.description}</p>
            )}
            {collectionCourses.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No videos in this collection yet.</CardContent></Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {collectionCourses.map(course => (
                  <VideoCard key={course.id} course={course} enrollment={getEnrollment(course.id)} onEnroll={handleEnroll} onView={setSelectedCourse} onComplete={handleMarkComplete} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Video Detail Modal */}
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
            <CardContent className="space-y-4">
              {selectedCourse.video_url && <CourseVideo url={selectedCourse.video_url} />}
              {selectedCourse.image_url && !selectedCourse.video_url && (
                <img src={selectedCourse.image_url} alt={selectedCourse.title} className="w-full h-48 object-cover rounded-lg" />
              )}
              <SocialCTAs links={(selectedCourse.social_links || {}) as Record<string, string>} />
              <div className="flex gap-4 pt-4 border-t">
                {(() => {
                  const enrollment = getEnrollment(selectedCourse.id);
                  if (!enrollment) {
                    return <Button onClick={() => { handleEnroll(selectedCourse.id); setSelectedCourse(null); }} className="flex-1"><BookOpen className="w-4 h-4 mr-2" /> Enroll & Earn Points</Button>;
                  }
                  if (!enrollment.completed_at) {
                    return <Button onClick={() => { handleMarkComplete(enrollment.id); setSelectedCourse(null); }} className="flex-1"><CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Complete</Button>;
                  }
                  return <Badge variant="secondary" className="flex-1 justify-center py-2"><Award className="w-4 h-4 mr-1" /> Completed · {selectedCourse.reward_points} pts earned</Badge>;
                })()}
                <Button variant="outline" onClick={() => setSelectedCourse(null)}>Close</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PageWrapper>
  );
};

const VideoCard = ({ course, enrollment, onEnroll, onView, onComplete }: {
  course: Course;
  enrollment?: Enrollment;
  onEnroll: (id: string) => void;
  onView: (c: Course) => void;
  onComplete: (id: string) => void;
}) => {
  const sl = (course.social_links || {}) as Record<string, string>;
  const isCompleted = !!enrollment?.completed_at;
  const isEnrolled = !!enrollment;

  return (
    <Card className={`flex flex-col overflow-hidden hover:shadow-lg transition-all ${isCompleted ? "border-primary/50" : ""}`}>
      <div className="relative cursor-pointer" onClick={() => onView(course)}>
        {course.image_url ? (
          <img src={course.image_url} alt={course.title} className="w-full h-40 object-cover" />
        ) : (
          <div className="w-full h-40 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
            <Play className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        {course.video_url && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <Play className="w-6 h-6 text-primary ml-0.5" />
            </div>
          </div>
        )}
        {isCompleted && (
          <div className="absolute top-2 right-2"><CheckCircle2 className="w-6 h-6 text-primary drop-shadow" /></div>
        )}
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base line-clamp-2">{course.title}</CardTitle>
          <Badge className="shrink-0 text-xs"><Award className="w-3 h-3 mr-1" />{course.reward_points}</Badge>
        </div>
        <CardDescription className="line-clamp-2 text-xs">{course.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-end gap-2 pt-0">
        <SocialCTAs links={sl} />
        {!isEnrolled ? (
          <Button onClick={() => onEnroll(course.id)} size="sm" className="w-full"><BookOpen className="w-4 h-4 mr-2" /> Enroll & Watch</Button>
        ) : !isCompleted ? (
          <div className="space-y-2">
            <Button onClick={() => onView(course)} variant="outline" size="sm" className="w-full">Continue Watching</Button>
            <Button onClick={() => onComplete(enrollment!.id)} size="sm" className="w-full" variant="secondary"><CheckCircle2 className="w-4 h-4 mr-2" /> Mark Complete</Button>
          </div>
        ) : (
          <Badge variant="secondary" className="w-full justify-center text-xs py-1.5"><Award className="w-3 h-3 mr-1" />{course.reward_points} Points Earned</Badge>
        )}
      </CardContent>
    </Card>
  );
};

export default EntrepreneurCourses;
