pg.fContent_Click = function (event) {
  //return;

  if (pg.stopSuggestedForMap) {
    pg.stopSuggestedForMap = "";
    pg.fSuggestedStopsHide();
  }

  //event = event || window.event;
  var $e = event && (event.target || event.srcElement);

  if (!$e) return true;

  var className, action;
  var pg0;

  for (var $n = $e; $n; $n = $n.parentNode) {
    if (($n.tagName || "").toLowerCase() === "tr") {
      // no need to traverse outside <tr>
      break;
    }

    if (!action) {
      className = $n && ($n.className || "").toLowerCase();

      if (className.indexOf("expand") >= 0) {
        action = "expand";
        $e = $n;
      } else if (className.indexOf("collapse") >= 0) {
        action = "collapse";
        $e = $n;
      } else if (($n.href || "").indexOf("#") >= 0) {
        pg0 = pg.fUrlParse($n.href);

        if ($n.className.indexOf("map") >= 0) {
          action = pg.fUrlSet({ hashForMap: pg0.hashForMap }, true);
        } else if (pg0.schedule) {
          // added hashForMap in case of: map explicitly disabled! hashForMap=""
          action = pg.fUrlSet(
            { hashForMap: pg0.hashForMap, schedule: pg0.schedule },
            true
          );
          //console.log("action: ", action);
        } else {
          action = "hash";
          pg0.language = pg.language;

          if (pg0.hashForMap) {
          } else if (pg0.hashForMap === "") {
            // map explicitly disabled!
            // pass
            //console.log("map disabled!");
          } else if (pg.hashForMap) {
            if (pg.city === pg0.city && pg.transport === pg0.transport) {
              pg0.hashForMap = pg.hashForMap;
            } else {
              pg0.hashForMap = "map";
            }
          }
        }
      }
    }

    //console.log("ACION", action);

    if (($n.tagName || "").toLowerCase() === "a") {
      break;
    }
    if (
      ($n.className || "").toLowerCase() === "departuresrow" &&
      action === "expand"
    ) {
      action = "";
      $n.className = "DeparturesRowFull";
      break;
    }
    if (
      ($n.className || "").toLowerCase() === "departuresrowfull" &&
      action === "collapse"
    ) {
      action = "";
      $n.className = "DeparturesRow";
      break;
    }
  }

  var $details = [];

  while ($n) {
    $n = $n.parentNode;
    $details = ($n && $n.getElementsByTagName("div")) || [];

    if ($details.length) {
      break;
    }
  }

  if (action == "expand") {
    $e.className = $e.className.replace("expand", "collapse");
    $e.title = i18n.hideDetails;

    ($details[0] || { style: {} }).style.display = "";

    if (pg.schedule) {
      pg.scheduleDetailsExpanded = true;
    }

    if (document.body.className.indexOf("Map") >= 0) {
      pg.fUrlSetMap({ optimalRoute: $e.getAttribute("data-option-num") || 1 });
    }

    action = "";
  } else if (action == "collapse") {
    $e.className = $e.className.replace("collapse", "expand");
    $e.title = i18n.showDetails;
    ($details[0] || { style: {} }).style.display = "none";

    if (pg.schedule) {
      pg.scheduleDetailsExpanded = false;
    }

    action = "";
  } else if (action == "hash") {
    pg.fUrlSet(pg0);
    action = "";
  }

  if (action || action === "") {
    if (action) {
      Hash.go(action);
    }

    return pg.cancelEvent(event);
  }

  return true;
};

//var map_center;
pg.divMapMaximize_Click = function (event) {
  //console.log("divMapMaximize_Click");

  var center = pg.GMap && pg.GMap.getCenter();

  if (pg.transport == "home" || pg.transport == "") {
    document.body.classList.add("MapDisplayedMax");
  } else {
    pg.fUrlSetMap({ maximized: true });
  }

  if (center) {
    setTimeout(function () {
      // TODO for <=IE7 that uses poll checkResize is not working
      pg.GMap.invalidateSize();
    }, 300);
  }
  return pg.cancelEvent(event);
};

pg.divMapRestore_Click = function (event) {
  var center = pg.GMap && pg.GMap.getCenter();

  if (pg.transport == "home" || pg.transport == "") {
    document.body.classList.remove("MapDisplayedMax");
  } else {
    pg.fUrlSetMap({ maximized: false });
  }

  //pg.GMap.setView([cfg.city.lat, cfg.city.lng]);
  if (center) {
    setTimeout(function () {
      pg.GMap.invalidateSize();
    }, 300);
  }
  return pg.cancelEvent(event);
};

pg.fUrlSet = function (newPg, bReturnOnly, forceExecute) {
  // makes hash for provided page object
  //console.log("fUrlSet", newPg, bReturnOnly, forceExecute);
  //if(!bReturnOnly) console.log("fUrlSet0", newPg, bReturnOnly);
  //return;
  //throw "xa";
  //if(!bReturnOnly) {
  //    document.querySelector(".icon_ticket").classList.remove("active");
  //}
  //console.log("newPg", newPg.hashForMap);
  //if(newPg.hashForMap == "map") {
  //    throw "xx"
  //}

  if (newPg) {
    if (newPg.schedule && pg.schedule) {
      if (typeof newPg.schedule.city == "undefined")
        newPg.schedule.city = pg.schedule.city;
      if (typeof newPg.schedule.transport == "undefined")
        newPg.schedule.transport = pg.schedule.transport;
      if (typeof newPg.schedule.num == "undefined")
        newPg.schedule.num = pg.schedule.num;
      if (typeof newPg.schedule.dirType == "undefined")
        newPg.schedule.dirType = pg.schedule.dirType;
      if (typeof newPg.schedule.stopId == "undefined")
        newPg.schedule.stopId = pg.schedule.stopId;
    }

    var prop = [
      "city",
      "transport",
      "inputStop",
      "inputStart",
      "inputFinish",
      "hashForMap",
      "language",
    ];

    for (var i = prop.length; --i >= 0; ) {
      if (typeof newPg[prop[i]] == "undefined") {
        newPg[prop[i]] = pg[prop[i]];
      }
    }
  } else {
    newPg = pg;
  }

  var newHash = "";

  //console.log("newPg", newPg);

  if (newPg.transport == "home" || newPg.transport == "") {
    //console.log("home!");//, newPg.transport, newPg.city, newPg.hashForMap);
    newPg.transport = "";
    //newPg.city = ""; // problems with map urls in : #tallinna-linn and #harju
    //newPg.hashForMap = ""; // buvo naudojamas kad is titulinio nepridetu marsrutams nuorodu su /map
    //throw "xx";
  }
  //console.log("new pg", newPg);

  if (newPg.schedule) {
    newHash = (newPg.schedule.tripNum || "") + (newHash ? "/" + newHash : "");
    newHash = (newPg.schedule.stopId || "") + (newHash ? "/" + newHash : "");
    newHash =
      (typeof mobile != "undefined" && !bReturnOnly
        ? newPg.schedule.dirUrl || ""
        : newPg.schedule.dirType || "") + (newHash ? "/" + newHash : "");
    //newHash = (newPg.schedule.dirType   || '') + (newHash ? '/'+newHash : '');
    newHash = (newPg.schedule.num || "") + (newHash ? "/" + newHash : "");
    newHash = (newPg.schedule.transport || "") + (newHash ? "/" + newHash : "");

    if (newPg.schedule.city && newPg.schedule.city != cfg.defaultCity) {
      newHash = newPg.schedule.city + (newHash ? "/" + newHash : "");
    }

    newHash += newPg.hashForMap ? "/map" : "";
  } else {
    if (newPg.transport == "stop") {
      newPg.city = pg.fGetCity(newPg.city);
      newHash = "stop" + (newPg.inputStop ? "/" + newPg.inputStop : "");
    } else if (newPg.transport == "plan" || newPg.transport == "planf") {
      //if(newPg.transport == 'planf') {
      //    console.log("fUrlSet planf favourites.getSettings()", bReturnOnly, newPg);
      //}

      newPg.city = pg.fGetCity(newPg.city);
      newHash =
        "plan/" +
        (newPg.inputStart || "") +
        (newPg.inputFinish ? "/" + newPg.inputFinish : "");
    } else {
      newHash = (newPg.transport || "") + (newHash ? "/" + newHash : "");
    }

    if (!newHash || newPg.city !== cfg.defaultCity) {
      newHash = newPg.city + (newHash ? "/" + newHash : "");
    }

    //console.log("urlset", newPg.hashForMap, bReturnOnly);
    //if (typeof (mobile) == 'undefined' || !(newPg.transport == 'stop' || newPg.transport == 'search')) {
    newHash += newPg.hashForMap ? "/" + newPg.hashForMap : "";
    //}
  }

  newHash += newPg.language != cfg.defaultLanguage ? "/" + newPg.language : "";

  newHash = ti.toAscii(newHash, true);

  if (bReturnOnly) {
    return newHash;
  }

  //console.log("furlSet1", newHash, pg.transport, newPg.transport, "fotrcr", forceExecute);
  if (newPg.transport == "planf") {
    pg.loadedPlannerParams = "/"; // search parameters must be loaded
  }

  if (!forceExecute && pg.transport == "home" && newPg.transport == "plan") {
    // cia reikia patikrinti ar tai is "index" kvieciama
    //console.log("fUrlSetPlan");
    pg.fUrlExecute(newHash, false, "home");
    // -> pg.fTabActivate({"caller": "index", "transport": pg0.transport})
    // -> pg.fTabActivateMain(urlSettings)
    // -> if(urlSettings.caller == "index" && urlSettings.transport =="plan") {pg.renderPlanner(true);}
    // -> pg.renderPlanner = function(noSearch);
    // -> pg.fLoadPlannerTab(false, noSearch);
    // -> pg.fLoadPlannerTab = function(bRecalculate, noSearch)  { ti.skipPlannerSearch = noSearch ? true : false;....}
    //ti.findTrips = function(args) { if(ti.skipPlannerSearch) { console.log("skipping search....");} else {ti.findTripsMain(args);}
  } else {
    //console.log("new hash go!", newHash);
    Hash.go(newHash);
  }

  return newHash;
};

pg.fUrlParse = function (hash) {
  // parses hash into state

  hash = decodeURI(hash);
  var pg0 = {};

  var i = hash.indexOf("#");

  if (i >= 0) {
    hash = hash.substring(i + 1);
  }

  hash = hash ? hash.split("/") : [];

  if (
    hash.length &&
    ("," + cfg.city.languages + ",").indexOf(
      "," + hash[hash.length - 1] + ","
    ) >= 0
  ) {
    //check for language in last element
    pg0.language = hash.pop();
  } else {
    pg0.language = cfg.defaultLanguage;
  }

  if (hash.length && "map" === hash[hash.length - 1].substring(0, 3)) {
    // map params start with "map," in last element
    pg0.hashForMap = hash.pop();
  } else {
    pg0.hashForMap = "";
  }

  //console.log("parse", hash, pg0.hashForMap);

  pg0.transport = "";

  if (!hash[0]) {
    pg0.transport =
      typeof cfg.city.defaultTransport != "undefined"
        ? cfg.city.defaultTransport
        : cfg.city.transport[0];
  }

  if (hash.length && cfg.cities[hash[0]]) {
    //check for city in first element
    pg0.city = hash.shift();
  } else {
    pg0.city = cfg.defaultCity;
  }

  if (hash[0]) {
    pg0.transport = hash[0];

    if (hash[0] === "stop") {
      pg0.inputStop = hash[1] || "";
    } else if (hash[0] === "plan" || hash[0] === "planf") {
      //console.log("fUrlParse planf", hash[0]);

      pg0.inputStart = hash[1] || "";
      pg0.inputFinish = hash[2] || "";
      //pg0.transport == "plan"; - negerai neveiks tiesioginis #planf
    } else if (hash[1]) {
      pg0.schedule = {
        city: pg0.city,
        transport: hash[0],
        num: hash[1],
        dirType: hash[2] || "",
        stopId: hash[3] || "",
        tripNum: isNaN(hash[4]) ? 0 : +hash[4],
        dirUrl: hash[2] || "", // reikia mobiliai versijai zinoti ar kryptis perduota...
      };
    }
  }

  return pg0;
};

pg.fUrlExecute = function (hash, hashchange, caller) {
  //console.log("fUrlExecute", hash, hashchange, caller);
  var pg0 = pg.fUrlParse(hash);

  //console.log("fUrlExecute pg0", pg0);
  document.querySelector(".icon_ticket").classList.remove("active");
  //return;

  if (pg0.transport == "planf") {
    pg0.transport = "plan";
  }

  var oldLanguage = pg.language;
  pg.language = pg0.language;
  var oldCity = pg.city;
  pg.city = pg0.city;
  //var oldHashForMap = pg.hashForMap;

  pg.hashForMap =
    !pg0.hashForMap && caller && caller == "home" ? "map" : pg0.hashForMap; // allways show map at home

  pg.transportPrevious = pg.transport; // used for favourites.getSettings()
  pg.transport = caller ? caller : pg0.transport; // stay on index!

  pg.inputStop = pg0.inputStop || pg.inputStop;
  pg.inputStart = pg0.inputStart || pg.inputStart;
  pg.inputFinish = pg0.inputFinish || pg.inputFinish;

  pg.urlPrevious = pg.urlLoaded; // used for returning from Schedules window
  pg.urlLoaded = hash;

  if (pg0.schedule) {
    pg.loadInterruptions(function () {
      pg.fScheduleShow(pg0.schedule, "xxx");
    });
  } else {
    pg.fScheduleHide();

    //if(!indexPage)
    pg.fTabActivate({ caller: caller, transport: pg0.transport });
  }

  if (
    oldLanguage != pg.language &&
    (oldLanguage || pg.language != cfg.defaultLanguage)
  ) {
    pg.fLoadLanguageScript(pg.language);
  }

  if (
    oldCity !== pg.city &&
    cfg.defaultCity != "pskov" &&
    (cfg.cities[oldCity] || { region: "" }).region !== pg.city
    //&& ((cfg.cities[pg.city] || { region: '' }).region !== oldCity)
  ) {
    //full reload if city has changed

    //console.log("fLoadPage call!");
    pg.fLoadPage();
  }

  if (pg.hashForMap) {
    // parse map params
    //if (oldHashForMap === pg.hashForMap) {
    // }
    pg.loadInterruptions(function () {
      pg.fMapShow();
    });
  } else if (document.body.className.indexOf("Map") >= 0) {
    pg.fMapHide();
  }

  //console.log("urlExecute", pg0.hashForMap);

  if (typeof mobile != "undefined") {
    pg0.hash = hash;
    mobile.render(pg0);
  }
};

//var lat = 59.399237;
//var lng = 24.659666;

function $(id) {
  //if(!(id.charAt(0) in ['.', '#']))
  return document.getElementById(id);
  //else return jQuery(id);
} // jQuery bus perrases

function isIE() {
  var myNav = navigator.userAgent.toLowerCase();
  return myNav.indexOf("msie") != -1 ? parseInt(myNav.split("msie")[1]) : false;
}

if (isIE() && isIE() < 9) {
  //alert(isIE());
  window.getComputedStyle = function () {
    return {}; // fix for ie8
  };
  jQuery.uniform = { update: function () {} };
  jQuery.fn.uniform = function () {};
}

jQuery("#inputStart").on("change paste keyup", function () {
  pg.inputClearCheck();
});

jQuery("#inputFinish").on("change paste keyup", function () {
  pg.inputClearCheck();
});

jQuery("#areaMenuContainer").on("click", function () {
  document.querySelector(".icon_ticket").classList.remove("active");
});

jQuery("#mainMenu>ul>li").on("click", function () {
  //console.log("clicked menu item!", this.classList.contains("ticket"));

  if (this.classList.contains("ticket")) {
    document.querySelector(".icon_ticket").classList.toggle("active");
  } else {
    document.querySelector(".icon_ticket").classList.remove("active");
  }
});

jQuery("#inputStartClear").on("click", function () {
  pg.inputStart = "";
  //jQuery("#inputStart").val(""); pasirupins fLoadPlannerTab
  jQuery(this).hide();
  //dar gal reikia update
  pg.fLoadPlannerTab(); // Atstatys pirmines reiksmes

  pg.fUrlSet({
    transport: "plan",
    inputStart: pg.inputStart,
    inputFinish: pg.inputFinish,
    hashForMap: pg.hashForMap && "map",
  });
});

jQuery("#inputFinishClear").on("click", function () {
  pg.inputFinish = "";
  //jQuery("#inputFinish").val("");
  jQuery(this).hide();
  pg.fLoadPlannerTab();

  pg.fUrlSet({
    transport: "plan",
    inputStart: pg.inputStart,
    inputFinish: pg.inputFinish,
    hashForMap: pg.hashForMap && "map",
  });
});

pg.inputClearCheck = function (id) {
  //console.log("inputClearCheck", id);

  var id = id || pg.inputActive.id;

  if (["inputStart", "inputFinish"].indexOf(id) != -1) {
    //var input = jQuery("#" + id);
    //var length = input.val().length;
    if (pg[id]) {
      // pg.inputStart || pg.inputFinish
      //if(length != 0) {
      jQuery("#" + id + "Clear").show();
    } else {
      jQuery("#" + id + "Clear").hide();
    }
  }
};

pg.fTranslateStaticTextsMain = pg.fTranslateStaticTexts;
pg.fTranslateStaticTexts = function () {
  //pg.mustSearch(); // i18n data is loaded, so it's safe to render search (without modifying pg.fLoadPage) - not safe then reloaded

  /*
    i18n.addMoreLines = 'Lisa rohkem liine';
    i18n.remove = 'Eemalda';
    i18n.add = 'Lisa';
    i18n.showOption = 'Näita valikut'; //'Show option';
    i18n.hideOption = 'Peida valik'; //'Hide option';
    i18n.deviationsPossible = 'Olenevalt liiklustingimustest võib esineda kõrvalekaldeid antud väljumisaegadest.'; //'Depending on traffic condition there may occur deviations in relation to departure times.';
    
    i18n.urlTicketsTallinn = 'Piletid Tallinn';
    i18n.urlTicketsHarjumaa = 'Piletid Harjumaa';
    i18n.urlNewsTallinn = 'Uudised Tallinn';
    i18n.urlNewsHarjumaa = 'Uudised Harjumaa';
    
    i18n.headerTitle = 'Timetables';
    i18n.scheduleDelaysWarning = "Olenevalt liiklustingimustest võib esineda.";
    */

  pg.fTranslateStaticTextsMain();

  if (ti && ti.stops && ti.stops["gps"]) {
    ti.stops["gps"].name = i18n.myLocation;
  }

  //i18n.scheduleChangedDepartures = '<i style="color:red">Punase</i> tähisega ajad tähistavad väljumisi lühendatud marsruudil, <i style="color:blue">muu värviga</i> muudetud marsruudil. Nihuta hiirekursus värvilise väljumisaja kohale, et näha muudetud marsruudi nimetust.';

  i18n.lowFloorDepartures2 = [
    '<div class="legend"><div class="low-example"><div class="example">00</div><p>',
    i18n.lowFloorDepartures,
    "</p></div></div>",
  ].join("");
  i18n.scheduleChangedDepartures2 = [
    '<div class="legend"><div class="short-example"><div class="example">00</div><p>',
    i18n.scheduleChangedDepartures,
    "</p></div></div>",
  ].join("");

  ($("urlTicketsTallinn") || {}).innerHTML = i18n.urlTicketsTallinn;
  ($("urlTicketsHarjumaa") || {}).innerHTML = i18n.urlTicketsHarjumaa;
  ($("urlNewsTallinn") || {}).innerHTML = i18n.urlNewsTallinn;
  ($("urlNewsHarjumaa") || {}).innerHTML = i18n.urlNewsHarjumaa;
  /*
    } else {
        i18n.addMoreLines = "Add more lines";
        i18n.remove = 'Remove';
        i18n.add = 'Add';
        //i18n.headerTitle = 'Timetables';
        i18n.scheduleDelaysWarning = "Timetables are subject to traffic delays.";
        
        ($('urlTicketsTallinn')|| {}).innerHTML = "Ticket information in Tallinn";
        ($('urlTicketsHarjumaa') || {}).innerHTML = "Ticket information in Harjumaa";
        ($('urlNewsTallinn') || {}).innerHTML = "Transport news in Tallinn";
        ($('urlNewsHarjumaa') || {}).innerHTML = "Transport news in Harjumaa";
    }
    */

  ($("tripPlannerHelp") || {}).innerHTML = i18n.tripPlannerHelp;
  ($("tripPlannerHelpMap") || {}).innerHTML = i18n.tripPlannerHelpMap;

  ($("inputReverseDepart") || {}).innerHTML = i18n.depart;
  ($("inputReverseArrive") || {}).innerHTML = i18n.arrive;

  ($("menuTimetables") || {}).innerHTML = i18n.routesAndTimetables;
  ($("menuPlan") || {}).innerHTML = i18n.menuTripPlanner;
  ($("tabPlan") || {}).innerHTML = i18n.menuTripPlanner;
  ($("menuMap") || {}).innerHTML = i18n.menuMap;
  ($("menuFavourites") || {}).innerHTML = i18n.menuFavourites;

  i18n.homepage = i18n.homepage || "Avaleht";
  ($("menuHome") || {}).innerHTML = i18n.homepage;

  ($("menuTickets") || {}).innerHTML = i18n.tickets;
  ($("tabFavourites") || {}).innerHTML = i18n.menuFavourites;

  i18n.announcements = i18n.announcements || "Teadaanded";
  ($("tabAnnouncements") || {}).innerHTML = i18n.announcements || "Teadaanded";
  i18n.disruptions = i18n.disruptions || "Tõrked";
  ($("tabDisruptions") || {}).innerHTML = i18n.disruptions || "Tõrked";

  i18n.from = i18n.from || "alates";
  i18n.fromStart = i18n.from + " ";
  i18n.fromEnd = "";
  if (pg.language == "fi") {
    i18n.fromStart = "";
    i18n.fromEnd = " " + i18n.from;
  }

  ($("menuNotices") || {}).innerHTML = i18n.notifications;
  ($("menuContacts") || {}).innerHTML = i18n.contacts;
  ($("menuHelp") || {}).innerHTML = i18n.help;

  ($("advancedOptions") || {}).innerHTML = i18n.extendedOptions;
  ($("hideOptions") || {}).innerHTML = i18n.extendedOptionsHide;
  ($("labelHandicapped") || {}).innerHTML = i18n.checkHandicapped;

  ($("toolShowAllStops") || {}).innerHTML = i18n.mapShowAllStops;
  ($("toolShowVehicles") || {}).innerHTML = i18n.mapShowVehicles;

  ($("toolShowTraffic") || { style: {} }).style.display = "none";
  ($("toolShowTraffic") || {}).innerHTML = i18n.mapShowTraffic;

  i18n.showMyLocation = i18n.showMyLocation || "Show my location";
  ($("toolShowLocation") || {}).innerHTML = i18n.showMyLocation;

  jQuery("#planner .button-search").html(i18n.searchRoute);

  jQuery.uniform.update(); // selectbaras tommorow/today

  //jQuery('#planner input:checkbox, select:not(.date-select)').uniform();

  jQuery("#mainMenu .icon_schedule").attr(
    "href",
    "#" + pg.city + "/" + pg.language
  );
  jQuery("#mainMenu .icon_home").attr("href", "#/" + pg.language);
};

pg.fMapShowMain = pg.fMapShow;

pg.fMapShow = function () {
  pg.fMapShowMain();

  jQuery("#toolShowAllStops").toggleClass("active", pg.mapShowAllStops > 0);
  jQuery("#toolShowVehicles").toggleClass("active", pg.mapShowVehicles > 0);
  jQuery("#toolShowTraffic").toggleClass("active", pg.mapShowTraffic || false);

  //console.log("fMapShow toolShowLocation", pg.mapShowLocation);

  jQuery("#toolShowLocation").toggleClass(
    "active",
    typeof pg.mapShowLocation == "undefined" ? false : pg.mapShowLocation
  );

  jQuery("#toolShowAllStops")
    .unbind("click")
    .click(function () {
      jQuery("#mapShowAllStops").trigger("click");
      jQuery(this).toggleClass("active");
    });

  jQuery("#toolShowVehicles")
    .unbind("click")
    .click(function () {
      jQuery("#divMapShowVehicles").trigger("click");
      jQuery(this).toggleClass("active");
    });

  jQuery("#toolShowLocation")
    .unbind("click")
    .click(function () {
      //jQuery("#divMapShowVehicles").trigger("click");
      pg.mapShowLocation = !this.classList.contains("active");
      if (pg.mapShowLocation) {
        createMyLocation(function () {
          console.log("location:", window.gps);
          document.getElementById("divMapVehicles").style.visibility = "hidden"; // map.zoomend ijungs
          pg.updateMyLocationMarker(window.gps, true);
        });
      } else {
        pg.updateMyLocationMarker();
      }

      jQuery(this).toggleClass("active");
    });

  //console.log("xxx", "toolShowTraffic", pg.mapShowTraffic, pg.mapShowTraffic || false);

  jQuery("#toolShowTraffic")
    .unbind("click")
    .click(function () {
      jQuery("#divMapShowTraffic").trigger("click");
      pg.fShowTraffic(!pg.mapShowTraffic);
      jQuery(this).toggleClass("active");
    });

  //setTimeout(function () {
  //    if(typeof google != "undefined" && google.maps && google.maps.event) {
  //        google.maps.event.trigger(pg.GMap, 'resize');
  //    }
  //}, 100);
};

pg.renderIndex = function () {
  //console.log("render desktop index!");
  document.getElementById("divContentRoutes").style.display = "none";
};

pg.renderPlanner = function (noSearch) {
  if (pg.loadedPlannerParams !== pg.inputStart + "/" + pg.inputFinish) {
    // && !(typeof (mobile) != 'undefined') ) { // mobilioje versijoje reikalaujame "otsi" paspaudimo

    setTimeout(function () {
      pg.fLoadPlannerTab(false, noSearch);
    }, 10);
  }

  var start_time = "" + (($("inputTime") || {}).value || "");

  if (start_time.trim() === "") {
    start_time = ti.dateToMinutes(new Date()) % (24 * 60); //get current daytime in minutes
    ($("inputTime") || {}).value = ti.printTime(start_time);
  }
};

