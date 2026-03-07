// シナリオ一覧エクスポート
import scenarioAlleyWhisper from './scenario_alley_whisper.json';

export const scenarios = [scenarioAlleyWhisper];

export function getScenarioById(id) {
  return scenarios.find(s => s.id === id) || null;
}
