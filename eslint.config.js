// Configuración de ESLint (formato plano, ESLint 9)
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist', 'android', 'node_modules'] },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      // Reglas clásicas de hooks: errores reales de dependencias y orden de llamadas
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // Variables sin usar: advertencia; se permiten con prefijo "_"
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // El modelo usa `any` en algunos resúmenes calculados; se señala sin bloquear
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  }
);
