'use client';
import { usePathname, useRouter } from 'next/navigation';
import { routing } from '@/i18n/routing';

export default function LanguageToggleClient() {
  const pathname = usePathname();
  const router = useRouter();

  // Derive locale directly from the URL — always in sync after navigation
  const locale = (routing.locales as readonly string[]).find(
    (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)
  ) ?? routing.defaultLocale;

  function switchLocale(newLocale: string) {
    const segments = pathname.split('/');
    if ((routing.locales as readonly string[]).includes(segments[1])) {
      segments[1] = newLocale;
    } else {
      segments.unshift('', newLocale);
    }
    router.push(segments.join('/'));
  }

  const isEn = locale === 'en';

  return (
    <div
      className="relative flex bg-gray-100 dark:bg-gray-800 rounded-lg"
      style={{ padding: '3px', gap: 0 }}
    >
      {/* Sliding indicator — pure inline styles to bypass Tailwind v4 transition quirks */}
      <div
        className="absolute bg-white dark:bg-gray-600 rounded-md shadow-sm"
        style={{
          top: '3px',
          bottom: '3px',
          width: 'calc(50% - 3px)',
          left: isEn ? 'calc(50%)' : '3px',
          transition: 'left 180ms ease-in-out',
        }}
      />
      {(['ko', 'en'] as const).map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          style={{ minWidth: '64px' }}
          className={`relative z-10 px-3 py-1 text-sm font-medium text-center rounded-md ${
            locale === loc
              ? 'text-gray-900 dark:text-gray-100'
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          {loc === 'ko' ? '한국어' : 'English'}
        </button>
      ))}
    </div>
  );
}
