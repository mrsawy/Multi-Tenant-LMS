import { OrganizationSeedConfig } from './seed-config.interface';
import { ContentType } from '../../course/enum/contentType.enum';
import { Currency } from 'src/payment/enums/currency.enum';
import { BillingCycle } from 'src/utils/enums/billingCycle.enum';

export const ORGANIZATIONS_CONFIG: OrganizationSeedConfig[] = [
    {
        name: 'Tech Academy',
        studentsCount: 15,
        teachersCount: 5,
        adminsCount: 2,
        courses: [
            {
                name: 'Introduction to TypeScript',
                isPaid: true,
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
                }
            },
            {
                name: 'Advanced React Patterns',
                isPaid: true,
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
                }
            },
            {
                name: 'Web Security Basics',
                isPaid: false,
                contentTypes: [ContentType.VIDEO, ContentType.ARTICLE, ContentType.QUIZ],
            },
        ],
    },
    {
        name: 'Creative Arts School',
        studentsCount: 12,
        teachersCount: 3,
        adminsCount: 1,
        courses: [
            {
                name: 'Digital Illustration 101',
                isPaid: true,
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
                }
            },
            {
                name: 'Color Theory for Designers',
                isPaid: false,
                contentTypes: [ContentType.ARTICLE, ContentType.QUIZ, ContentType.VIDEO]
            }
        ],
    },
    {
        name: 'Business Leaders Institute',
        studentsCount: 18,
        teachersCount: 8,
        adminsCount: 3,
        courses: [
            {
                name: 'Strategic Management', isPaid: true,
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
                }
            },
            {
                name: 'Marketing Foundations', isPaid: true,
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
                }
            },
            {
                name: 'Financial Accounting', isPaid: true,
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
                }
            },
            {
                name: 'Supply Chain Optimization', isPaid: true,
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
                }
            },
        ],
    },
    {
        name: 'Language Hub',
        studentsCount: 10,
        teachersCount: 2,
        adminsCount: 1,
        courses: [
            {
                name: 'English for Business',
                isPaid: true,
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
                }
            },
            {
                name: 'Spanish Level 1',
                isPaid: false,
                contentTypes: [ContentType.VIDEO, ContentType.ARTICLE, ContentType.QUIZ]
            }
        ],
    },
    {
        name: 'Health & Wellness Center',
        studentsCount: 14,
        teachersCount: 4,
        adminsCount: 2,
        courses: [
            {
                name: 'Yoga for Beginners',
                isPaid: false,
                contentTypes: [ContentType.VIDEO, ContentType.ARTICLE, ContentType.LIVE_SESSION],
            },
            {
                name: 'Nutrition Fundamentals',
                isPaid: true,
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
                }
            },
            {
                name: 'Mental Health Awareness',
                isPaid: false,
                contentTypes: [ContentType.ARTICLE, ContentType.VIDEO, ContentType.QUIZ, ContentType.LIVE_SESSION]
            }
        ],
    },
];

export const ORGANIZATIONS_SEED = ORGANIZATIONS_CONFIG.length - 1;
