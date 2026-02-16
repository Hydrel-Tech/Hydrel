
import { createClient } from '@supabase/supabase-js';

// NOTE: In a real production app, these should be environment variables.
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://vmsgrftdeopmidridmhh.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtc2dyZnRkZW9wbWlkcmlkbWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDc1NTYsImV4cCI6MjA4NjMyMzU1Nn0.AfA4EjjMtN_ttUVYMRex03eAk6guT20DaBZYNbeqQ5o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
