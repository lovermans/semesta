import Echo from "{{ Vite::asset('resources/js/echo-esm.js') }}";

let echoConfig = {
	broadcaster: "{{ $app->config->get('broadcasting.default') }}",
	key: "{{ $app->config->get('broadcasting.connections.pusher.key') }}",
	cluster: "{{ $app->config->get('broadcasting.connections.pusher.options.cluster') }}",
	wsHost: "{{ $app->request->getHttpHost() }}",
	wsPath: "{{ $app->request->getBasePath() }}",
	channelAuthorization: {
		endpoint: "{{ $app->request->getBasePath() . '/broadcasting/user' }}",
		headers: {
			["X-CSRF-TOKEN"]: "{{ $app->session->token() }}"
		}
	},
	userAuthentication: {
		endpoint: "{{ $app->request->getBasePath() . '/broadcasting/user-auth' }}",
		headers: {
			["X-CSRF-TOKEN"]: "{{ $app->session->token() }}"
		}
	},
	csrfToken: "{{ $app->session->token() }}",
	encrypted: false,
	wsPort: 80,
	wssPort: 443,
	enableStats: false,
	forceTLS: false,
	enabledTransports: ['ws', 'wss'],
	disabledTransports: ['sockjs', 'xhr_polling', 'xhr_streaming']
};

export let soketi = new Echo({
	...echoConfig,
	// client: new PusherBrowser(echoConfig.key, echoConfig)
});
