import { IUser } from "../user/user.interface";



export interface IWallet {
    _id: string;
    userId: string;
    organizationId?: string;
    balance: number;
    currency: string;
    isActive: boolean;
    isFrozen: boolean;
    lastTransactionDate: Date |string;
    metadata?: Record<string, any>;
    transactionsHistoryIds: string[];

    // Virtuals
    user?: IUser;
    // organization?: IOrganization;
    // transactionsHistory?: ITransaction[];

    createdAt?: Date;
    updatedAt?: Date;
}

