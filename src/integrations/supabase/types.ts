export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action_type: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          metadata: Json | null
          resource_id: string | null
          resource_name: string | null
          resource_type: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_name?: string | null
          resource_type: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_name?: string | null
          resource_type?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      auth_rate_limits: {
        Row: {
          attempt_type: string
          attempts: number | null
          created_at: string | null
          id: string
          identifier: string
          last_attempt: string | null
          locked_until: string | null
        }
        Insert: {
          attempt_type: string
          attempts?: number | null
          created_at?: string | null
          id?: string
          identifier: string
          last_attempt?: string | null
          locked_until?: string | null
        }
        Update: {
          attempt_type?: string
          attempts?: number | null
          created_at?: string | null
          id?: string
          identifier?: string
          last_attempt?: string | null
          locked_until?: string | null
        }
        Relationships: []
      }
      badges: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon_name: string
          id: string
          is_active: boolean | null
          name: string
          requirement_type: string
          requirement_value: number
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon_name: string
          id?: string
          is_active?: boolean | null
          name: string
          requirement_type: string
          requirement_value: number
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon_name?: string
          id?: string
          is_active?: boolean | null
          name?: string
          requirement_type?: string
          requirement_value?: number
          slug?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booking_date: string
          booking_time: string
          cancelled_at: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          customer_email: string
          customer_id: string | null
          customer_name: string
          customer_phone: string
          duration_minutes: number | null
          id: string
          notes: string | null
          order_id: string | null
          service_id: string
          shop_id: string
          status: string
          updated_at: string
        }
        Insert: {
          booking_date: string
          booking_time: string
          cancelled_at?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          customer_email: string
          customer_id?: string | null
          customer_name: string
          customer_phone: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          order_id?: string | null
          service_id: string
          shop_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          booking_date?: string
          booking_time?: string
          cancelled_at?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          customer_email?: string
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          order_id?: string | null
          service_id?: string
          shop_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string | null
          id: string
          progress: number | null
          reward_claimed: boolean | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string | null
          id?: string
          progress?: number | null
          reward_claimed?: boolean | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string | null
          id?: string
          progress?: number | null
          reward_claimed?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          reward_points: number | null
          target_audience: string
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          reward_points?: number | null
          target_audience?: string
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          reward_points?: number | null
          target_audience?: string
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      customer_preferences: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          favorite_categories: string[] | null
          id: string
          notification_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          favorite_categories?: string[] | null
          id?: string
          notification_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          favorite_categories?: string[] | null
          id?: string
          notification_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      deleted_accounts: {
        Row: {
          deleted_at: string
          email: string
          id: string
          role: string | null
        }
        Insert: {
          deleted_at?: string
          email: string
          id?: string
          role?: string | null
        }
        Update: {
          deleted_at?: string
          email?: string
          id?: string
          role?: string | null
        }
        Relationships: []
      }
      delivery_orders: {
        Row: {
          cancelled_at: string | null
          created_at: string | null
          currency: string | null
          delivered_at: string | null
          delivery_address: Json
          delivery_fee: number
          dimensions: Json | null
          estimated_delivery_date: string | null
          id: string
          order_id: string
          picked_up_at: string | null
          pickup_address: Json
          provider: string
          provider_shipment_id: string | null
          provider_tracking_code: string | null
          shop_id: string
          status: string
          updated_at: string | null
          weight_kg: number | null
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string | null
          currency?: string | null
          delivered_at?: string | null
          delivery_address: Json
          delivery_fee: number
          dimensions?: Json | null
          estimated_delivery_date?: string | null
          id?: string
          order_id: string
          picked_up_at?: string | null
          pickup_address: Json
          provider: string
          provider_shipment_id?: string | null
          provider_tracking_code?: string | null
          shop_id: string
          status?: string
          updated_at?: string | null
          weight_kg?: number | null
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string | null
          currency?: string | null
          delivered_at?: string | null
          delivery_address?: Json
          delivery_fee?: number
          dimensions?: Json | null
          estimated_delivery_date?: string | null
          id?: string
          order_id?: string
          picked_up_at?: string | null
          pickup_address?: Json
          provider?: string
          provider_shipment_id?: string | null
          provider_tracking_code?: string | null
          shop_id?: string
          status?: string
          updated_at?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_orders_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_orders_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_tracking_events: {
        Row: {
          created_at: string | null
          delivery_order_id: string
          description: string | null
          id: string
          location: string | null
          provider_event_id: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          delivery_order_id: string
          description?: string | null
          id?: string
          location?: string | null
          provider_event_id?: string | null
          status: string
        }
        Update: {
          created_at?: string | null
          delivery_order_id?: string
          description?: string | null
          id?: string
          location?: string | null
          provider_event_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_tracking_events_delivery_order_id_fkey"
            columns: ["delivery_order_id"]
            isOneToOne: false
            referencedRelation: "delivery_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_usage: {
        Row: {
          created_at: string | null
          feature_name: string
          id: string
          month_year: string
          updated_at: string | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          feature_name: string
          id?: string
          month_year: string
          updated_at?: string | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          feature_name?: string
          id?: string
          month_year?: string
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      featured_shop_analytics: {
        Row: {
          clicked_at: string | null
          device_type: string | null
          featured_shop_id: string
          id: string
          shop_id: string
          source: string | null
          user_id: string | null
        }
        Insert: {
          clicked_at?: string | null
          device_type?: string | null
          featured_shop_id: string
          id?: string
          shop_id: string
          source?: string | null
          user_id?: string | null
        }
        Update: {
          clicked_at?: string | null
          device_type?: string | null
          featured_shop_id?: string
          id?: string
          shop_id?: string
          source?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "featured_shop_analytics_featured_shop_id_fkey"
            columns: ["featured_shop_id"]
            isOneToOne: false
            referencedRelation: "featured_shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "featured_shop_analytics_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "featured_shop_analytics_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_shops: {
        Row: {
          created_at: string | null
          display_order: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          label: string | null
          shop_id: string
          tagline: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          label?: string | null
          shop_id: string
          tagline?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          label?: string | null
          shop_id?: string
          tagline?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "featured_shops_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: true
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "featured_shops_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: true
            referencedRelation: "shops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_ai_usage: {
        Row: {
          created_at: string | null
          credits_used: number | null
          feature_type: string
          id: string
          prompt: string | null
          result: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_used?: number | null
          feature_type: string
          id?: string
          prompt?: string | null
          result?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_used?: number | null
          feature_type?: string
          id?: string
          prompt?: string | null
          result?: string | null
          user_id?: string
        }
        Relationships: []
      }
      marketing_services: {
        Row: {
          amount: number | null
          consultation_date: string | null
          consultation_notes: string | null
          created_at: string | null
          google_profile_url: string | null
          id: string
          payment_reference: string | null
          payment_status: string | null
          service_type: string
          shop_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          consultation_date?: string | null
          consultation_notes?: string | null
          created_at?: string | null
          google_profile_url?: string | null
          id?: string
          payment_reference?: string | null
          payment_status?: string | null
          service_type: string
          shop_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          consultation_date?: string | null
          consultation_notes?: string | null
          created_at?: string | null
          google_profile_url?: string | null
          id?: string
          payment_reference?: string | null
          payment_status?: string | null
          service_type?: string
          shop_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_services_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_services_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_responses: {
        Row: {
          biggest_struggle: string | null
          business_type: string | null
          created_at: string | null
          customer_source: string | null
          delivery_method: string | null
          id: string
          payment_method: string | null
          perfect_feature: string | null
          user_id: string | null
        }
        Insert: {
          biggest_struggle?: string | null
          business_type?: string | null
          created_at?: string | null
          customer_source?: string | null
          delivery_method?: string | null
          id?: string
          payment_method?: string | null
          perfect_feature?: string | null
          user_id?: string | null
        }
        Update: {
          biggest_struggle?: string | null
          business_type?: string | null
          created_at?: string | null
          customer_source?: string | null
          delivery_method?: string | null
          id?: string
          payment_method?: string | null
          perfect_feature?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price: number
          product_id: string | null
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price: number
          product_id?: string | null
          quantity: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price?: number
          product_id?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          cancelled_at: string | null
          cancelled_by: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          customer_email: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          delivered_at: string | null
          delivery_address: string | null
          delivery_city: string | null
          delivery_fee: number | null
          delivery_state: string | null
          id: string
          notes: string | null
          out_for_delivery_at: string | null
          paid_at: string | null
          payment_reference: string | null
          payment_status: string | null
          processing_at: string | null
          shop_id: string
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          cancelled_at?: string | null
          cancelled_by?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          delivery_address?: string | null
          delivery_city?: string | null
          delivery_fee?: number | null
          delivery_state?: string | null
          id?: string
          notes?: string | null
          out_for_delivery_at?: string | null
          paid_at?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          processing_at?: string | null
          shop_id: string
          status?: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          cancelled_at?: string | null
          cancelled_by?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          delivery_address?: string | null
          delivery_city?: string | null
          delivery_fee?: number | null
          delivery_state?: string | null
          id?: string
          notes?: string | null
          out_for_delivery_at?: string | null
          paid_at?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          processing_at?: string | null
          shop_id?: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_earnings: {
        Row: {
          created_at: string | null
          fee_amount: number
          fee_percentage: number
          gross_amount: number
          id: string
          net_to_shop: number
          order_id: string | null
          shop_id: string
          transaction_id: string | null
        }
        Insert: {
          created_at?: string | null
          fee_amount: number
          fee_percentage?: number
          gross_amount: number
          id?: string
          net_to_shop: number
          order_id?: string | null
          shop_id: string
          transaction_id?: string | null
        }
        Update: {
          created_at?: string | null
          fee_amount?: number
          fee_percentage?: number
          gross_amount?: number
          id?: string
          net_to_shop?: number
          order_id?: string | null
          shop_id?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_earnings_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "revenue_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_feedback: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          feedback_type: string
          id: string
          message: string
          rating: number | null
          show_on_homepage: boolean | null
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name: string
          feedback_type?: string
          id?: string
          message: string
          rating?: number | null
          show_on_homepage?: boolean | null
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          feedback_type?: string
          id?: string
          message?: string
          rating?: number | null
          show_on_homepage?: boolean | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      poster_templates: {
        Row: {
          category: string
          created_at: string | null
          creator_id: string | null
          id: string
          is_platform: boolean | null
          is_public: boolean | null
          name: string
          template_data: Json
          thumbnail_url: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          creator_id?: string | null
          id?: string
          is_platform?: boolean | null
          is_public?: boolean | null
          name: string
          template_data?: Json
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          creator_id?: string | null
          id?: string
          is_platform?: boolean | null
          is_public?: boolean | null
          name?: string
          template_data?: Json
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      prize_claims: {
        Row: {
          claimed_at: string
          fulfilled_at: string | null
          id: string
          points_spent: number
          prize_id: string
          status: string
          user_id: string
        }
        Insert: {
          claimed_at?: string
          fulfilled_at?: string | null
          id?: string
          points_spent: number
          prize_id: string
          status?: string
          user_id: string
        }
        Update: {
          claimed_at?: string
          fulfilled_at?: string | null
          id?: string
          points_spent?: number
          prize_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prize_claims_prize_id_fkey"
            columns: ["prize_id"]
            isOneToOne: false
            referencedRelation: "rewards_prizes"
            referencedColumns: ["id"]
          },
        ]
      }
      product_recommendations: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          reason: string | null
          score: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          reason?: string | null
          score?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          reason?: string | null
          score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_recommendations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          comment: string | null
          created_at: string
          customer_id: string | null
          customer_name: string | null
          id: string
          order_id: string | null
          product_id: string
          rating: number
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          id?: string
          order_id?: string | null
          product_id: string
          rating: number
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          id?: string
          order_id?: string | null
          product_id?: string
          rating?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          average_rating: number | null
          booking_required: boolean | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          image_url: string | null
          is_available: boolean
          name: string
          price: number
          shop_id: string
          stock_quantity: number
          total_reviews: number | null
          type: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          average_rating?: number | null
          booking_required?: boolean | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          name: string
          price: number
          shop_id: string
          stock_quantity?: number
          total_reviews?: number | null
          type?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          average_rating?: number | null
          booking_required?: boolean | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          name?: string
          price?: number
          shop_id?: string
          stock_quantity?: number
          total_reviews?: number | null
          type?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bank_verified: boolean | null
          bank_verified_at: string | null
          bvn_verified: boolean | null
          bvn_verified_at: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_subscribed: boolean
          kyc_level: number | null
          needs_role_selection: boolean | null
          phone: string | null
          phone_verification_code: string | null
          phone_verification_expires: string | null
          phone_verified: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          subscription_expires_at: string | null
          subscription_plan_id: string | null
          subscription_type: string | null
          updated_at: string
          verified_bank_account_name: string | null
        }
        Insert: {
          bank_verified?: boolean | null
          bank_verified_at?: string | null
          bvn_verified?: boolean | null
          bvn_verified_at?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_subscribed?: boolean
          kyc_level?: number | null
          needs_role_selection?: boolean | null
          phone?: string | null
          phone_verification_code?: string | null
          phone_verification_expires?: string | null
          phone_verified?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          subscription_expires_at?: string | null
          subscription_plan_id?: string | null
          subscription_type?: string | null
          updated_at?: string
          verified_bank_account_name?: string | null
        }
        Update: {
          bank_verified?: boolean | null
          bank_verified_at?: string | null
          bvn_verified?: boolean | null
          bvn_verified_at?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_subscribed?: boolean
          kyc_level?: number | null
          needs_role_selection?: boolean | null
          phone?: string | null
          phone_verification_code?: string | null
          phone_verification_expires?: string | null
          phone_verified?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          subscription_expires_at?: string | null
          subscription_plan_id?: string | null
          subscription_type?: string | null
          updated_at?: string
          verified_bank_account_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_subscription_plan_id_fkey"
            columns: ["subscription_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      promoted_listings: {
        Row: {
          amount_paid: number
          created_at: string | null
          expires_at: string
          id: string
          is_active: boolean | null
          listing_type: string
          payment_ref: string | null
          product_id: string | null
          shop_id: string
          starts_at: string
        }
        Insert: {
          amount_paid: number
          created_at?: string | null
          expires_at: string
          id?: string
          is_active?: boolean | null
          listing_type?: string
          payment_ref?: string | null
          product_id?: string | null
          shop_id: string
          starts_at?: string
        }
        Update: {
          amount_paid?: number
          created_at?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean | null
          listing_type?: string
          payment_ref?: string | null
          product_id?: string | null
          shop_id?: string
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "promoted_listings_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promoted_listings_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promoted_listings_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string | null
          id: string
          points_earned: number | null
          qualified_at: string | null
          referral_code: string
          referred_id: string
          referrer_id: string
          rewarded_at: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          points_earned?: number | null
          qualified_at?: string | null
          referral_code: string
          referred_id: string
          referrer_id: string
          rewarded_at?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          points_earned?: number | null
          qualified_at?: string | null
          referral_code?: string
          referred_id?: string
          referrer_id?: string
          rewarded_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      revenue_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          gross_amount: number | null
          id: string
          metadata: Json | null
          order_id: string | null
          payment_method: string
          payment_reference: string | null
          platform_fee: number | null
          platform_fee_percentage: number | null
          recorded_at: string
          shop_id: string
          transaction_type: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          gross_amount?: number | null
          id?: string
          metadata?: Json | null
          order_id?: string | null
          payment_method?: string
          payment_reference?: string | null
          platform_fee?: number | null
          platform_fee_percentage?: number | null
          recorded_at?: string
          shop_id: string
          transaction_type?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          gross_amount?: number | null
          id?: string
          metadata?: Json | null
          order_id?: string | null
          payment_method?: string
          payment_reference?: string | null
          platform_fee?: number | null
          platform_fee_percentage?: number | null
          recorded_at?: string
          shop_id?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenue_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_transactions_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_transactions_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          customer_id: string | null
          customer_name: string | null
          id: string
          order_id: string | null
          rating: number
          shop_id: string
          updated_at: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_name?: string | null
          id?: string
          order_id?: string | null
          rating: number
          shop_id: string
          updated_at?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_name?: string | null
          id?: string
          order_id?: string | null
          rating?: number
          shop_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards_points: {
        Row: {
          created_at: string
          id: string
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rewards_prizes: {
        Row: {
          created_at: string
          description: string
          id: string
          image_url: string | null
          is_active: boolean
          points_required: number
          stock_quantity: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          points_required: number
          stock_quantity?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          points_required?: number
          stock_quantity?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      setup_requests: {
        Row: {
          admin_notes: string | null
          amount_paid: number | null
          business_description: string | null
          business_name: string
          completed_at: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          instagram_handle: string | null
          package_type: string | null
          paid_at: string | null
          payment_reference: string | null
          products_info: string | null
          started_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount_paid?: number | null
          business_description?: string | null
          business_name: string
          completed_at?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          instagram_handle?: string | null
          package_type?: string | null
          paid_at?: string | null
          payment_reference?: string | null
          products_info?: string | null
          started_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount_paid?: number | null
          business_description?: string | null
          business_name?: string
          completed_at?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          instagram_handle?: string | null
          package_type?: string | null
          paid_at?: string | null
          payment_reference?: string | null
          products_info?: string | null
          started_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "setup_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_addresses: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          city: string
          contact_name: string
          contact_phone: string
          country: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          label: string
          lat: number | null
          lng: number | null
          postal_code: string | null
          shop_id: string
          state: string
          updated_at: string | null
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          city: string
          contact_name: string
          contact_phone: string
          country?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          label: string
          lat?: number | null
          lng?: number | null
          postal_code?: string | null
          shop_id: string
          state: string
          updated_at?: string | null
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          contact_name?: string
          contact_phone?: string
          country?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          label?: string
          lat?: number | null
          lng?: number | null
          postal_code?: string | null
          shop_id?: string
          state?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shop_addresses_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_addresses_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_coupons: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          max_uses: number | null
          min_order_amount: number | null
          shop_id: string
          updated_at: string
          used_count: number
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          discount_type?: string
          discount_value: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_order_amount?: number | null
          shop_id: string
          updated_at?: string
          used_count?: number
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_order_amount?: number | null
          shop_id?: string
          updated_at?: string
          used_count?: number
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      shop_payouts: {
        Row: {
          account_name: string
          account_number: string
          admin_notes: string | null
          amount: number
          bank_name: string
          created_at: string
          id: string
          processed_at: string | null
          reference: string | null
          requested_at: string
          shop_id: string
          status: string
        }
        Insert: {
          account_name: string
          account_number: string
          admin_notes?: string | null
          amount: number
          bank_name: string
          created_at?: string
          id?: string
          processed_at?: string | null
          reference?: string | null
          requested_at?: string
          shop_id: string
          status?: string
        }
        Update: {
          account_name?: string
          account_number?: string
          admin_notes?: string | null
          amount?: number
          bank_name?: string
          created_at?: string
          id?: string
          processed_at?: string | null
          reference?: string | null
          requested_at?: string
          shop_id?: string
          status?: string
        }
        Relationships: []
      }
      shop_reactions: {
        Row: {
          created_at: string | null
          customer_id: string
          id: string
          reaction_type: string
          shop_id: string
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          id?: string
          reaction_type: string
          shop_id: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          id?: string
          reaction_type?: string
          shop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_reactions_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_reactions_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          accent_color: string | null
          average_rating: number | null
          bank_account_name: string | null
          bank_account_number: string | null
          bank_name: string | null
          banner_url: string | null
          country: string | null
          created_at: string
          description: string | null
          font_style: string | null
          id: string
          is_active: boolean
          is_verified: boolean | null
          logo_url: string | null
          owner_id: string
          payment_method: string | null
          paystack_public_key: string | null
          paystack_subaccount_code: string | null
          primary_color: string | null
          secondary_color: string | null
          settlement_account_number: string | null
          settlement_bank_code: string | null
          shop_name: string
          shop_slug: string
          state: string | null
          theme_mode: string | null
          total_reviews: number | null
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          accent_color?: string | null
          average_rating?: number | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          banner_url?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          font_style?: string | null
          id?: string
          is_active?: boolean
          is_verified?: boolean | null
          logo_url?: string | null
          owner_id: string
          payment_method?: string | null
          paystack_public_key?: string | null
          paystack_subaccount_code?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          settlement_account_number?: string | null
          settlement_bank_code?: string | null
          shop_name: string
          shop_slug: string
          state?: string | null
          theme_mode?: string | null
          total_reviews?: number | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          accent_color?: string | null
          average_rating?: number | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          banner_url?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          font_style?: string | null
          id?: string
          is_active?: boolean
          is_verified?: boolean | null
          logo_url?: string | null
          owner_id?: string
          payment_method?: string | null
          paystack_public_key?: string | null
          paystack_subaccount_code?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          settlement_account_number?: string | null
          settlement_bank_code?: string | null
          shop_name?: string
          shop_slug?: string
          state?: string | null
          theme_mode?: string | null
          total_reviews?: number | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shops_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      special_offers: {
        Row: {
          applies_to_subscription: boolean | null
          button_link: string
          button_text: string
          code: string | null
          created_at: string
          description: string
          discount_percentage: number | null
          id: string
          is_active: boolean
          original_price: number | null
          subscription_price: number | null
          target_audience: string
          title: string
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          applies_to_subscription?: boolean | null
          button_link?: string
          button_text?: string
          code?: string | null
          created_at?: string
          description: string
          discount_percentage?: number | null
          id?: string
          is_active?: boolean
          original_price?: number | null
          subscription_price?: number | null
          target_audience?: string
          title: string
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          applies_to_subscription?: boolean | null
          button_link?: string
          button_text?: string
          code?: string | null
          created_at?: string
          description?: string
          discount_percentage?: number | null
          id?: string
          is_active?: boolean
          original_price?: number | null
          subscription_price?: number | null
          target_audience?: string
          title?: string
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      subscription_history: {
        Row: {
          amount: number | null
          created_at: string | null
          created_by: string | null
          event_type: string
          id: string
          new_expiry_at: string | null
          notes: string | null
          payment_reference: string | null
          plan_id: string | null
          plan_name: string | null
          previous_expiry_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          created_by?: string | null
          event_type: string
          id?: string
          new_expiry_at?: string | null
          notes?: string | null
          payment_reference?: string | null
          plan_id?: string | null
          plan_name?: string | null
          previous_expiry_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          created_by?: string | null
          event_type?: string
          id?: string
          new_expiry_at?: string | null
          notes?: string | null
          payment_reference?: string | null
          plan_id?: string | null
          plan_name?: string | null
          previous_expiry_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_history_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_notifications: {
        Row: {
          created_at: string
          id: string
          notification_type: string
          sent_at: string
          subscription_expires_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notification_type: string
          sent_at?: string
          subscription_expires_at: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notification_type?: string
          sent_at?: string
          subscription_expires_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          ai_features_enabled: boolean | null
          created_at: string | null
          description: string | null
          display_order: number | null
          features: Json | null
          id: string
          includes_business_profile: boolean | null
          includes_google_setup: boolean | null
          includes_organic_marketing: boolean | null
          includes_seo: boolean | null
          is_active: boolean | null
          max_products: number | null
          name: string
          price_monthly: number
          price_yearly: number | null
          priority_support: boolean | null
          slug: string
        }
        Insert: {
          ai_features_enabled?: boolean | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          includes_business_profile?: boolean | null
          includes_google_setup?: boolean | null
          includes_organic_marketing?: boolean | null
          includes_seo?: boolean | null
          is_active?: boolean | null
          max_products?: number | null
          name: string
          price_monthly: number
          price_yearly?: number | null
          priority_support?: boolean | null
          slug: string
        }
        Update: {
          ai_features_enabled?: boolean | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          includes_business_profile?: boolean | null
          includes_google_setup?: boolean | null
          includes_organic_marketing?: boolean | null
          includes_seo?: boolean | null
          is_active?: boolean | null
          max_products?: number | null
          name?: string
          price_monthly?: number
          price_yearly?: number | null
          priority_support?: boolean | null
          slug?: string
        }
        Relationships: []
      }
      top_seller_banners: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          month_year: string
          shop_id: string
          total_sales: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          month_year: string
          shop_id: string
          total_sales: number
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          month_year?: string
          shop_id?: string
          total_sales?: number
        }
        Relationships: [
          {
            foreignKeyName: "top_seller_banners_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "top_seller_banners_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string | null
          earned_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          badge_id?: string | null
          earned_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          badge_id?: string | null
          earned_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_posters: {
        Row: {
          canvas_data: Json
          created_at: string | null
          id: string
          is_public: boolean | null
          name: string
          shop_id: string | null
          template_id: string | null
          thumbnail_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          canvas_data?: Json
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          shop_id?: string | null
          template_id?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          canvas_data?: Json
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          shop_id?: string | null
          template_id?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_posters_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_posters_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_posters_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "poster_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      shops_public: {
        Row: {
          average_rating: number | null
          banner_url: string | null
          created_at: string | null
          description: string | null
          id: string | null
          is_active: boolean | null
          is_verified: boolean | null
          logo_url: string | null
          payment_method: string | null
          paystack_public_key: string | null
          shop_name: string | null
          shop_slug: string | null
          total_reviews: number | null
          updated_at: string | null
          whatsapp_number: string | null
        }
        Insert: {
          average_rating?: number | null
          banner_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          payment_method?: string | null
          paystack_public_key?: string | null
          shop_name?: string | null
          shop_slug?: string | null
          total_reviews?: number | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          average_rating?: number | null
          banner_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          payment_method?: string | null
          paystack_public_key?: string | null
          shop_name?: string | null
          shop_slug?: string | null
          total_reviews?: number | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_feature_usage: {
        Args: { _feature_name: string; _user_id: string }
        Returns: Json
      }
      check_product_limit: { Args: { _user_id: string }; Returns: Json }
      check_shop_verification: { Args: { shop_uuid: string }; Returns: boolean }
      claim_prize: {
        Args: { p_prize_id: string; p_user_id: string }
        Returns: Json
      }
      cleanup_expired_featured_shops: { Args: never; Returns: undefined }
      cleanup_expired_rate_limits: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_feature_usage: {
        Args: { _feature_name: string; _user_id: string }
        Returns: number
      }
      order_exists: { Args: { order_id_param: string }; Returns: boolean }
      product_available: {
        Args: { product_id_param: string; quantity_param: number }
        Returns: boolean
      }
      shop_has_valid_subscription: {
        Args: { shop_id_param: string }
        Returns: boolean
      }
      shop_is_active: { Args: { shop_id_param: string }; Returns: boolean }
      update_all_shop_verifications: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "shop_owner" | "customer"
      user_role: "shop_owner" | "customer" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "shop_owner", "customer"],
      user_role: ["shop_owner", "customer", "admin"],
    },
  },
} as const
