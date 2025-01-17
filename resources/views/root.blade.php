<!DOCTYPE html>
<html dir="ltr" lang="{{ str_replace('_', '-', $app->getLocale()) }}">

	<head>
		@include('include-metadata')

		@stack('metadata')

		@sectionMissing('page-need-javascript-message')
			<noscript>
				<meta HTTP-EQUIV="refresh" content="0;url='{{ $app->url->route('page-need-javascript') }}'">
			</noscript>
		@endif

		{{ Vite::withEntryPoints(['resources/js/start.js'])->useScriptTagAttributes(['type' => false])->usePreloadTagAttributes(false) }}

		<link href="{{ $app->url->route('css-font-face') . '?id=' . filemtime($app->resourcePath('views/css-font-face.blade.php')) }}" nonce="{{ Vite::cspNonce() }}" rel="stylesheet">

		{{ Vite::withEntryPoints(['resources/css/main.css']) }}

		@stack('resources')

		<style nonce="{{ Vite::cspNonce() }}">

		</style>
	</head>

	<body>
		<div aria-hidden="true">
			<object data="{{ Vite::asset('resources/images/svg/icon-sprites.svg') }}" id="icon-sprites" nonce="{{ Vite::cspNonce() }}" onload="this.parentElement.id='inline-svg-icon';this.outerHTML=this.contentDocument.documentElement.outerHTML;" type="image/svg+xml"></object>
		</div>

		<a aria-label="Link To Jump To Main Content" class="jump-to-main-content" href="#main-content">Jump To Main Content</a>

		<header aria-label="Top App Bar" data-print="none">
			<div class="overlay">
				<div class="header-column" id="main-header">
					<button class="header-button" popovertarget="main-navigation" title="Main Navigation Menu">
						<svg aria-hidden="true" viewbox="0 0 24 24">
							<use href="#menu-icon"></use>
						</svg>
					</button>
					<div class="title-header">
						<a href="{{ $app->url->route('root') }}" title="{{ $app->config->get('app.name') }}">
							<img alt="{{ $app->config->get('app.name') . ' App Icon' }}" src="{{ Vite::asset('resources/images/app-icon/app-icon-sprites.svg') . '#app-icon' }}">
							{{ $app->config->get('app.name') }}
						</a>
					</div>
				</div>
				<div class="header-column" id="extra-header">
					<button aria-label="auto" aria-live="polite" class="header-button theme-toggle" id="theme-toggle" title="Toggles light & dark theme">
						<svg aria-hidden="true" class="sun-and-moon" viewBox="0 0 24 24">
							<mask class="moon" id="moon-mask">
								<rect fill="white" height="100%" width="100%" x="0" y="0"></rect>
								<circle cx="24" cy="10" fill="black" r="6"></circle>
							</mask>
							<use href="#theme-toggle-icon"></use>
						</svg>
					</button>
					<button title="App List">
						<svg aria-hidden="true" viewbox="0 0 24 24">
							<use href="#apps-icon"></use>
						</svg>
					</button>
					<button title="User">
						<img alt="User Menu" aria-hidden="true" src="{{ Vite::asset('resources/images/svg/icon-sprites.svg') . '#account-circle-icon' }}">
					</button>
					<a class="text-button" href="#login" title="Login">
						Login
					</a>
				</div>
			</div>
		</header>

		<nav aria-label="Main Navigation" data-print="none" id="main-navigation" popover>
			<ul class="menu">
				@hasSection('main-navigation')
					@yield('main-navigation')
				@endif
				<li>
					<a href="#home">
						<svg aria-hidden="true" class="menu-icon" viewbox="0 0 24 24">
							<use href="#article-icon"></use>
						</svg>
						Home
					</a>
				</li>
				<li>
					<button aria-disabled="true">
						<svg aria-hidden="true" class="menu-icon" viewbox="0 0 24 24">
							<use href="#article-icon"></use>
						</svg>
						Service
						<svg aria-hidden="true" viewbox="0 0 24 24">
							<use href="#arrow-drop-down-icon"></use>
						</svg>
					</button>
					<ul>
						<li><a href="#design">Web Design</a></li>
						<li>
							<button aria-disabled="true">
								<svg aria-hidden="true" class="menu-icon" viewbox="0 0 24 24">
									<use href="#article-icon"></use>
								</svg>
								Development
								<svg aria-hidden="true" viewbox="0 0 24 24">
									<use href="#arrow-drop-down-icon"></use>
								</svg>
							</button>
							<ul>
								<li><a href="#frontend">Frontend</a></li>
								<li>
									<button aria-disabled="true">
										<svg aria-hidden="true" class="menu-icon" viewbox="0 0 24 24">
											<use href="#article-icon"></use>
										</svg>
										Development B
										<svg aria-hidden="true" viewbox="0 0 24 24">
											<use href="#arrow-drop-down-icon"></use>
										</svg>
									</button>
									<ul>
										<li><a href="#backend">Backend</a></li>
									</ul>
							</ul>
						</li>
						<li><a href="#marketing">Digital Marketing</a></li>
					</ul>
				</li>
				<li>
					<button aria-disabled="true">
						<svg aria-hidden="true" class="menu-icon" viewbox="0 0 24 24">
							<use href="#article-icon"></use>
						</svg>
						About
						<svg aria-hidden="true" viewbox="0 0 24 24">
							<use href="#arrow-drop-down-icon"></use>
						</svg>
					</button>
					<ul>
						<li><a href="#team">Our Team</a></li>
						<li><a href="#mission">Our Mission</a></li>
					</ul>
				</li>
				<li>
					<a href="#contact">
						<svg aria-hidden="true" class="menu-icon" viewbox="0 0 24 24">
							<use href="#article-icon"></use>
						</svg>Contact
					</a>
				</li>
			</ul>
		</nav>

		@hasSection('page-need-javascript-message')
			@yield('page-need-javascript-message')
		@endif

		<main id="main-content">
			@yield('main-content')
		</main>

		@sectionMissing('page-need-javascript-message')
			<script type="module" src="{{ $app->url->route('js-register-service-worker') . '?id=' . filemtime($app->resourcePath('views/js-register-service-worker.blade.php')) }}" nonce="{{ Vite::cspNonce() }}"></script>
		@endif

		<script nonce="{{ Vite::cspNonce() }}">
			async function applyWebsocket() {
				let {
					soketi
				} = await import("{{ $app->url->route('js-websocket') . '?id=' . filemtime($app->resourcePath('views/js-websocket.blade.php')) }}");

				return soketi;
			};
		</script>

		<script nonce="{{ Vite::cspNonce() }}" type="module">
			import {
				showHideTopAppBarOnScroll,
				handleGlobalClickEvent
			} from "{{ Vite::asset('resources/js/core-listener.js') }}";

			showHideTopAppBarOnScroll(document.body, 500);
			handleGlobalClickEvent();
		</script>
	</body>

</html>
