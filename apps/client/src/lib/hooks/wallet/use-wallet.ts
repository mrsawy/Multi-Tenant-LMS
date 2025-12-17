"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { createUser, deleteUserById, getUser, getUsersByOrganization, updateUser } from '@/lib/actions/users/user.action';
import { IUser } from '@/lib/types/user/user.interface';
import { CreateUserFormData, EditUserFormData } from '@/lib/schema/user.schema';
import { toast } from 'react-toastify';
import { useRouter } from "@/i18n/navigation";
import useGeneralStore from '@/lib/store/generalStore';
import { PaginationOptions } from '@/lib/types/Paginated';
import { getUsersByOrganization } from '@/lib/actions/user/getUsersByOrganization.action';
import { createUserAction } from '@/lib/actions/user/user.action';
import { Wallet } from 'lucide-react';
import { createAuthorizedNatsRequest } from '@/lib/utils/createNatsRequest';
import { IWallet } from '@/lib/types/wallet/IWallet';


// Query keys
export const walletKeys = {
    all: ['wallet'] as const,
    wallet: () => [...walletKeys.all, 'walletKeys'] as const,
};


export function useWallet() {
    return useQuery({
        queryKey: walletKeys.wallet(),
        queryFn: async () => {
            // getUser(userId)
            const wallet = await createAuthorizedNatsRequest("wallet.getUserWallet", {});
            return wallet as IWallet
        },
        
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}
