import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import { Input } from '@/components/atoms/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/select';
import { PhoneInput } from '@/components/organs/phone-input';
import { Country } from '@/lib/data/country.enum';
import { CreateUserFormData, UserStatus } from '@/lib/schema/user.schema';
import { Roles } from '@/lib/types/user/roles.enum';
import { Status } from '@/lib/types/user/status.enum';
import { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';

const BasicUserDataForm: React.FC<{
    errors: FieldErrors<CreateUserFormData>;
    register: UseFormRegister<CreateUserFormData>;
    setValue: UseFormSetValue<CreateUserFormData>;
    watch: UseFormWatch<CreateUserFormData>
}> = ({ errors, register, setValue, watch }) => {

    const roleName = watch("roleName");
    const isParentRole = roleName === "parent";

    return (
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

                        <PhoneInput
                            className="w-full"
                            // {...register("phoneNumber")}
                            onValueChange={(value) => setValue('phone', value)}
                            value={watch("phone")}
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
                        <Select onValueChange={(value) => setValue("roleName", value)} value={watch("roleName")}  >
                            <SelectTrigger>
                                <SelectValue placeholder={"Select role"} />
                            </SelectTrigger>
                            <SelectContent>
                                {/* <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="instructor">Instructor</SelectItem>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="parent">Parent</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="secretary">Secretary</SelectItem>
                                <SelectItem value="counselor">Counselor</SelectItem>
                                <SelectItem value="librarian">Librarian</SelectItem> */}
                                {Object.values(Roles).map(role => <SelectItem value={role}>{role.toLowerCase()}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        {errors.roleName && (
                            <p className="text-sm text-red-600">{errors.roleName.message}</p>
                        )}
                    </div>
                </div>

                {/* Conditional Student Identifier for Parent Role */}
                {isParentRole && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Student Identifier *
                        </label>
                        <Input
                            {...register("studentIdentifier")}
                            placeholder="Enter student ID or username"
                            className="w-full"
                        />
                        {errors.studentIdentifier && (
                            <p className="text-sm text-red-600">{errors.studentIdentifier.message}</p>
                        )}
                        <p className="text-xs text-gray-500">
                            Enter the student ID or username that this parent is associated with
                        </p>
                    </div>
                )}

                {/* Status and Currency */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Status */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Status
                        </label>
                        <Select
                            onValueChange={(value) => setValue("status", value as Status)}
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
                            Select Country *
                        </label>
                        <Select
                            onValueChange={(value) => setValue("country", value as Country)} value={watch("country")}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Country" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(Country).map((country) => (
                                    <SelectItem key={country} value={country}>
                                        {country}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.country && (
                            <p className="text-sm text-red-600">{errors.country.message}</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default BasicUserDataForm;