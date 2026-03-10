'use client';

const SURFACE_TRENDS = [
  { tag: '#霊素観測', count: '2.4K' },
  { tag: '#渋谷封鎖区域', count: '1.8K' },
  { tag: '#怪異目撃情報', count: '1.2K' },
  { tag: '#電脳障害報告', count: '891' },
  { tag: '#魔法言語アップデート', count: '654' },
];

const HUNTER_TRENDS = [
  { tag: '#討伐報告', count: '3.1K' },
  { tag: '#傭兵組合', count: '2.7K' },
  { tag: '#怪異目撃情報', count: '1.9K' },
  { tag: '#違法改造情報', count: '1.1K' },
  { tag: '#闇取引注意', count: '743' },
];

const SHARED_TRENDS = [
  { tag: '#怪異目撃情報', count: '1.2K' },
];

export default function TrendingSidebar({ layer }) {
  const isHunter = layer === 'hunter';
  const trends = isHunter ? HUNTER_TRENDS : SURFACE_TRENDS;

  return (
    <div>
      <div className="trending-section">
        <div className="trending-section__title">
          {isHunter ? 'TRENDING // HUNTER' : 'TRENDING'}
        </div>
        {trends.map((item) => (
          <div key={item.tag} className="trending-item">
            <div className="trending-item__tag">{item.tag}</div>
            <div className="trending-item__count">{item.count} posts</div>
          </div>
        ))}
      </div>
    </div>
  );
}
