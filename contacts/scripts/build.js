//steal/js contacts/scripts/compress.js

load("steal/rhino/steal.js");
steal('steal/build','steal/build/scripts','steal/build/styles',function(){
	steal.build('contacts/scripts/build.html',{to: 'contacts'});
});
