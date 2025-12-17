"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { createUserSchema, editUserSchema, CreateUserFormData, EditUserFormData, UserStatus, UserCurrency } from "@/lib/schema/user.schema";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Textarea } from "@/components/atoms/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/atoms/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select";
import { ArrowLeft, Save, User, Shield, Settings, Globe, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import { useRouter } from "@/i18n/navigation";
import useGeneralStore from "@/lib/store/generalStore";
import { IUser } from "@/lib/types/user/user.interface";
import { useCreateUser, useUpdateUser } from "@/lib/hooks/user/use-user.hook";
import { Status } from "@/lib/types/user/status.enum";
import { Currency } from "@/lib/data/currency.enum";
import BasicUserDataForm from "./basic-user-data-form";
import { Country } from "@/lib/data/country.enum";
import ProfileUserForm from "./profile-user-form";
import SecurityUserForm from "./security-user-form";
import PreferencesUserForm from "./prefrences-user-form";
import { extractErrorMessages } from "@/lib/utils/extractErrorMessages";



interface CreateUserFormProps {
    mode?: "create" | "edit";
    initialUser?: IUser | null;
}

export default function CreateUserForm({ mode = "create", initialUser = null }: CreateUserFormProps) {
    // const router = useRouter();

    const createUserMutation = useCreateUser();
    const updateUserMutation = useUpdateUser();

    const schema = mode === "edit" ? editUserSchema : createUserSchema;

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        reset
    } = useForm<CreateUserFormData>({
        resolver: yupResolver(schema as any),
        defaultValues: initialUser && mode === "edit"
            ? {
                _id: initialUser._id,
                username: initialUser.username,
                email: initialUser.email,
                phone: initialUser.phone,
                firstName: initialUser.firstName,
                lastName: initialUser.lastName,
                roleName: initialUser.roleName,
                organizationId: initialUser.organizationId,
                status: initialUser.status,
                country: initialUser.profile?.address?.country as Country,
                profile: {
                    bio: initialUser.profile?.bio || "",
                    shortBio: initialUser.profile?.shortBio || "",
                    avatar: initialUser.profile?.avatar || "",
                    dateOfBirth: initialUser.profile?.dateOfBirth ? new Date(initialUser.profile.dateOfBirth) : undefined,
                    address: {
                        street: initialUser.profile?.address?.street || "",
                        city: initialUser.profile?.address?.city || "",
                        state: initialUser.profile?.address?.state || "",
                        zipCode: initialUser.profile?.address?.zipCode || "",
                        country: initialUser.profile?.address?.country || "",
                    },
                    socialLinks: {
                        linkedin: initialUser.profile?.socialLinks?.linkedin || "",
                        twitter: initialUser.profile?.socialLinks?.twitter || "",
                    },
                },
                preferences: {
                    language: initialUser.preferences?.language || "en",
                    emailNotifications: initialUser.preferences?.emailNotifications ?? true,
                    darkMode: initialUser.preferences?.darkMode ?? false,
                },
            }
            : {
                status: Status.ACTIVE,
                country: Country.Egypt,
                preferences: {
                    language: "en",
                    emailNotifications: true,
                    darkMode: false,
                },
            },
    });

    const onSubmit = async (values: any) => {
        console.dir({ values }, { depth: null });
        if (mode === "edit" && initialUser?._id) {
            // Remove confirmPassword from update data
            // const { confirmPassword, ...updateData } = values;
            // updateUserMutation.mutate({
            //     userId: initialUser._id,
            //     updateData: updateData as Partial<EditUserFormData>,
            // });
        } else {
            createUserMutation.mutate(values as CreateUserFormData);
        }


    };

    const getUserStatusColor = (status: string) => {
        switch (status) {
            case UserStatus.ACTIVE:
                return "bg-green-50 text-green-700 border-green-200";
            case UserStatus.INACTIVE:
                return "bg-gray-50 text-gray-700 border-gray-200";
            case UserStatus.SUSPENDED:
                return "bg-red-50 text-red-700 border-red-200";
            case UserStatus.PENDING:
                return "bg-yellow-50 text-yellow-700 border-yellow-200";
            default:
                return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/organization-dashboard/users"
                                className="flex items-center cursor-pointer"
                            >
                                <ArrowLeft className="h-5 w-5 mr-2" />
                                Back to Users
                            </Link>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Button
                                onClick={handleSubmit(onSubmit, (err => extractErrorMessages(err).forEach(e => toast.error(e))))}
                                size="sm"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Save User
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div className="mb-6">
                            <div className="flex items-center space-x-3 mb-2">
                                <User className="h-8 w-8" />
                                <h1 className="text-3xl font-bold">
                                    {mode === "edit" ? "Edit" : "Create"} User
                                </h1>
                            </div>
                            <p>Add or modify user information and settings.</p>
                        </div>

                        <Tabs defaultValue="basic" className="w-full">
                            <TabsList className="w-full grid-cols-4 flex justify-center">
                                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                                <TabsTrigger value="profile">Profile</TabsTrigger>
                                <TabsTrigger value="security">Security</TabsTrigger>
                                <TabsTrigger value="preferences">Preferences</TabsTrigger>
                            </TabsList>

                            {/* Basic Information Tab */}
                            <TabsContent value="basic" className="space-y-6">
                                <BasicUserDataForm errors={errors} register={register} setValue={setValue} watch={watch} />
                            </TabsContent>

                            {/* Profile Tab */}
                            <TabsContent value="profile" className="space-y-6">
                                <ProfileUserForm errors={errors} register={register} setValue={setValue} watch={watch} mode={mode} initialUser={initialUser} />
                            </TabsContent>

                            {/* Security Tab */}
                            <TabsContent value="security" className="space-y-6">
                                <SecurityUserForm errors={errors} register={register} setValue={setValue} watch={watch} mode={mode} />
                            </TabsContent>

                            {/* Preferences Tab */}
                            <TabsContent value="preferences" className="space-y-6">
                                <PreferencesUserForm errors={errors} register={register} setValue={setValue} watch={watch} />
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* User Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">User Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Status</span>
                                    <Badge className={getUserStatusColor(watch("status") || UserStatus.ACTIVE)}>
                                        {watch("status") || UserStatus.ACTIVE}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Role</span>
                                    <Badge variant="outline">
                                        {watch("roleName") || "Not Selected"}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Tips */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center">
                                    <Globe className="h-5 w-5 mr-2 text-blue-500" />
                                    Tips
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li>• Use a strong, unique password</li>
                                    <li>• Ensure email address is correct for notifications</li>
                                    <li>• Complete profile information for better experience</li>
                                    <li>• Set appropriate role permissions</li>
                                    {mode === "edit" && (
                                        <li>• Leave password fields empty to keep current password</li>
                                    )}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}