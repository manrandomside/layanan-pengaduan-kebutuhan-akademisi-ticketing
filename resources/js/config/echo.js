import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

// Base API URL dari environment variable
const baseApiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const authEndpointUrl = `${baseApiUrl}/broadcasting/auth`;

// Get authentication token
const getAuthHeaders = () => {
    const token = localStorage.getItem("auth_token");
    return {
        Authorization: token ? `Bearer ${token}` : "",
        Accept: "application/json",
    };
};

// Initialize Echo with Pusher
const echo = new Echo({
    broadcaster: "pusher",
    key: import.meta.env.VITE_PUSHER_APP_KEY || "",
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || "ap1",
    forceTLS: true,
    encrypted: true,
    authEndpoint: authEndpointUrl,
    auth: {
        headers: getAuthHeaders(),
    },
    authorizer: (channel) => {
        return {
            authorize: (socketId, callback) => {
                fetch(authEndpointUrl, {
                    method: "POST",
                    headers: {
                        ...getAuthHeaders(),
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        socket_id: socketId,
                        channel_name: channel.name,
                    }),
                })
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error("Authorization failed");
                        }
                        return response.json();
                    })
                    .then((data) => {
                        callback(null, data);
                    })
                    .catch((error) => {
                        console.error("Channel authorization error:", error);
                        callback(error, null);
                    });
            },
        };
    },
});

// Connection status monitoring
echo.connector.pusher.connection.bind("connected", () => {
    console.log("Pusher connected successfully!");
});

echo.connector.pusher.connection.bind("error", (err) => {
    console.error("Pusher connection error:", err);
});

echo.connector.pusher.connection.bind("disconnected", () => {
    console.warn("Pusher disconnected");
});

export default echo;
