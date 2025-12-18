import { useTransition, useContext, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { AuthContext } from "@/authContext";
import * as Popover from "@radix-ui/react-popover";
import * as z from "zod";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Link } from "@tanstack/react-router";

import Button from "@/components/button";
import { Input } from "@/components/forms";

import NavbarUserControls from "./NavbarUserControls";

const LoginRequestSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long.").max(30, "Username is too long!"),
    password: z.string().min(4, "Password must be at least 4 characters long.").max(40, "Password is too long!")
});

export default function NavbarAuth() {
    const { checkIsAuthorized } = useAuth();
    const isLoggedIn = checkIsAuthorized();

    return (
        <div className="flex items-center gap-2 relative">
            { isLoggedIn ? (
                <NavbarUserControls />
            ) : (
                <>
                <LoginComponent />

                <Link to="/sign-up"><Button className="btn-primary">
                    Sign up
                </Button></Link>
                </>
            ) }
        </div>
    )
}

function LoginComponent() {
    const { login } = useContext(AuthContext);
    const [ isPending, startTransition ] = useTransition();
    const [ formMessage, setFormMessage ] = useState<string | undefined | null>(null);
    const [ isOpen, setIsOpen ] = useState<boolean>();

    const formMethods = useForm<z.infer<typeof LoginRequestSchema>>({
        resolver: zodResolver(LoginRequestSchema),
    });

    const {
        handleSubmit,
        formState: { errors }
    } = formMethods;

    const onSubmit = (data: z.infer<typeof LoginRequestSchema>) => {
        startTransition(async () => {
            const response = await login(data.username, data.password);

            if (response.success) {
                setIsOpen(false);
            } else {
                setFormMessage(response.message);
            }
        });
    };

    return (
        <Popover.Root
            open={isOpen}
            onOpenChange={setIsOpen}
        >
            <Popover.Trigger asChild>
                <Button className="btn-ghost">
                    Log In
                </Button>
            </Popover.Trigger>

            <Popover.Portal>
                <Popover.Content
                    className="z-10 bg-base-200 px-4 py-4 rounded-box shadow-md data-[state=open]:animate-slideUpAndFade"
                    sideOffset={6}
                >
                    <FormProvider {...formMethods}><form onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-4">
                            { formMessage && (
                                <p className="text-red-500 text-sm">
                                    {formMessage}
                                </p>
                            )}
                            <FieldSet
                                label="User name"
                                name="username"
                                as={Input}
                                disabled={isPending}
                            >
                            </FieldSet>

                            <FieldSet
                                label="Password"
                                name="password"
                                as={Input}
                                type="password"
                                disabled={isPending}
                            >
                            </FieldSet>

                            <Button
                                type="submit"
                                disabled={isPending}
                            >
                                Log In
                            </Button>
                        </div>
                    </form></FormProvider>
                    <Popover.Arrow className="fill-base-200" />
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    )
}

type FieldSetProps<T extends React.ElementType = "input"> = Omit<React.ComponentPropsWithRef<T>, "name"> & {
    name: string,
    label: string,
    as?: T
}

function FieldSet<T extends React.ElementType = "input">({
    children,
    name,
    as,
    label,
    ...rest
}: FieldSetProps<T>) {
    const { register, formState: { errors } } = useFormContext();
    const Component = as || "input";

    return (
        <fieldset
            className="flex flex-col gap-2"
        >
            <label className="font-bold text-sm">
                { label }
            </label>
            { errors[name] && (
                <p className="text-red-500 text-sm">
                    { String(errors[name].message) }
                </p>
            ) }
            <Component
                {...register(name)}
                {...rest}
            />
            { children }
        </fieldset>
    )
}