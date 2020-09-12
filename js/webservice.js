// WEB SERVICES:
function getRainfall(monthID, yearID) {
    console.log(yearID + ' | ' + monthID);
    $.ajax({
        url: '/rainfall/' + yearID + '/' + monthID,
        type: 'GET',
        cache: false,
        dataType: 'json',
        success: function (data) {
            changeNumDrops(data.Value);
            getDataMonths(yearID, monthID);
            getDataYears(yearID, monthID);
            updateRainData(data.Value);
            vieweditRemove();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert(jqXHR + '\n' + textStatus + '\n' + errorThrown);
        }
    });
}

function getYears() {
    document.getElementById('months').style.display = 'none';
    
    hideEditRemove();

    $.ajax({
        url: '/rainfall/all',
        type: 'GET',
        cache: false,
        dataType: 'json',
        success: function (data) {
            var sel = document.getElementById('years');

            // remove all children:
            sel.options.length = 0;

            // add default Years value:
            sel.options[sel.options.length] = new Option('Year', 'none');

            $.each(data, function (index, rainfall) {
                var opt = document.createElement('option');
                opt.appendChild(document.createTextNode(rainfall.yearID));
                opt.value = rainfall.yearID;
                opt.text = rainfall.yearID;
                sel.add(opt);
            });

            document.getElementById('years').style.display = '';
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert(jqXHR + '\n' + textStatus + '\n' + errorThrown);
        }
    });
}

function getMonths(yearID) {
    $.ajax({
        url: '/rainfall/' + yearID + '/all',
        type: 'GET',
        cache: false,
        dataType: 'json',
        success: function (data) {
            var sel = document.getElementById('months');

            sel.options.length = 0;

            sel.options[sel.options.length] = new Option('Month', 'none');

            $.each(data, function (index, rainfall) {
                var opt = document.createElement('option');
                opt.appendChild(document.createTextNode(rainfall.monthName));
                opt.value = rainfall.monthID;
                opt.text = rainfall.monthName;
                sel.add(opt);
            });

            document.getElementById('months').style.display = '';
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert(jqXHR + '\n' + textStatus + '\n' + errorThrown);
        }
    });
}

function getDataMonths(yearID, monthID) {
    $.ajax({
        url: '/rainfall/' + yearID + '/' + monthID + '/d',
        type: 'GET',
        cache: false,
        dataType: 'json',
        success: function (data) {
            updateMonthData(monthID, data);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            return null;
        }
    });
}

function getDataYears(yearID, monthID) {
    $.ajax({
        url: '/rainfall/' + yearID + '/' + monthID + '/y',
        type: 'GET',
        cache: false,
        dataType: 'json',
        success: function (data) {
            updateYearData(yearID, monthID, data);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            return null;
        }
    });
}

function editRainfall() {
    var ySel = document.getElementById('years');
    var mSel = document.getElementById('months');

    yearID = ySel.options[ySel.selectedIndex].getAttribute("value");
    monthID = mSel.options[mSel.selectedIndex].getAttribute("value");

    $.ajax({
        url: '/rainfall/' + yearID + '/' + monthID,
        type: 'GET',
        cache: false,
        dataType: 'json',
        success: function (data) {
            createEditRainfallForm(data);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert(jqXHR + '\n' + textStatus + '\n' + errorThrown);
        }
    });
}

function addNewRainfall() {
    createNewRainfallForm();
}

// GRAPHICAL FUNCTIONS:
const pageWidth = window.innerWidth;
const pageHeight = window.innerHeight;
const defaultDropNum = 0;

