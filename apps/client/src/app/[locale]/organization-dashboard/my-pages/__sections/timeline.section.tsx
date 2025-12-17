import {
    styleFields,
    defaultStyleProps,
    getStyleProps,
    textField,
    textareaField,
    colorFields,
    selectField,
    arrayField,
    animationField
} from "./utils";

export const TimelineSection = () => {
    return {
        fields: {
            ...styleFields,
            title: textField(true),
            subtitle: textareaField(true),
            ...colorFields,
            layout: selectField([
                { label: "Vertical", value: "vertical" },
                { label: "Horizontal", value: "horizontal" },
                { label: "Alternating", value: "alternating" },
            ]),
            animation: animationField,
            milestones: arrayField({
                year: textField(true),
                title: textField(true),
                description: textareaField(true),
                icon: textField(true),
            }),
        },
        defaultProps: {
            ...defaultStyleProps,
            title: "Our Journey",
            subtitle: "Milestones that shaped our platform",
            backgroundColor: "#ffffff",
            textColor: "#1f2937",
            layout: "alternating",
            animation: "fade",
            milestones: [
                {
                    year: "2020",
                    title: "Platform Launch",
                    description: "Started with a vision to make quality education accessible to everyone",
                    icon: "🚀"
                },
                {
                    year: "2021",
                    title: "10,000 Students",
                    description: "Reached our first major milestone with students from 50+ countries",
                    icon: "🎓"
                },
                {
                    year: "2022",
                    title: "Expert Partnerships",
                    description: "Partnered with industry leaders to bring world-class content",
                    icon: "🤝"
                },
                {
                    year: "2023",
                    title: "Mobile App Launch",
                    description: "Expanded to mobile platforms for learning on the go",
                    icon: "📱"
                },
                {
                    year: "2024",
                    title: "AI-Powered Learning",
                    description: "Introduced personalized learning paths powered by AI",
                    icon: "🤖"
                }
            ]
        },
        render: ({ 
            title, 
            subtitle, 
            backgroundColor, 
            textColor, 
            layout,
            animation,
            milestones, 
            ...props 
        }: any) => {
            const styleProps = getStyleProps(props);
            const animationClass = animation === "fade" ? "animate-fadeIn" : animation === "slide" ? "animate-slideUp" : "";

            if (layout === "horizontal") {
                return (
                    <div className="py-20 px-6 overflow-x-auto" style={{ ...styleProps, backgroundColor }}>
                        <div className="max-w-7xl mx-auto">
                            <div className="text-center mb-16">
                                <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: textColor }}>
                                    {title}
                                </h2>
                                <p className="text-xl opacity-80 max-w-3xl mx-auto" style={{ color: textColor }}>
                                    {subtitle}
                                </p>
                            </div>
                            <div className="flex gap-8 pb-8">
                                {milestones?.map((milestone: any, idx: number) => (
                                    <div 
                                        key={idx} 
                                        className={`flex-shrink-0 w-80 ${animationClass}`}
                                        style={{ animationDelay: `${idx * 150}ms` }}
                                    >
                                        <div className="relative">
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-gradient-to-b from-purple-500 to-transparent"></div>
                                            <div 
                                                className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2"
                                                style={{ borderTop: `4px solid #8b5cf6` }}
                                            >
                                                <div className="text-4xl mb-4">{milestone.icon}</div>
                                                <div className="text-3xl font-bold mb-2" style={{ color: "#8b5cf6" }}>
                                                    {milestone.year}
                                                </div>
                                                <h3 className="text-xl font-bold mb-2" style={{ color: textColor }}>
                                                    {milestone.title}
                                                </h3>
                                                <p className="opacity-70" style={{ color: textColor }}>
                                                    {milestone.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            }

            if (layout === "alternating") {
                return (
                    <div className="py-20 px-6" style={{ ...styleProps, backgroundColor }}>
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-16">
                                <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: textColor }}>
                                    {title}
                                </h2>
                                <p className="text-xl opacity-80 max-w-3xl mx-auto" style={{ color: textColor }}>
                                    {subtitle}
                                </p>
                            </div>
                            <div className="relative">
                                <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-blue-500 to-green-500 hidden md:block"></div>
                                {milestones?.map((milestone: any, idx: number) => (
                                    <div 
                                        key={idx} 
                                        className={`relative mb-12 ${animationClass}`}
                                        style={{ animationDelay: `${idx * 150}ms` }}
                                    >
                                        <div className={`md:flex items-center ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                                            <div className="md:w-1/2 md:px-8">
                                                {idx % 2 === 0 && (
                                                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
                                                        <div className="flex items-center gap-4 mb-3">
                                                            <div className="text-4xl">{milestone.icon}</div>
                                                            <div className="text-3xl font-bold" style={{ color: "#8b5cf6" }}>
                                                                {milestone.year}
                                                            </div>
                                                        </div>
                                                        <h3 className="text-2xl font-bold mb-2" style={{ color: textColor }}>
                                                            {milestone.title}
                                                        </h3>
                                                        <p className="opacity-70" style={{ color: textColor }}>
                                                            {milestone.description}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="hidden md:block absolute left-1/2 -translate-x-1/2 w-8 h-8 bg-purple-500 rounded-full border-4 border-white shadow-lg"></div>
                                            <div className="md:w-1/2 md:px-8">
                                                {idx % 2 !== 0 && (
                                                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
                                                        <div className="flex items-center gap-4 mb-3">
                                                            <div className="text-4xl">{milestone.icon}</div>
                                                            <div className="text-3xl font-bold" style={{ color: "#8b5cf6" }}>
                                                                {milestone.year}
                                                            </div>
                                                        </div>
                                                        <h3 className="text-2xl font-bold mb-2" style={{ color: textColor }}>
                                                            {milestone.title}
                                                        </h3>
                                                        <p className="opacity-70" style={{ color: textColor }}>
                                                            {milestone.description}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            }

            // Vertical layout
            return (
                <div className="py-20 px-6" style={{ ...styleProps, backgroundColor }}>
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: textColor }}>
                                {title}
                            </h2>
                            <p className="text-xl opacity-80 max-w-3xl mx-auto" style={{ color: textColor }}>
                                {subtitle}
                            </p>
                        </div>
                        <div className="relative">
                            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-blue-500 to-green-500"></div>
                            {milestones?.map((milestone: any, idx: number) => (
                                <div 
                                    key={idx} 
                                    className={`relative pl-20 pb-12 ${animationClass}`}
                                    style={{ animationDelay: `${idx * 150}ms` }}
                                >
                                    <div className="absolute left-8 -translate-x-1/2 w-8 h-8 bg-purple-500 rounded-full border-4 border-white shadow-lg"></div>
                                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className="text-4xl">{milestone.icon}</div>
                                            <div className="text-3xl font-bold" style={{ color: "#8b5cf6" }}>
                                                {milestone.year}
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2" style={{ color: textColor }}>
                                            {milestone.title}
                                        </h3>
                                        <p className="opacity-70" style={{ color: textColor }}>
                                            {milestone.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }
    };
};

export default TimelineSection;
