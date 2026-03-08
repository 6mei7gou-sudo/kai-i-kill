// 派遣クエスト一覧エクスポート
import dispatchQuests from './dispatch_quests.json';

export const dispatches = dispatchQuests;

export function getDispatchById(id) {
  return dispatches.find(d => d.id === id) || null;
}
