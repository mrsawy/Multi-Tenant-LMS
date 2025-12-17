import { IContent } from '@/lib/types/course/content.interface';
import { createAuthorizedNatsRequest } from '@/lib/utils/createNatsRequest';
import React from 'react';
import ContentView from '../../__components/content-view';
import { CourseContentType } from '@/lib/types/course/enum/CourseContentType.enum';
import { VideoType } from '@/lib/types/course/enum/VideoType.enum';
import { IEnrollment } from '@/lib/types/enrollment/enrollment.interface';

export const dynamic = "force-dynamic";


const SingleContentPage: React.FC<{ params: Promise<{ id: string, contentId: string, locale: string }> }> = async ({ params }) => {
    const { contentId, id } = (await params);

    const content = await createAuthorizedNatsRequest<IContent>("course.getContent", { contentId })
    const enrollment = await createAuthorizedNatsRequest<IEnrollment>("enrollment.getSingleEnrollment", { enrollmentId: id })
    const progress = enrollment.progress

    let fileKey;
    if (content.type == CourseContentType.VIDEO && content.videoType == VideoType.UPLOAD) {
        fileKey = await createAuthorizedNatsRequest("file.getFileUrl", { fileKey: content.fileKey })
    }

    return (
        <div>
            <ContentView content={{ ...content, fileKey }} progress={progress} />
        </div>
    );
};

export default SingleContentPage;