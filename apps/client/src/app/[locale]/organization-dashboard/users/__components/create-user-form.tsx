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


interface CreateUserFormProps {
    mode?: "create" | "edit";
    initialUser?: IUser | null;
}

export default function CreateUserForm({ mode = "create", initialUser = null }: CreateUserFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const router = useRouter();

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
    } = useForm({
        resolver: yupResolver(schema as any),
        defaultValues: initialUser
            ? {
                _id: initialUser._id,
                username: initialUser.username,
                email: initialUser.email,
                phone: initialUser.phone,
                firstName: initialUser.firstName,
                lastName: initialUser.lastName,
                role: initialUser.role,
                organizationId: initialUser.organizationId,
                status: initialUser.status,
                preferredCurrency: initialUser.preferredCurrency,
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
                status: UserStatus.ACTIVE,
                preferredCurrency: UserCurrency.USD,
                preferences: {
                    language: "en",
                    emailNotifications: true,
                    darkMode: false,
                },
            },
    });

    useEffect(() => {
        console.log({ errors });
    }, [errors]);

    const onSubmit = async (values: any) => {
        console.log({ values });
        try {
            useGeneralStore.setState({ generalIsLoading: true });

            if (mode === "edit" && initialUser?._id) {
                // Remove confirmPassword from update data
                const { confirmPassword, ...updateData } = values;
                updateUserMutation.mutate({
                    userId: initialUser._id,
                    updateData: updateData as Partial<EditUserFormData>,
                });
            } else {
                createUserMutation.mutate(values as CreateUserFormData);
            }
        } catch (error: any) {
            toast.error(error.message || "Something went wrong, please try again later");
        } finally {
            useGeneralStore.setState({ generalIsLoading: false });
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
                                onClick={handleSubmit(onSubmit)}
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
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Basic Information</CardTitle>
                                        <CardDescription>
                                            Essential user details and account information
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Username */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">
                                                    Username *
                                                </label>
                                                <Input
                                                    {...register("username")}
                                                    placeholder="Enter username"
                                                    className="w-full"
                                                />
                                                {errors.username && (
                                                    <p className="text-sm text-red-600">{errors.username.message}</p>
                                                )}
                                            </div>

                                            {/* Email */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">
                                                    Email *
                                                </label>
                                                <Input
                                                    {...register("email")}
                                                    type="email"
                                                    placeholder="Enter email address"
                                                    className="w-full"
                                                />
                                                {errors.email && (
                                                    <p className="text-sm text-red-600">{errors.email.message}</p>
                                                )}
                                            </div>

                                            {/* First Name */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">
                                                    First Name *
                                                </label>
                                                <Input
                                                    {...register("firstName")}
                                                    placeholder="Enter first name"
                                                    className="w-full"
                                                />
                                                {errors.firstName && (
                                                    <p className="text-sm text-red-600">{errors.firstName.message}</p>
                                                )}
                                            </div>

                                            {/* Last Name */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">
                                                    Last Name *
                                                </label>
                                                <Input
                                                    {...register("lastName")}
                                                    placeholder="Enter last name"
                                                    className="w-full"
                                                />
                                                {errors.lastName && (
                                                    <p className="text-sm text-red-600">{errors.lastName.message}</p>
                                                )}
                                            </div>

                                            {/* Phone */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">
                                                    Phone Number *
                                                </label>
                                                <Input
                                                    {...register("phone")}
                                                    placeholder="Enter phone number"
                                                    className="w-full"
                                                />
                                                {errors.phone && (
                                                    <p className="text-sm text-red-600">{errors.phone.message}</p>
                                                )}
                                            </div>

                                            {/* Role */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">
                                                    Role *
                                                </label>
                                                <Select onValueChange={(value) => setValue("role", value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select role" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="admin">Admin</SelectItem>
                                                        <SelectItem value="instructor">Instructor</SelectItem>
                                                        <SelectItem value="student">Student</SelectItem>
                                                        <SelectItem value="manager">Manager</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.role && (
                                                    <p className="text-sm text-red-600">{errors.role.message}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Status and Currency */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Status */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">
                                                    Status
                                                </label>
                                                <Select
                                                    onValueChange={(value) => setValue("status", value as Status | UserStatus | undefined)}
                                                    defaultValue={UserStatus.ACTIVE}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value={UserStatus.ACTIVE}>Active</SelectItem>
                                                        <SelectItem value={UserStatus.INACTIVE}>Inactive</SelectItem>
                                                        <SelectItem value={UserStatus.SUSPENDED}>Suspended</SelectItem>
                                                        <SelectItem value={UserStatus.PENDING}>Pending</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Preferred Currency */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">
                                                    Preferred Currency *
                                                </label>
                                                <Select
                                                    onValueChange={(value) => setValue("preferredCurrency", value as Currency | UserCurrency)}
                                                    defaultValue={UserCurrency.USD}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select currency" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value={UserCurrency.USD}>USD</SelectItem>
                                                        <SelectItem value={UserCurrency.EUR}>EUR</SelectItem>
                                                        <SelectItem value={UserCurrency.GBP}>GBP</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.preferredCurrency && (
                                                    <p className="text-sm text-red-600">{errors.preferredCurrency.message}</p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Profile Tab */}
                            <TabsContent value="profile" className="space-y-6">
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
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Avatar URL</label>
                                            <Input
                                                {...register("profile.avatar")}
                                                placeholder="https://example.com/avatar.jpg"
                                                className="w-full"
                                            />
                                        </div>

                                        {/* Date of Birth */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Date of Birth</label>
                                            <Input
                                                {...register("profile.dateOfBirth")}
                                                type="date"
                                                className="w-full"
                                            />
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
                                </Card>
                            </TabsContent>

                            {/* Security Tab */}
                            <TabsContent value="security" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Shield className="h-5 w-5 mr-2" />
                                            Security Settings
                                        </CardTitle>
                                        <CardDescription>
                                            {mode === "edit" ? "Update password and security settings" : "Set password and security settings"}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {mode === "create" && (
                                            <>
                                                {/* Password */}
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">
                                                        Password *
                                                    </label>
                                                    <div className="relative">
                                                        <Input
                                                            {...register("password" as any)}
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="Enter password"
                                                            className="w-full pr-10"
                                                        />
                                                        <button
                                                            type="button"
                                                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                        >
                                                            {showPassword ? (
                                                                <EyeOff className="h-4 w-4 text-gray-400" />
                                                            ) : (
                                                                <Eye className="h-4 w-4 text-gray-400" />
                                                            )}
                                                        </button>
                                                    </div>
                                                    {/* {errors.password && (
                                                        <p className="text-sm text-red-600">{errors?.password?.message}</p>
                                                    )} */}
                                                </div>

                                                {/* Confirm Password */}
                                                {/* <div className="space-y-2">
                                                    <label className="text-sm font-medium">
                                                        Confirm Password *
                                                    </label>
                                                    <div className="relative">
                                                        <Input
                                                            {...register("confirmPassword")}
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            placeholder="Confirm password"
                                                            className="w-full pr-10"
                                                        />
                                                        <button
                                                            type="button"
                                                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        >
                                                            {showConfirmPassword ? (
                                                                <EyeOff className="h-4 w-4 text-gray-400" />
                                                            ) : (
                                                                <Eye className="h-4 w-4 text-gray-400" />
                                                            )}
                                                        </button>
                                                    </div>
                                                    {errors.confirmPassword && (
                                                        <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                                                    )}
                                                </div> */}
                                            </>
                                        )}

                                        {mode === "edit" && (
                                            <>
                                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                                    <p className="text-sm text-yellow-800">
                                                        Leave password fields empty if you don't want to change the password.
                                                    </p>
                                                </div>

                                                {/* New Password */}
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">
                                                        New Password
                                                    </label>
                                                    <div className="relative">
                                                        <Input
                                                            {...register("password" as any)}
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="Enter new password"
                                                            className="w-full pr-10"
                                                        />
                                                        <button
                                                            type="button"
                                                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                        >
                                                            {showPassword ? (
                                                                <EyeOff className="h-4 w-4 text-gray-400" />
                                                            ) : (
                                                                <Eye className="h-4 w-4 text-gray-400" />
                                                            )}
                                                        </button>
                                                    </div>
                                                    {/* {errors.password && (
                                                        <p className="text-sm text-red-600">{errors.password.message}</p>
                                                    )} */}
                                                </div>

                                                {/* Confirm New Password */}
                                                {/* <div className="space-y-2">
                                                    <label className="text-sm font-medium">
                                                        Confirm New Password
                                                    </label>
                                                    <div className="relative">
                                                        <Input
                                                            {...register("confirmPassword")}
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            placeholder="Confirm new password"
                                                            className="w-full pr-10"
                                                        />
                                                        <button
                                                            type="button"
                                                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        >
                                                            {showConfirmPassword ? (
                                                                <EyeOff className="h-4 w-4 text-gray-400" />
                                                            ) : (
                                                                <Eye className="h-4 w-4 text-gray-400" />
                                                            )}
                                                        </button>
                                                    </div>
                                                    {errors.confirmPassword && (
                                                        <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                                                    )}
                                                </div> */}
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Preferences Tab */}
                            <TabsContent value="preferences" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Settings className="h-5 w-5 mr-2" />
                                            User Preferences
                                        </CardTitle>
                                        <CardDescription>
                                            Configure user preferences and settings
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Language */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">
                                                Language
                                            </label>
                                            <Select
                                                onValueChange={(value) => setValue("preferences.language", value)}
                                                defaultValue="en"
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select language" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="en">English</SelectItem>
                                                    <SelectItem value="es">Spanish</SelectItem>
                                                    <SelectItem value="fr">French</SelectItem>
                                                    <SelectItem value="de">German</SelectItem>
                                                    <SelectItem value="it">Italian</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Email Notifications */}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="text-sm font-medium">
                                                    Email Notifications
                                                </label>
                                                <p className="text-xs text-muted-foreground">
                                                    Receive email notifications for important updates
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant={watch("preferences.emailNotifications") ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setValue("preferences.emailNotifications", !watch("preferences.emailNotifications"))}
                                            >
                                                {watch("preferences.emailNotifications") ? "Enabled" : "Disabled"}
                                            </Button>
                                        </div>

                                        {/* Dark Mode */}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="text-sm font-medium">
                                                    Dark Mode
                                                </label>
                                                <p className="text-xs text-muted-foreground">
                                                    Use dark theme for the interface
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant={watch("preferences.darkMode") ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setValue("preferences.darkMode", !watch("preferences.darkMode"))}
                                            >
                                                {watch("preferences.darkMode") ? "Dark" : "Light"}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
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
                                        {watch("role") || "Not Selected"}
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