pg.fTabActivateMain = function (urlSettings) {
  /* copy from content_tabs.js with redefined #index rendering */
  var tabID = pg.city + "_" + pg.transport;

  if (!pg.transport) {
    tabID = "city";

    if (cfg.cities[pg.city] && pg.city !== pg.fGetCity(pg.city)) {
      tabID = "region";
    }
  }

  var tabs = $("divNav") && $("divNav").getElementsByTagName("a");

  if (tabs) {
    for (var i = tabs.length; --i >= 0; ) {
      // highlight new active tab
      if (tabs[i].id === tabID) {
        tabs[i].className = "active";
      } else if (tabs[i].className.indexOf("active") >= 0) {
        // check required for not to clear classes of all elements
        tabs[i].className = "";
      }
    }
  }

  ($("dt_stop") || {}).className = pg.transport === "stop" ? "active" : "";

  //console.log("fTabActivateMain", pg.transport, window.location.hash == ("#/" + pg.language), pg.language);

  //document.getElementById("divContainer").classList.remove("index");
  var removeDivContainerIndexClass = true;

  if (pg.transport === "stop") {
    //console.log("CCCS", pg.loadedDepartingRoutes, pg.inputStop);
    if (
      cfg.defaultCity == "tallinna-linn" ||
      pg.loadedDepartingRoutes !== pg.inputStop
    ) {
      // tallinn was not loading #stop page from schedule "Show all stop departures" button
      setTimeout(pg.fLoadDepartingRoutes, 10);
    }
  } else if (pg.transport === "plan") {
    if (typeof mobile == "undefined") {
      ($("plan") || {}).className = "active";
    }

    /*
        if (pg.loadedPlannerParams !== pg.inputStart + '/' + pg.inputFinish) {// && !(typeof (mobile) != 'undefined') ) { // mobilioje versijoje reikalaujame "otsi" paspaudimo
            setTimeout(pg.fLoadPlannerTab, 10);
        }

        var start_time = '' + (($('inputTime') || {}).value || '');

        if (start_time.trim() === '') {
            start_time = ti.dateToMinutes(new Date) % (24 * 60); //get current daytime in minutes
            ($('inputTime') || {}).value = ti.printTime(start_time);
        }*/
    pg.renderPlanner();
  }
  //else if (!window.location.hash || (window.location.hash == ("#" + pg.hashForMap)) || (window.location.hash == ("#" + pg.hashForMap + "/" + pg.language))) {
  //else if (!window.location.hash || (window.location.hash == ("#/" + pg.language))) {
  else if (pg.transport === "home") {
    // #index, dar gali reiketi ;map?
    //console.log("urlSettings", urlSettings);
    document.getElementById("header2").innerHTML = i18n.homepage;

    if (urlSettings && urlSettings.caller == "home") {
      if (urlSettings.transport == "plan") {
        pg.renderPlanner(true);
      }
    } else {
      ($("inputRoutes") || {}).value = pg.routesFilter = "";
      pg.inputRoutes_Blur();
      //pg.transport = "home";
      pg.hashForMap = "map";
      pg.inputStart = "";
      pg.inputFinish = "";
      pg.mapShowVehicles = 2; // show vehicles
      //console.log("home: clear map icons!");

      pg.fMapShow(); // - kadangi hashForMap nebus - tai perjungus i #/ee bus isjungtas

      document.body.classList.add("home");
      document.body.classList.remove("RoutesDisplayed");

      //document.getElementById("divContainer").classList.add("index");
      pg.renderIndex();
      pg.fLoadRoutesList();

      jQuery("#favourites").attr("class", "all");
      //pg.renderFavourites();
      pg.renderPlanner();
    }
    removeDivContainerIndexClass = false;
  } else if (
    !pg.loadedRoutesHash ||
    pg.loadedRoutesHash.indexOf(pg.city + "/" + pg.transport + "/") != 0
  ) {
    //console.log("default routes!");
    //jQuery("#header2").html(i18n.headerTitle);

    ($("inputRoutes") || {}).value = pg.routesFilter = "";
    pg.inputRoutes_Blur();
    pg.fLoadRoutesList();
  }

  if (removeDivContainerIndexClass) {
    //document.getElementById("divContainer").classList.remove("index");
    document.body.classList.remove("home");
  }

  //($('divContentRoutes') || { style: {} }).style.display = (["stop", "plan", "favourites", "contacts", "help", "index"].indexOf(pg.transport) != -1 ) ? "none" : "block";
  ($("divContentRoutes") || { style: {} }).style.display =
    ["stop", "plan", "favourites", "contacts", "help", "notices"].indexOf(
      pg.transport
    ) != -1
      ? "none"
      : "block";
  ($("divContentDepartingRoutes") || { style: {} }).style.display =
    pg.transport === "stop" ? "block" : "none";
  ($("divContentPlanner") || { style: {} }).style.display =
    pg.transport === "plan" ? "block" : "none";
  ($("divContentIndex") || { style: {} }).style.display =
    pg.transport === "home" ? "flex" : "block";
};

//pg.fTabActivateMain = pg.fTabActivate;

pg.fTabActivate = function (urlSettings) {
  //return;
  //throw "xxx";

  //console.log("fTabActivate", pg.transport, urlSettings);

  //jQuery("#header2").html(i18n.headerTitle);

  //if(ti.routes) throw "xxx";

  //pg.loadGoogleMapsScript(function () { // reikia kad autosuggeste butu variantai

  if (pg.transport === "map") {
    jQuery("#header2").html(i18n.menuMap);
    jQuery("body").addClass("MapMenuDisplayed");
  } else {
    jQuery("body").removeClass("MapMenuDisplayed");
  }

  if (pg.transport === "plan") {
    jQuery("#header2").html(i18n.menuTripPlanner);
    jQuery("body").addClass("PlannerDisplayed");
  } else {
    jQuery("body").removeClass("PlannerDisplayed");
  }

  if (pg.transport === "favourites") {
    jQuery("#header2").html(i18n.menuFavourites);
    jQuery("#favourites").attr("class", "all");
    pg.renderFavourites();
    jQuery("body").addClass("FavouritesDisplayed");
  } else {
    jQuery("body").removeClass("FavouritesDisplayed");
  }

  if (pg.transport === "contacts") {
    //console.log("addclass FavouritesDisplayed");
    //console.log("render contacs", i18n.contacts);
    jQuery("#header2").html(i18n.contacts);
    //jQuery("#favourites").attr("class", "all");
    pg.renderContacts();
    jQuery("body").addClass("ContactsDisplayed");
  } else {
    jQuery("body").removeClass("ContactsDisplayed");
  }

  if (pg.transport === "notices") {
    //console.log("addclass FavouritesDisplayed");
    jQuery("#header2").html(i18n.notifications);
    //jQuery("#favourites").attr("class", "all");
    //pg.renderNotices();
    jQuery("body").addClass("NoticesDisplayed");
  } else {
    jQuery("body").removeClass("NoticesDisplayed");
  }

  if (pg.transport === "help") {
    //console.log("addclass FavouritesDisplayed");
    jQuery("#header2").html(i18n.help);
    //jQuery("#favourites").attr("class", "all");
    pg.renderHelp();
    jQuery("body").addClass("HelpDisplayed");
  } else {
    jQuery("body").removeClass("HelpDisplayed");
  }

  //console.log("pg,transport", pg.transport);
  // yra transportas, arba nera transport.index
  if ((pg.transport && pg.transport in cfg.transportOrder) || !pg.transport) {
    jQuery("body").addClass("RoutesDisplayed");
    //console.log("AADD", pg.transport);
  } else {
    jQuery("body").removeClass("RoutesDisplayed");
    //console.log("REEMOVE");
  }

  if (pg.transport === "stop") {
    //console.log("stop", pg.inputStop);

    if (favourites.belongs({ stopIds: pg.inputStop }, true)) {
      jQuery("#stopFavourite .button-favourite")
        .addClass("active")
        .attr("alt", i18n.btnFavouritesRemove)
        .attr("title", i18n.btnFavouritesRemove);
    } else {
      jQuery("#stopFavourite .button-favourite")
        .removeClass("active")
        .attr("alt", i18n.btnFavouritesAdd)
        .attr("title", i18n.btnFavouritesAdd);
    }

    jQuery("#stopFavourite .button-favourite")
      .unbind("click")
      .bind("click", function () {
        var button = jQuery(this);

        if (!button.hasClass("active")) {
          favourites.add({ stopIds: pg.inputStop });
          button
            .addClass("active")
            .attr("alt", i18n.btnFavouritesRemove)
            .attr("title", i18n.btnFavouritesRemove);
        } else {
          favourites.remove({ stopIds: pg.inputStop });
          button
            .removeClass("active")
            .attr("alt", i18n.btnFavouritesAdd)
            .attr("title", i18n.btnFavouritesAdd);
        }
        return false;
      });

    //console.log("WINIR: ", $('inputDepartureDate').value);
    //pg.renderRealtimeDepartures("stop");
  }

  //console.log("xx", window.location.hash, "#/" + pg.language);
  if (!window.location.hash || window.location.hash.substring(0, 2) == "#/") {
    pg.transport = "home";
  }

  pg.testIfSearchMustBeRendered();

  //if(typeof v3 != "undefined" && typeof v3.directionsDisplay != "undefined") {
  //    v3.directionsDisplay.setMap(null); // paslepiame marsrutus
  // }

  pg.loadInterruptions(function () {
    pg.fTabActivateMain(urlSettings);
  });

  jQuery("#areaMenu a").removeClass("active");
  jQuery("#" + pg.city + "_" + pg.transport).addClass("active");

  jQuery(".view-map a").removeClass("active"); // kad spaudziant back irgi suveiktu
  jQuery(".view-map a[href='#" + pg.urlLoaded + "']").addClass("active");

  if (pg.transport in i18n.transport) {
    document.title = i18n.headerTitle + " - " + i18n.transport[pg.transport];
  } else {
    document.title = i18n.headerTitle;
  }
};

pg.renderHelp = function () {
  var template = [
    '<article class="textpage def clearfix">',
    //'<h2>', 'Interaktiivne juhend koostamisel', '</h2>',
    '<div class="phone-block">',
    "<p>",
    i18n.callShortNumber,
    ' <strong><a href="tel:+3721345">+372 <b>1345</b></a></strong></p>',
    //'<p style="font-size:30px;">',(pg.language == "ee") ? cfg.city.helpInfoText.ee : cfg.city.helpInfoText.en,'</p>',
    "</div>",
    "</article>",
    pg.footerHTML(),
  ];
  jQuery("#divHelp").html(template.join(""));
};

pg.renderContacts = function () {
  var template = [
    '<article class="textpage def clearfix">',
    //'<h2>', i18n.contacts, '</h2>',
    '<div class="phone-block" style="border-top:0px;">',
    //'<p>', i18n.callShortNumber, ' <strong><a href="tel:+3721345">+372 <b>1345</b></a></strong></p>',
    '<p style="font-size:1.25rem;">',
    pg.language == "ee" ? cfg.city.helpInfoText.ee : cfg.city.helpInfoText.en,
    "</p>",
    "<br/></div>",
    "</article>",
    pg.footerHTML(),
  ];
  jQuery("#divContacts").html(template.join(""));
};

pg.findNoticeForRoute = function (notices, route) {
  if (
    notices[route.stopId] &&
    notices[route.stopId][route.transport] &&
    notices[route.stopId][route.transport][route.num]
  ) {
    return notices[route.stopId][route.transport][route.num].data;
  }
  return { announcement: "" };
};

pg.getStopsNotices = function (type) {
  var stops_notices = {};
  if (ti.notices && ti.notices.length) {
    var filtered = ti.notices.filter(function (n) {
      return n.type == type;
    });

    for (var i = 0; i < filtered.length; i++) {
      var notice = filtered[i];
      if (notice.stop_codes && notice.stop_codes.length) {
        for (var j = 0; j < notice.stop_codes.length; j++) {
          var stop_id = notice.stop_codes[j];
          var transport = notice.stop_codes[j];

          if (!stops_notices[stop_id]) stops_notices[stop_id] = {};
          if (!stops_notices[stop_id][notice.transport])
            stops_notices[stop_id][notice.transport] = {};

          for (var k = 0; k < notice.routes.length; k++) {
            stops_notices[stop_id][notice.transport][notice.routes[k].num] =
              notice;
          }
        }
      }
    }
  }
  return stops_notices;
};

pg.getRouteNoticesForStops = function (route_id, type) {
  var stops_notices = {};
  if (
    ti.routes[route_id] &&
    ti.routes[route_id].notices &&
    ti.routes[route_id].notices.length
  ) {
    var filtered = ti.routes[route_id].notices.filter(function (n) {
      return n.type == type;
    });

    for (var i = 0; i < filtered.length; i++) {
      var notice = filtered[i];
      if (notice.stop_codes && notice.stop_codes.length) {
        for (var j = 0; j < notice.stop_codes.length; j++) {
          var stop_id = notice.stop_codes[j];
          if (!stops_notices[stop_id]) stops_notices[stop_id] = [];
          stops_notices[stop_id].push(notice);
        }
      }
    }
  }
  return stops_notices;
};

/* parse Estonian local datetime string to Date object
format: "28.05.2023 00:00" (spr=".")
*/
pg.parseDate = function (str, spr) {
  //var str = "28.05.2023 00:00";
  var split = str.split(" ");
  var date = split[0].split(spr);
  var time = split[1].split(":");
  //console.log("parseDate", +date[2],+date[1]-1,+date[0],+time[0],+time[1]);
  return new Date(+date[2], +date[1] - 1, +date[0], +time[0], +time[1]);
};

/* get Estonian local datetime as Date object
Usage example: pg.parseDate("07.06.2023 15:14", ".") > pg.getDate()
*/
pg.getDate = function () {
  var now = new Date();
  var displayDate = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
    timeZone: "Europe/Tallinn",
  }).format(now);
  // 07/06/2023, 14:15'
  displayDate = displayDate.replace(",", "");
  //console.log("getDate", displayDate);

  return pg.parseDate(displayDate, "/");
};

pg.updateRouteNotices = function (json, type) {
  //}, callback) {
  if (!ti.notices) ti.notices = [];

  //console.log("updateRouteNotices once!", type); //Bus-trolley-tram
  var transport_map = {
    Tramm: { name: "tram", sort: 1 },
    Buss: { name: "bus", sort: 3 },
    Troll: { name: "trol", sort: 2 },
  };
  //var data = [];

  for (var i = 0; i < json.length; i++) {
    var item = {};

    if (type == "interruption") {
      var transport = transport_map[json[i].transport].name;
    } else {
      var transport_ids = json[i].transport.split(", ");
      transport_ids.sort(function (a, b) {
        return transport_map[b].sort - transport_map[a].sort;
      });

      //console.log("sortdet transport: ", transport_ids);

      var transport = transport_ids.map(function (x) {
        return transport_map[x].name;
      });
    }

    //var transport = (type == "interruption") ? transport_map[json[i].transport].name : json[i].transport.split(", ").map(function(x) {return transport_map[x].name});

    var stop_codes = json[i].stop_codes ? json[i].stop_codes.split(", ") : [];
    var routes = json[i].routes.split(", ");

    item.type = type; // "interruption" || "announcement";
    item.transport = transport;
    item.stop_codes = stop_codes;

    if (
      json[i].publication_start_time &&
      pg.parseDate(json[i].publication_start_time, ".") > pg.getDate()
    ) {
      //console.log("announcement filtered by publication_start_time", json[i]);
      continue;
    }
    if (
      json[i].publication_end_time &&
      pg.parseDate(json[i].publication_end_time, ".") < pg.getDate()
    ) {
      //console.log("announcement filtered by publication_end_time", json[i]);
      continue;
    }

    if (type == "interruption") {
      item.start_date = json[i].start_time;
      item.end_date = json[i].end_time;
    } else {
      // announcement
      //console.log("json", json[i]);
      item.start_date =
        json[i].valid_start_time ||
        (json[i].start_time ? json[i].start_time.split(" ")[0] : "");
      item.end_date = json[i].valid_end_time || ""; //2023-08-06 Evaldas: do not use old property end_time anymore //(json[i].end_time ? json[i].end_time.split(" ")[0]: "");
    }
    //item.start_date = (type == "interruption")? json[i].start_time : json[i].start_time.split(" ")[0];
    //item.end_date = (type == "interruption")? json[i].end_time : json[i].end_time.split(" ")[0];
    //console.log("item", item);

    item.data = json[i];
    item.routes = [];
    //item.start_time = json[i].start_time;
    //item.end_time = json[i].end_time;
    //item.announcement = json[i].announcement;
    //item.info = json[i].info;
    //item.title = json[i].title;

    for (var j = 0; j < routes.length; j++) {
      var full_num = routes[j];
      var split = full_num.split(" -> ");
      var num = split[0]; //parseInt(split[0], 10);
      var direction_name = split.length > 1 ? split[1] : null;

      if (type == "announcement") {
        num = parseInt(num, 10);
        if (!isNaN(num)) {
          transport = "bus";
          if (num < 100) {
            num = "" + num;
          } else if (num > 99 && num < 200) {
            num = (num % 100) + "a";
          } else if (num > 199 && num < 300) {
            num = (num % 200) + "b";
          } else if (num > 299 && num < 400) {
            // tram
            num = "" + (num % 300);
            transport = "tram";
          } else if (num > 399) {
            // trol
            num = "" + (num % 400);
            transport = "trol";
          }
        }
      }

      item.routes.push({
        transport: transport,
        num: num,
        direction_name: direction_name,
      });

      var routes_update = ti.fGetRoutes("tallinna-linn", transport, num);
      //console.log("routes_update", rtransport, num, routes_update);

      for (var k = 0; k < routes_update.length; k++) {
        // update all directions!
        if (!ti.routes[routes_update[k].id].notices)
          ti.routes[routes_update[k].id].notices = [];

        ti.routes[routes_update[k].id].notices.push({
          type: type, // "interruption" || "announcement"
          transport: transport,
          num: num,
          direction_name: direction_name,
          stop_codes: stop_codes,
          start_date: item.start_date,
          data: json[i],
          index: ti.notices.length,
        });
      }
      //console.log("update", num, direction_name, routes_update);
    }
    item.index = ti.notices.length;
    ti.notices.push(item);
  }
  //console.log("processed data: ", data);

  //ti.notices = data;
  //callback(json);
};

pg.loadInterruptions = function (
  callback,
  interruptions_json,
  announcements_json
) {
  if (ti.notices) callback(ti.notices);
  else if (interruptions_json && announcements_json) {
    if (typeof ti.routes !== "object") {
      window.setTimeout(function () {
        pg.loadInterruptions(callback, interruptions_json, announcements_json);
      }, 200);
    } else {
      pg.updateRouteNotices(interruptions_json, "interruption"); //, callback);
      pg.updateRouteNotices(announcements_json, "announcement"); //, callback);
      pg.renderNotices(ti.notices);
      callback(ti.notices);
    }
  } else {
    /*
    By idk who
     var announcements_url =
      location.hostname == "localhost" || true
        ? "announcements.json"
        : "https://transport.tallinn.ee/tallinn-announcements-curl.php"; 
       var interruptions_url =
      location.hostname == "localhost" || true
        ? "interruptions.json"
        : "https://transport.tallinn.ee/tallinn-interruptions-curl.php";
*/
    // By Tanel aka me 
    var announcements_url ="https://tallinn.simplytobo.eu/proxy/announcements.json";

    var interruptions_url =
      location.hostname == "https://tallinn.simplytobo.eu/announcements.json";

    ti.fDownloadUrl("get", announcements_url, function (announcements_txt) {
      try {
        var ajson = announcements_txt ? JSON.parse(announcements_txt) : [];
      } catch (err) {
        var ajson = [];
      }

      ti.fDownloadUrl("get", interruptions_url, function (interruptions_txt) {
        //ti.fDownloadUrl('get', 'https://opinfo-demo.spin.ee/transporditeade/merakas', function(interruptions_txt) {
        try {
          var ijson = interruptions_txt ? JSON.parse(interruptions_txt) : [];
        } catch (err) {
          var ijson = [];
        }

        pg.loadInterruptions(callback, ijson, ajson);
      });
    });
  }
};

pg.noticesHTML4routes = function (routes, destination) {
  //console.log("noticesHTML4routes", destination, routes.length, routes);

  var tested_routes = {};

  var announcements = [];
  var interruptions = [];

  for (var i = 0; i < routes.length; i++) {
    var route = routes[i];

    var key = [route.city, route.transport, route.num, destination].join(";");
    if (key in tested_routes) continue;

    var ti_routes = ti.fGetRoutes(route.city, route.transport, route.num);
    if (ti_routes.length) {
      var id = ti_routes[0].id;
      var notices = ti.routes[id].notices || [];

      for (var j = 0; j < notices.length; j++) {
        var n = notices[j];

        if (!n.direction_name || n.direction_name == destination) {
          if (n.type == "interruption") {
            interruptions.push(n.index);
          } else if (n.type == "announcement") {
            announcements.push(n.index);
          }
        }
      }
      //console.log("key", key, id, notices);
    }
    tested_routes[key] = true;
  }

  //console.log("a/i", announcements, interruptions);
  return [
    '<div class="fav-notices">',
    interruptions.length
      ? "<span onclick=\"pg.openNotice(event, 'interruption', [" +
        interruptions.join(",") +
        ']);" class="travel-planner-problems"></span>'
      : "",
    announcements.length
      ? "<span onclick=\"pg.openNotice(event,'announcement', [" +
        announcements.join(",") +
        ']);" class="travel-planner-problems announcement"></span>'
      : "",
    "</div>",
  ].join("");
};

pg.noticesHTML = function (route_id, place, stop_id) {
  //return "";
  //console.log("noticesHTML", route_id, place);

  if (!route_id || typeof ti.routes == "undefined" || !(route_id in ti.routes))
    return "";

  var notices = ti.routes[route_id].notices;
  if (!notices || !notices.length) return "";

  var html = [];

  //var interruption_head_inserted = false;
  //var announcement_head_inserted = false;

  var itooltips = [];
  var interruption_indexes = [];
  var atooltips = [];
  var announcement_indexes = [];

  for (var i = 0; i < notices.length; i++) {
    var item = notices[i];

    //console.log("std", item, item.start_date);

    if (place == "routes") {
      var tooltip = [
        '<br/><div class="travel-planner-block">',
        '<span class="travel-planner-time">',
        i18n.fromStart,
        item.start_date,
        i18n.fromEnd,
        "</span>",
        '<span class="travel-planner-info" onclick="pg.openNotice(event,\'',
        item.type,
        "', [",
        item.index,
        ']);">',
        item.type == "interruption" ? item.data.announcement : item.data.title,
        "</span></div>",
      ].join("");

      //console.log("item", item, item.index);

      if (item.type == "interruption") {
        itooltips.push(tooltip);
        interruption_indexes.push(item.index);
      } else if (item.type == "announcement") {
        atooltips.push(tooltip);
        announcement_indexes.push(item.index);
      }
    } else if (place == "planner-head" || place == "favourites") {
      if (
        item.stop_codes.length &&
        (!stop_id || item.stop_codes.indexOf(stop_id) == -1)
      ) {
        // pass
      } else {
        if (item.type == "interruption") {
          interruption_indexes.push(item.index);
        } else if (item.type == "announcement") {
          announcement_indexes.push(item.index);
        }
      }
    } else if (place == "search" || place == "planner-body") {
      html.push(
        [
          '<br/><div class="travel-planner-block"><span class="travel-planner-problems ',
          item.type,
          '"></span>',
          '<span class="travel-planner-time">',
          i18n.fromStart,
          item.start_date,
          i18n.fromEnd,
          "</span>",
          '<span class="travel-planner-info" onclick="pg.openNotice(event,\'',
          item.type,
          "', [",
          item.index,
          ']);">',
          item.type == "interruption"
            ? item.data.announcement
            : item.data.title,
          "</span></div>",
        ].join("")
      );

      //}
      //else if (place == "planner-head" || place == "favourites") {
      //console.log("stop codes", item, item.stop_codes, stop_id);
    } else if (place == "schedule") {
      //if (item.stop_codes.length && item.stop_codes.indexOf(pg.schedule.stopId) == -1) {
      // pass
      //} else {

      var stop_names = "";
      if (item.stop_codes && item.stop_codes.length) {
        stop_names = item.stop_codes
          .map(function (s) {
            return ti.fGetStopDetails(s).name;
          })
          .filter(function (s) {
            return s;
          })
          .join(", ");
      }

      //console.log("eyes", interruption_head_inserted, announcement_head_inserted);
      var tooltip = [
        "<div>",
        item.type == "interruption"
          ? [
              '<span class="travel-planner__problems__item__lines__status"><span class="fas fa-exclamation-triangle"></span></span>',
            ].join("")
          : "",
        item.type == "announcement"
          ? [
              '<span class="travel-planner__problems__item__lines__status announcement"><span class="fas fa-bell"></span></span>',
            ].join("")
          : "",
        '<span class="travel-planner__problems__item__lines__time">',
        i18n.fromStart,
        item.start_date,
        i18n.fromEnd,
        "</span>",
        "<span onclick=\"pg.openNotice(event, '",
        item.type,
        "', [",
        item.index,
        ']);" class="interruption-msg">',
        item.type == "interruption" ? item.data.announcement : item.data.title,
        //item.data.info && item.data.info.indexOf('><\/span>') < 0 ? [' <span style="font-weight:normal">', item.data.info, '</span>'].join(''):'',
        //item.data.info ? ` <span style="font-weight:normal">${item.data.info.replace(/<p>/g, '').split("</p>")[0]}</span>`: '',
        stop_names
          ? [
              ' <span style="font-weight:normal">(',
              stop_names,
              ")</span>",
            ].join("")
          : "",
        "</span></div>",
      ].join("");

      if (item.type == "interruption") {
        itooltips.push(tooltip);
        interruption_indexes.push(item.index);
      } else if (item.type == "announcement") {
        atooltips.push(tooltip);
        announcement_indexes.push(item.index);
      }
      //}
    } else {
      // pass
    }
  }

  if (place == "routes") {
    if (itooltips.length) {
      html.push(
        [
          '<div class="notices"><span onclick="pg.openNotice(event, \'interruption\', [',
          interruption_indexes.join(","),
          ']);" class="travel-planner-problems"></span><div class="tooltips">',
          itooltips.join(""),
          "</div></div>",
        ].join("")
      );
    }
    if (atooltips.length) {
      html.push(
        [
          '<div class="notices"><span onclick="pg.openNotice(event, \'announcement\', [',
          announcement_indexes.join(","),
          ']);" class="travel-planner-problems announcement"></span><div class="tooltips">',
          atooltips.join(""),
          "</div></div>",
        ].join("")
      );
    }
  } else if (place == "planner-head" || place == "favourites") {
    if (interruption_indexes.length) {
      html.push(
        "<span onclick=\"pg.openNotice(event, 'interruption', [",
        interruption_indexes.join(","),
        ']);" class="travel-planner-problems"></span>'
      );
    }

    if (announcement_indexes.length) {
      html.push(
        "<span onclick=\"pg.openNotice(event, 'announcement', [",
        announcement_indexes.join(","),
        ']);" class="travel-planner-problems announcement"></span>'
      );
    }
  } else if (place == "schedule") {
    if (itooltips.length) {
      html.push(itooltips.join(""));
    }

    if (atooltips.length) {
      if (itooltips.length) html.push('<div class="break"></div>');
      html.push(atooltips.join(""));
    }
  }

  return html.join("");
};

/*
pg.downloadInterruptions = function(callback) {
    ti.fDownloadUrl('get', 'merakas.json', function(txt) {
        var json = JSON.parse(txt)
        ti.interruptions = json;
        callback();
    });
}*/

pg.loadNotice = function (id) {
  //console.log("show notice: ", el, id, ti.notices[id]);
  var el = document.getElementById("announcement-" + id);
  if (el && ti.notices[id]) {
    el.innerHTML = ti.notices[id].data.info;
  }
};

