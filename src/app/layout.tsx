import { headers } from 'next/headers';

// Add this function to check if the path should exclude navbar
const shouldExcludeNavbar = (pathname: string) => {
  const excludedPaths = ['/', '/login', '/signup'];
  return excludedPaths.includes(pathname);
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = headers();
  const pathname = headersList.get('x-pathname') || '/';
  const shouldExclude = shouldExcludeNavbarAndSidebar(pathname);

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Toaster position="top-center" />
          {!shouldExclude ? (
            <div className="flex h-screen bg-[#0B0B10]">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-y-auto">
                  {children}
                </main>
              </div>
            </div>
          ) : (
            children
          )}
        </AuthProvider>
      </body>
    </html>
  );
}
