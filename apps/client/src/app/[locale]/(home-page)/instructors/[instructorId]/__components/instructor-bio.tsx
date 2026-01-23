import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card';
import { IInstructor } from '@/lib/types/user/user.interface';
import { User } from 'lucide-react';
import { Typography } from '@/components/atoms/typography';
import { useTranslations } from 'next-intl';

const InstructorBio: React.FC<{ instructor: IInstructor }> = ({ instructor }) => {
    const t = useTranslations('Instructors');
    return (
        <Card className='shadow-sm hover:shadow-md transition-shadow'>
            <CardHeader>
                <CardTitle className='text-2xl font-bold text-foreground flex items-center gap-2'>
                    <User className='w-6 h-6 text-primary' />
                    <Typography variant="h3" weight="bold">
                        {t('about')}
                    </Typography>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className='prose prose-sm max-w-none'>
                    <Typography
                        variant="p"
                        color="muted"
                        className='leading-relaxed whitespace-pre-line'
                    >
                        {instructor.profile?.bio || t('noBiography')}
                    </Typography>
                </div>
            </CardContent>
        </Card>
    );
};

export default InstructorBio;