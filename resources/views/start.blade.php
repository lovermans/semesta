<!DOCTYPE html>
<html dir="ltr" lang="{{ str_replace('_', '-', $app->getLocale()) }}">

	<head>
		@include('metadata-information')

		<noscript>
			<meta HTTP-EQUIV="refresh" content="0;url='{{ $app->url->route('need-javascript') }}'">
		</noscript>

		{{ Vite::withEntryPoints(['resources/js/theme.js'])->useScriptTagAttributes(['type' => false])->usePreloadTagAttributes(false) }}
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
		Hello World
	</body>

</html>
