'use client';
import { Card, CardContent } from '@/components/atoms/card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { useForm } from 'react-hook-form';
import { Label } from '@/components/atoms/label';
import { loginSchema, LoginSchema } from '@/lib/schema/authSchema';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { handleLogin } from '@/lib/actions/auth/auth.action';
import useGeneralStore from '@/lib/store/generalStore';
import { Link, useRouter } from '@/i18n/navigation';
import { UserMainRoles } from '@/lib/data/userRole.enum';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import AuthInput from '@/components/molecules/AuthInput';

export function LoginForm({
  className,
  redirectUrl,
  onSignupClick,
  onSuccess,
  ...props
}: React.ComponentProps<'form'> & {
  redirectUrl?: string;
  onSignupClick?: () => void;
  onSuccess?: () => void;
}) {
  const t = useTranslations('auth.login');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: 'onSubmit',
  });

  const showPasswordValue = () => {
    setShowPassword((prev) => !prev);
  };
  const onSubmit = async (data: LoginSchema) => {
    try {
      useGeneralStore.setState({ generalIsLoading: true });
      const response = await handleLogin(data);
      if ('err' in response) {
        return toast.error(response.err.message);
      }
      console.log('(response.roleName === UserMainRoles.STU', { response });
      onSuccess?.();
      router.push(
        redirectUrl
          ? redirectUrl
          : response.roleName.toLowerCase() === UserMainRoles.STUDENT.toLowerCase()
            ? '/student-dashboard'
            : '/organization-dashboard',
      );
    } catch (error: any) {
      const message = error?.message || t('validation.somethingWentWrong');
      console.log({ error });
      setError('root', { message });
      setTimeout(() => {
        setError('root', { message: '' });
      }, 2000);
      toast.error(message);
    } finally {
      useGeneralStore.setState({ generalIsLoading: false });
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid  md:grid-cols-2 p-5 gap-6 ">
          <form
            onSubmit={handleSubmit((data) => onSubmit(data))}
            className={cn('flex flex-col gap-8 my-2 md:p-16', className)}
            {...props}
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-2xl font-bold">{t('title')}</h1>
              <p className="text-muted-foreground text-sm text-balance">
                {t('subtitle')}
              </p>
            </div>
            <AuthInput register={register} t={t} validationError={errors.identifier?.message} name="identifier" label="identifier" />
            <AuthInput register={register} t={t} validationError={errors.password?.message} name="password" label="password" type={showPassword ? 'text' : 'password'} showPassword={showPassword} showPasswordValue={showPasswordValue} />
            <Button type="submit" className="w-full">
              {t('submit')}
            </Button>

            <p
              className={cn(
                'scale-0 md:font-extrabold text-center text-red-50 m-auto bg-destructive/90 rounded-2xl w-5/12 p-2 text-xs md:text-sm transition-all duration-300',
                errors?.root && errors.root?.message && 'scale-100',
              )}
            >
              {errors?.root?.message && t(errors.root.message as string) }
            </p>
            <div className="text-center text-sm">
              {t('noAccount')}{' '}
              {onSignupClick ? (
                <button
                  type="button"
                  onClick={onSignupClick}
                  className="underline underline-offset-4 hover:text-blue-800 transition-all cursor-pointer"
                >
                  {t('signUp')}
                </button>
              ) : (
                <Link
                  href="/signup"
                  className="underline underline-offset-4 hover:text-blue-800 transition-all cursor-pointer"
                >
                  {t('signUp')}
                </Link>
              )}
            </div>
          </form>
          <div className="bg-muted relative hidden md:block rounded-2xl">
            <Image
              src="/images/4.png"
              alt="auth"
              fill
              className=" object-cover rounded-2xl"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        {t('termsPrefix')} <a href="#">{t('termsLink')}</a> {t('termsSeparator')}{' '}
        <a href="#">{t('privacyLink')}</a>.
      </div>
    </div>
  );
}

