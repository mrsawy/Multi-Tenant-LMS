"use client";

import React, { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/components/atoms/input";
import { Button } from "@/components/atoms/button";
import { useCreateCategory } from "@/lib/hooks/category/use-category.hook";
import { Combobox } from "@/components/molecules/combobox";
import { ICategory } from "@/lib/types/category/ICategory";
import { baseCategorySchema, CategoryFormData } from "@/lib/schema/category.schema";

// Enhanced validation schema



interface CreateCategoryFormProps {
  setOpen: (open: boolean) => void;
  organizationId: string;
  parentId?: string | null;
  categories: ICategory[];
}

const CreateCategoryForm: React.FC<CreateCategoryFormProps> = ({
  setOpen,
  organizationId,
  parentId = null,
  categories = []
}) => {
  // Flatten categories helper function
  function flattenCategories(categories: ICategory[]): ICategory[] {
    const result: ICategory[] = [];
    const walk = (category: ICategory) => {
      result.push(category);
      category.childCategories?.forEach(walk);
    };
    categories.forEach(walk);
    return result;
  }

  const flatCategories = useMemo(() => flattenCategories(categories), [categories]);

  // Prepare combobox data with "None" option
  const comboboxData = useMemo(() => {
    const categoryOptions = flatCategories.map(fc => ({
      value: fc._id,
      label: fc.name
    }));

    return [
      { value: "", label: "None (Root Category)" },
      ...categoryOptions
    ];
  }, [flatCategories]);

  const createCategoryMutation = useCreateCategory();

  // Initialize form with React Hook Form and Yup resolver
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty }
  } = useForm({
    resolver: yupResolver(baseCategorySchema),
    defaultValues: {
      name: "",
      description: "",
      parentId: parentId || ""
    },
    mode: "onChange" // Validate on change for better UX
  });

  const onSubmit = (data: CategoryFormData) => {
    const submitData = {
      organizationId,
      name: data.name.trim(),
      ...(data.description && { description: data.description.trim() }),
      parentId: data.parentId || null
    };

    createCategoryMutation.mutate(submitData, {
      onSuccess: () => {
        setOpen(false);
        reset(); // Reset form to initial state
      },
      onError: (error) => {
        // Handle error if needed
        console.error("Failed to create category:", error);
      }
    });
  };

  const handleCancel = () => {
    reset();
    setOpen(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Category Name Field */}
      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium">
          Category Name *
        </label>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="name"
              placeholder="Enter category name"
              className={errors.name ? "border-red-500" : ""}
            />
          )}
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Description Field */}
      <div className="space-y-1">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="description"
              placeholder="Short description (optional)"
              className={errors.description ? "border-red-500" : ""}
            />
          )}
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Parent Category Selection */}
      <div className="space-y-1">
        <label className="text-sm font-medium">
          Parent Category
        </label>
        <Controller
          name="parentId"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Combobox
              data={comboboxData}
              defaultValue={comboboxData.find(item => item.value === value)}
              onValueChange={onChange}
              title="Parent Category"
              placeholder="Choose Parent Category"
              buttonClassName={errors.parentId ? "border-red-500" : ""}
            />
          )}
        />
        {errors.parentId && (
          <p className="text-sm text-red-600">{errors.parentId.message}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={createCategoryMutation.isPending}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={createCategoryMutation.isPending || !isValid}
          className={!isDirty ? "opacity-50" : ""}
        >
          {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
        </Button>
      </div>

      {/* Form Status Display */}
      {createCategoryMutation.isError && (
        <div className="text-sm text-red-600 mt-2">
          Failed to create category. Please try again.
        </div>
      )}
    </form>
  );
};

export default CreateCategoryForm;