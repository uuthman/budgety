
// BUDGET CONTROLLER
var budgetController = (function () {

    
    var Expense = function (id, desc, value) {
        this.id = id;
        this.desc = desc;
        this.value = value;
        this.percentage = -1;
    };


    Expense.prototype.calcPercentage = function (totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / 100) * 100);
        }else{
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    var Income = function (id, desc, value) {
        this.id = id;
        this.desc = desc;
        this.value = value;
    };

    var calculateItem = function (type) {
        var sum = 0;

        data.allItems[type].forEach(function (current) {
           sum += current.value;
        });

        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget:0,
        percentage: -1,
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

        deleteItem: function(type,id){

            var ids, index;
            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);
            
            if (index !== -1){
                data.allItems[type].splice(index,1);
            }


        },
        calculateBudget: function(){

            //calculate total income and expenses
            calculateItem('inc');
            calculateItem('exp');

            //calc the budget income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            //calc percentage of income spent
            if (data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else{
                data.percentage = -1;
            }

        },
        calculatePercentages: function(){

            data.allItems.exp.forEach(function (current) {
                current.calcPercentage(data.totals.inc);
            })
        },

        getPercentages: function(){

            var allPerc = data.allItems.exp.map(function (current) {
                return current.getPercentage();
            });

            return allPerc;
        },

        getBudget: function(){

            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage:data.percentage,
            };
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
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'

    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++){
            callback(list[i],i);
        }
    };

    var formatNumber = function (num, type) {
        var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        
        if (int.length > 3){
            int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3,3);
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };


    return {
        getInput: function () {
            return{
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDesc).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
            };
        },

        addListItem: function(obj,type){

            var html, newHtml, element;

            //Create html string with placeholder
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
            html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div>' +
                ' <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> ' +
                '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            }else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
            html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> ' +
                '<div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">10%</div> ' +
                '<div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            }

            //Replace the text holder with actual text
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.desc);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));

            //Insert the html into the dom
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);

        },
        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);

            el.parentNode.removeChild(el);
        },


        clearFields: function() {

            var fields, fieldArr;

            //This returns a list
            fields = document.querySelectorAll(DOMstrings.inputDesc + ', ' + DOMstrings.inputValue);

            fieldArr = Array.prototype.slice.call(fields);

            fieldArr.forEach(function (current,index,array) {

                current.value = "";
            });

            fieldArr[0].focus();

        },

        displayBudget: function(obj){

            var type;

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');

            if (obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';

            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';

            }

        },

        changeType: function(){

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDesc + ',' +
                DOMstrings.inputValue
            );

            nodeListForEach(fields,function (cur) {
               cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);


            nodeListForEach(fields,function (current, index) {
                if (percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                } else{
                    current.textContent = '---';
                }
            })
        },

        displayMonth: function (){
            var now,month,year;

            now = new Date();

            month = now.getMonth();

            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = month + ' ' + year;
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

        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changeType)
    };

    var updateBudget = function () {
        //1.Calculate the budget
        budgetCtrl.calculateBudget();
        //2. Return the budget
        var budget = budgetCtrl.getBudget();
        //3.Display the budget on the ui
        UICtrl.displayBudget(budget);
    };

    var updatePercentage = function () {
        //1. Calculate percentages
        budgetCtrl.calculatePercentages();
        //2. Read percentages from the budget controller
        var percs = budgetCtrl.getPercentages();
        //3.  Update the new ui with the new percentages
        UICtrl.displayPercentages(percs);
    };


    var ctrlAddItem = function () {
        var input, newItem;

        //1. Get the field input data
        input = UICtrl.getInput();
        
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //2. Add item to the budget controller
            newItem = budgetCtrl.addItem(input.type,input.description,input.value);
            //3.Add item to the ui
            UICtrl.addListItem(newItem,input.type);
            //4. Clear fields
            UICtrl.clearFields();
            //5. Calculate and update budget
            updateBudget();
            //6. Calculate and update percentages
            updatePercentage();
        }
    };

    var ctrlDeleteItem = function (event) {

        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. delete the item from the data structure
            budgetCtrl.deleteItem(type,ID);
            //2. delete the item from the ui
            UICtrl.deleteListItem(itemID);
            //3. update and show the new budget
            updateBudget();
            //4. Calculate and update percentages
            updatePercentage();
        }

    };


    return {
        init: function () {
            console.log('Application has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage:-1,
            });
            setupEventListener();
        }
    }


})(budgetController,UIController);


controller.init();




