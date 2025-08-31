// Lightweight Supabase types scaffold. You can replace this file later with
// the official generated types: `supabase gen types typescript --project-id <id>`.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      podcast: {
        Row: {
          id: string
          name: string
          author: string
          episodes_count: number | null
          cover_url: string | null
          categories: string[] | null
          subscription: boolean | null
          is_subscribed: boolean | null
        }
        Insert: {
          id?: string
          name: string
          author: string
          episodes_count?: number | null
          cover_url?: string | null
          categories?: string[] | null
          subscription?: boolean | null
          is_subscribed?: boolean | null
        }
        Update: Partial<Database['public']['Tables']['podcast']['Insert']>
        Relationships: []
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}

// Helper types matching Supabase generated style
export type PublicSchema = Database['public']

export type Tables<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T] extends { Row: infer R } ? R : never

export type TablesInsert<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T] extends { Insert: infer I } ? I : never

export type TablesUpdate<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T] extends { Update: infer U } ? U : never
