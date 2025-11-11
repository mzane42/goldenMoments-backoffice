-- Add extras column to experiences table
-- Extras will store optional add-ons with label, emoji, and price
-- Structure: [{ label: string, emoji: string, price: number }]
-- Prices are stored as decimal numbers (e.g., 25.00 for 25 EUR)

ALTER TABLE experiences
ADD COLUMN extras JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN experiences.extras IS 'Optional add-ons/extras for the experience. Array of objects with label, emoji, and price (decimal number).';
