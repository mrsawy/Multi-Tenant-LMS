import {
    styleFields,
    defaultStyleProps,
    getStyleProps,
    textField,
    textareaField,
    linkField,
    colorField,
    radioField,
    selectField,
    arrayField,
    imageField
} from "./utils";

const FooterSection = () => {
    return {
        fields: {
            ...styleFields,
            companyName: textField(true),
            logo: imageField,
            description: textareaField(true),
            copyright: textField(true),
            backgroundColor: colorField(),
            textColor: colorField(),
            layout: selectField([
                { label: "4 Columns", value: "four" },
                { label: "3 Columns", value: "three" },
                { label: "Centered", value: "centered" },
                { label: "Minimal", value: "minimal" }
            ]),
            showNewsletter: radioField([
                { label: "Yes", value: "yes" }, 
                { label: "No", value: "no" }
            ]),
            newsletterTitle: textField(true),
            newsletterPlaceholder: textField(true),
            showDivider: radioField([
                { label: "Yes", value: "yes" }, 
                { label: "No", value: "no" }
            ]),
            columns: arrayField({
                title: textField(true),
                links: textareaField(true)
            }),
            socialLinks: arrayField({
                platform: textField(true),
                url: linkField(),
                icon: textField(true)
            }),
            badges: arrayField({
                text: textField(true),
                icon: textField(true)
            }),
            legalLinks: arrayField({
                text: textField(true),
                url: linkField()
            })
        },
        defaultProps: {
            ...defaultStyleProps,
            companyName: "LMS Platform",
            logo: "🎓",
            description: "Empowering learners worldwide with quality education and professional development opportunities",
            copyright: "© 2025 LMS Platform. All rights reserved.",
            backgroundColor: "#111827",
            textColor: "#ffffff",
            layout: "four",
            showNewsletter: "yes",
            newsletterTitle: "Subscribe to our newsletter",
            newsletterPlaceholder: "Your email",
            showDivider: "yes",
            columns: [
                { title: "Product", links: "All Courses\nPricing\nFor Business\nRequest Demo" },
                { title: "Resources", links: "Blog\nHelp Center\nCommunity\nWebinars" },
                { title: "Company", links: "About Us\nCareers\nPress Kit\nContact" }
            ],
            socialLinks: [
                { platform: "Twitter", url: "#", icon: "🐦" },
                { platform: "LinkedIn", url: "#", icon: "💼" },
                { platform: "YouTube", url: "#", icon: "▶️" },
                { platform: "Instagram", url: "#", icon: "📷" }
            ],
            badges: [
                { text: "Trusted by 10,000+ students", icon: "⭐" },
                { text: "99.9% Uptime", icon: "🚀" }
            ],
            legalLinks: [
                { text: "Privacy Policy", url: "#" },
                { text: "Terms of Service", url: "#" },
                { text: "Cookie Policy", url: "#" }
            ]
        },
        render: ({ companyName, logo, description, copyright, backgroundColor, textColor, layout, showNewsletter, newsletterTitle, newsletterPlaceholder, showDivider, columns, socialLinks, badges, legalLinks }: any) => {
            if (layout === "minimal") {
                return (
                    <footer className="py-12 px-6" style={{ backgroundColor }}>
                        <div className="max-w-7xl mx-auto">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                                <div className="flex items-center gap-3" style={{ color: textColor }}>
                                    {logo && <span className="text-4xl">{logo}</span>}
                                    <span className="text-2xl font-bold">{companyName}</span>
                                </div>
                                
                                <div className="flex flex-wrap justify-center gap-6">
                                    {columns?.flatMap((col: any) => 
                                        col.links?.split('\n').filter(Boolean).map((link: string, idx: number) => (
                                            <a key={`${col.title}-${idx}`} href="#" className="hover:text-purple-400 transition-colors" style={{ color: textColor, opacity: 0.8 }}>
                                                {link}
                                            </a>
                                        ))
                                    )}
                                </div>
                                
                                <div className="flex gap-4">
                                    {socialLinks?.map((social: any, idx: number) => (
                                        <a key={idx} href={social.url} className="text-2xl hover:scale-110 transition-transform" style={{ color: textColor, opacity: 0.8 }}>
                                            {social.icon}
                                        </a>
                                    ))}
                                </div>
                            </div>
                            
                            {showDivider === "yes" && (
                                <div className="my-8 border-t" style={{ borderColor: textColor, opacity: 0.2 }}></div>
                            )}
                            
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm" style={{ color: textColor, opacity: 0.6 }}>
                                <div>{copyright}</div>
                                <div className="flex gap-6">
                                    {legalLinks?.map((link: any, idx: number) => (
                                        <a key={idx} href={link.url} className="hover:opacity-100 transition-opacity">
                                            {link.text}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </footer>
                );
            }
            
            if (layout === "centered") {
                return (
                    <footer className="py-16 px-6" style={{ backgroundColor }}>
                        <div className="max-w-4xl mx-auto text-center" style={{ color: textColor }}>
                            <div className="mb-8">
                                {logo && <div className="text-6xl mb-4">{logo}</div>}
                                <h3 className="text-3xl font-bold mb-4">{companyName}</h3>
                                <p className="text-lg opacity-80 max-w-2xl mx-auto">{description}</p>
                            </div>
                            
                            {showNewsletter === "yes" && (
                                <div className="mb-12">
                                    <h4 className="text-xl font-semibold mb-4">{newsletterTitle}</h4>
                                    <div className="flex gap-3 max-w-md mx-auto">
                                        <input
                                            type="email"
                                            placeholder={newsletterPlaceholder}
                                            className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                        />
                                        <button className="px-6 py-3 bg-purple-600 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                                            Subscribe
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex justify-center gap-6 mb-8">
                                {socialLinks?.map((social: any, idx: number) => (
                                    <a key={idx} href={social.url} className="text-3xl hover:scale-110 transition-transform opacity-80 hover:opacity-100">
                                        {social.icon}
                                    </a>
                                ))}
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                                {columns?.map((column: any, colIdx: number) => (
                                    <div key={colIdx}>
                                        <h4 className="font-semibold mb-3">{column.title}</h4>
                                        <ul className="space-y-2 text-sm opacity-80">
                                            {column.links?.split('\n').map((link: string, lIdx: number) => (
                                                <li key={lIdx}>
                                                    <a href="#" className="hover:text-purple-400 transition-colors">{link}</a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                            
                            {showDivider === "yes" && (
                                <div className="my-8 border-t border-white/20"></div>
                            )}
                            
                            <div className="text-sm opacity-60">{copyright}</div>
                        </div>
                    </footer>
                );
            }
            
            // Four or Three column layout (default)
            return (
                <footer className="py-12 px-6" style={{ backgroundColor }}>
                    <div className="max-w-7xl mx-auto">
                        <div className={`grid grid-cols-1 md:grid-cols-${layout === "three" ? "3" : "4"} gap-8 mb-12`}>
                            <div className={layout === "four" ? "md:col-span-2" : ""} style={{ color: textColor }}>
                                <div className="flex items-center gap-3 mb-4">
                                    {logo && <span className="text-5xl">{logo}</span>}
                                    <h3 className="text-3xl font-bold">{companyName}</h3>
                                </div>
                                <p className="opacity-80 mb-6 max-w-md">{description}</p>
                                
                                {showNewsletter === "yes" && (
                                    <div className="mb-6">
                                        <h4 className="font-semibold mb-3">{newsletterTitle}</h4>
                                        <div className="flex gap-2">
                                            <input
                                                type="email"
                                                placeholder={newsletterPlaceholder}
                                                className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                            />
                                            <button className="px-4 py-2 bg-purple-600 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                                                →
                                            </button>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="flex gap-4 mb-6">
                                    {socialLinks?.map((social: any, idx: number) => (
                                        <a key={idx} href={social.url} 
                                           className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-xl">
                                            {social.icon}
                                        </a>
                                    ))}
                                </div>
                                
                                {badges && badges.length > 0 && (
                                    <div className="flex flex-wrap gap-4">
                                        {badges.map((badge: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm">
                                                <span>{badge.icon}</span>
                                                <span>{badge.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {columns?.map((column: any, idx: number) => (
                                <div key={idx} style={{ color: textColor }}>
                                    <h4 className="font-bold text-lg mb-4">{column.title}</h4>
                                    <ul className="space-y-3">
                                        {column.links?.split('\n').filter(Boolean).map((link: string, lIdx: number) => (
                                            <li key={lIdx}>
                                                <a href="#" className="opacity-80 hover:opacity-100 hover:text-purple-400 transition-colors">
                                                    {link}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        
                        {showDivider === "yes" && (
                            <div className="border-t mb-8" style={{ borderColor: textColor, opacity: 0.2 }}></div>
                        )}
                        
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4" style={{ color: textColor }}>
                            <div className="opacity-60 text-sm">{copyright}</div>
                            <div className="flex flex-wrap gap-6 text-sm opacity-60">
                                {legalLinks?.map((link: any, idx: number) => (
                                    <a key={idx} href={link.url} className="hover:opacity-100 hover:text-purple-400 transition-colors">
                                        {link.text}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </footer>
            );
        }
    }
};

export default FooterSection;