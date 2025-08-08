"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/firebase";
import {
	GoogleAuthProvider,
	createUserWithEmailAndPassword,
	fetchSignInMethodsForEmail,
	getRedirectResult,
	signInWithEmailAndPassword,
	signInWithRedirect,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [emailChecked, setEmailChecked] = useState(false);
	const [emailExists, setEmailExists] = useState(false);
	const router = useRouter();

	useEffect(() => {
		getRedirectResult(auth)
			.then(result => {
				if (result) {
					router.push("/dashboard");
				}
				setLoading(false);
			})
			.catch(error => {
				setError(error.message);
				setLoading(false);
			});
	}, [router]);

	const handleEmailSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		try {
			const signInMethods = await fetchSignInMethodsForEmail(auth, email);
			if (signInMethods.length > 0) {
				setEmailExists(true);
			} else {
				setEmailExists(false);
			}
			setEmailChecked(true);
		} catch (error: unknown) {
			if (error instanceof Error) {
				setError(error.message);
			} else {
				setError("An unknown error occurred");
			}
		}
	};

	const handleAuthSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		try {
			if (emailExists) {
				await signInWithEmailAndPassword(auth, email, password);
			} else {
				await createUserWithEmailAndPassword(auth, email, password);
			}
			router.push("/dashboard");
		} catch (error: unknown) {
			if (error instanceof Error) {
				setError(error.message);
			} else {
				setError("An unknown error occurred");
			}
		}
	};

	const handleGoogleSignIn = async () => {
		setError(null);
		const provider = new GoogleAuthProvider();
		await signInWithRedirect(auth, provider);
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
				Loading...
			</div>
		);
	}

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-900">
			<div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
				<h1 className="text-2xl font-bold text-center text-white">
					{emailChecked
						? emailExists
							? "Login"
							: "Sign Up"
						: "Enter your email"}
				</h1>
				<form
					onSubmit={
						emailChecked ? handleAuthSubmit : handleEmailSubmit
					}
					className="space-y-6"
				>
					<div>
						<Label htmlFor="email" className="text-gray-300">
							Email
						</Label>
						<Input
							id="email"
							type="email"
							value={email}
							onChange={e => setEmail(e.target.value)}
							required
							className="bg-gray-700 border-gray-600 text-white"
							disabled={emailChecked}
						/>
					</div>
					{emailChecked && (
						<div>
							<Label htmlFor="password" className="text-gray-300">
								Password
							</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={e => setPassword(e.target.value)}
								required
								className="bg-gray-700 border-gray-600 text-white"
							/>
						</div>
					)}
					<Button
						type="submit"
						className="w-full bg-indigo-600 hover:bg-indigo-700"
					>
						{emailChecked
							? emailExists
								? "Login"
								: "Sign Up"
							: "Continue"}
					</Button>
				</form>
				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t border-gray-600" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="px-2 bg-gray-800 text-gray-400">
							Or continue with
						</span>
					</div>
				</div>
				<Button
					variant="outline"
					className="w-full text-white border-gray-600 hover:bg-gray-700"
					onClick={handleGoogleSignIn}
				>
					Sign in with Google
				</Button>
				{emailChecked && (
					<p className="mt-4 text-sm text-center text-gray-400">
						<button
							type="submit"
							onClick={() => setEmailChecked(false)}
							className="font-medium text-indigo-400 hover:text-indigo-500"
						>
							Change Email
						</button>
					</p>
				)}
				{error && (
					<p className="mt-4 text-sm text-center text-red-500">
						{error}
					</p>
				)}
			</div>
		</div>
	);
}
