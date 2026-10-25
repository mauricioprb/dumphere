(function () {
    const root = document.documentElement;

    root.style.removeProperty('--theme-chroma');

    try {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/Sao_Paulo',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).formatToParts(new Date());
        const datePart = (type) => Number(parts.find((part) => part.type === type)?.value);
        const year = datePart('year');
        const month = datePart('month');
        const day = datePart('day');
        const ordinal = Math.floor(Date.UTC(year, month - 1, day) / 86400000);
        const hue = Number((((ordinal * 137.508) % 360) + 360).toFixed(3)) % 360;

        root.dataset.dailyThemeDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        if (root.dataset.themeHue === undefined) {
            root.style.setProperty('--daily-hue', `${hue}deg`);
        }
    } catch {
        if (root.dataset.themeHue === undefined) {
            root.style.setProperty('--daily-hue', '87deg');
        }
    }

    const storedLocale = localStorage.getItem('md-editor-locale');
    const locale =
        storedLocale === 'pt-BR' || storedLocale === 'en'
            ? storedLocale
            : navigator.language.toLowerCase().startsWith('pt')
              ? 'pt-BR'
              : 'en';
    root.lang = locale;
    root.dir = 'ltr';

    const storedTheme = localStorage.getItem('md-editor-theme');
    if (
        storedTheme === 'dark' ||
        (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
        root.classList.add('dark');
    }
})();
