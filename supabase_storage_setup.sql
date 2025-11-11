-- =====================================================
-- Supabase Storage Setup for Image Upload System
-- =====================================================
-- This migration creates the 'hotels' storage bucket and configures
-- Row Level Security (RLS) policies for image uploads.
--
-- Run this in the Supabase SQL Editor or via migrations
-- =====================================================

-- Create the 'hotels' storage bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hotels',
  'hotels',
  true, -- public bucket for read access
  10485760, -- 10MB file size limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- RLS Policies for storage.objects
-- =====================================================

-- Policy 1: Allow PUBLIC READ access to all images in 'hotels' bucket
CREATE POLICY "Public read access for hotel images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'hotels');

-- Policy 2: Allow AUTHENTICATED users to UPLOAD images
-- (Will be further restricted by application logic to check admin/partner roles)
CREATE POLICY "Authenticated users can upload hotel images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'hotels'
  AND auth.role() = 'authenticated'
);

-- Policy 3: Allow AUTHENTICATED users to UPDATE images they own
-- (Images are owned by the user who uploaded them)
CREATE POLICY "Users can update their own hotel images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'hotels'
  AND auth.uid() = owner
)
WITH CHECK (
  bucket_id = 'hotels'
  AND auth.uid() = owner
);

-- Policy 4: Allow AUTHENTICATED users to DELETE images they own
CREATE POLICY "Users can delete their own hotel images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'hotels'
  AND auth.uid() = owner
);

-- =====================================================
-- Additional Security: Admin Override Policy (Optional)
-- =====================================================
-- This policy allows admins to delete any image in the 'hotels' bucket
-- Uncomment if you want admins to have full control over all images

-- CREATE POLICY "Admins can delete any hotel image"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (
--   bucket_id = 'hotels'
--   AND EXISTS (
--     SELECT 1 FROM public.admins
--     WHERE admins.auth_id = auth.uid()
--     AND admins.is_active = true
--   )
-- );

-- =====================================================
-- Verify Setup
-- =====================================================
-- Run these queries to verify the setup:
--
-- 1. Check if bucket exists:
--    SELECT * FROM storage.buckets WHERE id = 'hotels';
--
-- 2. Check policies:
--    SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%hotel%';
--
-- =====================================================
