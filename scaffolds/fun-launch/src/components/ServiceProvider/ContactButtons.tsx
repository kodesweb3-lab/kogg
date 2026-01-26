'use client';

interface ContactButtonsProps {
  telegram?: string | null;
  twitterHandle?: string | null;
  email?: string | null;
}

export function ContactButtons({ telegram, twitterHandle, email }: ContactButtonsProps) {
  if (!telegram && !twitterHandle && !email) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {telegram && (
        <a
          href={`https://t.me/${telegram.replace(/^@/, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 bg-dacian-steel-gunmetal hover:bg-dacian-steel-steel text-mystic-steam-parchment rounded text-xs transition-colors"
        >
          Telegram
        </a>
      )}
      {twitterHandle && (
        <a
          href={`https://x.com/${twitterHandle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 bg-dacian-steel-gunmetal hover:bg-dacian-steel-steel text-mystic-steam-parchment rounded text-xs transition-colors"
        >
          Twitter
        </a>
      )}
      {email && (
        <a
          href={`mailto:${email}`}
          className="px-3 py-1.5 bg-dacian-steel-gunmetal hover:bg-dacian-steel-steel text-mystic-steam-parchment rounded text-xs transition-colors"
        >
          Email
        </a>
      )}
    </div>
  );
}
