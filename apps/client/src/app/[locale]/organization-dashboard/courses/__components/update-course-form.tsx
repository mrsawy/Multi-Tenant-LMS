"use client"

import React, { useState, useEffect } from 'react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/atoms/button"
import { Input } from "@/components/atoms/input"
import { useForm, SubmitHandler, Resolver } from 'react-hook-form'
import { Label } from "@/components/atoms/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select"
import { createCourseSchema, CreateCourseSchema } from '@/lib/schema/course.schema'
import DropzoneWithPreview from '@/components/molecules/dropzone-preview'
import { Currency } from '@/lib/data/currency.enum'
import { handleUpdateCourse } from '@/lib/actions/courses/updateCourse.action'
import useGeneralStore from '@/lib/store/generalStore'
import { toast } from 'react-toastify'
import { yupResolver } from '@hookform/resolvers/yup'
import { ICourse, ICourseWithModules } from '@/lib/types/course/course.interface'
import { BillingCycle } from '@/lib/types/course/enum/BillingCycle.enum'
import { getFileFullUrl } from '@/lib/utils/getFileFullUrl'
import Image from 'next/image'
import ModulesDataTable from './module-data-table'

interface UpdateCourseFormProps {
    course: ICourseWithModules;
    courseId: string;
}

function UpdateCourseForm({ course, courseId }: UpdateCourseFormProps) {
    const thumbnailUrl = getFileFullUrl(course.thumbnailKey || "");
    console.log({ thumbnailUrl })
    const [files, setFiles] = useState<File[] | undefined>();
    const [filePreview, setFilePreview] = useState<string | undefined>(course.thumbnailKey);

    const {
        register,
        handleSubmit,
        setError,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<CreateCourseSchema>({
        resolver: yupResolver(createCourseSchema) as unknown as Resolver<CreateCourseSchema>,
        mode: 'onSubmit',
        defaultValues: {
            name: course.name || "",
            description: course.description || "",
            shortDescription: course.shortDescription || "",
            isPaid: course.isPaid || false,
            settings: {
                certificateEnabled: course.settings?.certificateEnabled || false,
                discussionEnabled: course.settings?.discussionEnabled || true,
                downloadEnabled: course.settings?.downloadEnabled || false,
                enrollmentLimit: course.settings?.enrollmentLimit || undefined
            },
            pricing: course.pricing || {}
        }
    });

    // Reset form when course data changes
    useEffect(() => {
        reset({
            name: course.name || "",
            description: course.description || "",
            shortDescription: course.shortDescription || "",
            isPaid: course.isPaid || false,
            settings: {
                certificateEnabled: course.settings?.certificateEnabled || false,
                discussionEnabled: course.settings?.discussionEnabled || true,
                downloadEnabled: course.settings?.downloadEnabled || false,
                enrollmentLimit: course.settings?.enrollmentLimit || undefined
            },
            pricing: course.pricing || {}
        });
        setFilePreview(course.thumbnailKey);
    }, [course, reset]);

    const isPaid = watch('isPaid');

    const onSubmit: SubmitHandler<CreateCourseSchema> = async (data) => {
        try {
            useGeneralStore.setState({ generalIsLoading: true })
            const formData = new FormData()
            Object.entries(data).forEach(([key, value]) => {
                if (value instanceof File) {
                    return formData.append(key, value);
                }
                if (typeof value == 'object') {
                    return formData.append(key, JSON.stringify(value));
                }

                !!value && formData.append(key, value as any)
            })
            const response = await handleUpdateCourse(courseId, formData)
            toast.success("Course Updated Successfully")
            // console.log('Course data:', { data, response }, Object.fromEntries(formData.entries()));
        } catch (error: any) {
            console.error(error)
            toast.error(typeof error?.message ? error.message : "something went wrong")
        } finally {
            useGeneralStore.setState({ generalIsLoading: false })
        }
    }

    const handleDrop = (files: File[]) => {
        console.log(files);
        setFiles(files);
        if (files.length > 0) {
            const file = files[0]
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

    return (
        <div className='rounded-lg p-6  shadow-sm  m-auto w-md md:w-3xl 2xl:w-7xl border-2 bg-zinc-100 dark:bg-zinc-900'>
            <h2 className="text-2xl font-bold mb-6">Update Course</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 ">
                {/* Basic Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Basic Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Course Name *</Label>
                            <Input
                                id="name"
                                {...register("name")}
                                placeholder="Enter course name"
                                className={cn(errors.name && "border-red-500")}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="shortDescription">Short Description</Label>
                            <Input
                                id="shortDescription"
                                {...register("shortDescription")}
                                placeholder="Brief description"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <textarea
                            id="description"
                            {...register("description")}
                            placeholder="Detailed course description"
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="thumbnail">Course Thumbnail</Label>
                        <Image src={thumbnailUrl} alt="Course Thumbnail" width={100} height={100} />
                        <DropzoneWithPreview
                            handleDrop={handleDrop}
                            files={files}
                            setFiles={setFiles}
                            filePreview={filePreview}
                            setFilePreview={setFilePreview}
                            accept={{
                                'image/*': ['.png', '.jpg', '.jpeg', '.gif']
                            }}
                            maxFiles={1}
                        />
                    </div>
                </div>

                {/* Pricing Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Pricing</h3>

                    <div className="space-y-2">
                        <Label htmlFor="isPaid">Course Type</Label>
                        <Select
                            value={isPaid ? "paid" : "free"}
                            onValueChange={(value) => setValue("isPaid", value === "paid")}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select course type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="free">Free</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {isPaid && (
                        <div className="space-y-4 p-4 border rounded-lg bg-white dark:bg-gray-800">
                            <h4 className="font-medium">Pricing Details</h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="monthlyPrice">Monthly Price</Label>
                                    <Input
                                        id="monthlyPrice"
                                        type="number"
                                        placeholder="0.00"
                                        {...register("pricing.MONTHLY.originalPrice" as any)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="monthlyCurrency">Currency</Label>
                                    <Select
                                        onValueChange={(value) => setValue("pricing.MONTHLY.originalCurrency" as any, value as Currency)}
                                    >
                                        <SelectTrigger>
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="yearlyPrice">Yearly Price</Label>
                                    <Input
                                        id="yearlyPrice"
                                        type="number"
                                        placeholder="0.00"
                                        {...register("pricing.YEARLY.originalPrice" as any)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="yearlyCurrency">Currency</Label>
                                    <Select
                                        onValueChange={(value) => setValue("pricing.YEARLY.originalCurrency" as any, value as Currency)}
                                    >
                                        <SelectTrigger>
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
                </div>

                {/* Course Settings */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Course Settings</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="enrollmentLimit">Enrollment Limit</Label>
                            <Input
                                id="enrollmentLimit"
                                type="number"
                                placeholder="Unlimited"
                                {...register("settings.enrollmentLimit")}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Features</Label>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="certificateEnabled"
                                        {...register("settings.certificateEnabled")}
                                        className="rounded"
                                    />
                                    <Label htmlFor="certificateEnabled">Enable Certificates</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="discussionEnabled"
                                        {...register("settings.discussionEnabled")}
                                        className="rounded"
                                    />
                                    <Label htmlFor="discussionEnabled">Enable Discussions</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="downloadEnabled"
                                        {...register("settings.downloadEnabled")}
                                        className="rounded"
                                    />
                                    <Label htmlFor="downloadEnabled">Enable Downloads</Label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center space-x-4">
                    <Button type="button" variant="outline">
                        Cancel
                    </Button>
                    <Button type="submit" disabled={useGeneralStore((state) => state.generalIsLoading)}>
                        {useGeneralStore((state) => state.generalIsLoading) ? "Updating..." : "Update Course"}
                    </Button>
                </div>
            </form>

            <hr className='my-9' />

            <ModulesDataTable courseId={courseId} />

        </div>
    )
}

export default UpdateCourseForm
