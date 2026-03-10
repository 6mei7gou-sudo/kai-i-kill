'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import '../../sns.css';
import ChatRoom from '../../components/ChatRoom';
import HunterModeToggle from '../../components/HunterModeToggle';

export default function ChatRoomPage() {
  const { roomId } = useParams();
  const [hunterMode, setHunterMode] = useState(false);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('hunterMode');
    if (saved === 'true') setHunterMode(true);
  }, []);

  const handleHunterToggle = () => {
    const next = !hunterMode;
    setHunterMode(next);
    localStorage.setItem('hunterMode', String(next));
    setGlitch(true);
    setTimeout(() => setGlitch(false), 600);
  };

  const layer = hunterMode ? 'hunter' : 'surface';

  return (
    <div className={`sns-page ${hunterMode ? 'hunter-mode' : ''} ${glitch ? 'sns-page--glitch' : ''}`}>
      <HunterModeToggle onToggle={handleHunterToggle} />
      <ChatRoom roomId={roomId} layer={layer} />
    </div>
  );
}
