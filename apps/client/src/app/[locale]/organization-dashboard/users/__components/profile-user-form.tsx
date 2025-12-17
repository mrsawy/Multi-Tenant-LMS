import { Button } from '@/components/atoms/button';
import { Calendar } from '@/components/atoms/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/atoms/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/select';
import { Textarea } from '@/components/atoms/textarea';
import DropzoneWithPreview from '@/components/molecules/dropzone-preview';
import { Country } from '@/lib/data/country.enum';
import { CreateUserFormData, UserStatus } from '@/lib/schema/user.schema';
import { Status } from '@/lib/types/user/status.enum';
import { IUser } from '@/lib/types/user/user.interface';
import { getFileFullUrl } from '@/lib/utils/getFileFullUrl';
import { ChevronDownIcon } from 'lucide-react';
import React, { useState } from 'react';
import { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';

export default function ProfileUserForm({ errors, register, setValue, watch, mode, initialUser }: {
    errors: FieldErrors<CreateUserFormData>;
    register: UseFormRegister<CreateUserFormData>;
    setValue: UseFormSetValue<CreateUserFormData>;
    watch: UseFormWatch<CreateUserFormData>;
    mode: "edit" | "create"
    initialUser: IUser | null
}) {



    const [open, setOpen] = React.useState(false)
    const [date, setDate] = React.useState<Date | undefined>(undefined)


    const isUpdateMode = mode === 'edit';
    const thumbnailUrl = isUpdateMode && initialUser?.profile?.avatar ? getFileFullUrl(initialUser?.profile?.avatar) : undefined;
    const [files, setFiles] = useState<File[] | undefined>();
    const [filePreview, setFilePreview] = useState<string | undefined>(
        isUpdateMode ? initialUser?.profile?.avatar : undefined
    );

    const dateOfBirth = watch("profile.dateOfBirth")



    const handleDrop = (files: File[]) => {
        setFiles(files);
        if (files.length > 0) {
            const file = files[0]
            setValue("profile.avatarFile" as any, file, { shouldValidate: true });

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
        <Card>
            <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                    Additional profile details and social links
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Bio */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Bio</label>
                    <Textarea
                        {...register("profile.bio")}
                        placeholder="Tell us about yourself..."
                        rows={4}
                        className="w-full"
                    />
                </div>

                {/* Short Bio */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Short Bio</label>
                    <Input
                        {...register("profile.shortBio")}
                        placeholder="A brief description..."
                        className="w-full"
                    />
                </div>

                {/* Avatar URL */}
                <div className="  flex flex-col gap-1">
                    <label className="text-sm font-medium">Upload Avatar</label>
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
                </div>

                {/* Date of Birth */}
                <div className="space-y-2 relative">

                    {/* <Input
                        {...register("profile.dateOfBirth")}
                        type="date"
                        className="w-full"
                    /> */}
                    <div className="flex flex-col gap-3">
                        <Label htmlFor="date" className="px-1">
                            Date of birth
                        </Label>
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    id="date"
                                    className="w-full justify-between font-normal"
                                >
                                    {dateOfBirth ? dateOfBirth.toLocaleDateString() : "Select date"}
                                    <ChevronDownIcon />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto overflow-hidden p-0 m-auto" align="start">
                                <Calendar
                                    mode="single"
                                    selected={dateOfBirth}
                                    captionLayout="dropdown"
                                    onSelect={(date) => {
                                        setDate(date)
                                        setValue("profile.dateOfBirth", date)
                                        setOpen(false)
                                    }}

                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Address */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            {...register("profile.address.street")}
                            placeholder="Street address"
                        />
                        <Input
                            {...register("profile.address.city")}
                            placeholder="City"
                        />
                        <Input
                            {...register("profile.address.state")}
                            placeholder="State/Province"
                        />
                        <Input
                            {...register("profile.address.zipCode")}
                            placeholder="ZIP/Postal code"
                        />
                        <div className="md:col-span-2">
                            <Input
                                {...register("profile.address.country")}
                                placeholder="Country"
                            />
                        </div>
                    </div>
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Social Links</h3>
                    <div className="space-y-4">
                        <Input
                            {...register("profile.socialLinks.linkedin")}
                            placeholder="LinkedIn URL"
                        />
                        <Input
                            {...register("profile.socialLinks.twitter")}
                            placeholder="Twitter URL"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>)
}
