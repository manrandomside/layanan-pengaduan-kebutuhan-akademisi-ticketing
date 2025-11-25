import React, { createContext, useState, useContext, useEffect } from "react";
import axiosInstance from "../config/axios";

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check authentication status saat app load
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem("auth_token");

        if (!token) {
            setLoading(false);
            return;
        }

        try {
            // Verify token dengan backend
            const response = await axiosInstance.get("/auth/me");

            if (response.data.success) {
                const { user: userData, role: userRole } = response.data.data;

                setIsAuthenticated(true);
                setUser(userData);
                setRole(userRole);

                // Update localStorage with fresh data
                localStorage.setItem("user_data", JSON.stringify(userData));
                localStorage.setItem("user_role", userRole);
            } else {
                // Token invalid, clear localStorage
                clearAuth();
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            // Token invalid or expired, clear localStorage
            clearAuth();
        } finally {
            setLoading(false);
        }
    };

    const clearAuth = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        localStorage.removeItem("user_role");
        setIsAuthenticated(false);
        setUser(null);
        setRole(null);
    };

    // Login User
    const loginUser = async (no_telepon, password) => {
        try {
            const response = await axiosInstance.post("/auth/login/user", {
                no_telepon,
                password,
            });

            if (response.data.success) {
                const { token, user: userData } = response.data.data;

                localStorage.setItem("auth_token", token);
                localStorage.setItem("user_data", JSON.stringify(userData));
                localStorage.setItem("user_role", "user");

                setIsAuthenticated(true);
                setUser(userData);
                setRole("user");

                return { success: true };
            }

            return {
                success: false,
                message: response.data.message || "Login gagal",
            };
        } catch (error) {
            const message = error.response?.data?.message || "Login gagal";
            return { success: false, message };
        }
    };

    // Login Admin
    const loginAdmin = async (nama, password) => {
        try {
            const response = await axiosInstance.post("/auth/login/admin", {
                nama,
                password,
            });

            if (response.data.success) {
                const { token, admin: adminData } = response.data.data;

                localStorage.setItem("auth_token", token);
                localStorage.setItem("user_data", JSON.stringify(adminData));
                localStorage.setItem("user_role", "admin");

                setIsAuthenticated(true);
                setUser(adminData);
                setRole("admin");

                return { success: true };
            }

            return {
                success: false,
                message: response.data.message || "Login gagal",
            };
        } catch (error) {
            const message = error.response?.data?.message || "Login gagal";
            return { success: false, message };
        }
    };

    // Register User
    const register = async (userData) => {
        try {
            const response = await axiosInstance.post(
                "/auth/register",
                userData
            );

            if (response.data.success) {
                const { token, user: newUser } = response.data.data;

                localStorage.setItem("auth_token", token);
                localStorage.setItem("user_data", JSON.stringify(newUser));
                localStorage.setItem("user_role", "user");

                setIsAuthenticated(true);
                setUser(newUser);
                setRole("user");

                return { success: true };
            }

            return {
                success: false,
                message: response.data.message || "Registrasi gagal",
            };
        } catch (error) {
            const message = error.response?.data?.message || "Registrasi gagal";
            const errors = error.response?.data?.errors || {};
            return { success: false, message, errors };
        }
    };

    // Logout
    const logout = async () => {
        try {
            if (role === "user") {
                await axiosInstance.post("/user/logout");
            } else if (role === "admin") {
                await axiosInstance.post("/admin/logout");
            }
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            clearAuth();
        }
    };

    // Update user data
    const updateUser = (updatedUserData) => {
        const newUserData = { ...user, ...updatedUserData };
        setUser(newUserData);
        localStorage.setItem("user_data", JSON.stringify(newUserData));
    };

    const value = {
        isAuthenticated,
        user,
        role,
        loading,
        loginUser,
        loginAdmin,
        register,
        logout,
        checkAuth,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
