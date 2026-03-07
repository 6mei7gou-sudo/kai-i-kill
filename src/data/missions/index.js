// ミッション一覧エクスポート
import missionGrade5 from './mission_grade5_stray.json';
import missionGrade4 from './mission_grade4_mirror.json';
import missionGrade3 from './mission_grade3_station.json';

export const missions = [missionGrade5, missionGrade4, missionGrade3];

export function getMissionById(id) {
  return missions.find(m => m.id === id) || null;
}
