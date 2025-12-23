import React from 'react';
import UserDataTable from './__components/user-data-table';
import { getAuthUser } from '@/lib/actions/user/user.action';

const UsersPage: React.FC = async () => {
    
    return (
        <div>
            <UserDataTable />
        </div>
    );
};

export default UsersPage;