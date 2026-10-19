export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      kitchen_business_settings: {
        Row: {
          accepting_orders: boolean;
          closing_time: string;
          delivery_fee: number;
          delivery_fee_paise: number;
          id: boolean;
          opening_time: string;
          sound_enabled: boolean;
          timezone: string;
          updated_at: string;
        };
        Insert: {
          accepting_orders?: boolean;
          closing_time?: string;
          delivery_fee?: number;
          delivery_fee_paise?: number;
          id?: boolean;
          opening_time?: string;
          sound_enabled?: boolean;
          timezone?: string;
          updated_at?: string;
        };
        Update: {
          accepting_orders?: boolean;
          closing_time?: string;
          delivery_fee?: number;
          delivery_fee_paise?: number;
          id?: boolean;
          opening_time?: string;
          sound_enabled?: boolean;
          timezone?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      kitchen_delivery_settings: {
        Row: {
          delivery_fee: number;
          id: boolean;
          updated_at: string;
        };
        Insert: {
          delivery_fee?: number;
          id?: boolean;
          updated_at?: string;
        };
        Update: {
          delivery_fee?: number;
          id?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      menu_item_variants: {
        Row: {
          id: string;
          item_id: string;
          name: string;
          price: number;
          sort_order: number;
        };
        Insert: {
          id?: string;
          item_id: string;
          name: string;
          price: number;
          sort_order?: number;
        };
        Update: {
          id?: string;
          item_id?: string;
          name?: string;
          price?: number;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "menu_item_variants_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "menu_items";
            referencedColumns: ["id"];
          },
        ];
      };
      menu_items: {
        Row: {
          category: string;
          created_at: string;
          description: string | null;
          id: string;
          image_url: string | null;
          is_available: boolean;
          name: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          category?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_available?: boolean;
          name: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_available?: boolean;
          name?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          access_token: string;
          created_at: string;
          customer_name: string;
          customer_phone: string;
          delivery_address: string;
          delivery_fee_paise: number;
          id: string;
          landmark: string | null;
          order_number: string;
          payment_reference: string | null;
          payment_status: Database["public"]["Enums"]["payment_status"];
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          refund_amount_paise: number | null;
          special_instructions: string | null;
          status: Database["public"]["Enums"]["order_status"];
          subtotal_paise: number;
          total_paise: number;
          updated_at: string;
        };
        Insert: {
          access_token?: string;
          created_at?: string;
          customer_name: string;
          customer_phone: string;
          delivery_address: string;
          delivery_fee_paise: number;
          id?: string;
          landmark?: string | null;
          order_number?: string;
          payment_reference?: string | null;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          refund_amount_paise?: number | null;
          special_instructions?: string | null;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal_paise: number;
          total_paise: number;
          updated_at?: string;
        };
        Update: {
          access_token?: string;
          created_at?: string;
          customer_name?: string;
          customer_phone?: string;
          delivery_address?: string;
          delivery_fee_paise?: number;
          id?: string;
          landmark?: string | null;
          order_number?: string;
          payment_reference?: string | null;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          refund_amount_paise?: number | null;
          special_instructions?: string | null;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal_paise?: number;
          total_paise?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          product_name: string;
          quantity: number;
          unit_price_paise: number;
          variant_id: string | null;
          variant_name: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          product_name: string;
          quantity: number;
          unit_price_paise: number;
          variant_id?: string | null;
          variant_name?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          product_name?: string;
          quantity?: number;
          unit_price_paise?: number;
          variant_id?: string | null;
          variant_name?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      order_status_events: {
        Row: {
          created_at: string;
          id: string;
          note: string | null;
          order_id: string;
          status: Database["public"]["Enums"]["order_status"];
        };
        Insert: {
          created_at?: string;
          id?: string;
          note?: string | null;
          order_id: string;
          status: Database["public"]["Enums"]["order_status"];
        };
        Update: {
          created_at?: string;
          id?: string;
          note?: string | null;
          order_id?: string;
          status?: Database["public"]["Enums"]["order_status"];
        };
        Relationships: [
          {
            foreignKeyName: "order_status_events_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      kitchen_account_exists: { Args: never; Returns: boolean };
      transition_order_status: {
        Args: {
          p_order_id: string;
          p_to_status: Database["public"]["Enums"]["order_status"];
          p_note?: string | null;
        };
        Returns: Database["public"]["Tables"]["orders"]["Row"];
      };
      get_customer_order: {
        Args: {
          p_order_id: string;
          p_access_token: string;
        };
        Returns: Json;
      };
    };
    Enums: {
      app_role: "admin";
      order_status:
        | "pending_payment"
        | "new"
        | "accepted"
        | "preparing"
        | "ready_for_pickup"
        | "picked_up"
        | "delivered"
        | "rejected"
        | "cancelled"
        | "refund_pending"
        | "refunded";
      payment_status: "unpaid" | "paid" | "failed" | "refund_pending" | "refunded";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
