import PusherBrowser from "{{ Vite::asset('resources/js/pusher-esm.js') }}";
import EchoBrowser from "{{ Vite::asset('resources/js/echo-esm.js') }}";

let echoConfig = {
	broadcaster: "{{ $app->config->get('broadcasting.default') }}",
	key: "{{ $app->config->get('broadcasting.connections.pusher.key') }}",
	cluster: "{{ $app->config->get('broadcasting.connections.pusher.options.cluster') }}",
	wsHost: window.location.hostname,
	authEndpoint: "{{ $app->request->getBasePath() . '/broadcasting/auth' }}",
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

/* const pusherProtocol = new PusherBrowser(echoConfig.key, echoConfig); */
export const soketi = new EchoBrowser({
	...echoConfig,
	client: new PusherBrowser(echoConfig.key, echoConfig)
});
