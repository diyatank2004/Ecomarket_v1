import React, { createContext, useContext, useMemo, useState } from "react";
import { authApi } from "../services/api";
import { getFriendlyError } from "../utils/helpers";

const AuthContext = createContext(null);

const readStoredUser = () => {
	const raw = localStorage.getItem("user");
	if (!raw) return null;

	try {
		return JSON.parse(raw);
	} catch (error) {
		localStorage.removeItem("user");
		return null;
	}
};

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(readStoredUser);
	const [token, setToken] = useState(localStorage.getItem("token") || "");
	const [loading, setLoading] = useState(false);

	const syncAuth = (payload) => {
		if (!payload?.token || !payload?.user) return;
		localStorage.setItem("token", payload.token);
		localStorage.setItem("user", JSON.stringify(payload.user));
		setToken(payload.token);
		setUser(payload.user);
	};

	const login = async (credentials) => {
		setLoading(true);
		try {
			const { data } = await authApi.login(credentials);
			syncAuth(data);
			return { ok: true, data };
		} catch (error) {
			return { ok: false, message: getFriendlyError(error, "Unable to sign in") };
		} finally {
			setLoading(false);
		}
	};

	const register = async (payload) => {
		setLoading(true);
		try {
			const { data } = await authApi.register(payload);

			// Backend register doesn't return token, so auto-login for smooth onboarding.
			const loginResult = await authApi.login({
				email: payload.email,
				password: payload.password,
			});

			syncAuth(loginResult.data);
			return { ok: true, data };
		} catch (error) {
			return { ok: false, message: getFriendlyError(error, "Unable to create account") };
		} finally {
			setLoading(false);
		}
	};

	const loginWithGoogle = async (googleToken) => {
			setLoading(true);
			try {
				// Assumptions: your authApi service has a googleLogin method matching your routes
				const { data } = await authApi.googleLogin({ token: googleToken });
				syncAuth(data);
				return { ok: true, data };
			} catch (error) {
				return { ok: false, message: getFriendlyError(error, "Google authentication failed") };
			} finally {
				setLoading(false);
			}
		};

	const logout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		setToken("");
		setUser(null);
	};

	const value = useMemo(
		() => ({
			user,
			token,
			isAuthenticated: Boolean(token),
			loading,
			login,
			register,
			loginWithGoogle,
			logout,
		}),
		[user, token, loading]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return context;
};
