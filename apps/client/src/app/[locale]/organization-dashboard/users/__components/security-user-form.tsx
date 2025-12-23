import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import { Input } from '@/components/atoms/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/select';
import { Textarea } from '@/components/atoms/textarea';
import { Country } from '@/lib/data/country.enum';
import { CreateUserFormData, UserStatus } from '@/lib/schema/user.schema';
import { Status } from '@/lib/types/user/status.enum';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { useState } from 'react';
import { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch, } from 'react-hook-form';

function SecurityUserForm({ errors, register, setValue, watch, mode, }: {
    errors: FieldErrors<CreateUserFormData>;
    register: UseFormRegister<CreateUserFormData>;
    setValue: UseFormSetValue<CreateUserFormData>;
    watch: UseFormWatch<CreateUserFormData>;
    mode: "create" | "edit";
}) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
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


                <>

                    {mode == "edit" && <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                            Leave password fields empty if you don't want to change the password.
                        </p>
                    </div>}
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
                        {errors.password && (
                            <p className="text-sm text-red-600">{errors?.password?.message}</p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
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
                    </div>
                </>




            </CardContent>
        </Card>)
}

export default SecurityUserForm