// 装備コスト計算（サーバー側の正本）
// /api/posts の gear_posts 投稿・編集時に、クライアントが送った total_cp ではなく
// 武器種×出自×装備形態のスペックとカスタムオプション一覧からコストを再計算する。
import { getWeaponSpec, findOption } from '@/data/weaponData';

function toInt(v, fallback = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? Math.floor(n) : fallback;
}

/**
 * gear_posts 相当のオブジェクトからコストを算出する
 * - 本体CP：戦闘流派（weapon_type）が指定されていればスペック値。未指定なら申告値（0以上）
 * - オプションCP：カタログ登録済みの名前ならカタログ値。自由入力なら申告値（0以上）
 * @param {object} gear  gear_posts 相当（weapon_type / manufacturer / category / weapon_subtype / base_cp / options）
 * @returns {{ baseCp: number, optionCp: number, totalCp: number, optionCount: number, options: object[] }}
 */
export function calcGearCost(gear = {}) {
    let options = gear.options;
    if (typeof options === 'string') {
        try { options = JSON.parse(options); } catch (_) { options = []; }
    }
    if (!Array.isArray(options)) options = [];

    const normalized = options
        .filter(o => o && typeof o === 'object' && String(o.name || '').trim())
        .map(o => {
            const catalog = findOption(o.name);
            const cp = catalog ? toInt(catalog.cp) : Math.max(0, toInt(o.cp));
            return { ...o, cp };
        });

    const spec = gear.weapon_type
        ? getWeaponSpec(gear.weapon_type, gear.manufacturer || '汎用品', gear.category, gear.weapon_subtype || '')
        : null;
    const baseCp = spec ? toInt(spec.cp) : Math.max(0, toInt(gear.base_cp));
    const optionCp = normalized.reduce((s, o) => s + o.cp, 0);

    return {
        baseCp,
        optionCp,
        totalCp: baseCp + optionCp,
        optionCount: normalized.length,
        options: normalized,
    };
}
