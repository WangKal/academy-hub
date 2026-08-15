export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      academy_settings: {
        Row: {
          academy_name: string;
          allow_self_enrollment: boolean;
          certificate_prefix: string;
          default_currency: string;
          id: string;
          support_email: string;
          updated_at: string;
        };
        Insert: {
          academy_name?: string;
          allow_self_enrollment?: boolean;
          certificate_prefix?: string;
          default_currency?: string;
          id?: string;
          support_email?: string;
          updated_at?: string;
        };
        Update: {
          academy_name?: string;
          allow_self_enrollment?: boolean;
          certificate_prefix?: string;
          default_currency?: string;
          id?: string;
          support_email?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      admin_permissions: {
        Row: {
          created_at: string;
          granted_by: string | null;
          id: string;
          permissions: string[];
          sub_role: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          granted_by?: string | null;
          id?: string;
          permissions?: string[];
          sub_role?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          granted_by?: string | null;
          id?: string;
          permissions?: string[];
          sub_role?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      assignment_submissions: {
        Row: {
          attachment_url: string | null;
          content_text: string;
          created_at: string;
          feedback: string | null;
          grade: number | null;
          graded_at: string | null;
          graded_by: string | null;
          id: string;
          lesson_id: string;
          status: Database["public"]["Enums"]["submission_status"];
          submitted_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          attachment_url?: string | null;
          content_text?: string;
          created_at?: string;
          feedback?: string | null;
          grade?: number | null;
          graded_at?: string | null;
          graded_by?: string | null;
          id?: string;
          lesson_id: string;
          status?: Database["public"]["Enums"]["submission_status"];
          submitted_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          attachment_url?: string | null;
          content_text?: string;
          created_at?: string;
          feedback?: string | null;
          grade?: number | null;
          graded_at?: string | null;
          graded_by?: string | null;
          id?: string;
          lesson_id?: string;
          status?: Database["public"]["Enums"]["submission_status"];
          submitted_at?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          action: string;
          created_at: string;
          entity_id: string | null;
          entity_type: string;
          id: string;
          metadata: Json;
          user_id: string | null;
        };
        Insert: {
          action: string;
          created_at?: string;
          entity_id?: string | null;
          entity_type: string;
          id?: string;
          metadata?: Json;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string;
          id?: string;
          metadata?: Json;
          user_id?: string | null;
        };
        Relationships: [];
      };
      certificates: {
        Row: {
          certificate_code: string;
          certificate_url: string | null;
          course_id: string;
          created_at: string;
          id: string;
          issued_at: string;
          revoked_at: string | null;
          status: Database["public"]["Enums"]["certificate_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          certificate_code: string;
          certificate_url?: string | null;
          course_id: string;
          created_at?: string;
          id?: string;
          issued_at?: string;
          revoked_at?: string | null;
          status?: Database["public"]["Enums"]["certificate_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          certificate_code?: string;
          certificate_url?: string | null;
          course_id?: string;
          created_at?: string;
          id?: string;
          issued_at?: string;
          revoked_at?: string | null;
          status?: Database["public"]["Enums"]["certificate_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      cohorts: {
        Row: {
          created_at: string;
          description: string;
          end_date: string | null;
          id: string;
          name: string;
          organization_id: string;
          start_date: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string;
          end_date?: string | null;
          id?: string;
          name: string;
          organization_id: string;
          start_date?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          end_date?: string | null;
          id?: string;
          name?: string;
          organization_id?: string;
          start_date?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cohorts_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      courses: {
        Row: {
          category: string;
          created_at: string;
          currency: string;
          description_html: string;
          id: string;
          instructor_id: string;
          level: string;
          price_cents: number;
          short_description: string;
          slug: string;
          status: Database["public"]["Enums"]["course_status"];
          thumbnail_url: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          category?: string;
          created_at?: string;
          currency?: string;
          description_html?: string;
          id?: string;
          instructor_id: string;
          level?: string;
          price_cents?: number;
          short_description?: string;
          slug: string;
          status?: Database["public"]["Enums"]["course_status"];
          thumbnail_url?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          currency?: string;
          description_html?: string;
          id?: string;
          instructor_id?: string;
          level?: string;
          price_cents?: number;
          short_description?: string;
          slug?: string;
          status?: Database["public"]["Enums"]["course_status"];
          thumbnail_url?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "courses_instructor_id_fkey";
            columns: ["instructor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      enrollments: {
        Row: {
          completed_at: string | null;
          course_id: string;
          created_at: string;
          enrolled_at: string;
          id: string;
          status: Database["public"]["Enums"]["enrollment_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          course_id: string;
          created_at?: string;
          enrolled_at?: string;
          id?: string;
          status?: Database["public"]["Enums"]["enrollment_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          course_id?: string;
          created_at?: string;
          enrolled_at?: string;
          id?: string;
          status?: Database["public"]["Enums"]["enrollment_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      lesson_progress: {
        Row: {
          completed_at: string | null;
          created_at: string;
          id: string;
          last_position_seconds: number;
          lesson_id: string;
          status: Database["public"]["Enums"]["progress_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          last_position_seconds?: number;
          lesson_id: string;
          status?: Database["public"]["Enums"]["progress_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          last_position_seconds?: number;
          lesson_id?: string;
          status?: Database["public"]["Enums"]["progress_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
        ];
      };
      lessons: {
        Row: {
          content_html: string;
          created_at: string;
          duration_seconds: number;
          id: string;
          is_preview: boolean;
          lesson_type: Database["public"]["Enums"]["lesson_type"];
          module_id: string;
          order_index: number;
          status: Database["public"]["Enums"]["lesson_status"];
          title: string;
          updated_at: string;
          video_url: string | null;
        };
        Insert: {
          content_html?: string;
          created_at?: string;
          duration_seconds?: number;
          id?: string;
          is_preview?: boolean;
          lesson_type?: Database["public"]["Enums"]["lesson_type"];
          module_id: string;
          order_index?: number;
          status?: Database["public"]["Enums"]["lesson_status"];
          title: string;
          updated_at?: string;
          video_url?: string | null;
        };
        Update: {
          content_html?: string;
          created_at?: string;
          duration_seconds?: number;
          id?: string;
          is_preview?: boolean;
          lesson_type?: Database["public"]["Enums"]["lesson_type"];
          module_id?: string;
          order_index?: number;
          status?: Database["public"]["Enums"]["lesson_status"];
          title?: string;
          updated_at?: string;
          video_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "modules";
            referencedColumns: ["id"];
          },
        ];
      };
      modules: {
        Row: {
          course_id: string;
          created_at: string;
          description_html: string;
          id: string;
          order_index: number;
          title: string;
          updated_at: string;
        };
        Insert: {
          course_id: string;
          created_at?: string;
          description_html?: string;
          id?: string;
          order_index?: number;
          title: string;
          updated_at?: string;
        };
        Update: {
          course_id?: string;
          created_at?: string;
          description_html?: string;
          id?: string;
          order_index?: number;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          link: string | null;
          read_at: string | null;
          title: string;
          type: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          body?: string;
          created_at?: string;
          id?: string;
          link?: string | null;
          read_at?: string | null;
          title: string;
          type?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          link?: string | null;
          read_at?: string | null;
          title?: string;
          type?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      organization_members: {
        Row: {
          created_at: string;
          id: string;
          organization_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          organization_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          organization_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organizations: {
        Row: {
          code: string;
          contact_email: string;
          created_at: string;
          domain: string | null;
          id: string;
          logo_url: string | null;
          max_seats: number;
          name: string;
          updated_at: string;
        };
        Insert: {
          code: string;
          contact_email: string;
          created_at?: string;
          domain?: string | null;
          id?: string;
          logo_url?: string | null;
          max_seats?: number;
          name: string;
          updated_at?: string;
        };
        Update: {
          code?: string;
          contact_email?: string;
          created_at?: string;
          domain?: string | null;
          id?: string;
          logo_url?: string | null;
          max_seats?: number;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          amount_cents: number;
          course_id: string;
          created_at: string;
          currency: string;
          id: string;
          provider: Database["public"]["Enums"]["payment_provider"];
          provider_reference: string | null;
          status: Database["public"]["Enums"]["payment_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          amount_cents?: number;
          course_id: string;
          created_at?: string;
          currency?: string;
          id?: string;
          provider?: Database["public"]["Enums"]["payment_provider"];
          provider_reference?: string | null;
          status?: Database["public"]["Enums"]["payment_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          amount_cents?: number;
          course_id?: string;
          created_at?: string;
          currency?: string;
          id?: string;
          provider?: Database["public"]["Enums"]["payment_provider"];
          provider_reference?: string | null;
          status?: Database["public"]["Enums"]["payment_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          status: Database["public"]["Enums"]["user_status"];
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string;
          id: string;
          status?: Database["public"]["Enums"]["user_status"];
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
          status?: Database["public"]["Enums"]["user_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      quiz_attempts: {
        Row: {
          answers: Json;
          id: string;
          passed: boolean;
          quiz_id: string;
          score_percent: number;
          started_at: string;
          submitted_at: string;
          user_id: string;
        };
        Insert: {
          answers?: Json;
          id?: string;
          passed?: boolean;
          quiz_id: string;
          score_percent?: number;
          started_at?: string;
          submitted_at?: string;
          user_id: string;
        };
        Update: {
          answers?: Json;
          id?: string;
          passed?: boolean;
          quiz_id?: string;
          score_percent?: number;
          started_at?: string;
          submitted_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey";
            columns: ["quiz_id"];
            isOneToOne: false;
            referencedRelation: "quizzes";
            referencedColumns: ["id"];
          },
        ];
      };
      quiz_options: {
        Row: {
          created_at: string;
          id: string;
          is_correct: boolean;
          option_text: string;
          order_index: number;
          question_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_correct?: boolean;
          option_text: string;
          order_index?: number;
          question_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_correct?: boolean;
          option_text?: string;
          order_index?: number;
          question_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_options_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "quiz_questions";
            referencedColumns: ["id"];
          },
        ];
      };
      quiz_questions: {
        Row: {
          created_at: string;
          id: string;
          order_index: number;
          question_text: string;
          quiz_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          order_index?: number;
          question_text: string;
          quiz_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          order_index?: number;
          question_text?: string;
          quiz_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey";
            columns: ["quiz_id"];
            isOneToOne: false;
            referencedRelation: "quizzes";
            referencedColumns: ["id"];
          },
        ];
      };
      quizzes: {
        Row: {
          created_at: string;
          id: string;
          lesson_id: string;
          passing_score_percent: number;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          lesson_id: string;
          passing_score_percent?: number;
          title?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          lesson_id?: string;
          passing_score_percent?: number;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quizzes_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: true;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      course_is_published: { Args: { _course_id: string }; Returns: boolean };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_admin: { Args: never; Returns: boolean };
      module_is_published: { Args: { _module_id: string }; Returns: boolean };
      owns_course: { Args: { _course_id: string }; Returns: boolean };
      owns_lesson: { Args: { _lesson_id: string }; Returns: boolean };
      owns_module: { Args: { _module_id: string }; Returns: boolean };
      owns_quiz: { Args: { _quiz_id: string }; Returns: boolean };
    };
    Enums: {
      app_role: "student" | "instructor" | "admin";
      certificate_status: "issued" | "revoked";
      course_status: "draft" | "published" | "archived";
      enrollment_status: "pending" | "active" | "completed" | "cancelled" | "refunded";
      lesson_status: "draft" | "published";
      lesson_type: "video" | "text" | "quiz" | "assignment";
      payment_provider: "mpesa" | "stripe" | "manual";
      payment_status: "pending" | "succeeded" | "failed" | "refunded";
      progress_status: "not_started" | "in_progress" | "completed";
      submission_status: "submitted" | "graded" | "returned";
      user_status: "active" | "suspended" | "pending";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["student", "instructor", "admin"],
      certificate_status: ["issued", "revoked"],
      course_status: ["draft", "published", "archived"],
      enrollment_status: ["pending", "active", "completed", "cancelled", "refunded"],
      lesson_status: ["draft", "published"],
      lesson_type: ["video", "text", "quiz", "assignment"],
      payment_provider: ["mpesa", "stripe", "manual"],
      payment_status: ["pending", "succeeded", "failed", "refunded"],
      progress_status: ["not_started", "in_progress", "completed"],
      submission_status: ["submitted", "graded", "returned"],
      user_status: ["active", "suspended", "pending"],
    },
  },
} as const;
