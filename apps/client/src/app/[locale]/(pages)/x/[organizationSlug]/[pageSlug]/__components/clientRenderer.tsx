'use client';
import { config } from '@/app/[locale]/organization-dashboard/my-pages/__components/puck-editor';
import { IPage } from '@/lib/types/page/page.interface';
import { Config, Render } from '@measured/puck';
import React from 'react';

const ClientRenderer: React.FC<{ page: IPage }> = ({ page }) => {
  return (
    <div>
      <Render config={config} data={page.pageData} />
    </div>
  );
};

export default ClientRenderer;
