'use client';
import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { BookOpenIcon, InfoIcon, Languages, LifeBuoyIcon, LogIn } from 'lucide-react';
import { useLocale } from 'next-intl';
import { Button } from '@/components/atoms/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/atoms/navigation-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/atoms/popover';
import { cn } from '@/lib/utils';
import type { ComponentProps } from 'react';
import { ModeToggle } from './theme-switcher';
import { getAuthUser } from '@/lib/actions/user/user.action';
import { IUser } from '@/lib/types/user/user.interface';
import { NavUser } from './nav-user';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../atoms/dropdown-menu';

import { Avatar, AvatarFallback, AvatarImage } from '../atoms/avatar';
import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from '@tabler/icons-react';
import useGeneralStore from '@/lib/store/generalStore';
import { logout } from '@/lib/actions/auth/auth.action';
import { usePathname, useRouter } from '@/i18n/navigation';
import Image from 'next/image';
import logoSrc from '@/../public/images/logo.png';
import { ScrollProgress } from '../atoms/scroll-progress';
// Simple logo component for the navbar
const Logo = (props: any) => {
  return (
    <Image src={logoSrc} width={40} height={40} alt="Safier Logo" {...props} />
  );
};
// Hamburger icon component
const HamburgerIcon = ({
  className,
  ...props
}: React.SVGAttributes<SVGElement>) => (
  <svg
    className={cn('pointer-events-none', className)}
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...(props as any)}
  >
    <path
      d="M4 12L20 12"
      className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
    />
    <path
      d="M4 12H20"
      className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
    />
    <path
      d="M4 12H20"
      className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
    />
  </svg>
);
// Types
export interface Navbar02NavItem {
  href?: string;
  label: string;
  submenu?: boolean;
  type?: 'description' | 'simple' | 'icon';
  items?: Array<{
    href: string;
    label: string;
    description?: string;
    icon?: string;
  }>;
}
export interface Navbar02Props extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  logoHref?: string;
  navigationLinks?: Navbar02NavItem[];
  signInText?: string;
  signInHref?: string;
  ctaText?: string;
  ctaHref?: string;
  onSignInClick?: () => void;
  onCtaClick?: () => void;
  user?: IUser;
}
// Default navigation links
const defaultNavigationLinks: Navbar02NavItem[] = [
  { href: '#', label: 'Home' },
  {
    label: 'Features',
    submenu: true,
    type: 'description',
    items: [
      {
        href: '#components',
        label: 'Components',
        description: 'Browse all components in the library.',
      },
      {
        href: '#documentation',
        label: 'Documentation',
        description: 'Learn how to use the library.',
      },
      {
        href: '#templates',
        label: 'Templates',
        description: 'Pre-built layouts for common use cases.',
      },
    ],
  },
  {
    label: 'Pricing',
    submenu: true,
    type: 'simple',
    items: [
      { href: '#product-a', label: 'Product A' },
      { href: '#product-b', label: 'Product B' },
      { href: '#product-c', label: 'Product C' },
      { href: '#product-d', label: 'Product D' },
    ],
  },
  {
    label: 'About',
    submenu: true,
    type: 'icon',
    items: [
      {
        href: '#getting-started',
        label: 'Getting Started',
        icon: 'BookOpenIcon',
      },
      { href: '#tutorials', label: 'Tutorials', icon: 'LifeBuoyIcon' },
      { href: '#about-us', label: 'About Us', icon: 'InfoIcon' },
    ],
  },
];
const LanguageSwitcher = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: 'en' | 'ar') => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleLocaleChange('en')}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLocaleChange('ar')}>
          Arabic
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export const Navbar02 = React.forwardRef<HTMLElement, Navbar02Props>(
  (
    {
      className,
      logo = <Logo />,
      logoHref = '#',
      navigationLinks = defaultNavigationLinks,
      signInText = 'Sign In',
      signInHref = '#signin',
      ctaText = 'Get Started',
      ctaHref = '#get-started',
      onSignInClick,
      onCtaClick,
      user,
      ...props
    },
    ref,
  ) => {
    const [isMobile, setIsMobile] = useState(false);
    const containerRef = useRef<HTMLElement>(null);
    useEffect(() => {
      const checkWidth = () => {
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth;
          setIsMobile(width < 768); // 768px is md breakpoint
        }
      };
      checkWidth();
      const resizeObserver = new ResizeObserver(checkWidth);
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }
      return () => {
        resizeObserver.disconnect();
      };
    }, []);
    // Combine refs
    const combinedRef = React.useCallback(
      (node: HTMLElement | null) => {
        containerRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    const router = useRouter();

    return (
      <header
        ref={combinedRef}
        className={cn(
          'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 [&_*]:no-underline',
          className,
        )}
        {...(props as any)}
      >
        <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4">
          {/* Left side */}
          <div className="flex items-center gap-2">
            {/* Mobile menu trigger */}
            {isMobile && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    className="group h-9 w-9 hover:bg-accent hover:text-accent-foreground"
                    variant="ghost"
                    size="icon"
                  >
                    <HamburgerIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-64 p-1">
                  <NavigationMenu className="max-w-none">
                    <NavigationMenuList className="flex-col items-start gap-0">
                      {navigationLinks.map((link, index) => (
                        <NavigationMenuItem key={index} className="w-full">
                          {link.submenu ? (
                            <>
                              <div className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
                                {link.label}
                              </div>
                              <ul>
                                {link.items?.map((item, itemIndex) => (
                                  <li key={itemIndex}>
                                    <button
                                      onClick={(e) => e.preventDefault()}
                                      className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer no-underline"
                                    >
                                      {item.label}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </>
                          ) : (
                            <button
                              onClick={(e) => e.preventDefault()}
                              className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer no-underline"
                            >
                              {link.label}
                            </button>
                          )}
                          {/* Add separator between different types of items */}
                          {index < navigationLinks.length - 1 &&
                            ((!link.submenu &&
                              navigationLinks[index + 1].submenu) ||
                              (link.submenu &&
                                !navigationLinks[index + 1].submenu) ||
                              (link.submenu &&
                                navigationLinks[index + 1].submenu &&
                                link.type !==
                                  navigationLinks[index + 1].type)) && (
                              <div
                                role="separator"
                                aria-orientation="horizontal"
                                className="bg-border -mx-1 my-1 h-px w-full"
                              />
                            )}
                        </NavigationMenuItem>
                      ))}
                    </NavigationMenuList>
                  </NavigationMenu>
                </PopoverContent>
              </Popover>
            )}
            {/* Main nav */}
            <div className="flex items-center gap-6">
              <button
                onClick={(e) => e.preventDefault()}
                className="flex items-center space-x-2 text-primary hover:text-primary/90 transition-colors cursor-pointer"
              >
                <div className="text-2xl me-2">{logo}</div>
                <span className="hidden   text-xl sm:inline-block font-bold font-sans">
                  Safier
                </span>
              </button>
              {/* Navigation menu */}
              {!isMobile && (
                <NavigationMenu className="flex">
                  <NavigationMenuList className="gap-1">
                    {navigationLinks.map((link, index) => (
                      <NavigationMenuItem key={index}>
                        {link.submenu ? (
                          <>
                            <NavigationMenuTrigger>
                              {link.label}
                            </NavigationMenuTrigger>
                            <NavigationMenuContent>
                              {link.type === 'description' &&
                              link.label === 'Features' ? (
                                <div className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                                  <div className="row-span-3">
                                    <NavigationMenuLink asChild>
                                      <button
                                        onClick={(e) => e.preventDefault()}
                                        className="flex h-full w-full select-none flex-col justify-center items-center text-center rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md cursor-pointer"
                                      >
                                        <div className="mb-3 text-xl font-medium">
                                          shadcn.io
                                        </div>
                                        <p className="text-sm leading-tight text-muted-foreground">
                                          Beautifully designed components built
                                          with Radix UI and Tailwind CSS.
                                        </p>
                                      </button>
                                    </NavigationMenuLink>
                                  </div>
                                  {link.items?.map((item, itemIndex) => (
                                    <ListItem
                                      key={itemIndex}
                                      title={item.label}
                                      href={item.href}
                                      type={link.type}
                                    >
                                      {item.description}
                                    </ListItem>
                                  ))}
                                </div>
                              ) : link.type === 'simple' ? (
                                <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                  {link.items?.map((item, itemIndex) => (
                                    <ListItem
                                      key={itemIndex}
                                      title={item.label}
                                      href={item.href}
                                      type={link.type}
                                    >
                                      {item.description}
                                    </ListItem>
                                  ))}
                                </div>
                              ) : link.type === 'icon' ? (
                                <div className="grid w-[400px] gap-3 p-4">
                                  {link.items?.map((item, itemIndex) => (
                                    <ListItem
                                      key={itemIndex}
                                      title={item.label}
                                      href={item.href}
                                      icon={item.icon}
                                      type={link.type}
                                    >
                                      {item.description}
                                    </ListItem>
                                  ))}
                                </div>
                              ) : (
                                <div className="grid gap-3 p-4">
                                  {link.items?.map((item, itemIndex) => (
                                    <ListItem
                                      key={itemIndex}
                                      title={item.label}
                                      href={item.href}
                                      type={link.type}
                                    >
                                      {item.description}
                                    </ListItem>
                                  ))}
                                </div>
                              )}
                            </NavigationMenuContent>
                          </>
                        ) : (
                          <NavigationMenuLink
                            href={link.href}
                            className={cn(
                              navigationMenuTriggerStyle(),
                              'cursor-pointer',
                            )}
                            onClick={(e) => e.preventDefault()}
                          >
                            {link.label}
                          </NavigationMenuLink>
                        )}
                      </NavigationMenuItem>
                    ))}
                  </NavigationMenuList>
                </NavigationMenu>
              )}
            </div>
          </div>
          {/* Right side */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ModeToggle />
            {!user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onSignInClick) onSignInClick();
                  }}
                >
                  {signInText}
                  <LogIn />
                </Button>
                <Button
                  size="sm"
                  className="text-sm font-medium px-4 h-9 rounded-md shadow-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onCtaClick) onCtaClick();
                  }}
                >
                  {ctaText}
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="lg"
                    className="bg-background hover:bg-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg grayscale">
                      <AvatarImage
                        src={user.profile?.avatar}
                        alt={user.firstName}
                      />
                      <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm items-center">
                      <span className="truncate font-medium text-secondary-foreground">
                        {user.firstName}
                      </span>

                      {!isMobile && (
                        <span className="text-muted-foreground truncate text-xs">
                          {user.email}
                        </span>
                      )}
                    </div>
                    <IconDotsVertical className="ml-auto size-4 text-secondary-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                  side={'bottom'}
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage
                          src={user.profile?.avatar}
                          alt={user.firstName}
                        />
                        <AvatarFallback className="rounded-lg">
                          CN
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">
                          {user.firstName}
                        </span>

                        <span className="text-muted-foreground truncate text-xs">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <IconUserCircle />
                      Account
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <IconCreditCard />
                      Billing
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <IconNotification />
                      Notifications
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      try {
                        useGeneralStore.setState({ generalIsLoading: true });
                        await logout();
                      } catch (error) {
                        console.error({ error });
                      } finally {
                        useGeneralStore.setState({ generalIsLoading: false });
                      }
                    }}
                  >
                    <IconLogout />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

      </header>
    );
  },
);
Navbar02.displayName = 'Navbar02';
// ListItem component for navigation menu items
const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'> & {
    title: string;
    href?: string;
    icon?: string;
    type?: 'description' | 'simple' | 'icon';
    children?: React.ReactNode;
  }
>(({ className, title, children, icon, type, ...props }, ref) => {
  const renderIconComponent = (iconName?: string) => {
    if (!iconName) return null;
    switch (iconName) {
      case 'BookOpenIcon':
        return <BookOpenIcon className="h-5 w-5" />;
      case 'LifeBuoyIcon':
        return <LifeBuoyIcon className="h-5 w-5" />;
      case 'InfoIcon':
        return <InfoIcon className="h-5 w-5" />;
      default:
        return null;
    }
  };
  return (
    <NavigationMenuLink asChild>
      <a
        ref={ref}
        onClick={(e) => e.preventDefault()}
        className={cn(
          'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer',
          className,
        )}
        {...(props as any)}
      >
        {type === 'icon' && icon ? (
          <div className="flex items-start space-x-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              {renderIconComponent(icon)}
            </div>
            <div className="space-y-1">
              <div className="text-base font-medium leading-tight">{title}</div>
              {children && (
                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                  {children}
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="text-base font-medium leading-none">{title}</div>
            {children && (
              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                {children}
              </p>
            )}
          </>
        )}
      </a>
    </NavigationMenuLink>
  );
});
ListItem.displayName = 'ListItem';
export { Logo, HamburgerIcon };
