import React from 'react';
import {
    styleFields,
    defaultStyleProps,
    getStyleProps,
    textField,
    textareaField,
    linkField,
    colorFields,
    numberField,
    radioField,
    selectField,
    arrayField,
    imageField
} from "./utils";

const CTASection = () => {
    return {
        fields: {
            ...styleFields,
            title: textField(true),
            description: textareaField(true),
            primaryButton: textField(true),
            primaryLink: linkField(),
            secondaryButton: textField(true),
            secondaryLink: linkField(),
            ...colorFields,
            backgroundImage: imageField,
            overlayOpacity: numberField(0, 1),
            layout: selectField([
                { label: "Center Aligned", value: "center" },
                { label: "Split Layout", value: "split" },
                { label: "Banner Style", value: "banner" },
                { label: "Card Style", value: "card" }
            ]),
            buttonStyle: selectField([
                { label: "Rounded", value: "rounded-lg" },
                { label: "Pill", value: "rounded-full" },
                { label: "Square", value: "rounded-none" }
            ]),
            buttonSize: selectField([
                { label: "Small", value: "px-6 py-2 text-sm" },
                { label: "Medium", value: "px-8 py-4 text-lg" },
                { label: "Large", value: "px-10 py-5 text-xl" }
            ]),
            showIcon: radioField([
                { label: "Yes", value: "yes" }, 
                { label: "No", value: "no" }
            ]),
            icon: textField(true),
            features: arrayField({
                text: textField(true),
                icon: textField(true)
            })
        },
        defaultProps: {
            ...defaultStyleProps,
            title: "Ready to Start Learning?",
            description: "Join thousands of students already learning on our platform and take your skills to the next level",
            primaryButton: "Get Started Free",
            primaryLink: "#",
            secondaryButton: "View Courses",
            secondaryLink: "#",
            backgroundColor: "#1f2937",
            textColor: "#ffffff",
            backgroundImage: "",
            overlayOpacity: 0.8,
            layout: "center",
            buttonStyle: "rounded-lg",
            buttonSize: "px-8 py-4 text-lg",
            showIcon: "yes",
            icon: "🚀",
            features: [
                { text: "No credit card required", icon: "✓" },
                { text: "Cancel anytime", icon: "✓" },
                { text: "Access to all courses", icon: "✓" }
            ]
        },
        render: ({ title, description, primaryButton, primaryLink, secondaryButton, secondaryLink, backgroundColor, textColor, backgroundImage, overlayOpacity, layout, buttonStyle, buttonSize, showIcon, icon, features, ...props }: any) => {
            const styleProps = getStyleProps(props);
            
            if (layout === "center") {
                return (
                    <div className="relative overflow-hidden px-6" style={{ ...styleProps, backgroundColor }}>
                        {backgroundImage && (
                            <>
                                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})` }}></div>
                                <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }}></div>
                            </>
                        )}
                        <div className="relative z-10 max-w-4xl mx-auto text-center">
                            {showIcon === "yes" && icon && (
                                <div className="text-6xl mb-6">{icon}</div>
                            )}
                            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: textColor }}>{title}</h2>
                            <p className="text-xl mb-8 opacity-90" style={{ color: textColor }}>{description}</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                                <a href={primaryLink} className={`bg-purple-600 text-white ${buttonSize} ${buttonStyle} font-semibold hover:bg-purple-700 transition-all transform hover:scale-105 shadow-xl`}>
                                    {primaryButton}
                                </a>
                                {secondaryButton && (
                                    <a href={secondaryLink} className={`border-2 ${buttonSize} ${buttonStyle} font-semibold hover:bg-white hover:text-gray-900 transition-all`} style={{ borderColor: textColor, color: textColor }}>
                                        {secondaryButton}
                                    </a>
                                )}
                            </div>
                            {features && features.length > 0 && (
                                <div className="flex flex-wrap justify-center gap-6">
                                    {features.map((feature: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-2" style={{ color: textColor, opacity: 0.8 }}>
                                            <span className="text-green-400">{feature.icon}</span>
                                            <span>{feature.text}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            }
            
            if (layout === "split") {
                return (
                    <div className="px-6" style={{ ...styleProps, backgroundColor }}>
                        <div className="max-w-7xl mx-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                <div style={{ color: textColor }}>
                                    {showIcon === "yes" && icon && (
                                        <div className="text-5xl mb-6">{icon}</div>
                                    )}
                                    <h2 className="text-4xl md:text-5xl font-bold mb-6">{title}</h2>
                                    <p className="text-xl mb-8 opacity-90">{description}</p>
                                    {features && features.length > 0 && (
                                        <ul className="space-y-3 mb-8">
                                            {features.map((feature: any, idx: number) => (
                                                <li key={idx} className="flex items-center gap-3">
                                                    <span className="text-2xl text-green-400">{feature.icon}</span>
                                                    <span className="text-lg">{feature.text}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div className="flex flex-col gap-4">
                                    <a href={primaryLink} className={`bg-white text-purple-600 ${buttonSize} ${buttonStyle} font-semibold hover:bg-gray-100 transition-all text-center shadow-xl`}>
                                        {primaryButton}
                                    </a>
                                    {secondaryButton && (
                                        <a href={secondaryLink} className={`border-2 ${buttonSize} ${buttonStyle} font-semibold hover:bg-white hover:text-gray-900 transition-all text-center`} style={{ borderColor: textColor, color: textColor }}>
                                            {secondaryButton}
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
            
            if (layout === "banner") {
                return (
                    <div className="relative overflow-hidden px-6" style={{ ...styleProps, backgroundColor }}>
                        {backgroundImage && (
                            <>
                                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})` }}></div>
                                <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }}></div>
                            </>
                        )}
                        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex-1" style={{ color: textColor }}>
                                <h2 className="text-3xl md:text-4xl font-bold mb-2">{title}</h2>
                                <p className="text-lg opacity-90">{description}</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <a href={primaryLink} className={`bg-white text-purple-600 ${buttonSize} ${buttonStyle} font-semibold hover:bg-gray-100 transition-all whitespace-nowrap`}>
                                    {primaryButton}
                                </a>
                                {secondaryButton && (
                                    <a href={secondaryLink} className={`border-2 ${buttonSize} ${buttonStyle} font-semibold hover:bg-white hover:text-gray-900 transition-all whitespace-nowrap`} style={{ borderColor: textColor, color: textColor }}>
                                        {secondaryButton}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                );
            }
            
            // Card style
            return (
                <div className="px-6" style={{ ...styleProps, backgroundColor: '#f9fafb' }}>
                    <div className="max-w-5xl mx-auto">
                        <div className="rounded-3xl p-12 shadow-2xl relative overflow-hidden" style={{ backgroundColor }}>
                            {backgroundImage && (
                                <>
                                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})` }}></div>
                                    <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }}></div>
                                </>
                            )}
                            <div className="relative z-10 text-center" style={{ color: textColor }}>
                                {showIcon === "yes" && icon && (
                                    <div className="text-6xl mb-6">{icon}</div>
                                )}
                                <h2 className="text-4xl md:text-5xl font-bold mb-6">{title}</h2>
                                <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">{description}</p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <a href={primaryLink} className={`bg-white text-purple-600 ${buttonSize} ${buttonStyle} font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl`}>
                                        {primaryButton}
                                    </a>
                                    {secondaryButton && (
                                        <a href={secondaryLink} className={`border-2 ${buttonSize} ${buttonStyle} font-semibold hover:bg-white hover:text-gray-900 transition-all`} style={{ borderColor: textColor, color: textColor }}>
                                            {secondaryButton}
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
};

export default CTASection;