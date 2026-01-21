import * as Yup from 'yup';
import { InferType } from "yup"
import { UserMainRoles } from '../data/userRole.enum';
import { Country } from '../data/country.enum';


export const signupSchema = Yup.object().shape({
    firstName: Yup.string()
        .required('validation.firstNameRequired')
        .min(3, 'validation.firstNameMin'),
    lastName: Yup.string()
        .required('validation.lastNameRequired')
        .min(3, 'validation.lastNameMin'),

    email: Yup.string()
        .email('validation.emailInvalid')
        .required('validation.emailRequired'),


    username: Yup.string()
        .required('validation.usernameRequired')
        .min(3, 'validation.usernameMin')
        .max(20, 'validation.usernameMax')
        .matches(/^[a-zA-Z0-9_]+$/, 'validation.usernameMatches')
        .test('no-spaces', 'validation.usernameNoSpaces', value => !value?.includes(' '))
        .test('starts-with-letter', 'validation.usernameStartsWithLetter', value => /^[a-zA-Z]/.test(value || '')),

    phoneNumber: Yup.string()
        .required('validation.phoneRequired')
        .matches(/^\+?[0-9]\d{1,14}$/, 'validation.phoneInvalid'),

    country: Yup.string()
        .oneOf(Object.values(Country), 'validation.countryInvalid')
        .required('validation.countryRequired'),

    password: Yup.string()
        .min(6, 'validation.passwordMin')
        .required('validation.passwordRequired'),

    // confirmPassword: Yup.string()
    //     .oneOf([Yup.ref('password')], 'Passwords must match')
    //     .required('Please confirm your password'),

    roleName: Yup.string()
        .oneOf(Object.values(UserMainRoles), 'validation.roleInvalid')
        .required('validation.roleRequired'),

    organizationName: Yup.string()
        .when('role', {
            is: UserMainRoles.ORGANIZATION,
            then: (schema) => schema.required('validation.orgNameRequired'),
            otherwise: (schema) => schema.optional(),
        }),
    organizationSlug: Yup.string()
        .when('role', {
            is: UserMainRoles.ORGANIZATION,
            then: (schema) => schema
                .required('validation.orgSlugRequired')
                .min(3, 'validation.orgSlugMin')
                .max(20, 'validation.orgSlugMax')
                .matches(/^[a-zA-Z0-9_]+$/, 'validation.orgSlugMatches')
                .test('no-spaces', 'validation.orgSlugNoSpaces', value => !value?.includes(' '))
                .test('starts-with-letter', 'validation.orgSlugStartsWithLetter', value => /^[a-zA-Z]/.test(value || '')),
            otherwise: (schema) => schema.optional(),
        }),
});

export const loginSchema = Yup.object().shape({
    identifier: Yup.string().required('validation.identifierRequired'),
    password: Yup.string()
        .required('validation.passwordRequired'),
});


export type LoginSchema = InferType<typeof loginSchema>;
export type SignupSchema = InferType<typeof signupSchema>;
