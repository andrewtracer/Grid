Ext.Loader.setConfig({
    enabled: true
});
Ext.Loader.setPath('Ext.ux', './ext/examples/ux');

Ext.require([
    'Ext.selection.CellModel',
    'Ext.grid.*',
    'Ext.data.*',
    'Ext.util.*',
    'Ext.state.*',
    'Ext.form.*',
    'Ext.ux.CheckColumn',
    'Ext.ux.form.MultiSelect'
]);



Ext.onReady(function() {

// Defines record type 'Data' for files
   Ext.define('Data', {
	extend: 'Ext.data.Model',
	   fields: [
		{name: 'filename', type: 'string'},
		{name: 'area', type: 'string'},
		{name: 'displaybackground', type: 'string'},
		{name: 'displaymeas', type: 'string'},
		{name: 'group', type: 'string'}
		]
	});

// configure row editing
    var rowEditing = Ext.create('Ext.grid.plugin.RowEditing', {
        clicksToEdit: 2,
	listeners: {
	   edit: function() {
		Ext.Msg.alert('Update', 'Entry ' + myGrid.store.indexOf(myGrid.getSelectionModel().getSelection()[0]) + ', "' + myGrid.getSelectionModel().getSelection()[0].data['filename'] + '" updated');
	}
   }
	
    });

// configuring selection Model (listener events are in the grid itself)
   var rowSelecting = Ext.create('Ext.selection.RowModel', {
	allowDeselect: false,
	clicksToSelect: 1,
  	enableKeyNav : true,
	});


// create the Data Store
    var store = Ext.create('Ext.data.Store', {
        // destroy the store if the grid is destroyed
        autoDestroy: true,
        model: 'Data',
        proxy: {
            type: 'rest',
	    url: '/files',
            reader: {
                type: 'json',
                // records will have a 'plant' tag
                record: 'Data'
            }
        },
        sorters: [{
            property: 'filename',
            direction:'ASC'
        }]
    });

// create the grid
var myGrid = Ext.create('Ext.grid.Panel', {
   title: 'Data Files',
   store: store,
   sm: rowSelecting,
   columns: [
	{
	   header: 'Files', 
	   dataIndex: 'filename', 
	   flex: 1,
	   field: {
		xtype: 'textfield',
		allowBlank: false
	},
},
// combobox editing on 'area' to select file type (i.e. background or not)
	{header: 'Type', dataIndex: 'area', flex: 1,},
	{header: 'Background Files', dataIndex: 'displaybackground', flex: 1},
	{header: 'Measurement Files', dataIndex: 'displaymeas', flex: 1},
	{header: 'Group', dataIndex: 'group', flex: 1}
     ],
// tbar buttons for adding new files, setting group, and setting type
   tbar: [{
	text: 'Add a File',
	handler: function(){
	   var newFile = Ext.ModelManager.create({
		filename: 'new_file'+myGrid.getStore().count(), area: 'Not Selected'}, 'Data');
	store.insert(0, newFile);
	console.log('You have now entered ' + myGrid.getStore().count() + ' file(s) in total.');
	}
    },
{
	text: 'Add Multiple Files',
	handler: function() {
	   Ext.Msg.prompt('Add Files?','Please enter the number of files to add (0-20):', function(btn, strnum){
	if (btn == 'ok'){
		for (var i = 0; i < strnum; i++) {
			var newFile = Ext.ModelManager.create({
		filename: 'new_file' + myGrid.getStore().count() , area: 'Not Selected'}, 'Data');
			store.insert(0, newFile);
			}
		console.log('You have now entered ' + myGrid.getStore().count() + ' file(s) in total.');
		}
	});
   }
   },
{
	id: 'groupButton',
	xtype: 'button',
	text: 'Group',
	menu: [{
	text: 'Set Group',
	handler: function() {
	 	Ext.Msg.prompt('Set Group?', 'Please enter the group name:', function(btn, grpnm) {
		if (btn == 'ok'){
			var newGroup = myGrid.store.findExact('group', grpnm);
			for (ind in myGrid.getSelectionModel().getSelection()) {
		   	   myGrid.getSelectionModel().getSelection()[ind].set('group', grpnm)
			}
		if (newGroup != -1) {
			console.log(myGrid.getSelectionModel().getSelection().length + ' entrie(s) added to group ' + grpnm);
			}
		else {console.log('New group created with ' + myGrid.getSelectionModel().getSelection().length + ' entries.')}
		} 	
	    }
	)}
}, {
	text: 'Clear Group',
	handler: function() {
		for (ind in myGrid.getSelectionModel().getSelection()) {
			var rec = myGrid.getSelectionModel().getSelection()[ind]
			rec.set('group', '')
		}
		console.log('Group cleared for ' + myGrid.getSelectionModel().getSelection().length + ' entries.')
	}
}]
},
{	text: 'Type',
	id: 'typeButton',
	xtype: 'button',
	menu: [
	{text: 'Mark as Background',
	 handler: function() {
		for (ind in myGrid.getSelectionModel().getSelection()) {
			var rec = myGrid.getSelectionModel().getSelection()[ind]
			rec.set('area','BACKGROUND');
			rec.set('displaybackground',rec.get('filename'));
			rec.set('displaymeas','');
			}
		console.log(myGrid.getSelectionModel().getSelection().length + ' entries marked as background.')
		}   
	},
	{text: 'Mark as Measurement',
	 handler: function() {
		for (ind in myGrid.getSelectionModel().getSelection()) {
			var rec = myGrid.getSelectionModel().getSelection()[ind]
			rec.set('area','MEASUREMENT');
			rec.set('displaymeas',rec.get('filename'));
			rec.set('displaybackground','');
			}
		console.log(myGrid.getSelectionModel().getSelection().length + ' entries marked as measurements.')
		}	
},
	{text: 'Reset',
	 handler: function() {
		for (ind in myGrid.getSelectionModel().getSelection()) {
			var rec = myGrid.getSelectionModel().getSelection()[ind]
			rec.set('area','Not Selected');
			rec.set('displaybackground',rec.get(''));
			rec.set('displaymeas','');
			}
		console.log(myGrid.getSelectionModel().getSelection().length + ' entries unmarked.')
			
		}
	
}
	]
}
],
// selection-related events and configs
   listeners: {
		select: function() {
			},
		selectionchange: function() {
			}
		},
   multiSelect: true,
   plugins: [rowEditing],
   height: 500,
   width: 850,
   renderTo: 'gridtest'
});

// setting up mouseover text/tooltip for tbar buttons
Ext.create('Ext.tip.ToolTip', {
    target: 'groupButton',
    html: 'Marks selected file(s) as group',
});
Ext.create('Ext.tip.ToolTip', {
    target: 'typeButton',
    html: 'Marks selected file(s) as type',
});



});
