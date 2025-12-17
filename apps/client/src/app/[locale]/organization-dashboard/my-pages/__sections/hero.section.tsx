
import { 
    styleFields, 
    defaultStyleProps, 
    getStyleProps, 
    imageField,
    textField,
    textareaField,
    linkField,
    colorField,
    numberField,
    radioField,
    selectField,
    titleFields,
    subtitleFields,
    buttonFields,
    secondaryButtonFields,
    colorFields,
    alignmentField,
    animationField
} from "./utils";

export const HeroSection = () => {
    return {
        fields: {
            ...styleFields,
            ...titleFields,
            ...subtitleFields,
            ...buttonFields,
            ...secondaryButtonFields,
            backgroundImage: imageField,
            ...colorFields,
            alignment: alignmentField,
            overlayOpacity: numberField(0, 1),
            height: selectField([
                { label: "Small (400px)", value: "400" },
                { label: "Medium (600px)", value: "600" },
                { label: "Large (800px)", value: "800" },
                { label: "Full Screen", value: "screen" }
            ]),
            showScrollIndicator: radioField([
                { label: "Yes", value: "yes" }, 
                { label: "No", value: "no" }
            ]),
            animation: animationField
        },
        defaultProps: {
            ...defaultStyleProps,
            title: "Transform Your Learning Journey",
            titleSize: "text-5xl md:text-7xl",
            subtitle: "Access world-class courses and expert instructors from anywhere in the world",
            subtitleSize: "text-lg md:text-xl",
            ctaText: "Get Started",
            ctaLink: "#",
            buttonStyle: "rounded-lg",
            buttonSize: "px-8 py-4 text-lg",
            secondaryCtaText: "Learn More",
            secondaryCtaLink: "#",
            alignment: "center",
            overlayOpacity: 0.5,
            height: "600",
            textColor: "#ffffff",
            backgroundColor: "#667eea",
            showScrollIndicator: "yes",
            animation: "fade"
        },
        render: ({ 
            title, 
            titleSize,
            subtitle, 
            subtitleSize,
            ctaText, 
            ctaLink, 
            buttonStyle,
            buttonSize,
            secondaryCtaText, 
            secondaryCtaLink, 
            backgroundImage, 
            backgroundColor, 
            textColor, 
            alignment, 
            overlayOpacity, 
            height, 
            showScrollIndicator, 
            animation, 
            ...props 
        }: any) => {
            const alignmentClasses = {
                left: "text-left items-start",
                center: "text-center items-center",
                right: "text-right items-end"
            };
            
            const heightClass = height === "screen" ? "min-h-screen" : `min-h-[${height}px]`;
            
            const animationClass = animation === "fade" ? "animate-fadeIn" : animation === "slide" ? "animate-slideUp" : "";

            const styleProps = getStyleProps(props);
            
            return (
                <div className={`relative ${heightClass} flex items-center justify-center overflow-hidden`}
                     style={{ 
                         ...styleProps,
                         backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
                         backgroundColor: backgroundColor || '#667eea',
                         backgroundSize: 'cover', 
                         backgroundPosition: 'center' 
                     }}>
                    <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity || 0.5 }}></div>
                    <div className={`relative z-10 max-w-5xl mx-auto px-6 flex flex-col ${alignmentClasses[alignment as keyof typeof alignmentClasses]} ${animationClass}`}>
                        <h1 className={`${titleSize} font-bold mb-6`} style={{ color: textColor }}>{title}</h1>
                        <p className={`${subtitleSize} mb-8 max-w-3xl`} style={{ color: textColor, opacity: 0.9 }}>{subtitle}</p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <a href={ctaLink} className={`bg-white text-purple-600 ${buttonSize} ${buttonStyle} font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg`}>
                                {ctaText}
                            </a>
                            {secondaryCtaText && (
                                <a href={secondaryCtaLink} className={`border-2 border-white ${buttonSize} ${buttonStyle} font-semibold hover:bg-white hover:text-gray-900 transition-all`} style={{ color: textColor }}>
                                    {secondaryCtaText}
                                </a>
                            )}
                        </div>
                    </div>
                    {showScrollIndicator === "yes" && (
                        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                            <div className="w-6 h-10 border-2 rounded-full flex justify-center pt-2" style={{ borderColor: textColor }}>
                                <div className="w-1 h-2 rounded-full" style={{ backgroundColor: textColor }}></div>
                            </div>
                        </div>
                    )}
                </div>
            );
        }
    }
};



