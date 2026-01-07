import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const typographyVariants = cva(
    'text-foreground text-center sm:text-start',
    {
        variants: {
            variant: {
                h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
                h2: 'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0',
                h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
                h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
                h5: 'scroll-m-20 text-lg font-semibold tracking-tight',
                h6: 'scroll-m-20 text-base font-semibold tracking-tight',
                p: 'leading-7 [&:not(:first-child)]:mt-6',
                blockquote: 'mt-6 border-l-2 pl-6 italic',
                list: 'my-6 ml-6 list-disc [&>li]:mt-2',
                inlineCode: 'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
                lead: 'text-xl text-muted-foreground',
                large: 'text-lg font-semibold',
                small: 'text-sm font-medium leading-none',
                muted: 'text-sm text-muted-foreground',
                span: '',
                div: '',
            },
            size: {
                xs: 'text-xs',
                sm: 'text-sm',
                base: 'text-base',
                lg: 'text-lg',
                xl: 'text-xl',
                '2xl': 'text-2xl',
                '3xl': 'text-3xl',
                '4xl': 'text-4xl',
                '5xl': 'text-5xl',
                '6xl': 'text-6xl',
            },
            weight: {
                thin: 'font-thin',
                extralight: 'font-extralight',
                light: 'font-light',
                normal: 'font-normal',
                medium: 'font-medium',
                semibold: 'font-semibold',
                bold: 'font-bold',
                extrabold: 'font-extrabold',
                black: 'font-black',
            },
            color: {
                default: 'text-foreground',
                primary: 'text-[var(--ant-color-primary)]',
                secondary: 'text-[var(--ant-color-text-secondary)]',
                tertiary: 'text-[var(--ant-color-text-tertiary)]',
                muted: 'text-muted-foreground',
                accent: 'text-accent-foreground',
                destructive: 'text-destructive',
                success: 'text-[var(--ant-color-success)]',
                warning: 'text-[var(--ant-color-warning)]',
                error: 'text-[var(--ant-color-error)]',
                info: 'text-[var(--ant-color-info)]',
                link: 'text-[var(--ant-color-link)]',
                blue: 'text-[var(--ant-blue)]',
                purple: 'text-[var(--ant-purple)]',
                cyan: 'text-[var(--ant-cyan)]',
                green: 'text-[var(--ant-green)]',
                magenta: 'text-[var(--ant-magenta)]',
                pink: 'text-[var(--ant-pink)]',
                red: 'text-[var(--ant-red)]',
                orange: 'text-[var(--ant-orange)]',
                yellow: 'text-[var(--ant-yellow)]',
                volcano: 'text-[var(--ant-volcano)]',
                geekblue: 'text-[var(--ant-geekblue)]',
                gold: 'text-[var(--ant-gold)]',
                lime: 'text-[var(--ant-lime)]',
            },
            align: {
                left: 'text-left',
                center: 'text-center',
                right: 'text-right',
                justify: 'text-justify',
            },
            transform: {
                none: 'normal-case',
                uppercase: 'uppercase',
                lowercase: 'lowercase',
                capitalize: 'capitalize',
            },
            decoration: {
                none: 'no-underline',
                underline: 'underline',
                'line-through': 'line-through',
                overline: 'overline',
            },
        },
        defaultVariants: {
            variant: 'p',
            color: 'default',
            align: undefined,
            transform: 'none',
            decoration: 'none',
        },
    },
);

const variantElementMap = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    p: 'p',
    blockquote: 'blockquote',
    list: 'ul',
    inlineCode: 'code',
    lead: 'p',
    large: 'div',
    small: 'small',
    muted: 'p',
    span: 'span',
    div: 'div',
} as const;

export interface TypographyProps
    extends Omit<React.HTMLAttributes<HTMLElement>, 'color'>,
    VariantProps<typeof typographyVariants> {
    asChild?: boolean;
    as?: keyof typeof variantElementMap;
}

const Typography = React.forwardRef<any, TypographyProps>(
    (
        {
            className,
            variant = 'p',
            size,
            weight,
            color,
            align,
            transform,
            decoration,
            asChild = false,
            as,
            ...props
        },
        ref,
    ) => {
        const Comp = asChild
            ? Slot
            : (as ? variantElementMap[as] : variant ? variantElementMap[variant] : 'p');

        return (
            <Comp
                className={cn("text-center sm:text-start",
                    typographyVariants({
                        variant,
                        size,
                        weight,
                        color,
                        align,
                        transform,
                        decoration,
                    }),
                    className,
                )}
                ref={ref}
                {...props}
            />
        );
    },
);

Typography.displayName = 'Typography';

export { Typography, typographyVariants };

