steal('can/control',
      'can/observe',
      'contacts/form',
      'contacts/models',
      './views/init.mustache',
      './views/category_item.mustache',
      './views/company_item.mustache',
      './views/contact_row.mustache',
      './less/contacts.less',
      'can/construct/proxy',
      'canui/table_scroll',
      'canui/form',
      'can/route',
function(Control, Observe, Form, Models,
         initView, categoryItemView, companyItemView, contactView){

// Don't execute the code
if(steal.isRhino){
	return;
}

// Private member variables
var loadingCounter = 0,
	UrlParams = function(){
		var routeFilters = can.route.attr(),
				filters = {};
		can.each(['category', 'location', 'company'], function(filter){
			var filterId = routeFilters[filter];
			if(filterId){
				filters[filter + 'Id'] = parseInt(filterId);
			}
		});
		return filters;
	};

var ContactsApp = Control({

	setup : function(el, opts){
		// override setup of the control to 
		// get the parameters from the route
		// and apply to the parameters for filtering
		var defaultParams = {
			limit  : 30,
			offset : 0,
			order  : ['last ASC']
		};
		can.extend(defaultParams, UrlParams());
		opts = opts || {};
		opts.params = new Models.Params(defaultParams);

		// super passing the element and the options
		this._super(el, opts);
	},

	init: function(){
		var self = this;

		// initalize the lists and objects
		this.categoryList = new Models.Category.List;
		this.locationList = new Models.Location.List;
		this.companyList  = new Models.Company.List;
		this.contactList = new Models.Contact.List;
		this.edited       = new Observe;
		this.total        = can.compute(0);
		this.isLoading    = can.compute(function(loading){
			loading ? loadingCounter++ : loadingCounter--;
			return loading > 0;
		});

		// Draw the view, setup helpers and partials
		this.element.html(initView({
			categories : this.categoryList,
			locations  : this.locationList,
			companies  : this.companyList,
			contacts   : this.contactList,
			total      : this.total,
			isLoading  : this.isLoading
		}, {
			partials : {
				category : categoryItemView,
				company  : companyItemView,
				contact  : contactView
			},
			helpers : {

				/**
				 * Determine if the item is related.
				 * @param  {[String]} what
				 * @return {[String]} name
				 */
				related : function(what){
					var id       = this.attr(what + 'Id'),
						relation = self[what + "List"].get(parseInt(id))[0];

					return relation ? relation.attr('name') : "";
				},

				/**
				 * Is the filter active?
				 * @param  {[Object]} filter
				 * @param  {[Object]} opts
				 * @return {[String]} filter
				 */
				isActiveFilter : function(filter, opts){
					return self.options.params.isActiveFilter(filter) ? opts.fn(this) : "";
				},

				/**
				 * Return the correct icon for the order type and column.
				 * @param  {[Object]} order
				 * @return {[String]} css icon
				 */
				orderedBy : function(order){
					var orderedBy = self.options.params.orderedBy(order);
					if(!orderedBy){
						return "";
					}

					return orderedBy === "ASC" ? 
						"glyphicon-chevron-down glyphicon" : 
						"glyphicon-chevron-up glyphicon";
				},

				/**
				 * Determines if the contact is being edited.
				 * @param  {[String]} what
				 * @param  {[Object]} opts
				 * @return {[String]} editing 
				 */
				isEditing : function(what, opts){
					var check = typeof what === 'string' ? 
							!!self.edited.attr(what) : 
							what === self.edited.attr(what.constructor._shortName);

					return check ? opts.fn(opts.contexts) : opts.inverse(opts.contexts);
				},

				/**
				 * Mustache helper for returning filterUrl.
				 * @param  {[Object]} filter
				 * @return filterUrl
				 */
				filterUrl : function(filter){
					var attr = filter.constructor._shortName,
						data = can.route.attr();
					if(self.options.params.isActiveFilter(filter)){
						delete data[attr];
					} else {
						data[attr] = filter.id;
					}

					return can.route.url(data);
				}
			}
		}));

		// Initalize each Form category
		can.each(['location', 'category', 'company', 'contact'], function(formType){
			new Form(this.element.find('#' + formType), {
				edited : this.edited,
				model  : Models[can.capitalize(formType)],
				list   : this[formType + 'List']
			});
		}.bind(this));

		this.setupScroll();
		this.loadFilters();
		this.loadContacts();
	},

	/**
	 * Listen for `can.route` changes to update the params object.
	 * @param  {[Object]} route  can.route object
	 * @param  {[Object]} ev     event
	 * @param  {[String]} attr   attribute that changed
	 * @param  {[String]} how    how it changed
	 * @param  {[Object]} newVal new value it changed to
	 * @param  {[Object]} oldVal old value it was
	 */
	"{can.route} change" : function(route, ev, attr, how, newVal, oldVal){
		var list = this[attr + 'List'];
		if(list){
			this.options.params.toggleFilter(
				list.get(parseInt(newVal || oldVal))[0]);
		}
	},

	// =============================== Pagination ===============================

	/**
	 * Sets up `can.ui.TableScroll` on the table in the view.
	 */
	setupScroll : function(){
		var table = this.element.find('table');
		new can.ui.TableScroll(table);
		this.scrollable = table.parent();
		this.on(this.scrollable, 'scroll', this.proxy('loadNext'));
	},

	/**
	 * Load the next set of contacts when you reach the bottom of the grid.
	 */
	loadNext : function(){
		var el = this.scrollable;
		// we're at the bottom
		if (el[0].scrollHeight - el.scrollTop() == el.outerHeight() && !this.isLoading()) {
			this.options.params.attr("offset", this.options.params.offset + 30);
		}
	},

	/**
	 * Table header clicks, update the params object for sorting.
	 * @param  {[Object]} el
	 * @param  {[Object]} ev
	 */
	"th click" : function(el, ev){
		this.options.params.toggleOrder(el.data('order'));
	},

	/**
	 * Params object changed, call `loadContacts`
	 */
	"{params} change" : 'loadContacts',

	/**
	 * Loads the contacts for the parameters
	 * @param  {[Object]} params 
	 * @param  {[Object]} ev   
	 * @param  {[String]} attr 
	 */
	loadContacts : function(params, ev, attr){
		this.isLoading(true);
		Models.Contact.findAll(this.options.params.serialize(), 
			this.proxy('updateContacts', attr === 'offset'));
	},

	/**
	 * Update the contacts with the data.
	 * @param  {[Boolean]} append 
	 * @param  {[Object]} data   
	 */
	updateContacts : function(append, data){
		if(append){
			this.contactList.push.apply(this.contactList, data);
		} else {
			this.contactList.replace(data);
			this.scrollable.scrollTop(0);
		}
		
		this.total(data.count);
		this.element.find('#contact').trigger('resize');
		this.isLoading(false);
	},

	// =============================== Filtering ===============================

	/**
	 * Loads the Category, Location, Company and then applies filters.
	 * @return {[Deferred]} Deferred
	 */
	loadFilters : function(){
		this.isLoading(true);
		return $.when(
			Models.Category.findAll({}),
			Models.Location.findAll({}),
			Models.Company.findAll({})
		).then(this.proxy('updateFilters'));
	},

	/**
	 * Update the lists with the filtered items.
	 * @param  {[String]} categories
	 * @param  {[String]} locations  
	 * @param  {[String]} companies  
	 */
	updateFilters : function(categories, locations, companies){
		this.categoryList.replace(categories);
		this.locationList.replace(locations);
		this.companyList.replace(companies);
		this.isLoading(false);
	}
	
});

// Return the instance of the Contacts App
return new ContactsApp('.contacts-app');

});