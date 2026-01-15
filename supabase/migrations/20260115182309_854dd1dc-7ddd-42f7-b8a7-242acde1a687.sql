-- Create table for TV mode media items
CREATE TABLE public.tv_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video')),
  file_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tv_media ENABLE ROW LEVEL SECURITY;

-- For now, allow public read access (TV mode is displayed publicly)
CREATE POLICY "Anyone can view tv media"
ON public.tv_media
FOR SELECT
USING (true);

-- Allow authenticated users to manage media (RH admins)
CREATE POLICY "Authenticated users can insert tv media"
ON public.tv_media
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update tv media"
ON public.tv_media
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete tv media"
ON public.tv_media
FOR DELETE
TO authenticated
USING (true);

-- Create storage bucket for TV media
INSERT INTO storage.buckets (id, name, public)
VALUES ('tv-media', 'tv-media', true);

-- Allow public read access to TV media bucket
CREATE POLICY "TV media is publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'tv-media');

-- Allow authenticated users to upload to TV media bucket
CREATE POLICY "Authenticated users can upload tv media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tv-media');

-- Allow authenticated users to delete from TV media bucket
CREATE POLICY "Authenticated users can delete tv media files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'tv-media');