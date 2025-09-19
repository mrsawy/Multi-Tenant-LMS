import React from 'react';
import UserDataTable from './__components/user-data-table';
import { getAuthUser } from '@/lib/actions/user/user.action';

const UsersPage: React.FC = async () => {
    const user = await getAuthUser()

    return (
        <div>
            <UserDataTable organizationId={user?.organizationId} />

        </div>
    );
};

export default UsersPage;