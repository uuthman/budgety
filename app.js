
// BUDGET CONTROLLER
var budgetController = (function () {

    
    var Expense = function (id, desc, value) {
        this.id = id;
        this.desc = desc;
        this.value = value;
    };


    var Income = function (id, desc, value) {
        this.id = id;
        this.desc = desc;
        this.value = value;
    };

    var data = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0
        }
    };

    return {
        addItem: function (type,desc,value) {
            var newItem,ID;

            //Create New ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else{
                ID = 0;
            }


            //Create new item based on 'inc' or 'exp'
            if (type === 'exp') {
                newItem = new Expense(ID,desc,value);
            }else if (type === 'inc') {
                newItem = new Income(ID,desc,value);
            }

            //Push it into our data structure
            data.allItems[type].push(newItem);

            //Return the new element
            return newItem;
        },

        testing : function () {
            console.log(data);
        }
    }

})();

// UI CONTROLLER
var UIController = (function () {

    var DOMstrings = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
    };


    return {
        getInput: function () {
            return{
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDesc).value,
                value: document.querySelector(DOMstrings.inputValue).value,
            };
        },

        addListItem: function(obj,type){

            var html, newHtml, element;

            //Create html string with placeholder
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
            html = '<div class="item clearfix" id="income-%id%"> <div class="item__description">%description%</div>' +
                ' <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> ' +
                '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            }else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
            html = '<div class="item clearfix" id="expense-%id%"> <div class="item__description">%description%</div> ' +
                '<div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">10%</div> ' +
                '<div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            }

            //Replace the text holder with actual text
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.desc);
            newHtml = newHtml.replace('%value%',obj.value);

            //Insert the html into the dom
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);

        },
        getDOMstring: function () {
            return DOMstrings;
        }
    }

})();

//GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListener = function () {
        var DOM = UICtrl.getDOMstring();

        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);

        document.addEventListener('keypress',function (event) {
            if (event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });
    };



    var ctrlAddItem = function () {
        var input, newItem;

        //1. Get the field input data
        input = UICtrl.getInput();
        //2. Add item to the budget controller
        newItem = budgetCtrl.addItem(input.type,input.description,input.value);
        //3.Add item to the ui
        UICtrl.addListItem(newItem,input.type);
        //4.Calculate the budget

        //5.Display the budget on the ui
        // console.log('working.');
    };


    return {
        init: function () {
            console.log('Application has started');
            setupEventListener();
        }
    }


})(budgetController,UIController);


controller.init();




