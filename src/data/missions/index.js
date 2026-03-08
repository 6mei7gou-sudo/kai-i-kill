// ミッション一覧エクスポート
import missionGrade5 from './mission_grade5_stray.json';
import missionGrade4 from './mission_grade4_mirror.json';
import missionGrade3 from './mission_grade3_station.json';
import coopGrade3Hospital from './coop_grade3_hospital.json';
import coopGrade2Tower from './coop_grade2_tower.json';

export const missions = [
  missionGrade5, missionGrade4, missionGrade3,
  coopGrade3Hospital, coopGrade2Tower,
];

export function getMissionById(id) {
  return missions.find(m => m.id === id) || null;
}

export function getSoloMissions() {
  return missions.filter(m => m.type !== 'coop');
}

export function getCoopMissions() {
  return missions.filter(m => m.type === 'coop');
}
