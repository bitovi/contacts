steal("can/model", 'can/model/list', function(Model){
	return Model('Contacts.Models.Company', {
		findAll : 'GET companies',
		create : 'POST companies',
		update : 'PUT companies/{id}'
	}, {})
})
