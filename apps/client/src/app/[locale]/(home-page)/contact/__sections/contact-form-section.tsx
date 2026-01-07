'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Textarea } from '@/components/atoms/textarea';
import { Card, CardContent } from '@/components/atoms/card';
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from '@/components/atoms/field';
import { Typography } from '@/components/atoms/typography';
import { Send, Loader2, Phone, Mail, MapPin, Clock, Share2 } from 'lucide-react';
import SocialMedia from '../__components/social-media';

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

const ContactFormSection = () => {
  const t = useTranslations('contact.form');

  const schema = yup.object({
    firstName: yup
      .string()
      .required(t('validation.firstName.required') || 'First name is required')
      .min(2, t('validation.firstName.min') || 'First name must be at least 2 characters'),
    lastName: yup
      .string()
      .required(t('validation.lastName.required') || 'Last name is required')
      .min(2, t('validation.lastName.min') || 'Last name must be at least 2 characters'),
    email: yup
      .string()
      .required(t('validation.email.required') || 'Email is required')
      .email(t('validation.email.invalid') || 'Invalid email address'),
    subject: yup
      .string()
      .required(t('validation.subject.required') || 'Subject is required')
      .min(3, t('validation.subject.min') || 'Subject must be at least 3 characters'),
    message: yup
      .string()
      .required(t('validation.message.required') || 'Message is required')
      .min(10, t('validation.message.min') || 'Message must be at least 10 characters'),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message');
      }

      toast.success(t('success'));
      reset();
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : t('error') || 'Failed to send message. Please try again.'
      );
    }
  };

  return (
    <section className='py-16 md:py-24 bg-background min-h-screen'>
      <div className='container mx-auto px-6 lg:px-8'>
        <div className='grid lg:grid-cols-2 gap-12 items-start'>
          {/* Left Column - Contact Information */}
          <div className='space-y-6'>
            <div>
              <Typography
                variant='h2'
                size='3xl'
                className='md:text-4xl mb-4'
                weight='bold'
              >
                {t('infoTitle')}
              </Typography>
              <Typography
                variant='p'
                size='lg'
                color='muted'
                className='leading-relaxed mb-6'
              >
                {t('infoDescription')}
              </Typography>
            </div>

            <Card className='bg-muted/30 border-border'>
              <CardContent className='p-6 space-y-6'>
                <div className='flex items-start gap-4'>
                  <div className='p-3 rounded-lg bg-(--ant-color-primary)/10'>
                    <Phone className='w-5 h-5 text-(--ant-color-primary)' />
                  </div>
                  <div>
                    <Typography
                      variant='small'
                      weight='semibold'
                      transform='uppercase'
                      size='sm'
                      className='mb-1'
                    >
                      {t('phoneLabel')}
                    </Typography>
                    <a
                      href={`tel:${t('phone1')}`}
                      className='text-muted-foreground hover:text-(--ant-color-primary) transition-colors block'
                    >
                      {t('phone1')}
                    </a>
                    <a
                      href={`tel:${t('phone2')}`}
                      className='text-muted-foreground hover:text-(--ant-color-primary) transition-colors block'
                    >
                      {t('phone2')}
                    </a>
                  </div>
                </div>

                <div className='flex items-start gap-4'>
                  <div className='p-3 rounded-lg bg-(--ant-color-primary)/10'>
                    <Mail className='w-5 h-5 text-(--ant-color-primary)' />
                  </div>
                  <div>
                    <Typography
                      variant='small'
                      weight='semibold'
                      transform='uppercase'
                      size='sm'
                      className='mb-1'
                    >
                      {t('emailLabel')}
                    </Typography>
                    <a
                      href={`mailto:${t('email1')}`}
                      className='text-muted-foreground hover:text-(--ant-color-primary) transition-colors block break-words'
                    >
                      {t('email1')}
                    </a>
                    <a
                      href={`mailto:${t('email2')}`}
                      className='text-muted-foreground hover:text-(--ant-color-primary) transition-colors block break-words'
                    >
                      {t('email2')}
                    </a>
                  </div>
                </div>

                <div className='flex items-start gap-4'>
                  <div className='p-3 rounded-lg bg-(--ant-color-primary)/10'>
                    <MapPin className='w-5 h-5 text-(--ant-color-primary)' />
                  </div>
                  <div>
                    <Typography
                      variant='small'
                      weight='semibold'
                      transform='uppercase'
                      size='sm'
                      className='mb-1'
                    >
                      {t('addressLabel')}
                    </Typography>
                    <Typography variant='p' color='muted'>
                      {t('address')}
                    </Typography>
                  </div>
                </div>

                <div className='flex items-start gap-4'>
                  <div className='p-3 rounded-lg bg-(--ant-color-primary)/10'>
                    <Clock className='w-5 h-5 text-(--ant-color-primary)' />
                  </div>
                  <div>
                    <Typography
                      variant='small'
                      weight='semibold'
                      transform='uppercase'
                      size='sm'
                      className='mb-1'
                    >
                      {t('hoursLabel')}
                    </Typography>
                    <Typography variant='p' color='muted'>
                      {t('hours')}
                    </Typography>
                  </div>
                </div>

                <div className='flex items-start gap-4'>
                  <div className='p-3 rounded-lg bg-(--ant-color-primary)/10'>
                    <Share2 className='w-5 h-5 text-(--ant-color-primary)' />
                  </div>
                  <div className='flex-1'>
                    <Typography
                      variant='small'
                      weight='semibold'
                      transform='uppercase'
                      size='sm'
                      className='mb-3'
                    >
                      {t('socialLabel')}
                    </Typography>
                    <SocialMedia />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Contact Form */}
          <div>
            <Card className='border-border shadow-lg'>
              <CardContent className='p-8 md:p-12'>
                <div className='mb-6'>
                  <Typography
                    variant='h2'
                    size='2xl'
                    className='md:text-3xl mb-2'
                    weight='bold'
                  >
                    {t('title')}
                  </Typography>
                  <Typography variant='p' color='muted'>
                    {t('description')}
                  </Typography>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                  <div className='grid md:grid-cols-2 gap-6'>
                    <Field data-invalid={!!errors.firstName}>
                      <FieldLabel htmlFor='firstName' className='text-foreground'>
                        {t('fields.firstName')}
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          id='firstName'
                          type='text'
                          {...register('firstName')}
                          placeholder={t('placeholders.firstName')}
                          className='w-full'
                          aria-invalid={!!errors.firstName}
                        />
                        <FieldError errors={errors.firstName ? [errors.firstName] : []} />
                      </FieldContent>
                    </Field>

                    <Field data-invalid={!!errors.lastName}>
                      <FieldLabel htmlFor='lastName' className='text-foreground'>
                        {t('fields.lastName')}
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          id='lastName'
                          type='text'
                          {...register('lastName')}
                          placeholder={t('placeholders.lastName')}
                          className='w-full'
                          aria-invalid={!!errors.lastName}
                        />
                        <FieldError errors={errors.lastName ? [errors.lastName] : []} />
                      </FieldContent>
                    </Field>
                  </div>

                  <Field data-invalid={!!errors.email}>
                    <FieldLabel htmlFor='email' className='text-foreground'>
                      {t('fields.email')}
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id='email'
                        type='email'
                        {...register('email')}
                        placeholder={t('placeholders.email')}
                        className='w-full'
                        aria-invalid={!!errors.email}
                      />
                      <FieldError errors={errors.email ? [errors.email] : []} />
                    </FieldContent>
                  </Field>

                  <Field data-invalid={!!errors.subject}>
                    <FieldLabel htmlFor='subject' className='text-foreground'>
                      {t('fields.subject')}
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id='subject'
                        type='text'
                        {...register('subject')}
                        placeholder={t('placeholders.subject')}
                        className='w-full'
                        aria-invalid={!!errors.subject}
                      />
                      <FieldError errors={errors.subject ? [errors.subject] : []} />
                    </FieldContent>
                  </Field>

                  <Field data-invalid={!!errors.message}>
                    <FieldLabel htmlFor='message' className='text-foreground'>
                      {t('fields.message')}
                    </FieldLabel>
                    <FieldContent>
                      <Textarea
                        id='message'
                        {...register('message')}
                        placeholder={t('placeholders.message')}
                        rows={6}
                        className='w-full resize-none'
                        aria-invalid={!!errors.message}
                      />
                      <FieldError errors={errors.message ? [errors.message] : []} />
                    </FieldContent>
                  </Field>
                  <div className='flex justify-center'>
                    <Button
                      type='submit'
                      size='lg'
                      disabled={isSubmitting}
                      effect={isSubmitting ? 'shine' : 'expandIcon'}
                      icon={isSubmitting ? <Loader2 className='w-4 h-4 mr-2 animate-spin mx-auto' /> : <Send className='w-4 h-4 mr-2' />}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                          {t('submitting')}
                        </>
                      ) : (
                        <>
                          {t('submit')}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactFormSection;

