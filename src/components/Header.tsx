import { getTranslations } from 'next-intl/server';
import LanguageToggleClient from './LanguageToggleClient';
import ThemeToggle from './ThemeToggle';

interface Props {
  locale: string;
}

export default async function Header({ locale }: Props) {
  const t = await getTranslations('header');
  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <a href={`/${locale}`} className="flex items-center gap-2.5 flex-shrink-0">
          <span className="text-xl">🔍</span>
          <div>
            <span className="text-base font-black text-gray-900 dark:text-gray-100 tracking-tight">
              {locale === 'ko' ? '서버 다운?' : 'Server Down?'}
            </span>
            <p className="text-[10px] text-gray-400 leading-none hidden sm:block mt-0.5">
              {t('subtitle')}
            </p>
          </div>
        </a>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageToggleClient />
        </div>
      </div>
    </header>
  );
}
