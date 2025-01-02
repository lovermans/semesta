<!DOCTYPE html>
<html dir="ltr" lang="{{ str_replace('_', '-', $app->getLocale()) }}">

	<head>
		@include('include-metadata')

		@stack('metadata')

		@sectionMissing('page-need-javascript-message')
			<noscript>
				<meta HTTP-EQUIV="refresh" content="0;url='{{ $app->url->route('page-need-javascript') }}'">
			</noscript>
			<script>
				var socketId = null;
				window.Echo = null;
				{!! Vite::content('resources/js/theme.js') !!}
			</script>
		@endif

		<link crossorigin="use-credentials" href="{{ $app->url->route('pwa-manifest') }}" rel="manifest">

		{{ Vite::withEntryPoints(['resources/css/main.css']) }}

		{{-- {{ Vite::withEntryPoints(['resources/js/theme.js'])->useScriptTagAttributes(['type' => false])->usePreloadTagAttributes(false) }} --}}
		{{-- {{ Vite::withEntryPoints(['resources/js/main.js'])->useScriptTagAttributes(['type' => false, 'defer'])->usePreloadTagAttributes(false) }} --}}

		@stack('resources')
	</head>

	<body>
		<button aria-label="auto" aria-live="polite" class="theme-toggle" id="theme-toggle" title="Toggles light & dark">
			<svg aria-hidden="true" class="sun-and-moon" height="24" viewBox="0 0 24 24" width="24">
				<mask class="moon" id="moon-mask">
					<rect fill="white" height="100%" width="100%" x="0" y="0" />
					<circle cx="24" cy="10" fill="black" r="6" />
				</mask>
				<circle class="sun" cx="12" cy="12" fill="currentColor" mask="url(#moon-mask)" r="6" />
				<g class="sun-beams" stroke="currentColor">
					<line x1="12" x2="12" y1="1" y2="3" />
					<line x1="12" x2="12" y1="21" y2="23" />
					<line x1="4.22" x2="5.64" y1="4.22" y2="5.64" />
					<line x1="18.36" x2="19.78" y1="18.36" y2="19.78" />
					<line x1="1" x2="3" y1="12" y2="12" />
					<line x1="21" x2="23" y1="12" y2="12" />
					<line x1="4.22" x2="5.64" y1="19.78" y2="18.36" />
					<line x1="18.36" x2="19.78" y1="5.64" y2="4.22" />
				</g>
			</svg>
		</button>

		<div aria-hidden="true" hidden id="offline-message">You're offline, check your network connection.</div>

		@hasSection('page-need-javascript-message')
			@yield('page-need-javascript-message')
		@endif

		@yield('content')

		@sectionMissing('page-need-javascript-message')
			<script type="module">
				window.addEventListener('DOMContentLoaded', () => {
					var networkAnchor = document.getElementById('offline-message');

					window.addEventListener('offline', () => {
						networkAnchor.removeAttribute('hidden');
						networkAnchor.setAttribute('aria-hidden', false);
					});

					window.addEventListener('online', () => {
						networkAnchor.setAttribute('hidden', true);
						networkAnchor.setAttribute('aria-hidden', true);
					});
				});
				(() => {
					if ('serviceWorker' in navigator &&
						window.location.protocol === 'https:' &&
						window.self == window.top &&
						navigator.onLine
					) {
						let serviceWorkerUpdated = false;
						let serviceWorkerActivated = false;

						function checkServiceWorkerUpdateAndRefreshPage() {
							if (serviceWorkerActivated && serviceWorkerUpdated) {
								console.log('Reload Page');
								window.location.reload();
							};
						};

						navigator.serviceWorker.register('{{ $app->request->getBasePath() . '/service-worker.js' }}')
							.then(registration => {
								registration.addEventListener('updatefound', () => {
									console.log('Service Worker Update Found');
									const worker = registration.installing;

									worker.addEventListener('statechange', () => {
										console.log({
											state: worker.state
										});

										if (worker.state === 'activated') {
											console.log('Service Worker Activated');
											serviceWorkerActivated = true;

											checkServiceWorkerUpdateAndRefreshPage();
										};
									});
								});
							});

						navigator.serviceWorker.addEventListener('controllerchange', () => {
							console.log('Service Worker Changed');
							serviceWorkerUpdated = true;

							checkServiceWorkerUpdateAndRefreshPage();
						});

					};
				})();
			</script>
		@endif
	</body>

</html>