pg.renderNotices = function (json) {
  //console.log("render notices!");

  //pg.loadInterruptions(function(json) {
  //console.log("json1!", json);

  var htmlInterruptions = [];
  var htmlAnnouncements = [
    '<div class="travel-planner__notices__head"><span class="fas fa-bell"></span>',
    i18n.announcements,
    '</div><div class="travel-planner__notices__list">',
  ];

  for (var i = 0; i < json.length; i++) {
    var item = json[i];

    if (item.type != "announcement") {
      var routes_html = [];
      for (var j = 0; j < item.routes.length; j++) {
        var r = item.routes[j];

        routes_html.push(
          [
            '<span class="travel-planner__problems__item__lines__single travel-planner__problems__item__lines__single--',
            r.transport,
            '">',
            '    <span class="travel-planner__problems__item__lines__single__number">',
            r.num.toUpperCase(),
            "</span>",
            "</span>",
            //,'<span class="travel-planner__problems__item__lines__single__direction">', r.direction_name, '</span>'
          ].join("")
        );
      }

      var stop_names = "";
      if (item.stop_codes && item.stop_codes.length) {
        stop_names = item.stop_codes
          .map(function (s) {
            return ti.fGetStopDetails(s).name;
          })
          .filter(function (s) {
            return s;
          })
          .join(", ");
      }

      htmlInterruptions.push(
        [
          '<div class="travel-planner__problems__item">',

          i == 0
            ? [
                '<div class="travel-planner__problems__item__head"><span class="fas fa-exclamation-triangle"></span>',
                i18n.disruptions,
                "</div>",
              ].join("")
            : "",

          '<div class="travel-planner__problems__item__lines">',
          '<span class="travel-planner__problems__item__lines__status">',
          '<span class="fas fa-exclamation-triangle"></span>',
          "</span>",

          routes_html.join(""),

          '<span class="travel-planner__problems__item__lines__time">',
          i18n.fromStart,
          item.start_date,
          i18n.fromEnd,
          "</span>",
          "</div>",
          '<div class="travel-planner__problems__item__text">',
          "<strong>",
          item.data.announcement,
          "</strong>",
          item.data.info && item.data.info.indexOf("></span>") < 0
            ? " " + item.data.info
            : "",
          //,item.data.info ? ` <span style="font-weight:normal">${item.data.info.replace(/<p>/g, '').split("</p>")[0]}</span>`: ''

          stop_names ? " (" + stop_names + ")" : "",
          "</div>",
          "</div>",
        ].join("")
      );
    } else {
      //console.log("transport", item.transport);

      htmlAnnouncements.push(
        [
          '<div id="item-',
          item.index,
          '" class="travel-planner__notices__item">',
          '<span class="travel-planner__notices__item__title">',
          item.data.title,
          "</span>",
          '<div class="travel-planner__notices__item__head">',
          '<span class="travel-planner__notices__item__date">',
          item.start_date,
          item.end_date ? " - " + item.end_date : "",
          "</span>",
          '<div class="line-types">',
          '<div class="line-types__list">',
          item.transport
            .map(function (x) {
              return [
                '<span class="line-types__item line-types__item--',
                x,
                '"></span>',
              ].join("");
            })
            .join(""),
          "</div>",
          "</div>",
          "</div>",
          '<div class="travel-planner__notices__item__text" id="announcement-',
          i,
          '">',
          item.data.info.replace(/src=/g, "data-src="),
          "</div>",
          '<button class="btn btn-more" onclick="pg.loadNotice(',
          i,
          "); this.parentNode.classList.toggle('active')\">",
          i18n.showMore,
          '<span class="fas fa-angle-down"></span></button>',
          '<button class="btn btn-less" onclick="this.parentNode.classList.toggle(\'active\')">',
          i18n.showLess,
          '<span class="fas fa-angle-down"></span></button>',
          "</div>",
        ].join("")
      );
    }
  }
  document.getElementById("divAnnouncements").innerHTML =
    htmlInterruptions.join("");

  htmlAnnouncements.push("</div>");
  document.getElementById("divNotices").innerHTML = htmlAnnouncements.join("");
  //});
  /*
    var template = [
       '<article class="textpage def clearfix">',
           '<div class="phone-block" style="border-top:0px;">',
               '<p style="font-size:20px;">', (pg.language == "ee") ? "Notices!" : "Notices.en",'</p>',
           '<br/></div>',
       '</article>',
       pg.footerHTML()
    ];
    jQuery("#divNotices").html(template.join(""));
    */
};

/// test if search must be rendered or rerendered
pg.testIfSearchMustBeRendered = function () {
  //throw "xxx";
  //if(pg.transport != 'plan' && pg.transport != 'favourites' && pg.transport != 'contacts' && pg.transport != 'help' && pg.transport != 'stop' && pg.transport != 'map') {
  if (
    [
      "plan",
      "favourites",
      "contacts",
      "help",
      "stop",
      "map",
      "notices",
    ].indexOf(pg.transport) == -1
  ) {
    //
    if (pg.transport != "home") jQuery("#header2").html(i18n.headerTitle);
    //console.log("testIfSearchMustBeRendered", pg.transport, i18n.headerTitle);

    if (!pg.schedule) {
      //jQuery("#divContentRoutes").removeClass("search").removeClass("location");
      var container = jQuery("#divContentRoutes");

      // neslepiam...
      //console.log("scs", pg.hashForMap);

      if (!pg.hashForMap || pg.hashForMap.indexOf("mylocation") == -1) {
        container.removeClass("search").removeClass("location");
        container.find(".search-stop input").val("");
      } else if (!container.hasClass("location")) {
        // hash for map turi: map,mylocation, bet jis nera rodomas
        //console.log("activate mysearch!"); pg.Gmap i not loaded
      }

      //if(!(container.hasClass("search") || container.hasClass("location"))) {

      //if(!container.find(".search-container .searchbar").length) {
      //if(container.attr("data-language") != pg.language) { // nera nurenderintas arba pasikeite kalba
      //console.log("render search ", container.attr("data-language"), pg.language, i18n.showInMap);
      pg.renderSearch(jQuery("#divContentRoutes"));
      //}
      //}
    }
  }
};

pg.switchStops = function (search) {
  //return false;

  var tmp = pg.inputStart;
  pg.inputStart = pg.inputFinish;
  pg.inputFinish = tmp;
  pg.fLoadPlannerTab(false, pg.transport == "home"); // don't search on index

  if (search && pg.inputStart && pg.inputFinish) {
    pg.fUrlSet({
      transport: "plan",
      inputStart: pg.inputStart /* || pg.inputStop*/,
      inputFinish: pg.inputFinish,
      hashForMap: pg.hashForMap && "map",
    });
  }
  return false;
};

pg.plannerSearch = function () {
  pg.fUrlSet(
    {
      transport: "plan",
      inputStart: pg.inputStart /* || pg.inputStop*/,
      inputFinish: pg.inputFinish,
      hashForMap: pg.hashForMap && "map",
    },
    false,
    true
  );
  pg.fLoadPlannerTab(true);
};

pg.renderFavourites = function () {
  //console.log("render fav1");
  ti.fGetAnyStopDetails([], function () {
    // isitikiname kad stoteliu duomenys uzkrauti
    //console.log("render fav2");
    pg.fLoadRoutesList(function () {
      // ir marsrutai...
      //console.log("render fav3");

      var fav_html = [];
      var counter = { stops: 0, routes: 0, lines: 0 };

      var stops = favourites.getStops();
      //var stops_html = [];
      var inputStops = [];

      jQuery.each(stops, function (stopIds, one) {
        var s = ti.fGetAnyStopDetails(stopIds);
        var title = s.name + s.street ? [" (", s.street, ")"].join("") : "";

        var stops_list = stopIds.split(",");
        for (var k = 0; k < stops_list.length; k++) {
          if (inputStops.indexOf(stops_list[k]) == -1)
            inputStops.push(stops_list[k]);
        }

        counter.stops += 1;

        //stops_html.push(['<li class="without-label">',
        var label = favourites.getLabel(stopIds) || "";
        var label_text = label
          ? ["<strong>", label, "</strong> "].join("")
          : "";
        fav_html.push({
          time: one,
          label: label,
          html: [
            '<tr class="stop">',
            '<td><a href="#stop/',
            stopIds,
            "/",
            pg.language,
            '/map" class="station">',
            '<span class="name">',
            label_text,
            '<span class="',
            label ? "small" : "",
            '">',
            i18n.stop,
            ": <strong>",
            s.name,
            "</strong></span></span>",
            s.street
              ? ['<span class="zone">(', s.street, ")</span>"].join("")
              : "",
            "</a>",
            '<div class="next-departures flive">',
            "<p>",
            i18n.realTimeDepartures,
            "</p>",
            '<div class="clock"></div>',
            //'<ul class="flive-data" id="flive-', [s, route.transport, route.num].join('-'), '">&nbsp',
            '<div class="flive-data-stops" data-stops="',
            stopIds,
            '">&nbsp',
            //'<li><a class="icon_bus" href=""><span class="num">5</span><strong>3 min</strong></a></li>',
            //'<li><a class="icon_regionalbus low" href=""><span class="num">116</span><strong>12 min</strong></a></li>',
            //'<li><a class="icon_bus" href=""><span class="num">5</span><strong>19 min</strong></a></li>',
            "</div>",
            "</div>",
            "</td>",
            '<td class="move"><div class="button button-move"></div></td>',
            "<td>",
            i18n.stop,
            "</td>",
            '<td><a href="#remove" class="remove" data-type="stop" data-key="',
            stopIds,
            '">',
            i18n.btnFavouritesRemove,
            "</a>",
            '<br/><a href="#rename" class="rename" data-type="stop" data-key="',
            stopIds,
            '">',
            i18n.btnFavouritesRename || "Nimeta ümber",
            "</a>",
            "</td>",
            "</tr>",
          ].join(""),
        });

        /*
                '<li class="without-label">',
                '<a href="#stop/', stopIds, '/', pg.language, '" alt="', title, '" title="', title, '" class="stop">',
                i18n.stop, ': <strong>', s.name, '</strong><br>',
                s.street ? ['<span class="muted">(', s.street, ')</span>'].join("") : "",
                '</a>',
                '<a class="remove" data-key="', stopIds, '" href="#remove" alt="', i18n.btnFavouritesRemove, '" title="', i18n.btnFavouritesRemove, '"></a>',
                '</li>'
                */
      });

      var routes = favourites.getRoutes();
      jQuery.each(routes, function (startIds, finishList) {
        var start = ti.fGetAnyStopDetails(startIds);
        //console.log("start", start)
        jQuery.each(finishList, function (finishIds, time) {
          var finish = ti.fGetAnyStopDetails(finishIds);
          counter.routes += 1;

          var key = [startIds, finishIds].join(";");
          var label = favourites.getLabel(key) || "";
          var label_text = label
            ? ["<strong>", label, "</strong> "].join("")
            : "";

          fav_html.push({
            time: time,
            label: label,
            html: [
              '<tr class="route">',
              '<td><a href="#planf/',
              [startIds, finishIds, pg.language].join("/"),
              '" class="planner">',
              label
                ? ['<span class="name">', label_text, "</span>"].join("")
                : "",
              '<span class="name"><span class="',
              label ? "small" : "",
              '">',
              i18n.startStop,
              ": <strong>",
              startIds == "gps" ? i18n.myLocation : start.name,
              "</strong></span></span>",
              '<span class="name"><span class="',
              label ? "small" : "",
              '">',
              i18n.finishStop,
              ": <strong>",
              finishIds == "gps" ? i18n.myLocation : finish.name,
              "</strong></span></span>",
              "</a></td>",
              '<td class="move"><div class="button button-move"></div></td>',
              "<td>",
              i18n.menuTripPlanner,
              "</td>",
              '<td><a href="#remove" class="remove" data-type="route" data-key="',
              key,
              '">',
              i18n.btnFavouritesRemove,
              "</a>",
              '<br/><a href="#rename" class="rename" data-type="route" data-key="',
              key,
              '">',
              i18n.btnFavouritesRename || "Nimeta ümber",
              "</a>",
              "</td>",
              "</tr>",
            ].join(""),

            /*
                        '<li><a href="#plan/', [startIds, finishIds, pg.language].join('/'), '" class="planner">',
                        '<span class="name">', i18n.startStop, ': <strong>', (startIds=="gps") ? i18n.myLocation : start.name, '</strong></span>',
                        '<span class="name">', i18n.finishStop, ': <strong>', (finishIds=="gps") ? i18n.myLocation : finish.name, '</strong></span>',
                        '</a>',
                        '<a class="remove" data-key="', [startIds, finishIds].join(";"), '" href="#remove" alt="', i18n.btnFavouritesRemove, '" title="', i18n.btnFavouritesRemove, '"></a>',
                        */
          });
        });
      });

      var schedules = favourites.getSchedules();

      jQuery.each(schedules, function (city, transport) {
        jQuery.each(transport, function (t, num) {
          jQuery.each(num, function (n, dir) {
            jQuery.each(dir, function (d, stops) {
              var routes = ti.fGetRoutes(city, t, n, d);

              //console.log("ti.fGetRoutes", city, t, n, d, routes);

              if (!routes.length) return true; // continue
              var route = routes[0];

              //console.log("route: ", route);

              jQuery.each(stops, function (s, one) {
                var key = [city, t, n, d, s].join(";");
                var label = favourites.getLabel(key) || "";
                var label_text = label
                  ? ["<strong>", label, "</strong> "].join("")
                  : "";

                var notices = pg.noticesHTML(route.id, "favourites", s);
                //console.log("NOOOT", notices);

                if (s != "$") {
                  // stoteles kuriom reikes rodyti live isvykimus...
                  if (inputStops.indexOf(s) == -1) inputStops.push(s);

                  var stop = ti.fGetStopDetails(s);
                  var hashForSchedule = pg.fUrlSet(
                    {
                      hashForMap: "",
                      schedule: {
                        city: route.city,
                        dirType: route.dirType,
                        transport: route.transport,
                        num: route.num,
                        stopId: s,
                      },
                    },
                    true
                  );
                  //stops_html.push
                  counter.stops += 1;

                  fav_html.push({
                    time: one,
                    label: label,
                    html: [
                      '<tr class="stop">',
                      '<td><a href="#',
                      hashForSchedule,
                      '" class="icon_',
                      route.transport,
                      '"',
                      route.num.length > 6 ? ' style="padding-left:150px"' : "",
                      ">",
                      '<span class="num">',
                      route.num,
                      "</span>",

                      label
                        ? ['<span class="name">', label_text, "</span>"].join(
                            ""
                          )
                        : "",

                      '<span class="line">',
                      route.name,
                      "</span>",
                      '<span class="name"><span class="',
                      label ? "small" : "",
                      '">',
                      i18n.stop,
                      ": <strong>",
                      stop.name,
                      "</strong></span></span>",

                      "</a>",
                      notices
                        ? ['<div class="fav-notices">', notices, "</div>"].join(
                            ""
                          )
                        : "",

                      '<div class="next-departures flive">',
                      "<p>",
                      i18n.realTimeDepartures,
                      "</p>",
                      '<div class="clock"></div>',
                      '<ul class="flive-data flive-',
                      [s, route.transport, route.num].join("-"),
                      '" data-direction="',
                      route.dirType,
                      '" id="flive-',
                      [s, route.transport, route.num].join("-"),
                      '">&nbsp',
                      //'<li><a class="icon_bus" href=""><span class="num">5</span><strong>3 min</strong></a></li>',
                      //'<li><a class="icon_regionalbus low" href=""><span class="num">116</span><strong>12 min</strong></a></li>',
                      //'<li><a class="icon_bus" href=""><span class="num">5</span><strong>19 min</strong></a></li>',
                      "</ul>",
                      "</div>",
                      "</td>",
                      '<td class="move"><div class="button button-move"></div></td>',
                      "<td>",
                      i18n.stop,
                      "</td>",
                      '<td><a href="#remove" class="remove" data-type="stop" data-key="',
                      key,
                      '">',
                      i18n.btnFavouritesRemove,
                      "</a>",
                      '<br/><a href="#rename" class="rename" data-type="stop" data-key="',
                      key,
                      '">',
                      i18n.btnFavouritesRename || "Nimeta ümber",
                      "</a>",
                      "</td>",
                      "</tr>",
                      /*
                                    '<li><a href="#', hashForSchedule, '" alt="', route.num, " ", route.name, '" title="', route.num, " ", route.name, '" class="icon_', route.transport, '"><table onclick="window.location.hash=\'', hashForSchedule, '\'"><tr><td>',
                    '<span class="label label-', t, ' num', route.num.length, '">', route.num, '</span></td><td>', route.name, '<br>',
                    i18n.stop, ': <strong>', stop.name, '</strong>',
                    '<div class="flive" id="flive-', [s, route.transport, route.num].join('-'), '">&nbsp;</div>',
                    '</td></tr></table>',
                    '<div id="flive-wait-', [s, route.transport, route.num].join('-'), '" class="timetowait"></div>',
                    '</a>',
                    '<a class="remove" data-key="', [city, t, n, d, s].join(";"), '" href="#remove" alt="', i18n.btnFavouritesRemove, '" title="', i18n.btnFavouritesRemove, '"></a>',
                    '</li>'*/
                    ].join(""),
                  });
                  /* neturime kur prenumeruoti marsruto (be stoteles) */
                } else {
                  // marsrutas stopsId == $
                  var hashForSchedule = pg.fUrlSet(
                    {
                      hashForMap: "",
                      schedule: {
                        city: route.city,
                        dirType: route.dirType,
                        transport: route.transport,
                        num: route.num,
                      },
                    },
                    true
                  );
                  //routes_html.push
                  counter.lines += 1;

                  fav_html.push({
                    time: one,
                    label: label,
                    html: [
                      '<tr class="line">',
                      "<td>",
                      '<a href="#',
                      hashForSchedule,
                      '" class="icon_',
                      route.transport,
                      '">',
                      '<span class="num">',
                      route.num,
                      "</span>",
                      label
                        ? ['<span class="name">', label_text, "</span>"].join(
                            ""
                          )
                        : "",

                      '<span class="name line"><span class="',
                      label ? "small" : "",
                      '">',
                      route.name,
                      "</span></span>",

                      "</a>",
                      notices
                        ? ['<div class="fav-notices">', notices, "</div>"].join(
                            ""
                          )
                        : "",
                      "</td>",
                      '<td class="move"><div class="button button-move"></div></td>',
                      "<td>",
                      i18n.line,
                      "</td>",
                      '<td><a href="#remove" class="remove" data-type="line" data-key="',
                      key,
                      '">',
                      i18n.btnFavouritesRemove,
                      "</a>",
                      '<br/><a href="#rename" class="rename" data-type="line" data-key="',
                      key,
                      '">',
                      i18n.btnFavouritesRename || "Nimeta ümber",
                      "</a>",
                      "</td>",
                      "</tr>",
                    ].join(""),
                  });
                }
              });
            });
          });
        });
      });

      //document.title = i18n.menuFavorites;

      fav_html.sort(function (a, b) {
        if (a.label && !b.label) return -1;
        if (b.label && !a.label) return 1;

        return new Date(b.time) - new Date(a.time);
      });

      jQuery("#fav .filter").html(
        [
          '<div class="toggle-btns">',
          '<a href="#show" class="active" data-type="all">',
          i18n.allResults,
          /*Show all*/ ' (<span id="all-counter">',
          counter.stops + counter.lines + counter.routes,
          "</span>)</a>",
          '<a href="#show" data-type="stop">',
          i18n.stops,
          ' (<span id="stop-counter">',
          counter.stops,
          "</span>)</a>",
          '<a href="#show" data-type="line">',
          i18n.routes,
          ' (<span id="line-counter">',
          counter.lines,
          "</span>)</a>",
          '<a href="#show" data-type="route">',
          i18n.menuTripPlanner,
          ' (<span id="route-counter">',
          counter.routes,
          "</span>)</a>",
          "</div>",
        ].join("")
      );

      /*
            var footer = cfg.cities[pg.city].footer;
            footer = (footer && (footer[pg.language] || footer['en'])) || '';
            jQuery("#fav .footer-info").html(['<br/>',
                footer,
                '<p id="programmedBy" class="smalltext graytext">',(cfg.programmedBy[pg.language] || cfg.programmedBy['en'] || '') ,'</p>'
            ].join(""));
            */
      jQuery("#fav .footer-pro").html("<br/>" + pg.footerHTML());

      jQuery("#fav .filter a").click(function () {
        var type = jQuery(this).attr("data-type");
        jQuery("#fav .filter a").removeClass("active");
        jQuery(this).addClass("active");

        jQuery("#favourites").removeClass().addClass(type);

        var counter = 0;

        jQuery.each(jQuery("#favourites tr"), function () {
          var tr = jQuery(this);
          tr.removeClass("even").removeClass("odd");
          if (tr.hasClass(type)) {
            tr.addClass(counter % 2 ? "odd" : "even");
            counter += 1;
          }
        });

        return false;
      });

      //jQuery("#fav-sortable").html(jQuery.map(fav_html, function(x) {return x.html;}).join(""));
      //jQuery("#fav-sortable")[0].innerHTML =
      var rows = jQuery
        .map(fav_html, function (x) {
          return x.html;
        })
        .join("");

      jQuery("#favourites").html(
        [
          '<table class="fav-table"><tbody id="fav-sortable">',
          rows,
          "</tbody></table>",
        ].join("")
      );

      //console.log("inputStops", inputStops);

      if (inputStops.length) {
        // reikia paleisti live rezultatu updatinima...
        pg.favouriteStops = inputStops.join(",");

        pg.renderRealtimeDepartures("favourites");

        /*
                //console.log("inputStop", inputStops);
                pg.fProcessVehicleDepartures(null, function (data) {
                    //console.log("data1: ", data);

                    jQuery("#favourites .favourites-list .flive").html("&nbsp;").removeClass("active");

                    if (typeof data == "string") { // reiskia gavome zinute kuria reikia parodyti - pvz nera interneto.
                        jQuery("#favourites .favourites-list .flive").html(data).addClass("active"); // visiems prirasome ta pati texta/nenaudojamas
                        return; // nieko nerodom
                    } else if (typeof data == "object" && ("status" in data)) { // gauta klaida, nieko nerodom
                        return;
                    }

                    jQuery.each(data, function (i, r) {
                        var id = ["flive", r.route.stopId, r.route.transport, r.route.num].join("-");
                        var id_wait = ["flive-wait", r.route.stopId, r.route.transport, r.route.num].join("-");

                        r.times.sort(function (a, b) { return a - b });

                        var timetowait = "";
                        if (r.times.length) {
                            var now = new Date();
                            var n = now.getHours() * 60 + now.getMinutes();
                            timetowait = (r.times[0] - n) + " min";
                        }
                        jQuery("#favourites #" + id_wait).html(timetowait);

                        jQuery("#favourites #" + id).html([i18n.realTimeDepartures, ': ',
                            jQuery.map(r.times, function (t) { return [ti.printTime(t), '&ensp;'].join('') }).join(''),
                        ].join("")).addClass("active");
                    });
                });
                */
        //pg.loadedDepartingRoutes = pg.favouriteStops; //store to skip reloading later with params are the same
      } else {
        pg.favouriteStops = "";
      }

      jQuery("#fav-sortable a.remove").bind("click", function () {
        var key = jQuery(this).attr("data-key");
        var type = jQuery(this).attr("data-type");

        favourites.removeKey(key);
        jQuery(this).parent().parent().remove();

        var all_counter = jQuery("#all-counter");
        var type_counter = jQuery("#" + type + "-counter");

        all_counter.html(parseInt(all_counter.html()) - 1);
        type_counter.html(parseInt(type_counter.html()) - 1);

        return false;
      });

      jQuery("#fav-sortable a.rename").bind("click", function () {
        var key = jQuery(this).attr("data-key");

        var table_cell = jQuery(this).parent();
        table_cell.addClass("label-active");

        input_el = document.createElement("input");
        input_el.className = "change-label";
        input_el.type = "text";
        var input = jQuery(input_el);
        table_cell.append(input_el);
        input.val(favourites.getLabel(key) || "");
        input.focus();

        input.keypress(function (e) {
          if (e.which == 13) {
            var value = input.val();
            favourites.changeLabel(key, value);

            table_cell.removeClass("label-active");
            input.remove();
            pg.renderFavourites();
            return false;
          }
        });

        input.focusout(function () {
          table_cell.removeClass("label-active");
          input.remove();
        });

        return false;
      });

      var fixHelper = function (e, ui) {
        ui.children().each(function () {
          jQuery(this).width(jQuery(this).width());
        });
        return ui;
      };

      jQuery("#fav-sortable")
        .sortable({
          handle: ".button-move",
          helper: fixHelper,
          update: function (e, ui) {
            var keys = jQuery.map(
              jQuery("#fav-sortable a.remove"),
              function (x) {
                return jQuery(x).attr("data-key");
              }
            );
            var now = jQuery.now();
            //console.log("now: ", now);

            jQuery.each(keys, function (i, key) {
              //console.log("i", i, key, now-i);
              favourites.setTime(key, now - i);
            });

            //console.log("sorted keys: ", keys);
          },
        })
        .disableSelection();
    });
  });
};

pg.fScheduleHide = function () {
  pg.schedule = null;

  if (document.body.className.indexOf("Schedule") >= 0) {
    jQuery("body")
      .removeClass("ScheduleMapDisplayed")
      .removeClass("ScheduleDisplayed");

    //document.body.className = '';
    $("divMap").style.width = "100%"; //IE7 sticks to css expressions values otherwise
    $("divMap").style.height = "100%";
  }
};

pg.fCreateNavigation = function (callback) {
  //throw "xxx";
  //alert("hello");
  /*
    <nav id="areaMenu" role="navigation">
        <ul>
            <li>
                <a class="tallinn" href="">Tallinn Transport</a>
                <ul>
                    <li><a href="" class="icon_bus active">Bus</a></li>
                    <li><a href="" class="icon_trol">Trolley</a></li>
                    <li><a href="" class="icon_tram">Tram</a></li>
                </ul>
            </li>
            <li>
                <a class="harju" href="">Regional Transport</a>
                <ul>
                    <li><a href="" class="icon_regionalbus">Bus</a></li>
                    <li><a href="" class="icon_train">Train</a></li>
                    <li><a href="" class="icon_commercialbus">Commercail bus</a></li>
                </ul>
            </li>
        </ul>
    </nav>
    */

  if (typeof mobile != "undefined" && typeof callback == "undefined") {
    return;
  }

  //var splitter = '<dt class="splitter"></dt><!-- -->';
  var city = pg.fGetCity(pg.city); // in case pg.city is region, we need city of the region
  var transportOrder = 0;

  if (typeof callback == "function") {
    var data = [];
  }

  if (cfg.cities[city]) {
    //var htmlTransport = '';

    var htmlTransport = [
      [
        '<nav id="areaMenu" role="navigation"><a class="icon_home active" href="#/',
        pg.language,
        '"><span>',
        i18n.homepage,
        '</span></a><a class="icon_schedule" href="#',
        city,
        "/",
        pg.language,
        '"><span>',
        i18n.routesAndTimetables,
        '</span></a><ul class="transport-navigation">',
      ].join(""),
    ];

    //var htmlOptionsTransport = '';
    var htmlPlannerTransport = [];
    var isPrintedOptionsTransport = {};

    for (var k = 1; k <= 2; k++) {
      var hash = pg.fUrlSet(
        { city: city, transport: null, hashForMap: null },
        true
      );

      if (typeof callback == "function") {
        data.push({
          hash: hash,
          city: city,
          type: k == 1 ? "city" : "region",
          transport: [],
          timeout: cfg.cities[city].goHomeTimeout,
        });
      }

      if (!cfg.cities[city].goHomeTimeout) {
        //htmlTransport +=
        //    '<dt><a id="' + (k == 1 ? 'city' : 'region') + '" href="#' + hash + '">'
        //    + (cfg.cities[city].logo || '')
        //    + '<span class="hover">'
        //;
        var cityName = cfg.cities[city].name;

        if (cityName) {
          var name =
            cityName[pg.language] ||
            cityName["en"] ||
            (k == 1 ? i18n.cityRoutes : i18n.regionRoutes);
          //htmlTransport += name;
        } else {
          var name = k == 1 ? i18n.cityRoutes : i18n.regionRoutes;
          //htmlTransport += (k == 1 ? i18n.cityRoutes : i18n.regionRoutes);
        }
        //htmlTransport.push([name, '</a>'].join(''));

        htmlTransport.push(
          [
            "<li>",
            '<a id="',
            k == 1 ? "city" : "region",
            '" class="',
            k == 1 ? "tallinn" : "harju",
            '" href="#',
            hash,
            '">',
            name,
            "</a><ul>",
          ].join("")
        );

        //+= name;

        if (typeof callback == "function") {
          data[k - 1].name = name;
          data[k - 1].logo = cfg.cities[city].logo || "";
        }

        //htmlTransport += '</span></a></dt>';
      }

      for (var i = 0; i < cfg.cities[city].transport.length; i++) {
        var tr = cfg.cities[city].transport[i];

        if (
          (cfg.cities[city].transportTemporary || {})[tr] &&
          !(ti.cityTransportRoutes || {})[city + "_" + tr]
        ) {
          continue;
        }

        var checked = ' checked="checked"';

        if (
          cfg.cities[city].transportPlannerUncheck &&
          cfg.cities[city].transportPlannerUncheck[tr]
        ) {
          checked = "";
        }

        var hash2 = pg.fUrlSet(
          { city: city, transport: tr, hashForMap: null },
          true
        );

        var tip = ((cfg.cities[city].transportTip || {})[tr] || {})[
          pg.language
        ];

        if (tip) {
          tip = ' title="' + tip + '"';
        }

        //htmlTransport += ('<dt><a id="' + city + '_{tr}" href="#' + hash2 + '"' + tip
        //        + '><span class="icon icon_{tr}"></span>'
        //        + '<span class="hover">' + i18n.transport[tr] + '</span></a></dt>').replace(/{tr}/g, tr)
        //;
        htmlTransport.push(
          [
            '<li><a id="',
            city,
            "_",
            tr,
            '" href="#',
            hash2,
            '" class="icon_',
            tr,
            pg.transport == tr ? " active" : "",
            '">',
            i18n.transport[tr],
            "</a></li>",
          ].join("")
        );

        if (typeof callback == "function") {
          data[k - 1].transport.push({
            hash: hash2,
            transport: tr,
            name: i18n.transport[tr],
          });
        }

        if (!isPrintedOptionsTransport[tr]) {
          isPrintedOptionsTransport[tr] = true;
          //htmlOptionsTransport += (('<label for="checkbox{tr}"><input name="checkbox{tr}" id="checkbox{tr}" type="checkbox" value="{tr}"' + checked + '/>').replace(/{tr}/g, tr) + i18n.transport[tr] + '</label> ');

          htmlPlannerTransport.push(
            [
              '<div class="input">',
              '<input type="checkbox" id="checkbox',
              tr,
              '"',
              checked,
              ">",
              '<label class="icon_',
              tr,
              '" for="checkbox',
              tr,
              '">',
              i18n.transport[tr],
              "</label>",
              "</div>",
            ].join("")
          );
        }

        cfg.transportOrder[tr] = ++transportOrder;
      }

      city = cfg.cities[city].region;

      if (!city || !cfg.cities[city]) {
        break;
      }

      //htmlTransport += splitter;
      htmlTransport.push("</ul></li>");

      if (k == 1) {
        htmlTransport.push(
          [
            '<li><a id="schoolbus" class="schoolbus external" href="',
            cfg.city.urlSchoolbus,
            '" target="_blank"><span>',
            i18n.transport.schoolbus,
            "</span></a></li>",
          ].join("")
        );
        htmlTransport.push(
          [
            '<li><a id="ship" class="ship external" href="',
            cfg.city.urlShip,
            '" target="_blank"><span>',
            i18n.transport.ferry,
            "</span></a></li>",
          ].join("")
        );
      }
    }
    htmlTransport.push("</ul></nav>");

    /*
        if (cfg.defaultCity == 'pskov') {
            htmlTransport += splitter;

            var cities = ['dedovichi', 'nevel', 'novorzhev', 'ostrov', 'porxov'];

            for (var i = 0; i < cities.length; ++i) {
                var city = cities[i];

                htmlTransport += '<dt><a id="' + city + '_bus" href="#' + city + '/bus"><span class="hover">'
		                     + cfg.cities[city].name[pg.language] + '</span></a></dt>';
            }
        }*/

    //($('listTransports') || {}).innerHTML = htmlTransport;
    ($("areaMenuContainer") || {}).innerHTML = htmlTransport.join("");

    //($('divContentPlannerOptionsTransport') || {}).innerHTML = i18n.optionsTransport + ':' + htmlOptionsTransport;

    jQuery("#plannerTransport").html(
      [
        '<label class="caption">',
        i18n.optionsTransport,
        ":</label>",
        htmlPlannerTransport.join(""),
      ].join("")
    );

    jQuery("#planner input:checkbox, select:not(.date-select)").uniform();

    //jQuery("#areaMenu a").click(function() {
    //    jQuery("#areaMenu a").removeClass("active");
    //    jQuery(this).addClass("active");
    //console.log("this", this, jQuery(this));
    //});

    jQuery("body").removeClass("empty");
  }

  if (
    cfg.transportOrder["commercialbus"] &&
    cfg.transportOrder["regionalbus"]
  ) {
    cfg.transportOrder["commercialbus"] = cfg.transportOrder["regionalbus"];
  }

  if (callback) {
    callback(data);
  }
};

