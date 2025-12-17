import {
    styleFields,
    defaultStyleProps,
    getStyleProps,
    textField,
    textareaField,
    colorFields,
    selectField,
    arrayField,
    imageField,
    animationField
} from "./utils";

export const LogoCloudSection = () => {
    return {
        fields: {
            ...styleFields,
            title: textField(true),
            subtitle: textareaField(true),
            ...colorFields,
            layout: selectField([
                { label: "Grid", value: "grid" },
                { label: "Marquee", value: "marquee" },
                { label: "Centered", value: "centered" },
            ]),
            logoSize: selectField([
                { label: "Small", value: "h-8" },
                { label: "Medium", value: "h-12" },
                { label: "Large", value: "h-16" },
                { label: "Extra Large", value: "h-20" },
            ]),
            grayscale: selectField([
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
            ]),
            animation: animationField,
            logos: arrayField({
                name: textField(true),
                image: imageField,
                link: textField(false),
            }),
        },
        defaultProps: {
            ...defaultStyleProps,
            title: "Trusted by Leading Organizations",
            subtitle: "Join thousands of companies already using our platform",
            backgroundColor: "#ffffff",
            textColor: "#1f2937",
            layout: "grid",
            logoSize: "h-12",
            grayscale: "yes",
            animation: "fade",
            logos: [
                { name: "Company 1", image: "", link: "#" },
                { name: "Company 2", image: "", link: "#" },
                { name: "Company 3", image: "", link: "#" },
                { name: "Company 4", image: "", link: "#" },
                { name: "Company 5", image: "", link: "#" },
                { name: "Company 6", image: "", link: "#" },
                { name: "Company 7", image: "", link: "#" },
                { name: "Company 8", image: "", link: "#" },
            ]
        },
        render: ({ 
            title, 
            subtitle, 
            backgroundColor, 
            textColor, 
            layout,
            logoSize,
            grayscale,
            animation,
            logos, 
            ...props 
        }: any) => {
            const styleProps = getStyleProps(props);
            const animationClass = animation === "fade" ? "animate-fadeIn" : animation === "slide" ? "animate-slideUp" : "";
            const grayscaleClass = grayscale === "yes" ? "grayscale opacity-60 hover:grayscale-0 hover:opacity-100" : "";

            if (layout === "marquee") {
                return (
                    <div className="py-20 px-6 overflow-hidden" style={{ ...styleProps, backgroundColor }}>
                        <div className="max-w-7xl mx-auto">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: textColor }}>
                                    {title}
                                </h2>
                                {subtitle && (
                                    <p className="text-lg opacity-80" style={{ color: textColor }}>
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                            <div className="relative">
                                <div className="flex animate-marquee gap-12">
                                    {[...logos, ...logos].map((logo: any, idx: number) => (
                                        <div 
                                            key={idx}
                                            className={`flex-shrink-0 flex items-center justify-center ${grayscaleClass} transition-all duration-300`}
                                        >
                                            {logo.image ? (
                                                <img 
                                                    src={logo.image} 
                                                    alt={logo.name} 
                                                    className={`${logoSize} w-auto object-contain`}
                                                />
                                            ) : (
                                                <div className={`${logoSize} w-32 bg-gray-200 rounded-lg flex items-center justify-center text-xs font-semibold`} style={{ color: textColor }}>
                                                    {logo.name}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }

            if (layout === "centered") {
                return (
                    <div className="py-20 px-6" style={{ ...styleProps, backgroundColor }}>
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: textColor }}>
                                    {title}
                                </h2>
                                {subtitle && (
                                    <p className="text-lg opacity-80" style={{ color: textColor }}>
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
                                {logos?.map((logo: any, idx: number) => (
                                    <div 
                                        key={idx}
                                        className={`${animationClass} ${grayscaleClass} transition-all duration-300`}
                                        style={{ animationDelay: `${idx * 100}ms` }}
                                    >
                                        {logo.link ? (
                                            <a href={logo.link} className="block">
                                                {logo.image ? (
                                                    <img 
                                                        src={logo.image} 
                                                        alt={logo.name} 
                                                        className={`${logoSize} w-auto object-contain`}
                                                    />
                                                ) : (
                                                    <div className={`${logoSize} w-32 bg-gray-200 rounded-lg flex items-center justify-center text-xs font-semibold`} style={{ color: textColor }}>
                                                        {logo.name}
                                                    </div>
                                                )}
                                            </a>
                                        ) : (
                                            <>
                                                {logo.image ? (
                                                    <img 
                                                        src={logo.image} 
                                                        alt={logo.name} 
                                                        className={`${logoSize} w-auto object-contain`}
                                                    />
                                                ) : (
                                                    <div className={`${logoSize} w-32 bg-gray-200 rounded-lg flex items-center justify-center text-xs font-semibold`} style={{ color: textColor }}>
                                                        {logo.name}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            }

            // Grid layout
            return (
                <div className="py-20 px-6" style={{ ...styleProps, backgroundColor }}>
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: textColor }}>
                                {title}
                            </h2>
                            {subtitle && (
                                <p className="text-lg opacity-80" style={{ color: textColor }}>
                                    {subtitle}
                                </p>
                            )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12">
                            {logos?.map((logo: any, idx: number) => (
                                <div 
                                    key={idx}
                                    className={`flex items-center justify-center ${animationClass} ${grayscaleClass} transition-all duration-300`}
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                >
                                    {logo.link ? (
                                        <a href={logo.link} className="block">
                                            {logo.image ? (
                                                <img 
                                                    src={logo.image} 
                                                    alt={logo.name} 
                                                    className={`${logoSize} w-auto object-contain mx-auto`}
                                                />
                                            ) : (
                                                <div className={`${logoSize} w-full bg-gray-200 rounded-lg flex items-center justify-center text-xs font-semibold`} style={{ color: textColor }}>
                                                    {logo.name}
                                                </div>
                                            )}
                                        </a>
                                    ) : (
                                        <>
                                            {logo.image ? (
                                                <img 
                                                    src={logo.image} 
                                                    alt={logo.name} 
                                                    className={`${logoSize} w-auto object-contain mx-auto`}
                                                />
                                            ) : (
                                                <div className={`${logoSize} w-full bg-gray-200 rounded-lg flex items-center justify-center text-xs font-semibold`} style={{ color: textColor }}>
                                                    {logo.name}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }
    };
};

export default LogoCloudSection;
