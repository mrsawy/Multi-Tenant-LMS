"use client"

import React, { useState } from 'react'
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
import useGeneralStore from '@/lib/store/generalStore'
import { toast } from 'react-toastify'
import { yupResolver } from '@hookform/resolvers/yup'

// Simple form data type


function CreateCourseForm() {


    const [files, setFiles] = useState<File[] | undefined>();
    const [filePreview, setFilePreview] = useState<string | undefined>();

    const {
        register,
        handleSubmit,
        setError,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CreateCourseSchema>({
        resolver: yupResolver(createCourseSchema) as unknown as Resolver<CreateCourseSchema>,
        mode: 'onSubmit',
        defaultValues: {
            isPaid: false,
            settings: {
                certificateEnabled: false,
                discussionEnabled: true,
                downloadEnabled: false,
                enrollmentLimit: undefined
            },
            description: "",
            shortDescription: ""
        }
    });

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
            const response = await handleCreateCourse(formData)
            toast.success("Course Created")
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
            <h2 className="text-2xl font-bold mb-6">Create New Course</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 ">
                {/* Basic Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Basic Information</h3>

                    <div className="flex flex-col gap-2 w-full">
                        <Label className="text-sm lg:text-medium" htmlFor="name">Course Name *</Label>
                        <Input
                            placeholder="Enter course name..."
                            className="placeholder:text-sm lg:placeholder:text-medium text-sm lg:text-medium border-3"
                            {...register("name", { required: "Course name is required" })}
                        />
                        {errors.name && (
                            <p className="text-left text-sm text-red-400">
                                {errors.name?.message}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                        <Label className="text-sm lg:text-medium" htmlFor="shortDescription">Short Description</Label>
                        <Input
                            placeholder="Brief description of the course..."
                            className="placeholder:text-sm lg:placeholder:text-medium text-sm lg:text-medium border-3"
                            {...register("shortDescription")}
                        />
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                        <Label className="text-sm lg:text-medium" htmlFor="description">Full Description</Label>
                        <textarea
                            placeholder="Detailed description of the course..."
                            className="border-3 flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...register("description")}
                        />
                    </div>


                    <div className='flex flex-row gap-12 border-3 me-auto w-fit p-9 rounded-md'>
                        <div className="flex flex-row gap-9 w-full ">
                            <Label className="text-sm lg:text-medium" htmlFor="thumbnail">Thumbnail Image </Label>
                            {/* <Input
                            placeholder="https://example.com/thumbnail.jpg"
                            className="placeholder:text-sm lg:placeholder:text-medium text-sm lg:text-medium"
                            {...register("thumbnail")}
                            /> */}

                            <DropzoneWithPreview setFilePreview={setFilePreview} filePreview={filePreview} handleDrop={handleDrop} files={files} setFiles={setFiles} className='size-50 md:h-60 md:w-80' />
                        </div>
                        {errors.thumbnail && (
                            <p className="text-left text-sm text-red-400 whitespace-nowrap flex items-center">
                                {errors.thumbnail?.message}
                            </p>
                        )}
                    </div>
                </div>

                {/* Pricing */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Pricing</h3>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="isPaid"
                            checked={isPaid}
                            onChange={(e) => setValue('isPaid', e.target.checked)}
                            className="h-4 w-4 rounded  text-primary focus:ring-primary border-3"
                        />
                        <Label htmlFor="isPaid">This is a paid course</Label>
                    </div>

                    {isPaid && (
                        <div className="space-y-4 p-4 border rounded-lg ">
                            <h4 className="font-medium">Pricing Options</h4>
                            <p className="text-sm ">At least one pricing option is required</p>

                            {/* Monthly Pricing */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="monthlyPrice">Monthly Price</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...register("pricing.MONTHLY.price" as any, { valueAsNumber: true })}
                                        className='border-3'
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="monthlyCurrency">Currency</Label>
                                    <Select onValueChange={(value) => setValue("pricing.MONTHLY.currency" as any, value as any)}>
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
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...register("pricing.YEARLY.price" as any, { valueAsNumber: true })}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="yearlyCurrency">Currency</Label>
                                    <Select onValueChange={(value) => setValue("pricing.YEARLY.currency" as any, value as any)}>
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
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...register("pricing.ONE_TIME.price" as any, { valueAsNumber: true })}
                                        className='border-3'
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="oneTimeCurrency">Currency</Label>
                                    <Select onValueChange={(value) => setValue("pricing.ONE_TIME.currency" as any, value as any)}>
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
                                className="h-4 w-4 rounded  text-primary focus:ring-primary border-3"
                            />
                            <Label htmlFor="certificateEnabled">Enable Certificates</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="discussionEnabled"
                                checked={watch('settings.discussionEnabled' as any) || false}
                                onChange={(e) => setValue('settings.discussionEnabled' as any, e.target.checked)}
                                className="h-4 w-4 rounded  text-primary focus:ring-primary border-3"
                            />
                            <Label htmlFor="discussionEnabled">Enable Discussions</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="downloadEnabled"
                                checked={watch('settings.downloadEnabled' as any) || false}
                                onChange={(e) => setValue('settings.downloadEnabled' as any, e.target.checked)}
                                className="h-4 w-4 rounded  text-primary focus:ring-primary border-3"
                            />
                            <Label htmlFor="downloadEnabled">Enable Downloads</Label>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="enrollmentLimit">Enrollment Limit</Label>
                            <Input
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

                {/* Submit Button */}
                <div className="flex justify-end pt-6">
                    <Button type="submit" className="px-8">
                        Create Course
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default CreateCourseForm