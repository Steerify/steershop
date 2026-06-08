/// <reference types="npm:@types/react@18.3.1" />

/**
 * Shared email style tokens for SteerSolo transactional emails (React Email / @react-email).
 * Palette: Midnight Obsidian (#0b101c) · Card Dark (#101623) · Lemon Green (#66e613) · Poppins
 */
export const theme = {
  colors: {
    background: '#0b101c', // Midnight Obsidian
    card: '#101623',       // Card background
    text: '#f5f4f2',       // Warm White
    mutedText: '#9ca3af',  // Muted grey
    accent: '#66e613',     // Lemon Green
    accentHover: '#5ad10d',// Darker Lemon Green
    border: '#1f2937',     // Border color
  },
  fonts: {
    primary: "'Poppins', 'Inter', Arial, sans-serif",
  }
}

export const styles = {
  main: {
    backgroundColor: theme.colors.background,
    fontFamily: theme.fonts.primary,
    padding: '40px 0',
  },
  container: {
    padding: '40px 30px',
    maxWidth: '560px',
    margin: '0 auto',
    backgroundColor: theme.colors.card,
    borderRadius: '16px',
    border: `1px solid ${theme.colors.border}`,
    boxShadow: '0 8px 32px -8px rgba(102, 230, 19, 0.12), 0 2px 8px -2px rgba(0, 0, 0, 0.4)',
  },
  headerSection: {
    textAlign: 'center' as const,
    marginBottom: '30px',
    padding: '20px 0',
    borderBottom: `1px solid ${theme.colors.border}`,
  },
  logo: {
    margin: '0 auto',
    width: '80px',
    height: 'auto',
  },
  h1: {
    fontSize: '28px',
    fontWeight: 'bold' as const,
    color: theme.colors.text,
    margin: '0 0 20px',
    textAlign: 'center' as const,
  },
  text: {
    fontSize: '16px',
    color: theme.colors.text,
    lineHeight: '1.6',
    margin: '0 0 24px',
  },
  mutedText: {
    fontSize: '15px',
    color: theme.colors.mutedText,
    lineHeight: '1.6',
    margin: '0 0 20px',
  },
  link: {
    color: theme.colors.accent,
    textDecoration: 'none',
    fontWeight: 'bold' as const,
  },
  buttonSection: {
    textAlign: 'center' as const,
    margin: '32px 0',
  },
  button: {
    backgroundColor: theme.colors.accent,
    color: '#000000',
    fontSize: '16px',
    fontWeight: 'bold' as const,
    borderRadius: '12px',
    padding: '16px 32px',
    textDecoration: 'none',
    display: 'inline-block',
  },
  codeSection: {
    background: '#0b101c',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center' as const,
    margin: '28px 0',
    border: `1px dashed ${theme.colors.accent}`,
  },
  codeText: {
    fontSize: '36px',
    fontWeight: 'bold' as const,
    letterSpacing: '12px',
    color: theme.colors.accent,
    margin: '0',
  },
  footer: {
    fontSize: '13px',
    color: theme.colors.mutedText,
    margin: '40px 0 0',
    textAlign: 'center' as const,
    borderTop: `1px solid ${theme.colors.border}`,
    paddingTop: '20px',
  },
  footerBrand: {
    fontSize: '13px',
    color: theme.colors.accent,
    margin: '12px 0 0',
    fontStyle: 'italic' as const,
    textAlign: 'center' as const,
  },
}
