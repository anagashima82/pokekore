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
      cards: {
        Row: {
          id: string
          card_number: string
          series_code: string
          name: string
          rarity: string
          image_path: string
          created_at: string
        }
        Insert: {
          id?: string
          card_number: string
          series_code: string
          name: string
          rarity: string
          image_path?: string
          created_at?: string
        }
        Update: {
          id?: string
          card_number?: string
          series_code?: string
          name?: string
          rarity?: string
          image_path?: string
          created_at?: string
        }
      }
      user_collections: {
        Row: {
          id: string
          user_id: string
          card_id: string
          owned: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          card_id: string
          owned?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          card_id?: string
          owned?: boolean
          updated_at?: string
        }
      }
      collection_settings: {
        Row: {
          id: string
          user_id: string
          rarity: string
          is_collecting: boolean
        }
        Insert: {
          id?: string
          user_id: string
          rarity: string
          is_collecting?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          rarity?: string
          is_collecting?: boolean
        }
      }
    }
  }
}
