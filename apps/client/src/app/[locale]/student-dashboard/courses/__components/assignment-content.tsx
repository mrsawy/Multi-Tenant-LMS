import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card';
import { Textarea } from '@/components/atoms/textarea';
import { IContent } from '@/lib/types/course/content.interface';
import React from 'react';

const AssignmentContent: React.FC<{ content: IContent }> = ({ content }) => {
    return (
        <div className="max-w-4xl mx-auto">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Assignment Instructions</CardTitle>
                    <div className="flex gap-2">
                        {content.maxPoints && (
                            <Badge variant="outline">Max Points: {content.maxPoints}</Badge>
                        )}
                        {content.dueDate && (
                            <Badge variant="outline">
                                Due: {new Date(content.dueDate).toLocaleDateString()}
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-lg leading-relaxed">
                        {content.instructions || "Complete this assignment by following the given requirements and submit your work below. Make sure to address all the key points and provide detailed explanations where necessary."}
                    </p>
                </CardContent>
            </Card>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Your Submission</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        placeholder="Enter your assignment submission here..."
                        // value={assignmentText}
                        // onChange={(e) => setAssignmentText(e.target.value)}
                        className="min-h-48 text-base"
                    />
                </CardContent>
            </Card>

            <div className="text-center">
                <Button
                    // onClick={handleAssignmentSubmit}
                    // disabled={!assignmentText.trim()}
                    size="lg"
                >
                    Submit Assignment
                </Button>
            </div>
        </div>
    );
};

export default AssignmentContent;