"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/atoms/button"
import { Input } from "@/components/atoms/input"
import { useForm, SubmitHandler, Resolver } from 'react-hook-form'
import { Label } from "@/components/atoms/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select"
import { createCourseSchema, CreateCourseSchema } from '@/lib/schema/course.schema'
import DropzoneWithPreview from '@/components/molecules/dropzone-preview'
import { Currency } from '@/lib/data/currency.enum'
import { handleCreateCourse } from '@/lib/actions/courses/createCourse.action'
import { handleUpdateCourse } from '@/lib/actions/courses/updateCourse.action'
import useGeneralStore from '@/lib/store/generalStore'
import { toast } from 'react-toastify'
import { yupResolver } from '@hookform/resolvers/yup'
import { ICourse, ICourseWithModules } from '@/lib/types/course/course.interface'
import { getFileFullUrl } from '@/lib/utils/getFileFullUrl'
import Image from 'next/image'
import ModulesDataTable from './module-data-table'
import { ArrowRightIcon, Plus, UserCheck, X } from 'lucide-react'
import { ICategory } from '@/lib/types/category/ICategory'
import MultipleSelector, { Option } from '@/components/molecules/multi-select'
import { useUsersByOrganization } from '@/lib/hooks/user/use-user.hook'
import { extractErrorMessages } from "@/lib/utils/extractErrorMessages";
import { IUser } from "@/lib/types/user/user.interface"
import { Clock } from "lucide-react"

type CourseFormMode = 'create' | 'update';

interface CourseFormProps {
    mode: CourseFormMode;
    setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
    course?: ICourseWithModules;
    courseId?: string;
    flatCategories?: ICategory[];
    instructors: IUser[];
    students?: IUser[];
}

