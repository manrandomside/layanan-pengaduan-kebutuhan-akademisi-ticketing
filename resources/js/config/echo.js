import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: "pusher",
    key: import.meta.env.VITE_PUSHER_APP_KEY || "83b58f1184a5699c4e63",
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || "ap1",
    forceTLS: true,
    authEndpoint: "/api/broadcasting/auth",
    auth: {
        headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
            Accept: "application/json",
        },
    },
});

export default echo;
