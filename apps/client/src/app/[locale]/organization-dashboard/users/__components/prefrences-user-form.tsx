import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import { Input } from '@/components/atoms/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/select';
import { Textarea } from '@/components/atoms/textarea';
import { Country } from '@/lib/data/country.enum';
import { CreateUserFormData, UserStatus } from '@/lib/schema/user.schema';
import { Status } from '@/lib/types/user/status.enum';
import { Eye, EyeOff, Settings, Shield } from 'lucide-react';
import { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch, } from 'react-hook-form';

export default function PreferencesUserForm({ errors, register, setValue, watch,  }: {
    errors: FieldErrors<CreateUserFormData>;
    register: UseFormRegister<CreateUserFormData>;
    setValue: UseFormSetValue<CreateUserFormData>;
    watch: UseFormWatch<CreateUserFormData>;
    
}) {
    return (
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
        </Card>)
}
