/*
 var selectmenu=document.getElementById("generateCSV")
selectmenu.addEventListener(
    'click',
    function() {
		
		var csv = "Site URL, Site Name, Site Owners\n";
		csv += data.url + "|" + data.name + "|" + data.administrators + "\n";
		for(var i = 0; i < data.children.length; i++)
		{
			var lvl1 = data.children[i];
			csv += lvl1.url + "|" + lvl1.name + "|" + lvl1.administrators + "\n";
			for(var j = 0; j < lvl1.children.length; j++)
			{
				var lvl2 = lvl1.children[j];
				csv += lvl2.url + "|" + lvl2.name + "|" + lvl2.administrators + "\n";
				for(var k = 0; k < lvl2.children.length; k++)
				{
					var lvl3 = lvl2.children[k];
					csv += lvl3.url + "|" + lvl3.name + "|" + lvl3.administrators + "\n";
					for(var l = 0; l < lvl3.children.length; l++)
					{
						var lvl4 = lvl3.children[l];
						csv += lvl4.url + "|" + lvl4.name + "|" + lvl4.administrators + "\n";
						for(var o = 0; o < lvl4.children.length; o++)
						{
							var lvl5 = lvl4.children[o];
							csv += lvl5.url + "|" + lvl5.name + "|" + lvl5.administrators + "\n";
						}
					}
				}
			}
		}
	
	},
    false
 );
*/

var selectedObj;
var data;
var dataCopy;

$(document).ready(function() {

	var selectmenu = document.getElementById("migrationSelect")
	selectmenu.addEventListener(
		'change',
		function() {
			$("#graph").html("");
			initGraph("json?name=" + $("#migrationSelect option:selected").text());
		},
		false
	);

	initGraph("json?name=" + $("#migrationSelect option:selected").text());
});

