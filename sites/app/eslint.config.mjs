import prettier from 'eslint-config-prettier/flat';
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt(prettier, {
    files: ['app/Components/UI/Wordmark.vue'],
    rules: { 'vue/multi-word-component-names': 'off' },
});
