var trainBookTimer = setTimeout(function() {
	location.reload();
}, 30000);

if($('.success-model').attr('data-flag')==1){
	if ($('.success-model').attr('data-orderstatus') != 1) {
		clearTimeout(trainBookTimer);
	}
}else{
	if ($('.success-model').attr('data-orderstatus') != 0) {
		clearTimeout(trainBookTimer);
	}
}

