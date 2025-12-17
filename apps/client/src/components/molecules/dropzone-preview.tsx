'use client';
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/atoms/dropzone';
import { useState } from 'react';
import { DropzoneOptions } from 'react-dropzone';
const DropzoneWithPreview = ({ className, files, setFiles, handleDrop, filePreview, setFilePreview, accept, maxFiles, label }: {
    handleDrop: (files: File[]) => void, filePreview: string | undefined, setFilePreview: React.Dispatch<React.SetStateAction<string | undefined>>,
    className?: string, files: File[] | undefined, setFiles: React.Dispatch<React.SetStateAction<File[] | undefined>>, label?: string
    accept: DropzoneOptions['accept'], maxFiles: DropzoneOptions['maxFiles']
}) => {
    // const [files, setFiles] = useState<File[] | undefined>();
    // const [filePreview, setFilePreview] = useState<string | undefined>();
    // const handleDrop = (files: File[]) => {
    //     console.log(files);
    //     setFiles(files);
    //     if (files.length > 0) {
    //         const reader = new FileReader();
    //         reader.onload = (e) => {
    //             if (typeof e.target?.result === 'string') {
    //                 setFilePreview(e.target?.result);
    //             }
    //         };
    //         reader.readAsDataURL(files[0]);
    //     }
    // };
    return (
        <Dropzone
            accept={accept ? accept : {
                'image/*': ['.png', '.jpg', '.jpeg'],
                'video/*': ['.mp4', '.avi', '.mov', '.wmv']
            }}
            onDrop={handleDrop}
            onError={console.error}
            src={files}
            className={className}
            maxFiles={maxFiles ? maxFiles : 1}
            
        >
            <DropzoneEmptyState />
            <DropzoneContent>
                {filePreview && (
                    <div className="h-[102px] w-full">
                        {files && files[0] && files[0].type.startsWith('video/') ? (
                            <video
                                className="absolute top-0 left-0 h-full w-full object-cover"
                                src={filePreview}
                                controls
                            />
                        ) : (
                            <img
                                alt="Preview"
                                className="absolute top-0 left-0 h-full w-full object-cover"
                                src={filePreview}
                            />
                        )}
                    </div>
                )}
            </DropzoneContent>
        </Dropzone>
    );
};
export default DropzoneWithPreview;
