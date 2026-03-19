export interface AuthMeResponse {
  id: string;
  supabase_user_id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}
