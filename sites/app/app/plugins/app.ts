import { createPinia } from 'pinia';
import { startDailyTheme } from '@/Lib/dailyTheme';

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(createPinia());
    startDailyTheme(document.documentElement);
});
