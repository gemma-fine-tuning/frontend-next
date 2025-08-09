"use client";

import { auth } from "@/lib/firebase";
import { type User, onAuthStateChanged } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
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
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async user => {
			const previousUser = user;
			setUser(user);

			try {
				if (user) {
					const token = await user.getIdToken();
					await fetch("/api/auth/login", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ token }),
					});

					// Redirect to dashboard if user just logged in and is on login page
					if (pathname === "/login" || pathname === "/") {
						router.push("/dashboard");
					}
				} else {
					await fetch("/api/auth/logout", { method: "POST" });

					// Redirect to login if user just logged out and is on a protected route
					if (pathname.startsWith("/dashboard")) {
						router.push("/login");
					}
				}
			} catch (error) {
				console.error("Auth API call failed:", error);
			} finally {
				setLoading(false);
			}
		});

		return () => unsubscribe();
	}, [router, pathname]);

	return (
		<AuthContext.Provider value={{ user, loading }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
