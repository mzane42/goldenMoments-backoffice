-- Add night options to experiences table and reservation improvements
-- allowed_nights: Array of allowed night durations (e.g., [1,2,3] for flexible, [2] for 2-nights only)
-- This represents the hotel's booking policy (minimum stay, allowed durations)

-- 1. Add allowed_nights to experiences table
ALTER TABLE experiences
ADD COLUMN IF NOT EXISTS allowed_nights INTEGER[] DEFAULT '{1,2,3}'::INTEGER[];

COMMENT ON COLUMN experiences.allowed_nights IS 'Allowed night durations for bookings (e.g., [1,2,3] = flexible, [2] = 2-nights only)';

-- 2. Add room_type_id foreign key to reservations table
ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS room_type_id UUID REFERENCES room_types(id) ON DELETE SET NULL;

COMMENT ON COLUMN reservations.room_type_id IS 'Foreign key to room_types table for proper relational link';

-- 3. Add nights column to reservations table
ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS nights INTEGER;

COMMENT ON COLUMN reservations.nights IS 'Number of nights for the reservation (calculated from check_in_date to check_out_date)';

-- 4. Add price_breakdown to reservations table
ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS price_breakdown JSONB DEFAULT '{}'::JSONB;

COMMENT ON COLUMN reservations.price_breakdown IS 'Detailed price breakdown including nightly rates, extras, and total';

-- 5. Add check constraint for valid nights
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'valid_nights'
        AND conrelid = 'reservations'::regclass
    ) THEN
        ALTER TABLE reservations
        ADD CONSTRAINT valid_nights CHECK (nights > 0 AND nights <= 30);
    END IF;
END $$;

-- 6. Create index on room_type_id for better query performance
CREATE INDEX IF NOT EXISTS idx_reservations_room_type_id ON reservations(room_type_id);

-- 7. Create index on experiences.allowed_nights for array queries
CREATE INDEX IF NOT EXISTS idx_experiences_allowed_nights ON experiences USING GIN(allowed_nights);
