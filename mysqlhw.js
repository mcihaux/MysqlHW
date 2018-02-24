var mysql = require("mysql");
var prompt = require("prompt");
var inquirer = require("inquirer");

//  mysql connection
var connection = mysql.createConnection({
    host : "localhost",
    user : "root",
    password : "",
    database : "Just_Products"
});

// Connecting to the Just_Products Database
connection.connect(function(err){
    if(err){
    console.log('Error connecting to Db');
    return;
    }
    console.log('Connection established');

    var schema = {
        properties: {
            ID: {
            message: "What would you like to buy?",
            pattern: /^[0-9][0-9]$|^[0-9]$/,
            required: true
            },
            howMany: {
            message: "Please enter how many you would like to buy.",
            pattern: /^[0-9][0-9]$|^[0-9][0-9][0-9]$/,
            required: false
            }
        }
    };

    var schema2 = {
        properties: {
            AnotherPurchase: {
            message: "Would you like to buy another item?.",
            pattern: /no|n|yes|y/,
            required: true
            },
        }
    };

// Function stop to the app
 
 function stopApp(){
return process.exit();
}
// Function to start the app
function start(){
    connection.query("SELECT * FROM Just_Products", function(err, result) {
        if (err) throw err;
        return (getProducts(result));
      
      });
}

    // Function to display all of the products available for sale in a table
    var getProducts = function (products){
        console.log("Hello, Welcome to Just Products! Here are all of the products, their costs, and current inventory.");
        for (var i = 0; i < products.length; i++) {
            var productsResults = "\r\n"+
            "ItemID: " + products[i].id+"\r\n"+
            "Product Description: " + products[i].Product+"\r\n"+
            "Department: " + products[i].Department+"\r\n"+
            "Price: $ "+ products[i].Price+"\r\n"+
            "Current Stock: " + products[i].Inventory;
            console.log(productsResults);


        } return userSelectID(products.length);
    }

    // Function to get the user selection
    var userSelectID = function(length){





        prompt.start();
        console.log("Please enter the ID of the product you would like to buy.");

        prompt.get(schema, function (err, result) {
            if (err){
                console.log(err)
            }
            

            var userChoiceID = parseInt(result.ID);


            var userChoiceHowMany = parseInt(result.howMany);
            // console.log("id=" + userChoiceID + " how many=" + userChoiceHowMany);

            // Function to check the inventory of an item
            var checkInventory = function(){
                connection.query('SELECT * FROM Just_Products WHERE id =' + userChoiceID, function(err, result) {
                    if (err) throw err;
                    //console.log(result);

                    var userWantsToBuy = userChoiceHowMany;
                    var productInventory = result[0].Inventory;
                    var productsPrice = result[0].Price;
                    var isInStock = productInventory - userWantsToBuy;
                    var totalCost= productsPrice * userWantsToBuy;
                    

                   
                    if (userWantsToBuy > productInventory || productInventory === 0){
                        console.log("Apologies but there isn't enough in stock to complete your order. Please try again."+"\r\n"+"\r\n");
                        userSelectID();
                    } else {
                        
                        console.log("There are "+result[0].Inventory+" of "+result[0].Product);
                        console.log("You are purchasing "+ userWantsToBuy +" "+result[0].Product+"s at $"+ result[0].Price+" per item.");
                        console.log("Your total is $"+totalCost);
                        connection.query('UPDATE Just_Products SET Inventory = '+isInStock+' WHERE id ='+userChoiceID, function(err, result){
                        if (err) throw err;
                            connection.query('SELECT id, Product, Department, Price, Inventory FROM Just_Products WHERE id ='+userChoiceID, function(err, result){
                                //console.log(result);
                            }); 
                        });
                        prompt.get(schema2, function (err, result) {
                            if (err){
                                console.log(err)
                            }
                            var userAnswer = result.AnotherPurchase;
                            if (userAnswer === "n" || userAnswer === "no"){
                                stopApp();
                            }else{
                                start();
                            }   
                        });
                    }
                  });
            };
            checkInventory();
        });
    }

// start the app
start();
});


