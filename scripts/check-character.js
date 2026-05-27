// 一時調査用：指定キャラ名でステータスを確認
// 使い方：node scripts/check-character.js "泉 文香"
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const env = fs.readFileSync(envPath, 'utf8').split(/\r?\n/).reduce((acc, line) => {
    const eq = line.indexOf('=');
    if (eq <= 0) return acc;
    const key = line.substring(0, eq).trim();
    const val = line.substring(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !key.startsWith('#')) acc[key] = val;
    return acc;
}, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const query = process.argv[2] || '泉';

(async () => {
    const { data, error } = await supabase
        .from('character_sheets')
        .select('id, character_name, level, status_points_used, rank_tai, rank_haya, rank_shiki, rank_han, rank_shiya, rank_jutsu, rank_kon, background, sub_affiliation, awakening, stage_plus, updated_at')
        .ilike('character_name', `%${query}%`);
    if (error) {
        console.error('Error:', error.message);
        return;
    }
    console.log(`Found ${data.length} character(s) matching "${query}":\n`);
    data.forEach(c => {
        console.log(`--- ${c.character_name} (id: ${c.id}) ---`);
        console.log(`Level: ${c.level} / status_points_used: ${c.status_points_used}`);
        console.log(`Available status points: ${Math.floor((c.level || 1) / 5) - (c.status_points_used || 0)}`);
        console.log(`Background: ${c.background} / Assignment: ${c.sub_affiliation} / Awakening: ${c.awakening}`);
        console.log(`Ranks: 体=${c.rank_tai} 疾=${c.rank_haya} 識=${c.rank_shiki} 判=${c.rank_han} 察=${c.rank_shiya} 術=${c.rank_jutsu} 魂=${c.rank_kon}`);
        console.log(`Stage+: ${JSON.stringify(c.stage_plus)}`);
        console.log(`Updated: ${c.updated_at}`);
        console.log('');
    });
})();