function makeItRain (num) {
    let elements = document.getElementById("drops-section");

    while (elements.hasChildNodes()) {
        elements.removeChild(elements.lastChild);
    }

    for (let i = 0; i < (num * 5); i++) {
        let randomX = Math.floor(Math.random() * (pageWidth));
        let randomY = Math.floor(Math.random() * (pageHeight));
        let dropSpeed = Math.floor(Math.random() * (25 - 5)) + 5;
        let dropWidth = Math.floor(Math.random() * (dropSpeed/10 - 1)) + 1;
        let dropHeight = Math.floor(Math.random() * (dropSpeed*2 - 3)) + 3;
        let d = new Drop(randomX, randomY, dropSpeed, dropWidth, dropHeight);

        d.show();
        d.fall();
    }
}

function updateNumberInView(num) {
    let el = document.getElementById("dropsNum").firstChild;
    el.nodeValue = num;

    if (num == 0) {
        let infoSec = document.getElementById("info-section");
        infoSec.style.display = "none";
    }
}

function changeNumDrops(num) {
    updateNumberInView(num);
    makeItRain(num);
}

updateNumberInView(defaultDropNum);
makeItRain(defaultDropNum);

// DATA INPUT FUNCTIONS:
function selectYearChanged(select) {
    // Year selected is: select.options[select.selectedIndex].getAttribute("value");
    var value = select.options[select.selectedIndex].getAttribute("value");

    if (value != 'none') {
        getMonths(value);
    } else if (value == 'none') {
        var sel = document.getElementById('months');
        sel.style.display = 'none';
    }
}

function selectMonthChanged(select) {
    var value = select.options[select.selectedIndex].getAttribute("value");

    if (value != 'none') {
        // only request the selected month/year if the month select box is not none,
        // don't need to do anything if it is none:
        var years = document.getElementById('years');
        var yValue = years.options[years.selectedIndex].getAttribute("value");

        getRainfall(value, yValue);
    }
}

// EDIT RAINFALL FUNCTIONS:
function createEditRainfallForm(data) {
    console.log("ID: " + data.RainfallId);
    var strResult = '<div>';
    strResult += '<form role="form">';
    strResult += '<div><label for="rainfallYear">Year</label><div><input type="text" id="rainfallYear" value="' + data.Year + '"></div></div>';
    strResult += '<div><label for="rainfallMonth">Month</label><div><input type="text" id="rainfallMonth" value="' + data.Month + '"></div></div>';
    strResult += '<div><label for="rainfallValue">Value</label><div><input type="text" id="rainfallValue" value="' + data.Value + '"></div></div>';
    strResult += '<div><div><input type="button" value="Edit Rainfall" onclick="editRainfallValue(' + data.RainfallId + ');" />&nbsp; &nbsp;<input type="button" value="Cancel" onclick="cancelChangeRainfall();"/></div></div>';
    strResult += '</form></div>';
    $('#newrainfallform').html(strResult);
}

function cancelChangeRainfall() {
    $('#newrainfallform').html("");
}

function editRainfallValue(rainfallId) {
    var rainfall = {
        RainfallID: rainfallId,
        MonthID: $('#rainfallMonth').val(),
        YearID: $('#rainfallYear').val(),
        RainfallVal: $('#rainfallValue').val()
    };

    $.ajax({
        url: '/rainfall',
        type: 'PUT',
        data: JSON.stringify(rainfall),
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            getRainfall(rainfall.MonthID, rainfall.YearID);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert(jqXHR + '\n' + textStatus + '\n' + errorThrown);
        }
    });
    $('#newrainfallform').html("");
}

// ADD RAINFALL FUNCTIONS:
function createNewRainfallForm() {
    var strResult = '<div>';
    strResult += '<form role="form">';
    strResult += '<div><label for="rainfallYear">Year</label><div><input type="text" id="rainfallYear"></div></div>';
    strResult += '<div><label for="rainfallMonth">Month</label><div><input type="text" id="rainfallMonth"></div></div>';
    strResult += '<div><label for="rainfallValue">Value</label><div><input type="text" id="rainfallValue"></div></div>';
    strResult += '<div><div><input type="button" value="Add Rainfall" onclick="addNewRainfallValue()" /> &nbsp; &nbsp; <input type="button" value="Cancel" onclick="cancelNewRainfall();" /></div></div>';
    $('#newrainfallform').html(strResult);
}

