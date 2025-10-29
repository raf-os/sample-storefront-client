import type { StandardJsonResponse } from "@/types/StandardJsonResponse";

import { createFileRoute } from '@tanstack/react-router';
import { useTransition, useState, useContext } from "react";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";

import { AuthContext } from "@/authContext";
import { useDelayedNavigate } from "@/hooks";

import PageSetup from "@/components/layout/PageSetup";
import Card from "@/components/card";
import { FieldSet, Input } from "@/components/forms";
import Button from "@/components/button";

const SignUpSchema = z.object({
	username: z
		.string()
		.min(3, "Username must be at least 3 characters long.")
		.max(30, "Username must be at most 30 characters long."),
	password: z
		.string()
		.min(4, "Password must be at least 4 characters long.")
		.max(40, "Username must be at most 40 characters long."),
	email: z
		.email("Invalid e-mail."),
});

export const Route = createFileRoute('/sign-up')({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<PageSetup
			mainContent={MainComponent}
		/>
	)
}

function MainComponent() {
	const [ isPending, startTransition ] = useTransition();
	const [ fetchResult, setFetchResult ] = useState<StandardJsonResponse | null>(null);
	const delayedNavigate = useDelayedNavigate();

	const { register } = useContext(AuthContext);

	const formMethods = useForm<z.infer<typeof SignUpSchema>>({
		resolver: zodResolver(SignUpSchema)
	});

	const { handleSubmit } = formMethods;

	const onSubmit = (data: z.infer<typeof SignUpSchema>) => {
		startTransition(async () => {
			const response = await register(data.username, data.password, data.email);

			if (response.success) {
				setFetchResult({
					success: true,
				});
				delayedNavigate(4000, { to: "/" });
			} else {
				setFetchResult({
					success: false,
					message: response.message || "Unknown error occurred."
				});
			}
		});
	}

	const onInvalidSubmit = () => {
		setFetchResult(null);
	}

	return (
		<FormProvider {...formMethods}>
			<div className="flex flex-col items-center">
				<Card.Root
					className="w-full md:w-[520px]"
				>
					{ fetchResult?.success === true ? (
						<>
							<Card.Header>
								Successfully registered!
							</Card.Header>

							<Card.Body>
								<p>You may now log in.</p>
								<p>You're automatically being redirected to the main page...</p>
							</Card.Body>
						</>
					) : (
						<>
						<Card.Header className="text-lg">
							Sign up for a new account
						</Card.Header>

						<form onSubmit={handleSubmit(onSubmit, onInvalidSubmit)}>
						<Card.Body>
							{ (fetchResult && fetchResult.success === false) && (
								<p className="text-red-500 text-sm">
									{ fetchResult.message }
								</p>
							) }
							<FieldSet
								label="User name"
								name="username"
								as={Input}
								disabled={isPending}
							/>

							<FieldSet
								label="Email"
								name="email"
								as={Input}
								type="email"
								disabled={isPending}
							/>

							<FieldSet
								label="Password"
								name="password"
								as={Input}
								type="password"
								disabled={isPending}
							/>

							<Button
								type="submit"
								disabled={isPending}
							>
								Sign up
							</Button>
						</Card.Body>
						</form>
						</>
					)}
				</Card.Root>
			</div>
		</FormProvider>
	)
}