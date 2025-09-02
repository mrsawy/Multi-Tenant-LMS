"use client"
import { Card, CardContent } from "@/components/atoms/card"
import { cn } from "@/lib/utils"
import { Button } from "@/components/atoms/button"
import { Input } from "@/components/atoms/input"
import { useForm } from 'react-hook-form'
import { Label } from "@/components/atoms/label"
import { loginSchema, LoginSchema, signupSchema, SignupSchema } from "@/lib/schema/authSchema";
import { yupResolver } from '@hookform/resolvers/yup'
// import { handleLogin } from "@/actions/auth/auth.action";
import { PhoneInput } from "./phone-input"
import { Combobox } from "../molecules/combobox"
import { Currency } from "@/lib/data/currency.enum"
import { Country } from "@/lib/data/country.enum"
import { ToastContainer, toast } from 'react-toastify';
import { UserMainRoles } from "@/lib/data/userRole.enum"
import Image from "next/image"
import { handleLogin, handleSignup } from "@/lib/actions/auth/auth.action"
import Spinner from "./spinner"
import useGeneralStore from "@/lib/store/generalStore"
import { Link } from "@/i18n/navigation"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {

  const {
    register,
    handleSubmit,
    setError,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: 'onSubmit',
  });


  const onSubmit = async (data: LoginSchema) => {
    try {
      useGeneralStore.setState({ generalIsLoading: true })
      const response = await handleLogin(data);
      // if (!!response?.err) {
      // }
    } catch {
      setError('root', { message: 'Something went wrong.' });
      toast.error('Something went wrong.')
    } finally {
      useGeneralStore.setState({ generalIsLoading: false })
    }
  };


  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid  md:grid-cols-2 p-5 gap-6 ">

          <form
            onSubmit={handleSubmit((data) => onSubmit(data))}
            className={cn("flex flex-col gap-8 my-2 md:p-16", className)} {...props}
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-2xl font-bold">Login to your account</h1>
              <p className="text-muted-foreground text-sm text-balance">
                Login Now
              </p>
            </div>



            <div className="flex flex-col gap-2">
              <Label className="text-sm lg:text-medium" htmlFor="identifier">Email , username or phone number</Label>
              <Input placeholder="your identifier..." className="placeholder:text-sm lg:placeholder:text-medium text-sm lg:text-medium" {...register("identifier")} />
              {(errors.identifier) ? (
                <p className="text-left text-sm text-red-400">
                  {errors.identifier?.message}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex flex-col items-start">
                <Label className="text-sm lg:text-medium" htmlFor="password">Password</Label>
              </div>
              <Input type="password" className="placeholder:text-sm lg:placeholder:text-medium text-sm lg:text-medium" {...register("password")} />
              {(errors.password) ? (
                <p className="text-left text-sm text-red-400">
                  {errors.password?.message}
                </p>
              ) : null}
            </div>


            <Button type="submit" className="w-full">
              Login
            </Button>
            {(errors.root) ? (
              <p className="text-left text-sm text-red-400 m-auto">
                {errors.root?.message}
              </p>
            ) : null}
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="underline underline-offset-4  hover:text-blue-800 transition-all">
                Sign up
              </Link>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block rounded-2xl">
            <Image src="/images/4.png" alt="auth" fill className=" object-cover rounded-2xl" />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking login, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
