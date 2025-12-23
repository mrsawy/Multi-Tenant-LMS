import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/atoms/dialog';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/atoms/field';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import { useCourses } from '@/lib/hooks/course/useCourses';
import {
  enrollmentKeys,
  useEnrollmentsByOrganization,
} from '@/lib/hooks/enrollment/enrollments.hook';
import { useUsersByOrganization } from '@/lib/hooks/user/use-user.hook';
import {
  CreateEnrollmentSchema,
  createEnrollmentSchema,
} from '@/lib/schema/enrollment.schema';
import useGeneralStore from '@/lib/store/generalStore';
import { Roles } from '@/lib/types/user/roles.enum';
import { createAuthorizedNatsRequest } from '@/lib/utils/createNatsRequest';
import { yupResolver } from '@hookform/resolvers/yup';
import { IconPlus } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

const AddEnrollmentDialog: React.FC = () => {
  const { data: users = { docs: [] } } = useUsersByOrganization(
    { page: 1, limit: 10 },
    { roleName: Roles.STUDENT },
  );
  const { data: courses = { docs: [] } } = useCourses();

  const form = useForm<CreateEnrollmentSchema>({
    resolver: yupResolver(createEnrollmentSchema),
    defaultValues: {
      user: '',
      course: '',
    },
  });

  const queryClient = useQueryClient();

  const handleSubmit = async (data: CreateEnrollmentSchema) => {
    try {
      useGeneralStore.setState({ generalIsLoading: true });

      await createAuthorizedNatsRequest('enrollment.enrollToCourseByOrg', {
        userId: data.user,
        courseId: data.course,
      });
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
      toast.success('Enrollment Successful');
      form.reset();
    } catch (error: any) {
      console.log(error);
      toast.error(error?.message || 'Something went wrong');
    } finally {
      useGeneralStore.setState({ generalIsLoading: false });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          effect="expandIcon"
          iconPlacement="right"
          icon={IconPlus}
          variant="default"
        >
          Add Enrollment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <DialogHeader className="mb-6">
            <DialogTitle>Add Enrollment</DialogTitle>
            <DialogDescription>
              Enroll Users To Courses Of Your Own
            </DialogDescription>
          </DialogHeader>
          <FieldSet>
            <FieldGroup>
              <Controller
                name="user"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-title">
                      Choose User
                    </FieldLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      name={field.name}
                    >
                      <SelectTrigger
                        id="checkout-7j9-exp-year-f59"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="user name" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.docs.map((user) => {
                          return (
                            <div key={user._id}>
                              <SelectItem key={user._id} value={user._id}>
                                {user.firstName} {user.lastName}
                              </SelectItem>{' '}
                              <SelectSeparator />
                            </div>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="course"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-title">
                      Choose Course
                    </FieldLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      name={field.name}
                    >
                      <SelectTrigger
                        id="Course-7j9-exp-year-f59"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Course name" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.docs.map((course) => {
                          return (
                            <div key={course._id}>
                              <SelectItem value={course._id}>
                                {course.name}
                              </SelectItem>{' '}
                              <SelectSeparator />
                            </div>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>

          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEnrollmentDialog;
