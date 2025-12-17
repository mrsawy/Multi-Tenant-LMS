import {
    styleFields,
    defaultStyleProps,
    getStyleProps,
    textField,
    textareaField,
    colorFields,
    radioField,
    selectField,
    arrayField
} from "./utils";

const StatsSection = () => {
    return {
        fields: {
            ...styleFields,
            title: textField(true),
            subtitle: textareaField(true),
            ...colorFields,
            layout: selectField([
                { label: "Horizontal", value: "horizontal" },
                { label: "Grid", value: "grid" },
                { label: "Stacked", value: "stacked" }
            ]),
            columns: selectField([
                { label: "2 Columns", value: "2" },
                { label: "3 Columns", value: "3" },
                { label: "4 Columns", value: "4" },
                { label: "5 Columns", value: "5" }
            ]),
            numberSize: selectField([
                { label: "Small", value: "text-4xl" },
                { label: "Medium", value: "text-5xl" },
                { label: "Large", value: "text-6xl" },
                { label: "Extra Large", value: "text-7xl" }
            ]),
            showIcons: radioField([
                { label: "Yes", value: "yes" }, 
                { label: "No", value: "no" }
            ]),
            showDividers: radioField([
                { label: "Yes", value: "yes" }, 
                { label: "No", value: "no" }
            ]),
            animated: radioField([
                { label: "Yes", value: "yes" }, 
                { label: "No", value: "no" }
            ]),
            style: selectField([
                { label: "Simple", value: "simple" },
                { label: "Cards", value: "cards" },
                { label: "Minimal", value: "minimal" },
                { label: "Bold", value: "bold" }
            ]),
            stats: arrayField({
                number: textField(true),
                label: textField(true),
                icon: textField(true),
                description: textField(true),
                suffix: textField(true)
            })
        },
        defaultProps: {
            ...defaultStyleProps,
            title: "Our Impact in Numbers",
            subtitle: "Join thousands of learners who are transforming their careers",
            backgroundColor: "#667eea",
            textColor: "#ffffff",
            layout: "horizontal",
            columns: "4",
            numberSize: "text-5xl",
            showIcons: "yes",
            showDividers: "no",
            animated: "yes",
            style: "simple",
            stats: [
                { number: "10,000", label: "Active Students", icon: "👨‍🎓", description: "Learning worldwide", suffix: "+" },
                { number: "500", label: "Expert Courses", icon: "📚", description: "Across all categories", suffix: "+" },
                { number: "95", label: "Satisfaction Rate", icon: "⭐", description: "From our students", suffix: "%" },
                { number: "50", label: "Industry Experts", icon: "🎯", description: "Teaching live", suffix: "+" }
            ]
        },
        render: ({ title, subtitle, backgroundColor, textColor, layout, columns, numberSize, showIcons, showDividers, animated, style, stats, ...props }: any) => {
            const styleProps = getStyleProps(props);
            
            const layoutClasses = {
                horizontal: `grid grid-cols-2 md:grid-cols-${columns} gap-8`,
                grid: `grid grid-cols-2 md:grid-cols-${columns} gap-8`,
                stacked: "flex flex-col gap-8 max-w-3xl mx-auto"
            };
            
            const styleClasses = {
                simple: "",
                cards: "bg-white/10 backdrop-blur-lg rounded-xl p-8 hover:bg-white/20 transition-all",
                minimal: "border-l-4 border-white/30 pl-6",
                bold: "bg-white text-gray-900 rounded-2xl p-8 shadow-2xl hover:scale-105 transition-transform"
            };
            
            return (
                <div className="py-20 px-6" style={{ ...styleProps, backgroundColor: backgroundColor || "#667eea" }}>
                    <div className="max-w-7xl mx-auto">
                        {(title || subtitle) && (
                            <div className="text-center mb-16">
                                {title && <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: textColor }}>{title}</h2>}
                                {subtitle && <p className="text-xl opacity-90" style={{ color: textColor }}>{subtitle}</p>}
                            </div>
                        )}
                        
                        <div className={layoutClasses[layout as keyof typeof layoutClasses]}>
                            {stats?.map((stat: any, idx: number) => (
                                <div key={idx} className={`text-center ${styleClasses[style as keyof typeof styleClasses]} ${animated === "yes" ? "animate-fadeIn" : ""}`}
                                     style={{ animationDelay: `${idx * 100}ms` }}>
                                    {showIcons === "yes" && stat.icon && (
                                        <div className="text-5xl mb-4">{stat.icon}</div>
                                    )}
                                    <div className={`${numberSize} font-bold mb-2`} style={{ color: style === "bold" ? "#7c3aed" : textColor }}>
                                        {stat.number}{stat.suffix}
                                    </div>
                                    <div className="text-xl font-semibold mb-2" style={{ color: style === "bold" ? "#111827" : textColor, opacity: style === "bold" ? 1 : 0.9 }}>
                                        {stat.label}
                                    </div>
                                    {stat.description && (
                                        <div className="text-sm opacity-75" style={{ color: style === "bold" ? "#6b7280" : textColor }}>
                                            {stat.description}
                                        </div>
                                    )}
                                    {showDividers === "yes" && idx < stats.length - 1 && layout === "horizontal" && (
                                        <div className="hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2 h-16 w-px bg-white/30"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }
    }
};

export default StatsSection;