pg.renderSearch = function (page) {

  return;
  //console.log("render search...");

  pg.fCreateNavigation(function (navigation) {
    // reikia miestu...
    //console.log("render search...1");

    // problema - kad pilnai vykdo fTabActivate koda
    //pg.fLoadRoutesList(function (routes) {
    //}); // profilaktiskai - anksciau buvo naudojamas su callbacku (gal mobilioje versijoj reikia..)
    // test it

    //console.log("render search...2");

    var cities_html = [];
    var selected_city = "";

    var cities = [];
    jQuery.each(navigation, function (i, data) {
      if (data.city == pg.city || (!pg.city && i == 0)) {
        // active
        cities_html.push(
          [
            '<li data-city="',
            data.city,
            '" class="active ',
            data.city,
            '"><span title="',
            data.name,
            '">',
            data.name,
            ' <span class="total"></span></span></li>',
          ].join("")
        );
      } else {
        cities_html.push(
          [
            '<li data-city="',
            data.city,
            '" class="',
            data.city,
            '"><a alt="',
            data.name,
            '" title="',
            data.name,
            '">',
            data.name,
            ' <span class="total"></span></a></li>',
          ].join("")
        );
      }

      cities.push(data.city);

      //console.log(data.city , pg.city);

      if (data.city == pg.city || (!pg.city && i == 0)) {
        selected_city = data.city;
      }
      //city_options_html.push(['<option value="', data.city, '"', ((data.city==pg.city || (!pg.city && i == 0))?' selected="selected"':''), '>', data.name, '</option>'].join(""));
    });

    //console.log("selected_city", selected_city + "x");

    document.title = i18n.menuSearch;

    //console.log("pg.language", pg.language);

    var template = [
      '<div class="searchbar">',
      '<form action="" class="clearfix form-search travel-planner__location" onsubmit="return false;">',
      '<a href="#" class="button button-location" onclick="return false;"><span>',
      i18n.myLocation,
      "</span></a>",
      '<div class="travel-planner__location__search">',
      '<div class="search-stop">',
      '<input type="text" placeholder="',
      i18n.searchRoutesAndStops,
      '"',
      //'onfocus    ="pg.inputRoutes_Focus();"',
      //'onblur     ="pg.inputRoutes_Blur();"',
      //'onkeydown ="pg.inputRoutes_KeyDown(event);"',
      "/>",
      '<button class="button button-cleartext" type="button"></button>',
      "</div>",
      "</div>",

      '<button class="button button-search small" type="submit"></button>',
      "</form>",
      "</div>",

      /*
                '<div class="searchbar">',
                   '<form action="" onsubmit="return false;" class="clearfix form-search">',
                        '<a href="#search" class="button button-location"></a>',
                        
                        '<div class="search-stop">',
                            '<input type="text" placeholder="', i18n.searchRoutesAndStops, '">',
                            '<button class="button button-cleartext" type="submit" style="position:absolute;right:18px;top:15px;"></button>',
                        '</div>',
                        
                    '</form>',
                '</div>',
                */

      '<div class="searchData">',

      '<input class="selected-city" type="hidden" value="',
      selected_city,
      '">',
      cfg.city.region
        ? [
            '<div class="row-fluid"><ul class="nav nav-tabs nav-region">',
            cities_html.join(""),
            "</ul></div>",
          ].join("")
        : "",
      '<div class="row-fluid">',
      '<ul class="nav nav-tabs nav-search">',
      //'<li class="active" data-filter="all" style="width:25.0%"><span title="', i18n.allResults, '"><span>', i18n.allResults, '<span class="total-number"></span></span></span></li>',
      '<li class="active" data-filter="stops"><a alt="',
      i18n.stops,
      '" title="',
      i18n.stops,
      '"><span>',
      i18n.stops,
      '<span class="stops-number"></span></span></a></li>',
      '<li data-filter="lines"><a alt="',
      i18n.routes,
      '" title="',
      i18n.routes,
      '"><span>',
      i18n.routes,
      '<span class="routes-number"></span></span></a></li>', // marsrutai
      '<li data-filter="addresses"><a alt="',
      i18n.addresses || "Places and addresses",
      '" title="',
      i18n.addresses || "Places and addresses",
      '"><span>',
      i18n.addresses || "Places and addresses",
      '<span class="addresses-number"></span></span></a></li>', // marsrutai
      "</ul>",
      "</div>",
      '<div class="row-fluid">',
      '<ul class="nav nav-list search-results stops">',
      "</ul>",
      "</div>",

      "</div>",

      '<div class="myLocation">',
      //'<div class="map">',
      //    '<div id="map-canvas"></div>',
      //'</div>',
      '<div class="stopslist">',
      '<ul class="nearest-stops">',
      "</ul>",
      "</div>",
      "</div>",

      //'<div class="row-fluid"><h2 class="search-results-placeholder">' + i18n.searchExplanation + '</h2></div>',
      //mobile.render_footer(),
      //mobile.renderFooter(),
      //'</div>'
    ];

    page.find(".search-container").html(template.join(""));
    page.attr("data-language", pg.language);

    pg.initSearch(page, cities);

    //mobile.renderMenu();

    //jQuery('#search-input').get().focus();

    // aktyvuojame stoteliu/marsrutu paieska ivedant pavadinima

    //});
  });
};

// pg.searchPlaces = //deleted by Evaldas 2018-10-05: use pg.geocoder.search() directly, no need to load any modules

//pg._userDraggedMyLocation = false; // user dragged myLocation use it...
//pg._myLocationActive = false; // make it inactive only after clear/or search is clicked!

pg.updateMyLocationMarker = function (location, panToMyLocation) {
  if (typeof pg.youAreHere == "undefined") return;

  if (!pg.mapShowLocation) {
    pg.youAreHere.remove();
    pg.locationAccuracyCircle.remove();
    return;
  }

  pg.youAreHere.setLatLng(location).addTo(pg.GMap);

  pg.youAreHereInfowindow.setLatLng(location);

  //pg.youAreHere.setDraggable(true);

  //console.log("renderMyLocation", location);

  if (location.accuracy) {
    pg.locationAccuracyCircle
      .setLatLng(location)
      .setRadius(location.accuracy)
      .addTo(pg.GMap);
  } else {
    pg.locationAccuracyCircle.remove();
  }

  //google.maps.event.clearListeners(pg.youAreHere, 'click');
  //google.maps.event.clearListeners(pg.youAreHere, 'dragstart');
  //google.maps.event.clearListeners(pg.youAreHere, 'dragend');

  pg.youAreHere.off("dragstart dragend");

  //google.maps.event.addListener(pg.youAreHere, 'dragend', function (event) {
  pg.youAreHere.on("dragend", function (event) {
    //pg.renderMyLocation(page, event.latLng.lat(), event.latLng.lng());
    var position = event.target.getLatLng();

    pg.locationAccuracyCircle.remove(); //setMap(null);
    if (pg.hashForMap && pg.hashForMap.indexOf("mylocation") != -1) {
      // ijungtas mylocation, bet vieta dar buvo nenustatyta
      pg.updateDirectionService(jQuery("#divContentRoutes"), position);
    }
    fixGeolocation({ lat: position.lat, lng: position.lng, accuracy: 50 });
  });

  //console.log("PAN!");
  if (location.accuracy && location.accuracy > 50) {
    if (panToMyLocation)
      pg.GMap.flyToBounds(pg.locationAccuracyCircle.getBounds());
    pg.youAreHereInfowindow
      .setContent(i18n.dragMarkerText)
      //.setLatLng(location)
      .openOn(pg.GMap); //, pg.youAreHere);
  } else {
    if (panToMyLocation) {
      //pg.GMap.setCenter(location);
      //pg.GMap.setZoom(18);
      pg.GMap.flyTo(location, 15);
    }
  }

  //	google.maps.event.addListener(pg.youAreHere, 'dragstart', function() {
  pg.youAreHere.on("dragstart", function (event) {
    pg.youAreHereInfowindow.remove(); //close();
  });
};

pg.renderMyLocation = function (page, location) {
  //console.log("ccc", page, location);
  //pg._myLocationActive = true;
  //pg.loadGoogleMapsScript(function() { // reikia kad autosuggeste butu variantai

  if (!pg.hashForMap || pg.hashForMap.indexOf("mylocation") == -1) {
    // atidarom zemelapi jeigu dabar jo nera
    pg.fTabShowMap_Click("", "mylocation");
  }

  window.setTimeout(function () {
    // problema, kad dar nespejame uzkrauti zemelapio ir nesuformuotas layout'as o jau darome setCenter - kuris klaidingai nustato centra
    pg.loadGoogleMapsScript(function () {
      if (typeof pg.youAreHere != "undefined") {
        pg.updateMyLocationMarker(location, true);
        pg.updateDirectionService(page, location);
      }
    });
  }, 1000);
};

pg.getNearestStopsHTML = function (location, number) {
  var stopsByDistance = [];
  jQuery.each(ti.stops, function (id, stop) {
    if (stop.name != "" && stop.id != "gps") {
      stopsByDistance.push({
        distance: parseInt(
          ti.distance(location.lat, location.lng, stop.lat, stop.lng),
          10
        ),
        stop: stop,
      });
    }
  });

  stopsByDistance.sort(function (a, b) {
    return a.distance - b.distance;
  });

  var stops_html = [];

  jQuery.each(stopsByDistance.slice(0, number), function (i, data) {
    if (!data.stop.name) return true;
    if (data.stop.id == "gps") return true;

    //console.log("data", data);

    var routes_at_stop = ti.fGetRoutesAtStop(data.stop.id);
    var hash = "stop/" + data.stop.id + "/" + pg.language;

    var transport_html = [
      "<li>",
      '<a href="#',
      hash,
      '"><h3>',
      data.stop.name,
      data.stop.street ? [" (", data.stop.street, ")"].join("") : "",
      " <span>(" + data.distance + " m)</span></h3>",
      '<ul class="transport">',
    ];

    var previous_transport = "";
    //console.log(routes_at_stop)
    if (!routes_at_stop.length) {
      transport_html.push(
        [
          '<li class="final_stop" title="Final stop">',
          ti.fGetStopDetails(data.stop.id).street || "*",
        ].join("")
      );
    }

    jQuery.each(routes_at_stop, function (i, r) {
      if (!previous_transport || previous_transport != r.transport) {
        if (previous_transport) transport_html.push("</li>");
        transport_html.push(['<li class="icon_', r.transport, '">'].join(""));
      }

      if (previous_transport == r.transport && previous_num == r.num) {
        return true;
      }

      transport_html.push(
        ['<span class="num" href="#', hash, '">', r.num, "</span>"].join("")
      );

      previous_transport = r.transport;
      previous_num = r.num;
    });

    transport_html.push(
      '</li></ul></a><a class="plan" href="javascript:void(0)" data-id="',
      data.stop.id,
      '"></a></li>'
    );
    //transport_html.push('</li></ul><a class="plan" href="#plan/', pg.language, '" data-id="', data.stop.id,'"></a></li>');
    stops_html.push(transport_html.join(""));
  });

  return stops_html.join("");
};

pg.updateDirectionService = function (page, location) {
  //var lat = pg._userDraggedMyLocation ? pg._userDraggedMyLocation.lat() : window.gps.lat;
  //var lng = pg._userDraggedMyLocation ? pg._userDraggedMyLocation.lng() : window.gps.lng;

  var stops_html = pg.getNearestStopsHTML(location, 10);

  //console.log(page.find(".nearest-stops")[0], stops_html);
  page.find(".nearest-stops").html(stops_html);

  page.find("a.plan").bind("click", function () {
    var id = jQuery(this).attr("data-id");
    var stop = ti.fGetStopDetails(id);

    var url = [
      "https://www.google.com/maps/dir/?api=1&origin=",
      [location.lat, location.lng].join(","),
      "&destination=",
      [stop.lat, stop.lng].join(","),
    ].join("");
    window.open(url, "_blank");
    /*
        var request = {
            origin: [location.lat, location.lng].join(','), //"59.4330378,24.7457094",
            destination: [stop.lat, stop.lng].join(','),
            travelMode: google.maps.TravelMode.WALKING //DRIVING
        };
        v3.directionsDisplay.setMap(pg.GMap);
        
        v3.directionsService.route(request, function (result, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                v3.directionsDisplay.setDirections(result);
            }
        });*/
    return false;
  });

  page.find(".search-stop input").val(i18n.myLocation).trigger("input");
  page.removeClass("search").addClass("location");
};

pg.initSearch = function (page, cities) {
  //if(!page) page = jQuery("#search");

  //console.log("pg.initSearch", page, cities);
  //console.log("hhhash", pg.hashForMap, pg.GMap);
  //pg.renderMyLocation(jQuery("#divContentRoutes"));

  page.find(".button-location").bind("click", function () {
    createMyLocation(function () {
      if (!window.gps) {
        alert(i18n.locationNotKnown);
        return false;
      }

      pg.renderMyLocation(page, window.gps);
      //pg.renderMyLocation(jQuery("#divContentRoutes"));
    });

    return false;
  });

  page.find(".form-search input").typeahead({
    //manual:true, // reikes paciam kviesti lookup()
    source: function (query, process) {
      //console.log("this.query", this);
      // Cia reikia padaryti tik marsrutu paieska - nes stoteliu paieskai yra.fGetStopsByName();
      //console.log('page.find(".selected-city").val()', page.find(".selected-city").val());
      var routes = ti.fGetRoutes(page.find(".selected-city").val());
      //console.log("routes: ", page.find(".selected-city").val(), routes);
      return routes;
    },
    waiting: function () {
      //console.log("cc", "routes");
      page.removeClass("search");

      page
        .find(".search-results")
        .empty()
        .html(['<li class="stop line error"></li>'].join(""));
      page.find(".total-number").empty();
      page.find(".stops-number").empty();
      page.find(".routes-number").empty();

      page.find(".total").empty();
    },
    items: 100,
    minLength: 1,
    // sorter turi apdoroti rastus marsrutus, prideti rastas stoteles ir sukurti visus htmlus
    sorter: function (routes) {
      //console.log("cc", routes, this);
      var city = page.find(".selected-city").val();

      if (routes.length) {
        page.find(".container-fluid").addClass("results"); // nerodome paaiskinamo teksto
      }
      var search_results = page.find(".search-results").empty();

      //console.log("search_results", search_results.html());

      var total_number = page.find(".total-number").empty();
      var stops_number = page.find(".stops-number").empty();
      var routes_number = page.find(".routes-number").empty();

      page.find(".total").empty();

      //var total_city = page.find(".total-city").empty();
      //var total_regional = page.find(".total-regional").empty();

      //var total = 0;
      //var total_stops = 0;

      var tallinn_transport = ["bus", "trol", "tram"];
      var regional_transport = ["regionalbus", "commercialbus", "train"];
      var city_stops = { "tallinna-linn": [], harju: [] };

      var html = [];

      if (this.query.length >= 3) {
        var stops = ti.fGetStopsByName(this.query, (compareNames = true));

        for (var i = stops.length - 1; i >= 0; i--) {
          if (stops[i].id.charAt(0) == "a") {
            //test if stop[0] is alias for several stops
            var arrStopIds = stops[i].neighbours.split(",");
            var aliased_stops = "";

            for (var j = 0; j < arrStopIds.length; j++) {
              if ((ti.stops[arrStopIds[j]] || { name: "" }).name) {
                //use stop id only if stop name is not empty
                aliased_stops += "," + arrStopIds[j];
              }
            }

            if (aliased_stops) {
              stops[i].id = aliased_stops.substring(1);
            }
          }
        }

        jQuery.each(stops, function (i, s) {
          var routes_at_stop = ti.fGetRoutesAtStop(s.id);
          //var routes_at_stop = ti.fGetRoutesAtStop(s.id.charAt(0) == 'a' ? s.neighbours : s.id);

          var routes_at_stop_html = [];
          var previous_transport = "";
          var previous_num = "";

          var tallinn_stop = false;
          var regional_stop = false;

          jQuery.each(routes_at_stop, function (i, r) {
            //var tallinn_route = false;
            //var regional_route = false;

            if (!tallinn_stop && tallinn_transport.indexOf(r.transport) != -1) {
              tallinn_stop = true;
              city_stops["tallinna-linn"].push(s.id);
            }
            if (
              !regional_stop &&
              regional_transport.indexOf(r.transport) != -1
            ) {
              regional_stop = true;
              city_stops["harju"].push(s.id);
            }

            routes_at_stop_html.push(
              [
                !previous_transport || previous_transport != r.transport
                  ? ['<span class="icon icon-', r.transport, '"></span>'].join(
                      ""
                    )
                  : "",
                !(previous_transport == r.transport && previous_num == r.num)
                  ? [
                      '<span class="transfer',
                      r.transport,
                      '">',
                      r.num,
                      "</span>",
                    ].join("")
                  : "",
              ].join("")
            );

            previous_transport = r.transport;
            previous_num = r.num;
          });

          if (
            (city == "tallinna-linn" && tallinn_stop) ||
            (city == "harju" && regional_stop)
          ) {
            var hash = "stop/" + s.id + "/" + pg.language + "/map"; // gal dar reikes map? ar pg.language
            var title =
              s.name + (s.streets ? [" (", s.streets, ")"].join("") : "");

            html.push(
              [
                '<li class="stop">',
                '<a href="#',
                hash,
                '" alt="',
                title,
                '" title="',
                title,
                '">',
                "<strong>",
                s.name,
                s.streets
                  ? ["</strong> (", s.streets, ")"].join("")
                  : "</strong>",
                "<br>",
                '<strong class="lines">',
                routes_at_stop_html.join(""),
                "</strong>",
                "</a>",
                "</li>",
              ].join("")
            );
          }
        });

        if (!city_stops[city].length) {
          html.push(
            ['<li class="stop error">', i18n.noStopsFound, ".</li>"].join("")
          );
        }

        stops_number.html("&nbsp;(" + city_stops[city].length + ")");
        //total_stops = stops.length
        //total += total_stops;
      } else {
        stops_number.html("&nbsp;(0)");
        html.push(
          ['<li class="stop error">', i18n.typeMoreLetters, ".</li>"].join("")
        );
      }

      jQuery.each(routes, function (i, r) {
        //console.log("rrr", r.id);

        var hash = pg.fUrlSet(
          {
            hashForMap: "",
            schedule: { city: r.city, transport: r.transport, num: r.num },
          },
          true
        );
        html.push(
          [
            '<li class="line" onclick="window.location.hash=\'',
            hash,
            '\'"><a href="#',
            hash,
            '" alt="',
            r.num,
            " ",
            r.name,
            '" title="',
            r.num,
            " ",
            r.name,
            '"><table><tr><td><span class="icon icon-',
            r.transport,
            '"></span></td><td><span class="num ',
            r.transport,
            " num",
            r.num.length,
            '">',
            r.num,
            "</span></td><td><span>",
            r.name,
            "</span>",
            pg.noticesHTML(r.id, "search"),
            "</td></tr></table></a></li>",
          ].join("")
        );
      });
      if (!routes.length) {
        html.push(
          ['<li class="line error">', i18n.noRoutesFound, ".</li>"].join("")
        );
      }
      //total += routes.length;

      search_results[0].innerHTML = html.join("");

      routes_number.html("&nbsp;(" + routes.length + ")");

      // start: try to count total-number in other city tab

      //alert(city);

      var other_city = cities[0] == city ? cities[1] : cities[0];

      var data2 = ti.fGetRoutes(other_city);
      //var total_other = total_stops; // same stops

      var routes_other_count = 0;
      var tool = this;
      data2.forEach(function (route) {
        if (tool.matcher(route)) {
          routes_other_count += 1;
        }
      });
      // :end

      var total = city_stops[city].length + routes.length;
      var total_other = city_stops[other_city].length + routes_other_count;

      var addresses_tab = jQuery(".nav-search li[data-filter='addresses']");
      if (addresses_tab.hasClass("active")) {
        addresses_tab.trigger("click");
      }
      /*
            if (this.query.length >= 3 && isNaN(this.query)) { // not number
                
                pg.searchPlaces(this.query, function (places) {
                    page.find(".search-results li.place").remove(); // pasaliname ankstesnius jeigu tokiu buvo...

                    jQuery.each(places, function (i, p) {
                        search_results.append(['<li class="place"><a id="', p.key, '" onclick="return false;" href="" alt="', p.name, '" title="', p.name, '"><table><tr><td><span class="icon icon-marker"></span></td><td>', p.name, '</td></tr></table></a></li>'].join(""));
                    });
                    page.find(".search-results li.place a").bind("click", function () {
                        pg.geocoder2.getPlaceId(jQuery(this).attr("id"), function (id, latlng) {
                            //console.log("id: ", id, latlng);
                            
                            //var split = id.split(";")
                            //var point = new google.maps.LatLng(stop.latAvg, stop.lngAvg);
                            
                            if (!pg.hashForMap) pg.fTabShowMap_Click(event, 'stops');
                            
                            pg.GMap.setCenter(latlng);
                            pg.stopLabelSelected.setContents(pg.geocoder2.index[id], "");
                            pg.stopLabelSelected.setPoint(latlng);
                            pg.stopLabelSelected.show();
1                            
                            //Hash.go('stop/' + id + '/map'); //show clicked stop with e.id on map without closing dropdown
                        });
                    });

                    total += places.length;
                    //total_number.html("&nbsp;(" + total + ")");
                    //var stops_count = ((city == "tallinna-linn")?tallinn_stops.length:regional_stops.length);
                    total_number.html("&nbsp;(" + total + ")");
                    
                    page.find("li." + city + " .total").html("&nbsp;(" + total + ")");
                    page.find("li." + other_city + " .total").html("&nbsp;(" +  (total_other + places.length) + ")");
                });
            }
            else {
                */
      //pg.loadGoogleMapsScript(function () { }); // load map script in advance
      total_number.html("&nbsp;(" + total + ")");

      page.find("li." + city + " .total").html("&nbsp;(" + total + ")");
      page
        .find("li." + other_city + " .total")
        .html("&nbsp;(" + total_other + ")");
      //}

      page.removeClass("location").addClass("search");

      return []; // kadangi nenorime rodyti popupo
    },

    matcher: function (r) {
      var num = ti.toAscii(r.num, true); // parts[ti.RT_ROUTENUM]
      var name = ti.toAscii(r.name, 2); // parts[ti.RT_ROUTENAME]
      var queryAscii = ti.toAscii(this.query);

      if (this.query.length >= 1) {
        // jeigu ivesta bent 2 (gal uzteks ir 1?) simboliai - ieskome ir marsruto pavadinime
        var indexOf = -1;

        for (;;) {
          indexOf = name.indexOf(queryAscii, indexOf + 1);

          if (indexOf < 0) {
            break;
          }
          //check if ascii name matches from beginning or from separator
          if (
            indexOf == 0 ||
            ti.wordSeparators.indexOf(name.charAt(indexOf - 1)) >= 0
          ) {
            return true;
          }
        }
      }

      if (num.indexOf(queryAscii) == 0) {
        if (
          num.length > queryAscii.length &&
          "0123456789".indexOf(num.charAt(queryAscii.length)) >= 0
        ) {
          return false;
        }
        return true;
      }
      return false;
    },
  });

  // marsrutu/stoteliu tabai - filtras
  page.find(".nav-search li").bind("click", function () {
    var filter = jQuery(this).attr("data-filter");
    //console.log("click!", filter);

    page.find(".nav-search li").each(function (a, b) {
      var title = jQuery(this).children().attr("title");
      var filter_name = jQuery(this).find("span:first-child").html();

      if (filter == jQuery(this).attr("data-filter")) {
        jQuery(this)
          .addClass("active")
          .html(
            ['<span title="', title, '">', filter_name, "</span>"].join("")
          );
      } else {
        jQuery(this)
          .removeClass("active")
          .html(
            [
              '<a title="',
              title,
              '" alt="',
              title,
              '"><span>',
              filter_name,
              "</span></a>",
            ].join("")
          );
      }
    });

    page
      .find(".search-results")
      .removeClass("all")
      .removeClass("lines")
      .removeClass("stops")
      .removeClass("addresses");
    page.find(".search-results").addClass(filter);

    if (filter == "addresses") {
      if (!pg.geocoder) {
        ti.fCreateGeocoder();
      }

      var query = jQuery(".search-stop input").val();
      //console.log("search addresses!", query);

      //if (query == pg.previous_places_query) { negrai kai ateisime is kito lango pakartotinai
      //console.log("skip search");
      //    return; // skip search;
      //}
      page.find(".search-results li.place").remove(); // pasaliname ankstesnius jeigu tokiu buvo...

      if (query.length >= 3 && isNaN(query) && pg.geocoder) {
        // not number
        pg.geocoder.search(query, function (places) {
          //pg.previous_places_query = query;
          var search_results = page.find(".search-results");

          jQuery.each(places, function (i, p) {
            var elementPlace = document.createElement("li");
            elementPlace.className = "place";
            elementPlace.innerHTML = [
              '<a id="',
              p.key || p.id,
              '" onclick="return false;" href="" alt="',
              p.name,
              '" title="',
              p.name,
              '"><table><tr><!--td><span class="icon icon-marker"></span></td--><td>',
              p.name,
              "</td></tr></table></a>",
            ].join("");
            //search_results.append(['<li class="place"><a id="', p.key, '" onclick="return false;" href="" alt="', p.name, '" title="', p.name, '"><table><tr><td><span class="icon icon-marker"></span></td><td>', p.name, '</td></tr></table></a></li>'].join(""));
            search_results[0].appendChild(elementPlace);
          });

          /*
                    var google_logo = document.createElement('li');
                    google_logo.className = "place";
                    google_logo.innerHTML = '<img src="tallinn/images/powered_by_google_on_white.png">';
                    search_results[0].appendChild(google_logo);
                    */

          page.find(".search-results li.place a").bind("click", function (a) {
            var button = this; //jQuery(this);

            if (jQuery(this).hasClass("ready")) {
              return;
            }

            button.className = "ready";

            //pg.geocoder2.getPlaceId(jQuery(this).attr("id"), function (id, latlng) {
            var id = jQuery(this).attr("id") || "";

            if (id.indexOf(";") >= 0) {
              var latlng = id.split(";");
              var lat = parseFloat(latlng[0]);
              var lng = parseFloat(latlng[1]);

              //console.log("id: ", id, latlng, pg.geocoder2.index[id], button);
              var stops_html = document.createElement("div");
              stops_html.className = "stopslist";
              stops_html.innerHTML = pg.getNearestStopsHTML(
                { lat: lat, lng: lng },
                5
              );
              button.parentNode.appendChild(stops_html);
            }
            //});
          });

          //total += places.length;
          //total_number.html("&nbsp;(" + total + ")");

          //page.find("li." + city + " .total").html("&nbsp;(" + total + ")");
          //page.find("li." + other_city + " .total").html("&nbsp;(" +  (total_other + places.length) + ")");
        });
      }
    }
  });

  page.find(".button-cleartext").bind("click", function () {
    page.find(".form-search input").val("").trigger("input");
    page.removeClass("search").removeClass("location");

    /*
        if(typeof v3.directionsDisplay != "undefined") {
            v3.directionsDisplay.setMap(null); // paslepiame marsrutus
        }*/

    if (window.location.hash.indexOf(",mylocation") != -1) {
      var newhash = window.location.hash.replace(",mylocation", "");
      window.location.hash = newhash;
    }

    return false;
  });

  // miestu tabai
  page.find(".nav-region li").bind("click", function () {
    var city = jQuery(this).attr("data-city");

    page.find(".nav-region li").each(function (a, b) {
      var title = jQuery(this).children().attr("title");
      var city_name = jQuery(this).children(":first").html();

      if (city == jQuery(this).attr("data-city")) {
        jQuery(this)
          .addClass("active")
          .html(['<span title="', title, '">', city_name, "</span>"].join(""));
      } else {
        jQuery(this)
          .removeClass("active")
          .html(
            [
              '<a title="',
              title,
              '" alt="',
              title,
              '">',
              city_name,
              "</a>",
            ].join("")
          );
      }
    });

    page.find(".selected-city").val(city);
    page.find(".form-search input").keyup(); // pakeistas miestas - paleidziam paieska per nauja!
  });

  page.find(".search-stop input").bind("focus", function (e) {
    var input = jQuery(this); //.val();
    if (input.val() == i18n.myLocation) {
      input.val(""); //.trigger("input");
    }
    //console.log("location: ", input);
  });

  page.find(".search-stop input").bind("input", function (e) {
    var input = jQuery(this);
    input.parent().toggleClass("clearable", input.val() != "");
  });

  page.find(".button-search").bind("click", function (e) {
    page.find(".form-search input").typeahead("lookup");
    if (window.location.hash.indexOf(",mylocation") != -1) {
      var newhash = window.location.hash.replace(",mylocation", "");
      window.location.hash = newhash;
    }
  });
};

