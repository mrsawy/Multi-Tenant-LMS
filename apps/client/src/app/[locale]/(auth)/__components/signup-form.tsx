"use client"
import { Card, CardContent } from "@/components/atoms/card"
import { cn } from "@/lib/utils"
import { Button } from "@/components/atoms/button"
import { Input } from "@/components/atoms/input"
import { useForm } from 'react-hook-form'
import { Label } from "@/components/atoms/label"
import { loginSchema, LoginSchema, signupSchema, SignupSchema } from "@/lib/schema/authSchema";
import { yupResolver } from '@hookform/resolvers/yup'

// import { Currency } from "@/lib/data/currency.enum"
import { Country } from "@/lib/data/country.enum"
import { ToastContainer, toast } from 'react-toastify';
import { UserMainRoles } from "@/lib/data/userRole.enum"
import Image from "next/image"
import { handleSignup } from "@/lib/actions/auth/auth.action"
import useGeneralStore from "@/lib/store/generalStore"
import { Link, useRouter } from "@/i18n/navigation"
import { Combobox } from "@/components/molecules/combobox"
import { PhoneInput } from "@/components/organs/phone-input"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

import { useTranslations, useLocale } from 'next-intl';
import { Typography } from "@/components/atoms/typography"
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export function SignupForm({
  redirectUrl,
  onSuccess,
  className, onLoginClick,
  ...props
}: React.ComponentProps<"form"> & { redirectUrl?: string, onLoginClick?: () => void, onSuccess?: () => void }) {
  const t = useTranslations('auth.signup');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  
  const [showPassword, setShowPassword] = useState(false)

  const router = useRouter()

  const {
    register,
    handleSubmit,
    setError,
    watch,
    setValue,
    formState: { errors }, getValues
  } = useForm({
    resolver: yupResolver(signupSchema),
    mode: 'onSubmit',
    defaultValues: {
      roleName: UserMainRoles.STUDENT,
      country: Country.Egypt,
    },
  });



  const selectedRole = watch('roleName');



  const onSubmit = async (data: SignupSchema) => {
    try {
    useGeneralStore.setState({ generalIsLoading: true })
    const { phoneNumber } = data
    const numberToParse = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    const parsed = parsePhoneNumberFromString(numberToParse);
    const number = parsed && parsed.isValid() ? parsed.format('E.164') : numberToParse;
    
    console.log({...data, phoneNumber:number});
      
      const response = await handleSignup({...data, phoneNumber:number});

      if ('err' in response) {
        if (response.err.message.includes('username')) {
          return setError("username", { message: 'validation.usernameTaken' });
        }
        if (response.err.message.includes('email')) {
          return setError("email", { message: 'validation.emailTaken' });
        }
        if (response.err.message.includes('phone')) {
          return setError("phoneNumber", { message: 'validation.phoneTaken' });
        }
        return toast.error(t(response.err.message as any))
      }
      onSuccess?.()
      router.push(redirectUrl ? redirectUrl : response.roleName.toLowerCase() === UserMainRoles.STUDENT.toLowerCase() ? '/student-dashboard' : '/organization-dashboard')
    } catch (error) {
      console.log({ error })
      setError('root', { message: 'validation.somethingWentWrong' });
      toast.error(t('validation.somethingWentWrong'))
    } finally {
      useGeneralStore.setState({ generalIsLoading: false })
    }
  };


  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid  md:grid-cols-2 p-5 gap-6 ">

          <form
            onSubmit={handleSubmit(onSubmit, () => { console.log(getValues()) })}
            className={cn("flex flex-col gap-6 lg:p-8", className)} {...props}
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-2xl font-bold">{t('title')}</h1>
              <p className="text-muted-foreground text-sm text-balance">
                {t('subtitle')}
              </p>
            </div>
            <div className="flex flex-col gap-4">

              <div className="flex gap-2 justify-between">
                <div className="flex flex-col gap-2 w-full">
                  <Label className="text-sm lg:text-medium" htmlFor="firstName">{t('firstName')}</Label>
                  <Input placeholder={t('firstNamePlaceholder')} className="placeholder:text-sm lg:placeholder:text-medium text-sm lg:text-medium" {...register("firstName")} />
                  {(errors.firstName) ? (
                    <p className={cn("text-sm text-red-400", isRTL ? "text-right" : "text-left")}>
                      {t(errors.firstName?.message as any)}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <Label className="text-sm lg:text-medium" htmlFor="lastName">{t('lastName')}</Label>
                  <Input placeholder={t('lastNamePlaceholder')} className="placeholder:text-sm lg:placeholder:text-medium text-sm lg:text-medium" {...register("lastName")} />
                  {(errors.lastName) ? (
                    <p className={cn("text-sm text-red-400", isRTL ? "text-right" : "text-left")}>
                      {t(errors.lastName?.message as any)}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm lg:text-medium" htmlFor="email">{t('email')}</Label>
                <Input placeholder={t('emailPlaceholder')} className="placeholder:text-sm lg:placeholder:text-medium text-sm lg:text-medium" {...register("email")} />
                {(errors.email ?? errors.root) ? (
                  <p className={cn("text-sm text-red-400", isRTL ? "text-right" : "text-left")}>
                    {t((errors.email?.message || errors.root?.message) as any)}
                  </p>
                ) : null}
              </div>

              <div className="flex gap-2 justify-between flex-col lg:flex-row">
                <div className="flex flex-col gap-1 w-full">
                  <Label className="text-sm lg:text-medium" htmlFor="username">{t('username')}</Label>
                  <Input placeholder={t('usernamePlaceholder')} className="placeholder:text-sm lg:placeholder:text-medium text-sm lg:text-medium" {...register("username")} />
                  {(errors.username) ? (
                    <p className={cn("text-sm text-red-400", isRTL ? "text-right" : "text-left")}>
                      {t(errors.username?.message as any)}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2 w-full">
                  {/* <Label className="text-sm lg:text-medium" htmlFor="phoneNumber">{t('phoneNumber')}</Label> */}
                  <PhoneInput
                  label={t('phoneNumber')}
                  placeholder={t("phoneNumberPlaceholder")}
                    className="w-full"
                    // {...register("phoneNumber")}
                    isRTL={isRTL}
                    onValueChange={(value) => setValue('phoneNumber', value)}
                  />
                  {(errors.phoneNumber) ? (
                    <p className={cn("text-sm text-red-400", isRTL ? "text-right" : "text-left")}>
                      {t(errors.phoneNumber?.message as any)}
                    </p>
                  ) : null}
                </div>
              </div>


              <div className="flex gap-2 justify-between ">
                <div className="flex flex-col gap-2 w-full">
                  <Label htmlFor="country" className="text-sm lg:text-medium">{t('country')}</Label>
                  <Combobox
                    defaultValue={{ value: Country.Egypt, label: Country.Egypt }}
                    data={Object.values(Country).map(c => ({ value: c, label: c }))}
                    title={t('selectCountry')}
                    placeholder={t('countryPlaceholder')}
                    onValueChange={(value) => setValue('country', value as Country)}
                  />
                  {(errors.country) ? (
                    <p className={cn("text-sm text-red-400", isRTL ? "text-right" : "text-left")}>
                      {t(errors.country?.message as any)}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <Label className="text-sm lg:text-medium" htmlFor="role">{t('userType')}</Label>
                  <Combobox
                    defaultValue={{ value: UserMainRoles.STUDENT, label: t('roles.student') }}
                    data={Object.values(UserMainRoles).map(c => ({ value: c, label: t(`roles.${c.toLowerCase()}` as any) }))}
                    title={t('userRole')}
                    placeholder={t('rolePlaceholder')}
                    onValueChange={(value) => setValue('roleName', value as UserMainRoles)}
                    buttonClassName={cn(isRTL ? "text-right" : "text-left")}
                  />
                  {(errors.roleName) ? (
                    <p className={cn("text-sm text-red-400", isRTL ? "text-right" : "text-left")}>
                      {t(errors.roleName?.message as any)}
                    </p>
                  ) : null}
                </div>

              </div>

              <div className="flex flex-col gap-2">
                <div className="flex flex-col items-start">
                  <Label className="text-sm lg:text-medium" htmlFor="password">{t('password')}</Label>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    className={cn("placeholder:text-sm lg:placeholder:text-medium text-sm lg:text-medium", isRTL ? "pl-10" : "pr-10")}
                    placeholder={t('passwordPlaceholder')}
                    {...register("password")}
                  />

                  <div
                    className={cn("absolute top-1/2 -translate-y-1/2 cursor-pointer", isRTL ? "left-3" : "right-3")}
                    onClick={() => setShowPassword(prev => !prev)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </div>
                </div>              {(errors.password) ? (
                  <Typography variant="p" className={cn("text-sm text-red-400", isRTL ? "text-right" : "text-left")}>
                    {t(errors.password?.message as any)}
                  </Typography>
                ) : null}
              </div>




              {/* Organization Inputs - Only show when role is organization */}
              {selectedRole === UserMainRoles.ORGANIZATION && (
                <>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col items-start">
                      <Label className="text-sm lg:text-medium" htmlFor="organizationName">{t('organizationName')}</Label>
                    </div>
                    <Input className="placeholder:text-sm lg:placeholder:text-medium text-sm lg:text-medium" placeholder={t('organizationNamePlaceholder')} {...register("organizationName")} />
                    {(errors.organizationName) ? (
                      <p className={cn("text-sm text-red-400", isRTL ? "text-right" : "text-left")}>
                        {t(errors.organizationName?.message as any)}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col items-start">
                      <Label className="text-sm lg:text-medium" htmlFor="organizationSlug">{t('organizationSlug')}</Label>
                    </div>
                    <Input className="placeholder:text-sm lg:placeholder:text-medium text-sm lg:text-medium" placeholder={t('organizationSlugPlaceholder')} {...register("organizationSlug")} />
                    {(errors.organizationSlug) ? (
                      <p className={cn("text-sm text-red-400", isRTL ? "text-right" : "text-left")}>
                        {t(errors.organizationSlug?.message as any)}
                      </p>
                    ) : null}
                  </div>
                </>
              )}
              <Button type="submit" className="w-full">
                {t('submit')}
              </Button>
              {(errors.root) ? (
                <p className="text-sm text-red-400 m-auto text-center">
                  {t(errors.root?.message as any)}
                </p>
              ) : null}
            </div>
            <div className="text-center text-sm">
              {t('alreadyHaveAccount')}{" "}


              {onLoginClick ? (
                <button
                  type="button"
                  onClick={onLoginClick}
                  className="underline underline-offset-4 hover:text-blue-800 transition-all cursor-pointer"
                >
                  {t('login')}
                </button>
              ) : (
                <Link href="/login" className="underline underline-offset-4  hover:text-blue-800 transition-all cursor-pointer">
                  {t('login')}
                </Link>
              )}
            </div>
          </form>
          <div className="bg-muted relative hidden md:block rounded-2xl">
            <Image src="/images/4.png" alt="auth" fill className=" object-cover rounded-2xl" />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        {t('termsPrefix')} <a href="#">{t('termsLink')}</a>{" "}
        {t('termsSeparator')} <a href="#">{t('privacyLink')}</a>.
      </div>
    </div>
  )
}
