'use client';

import React, { useState } from 'react';
import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/atoms/dialog';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Checkbox } from '@/components/atoms/checkbox';
import { IconPlus } from '@tabler/icons-react';
import { useCreatePage } from '@/lib/hooks/page/page.hook';
import useGeneralStore from '@/lib/store/generalStore';

function AddPageDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    published: false,
  });

  const createPageMutation = useCreatePage();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    // Auto-generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setFormData({
      ...formData,
      title,
      slug,
    });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/^-+|-+$/g, '');

    setFormData({
      ...formData,
      slug,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      return;
    }

    if (!formData.slug.trim()) {
      return;
    }

    useGeneralStore.setState({ generalIsLoading: true });

    try {
      await createPageMutation.mutateAsync({
        title: formData.title,
        slug: formData.slug,
        published: formData.published,
        pageData: {}, // Empty page data initially
      });

      // Reset form and close dialog
      setFormData({
        title: '',
        slug: '',
        published: false,
      });
      setOpen(false);
    } catch (error) {
      console.error('Error creating page:', error);
    } finally {
      useGeneralStore.setState({ generalIsLoading: false });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <IconPlus className="w-4 h-4" />
          Add New Page
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Page</DialogTitle>
            <DialogDescription>
              Add a new page to your organization. The slug will be
              auto-generated from the title.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Page Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Enter page title"
                value={formData.title}
                onChange={handleTitleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">
                Slug <span className="text-destructive">*</span>
              </Label>
              <Input
                id="slug"
                placeholder="page-slug"
                value={formData.slug}
                onChange={handleSlugChange}
                required
              />
              <p className="text-xs opacity-70">
                URL: /{formData.slug || 'page-slug'}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="published"
                checked={formData.published}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    published: checked as boolean,
                  })
                }
              />
              <Label
                htmlFor="published"
                className="text-sm font-normal cursor-pointer"
              >
                Publish page immediately
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.title.trim() || !formData.slug.trim()}
            >
              Create Page
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddPageDialog;