/*
pg.fLoadRoutesListMain = pg.fLoadRoutesList;
    
pg.fLoadRoutesList = function(callback) {
    //console.log("fLoadRoutesListWrapper start", callback);
    pg.fLoadRoutesListMain(callback);
    //console.log("fLoadRoutesListWrapper end");
    
    //if(!callback) { // kvieciamas be callback ir pats uzpildo html elementa
        //var routeResults = jQuery("#divContentRoutesResults");
        //jQuery.each(routeResults.find(".button-favourite"), function(button) {
        //   console.log("fav but:", routeResults); 
           //onclick
        //});
        //console.log("nocallback");
        
        jQuery("#divContentRoutesResults .button-favourite").unbind("click").bind("click", function () {
            var button = jQuery(this);
            //console.log("button", button);
            
            var route = button.attr("data-route").split(",")
            var favourite_route = { city: route[0], transport: route[1], num: route[2], dirType: route[3], stopId: "$" };
            
            if (!button.hasClass("active")) {
                favourites.add(favourite_route);
                button.addClass("active").attr("alt", i18n.btnFavouritesRemove).attr("title", i18n.btnFavouritesRemove);
            } else {
                favourites.remove(favourite_route);
                button.removeClass("active").attr("alt", i18n.btnFavouritesAdd).attr("title", i18n.btnFavouritesAdd);
            }
            return false;
        });
        
    //}
    
}; 
*/

pg.routeRowFavouritesClick = function (el) {
  var button = jQuery(el);
  //console.log("routeRowFavouritesClick", button, el);

  var route = button.attr("data-route").split(",");
  var favourite_route = {
    city: route[0],
    transport: route[1],
    num: route[2],
    dirType: route[3],
    stopId: route[4],
  };

  if (!button.hasClass("active")) {
    favourites.add(favourite_route);
    button
      .addClass("active")
      .attr("alt", i18n.btnFavouritesRemove)
      .attr("title", i18n.btnFavouritesRemove);
  } else {
    favourites.remove(favourite_route);
    button
      .removeClass("active")
      .attr("alt", i18n.btnFavouritesAdd)
      .attr("title", i18n.btnFavouritesAdd);
  }
};

// dar reikia wrapperio stoteles isvykimams: pg.fProcessVehicleDeparturess

/*
pg.fLoadRoutesList = function (callback) {
        
    if (typeof mobile != 'undefined' && typeof callback == 'undefined') {
        return;
    }

    var eResults = $("divContentRoutesResults");

    if (typeof ti.routes !== 'object') {
        pg.loadedRoutesHash = '';
        (eResults || {}).innerHTML = '<br/>' + i18n.receivingData;
        
        setTimeout(function() { pg.fLoadRoutesList(callback); }, 200);
        return;
    }
        
    var filter = $('inputRoutes') && ($('inputRoutes').className == 'empty' ? '' : ti.toAscii($('inputRoutes').value, 2) );

    if (filter && pg.routesFilter != filter) {
        pg.routesFilter = filter;
        setTimeout(function() { pg.fLoadRoutesList(callback); }, 200);
        return;
    }
    pg.routesFilter = filter;

    if ((pg.loadedRoutesHash == pg.city + '/' + pg.transport + '/' + filter) && (typeof (mobile) == 'undefined') && pg.transport != "favourites") {
        return;
    }

    pg.loadedRoutesHash = pg.city + '/' + pg.transport + '/' + filter; // store to skip reloading later when already loaded the same

    var routes = ti.fGetRoutes(pg.city, pg.transport, null, null, null, filter || (cfg.city.showAllDirections ? '*':'') );
    
    if (callback) {
        callback(routes); // perduosime tuscia []
    }
    
    if (!routes || !routes.length) {
        (eResults || {}).innerHTML = '<br/>&nbsp;' + i18n.noRoutesFound;
        return;
    }
    
    var building_loop = function () {
        var html = [];
        html.push('<table id="tblRoutes">'
        //fails in IE7 when hidding columns:  +'<col class="routeName" /><col class="weekdays" /><col class="routeMap" /><col class="lastcol" />'
                  + '<tbody>'
                 );

        for (var i = 0; i < routes.length; i++) {
            html.push(pg.fMakeRouteRowHTML(routes[i], 'tblRoutes', i));
        }

        html.push('</tbody></table><div class="footer">');

        var footer = cfg.cities[pg.city].footer;
        footer = footer && (footer[pg.language] || footer['en']);
        footer && html.push(footer);

        if (!cfg.isMobilePage) {
            if (cfg.programmedBy) {
                html.push('<p id="programmedBy" class="smalltext graytext">' + (cfg.programmedBy[pg.language] || cfg.programmedBy['en'] || '') + '</p>');
            }

            var webcounter = cfg.cities[cfg.defaultCity].webcounter;

            if (webcounter) {
                html.push('<a id="webcounter" href="http://whos.amung.us/stats/' + webcounter + '" target="_blank" style="float:right; position:relative; bottom:20px; padding:10px;">');
                html.push('<img width="80" height="15" border="0" title="web tracker" alt="web tracker" src="http://whos.amung.us/swidget/' + webcounter + '.gif"></a>');
            }
        }
        html.push('</div>');

        //$('inputRoutes').style.display = (filter || routes.length > 15) ? '' : 'none';

        pg.replaceHtml($("divContentRoutesResults"), html.join(''));
        
        
        console.log("ok!");
        
        jQuery("#tblRoutes .view-map a").click(function() {
             jQuery("#tblRoutes .view-map a").removeClass("active");
             jQuery(this).addClass("active");
        });
        
    };

    if (pg.browserVersion <= 8 && routes.length > 25 && !filter) {
        (eResults || {}).innerHTML = '<br/>' + i18n.loading;
        setTimeout(building_loop, 100);
        return;
    }

    building_loop();
};
*/

pg.showMap = function (el) {
  jQuery(el).parents("table").find(".view-map a").removeClass("active");
  jQuery(el).addClass("active");

  //jQuery("#tblRoutes .view-map a").removeClass("active");
  //jQuery(this).addClass("active");

  //console.log(jQuery(el), jQuery(el).parents("table"));
  return false;
};

pg.fMakeRouteRowHTML = function (
  route,
  tableName,
  rowPos,
  startTime,
  returnData,
  stopId
) {
  //console.log(" route.dirType", route.departures, route.dirType, tableName, rowPos, startTime, returnData, route.stopId);

  //TODO use method for creating this
  var hashForSchedule;
  var hashForMap =
    "map," + route.city + "," + route.transport + "," + route.num;

  if (cfg.city.showAllDirections) {
    hashForMap = hashForMap + "," + route.dirType;
  }

  hashForMap = ti.toAscii(hashForMap, true);
  //console.log("fMakeRouteRowHTML", route, tableName, rowPos, startTime, returnData, stopId, hashForMap);

  if (tableName == "tblRoutes") {
    hashForSchedule = pg.fUrlSet(
      {
        schedule: {
          city: route.city,
          transport: route.transport,
          num: route.num,
          dirType: route.dirType,
        },
        hashForMap: "",
      },
      true
    );

    if (pg.routesFilter) {
      hashForMap += "," + route.dirType;
    }
    hashForMap = pg.fUrlSet({ hashForMap: hashForMap }, true);

    //console.log("new hash map: ", hashForMap);

    // :( not good when filtering
    //if (route.transport === 'train') {
    //	routeNameHTML = route.num;
    //}
  } else {
    hashForSchedule = pg.fUrlSet(
      {
        schedule: {
          city: route.city,
          transport: route.transport,
          num: route.num,
          dirType: route.dirType,
          stopId: route.stopId,
        },
        hashForMap: "",
      },
      true
    );
    hashForMap = pg.fUrlSet(
      { hashForMap: hashForMap + "," + route.dirType + "," + route.stopId },
      true
    );
  }

  var htmlWeekdays = "";
  var isValid = false; // at least one day route must be in operation

  for (var d = 1; d <= 7; d++) {
    if ((route.weekdays || "").indexOf(d) >= 0) {
      var validFrom = route.validityPeriods[d - 1];
      //console.log("route.validityPeriods", route.validityPeriods);
      validFromStr = validFrom
        ? ": " + i18n.validFrom + " " + pg.formatDate(validFrom)
        : "";

      htmlWeekdays +=
        "<span" +
        (d >= 6 ? ' class="weekend"' : "") +
        ' title="' +
        (i18n[route.transport + "weekdays" + d] || i18n["weekdays" + d]) +
        validFromStr +
        '">' +
        i18n.weekdaysShort[d] +
        "</span>";
      isValid = true;
    } else {
      htmlWeekdays +=
        '<span class="blankday" title="' +
        (i18n[route.transport + "weekdays" + d] || i18n["weekdays" + d]) +
        ": " +
        i18n.routeNotOperate +
        '">' +
        i18n.weekdaysShort[d] +
        "</span>";
    }
  }

  //if (route.weekdays && route.weekdays.indexOf('w') >= 0) {
  //    htmlWeekdays += '<img src="' + pg.imagesFolder + 'stop_wifi.png" alt="wifi stop" title="' + i18n.routeWithWifiStops + '" />';
  //}
  //console.log("low?", route, route.weekdays, route.weekdays.indexOf('z'));

  var low = false;
  if (cfg.city.planHandicappedOption === false) {
  } else if (route.weekdays && route.weekdays.indexOf("z") >= 0) {
    low = true;
    //htmlWeekdays += '<img src="' + pg.imagesFolder + 'handicapped.png" alt="low floor" title="' + i18n.lowFloorVehicles + '" />';
  }

  if (route.weekdays && route.weekdays.indexOf("s") >= 0) {
    htmlWeekdays +=
      '<img src="' +
      pg.imagesFolder +
      'minibus_16_1E90FF.png" alt="small bus" title="' +
      i18n.smallBus12Service +
      '" />';
  }
  if (route.weekdays && route.weekdays.indexOf("b") >= 0) {
    htmlWeekdays +=
      '<img src="' +
      pg.imagesFolder +
      'bicycle16.png" alt="transfer bicycle" title="' +
      i18n.transferBicycles +
      '" />';
  }

  var routeNumHTML = "";
  //anchorHTML +
  //((true || tableName == 'tblDepartingRoutes') ? '' : '<span class="icon icon_expand" title="' + i18n.showDetails + '"></span>')
  //+ '<span class="icon icon_' + route.transport + '"></span>'
  if (false && (route.transport == "train" || route.transport == "metro")) {
    routeNumHTML += '<span style="display:none;">' + route.num + "</span>";
  } else {
    routeNumHTML +=
      '<span class="num num' +
      Math.min(route.num.length, 4) +
      " " +
      route.transport +
      '">' +
      route.numHTML +
      "</span>";
  }

  if (returnData) {
    var data = {
      route: route,
      hash: hashForSchedule,
      times: [],
      zeroGround: [],
      notes: [],
    };
  }

  if (!returnData && !isValid) {
    // all weekdays are blank
    return "";
  }

  //console.log("pg.map", pg.urlLoaded, pg.map, pg.hashForMap);
  //var active_map = (pg.hashForMap == ["map", route.city, route.transport, route.num.toLowerCase()].join(','));
  var active_map = pg.urlLoaded == hashForMap;

  //(pg.hashForMap == ["map", route.city, route.transport, route.num.toLowerCase()].join(','));
  //console.log("map", hashForMap, pg.hashForMap);

  var html =
    '<span class="hover">' +
    route.name +
    //+ ((route.commercial || '').indexOf('E') >= 0 ? ' (' + i18n.express + ')' : '')
    "</span>";

  //console.log("tableName", tableName);

  //console.log("route", route, route.timetowait);

  var timetowait = "";

  if (typeof route.timetowait != "undefined") {
    if (route.timetowait == 999999) {
      timetowait = '<div class="time">---&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>';
    } else {
      timetowait =
        '<div class="time' +
        (route.vehicles && route.vehicles[0] && route.vehicles[0].zeroGround
          ? " highlighted"
          : "") +
        '">' +
        route.timetowait +
        " " +
        i18n.minutesShort +
        //+ ' <small>(' + route.destination + ')</small>'
        "</div>";
    }
  }

  var notices = pg.noticesHTML(route.id, "routes");

  var e = (route.commercial || "").indexOf("E") >= 0;
  html =
    '<tr class="icon_' +
    route.transport +
    (tableName != "tblDepartingRoutes" && rowPos % 2 < 1 ? " white" : "") +
    '">' +
    //+ '<td style="width:16px;">'
    '<td class="routeName">' +
    //+ '</td><td class="routeName">'
    '<a href="#' +
    hashForSchedule +
    '" title="' +
    i18n.transport[route.transport] +
    " " +
    route.num +
    ": " +
    i18n.showSchedule +
    '">' +
    routeNumHTML +
    html +
    "</a>" +
    '<div class="details">' +
    (notices
      ? [
          '<div class="route-notices ',
          e ? "ex" : "",
          '">',
          notices,
          "</div>",
        ].join("")
      : "") +
    timetowait +
    (e
      ? '<span class="e" title="' +
        i18n.express.charAt(0).toUpperCase() +
        i18n.express.substring(1) +
        '"></span>'
      : "") +
    "</div>";
  //+ '<div class="RouteDetails" style="display:none; white-space: normal;" id="' + tableName + 'Details' + route.id + '">'
  //    + i18n.operator + ': ' + ti.fOperatorDetails(route.operator, route.transport)
  //+ '</div>'

  var favourite_route = {
    city: route.city,
    transport: route.transport,
    num: route.num.toLowerCase(),
    dirType: route.dirType,
    stopId: route.stopId || "$",
  };

  var favourites_title = i18n.btnFavouritesAdd;
  var favourites_class = "";

  if (favourites.belongs(favourite_route, true)) {
    favourites_title = i18n.btnFavouritesRemove;
    favourites_class = " active";
  }

  //console.log("tableName", tableName);

  html +=
    '</td><td class="weekdays">' +
    '<a href="#' +
    hashForSchedule +
    '">' + //TODO: add valid from date
    htmlWeekdays +
    "</a>" +
    "</td>" +
    '<td class="type">' +
    '<a href="#' +
    hashForSchedule +
    '" class="' +
    (low ? "low" : "") +
    '" title="' +
    (low ? i18n.lowFloorVehicles : "") +
    '"></a>' +
    "</td>" +
    '<td class="line-favourite">' +
    '<button onclick="pg.routeRowFavouritesClick(this);" data-route="' +
    [
      route.city,
      route.transport,
      route.num.toLowerCase(),
      route.dirType,
      route.stopId || "$",
    ].join(",") +
    '" class="button button-favourite' +
    favourites_class +
    '" title="' +
    favourites_title +
    '"></button>' +
    "</td>" +
    '<td class="view-map">' +
    '<a onclick="pg.showMap(this);" title="' +
    i18n.showInMap +
    '" href="#' +
    hashForMap +
    '" class="' +
    (active_map ? "active" : "") +
    '"><span>' +
    i18n.showInMap +
    "</span></a>" +
    "</td>" +
    "</tr>";

  if (tableName === "tblDepartingRoutes") {
    if (
      cfg.city.doNotShowTimetables &&
      cfg.city.doNotShowTimetables[route.transport] &&
      route.departures.length &&
      route.departures[0] >= 0
    ) {
      if (("," + pg.inputStop + ",").indexOf("," + route.stops[0] + ",") < 0) {
        html +=
          '<tr class="white"><td class="DeparturesRow" colspan="' +
          (pg.kiosk ? 4 : 5) +
          '">';
        //html +=
        html += "</td></tr>";
        return html;
      }
    }

    html +=
      '<tr class="white"><td class="DeparturesRow" colspan="' +
      (pg.kiosk ? 4 : 5) +
      '"><span><span class="icon icon_collapse"></span><span class="icon';

    var h0 = Infinity;
    var min0 = Infinity;

    var k = 0;
    var limit = 18; // to fit in one row when map is opened
    // for testing startTime = 20 * 60;

    for (var i = route.departures.length; --i >= 0; ) {
      var min = route.departures[i];

      if (min < 0) {
        continue; // does not stop at the stop
      }

      if (min < startTime) {
        break;
      }

      ++k;

      min = ~~min;
      var h = ~~(min / 60);

      if (h0 != h) {
        if (++k > limit && min < startTime) {
          break;
        }

        h0 = h;
      }

      min0 = min;
    }

    if (i >= 0 || k >= limit) {
      html += ' icon_expand" title="' + i18n.stopShowAllDepartures + '">';
    } else {
      html += '">';
    }

    var prev_h = -1;
    k = 0;

    for (i = 0; i < route.departures.length; ++i) {
      var min = route.departures[i];

      if (min == 999999) {
        //stop closure
        if (typeof data == "object") {
          data.times = [min];
          if (route.vehicles && route.vehicles[i])
            data.zeroGround = [route.vehicles[i].zeroGround];
        }
        break;
      }
      if (min < 0) continue; // does not stop at the stop

      if (returnData) {
        data.times.push(~~(0.5 + min));
        if (route.vehicles && route.vehicles[i])
          data.zeroGround.push(route.vehicles[i].zeroGround);
      }

      min = ~~min;

      var h = ~~(min / 60);

      if (min >= min0) {
        ++k;
      }

      if (prev_h != h) {
        prev_h = h;

        if (min >= min0) {
          ++k;
        }

        html +=
          '</span></span><span style="display:inline-block;"><span class="DeparturesHour' +
          (h < h0 || k > limit ? " collapse" : "") +
          '">&nbsp;' +
          (h % 24) +
          '</span><span style="vertical-align:top"' +
          (min < min0 || k > limit ? ' class="collapse"' : "") +
          ">&#x200A;";
      }

      if (min == min0) {
        // start unhiding times from min0
        html += '</span><span style="vertical-align:top">';
      }
      if (k == limit + 1) {
        // start hiding times from limit
        html += '</span><span style="vertical-align:top" class="collapse">';
      }

      min = min % 60;
      html += [
        "<span",
        route.vehicles && route.vehicles[i] && route.vehicles[i].zeroGround
          ? ' class="min highlighted"'
          : "",
        ">",
        min < 10 ? "0" : "",
        min,
        " </span>",
      ].join("");
    }

    if (prev_h === -1) {
      if (returnData) {
        data.notes.push(route.message || i18n.routeNotOperate);
      }
      html += "</span><span>" + (route.message || i18n.routeNotOperate);
    } else if (!k && route.departures.length) {
      route.departures.sort(function (a, b) {
        return a - b;
      });

      if (returnData && data.times.length == 0) {
        data.notes.push(
          i18n.stopLatestDeparture +
            "&nbsp;" +
            ti.printTime(route.departures[route.departures.length - 1])
        );
      }
      html +=
        '</span><span style="cursor:default;" class="hideWhenExpanded">' +
        i18n.stopLatestDeparture +
        "&nbsp;" +
        ti.printTime(route.departures[route.departures.length - 1]);
    } else if (k > limit) {
      html +=
        '</span><span style="cursor:default;" class="hideWhenExpanded">...';
    }

    html += "</span></span></td></tr>";

    if (
      (prev_h === -1 || !k) &&
      route.dirType &&
      route.dirType.indexOf("d") >= 0
    ) {
      html = ""; //do not show routes from/to depo without departures
    }
  }

  if (returnData) {
    return data;
  } else {
    return html;
  }
};

pg.fCreateLanguagesBar = function () {
  var divLang = $("divLang");
  var html = "";
  var languages = cfg.city.languages.split(",");

  for (var i = 0; i < languages.length; i++) {
    var lng = languages[i];

    if (cfg.city.languageFlags) {
      html +=
        '<a title="' +
        cfg.languages[lng] +
        '"><img src="' +
        lng +
        '.png" style="width:32px; height:26px; padding:0 5px;"></a>';
    } else {
      html +=
        '<a class="big-screen" title="' +
        cfg.languages[lng] +
        '" data-lng="' +
        lng +
        '">' +
        cfg.languages[lng] +
        "</a>";
      html +=
        '<a class="small-screen" title="' +
        cfg.languages[lng] +
        '" data-lng="' +
        lng +
        '">' +
        lng.toUpperCase() +
        "</a>";

      if (cfg.city.navigation === "riga" && i % 3 === 2) {
        // allow wrapping of texts
        html += " ";
      } else {
        html += "&nbsp;";
      }
    }
  }

  (divLang || {}).innerHTML = html;
  divLang.style.opacity = 1;
  divLang.style.filter = "alpha(opacity=100)";
};

pg.fLang_Click = function (event) {
  var $e = event && (event.target || event.srcElement);

  var language = $e.getAttribute("data-lng");
  //console.log("click", $e.tagName, language, pg.language, pg.GMap, $e.tagName);

  var reload = pg.GMap && language != pg.language;

  if ($e && ($e.tagName || "").toLowerCase() == "a") {
    pg.fUrlSet({ schedule: pg.schedule, language: language });

    if (reload) {
      //console.log("reload");
      location.reload();
    }

    return pg.cancelEvent(event);
  }

  return false;
};

pg.aDir_Click = function ($clicked) {
  setTimeout(function () {
    try {
      $clicked.focus();
    } catch (exception) {}
  }, 100);

  var $e = $("ulScheduleDirectionsList");

  if (($clicked.id || "").indexOf("2") >= 0 && $clicked.offsetLeft > 100) {
    pg.scheduleProposedPane = 2;
    $e.style.right = "15px";
    $e.style.left = ""; //($clicked.offsetLeft + $clicked.offsetWidth -$e.offsetWidth) + "px";
  } else {
    pg.scheduleProposedPane = 1;
    $e.style.left = "70px";
    $e.style.right = "";
  }

  $e.style.width = $clicked.offsetWidth + 10 + "px";

  jQuery($e).slideDown();

  //$e.style.display = "block";
};

pg.aDir_Blur = function () {
  //for (var $e = document.activeElement; $e; $e = $e.parentNode) {
  //    if ($e.id == "ulScheduleDirectionsList") return;
  //}
  jQuery("#ulScheduleDirectionsList").slideUp();
};

pg.fScheduleLoadTimetableMain = pg.fScheduleLoadTimetable;

