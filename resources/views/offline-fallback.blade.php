@extends('layouts.root')

@section('main-content')
	<h1>You are offline</h1>

	<p>Click the button below to try reloading.</p>
	<button id="check-network-connection" type="button">⤾ Reload</button>

	<!-- Inline the page's JavaScript file. -->
	<script type="module" nonce="{{ Vite::cspNonce() }}">
		document.getElementById('check-network-connection').addEventListener('click', () => {
			window.location.reload();
		})

		// window.addEventListener('online', () => {
		// 	window.location.reload();
		// });

		// async function checkNetworkAndReload() {
		// 	try {
		// 		const response = await fetch('.');
		// 		if (response.status >= 200 && response.status < 500) {
		// 			window.location.reload();
		// 			return;
		// 		}
		// 	} catch {
		// 		console.log('Unable to connect to the server, ignore.');
		// 	}
		// 	window.setTimeout(checkNetworkAndReload, 2500);
		// }

		// checkNetworkAndReload();
	</script>
@endsection
