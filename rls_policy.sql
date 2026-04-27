-- Enable RLS for all tables (if not already enabled)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_scopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts when running multiple times)
DROP POLICY IF EXISTS "Allow authenticated users full access to projects" ON public.projects;
DROP POLICY IF EXISTS "Allow authenticated users full access to project_scopes" ON public.project_scopes;
DROP POLICY IF EXISTS "Allow authenticated users full access to tasks" ON public.tasks;
DROP POLICY IF EXISTS "Allow authenticated users full access to project_notes" ON public.project_notes;
DROP POLICY IF EXISTS "Allow authenticated users full access to project_files" ON public.project_files;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- Create policies allowing ALL authenticated users to perform CRUD operations
CREATE POLICY "Allow authenticated users full access to projects" 
ON public.projects FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to project_scopes" 
ON public.project_scopes FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to tasks" 
ON public.tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to project_notes" 
ON public.project_notes FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to project_files" 
ON public.project_files FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Storage bucket policies (for uploading files)
CREATE POLICY "Allow authenticated uploads" 
ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'project-assets');

CREATE POLICY "Allow public read" 
ON storage.objects FOR SELECT TO public USING (bucket_id = 'project-assets');

CREATE POLICY "Allow authenticated deletes" 
ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'project-assets');
