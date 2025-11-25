export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          category: Database["public"]["Enums"]["app_category"]
          created_at: string | null
          description: string
          display_order: number
          icon_name: string
          id: string
          label: string
          updated_at: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["app_category"]
          created_at?: string | null
          description: string
          display_order?: number
          icon_name: string
          id?: string
          label: string
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["app_category"]
          created_at?: string | null
          description?: string
          display_order?: number
          icon_name?: string
          id?: string
          label?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      categories_screenshots: {
        Row: {
          category_id: string
          created_at: string | null
          description: string
          display_order: number
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          description: string
          display_order?: number
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          description?: string
          display_order?: number
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_screenshots_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      category_advices: {
        Row: {
          category_id: string
          created_at: string | null
          description: string
          display_order: number
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          description: string
          display_order?: number
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          description?: string
          display_order?: number
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "category_advices_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      prompts: {
        Row: {
          category: Database["public"]["Enums"]["app_category"]
          id: string
          prompt_text: string
          updated_at: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["app_category"]
          id?: string
          prompt_text: string
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["app_category"]
          id?: string
          prompt_text?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      requests: {
        Row: {
          category: Database["public"]["Enums"]["app_category"]
          created_at: string | null
          id: string
          image_url: string | null
          model_response: string | null
          ocr_text: string | null
          rating: number | null
          user_id: string
          user_message: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["app_category"]
          created_at?: string | null
          id?: string
          image_url?: string | null
          model_response?: string | null
          ocr_text?: string | null
          rating?: number | null
          user_id: string
          user_message?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["app_category"]
          created_at?: string | null
          id?: string
          image_url?: string | null
          model_response?: string | null
          ocr_text?: string | null
          rating?: number | null
          user_id?: string
          user_message?: string | null
        }
        Relationships: []
      }
      sessions_log: {
        Row: {
          date: string | null
          id: string
          user_id: string
        }
        Insert: {
          date?: string | null
          id?: string
          user_id: string
        }
        Update: {
          date?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          name: string
          is_approved: boolean
          has_completed_onboarding: boolean
          avatar_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          name: string
          is_approved?: boolean
          has_completed_onboarding?: boolean
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          is_approved?: boolean
          has_completed_onboarding?: boolean
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      preference_questions: {
        Row: {
          id: string
          question_key: string
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          options: Json | null
          is_required: boolean
          display_order: number
          help_text: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          question_key: string
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          options?: Json | null
          is_required?: boolean
          display_order?: number
          help_text?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          question_key?: string
          question_text?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          options?: Json | null
          is_required?: boolean
          display_order?: number
          help_text?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          question_key: string
          answer_value: string | null
          answer_values: string[] | null
          answer_number: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          question_key: string
          answer_value?: string | null
          answer_values?: string[] | null
          answer_number?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          question_key?: string
          answer_value?: string | null
          answer_values?: string[] | null
          answer_number?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_category: "gameplay" | "technical" | "strategy"
      question_type: "single_choice" | "multiple_choice" | "text" | "number" | "range"
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
      app_category: ["gameplay", "technical", "strategy"],
    },
  },
} as const
