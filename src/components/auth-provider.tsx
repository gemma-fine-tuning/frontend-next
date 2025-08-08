"use client";

import { auth } from "@/lib/firebase";
import { type User, onAuthStateChanged } from "firebase/auth";
import {
	type ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";

interface AuthContextType {
	user: User | null;
	loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
	user: null,
	loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async user => {
			setUser(user);
			setLoading(false);
			if (user) {
				const token = await user.getIdToken();
				await fetch("/api/auth/login", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ token }),
				});
			} else {
				await fetch("/api/auth/logout", { method: "POST" });
			}
		});

		return () => unsubscribe();
	}, []);

	return (
		<AuthContext.Provider value={{ user, loading }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
