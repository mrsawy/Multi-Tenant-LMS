import { type NextRequest, NextResponse } from 'next/server';
import createI18nMiddleware from 'next-intl/middleware';
import { PUBLIC_ROUTES } from "@/lib/route.config"
import { redirect } from 'next/navigation';
import { IUser } from './lib/types/user/user.interface';

const i18nMiddleware = createI18nMiddleware({
    locales: ['ar', 'en'],
    defaultLocale: 'ar',
    localeDetection: false,
    localePrefix: 'always'
});

export const AUTH_COOKIE_NAME = 'nc_sid';

function isPublicRoute(pathname: string): boolean {
    return PUBLIC_ROUTES.includes(pathname) || PUBLIC_ROUTES.includes(pathname);
}

export default async function middleware(request: NextRequest & { user?: IUser }) {
    try {


        const { pathname, origin } = request.nextUrl;
        const pathWithoutLocale = pathname.replace(/^\/(ar|en)/, '');

        if (isPublicRoute(pathWithoutLocale)) {
            return i18nMiddleware(request);
        }

        const i18nResponse = i18nMiddleware(request);

        if (request.cookies.has(AUTH_COOKIE_NAME)) {


            const response = await fetch(`${origin}/api/user`, {
                headers: {
                    Cookie: `${AUTH_COOKIE_NAME}=${request.cookies.get(AUTH_COOKIE_NAME)?.value}`
                },
            });
            if (response.status === 200) {
                request.user = (await response.json()) as IUser;
                return i18nResponse
            } else {
                const response = NextResponse.redirect(new URL('/login', request.url));
                response.cookies.delete(AUTH_COOKIE_NAME);
                return response;
            }
        }

        return NextResponse.redirect(new URL('/login', request.url))
    } catch (error) {
        console.error("error frmo middleware:", error)
        return NextResponse.redirect(new URL('/login', request.url))
    }
}

export const config = {
    matcher: [
        // Match all pathnames except for
        // - … if they start with `/api`, `/_next` or `/_vercel`
        // - … the ones containing a dot (e.g. `favicon.ico`)
        '/((?!api|_next|_vercel|.*\\..*).*)',
        // However, match all pathnames within `/users`, optionally with a locale prefix
        '/([\\w-]+)?/users/(.+)'
    ]
};
