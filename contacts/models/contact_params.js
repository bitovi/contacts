steal('can/observe', function(Observe){
	return Observe({
		toggleOrder : function(order){
			var orders = this.attr('order'),
				currentOrder;
			for(var i = 0; i < orders.length; i++){
				currentOrder = orders[i].split(' ');
				if(currentOrder[0] === order){
					if(currentOrder[1] === 'ASC'){
						this.attr('order.' + i, currentOrder[0] + " DESC");
					} else if(currentOrder[1] === 'DESC'){
						this.attr('order').splice(i, 1);
					}
					return;
				}
			}
			this.attr('order').push(order + " ASC");
		},
		orderedBy : function(order){
			var length = this.attr('order').attr('length'),
				currentOrder;

			for(var i = 0; i < length; i++){
				currentOrder = this.attr('order.' + i).split(' ');
				if(currentOrder[0] === order){
					return currentOrder[1];
				}
			}
			return false;
		},
		toggleFilter : function(filter){
			var filterName = this.filterName(filter),
				filterData = {offset: 0};
			if(this.isActiveFilter(filter)){
				this.removeAttr(filterName);
			} else {
				filterData[filterName] = filter.id;
				this.attr(filterData);
			}
		},
		filterName : function(filter){
			return filter.constructor._shortName + "Id";
		},
		isActiveFilter : function(filter){
			var filterName    = this.filterName(filter),
				currentFilter = this.attr(filterName),
				id            = filter.attr('id');
			return currentFilter === id;
		}
	});
});