function initGraph(request) {

	dialog = $("#updateMigration").dialog({
		autoOpen: false,
		height: 500,
		width: 700,
		modal: true
	});

	$('#addMigration > form').submit(function(e) {
		e.preventDefault();
		$.ajax({
			url: $('#addMigration > form').attr("action"),
			data: $(this).serialize(),
			type: 'post',
			success: function(data) {
				addMigrationDialog.dialog('close');
			}
		});
	});

	addMigrationDialog = $('#addMigration').dialog({
		autoOpen: false,
		height: 500,
		width: 700,
		modal: true,
		buttons: {
			Save: function(arg) {
				//Save
				$('#addMigration > form').submit();
			},
			Cancel: function() {
				addMigrationDialog.dialog('close');
			}
		}
	});

	$("#migrationAdd").click(function() {
		addMigrationDialog.dialog('open');
		addMigrationDialog.dialog('option', 'title', 'Add migration');
	});

	d3.json(request, function(error, dataToUse) {
		data = dataToUse;
		dataCopy = $.extend(true, {}, dataToUse); // deep copy

		// ************** Generate the tree diagram	 *****************
		var margin = {
				top: 20,
				right: 120,
				bottom: 20,
				left: 120
			},
			width = 3500 - margin.right - margin.left,
			height = 3500 - margin.top - margin.bottom;

		var i = 0,
			duration = 750,
			root;

		var tree = d3.layout.tree()
			.size([height, width]);

		var diagonal = d3.svg.diagonal()
			.projection(function(d) {
				return [d.y, d.x];
			});

		var svg = d3.select("#graph").append("svg")
			.attr("width", width + margin.right + margin.left)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		root = data;
		root.x0 = height / 2;
		root.y0 = 0;

		root.children.forEach(collapse);

		update(root);

		d3.select(self.frameElement).style("height", "500px");

		function update(source) {

			// Compute the new tree layout.
			var nodes = tree.nodes(root).reverse(),
				links = tree.links(nodes);

			// Normalize for fixed-depth.
			nodes.forEach(function(d) {
				d.y = d.depth * 360;
			});

			// Update the nodes�
			var node = svg.selectAll("g.node")
				.data(nodes, function(d) {
					return d.id || (d.id = ++i);
				});

			// Enter any new nodes at the parent's previous position.
			var nodeEnter = node.enter().append("g")
				.attr("class", "node")
				.attr("transform", function(d) {
					return "translate(" + source.y0 + "," + source.x0 + ")";
				});

			nodeEnter.append("circle")
				.attr("r", 1e-6)
				.style("fill", function(d) {
					return d._children ? "lightsteelblue" : "#fff";
				})
				.on("click", click2)
				.attr("stroke-width", "2px")
				.attr("stroke", function(d) {
					return colorCode(d);
				});

			nodeEnter.append("text")
				//.on("click", function(d,i) { openInNewTab(d.url); })
				.on("click", function(d, i) {
					openPopup(d);
				})
				.attr("x", function(d) {
					return d.children || d._children ? -13 : 13;
				})
				.attr("dy", ".35em")
				.attr("text-anchor", function(d) {
					return d.children || d._children ? "end" : "start";
				})
				.html(function(d) {
					return d.name + " <p style='background-color:blue;'>(" + d.lastmodified + ")</p>";
				})
				.style("fill-opacity", 1e-6)
				.append("svg:title")
				.text(function(d) {
					return d.name + "\n" + d.administrators + "\n" + d.lastmodified + "\n" + d.itemcount;
				});

			nodeEnter.append("text")
				.attr("x", function(d) {
					return d.children || d._children ? 80 : -80;
				})
				.attr("dy", "0.35em")
				.attr("fill", "blue")
				.attr("text-anchor", function(d) {
					return d.children || d._children ? "end" : "start";
				})
				.html(function(d) {
					return d.lastmodified + "-" + d.itemcount;
				})
				.style("fill-opacity", 1)

			// Transition nodes to their new position.
			var nodeUpdate = node.transition()
				.duration(duration)
				.attr("transform", function(d) {
					return "translate(" + d.y + "," + d.x + ")";
				});

			nodeUpdate.select("circle")
				.attr("r", 10)
				.style("fill", function(d) {
					return d._children ? "lightsteelblue" : "#fff";
				});

			nodeUpdate.select("text")
				.style("fill-opacity", 1);

			// Transition exiting nodes to the parent's new position.
			var nodeExit = node.exit().transition()
				.duration(duration)
				.attr("transform", function(d) {
					return "translate(" + source.y + "," + source.x + ")";
				})
				.remove();

			nodeExit.select("circle")
				.attr("r", 1e-6);

			nodeExit.select("text")
				.style("fill-opacity", 1e-6);

			// Update the links�
			var link = svg.selectAll("path.link")
				.data(links, function(d) {
					return d.target.id;
				});

			// Enter any new links at the parent's previous position.
			link.enter().insert("path", "g")
				.attr("class", "link")
				.attr("d", function(d) {
					var o = {
						x: source.x0,
						y: source.y0
					};
					return diagonal({
						source: o,
						target: o
					});
				});

			// Transition links to their new position.
			link.transition()
				.duration(duration)
				.attr("d", diagonal);

			// Transition exiting nodes to the parent's new position.
			link.exit().transition()
				.duration(duration)
				.attr("d", function(d) {
					var o = {
						x: source.x,
						y: source.y
					};
					return diagonal({
						source: o,
						target: o
					});
				})
				.remove();

			// Stash the old positions for transition.
			nodes.forEach(function(d) {
				d.x0 = d.x;
				d.y0 = d.y;
			});
		}

		function colorCode(d) {
			if (d.lastmodified < 2014) // voor 2014
				return "red"; //archiveren
			if (d.itemcount < 50) // na 2014 minder dan 50 bestanden
				return "orange"; // archiveren/migreren/deleten?
			return "green"; // na 2014 meer dan 50 bestanden migreren
		}

		function openInNewTab(url) {
			var win = window.open(url, '_blank');
			if (win) {
				//Browser has allowed it to be opened
				win.focus();
			}
			else {
				//Broswer has blocked it
				alert('Please allow popups for this site');
			}
		}

		function collapse(d) {
			if (d.children) {
				d._children = d.children;
				d._children.forEach(collapse);
				d.children = null;
			}
		}

		// Toggle children on click.
		function click(d) {
			if (d.children) {
				d._children = d.children;
				d.children = null;
			}
			else {
				d.children = d._children;
				d._children = null;
			}
			update(d);
		}

		function click2(d) {
			if (d.children) {
				collapse(d);
			}
			else {
				expand(d);
			}
			update(d);
		}

		function expand(d) {
			if (d.children) {
				d._children = d.children;
				d.children = null;
			}
			else {
				d.children = d._children;
				d._children = null;
			}
			if (d.children != undefined)
				d.children.forEach(expand);
		}

		function filter(d) {
			if (d.children) {
				var indicesToDelete = [];
				for (var index = 0; index < d.children.length; ++index) {
					if (d.children[index].lastmodified < document.getElementById("selector").value)
						indicesToDelete.push(index);
				}
				for (var index2 = indicesToDelete.length - 1; index2 >= 0; index2--) {
					d.children.splice(indicesToDelete[index2], 1);
				}
			}
			if (d.children != undefined)
				d.children.forEach(filter);

			return d.name;
		}

		function openPopup(d) {
			dialog.dialog('open');
			dialog.dialog('option', 'title', d.name);
			$('#updateMigration-form input[name="siteOwners"]').val(d.administrators);
			$('#updateMigration-form textarea[name="Comments"]').val(d.comments || "");
			selectedObj = d;
			
			//var reactData = $.extend({}, selectedObj); // shallow copy
			
			var reactData = findNode(selectedObj.url, dataCopy);

			ReactDOM.render(
				React.createElement(IW.Reactors.UpdateMigrationBox, {data : reactData }),
				document.getElementById('updateMigration')
			);
			
		}

	});

};


function findNode(url, dataNode) {
	var i,
		currentChild,
		result;

	if (url == dataNode.url) {
		return dataNode;
	}
	else {

		// Use a for loop instead of forEach to avoid nested functions
		// Otherwise "return" will not work properly
		for (i = 0; i < dataNode.children.length; i += 1) {
			currentChild = dataNode.children[i];

			// Search in the current child
			result = findNode(url, currentChild);

			// Return the result if the node has been found
			if (result !== false) {
				return result;
			}
		}

		// The node has not been found and we have no more options
		return false;
	}
}

