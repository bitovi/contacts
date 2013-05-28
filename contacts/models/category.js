steal("can/model", 'can/model/list', function(Model){
	return Model('Contacts.Models.Category', {
		findAll : 'GET categories',
		create : 'POST categories',
		update : 'PUT categories/{id}'
	}, {});
})
