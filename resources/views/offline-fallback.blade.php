<!DOCTYPE html>
<html dir="ltr" lang="{{ str_replace('_', '-', $app->getLocale()) }}">

	<head>
		<meta charset="utf-8" />
		<meta content="IE=edge" http-equiv="X-UA-Compatible" />
		<meta content="width=device-width, initial-scale=1" name="viewport" />

		<title>You are offline</title>

		<!-- Inline the page's stylesheet. -->
		<style>
			body {
				font-family: helvetica, arial, sans-serif;
				margin: 2em;
			}

			h1 {
				font-style: italic;
				color: #373fff;
			}

			p {
				margin-block: 1rem;
			}

			button {
				display: block;
			}
		</style>
	</head>

	<body>
		<h1>You are offline</h1>

		<p>Click the button below to try reloading.</p>
		<button type="button">⤾ Reload</button>

		<!-- Inline the page's JavaScript file. -->
		<script>
			// Manual reload feature.
			document.querySelector("button").addEventListener("click", () => {
				window.location.reload();
			});

			// Listen to changes in the network state, reload when online.
			// This handles the case when the device is completely offline.
			window.addEventListener('online', () => {
				window.location.reload();
			});

			// Check if the server is responding and reload the page if it is.
			// This handles the case when the device is online, but the server
			// is offline or misbehaving.
			async function checkNetworkAndReload() {
				try {
					const response = await fetch('.');
					// Verify we get a valid response from the server
					if (response.status >= 200 && response.status < 500) {
						window.location.reload();
						return;
					}
				} catch {
					// Unable to connect to the server, ignore.
				}
				window.setTimeout(checkNetworkAndReload, 2500);
			}

			checkNetworkAndReload();
		</script>
	</body>

</html>
