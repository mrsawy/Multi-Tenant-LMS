import React from 'react';
import PuckEditor from '../../__components/puck-editor';
import {
  createAuthorizedNatsRequest,
  createNatsRequest,
} from '@/lib/utils/createNatsRequest';
import { IPage } from '@/lib/types/page/page.interface';

const SinglePage: React.FC<{ params: Promise<{ slug: string }> }> = async ({
  params,
}) => {
  const { slug } = await params;
  console.log({ slug });

  const page = (await createNatsRequest('pages.findOnePage', {
    slug,
  })) as IPage;
  
  return (
    <div>
      <PuckEditor initialData={page.pageData} />
    </div>
  );
};

export default SinglePage;
