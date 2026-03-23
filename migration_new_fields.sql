-- Migration: Add new fields to match Airtable schema
-- Run in Supabase SQL Editor

-- Participants: add language_course_cost and cultural_activities_cost
ALTER TABLE participants
  ADD COLUMN IF NOT EXISTS language_course_cost NUMERIC,
  ADD COLUMN IF NOT EXISTS cultural_activities_cost NUMERIC;

-- Accommodation: add all Airtable-missing fields
ALTER TABLE accommodation
  ADD COLUMN IF NOT EXISTS bank_sort_code TEXT,
  ADD COLUMN IF NOT EXISTS num_inhabitants INTEGER,
  ADD COLUMN IF NOT EXISTS has_infants BOOLEAN,
  ADD COLUMN IF NOT EXISTS has_smokers BOOLEAN,
  ADD COLUMN IF NOT EXISTS has_wardrobe BOOLEAN,
  ADD COLUMN IF NOT EXISTS has_bed BOOLEAN,
  ADD COLUMN IF NOT EXISTS bedroom_size_1 TEXT,
  ADD COLUMN IF NOT EXISTS bedroom_size_2 TEXT,
  ADD COLUMN IF NOT EXISTS bedroom_size_3 TEXT,
  ADD COLUMN IF NOT EXISTS bedroom_size_4 TEXT,
  ADD COLUMN IF NOT EXISTS num_toilets INTEGER,
  ADD COLUMN IF NOT EXISTS has_carpet BOOLEAN,
  ADD COLUMN IF NOT EXISTS bathrooms_unisex TEXT,
  ADD COLUMN IF NOT EXISTS has_sheets_towels BOOLEAN,
  ADD COLUMN IF NOT EXISTS last_contact_date DATE,
  ADD COLUMN IF NOT EXISTS family_rating INTEGER;

-- Language Course Providers: add website field
ALTER TABLE language_course_providers
  ADD COLUMN IF NOT EXISTS website TEXT;
