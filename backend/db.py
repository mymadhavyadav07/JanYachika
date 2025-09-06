from supabase import create_client, Client
import os
import dotenv

dotenv.load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")  # Use service role for server access

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
