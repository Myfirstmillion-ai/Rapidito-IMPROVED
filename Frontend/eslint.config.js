import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      
      // Reglas personalizadas
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      
      // 🔥 REGLAS CRÍTICAS PARA PREVENIR ERRORES
      'react-hooks/rules-of-hooks': 'error', // Asegura que los hooks se usen correctamente
      'react-hooks/exhaustive-deps': 'warn', // Advierte sobre dependencias faltantes
      'no-undef': 'error', // Detecta variables no definidas (como useMemo sin importar)
      'no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      
      // Reglas adicionales de calidad
      'react/prop-types': 'off', // Desactivar si no usas PropTypes
      'react/display-name': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
]
