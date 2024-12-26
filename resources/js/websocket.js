import("./pusher-esm").then(function () {
    import("./echo-esm").then(({ default: LE }) => {
        window.Echo = new LE({
            broadcaster: "pusher",
            key: "sumberdayadev-soket",
            cluster: "mt-1",
            wsHost: window.location.hostname,
            authEndpoint: "/broadcasting/auth",
            userAuthentication: {
                endpoint: "/broadcasting/user-auth",
                headers: {},
            },
            csrfToken: "",
            encrypted: false,
            wsPort: 80,
            disableStats: true,
            forceTLS: false,
            enabledTransports: ['ws', 'wss'],
            disabledTransports: ['sockjs', 'xhr_polling', 'xhr_streaming']
        });

        Echo.connector.pusher.connection.bind('connected', function () {
            soket = Echo.socketId();
            console.log(soket);
        });
    });
});