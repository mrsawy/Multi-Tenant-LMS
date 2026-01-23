import React, { Dispatch, SetStateAction } from 'react';
import { Input } from '../atoms/input';
import { Label } from '../atoms/label';
import { cn } from '@/lib/utils';
import { FieldError, FieldValues, Path, UseFormRegister } from 'react-hook-form';
import { _Translator, useLocale } from 'next-intl';
import { Typography } from '../atoms/typography';
import { Eye, EyeOff } from 'lucide-react';
type AuthInputProps<TFieldValues extends FieldValues> = {
  name: Path<TFieldValues>;
  register: UseFormRegister<TFieldValues>;
  t: _Translator<Record<string, any>>;
  validationError: string | undefined;
  label: string;
  type?: string;
  showPassword?: boolean;
  showPasswordValue?: () => void;
};
export default function AuthInput<TFieldValues extends FieldValues>({ register, name, t, validationError, label, type = 'text', showPassword, showPasswordValue }: AuthInputProps<TFieldValues>) {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <div className="relative flex w-full flex-col gap-2">
      <Label className="lg:text-medium text-sm" htmlFor={name}>
        {t(`${label}`)}
      </Label>
      <div className="relative">
        <Input type={type} placeholder={t(`${label}Placeholder`)} className="lg:placeholder:text-medium lg:text-medium text-sm placeholder:text-sm" {...register(name)} />
        {name === 'password' && (
          <div className={cn('absolute top-1/2 -translate-y-1/2 cursor-pointer', isRTL ? 'left-3' : 'right-3')} onClick={showPasswordValue}>
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </div>
        )}
      </div>
      {validationError && (
        <Typography variant="p" className={cn('mt-0! text-start text-sm text-red-400')}>
          {t(validationError)}
        </Typography>
      )}
    </div>
  );
}
