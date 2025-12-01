import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

// Function to get authorization header dynamically
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        Authorization: token ? `Bearer ${token}` : "",
        Accept: "application/json",
    };
};

const echo = new Echo({
    broadcaster: "pusher",
    key: import.meta.env.VITE_PUSHER_APP_KEY || "83b58f1184a5699c4e63",
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || "ap1",
    forceTLS: true,
    encrypted: true,
    authEndpoint: "/api/broadcasting/auth",
    auth: {
        headers: getAuthHeaders(),
    },
    authorizer: (channel) => {
        return {
            authorize: (socketId, callback) => {
                fetch("/api/broadcasting/auth", {
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
                        callback(error, null);
                    });
            },
        };
    },
});

export default echo;
