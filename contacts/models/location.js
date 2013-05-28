steal("can/model", 'can/model/list', function(Model){
	return Model('Contacts.Models.Location', {
		findAll : 'GET locations',
		create : 'POST locations',
		update : 'PUT locations/{id}'
	}, {})
})
