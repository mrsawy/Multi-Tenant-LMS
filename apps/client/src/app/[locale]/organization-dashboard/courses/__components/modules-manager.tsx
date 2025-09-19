"use client";

import { useState, useEffect } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/atoms/dialog";
import {
    // reorderCourseModules,
    createCourseModule,
    reorderCourseModules,
    //  CourseModuleDto 
} from "@/lib/actions/courses/modules.action";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { useForm, useFieldArray } from "react-hook-form";
import { createModuleSchema, CreateModuleSchema } from "@/lib/schema/module.schema";
import { yupResolver } from "@hookform/resolvers/yup";
import { Plus, X } from "lucide-react";
import CreateModuleForm from "../../../__components/create-module-form";
import { SortableItem } from "./sortable-item";
// import { SortableItem } from "./sortable-item";

export default function ModulesManager({ courseId, initialModules }: { courseId: string; initialModules: any[] }) {

    const [open, setOpen] = useState(false);
    console.log({ initialModules })

    const [modules, setModules] = useState(initialModules)

    // Update local state when initialModules prop changes (after revalidation)
    useEffect(() => {
        setModules(initialModules);
    }, [initialModules]);

    async function onDragEnd(event: any) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = modules.findIndex((m) => m._id === active.id);
        const newIndex = modules.findIndex((m) => m._id === over.id);
        const newOrderList = arrayMove(modules, oldIndex, newIndex);
        setModules(newOrderList);
        try {
            await reorderCourseModules(courseId, newOrderList.map((m) => m._id));
        } catch {
            setModules(modules);
        }
    }



    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">Modules</h2>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant="default">Add module</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create module</DialogTitle>
                        </DialogHeader>
                        <CreateModuleForm setOpen={setOpen} courseId={courseId} />
                    </DialogContent>
                </Dialog>
            </div>

            <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={modules.map((m) => m._id)} strategy={verticalListSortingStrategy}>
                    <ul className="space-y-2">
                        {modules.map((m) => (
                            <SortableItem key={m._id} id={m._id}>
                                <li className="border rounded-md p-3">
                                    <div className="font-medium">{m.title}</div>
                                    {m.description && <div className="text-sm">{m.description}</div>}
                                </li>
                            </SortableItem>
                        ))}
                    </ul>
                </SortableContext>
            </DndContext>
        </div>
    );
}


