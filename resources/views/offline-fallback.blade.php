@extends('layouts.root')

@section('main-content')
	<div id="banner">
		<svg aria-hidden="true" viewbox="0 0 24 24">
			<use href="#cloud-off-icon"></use>
		</svg>

		<p>
			@lang('You have lost connection to the internet or server. This application is offline').
		</p>

		<button class="text-button" id="check-network-connection" type="button">@lang('Reload')</button>
	</div>

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
