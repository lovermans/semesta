@extends('root')

@pushOnce('metadata')
	<noscript>
		<meta HTTP-EQUIV="refresh" content="0;url='{{ $app->url->route('page-need-javascript') }}'">
	</noscript>
@endPushOnce

@section('content')
	Hello Word
@endsection
