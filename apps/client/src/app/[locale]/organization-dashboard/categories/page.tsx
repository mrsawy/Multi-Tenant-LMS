import React from 'react';
import CategoriesDataTable from './__components/category-data-table';
import { getAuthUser } from '@/lib/actions/user/user.action';
import { Button } from '@/components/atoms/button';
import { Link } from '@/i18n/navigation';
import { IconPlus } from '@tabler/icons-react';

const CategoriesPage: React.FC = async () => {
    const user = await getAuthUser()
    return (
        <div>
            {/* <div>
                <h1>Categories</h1>
                <div className='flex flex-row'>
                    <Link href="/category/create" className='ms-auto'>
                        <Button><IconPlus /> Add New</Button>
                    </Link>
                </div>
            </div> */}
            <CategoriesDataTable organizationId={user?.organizationId as string} />
        </div>
    );
};

export default CategoriesPage;