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
    arrayField,
    imageField
} from "./utils";

const BlogSection = () => {
    return {
        fields: {
            ...styleFields,
            title: textField(true),
            subtitle: textareaField(true),
            backgroundColor: colorField(),
            titleColor: colorField(),
            viewAllText: textField(true),
            viewAllLink: linkField(),
            layout: selectField([
                { label: "Grid", value: "grid" },
                { label: "Featured + Grid", value: "featured" },
                { label: "Magazine", value: "magazine" },
                { label: "List", value: "list" }
            ]),
            columns: selectField([
                { label: "2 Columns", value: "2" },
                { label: "3 Columns", value: "3" },
                { label: "4 Columns", value: "4" }
            ]),
            cardStyle: selectField([
                { label: "Modern", value: "modern" },
                { label: "Classic", value: "classic" },
                { label: "Minimal", value: "minimal" },
                { label: "Overlay", value: "overlay" }
            ]),
            showAuthor: radioField([
                { label: "Yes", value: "yes" }, 
                { label: "No", value: "no" }
            ]),
            showDate: radioField([
                { label: "Yes", value: "yes" }, 
                { label: "No", value: "no" }
            ]),
            showReadTime: radioField([
                { label: "Yes", value: "yes" }, 
                { label: "No", value: "no" }
            ]),
            showCategory: radioField([
                { label: "Yes", value: "yes" }, 
                { label: "No", value: "no" }
            ]),
            articles: arrayField({
                title: textField(true),
                excerpt: textareaField(true),
                image: imageField,
                author: textField(true),
                authorAvatar: imageField,
                date: textField(true),
                readTime: textField(true),
                category: textField(true),
                link: linkField(),
                featured: radioField([
                    { label: "Yes", value: "yes" }, 
                    { label: "No", value: "no" }
                ])
            })
        },
        defaultProps: {
            ...defaultStyleProps,
            title: "Latest from Our Blog",
            subtitle: "Insights, tutorials, and industry news to help you succeed",
            backgroundColor: "#f9fafb",
            titleColor: "#111827",
            viewAllText: "View All Articles",
            viewAllLink: "#",
            layout: "featured",
            columns: "3",
            cardStyle: "modern",
            showAuthor: "yes",
            showDate: "yes",
            showReadTime: "yes",
            showCategory: "yes",
            articles: [
                {
                    title: "10 Tips for Effective Online Learning",
                    excerpt: "Discover proven strategies to maximize your online learning experience and achieve your educational goals faster.",
                    image: "",
                    author: "Sarah Johnson",
                    authorAvatar: "",
                    date: "Jan 15, 2025",
                    readTime: "5 min read",
                    category: "Learning Tips",
                    link: "#",
                    featured: "yes"
                },
                {
                    title: "The Future of EdTech in 2025",
                    excerpt: "Explore the latest trends shaping the educational technology landscape and what they mean for learners.",
                    image: "",
                    author: "Mike Chen",
                    authorAvatar: "",
                    date: "Jan 12, 2025",
                    readTime: "8 min read",
                    category: "Industry Trends",
                    link: "#",
                    featured: "no"
                },
                {
                    title: "Mastering Time Management While Learning",
                    excerpt: "Practical techniques to balance your learning journey with work and personal life commitments.",
                    image: "",
                    author: "Emily Davis",
                    authorAvatar: "",
                    date: "Jan 10, 2025",
                    readTime: "6 min read",
                    category: "Productivity",
                    link: "#",
                    featured: "no"
                },
                {
                    title: "Building a Career in Data Science",
                    excerpt: "A comprehensive guide to breaking into the data science field, from skills to job search strategies.",
                    image: "",
                    author: "David Park",
                    authorAvatar: "",
                    date: "Jan 8, 2025",
                    readTime: "10 min read",
                    category: "Career Advice",
                    link: "#",
                    featured: "no"
                }
            ]
        },
        render: ({ title, subtitle, backgroundColor, titleColor, viewAllText, viewAllLink, layout, columns, cardStyle, showAuthor, showDate, showReadTime, showCategory, articles }: any) => {
            const cardStyles = {
                modern: "bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl",
                classic: "bg-white rounded-lg border-2 border-gray-200 overflow-hidden",
                minimal: "bg-white rounded-xl border-l-4 border-purple-600 overflow-hidden",
                overlay: "relative rounded-2xl overflow-hidden"
            };

            const featuredArticle = articles?.find((a: any) => a.featured === "yes");
            const regularArticles = articles?.filter((a: any) => a.featured !== "yes");

            const renderArticleCard = (article: any, idx: number, isFeatured = false) => {
                if (cardStyle === "overlay") {
                    return (
                        <a key={idx} href={article.link || "#"} className={`${(cardStyles as any)[cardStyle]} group cursor-pointer transition-all duration-300 hover:-translate-y-1 ${isFeatured ? "h-[500px]" : "h-[400px]"}`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-600"
                                style={{ backgroundImage: article.image ? `url(${article.image})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                                {showCategory === "yes" && article.category && (
                                    <span className="bg-purple-600 px-3 py-1 rounded-full text-sm font-semibold inline-block w-fit mb-4">
                                        {article.category}
                                    </span>
                                )}
                                <h3 className={`font-bold mb-3 ${isFeatured ? "text-4xl" : "text-2xl"}`}>{article.title}</h3>
                                <p className="mb-4 opacity-90 line-clamp-2">{article.excerpt}</p>
                                <div className="flex items-center justify-between text-sm opacity-90">
                                    {showAuthor === "yes" && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-white/20"
                                                style={{ backgroundImage: article.authorAvatar ? `url(${article.authorAvatar})` : undefined, backgroundSize: 'cover' }}>
                                            </div>
                                            <span>{article.author}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3">
                                        {showDate === "yes" && <span>{article.date}</span>}
                                        {showReadTime === "yes" && <span>{article.readTime}</span>}
                                    </div>
                                </div>
                            </div>
                        </a>
                    );
                }

                return (
                    <a key={idx} href={article.link || "#"} className={`${cardStyles[cardStyle as keyof typeof cardStyles]} transition-all duration-300 hover:-translate-y-1 group cursor-pointer`}>
                        <div className={`bg-gradient-to-br from-purple-500 to-blue-600 ${isFeatured ? "h-80" : "h-48"}`}
                            style={{ backgroundImage: article.image ? `url(${article.image})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                            {showCategory === "yes" && article.category && (
                                <div className="p-4">
                                    <span className="bg-white text-purple-600 px-3 py-1 rounded-full text-sm font-bold">
                                        {article.category}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="p-6">
                            <h3 className={`font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors ${isFeatured ? "text-3xl" : "text-xl"}`}>
                                {article.title}
                            </h3>
                            <p className="text-gray-600 mb-4 line-clamp-2">{article.excerpt}</p>
                            <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                                {showAuthor === "yes" && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500"
                                            style={{ backgroundImage: article.authorAvatar ? `url(${article.authorAvatar})` : undefined, backgroundSize: 'cover' }}>
                                        </div>
                                        <span className="font-semibold text-gray-700">{article.author}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    {showDate === "yes" && <span>{article.date}</span>}
                                    {showReadTime === "yes" && <span>• {article.readTime}</span>}
                                </div>
                            </div>
                        </div>
                    </a>
                );
            };

            return (
                <div className="py-20 px-6" style={{ backgroundColor }}>
                    <div className="max-w-7xl mx-auto">
                        <div className="flex justify-between items-end mb-12">
                            <div>
                                <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: titleColor }}>{title}</h2>
                                <p className="text-xl text-gray-600 max-w-3xl">{subtitle}</p>
                            </div>
                            {viewAllText && (
                                <a href={viewAllLink} className="text-purple-600 font-semibold hover:text-purple-700 flex items-center gap-2">
                                    {viewAllText} <span>→</span>
                                </a>
                            )}
                        </div>

                        {layout === "featured" && featuredArticle && (
                            <div className="mb-12">
                                {renderArticleCard(featuredArticle, 0, true)}
                            </div>
                        )}

                        {layout === "magazine" ? (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2">
                                    {articles?.slice(0, 1).map((article: any, idx: number) => renderArticleCard(article, idx, true))}
                                </div>
                                <div className="space-y-8">
                                    {articles?.slice(1, 3).map((article: any, idx: number) => renderArticleCard(article, idx + 1))}
                                </div>
                            </div>
                        ) : layout === "list" ? (
                            <div className="space-y-6">
                                {articles?.map((article: any, idx: number) => (
                                    <a key={idx} href={article.link || "#"} className="flex flex-col md:flex-row gap-6 bg-white p-6 rounded-xl hover:shadow-xl transition-all group">
                                        <div className="w-full md:w-64 h-48 flex-shrink-0 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600"
                                            style={{ backgroundImage: article.image ? `url(${article.image})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                                            {showCategory === "yes" && article.category && (
                                                <div className="p-4">
                                                    <span className="bg-white text-purple-600 px-3 py-1 rounded-full text-sm font-bold">
                                                        {article.category}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                                                {article.title}
                                            </h3>
                                            <p className="text-gray-600 mb-4">{article.excerpt}</p>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                {showAuthor === "yes" && (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500"
                                                            style={{ backgroundImage: article.authorAvatar ? `url(${article.authorAvatar})` : undefined, backgroundSize: 'cover' }}>
                                                        </div>
                                                        <span className="font-semibold text-gray-700">{article.author}</span>
                                                    </div>
                                                )}
                                                {showDate === "yes" && <span>• {article.date}</span>}
                                                {showReadTime === "yes" && <span>• {article.readTime}</span>}
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-8`}>
                                {(layout === "featured" ? regularArticles : articles)?.map((article: any, idx: number) =>
                                    renderArticleCard(article, idx)
                                )}
                            </div>
                        )}
                    </div>
                </div>
            );
        }
    }
};

export default BlogSection;