@extends('layouts.root')

@section('main-content')
	<div class="card">
		<p class="center">
			<strong><i>The application can run optimally by using Google Chrome at least version 133 compatible browser.</i></strong><br> The currently detected browsers
			is <span id="detectedBrowser">Inspecting...</span>.
		</p>
	</div>

	<script nonce="{{ Vite::cspNonce() }}" type="module">
		function getBrowserInfo() {
			const userAgent = navigator.userAgent;
			let browserName = 'Unknown';
			let browserVersion = 'Unknown';

			if (/chrome|crios|crmo/i.test(userAgent) && !/edg/i.test(userAgent)) {
				browserName = 'Google Chrome';
				browserVersion = userAgent.match(/Chrome\/([\d.]+)/)?.[1] || 'Unknown';
			} else if (/firefox|fxios/i.test(userAgent)) {
				browserName = 'Mozilla Firefox';
				browserVersion = userAgent.match(/Firefox\/([\d.]+)/)?.[1] || 'Unknown';
			} else if (/safari/i.test(userAgent) && !/chrome|crios|crmo|edg/i.test(userAgent)) {
				browserName = 'Safari';
				browserVersion = userAgent.match(/Version\/([\d.]+)/)?.[1] || 'Unknown';
			} else if (/edg/i.test(userAgent)) {
				browserName = 'Microsoft Edge';
				browserVersion = userAgent.match(/Edg\/([\d.]+)/)?.[1] || 'Unknown';
			} else if (/opera|opr/i.test(userAgent)) {
				browserName = 'Opera';
				browserVersion = userAgent.match(/(?:Opera|OPR)\/([\d.]+)/)?.[1] || 'Unknown';
			}

			let detectedBrowser = `${browserName} version ${browserVersion}`;
			let detectedBrowserAnchor = document.getElementById('detectedBrowser');

			if (detectedBrowserAnchor) {
				detectedBrowserAnchor.textContent = detectedBrowser;
			}
		}

		getBrowserInfo();
	</script>
@endsection
