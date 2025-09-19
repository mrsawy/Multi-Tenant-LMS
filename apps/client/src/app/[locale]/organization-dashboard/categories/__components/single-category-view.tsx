"use client"

import React, { useState } from 'react';
import { Plus, ChevronRight, ChevronDown, Edit, Trash2, ArrowLeft, FolderOpen, Folder, Save, X } from 'lucide-react';
import { useSingleCategory } from '@/lib/hooks/category/use-category.hook';
import { ICategory } from '@/lib/types/category/ICategory';
import { Link } from '@/i18n/navigation';








// Component for rendering expandable category items



const CategoryItem = ({ category, level = 0, onDelete, onAddChild }: any) => {





    const [isExpanded, setIsExpanded] = useState(false);
    const [isAddingChild, setIsAddingChild] = useState(false);
    const [newChildForm, setNewChildForm] = useState({
        name: '',
        description: ''
    });

    const hasChildren = category.childrenCount > 0;
    const paddingLeft = level * 20;

    const handleToggleExpand = () => {
        if (hasChildren) {
            setIsExpanded(!isExpanded);
        }
    };

    const handleAddChild = async () => {
        if (!newChildForm.name.trim()) return;

        try {
            // Replace with your actual API call
            const newChild = {
                _id: Date.now().toString(),
                name: newChildForm.name,
                description: newChildForm.description,
                childrenCount: 0,
                children: []
            };

            onAddChild(category._id, newChild);
            setNewChildForm({ name: '', description: '' });
            setIsAddingChild(false);
            setIsExpanded(true); // Expand to show the new child
        } catch (error) {
            console.error('Failed to create subcategory:', error);
        }
    };

    return (
        <div>
            <div
                className="p-4   transition-colors group"
                style={{ paddingLeft: `${16 + paddingLeft}px` }}
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-start flex-1">
                        <button
                            onClick={handleToggleExpand}
                            className="flex items-center justify-center w-5 h-5 mt-0.5 mr-2 flex-shrink-0"
                        >
                            {hasChildren ? (
                                isExpanded ? (
                                    <ChevronDown className="w-4 h-4  " />
                                ) : (
                                    <ChevronRight className="w-4 h-4  " />
                                )
                            ) : (
                                <div className="w-4 h-4" /> // Empty space for alignment
                            )}
                        </button>

                        <button
                            onClick={handleToggleExpand}
                            className="flex items-start flex-1 text-left"
                        >
                            <Folder className="w-5 h-5   mr-3 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="font-medium   truncate">
                                    {category.name}
                                </div>
                                {category.description && (
                                    <div className="text-sm   mt-1 line-clamp-2">
                                        {category.description}
                                    </div>
                                )}
                                {category.childrenCount > 0 && (
                                    <div className="text-xs   mt-1">
                                        {category.childrenCount} subcategories
                                    </div>
                                )}
                            </div>
                        </button>
                    </div>

                    <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => setIsAddingChild(true)}
                            className="p-1   ory"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onDelete(category._id)}
                            className="p-1   hover:text-red-600 transition-colors"
                            title="Delete category"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Add Child Form */}
            {isAddingChild && (
                <div
                    className="p-4   border-t  "
                    style={{ paddingLeft: `${32 + paddingLeft}px` }}
                >
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={newChildForm.name}
                            onChange={(e) => setNewChildForm({ ...newChildForm, name: e.target.value })}
                            placeholder="Subcategory name"
                            className="w-full px-3 py-2 text-sm border   rounded-lg focus:ring-2  "
                        />
                        <textarea
                            value={newChildForm.description}
                            onChange={(e) => setNewChildForm({ ...newChildForm, description: e.target.value })}
                            placeholder="Description (optional)"
                            rows={2}
                            className="w-full px-3 py-2 text-sm border   rounded-lg focus:ring-2  "
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleAddChild}
                                disabled={!newChildForm.name.trim()}
                                className="flex-1 px-3 py-2       text-sm rounded-lg transition-colors"
                            >
                                Add
                            </button>
                            <button
                                onClick={() => {
                                    setIsAddingChild(false);
                                    setNewChildForm({ name: '', description: '' });
                                }}
                                className="px-3 py-2  0     text-sm rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Expanded Children */}
            {isExpanded && category.children && category.children.length > 0 && (
                <div className="border-l   ml-4">
                    {category.children.map((child: any) => (
                        <CategoryItem
                            key={child._id}
                            category={child}
                            level={level + 1}
                            onDelete={onDelete}
                            onAddChild={onAddChild}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function CategoryDetailPage({ categoryData }: { categoryData: ICategory }) {

    // const { data: categoryData } = useSingleCategory(categoryId)


    const [category, setCategory] = useState(categoryData);
    const [parentCategory, setParentCategory] = useState(categoryData?.parentCategory);
    const [childCategories, setChildCategories] = useState(categoryData?.childCategories);
    const [isAddingChild, setIsAddingChild] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: category?.name,
        description: category?.description || ''
    });
    const [newChildForm, setNewChildForm] = useState({
        name: '',
        description: ''
    });

    const handleEditCategory = () => {
        setIsEditing(true);
        setEditForm({
            name: category.name,
            description: category.description || ''
        });
    };

    const handleSaveEdit = async () => {
        try {
            // Replace with your actual API call
            console.log('Updating category:', editForm);
            setCategory({ ...category, ...editForm });
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update category:', error);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditForm({
            name: category.name,
            description: category.description || ''
        });
    };

    const handleAddChild = async () => {
        if (!newChildForm.name.trim()) return;

        try {
            // Replace with your actual API call
            const newChild: ICategory = {
                _id: Date.now().toString(),
                name: newChildForm.name,
                description: newChildForm.description,
                // childrenCount: 0,
                // children: []
                childCategories: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            setChildCategories([...childCategories, newChild]);
            setNewChildForm({ name: '', description: '' });
            setIsAddingChild(false);
        } catch (error) {
            console.error('Failed to create subcategory:', error);
        }
    };

    // Recursive function to add child to any level
    const handleAddChildToCategory = (parentId: any, newChild: any) => {
        const addChildRecursive = (categories: any) => {
            return categories.map((cat: any) => {
                if (cat._id === parentId) {
                    return {
                        ...cat,
                        children: [...(cat.children || []), newChild],
                        childrenCount: cat.childrenCount + 1
                    };
                } else if (cat.children && cat.children.length > 0) {
                    return {
                        ...cat,
                        children: addChildRecursive(cat.children)
                    };
                }
                return cat;
            });
        };

        setChildCategories(addChildRecursive(childCategories));
    };

    // Recursive function to delete category at any level
    const handleDeleteChild = async (childId: any) => {
        if (window.confirm('Are you sure you want to delete this category and all its subcategories?')) {
            try {
                const deleteRecursive = (categories: any) => {
                    return categories.filter((cat: any) => {
                        if (cat._id === childId) {
                            return false;
                        }
                        if (cat.children && cat.children.length > 0) {
                            const filteredChildren = deleteRecursive(cat.children);
                            cat.children = filteredChildren;
                            cat.childrenCount = filteredChildren.length;
                        }
                        return true;
                    });
                };

                setChildCategories(deleteRecursive(childCategories));
            } catch (error) {
                console.error('Failed to delete category:', error);
            }
        }
    };

    return (
        <div className="min-h-screen   py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6">
                    <Link className="flex items-center     mb-4 transition-colors" href={"/organization-dashboard/categories/"}>
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Categories
                    </Link>

                    {/* Breadcrumb */}
                    {parentCategory && (
                        <nav className="flex items-center text-sm   mb-4">
                            <button className="  transition-colors">
                                {parentCategory.name}
                            </button>
                            <ChevronRight className="w-4 h-4 mx-2" />
                            <span className="  font-medium">{category.name}</span>
                        </nav>
                    )}
                </div>

                <div className="grid grid-cols-1   gap-8">
                    {/* Main Category Info */}
                    <div className=" ">
                        <div className="  rounded-xl shadow-sm border   overflow-hidden">
                            <div className="px-6 py-4 border-b   flex items-center justify-between">
                                <h1 className="text-2xl font-bold   flex items-center">
                                    <FolderOpen className="w-8 h-8 mr-3 text-blue-600" />
                                    Category Details
                                </h1>
                                <button
                                    onClick={handleEditCategory}
                                    className="flex items-center px-4 py-2 text-sm font-medium      rounded-lg transition-colors"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                </button>
                            </div>

                            <div className="p-6">
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium   mb-2">
                                                Category Name
                                            </label>
                                            <input
                                                type="text"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                className="w-full px-3 py-2 border   rounded-lg focus:ring-2  "
                                                placeholder="Enter category name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium   mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                value={editForm.description}
                                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                rows={4}
                                                className="w-full px-3 py-2 border   rounded-lg focus:ring-2  "
                                                placeholder="Enter category description"
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleSaveEdit}
                                                className="flex items-center px-4 py-2     rounded-lg transition-colors"
                                            >
                                                <Save className="w-4 h-4 mr-2" />
                                                Save Changes
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                className="flex items-center px-4 py-2  0     rounded-lg transition-colors"
                                            >
                                                <X className="w-4 h-4 mr-2" />
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-xl font-semibold   mb-2">
                                                {category.name}
                                            </h2>
                                            <p className="  leading-relaxed">
                                                {category.description || 'No description provided'}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t  ">
                                            <div>
                                                <span className="text-sm font-medium  ">Created</span>
                                                <p className=" ">{new Date(category.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium  ">Last Updated</span>
                                                <p className=" ">{new Date(category.updatedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Parent Category */}
                        {parentCategory && (
                            <div className="  rounded-xl shadow-sm border   p-6">
                                <h3 className="text-lg font-semibold   mb-4">Parent Category</h3>
                                <button className="flex items-center w-full p-3 rounded-lg border       transition-colors text-left">
                                    <Folder className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                                    <div>
                                        <div className="font-medium  ">{parentCategory.name}</div>
                                        <div className="text-sm  ">{parentCategory.description}</div>
                                    </div>
                                    <ChevronRight className="w-4 h-4   ml-auto" />
                                </button>
                            </div>
                        )}

                        {/* Child Categories */}
                        <div className="  rounded-xl shadow-sm border   overflow-hidden">
                            <div className="px-6 py-4 border-b   flex items-center justify-between">
                                <h3 className="text-lg font-semibold  ">
                                    Subcategories ({childCategories.length})
                                </h3>
                                <button
                                    onClick={() => setIsAddingChild(true)}
                                    className="flex items-center px-3 py-2 text-sm font-medium     rounded-lg transition-colors"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add
                                </button>
                            </div>

                            <div className="divide-y  ">
                                {/* Add Child Form */}
                                {isAddingChild && (
                                    <div className="p-4  ">
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                value={newChildForm.name}
                                                onChange={(e) => setNewChildForm({ ...newChildForm, name: e.target.value })}
                                                placeholder="Subcategory name"
                                                className="w-full px-3 py-2 text-sm border   rounded-lg focus:ring-2  "
                                            />
                                            <textarea
                                                value={newChildForm.description}
                                                onChange={(e) => setNewChildForm({ ...newChildForm, description: e.target.value })}
                                                placeholder="Description (optional)"
                                                rows={2}
                                                className="w-full px-3 py-2 text-sm border   rounded-lg focus:ring-2  "
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleAddChild}
                                                    disabled={!newChildForm.name.trim()}
                                                    className="flex-1 px-3 py-2       text-sm rounded-lg transition-colors"
                                                >
                                                    Add
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsAddingChild(false);
                                                        setNewChildForm({ name: '', description: '' });
                                                    }}
                                                    className="px-3 py-2  0     text-sm rounded-lg transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Child Categories List */}
                                {childCategories.length === 0 && !isAddingChild ? (
                                    <div className="p-6 text-center  ">
                                        <Folder className="w-12 h-12 mx-auto   mb-3" />
                                        <p>No subcategories yet</p>
                                        <button
                                            onClick={() => setIsAddingChild(true)}
                                            className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                                        >
                                            Add the first subcategory
                                        </button>
                                    </div>
                                ) : (
                                    childCategories.map((child) => (
                                        <CategoryItem
                                            key={child._id}
                                            category={child}
                                            level={0}
                                            onDelete={handleDeleteChild}
                                            onAddChild={handleAddChildToCategory}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}