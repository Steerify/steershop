import { supabase } from '@/integrations/supabase/client';
import { Course, Enrollment } from '@/types/api';

export const courseService = {
  getCourses: async (targetAudience?: 'customer' | 'shop_owner' | 'all') => {
    let query = supabase
      .from('courses')
      .select('*')
      .eq('is_active', true);
    
    // Filter by target audience if specified
    if (targetAudience) {
      query = query.or(`target_audience.eq.${targetAudience},target_audience.eq.all`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Get courses error:', error);
      throw new Error(error.message);
    }

    return {
      success: true,
      data: data as Course[],
      message: 'Courses fetched successfully'
    };
  },

  getCourseById: async (id: string) => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Get course error:', error);
      throw new Error(error.message);
    }

    return {
      success: true,
      data: data as Course,
      message: 'Course fetched successfully'
    };
  },

  getEnrollments: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('course_enrollments')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Get enrollments error:', error);
      throw new Error(error.message);
    }

    return {
      success: true,
      data: data as Enrollment[],
      message: 'Enrollments fetched successfully'
    };
  },

  enrollInCourse: async (courseId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('course_enrollments')
      .insert({
        user_id: user.id,
        course_id: courseId,
        progress: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Enroll error:', error);
      throw new Error(error.message);
    }

    return {
      success: true,
      data: data as Enrollment,
      message: 'Enrolled successfully'
    };
  },

  markCourseComplete: async (enrollmentId: string) => {
    const { data, error } = await supabase
      .from('course_enrollments')
      .update({
        progress: 100,
        completed_at: new Date().toISOString(),
      })
      .eq('id', enrollmentId)
      .select()
      .single();

    if (error) {
      console.error('Mark complete error:', error);
      throw new Error(error.message);
    }

    return {
      success: true,
      data: data as Enrollment,
      message: 'Course completed successfully'
    };
  },

  // Admin methods
  createCourse: async (data: Omit<Course, 'id'>) => {
    const { data: course, error } = await supabase
      .from('courses')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('Create course error:', error);
      throw new Error(error.message);
    }

    return {
      success: true,
      data: course as Course,
      message: 'Course created successfully'
    };
  },

  updateCourse: async (id: string, data: Partial<Course>) => {
    const { data: course, error } = await supabase
      .from('courses')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update course error:', error);
      throw new Error(error.message);
    }

    return {
      success: true,
      data: course as Course,
      message: 'Course updated successfully'
    };
  },

  deleteCourse: async (id: string) => {
    const { error } = await supabase
      .from('courses')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Delete course error:', error);
      throw new Error(error.message);
    }

    return {
      success: true,
      data: null,
      message: 'Course deleted successfully'
    };
  },
};
