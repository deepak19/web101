/*  ----- CART CONTROLLER -----  */
var cartController = (function () {
    var data = {
        allItems: [],
        subtotal: 0,
        promotion: 0,
        shipping: 0,
        finalTotal: 0
    }
    var calculateCart = function () {
        data.subtotal = 0;
        data.allItems.forEach(function (cur) {
            data.subtotal += (cur.discountprice * cur.quantity);
        });
        if (data.subtotal - data.promotion >= 50 || data.subtotal === 0) {
            data.shipping = 0;
        } else {
            data.shipping = 3; // Fee for shipping
        }
        data.finalTotal = (data.subtotal - data.promotion) + data.shipping;
        console.log(data);
    }

    return {
        passJson: function (datajson) {
            data.allItems = datajson.cartitems;
            calculateCart();
            return data;
        },
        updateData: function (id) {
            if (id) { //remove item logic
                var removeIndex = data.allItems.map(function (cur) {
                    return cur.id;
                }).indexOf(parseInt(id));
                if (removeIndex > -1) data.allItems.splice(removeIndex, 1);
            }
            console.log(data);
            calculateCart();
            return data;
            //            data.allItems.forEach(function (cur) {
            //                if(cur.id == id){
            //
            //                }
            //            });
        },
        savePopupData: function (id) {
            var index = data.allItems.map(function (cur) {
                return cur.id;
            }).indexOf(parseInt(id));
            data.allItems[index].size = document.querySelector('.editsize').value;
            data.allItems[index].quantity = parseInt(document.querySelector('.editqty').value);
            calculateCart();
        },
        getData: function () {
            return data;
        }
    }
})();


/*  ----- UI CONTROLLER -----  */
var UIController = (function () {

    return {
        renderHandlebar: function (data) {
            reisterHelpers();
            var theTemplateScript = $("#address-template").html();
            var theTemplate = Handlebars.compile(theTemplateScript);
            if (data.cartitems.length) {
                document.querySelector('.table-head tr th:first-child span').textContent = data.cartitems.length;
            }
            var theCompiledHtml = theTemplate(data);
            document.querySelector('.cart-placeholder').innerHTML = '';
            document.querySelector('.cart-placeholder').innerHTML = theCompiledHtml;
            //            $('.cart-placeholder').html('');
            //            $('.cart-placeholder').html(theCompiledHtml);
        },
        updateCheckout: function (cal) {
            document.querySelector('.subtotal span').textContent = cal.subtotal;
            document.querySelector('.pcode span').textContent = cal.promotion;
            if (cal.shipping > 0) {
                document.querySelector('.shipcost span').textContent = cal.shipping;
            } else {
                document.querySelector('.shipcost span').textContent = "FREE";
            }
            document.querySelector('.finalTotal span').textContent = cal.finalTotal;
            document.querySelector('.table-head tr th:first-child span').textContent = cal.allItems.length;
        },
        updateItems: function (data, id) {
            var index = data.allItems.map(function (cur) {
                return cur.id;
            }).indexOf(parseInt(id));
            var product = data.allItems[index];
            document.querySelector('.itemid-' + id + ' .item-size').textContent = product.size;
            document.querySelector('.itemid-' + id + ' .item-qty textarea').value = product.quantity;
            document.querySelector('.itemid-' + id + ' .item-price span').textContent = (product.discountprice * product.quantity);
        },
        removeFromCart: function (id) {
            var el = document.querySelector('.itemid-' + id);
            if (el) el.parentNode.removeChild(el);
        },
        editPopup: function (data, id) {
            var index = data.allItems.map(function (cur) {
                return cur.id;
            }).indexOf(parseInt(id));
            //update popup
            document.querySelector('.name').textContent = data.allItems[index].name;
            document.querySelector('.name').dataset.id = data.allItems[index].id;
            document.querySelector('.price span').textContent = data.allItems[index].discountprice;
            document.querySelector('.editsize').value = data.allItems[index].size;
            document.querySelector('.editqty').value = data.allItems[index].quantity;
            document.querySelector('.viewit img').src = data.allItems[index].photo;
            //show popup
            document.getElementById('editModal').style.visibility = "visible";
            document.getElementById('editModal').style.opacity = "100";
        }
    }

})();

/*  ----- GLOBAL APP CONTROLLER -----  */
var controller = (function (cartCtrl, UICtrl) {
    var datajson;
    var setupEventListners = function () {
        var calculation;
        //For Remove button
        document.querySelector('.cart-placeholder').addEventListener('click', function (event) {
            if (event.target.classList.contains('remove') && event.target.dataset.id) {
                UICtrl.removeFromCart(event.target.dataset.id);
                //update data
                calculation = cartCtrl.updateData(event.target.dataset.id);
                UICtrl.updateCheckout(calculation);
            }
        });
        //For Edit button
        document.querySelector('.cart-placeholder').addEventListener('click', function (event) {
            if (event.target.classList.contains('edit') && event.target.dataset.id) {
                UICtrl.editPopup(cartCtrl.getData(), event.target.dataset.id);
            }
        });
        //for close button
        document.querySelector('.modal .close').addEventListener('click', function () {
            //document.getElementById('editModal').style.display = "none";
            document.getElementById('editModal').style.visibility = "hidden";
            document.getElementById('editModal').style.opacity = "0";
        });
        //for Edit and Save from popup
        document.querySelector('.editdone button').addEventListener('click', function () {
            var target, calculation, data;
            target = document.querySelector('.name').dataset.id;
            if (target) {
                target = parseInt(target);
                cartController.savePopupData(target);
                data = cartCtrl.getData();
                UICtrl.updateItems(data, target);
                UICtrl.updateCheckout(data);
            }
            document.getElementById('editModal').style.visibility = "hidden";
            document.getElementById('editModal').style.opacity = "0";
        });
    }
    return {
        init: function () {
            var calculation;
            console.log('Application has Started.');
            //get Shopping cart details from server
            var data = httpGet('http://www.mocky.io/v2/5b1ed4a03100008a233ff9f6');
            datajson = JSON.parse(data);
            //Update Handlebar data
            UICtrl.renderHandlebar(datajson);
            calculation = cartCtrl.passJson(datajson);
            UICtrl.updateCheckout(calculation);
            //setup events
            setupEventListners();
        }
    }

})(cartController, UIController);

controller.init();

/* HTTP GET function*/
function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
    //        xmlHttp.setRequestHeader("Access-Control-Allow-Origin", "*");
    //    xmlHttp.setRequestHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    xmlHttp.send();
    return xmlHttp.responseText;
}

//Register HandleBar helper for additional handlebar feature
function reisterHelpers() {
    Handlebars.registerHelper('sum', function (a, b) {
        return a + b;
    });
       Handlebars.registerHelper('mul', function (a, b) {
        return a * b;
    });
}
