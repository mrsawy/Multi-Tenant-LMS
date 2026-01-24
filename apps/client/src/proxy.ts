import { type NextRequest, NextResponse } from 'next/server';
import createI18nMiddleware from 'next-intl/middleware';
import { PUBLIC_PREFIX_ROUTES, PUBLIC_ROUTES } from "@/lib/route.config"
import { redirect } from 'next/navigation';
import { IUser } from './lib/types/user/user.interface';
import { AUTH_COOKIE_NAME } from './lib/data/constants';

const i18nMiddleware = createI18nMiddleware({
    locales: ['ar', 'en'],
    defaultLocale: 'ar',
    localeDetection: false,
    localePrefix: 'always'
});


function isPublicRoute(pathname: string): boolean {
    if (PUBLIC_ROUTES.includes(pathname) || PUBLIC_ROUTES.includes(`/${pathname}`)) {
        return true
    } else if (PUBLIC_PREFIX_ROUTES.some((prefix) => pathname.startsWith(prefix))) {
        return true
    }
    return false
}

export default async function proxy(request: NextRequest & { user?: IUser }) {
    try {


        const { pathname, origin } = request.nextUrl;
        const pathWithoutLocale = pathname.replace(/^\/(ar|en)/, '');

        if (isPublicRoute(pathWithoutLocale)) {
            console.log("isPublicRoute(pathWithoutLocale)", { pathWithoutLocale })
            const response = i18nMiddleware(request);
            // Set pathname header for use in server actions
            response.headers.set('x-pathname', pathname);
            return response;
        }

        const i18nResponse = i18nMiddleware(request);
        // Set pathname header for use in server actions
        i18nResponse.headers.set('x-pathname', pathname);

        if (request.cookies.has(AUTH_COOKIE_NAME)) {

            const apiUrl = new URL("/api/user", request.url);
            const response = await fetch(apiUrl, {
                headers: {
                    cookie: `${AUTH_COOKIE_NAME}=${request.cookies.get(AUTH_COOKIE_NAME)?.value}`,
                },
            });

            if (response.ok) {
                const contentType = response.headers.get("content-type") || "";
                if (contentType.includes("application/json")) {
                    request.user = (await response.json()) as IUser;
                } else {
                    console.error("Expected JSON but got:", await response.text());
                    return NextResponse.redirect(new URL("/login", request.url));
                }
                return i18nResponse;
            } else {
                const response = NextResponse.redirect(new URL('/login', request.url));
                response.cookies.delete(AUTH_COOKIE_NAME);
                return response;
            }
        }

        return NextResponse.redirect(new URL('/login', request.url))
    } catch (error) {
        console.error("error from middleware:", error)
        return NextResponse.redirect(new URL('/login', request.url))
    }
}

    export const config = {
        matcher: [
            '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_vercel).*)',

        ]
    };

// export default {
//   matcher: [
//     // Match all pathnames except for
//     // - … if they start with `/api`, `/_next` or `/_vercel`
//     // - … the ones containing a dot (e.g. `favicon.ico`)
//     '/((?!api|_next|_vercel|.*\\..*).*)',
//     // However, match all pathnames within `/users`, optionally with a locale prefix
//     '/([\\w-]+)?/users/(.+)'
//   ]
// };