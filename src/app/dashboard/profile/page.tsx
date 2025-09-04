"use client";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { KeyRound, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const Profile = () => {
	const { user } = useAuth();

	const [hfToken, setHfToken] = useState("");
	const [wbToken, setWbToken] = useState("");

	useEffect(() => {
		const hfToken = localStorage.getItem("hfToken");
		const wbToken = localStorage.getItem("wbToken");
		setHfToken(hfToken || "");
		setWbToken(wbToken || "");
	}, []);

	const handleLogout = async () => {
		await signOut(auth);
		// Let AuthProvider handle the redirect
	};

	const handleUpdateHfToken = async () => {
		localStorage.setItem("hfToken", hfToken);
		toast.success("Hugging Face token updated");
	};

	const handleClearHfToken = async () => {
		localStorage.removeItem("hfToken");
		setHfToken("");
		toast.success("Hugging Face token cleared");
	};

	const handleUpdateWbToken = async () => {
		localStorage.setItem("wbToken", wbToken);
		toast.success("Weights and Biases token updated");
	};

	const handleClearWbToken = async () => {
		localStorage.removeItem("wbToken");
		setWbToken("");
		toast.success("Weights and Biases token cleared");
	};

	return (
		<div>
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold">Profile</h1>
				<Button
					onClick={handleLogout}
					variant="destructive"
					className="cursor-pointer"
				>
					<LogOut /> Logout
				</Button>
			</div>
			<div className="mt-4 space-x-2">
				<span className="text-muted-foreground">Email:</span>
				<span className="font-medium">{user?.email}</span>
			</div>
			<div className="grid grid-cols-2 gap-4 mt-10">
				<Card>
					<CardHeader>
						<CardTitle>Hugging Face Token</CardTitle>
						<CardDescription>
							Enter your Hugging Face token to save it in your
							browser for autofill. It's never stored in the cloud
							or our database. You can also skip saving and enter
							it manually when needed.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						<Input
							type="text"
							placeholder="Enter your Hugging Face token"
							value={hfToken}
							onChange={e => setHfToken(e.target.value)}
						/>
						<div className="flex gap-2">
							<Button onClick={handleUpdateHfToken}>
								Update HF Token <KeyRound />
							</Button>
							<Button
								onClick={handleClearHfToken}
								variant="outline"
							>
								Clear Token
							</Button>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Weights and Biases Token</CardTitle>
						<CardDescription>
							Enter your Weights and Biases token to save it in
							your browser for autofill. It's never stored in the
							cloud or our database. You can also skip saving and
							enter it manually when needed.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						<Input
							type="text"
							placeholder="Enter your Weights and Biases token"
							value={wbToken}
							onChange={e => setWbToken(e.target.value)}
						/>
						<div className="flex gap-2">
							<Button onClick={handleUpdateWbToken}>
								Update W&B Token <KeyRound />
							</Button>
							<Button
								onClick={handleClearWbToken}
								variant="outline"
							>
								Clear Token
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default Profile;
