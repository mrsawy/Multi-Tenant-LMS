import { config } from '@/app/[locale]/organization-dashboard/my-pages/__components/puck-editor';
import {
  createAuthorizedNatsRequest,
  createNatsRequest,
} from '@/lib/utils/createNatsRequest';
import { Render } from '@measured/puck';
import React from 'react';
import ClientRenderer from './__components/clientRenderer';

const CustomPage: React.FC<{
  params: Promise<{ organizationSlug: string; pageSlug: string }>;
}> = async ({ params }) => {
  const { organizationSlug, pageSlug } = await params;
  console.log({ organizationSlug, pageSlug });

  const organization = await createNatsRequest('organization.findOne', {
    slug: organizationSlug,
  });
  const page = await createNatsRequest('pages.findOnePage', {
    organizationId: organization._id,
    slug: pageSlug,
    published: true
  });


  return (
    <div>
        <ClientRenderer page={page} />
    </div>
  );
};

export default CustomPage;
