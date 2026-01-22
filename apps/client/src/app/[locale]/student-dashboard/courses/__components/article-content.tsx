import { Button } from '@/components/atoms/button';
import { Card, CardContent } from '@/components/atoms/card';
import { Checkbox } from '@/components/atoms/checkbox';
import { usePathname } from '@/i18n/navigation';
import { toggleContentComplete } from '@/lib/actions/courses/toggleContentComplete.action';
import useGeneralStore from '@/lib/store/generalStore';
import { IContent } from '@/lib/types/course/content.interface';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';

const ArticleContent: React.FC<{
    content: IContent, isComplete: boolean,
    toggleComplete: (args: { completed: boolean, withToast: boolean, withRefresh: boolean }) => Promise<void>
}> = ({ toggleComplete, isComplete, content }) => {
    const t = useTranslations('StudentCourses.articleContent');

    const [completed, setCompleted] = useState(isComplete)

    return (
        <div className="max-w-4xl mx-auto">
            <Card className="mb-6">
                <CardContent className="p-8">
                    <div className="prose max-w-none">
                        <div className="text-lg leading-relaxed">
                            {content.body || content.summary || "This is a sample article content. In a real implementation, this would contain the full article text with proper formatting, images, and interactive elements. The content would be rich and engaging, providing valuable information to help students learn effectively."}
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="text-center gap-4 flex ">
                {/* <Button
                    onClick={
                        async () => await toggleComplete(!isComplete)
                    }
                    size="lg">
                   {!isComplete ? '✓ Mark as Completed' : "× Mark as Uncompleted"}
                </Button> */}
                <Checkbox
                    id="content-complete"
                    checked={completed}
                    onCheckedChange={async () => {
                        setCompleted(!completed)
                        await toggleComplete({ completed: true, withRefresh: true, withToast: true })

                    }
                    }
                    className='cursor-pointer'
                />
                <label
                    htmlFor="content-complete"
                    className="text-sm font-medium leading-none cursor-pointer"
                >
                    {completed ? t('completedUncheck') : t('markAsCompleted')}
                </label>
            </div>
        </div>
    );
};

export default ArticleContent;