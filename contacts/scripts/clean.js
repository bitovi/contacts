//steal/js contacts/scripts/compress.js

load("steal/rhino/steal.js");
steal('steal/clean',function(){
	steal.clean('contacts/contacts.html',{
		indent_size: 1, 
		indent_char: '\t', 
		jslint : false,
		ignore: /jquery\/jquery.js/,
		predefined: {
			steal: true, 
			jQuery: true, 
			$ : true,
			window : true
		}
	});
});
