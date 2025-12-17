import React from 'react';

const PricingSection = () => {
    return {
        fields: {
            title: { type: "text" },
            subtitle: { type: "textarea" },
            backgroundColor: { type: "text" },
            titleColor: { type: "text" },
            billingToggle: {
                type: "radio",
                options: [{ label: "Show", value: "yes" }, { label: "Hide", value: "no" }]
            },
            style: {
                type: "select",
                options: [
                    { label: "Classic Cards", value: "classic" },
                    { label: "Modern Gradient", value: "gradient" },
                    { label: "Minimal", value: "minimal" },
                    { label: "Bold", value: "bold" }
                ]
            },
            alignment: {
                type: "select",
                options: [
                    { label: "Horizontal", value: "horizontal" },
                    { label: "Stacked", value: "stacked" }
                ]
            },
            buttonText: { type: "text" },
            showPopularBadge: {
                type: "radio",
                options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }]
            },
            plans: {
                type: "array",
                arrayFields: {
                    name: { type: "text" },
                    price: { type: "text" },
                    period: { type: "text" },
                    description: { type: "text" },
                    features: { type: "textarea" },
                    highlighted: { type: "radio", options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }] },
                    badge: { type: "text" },
                    buttonLink: { type: "text" },
                    customButtonText: { type: "text" },
                    accentColor: { type: "text" }
                }
            }
        },
        defaultProps: {
            title: "Choose Your Plan",
            subtitle: "Flexible pricing for every learner. Start free, upgrade anytime.",
            backgroundColor: "#ffffff",
            titleColor: "#111827",
            billingToggle: "yes",
            style: "classic",
            alignment: "horizontal",
            buttonText: "Get Started",
            showPopularBadge: "yes",
            plans: [
                { 
                    name: "Basic", 
                    price: "$0", 
                    period: "month", 
                    description: "Perfect for trying out our platform", 
                    features: "5 courses access\nBasic support\nCommunity forum access\nMobile app access", 
                    highlighted: "no",
                    badge: "Free Forever",
                    buttonLink: "#",
                    customButtonText: "",
                    accentColor: "#6b7280"
                },
                { 
                    name: "Pro", 
                    price: "$29", 
                    period: "month", 
                    description: "Best for serious learners", 
                    features: "Unlimited course access\nPriority support 24/7\nCertificates of completion\nOffline video download\nExclusive webinars\nCareer guidance", 
                    highlighted: "yes",
                    badge: "Most Popular",
                    buttonLink: "#",
                    customButtonText: "Start Free Trial",
                    accentColor: "#7c3aed"
                },
                { 
                    name: "Enterprise", 
                    price: "$99", 
                    period: "month", 
                    description: "For teams and organizations", 
                    features: "Everything in Pro\nTeam management tools\nCustom integrations\nDedicated account manager\nAdvanced analytics\nCustom branding\nAPI access", 
                    highlighted: "no",
                    badge: "Best Value",
                    buttonLink: "#",
                    customButtonText: "Contact Sales",
                    accentColor: "#1f2937"
                }
            ]
        },
        render: ({ title, subtitle, backgroundColor, titleColor, billingToggle, style, alignment, buttonText, showPopularBadge, plans }: any) => {
            const styleClasses = {
                classic: "border-2 border-gray-200 bg-white rounded-xl hover:shadow-xl",
                gradient: "bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border-2 border-transparent",
                minimal: "bg-white rounded-lg border-l-4",
                bold: "bg-white rounded-2xl shadow-2xl transform hover:scale-105"
            };
            
            return (
                <div className="py-20 px-6" style={{ backgroundColor }}>
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: titleColor }}>{title}</h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
                        </div>
                        
                        {billingToggle === "yes" && (
                            <div className="flex justify-center items-center gap-4 mb-12">
                                <span className="text-gray-600 font-semibold">Monthly</span>
                                <button className="relative w-16 h-8 bg-gray-300 rounded-full transition-colors">
                                    <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform"></div>
                                </button>
                                <span className="text-gray-600 font-semibold">
                                    Yearly 
                                    <span className="ml-2 bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm">Save 20%</span>
                                </span>
                            </div>
                        )}
                        
                        <div className={`grid grid-cols-1 ${alignment === "horizontal" ? "md:grid-cols-3" : "max-w-2xl mx-auto"} gap-8`}>
                            {plans?.map((plan: any, idx: number) => {
                                const isHighlighted = plan.highlighted === "yes";
                                const borderStyle = style === "minimal" ? { borderLeftColor: plan.accentColor || "#7c3aed" } : {};
                                
                                return (
                                    <div key={idx} className={`relative ${styleClasses[style as keyof typeof styleClasses]} ${isHighlighted ? "ring-4 ring-purple-600 ring-opacity-50 scale-105 z-10" : ""} transition-all duration-300`}
                                         style={borderStyle}>
                                        {showPopularBadge === "yes" && plan.badge && (
                                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                                <div className={`${isHighlighted ? "bg-purple-600" : "bg-gray-600"} text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg`}>
                                                    {plan.badge}
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="p-8">
                                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                            <p className="text-gray-600 mb-6 min-h-[48px]">{plan.description}</p>
                                            
                                            <div className="mb-6">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-5xl font-bold" style={{ color: plan.accentColor || "#111827" }}>{plan.price}</span>
                                                    <span className="text-gray-500">/{plan.period}</span>
                                                </div>
                                            </div>
                                            
                                            <ul className="space-y-4 mb-8">
                                                {plan.features?.split('\n').filter(Boolean).map((feature: string, fIdx: number) => (
                                                    <li key={fIdx} className="flex items-start gap-3">
                                                        <span className="text-green-500 mt-1 text-xl flex-shrink-0">✓</span>
                                                        <span className="text-gray-700">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            
                                            <a href={plan.buttonLink || "#"} 
                                               className={`block w-full py-3 rounded-lg font-semibold text-center transition-all ${
                                                   isHighlighted 
                                                       ? "bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl" 
                                                       : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                                               }`}>
                                                {plan.customButtonText || buttonText}
                                            </a>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="text-center mt-12">
                            <p className="text-gray-600 mb-4">All plans include a 30-day money-back guarantee</p>
                            <p className="text-sm text-gray-500">Have questions? <a href="#" className="text-purple-600 font-semibold hover:text-purple-700">Contact our sales team</a></p>
                        </div>
                    </div>
                </div>
            );
        }
    }
};

export default PricingSection;