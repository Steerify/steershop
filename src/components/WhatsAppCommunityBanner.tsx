import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, MessageCircle } from 'lucide-react';

const STORAGE_KEY = 'steersolo_wa_community_dismissed';
const MAX_DISMISSALS = 3;
const WHATSAPP_COMMUNITY_LINK = 'https://chat.whatsapp.com/steersolo-community'; // Update with actual community link

export const WhatsAppCommunityBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const count = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
    if (count < MAX_DISMISSALS) {
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    const count = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
    localStorage.setItem(STORAGE_KEY, String(count + 1));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="relative bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl p-4 flex items-center gap-4 shadow-lg">
      <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
        <MessageCircle className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">Join our WhatsApp Community 🎉</p>
        <p className="text-xs text-white/80 mt-0.5">Get updates, tips, and connect with other SteerSolo users</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <a href={WHATSAPP_COMMUNITY_LINK} target="_blank" rel="noopener noreferrer">
          <Button size="sm" variant="secondary" className="bg-white text-green-700 hover:bg-white/90 font-semibold min-h-[36px]">
            Join Now
          </Button>
        </a>
        <button
          onClick={handleDismiss}
          className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