export const HeroWithVideo = () => {
    return {
        fields: {
            ...styleFields,
            ...titleFields,
            ...subtitleFields,
            videoUrl: linkField(),
            ...buttonFields,
            ...secondaryButtonFields,
            overlayOpacity: numberField(0, 1),
            ...colorFields,
            layout: selectField([
                { label: "Video Right", value: "right" },
                { label: "Video Left", value: "left" },
                { label: "Video Background", value: "background" }
            ]),
            videoAspectRatio: selectField([
                { label: "16:9", value: "aspect-video" },
                { label: "4:3", value: "aspect-4/3" },
                { label: "1:1", value: "aspect-square" }
            ])
        },
        defaultProps: {
            ...defaultStyleProps,
            title: "Learn From the Best",
            titleSize: "text-5xl md:text-6xl",
            subtitle: "Watch our introduction video and discover how our platform can transform your learning experience",
            subtitleSize: "text-lg md:text-xl",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            ctaText: "Start Learning",
            ctaLink: "#",
            buttonStyle: "rounded-lg",
            buttonSize: "px-8 py-4 text-lg",
            secondaryCtaText: "View Courses",
            secondaryCtaLink: "#",
            overlayOpacity: 0.3,
            backgroundColor: "#1e1b4b",
            textColor: "#ffffff",
            layout: "right",
            videoAspectRatio: "aspect-video"
        },
        render: ({ 
            title, 
            titleSize,
            subtitle, 
            subtitleSize,
            videoUrl, 
            ctaText, 
            ctaLink, 
            buttonStyle,
            buttonSize,
            secondaryCtaText, 
            secondaryCtaLink, 
            overlayOpacity, 
            backgroundColor, 
            textColor, 
            layout, 
            videoAspectRatio, 
            ...props 
        }: any) => {
            const styleProps = getStyleProps(props);

            if (layout === "background") {
                return (
                    <div className="relative min-h-screen flex items-center justify-center overflow-hidden" style={styleProps}>
                        <video
                            autoPlay
                            loop
                            muted
                            className="absolute inset-0 w-full h-full object-cover"
                        >
                            <source src={videoUrl} type="video/mp4" />
                        </video>
                        <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity || 0.5 }}></div>
                        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                            <h1 className={`${titleSize} font-bold mb-6`} style={{ color: textColor }}>{title}</h1>
                            <p className={`${subtitleSize} mb-8`} style={{ color: textColor, opacity: 0.9 }}>{subtitle}</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a href={ctaLink} className={`bg-white text-purple-600 ${buttonSize} ${buttonStyle} font-semibold hover:bg-gray-100 transition-colors`}>
                                    {ctaText}
                                </a>
                                {secondaryCtaText && (
                                    <a href={secondaryCtaLink} className={`border-2 border-white ${buttonSize} ${buttonStyle} font-semibold hover:bg-white hover:text-gray-900 transition-colors`} style={{ color: textColor }}>
                                        {secondaryCtaText}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                );
            }
            
            return (
                <div className="py-20 px-6" style={{ ...styleProps, backgroundColor: backgroundColor || '#1e1b4b' }}>
                    <div className="max-w-7xl mx-auto">
                        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${layout === "left" ? "lg:flex-row-reverse" : ""}`}>
                            <div className={layout === "left" ? "order-2" : ""} style={{ color: textColor }}>
                                <h1 className={`${titleSize} font-bold mb-6`}>{title}</h1>
                                <p className={`${subtitleSize} mb-8 opacity-90`}>{subtitle}</p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <a href={ctaLink} className={`bg-white text-purple-600 ${buttonSize} ${buttonStyle} font-semibold hover:bg-gray-100 transition-colors text-center`}>
                                        {ctaText}
                                    </a>
                                    {secondaryCtaText && (
                                        <a href={secondaryCtaLink} className={`border-2 ${buttonSize} ${buttonStyle} font-semibold hover:bg-white hover:text-gray-900 transition-colors text-center`} style={{ borderColor: textColor, color: textColor }}>
                                            {secondaryCtaText}
                                        </a>
                                    )}
                                </div>
                            </div>
                            <div className={`relative rounded-2xl overflow-hidden shadow-2xl ${layout === "left" ? "order-1" : ""}`}>
                                <iframe
                                    className={`w-full ${videoAspectRatio}`}
                                    src={videoUrl}
                                    title="Video"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
};

