'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { DataTable } from '@/components/molecules/data-table';
import { IPage } from '@/lib/types/page/page.interface';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/atoms/button';
import {
  IconDotsVertical,
  IconSearch,
  IconExternalLink,
  IconEdit,
} from '@tabler/icons-react';
import { Input } from '@/components/atoms/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/atoms/dropdown-menu';
import { Badge } from '@/components/atoms/badge';
import AddPageDialog from './add-page-dialog';
import {
  pageKeys,
  useDeletePage,
  usePagesByOrganization,
  useTogglePageStatus,
} from '@/lib/hooks/page/page.hook';
import useGeneralStore from '@/lib/store/generalStore';
import { Organization } from '@/lib/types/organization/organization.interface';
import { useRouter } from '@/i18n/navigation';

function PageDataTable({ organization }: { organization: Organization }) {
  const router = useRouter();
  const { data: pages } = usePagesByOrganization();
  const toggleStatusMutation = useTogglePageStatus();
  const deletePageMutation = useDeletePage();

  const [pageList, setPageList] = useState<IPage[]>(pages?.docs || []);
  const [globalFilter, setGlobalFilter] = useState<string>('');

  React.useEffect(() => {
    setPageList(pages?.docs || []);
    console.log({ pages });
  }, [pages]);

  const deleteSelected = useCallback((ids: string[]) => {
    // Handle deletion logic here
  }, []);

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const togglePublishedStatus = async (
    slug: string,
    currentStatus: boolean,
  ) => {
    try {
      useGeneralStore.setState({ generalIsLoading: true });
      await toggleStatusMutation.mutateAsync({
        slug,
        published: !currentStatus,
      });
    } catch (error: any) {
      console.log(error);
    } finally {
      useGeneralStore.setState({ generalIsLoading: false });
    }
  };

  const handleEditPage = (slug: string) => {
    // Navigate to page editor
    router.push(`/organization-dashboard/my-pages/${slug}/edit`);
  };

  const handleViewPage = (slug: string) => {
    // Open page in new tab
    window.open(`/x/${organization.slug}/${slug}`, '_blank');
  };

  const columns: ColumnDef<IPage>[] = useMemo(
    () => [
      {
        accessorKey: 'title',
        header: 'Page Title',
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-3 ms-3">
              <div>
                <h3 className="font-medium">{row.original.title}</h3>
                <p className="text-sm opacity-70">/{row.original.slug}</p>
              </div>
            </div>
          );
        },
        enableHiding: false,
      },
      {
        accessorKey: 'slug',
        header: 'Slug',
        cell: ({ row }) => {
          return (
            <code className="text-sm bg-muted px-2 py-1 rounded">
              {row.original.slug}
            </code>
          );
        },
      },
      {
        accessorKey: 'published',
        header: 'Status',
        cell: ({ row }) => {
          return (
            <Badge variant={row.original.published ? 'default' : 'secondary'}>
              {row.original.published ? 'Published' : 'Draft'}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Created At',
        cell: ({ row }) => {
          return (
            <span className="text-sm">
              {formatDate(row.original.createdAt)}
            </span>
          );
        },
      },
      {
        accessorKey: 'updatedAt',
        header: 'Last Updated',
        cell: ({ row }) => {
          return (
            <span className="text-sm">
              {formatDate(row.original.updatedAt)}
            </span>
          );
        },
      },
      {
        id: 'actions',
        accessorKey: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleViewPage(row.original.slug)}
              title="View page"
            >
              <IconExternalLink className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEditPage(row.original.slug)}
              title="Edit page"
            >
              <IconEdit className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="data-[state=open]:bg-muted flex size-8"
                  size="icon"
                >
                  <IconDotsVertical className="w-4 h-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => handleEditPage(row.original.slug)}
                >
                  <IconEdit className="w-4 h-4 mr-2" />
                  Edit Page
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => handleViewPage(row.original.slug)}
                >
                  <IconExternalLink className="w-4 h-4 mr-2" />
                  View Page
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() =>
                    togglePublishedStatus(
                      row.original.slug,
                      row.original.published,
                    )
                  }
                >
                  {row.original.published ? 'Unpublish' : 'Publish'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  variant="destructive"
                  onClick={() => {
                    deletePageMutation.mutate(row.original._id);
                  }}
                >
                  Delete Page
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center p-5">
        <div>
          <h2 className="text-xl font-medium">Pages</h2>
          <p className="text-sm opacity-70 mt-1">
            Manage your organization's custom pages
          </p>
        </div>
        <div className="flex gap-2">
          <AddPageDialog />
        </div>
      </div>

      <div className="flex items-center space-x-2 p-5">
        <div className="relative flex-1 max-w-sm ms-auto">
          <IconSearch className="absolute left-2 top-2.5 h-4 w-4 opacity-50" />
          <Input
            placeholder="Search pages..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <DataTable<IPage>
        data={pageList}
        columns={columns}
        getRowId={(row) => row.slug}
        onDeleteSelected={deleteSelected}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        onChangeData={setPageList}
      />
    </div>
  );
}

export default PageDataTable;
