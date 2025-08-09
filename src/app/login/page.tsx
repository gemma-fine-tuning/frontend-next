"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/firebase";
import {
	GoogleAuthProvider,
	createUserWithEmailAndPassword,
	getAuth,
	getRedirectResult,
	signInWithEmailAndPassword,
	signInWithPopup,
	validatePassword,
} from "firebase/auth";
import { useEffect, useState } from "react";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [mode, setMode] = useState<"login" | "signup">("login");

	useEffect(() => {
		getRedirectResult(auth)
			.then(result => {
				// Let AuthProvider handle the redirect
				setLoading(false);
			})
			.catch(error => {
				setError(error.message);
				setLoading(false);
			});
	}, []);

	const handleAuthSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		// On signup, enforce password complexity
		if (mode === "signup") {
			const status = await validatePassword(auth, password);
			if (!status.isValid) {
				const missing: string[] = [];
				if (status.containsLowercaseLetter !== true)
					missing.push("lowercase letter");
				if (status.containsUppercaseLetter !== true)
					missing.push("uppercase letter");
				// numeric and special character flags may vary; check available properties
				if (status.containsNumericCharacter === false)
					missing.push("digit");
				if (status.containsNonAlphanumericCharacter === false)
					missing.push("special character");
				if (status.meetsMinPasswordLength === false)
					missing.push("required length");
				setError(`Password missing: ${missing.join(", ")}`);
				return;
			}
		}
		try {
			if (mode === "login") {
				await signInWithEmailAndPassword(auth, email, password);
			} else {
				await createUserWithEmailAndPassword(auth, email, password);
			}
			// Let AuthProvider handle the redirect
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
		try {
			const provider = new GoogleAuthProvider();
			const result = await signInWithPopup(auth, provider);
			// Let AuthProvider handle the redirect
		} catch (error: unknown) {
			if (error instanceof Error) {
				setError(error.message);
			} else {
				setError("An unknown error occurred");
			}
		}
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
					{mode === "signup" ? "Sign Up" : "Login"}
				</h1>
				<form onSubmit={handleAuthSubmit} className="space-y-6">
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
						/>
					</div>
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
					<Button
						type="submit"
						className="w-full bg-indigo-600 hover:bg-indigo-700"
					>
						{mode === "signup" ? "Sign Up" : "Login"}
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
				<p className="mt-4 text-sm text-center text-gray-400">
					{mode === "signup"
						? "Already have an account? "
						: "Don't have an account? "}
					<button
						type="button"
						onClick={() =>
							setMode(mode === "signup" ? "login" : "signup")
						}
						className="font-medium text-indigo-400 hover:text-indigo-500"
					>
						{mode === "signup" ? "Login" : "Sign Up"}
					</button>
				</p>
				{error && (
					<p className="mt-4 text-sm text-center text-red-500">
						{error}
					</p>
				)}
			</div>
		</div>
	);
}
