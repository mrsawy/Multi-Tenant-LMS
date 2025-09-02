"use client"
import { Card, CardContent } from "@/components/atoms/card"
import { cn } from "@/lib/utils"
import { Button } from "@/components/atoms/button"
import { Input } from "@/components/atoms/input"
import { useForm } from 'react-hook-form'
import { Label } from "@/components/atoms/label"
import { loginSchema, LoginSchema, signupSchema, SignupSchema } from "@/lib/schema/authSchema";
import { yupResolver } from '@hookform/resolvers/yup'
// import { handleLogin } from "@/actions/auth/auth.action";
import { PhoneInput } from "./phone-input"
import { Combobox } from "../molecules/combobox"
import { Currency } from "@/lib/data/currency.enum"
import { Country } from "@/lib/data/country.enum"
import { ToastContainer, toast } from 'react-toastify';
import { UserMainRoles } from "@/lib/data/userRole.enum"
import Image from "next/image"
import { handleSignup } from "@/lib/actions/auth/auth.action"
import Spinner from "./spinner"
import useGeneralStore from "@/lib/store/generalStore"
import { Link } from "@/i18n/navigation"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {




  const {
    register,
    handleSubmit,
    setError,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signupSchema),
    mode: 'onSubmit',
    defaultValues: {
      role: UserMainRoles.STUDENT,
      country: Country.Egypt,
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: SignupSchema) => {
    try {
      useGeneralStore.setState({ generalIsLoading: true })
      const response = await handleSignup(data);
      if (!!response?.err) {
        if (response.err.message.includes('username')) {
          console.log({ response })
          return setError("username", { message: 'This username is already taken.' });
        }
        if (response.err.message.includes('email')) {
          return setError("email", { message: 'This email is already taken.' });
        }
        if (response.err.message.includes('phone')) {
          return setError("phoneNumber", { message: 'This phone number is already taken.' });
        }
        if (response.err.message.includes('phone')) {
          return setError("phoneNumber", { message: 'This phone number is already taken.' });
        }
        toast.error(response.err.message)
      }
    } catch {
      setError('root', { message: 'Something went wrong.' });
      toast.error('Something went wrong.')
    } finally {
      useGeneralStore.setState({ generalIsLoading: false })
    }
  };


  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid  md:grid-cols-2 p-5 gap-6 ">

          <form
            onSubmit={handleSubmit((data) => onSubmit(data))}
            className={cn("flex flex-col gap-6 lg:p-8", className)} {...props}
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-2xl font-bold">Create a new account</h1>
              <p className="text-muted-foreground text-sm text-balance">
                Register Now
              </p>
            </div>
            <div className="flex flex-col gap-4">

              <div className="flex gap-2 justify-between">
                <div className="flex flex-col gap-2 w-full">
                  <Label className="text-sm lg:text-medium" htmlFor="firstName">First Name</Label>
                  <Input placeholder="your first name..." className="placeholder:text-sm lg:placeholder:text-medium text-sm lg:text-medium" {...register("firstName")} />
                  {(errors.firstName) ? (
                    <p className="text-left text-sm text-red-400">
                      {errors.firstName?.message}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <Label className="text-sm lg:text-medium" htmlFor="lastName">Last Name</Label>
                  <Input placeholder="your last name..." className="placeholder:text-sm lg:placeholder:text-medium text-sm lg:text-medium" {...register("lastName")} />
                  {(errors.lastName) ? (
                    <p className="text-left text-sm text-red-400">
                      {errors.lastName?.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm lg:text-medium" htmlFor="email">Email</Label>
                <Input placeholder="your email..." className="placeholder:text-sm lg:placeholder:text-medium text-sm lg:text-medium" {...register("email")} />
                {(errors.email ?? errors.root) ? (
                  <p className="text-left text-sm text-red-400">
                    {errors.email?.message}
                  </p>
                ) : null}
              </div>

              <div className="flex gap-2 justify-between flex-col lg:flex-row">
                <div className="flex flex-col gap-2 w-full">
                  <Label className="text-sm lg:text-medium" htmlFor="username">Username</Label>
                  <Input placeholder="Choose your username..." className="placeholder:text-sm lg:placeholder:text-medium text-sm lg:text-medium" {...register("username")} />
                  {(errors.username) ? (
                    <p className="text-left text-sm text-red-400">
                      {errors.username?.message}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2 w-full">
                  {/* <Label className="text-sm lg:text-medium" htmlFor="phoneNumber">Phone Number</Label> */}
                  <PhoneInput
                    className="w-full"
                    {...register("phoneNumber")}
                  />
                  {(errors.phoneNumber) ? (
                    <p className="text-left text-sm text-red-400">
                      {errors.phoneNumber?.message}
                    </p>
                  ) : null}
                </div>
              </div>


              <div className="flex gap-2 justify-between ">
                <div className="flex flex-col gap-2 w-full">
                  <Label htmlFor="country" className="text-sm lg:text-medium">Country</Label>
                  <Combobox
                    defaultValue={{ value: Country.Egypt, label: Country.Egypt }}
                    data={Object.values(Country).map(c => ({ value: c, label: c }))}
                    title="Preferred Country"
                    placeholder="Country ..."
                    onValueChange={(value) => setValue('country', value as Country)}
                  />
                  {(errors.country) ? (
                    <p className="text-left text-sm text-red-400">
                      {errors.country?.message}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <Label className="text-sm lg:text-medium" htmlFor="role">User Type</Label>
                  <Combobox
                    defaultValue={{ value: UserMainRoles.STUDENT, label: UserMainRoles.STUDENT.toLowerCase() }}
                    data={Object.values(UserMainRoles).map(c => ({ value: c, label: c.toLowerCase() }))}
                    title="User Role"
                    placeholder="Role ..."
                    onValueChange={(value) => setValue('role', value as UserMainRoles)}
                  />
                  {(errors.role) ? (
                    <p className="text-left text-sm text-red-400">
                      {errors.role?.message}
                    </p>
                  ) : null}
                </div>

              </div>


              <div className="flex flex-col gap-2">
                <div className="flex flex-col items-start">
                  <Label className="text-sm lg:text-medium" htmlFor="password">Password</Label>
                </div>
                <Input type="password" className="placeholder:text-sm lg:placeholder:text-medium text-sm lg:text-medium" {...register("password")} />
                {(errors.password) ? (
                  <p className="text-left text-sm text-red-400">
                    {errors.password?.message}
                  </p>
                ) : null}
              </div>


              {/* Organization Inputs - Only show when role is organization */}
              {selectedRole === UserMainRoles.ORGANIZATION && (
                <>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col items-start">
                      <Label className="text-sm lg:text-medium" htmlFor="organizationName">Organization name</Label>
                    </div>
                    <Input className="placeholder:text-sm lg:placeholder:text-medium text-sm lg:text-medium" placeholder="Choose the organization name..." {...register("organizationName")} />
                    {(errors.organizationName) ? (
                      <p className="text-left text-sm text-red-400">
                        {errors.organizationName?.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col items-start">
                      <Label className="text-sm lg:text-medium" htmlFor="organizationSlug">Organization Slug</Label>
                    </div>
                    <Input className="placeholder:text-sm lg:placeholder:text-medium text-sm lg:text-medium" placeholder="Choose the organization slug..." {...register("organizationSlug")} />
                    {(errors.organizationSlug) ? (
                      <p className="text-left text-sm text-red-400">
                        {errors.organizationSlug?.message}
                      </p>
                    ) : null}
                  </div>
                </>
              )}
              <Button type="submit" className="w-full">
                Sign Up
              </Button>
              {(errors.root) ? (
                <p className="text-left text-sm text-red-400 m-auto">
                  {errors.root?.message}
                </p>
              ) : null}
            </div>
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="underline underline-offset-4  hover:text-blue-800 transition-all">
                Login
              </Link>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block rounded-2xl">
            <Image src="/images/4.png" alt="auth" fill className=" object-cover rounded-2xl" />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking signup, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
