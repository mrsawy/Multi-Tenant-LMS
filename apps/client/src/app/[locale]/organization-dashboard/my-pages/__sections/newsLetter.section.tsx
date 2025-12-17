import React from 'react';

const NewsLetterSection = () => {
    return {
        fields: {
            title: { type: "text" },
            description: { type: "textarea" },
            buttonText: { type: "text" },
            backgroundColor: { type: "text" },
            textColor: { type: "text" },
            placeholderText: { type: "text" },
            layout: {
                type: "select",
                options: [
                    { label: "Center Aligned", value: "center" },
                    { label: "Split Layout", value: "split" },
                    { label: "Inline Form", value: "inline" },
                    { label: "Card Style", value: "card" }
                ]
            },
            style: {
                type: "select",
                options: [
                    { label: "Modern", value: "modern" },
                    { label: "Gradient", value: "gradient" },
                    { label: "Minimal", value: "minimal" },
                    { label: "Bold", value: "bold" }
                ]
            },
            showIcon: {
                type: "radio",
                options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }]
            },
            icon: { type: "text" },
            showPrivacyText: {
                type: "radio",
                options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }]
            },
            privacyText: { type: "text" },
            buttonColor: { type: "text" },
            benefits: {
                type: "array",
                arrayFields: {
                    text: { type: "text" },
                    icon: { type: "text" }
                }
            }
        },
        defaultProps: {
            title: "Stay Updated",
            description: "Subscribe to our newsletter for the latest courses, updates, and exclusive offers delivered to your inbox",
            buttonText: "Subscribe",
            backgroundColor: "#f3f4f6",
            textColor: "#111827",
            placeholderText: "Enter your email address",
            layout: "center",
            style: "modern",
            showIcon: "yes",
            icon: "📧",
            showPrivacyText: "yes",
            privacyText: "We respect your privacy. Unsubscribe at any time.",
            buttonColor: "#7c3aed",
            benefits: [
                { text: "Weekly course recommendations", icon: "✓" },
                { text: "Exclusive discounts & offers", icon: "✓" },
                { text: "Industry insights & tips", icon: "✓" }
            ]
        },
        render: ({ title, description, buttonText, backgroundColor, textColor, placeholderText, layout, style, showIcon, icon, showPrivacyText, privacyText, buttonColor, benefits }: any) => {
            const formStyles = {
                modern: "bg-white shadow-xl rounded-xl",
                gradient: "bg-gradient-to-r from-purple-600 to-blue-600",
                minimal: "bg-white border-2 border-gray-200 rounded-lg",
                bold: "bg-gray-900 shadow-2xl rounded-2xl"
            };
            
            const textColorStyle = style === "gradient" || style === "bold" ? "#ffffff" : textColor;
            
            if (layout === "center") {
                return (
                    <div className="py-20 px-6" style={{ backgroundColor }}>
                        <div className="max-w-3xl mx-auto text-center">
                            {showIcon === "yes" && icon && (
                                <div className="text-6xl mb-6">{icon}</div>
                            )}
                            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: textColor }}>{title}</h2>
                            <p className="text-xl text-gray-600 mb-8">{description}</p>
                            
                            {benefits && benefits.length > 0 && (
                                <div className="flex flex-wrap justify-center gap-6 mb-8">
                                    {benefits.map((benefit: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-2 text-gray-700">
                                            <span className="text-green-500 font-bold">{benefit.icon}</span>
                                            <span>{benefit.text}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            <div className={`${formStyles[style as keyof typeof formStyles]} p-2 max-w-xl mx-auto`}>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="email"
                                        placeholder={placeholderText}
                                        className={`flex-1 px-6 py-4 rounded-lg border ${style === "gradient" || style === "bold" ? "bg-white/20 border-white/30 text-white placeholder-white/70" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-purple-600`}
                                    />
                                    <button className="px-8 py-4 rounded-lg font-semibold text-white transition-all hover:scale-105 whitespace-nowrap"
                                            style={{ backgroundColor: buttonColor }}>
                                        {buttonText}
                                    </button>
                                </div>
                            </div>
                            
                            {showPrivacyText === "yes" && privacyText && (
                                <p className="text-sm text-gray-500 mt-4">{privacyText}</p>
                            )}
                        </div>
                    </div>
                );
            }
            
            if (layout === "split") {
                return (
                    <div className="py-20 px-6" style={{ backgroundColor }}>
                        <div className={`max-w-6xl mx-auto ${formStyles[style as keyof typeof formStyles]} p-12 rounded-3xl`}>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                <div style={{ color: textColorStyle }}>
                                    {showIcon === "yes" && icon && (
                                        <div className="text-5xl mb-6">{icon}</div>
                                    )}
                                    <h2 className="text-4xl md:text-5xl font-bold mb-4">{title}</h2>
                                    <p className="text-xl mb-6 opacity-90">{description}</p>
                                    
                                    {benefits && benefits.length > 0 && (
                                        <ul className="space-y-3">
                                            {benefits.map((benefit: any, idx: number) => (
                                                <li key={idx} className="flex items-center gap-3">
                                                    <span className="text-2xl text-green-400">{benefit.icon}</span>
                                                    <span className="text-lg">{benefit.text}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                
                                <div>
                                    <div className="flex flex-col gap-4">
                                        <input
                                            type="email"
                                            placeholder={placeholderText}
                                            className={`px-6 py-4 rounded-lg border ${style === "gradient" || style === "bold" ? "bg-white/20 border-white/30 text-white placeholder-white/70" : "bg-white border-gray-300"} focus:outline-none focus:ring-2 focus:ring-purple-600`}
                                        />
                                        <button className="px-8 py-4 rounded-lg font-semibold text-white transition-all hover:scale-105"
                                                style={{ backgroundColor: buttonColor }}>
                                            {buttonText}
                                        </button>
                                    </div>
                                    {showPrivacyText === "yes" && privacyText && (
                                        <p className="text-sm mt-4 opacity-75" style={{ color: textColorStyle }}>{privacyText}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
            
            if (layout === "inline") {
                return (
                    <div className="py-16 px-6" style={{ backgroundColor }}>
                        <div className="max-w-7xl mx-auto">
                            <div className={`${formStyles[style as keyof typeof formStyles]} p-8 rounded-2xl`}>
                                <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                                    <div className="flex-1" style={{ color: textColorStyle }}>
                                        <div className="flex items-center gap-4 mb-2">
                                            {showIcon === "yes" && icon && (
                                                <span className="text-4xl">{icon}</span>
                                            )}
                                            <h3 className="text-3xl font-bold">{title}</h3>
                                        </div>
                                        <p className="text-lg opacity-90">{description}</p>
                                    </div>
                                    
                                    <div className="flex-shrink-0 w-full lg:w-auto lg:min-w-[400px]">
                                        <div className="flex gap-3">
                                            <input
                                                type="email"
                                                placeholder={placeholderText}
                                                className={`flex-1 px-6 py-3 rounded-lg border ${style === "gradient" || style === "bold" ? "bg-white/20 border-white/30 text-white placeholder-white/70" : "bg-white border-gray-300"} focus:outline-none focus:ring-2 focus:ring-purple-600`}
                                            />
                                            <button className="px-6 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105 whitespace-nowrap"
                                                    style={{ backgroundColor: buttonColor }}>
                                                {buttonText}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
            
            // Card style
            return (
                <div className="py-20 px-6" style={{ backgroundColor }}>
                    <div className="max-w-2xl mx-auto">
                        <div className={`${formStyles[style as keyof typeof formStyles]} p-10 rounded-3xl shadow-2xl`}>
                            <div className="text-center" style={{ color: textColorStyle }}>
                                {showIcon === "yes" && icon && (
                                    <div className="text-6xl mb-6">{icon}</div>
                                )}
                                <h2 className="text-4xl font-bold mb-4">{title}</h2>
                                <p className="text-lg mb-8 opacity-90">{description}</p>
                                
                                {benefits && benefits.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                        {benefits.map((benefit: any, idx: number) => (
                                            <div key={idx} className={`p-4 rounded-lg ${style === "gradient" || style === "bold" ? "bg-white/10" : "bg-purple-50"}`}>
                                                <div className="text-2xl mb-2">{benefit.icon}</div>
                                                <div className="text-sm font-semibold">{benefit.text}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                <div className="flex flex-col gap-4">
                                    <input
                                        type="email"
                                        placeholder={placeholderText}
                                        className={`px-6 py-4 rounded-lg border ${style === "gradient" || style === "bold" ? "bg-white/20 border-white/30 text-white placeholder-white/70" : "bg-white border-gray-300"} focus:outline-none focus:ring-2 focus:ring-purple-600`}
                                    />
                                    <button className="px-8 py-4 rounded-lg font-semibold text-white transition-all hover:scale-105"
                                            style={{ backgroundColor: buttonColor }}>
                                        {buttonText}
                                    </button>
                                </div>
                                
                                {showPrivacyText === "yes" && privacyText && (
                                    <p className="text-sm mt-6 opacity-75">{privacyText}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
};

export default NewsLetterSection;