pg.fScheduleLoadTimetable = function (callback) {
  if (pg.prevStop && pg.prevStop != pg.schedule.stopId) {
    pg.schedules = null; // clear additional schedules when another stop is selected for timetable
  }
  pg.prevStop = pg.schedule.stopId;

  //pg.fScheduleLoadTimetableMain(callback);
  //$("divScheduleContentInner").innerHTML = '<img src="tallinn/images/ajax-loader.gif" style="width:24px;height:24px;">';

  pg.loadInterruptions(function () {
    // add interruptions to ti.routes
    //console.log("interruptions", ti.interruptions);

    pg.fScheduleLoadTimetableMain(function (data) {
      //console.log("fScheduleLoadTimetableMain", data);

      if (typeof callback == "function") callback(data);

      /*
        // commented because of the problems with schedule->stop->back problem (pg.renderRealtimeDepartures() - not called)
        var info = jQuery("#divScheduleContent .info");
        var info_url = info.attr("data-url"); // neperkrausime jeigu url nepakeistas (kai pridedami papildomi marsrutai)
        var info_language_test = info.attr("data-language-test"); // kai keiciam kalba pirma pg.language ir url jau buna pakeistas - bet pats en.js dar neuzkrautas
        
        var url = pg.fUrlSet({ schedule:pg.schedule, hashForMap:''}, true); // zemelapio buvis nedomina
        console.log("info_url", info_url, url, info_url == url && info_language_test == i18n.headerTitle);
        
        if(info_url == url && info_language_test == i18n.headerTitle) return;
        info.attr("data-language-test", i18n.headerTitle);
        info.attr("data-url", url);
        */
      var notices = pg.noticesHTML(pg.schedule.route.id, "schedule");
      //console.log("notices", notices, notices == false)

      var container = document.getElementById("divScheduleContent");
      container.classList.toggle("line-interruptions-active", notices);
      document.querySelector(
        "#divScheduleContent .line-interruptions"
      ).innerHTML = notices;

      var stop = ti.fGetStopDetails(pg.schedule.stopId);

      var streets = jQuery.map(jQuery("#divScheduleRoute a"), function (x) {
        //console.log("x", typeof x, x.innerHTML);
        if (x.innerHTML.indexOf(stop.street) >= 0)
          return "<strong>" + x.innerHTML + "</strong>";
        return x.innerHTML;
      });

      var details =
        (stop.street ? ", " + stop.street : "") +
        (stop.area && !cfg.cities[pg.city].skipStopArea
          ? ", " + stop.area
          : "") +
        (stop.city && !cfg.cities[pg.city].skipStopCity
          ? ", " + stop.city
          : "");

      if (stop[cfg.cities[pg.city].stopFareZone || "noFareZone"]) {
        details +=
          ", " + i18n.fareZone + " " + stop[cfg.cities[pg.city].stopFareZone];
      }
      details =
        details.length > 0
          ? '<span class="details"> (' + details.substring(2) + ")</span>"
          : "";

      //var favourites_title = i18n.btnFavouritesAdd;
      var favourites_class = "";

      if (favourites.belongs(pg.schedule, true)) {
        //favourites_title = i18n.btnFavouritesRemove;
        favourites_class = " active";
      }

      var showAllDeparturesStops = ti.fGetStopsByName(stop.name);
      var stopRoot = stop.id.split("-")[0];
      var stopIds = "";
      for (var i = 0; i < showAllDeparturesStops.length; i++) {
        var s = showAllDeparturesStops[i];
        if (s.name == stop.name) {
          // only exact name!
          var stopList = s.id.split(",");

          if (stopList.indexOf(stop.id) != -1) {
            // found the same stop in the id list
            stopIds = stopList
              .filter(function (x) {
                return x.split("-")[0] == stopRoot;
              })
              .join(","); // filter by root
            break;
          }
        }
      }
      stopIds = stopIds || stop.id; // default value

      jQuery("#divScheduleContent .info .line-info")
        .css("padding-left", pg.schedule.num.length > 6 ? "150px" : "80px")
        .attr("class", "line-info icon_" + pg.schedule.transport);
      jQuery("#divScheduleContent .info .line-info .num").html(pg.schedule.num);
      jQuery("#divScheduleContent .info .line-info .route").html(
        pg.schedule.route.name
      );
      jQuery("#divScheduleContent .info .line-info .streets").html(
        i18n.routeStreets + ": " + streets.join(", ")
      );
      jQuery("#divScheduleContent .info .line-actions").html(
        [
          '<button class="button button-map" onclick="pg.fTabShowMap_Click(event); return false;">',
          i18n.showInMap,
          "</button>",
          '<button class="button button-favourite',
          favourites_class,
          '"></button>',
          //'<div class="add-lines" id="control-lines-container">',
          //    '<button class="button button-add">', i18n.addMoreLines, '</button>',
          //    '<ul style="display: none;" id="control-lines">',
          //    '</ul>',
          "</div>",
          '<a href="#stop/',
          stopIds,
          "/",
          pg.language,
          '"><button class="button btn-default showall">',
          i18n.showAllStopDepartures,
          "</button></a>",
          '<button class="button btn-default print" onclick="window.print()">',
          i18n.printSchedule,
          "</button>",
        ].join("")
      );
      jQuery("#divScheduleContent .info .next-departures p").html(
        i18n.realTimeDepartures
      );
      jQuery("#divScheduleContent .info .next-departures ul").html("");

      /*
        var html = [
            '<div class="line clearfix">',
                '<div title="', i18n.transport[pg.schedule.transport], '" class="line-info icon_', pg.schedule.transport, '"', ((pg.schedule.num.length>6)?' style="padding-left:150px;"':'') ,'>',
                    '<span class="num">', pg.schedule.num, '</span>',
                    '<p class="route">', pg.schedule.route.name, '</p>',
                    '<h2>', stop.name, '</h2>',
                    '<p class="zone">', details, '</p>',
                    '<p>', i18n.routeStreets, ': ', streets.join(", "), '</p>',
                '</div>',
                '<div class="line-actions">',
                    '<button class="button button-map" onclick="pg.fTabShowMap_Click(event); return false;">', i18n.showInMap, '</button>',
                    '<button class="button button-favourite', favourites_class, '"></button>',
                    '<div class="add-lines" id="control-lines-container">',
                        '<button class="button button-add">', i18n.addMoreLines, '</button>',
                        '<ul style="display: none;" id="control-lines">',
                        '</ul>',
                    '</div>',
                    '<a href="#stop/', stopIds, '/', pg.language, '"><button class="button btn-default showall">', i18n.showAllStopDepartures, '</button></a>',
                    '<button class="button btn-default print" onclick="window.print()">', i18n.printSchedule, '</button>',
                '</div>',
            '</div>',
            '<div id="remove-lines">',
            '</div>',
            '<div class="next-departures">',
                '<p>', i18n.realTimeDepartures, '</p>',
                '<div class="clock"></div>',
                '<ul>',
                '</ul>',
            '</div>'
        ];
        */

      //info.html(html.join(""));
      //console.log("info rendered");

      //pg.schedules = null; // clear previous additional routes //Evaldas: clearing broke selection of several routes at stop for common schedule

      //console.log("skip loading real time!");
      var notices = pg.getRouteNoticesForStops(
        pg.schedule.route.id,
        "interruption"
      )[pg.schedule.stopId];
      if (
        notices &&
        notices[0].data.announcement.trim() ==
          "ei toimu osadest peatustest väljumisi"
      ) {
        jQuery("#divScheduleContent .next-departures ul").html(
          "<li>" + (i18n.stopNoRealtimeDepartures + ".").split(".")[0] + "</li>"
        );
      } else {
        pg.renderRealtimeDepartures();
      }

      jQuery(".line-actions .button-favourite")
        .unbind("click")
        .bind("click", function () {
          var button = jQuery(this);

          if (!button.hasClass("active")) {
            favourites.add(pg.schedule);
            button
              .addClass("active")
              .attr("alt", i18n.btnFavouritesRemove)
              .attr("title", i18n.btnFavouritesRemove);
          } else {
            favourites.remove(pg.schedule);
            button
              .removeClass("active")
              .attr("alt", i18n.btnFavouritesAdd)
              .attr("title", i18n.btnFavouritesAdd);
          }
          return false;
        });

      /*
        var ul_lines = jQuery("#control-lines");
        var lines_html = [];
        
        jQuery.each(data.transfers, function(i, href) { // susirenkame seno (taline paslepto) html vidurius
            var href = "#" + href;
            var schedule = pg.fUrlParse(href).schedule;
            var hash = pg.fUrlSet({ schedule:schedule, hashForMap:''}, true);
            
            var routeKey = [pg.schedule.city, pg.schedule.transport, pg.schedule.num].join('_');
            var routeKey2 = [schedule.city, schedule.transport, schedule.num].join('_');
            var remove = (routeKey2 == routeKey);
            
            lines_html.push(['<li><a title="', i18n.transport[schedule.transport], '" href="#', hash, '" class="', remove?'remove':'add', ' icon_', schedule.transport,'"><div class="addlines-table"><div class="addlines-row"><div class="addlines-cell"><span class="num">', schedule.num, '</span></div><div class="addlines-cell right"><span class="text">', remove?i18n.remove:i18n.add,'</span></div></div></div></a></li>'].join(""));
        });

        ul_lines.html(lines_html.join(""));
        
        
        jQuery("#control-lines a").unbind("click").click(function() {
            pg.addSchedule = pg.fUrlParse(jQuery(this).attr("href")).schedule;
            var routeKey;
            
            if (!pg.schedules) {
                routeKey = [pg.schedule.city, pg.schedule.transport, pg.schedule.num].join('_');
                pg.schedules = {};
                pg.schedules[routeKey] = pg.schedule;
            }
            
            routeKey = ti.toAscii([pg.addSchedule.city, pg.addSchedule.transport, pg.addSchedule.num].join('_'));
            var hash = pg.fUrlSet({ schedule: pg.addSchedule, hashForMap:''}, true);
            
            var a = jQuery(this);
            if(a.hasClass("add")) {
                pg.schedules[routeKey] = pg.addSchedule;
                a.removeClass("add").addClass("remove");
                a.find("span.text").html(i18n.remove);
                
                var route = ti.fGetRoutes( pg.addSchedule.city, pg.addSchedule.transport, pg.addSchedule.num, pg.addSchedule.dirType, true)[0];
                
                jQuery("#remove-lines").append([
                    '<div data-href="#', hash, '" class="added-line icon_', pg.addSchedule.transport, '">',
                        '<span class="num">', pg.addSchedule.num, '</span>',
                        '<span class="name">', //,i18n.transport1[pg.addSchedule.transport], ' nr ', pg.addSchedule.num, 
                        //'<span style="text-transform: lowercase">', i18n.direction, '</span> ', 
                        route.name, '</span>',
                        '<button class="button button-remove">', i18n.remove, '</button>',
                    '</div>'
                ].join(""));
                
                jQuery("#remove-lines .button-remove").unbind("click").click(function() {
                    var href = jQuery(this).parent().attr("data-href");
                    jQuery("#control-lines a[href='" + href + "']").trigger("click");
                });
                pg.renderRealtimeDepartures();
                
            } else {
                pg.schedules[routeKey] = null;
                a.removeClass("remove").addClass("add");
                a.find("span.text").html(i18n.add);
                
                jQuery("#remove-lines div[data-href='#" + hash + "']").remove();
                pg.renderRealtimeDepartures();
            }
            
            pg.fScheduleLoadTimetable();
            return false;
        });
        
        jQuery('.add-lines .button').unbind("click").click(function() {
            jQuery(this).parent().toggleClass('active');
            jQuery(this).next('ul').slideToggle(200);
        });
        */
    });
  });
};

pg.tallinnClick = function (el) {
  //console.log("tallinnClick", el.target, jQuery("#control-lines-container").has(el.target).length);

  var line_control_el = jQuery("#control-lines-container");
  if (!line_control_el.has(el.target).length) {
    //console.log("tallinnClick", el.target);
    line_control_el.removeClass("active");
    jQuery("#control-lines").slideUp(200); //css("display", "none");
  }
};

pg.renderLiveRace = function (route, server_time) {
  //console.log("renderLiveRace", route, server_time);

  //route.times.sort(function (a, b) { return a - b });

  var times = [];

  jQuery.each(route.times, function (i, t) {
    //var time = ti.printTime(t);

    var timetowait = "";

    if (t == 999999) {
      timetowait = (route.route || {}).message || "---";
    } else {
      //var now = new Date();
      //var n = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
      //timetowait = Math.floor(t - n) + ' ' + i18n.minutesShort;
      timetowait =
        Math.floor(t - parseInt(server_time)) + " " + i18n.minutesShort;
    }
    //if(route.route.num == "4") {
    //     console.log("4 timetowait", timetowait, route.route.destination);
    //}

    var zero_ground = route.zeroGround[i];

    times.push([
      t,
      [
        '<li title=""><a title="',
        i18n.transport[route.route.transport],
        " ",
        i18n.towards,
        ": ",
        route.route.destination,
        '" class="icon_',
        route.route.transport,
        /* low*/ '" href="" onclick="return false;"><span class="num" style="margin:1px;">',
        route.route.num,
        "</span><strong",
        zero_ground ? ' class="highlighted"' : "",
        ">",
        timetowait,
        "</strong></a></li>",
      ].join(""),
      route.route.destination,
      route.route,
    ]);
  });
  return times;
};

pg.good_siri_direction = function (route_key, routes, destination_name) {
  return true;
  var select_routeStops = {}; // find names of the first and last stops of the selected routes

  var rvalue = true;

  for (var i = 0; i < routes.length; i++) {
    var r = routes[i];
    var key = [r.city, r.transport, r.num.toLowerCase()].join("_");

    if (key == route_key) {
      var route = ti.fGetRoutes(r.city, r.transport, r.num, r.dirType, true)[0];
      if (!route) continue;

      var first_stop = ti.fGetStopDetails(route.stops[0]);
      var last_stop = ti.fGetStopDetails(route.stops[route.stops.length - 1]);

      if (first_stop.name != last_stop.name) {
        // ignore circular routes
        if (
          destination_name
            .toLowerCase()
            .indexOf(first_stop.name.toLowerCase()) != -1
        ) {
          console.log("Filtered1: ", destination_name, route_key);
          rvalue = false; // destination == first stop of the route
        }
        //else if(destination_name.toLowerCase().indexOf(last_stop.name.toLowerCase()) == -1) {
        //    console.log("Filtered2: ", destination_name, route_key); // siri:Reisisadam A-terminal and stop: Reisisadam
        //    rvalue = false; // destination != last stop of the route
        //}
      }
      break;
    }
  }

  return rvalue;
};

pg.renderRealtimeDepartures = function (selector) {
  //throw "xx";
  //console.log("renderRealtimeDepartures", selector);

  var shedule_num = "";

  if (pg.schedule) {
    shedule_num = pg.schedule.num;

    var regExp = /\(([^)]+)\)/;
    var matches = regExp.exec(shedule_num);
    //console.log("regex", shedule_num, matches);

    if (matches) {
      var num_info = matches[1];
      //console.log("num details", num_info);

      var msg =
        i18n.notValidRoute ||
        (pg.language == "ee"
          ? "Sõiduplaan täna ei kehti"
          : "Timetable is not valid today");
      //num_info = "E-T";

      if (
        num_info.search(/\d/) >= 0 &&
        shedule_num.replace(/\s/g, "").indexOf("(al") > 0
      ) {
        // "13 (al 02.03)", must have 'al' for not valid today routes
        jQuery("#divScheduleContent .next-departures ul").html(
          "<li>" + msg + "</li>"
        );
        console.log("renderRealtimeDepartures return 0");
        return;
      } else {
        // "13 (E-T)"
        var weekday = new Date().getDay() || 7;

        if (
          pg.schedule.route &&
          pg.schedule.route.weekdays.indexOf(weekday) != -1
        ) {
          shedule_num = shedule_num.split("(")[0].trim();
          //console.log("shedule_num", shedule_num);
        } else {
          console.log("renderRealtimeDepartures return 1");
          jQuery("#divScheduleContent .next-departures ul").html(
            "<li>" + msg + "</li>"
          );
          return;
        }
      }
    }
  }

  //console.log("siri2.txt 1");
  //cfg.city.urlVehicleDepartures = "siri.txt";
  pg.transfers = []; // in case if #stop was opened - ti.routes data will be used instead of live data

  /*
    if(favourites) {
        var el = jQuery("#favourites .flive-data");
        if(el.html() == "") { // tik jeigu tuscias...
            el.html('<li><img src="tallinn/images/ajax-loader.gif" style="width:24px;height:24px;"></li>');
        }
    }
    else {
        var el = jQuery("#divScheduleContent .next-departures ul");
        if(el.html() == "") {
            el.html('<li><img src="tallinn/images/ajax-loader.gif" style="width:24px;height:24px;"></li>');
        }
    }*/
  //console.log("CALL LIVE");
  var notices = pg.getStopsNotices("interruption");

  pg.fProcessVehicleDepartures(null, function (data, server_time) {
    //console.log("live data: ", data, server_time, selector);

    if (selector == "favourites") {
      jQuery("#favourites .flive").removeClass("active");

      if (typeof data == "string") {
        // reiskia gavome zinute kuria reikia parodyti - pvz nera interneto.
        jQuery("#favourites .flive-data").html(data);
        jQuery("#favourites .flive").addClass("active"); // visiems prirasome ta pati texta/nenaudojamas
        return; // nieko nerodom
      } else if (typeof data == "object" && "status" in data) {
        // gauta klaida, nieko nerodom
        jQuery("#favourites .flive-data").html("<li>" + data.message + "</li>");
        jQuery("#favourites .flive").addClass("active"); // visiems prirasome ta pati texta/nenaudojamas
        return;
      }
    } else if (selector == "stop") {
      //console.log("fProcessVehicleDepartures data for stop", data);
    } else {
      if (typeof data == "string") {
        // reiskia gavome zinute kuria reikia parodyti - pvz nera interneto.
        jQuery("#divScheduleContent .next-departures ul").html(data);
        return;
      } else if (typeof data == "object" && "status" in data) {
        // gauta klaida
        jQuery("#divScheduleContent .next-departures").hide();
        jQuery("#divScheduleContent .next-departures ul").html(
          "<li>" + data.message + "</li>"
        );
        return;
      }
    }

    if (!selector) {
      var routes = jQuery.grep(data, function (d) {
        if (!pg.schedules) {
          if (
            d.route.num &&
            shedule_num &&
            d.route.transport == pg.schedule.transport
          ) {
            //var num = pg.schedule.num.toLowerCase().split('(')[0].trim();
            var num = shedule_num.toLowerCase().trim(); //Talinas nenori rodyti prognozuojamu atvykimu prie anonsuojamu tvarkarasciu su skliausteliais

            return (
              d.route.num.toLowerCase() == shedule_num ||
              d.route.num.toLowerCase() == num
            );
          } else {
            return false;
          }
        } else {
          //console.log("xxx", d);
          var key = [
            d.route.city,
            d.route.transport,
            d.route.num.toLowerCase(),
          ].join("_");
          if (key in pg.schedules && pg.schedules[key]) return true;
          return false;
        }
      });
      //console.log("fProcessVehicleDepartures:", data.length, routes, routes.length);
    } else {
      var routes = data;
    }

    // tallinn problem: opposite directions of the same (transport, num) stops on the same(id) stop
    // start fix
    var siri_bug_identified = false;
    var destination_keys = {}; // key : destination
    jQuery.each(routes, function (i, d) {
      var key = [
        d.route.city,
        d.route.transport,
        d.route.num.toLowerCase(),
      ].join("_");
      //console.log("route", i, d, key, d.route.destination);

      var destination = d.route.destination;
      if (key in destination_keys && destination_keys[key] != destination) {
        //console.log("SIRI BUG:", key, destination_keys[key], "!=", destination);
        siri_bug_identified = true;
        // skip this times id this destination
      } else {
        destination_keys[key] = destination;
      }
    });

    //var siri_bug_identified = false;
    if (siri_bug_identified) {
      if (!selector) {
        // schedule (not favourites or stop)
        // let's try to remove wrong directions
        // direction is definitely wrong if (first and last stop names for this route has different names (skip circular routes), and current route first stop.name == destination)

        var selected_routes = [];
        if (pg.schedules) {
          // multiple route checkboxes selected
          for (var key in pg.schedules) {
            selected_routes.push(pg.schedules[key]);
          }
        } else {
          selected_routes.push(pg.schedule);
        }

        // filter again, and check stop names
        var routes = jQuery.grep(routes, function (d) {
          var key = [
            d.route.city,
            d.route.transport,
            d.route.num.toLowerCase(),
          ].join("_");
          return pg.good_siri_direction(
            key,
            selected_routes,
            d.route.destination
          );
        });
      }
    }
    // end

    if (!routes.length) {
      if (!selector)
        jQuery("#divScheduleContent .next-departures ul").html(
          "<li>" + (i18n.stopNoRealtimeDepartures + ".").split(".")[0] + "</li>"
        );
    } else {
      // ar gali buti kad suras kelis marsrutus? ltu: islindo bug'as - gali
      var races = [];
      var races_in_stop = {};

      //console.log("routes length", routes, routes.length);

      jQuery.each(routes, function (i, route) {
        var id = [
          "flive",
          route.route.stopId,
          route.route.transport,
          route.route.num,
        ].join("-");

        //if(route.route.num == "4") {
        //    console.log("routes 4: ", i, route, id, route.route.destination, route.times);
        //}
        //console.log("route", route);

        if (!(route.route.stopId in races_in_stop))
          races_in_stop[route.route.stopId] = [];

        //if(route.route.destination != destination) {
        //    races_in_stop[route.route.stopId].push(route.route.destination);
        //    destination = route.route.destination;
        //}

        var times = [];

        if (
          pg.findNoticeForRoute(notices, route.route).announcement.trim() ==
          "ei toimu osadest peatustest väljumisi"
        ) {
          // skipping
        } else {
          times = pg.renderLiveRace(route, server_time);
          races_in_stop[route.route.stopId] =
            races_in_stop[route.route.stopId].concat(times);
        }

        //console.log("times", times);

        //divHelp.log("xsx", id, jQuery("#favourites #" + id).length, times.length);
        if (selector) {
          //jQuery("#favourites #" + id).html([
          //    jQuery.map(times, function(x) {return x[1];}).join('')
          //].join("")).parents(".flive").addClass("active");

          jQuery("#favourites ." + id).each(function (i, el) {
            var direction = jQuery(el).attr("data-direction");
            var r = {
              city: route.route.city,
              transport: route.route.transport,
              num: route.route.num,
              dirType: direction,
            };
            //console.log("i,el", i, el, direction, r, route.route.destination);

            var route_key = [r.city, r.transport, r.num.toLowerCase()].join(
              "_"
            );

            if (
              !siri_bug_identified ||
              pg.good_siri_direction(route_key, [r], route.route.destination)
            ) {
              if (times.length) {
                jQuery(el)
                  .html(
                    [
                      jQuery
                        .map(times, function (x) {
                          return x[1];
                        })
                        .join(""),
                    ].join("")
                  )
                  .parents(".flive")
                  .addClass("active");
              } else {
                jQuery(el)
                  .html(
                    "<li>" +
                      (i18n.stopNoRealtimeDepartures + ".").split(".")[0] +
                      "</li>"
                  )
                  .parents(".flive")
                  .addClass("active");
              }
            } else {
              //
              //jQuery(el).html("");
            }
          });
        }

        races = races.concat(times);
      });

      //console.log("races", races);
      // all routes for selected stop
      //console.log("races_in_stop", races_in_stop);

      var favourite_stops = jQuery(".flive-data-stops");

      //console.log("favourite_stops", favourite_stops)
      //return;

      jQuery.each(favourite_stops, function (i, el) {
        var fstops = jQuery(el).attr("data-stops").split(",");
        var all_routes = [];
        for (var j = 0; j < fstops.length; j++) {
          var fstop = fstops[j];
          if (!(fstop in races_in_stop)) {
            continue;
          }
          all_routes = all_routes.concat(races_in_stop[fstop]);

          //console.log(fstop, races_in_stop[fstop]);
          //fhtml.push(jQuery.map(races_in_stop[fstop], function(x) {return (typeof x == "string")? ['<br/><li style="font-weight:normal;font-size:12px;text-transform: capitalize;">', i18n.towards, ': ', x, '&nbsp;&nbsp;</li>'].join(''):x[1];}).join(''));
          //console.log("fstops", fstop, fstop in races_in_stop);
        }

        // sort by destination
        all_routes.sort(function (a, b) {
          if (a[2] && b[2]) {
            var cmp = a[2].localeCompare(b[2]);
            if (cmp == 0) return a[0] - b[0];
            return cmp;
          } else {
            return a[0] - b[0];
          }
        });

        var fhtml = [];
        var destination = "";

        var routes_to_test = []; // test if those woutes has notices

        for (var m = 0; m < all_routes.length; m++) {
          var lroute = all_routes[m];
          var d = lroute[2];

          //console.log("lroute!", lroute);

          if (d != destination) {
            if (destination != "") {
              fhtml.push(pg.noticesHTML4routes(routes_to_test, destination));
              fhtml.push("</ul>");
              //fhtml.push(['<div class="fav-notices"><span>', routes_to_test.map(function(x) {return x.num;}).join(","), '</span><span class="travel-planner-problems"></span><span class="travel-planner-problems announcement"></span></div></ul>'].join(''));

              routes_to_test = [];
            }

            fhtml.push(
              [
                '<ul><li style="font-weight:normal;font-size:0.75rem;text-transform: capitalize;">',
                i18n.towards,
                ": ",
                d,
                "&nbsp;&nbsp;</li>",
              ].join("")
            );
            //fhtml.push(['<br/><li style="font-weight:normal;font-size:12px;text-transform: capitalize;">', i18n.towards, ': ', d, '&nbsp;&nbsp;</li>'].join(''));
            destination = d;
          }

          routes_to_test.push(lroute[3]);
          fhtml.push(lroute[1]);
        }

        fhtml.push(pg.noticesHTML4routes(routes_to_test, destination));
        fhtml.push("</ul>");
        //fhtml.push('<div class="fav-notices"><span>', routes_to_test.map(function(x) {return x.num;}).join(","), '</span><span class="travel-planner-problems"></span><span class="travel-planner-problems announcement"></span></div></ul>');
        routes_to_test = [];

        //console.log("fhtml", fhtml);

        if (fhtml.length) {
          jQuery(el).html(fhtml.join("")).parent().addClass("active");
        }
      });

      races.sort(function (a, b) {
        return a[0] - b[0];
      });

      if (!selector) {
        jQuery("#divScheduleContent .next-departures ul").html(
          jQuery
            .map(races, function (x) {
              return x[1];
            })
            .join("")
        );
      }
    }
    if (!selector) jQuery("#divScheduleContent .next-departures").show();
  });

  //store to skip reloading later with params are the same
  if (selector == "favourites") {
    pg.loadedDepartingRoutes = pg.favouriteStops;
  } else if (selector == "stop") {
    pg.loadedDepartingRoutes = pg.inputStop;
  } else {
    pg.loadedDepartingRoutes = pg.schedule.stopId;
  }
};

pg.divMapHide_ClickMain = pg.divMapHide_Click;

pg.divMapHide_Click = function (event) {
  jQuery("#tblRoutes td.view-map a.active").removeClass("active");
  pg.divMapHide_ClickMain(event);
};

pg.fTabShowMap_ClickMain = pg.fTabShowMap_Click;

pg.fTabShowMap_Click = function (event, mode) {
  jQuery("#tblRoutes td.view-map a.active").removeClass("active");

  if (mode == "stops") {
    // from menu...
    pg.hashForMap = "map,max";
    pg.fUrlSet({ transport: "map" });
  } else {
    pg.fTabShowMap_ClickMain(event, mode);
  }
};

pg.fTabPlanner_Click = function (
  startStopIds,
  finishStopIds,
  hashForMap,
  forceExecute
) {
  hashForMap = hashForMap || "";
  //hashForMap = (hashForMap || pg.hashForMap);
  pg.fUrlSet(
    {
      transport: "plan",
      inputStart: startStopIds || pg.inputStart || pg.inputStop,
      inputFinish: finishStopIds || pg.inputFinish,
      hashForMap: hashForMap,
    },
    false,
    forceExecute
  );
  return false;
};

pg.openNotice = function (event, type, indexes) {
  console.log("type: ", type);

  if (type == "announcement")
    document.getElementById("divNoticesAndAnnouncementsContainer").className =
      "notices-active";
  else if (type == "interruption")
    document.getElementById("divNoticesAndAnnouncementsContainer").className =
      "announcements-active";

  var items = document.querySelectorAll(".travel-planner__notices__item");
  for (var i = 0; i < items.length; i++) {
    items[i].classList.remove("active");
  }

  var indexes = indexes || [];
  for (var i = 0; i < indexes.length; i++) {
    var item_el = document.getElementById("item-" + indexes[i]);
    if (item_el) item_el.classList.add("active");

    pg.loadNotice(indexes[i]);
  }

  pg.fUrlSet({ transport: "notices", hashForMap: "" });
  event.preventDefault();
  event.stopPropagation();
};

/*
pg.startPlanner = function() {
    pg.fLoadPlannerTab(true, function (args, bFinal) {
        mobile.inputClearCheck("inputStart");
        mobile.inputClearCheck("inputFinish");
        
        if(!args.results) args.results = [];//return;

        mobile.renderPlannerResults(args, bFinal);
    });
};
*/

pg.fTabFavourites_Click = function () {
  pg.fUrlSet({ transport: "favourites", hashForMap: "" });
  return false;
};

pg.fTabContacts_Click = function () {
  //document.querySelector(".icon_ticket").classList.remove("active");

  pg.fUrlSet({ transport: "contacts", hashForMap: "" });
  return false;
};

