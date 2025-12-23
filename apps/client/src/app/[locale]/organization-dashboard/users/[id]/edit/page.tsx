import React from 'react';

import { getAuthUser } from '@/lib/actions/user/user.action';
import UserDataTable from '../../__components/user-data-table';
import CreateUserForm from '../../__components/create-user-form';
import { createAuthorizedNatsRequest } from '@/lib/utils/createNatsRequest';

const EditUserPage: React.FC<{ params: Promise<{ id: string }> }> = async ({ params }) => {
  const { id } = await params;
  console.log({ id });
  const user = await createAuthorizedNatsRequest('users.getSingleUserByOrganization', { filters: { _id: id } });
  console.log({ user });
  return (
    <div>
      <CreateUserForm initialUser={user} mode="edit" />
    </div>
  );
};

export default EditUserPage;
