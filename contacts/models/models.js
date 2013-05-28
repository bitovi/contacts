steal(
'./contact_params',
'./location',
'./contact',
'./company',
'./category',
'contacts/fixtures', 
function(Params){
	Contacts.Models.Params = Params;
	return Contacts.Models;
});