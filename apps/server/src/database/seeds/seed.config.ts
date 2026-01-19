import { OrganizationSeedConfig } from './seed-config.interface';
import { ContentType } from '../../course/enum/contentType.enum';
import { Currency } from 'src/payment/enums/currency.enum';
import { BillingCycle } from 'src/utils/enums/billingCycle.enum';

export const ORGANIZATIONS_CONFIG: OrganizationSeedConfig[] = [
    {
        name: 'مدرسة النور الثانوية',
        studentsCount: 15,
        teachersCount: 5,
        adminsCount: 2,
        totalCourses: 3,
        courses: [
            {
                name: 'الرياضيات - الصف الأول الثانوي',
                isPaid: true,
                categories: ['الرياضيات'],
                contentTypes: [ContentType.VIDEO, ContentType.ARTICLE, ContentType.QUIZ, ContentType.ASSIGNMENT],
                pricing: {
                    [BillingCycle.MONTHLY]: {
                        originalPrice: 3000,
                        originalCurrency: Currency.EGP,
                        priceUSD: 100,
                    },
                    [BillingCycle.YEARLY]: {
                        originalPrice: 30000,
                        originalCurrency: Currency.EGP,
                        priceUSD: 1000,
                    },
                    [BillingCycle.ONE_TIME]: {
                        originalPrice: 30000,
                        originalCurrency: Currency.EGP,
                        priceUSD: 1000,
                    },
                },
                reviews: [
                    {
                        rating: 5,
                        comment: 'This course is great!',
                    },
                    {
                        rating: 4,
                        comment: 'This course is good!',
                    },
                    {
                        rating: 3,
                        comment: 'This course is average!',
                    },
                    {
                        rating: 2,
                        comment: 'This course is bad!',
                    },
                    {
                        rating: 1,
                        comment: 'This course is terrible!',
                    },

                ],
                discussions: [
                    {
                        title: 'This course is great!',
                        content: 'This course is great!',
                    },
                ],
            },
            {
                name: 'الفيزياء - الصف الثاني الثانوي',
                isPaid: true,
                categories: ['الفيزياء', 'العلوم الطبيعية'],
                contentTypes: [ContentType.VIDEO, ContentType.ARTICLE, ContentType.PROJECT, ContentType.LIVE_SESSION],
                pricing: {
                    [BillingCycle.MONTHLY]: {
                        originalPrice: 3000,
                        originalCurrency: Currency.EGP,
                        priceUSD: 100,
                    },
                    [BillingCycle.YEARLY]: {
                        originalPrice: 30000,
                        originalCurrency: Currency.EGP,
                        priceUSD: 1000,
                    },
                    [BillingCycle.ONE_TIME]: {
                        originalPrice: 30000,
                        originalCurrency: Currency.EGP,
                        priceUSD: 1000,
                    },
                },
                reviews: [
                    {
                        rating: 5,
                        comment: 'دورة ممتازة! الشرح واضح والمحتوى شامل',
                    },
                    {
                        rating: 4,
                        comment: 'مفيدة جداً، خاصة الجلسات الحية',
                    },
                    {
                        rating: 4,
                        comment: 'المشاريع العملية ساعدتني كثيراً',
                    },
                ],
            },
            {
                name: 'الحاسوب - الصف الثالث الثانوي',
                isPaid: false,
                categories: ['التكنولوجيا', 'الحاسوب'],
                contentTypes: [ContentType.VIDEO, ContentType.ARTICLE, ContentType.QUIZ],
                reviews: [
                    {
                        rating: 5,
                        comment: 'دورة مجانية رائعة! شكراً لكم',

                    },
                    {
                        rating: 4,
                        comment: 'المحتوى جيد والشرح واضح',

                    },
                    {
                        rating: 3,
                        comment: 'مفيدة لكن تحتاج المزيد من الأمثلة',

                    },
                ],
            },
        ],
    },
    {
        name: 'مدرسة الفتح الإعدادية',
        studentsCount: 12,
        teachersCount: 3,
        adminsCount: 1,
        totalCourses: 2,
        courses: [
            {
                name: 'التربية الفنية - الصف الأول الإعدادي',
                isPaid: true,
                categories: ['التربية الفنية', 'الفنون'],
                contentTypes: [ContentType.VIDEO, ContentType.ARTICLE, ContentType.PROJECT, ContentType.ASSIGNMENT],
                pricing: {
                    [BillingCycle.MONTHLY]: {
                        originalPrice: 3000,
                        originalCurrency: Currency.EGP,
                        priceUSD: 100,
                    },
                    [BillingCycle.YEARLY]: {
                        originalPrice: 30000,
                        originalCurrency: Currency.EGP,
                        priceUSD: 1000,
                    },
                    [BillingCycle.ONE_TIME]: {
                        originalPrice: 30000,
                        originalCurrency: Currency.EGP,
                        priceUSD: 1000,
                    },
                },
                reviews: [
                    {
                        rating: 5,
                        comment: 'دورة إبداعية وممتعة!',

                    },
                    {
                        rating: 4,
                        comment: 'المشاريع الفنية رائعة',

                    },
                ],
            },
            {
                name: 'اللغة العربية - الصف الثاني الإعدادي',
                isPaid: false,
                categories: ['اللغة العربية', 'اللغات'],
                contentTypes: [ContentType.ARTICLE, ContentType.QUIZ, ContentType.VIDEO],
                reviews: [
                    {
                        rating: 4,
                        comment: 'دورة جيدة لتحسين اللغة العربية',

                    },
                    {
                        rating: 5,
                        comment: 'المحتوى مفيد والشرح واضح',

                    },
                ],
            }
        ],
    },
    {
        name: 'مدرسة السلام الثانوية',
        studentsCount: 18,
        teachersCount: 8,
        adminsCount: 3,
        totalCourses: 4,
        courses: [
            {
                name: 'الكيمياء - الصف الأول الثانوي', isPaid: true,
                categories: ['الكيمياء', 'العلوم الطبيعية'],
                contentTypes: [ContentType.VIDEO, ContentType.ARTICLE, ContentType.QUIZ, ContentType.LIVE_SESSION],
                pricing: {
                    [BillingCycle.MONTHLY]: {
                        originalPrice: 3000,
                        originalCurrency: Currency.EGP,
                        priceUSD: 100,
                    },
                    [BillingCycle.YEARLY]: {
                        originalPrice: 30000,
                        originalCurrency: Currency.EGP,
                        priceUSD: 1000,
                    },
                    [BillingCycle.ONE_TIME]: {
                        originalPrice: 30000,
                        originalCurrency: Currency.EGP,
                        priceUSD: 1000,
                    },
                },
                reviews: [
                    {
                        rating: 5,
                        comment: 'دورة ممتازة! التجارب المعملية رائعة',

                    },
                    {
                        rating: 4,
                        comment: 'الشرح واضح والجلسات الحية مفيدة',

                    },
                    {
                        rating: 4,
                        comment: 'ساعدتني في فهم الكيمياء بشكل أفضل',

                    },
                ],
            },
            {
                name: 'الأحياء - الصف الثاني الثانوي', isPaid: true,
                categories: ['الأحياء', 'العلوم الطبيعية'],
                contentTypes: [ContentType.VIDEO, ContentType.ARTICLE, ContentType.ASSIGNMENT, ContentType.PROJECT],
                pricing: {
                    [BillingCycle.MONTHLY]: {
                        originalPrice: 3000,
                        originalCurrency: Currency.EGP,
                        priceUSD: 100,
                    },
                    [BillingCycle.YEARLY]: {
                        originalPrice: 30000,
                        originalCurrency: Currency.EGP,
                        priceUSD: 1000,
                    },
                    [BillingCycle.ONE_TIME]: {
                        originalPrice: 30000,
                        originalCurrency: Currency.EGP,
                        priceUSD: 1000,
                    },
                },
                reviews: [
                    {
                        rating: 5,
                        comment: 'دورة شاملة ومفيدة جداً',

                    },
                    {
                        rating: 4,
                        comment: 'المشاريع العملية ممتازة',

                    },
                    {
                        rating: 5,
                        comment: 'أفضل دورة في الأحياء!',

                    },
                ],
            },
            {
                name: 'التاريخ - الصف الثالث الثانوي', isPaid: true,
                categories: ['التاريخ', 'العلوم الإنسانية'],
                contentTypes: [ContentType.VIDEO, ContentType.ARTICLE, ContentType.QUIZ, ContentType.ASSIGNMENT],
                pricing: {
                    [BillingCycle.MONTHLY]: {
                        originalPrice: 3000,
                        originalCurrency: Currency.EGP,
                        priceUSD: 100,
                    },
                    [BillingCycle.YEARLY]: {
                        originalPrice: 30000,
                        originalCurrency: Currency.EGP,
                        priceUSD: 1000,
                    },
                    [BillingCycle.ONE_TIME]: {
                        originalPrice: 30000,
                        originalCurrency: Currency.EGP,
                        priceUSD: 1000,
                    },
                },
                reviews: [
                    {
                        rating: 4,
                        comment: 'دورة جيدة تغطي المواضيع المهمة',

                    },
                    {
                        rating: 4,
                        comment: 'المحتوى منظم والاختبارات مفيدة',

                    },
                    {
                        rating: 3,
                        comment: 'جيدة لكن تحتاج المزيد من التفاصيل',

                    },
                ],
            },
            {
                name: 'الجغرافيا - الصف الأول الثانوي', isPaid: true,
                categories: ['الجغرافيا', 'العلوم الإنسانية'],
                contentTypes: [ContentType.VIDEO, ContentType.ARTICLE, ContentType.PROJECT, ContentType.LIVE_SESSION],
                pricing: {
                    [BillingCycle.MONTHLY]: {
                        originalPrice: 3000,
                        originalCurrency: Currency.EGP,
                        priceUSD: 100,
                    },
                    [BillingCycle.YEARLY]: {
                        originalPrice: 30000,
                        originalCurrency: Currency.EGP,
                        priceUSD: 1000,
                    },
                    [BillingCycle.ONE_TIME]: {
                        originalPrice: 30000,
                        originalCurrency: Currency.EGP,
                        priceUSD: 1000,
                    },
                },
                reviews: [
                    {
                        rating: 5,
                        comment: 'دورة رائعة! الخرائط والصور واضحة',

                    },
                    {
                        rating: 4,
                        comment: 'مفيدة جداً خاصة الجلسات الحية',

                    },
                ],
            },
        ],
    },
    {
        name: 'مدرسة الأمل الثانوية',
        studentsCount: 10,
        teachersCount: 2,
        adminsCount: 1,
        totalCourses: 2,
        courses: [
            {
                name: 'اللغة الإنجليزية - الصف الثاني الثانوي',
                isPaid: true,
                categories: ['اللغة الإنجليزية', 'اللغات'],
                contentTypes: [ContentType.VIDEO, ContentType.ARTICLE, ContentType.QUIZ, ContentType.LIVE_SESSION],
                pricing: {
                    [BillingCycle.MONTHLY]: {
                        originalPrice: 3000,
                        originalCurrency: Currency.EGP,
                        priceUSD: 100,
                    },
                    [BillingCycle.YEARLY]: {
                        originalPrice: 30000,
                        originalCurrency: Currency.EGP,
                        priceUSD: 1000,
                    },
                    [BillingCycle.ONE_TIME]: {
                        originalPrice: 30000,
                        originalCurrency: Currency.EGP,
                        priceUSD: 1000,
                    },
                },
                reviews: [
                    {
                        rating: 5,
                        comment: 'Excellent course! Very helpful for improving English',

                    },
                    {
                        rating: 4,
                        comment: 'Good content and live sessions are interactive',

                    },
                    {
                        rating: 5,
                        comment: 'Best English course I\'ve taken!',

                    },
                ],
            },
            {
                name: 'اللغة الفرنسية - الصف الأول الثانوي',
                isPaid: false,
                categories: ['اللغة الفرنسية', 'اللغات'],
                contentTypes: [ContentType.VIDEO, ContentType.ARTICLE, ContentType.QUIZ],
                reviews: [
                    {
                        rating: 4,
                        comment: 'دورة جيدة لتعلم الفرنسية',

                    },
                    {
                        rating: 5,
                        comment: 'ممتازة! ساعدتني في تحسين لغتي الفرنسية',

                    },
                    {
                        rating: 3,
                        comment: 'جيدة لكن تحتاج المزيد من التمارين',

                    },
                ],
            }
        ],
    },
    {
        name: 'مدرسة المستقبل الإعدادية',
        studentsCount: 14,
        teachersCount: 4,
        adminsCount: 2,
        totalCourses: 3,
        courses: [
            {
                name: 'التربية الرياضية - الصف الثالث الإعدادي',
                isPaid: false,
                categories: ['التربية الرياضية', 'الرياضة'],
                contentTypes: [ContentType.VIDEO, ContentType.ARTICLE, ContentType.LIVE_SESSION],
                reviews: [
                    {
                        rating: 4,
                        comment: 'دورة ممتعة ومفيدة',

                    },
                    {
                        rating: 5,
                        comment: 'الجلسات الحية رائعة!',

                    },
                ],
            },
            {
                name: 'العلوم - الصف الثاني الإعدادي',
                isPaid: true,
                categories: ['العلوم', 'العلوم الطبيعية'],
                contentTypes: [ContentType.VIDEO, ContentType.ARTICLE, ContentType.QUIZ, ContentType.ASSIGNMENT],
                pricing: {
                    [BillingCycle.MONTHLY]: {
                        originalPrice: 3000,
                        originalCurrency: Currency.EGP,
                        priceUSD: 100,
                    },
                    [BillingCycle.YEARLY]: {
                        originalPrice: 30000,
                        originalCurrency: Currency.EGP,
                        priceUSD: 1000,
                    },
                    [BillingCycle.ONE_TIME]: {
                        originalPrice: 30000,
                        originalCurrency: Currency.EGP,
                        priceUSD: 1000,
                    },
                },
                reviews: [
                    {
                        rating: 5,
                        comment: 'دورة ممتازة! التجارب واضحة ومفيدة',

                    },
                    {
                        rating: 4,
                        comment: 'المحتوى جيد والشرح واضح',

                    },
                    {
                        rating: 4,
                        comment: 'ساعدتني في فهم العلوم بشكل أفضل',

                    },
                ],
            },
            {
                name: 'التربية الدينية - الصف الأول الإعدادي',
                isPaid: false,
                categories: ['التربية الدينية', 'الدين'],
                contentTypes: [ContentType.ARTICLE, ContentType.VIDEO, ContentType.QUIZ, ContentType.LIVE_SESSION],
                reviews: [
                    {
                        rating: 5,
                        comment: 'دورة ممتازة ومفيدة جداً',

                    },
                    {
                        rating: 5,
                        comment: 'المحتوى رائع والشرح واضح',

                    },
                    {
                        rating: 4,
                        comment: 'الجلسات الحية مفيدة جداً',

                    },
                ],
            }
        ],
    },
];

export const ORGANIZATIONS_SEED = ORGANIZATIONS_CONFIG.length - 1;
