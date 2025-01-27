@extends('layouts.root')

@section('page-need-javascript-message')
	<div id="banner">
		<img alt="User Menu" aria-hidden="true" src="{{ Vite::asset('resources/images/svg/icon-sprites.svg') . '#javascript-icon' }}">

		<p>
			You have to enable javascript on the browser to run this application.
		</p>
	</div>
@endsection
