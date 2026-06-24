import './globals.css';

export const metadata = {
  title: 'Adult Platform',
  description: 'Platform de contenu',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="bg-slate-900 text-white">{children}</body>
    </html>
  );
}
