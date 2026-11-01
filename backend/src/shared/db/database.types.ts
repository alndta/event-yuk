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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      crew_applications: {
        Row: {
          checkin_time: string | null
          checkout_time: string | null
          created_at: string | null
          crew_user_id: string
          id: string
          payout_status: string | null
          selection_status: string | null
          shift_id: string
        }
        Insert: {
          checkin_time?: string | null
          checkout_time?: string | null
          created_at?: string | null
          crew_user_id: string
          id?: string
          payout_status?: string | null
          selection_status?: string | null
          shift_id: string
        }
        Update: {
          checkin_time?: string | null
          checkout_time?: string | null
          created_at?: string | null
          crew_user_id?: string
          id?: string
          payout_status?: string | null
          selection_status?: string | null
          shift_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crew_applications_crew_user_id_fkey"
            columns: ["crew_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_applications_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "crew_shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_shifts: {
        Row: {
          created_at: string | null
          end_time: string
          event_id: string
          headcount_req: number
          id: string
          qr_checkin_token: string | null
          rate_per_shift: number
          role_title: string
          shift_date: string
          start_time: string
        }
        Insert: {
          created_at?: string | null
          end_time: string
          event_id: string
          headcount_req?: number
          id?: string
          qr_checkin_token?: string | null
          rate_per_shift: number
          role_title: string
          shift_date: string
          start_time: string
        }
        Update: {
          created_at?: string | null
          end_time?: string
          event_id?: string
          headcount_req?: number
          id?: string
          qr_checkin_token?: string | null
          rate_per_shift?: number
          role_title?: string
          shift_date?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "crew_shifts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      escrow_disbursements: {
        Row: {
          bast_proof_url: string | null
          escrow_tx_id: string
          id: string
          milestone_stage: string
          pg_reference_id: string | null
          release_amount: number
          released_at: string | null
        }
        Insert: {
          bast_proof_url?: string | null
          escrow_tx_id: string
          id?: string
          milestone_stage: string
          pg_reference_id?: string | null
          release_amount: number
          released_at?: string | null
        }
        Update: {
          bast_proof_url?: string | null
          escrow_tx_id?: string
          id?: string
          milestone_stage?: string
          pg_reference_id?: string | null
          release_amount?: number
          released_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escrow_disbursements_escrow_tx_id_fkey"
            columns: ["escrow_tx_id"]
            isOneToOne: false
            referencedRelation: "escrow_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      escrow_transactions: {
        Row: {
          created_at: string | null
          escrow_state: string | null
          event_id: string
          gross_amount: number
          id: string
          idempotency_key: string | null
          payee_id: string
          payer_id: string
          platform_fee: number
          ref_id: string | null
          ref_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          escrow_state?: string | null
          event_id: string
          gross_amount: number
          id?: string
          idempotency_key?: string | null
          payee_id: string
          payer_id: string
          platform_fee?: number
          ref_id?: string | null
          ref_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          escrow_state?: string | null
          event_id?: string
          gross_amount?: number
          id?: string
          idempotency_key?: string | null
          payee_id?: string
          payer_id?: string
          platform_fee?: number
          ref_id?: string | null
          ref_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escrow_transactions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escrow_transactions_payee_id_fkey"
            columns: ["payee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escrow_transactions_payer_id_fkey"
            columns: ["payer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      event_proposals: {
        Row: {
          attached_file_name: string | null
          attached_file_size: string | null
          contract_document_url: string | null
          contract_pks_number: string | null
          counter_dp_percentage: number | null
          counter_notes: string | null
          counter_price: number | null
          created_at: string | null
          deal_price: number | null
          direction: string
          dp_percentage: number | null
          event_id: string
          id: string
          last_action_by: string | null
          offered_price: number
          proposal_type: string
          receiver_id: string
          riders_or_specs: Json | null
          scope_of_work: string | null
          sender_id: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          attached_file_name?: string | null
          attached_file_size?: string | null
          contract_document_url?: string | null
          contract_pks_number?: string | null
          counter_dp_percentage?: number | null
          counter_notes?: string | null
          counter_price?: number | null
          created_at?: string | null
          deal_price?: number | null
          direction: string
          dp_percentage?: number | null
          event_id: string
          id?: string
          last_action_by?: string | null
          offered_price?: number
          proposal_type: string
          receiver_id: string
          riders_or_specs?: Json | null
          scope_of_work?: string | null
          sender_id: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          attached_file_name?: string | null
          attached_file_size?: string | null
          contract_document_url?: string | null
          contract_pks_number?: string | null
          counter_dp_percentage?: number | null
          counter_notes?: string | null
          counter_price?: number | null
          created_at?: string | null
          deal_price?: number | null
          direction?: string
          dp_percentage?: number | null
          event_id?: string
          id?: string
          last_action_by?: string | null
          offered_price?: number
          proposal_type?: string
          receiver_id?: string
          riders_or_specs?: Json | null
          scope_of_work?: string | null
          sender_id?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_proposals_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_proposals_last_action_by_fkey"
            columns: ["last_action_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_proposals_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_proposals_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          aftermovie_url: string | null
          allow_crew_applications: boolean | null
          allow_talent_proposals: boolean | null
          allow_tenant_registrations: boolean | null
          allow_vendor_proposals: boolean | null
          attendee_count: number | null
          banner_image: string | null
          created_at: string | null
          description: string | null
          end_date: string
          event_category: string
          gallery_photos: Json | null
          gps_lat_lng: string | null
          id: string
          is_invite_only: boolean | null
          is_portfolio: boolean | null
          organizer_id: string
          start_date: string
          status: string | null
          title: string
          total_budget: number | null
          updated_at: string | null
          venue_map_url: string | null
          venue_name: string
        }
        Insert: {
          aftermovie_url?: string | null
          allow_crew_applications?: boolean | null
          allow_talent_proposals?: boolean | null
          allow_tenant_registrations?: boolean | null
          allow_vendor_proposals?: boolean | null
          attendee_count?: number | null
          banner_image?: string | null
          created_at?: string | null
          description?: string | null
          end_date: string
          event_category: string
          gallery_photos?: Json | null
          gps_lat_lng?: string | null
          id?: string
          is_invite_only?: boolean | null
          is_portfolio?: boolean | null
          organizer_id: string
          start_date: string
          status?: string | null
          title: string
          total_budget?: number | null
          updated_at?: string | null
          venue_map_url?: string | null
          venue_name: string
        }
        Update: {
          aftermovie_url?: string | null
          allow_crew_applications?: boolean | null
          allow_talent_proposals?: boolean | null
          allow_tenant_registrations?: boolean | null
          allow_vendor_proposals?: boolean | null
          attendee_count?: number | null
          banner_image?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string
          event_category?: string
          gallery_photos?: Json | null
          gps_lat_lng?: string | null
          id?: string
          is_invite_only?: boolean | null
          is_portfolio?: boolean | null
          organizer_id?: string
          start_date?: string
          status?: string | null
          title?: string
          total_budget?: number | null
          updated_at?: string | null
          venue_map_url?: string | null
          venue_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_codes: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          identifier: string
          is_used: boolean | null
          otp_code: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          identifier: string
          is_used?: boolean | null
          otp_code: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          identifier?: string
          is_used?: boolean | null
          otp_code?: string
        }
        Relationships: []
      }
      sponsorship_packages: {
        Row: {
          benefits: Json | null
          booth_size: string | null
          created_at: string | null
          event_id: string
          id: string
          is_active: boolean | null
          package_name: string
          price: number
          slots_booked: number | null
          slots_total: number | null
          tier: string
        }
        Insert: {
          benefits?: Json | null
          booth_size?: string | null
          created_at?: string | null
          event_id: string
          id?: string
          is_active?: boolean | null
          package_name: string
          price: number
          slots_booked?: number | null
          slots_total?: number | null
          tier: string
        }
        Update: {
          benefits?: Json | null
          booth_size?: string | null
          created_at?: string | null
          event_id?: string
          id?: string
          is_active?: boolean | null
          package_name?: string
          price?: number
          slots_booked?: number | null
          slots_total?: number | null
          tier?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsorship_packages_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_profiles: {
        Row: {
          base_rate: number | null
          created_at: string | null
          genre: string | null
          hospitality_riders: Json | null
          id: string
          is_available: boolean | null
          manager_contact: string | null
          manager_name: string | null
          portfolio_links: Json | null
          stage_name: string
          technical_riders: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          base_rate?: number | null
          created_at?: string | null
          genre?: string | null
          hospitality_riders?: Json | null
          id?: string
          is_available?: boolean | null
          manager_contact?: string | null
          manager_name?: string | null
          portfolio_links?: Json | null
          stage_name: string
          technical_riders?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          base_rate?: number | null
          created_at?: string | null
          genre?: string | null
          hospitality_riders?: Json | null
          id?: string
          is_available?: boolean | null
          manager_contact?: string | null
          manager_name?: string | null
          portfolio_links?: Json | null
          stage_name?: string
          technical_riders?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "talent_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_booths: {
        Row: {
          booth_category: string
          booth_code: string
          created_at: string | null
          event_id: string
          id: string
          is_occupied: boolean | null
          rental_price: number
          size_dimension: string | null
        }
        Insert: {
          booth_category: string
          booth_code: string
          created_at?: string | null
          event_id: string
          id?: string
          is_occupied?: boolean | null
          rental_price: number
          size_dimension?: string | null
        }
        Update: {
          booth_category?: string
          booth_code?: string
          created_at?: string | null
          event_id?: string
          id?: string
          is_occupied?: boolean | null
          rental_price?: number
          size_dimension?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_booths_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_registrations: {
        Row: {
          booth_id: string
          brand_name: string
          created_at: string | null
          curation_status: string | null
          id: string
          invoice_due_at: string | null
          product_photos: Json | null
          tenant_user_id: string
        }
        Insert: {
          booth_id: string
          brand_name: string
          created_at?: string | null
          curation_status?: string | null
          id?: string
          invoice_due_at?: string | null
          product_photos?: Json | null
          tenant_user_id: string
        }
        Update: {
          booth_id?: string
          brand_name?: string
          created_at?: string | null
          curation_status?: string | null
          id?: string
          invoice_due_at?: string | null
          product_photos?: Json | null
          tenant_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_registrations_booth_id_fkey"
            columns: ["booth_id"]
            isOneToOne: false
            referencedRelation: "tenant_booths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_registrations_tenant_user_id_fkey"
            columns: ["tenant_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles_roles: {
        Row: {
          bank_account: Json | null
          business_name: string | null
          city_region: string | null
          created_at: string | null
          id: string
          rating_avg: number | null
          role_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bank_account?: Json | null
          business_name?: string | null
          city_region?: string | null
          created_at?: string | null
          id?: string
          rating_avg?: number | null
          role_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bank_account?: Json | null
          business_name?: string | null
          city_region?: string | null
          created_at?: string | null
          id?: string
          rating_avg?: number | null
          role_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          kyc_status: string | null
          password_hash: string | null
          phone_wa: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          kyc_status?: string | null
          password_hash?: string | null
          phone_wa?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          kyc_status?: string | null
          password_hash?: string | null
          phone_wa?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vendor_bookings: {
        Row: {
          agreed_price: number
          booked_date: string
          booking_status: string | null
          created_at: string | null
          dp_pct: number | null
          event_id: string
          id: string
          package_id: string
          spk_document: string | null
          updated_at: string | null
        }
        Insert: {
          agreed_price: number
          booked_date: string
          booking_status?: string | null
          created_at?: string | null
          dp_pct?: number | null
          event_id: string
          id?: string
          package_id: string
          spk_document?: string | null
          updated_at?: string | null
        }
        Update: {
          agreed_price?: number
          booked_date?: string
          booking_status?: string | null
          created_at?: string | null
          dp_pct?: number | null
          event_id?: string
          id?: string
          package_id?: string
          spk_document?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_bookings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_bookings_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "vendor_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_packages: {
        Row: {
          base_price: number
          category: string
          created_at: string | null
          daily_quota: number
          id: string
          is_active: boolean | null
          package_name: string
          tech_specs: Json | null
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          base_price: number
          category: string
          created_at?: string | null
          daily_quota?: number
          id?: string
          is_active?: boolean | null
          package_name: string
          tech_specs?: Json | null
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          base_price?: number
          category?: string
          created_at?: string | null
          daily_quota?: number
          id?: string
          is_active?: boolean | null
          package_name?: string
          tech_specs?: Json | null
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_packages_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          available_bal: number | null
          currency: string | null
          escrow_locked: number | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          available_bal?: number | null
          currency?: string | null
          escrow_locked?: number | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          available_bal?: number | null
          currency?: string | null
          escrow_locked?: number | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
