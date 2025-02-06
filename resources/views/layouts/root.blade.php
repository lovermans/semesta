<!DOCTYPE html>
<html dir="ltr" lang="{{ str_replace('_', '-', $app->getLocale()) }}">

	<head>
		@include('elements.metadata')

		<style nonce="{{ Vite::cspNonce() }}">
			@include('elements.css-font-face') footer {
				color-scheme: dark;
				display: flex;
				justify-content: space-evenly;
				align-items: end;
				gap: 1rem;
				flex-wrap: wrap;
				background: Canvas;
				color: CanvasText;
				font: var(--font-caption);
				letter-spacing: var(--letter-spacing-caption);

				a:any-link {
					color: revert;
				}

				.browser-info {
					flex-basis: 60ch;
				}
			}
		</style>

		{{ Vite::withEntryPoints(['resources/css/main.css']) }}

		@sectionMissing('page-need-javascript-message')
			<noscript>
				<meta HTTP-EQUIV="refresh" content="0;url='{{ $app->url->route('page-need-javascript') }}'">
			</noscript>

			<script nonce="{{ Vite::cspNonce() }}">
				{!! Vite::content('resources/js/start.js') !!}
			</script>

			{{-- {{ Vite::withEntryPoints(['resources/js/start.js'])->useScriptTagAttributes(['type' => false])->usePreloadTagAttributes(false) }} --}}
		@endif
	</head>

	<body>
		<a aria-label="Link To Jump To Main Content" class="jump-to-main-content" data-print="none"
			href="#main-content">@lang('Jump To Main Content')</a>

		@sectionMissing('page-need-javascript-message')
			<div aria-hidden="true" class="inline-svg-icon" data-print="none">
				<object data="{{ Vite::asset('resources/images/svg/internal-icon-sprites.svg') }}" id="icon-sprites"
					nonce="{{ Vite::cspNonce() }}"
					onload="this.parentElement.id='inline-svg-icon';this.outerHTML=this.contentDocument.documentElement.outerHTML;"
					type="image/svg+xml"></object>
			</div>

			@include('elements.header')
			@include('elements.navigation')
		@endif

		<div data-print="none" id="top-alert">
			<div id="app-session">
				@hasSection('page-need-javascript-message')
					@yield('page-need-javascript-message')
				@endif
			</div>
			<div id="app-event-message"></div>
		</div>

		@sectionMissing('page-need-javascript-message')
			<main id="main-content">
				@yield('main-content')
			</main>

			<footer>
				<p class="browser-info">
					<strong>
						@lang('Best used with a Browser at least compatible with Google Chrome version 133').
					</strong>
					&nbsp;
					<i>
						@lang('You are using')
						<span id="detectedBrowser">@lang('inspecting...')</span>
					</i>
				</p>
				<div class="build-with">
					Laravel v{{ Illuminate\Foundation\Application::VERSION }} - PHP v{{ PHP_VERSION }}
				</div>
				<div class="copyright">
					<a href="{!! $app->url->route('start') !!}">{{ $app->config->get('app.name') }}</a>
					&copy; 2025{{ date('Y') == 2025 ? '' : '-' . date('Y') }}
				</div>
			</footer>

			@include('elements.script')
		@endif
	</body>

</html>
