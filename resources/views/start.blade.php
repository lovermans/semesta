@extends('layouts.root')

@section('main-content')
	<div class="card">
		<p class="center">
			<strong>
				@lang('The application can run optimally by using Google Chrome at least version 133 compatible browser').
			</strong>
			<br>
			<br>
			<i>
				<u>
					@lang('The currently detected browsers is')
					<span id="detectedBrowser">@lang('inspecting...')</span>
				</u>
			</i>
		</p>
	</div>

	<script nonce="{{ Vite::cspNonce() }}" type="module">
		function getBrowserInfo() {
			const userAgent = navigator.userAgent;
			let browserName = '@lang('Unknown')';
			let browserVersion = '@lang('Unknown')';

			if (/chrome|crios|crmo/i.test(userAgent) && !/edg/i.test(userAgent)) {
				browserName = 'Google Chrome';
				browserVersion = userAgent.match(/Chrome\/([\d.]+)/)?.[1] || '@lang('Unknown')';
			} else if (/firefox|fxios/i.test(userAgent)) {
				browserName = 'Mozilla Firefox';
				browserVersion = userAgent.match(/Firefox\/([\d.]+)/)?.[1] || '@lang('Unknown')';
			} else if (/safari/i.test(userAgent) && !/chrome|crios|crmo|edg/i.test(userAgent)) {
				browserName = 'Safari';
				browserVersion = userAgent.match(/Version\/([\d.]+)/)?.[1] || '@lang('Unknown')';
			} else if (/edg/i.test(userAgent)) {
				browserName = 'Microsoft Edge';
				browserVersion = userAgent.match(/Edg\/([\d.]+)/)?.[1] || '@lang('Unknown')';
			} else if (/opera|opr/i.test(userAgent)) {
				browserName = 'Opera';
				browserVersion = userAgent.match(/(?:Opera|OPR)\/([\d.]+)/)?.[1] || '@lang('Unknown')';
			}

			let detectedBrowser = `${browserName} @lang('version') ${browserVersion}`;
			let detectedBrowserAnchor = document.getElementById('detectedBrowser');

			if (detectedBrowserAnchor) {
				detectedBrowserAnchor.textContent = detectedBrowser;
			}
		}

		getBrowserInfo();
	</script>
@endsection
