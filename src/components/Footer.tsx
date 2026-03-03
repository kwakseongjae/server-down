import { getTranslations } from 'next-intl/server';

export default async function Footer() {
  const t = await getTranslations('footer');
  return (
    <footer className="mt-16 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {t('description')}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {t('disclaimer')}
        </p>
        <p className="text-xs text-gray-400 mt-4">
          &copy; {new Date().getFullYear()} Server Down? &middot; Data from official status pages &middot; Updated every minute
        </p>
      </div>
    </footer>
  );
}
