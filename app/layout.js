import './globals.css';

export const metadata = {
  title: 'Adult Platform',
  description: 'Platform de contenu',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
