@extends('layouts.root')

@section('main-content')
	<script type="module" nonce="{{ Vite::cspNonce() }}">
		var banner =
			`<div class="banner"> <svg aria-hidden="true" viewbox="0 0 24 24"> <use href="#cloud-off-icon"></use> </svg> <p> @lang('You have lost connection to the internet or server. This application is offline'). </p> <a class="text-button" href="{{ $app->url->route('start') }}" rel="noreferrer">@lang('Reload')</a> </div>`;

		getMainFunction().then((use) => {
			use.renewAlert(banner);
		});

		/* window.addEventListener('online', () => {
			window.location.reload();
		});

		async function checkNetworkAndReload() {
			try {
				const response = await fetch('.');
				if (response.status >= 200 && response.status < 500) {
					window.location.reload();
					return;
				}
			} catch {
				console.log('Unable to connect to the server, ignore.');
			}
			window.setTimeout(checkNetworkAndReload, 2500);
		}

		checkNetworkAndReload(); */
	</script>
@endsection
