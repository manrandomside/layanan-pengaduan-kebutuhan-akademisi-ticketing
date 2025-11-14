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

    const checkAuth = () => {
        const token = localStorage.getItem("auth_token");
        const userData = localStorage.getItem("user_data");
        const userRole = localStorage.getItem("user_role");

        if (token && userData && userRole) {
            setIsAuthenticated(true);
            setUser(JSON.parse(userData));
            setRole(userRole);
        }
        setLoading(false);
    };

    // Login User
    const loginUser = async (no_telepon, password) => {
        try {
            const response = await axiosInstance.post("/auth/login/user", {
                no_telepon,
                password,
            });

            const { token, user } = response.data;

            localStorage.setItem("auth_token", token);
            localStorage.setItem("user_data", JSON.stringify(user));
            localStorage.setItem("user_role", "user");

            setIsAuthenticated(true);
            setUser(user);
            setRole("user");

            return { success: true };
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

            const { token, admin } = response.data;

            localStorage.setItem("auth_token", token);
            localStorage.setItem("user_data", JSON.stringify(admin));
            localStorage.setItem("user_role", "admin");

            setIsAuthenticated(true);
            setUser(admin);
            setRole("admin");

            return { success: true };
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

            const { token, user } = response.data;

            localStorage.setItem("auth_token", token);
            localStorage.setItem("user_data", JSON.stringify(user));
            localStorage.setItem("user_role", "user");

            setIsAuthenticated(true);
            setUser(user);
            setRole("user");

            return { success: true };
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
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user_data");
            localStorage.removeItem("user_role");

            setIsAuthenticated(false);
            setUser(null);
            setRole(null);
        }
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
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
