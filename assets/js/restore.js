$(document).ready(function(){
	$.jstree._themes = 'assets/js/themes/';
	//backup picker
	$('#list_tree').jstree({
		'plugins': ['themes', 'json_data', 'ui', 'types'],
		'themes': {
			'theme': 'default',
			'dots': false,
			'icons': true
		},
		'json_data': { 
			'ajax': {
				'url': window.href,
				'data': function (n) { 
					return { 
						'action': 'list_dir', 
						'path': $(n).data('path')
					}; 
				}
			}
		},
		'types': { 
			'types': { 
				'default': { 
					'select_node': function(e) {
						var info = e.data('manifest');
						if (info && typeof info == 'object') {
							$('#picker_name').text(info.name);
							$('#picker_ctime').text(new Date(info.ctime * 1000).toString());
							$('#picker_nfiles').text(info.file_count);
							$('#picker_nmdb').text(info.mysql_count);
							$('#picker_nadb').text(info.astdb_count);
							$('#list_data').show();
						} else {
							$('#list_data').hide();
							this.toggle_node(e);
						}
					} 
				},	
			} 
		},
	});
	
	//set path before clicking submit
	$('#restore_browes_frm').submit(function(){
		file = $('#list_tree').jstree('get_selected');
		if (file && file.hasClass('jstree-leaf')) {
			$('input[name=restore_path]').val(file.data('path'));
		} else {
			alert('Please select a file!');
			return false;
		}
	});
	
	//backup file picker
	if ($('#backup_files').length > 0) {
		$('#backup_files').jstree({
			'plugins': ['themes', 'json_data', 'ui', 'types', 'checkbox'],
			'themes': {
				'theme': 'default',
				'dots': false,
				'icons': true
			},
			'json_data': { 
				'data' : FILE_LIST,
				'progressive_render': true
			},
			'types': { 
				'types': { 
					'default': { 
						'select_node': function(e) {
							this.toggle_node(e);
						} 
					},	
				} 
			},
		})
	}
	
	//include items to restore
	$('#files_browes_frm').submit(function(){
		//remove stale file entires
		$('input[name^=restore_items[files]]').remove();
		
		//get checked files
		$("#backup_files").jstree("get_checked",null,false).each(function() {
			
			//add them to the form
			$('#files_browes_frm').append(
				'<input type="hidden" name="restore[files][]" value="'
				+ $(this).data('path')
				+ '" >'
			);
		 });
	});

	//restore templates
	$('#templates > li').draggable({
		revert: true,
		cursor: 'move'
	}).disableSelection();
	
	$("#backup_files").droppable({
		drop: function(event, ui) {
			current_items_over_helper('show');
			var data = JSON.parse(decodeURIComponent(ui.draggable.data('template')));
			console.log(data)
			for (var i in data) {
				console.log(data[i].type, data[i].path);
				if (data[i].type == 'dir' || data[i].type == 'file') {
					new check_node()($("#backup_files"), data[i].path);
				}
			}
			//add_template(data);
		},
		over: function(event, ui) {
			current_items_over_helper('hide');
		},
		out: function(event, ui) {
			current_items_over_helper('show');
		}
	});
	
})
//

function check_node() {
	var level	= typeof level == 'undefined' ? 1 : level;
	var worker	= function(el, path) {
		
		root	= level == 1 ? el : root;
		path	= path.slice(-1) == '/' ? path.slice(0, - 1) : path;
		tempath	= '/' + path.substring(1).split('/').splice(0, level).toString().replace(/,/g, '/');
		//console.log('looking for', tempath, "in", $(el), 'root', root, 'level', level)

		//look through all the child nodes of el
		$(el).children().children().each(function(){
			//console.log($(this), tempath, $(this).data('path'), 'at level', level)

			//if we have a node with a matching path
			if ($(this).data('path') == tempath) {
				//console.log('searching', $(this).data('path'));
				
				//if this node is checked, everything deep will be included, so no need to traverse deeper
				if (root.jstree("is_checked", this)) {
					return false;
				}

				//if this is the node we are looking for, check it and break
				if ($(this).data('path') == path) {

					$.jstree._reference(root).check_node($(this));
					return false;

					//otherwise, open the node and keep on looking
				} else {
					root.jstree("open_node", this);
					level++;
					worker($(this), path, level);
				}
			}
		})

		//cleanup: close all unchecked nodes
		root.jstree("get_unchecked",null,false).each(function(){
			root.jstree("close_node", this);
		})
	}
	
	return worker;
}


function current_items_over_helper(action) {
	switch (action) {
		case 'show':
			$('#items_over').hide();
			$("#restore_items").show();
			//$('#add_entry').show();
			break;
		case 'hide':
			width = $("#restore_items").width();
			//height = $("#backup_files").height();
			//height2 = $("#backup_files").height();
			
			$('#items_over').width(width);
			$('#items_over').height('200px');
			
			
			$("#restore_items").hide();
			//$('#add_entry').hide();
			$('#items_over').show();
			break;
	}
}