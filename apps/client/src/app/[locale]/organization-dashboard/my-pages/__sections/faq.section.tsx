import React, { useState } from 'react';
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
    arrayField
} from "./utils";

const FAQSection = () => {
    return {
        fields: {
            ...styleFields,
            title: textField(true),
            subtitle: textareaField(true),
            backgroundColor: colorField(),
            titleColor: colorField(),
            layout: selectField([
                { label: "Single Column", value: "single" },
                { label: "Two Columns", value: "two" },
                { label: "With Sidebar", value: "sidebar" }
            ]),
            style: selectField([
                { label: "Modern", value: "modern" },
                { label: "Classic", value: "classic" },
                { label: "Minimal", value: "minimal" },
                { label: "Bold", value: "bold" }
            ]),
            accordionColor: colorField(),
            showIcons: radioField([
                { label: "Yes", value: "yes" }, 
                { label: "No", value: "no" }
            ]),
            showCategories: radioField([
                { label: "Yes", value: "yes" }, 
                { label: "No", value: "no" }
            ]),
            openByDefault: radioField([
                { label: "First Item", value: "first" }, 
                { label: "None", value: "none" }, 
                { label: "All", value: "all" }
            ]),
            contactText: textField(true),
            contactLink: linkField(),
            faqs: arrayField({
                question: textField(true),
                answer: textareaField(true),
                category: textField(true),
                icon: textField(true)
            })
        },
        defaultProps: {
            ...defaultStyleProps,
            title: "Frequently Asked Questions",
            subtitle: "Everything you need to know about our platform. Can't find what you're looking for? Contact our support team.",
            backgroundColor: "#f9fafb",
            titleColor: "#111827",
            layout: "single",
            style: "modern",
            accordionColor: "#7c3aed",
            showIcons: "yes",
            showCategories: "yes",
            openByDefault: "first",
            contactText: "Still have questions? Contact us",
            contactLink: "#",
            faqs: [
                { 
                    question: "How do I enroll in a course?", 
                    answer: "Simply browse our course catalog, select the course you want, and click the enroll button. You can start learning immediately after enrollment. All course materials are available 24/7.", 
                    category: "Getting Started",
                    icon: "📚"
                },
                { 
                    question: "Can I get a refund?", 
                    answer: "Yes, we offer a 30-day money-back guarantee on all courses. If you're not satisfied with your purchase, simply contact our support team within 30 days for a full refund.",
                    category: "Billing",
                    icon: "💰"
                },
                { 
                    question: "Do I receive a certificate upon completion?", 
                    answer: "Yes! All paid courses include a certificate of completion. Once you finish all course materials and pass the final assessment, your certificate will be automatically generated and available for download.",
                    category: "Certificates",
                    icon: "🎓"
                },
                { 
                    question: "Can I access courses on mobile devices?", 
                    answer: "Absolutely! Our platform is fully responsive and we also offer dedicated mobile apps for iOS and Android. You can learn on any device, anytime, anywhere.",
                    category: "Access",
                    icon: "📱"
                },
                { 
                    question: "Is there a free trial available?", 
                    answer: "Yes, we offer a 7-day free trial for our Pro plan. No credit card required. You'll have full access to all features during the trial period.",
                    category: "Getting Started",
                    icon: "🆓"
                }
            ]
        },
        render: ({ title, subtitle, backgroundColor, titleColor, layout, style, accordionColor, showIcons, showCategories, openByDefault, contactText, contactLink, faqs }: any) => {
            const [openIndex, setOpenIndex] = useState<number | null>(
                openByDefault === "first" ? 0 : openByDefault === "all" ? -1 : null
            );
            
            const categories = showCategories === "yes" 
                ? Array.from(new Set(faqs?.map((f: any) => f.category).filter(Boolean)))
                : [];
            
            const styleClasses = {
                modern: "bg-white rounded-xl shadow-lg",
                classic: "bg-white rounded-lg border-2 border-gray-200",
                minimal: "bg-white rounded-lg border-l-4",
                bold: "bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200"
            };
            
            const renderFAQ = (faq: any, idx: number) => {
                const isOpen = openByDefault === "all" ? true : openIndex === idx;
                
                return (
                    <div key={idx} className={`${styleClasses[style as keyof typeof styleClasses]} overflow-hidden transition-all`}
                         style={style === "minimal" ? { borderLeftColor: accordionColor } : {}}>
                        <button
                            onClick={() => setOpenIndex(isOpen && openByDefault !== "all" ? null : idx)}
                            className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors group"
                        >
                            <div className="flex items-center gap-4 flex-1">
                                {showIcons === "yes" && faq.icon && (
                                    <span className="text-3xl">{faq.icon}</span>
                                )}
                                <div className="flex-1">
                                    {showCategories === "yes" && faq.category && (
                                        <span className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-1 block">{faq.category}</span>
                                    )}
                                    <span className="font-bold text-gray-900 text-lg">{faq.question}</span>
                                </div>
                            </div>
                            <span className={`text-3xl transition-transform ${isOpen ? "rotate-45" : ""}`} style={{ color: accordionColor }}>
                                +
                            </span>
                        </button>
                        {isOpen && (
                            <div className="px-6 pb-6 text-gray-700 leading-relaxed animate-fadeIn">
                                {showIcons === "yes" && faq.icon && <div className="ml-16" />}
                                <div className={showIcons === "yes" && faq.icon ? "ml-16" : ""}>
                                    {faq.answer}
                                </div>
                            </div>
                        )}
                    </div>
                );
            };
            
            if (layout === "sidebar") {
                return (
                    <div className="py-20 px-6" style={{ backgroundColor }}>
                        <div className="max-w-7xl mx-auto">
                            <div className="text-center mb-12">
                                <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: titleColor }}>{title}</h2>
                                <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                <div className="lg:col-span-1">
                                    <div className="bg-white rounded-xl p-6 shadow-lg sticky top-6">
                                        <h3 className="font-bold text-xl mb-4 text-gray-900">Categories</h3>
                                        <ul className="space-y-2">
                                            {categories.map((cat: any, idx: number) => (
                                                <li key={idx}>
                                                    <button className="text-left w-full px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-600 font-semibold transition-colors">
                                                        {cat}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                        {contactText && (
                                            <div className="mt-8 pt-6 border-t border-gray-200">
                                                <a href={contactLink} className="block text-center bg-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                                                    {contactText}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="lg:col-span-3 space-y-4">
                                    {faqs?.map(renderFAQ)}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
            
            if (layout === "two") {
                return (
                    <div className="py-20 px-6" style={{ backgroundColor }}>
                        <div className="max-w-7xl mx-auto">
                            <div className="text-center mb-12">
                                <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: titleColor }}>{title}</h2>
                                <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
                            </div>
                            
                            {showCategories === "yes" && categories.length > 0 && (
                                <div className="flex flex-wrap justify-center gap-3 mb-12">
                                    {categories.map((cat: any, idx: number) => (
                                        <button key={idx} className="px-6 py-2 rounded-full bg-purple-100 text-purple-700 font-semibold hover:bg-purple-200 transition-colors">
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {faqs?.map(renderFAQ)}
                            </div>
                            
                            {contactText && (
                                <div className="text-center mt-12">
                                    <a href={contactLink} className="inline-block bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-purple-700 transition-colors">
                                        {contactText}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                );
            }
            
            // Single column layout (default)
            return (
                <div className="py-20 px-6" style={{ backgroundColor }}>
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: titleColor }}>{title}</h2>
                            <p className="text-xl text-gray-600">{subtitle}</p>
                        </div>
                        
                        <div className="space-y-4">
                            {faqs?.map(renderFAQ)}
                        </div>
                        
                        {contactText && (
                            <div className="text-center mt-12">
                                <a href={contactLink} className="inline-block bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-purple-700 transition-colors">
                                    {contactText}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            );
        }
    }
};

export default FAQSection;