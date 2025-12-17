import {
    styleFields,
    defaultStyleProps,
    getStyleProps,
    textField,
    textareaField,
    colorField,
    numberField,
    radioField,
    selectField,
    arrayField,
    imageField
} from "./utils";

const TestimonialSection = () => {
    return {
        fields: {
            ...styleFields,
            title: textField(true),
            subtitle: textareaField(true),
            backgroundColor: colorField(),
            titleColor: colorField(),
            layout: selectField([
                { label: "Grid", value: "grid" },
                { label: "Carousel", value: "carousel" },
                { label: "Masonry", value: "masonry" },
                { label: "Featured", value: "featured" }
            ]),
            columns: selectField([
                { label: "1 Column", value: "1" },
                { label: "2 Columns", value: "2" },
                { label: "3 Columns", value: "3" }
            ]),
            cardStyle: selectField([
                { label: "Modern", value: "modern" },
                { label: "Classic", value: "classic" },
                { label: "Minimal", value: "minimal" },
                { label: "Quote Style", value: "quote" }
            ]),
            showRatings: radioField([
                { label: "Yes", value: "yes" }, 
                { label: "No", value: "no" }
            ]),
            showCompany: radioField([
                { label: "Yes", value: "yes" }, 
                { label: "No", value: "no" }
            ]),
            showDate: radioField([
                { label: "Yes", value: "yes" }, 
                { label: "No", value: "no" }
            ]),
            avatarStyle: selectField([
                { label: "Circle", value: "rounded-full" },
                { label: "Square", value: "rounded-lg" },
                { label: "Rounded Square", value: "rounded-xl" }
            ]),
            avatarSize: selectField([
                { label: "Small", value: "w-12 h-12" },
                { label: "Medium", value: "w-16 h-16" },
                { label: "Large", value: "w-20 h-20" }
            ]),
            testimonials: arrayField({
                name: textField(true),
                role: textField(true),
                company: textField(true),
                avatar: imageField,
                content: textareaField(true),
                rating: numberField(1, 5),
                date: textField(true),
                featured: radioField([
                    { label: "Yes", value: "yes" }, 
                    { label: "No", value: "no" }
                ])
            })
        },
        defaultProps: {
            ...defaultStyleProps,
            title: "What Our Students Say",
            subtitle: "Don't just take our word for it - hear from our community of learners",
            backgroundColor: "#f9fafb",
            titleColor: "#111827",
            layout: "grid",
            columns: "2",
            cardStyle: "modern",
            showRatings: "yes",
            showCompany: "yes",
            showDate: "yes",
            avatarStyle: "rounded-full",
            avatarSize: "w-16 h-16",
            testimonials: [
                { 
                    name: "Sarah Johnson", 
                    role: "Marketing Manager", 
                    company: "Tech Corp",
                    avatar: "", 
                    content: "This platform transformed my career. The courses are practical, engaging, and taught by industry experts. I've learned more in 3 months than I did in years of self-study!", 
                    rating: 5,
                    date: "2 weeks ago",
                    featured: "yes"
                },
                { 
                    name: "Mike Chen", 
                    role: "Software Developer", 
                    company: "StartupXYZ",
                    avatar: "", 
                    content: "Best investment in my professional development. The community support and mentorship made all the difference. Highly recommended!", 
                    rating: 5,
                    date: "1 month ago",
                    featured: "no"
                },
                { 
                    name: "Emily Rodriguez", 
                    role: "Data Analyst", 
                    company: "Analytics Inc",
                    avatar: "", 
                    content: "The quality of instruction is outstanding. I was able to transition into a new career path thanks to the comprehensive curriculum and hands-on projects.", 
                    rating: 5,
                    date: "3 weeks ago",
                    featured: "no"
                }
            ]
        },
        render: ({ title, subtitle, backgroundColor, titleColor, layout, columns, cardStyle, showRatings, showCompany, showDate, avatarStyle, avatarSize, testimonials, ...props }: any) => {
            const styleProps = getStyleProps(props);
            
            const cardStyles = {
                modern: "bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl",
                classic: "bg-white p-8 rounded-lg border border-gray-200",
                minimal: "bg-white p-8 rounded-xl border-l-4 border-purple-600",
                quote: "bg-gradient-to-br from-purple-50 to-blue-50 p-8 rounded-2xl relative"
            };
            
            const featuredTestimonial = testimonials?.find((t: any) => t.featured === "yes");
            const regularTestimonials = testimonials?.filter((t: any) => t.featured !== "yes");
            
            return (
                <div className="py-20 px-6" style={{ ...styleProps, backgroundColor }}>
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: titleColor }}>{title}</h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
                        </div>
                        
                        {layout === "featured" && featuredTestimonial && (
                            <div className="mb-12 bg-gradient-to-r from-purple-600 to-blue-600 p-1 rounded-3xl">
                                <div className="bg-white p-12 rounded-3xl">
                                    <div className="flex flex-col md:flex-row gap-8 items-center">
                                        <div className={`${avatarSize.replace('w-16 h-16', 'w-24 h-24').replace('w-12 h-12', 'w-20 h-20').replace('w-20 h-20', 'w-32 h-32')} ${avatarStyle} bg-gradient-to-r from-purple-500 to-blue-500 flex-shrink-0`} 
                                             style={{ backgroundImage: featuredTestimonial.avatar ? `url(${featuredTestimonial.avatar})` : undefined, backgroundSize: 'cover' }}></div>
                                        <div className="flex-1">
                                            {showRatings === "yes" && (
                                                <div className="flex gap-1 mb-4">
                                                    {Array.from({ length: featuredTestimonial.rating || 5 }).map((_, i) => (
                                                        <span key={i} className="text-yellow-500 text-2xl">⭐</span>
                                                    ))}
                                                </div>
                                            )}
                                            <p className="text-2xl text-gray-700 mb-6 italic">"{featuredTestimonial.content}"</p>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-bold text-xl text-gray-900">{featuredTestimonial.name}</div>
                                                    <div className="text-purple-600 font-semibold">{featuredTestimonial.role}</div>
                                                    {showCompany === "yes" && featuredTestimonial.company && (
                                                        <div className="text-gray-500">{featuredTestimonial.company}</div>
                                                    )}
                                                </div>
                                                {showDate === "yes" && featuredTestimonial.date && (
                                                    <div className="text-gray-400 text-sm">{featuredTestimonial.date}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-8`}>
                            {(layout === "featured" ? regularTestimonials : testimonials)?.map((testimonial: any, idx: number) => (
                                <div key={idx} className={`${cardStyles[cardStyle as keyof typeof cardStyles]} transition-all duration-300 hover:-translate-y-1`}>
                                    {cardStyle === "quote" && (
                                        <div className="absolute top-4 left-4 text-6xl text-purple-300 opacity-50">"</div>
                                    )}
                                    <div className="relative z-10">
                                        {showRatings === "yes" && testimonial.rating && (
                                            <div className="flex gap-1 mb-4">
                                                {Array.from({ length: testimonial.rating }).map((_, i) => (
                                                    <span key={i} className="text-yellow-500">⭐</span>
                                                ))}
                                            </div>
                                        )}
                                        <p className="text-gray-700 mb-6 leading-relaxed">{testimonial.content}</p>
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                            <div className="flex items-center gap-4">
                                                <div className={`${avatarSize} ${avatarStyle} bg-gradient-to-r from-purple-500 to-blue-500 flex-shrink-0`} 
                                                     style={{ backgroundImage: testimonial.avatar ? `url(${testimonial.avatar})` : undefined, backgroundSize: 'cover' }}></div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                                                    <div className="text-purple-600 text-sm font-semibold">{testimonial.role}</div>
                                                    {showCompany === "yes" && testimonial.company && (
                                                        <div className="text-gray-500 text-sm">{testimonial.company}</div>
                                                    )}
                                                </div>
                                            </div>
                                            {showDate === "yes" && testimonial.date && (
                                                <div className="text-gray-400 text-xs">{testimonial.date}</div>
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
    }
};

export default TestimonialSection;