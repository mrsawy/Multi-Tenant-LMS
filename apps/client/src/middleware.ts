import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
    // A list of all locales that are supported
    locales: ['ar', 'en'],

    // Used when no locale matches
    defaultLocale: 'ar',

    // Disable locale detection for static sites
    localeDetection: false,
    
    localePrefix: 'always'

});

export const config = {
    // Match only internationalized pathnames
    matcher: ['/', '/(ar|en)/:path*']
};