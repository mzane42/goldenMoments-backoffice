-- Add size, bed_type columns to room_types table
-- size: Room size in square meters (integer)
-- bed_type: Type of bed (e.g., 'Lit king size', 'Lit queen', 'Deux lits simples')
-- amenities column already exists as JSONB

ALTER TABLE room_types
ADD COLUMN IF NOT EXISTS size INTEGER,
ADD COLUMN IF NOT EXISTS bed_type TEXT;
ADD COLUMN IF NOT EXISTS extras JSONB DEFAULT '[]'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN room_types.size IS 'Room size in square meters';
COMMENT ON COLUMN room_types.bed_type IS 'Type of bed (e.g., Lit king size, Lit queen, Deux lits simples)';
COMMENT ON COLUMN room_types.amenities IS 'Room amenities as JSON array (e.g., ["Douche", "Baignoire", "TV", "Mini bar"])';
