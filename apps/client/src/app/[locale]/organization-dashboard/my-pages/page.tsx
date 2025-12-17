import React from 'react';
import PuckEditor from './__components/puck-editor';
import PageDataTable from './__components/pages-data-table';
import { getAuthUser } from '@/lib/actions/user/user.action';

const HomePage: React.FC = async () => {
  const user = await getAuthUser();
  const organization = user?.organization
  if(!organization){
    throw new Error("Organization is not defined")
  }
  return (
    <div>
      <PageDataTable organization={organization} />
    </div>
  );
};

export default HomePage;