function cancelNewRainfall() {
    $('#newrainfallform').html("");
}

function addNewRainfallValue() {
    var rainfall = {
        RainfallID: null,
        MonthID: $('#rainfallMonth').val(),
        YearID: $('#rainfallYear').val(),
        RainfallVal: $('#rainfallValue').val()
    };

    $.ajax({
        url: '/rainfall',
        type: 'POST',
        data: JSON.stringify(rainfall),
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            getYears();
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert(jqXHR + '\n' + textStatus + '\n' + errorThrown);
        }
    });
    $('#newrainfallform').html("");
}

// REMOVE RAINFALL FUNCTIONS:
function removeRainfall() {
    var ySel = document.getElementById('years');
    var mSel = document.getElementById('months');

    yearID = ySel.options[ySel.selectedIndex].getAttribute("value");
    monthID = mSel.options[mSel.selectedIndex].getAttribute("value");

    $.ajax({
        url: '/rainfall/' + yearID + '/' + monthID,
        type: 'DELETE',
        dataType: 'json',
        success: function (data) {
            getYears();
            changeNumDrops(0);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert(jqXHR + '\n' + textStatus + '\n' + errorThrown);
        }
    });
}

// UI FUNCTIONS:
function hideEditRemove() {
    document.getElementById("removeButton").style.visibility = 'hidden';
    document.getElementById("editButton").style.visibility = 'hidden';
}

function vieweditRemove() {
    document.getElementById("removeButton").style.visibility = 'visible';
    document.getElementById("editButton").style.visibility = 'visible';
}

function updateInfoForm(year, month, value) {
    let yearPos = getDataYears(year, month);
    let montPos = getDataMonths(year, month);
    let infoSec = document.getElementById("info-section");

    // Error check
    if (yearPos == null || montPos == null) {
        infoSec.style.display = "flex";
    } else {
        // Hide Info form:
        infoSec.style.display = "none";
    }
}

function updateMonthData(month, montPos) {
    let infoSec = document.getElementById("info-section");
    if (infoSec.style.display === "none") {
        infoSec.style.display = "flex";
    }

    let monthName = convertNumToString(month);
    let monthData = document.getElementById("month_data");
    monthData.textContent = "This " + monthName + " is at number " + montPos + " for wettest " + monthName + " in our records.";
}

function updateYearData(year, month, yearPos) {
    let infoSec = document.getElementById("info-section");
    if (infoSec.style.display === "none") {
        infoSec.style.display = "flex";
    }

    let monthName = convertNumToString(month);
    let yearData = document.getElementById("year_data");

    if (yearPos > 9) {
        yearData.textContent = "In " + year + ", " + monthName + " was number " + (13 - yearPos) + " for driest month";
    } else {
        yearData.textContent = "In " + year + ", " + monthName + " was at number " + yearPos + " for wettest month";
    }
}

function updateRainData(value) {
    let infoSec = document.getElementById("info-section");
    if (infoSec.style.display === "none") {
        infoSec.style.display = "flex";
    }

    let rainData = document.getElementById("rainfall_data");
    rainData.textContent = "The average rainfall for this month would count it overall as " + convertNumToCategory(value);
}

function convertNumToString(monthID) {
    switch (monthID) {
        case "1":
            return "January";
        case "2":
            return "February";
        case "3":
            return "March";
        case "4":
            return "April";
        case "5":
            return "May";
        case "6":
            return "June";
        case "7":
            return "July";
        case "8":
            return "August";
        case "9":
            return "September";
        case "10":
            return "October";
        case "11":
            return "November";
        case "12":
            return "December";
    }
}

function convertNumToCategory(value) {
    if (value < 9.00) {
        return "light rainfall";
    } else if (value < 36.00) {
        return "moderate rainfall";
    } else if (value < 180) {
        return "heavy rain";
    } else {
        return "violent rain";
    }
}