
import type {Metadata} from 'next';
import './globals.css';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Toaster } from '@/components/ui/toaster';
import { AuthGuard } from '@/components/auth-guard';
import { MainHeader } from '@/components/main-header';

export const metadata: Metadata = {
  title: 'HGE Tórax - Gestão Hospitalar',
  description: 'Sistema de gestão de pacientes e produtividade cirúrgica.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <AuthGuard>
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              <div className="flex-1 flex flex-col min-h-screen">
                <MainHeader />
                <main className="flex-1 overflow-auto p-4 md:p-8">
                  {children}
                </main>
              </div>
            </div>
            <Toaster />
          </SidebarProvider>
        </AuthGuard>
      </body>
    </html>
  );
}
