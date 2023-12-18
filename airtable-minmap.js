const config = input.config({
    title: 'MindMap',
    description: 'A script that lets you visualize your data as a mind map',
    items: [
        input.config.text('mapURL', {
            label: 'URL of the mindmap.html file',
        }),
        input.config.table('table', {
            label: 'Table',
            description: 'The table containing the records you want to visualize'
        }),
        input.config.view('view', {
            label: 'View',
            description: 'The view containing the records',
            parentTable: 'table',
        }),
        input.config.field('nameField', {
            label: 'Name field',
            description: "The field containing the name displayed in the mind map's nodes",
            parentTable: 'table',
        }),
        input.config.field('relationshipField', {
            label: 'Relationship field',
            description: "The field containing the relationship bewteen the nodes",
            parentTable: 'table',
        }),
        input.config.select('relationship', {
            label: 'Relationship',
            description: 'What kind of relatinship is described',
            options: [
                {label: 'Parent', value: 'parent'},
                {label: 'Child', value: 'child'}
            ]
        }),
        input.config.select('rootNode', {
            label: 'Root node',
            description: 'Is there a root node in your records (higher map level than any others)?',
            options: [
                {label: 'Yes', value: 'yes'},
                {label: 'No', value: 'no'}
            ]
        }),
        input.config.text('mapTitle', {
            label: 'Map title (displayed in the root node)',
        }),
    ]
});

const table = config.table;
const view = config.view;
const nameField = config.nameField;
const relationshipField = config.relationshipField;
const mapTitle = config.mapTitle;
const mapURL = config.mapURL;
const relationship = config.relationship;
const rootNode = config.rootNode;

let query = await view.selectRecordsAsync({fields: [nameField, relationshipField]});

var data = [];
var error = false;

function findNode(node) {
    let res = false;
    for (let i=0;i<data.length;i++) {
        if(data[i].id == node.id && data[i].topic == node.getCellValueAsString(nameField.name)) {
            res = true;
            break;
        }
    }
    return res;
}

function findStringInArray (str, strArray) {
    for (var j=0; j<strArray.length; j++) {
        if (strArray[j].match(str)) return true;
    }
    return false;
}

if (relationship =="child") {
    for (let i=0;i<query.records.length;i++){
        if(!findNode(query.records[i])) {
            data.push({"id":query.records[i].id, "isroot": false, "parentid":[], "topic":query.records[i].getCellValueAsString(nameField.name)});
        }
        let children = query.records[i].getCellValue(relationshipField.name);
        if (children != null && children.length>0) {
            for (let j=0;j<children.length;j++) {
                if(!findNode(query.getRecord((children[j].id)))) {
                    let node = query.getRecord((children[j].id));
                    data.push({"id":node.id, "isroot": false, "parentid": [query.records[i].id],"topic":node.getCellValueAsString(nameField.name)});
                }
                else {
                    let node=null;
                    node = data.find(o => o.id == children[j].id);
                    if (node!= null) {node.parentid.push(query.records[i].id); }
                }
            }
        }
    }
}
else {
    for (let i=0;i<query.records.length;i++){
        if(!findNode(query.records[i])) {
            data.push({"id":query.records[i].id, "isroot": false, "parentid":[], "topic":query.records[i].getCellValueAsString(nameField.name)});
        }
        let parents = query.records[i].getCellValue(relationshipField.name);
        if (parents != null && parents.length>0) {
            for (let j=0;j<parents.length;j++) {
                if(!findNode(query.getRecord((parents[j].id)))) {
                    let node = query.getRecord((parents[j].id));
                    data.push({"id":node.id, "isroot": false, "parentid": [],"topic":node.getCellValueAsString(nameField.name)});
                }
                let node=null;
                node = data.find(o => o.id == query.records[i].id);
                if (node!= null) {node.parentid.push(parents[j].id); }
            }
        }
    }
}

if (rootNode=='yes') {
    let rootCounter = 0;
    let rootIdx = -1;
        for (let i=0;i<data.length;i++) {
            if (data[i].parentid.length==0) {
                rootCounter +=1;
                rootIdx = i;
            }
        }
    if (rootCounter>1 || rootIdx == -1) {
        output.markdown("**Error finding the root node !**")
        if (rootCounter>1) { output.markdown("We found "+rootCounter.toString()+ " root nodes. Please check your data.")}
        error = true;
    }
    else {
        data[rootIdx]["level"]=0;
        data[rootIdx].parentid.push("");
        data[rootIdx]["isroot"]=true;
    }
}
else {
    for (let i=0;i<data.length;i++) {
        if (data[i].parentid.length==0) {
            data[i].parentid.push('root');
            data[i]["level"]=0;
        }   
    }
}
for (let i=0;i<data.length;i++) {
    if (data[i].parentid.length>1) {
        for (let p=0;p<data[i].parentid.length;p++) {
            data.push({"id":data[i].parentid[p]+"-"+data[i].id, "isroot": data[i].isroot, "parentid":[data[i].parentid[p]], "topic":data[i].topic});
        }
    }
}
for (let i=0;i<data.length;i++) {
    if (data[i].parentid.length>1) {
        data.splice(i,1);
    }
}
if (!error) {
    for (let i=0;i<data.length;i++) {
        if (!('level' in data[i] && data[i].level==0))
        {
            let inverselevel = 99;
            let level = 0;
            var parent = data[i];
            while(inverselevel>0) {
                if (data[i].parentid.length>0 && data[i].parentid[0]!="") {
                    parent = data.find(o => o.id == parent.parentid[0]);
                    level += 1;
                    if ('level' in parent) { inverselevel = parent.level; }
                }
            }
            data[i].level = level;
        }
    }

    let firstLevel = rootNode=='no' ? 0 : 1;
    let firstLevelCounter = 0;
    for (let i=0;i<data.length;i++) {
        if (data[i].level == firstLevel) {
            firstLevelCounter +=1;
        }
    }
    output.markdown("## List of the records and their relationships :")
    output.table(data);

    var str="";

    for (let i=0;i<data.length;i++) {
        let mlevel = data[i].level;
        if(rootNode=='no') { mlevel += 1; }
        let mdir="";
        if (mlevel==1 && i<=firstLevelCounter/2) { mdir = 'L'; }
        else if (mlevel==1){ mdir = 'R'; }
        if (!(str === "")) {
            str+=';'
        }
        str+=mlevel.toString()+','+data[i].isroot+','+data[i].parentid[0]+','+mdir+','+data[i].id+','+data[i].topic;
    }
    output.markdown("[Link to the mind map]("+mapURL+encodeURI('?t='+mapTitle+'?r='+rootNode+'?nodes='+str)+")");
    output.markdown("_Script completed successfully_");
}
