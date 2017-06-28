/*
Copyright 2017 Doxee S.p.A.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */
function eDox() {
    console.log('Loaded eDox');

    var animationInterval = 10;
    var animationLength = 1000;

    // var dTmp = new Date();
    // var currentDate = new Date(2017, 4, 20, dTmp.getHours(), dTmp.getMinutes(), dTmp.getSeconds(), dTmp.getMilliseconds());
    var currentDate = new Date();
    
    console.log('Current Date: ');
    console.log(currentDate);

    // Missing Data
    var $missingData = $('#missing-data');

    // Loading screen
    var $loadingScreen = $('#loading-screen');

    // Sections
    var $sectionInfoNow = $('#info-now');
    var $sectionInfoPast = $('#info-past');

    // Navigation
    var $btnAllNavButtons = $('.btn-period-selection');
    var $btnNow = $('#btn-now');
    var $btnToday = $('#btn-today');
    var $btnThisWeek = $('#btn-this-week');
    var $btnThisMonth = $('#btn-this-month');
    var $btnThisYear = $('#btn-this-year');
    var minPeriod = 'H';
    var dateFormatsByMinPeriod = {
        "H": {
            "dateFormat": "DD.MM.YYYY JJ",
            "categoryBalloonFormat": "DD/MM/YYYY HH",
            "categoryAxisMinPeriod": 'hh'
        },
        "G": {
            "dateFormat": "DD.MM.YYYY",
            "categoryBalloonFormat": "DD/MM/YYYY",
            "categoryAxisMinPeriod": 'DD'
        },
        "M": {
            "dateFormat": "MM.YYYY",
            "categoryBalloonFormat": "MM/YYYY",
            "categoryAxisMinPeriod": 'MM'
        }
    };

    // School and Plant selection
    var schoolData = null;
    var $selectSchoolName = $('#sel-school-name');
    var $selectPlantName = $('#sel-plant-name');

    /************************************************************
     * Section "info-now"
     ************************************************************/
    // Ultimo Dato
    var oraUltimoDato = '-:-';
    var $oraUltimoDato = $('#ora-ultimo-dato');

    // Temperatura
    var temperaturaValue = 0;
    var $temperaturaCard = $('#temperatura-card');
    var $temperaturaDegree = $('#temperatura-degree');
    var $temperaturaProgressbar = $('#temepeartura-progressbar');

    // Umidità
    var umiditaValue = 0;
    var $umiditaCard = $('#umidita-card');
    var $umiditaPercentage = $('#umidita-percentage');
    var $umiditaProgressbar = $('#umidita-progressbar');

    // Umidità
    var luminositaValue = 0;
    var $luminositaCard = $('#luminosita-card');
    var $luminositaValue = $('#luminosita-value');
    var $luminositaProgressbar = $('#luminosita-progressbar');


    /************************************************************
     * Section "info-past"
     ************************************************************/
    // Charts
    var $btnAllGraphsButtons = $('.btn-chart-graph');
    var $btnGraphTemperatura = $('#btn-graph-temperatura');
    var $btnGraphUmidita = $('#btn-graph-umidita');
    var $btnGraphLuminosita = $('#btn-graph-luminosita');

    var $chartAllCharts = $('.chart');
    var $chartTemperatura = $('#chart-temperatura');
    var $chartUmidita = $('#chart-umidita');
    var $chartLuminosita = $('#chart-luminosita');
    var chartTemperatura = null;
    var chartUmidita = null;
    var chartLuminosita = null;
    var $btnAllExportButtons = $('.btn-chart-export');
    var $btnExportChartTemperatura = $('#chart-temperatura-export');
    var $btnExportChartUmidita = $('#chart-umidita-export');
    var $btnExportChartLuminosita = $('#chart-luminosita-export');


    // Init eDox
    Init();
    GetSchoolAndPlants();


    function Init() {
        ShowLoadingScreen();
        // HideLoadingScreen();

        InitSchoolSelection();
        InitPlantSelection();
        InitPeriodSelectionButtons();

        UpdateCurrentDataSection(null);
        Init_SectionPast();
    }


    function InitSchoolSelection() {
        $selectSchoolName.off('change').change(function () {
            var newSchoolName = GetSelectedSchoolName();

            // Avoid the empty option
            if (newSchoolName.length <= 0)
                return;

            UpdatePlantsData(schoolData[newSchoolName].sensors);
        });
    }


    function InitPlantSelection() {
        $selectPlantName.off('change').change(function () {
            var newPlantName = $selectPlantName.val();

            // Avoid the empty option
            if (newPlantName.length <= 0)
                return;

            $btnNow.click();

            // $btnAllNavButtons.filter('.active').click();
        });
    }


    function InitPeriodSelectionButtons() {
        // Now
        $btnNow.click(function () {
            $btnAllNavButtons.prop('disabled', true);

            // Enable "info-past" section and disable "info-now" section
            $sectionInfoNow.addClass('active');
            $sectionInfoPast.removeClass('active');

            // Activate the correct button
            $btnAllNavButtons.removeClass('active');
            $(this).addClass('active');

            // Get School and Plant
            var school = GetSelectedSchoolName();
            var systemID = GetSelectedSystemID();

            // Set starting date
            var dFrom = new Date(currentDate.toString());
            dFrom.setHours(0);
            dFrom.setMinutes(0);

            // Set end date
            var dTo = new Date(currentDate.toString());
            dTo.setHours(23);
            dTo.setMinutes(59);

            minPeriod = 'H';
            GetPlantData(school, systemID, null, null, 'H');
        });


        // Today
        $btnToday.click(function () {
            $btnAllNavButtons.prop('disabled', true);

            // Enable "info-past" section and disable "info-now" section
            $sectionInfoPast.addClass('active');
            $sectionInfoNow.removeClass('active');

            // Activate the correct button
            $btnAllNavButtons.removeClass('active');
            $(this).addClass('active');

            // Get School and Plant
            var school = GetSelectedSchoolName();
            var systemID = GetSelectedSystemID();

            // Set starting date
            var dFrom = new Date(currentDate.toString());
            dFrom.setHours(0);
            dFrom.setMinutes(0);

            // Set end date
            var dTo = new Date(currentDate.toString());
            dTo.setHours(23);
            dTo.setMinutes(59);

            minPeriod = 'H';
            GetPlantData(school, systemID, dFrom, dTo, 'H');
        });


        // This Week
        $btnThisWeek.click(function () {
            $btnAllNavButtons.prop('disabled', true);

            // Enable "info-past" section and disable "info-now" section
            $sectionInfoPast.addClass('active');
            $sectionInfoNow.removeClass('active');

            // Activate the correct button
            $btnAllNavButtons.removeClass('active');
            $(this).addClass('active');

            // Get School and Plant
            var school = GetSelectedSchoolName();
            var systemID = GetSelectedSystemID();

            // Set starting date
            var dFrom = new Date(currentDate.toString());
            dFrom.setHours(0);
            dFrom.setMinutes(0);

            // Find how many days to subtract to reach Monday
            var daysToSubtract = dFrom.getDay() - 1;
            if (dFrom.getDay() === 0) // Sunday
                daysToSubtract = 6;
            dFrom.setDate(dFrom.getDate() - daysToSubtract);

            // Set end date
            var dTo = new Date(currentDate.toString());
            dTo.setHours(23);
            dTo.setMinutes(59);

            minPeriod = 'G';
            GetPlantData(school, systemID, dFrom, dTo, minPeriod);
        });


        // This Month
        $btnThisMonth.click(function () {
            $btnAllNavButtons.prop('disabled', true);

            // Enable "info-past" section and disable "info-now" section
            $sectionInfoPast.addClass('active');
            $sectionInfoNow.removeClass('active');

            // Activate the correct button
            $btnAllNavButtons.removeClass('active');
            $(this).addClass('active');

            // Get School and Plant
            var school = GetSelectedSchoolName();
            var systemID = GetSelectedSystemID();

            // Set starting date
            var dFrom = new Date(currentDate.toString());
            dFrom.setDate(1);
            dFrom.setHours(0);
            dFrom.setMinutes(0);
            console.log("This month");
            console.log('Date From: ' + dFrom);

            // Find how many days to subtract to reach Monday
            var daysToSubtract = dFrom.getDay() - 1;
            if (dFrom.getDay() === 0) // Sunday
                daysToSubtract = 6;
            dFrom.setDate(dFrom.getDate() - daysToSubtract);

            // Set end date
            var dTo = new Date(currentDate.toString());
            dTo.setHours(23);
            dTo.setMinutes(59);
            console.log('Date To: ' + dTo);

            minPeriod = 'G';
            GetPlantData(school, systemID, dFrom, dTo, minPeriod);
        });


        // This Year
        $btnThisYear.click(function () {
            $btnAllNavButtons.prop('disabled', true);

            // Enable "info-past" section and disable "info-now" section
            $sectionInfoPast.addClass('active');
            $sectionInfoNow.removeClass('active');

            // Activate the correct button
            $btnAllNavButtons.removeClass('active');
            $(this).addClass('active');

            // Get School and Plant
            var school = GetSelectedSchoolName();
            var systemID = GetSelectedSystemID();

            // Set starting date
            var dFrom = new Date(currentDate.toString());
            dFrom.setDate(1);
            dFrom.setMonth(0);
            dFrom.setHours(0);
            dFrom.setMinutes(0);
            console.log("This Year");
            console.log('Date From: ' + dFrom);

            // Find how many days to subtract to reach Monday
            var daysToSubtract = dFrom.getDay() - 1;
            if (dFrom.getDay() === 0) // Sunday
                daysToSubtract = 6;
            dFrom.setDate(dFrom.getDate() - daysToSubtract);

            // Set end date
            var dTo = new Date(currentDate.toString());
            dTo.setHours(23);
            dTo.setMinutes(59);
            console.log('Date To: ' + dTo);

            minPeriod = 'M';
            GetPlantData(school, systemID, dFrom, dTo, minPeriod);
        });
    }


    /**
     * Init "Dati Passati" tab
     */
    function Init_SectionPast() {
        // $tableContainer.hide();
        // $chart.show();

        InitCharts();
        InitChartSelection();

        // InitTable();


        // $toggleChartTableView.click(function () {
        //     $chart.toggle();
        //     $tableContainer.toggle();
        // });
    }


    /**
     * Initialize all charts
     */
    function InitCharts() {
        AmCharts.monthNames = DefaultConfig.charts.monthNames;
        AmCharts.shortMonthNames = DefaultConfig.charts.shortMonthNames;

        // Charts Default Config
        var chartConfig = {
            "type": "serial",
            "language": "it",
            "dataDateFormat": "DD.MM.YYYY HH",
            "categoryField": "date",
            "categoryAxis": {
                "minPeriod": "hh",
                "parseDates": true,
                "dashLength": 3,
                "dateFormats": [
                    {
                        "period": "fff",
                        "format": "JJ:NN:SS"
                    },
                    {
                        "period": "ss",
                        "format": "JJ:NN:SS"
                    },
                    {
                        "period": "mm",
                        "format": "JJ:NN"
                    },
                    {
                        "period": "hh",
                        "format": "JJ:NN"
                    },
                    {
                        "period": "DD",
                        "format": "DD/MM/YYYY"
                    },
                    {
                        "period": "WW",
                        "format": "MMM DD"
                    },
                    {
                        "period": "MM",
                        "format": "MMMM"
                    },
                    {
                        "period": "YYYY",
                        "format": "YYYY"
                    }
                ]
            },
            "chartCursor": {
                "enabled": true,
                "categoryBalloonDateFormat": "DD/MM/YYYY HH",
                "cursorColor": "#64BF99",
                "valueZoomable": false
            },
            "chartScrollbar": {
                "enabled": true
            },
            "valueScrollbar": {
                "enabled": true
            },
            "trendLines": [],
            "export": {
                "enabled" : true,
                "language": "it",
                "fileName" : '',
                "menuReviver": function(cfg, li) {
                    if (cfg.format == "CSV") {
                        cfg.delimiter = ";";
                    }
                    return li;
                },
            },
            "graphs": [{
                "balloonText": "Min: [[value]] Max: [[open]]",
                "id": "minMax",
                "fillColors": "#0385E8",
                "lineColor": "#0385E8",
                "lineThickness": 4,
                "columnWidth": 0.37,
                "fillAlphas": 1,
                "type": "column",
                "title": "Minimo-Massimo",
                "openField": "max",
                // "closeField": "max",
                "valueField": "min"
            },
                {
                    "balloonText": "Valore medio: [[value]]",
                    "id": "average",
                    "lineColor": "#FDD45B",
                    "lineThickness": 2,
                    "fillAlphas": 0,
                    "type": "smoothedLine",
                    "title": "Valore Medio",
                    "valueField": "avg"
                }],
            "guides": [{
                "balloonText": "Valore di guardia inferiore",
                "color": "#E9F2E7",
                "fillAlpha": 0.5,
                "fillColor": "#E9F2E7",
                "id": "guide-min",
                "toValue": 0,
                "value": 0
            },
                // {
                //     "balloonText": "Valore di guardia superiore",
                //     "color": "#FF0000",
                //     "fillAlpha": 1,
                //     "fillColor": "#FF0000",
                //     "id": "guide-max",
                //     "toValue": 0,
                //     "value": 0
                // }
            ],
            "valueAxes": [
                {
                    "id": "ValueAxis-1",
                    "gridThickness": 1
                }
            ],
            "allLabels": [],
            "balloon": {},
            "titles": [],
            "dataProvider": []
        };

        // Marcello Chaos, [09.06.17 18:07]
        // va buò li ho mappati alla fine
        // /** GRAFICI **/
        // t_line: #F54E34,
        //     t_col: #F2AFAA,
        //     u_line: #4CC5FF,
        //     u_col: #B3EDFF,
        //     l_line: #F8D43B,
        //     l_col: #F4E6AB,
        //     limit_area: #E9F2E7,

        // Temperatura
        var configTemperatura = JSON.parse(JSON.stringify(chartConfig));
        // configTemperatura.titles[0].text = "Temperatura";
        configTemperatura.graphs[0].balloonText = "Min: [[value]]° Max: [[open]]°";
        configTemperatura.graphs[0].lineColor = "#F2AFAA";
        configTemperatura.graphs[0].fillColors = "#F2AFAA";
        configTemperatura.graphs[1].balloonText = "Valore medio: [[value]]°";
        configTemperatura.graphs[1].lineColor = "#F54E34";
        configTemperatura.export.fileName = "grafico-temperatura";
        configTemperatura.export.divId = $btnExportChartTemperatura.attr('id');
        chartTemperatura = AmCharts.makeChart($chartTemperatura.attr('id'), configTemperatura);

        // Umidità
        var configUmidita = JSON.parse(JSON.stringify(chartConfig));
        // configUmidita.titles[0].text = "Umidità";
        configUmidita.graphs[0].balloonText = "Min: [[value]]% Max: [[open]]%";
        configUmidita.graphs[0].lineColor = "#B3EDFF";
        configUmidita.graphs[0].fillColors = "#B3EDFF";
        configUmidita.graphs[1].balloonText = "Valore medio: [[value]]%";
        configUmidita.graphs[1].lineColor = "#4CC5FF";
        configUmidita.export.fileName = "grafico-umidita";
        configUmidita.export.divId = $btnExportChartUmidita.attr('id');
        chartUmidita = AmCharts.makeChart($chartUmidita.attr('id'), configUmidita);

        // Luminosità
        var configLuminosita = JSON.parse(JSON.stringify(chartConfig));
        // configLuminosita.titles[0].text = "Luminosità";
        configLuminosita.graphs[0].balloonText = "Min: [[value]]lm Max: [[open]]lm";
        configLuminosita.graphs[0].lineColor = "#F4E6AB";
        configLuminosita.graphs[0].fillColors = "#F4E6AB";
        configLuminosita.graphs[1].balloonText = "Valore medio: [[value]]lm";
        configLuminosita.graphs[1].lineColor = "#F8D43B";
        configLuminosita.export.fileName = "grafico-luminosita";
        configLuminosita.export.divId = $btnExportChartLuminosita.attr('id');
        chartLuminosita = AmCharts.makeChart($chartLuminosita.attr('id'), configLuminosita);
    }


    function InitChartSelection() {
        $btnGraphTemperatura.click(function () {
            $btnAllGraphsButtons.removeClass('active');
            $chartAllCharts.removeClass('active');
            $btnAllExportButtons.removeClass('active');

            $btnGraphTemperatura.addClass('active');
            $btnExportChartTemperatura.addClass('active');
            $chartTemperatura.addClass('active');
        });

        $btnGraphUmidita.click(function () {
            $btnAllGraphsButtons.removeClass('active');
            $chartAllCharts.removeClass('active');
            $btnAllExportButtons.removeClass('active');

            $btnGraphUmidita.addClass('active');
            $btnExportChartUmidita.addClass('active');
            $chartUmidita.addClass('active');
        });

        $btnGraphLuminosita.click(function () {
            $btnAllGraphsButtons.removeClass('active');
            $chartAllCharts.removeClass('active');
            $btnAllExportButtons.removeClass('active');

            $btnGraphLuminosita.addClass('active');
            $btnExportChartLuminosita.addClass('active');
            $chartLuminosita.addClass('active');
        });

    }



    /**
     * Animate a jQuery-ui progress bar
     *
     * @param $progressBar
     * @param targetValue
     */
    function AnimateProgressBar($progressBar, targetValue) {
        var nDivisions = parseInt(animationLength / animationInterval);
        var step = targetValue / nDivisions;

        $progressBar.progressbar({
            value: 0
        });

        $progressBar.data('progressValue', 0);
        $progressBar.data('progressTargetValue', targetValue);
        $progressBar.data('progressStep', step);

        var theInterval = setInterval(function () {
            var progressValue = $progressBar.data('progressValue');
            var targetValue = $progressBar.data('progressTargetValue');

            progressValue += $progressBar.data('progressStep');


            if (progressValue > targetValue) {
                progressValue = targetValue;

                theInterval = $progressBar.data('progressBarInterval');
                clearInterval(theInterval);
            }

            $progressBar.progressbar({
                value: progressValue
            });
            $progressBar.data('progressValue', progressValue);
        }, animationInterval);

        $progressBar.data('progressBarInterval', theInterval);
    }


    /**
     * Get schools and plants data
     */
    function GetSchoolAndPlants() {
        ShowLoadingScreen();

        $.ajax({
            method: 'GET',
            // url: "./api/api_request_handler.php", // For LOCAL Development
            // data: {target_url: "https://ortodigitale.doxee.com/home"}, // For LOCAL Development
            url: "https://ortodigitale.doxee.com/home",
            data: {}
        }).done(function (msg, xhr) {
            try {
                console.log("home API");
                console.log(xhr);
                // var response = msg;
                if (xhr === "success") {
                    // var parsedMsg = JSON.parse(msg);
                    // var parsedData = JSON.parse(parsedMsg.data);
                    UpdateSchoolsData(msg);
                    // $selectSchoolName.change();
                    HideLoadingScreen();
                    HideMissingDataWarning();
                }
            }
            catch (err) {
                console.log('Exception:');
                console.log(err);
                console.log('Original Message:');
                console.log(msg);
                HideLoadingScreen();
            }
        }).fail(function (msg) {
            console.log("GetSchoolAndPlants Fail");
            console.log(msg);
            HideLoadingScreen();
        });
    }


    /**
     * Get plant data
     *
     * @param school
     * @param systemId
     * @param dateFrom
     * @param dateTo
     * @param minPeriod
     */
    function GetPlantData(school, systemId, dateFrom, dateTo, minPeriod) {
        console.log('school: ' + school);
        console.log('systemId: ' + systemId);
        console.log('sending request');
        // return;

        // Build the request parameters object
        var requestParameters = {};
        // requestParameters.target_url = "https://ortodigitale.doxee.com/data/";   // For LOCAL Development
        requestParameters.school = school;
        requestParameters.systemId = systemId;

        if (dateFrom !== null && dateFrom instanceof Date) {
            requestParameters.date_from = DateToDoxeeApiFormat(dateFrom);
        }

        if (dateTo !== null && dateTo instanceof Date) {
            requestParameters.date_to = DateToDoxeeApiFormat(dateTo);
        }


        if (minPeriod !== null && typeof minPeriod !== 'undefined')
            requestParameters.min_period = minPeriod;


        console.log('Request Parameters: ');
        console.log(requestParameters);

        ShowLoadingScreen();

        $.ajax({
            method: 'GET',
            // url: "./api/api_request_handler.php", // For LOCAL Development
            url: "https://ortodigitale.doxee.com/data/",
            data: requestParameters
        }).done(function (msg, xhr) {
            try {
                console.log("data API");
                console.log(xhr);
                // var response = msg;
                if (xhr === "success") {
                    // var parsedMsg = JSON.parse(msg);
                    // var parsedData = JSON.parse(parsedMsg.data);


                    if ($btnNow.hasClass('active'))
                        UpdateCurrentDataSection(msg);
                    else
                        UpdatePastDataSection(msg);
                }
                HideLoadingScreen();
            }
            catch (err) {
                console.log('Exception:');
                console.log(err);
                console.log('Response Message:');
                console.log(msg);
                HideLoadingScreen();
            }

            $btnAllNavButtons.prop('disabled', false);
        }).fail(function (msg) {
            console.log("Fail");
            console.log(msg);
            $btnAllNavButtons.prop('disabled', false);
            HideLoadingScreen();
        });
    }


    /**
     * Update schools data
     *
     * @param data
     */
    function UpdateSchoolsData(data) {
        console.log('UpdateSchoolData: ');
        console.log(data);

        $selectSchoolName.empty();
        $selectPlantName.empty();

        schoolData = data;

        // Put the "empty" options
        var $option = $('<option value="">Scegli una scuola</option>');
        $option.appendTo($selectSchoolName);

        $option = $('<option value="">Scegli una pianta</option>');
        $option.appendTo($selectPlantName);

        for (var school in schoolData) {
            if (schoolData.hasOwnProperty(school)) {
                console.log('Loop: ' + school);
                $option = $('<option value="' + school + '">' + school + '</option>');
                $option.appendTo($selectSchoolName);
            }
        }
    }


    /**
     * Update plants data
     *
     * @param data
     */
    function UpdatePlantsData(data) {
        $selectPlantName.empty();

        $option = $('<option value="">Scegli una pianta</option>');
        $option.appendTo($selectPlantName);

        for (var i = 0; i < data.length; i++) {
            var sensor = data[i];
            var $option = $('<option value="' + sensor.systemId + '">' + sensor.plantName + '</option>');
            $option.appendTo($selectPlantName);
        }

        // $selectPlantName.change();
    }


    /**
     * Update charts
     *
     * @param data
     */
    function UpdatePastDataSection(data) {
        console.log('Update Past Data Interface:');
        console.log('Response Data: ');
        console.log(data);

        if (data === null || typeof data === 'undefined' || typeof data.data === 'undefined') {
            console.log('Response data is undefined!');
            return;
        }

        var dataProviderTemperatura = [];
        var dataProviderUmidita = [];
        var dataProviderLuminosita = [];

        for (var i = 0; i < data.data.length; i++) {
            var entry = data.data[i];
            // console.log(entry);

            if (!('temperature' in entry) ||
                !('moisture') in entry ||
                !('brightness'))
                continue;

            dataProviderTemperatura.push({
                "date": entry.date,
                "min": entry.temperature.min,
                "max": entry.temperature.max,
                "avg": entry.temperature.avg
            });

            dataProviderUmidita.push({
                "date": entry.date,
                "min": entry.moisture.min,
                "max": entry.moisture.max,
                "avg": entry.moisture.avg
            });

            dataProviderLuminosita.push({
                "date": entry.date,
                "min": entry.brightness.min,
                "max": entry.brightness.max,
                "avg": entry.brightness.avg
            });
        }

        if (dataProviderTemperatura.length <= 0 && dataProviderUmidita.length <= 0 && dataProviderLuminosita.length <= 0)
            ShowMissingDataWarning();
        else
            HideMissingDataWarning();


        console.log('Min Period: ' + minPeriod);
        console.log(dateFormatsByMinPeriod[minPeriod]);

        // Set date format
        chartTemperatura.dataDateFormat = dateFormatsByMinPeriod[minPeriod].dateFormat;
        // Set balloon date format
        chartTemperatura.chartCursor.categoryBalloonDateFormat = dateFormatsByMinPeriod[minPeriod].categoryBalloonFormat;
        // Set Category Axis Min Period
        chartTemperatura.categoryAxis.minPeriod = dateFormatsByMinPeriod[minPeriod].categoryAxisMinPeriod;
        // Set title
        chartTemperatura.dataProvider = dataProviderTemperatura;
        // Set ranges
        chartTemperatura.guides[0].toValue = data.range.temperature.max;
        chartTemperatura.guides[0].value = data.range.temperature.min;
        // chartTemperatura.guides[1].toValue = data.range.temperature.max;
        // chartTemperatura.guides[1].value = data.range.temperature.max;
        // Set visible values
        // chartTemperatura.valueAxes[0].minimum = data.range.temperature.min - 5;
        // chartTemperatura.valueAxes[0].maximum = data.range.temperature.max + 5;
        chartTemperatura.validateData();


        // Set date format
        chartUmidita.dataDateFormat = dateFormatsByMinPeriod[minPeriod].dateFormat;
        // Set balloon date format
        chartUmidita.chartCursor.categoryBalloonDateFormat = dateFormatsByMinPeriod[minPeriod].categoryBalloonFormat;
        // Set Category Axis Min Period
        chartUmidita.categoryAxis.minPeriod = dateFormatsByMinPeriod[minPeriod].categoryAxisMinPeriod;
        // Set title
        chartUmidita.dataProvider = dataProviderUmidita;
        // Set ranges
        chartUmidita.guides[0].toValue = data.range.moisture.max;
        chartUmidita.guides[0].value = data.range.moisture.min;
        // chartUmidita.guides[1].toValue = data.range.moisture.max;
        // chartUmidita.guides[1].value = data.range.moisture.max;
        // Set visible values
        // chartUmidita.valueAxes[0].minimum = data.range.moisture.min - 5;
        // chartUmidita.valueAxes[0].maximum = data.range.moisture.max + 5;
        chartUmidita.validateData();


        // Set date format
        chartLuminosita.dataDateFormat = dateFormatsByMinPeriod[minPeriod].dateFormat;
        // Set balloon date format
        chartLuminosita.chartCursor.categoryBalloonDateFormat = dateFormatsByMinPeriod[minPeriod].categoryBalloonFormat;
        // Set Category Axis Min Period
        chartLuminosita.categoryAxis.minPeriod = dateFormatsByMinPeriod[minPeriod].categoryAxisMinPeriod;
        // Set title
        chartLuminosita.dataProvider = dataProviderLuminosita;
        // Set ranges
        chartLuminosita.guides[0].toValue = data.range.brightness.max;
        chartLuminosita.guides[0].value = data.range.brightness.min;
        // chartLuminosita.guides[1].toValue = data.range.brightness.max;
        // chartLuminosita.guides[1].value = data.range.brightness.max;
        // Set visible values
        // chartLuminosita.valueAxes[0].minimum = data.range.brightness.min;
        // chartLuminosita.valueAxes[0].maximum = data.range.brightness.max;
        chartLuminosita.validateData();
    }


    /**
     * Init "Dati Presenti" tab
     */
    function UpdateCurrentDataSection(data) {
        console.log('Update Current Data Interface:');
        console.log('Response Data: ');
        console.log(data);

        var lastEntry = null;
        var ranges = null;
        var percentageValue = 0;
        var bDataFound = false;

        // Get last entry if any
        if (data !== null) {
            if ('data' in data && data.data.length > 0)
                lastEntry = data.data[data.data.length - 2];

            if ('range' in data)
                ranges = data.range;
        }

        // Ora ultimo dato
        if (lastEntry !== null && 'date' in lastEntry) {
            var tmpDate = moment(lastEntry.date, 'DD/MM/YYYY hh');
            console.log('moment date');
            console.log(tmpDate);
            $oraUltimoDato.text(tmpDate.format('DD/MM/YYYY hh:mm'));
        }
        else
            $oraUltimoDato.text('-/-/- -:-');

        // Temperatura
        $temperaturaCard.removeClass('warning-low');
        $temperaturaCard.removeClass('warning-high');
        if (lastEntry !== null && 'temperature' in lastEntry) {
            bDataFound = true;
            $temperaturaDegree.text(lastEntry.temperature.avg);
            $temperaturaDegree.counterUp({
                delay: animationInterval,
                time: animationLength
            });

            if (ranges !== null) {
                percentageValue = (lastEntry.temperature.avg * 100) / ranges.temperature.max;
                if (percentageValue <= 10) percentageValue = 10;
                else if (percentageValue >= 90) percentageValue = 100;
                AnimateProgressBar($temperaturaProgressbar, percentageValue);

                // Check if warnings are needed
                if (lastEntry.temperature.avg >= ranges.temperature.max)
                    $temperaturaCard.addClass('warning-high');
                else if (lastEntry.temperature.avg <= ranges.temperature.min)
                    $temperaturaCard.addClass('warning-low');
            }
        }
        else {
            console.log('No value for temperature');
            $temperaturaDegree.text('-');
            AnimateProgressBar($temperaturaProgressbar, 0);
        }


        // Umidità
        $umiditaCard.removeClass('warning-low');
        $umiditaCard.removeClass('warning-high');
        if (lastEntry !== null && 'moisture' in lastEntry) {
            bDataFound = true;
            $umiditaPercentage.text(lastEntry.moisture.avg);
            $umiditaPercentage.counterUp({
                delay: animationInterval,
                time: animationLength
            });

            if (ranges !== null) {
                percentageValue = (lastEntry.moisture.avg * 100) / ranges.moisture.max;
                if (percentageValue <= 10) percentageValue = 10;
                else if (percentageValue >= 90) percentageValue = 100;
                AnimateProgressBar($umiditaProgressbar, percentageValue);

                // Check if warnings are needed
                if (lastEntry.moisture.avg >= ranges.moisture.max)
                    $umiditaCard.addClass('warning-high');
                else if (lastEntry.moisture.avg <= ranges.moisture.min)
                    $umiditaCard.addClass('warning-low');
            }
        }
        else {
            console.log('No value for moisture');
            $umiditaPercentage.text('-');
            AnimateProgressBar($umiditaProgressbar, 0);
        }


        // Luminosità
        $luminositaCard.removeClass('warning-low');
        $luminositaCard.removeClass('warning-high');
        if (lastEntry !== null && 'brightness' in lastEntry) {
            bDataFound = true;
            $luminositaValue.text(lastEntry.brightness.avg);
            $luminositaValue.counterUp({
                delay: animationInterval,
                time: animationLength
            });

            if (ranges !== null) {
                percentageValue = (lastEntry.brightness.avg * 100) / ranges.brightness.max;
                if (percentageValue <= 10) percentageValue = 10;
                else if (percentageValue >= 90) percentageValue = 100;
                AnimateProgressBar($luminositaProgressbar, percentageValue);

                // Check if warnings are needed
                if (lastEntry.brightness.avg >= ranges.brightness.max)
                    $luminositaCard.addClass('warning-high');
                else if (lastEntry.brightness.avg <= ranges.brightness.min)
                    $luminositaCard.addClass('warning-low');
            }
        }
        else {
            console.log('No value for brightness');
            $luminositaValue.text('-');
            AnimateProgressBar($luminositaProgressbar, 0);
        }

        // Show missing data warning if needed
        if (bDataFound)
            HideMissingDataWarning();
        else
            ShowMissingDataWarning();
    }


    /**
     * Get selected school name
     *
     * @returns string
     */
    function GetSelectedSchoolName() {
        return $selectSchoolName.val();
    }


    /**
     * Get selected system id
     *
     * @returns string
     */
    function GetSelectedSystemID() {
        return $selectPlantName.val();
    }


    /**
     * Converts a Date object to a string in the doxee api format
     *
     * @param theDate
     * @returns null|string
     */
    function DateToDoxeeApiFormat(theDate) {
        if (!(theDate instanceof Date))
            return null;

        // Day
        var day = theDate.getDate();
        if (day < 10) day = '0' + day;

        // Month
        var month = theDate.getMonth() + 1;
        if (month < 10) month = '0' + month;

        // Year
        var year = theDate.getFullYear();

        // Hours
        var hours = theDate.getHours();
        if (hours < 10) hours = '0' + hours;

        // Minutes
        var minutes = theDate.getMinutes();
        if (minutes < 10) minutes = '0' + minutes;

        return day + '.' + month + '.' + year + ' ' + hours + ':' + minutes;
    }


    function ShowLoadingScreen() {
        // $loadingScreen.show();
        $loadingScreen.fadeIn(200);
    }

    function HideLoadingScreen() {
        // $loadingScreen.hide();
        $loadingScreen.fadeOut(200);
    }


    function ShowMissingDataWarning() {
        $missingData.show();
    }

    function HideMissingDataWarning() {
        $missingData.hide();
    }
}
