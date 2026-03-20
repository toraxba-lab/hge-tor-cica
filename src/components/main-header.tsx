
'use client';

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SectorConfigButton } from "@/components/sector-config-button";

export function MainHeader() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('hge_session');
    setIsLoggedIn(!!session);
  }, [pathname]);

  // Não exibe o header na página de login ou se não houver sessão
  if (pathname === '/login' || !isLoggedIn) {
    return null;
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 md:px-8">
      <SidebarTrigger className="-ml-1" />
      <div className="h-4 w-px bg-border" />
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link href="/">
            <Home size={18} />
            <span className="hidden sm:inline">Página Inicial</span>
          </Link>
        </Button>
        <div className="h-4 w-px bg-border hidden sm:block" />
        <SectorConfigButton />
      </div>
    </header>
  );
}
