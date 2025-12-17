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

export const FeatureCardsSection = () => {
    return {
        fields: {
            ...styleFields,
            title: textField(true),
            subtitle: textareaField(true),
            ...colorFields,
            layout: selectField([
                { label: "Grid 2 Columns", value: "grid-2" },
                { label: "Grid 3 Columns", value: "grid-3" },
                { label: "Grid 4 Columns", value: "grid-4" },
            ]),
            cardStyle: selectField([
                { label: "Default", value: "default" },
                { label: "Bordered", value: "bordered" },
                { label: "Elevated", value: "elevated" },
                { label: "Glassmorphism", value: "glass" },
            ]),
            animation: animationField,
            features: arrayField({
                icon: textField(true),
                title: textField(true),
                description: textareaField(true),
                color: textField(false),
            }),
        },
        defaultProps: {
            ...defaultStyleProps,
            title: "Why Choose Our Platform",
            subtitle: "Everything you need to succeed in your learning journey",
            backgroundColor: "#f9fafb",
            textColor: "#1f2937",
            layout: "grid-3",
            cardStyle: "elevated",
            animation: "fade",
            features: [
                {
                    icon: "🎯",
                    title: "Expert Instructors",
                    description: "Learn from industry professionals with years of experience",
                    color: "#8b5cf6"
                },
                {
                    icon: "📚",
                    title: "Comprehensive Content",
                    description: "Access a vast library of courses covering various topics",
                    color: "#3b82f6"
                },
                {
                    icon: "🏆",
                    title: "Certificates",
                    description: "Earn recognized certificates upon course completion",
                    color: "#10b981"
                },
                {
                    icon: "💬",
                    title: "Community Support",
                    description: "Join a vibrant community of learners and mentors",
                    color: "#f59e0b"
                },
                {
                    icon: "⚡",
                    title: "Lifetime Access",
                    description: "Learn at your own pace with unlimited course access",
                    color: "#ef4444"
                },
                {
                    icon: "📱",
                    title: "Mobile Learning",
                    description: "Study anywhere with our mobile-friendly platform",
                    color: "#06b6d4"
                }
            ]
        },
        render: ({ 
            title, 
            subtitle, 
            backgroundColor, 
            textColor, 
            layout, 
            cardStyle,
            animation,
            features, 
            ...props 
        }: any) => {
            const styleProps = getStyleProps(props);
            
            const gridClasses = {
                "grid-2": "grid-cols-1 md:grid-cols-2",
                "grid-3": "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
                "grid-4": "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
            };

            const cardStyles = {
                default: "bg-white p-6 rounded-xl",
                bordered: "bg-white p-6 rounded-xl border-2 border-gray-200",
                elevated: "bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow",
                glass: "bg-white/80 backdrop-blur-md p-6 rounded-xl border border-white/20 shadow-xl",
            };

            const animationClass = animation === "fade" ? "animate-fadeIn" : animation === "slide" ? "animate-slideUp" : "";

            return (
                <div className="py-20 px-6" style={{ ...styleProps, backgroundColor }}>
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: textColor }}>
                                {title}
                            </h2>
                            <p className="text-xl opacity-80 max-w-3xl mx-auto" style={{ color: textColor }}>
                                {subtitle}
                            </p>
                        </div>
                        <div className={`grid ${gridClasses[layout as keyof typeof gridClasses]} gap-8`}>
                            {features?.map((feature: any, idx: number) => (
                                <div 
                                    key={idx} 
                                    className={`${cardStyles[cardStyle as keyof typeof cardStyles]} ${animationClass} group hover:-translate-y-2 transition-all duration-300`}
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                >
                                    <div 
                                        className="text-5xl mb-4 inline-block p-4 rounded-lg" 
                                        style={{ backgroundColor: `${feature.color}20` }}
                                    >
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3" style={{ color: textColor }}>
                                        {feature.title}
                                    </h3>
                                    <p className="opacity-70" style={{ color: textColor }}>
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }
    };
};

export default FeatureCardsSection;
