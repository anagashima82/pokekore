import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing environment variables. Check .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

const RARITY_CHOICES = [
  'C', 'U', 'R', 'RR', 'RRR', 'SR', 'SAR', 'AR', 'UR', 'SSR', 'HR', 'CSR'
];

async function importCards() {
  const imagesDir = path.join(__dirname, '../public/cards');

  if (!fs.existsSync(imagesDir)) {
    console.error('Images directory not found:', imagesDir);
    process.exit(1);
  }

  const files = fs.readdirSync(imagesDir);
  const pattern = /^([a-zA-Z0-9_]+?)_(\d+(?:-\d+)?)\.(?:png|jpg)$/;

  const cards: Array<{
    card_number: string;
    series_code: string;
    name: string;
    rarity: string;
    image_path: string;
  }> = [];

  for (const filename of files) {
    const match = filename.match(pattern);
    if (!match) {
      console.log(`Skipped: ${filename}`);
      continue;
    }

    const seriesCode = match[1];
    const cardNumber = match[2];

    cards.push({
      card_number: cardNumber,
      series_code: seriesCode,
      name: `${seriesCode} #${cardNumber}`,
      rarity: 'AR', // All cards are AR
      image_path: `/cards/${filename}`,
    });
  }

  console.log(`Found ${cards.length} cards to import`);

  // Clear existing cards
  const { error: deleteError } = await supabase
    .from('cards')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (deleteError) {
    console.error('Error deleting cards:', deleteError);
  }

  // Insert cards in batches
  const batchSize = 100;
  for (let i = 0; i < cards.length; i += batchSize) {
    const batch = cards.slice(i, i + batchSize);
    const { error } = await supabase.from('cards').insert(batch);

    if (error) {
      console.error(`Error inserting batch ${i / batchSize}:`, error);
    } else {
      console.log(`Inserted batch ${i / batchSize + 1} (${batch.length} cards)`);
    }
  }

  // Initialize collection settings
  console.log('Initializing collection settings...');

  for (const rarity of RARITY_CHOICES) {
    const { error } = await supabase
      .from('collection_settings')
      .upsert({
        user_id: DEFAULT_USER_ID,
        rarity,
        is_collecting: true,
      }, {
        onConflict: 'user_id,rarity'
      });

    if (error) {
      console.error(`Error creating setting for ${rarity}:`, error);
    }
  }

  console.log('Import complete!');
}

importCards().catch(console.error);
