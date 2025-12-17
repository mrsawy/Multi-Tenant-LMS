"use client";

import { useState } from "react";
import { useGallery, GalleryItem } from "@/lib/hooks/gallery/useGallery";
import { IconPhoto, IconX } from "@tabler/icons-react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";

interface GalleryPickerProps {
    value?: string;
    onChange: (value: string) => void;
}

export const GalleryPicker = ({ value, onChange }: GalleryPickerProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="w-full">
            {value && (
                <div className="relative mb-2 aspect-video w-full rounded-md overflow-hidden bg-gray-100 border">
                    <Image src={value} alt="Selected" fill className="object-cover" />
                    <button
                        className="absolute top-2 right-2 bg-white/80 p-1 rounded-full hover:bg-white text-gray-700"
                        onClick={() => onChange("")}
                    >
                        <IconX size={16} />
                    </button>
                </div>
            )}
            
            <button
                className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:text-purple-500 transition-colors flex items-center justify-center gap-2 text-gray-500"
                onClick={() => setIsOpen(true)}
                type="button" 
            >
                <IconPhoto size={20} />
                {value ? "Change Image" : "Select from Gallery"}
            </button>

            {isOpen && <GalleryModal onClose={() => setIsOpen(false)} onSelect={(url) => {
                onChange(url);
                setIsOpen(false);
            }} />}
        </div>
    );
};

const GalleryModal = ({ onClose, onSelect }: { onClose: () => void; onSelect: (url: string) => void }) => {
    const [progress, setProgress] = useState(0);

    const onProgress = (progressEvent: any) => {
        setProgress(progressEvent.percentage);
    };
    
    const { items, loading, uploading, uploadFile } = useGallery({onProgress});
    const [dragActive, setDragActive] = useState(false);

    const onDrop = async (acceptedFiles: File[]) => {
        if (acceptedFiles?.length > 0) {
           const file = acceptedFiles[0];
           if(file) {
             const result = await uploadFile(file);
             if(result && result.url) {
                // Determine if we should auto-select. Maybe not, let user see it.
             }
           }
        }
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: { "image/*": [] },
        maxSize: 5 * 1024 * 1024,
        maxFiles: 1,
        multiple: false
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="font-bold text-lg">Media Gallery</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                        <IconX size={20} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Upload Area */}
                    <div {...getRootProps()} className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${uploading ? 'bg-gray-50 opacity-50' : 'hover:border-purple-500 hover:bg-purple-50'}`}>
                        <input {...getInputProps()} />
                        {uploading ? (



          <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center backdrop-blur-sm p-8">
            <div className="w-full max-w-md space-y-4">
              <div className="flex items-center justify-between text-sm font-medium text-primary">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>


) : (
                            <div className="space-y-2">
                                <IconPhoto className="w-10 h-10 mx-auto text-gray-400" />
                                <p className="text-sm font-medium text-gray-700">Click or drag image to upload</p>
                                <p className="text-xs text-gray-500">Max 5MB</p>
                            </div>
                        )}
                    </div>

                    {/* Grid */}
                    <div className="space-y-2">
                         <h4 className="font-medium text-sm text-gray-500">All Images</h4>
                         {loading ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
                                ))}
                            </div>
                         ) : (
                             <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                {items.map((item) => (
                                    <div 
                                        key={item._id} 
                                        className="relative aspect-square rounded-lg overflow-hidden border cursor-pointer hover:ring-2 hover:ring-purple-500 group"
                                        onClick={() => onSelect(item.url)}
                                    >
                                        <Image src={item.url} alt={item.title || "Image"} fill className="object-cover" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                            <span className="opacity-0 group-hover:opacity-100 bg-white/90 px-2 py-1 rounded text-xs font-semibold shadow-sm transform translate-y-2 group-hover:translate-y-0 transition-all">Select</span>
                                        </div>
                                    </div>
                                ))}
                             </div>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
};