function CourseForm({ mode, setOpen, course, courseId, flatCategories, instructors = [], students = [] }: CourseFormProps) {
    const isUpdateMode = mode === 'update';
    const thumbnailUrl = isUpdateMode && course?.thumbnailKey ? getFileFullUrl(course.thumbnailKey) : undefined;
    const trailerUrl = isUpdateMode && (course as any)?.trailerKey ? getFileFullUrl((course as any).trailerKey) : undefined;

    const [learningObjectives, setLearningObjectives] = useState<string[]>(course?.learningObjectives || []);
    const [offlineSchedule, setOfflineSchedule] = useState<any[]>((course as any)?.attendanceSettings?.offlineSchedule || []);

    const [files, setFiles] = useState<File[] | undefined>();
    const [filePreview, setFilePreview] = useState<string | undefined>(
        isUpdateMode ? course?.thumbnailKey : undefined
    );
    const [trailerFiles, setTrailerFiles] = useState<File[] | undefined>();
    const [trailerPreview, setTrailerPreview] = useState<string | undefined>(
        isUpdateMode ? (course as any)?.trailerKey : undefined
    );
    const [selectedCategories, setSelectedCategories] = useState<Option[]>(
        course?.categories?.map(c => ({ value: c._id, label: c.name })) || []
    );
    const [selectedCoInstructors, setSelectedCoInstructors] = useState<Option[]>(
        course?.coInstructors?.map(instructor => ({
            value: instructor._id,
            label: `(${instructor.firstName} ${instructor.lastName}) ${instructor.email}`
        })) || []
    );

    const updateCourseCategories = useCallback((categoriesOptions: Option[]) => {
        setSelectedCategories(categoriesOptions);
        setValue("categoriesIds", categoriesOptions.map(cat => cat.value));
    }, []);

    const updateCoInstructors = useCallback((instructorsOptions: Option[]) => {
        setSelectedCoInstructors(instructorsOptions);
        setValue("coInstructorsIds" as any, instructorsOptions.map(inst => inst.value));
    }, []);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<CreateCourseSchema>({
        resolver: yupResolver(createCourseSchema) as unknown as Resolver<CreateCourseSchema>,
        mode: 'onSubmit',
        defaultValues: isUpdateMode && course ? {
            name: course.name || "",
            description: course.description || "",
            shortDescription: course.shortDescription || "",
            isPaid: course.isPaid || false,
            instructorId: course.instructorId as any,
            coInstructorsIds: course.coInstructorsIds as any || [],
            settings: {
                certificateEnabled: course.settings?.certificateEnabled || false,
                discussionEnabled: course.settings?.discussionEnabled || true,
                downloadEnabled: course.settings?.downloadEnabled || false,
                enrollmentLimit: course.settings?.enrollmentLimit || undefined
            },
            pricing: Object.fromEntries(
                Object.entries(course.pricing || {}).map(([key, value]) => [
                    key,
                    {
                        ...value,
                        priceUSD: undefined,
                    },
                ]),
            ) || {},
            categoriesIds: course.categoriesIds || [],
            attendanceSettings: course.attendanceSettings || {
                requireAttendance: false,
                offlineSchedule: []
            }
        } : {
            isPaid: false,
            coInstructorsIds: [] as any,
            settings: {
                certificateEnabled: false,
                discussionEnabled: true,
                downloadEnabled: false,
                enrollmentLimit: undefined
            },
            description: "",
            shortDescription: "",
            categoriesIds: []
        }
    });

    const isPaid = watch('isPaid');

    const onSubmit: SubmitHandler<CreateCourseSchema> = async (data) => {
        try {
            console.log({ data })
            useGeneralStore.setState({ generalIsLoading: true });
            const formData = new FormData();

            Object.entries(data).forEach(([key, value]) => {
                if (value instanceof File) {
                    return formData.append(key, value);
                }
                if (typeof value == 'object') {
                    return formData.append(key, JSON.stringify(value));
                }
                if (value !== undefined && value !== null) {
                    formData.append(key, value as any);
                }
            });

            if (isUpdateMode && courseId) {
                await handleUpdateCourse(courseId, formData, course?.thumbnailKey, (course as any)?.trailerKey);
                toast.success("Course Updated Successfully");
            } else {
                await handleCreateCourse(formData);
                toast.success("Course Created Successfully");
                setOpen?.(false);
            }
        } catch (error: any) {
            console.error(error);
            toast.error(typeof error?.message === 'string' ? error.message : "Something went wrong");
        } finally {
            useGeneralStore.setState({ generalIsLoading: false });
        }
    };

    const handleDrop = (files: File[]) => {
        setFiles(files);
        if (files.length > 0) {
            const file = files[0];
            setValue("thumbnail" as any, file, { shouldValidate: true });

            const reader = new FileReader();
            reader.onload = (e) => {
                if (typeof e.target?.result === 'string') {
                    setFilePreview(e.target?.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTrailerDrop = (files: File[]) => {
        setTrailerFiles(files);
        if (files.length > 0) {
            const file = files[0];
            setValue("trailer" as any, file, { shouldValidate: true });

            const reader = new FileReader();
            reader.onload = (e) => {
                if (typeof e.target?.result === 'string') {
                    setTrailerPreview(e.target?.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // Convert instructors to options format
    // const instructorOptions: Option[] = instructors.map(instructor => ({
    //     value: instructor._id,
    //     label: `${instructor.firstName} ${instructor.lastName} (${instructor.email})`
    // }));


    const updateObjective = useCallback((index: number, value: string) => {
        setLearningObjectives(prev => {
            const newObjectives = [...prev]; // clone
            newObjectives[index] = value;    // update immutably
            return newObjectives;
        });
    }, []);

    const removeObjective = useCallback((index: number) => {
        setLearningObjectives(prev => prev.filter((_, i) => i !== index))
    }, [setLearningObjectives])

    useEffect(() => {
        setValue("learningObjectives", learningObjectives)
    }, [learningObjectives])

    useEffect(() => {
        setValue("attendanceSettings.offlineSchedule" as any, offlineSchedule)
    }, [offlineSchedule])



    return (
        <div className='rounded-lg p-6 shadow-sm m-auto w-md md:w-3xl 2xl:w-7xl border-2 bg-zinc-100 dark:bg-zinc-900'>
            <h2 className="text-2xl font-bold mb-6">
                {isUpdateMode ? 'Update Course' : 'Create New Course'}
            </h2>

            <form onSubmit={handleSubmit(onSubmit, (err => extractErrorMessages(err).forEach(e => toast.error(e))))} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Basic Information</h3>

                    <div className="flex flex-col gap-2 w-full">
                        <Label className="text-sm lg:text-medium" htmlFor="name">Course Name *</Label>
                        <Input
                            id="name"
                            placeholder="Enter course name..."
                            className={cn(
                                "placeholder:text-sm lg:placeholder:text-medium text-sm lg:text-medium border-3",
                                errors.name && "border-red-500"
                            )}
                            {...register("name")}
                        />
                        {errors.name && (
                            <p className="text-left text-sm text-red-400">
                                {errors.name?.message}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                        <Label className="text-sm lg:text-medium" htmlFor="shortDescription">
                            Short Description
                        </Label>
                        <Input
                            id="shortDescription"
                            placeholder="Brief description of the course..."
                            className="placeholder:text-sm lg:placeholder:text-medium text-sm lg:text-medium border-3"
                            {...register("shortDescription")}
                        />
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                        <Label className="text-sm lg:text-medium" htmlFor="description">
                            Full Description
                        </Label>
                        <textarea
                            id="description"
                            placeholder="Detailed description of the course..."
                            className="border-3 flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...register("description")}
                        />
                    </div>

                    <div className='border-2 p-8 bg-blend-color rounded-md flex flex-col gap-5'>


                        <div className="flex items-center justify-between">
                            <label className="text-sm">Learning Objectives</label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setLearningObjectives(prev => [...prev, ""])}
                                className="flex items-center gap-1"
                            >
                                <Plus className="h-4 w-4" />
                                Add Objective
                            </Button>
                        </div>

                        <div className="space-y-2">
                            {learningObjectives.map((objective, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input
                                        value={objective}
                                        onChange={(e) => updateObjective(index, e.target.value)}

                                        placeholder={`Learning objective ${index + 1}`}
                                        className="flex-1"
                                    />
                                    {learningObjectives.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeObjective(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {errors.learningObjectives && (
                            <p className="text-left text-sm text-red-400">
                                {errors.learningObjectives.message}
                            </p>
                        )}
                    </div>

                    {/* Thumbnail Section */}
                    <div className='flex flex-col md:flex-row gap-6 border-3 p-6 rounded-md'>
                        <div className="flex flex-col gap-2">
                            <Label className="text-sm lg:text-medium" htmlFor="thumbnail">
                                Thumbnail Image
                            </Label>
                            {isUpdateMode && thumbnailUrl && (
                                <div className="mb-4">
                                    <p className="text-sm text-muted-foreground mb-2">Current Thumbnail:</p>
                                    <Image
                                        src={thumbnailUrl}
                                        alt="Course Thumbnail"
                                        width={150}
                                        height={150}
                                        className="rounded-md object-cover"
                                    />
                                </div>
                            )}
                        </div>

                        <DropzoneWithPreview
                            setFilePreview={setFilePreview}
                            filePreview={filePreview}
                            handleDrop={handleDrop}
                            files={files}
                            setFiles={setFiles}
                            className='size-50 md:h-60 md:w-80'
                            accept={{ "image/*": [] }}
                            maxFiles={1}
                        />

                        {errors.thumbnail && (
                            <p className="text-left text-sm text-red-400 whitespace-nowrap flex items-center">
                                {errors.thumbnail?.message}
                            </p>
                        )}
                    </div>

                    {/* Trailer Section */}
                    <div className='flex flex-col md:flex-row gap-6 border-3 p-6 rounded-md'>
                        <div className="flex flex-col gap-2">
                            <Label className="text-sm lg:text-medium" htmlFor="trailer">
                                Course Trailer Video (Optional)
                            </Label>
                            {isUpdateMode && trailerUrl && (
                                <div className="mb-4">
                                    <p className="text-sm text-muted-foreground mb-2">Current Trailer:</p>
                                    <video
                                        src={trailerUrl}
                                        controls
                                        className="rounded-md object-cover w-full max-w-md"
                                    />
                                </div>
                            )}
                        </div>

                        <DropzoneWithPreview
                            setFilePreview={setTrailerPreview}
                            filePreview={trailerPreview}
                            handleDrop={handleTrailerDrop}
                            files={trailerFiles}
                            setFiles={setTrailerFiles}
                            className='size-50 md:h-60 md:w-80'
                            accept={{ "video/*": [] }}
                            maxFiles={1}
                        />

                        {errors.trailer && (
                            <p className="text-left text-sm text-red-400 whitespace-nowrap flex items-center">
                                {(errors.trailer as any)?.message}
                            </p>
                        )}
                    </div>
                </div>

                {/* Instructor Assignment */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <UserCheck className="h-5 w-5" />
                        Instructor Assignment
                    </h3>

                    {/* Main Instructor */}
                    <div className="flex flex-col gap-2 w-full">
                        <Label className="text-sm lg:text-medium" htmlFor="instructorId">
                            Main Instructor *
                        </Label>
                        <Select
                            value={watch("instructorId" as any)}
                            onValueChange={(value) => setValue("instructorId", value)}
                        >
                            <SelectTrigger className="border-3 py-6">
                                <SelectValue placeholder="Select main instructor" />
                            </SelectTrigger>
                            <SelectContent>
                                {!!instructors && instructors.map((instructor) => (
                                    <SelectItem key={instructor._id} value={instructor._id}>
                                        <div className="flex flex-col">
                                            <span>{instructor.firstName} {instructor.lastName}</span>
                                            <span className="text-xs text-muted-foreground">{instructor.email}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.instructorId && (
                            <p className="text-left text-sm text-red-400">
                                {(errors.instructorId as any)?.message}
                            </p>
                        )}
                    </div>

                    {/* Co-Instructors */}
                    {instructors && <div className="flex flex-col gap-2 w-full">
                        <Label className="text-sm lg:text-medium" htmlFor="coInstructors">
                            Co-Instructors (Optional)
                        </Label>
                        <MultipleSelector
                            value={selectedCoInstructors}
                            onChange={updateCoInstructors}
                            defaultOptions={instructors?.map(instructor => ({ label: `(${instructor.firstName} ${instructor.lastName}) ${instructor.email}`, value: instructor._id }))}
                            placeholder="Select co-instructors..."
                            emptyIndicator={
                                <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                    No instructors found.
                                </p>
                            }
                        />
                        <p className="text-xs text-muted-foreground">
                            Co-instructors will have editing access to this course
                        </p>
                    </div>}
                </div>

                {/* Categories */}
                {flatCategories && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Categories</h3>
                        <MultipleSelector
                            value={selectedCategories}
                            onChange={updateCourseCategories}
                            defaultOptions={flatCategories.map(cat => ({
                                label: cat.name,
                                value: cat._id
                            }))}
                            placeholder="Select Course Categories..."
                            emptyIndicator={
                                <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                    No Categories were found.
                                </p>
                            }
                        />
                    </div>
                )}

                {/* Pricing */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Pricing</h3>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="isPaid"
                            checked={isPaid}
                            onChange={(e) => setValue('isPaid', e.target.checked)}
                            className="h-4 w-4 rounded text-primary focus:ring-primary border-3"
                        />
                        <Label htmlFor="isPaid">This is a paid course</Label>
                    </div>

                    {isPaid && (
                        <div className="space-y-4 p-4 border rounded-lg">
                            <h4 className="font-medium">Pricing Options</h4>
                            <p className="text-sm">At least one pricing option is required</p>

                            {/* Monthly Pricing */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="monthlyPrice">Monthly Price</Label>
                                    <Input
                                        id="monthlyPrice"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        onChange={(event) => { setValue("pricing.MONTHLY.originalPrice" as any, Number(event.target.value)) }}
                                        value={watch("pricing.MONTHLY.originalPrice" as any)}
                                        className='border-3'
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="monthlyCurrency">Currency</Label>
                                    <Select
                                        defaultValue={watch("pricing.MONTHLY.originalCurrency" as any)}
                                        onValueChange={(value) => setValue("pricing.MONTHLY.originalCurrency" as any, value)}>
                                        <SelectTrigger className="border-3">
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(Currency).map((currency) => (
                                                <SelectItem key={currency} value={currency}>
                                                    {currency}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Yearly Pricing */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="yearlyPrice">Yearly Price</Label>
                                    <Input
                                        id="yearlyPrice"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        onChange={(event) => { setValue("pricing.YEARLY.originalPrice" as any, Number(event.target.value)) }}
                                        value={watch("pricing.YEARLY.originalPrice" as any)}

                                        className='border-3'
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="yearlyCurrency">Currency</Label>
                                    <Select
                                        onValueChange={(value) => setValue("pricing.YEARLY.originalCurrency" as any, value as any)}
                                        defaultValue={watch("pricing.YEARLY.originalCurrency" as any)}
                                    >
                                        <SelectTrigger className="border-3">
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(Currency).map((currency) => (
                                                <SelectItem key={currency} value={currency}>
                                                    {currency}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* One-time Pricing */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="oneTimePrice">One-time Price</Label>
                                    <Input
                                        id="oneTimePrice"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        onChange={(event) => { setValue("pricing.ONE_TIME.originalPrice" as any, Number(event.target.value)) }}
                                        value={watch("pricing.ONE_TIME.originalPrice" as any)}

                                        className='border-3'
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="oneTimeCurrency">Currency</Label>
                                    <Select
                                        defaultValue={watch("pricing.ONE_TIME.originalCurrency" as any)}
                                        onValueChange={(value) => setValue("pricing.ONE_TIME.originalCurrency" as any, value as any)}>
                                        <SelectTrigger className="border-3">
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(Currency).map((currency) => (
                                                <SelectItem key={currency} value={currency}>
                                                    {currency}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}
                    {errors.pricing && (
                        <p className="text-left text-sm text-red-400">
                            {errors.pricing.message}
                        </p>
                    )}
                </div>

                {/* Course Settings */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Course Settings</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="certificateEnabled"
                                checked={watch('settings.certificateEnabled' as any) || false}
                                onChange={(e) => setValue('settings.certificateEnabled' as any, e.target.checked)}
                                className="h-4 w-4 rounded text-primary focus:ring-primary border-3"
                            />
                            <Label htmlFor="certificateEnabled">Enable Certificates</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="discussionEnabled"
                                checked={watch('settings.discussionEnabled' as any) || false}
                                onChange={(e) => setValue('settings.discussionEnabled' as any, e.target.checked)}
                                className="h-4 w-4 rounded text-primary focus:ring-primary border-3"
                            />
                            <Label htmlFor="discussionEnabled">Enable Discussions</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="downloadEnabled"
                                checked={watch('settings.downloadEnabled' as any) || false}
                                onChange={(e) => setValue('settings.downloadEnabled' as any, e.target.checked)}
                                className="h-4 w-4 rounded text-primary focus:ring-primary border-3"
                            />
                            <Label htmlFor="downloadEnabled">Enable Downloads</Label>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="enrollmentLimit">Enrollment Limit</Label>
                            <Input
                                id="enrollmentLimit"
                                type="number"
                                placeholder="No limit"
                                {...register("settings.enrollmentLimit" as any, { valueAsNumber: true })}
                                className="border-3"
                            />
                            {errors.settings?.enrollmentLimit && (
                                <p className="text-left text-sm text-red-400">
                                    {errors.settings?.enrollmentLimit.message}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Attendance Settings */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Attendance Settings
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="requireAttendance"
                                checked={watch('attendanceSettings.requireAttendance' as any) || false}
                                onChange={(e) => setValue('attendanceSettings.requireAttendance' as any, e.target.checked)}
                                className="h-4 w-4 rounded text-primary focus:ring-primary border-3"
                            />
                            <Label htmlFor="requireAttendance">Require Attendance Tracking</Label>
                        </div>

                        {watch('attendanceSettings.requireAttendance' as any) && (
                            <div className='border-2 p-8 bg-blend-color rounded-md flex flex-col gap-5'>
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Offline Schedule Time Slots</label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setOfflineSchedule(prev => [...prev, {
                                            startTime: '',
                                            endTime: '',
                                            dayOfWeek: '',
                                            instructorsIds: [],
                                            coInstructorsIds: [],
                                            studentsIds: []
                                        }])}
                                        className="flex items-center gap-1"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Time Slot
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {offlineSchedule.map((slot, index) => (
                                        <div key={index} className="border p-4 rounded-md space-y-3 bg-background">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">Time Slot {index + 1}</span>
                                                {offlineSchedule.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setOfflineSchedule(prev => prev.filter((_, i) => i !== index))}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="flex flex-col gap-2">
                                                    <Label htmlFor={`dayOfWeek-${index}`}>Day of Week *</Label>
                                                    <Select
                                                        value={slot.dayOfWeek}
                                                        onValueChange={(value) => {
                                                            const newSchedule = [...offlineSchedule];
                                                            newSchedule[index].dayOfWeek = value;
                                                            setOfflineSchedule(newSchedule);
                                                        }}
                                                    >
                                                        <SelectTrigger className="border-3">
                                                            <SelectValue placeholder="Select day" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                                                                <SelectItem key={day} value={day}>
                                                                    {day}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <Label htmlFor={`startTime-${index}`}>Start Time * (e.g., 02:00 pm)</Label>
                                                    <Input
                                                        id={`startTime-${index}`}
                                                        placeholder="02:00 pm"
                                                        value={slot.startTime}
                                                        onChange={(e) => {
                                                            const newSchedule = [...offlineSchedule];
                                                            newSchedule[index].startTime = e.target.value;
                                                            setOfflineSchedule(newSchedule);
                                                        }}
                                                        className="border-3"
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <Label htmlFor={`endTime-${index}`}>End Time * (e.g., 11:30 am)</Label>
                                                    <Input
                                                        id={`endTime-${index}`}
                                                        placeholder="11:30 am"
                                                        value={slot.endTime}
                                                        onChange={(e) => {
                                                            const newSchedule = [...offlineSchedule];
                                                            newSchedule[index].endTime = e.target.value;
                                                            setOfflineSchedule(newSchedule);
                                                        }}
                                                        className="border-3"
                                                    />
                                                </div>
                                            </div>

                                            {/* User Assignments for this time slot */}
                                            <div className="border-t pt-4 mt-4 space-y-3">
                                                <h4 className="text-sm font-medium text-muted-foreground">Assign Users to Time Slot</h4>

                                                {/* Instructors */}
                                                <div className="flex flex-col gap-2">
                                                    <Label htmlFor={`slot-instructors-${index}`}>Instructors (Optional)</Label>
                                                    <MultipleSelector
                                                        value={slot.instructorsIds?.map((id: string) => {
                                                            const instructor = instructors.find(i => i._id === id);
                                                            return instructor ? {
                                                                value: instructor._id,
                                                                label: `${instructor.firstName} ${instructor.lastName} (${instructor.email})`
                                                            } : null;
                                                        }).filter(Boolean) as Option[] || []}
                                                        onChange={(selected) => {
                                                            const newSchedule = [...offlineSchedule];
                                                            newSchedule[index].instructorsIds = selected.map(s => s.value);
                                                            setOfflineSchedule(newSchedule);
                                                        }}
                                                        defaultOptions={instructors.map(instructor => ({
                                                            label: `${instructor.firstName} ${instructor.lastName} (${instructor.email})`,
                                                            value: instructor._id
                                                        }))}
                                                        placeholder="Select instructors for this slot..."
                                                        emptyIndicator={
                                                            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                                                                No instructors found.
                                                            </p>
                                                        }
                                                    />
                                                </div>

                                                {/* Co-Instructors */}
                                                <div className="flex flex-col gap-2">
                                                    <Label htmlFor={`slot-coInstructors-${index}`}>Co-Instructors (Optional)</Label>
                                                    <MultipleSelector
                                                        value={slot.coInstructorsIds?.map((id: string) => {
                                                            const coInstructor = instructors.find(i => i._id === id);
                                                            return coInstructor ? {
                                                                value: coInstructor._id,
                                                                label: `${coInstructor.firstName} ${coInstructor.lastName} (${coInstructor.email})`
                                                            } : null;
                                                        }).filter(Boolean) as Option[] || []}
                                                        onChange={(selected) => {
                                                            const newSchedule = [...offlineSchedule];
                                                            newSchedule[index].coInstructorsIds = selected.map(s => s.value);
                                                            setOfflineSchedule(newSchedule);
                                                        }}
                                                        defaultOptions={instructors.map(instructor => ({
                                                            label: `${instructor.firstName} ${instructor.lastName} (${instructor.email})`,
                                                            value: instructor._id
                                                        }))}
                                                        placeholder="Select co-instructors for this slot..."
                                                        emptyIndicator={
                                                            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                                                                No co-instructors found.
                                                            </p>
                                                        }
                                                    />
                                                </div>

                                                {/* Students */}
                                                {students.length > 0 && (
                                                    <div className="flex flex-col gap-2">
                                                        <Label htmlFor={`slot-students-${index}`}>Students (Optional)</Label>
                                                        <MultipleSelector
                                                            value={slot.studentsIds?.map((id: string) => {
                                                                const student = students.find(s => s._id === id);
                                                                return student ? {
                                                                    value: student._id,
                                                                    label: `${student.firstName} ${student.lastName} (${student.email})`
                                                                } : null;
                                                            }).filter(Boolean) as Option[] || []}
                                                            onChange={(selected) => {
                                                                const newSchedule = [...offlineSchedule];
                                                                newSchedule[index].studentsIds = selected.map(s => s.value);
                                                                setOfflineSchedule(newSchedule);
                                                            }}
                                                            defaultOptions={students.map(student => ({
                                                                label: `${student.firstName} ${student.lastName} (${student.email})`,
                                                                value: student._id
                                                            }))}
                                                            placeholder="Select students for this slot..."
                                                            emptyIndicator={
                                                                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                                                                    No students found.
                                                                </p>
                                                            }
                                                        />
                                                        <p className="text-xs text-muted-foreground">
                                                            Assign specific students to this time slot (optional)
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <p className="text-xs text-muted-foreground">
                                                Time format: HH:MM am/pm (e.g., 02:00 pm, 11:30 am)
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {errors.attendanceSettings && (
                                    <p className="text-left text-sm text-red-400">
                                        {(errors.attendanceSettings as any)?.message}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center w-full">
                    <Button
                        type="submit"
                        effect={"expandIcon"}
                        icon={ArrowRightIcon}
                        iconPlacement={"right"}
                        className="px-8 w-full lg:w-1/2 mt-6"
                        disabled={useGeneralStore((state) => state.generalIsLoading)}
                    >
                        {useGeneralStore((state) => state.generalIsLoading)
                            ? (isUpdateMode ? "Updating..." : "Creating...")
                            : (isUpdateMode ? "Update Course" : "Create Course")
                        }
                    </Button>
                </div>
            </form>

            {/* Modules Table (only in update mode) */}
            {isUpdateMode && courseId && (
                <>
                    <hr className='my-9' />
                    <ModulesDataTable courseId={courseId} />
                </>
            )}
        </div>
    );
}

export default CourseForm;