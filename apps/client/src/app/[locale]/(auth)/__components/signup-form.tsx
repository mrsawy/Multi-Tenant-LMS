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
import AuthInput from "@/components/molecules/AuthInput"

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
  const showPasswordValue = () => {
    setShowPassword((prev) => !prev);
  };

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
              <div className="flex justify-between gap-2">
                <AuthInput register={register} t={t} validationError={errors.firstName?.message} name="firstName" label="firstName" />
                <AuthInput register={register} t={t} validationError={errors.lastName?.message} name="lastName" label="lastName" />
              </div>
              <AuthInput register={register} t={t} validationError={errors.email?.message || errors.root?.message} name="email" label="email" />
              <div className="flex flex-col justify-between gap-2 lg:flex-row">
                <AuthInput register={register} t={t} validationError={errors.username?.message} name="username" label="username" />
                <div className="flex w-full flex-col gap-2">
                  <PhoneInput label={t('phoneNumber')} placeholder={t('phoneNumberPlaceholder')} className="w-full" isRTL={isRTL} onValueChange={(value) => setValue('phoneNumber', value)} />
                  {errors.phoneNumber && <Typography className={cn('mt-0! text-start text-sm text-red-400')}>{t(errors.phoneNumber?.message as string)}</Typography>}
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
                    {(errors.country)&&(
                    <p className={cn("text-sm text-red-400 text-start")}>
                      {t(errors.country?.message as string)}
                    </p>
                  ) }
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <Label className="text-sm lg:text-medium" htmlFor="role">{t('userType')}</Label>
                  <Combobox
                    defaultValue={{ value: UserMainRoles.STUDENT, label: t('roles.student') }}
                    data={Object.values(UserMainRoles).map(c => ({ value: c, label: t(`roles.${c.toLowerCase()}` as any) }))}
                    title={t('userRole')}
                    placeholder={t('rolePlaceholder')}
                    onValueChange={(value) => setValue('roleName', value as UserMainRoles)}
                  />
                  {errors.roleName && (
                    <Typography variant="p" className={cn('mt-0! text-start text-sm text-red-400')}>
                      {t(errors.roleName?.message as string)}
                    </Typography>
                  )}
                </div>
              </div>
              <AuthInput register={register} t={t} validationError={errors.password?.message} name="password" label="password" type={showPassword ? 'text' : 'password'} showPassword={showPassword} showPasswordValue={showPasswordValue} />
              {/* Organization Inputs - Only show when role is organization */}
              {selectedRole === UserMainRoles.ORGANIZATION && (
                <>
                  <AuthInput register={register} t={t} validationError={errors.organizationName?.message} name="organizationName" label="organizationName" />
                  <AuthInput register={register} t={t} validationError={errors.organizationSlug?.message} name="organizationSlug" label="organizationSlug" />
                </>
              )}
              <Button type="submit" className="w-full">
                {t('submit')}
              </Button>
              {errors.root && (
                <Typography variant="p" className={cn('m-auto mt-0! text-center text-sm text-red-400')}>
                  {errors.root?.message}
                </Typography>
              )}
            </div>
            <div className="text-center text-sm">
              {t('alreadyHaveAccount')}

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
