// シナリオ一覧エクスポート
import scenarioAlleyWhisper from './scenario_alley_whisper.json';
import scenarioCyberRuin from './scenario_cyber_ruin.json';

export const scenarios = [scenarioAlleyWhisper, scenarioCyberRuin];

export function getScenarioById(id) {
  return scenarios.find(s => s.id === id) || null;
}
