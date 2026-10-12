import './globals.css';

export const metadata = {
  title: 'AVMLabs — Rate List & Custom Health Profiles',
  description: 'AVMLabs diagnostic rate list. Browse lab tests, compare technologies and build your own custom health profile — Processing Cost, Test Price, Profile Price and margin on every test.',
  icons: {
    icon: '/assets/images/favicon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-paper text-ink font-body antialiased">
        {children}
      </body>
    </html>
  );
}
