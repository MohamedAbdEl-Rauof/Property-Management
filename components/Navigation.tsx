"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Building2, CreditCard, FileText, Plus, BarChart3, Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { href: '/', label: 'الرئيسية', icon: Home },
    { href: '/properties', label: 'العقارات', icon: Building2 },
    { href: '/payments', label: 'المدفوعات', icon: CreditCard },
    { href: '/contracts', label: 'العقود', icon: FileText },
    { href: '/reports', label: 'التقارير', icon: BarChart3 },
    { href: '/notifications', label: 'الإشعارات', icon: Bell },
  ];

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-xl font-bold text-primary">إدارة العقارات</h1>

          <div className="flex items-center gap-3">
            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <span>{link.label}</span>
                    <Icon className="h-4 w-4" />
                  </Link>
                );
              })}
            </div>

            {/* Add Property Button (Desktop) */}
            <Link
              href="/properties/new"
              className="hidden sm:flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <span>إضافة عقار</span>
              <Plus className="h-4 w-4" />
            </Link>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-4 mt-8">
                  {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                      >
                        <span>{link.label}</span>
                        <Icon className="h-5 w-5" />
                      </Link>
                    );
                  })}

                  {/* Add Property Button in Mobile Menu */}
                  <Link
                    href="/properties/new"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <span>إضافة عقار</span>
                    <Plus className="h-5 w-5" />
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
