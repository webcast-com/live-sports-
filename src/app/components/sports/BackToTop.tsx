import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-xl bg-[#00d4ff] text-white shadow-lg shadow-[#00d4ff]/25 hover:bg-[#00bbdd] transition-all flex items-center justify-center animate-in"
    >
      <ChevronUp className="w-5 h-5" />
    </button>
  );
};

export default BackToTop;
