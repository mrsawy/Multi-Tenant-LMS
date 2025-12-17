import { DropZone } from "@measured/puck";
import {
    styleFields,
    defaultStyleProps,
    getStyleProps,
    textField,
    linkField,
    colorFields,
    radioField,
    selectField,
    arrayField,
    imageField
} from "./utils";
import { Button } from "@/components/atoms/button";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from "@/components/atoms/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/atoms/sheet";

export const HeaderSection = () => {
    return {
        fields: {
            ...styleFields,
            logo: imageField,
            logoText: textField(true),
            ...colorFields,
            sticky: radioField([
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" }
            ]),
            transparent: radioField([
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" }
            ]),
            style: selectField([
                { label: "Default", value: "default" },
                { label: "Centered", value: "centered" },
                { label: "Split", value: "split" },
                { label: "Minimal", value: "minimal" }
            ]),
            navItems: arrayField({
                label: textField(true),
                link: linkField(),
                highlight: radioField([
                    { label: "Yes", value: "yes" },
                    { label: "No", value: "no" }
                ])
            }),
            ctaText: textField(true),
            ctaLink: linkField(),
            showCta: radioField([
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" }
            ])
        },
        defaultProps: {
            ...defaultStyleProps,
            logoText: "EduPlatform",
            backgroundColor: "#ffffff",
            textColor: "#1f2937",
            sticky: "yes",
            transparent: "no",
            style: "default",
            navItems: [
                { label: "Home", link: "/", highlight: "no" },
                { label: "Courses", link: "/courses", highlight: "no" },
                { label: "About", link: "/about", highlight: "no" },
                { label: "Contact", link: "/contact", highlight: "no" }
            ],
            ctaText: "Get Started",
            ctaLink: "/signup",
            showCta: "yes"
        },
        render: ({
            logo,
            logoText,
            backgroundColor,
            textColor,
            sticky,
            transparent,
            style,
            navItems,
            ctaText,
            ctaLink,
            showCta,
            ...props
        }: any) => {
            const styleProps = getStyleProps(props);
            const stickyClass = sticky === "yes" ? "sticky top-0 z-50" : "";
            const bgClass = transparent === "yes" ? "bg-transparent backdrop-blur-md" : "";

            if (style === "centered") {
                return (
                    <header 
                        className={`${stickyClass} ${bgClass} border-b`}
                        style={{ ...styleProps, backgroundColor: transparent === "yes" ? "rgba(255,255,255,0.9)" : backgroundColor }}
                    >
                        <div className="max-w-7xl mx-auto px-6 py-4">
                            {/* Logo Centered */}
                            <div className="flex justify-center mb-4">
                                {logo ? (
                                    <img src={logo} alt={logoText} className="h-10" />
                                ) : (
                                    <span className="text-2xl font-bold" style={{ color: textColor }}>
                                        {logoText}
                                    </span>
                                )}
                            </div>
                            
                            {/* Navigation Centered */}
                            <nav className="flex justify-center">
                                <NavigationMenu>
                                    <NavigationMenuList className="flex gap-6">
                                        {navItems?.map((item: any, idx: number) => (
                                            <NavigationMenuItem key={idx}>
                                                <NavigationMenuLink
                                                    href={item.link}
                                                    className={`text-sm font-medium hover:text-purple-600 transition-colors ${
                                                        item.highlight === "yes" ? "text-purple-600" : ""
                                                    }`}
                                                    style={{ color: item.highlight === "yes" ? "#7c3aed" : textColor }}
                                                >
                                                    {item.label}
                                                </NavigationMenuLink>
                                            </NavigationMenuItem>
                                        ))}
                                    </NavigationMenuList>
                                </NavigationMenu>
                            </nav>
                        </div>
                    </header>
                );
            }

            if (style === "split") {
                const midPoint = Math.ceil(navItems.length / 2);
                const leftNav = navItems.slice(0, midPoint);
                const rightNav = navItems.slice(midPoint);

                return (
                    <header 
                        className={`${stickyClass} ${bgClass} border-b`}
                        style={{ ...styleProps, backgroundColor: transparent === "yes" ? "rgba(255,255,255,0.9)" : backgroundColor }}
                    >
                        <div className="max-w-7xl mx-auto px-6 py-4">
                            <div className="flex items-center justify-between">
                                {/* Left Nav */}
                                <nav className="hidden md:flex gap-6">
                                    {leftNav?.map((item: any, idx: number) => (
                                        <a
                                            key={idx}
                                            href={item.link}
                                            className="text-sm font-medium hover:text-purple-600 transition-colors"
                                            style={{ color: textColor }}
                                        >
                                            {item.label}
                                        </a>
                                    ))}
                                </nav>

                                {/* Logo Center */}
                                <div className="flex-shrink-0">
                                    {logo ? (
                                        <img src={logo} alt={logoText} className="h-10" />
                                    ) : (
                                        <span className="text-2xl font-bold" style={{ color: textColor }}>
                                            {logoText}
                                        </span>
                                    )}
                                </div>

                                {/* Right Nav */}
                                <nav className="hidden md:flex gap-6">
                                    {rightNav?.map((item: any, idx: number) => (
                                        <a
                                            key={idx}
                                            href={item.link}
                                            className="text-sm font-medium hover:text-purple-600 transition-colors"
                                            style={{ color: textColor }}
                                        >
                                            {item.label}
                                        </a>
                                    ))}
                                </nav>

                                {/* Mobile Menu */}
                                <Sheet>
                                    <SheetTrigger asChild className="md:hidden">
                                        <Button variant="ghost" size="icon">
                                            <span className="text-2xl">☰</span>
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent>
                                        <nav className="flex flex-col gap-4 mt-8">
                                            {navItems?.map((item: any, idx: number) => (
                                                <a
                                                    key={idx}
                                                    href={item.link}
                                                    className="text-lg font-medium hover:text-purple-600 transition-colors"
                                                >
                                                    {item.label}
                                                </a>
                                            ))}
                                        </nav>
                                    </SheetContent>
                                </Sheet>
                            </div>
                        </div>
                    </header>
                );
            }

            if (style === "minimal") {
                return (
                    <header 
                        className={`${stickyClass} ${bgClass}`}
                        style={{ ...styleProps, backgroundColor: transparent === "yes" ? "transparent" : backgroundColor }}
                    >
                        <div className="max-w-7xl mx-auto px-6 py-6">
                            <div className="flex items-center justify-between">
                                {/* Logo */}
                                <div>
                                    {logo ? (
                                        <img src={logo} alt={logoText} className="h-8" />
                                    ) : (
                                        <span className="text-xl font-bold" style={{ color: textColor }}>
                                            {logoText}
                                        </span>
                                    )}
                                </div>

                                {/* Simple Nav */}
                                <nav className="hidden md:flex gap-8">
                                    {navItems?.map((item: any, idx: number) => (
                                        <a
                                            key={idx}
                                            href={item.link}
                                            className="text-sm hover:opacity-70 transition-opacity"
                                            style={{ color: textColor }}
                                        >
                                            {item.label}
                                        </a>
                                    ))}
                                </nav>

                                {/* Mobile Menu */}
                                <Sheet>
                                    <SheetTrigger asChild className="md:hidden">
                                        <Button variant="ghost" size="sm">
                                            Menu
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent>
                                        <nav className="flex flex-col gap-4 mt-8">
                                            {navItems?.map((item: any, idx: number) => (
                                                <a
                                                    key={idx}
                                                    href={item.link}
                                                    className="text-lg"
                                                >
                                                    {item.label}
                                                </a>
                                            ))}
                                        </nav>
                                    </SheetContent>
                                </Sheet>
                            </div>
                        </div>
                    </header>
                );
            }

            // Default style
            return (
                <header 
                    className={`${stickyClass} ${bgClass} border-b shadow-sm`}
                    style={{ ...styleProps, backgroundColor: transparent === "yes" ? "rgba(255,255,255,0.95)" : backgroundColor }}
                >
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            {/* Logo */}
                            <div className="flex items-center gap-2">
                                {logo ? (
                                    <img src={logo} alt={logoText} className="h-10" />
                                ) : (
                                    <span className="text-2xl font-bold" style={{ color: textColor }}>
                                        {logoText}
                                    </span>
                                )}
                            </div>

                            {/* Desktop Navigation */}
                            <nav className="hidden md:flex items-center gap-6">
                                {navItems?.map((item: any, idx: number) => (
                                    <a
                                        key={idx}
                                        href={item.link}
                                        className={`text-sm font-medium hover:text-purple-600 transition-colors ${
                                            item.highlight === "yes" ? "text-purple-600 font-semibold" : ""
                                        }`}
                                        style={{ color: item.highlight === "yes" ? "#7c3aed" : textColor }}
                                    >
                                        {item.label}
                                    </a>
                                ))}
                                
                                {showCta === "yes" && (
                                    <Button asChild>
                                        <a href={ctaLink}>{ctaText}</a>
                                    </Button>
                                )}
                            </nav>

                            {/* Mobile Menu */}
                            <Sheet>
                                <SheetTrigger asChild className="md:hidden">
                                    <Button variant="ghost" size="icon">
                                        <span className="text-2xl">☰</span>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent>
                                    <nav className="flex flex-col gap-4 mt-8">
                                        {navItems?.map((item: any, idx: number) => (
                                            <a
                                                key={idx}
                                                href={item.link}
                                                className="text-lg font-medium hover:text-purple-600 transition-colors"
                                            >
                                                {item.label}
                                            </a>
                                        ))}
                                        {showCta === "yes" && (
                                            <Button asChild className="mt-4">
                                                <a href={ctaLink}>{ctaText}</a>
                                            </Button>
                                        )}
                                    </nav>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </header>
            );
        }
    };
};

export default HeaderSection;
