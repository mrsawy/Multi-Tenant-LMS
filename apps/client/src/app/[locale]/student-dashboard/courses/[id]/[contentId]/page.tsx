import { IContent } from '@/lib/types/course/content.interface';
import { createAuthorizedNatsRequest } from '@/lib/utils/createNatsRequest';
import React from 'react';
import ContentView from '../../__components/content-view';
import { CourseContentType } from '@/lib/types/course/enum/CourseContentType.enum';
import { VideoType } from '@/lib/types/course/enum/VideoType.enum';
import { IEnrollment } from '@/lib/types/enrollment/enrollment.interface';
import { ICourseOverview } from '@/lib/types/course/course.interface';
import { getAuthUser } from '@/lib/actions/user/user.action';

export const dynamic = "force-dynamic";


const SingleContentPage: React.FC<{ params: Promise<{ id: string, contentId: string, locale: string }> }> = async ({ params }) => {
    const { contentId, id } = (await params);

    const content = await createAuthorizedNatsRequest<IContent>("course.getContent", { contentId })
    const enrollment = await createAuthorizedNatsRequest<IEnrollment>("enrollment.getSingleEnrollment", { enrollmentId: id })
    const progress = enrollment.progress

    // Fetch course with modules and contents for sidebar
    const result = await createAuthorizedNatsRequest("enrollment.getDetailedEnrolledCourse", { enrollmentId: id }) as { data: { course: ICourseOverview, enrollment: IEnrollment } }
    const course = result.data.course;
    const user = await getAuthUser();

    let fileKey;
    if (content.type == CourseContentType.VIDEO && content.videoType == VideoType.UPLOAD) {
        fileKey = await createAuthorizedNatsRequest("file.getFileUrl", { fileKey: content.fileKey })
    }

    return (
        <div>
            <ContentView
                content={{ ...content, fileKey }}
                progress={progress}
                course={course}
                enrollment={enrollment}
                user={user}
            />
        </div>
    );
};

export default SingleContentPage;