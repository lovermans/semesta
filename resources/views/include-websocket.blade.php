{{-- <script type="module">
	import Echo from "{{ Vite::asset('resources/js/echo-esm.js') }}";
	import Pusher from "{{ Vite::asset('resources/js/pusher-esm.js') }}";

	window.Pusher = Pusher;
	window.Echo = new Echo({
		broadcaster: "{{ $app->config->get('broadcasting.default') }}",
		key: "{{ $app->config->get('broadcasting.connections.pusher.key') }}",
		cluster: "{{ $app->config->get('broadcasting.connections.pusher.options.cluster') }}",
		wsHost: window.location.hostname,
		authEndpoint: "{{ $app->request->getBasePath() . '/broadcasting/auth' }}",
		userAuthentication: {
			endpoint: "{{ $app->request->getBasePath() . '/broadcasting/user-auth' }}",
			headers: {},
		},
		csrfToken: "{{ $app->session->token() }}",
		encrypted: false,
		wsPort: 80,
		wssPort: 443,
		disableStats: true,
		forceTLS: false,
		enabledTransports: ['ws', 'wss'],
		disabledTransports: ['sockjs', 'xhr_polling', 'xhr_streaming']
	});
</script>

<script type="module">
	Echo.connector.pusher.connection.bind('connected', function() {
		socketId = Echo.socketId();
		console.log("Socket-ID : " + socketId);
	});
</script> --}}

<script type="module">
	window.applyWebsocket = async () => {
		const {
			default: Pusher
		} = await import('{{ Vite::asset('resources/js/pusher-esm.js') }}');

		const {
			default: Echo
		} = await import('{{ Vite::asset('resources/js/echo-esm.js') }}');

		window.Pusher = Pusher;
		window.Echo = new Echo({
			broadcaster: "{{ $app->config->get('broadcasting.default') }}",
			key: "{{ $app->config->get('broadcasting.connections.pusher.key') }}",
			cluster: "{{ $app->config->get('broadcasting.connections.pusher.options.cluster') }}",
			wsHost: window.location.hostname,
			authEndpoint: "{{ $app->request->getBasePath() . '/broadcasting/auth' }}",
			userAuthentication: {
				endpoint: "{{ $app->request->getBasePath() . '/broadcasting/user-auth' }}",
				headers: {},
			},
			csrfToken: "{{ $app->session->token() }}",
			encrypted: false,
			wsPort: 80,
			wssPort: 443,
			disableStats: true,
			forceTLS: false,
			enabledTransports: ['ws', 'wss'],
			disabledTransports: ['sockjs', 'xhr_polling', 'xhr_streaming']
		});
	};
</script>

<script type="module">
	function getSocketId() {
		Echo.connector.pusher.connection.bind('connected', function() {
			socketId = Echo.socketId();
			console.log("Socket-ID : " + socketId);
		});
	};

	Echo ? getSocketId() : applyWebsocket().then(() => {
		getSocketId();
	});
</script>
