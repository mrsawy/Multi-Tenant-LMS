
import { 
    styleFields, 
    defaultStyleProps, 
    getStyleProps,
    textField,
    textareaField,
    linkField,
    colorField,
    selectField,
    arrayField
} from "./utils";

const FeaturedGridSection = () => {
    return {
        fields: {
            ...styleFields,
            title: textField(true),
            subtitle: textareaField(true),
            backgroundColor: colorField(),
            titleColor: colorField(),
            subtitleColor: colorField(),
            columns: selectField([
                { label: "2 Columns", value: "2" },
                { label: "3 Columns", value: "3" },
                { label: "4 Columns", value: "4" }
            ]),
            cardStyle: selectField([
                { label: "Elevated with Shadow", value: "elevated" },
                { label: "Flat", value: "flat" },
                { label: "Bordered", value: "bordered" },
                { label: "Gradient Border", value: "gradient" }
            ]),
            cardBackgroundColor: colorField(),
            iconSize: selectField([
                { label: "Small", value: "text-4xl" },
                { label: "Medium", value: "text-5xl" },
                { label: "Large", value: "text-6xl" },
                { label: "Extra Large", value: "text-7xl" }
            ]),
            iconPosition: selectField([
                { label: "Top", value: "top" },
                { label: "Left", value: "left" },
                { label: "Center", value: "center" }
            ]),
            cardPadding: selectField([
                { label: "Small", value: "p-6" },
                { label: "Medium", value: "p-8" },
                { label: "Large", value: "p-10" }
            ]),
            hoverEffect: selectField([
                { label: "Lift", value: "lift" },
                { label: "Scale", value: "scale" },
                { label: "Glow", value: "glow" },
                { label: "None", value: "none" }
            ]),
            features: arrayField({
                icon: textField(true),
                title: textField(true),
                description: textareaField(true),
                link: linkField(),
                linkText: textField(true),
                iconBackground: colorField()
            })
        },
        defaultProps: {
            ...defaultStyleProps,
            title: "Why Choose Us",
            subtitle: "Everything you need to succeed in your learning journey",
            backgroundColor: "#f9fafb",
            titleColor: "#111827",
            subtitleColor: "#6b7280",
            columns: "3",
            cardStyle: "elevated",
            cardBackgroundColor: "#ffffff",
            iconSize: "text-5xl",
            iconPosition: "top",
            cardPadding: "p-8",
            hoverEffect: "lift",
            features: [
                {
                    icon: "📚",
                    title: "Expert Courses",
                    description: "Learn from industry professionals with years of real-world experience",
                    link: "#",
                    linkText: "Explore Courses",
                    iconBackground: "#ddd6fe"
                },
                {
                    icon: "🎓",
                    title: "Certificates",
                    description: "Earn recognized certifications upon completion of each course",
                    link: "#",
                    linkText: "View Certificates",
                    iconBackground: "#fce7f3"
                },
                {
                    icon: "💬",
                    title: "Community",
                    description: "Connect with learners worldwide and grow together",
                    link: "#",
                    linkText: "Join Community",
                    iconBackground: "#dbeafe"
                }
            ]
        },
        render: ({ title, subtitle, backgroundColor, titleColor, subtitleColor, columns, cardStyle, cardBackgroundColor, iconSize, iconPosition, cardPadding, hoverEffect, features, ...props }: any) => {
            const styleProps = getStyleProps(props);

            const cardStyles = {
                elevated: "shadow-lg hover:shadow-2xl",
                flat: "",
                bordered: "border-2 border-gray-200",
                gradient: "border-2 border-transparent bg-gradient-to-r from-purple-500 to-pink-500 p-[2px]"
            };

            const hoverEffects = {
                lift: "hover:-translate-y-2",
                scale: "hover:scale-105",
                glow: "hover:shadow-purple-500/50",
                none: ""
            };

            const layoutClasses = iconPosition === "left" ? "flex gap-4" : "flex flex-col";

            return (
                <div className="py-20 px-6" style={{ ...styleProps, backgroundColor }}>
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: titleColor }}>{title}</h2>
                            <p className="text-xl max-w-3xl mx-auto" style={{ color: subtitleColor }}>{subtitle}</p>
                        </div>
                        <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-8`}>
                            {features?.map((feature: any, idx: number) => {
                                const cardContent = (
                                    <div className={`${cardPadding} ${layoutClasses} ${iconPosition === "center" ? "text-center items-center" : ""}`}>
                                        <div className={`${iconSize} mb-4 ${iconPosition === "left" ? "mb-0 flex-shrink-0" : ""} ${iconPosition === "center" ? "mx-auto" : ""}`}>
                                            <div className="inline-block p-4 rounded-xl" style={{ backgroundColor: feature.iconBackground || "#f3f4f6" }}>
                                                {feature.icon}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                                            <p className="text-gray-600 mb-4">{feature.description}</p>
                                            {feature.link && feature.linkText && (
                                                <a href={feature.link} className="text-purple-600 font-semibold hover:text-purple-700 inline-flex items-center">
                                                    {feature.linkText} <span className="ml-2">→</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                );

                                if (cardStyle === "gradient") {
                                    return (
                                        <div key={idx} className={`${(cardStyles as any)[cardStyle]} rounded-xl ${hoverEffects[hoverEffect as keyof typeof hoverEffects]} transition-all duration-300`}>
                                            <div className="rounded-xl h-full" style={{ backgroundColor: cardBackgroundColor }}>
                                                {cardContent}
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={idx} className={`rounded-xl ${cardStyles[cardStyle as keyof typeof cardStyles]} ${hoverEffects[hoverEffect as keyof typeof hoverEffects]} transition-all duration-300`} style={{ backgroundColor: cardBackgroundColor }}>
                                        {cardContent}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            );
        }
    }
};

export default FeaturedGridSection;