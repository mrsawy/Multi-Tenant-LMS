import {
    styleFields,
    defaultStyleProps,
    getStyleProps,
    imageField,
    selectField,
    textField,
    colorField
} from "./utils";

export const ImageSection = () => {
    return {
        fields: {
            ...styleFields,
            image: imageField,
            alt: textField(true), // contentEditable for alt text might be overkill, but consistent
            aspectRatio: selectField([
                { label: "Auto", value: "auto" },
                { label: "16:9", value: "video" },
                { label: "4:3", value: "standard" },
                { label: "1:1", value: "square" },
                { label: "21:9", value: "ultrawide" }
            ]),
            objectFit: selectField([
                { label: "Cover", value: "cover" },
                { label: "Contain", value: "contain" },
                { label: "Fill", value: "fill" }
            ]),
            height: selectField([
                { label: "Auto", value: "auto" },
                { label: "Small (200px)", value: "h-48" },
                { label: "Medium (400px)", value: "h-96" },
                { label: "Large (600px)", value: "h-[600px]" },
                { label: "Full Screen", value: "h-screen" }
            ]),
            caption: textField(true),
            borderRadius: selectField([
                { label: "None", value: "rounded-none" },
                { label: "Small", value: "rounded-sm" },
                { label: "Medium", value: "rounded-md" },
                { label: "Large", value: "rounded-lg" },
                { label: "Full", value: "rounded-full" }
            ]),
            overlayOpacity: selectField([
                { label: "None", value: "0" },
                { label: "Low", value: "0.2" },
                { label: "Medium", value: "0.5" },
                { label: "High", value: "0.8" }
            ]),
            overlayColor: colorField()
        },
        defaultProps: {
            ...defaultStyleProps,
            image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1950&q=80",
            alt: "Image description",
            aspectRatio: "auto",
            objectFit: "cover",
            height: "auto",
            caption: "",
            borderRadius: "rounded-lg",
            overlayOpacity: "0",
            overlayColor: "#000000"
        },
        render: ({ image, alt, aspectRatio, objectFit, height, caption, borderRadius, overlayOpacity, overlayColor, ...props }: any) => {
            const styleProps = getStyleProps(props);
            
            const aspectClass = {
                "auto": "",
                "video": "aspect-video",
                "standard": "aspect-[4/3]",
                "square": "aspect-square",
                "ultrawide": "aspect-[21/9]"
            }[aspectRatio as string] || "";

            return (
                <div style={styleProps} className="w-full">
                    <div className={`relative w-full overflow-hidden ${borderRadius} ${height !== 'auto' ? height : ''} ${aspectClass}`}>
                        {image ? (
                            <img 
                                src={image} 
                                alt={alt} 
                                className={`w-full h-full object-${objectFit} ${height === 'auto' && aspectRatio === 'auto' ? 'h-auto' : 'h-full'}`}
                            />
                        ) : (
                            <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-400">
                                Select an image
                            </div>
                        )}
                        
                        {/* Overlay */}
                        {parseFloat(overlayOpacity) > 0 && (
                            <div 
                                className="absolute inset-0 pointer-events-none"
                                style={{ backgroundColor: overlayColor, opacity: overlayOpacity }}
                            />
                        )}
                    </div>
                    {caption && (
                        <p className="mt-2 text-center text-gray-500 text-sm">{caption}</p>
                    )}
                </div>
            );
        }
    };
};
