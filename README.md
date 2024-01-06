# Airtable Mindmap

A script that allows you to visualize your data as a mind map, based on the [Airtable Extensions](https://support.airtable.com/docs/airtable-extensions-overview).

## Usage
- the content of the mindmap-airtable.js file needs to be copied in a new [Scripting Extension](https://support.airtable.com/docs/en/scripting-extension-overview) in your Airtable base (warning, Extensions are not available with free plan !)
- the content of the html folder needs to be hosted somewhere (you can use [https://basteks.github.io/mindmap](https://basteks.github.io/mindmap) for testing purpose only)

Once you create your Extension, access the settings page by clicking the gear icon that appears when hovering over the upper right corner.
Here are the available settings :
- *URL*: URL of the mindmap.html file. The style of the map is base on the file jsmind.css but, for now, we consider, that this file is in the same folder as mindmap.html
- *Table*: the table containing the rows you want to visualize
- *View*: the view containing the rows
- *Name col*: the col containing the name displayed in the mind map's nodes
- *Relationship col*: the col containing the relationship (parent/child) bewteen the nodes
- *Relationship*: let you choose which kind of relationship is described in the relationship col. The options are _parent_ (the listed row is the parent of the current row) or _child_
- *Root node*: let you choose if there is a root node in your records, or if it has to be created on top of your records. The options are _yes_ or _no_
- *Map title*: the name of the map (displayed in the root node if you haven't one in your records, or as the html page title if you do)

## Limitations
As all the displayed data (data to display and ids of the parentnodes) are passed through the URL of the map, you may encounter a _414 URI Too Long_ error if you try to display too much markers or too much data for each marker on your map.

## ToDo
- Add support for special col rendering like URLs, mails or attachment by creating an html `href` link, and images.
- Convert this script to a proper extension in order to avoid the mindmap.html file hosting and to get rid of the potential _414 URI Too Long_ error.

## Credits
Based on the great [jsMind](https://github.com/hizzgdev/jsmind) JavaScript mind mapping library !