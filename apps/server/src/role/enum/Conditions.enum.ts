export enum Conditions {
    OWN = "OWN", // Condition to check if the user owns the resource
    ALL = "ALL", // Condition to check if the user can access all resources of this type
    OWN_ORG = "OWN_ORG", // Condition to check if the user is part of the organization that owns the resource
    SELF = "SELF"
}