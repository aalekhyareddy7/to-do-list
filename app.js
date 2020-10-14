//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-aal:Test123@cluster0.uw1rl.mongodb.net/todolistDB",{
      useNewUrlParser: true ,
      useUnifiedTopology: true 
});

const itemSchema=new mongoose.Schema({
   name:String
});

const Item=mongoose.model("Item",itemSchema);
 
const sleep=new Item({
  name:"Sleep"
});
const brush=new Item({
  name:"Brush"
});
const bath=new Item({
  name:"Bath"
});

const defArray=[sleep,brush,bath];
const listSchema=new mongoose.Schema({             // for customListName
  name:String,
  items:[itemSchema]
});
const List=mongoose.model("List",listSchema);


app.get("/", function(req, res) {
 Item.find({},function(err,foundItems){
  if (foundItems.length===0)
  {
       Item.insertMany(defArray,function(err){
          if(err){
             console.log(err);
          }
          else{
             console.log("Inserted def items Succesfully");
          }
       });
       res.redirect("/");   //redirects to home route so it can insert more (goes to else)
  }
  else
  {   
      res.render("list", {listTitle: "Today", newListItems: foundItems}); 
  }
});
});

app.post("/", function(req, res){

  const itemName = req.body.newItem; //for item
  const listName = req.body.list;   //for list name
  const item=new Item({
    name:itemName
  });
  if(listName==="Today")
  {
    item.save();
    res.redirect("/");
  }
  else{    //custom list
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);   //pushing new item into custom list
      foundList.save();
      res.redirect("/"+listName);
    })
  }
  
});
app.post("/delete",function(req,res){
  const remId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(remId,function(err){
      if(!err)
      {
        console.log("Successfully Deleted from Default route");
        res.redirect("/");
      }
    });
  }
  else
  {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:remId}}},function(err,results){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }
  mongoose.set('useFindAndModify', false);
  
})
app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,results){
  if(!err){
    if(!results)
    {
      //create new list
      const list=new List({
        name:customListName,
        items:defArray
      });
      list.save();
      res.redirect("/"+customListName);
    }
    else
    {
      //show an existing list
      res.render("list", {listTitle: results.name, newListItems: results.items}); 
    }
  }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started on port 3000");
});
