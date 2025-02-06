@extends('layouts.root')

@section('page-need-javascript-message')
	<div class="banner">
		<img alt="Javascript" aria-hidden="true"
			src="{{ Vite::asset('resources/images/svg/external-icon-sprites.svg') . '#javascript-icon' }}">

		<p>
			@lang('You have to enable javascript on the browser to run this application').
		</p>
	</div>
@endsection
