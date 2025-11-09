import { createClient } from '@supabase/supabase-js';

// Client Supabase côté serveur avec service_role key pour bypasser RLS
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Client Supabase standard (respecte RLS)
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Types pour les tables Supabase
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: number;
          auth_id: string;
          full_name: string | null;
          email: string | null;
          phone_number: string | null;
          profile_picture: string | null;
          preferences: any | null;
          created_at: string;
          updated_at: string;
          last_signed_in: string;
        };
        Insert: {
          id?: number;
          auth_id: string;
          full_name?: string | null;
          email?: string | null;
          phone_number?: string | null;
          profile_picture?: string | null;
          preferences?: any | null;
          created_at?: string;
          updated_at?: string;
          last_signed_in?: string;
        };
        Update: {
          id?: number;
          auth_id?: string;
          full_name?: string | null;
          email?: string | null;
          phone_number?: string | null;
          profile_picture?: string | null;
          preferences?: any | null;
          created_at?: string;
          updated_at?: string;
          last_signed_in?: string;
        };
      };
      admins: {
        Row: {
          id: number;
          auth_id: string | null;
          full_name: string;
          email: string;
          role: 'super_admin' | 'admin' | 'moderator';
          permissions: any | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          auth_id?: string | null;
          full_name: string;
          email: string;
          role?: 'super_admin' | 'admin' | 'moderator';
          permissions?: any | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          auth_id?: string | null;
          full_name?: string;
          email?: string;
          role?: 'super_admin' | 'admin' | 'moderator';
          permissions?: any | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      hotel_partners: {
        Row: {
          id: number;
          auth_id: string | null;
          hotel_name: string;
          company: string;
          contact_name: string;
          email: string;
          phone: string | null;
          address: any | null;
          status: 'active' | 'inactive' | 'pending';
          commission_rate: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          auth_id?: string | null;
          hotel_name: string;
          company: string;
          contact_name: string;
          email: string;
          phone?: string | null;
          address?: any | null;
          status?: 'active' | 'inactive' | 'pending';
          commission_rate?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          auth_id?: string | null;
          hotel_name?: string;
          company?: string;
          contact_name?: string;
          email?: string;
          phone?: string | null;
          address?: any | null;
          status?: 'active' | 'inactive' | 'pending';
          commission_rate?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      experiences: {
        Row: {
          id: number;
          title: string;
          description: string;
          long_description: string | null;
          price: number;
          images: string;
          category: string;
          location: any | null;
          rating: string;
          review_count: number;
          items: any | null;
          check_in_info: any | null;
          transportation: any | null;
          accessibility: any | null;
          additional_info: any | null;
          schedules: any | null;
          date_start: string | null;
          date_end: string | null;
          company: string | null;
          image_url: string | null;
          is_active: boolean;
          created_by: number | null;
          last_modified_by: number | null;
          max_capacity: number;
          min_capacity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          title: string;
          description: string;
          long_description?: string | null;
          price: number;
          images: string;
          category: string;
          location?: any | null;
          rating?: string;
          review_count?: number;
          items?: any | null;
          check_in_info?: any | null;
          transportation?: any | null;
          accessibility?: any | null;
          additional_info?: any | null;
          schedules?: any | null;
          date_start?: string | null;
          date_end?: string | null;
          company?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          created_by?: number | null;
          last_modified_by?: number | null;
          max_capacity?: number;
          min_capacity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          title?: string;
          description?: string;
          long_description?: string | null;
          price?: number;
          images?: string;
          category?: string;
          location?: any | null;
          rating?: string;
          review_count?: number;
          items?: any | null;
          check_in_info?: any | null;
          transportation?: any | null;
          accessibility?: any | null;
          additional_info?: any | null;
          schedules?: any | null;
          date_start?: string | null;
          date_end?: string | null;
          company?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          created_by?: number | null;
          last_modified_by?: number | null;
          max_capacity?: number;
          min_capacity?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      reservations: {
        Row: {
          id: number;
          user_id: number;
          experience_id: number;
          booking_reference: string;
          check_in_date: string;
          check_out_date: string;
          room_type: string;
          guest_count: number;
          total_price: number;
          status: 'confirmed' | 'cancelled' | 'completed';
          payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
          admin_notes: string | null;
          cancellation_reason: string | null;
          cancelled_by: number | null;
          cancelled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: number;
          experience_id: number;
          booking_reference: string;
          check_in_date: string;
          check_out_date: string;
          room_type: string;
          guest_count?: number;
          total_price: number;
          status?: 'confirmed' | 'cancelled' | 'completed';
          payment_status?: 'pending' | 'paid' | 'refunded' | 'failed';
          admin_notes?: string | null;
          cancellation_reason?: string | null;
          cancelled_by?: number | null;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: number;
          experience_id?: number;
          booking_reference?: string;
          check_in_date?: string;
          check_out_date?: string;
          room_type?: string;
          guest_count?: number;
          total_price?: number;
          status?: 'confirmed' | 'cancelled' | 'completed';
          payment_status?: 'pending' | 'paid' | 'refunded' | 'failed';
          admin_notes?: string | null;
          cancellation_reason?: string | null;
          cancelled_by?: number | null;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      wishlists: {
        Row: {
          id: number;
          user_id: number;
          experience_id: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: number;
          experience_id: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: number;
          experience_id?: number;
          created_at?: string;
        };
      };
    };
  };
};
