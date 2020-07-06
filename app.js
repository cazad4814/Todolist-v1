const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _ =require("lodash");

const app = express();
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb+srv://admin-chandan:hindustan@@@cluster0.nebmg.mongodb.net/todolistDB",{useNewUrlParser:true, useUnifiedTopology: true});

const itemsSchema={
    name:String
};
///////item list....
const Item=mongoose.model("Item",itemsSchema);
const Item1=new Item({
name:"welcome to your todolist!"
});
const Item2=new Item({
    name:"Hit the button to add a new item." 
    });
    const Item3=new Item({
        name:"<--Hit this to delete an item."
        });

 const defaultItems=[Item1,Item2,Item3];

/////////////work list/....
const ListSchema={
name:String,
items:[itemsSchema]
};
const List=mongoose.model("List",ListSchema);



app.get("/",function(req,res){
    Item.find({},function(err,foundItems){
        
if(foundItems.length==0){
    Item.insertMany(defaultItems,function(err){
        if(err){
            console.log(err);
        }else{
           console.log("Successfully saved default database!");
        }
    });
   res.redirect("/");
}else{
    
    res.render("list",{
        listTitle:"Today", newlistitem:foundItems
        });
}
        
    });
    

    const today=new Date();
    const options = {

         weekday: 'long',
      month: 'long', 
      day: 'numeric' };


       let day=today.toLocaleDateString("en-US", options);
      


});



app.get("/:customListName",function(req,res){
    const customListName=_.capitalize(req.params.customListName);
List.findOne({name:customListName},function(err,foundList){
if(!err){
   if(!foundList){   

const list=new List({
    name: customListName,
    items:  defaultItems
});
list.save();
res.redirect("/"+customListName);
   }else{
    res.render("list",{
        listTitle:foundList.name, newlistitem:foundList.items
        });
}
   }

});





app.post("/",function(req,res){


const itemName=req.body.newItem;
const listName=req.body.list;
const item=new Item({
    name:itemName
});

if(listName==="Today"){
  item.save();
  res.redirect("/");
}else{
List.findOne({name:listName},function(err,foundList){
foundList.items.push(item);
foundList.save();
res.redirect("/"+listName);
});
}


});






});

app.post("/delete",function(req,res){
    const deletecollection=req.body.checkbox;
    const listName=req.body.listName;
if(listName==="Today"){
    Item.findByIdAndRemove(deletecollection,function(err){
        if(!err){
            console.log("Successfully deleted checked item.");
            res.redirect("/");
        }
    })
}else{
    List.findOneAndUpdate( 
        { name: listName },
        { $pull: { items : { _id: deletecollection } } },
        function(err,foundList) {
            if(!err){
                res.redirect("/"+listName);
            }
        });
       
}
  
});


app.listen(3000,function(){
    console.log("Server started on port 3000") ;
});