pg.fTabNotices_Click = function () {
  //document.querySelector(".icon_ticket").classList.remove("active");

  pg.fUrlSet({ transport: "notices", hashForMap: "" });
  return false;
};

pg.fTabHelp_Click = function () {
  pg.fUrlSet({ transport: "help", hashForMap: "" });
  return false;
};

ti.findTripsMain = ti.findTrips; //(args);

ti.findTrips = function (args) {
  //console.log("findTrips for tallinn desktop!!!!", args);

  if (ti.skipPlannerSearch) {
    //console.log("skipping search....");
  } else {
    ti.findTripsMain(args);
  }

  // reikia paziureti kaip iskvieciu mobilioje versijoje!
  // ir sukurti nauja funkcija ar patobulinti fTabPlanner_Click
};

pg.getPlannerArgs = function () {
  var args = {
    lowFloor: document.getElementById("checkHandicapped").checked,
    route_nums: document.getElementById("inputRoutesFilter").value,
    change_time: document.getElementById("inputChangeTime").value,
    walk_max: document.getElementById("inputWalkMax").value,
    walk_speed_kmh: document.getElementById("inputWalkSpeed").value,
    transport: {},
  };

  document.querySelectorAll("#plannerTransport input").forEach(function (x, i) {
    var tt = x.id.substring(8);
    args.transport[tt] = x.checked;
  });
  return args;
};

pg.setPlannerArgs = function (args) {
  //console.log("pg.setPlannerArgs", args);
  /*change_time: 1
    date: Tue Jan 25 2022 00:00:00 GMT+0200 (Eastern European Standard Time) {}
    lowFloor: true
    reverse: 1
    route_nums: ""
    startTime: "15:41"
    transport: {bus: true, trol: false, tram: false, regionalbus: false, commercialbus: false, …}
    walk_max: 1000
    walk_speed_kmh: 1 */
  document.getElementById("checkHandicapped").checked = args.lowFloor || false;

  document.getElementById("inputRoutesFilter").value = args.route_nums || "";
  document.getElementById("inputChangeTime").value = args.change_time || 3; // default 1 min
  document.getElementById("inputWalkMax").value =
    typeof args.walk_max != "undefined" ? args.walk_max : 500;
  document.getElementById("inputWalkSpeed").value = args.walk_speed_kmh || 4;

  //var transport = args.transport || {};

  document.querySelectorAll("#plannerTransport input").forEach(function (x, i) {
    var tt = x.id.substring(8);

    if (args.transport && !args.transport[tt]) {
      x.checked = false;
    } else {
      x.checked = true; // select all transport by default
    }
    //console.log(tt, x.checked);
  });

  jQuery.uniform.update();
};

pg.fLoadPlannerTabMain = pg.fLoadPlannerTab;

pg.fLoadPlannerTab = function (bRecalculate, noSearch) {
  ti.skipPlannerSearch = noSearch ? true : false;

  pg.inputClearCheck("inputStart");
  pg.inputClearCheck("inputFinish");

  //console.log("fLoadPlannerTab", pg.transportPrevious, bRecalculate, noSearch);

  if (
    !bRecalculate &&
    (pg.transportPrevious == "favourites" || pg.transportPrevious == "home")
  ) {
    // !bRecalculate not a search button
    // favourites must be already loaded; transportPrevious guarantees that!
    // load stored search parameters
    var key = pg.inputStart + ";" + pg.inputFinish;

    var plannerArgs = favourites.getSettings(key);

    if (plannerArgs) {
      pg.setPlannerArgs(plannerArgs);
      // could not use default {}; it will reseted new search (the same pg.transportPrevious)
    }

    //console.log("GET KEY:", key, plannerArgs);
    //console.log("RENDER PLANNER?1", page, plannerArgs);
  }

  //document.getElementById("checkHandicapped").checked = true;
  //pg.setPlannerArgs({});
  /*
    pg.setPlannerArgs(
        {
        change_time: 3,
        lowFloor: false,
        route_nums: "11",
        transport: {bus: true, trol: true, tram: false, regionalbus: false, commercialbus: false, train: true},
        walk_max: 500,
        walk_speed_kmh: 4
        }
    );*/

  pg.fLoadPlannerTabMain(bRecalculate, function (args, bFinal) {
    //pg.inputClearCheck("inputStart");
    //pg.inputClearCheck("inputFinish");

    var status = jQuery("#planner").attr("data-status");
    //console.log("fLoadPlannerTabMain", args, bFinal, status);

    if (status != "loaded") {
      jQuery("#planner .adv-toggle a").click(function (e) {
        e.preventDefault();
        jQuery(this).toggleClass("active");
        jQuery("#planner .advanced").slideToggle(200);
        return false;
      });

      jQuery("#planner .start-station .location")
        .click(function (e) {
          createMyLocation(function () {
            if (!ti.stops["gps"]) {
              alert(i18n.locationNotKnown);
              return false;
            }
            jQuery("#inputStart").val(i18n.myLocation);
            pg.inputStart = "gps";
          });
          return false;
        })
        .attr("title", i18n.myLocation);

      //jQuery("#plan .locate.finish").bind("click", function () {
      jQuery("#planner .final-station .location")
        .click(function (e) {
          createMyLocation(function () {
            if (!ti.stops["gps"]) {
              alert(i18n.locationNotKnown);
              return false;
            }
            jQuery("#inputFinish").val(i18n.myLocation);
            pg.inputFinish = "gps";
          });
          return false;
        })
        .attr("title", i18n.myLocation);

      var today = new Date();

      var languages = {
        en: "",
        ee: "et-ET",
        lt: "lt-LT",
        ru: "ru-RU",
        de: "de-DE",
        lv: "lv-LV",
      };
      jQuery("#inputDateNew").datepicker({
        autoPick: true,
        autoHide: true,
        language: languages[pg.language],
        format: "dd.mm.yyyy",
        startDate: today,
        endDate: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 31
        ),
      });
      /*
            var options = jQuery("#planner .date-select").html("");
            //var numberOfDays = new Date(day.getFullYear(), day.getMonth()+1, 0).getDate()
            
            options.append(jQuery("<option />").val(0).text(i18n.today).attr("id", "inputDate0"));
            options.append(jQuery("<option />").val(1).text(i18n.tomorrow).attr("id", "inputDate1"));
            for(var i=2; i<= 31; i++) {
                var d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
                options.append(jQuery("<option />").val(i).text(pg.formatDate(d, ".")).attr("id", "inputDate" + i));
            }*/

      jQuery("#planner input:checkbox, select:not(.date-select)").uniform();

      /*
            jQuery('#planner select.date-select').uniform({
                selectClass: 'date-selector'
            });
            */

      jQuery("#planner").attr("data-status", "loaded");

      /* zemiau laikinai testavimui*/
      /*
            jQuery('.xxx .option header').click(function() {
                jQuery(this).toggleClass('active');
                if(jQuery(this).hasClass('active')) {
                    jQuery(this).next('.result').slideDown(200);
                } else {
                    jQuery(this).next('.result').slideUp(200);
                }
            });*/

      jQuery("input[name='time']")
        .unbind("change")
        .bind("change", function () {
          jQuery("#inputReverse").val(jQuery(this).val());
        });

      jQuery("#planner .footer-pro").html("<br/>" + pg.footerHTML());
      //console.log("aa");
    }

    //console.log("CALLBACK", args, bFinal);

    //if(bFinal) {
    function planner() {
      if (bRecalculate && args && args.errors) {
        // rodom jeigu paspaude OTSI klaidas
        pg.renderPlannerResults(args, bFinal);
        jQuery("#planner").addClass("ok");
      } else if (pg.inputStart && pg.inputFinish && bFinal) {
        // fordau tik paskutinius rezultatus, kad neklaidinti tarpiniais...
        pg.renderPlannerResults(args, bFinal);
        jQuery("#planner").addClass("ok");
        //pg.fPrintOptimalTrips(args, bFinal);
      } else {
        ($("divContentPlannerResults") || {}).innerHTML = ""; // dont show alert text with #plan/--/en
        jQuery("#planner").removeClass("ok");
      }
    }

    if (pg.inputStart == "gps" || pg.inputFinish == "gps") {
      if (pg.inputStart == "gps") jQuery("#inputStart").val(i18n.myLocation);
      if (pg.inputFinish == "gps") jQuery("#inputFinish").val(i18n.myLocation);

      createMyLocation(function (gps) {
        planner();
      });
    } else {
      planner();
    }
  });
  return false;
};

// modifikuotas pg.fPrintOptimalTrips
pg.renderPlannerResults = function (args, bFinal) {
  //jq("#loading").hide();

  jQuery("#planner .results").html(i18n.loading);
  jQuery("#planner").addClass("results"); // paslepsime paieskos forma

  //console.log("renderr", args.errors, args.results);

  if (args.errors && args.errors.length) {
    var errors_html = [];
    jQuery.each(args.errors, function (i, error) {
      errors_html.push(
        ['<p style="padding:10px;margin:0px;">', error.text, "</p>"].join("")
      );
    });
    jQuery("#planner .results").html(
      ['<div class="no-results">', errors_html.join(""), "</div>"].join("")
    );
    return;
  }

  //console.log("results:", args.results.length);

  if (!args.results) args.results = []; //return;

  var results = (pg.optimalResults = args.results);

  pg.map = {}; //clear drawings of previous results

  var startStopsDetails = ti.fGetAnyStopDetails(pg.inputStart);
  var finishStopsDetails = ti.fGetAnyStopDetails(pg.inputFinish);

  //var favourites_title = i18n.btnFavouritesAdd;
  //var favourites_class = "";
  if (
    favourites.belongs({ start: pg.inputStart, finish: pg.inputFinish }, true)
  ) {
    jQuery("#planner .button-favourite").addClass("active");
  } else {
    jQuery("#planner .button-favourite").removeClass("active");
  }

  var routesHTML = [
    /*
    '<div class="row-fluid">',
      '<div class="span12 toolbar">',
        '<p class="planner-info">',
          i18n.departingStop, ': <strong>', startStopsDetails.name, '</strong><br>',
          i18n.finishStop, ': <strong>', finishStopsDetails.name, '</strong>',
        '</p>',
        '<p class="planner-info pull-right">',
          (args.reverse == 1) ? i18n.depart : i18n.arrive, ' <strong>', pg.formatDate(args.date), '</strong><br>',
          '<strong class="time">', ti.printTime(args.start_time), '</strong>',
        '</p>',
      '</div>',
    '</div>',
    */
    /*
    '<div id="planner-stops">',
        '<p class="start">', startStopsDetails.name, '</p>',
        '<p class="final">', finishStopsDetails.name, '</p>',
        '<p class="departure">', (args.reverse == 1) ? i18n.depart : i18n.arrive, ': <strong>', ti.printTime(args.start_time),'</strong></p>',
        '<button class="button switch" onclick="mobile.switchStops(true);"></button>',
        '<button class="button button-favourite', favourites_class, '"></button>',
    '</div>'
    */
  ];

  //alert(results.length);

  for (var i = 0; i < results.length; i++) {
    var result = results[i];
    var legs = results[i].legs;
    //var legsHTML = [];
    var legsHTML2 = [];
    var iconsHTML = [];

    var transport_types = [];

    for (var j = 0; j < legs.length; j++) {
      var leg = legs[j];
      var route = leg.route;
      var route2 = (legs[j + 1] || { route: null }).route;

      if (route && route.transport) {
        if (
          route2 &&
          route.city === route2.city &&
          route.transport === route2.transport &&
          route.num === route2.num
        ) {
          leg.finish_stop.name = legs[j + 1].finish_stop.name;
          leg.finish_time = legs[j + 1].finish_time;
          ++j;
        }

        iconsHTML.push(
          '<span class="icon icon_narrow icon-' +
            route.transport +
            '"' +
            ' title="' +
            i18n.transport1[route.transport] +
            " " +
            route.num +
            " " +
            i18n.towards +
            " " +
            route.name +
            '"></span>'
        );
        if (result.direct_trip && route.num.length <= 8) {
          iconsHTML.push(
            '<span class="num num' +
              Math.min(leg.route.num.length, 4) +
              " " +
              leg.route.transport +
              '">' +
              leg.route.num +
              "</span>"
          );

          if (leg.online_data) {
            iconsHTML.push(
              " " +
                leg.online_data.code +
                " " +
                leg.online_data.departureAsStr +
                " &rarr; " +
                leg.online_data.arrivalAsStr
            );
          }
        }

        route.stopId = leg.start_stop.id;
        route.tripNum = (leg.trip_num || -1) + 1;

        var hash = pg.fUrlSet({ schedule: route, mapHash: "" }, true);

        var riding_time = leg.finish_time - leg.start_time;
        riding_time =
          riding_time >= 60
            ? ti.printTime(riding_time)
            : riding_time + "&nbsp;" + i18n.minutesShort;

        /*
                legsHTML.push(
                    ['<li>',
                      '<a href="#', hash, '" alt="', leg.route.num, " ", leg.route.name, '" title="', leg.route.num, " ", leg.route.name, '">',
                        '<span class="icon icon-', leg.route.transport, '"></span>',
                        '<span class="label label-', leg.route.transport, ' num', leg.route.num.length, '">', leg.route.num, '</span>', leg.route.name,
                        '<p class="directions">',
                          '<strong>', ti.printTime(leg.start_time), (leg.online_data ? '(' + leg.online_data.departureAsStr + ')' : ''),
                          ' ', leg.start_stop.name, '</strong>&nbsp;', ti.printTime(leg.finish_time),
                          (leg.online_data ? '(' + leg.online_data.arrivalAsStr + ')' : ''), ' ', leg.finish_stop.name, '<br>',
                          '<span class="muted">(', i18n.ride, ' ', riding_time, ')</span>',
                        '</p>',
                      '</a>',
                    '</li>'].join("")
                );
                */

        //console.log("leg.", leg);

        legsHTML2.push(
          [
            '<div class="point',
            j == 0 ? " start-point" : "",
            " type_",
            leg.route.transport,
            '">',
            '<div class="time">',
            ti.printTime(leg.start_time),
            leg.online_data ? "(" + leg.online_data.departureAsStr + ")" : "",
            "</div>",
            '<div class="point-info">',
            "<h3>",
            leg.start_stop.name,
            j == 0
              ? [
                  '<button class="button btn-default print" onclick="window.print()">',
                  i18n.print,
                  "</button>",
                ].join("")
              : "",
            '<p class="location">',
            leg.start_stop.street,
            "</p>",
            '<div class="transport" title="',
            i18n.transport[leg.route.transport],
            '"><a href="#',
            hash,
            '"><span class="num">',
            leg.route.num,
            '</span></a><span class="riding-time">(',
            i18n.ride,
            " ",
            riding_time,
            ")</span>",
            pg.noticesHTML(leg.route.id, "planner-body"),
            //'<div class="travel-planner-block"><span class="travel-planner-problems"></span>'
            //,'<span class="travel-planner-time">alates 16:11</span>'
            //,'<span class="travel-planner-info">Liinid ajutiselt</span></div>'
            "</div>",
            "</h3>",

            '<div class="stop-toggle',
            !leg.stops.length ? " hidden" : "",
            '"><i class="Chevron"></i><div>(',
            i18n.totalStops,
            ": ",
            leg.stops.length + 1,
            ")</div></div>",
            '<div class="stop-intermediate">',

            leg.stops
              .map(function (stop) {
                return [
                  '<div class="stop-container">',
                  '<div class="stop-time">',
                  stop.arrival_time.text,
                  "</div>",
                  '<div class="stop-circle"><div class="intermediate-stop-circle"></div></div>',
                  '<div class="stop-name">',
                  stop.name,
                  "</div>",
                  "</div>",
                ].join("");
              })
              .join(""),
            "</div>",
            "</div>",
            "</div>",
          ].join("")
        );
        //console.log("leg.route", leg.route);
        transport_types.push({
          transport: leg.route.transport,
          num: leg.route.num,
          id: leg.route.id,
          low: route.weekdays && route.weekdays.indexOf("z") >= 0,
        });
      } else {
        if (
          leg.start_time == leg.finish_time &&
          parseInt(leg.start_stop.id, 10) == parseInt(leg.finish_stop.id, 10)
        ) {
          continue; // do not print 0 min walking within stop area
        }
        iconsHTML.push(
          '<span class="icon icon_narrow icon-walk" title="' +
            i18n.walk +
            " " +
            (leg.finish_time - leg.start_time) +
            "&nbsp;" +
            i18n.minutesShort +
            '"></span>'
        );

        var duration = leg.finish_time - leg.start_time;

        /*
                legsHTML.push(
                    ['<li><a alt="', i18n.walk, '" title="', i18n.walk, '">',
                        '<span class="icon icon-walk"></span>',
                        '<p class="directions">',
                          '<strong>', ti.printTime(leg.start_time), ' ', leg.start_stop.name, '</strong>&nbsp;', ti.printTime(leg.finish_time), ' ', leg.finish_stop.name, '<br>',
                          '<span class="muted">(', i18n.walk, ' ', duration, '&nbsp;', i18n.minutesShort, ')</span>',
                        '</p>',
                    '</a></li>'].join("")
                );*/

        //console.log("|", leg.start_stop, leg.finish_stop);
        var distance = parseInt(
          ti.distance(
            leg.start_stop.lat,
            leg.start_stop.lng,
            leg.finish_stop.lat,
            leg.finish_stop.lng
          )
        );

        transport_types.push({
          transport: "walk",
          duration: duration,
          distance: distance,
        });

        legsHTML2.push(
          [
            '<div class="point',
            j == 0 ? " start-point" : "",
            ' type_walk">',
            '<div class="time">',
            ti.printTime(leg.start_time),
            "</div>",
            '<div class="point-info">',
            "<h3>",
            leg.start_stop.name,
            j == 0
              ? [
                  '<button class="button btn-default print" onclick="window.print()">',
                  i18n.print,
                  "</button>",
                ].join("")
              : "",
            '<p class="location">',
            leg.start_stop.street,
            "</p>",
            '<p class="transport" title="',
            i18n.walk,
            '">',
            i18n.walk,
            " (",
            distance,
            " m, ",
            leg.finish_time - leg.start_time,
            "&nbsp;",
            i18n.minutesShort,
            ")</p>",
            legs[j + 1]
              ? [
                  '<p class="wait">',
                  i18n.waitFor,
                  " ",
                  legs[j + 1].start_time - leg.finish_time,
                  " ",
                  i18n.minutesShort,
                  "</p>",
                ].join("")
              : "",
            "</h3>",
            "</div>",
            "</div>",
          ].join("")
        );
      }

      if (j == legs.length - 1) {
        legsHTML2.push(
          [
            '<div class="point end-point">',
            '<div class="time">',
            ti.printTime(leg.finish_time),
            "</div>",
            '<div class="point-info">',
            "<h3>",
            leg.finish_stop.name,
            '<p class="location">',
            leg.finish_stop.street,
            "</p>",
            "</h3>",
            "</div>",
            "</div>",
          ].join("")
        );
      }

      /*
            if (leg.taxi) {
                for (var ii = 0; ii < leg.taxi.length; ++ii) {
                    var taxi = leg.taxi[ii];
                    legsHTML.push((ii ? '<br />' : '') + 'km: ' + taxi.km + ', ' + taxi.name + ', phone: ' + taxi.phone);
                }
            }
            */
    }

    var hashMap = [
      pg.city,
      "/",
      pg.transport,
      pg.transport == "plan"
        ? "/" +
          (pg.inputStart || "") +
          (pg.inputFinish ? "/" + pg.inputFinish : "")
        : "",
      "/map,,,",
      i + 1,
      "/",
      pg.language,
    ].join("");

    var transport_types_html = [];
    jQuery.each(transport_types, function (i, tt) {
      transport_types_html.push();
      if (tt.transport == "walk") {
        transport_types_html.push(
          [
            '<span title="',
            i18n.walk,
            '" class="icon_walk">' /*(', tt.distance, 'm, ', tt.duration,' min.)*/,
            ,
            "</span>",
          ].join("")
        );
      } else {
        //console.log("TT", tt.id, ti.routes[tt.id].notices);
        var num = tt.num;
        if (num.length > 5) {
          var place = num.indexOf(" ");
          if (place != -1) {
            num = num.substring(0, place) + "*";
          }
        }

        transport_types_html.push(
          [
            '<span title="',
            i18n.transport[tt.transport],
            tt.low ? [" (", i18n.lowFloorDepartureTip, ")"].join("") : "",
            '" class="icon_',
            tt.transport,
            tt.low ? " low" : "",
            '"><span class="num">',
            num,
            "</span></span>",
            pg.noticesHTML(tt.id, "planner-head"),
            //ti.routes[tt.id].notices ? '<span class="travel-planner-problems"></span>':''
          ].join("")
        );
      }

      if (i != transport_types.length - 1) {
        //transport_types_html.push('<span class="plus"></span>');
      }
    });

    routesHTML.push(
      [
        //'<div class="accordion-group', (i ? '' : ' active'), '">',
        '<section class="option">',
        '<header data-href="#',
        hashMap,
        '" class="rp-table clearfix',
        //((bFinal && results.length==1)?' active':''),
        '"><div class="rp-row">',
        '<h2 class="rp-cell"><strong>',
        i18n.option,
        " ",
        i + 1,
        "</strong> ",
        ti.printTime(result.start_time, null, "&#x2007;"),
        " - ",
        ti.printTime(result.finish_time, null, "&#x2007;"),
        ", ",
        i18n.travelDuration,
        " <span>",
        ti.printTime(result.travel_time),
        "</span></h2>",

        '<div class="transport-types rp-cell">',
        "<div>",
        transport_types_html.join(""),
        "</div>",
        "</div>",
        '<div class="rp-cell toggler">',
        '<button class="button" type="button">',
        '<span class="more">',
        i18n.showOption,
        "</span>",
        '<span class="less">',
        i18n.hideOption,
        "</span>",
        "</button>",
        "</div>",
        //'<div class="transport-types">',

        //    transport_types_html.join(""),
        /*'<span class="icon_bus"><span class="num">5</span></span>',
                    '<span class="plus"></span>',
                    '<span class="icon_walk">(121m, 5 minutit)</span>',*/
        //'</div>',
        //'<button class="button" type="button"></button>',
        //'<a href="#', hashMap, '" class="map"></a>',
        "</div></header>",

        '<div class="result"',
        //((bFinal && results.length==1)?' style="display:block;"':''),
        ">",
        legsHTML2.join(""),
        '<p class="nb">',
        i18n.deviationsPossible,
        "</p>",
        "</div>",
        "</section>",

        /*
            '<div class="accordion-heading">',
            '<div class="accordion-toggle', (i ? ' collapsed' : ''), '" data-toggle="collapse" title="', i18n.option + '&nbsp;' + (i + 1), '">',
              '<p>',
                '<strong>', i18n.option + '&nbsp;' + (i + 1), '</strong> ', ti.printTime(result.start_time, null, '&#x2007;'),
                ' - ', ti.printTime(result.finish_time, null, "&#x2007;"), '<br>',
                i18n.travelDuration, ' <strong>', ti.printTime(result.travel_time), '</strong>',
              '</p>',
              '<div class="variant-map pull-right" style="display:inline-block;position:absolute; right:5px;">',
              '<a class="btn btn-map" style="display:inline-block;" title="', i18n.showInMap, '" alt="', i18n.showInMap, '" href="#', hashMap, '"></a>',
              '</div>',
              '<div class="icons pull-right" style="display:inline-block;position:absolute; right:46px;">',
                iconsHTML.join(''),
              '</div>',
              '</div>',
            '</div>',
            */

        /*
            '<div id="result', i, '" class="accordion-body collapse">', // (i ? '':' in')
            '<div class="accordion-inner"><ul class="nav nav-list with-icons">', legsHTML.join(''), '</ul></div></div>',
            */

        //'</div>'
      ].join("")
    );
  }

  if (results.length <= 0) {
    routesHTML.push(
      ['<div class="no-results">', i18n.noOptimalRoutes, "</div>"].join("")
    );
  } else {
    //console.log("FINAL: ", bFinal, document.body.className.indexOf("Map"));

    if (bFinal && document.body.className.indexOf("Map") >= 0) {
      pg.mapShowAllStops = -Math.abs(pg.mapShowAllStops); //toggle off for better overview of route
      pg.fUrlSetMap({ optimalRoute: 1 });
    }
  }

  //jQuery("#planner .results").html(routesHTML.join(""));
  jQuery("#planner .results")[0].innerHTML = routesHTML.join("");

  var footer = cfg.cities[pg.city].footer;
  footer = (footer && (footer[pg.language] || footer["en"])) || "";

  jQuery("#planner .footer-pro").html(
    [
      "<br/>",
      pg.footerHTML(),
      //footer,
      //'<p id="programmedBy" class="smalltext graytext">',(cfg.programmedBy[pg.language] || cfg.programmedBy['en'] || '') ,'</p>'
    ].join("")
  );

  jQuery("#planner .accordion-toggle").bind("click", function () {
    var toggle = jQuery(this).hasClass("collapsed");
    jQuery("#planner .accordion-toggle")
      .addClass("collapsed")
      .parent()
      .parent()
      .removeClass("active");
    jQuery(this).toggleClass("collapsed", !toggle);
    jQuery(this).parent().parent().toggleClass("active", toggle);
  });

  //console.log("cc", jQuery('.planner-results .option header'));

  jQuery("#planner .results .option header").click(function () {
    jQuery(this).toggleClass("active");
    if (jQuery(this).hasClass("active")) {
      window.location.hash = jQuery(this).attr("data-href");
      jQuery(this).next(".result").slideDown(200);
    } else {
      jQuery(this).next(".result").slideUp(200);
    }
  });

  if (bFinal && results.length == 1) {
    // jeigu yra tik vienas rezultatas - tai ji ir aktyvuojame...
    jQuery("#planner .results .option header").click();
  }

  jQuery("#planner .button-favourite")
    .unbind("click")
    .bind("click", function () {
      var button = jQuery(this);

      if (!button.hasClass("active")) {
        favourites.add({ start: pg.inputStart, finish: pg.inputFinish });
        //favourites.add({ stopIds: pg.inputStop });
        button
          .addClass("active")
          .attr("alt", i18n.btnFavouritesRemove)
          .attr("title", i18n.btnFavouritesRemove);
      } else {
        favourites.remove({ start: pg.inputStart, finish: pg.inputFinish });
        //favourites.remove({ stopIds: pg.inputStop });
        button
          .removeClass("active")
          .attr("alt", i18n.btnFavouritesAdd)
          .attr("title", i18n.btnFavouritesAdd);
      }
      return false;
    });

  jQuery("#planner .stop-toggle")
    .unbind("click")
    .bind("click", function () {
      var toggle = jQuery(this);
      toggle.parent().toggleClass("show-intermediate-stops");
      //console.log("Toggler:", toggle);
    });
};

var appLocalStorage = window.localStorage || {};

