-- Create the objections table
create table public.objections (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) not null,
  name text not null,
  product_info text,
  price text,
  file_url text, 
  context_text text, -- Extracted text from uploaded PDF/Text files for AI context
  type text check (type in ('purchase', 'sell')) not null,
  status text default 'in_progress' check (status in ('in_progress', 'completed')),
  chat_history jsonb default '[]'::jsonb,
  simulation_history jsonb default '[]'::jsonb
);

-- NOTE: If you already have the table, run these in your SQL editor:
-- ALTER TABLE public.objections ADD COLUMN status text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed'));
-- ALTER TABLE public.objections ADD COLUMN simulation_history jsonb DEFAULT '[]'::jsonb;

-- Enable Row Level Security (RLS)
alter table public.objections enable row level security;

-- Create Policies
create policy "Users can view their own objections"
  on public.objections for select
  using (auth.uid() = user_id);

create policy "Users can insert their own objections"
  on public.objections for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own objections"
  on public.objections for update
  using (auth.uid() = user_id);

create policy "Users can delete their own objections"
  on public.objections for delete
  using (auth.uid() = user_id);
