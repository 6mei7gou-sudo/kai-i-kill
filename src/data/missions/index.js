// ミッション一覧エクスポート
import missionGrade5 from './mission_grade5_stray.json';
import missionGrade4 from './mission_grade4_mirror.json';
import missionGrade3 from './mission_grade3_station.json';
import coopGrade3Hospital from './coop_grade3_hospital.json';
import coopGrade2Tower from './coop_grade2_tower.json';
import v5Grade4Midnight from './v5_grade4_midnight.json';
import v5Grade3Kuchisake from './v5_grade3_kuchisake.json';

// rules: 'v5' を持つミッションは v5.0 エンジン（src/lib/battleEngine.js）で動く。それ以外は v4.0 エンジン
export const missions = [
  v5Grade4Midnight, v5Grade3Kuchisake,
  missionGrade5, missionGrade4, missionGrade3,
  coopGrade3Hospital, coopGrade2Tower,
];

export const isV5Mission = (m) => m?.rules === 'v5';

export function getMissionById(id) {
  return missions.find(m => m.id === id) || null;
}

export function getSoloMissions() {
  return missions.filter(m => m.type !== 'coop');
}

export function getCoopMissions() {
  return missions.filter(m => m.type === 'coop');
}