var favourites = {
  schedules: {},
  stops: {},
  routes: {},

  labels: { stops: {}, schedules: {}, routes: {} },
  settings: {},

  getRoutes: function () {
    this.load();
    return this.routes;
  },

  getStops: function () {
    this.load();
    return this.stops;
  },

  getSchedules: function () {
    this.load();
    return this.schedules;
  },

  getSettings: function (key) {
    // settings must be loaded
    if (this.settings[key]) {
      var clone = Object.assign({}, this.settings[key]);
      clone.reverse = 1;
      clone.date = 0;
      clone.startTime = -1;
      return clone;
    }
    return 0;
  },

  load: function () {
    var stops = appLocalStorage.favouriteStops; //jQuery.cookie('favouriteStops');
    var schedules = appLocalStorage.favouriteSchedules; //jQuery.cookie('favouriteSchedules');
    var routes = appLocalStorage.favouriteRoutes; //jQuery.cookie('favouriteSchedules');
    this.stops = stops ? jQuery.parseJSON(stops) : {};
    this.schedules = schedules ? jQuery.parseJSON(schedules) : {};
    this.routes = routes ? jQuery.parseJSON(routes) : {};

    var labels = appLocalStorage.favouriteLabels;
    this.labels = labels
      ? jQuery.parseJSON(labels)
      : { stops: {}, schedules: {}, routes: {} };
    //console.log("load: ", stops, schedules, "json: ", this.stops, this.schedules);

    var settings = appLocalStorage.favouriteSettings;
    this.settings = settings ? jQuery.parseJSON(settings) : {};
  },

  save: function () {
    appLocalStorage.favouriteStops = JSON.stringify(this.stops);
    appLocalStorage.favouriteSchedules = JSON.stringify(this.schedules);
    appLocalStorage.favouriteRoutes = JSON.stringify(this.routes);

    appLocalStorage.favouriteLabels = JSON.stringify(this.labels);
    appLocalStorage.favouriteSettings = JSON.stringify(this.settings);

    //jQuery.cookie('favouriteStops', JSON.stringify(this.stops), {expires: 20 * 365});
    //jQuery.cookie('favouriteSchedules', JSON.stringify(this.schedules), {expires: 20 * 365});
    //console.log("save: ", this.stops, this.schedules);
  },

  // {stopIds:a1,a2} or schedule {city:"harju", transport:"bus", num:"1", dirType:"a-b" ,stopId:"a1"}
  // prasmes prenumeruoti konkretu reisa nematau, prenumeruojant tik marsruta (stopId="$")
  add: function (data) {
    //console.log("add data: ", data);
    this.load();

    if (data.stopIds) {
      this.stops[data.stopIds] = jQuery.now();
    } else if (data.start) {
      if (!this.routes[data.start]) this.routes[data.start] = {};
      this.routes[data.start][data.finish] = jQuery.now();

      this.settings[data.start + ";" + data.finish] = pg.getPlannerArgs();
      //console.log("favourites.add", this.settings);

      //console.log("favourites add route", data, this.routes);
    } else {
      this.createScheduleItem(this.schedules, data, jQuery.now());
      /*            
            if(!this.schedules[data.city]) this.schedules[data.city] = {};
            var cities = this.schedules[data.city];
            if(!cities[data.transport]) cities[data.transport] = {};
            var transport = cities[data.transport];
            if(!transport[data.num]) transport[data.num] = {};
            var num = transport[data.num];
            if(!num[data.dirType]) num[data.dirType] = {};
            num[data.dirType][data.stopId] = jQuery.now();
            */
    }

    this.save();
  },

  createScheduleItem: function (schedules_obj, data, value) {
    if (!schedules_obj[data.city]) schedules_obj[data.city] = {};
    var cities = schedules_obj[data.city];
    if (!cities[data.transport]) cities[data.transport] = {};
    var transport = cities[data.transport];
    if (!transport[data.num]) transport[data.num] = {};
    var num = transport[data.num];
    if (!num[data.dirType]) num[data.dirType] = {};
    num[data.dirType][data.stopId] = value; //jQuery.now();
  },

  getScheduleItem: function (schedules_obj, data) {
    if (
      schedules_obj[data.city] &&
      schedules_obj[data.city][data.transport] &&
      schedules_obj[data.city][data.transport][data.num] &&
      schedules_obj[data.city][data.transport][data.num][data.dirType] &&
      schedules_obj[data.city][data.transport][data.num][data.dirType][
        data.stopId
      ]
    ) {
      return schedules_obj[data.city][data.transport][data.num][data.dirType][
        data.stopId
      ];
    }
    return null;
  },

  setTime: function (key, time) {
    var items = key.split(";");
    if (items.length == 1) {
      //this.remove({stopIds:key}); // stopsIds
      var data = { stopIds: key };

      if (data.stopIds in this.stops) {
        this.stops[data.stopIds] = time;
        this.save();
        // atnaujinti jo laika, kas patektu i saraso virsu
      }
    } else if (items.length == 2) {
      var data = { start: items[0], finish: items[1] };

      if (data.start in this.routes && data.finish in this.routes[data.start]) {
        this.routes[data.start][data.finish] = time;
        this.save();
      }
    } else {
      var data = {
        city: items[0],
        transport: items[1],
        num: items[2],
        dirType: items[3],
        stopId: items[4],
      };

      if (this.getScheduleItem(this.schedules, data)) {
        /*
            if (this.schedules[data.city] && 
                this.schedules[data.city][data.transport] &&
                this.schedules[data.city][data.transport][data.num] &&
                this.schedules[data.city][data.transport][data.num][data.dirType] &&
                this.schedules[data.city][data.transport][data.num][data.dirType][data.stopId]) {
            */
        this.schedules[data.city][data.transport][data.num][data.dirType][
          data.stopId
        ] = time;
        this.save();
      }
    }
  },

  belongs: function (data, reload) {
    if (reload) this.load();

    //console.log("data", data, this.stops, this.schedules);

    if (data.stopIds) {
      if (data.stopIds in this.stops) {
        if (reload) {
          this.stops[data.stopIds] = jQuery.now();
          this.save();
        }
        // jeigu pakartotnai lankomes tame favourite - tai reikia atnaujinti jo laika, kas patektu i saraso virsu
        return true;
      }
      return false;
    }

    if (data.start) {
      if (data.start in this.routes && data.finish in this.routes[data.start]) {
        if (reload) {
          this.routes[data.start][data.finish] = jQuery.now();
          this.save();
        }
        return true;
      }
      return false;
    }

    if (this.getScheduleItem(this.schedules, data)) {
      /*
        if (this.schedules[data.city] && 
            this.schedules[data.city][data.transport] &&
            this.schedules[data.city][data.transport][data.num] &&
            this.schedules[data.city][data.transport][data.num][data.dirType] &&
            this.schedules[data.city][data.transport][data.num][data.dirType][data.stopId]) {
        */
      if (reload) {
        this.schedules[data.city][data.transport][data.num][data.dirType][
          data.stopId
        ] = jQuery.now();
        this.save();
      }
      return true;
    }
    return false;
  },

  remove: function (data) {
    this.load();
    //console.log("remove!!", data, this.belongs(data));

    if (data.stopIds) {
      delete this.stops[data.stopIds];
    } else if (data.start && this.belongs(data)) {
      delete this.routes[data.start][data.finish];
      if (jQuery.isEmptyObject(this.routes[data.start]))
        delete this.routes[data.start];

      delete this.settings[data.start + ";" + data.finish];
    } else if (this.belongs(data)) {
      delete this.schedules[data.city][data.transport][data.num][data.dirType][
        data.stopId
      ];
    }

    this.save();
  },

  removeKey: function (key) {
    var items = key.split(";");
    if (items.length == 1) {
      this.remove({ stopIds: key }); // stopsIds
    } else if (items.length == 2) {
      this.remove({ start: items[0], finish: items[1] }); // stopsIds
    } else {
      this.remove({
        city: items[0],
        transport: items[1],
        num: items[2],
        dirType: items[3],
        stopId: items[4],
      });
    }
  },

  getLabel: function (key) {
    var items = key.split(";");
    //console.log("lables", this.labels);
    if (!("stops" in this.labels)) this.labels.stops = {};
    if (!("routes" in this.labels)) this.labels.routes = {};
    if (!("schedules" in this.labels)) this.labels.schedules = {};

    if (items.length == 1 && key in this.labels.stops) {
      // stopsIds
      return this.labels.stops[key];
    } else if (items.length == 2) {
      // routePlanner
      var start = items[0];
      var finish = items[1];

      if (start in this.labels.routes && finish in this.labels.routes[start]) {
        return this.labels.routes[start][finish];
      }
    } else {
      // schedule
      var data = {
        city: items[0],
        transport: items[1],
        num: items[2],
        dirType: items[3],
        stopId: items[4],
      };
      return this.getScheduleItem(this.labels.schedules, data);
    }
    return null;
  },

  changeLabel: function (key, labelName) {
    var items = key.split(";");
    if (items.length == 1) {
      // stopsIds
      this.labels.stops[key] = labelName;
    } else if (items.length == 2) {
      // routePlanner
      var start = items[0];
      var finish = items[1];

      if (!(start in this.labels.routes)) this.labels.routes[start] = {};
      this.labels.routes[start][finish] = labelName;
    } else {
      // schedule
      var data = {
        city: items[0],
        transport: items[1],
        num: items[2],
        dirType: items[3],
        stopId: items[4],
      };
      this.createScheduleItem(this.labels.schedules, data, labelName);
    }
    this.save();
  },
};

var gps = null;
var watchId = null;

function createMyLocation(callback) {
  //console.log("createMyLocation1");

  if (typeof callback == "function" && ti.stops && ti.stops["gps"]) {
    callback(ti.stops["gps"]); // minimize geolocation calling - save battery time
    return;
  }

  //console.log("createMyLocation2");

  if (navigator.geolocation) {
    if (watchId) navigator.geolocation.clearWatch(watchId); // sustabdome, kad keliu nepaleisti...
    //console.log("x");

    watchId = navigator.geolocation.watchPosition(
      function (pos) {
        //console.log("geolocation update", pos);

        geolocationSuccess(
          {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          },
          callback
        );
      },
      function (error) {
        //console.log('Can not determine location!');

        if (!gps && window.lat) {
          gps = { lat: window.lat, lng: window.lng, accuracy: 100 };

          // comment me: debug only ->
          //gps = {lat:59.399237, lng:24.659666, accuracy:100};
          //geolocationSuccess(gps, callback); // comment me: debug only
        }

        switch (error.code) {
          case error.TIMEOUT:
            console.log("Browser geolocation error !\n\nTimeout.");
            if (typeof callback == "function") callback();
            break;
          case error.PERMISSION_DENIED:
            if (error.message.indexOf("Only secure origins are allowed") == 0) {
              console.log("Only secure origins are allowed");
              //tryAPIGeolocation(callback);
            } else {
              console.log("Geolocation permission denied: ", error.message);
            }
            break;
          case error.POSITION_UNAVAILABLE:
            console.log("Browser geolocation error !\n\nPosition unavailable.");
            if (typeof callback == "function") callback();
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }
}

var fixGeolocation = function (location) {
  //if(watchId) navigator.geolocation.clearWatch(watchId); // sustabdome, paieska naudosime nurodyta
  geolocationSuccess(location);
};

var geolocationSuccess = function (location, callback) {
  //location.accuracy = 100;//debug only

  location.lat = window.lat || Math.round(location.lat * 1000000) / 1000000;
  location.lng = window.lng || Math.round(location.lng * 1000000) / 1000000;

  //console.log("geolocationSuccess", location);

  if (pg.hashForMap && pg.hashForMap.indexOf("mylocation") != -1) {
    // ijungtas mylocation, bet vieta dar buvo nenustatyta
    pg.renderMyLocation(jQuery("#divContentRoutes"), location); // uzkrauname zemelapi ir artimiausias stoteles + centruojame
  } else {
    pg.updateMyLocationMarker(location); // atnaujiname tik markeri
  }

  if (!gps || location.accuracy <= 50) {
    // po drag nustatome 50
    //console.log("gps update", location.accuracy);
    gps = location; //{lat:lat, lng:lng};
  } else {
    //console.log("no gps update", location.accuracy);
  }

  //console.log("geolocationSuccess", location, ti.stops, callback);

  if (ti.stops) {
    if (!ti.stops["gps"])
      ti.stops["gps"] = {
        id: "gps",
        neighbours: [],
      };

    ti.stops["gps"].name = i18n.myLocation; // gali buti pakeista kalba...
    ti.stops["gps"].lat = gps.lat;
    ti.stops["gps"].lng = gps.lng;
    ti.stops["gps"].raw_data = ["gps;;", gps.lat, ";", gps.lng, ";;;;;"].join(
      ""
    );

    if (typeof callback == "function") callback(ti.stops["gps"]);
  } else {
    window.setTimeout(function () {
      createMyLocation(callback);
    }, 100);
  }
};

var tryAPIGeolocation = function (callback) {
  //console.log("tryAPIGeolocation");
  jQuery
    .post(
      "https://www.googleapis.com/geolocation/v1/geolocate?key=" +
        cfg.city.googleAPIkey,
      function (success) {
        var location = {
          lat: success.location.lat,
          lng: success.location.lng,
          accuracy: success.accuracy,
        };
        //console.log("tryAPIGeolocation success", success, success.location);
        geolocationSuccess(location, callback);
      }
    )
    .fail(function (err) {
      if (typeof callback == "function") callback();
      //alert("API Geolocation error! \n\n"+err);
    });
};

//window.setTimeout(function() {
//    createMyLocation();
//}, 5000);
//window.setInterval(function() {
//    createMyLocation();
//}, 5000);

jQuery(window).on("resize", function () {
  var mapdiv = jQuery("#divMap");
  var height = mapdiv.height();
  var width = mapdiv.width();

  //console.log("window resize!", height, width);

  var styles = document.getElementById("gmap_print_style");
  if (styles) {
    styles.parentNode.removeChild(styles);
    jQuery("head").append(
      '<style id="gmap_print_style" type="text/css" media="print"> #divMap{  height:' +
        height +
        "px !important; width:" +
        width +
        "px !important;}</style>"
    );
  }
});

pg.fScheduleLoad = function (callback) {
  if (typeof mobile != "undefined" && typeof callback == "undefined") {
    return;
  }

  pg.schedules = null; //no merging of schedules when loading new route
  cfg.city.doNotShowTimetables = cfg.city.doNotShowTimetables || {};

  ($("ulScheduleDirectionsList") || { style: {} }).style.display = "none";

  if (typeof ti.routes !== "object" || typeof ti.stops !== "object") {
    // data is not received yet - delay execution
    setTimeout(function () {
      pg.fScheduleLoad(callback);
    }, 200);
    return;
  }

  // get list of all route directions except tagged with '0' tag
  var dir = null,
    routes;

  if (cfg.city.showAllDirections) {
    //show only one direction for Pskov
    routes = ti.fGetRoutes(
      pg.schedule.city,
      pg.schedule.transport,
      pg.schedule.num,
      pg.schedule.dirType
    );
    $("aDir2").style.display = "none";
    $("aDir1").innerHTML = $("aDir1").innerHTML.replace("\u25BC", "");
  } else {
    //routes = ti.fGetRoutes(pg.schedule.city, pg.schedule.transport, pg.schedule.num, null, '0', null);
    //load all directions because trip can be selected in any direction having times in timetable of main direction
    routes = ti.fGetRoutes(
      pg.schedule.city,
      pg.schedule.transport,
      pg.schedule.num,
      null,
      true,
      null
    );
  }

  if (typeof mobile != "undefined") {
    var data = {
      directions: { 1: [], 2: [] },
      stops: [],
      trip: {},
      streets: [],
    };
  }

  if (!routes.length) {
    if (callback) {
      callback(data); // perduosime tuscia...
    }
    $("divScheduleContentInner").innerHTML = "Error: route not found.";
    return;
  }

  var dirNames = {};
  var dirHtml = { 1: "", 2: "" };

  for (var i = 0; i < routes.length; i++) {
    var route = routes[i];
    var routeName = route.name;

    var className = "";

    if (
      route.routeTag.indexOf("0") >= 0 &&
      pg.schedule.dirType != route.dirType
    ) {
      continue; //do nothing with hidden direction if it is not choosen direction
    }

    if (!dir && pg.schedule.dirType && pg.schedule.dirType == route.dirType) {
      //the requested direction found :)
      dir = route;
      className = "strong";
    }

    if (!dirNames[routeName + route.dirType]) {
      dirNames[routeName + route.dirType] = true;

      var dirEndpoints = route.dirType.split("-");
      var A = dirEndpoints[0];
      var B = dirEndpoints[dirEndpoints.length - 1];

      if (routes.length <= 1 || A === "a" || B === "b") {
        route.dirNum = 1;
      } else if (
        A.charAt(0) !== "b" &&
        B.charAt(0) !== "a" &&
        (A.charAt(0) === "a" || B.charAt(0) === "b")
      ) {
        route.dirNum = 1;
      } else {
        route.dirNum = 2;
        className = "indented" + (className ? " " + className : "");
      }

      var hash = pg.fUrlSet(
        { schedule: { dirType: route.dirType }, hashForMap: "" },
        true
      );
      var hashForMap = pg.fUrlSet(
        { schedule: { dirType: route.dirType }, hashForMap: true },
        true
      );

      dirHtml[route.dirNum] +=
        '<a href="#' +
        hash +
        '"' +
        (className ? ' class="' + className + '"' : "") +
        ">" +
        routeName +
        "</a>";

      if (typeof mobile != "undefined") {
        data.directions[route.dirNum].push({
          hash: hash,
          hashForMap: hashForMap,
          name: routeName,
        });
      }
    }
  }

  ($("ulScheduleDirectionsList") || {}).innerHTML = dirHtml[1] + dirHtml[2];

  if (!dir) {
    // if direction was not found or not requested - take first
    dir = routes[0];
  }

  pg.schedule.dirType = dir.dirType;
  pg.schedule.dirTypes = {};
  pg.schedule.route = dir;

  var dirNum = pg.schedulePane == 2 ? 2 : 1;
  var html = [];

  var stop_interruptions = pg.getRouteNoticesForStops(dir.id, "interruption");

  for (var k = 1; k <= 2; k++) {
    // fill left and right panes
    pg.schedule.dirTypes[dir.dirType] = dirNum;

    ($("spanDir" + dirNum) || {}).innerHTML =
      (dir.num && dir.num.length <= 5
        ? '<span class="num num3 ' +
          dir.transport +
          '" title="' +
          i18n.transport[dir.transport] +
          " " +
          dir.num +
          '">' +
          dir.numHTML +
          "</span>"
        : "") + dir.name;

    //print stops list for primary direction and collect streets of stops
    html = [];
    var street = null,
      streetPos = 0;
    var streets = (dir.streets || "").split(",") || [];

    var explodedTimes,
      times = null,
      w;

    var tripNum =
      pg.schedule.tripNum &&
      k == 1 &&
      !cfg.city.doNotShowTimetables[pg.schedule.transport]
        ? pg.schedule.tripNum
        : 0;

    if (tripNum) {
      explodedTimes =
        typeof dir.times === "string" ? ti.explodeTimes(dir.times) : dir.times;
      w = explodedTimes.workdays.length;
      times = explodedTimes.times;
    }

    var stop_name_duplicated = {}; // mark stops having duplicated names in the direction

    for (i = 0; i < dir.stops.length; i++) {
      if (i < dir.stops.length - 1 && dir.stops[i] == dir.stops[i + 1]) {
        continue;
      }
      var stop = ti.fGetStopDetails(dir.stops[i]);

      stop_name_duplicated[stop.name] = stop.street;
    }

    for (i = 0; i < dir.stops.length; i++) {
      if (i < dir.stops.length - 1 && dir.stops[i] == dir.stops[i + 1]) {
        if (typeof cfg == "object" && cfg.defaultCity != "intercity") {
          continue; // do not show same stop for both arrival and departure except for Kautra
        }
      }

      var stop = ti.fGetStopDetails(dir.stops[i]);

      var hash = pg.fUrlSet(
        {
          schedule: { dirType: dir.dirType, stopId: stop.id, tripNum: tripNum },
          hashForMap: "",
        },
        true
      );
      var hashForMap = pg.fUrlSet(
        {
          schedule: { dirType: dir.dirType, stopId: stop.id, tripNum: tripNum },
          hashForMap: true,
        },
        true
      );

      html.push(
        "<dt>" +
          '<a href="#' +
          hash +
          '" class="hover">' +
          ((stop.info || "").indexOf("wifi") < 0
            ? ""
            : '<img style="margin:-2px 0 0-16px;" src="' +
              pg.imagesFolder +
              'stop_wifi.png" alt="wifi stop" title="' +
              i18n.stopHasWiFi +
              '" />') +
          (stop.name == "Stotis" && /[a-zA-Z]/.test(stop.id.slice(-1))
            ? '<span style="display:inline-block; border-radius:50%; border: 1px solid black; text-align: center; font-size:12px; font-weight:bold; line-height: 13px; background-color:yellow;' +
              'z-index:999; width:12px; height:12px; margin:0 1px 0 -15px;">' +
              stop.id.slice(-1).toUpperCase() +
              "</span>"
            : "") +
          (times
            ? ti.printTime(times[tripNum - 1 + i * w], null, "&#x2007;") +
              "&nbsp;&nbsp;"
            : "") +
          stop.name +
          (stop_name_duplicated[stop.name] == stop.street
            ? ""
            : " (" + stop.street + ")") +
          "</a>"
      );

      stop_name_duplicated[stop.name] = stop.street;

      if (cfg.defaultCity == "latvia" && i < dir.stops.length - 1) {
        html.push(
          '<a class="draw" target="_blank" href="http://www.stops.lt/latviatest/latvia/editor.html#' +
            dir.stops[i] +
            "," +
            dir.stops[i + 1] +
            '">draw</a>'
        );
      }

      if (stop_interruptions[stop.id]) {
        html.push(
          '<span class="travel-planner__problems__item__lines__status small"><span class="fas fa-exclamation-triangle"></span></span>'
        );
      }
      html.push("</dt>");

      if (typeof mobile != "undefined" && k == 1) {
        // surenkame tik kaireje rodomas "primary" stoteles
        var time = times
          ? ti.printTime(times[tripNum - 1 + i * w], null, "&#x2007;")
          : "";
        data.stops.push({
          hash: hash,
          hashForMap: hashForMap,
          id: stop.id,
          name: stop.name,
          time: time,
        });

        data.trip[stop.id] = {
          time: time,
          workdays: explodedTimes ? explodedTimes.workdays[tripNum - 1] : "",
          // previous_trip: tai nera pirmas marsrutas ir pries tai buvusio marsruto darbo dienos sutampa
          previous_trip:
            explodedTimes &&
            tripNum > 1 &&
            explodedTimes.workdays[tripNum - 2] ==
              explodedTimes.workdays[tripNum - 1]
              ? tripNum - 1
              : "",
          // next_trip: tai nera paskutinis marsrutas ir sekancio marsruto darbo dienos sutampa
          next_trip:
            explodedTimes &&
            tripNum < explodedTimes.workdays.length &&
            explodedTimes.workdays[tripNum] ==
              explodedTimes.workdays[tripNum - 1]
              ? tripNum + 1
              : "",
        };
      }

      if (k == 1 && stop.street) {
        //for left pane
        while (streets[streetPos]) {
          ++streetPos; //skip positions already prefilled
        }

        streets[streetPos] = {
          name: stop.street,
          stops: stop.name,
          hash: hash,
        };
        ++streetPos;
      }
    }

    ($("dlDirStops" + dirNum) || {}).innerHTML = html.join("");
    ($("dlDirStops" + dirNum) || { style: {} }).style.display = "";

    //if (k == 1 && cfg.defaultCity == 'latvia') {
    //    ($('aDir1Edit') || {}).href = 'http://www.stops.lt/latviatest/latvia/editor.html#' + dir.stops.join(',');
    //}

    if (k == 2) break;

    for (streetPos = streets.length; --streetPos >= 0; ) {
      street = streets[streetPos];

      if (typeof street == "string") {
        street = streets[streetPos] = { name: street }; // bug fix for: http://localhost/pikasjs/new/riga/mobile.html#trol/1/d1-a
      }

      street.name.replace(/"/g, "&quote;").replace(/\s/, "&nbsp;");

      if (
        streetPos + 1 < streets.length &&
        street.name == streets[streetPos + 1].name
      ) {
        street.stops += ", " + streets[streetPos + 1].stops;
        street.hash = street.hash || streets[streetPos + 1].hash;
        streets[streetPos + 1].name = null; //remove repeating streets
      }
    }

    var streetsHTML = "";

    for (streetPos = 0; streetPos < streets.length; ++streetPos) {
      street = streets[streetPos];

      if (street.name) {
        if (streetsHTML) {
          streetsHTML += ", ";
        } else {
          streetsHTML = i18n.routeStreets + ": ";
        }

        if (street.hash) {
          streetsHTML +=
            '<a href="#' +
            street.hash +
            '" class="hover"' +
            ' title="' +
            i18n.stops +
            ": " +
            street.stops.replace(/"/g, "") +
            '">' +
            street.name +
            "</a>";
        } else {
          streetsHTML += street.name;
        }

        if (typeof mobile != "undefined") {
          data.streets.push(street);
        }
      }
    }

    ($("divScheduleRoute") || {}).innerHTML =
      /*'<a class="icon pointer icon_narrow icon_' + (pg.scheduleDetailsExpanded ? 'collapse' : 'expand') + '" title="' + i18n.showDetails + '"></a>'
        +*/
      '<span class="icon icon_' +
      dir.transport +
      '"></span>' +
      '<span class="num num3 ' +
      dir.transport +
      '">' +
      dir.numHTML +
      "</span>&nbsp;&nbsp; " +
      streetsHTML +
      '<div class="RouteDetails"' +
      (pg.scheduleDetailsExpanded ? "" : ' style="display:none;"') +
      ">" +
      (cfg.defaultCity == "vilnius" ? "" : i18n.operator + ": ") +
      ti.fOperatorDetails(dir.operator, dir.transport) +
      "</div>";

    //$('divScheduleContentTop').setAttribute("data-url", pg.urlLoaded);

    if (routes.length <= 1) break;

    //find the back direction
    dirNum = 3 - dirNum;

    var dirEndpoints = dir.dirType.split("-");
    var A = dirEndpoints[0];
    var B = dirEndpoints[dirEndpoints.length - 1];
    var backType = B + "-" + A;

    var prevNum = dir.dirNum;
    dir = null;

    for (i = 0; i < routes.length; i++) {
      if (!dir || (prevNum == dir.dirNum && prevNum != routes[i].dirNum)) {
        dir = routes[i];
      }
      if (routes[i].dirType === backType) {
        dir = routes[i];
        break;
      }
    }

    if (typeof mobile != "undefined") {
      data.backDir = A != B ? dir : null;
    }

    if (!dir || A == B || cfg.defaultCity == "latvia") {
      // do not create second pane for Latvia)
      ($("aDir2") || { style: {} }).style.display = "none";
      ($("dlDirStops2") || { style: {} }).style.display = "none";
      break;
    }
  }

  if (callback) {
    // mobilioje versijoje atsirado tarpinis puslapis kur nenurodyta kryptis
    callback(data); // pradziai nusiunciame visas imanomas kryptis...
  } else {
    pg.fScheduleStopActivate(); // parenka default krypti ir atidaro pirma stotele
  }

  if (!pg.schedule.tripNum) {
    ($("divScheduleBody") || {}).scrollTop = 0;
  }
};

pg.fScheduleStopActivate = function () {
  var hash = "/" + pg.schedule.dirType + "/" + pg.schedule.stopId + "/";

  var dirNum = pg.schedule.dirTypes[pg.schedule.dirType];
  var $eList;

  for (var k = 1; k <= 2; k++) {
    $eList = $("dlDirStops" + k).getElementsByTagName("a");

    for (var i = 0; i < $eList.length; ++i) {
      var $a = $eList[i];
      var className = ($a.className || "").replace("current", "");

      if (
        k == dirNum &&
        hash &&
        pg.schedule.stopId &&
        ("/" + $a.href + "/").indexOf(hash) >= 0
      ) {
        $a.className =
          className + " current" + ti.fGetDirTag(pg.schedule.dirType);
        hash = "";
      } else if ($a.className.indexOf("current") >= 0) {
        $a.className = className;
      }
    }
  }

  if (hash) {
    // no match for hash was found
    $eList = $("dlDirStops" + (dirNum || 1)).getElementsByTagName("a");

    if ($eList && ($eList[0] || {}).href) {
      //activate first stop in primary direction
      hash = $eList[0].href.split("#")[1];
      pg.fUrlExecute(hash); //using Hash.go( hash ) makes back button unable to return to routes
      return;
    }
  }

  ($("aDir1") || {}).className = ($("divScheduleLeft") || {}).className =
    dirNum == 1 ? "active" : "";
  ($("aDir2") || {}).className = ($("divScheduleRight") || {}).className =
    dirNum == 2 ? "active" : "";

  if (pg.browserVersion >= 8) {
    pg.toggleClass($("divScheduleContentInner"), "Right", dirNum == 2);
  }

  pg.fScheduleLoadTimetable();
};

console.log("Pg from tallinn3.js", pg);
console.log(pg.fScheduleLoad());
