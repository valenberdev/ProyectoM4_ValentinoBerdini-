import { useTheme } from '../hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        border: '1px solid var(--hairline)',
        background: 'var(--panel)',
        color: 'var(--ink)',
        fontSize: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'background 0.3s, color 0.3s',
      }}
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}
