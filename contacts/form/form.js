steal('can/control', 'can/construct/super', function(Control){

return Control({

	setup : function(el, opts){
		opts.attr = opts.model._shortName;
		return this._super(el, opts);
	},

	edited : function(model){
		if(typeof model !== 'undefined'){
			this.options.edited.attr(this.options.attr, model);
		}
		return this.options.edited.attr(this.options.attr);
	},

	cancelEditing : function(){
		var model = this.edited();
		this.edited(null);
		if(model && model.isNew()){
			this.options.list.splice(0, 1);
		}
	},

	save : function(el, ev){
		var model = this.edited();
		this.edited(null);
		model.save();
		ev && ev.preventDefault();
	},

	".add click" : function(){
		var model = new this.options.model;
		this.cancelEditing();
		this.edited(model);
		this.options.list.unshift(model);
	},

	"tr.editable dblclick" : "edit",

	".editable .edit click" : "edit",

	edit : function(el, ev){
		var model = el.closest('.editable').data('model');
		this.cancelEditing();
		this.edited(model);
		ev.stopImmediatePropagation();
	},
	
	"input keydown" : function(el, ev){
		if(ev.which === 27){ // escape key
			this.cancelEditing();
		} else if(ev.which === 13){ // enter key
			el.blur();
			this.save();
		}
	},

	"form submit" : "save",

	"{edited} change" : function(edited, ev, attr, how, newVal, oldVal){
		var self = this;
		if(attr === this.options.attr){
			setTimeout(function(){
				self.element.find('input:first').focus();
			}, 1);
		}
	}
})

})