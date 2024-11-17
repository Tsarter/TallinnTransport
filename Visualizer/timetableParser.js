typeof cfg == "undefined" &&
  (cfg = {
    defaultCity: "tallinn",
  });
var ti = {
  stops: 0,
  routes: 0,
  shapes: {},
  distances: {},
  taxi: [],
  specialDates: {},
  specialWeekdays: {},
  asciiStops: {},
  cityTransportRoutes: {},
  FLD_ID: 0,
  FLD_CITY: 1,
  FLD_AREA: 2,
  FLD_STREET: 3,
  FLD_NAME: 4,
  FLD_INFO: 5,
  FLD_LNG: 6,
  FLD_LAT: 7,
  FLD_STOPS: 8,
  FLD_DIRS: 9,
  RT_ROUTEID: 0,
  RT_ORDER: 1,
  RT_ROUTENUM: 2,
  RT_ROUTENUM0: 3,
  RT_AUTHORITY: 4,
  RT_CITY: 5,
  RT_TRANSPORT: 6,
  RT_OPERATOR: 7,
  RT_VALIDITYPERIODS: 8,
  RT_SPECIALDATES: 9,
  RT_ROUTETAG: 10,
  RT_ROUTETYPE: 11,
  RT_COMMERCIAL: 12,
  RT_ROUTENAME: 13,
  RT_WEEKDAYS: 14,
  RT_ENTRY: 15,
  RT_STREETS: 16,
  RT_ROUTESTOPSPLATFORMS: 17,
  RT_ROUTESTOPS: 18,
  accent_map: {
    ą: "a",
    ä: "a",
    ā: "a",
    č: "c",
    ę: "e",
    ė: "e",
    į: "i",
    ų: "u",
    ū: "u",
    ü: "u",
    ž: "z",
    ē: "e",
    ģ: "g",
    ī: "i",
    ķ: "k",
    ļ: "l",
    ņ: "n",
    ö: "o",
    õ: "o",
    š: "s",
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "e",
    ж: "zh",
    з: "z",
    и: "i",
    й: "j",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "x",
    ц: "c",
    ч: "ch",
    ш: "sh",
    щ: "shh",
    ъ: !0,
    ы: "y",
    ь: !0,
    э: "je",
    ю: "ju",
    я: "ja",
    "№": "n",
    "–": "-",
    "—": "-",
    "̶": "-",
    "­": "-",
    "˗": "-",
    "“": !0,
    "”": !0,
    "„": !0,
    "'": !0,
    '"': !0,
  },
  wordSeparators: "–—̶­˗“”„ _-.()'\"",
};
ti.SERVER = typeof window == "object" ? 1 : !0;
if (typeof cfg == "object") {
  (cfg.city = cfg.city || {}), (cfg.city.transport = cfg.city.transport || []);
  for (var i = 0; i < cfg.city.transport.length; i++) {
    var tr = cfg.city.transport[i];
    cfg.transportOrder[tr] = i + 1;
  }
  cfg.defaultCity == "klaipeda"
    ? (ti.transportRoutes = function (a, b) {
        var c = new RegExp("[0-9][eE]"),
          d = a.split("(", 1)[0].trim();
        if (d.substring(0, 1) == "L") return "aquabus";
        if (d && c.test(d)) return "expressbus";
        if (
          b == "nightbus" ||
          ",N1,33,44A,55,66,88,140,170,".indexOf("," + d + ",") >= 0
        )
          return "nightbus";
        if (d == "31" || d == "32" || d.substring(0, 1).toLowerCase() == "m")
          return "minibus";
        return b;
      })
    : cfg.defaultCity == "kaunas"
    ? ((cfg.transportOrder.expressbus = cfg.transportOrder.bus),
      (ti.transportRoutes = function (a, b) {
        var c = a.split("(", 1)[0].trim();
        if (c && c.slice(-1).toLowerCase() == "g") return "expressbus";
        return b;
      }))
    : cfg.defaultCity == "tallinna-linn"
    ? (ti.transportRoutes = function (a, b) {
        var c = parseInt(a.split("(", 1)[0].trim());
        if (c >= 90 && c <= 99) return "nightbus";
        return b;
      })
    : cfg.defaultCity == "riga"
    ? (ti.transportRoutes = function (a, b) {
        var c = /3[0-9][0-9]/;
        if (a && c.test(a)) return "expressbus";
        return b;
      })
    : cfg.defaultCity == "liepaja" &&
      (ti.transportRoutes = function (a, b) {
        var c = a.split("(", 1)[0].trim();
        if (",22,22S,23,25,".indexOf("," + c + ",") >= 0) return "minibus";
        return b;
      });
}
typeof window == "object" &&
  typeof console == "undefined" &&
  (window.console = {
    log: function () {},
  }),
  (String.prototype.trim = function () {
    return this.replace(/^\s\s*/, "").replace(/\s\s*$/, "");
  }),
  (ti.dateToMinutes = function (a, b) {
    var c = +a / 6e4;
    b || (c = Math.floor(c)), (c -= a.getTimezoneOffset());
    return c;
  }),
  (ti.dateToDays = function (a) {
    return Math.floor(ti.dateToMinutes(a) / 1440);
  }),
  (ti.printTime = function (a, b, c) {
    if (a < 0) return "";
    !b && b !== "" && (b = ":");
    var d = ~~a,
      e = ~~(d / 60);
    c == "duration"
      ? (c = "")
      : typeof cfg == "object" && cfg.defaultCity != "intercity" && (e %= 24),
      (d = d % 60);
    return (c && e < 10 ? c : "") + e + b + (d < 10 ? "0" : "") + d;
  }),
  (ti.printTimeWithSeconds = function (a, b, c) {
    if (a < 0) return "";
    !b && b !== "" && (b = ":");
    var d = ~~a,
      e = ~~(d / 60),
      f = ~~(e / 60);
    c == "duration"
      ? (c = "")
      : typeof cfg == "object" && cfg.defaultCity != "intercity" && (f %= 24),
      (e = e % 60),
      (d = d % 60);
    return (
      (c && f < 10 ? c : "") +
      f +
      b +
      (e < 10 ? "0" : "") +
      e +
      b +
      (d < 10 ? "0" : "") +
      d
    );
  }),
  (ti.toMinutes = function (a) {
    if (typeof a != "string") return 0;
    var b = a.trim(),
      c = b.length,
      d;
    if (b.indexOf(":") < 0) {
      d = parseInt(b.substr(c - 2, 2), 10);
      return c > 2 ? d + parseInt(b.substr(0, c - 2), 10) * 60 : d * 60;
    }
    var e = a.split(":");
    (d = parseInt(e[0], 10) * 60 + parseInt(e[1], 10)),
      e[2] && parseInt(e[2], 10) >= 30 && ++d;
    return d;
  }),
  (ti.fDownloadUrl = function (a, b, c, d) {
    if (a && b && c) {
      if (ti.SERVER === !0) {
        http
          .get(b, function (a) {
            a.setEncoding("utf8");
            var b = "";
            a.on("data", function (a) {
              b += a;
            }),
              a.on("end", function () {
                c(b);
              }),
              a.on("error", function () {});
          })
          .on("error", function (a) {});
        return;
      }
      var e;
      if (
        !window.XMLHttpRequest ||
        (window.location.protocol === "file:" && window.ActiveXObject)
      ) {
        try {
          e = new ActiveXObject("MSXML2.XMLHTTP.6.0");
        } catch (f) {}
        if (!e)
          try {
            e = new ActiveXObject("MSXML2.XMLHTTP");
          } catch (f) {}
        if (!e)
          try {
            e = new ActiveXObject("Microsoft.XMLHTTP");
          } catch (f) {}
      } else
        (e = new XMLHttpRequest()),
          (d || b.indexOf("http") == 0) &&
            !("withCredentials" in e) &&
            typeof XDomainRequest != "undefined" &&
            ((e = new XDomainRequest()),
            e.open(a, b),
            (e.onload = function () {
              c(e.responseText);
            }));
      e.open(a, b, !0);
      if (
        b.indexOf("gpsdata.ashx") >= 0 &&
        (cfg || {}).defaultCity != "vilnius"
      )
        try {
          e.setRequestHeader("Origin-Custom", "saraksti.lv");
        } catch (g) {}
      e.onreadystatechange = function () {
        if (e.readyState == 4)
          if (e.status == 200 || e.status == 0)
            typeof e.responseText == "string"
              ? c(e.responseText)
              : typeof e.responseXML == "string"
              ? c(e.responseXML)
              : c(e.responseText);
      };
      try {
        e.send(null);
      } catch (g) {}
    }
  }),
  (ti.toAscii = function (a, b, c) {
    var d = (a || "").toLowerCase(),
      e = d.split(""),
      f,
      g = ti.accent_map;
    for (var h = e.length; --h >= 0; )
      c && e[h] == "ž"
        ? ((e[h] = "zh"), (d = !1))
        : (f = g[e[h]])
        ? ((e[h] = f === !0 ? "" : f), (d = !1))
        : b === !0 && e[h] === " " && ((e[h] = ""), (d = !1));
    b === 2 &&
      (d = e.join("").trim().replace(/\s+-/g, "-").replace(/-\s+/g, "-"));
    return d || e.join("");
  }),
  (ti.cloneObject = function (a) {
    var b = a instanceof Array ? [] : {};
    for (var c in a)
      a[c] && typeof a[c] == "object" ? (b[c] = a[c].clone()) : (b[c] = a[c]);
    return b;
  }),
  (ti.naturalSort = function (a, b) {
    var c = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi,
      d = /(^[ ]*|[ ]*$)/g,
      e =
        /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
      f = /^0x[0-9a-f]+$/i,
      g = /^0/,
      h = a.toString().replace(d, "") || "",
      i = b.toString().replace(d, "") || "",
      j = h
        .replace(c, "\u0000$1\u0000")
        .replace(/\0$/, "")
        .replace(/^\0/, "")
        .split("\u0000"),
      k = i
        .replace(c, "\u0000$1\u0000")
        .replace(/\0$/, "")
        .replace(/^\0/, "")
        .split("\u0000"),
      l =
        parseInt(h.match(f)) || (j.length != 1 && h.match(e) && Date.parse(h)),
      m = parseInt(i.match(f)) || (l && i.match(e) && Date.parse(i)) || null;
    if (m) {
      if (l < m) return -1;
      if (l > m) return 1;
    }
    for (var n = 0, o = Math.max(j.length, k.length); n < o; n++) {
      (oFxNcL = (!(j[n] || "").match(g) && parseFloat(j[n])) || j[n] || 0),
        (oFyNcL = (!(k[n] || "").match(g) && parseFloat(k[n])) || k[n] || 0);
      if (isNaN(oFxNcL) !== isNaN(oFyNcL)) return isNaN(oFxNcL) ? 1 : -1;
      typeof oFxNcL !== typeof oFyNcL && ((oFxNcL += ""), (oFyNcL += ""));
      if (oFxNcL < oFyNcL) return -1;
      if (oFxNcL > oFyNcL) return 1;
    }
    return 0;
  }),
  (ti.loadData = function () {
    debugger;
    if (typeof cfg === "object" && cfg.city && cfg.city.datadir) {
      var a = new Date();
      location.pathname.indexOf("test.html") < 0
        ? (a = a.setHours(a.getHours(), 0, 0, 0))
        : ((a = a.getTime()),
          (cfg.city.datadir || "").indexOf("test") < 0 &&
            (cfg.city.datadir = "test")),
        cfg.city.urlMissingTrips &&
          setInterval(
            (function b() {
              (a = new Date()),
                (a = a.getTime()),
                ti.fDownloadUrl(
                  "GET",
                  cfg.city.urlMissingTrips + "?" + a,
                  function (a) {
                    ti.missing_trips = "\n" + a + "\n";
                  }
                );
              return b;
            })(),
            6e4
          ),
        cfg.city.datadir.indexOf(".php") < 0
          ? cfg.city.datadir.indexOf(".ashx") < 0
            ? (ti.fDownloadUrl(
                "get",
                cfg.city.datadir + "/routes.txt?" + a,
                ti.loadRoutes
              ),
              ti.fDownloadUrl(
                "get",
                cfg.city.datadir + "/stops.txt?" + a,
                ti.loadStops
              ))
            : (ti.fDownloadUrl(
                "get",
                cfg.city.datadir + "routes&timestamp=" + a,
                ti.loadRoutes,
                !0
              ),
              ti.fDownloadUrl(
                "get",
                cfg.city.datadir + "stops&timestamp=" + a,
                ti.loadStops,
                !0
              ))
          : (ti.fDownloadUrl(
              "get",
              cfg.city.datadir + "routes.txt&timestamp=" + a,
              ti.loadRoutes,
              !0
            ),
            ti.fDownloadUrl(
              "get",
              cfg.city.datadir + "stops.txt&timestamp=" + a,
              ti.loadStops,
              !0
            ));
    } else
      ti.fDownloadUrl("get", "routes.txt", ti.loadRoutes),
        ti.fDownloadUrl("get", "stops.txt", ti.loadStops);
    cfg.defaultCity === "latvia" &&
      ti.fDownloadUrl("get", "taxi.txt", ti.loadTaxi);
  }),
  (ti.loadStops = function (a, b) {
    a = a.split(b || "\n");
    var c = "",
      d = "",
      e = "",
      f = "",
      g = "",
      h = "",
      i = "",
      j = "",
      k = {},
      l = {},
      m = [],
      n = a.length,
      o = a[0].toUpperCase().split(";"),
      p = {};
    for (var q = o.length; --q >= 0; ) p[o[q]] = q;
    p.ID = 0;
    for (var q = 1; q < n; q++)
      if (a[q].length > 1) {
        var r = a[q].split(";"),
          s = r[p.CITY];
        s && (d = s === "0" ? "" : s.trim());
        var t = c + ti.toAscii(r[p.ID], !0, !0),
          u = r[p.SIRIID],
          v = ti.toAscii(r[p.STOPS] || "", !0, !0);
        c && (v = c + v.replace(/,/g, "," + c));
        if ((s = r[p.AREA])) e = s === "0" ? "" : s.trim();
        if ((s = r[p.STREET])) f = s === "0" ? "" : s.trim();
        if ((s = r[p.NAME])) {
          (g = s === "0" ? "" : s), (i = ti.toAscii(s));
          var w = l[i];
          l[i] = w ? w + "," + t : t;
        } else l[i] += "," + t;
        if ((s = r[p.INFO]))
          (j = s === "0" ? "" : s), (j = j.replace("wifi", ""));
        var x = {
          id: t,
          siriID: u,
          lat: +r[p.LAT] / 1e5,
          lng: +r[p.LNG] / 1e5,
          name: g,
          city: d,
          area: e,
          street: f,
          info: j,
          towards: p.DIRECTION ? r[p.DIRECTION] : "",
          raw_data: [t, d, e, f, g, j, r[p.LNG], r[p.LAT], v].join(";"),
        };
        ti.SERVER && ((x.routes = []), (x.neighbours = v ? v.split(",") : [])),
          (k[t] = x),
          m.push(x),
          h && ((g = h), (h = "")),
          t.charAt(0) != "a" &&
            g.indexOf("Oro uostas") >= 0 &&
            cfg.defaultCity == "vilnius" &&
            ((r[p.STOPS] = t),
            (r[p.ID] = "a" + t),
            (h = g),
            (r[p.NAME] = g.replace("Oro uostas", "Vilnius airport (VNO)")),
            (a[q] = r.join(";")),
            q--);
      }
    (ti.stops = null),
      (ti.stops = k),
      (ti.asciiStops = l),
      m.sort(function (a, b) {
        return a.lat < b.lat ? -1 : a.lat > b.lat ? 1 : 0;
      });
    for (q = m.length; --q > 0; )
      if (m[q].city === "kautra") {
        var y = m[q].lat;
        for (var z = q - 1; --z >= 0; ) {
          var A = y - m[z].lat;
          if (A > 0.015) break;
          var B = m[q].lng - m[z].lng;
          B > -0.015 &&
            B < 0.015 &&
            (m[q].neighbours.push(m[z].id), m[z].neighbours.push(m[q].id));
        }
      }
    typeof ti.routes == "string" &&
      (ti.SERVER === !0
        ? ti.loadRoutes(ti.routes)
        : window.setTimeout(function () {
            ti.loadRoutes(ti.routes);
          }, 10));
  }),
  (ti.loadRoutes = function (a, b) {
    if (typeof ti.stops !== "object") ti.routes = a;
    else {
      if (cfg.city.urlMissingTrips && typeof ti.missing_trips != "string") {
        (ti.routes = a),
          (ti.missing_trips = ""),
          window.setTimeout(function () {
            ti.loadRoutes(ti.routes);
          }, 500);
        return;
      }
      a = a.split(b || "\n");
      var c = [],
        d = ti.stops,
        e = {},
        f = "",
        g = "",
        h = "",
        i = "",
        j = "",
        k = "",
        l = "",
        m = "",
        n = "",
        o = "",
        p = "",
        q = "",
        r = 0,
        s = a[0].toUpperCase().split(";"),
        t = {};
      for (var u = s.length; --u >= 0; ) t[s[u]] = u;
      (t.ROUTENUM = 0),
        t.TRIPIDS && (ti.has_trips_ids = !0),
        t.ROUTESTOPSPLATFORMS || (t.ROUTESTOPSPLATFORMS = -1);
      var v = -1,
        w = a.length;
      for (var u = 1; u < w; u++)
        if (a[u].charAt(0) === "#") {
          var x = a[u].split("#"),
            y = null,
            z = null,
            A = new Date();
          x[1] !== "" && (y = new Date(x[1])),
            x[2] !== "" && (z = new Date(x[2]));
          if ((!y || y <= A) && (!z || z >= A)) {
            var B = {
              comment: x[3],
            };
            x[4] && (B.departures = x[4]),
              x[5] && (B.weekdays = x[5]),
              x[6] && (B.directions = x[6]);
            var C = c[v];
            C.comments ? C.comments.push(B) : (C.comments = [B]);
          }
        } else if (a[u].length > 1) {
          var x = a[u].split(";"),
            D;
          if ((D = x[t.AUTHORITY])) h = D === "0" ? "" : D;
          if (h === "SpecialDates") {
            if (ti.routes) continue;
            var E = {},
              F = x[t.VALIDITYPERIODS].split(","),
              G = 0,
              H = 0,
              I = x[t.ROUTENUM] == "";
            for (var J = -1, K = F.length; ++J < K; )
              F[J] && (G = +F[J]),
                (H += G),
                I ? (ti.specialWeekdays[H] = +x[t.WEEKDAYS]) : (E[H] = !0);
            I || (ti.specialDates[x[t.ROUTENUM]] = E);
            continue;
          }
          ++r;
          if ((D = x[t.ROUTENUM])) f !== D && (r = 1), (f = D === "-" ? "" : D);
          if ((D = x[t.ROUTENAME]))
            (g = D),
              typeof pg == "object" &&
                pg.language == "en" &&
                (g = g
                  .replace("Oro uostas", "Airport")
                  .replace("Centras", "Centre")
                  .replace("Stotis", "Train Station")
                  .replace("Europos aikštė", "Europa Square"));
          if ((D = x[t.CITY]))
            (i = D === "0" ? "" : D), (l = i + "_" + k), (r = 1);
          if ((D = x[t.TRANSPORT]))
            (k = D === "0" ? "" : D), (l = i + "_" + k), (r = 1);
          if ((D = x[t.OPERATOR])) m = D === "0" ? "" : D;
          var L = k,
            M = (num00 = f),
            N = m;
          typeof cfg === "object" &&
            cfg.defaultCity == "vilnius" &&
            (f.search(/1[5-9][0-9]/) < 0 || k != "bus"
              ? f.match(/SU(.)MEN/i)
                ? (L = "eventbus")
                : f.search("traukinuk") < 0
                ? f == "99" && ((L = "autonomous"), (N = ""))
                : (L = "festal")
              : (L = "commercialbus"),
            (l = i + "_" + L)),
            typeof cfg === "object" &&
              cfg.defaultCity == "riga" &&
              f.search(/[3-9][0-9][0-9]/) >= 0 &&
              ((L = "expressbus"), (l = i + "_" + L)),
            k == "ferry" && f.substring(0, 1) != "L" && (M = g),
            typeof ti.transportRoutes == "function" &&
              ((L = ti.transportRoutes(f, k)), (l = i + "_" + L)),
            l && ((ti.cityTransportRoutes[i + "_" + L] = !0), (l = ""));
          if ((D = x[t.VALIDITYPERIODS])) n = D === "0" ? "" : D;
          if ((D = x[t.SPECIALDATES])) o = D === "0" ? "" : D;
          if ((D = x[t.WEEKDAYS])) p = D === "0" ? "" : D;
          q = t.STREETS ? x[t.STREETS] : "";
          if (f.indexOf("разв") >= 0) {
            ++u;
            continue;
          }
          ++v;
          var O = ti.toAscii(x[t.ROUTESTOPS], !0, !0).split(","),
            P = !1;
          for (var Q = 0, R = O.length; Q < R; ++Q) {
            var S = O[Q];
            S.charAt(0) === "e"
              ? (P || (P = new Array(Q + 1).join("0").split("")),
                (P[Q] = "1"),
                (S = S.substring(1)),
                (O[Q] = S))
              : S.charAt(0) === "x"
              ? (P || (P = new Array(Q + 1).join("0").split("")),
                (P[Q] = "2"),
                (S = S.substring(1)),
                (O[Q] = S))
              : P && (P[Q] = "0"),
              j && (S = O[Q] = j + S);
            var T = d[S];
            T
              ? ((e[S] = !0),
                (T.raw_data += ";" + v + ";" + Q),
                (!0 || ti.SERVER) && T.routes.push(v, Q))
              : (O.splice(Q, 1), --R, --Q);
          }
          var U = [
            v,
            r,
            M,
            num00,
            h,
            i,
            L,
            N,
            n,
            o,
            x[t.ROUTETAG],
            ti.toAscii(x[t.ROUTETYPE]),
            x[t.COMMERCIAL],
            g,
            p,
            (P && P.join("")) || "",
            q,
            x[t.ROUTESTOPSPLATFORMS] || "",
            O.join(";"),
          ].join(";");
          ++u,
            ti.SERVER === !0
              ? (c[v] = {
                  id: v,
                  authority: h,
                  city: i,
                  transport: L,
                  num: M,
                  num0: num00,
                  name: g,
                  stops: O,
                  platforms: x[t.ROUTESTOPSPLATFORMS] || "",
                  entry: (P && P.join("")) || "",
                  specialDates: o.split(",") || [],
                  times: a[u],
                  raw_data: U,
                })
              : ((c[v] = {
                  id: v,
                  times: a[u],
                  operator: N,
                  raw_data: U,
                }),
                L == "nightbus" &&
                  typeof cfg === "object" &&
                  cfg.defaultCity == "tallinna-linn" &&
                  (c[v].times = ti.explodeTimes(a[u], "nightbus")),
                g.indexOf("Minsk") == 0 && (c[v].minsk = !0));
        }
      (ti.routes = null), (ti.routes = c);
      if (
        typeof cfg === "object" &&
        cfg.defaultCity !== "cherepovets" &&
        cfg.defaultCity !== "mariupol" &&
        cfg.defaultCity !== "kharkiv" &&
        cfg.defaultCity !== "helsinki" &&
        cfg.defaultCity !== "pppskov" &&
        cfg.defaultCity !== "kautra" &&
        cfg.defaultCity !== "utena"
      )
        for (var S in d)
          !e[S] && S.charAt(0) != "a" && S.charAt(0) != "b" && (d[S].name = "");
      if (typeof cfg === "object" && cfg.defaultCity == "latvia")
        for (var S in d) d[S].city = ti.toAscii(d[S].city);
      typeof window === "object" &&
        typeof pg === "object" &&
        (pg.fCreateNavigation(),
        pg.fTabActivate(),
        typeof pg.renderSchedule == "function" && pg.renderSchedule());
    }
  }),
  (ti.fCreateGeocoder = function () {
    return;
  }),
  (ti.loadTaxi = function (a, b) {
    (ti.taxi = []), (a = a.split(b || "\n"));
    var c = a.length,
      d = a[0].toUpperCase().split(";"),
      e = {};
    for (var f = d.length; --f >= 0; ) e[d[f]] = f;
    for (var f = 1; f < c; f++)
      if (a[f].length > 1) {
        var g = a[f].split(";"),
          h = {
            name: g[e.NAME],
            lat: parseFloat(g[e.LAT].replace(",", ".")),
            lng: parseFloat(g[e.LNG].replace(",", ".")),
            radius: parseInt(g[e.RADIUS]),
            phone: g[e.PHONE],
          };
        (h.radius *= h.radius), ti.taxi.push(h);
      }
  }),
  (ti.fGetBlocksOfRoute = function (a, b, c, d) {
    var e = [],
      f = {},
      g = ti.fGetRoutes(a, b, c, null, !0, null) || [],
      h = (d || "1").charAt(0);
    for (var i = 0; i < g.length; i++) {
      var j = g[i],
        k = typeof j.times === "string" ? ti.explodeTimes(j.times) : j.times,
        l = k.workdays.length;
      for (var m = 0; m < l; m++) {
        if (k.workdays[m].indexOf(h) < 0) continue;
        var n = k.trip_codes[m].split("-").pop();
        f[n] || ((f[n] = !0), e.push(n));
      }
    }
    e.sort();
    return e;
  }),
  (ti.fGetTripsOfRouteBlock = function (a, b, c, d, e) {
    var f = [],
      g = ti.fGetRoutes(a, b, "all", null, !0, null),
      h = (d || "1").charAt(0),
      e = c + "-" + e;
    for (var i = 0; i < g.length; i++) {
      var j = g[i];
      if ((j.stops || []).length <= 0) continue;
      var k = typeof j.times === "string" ? ti.explodeTimes(j.times) : j.times,
        l = k.workdays.length;
      for (var m = 0; m < l; m++) {
        if (k.workdays[m].indexOf(h) < 0) continue;
        var n = k.trip_codes[m];
        if (n == e) {
          var o = [];
          for (var p = 0, q = m; q < k.times.length; p++, q += l) {
            var r = k.times[q];
            if (r != -1 && p < j.stops.length) {
              var s = ti.stops[j.stops[p]] || {
                name: "unknown",
              };
              o.push({
                trip_stop: s,
                time: r,
              });
            }
          }
          f.push({
            route_num: j.num,
            dir_type: j.dirType,
            direction_name: j.name,
            start_time: o[0].time,
            finish_time: o[o.length - 1].time,
            stops: o,
          });
        }
      }
    }
    f.sort(function (a, b) {
      return a.start_time - b.start_time;
    });
    return f;
  }),
  (ti.fGetStopsByName = function (a, b, c) {
    if (typeof ti.stops !== "object") return [];
    (a || "").charAt(0) == "!" && ((c = !0), (a = a.substring(1)));
    var d = ti.toAscii(a);
    if (!d) return [];
    var e = d.replace(/\W/g, ""),
      f = a.toLowerCase().replace(/\W/g, ""),
      g = [],
      h = {},
      i = ti.wordSeparators,
      j = ti.asciiStops,
      k = ti.routes,
      l = ti.stops[a];
    l &&
      typeof cfg == "object" &&
      cfg.defaultCity == "krasnodar" &&
      g.push(ti.cloneObject(ti.stops[a]));
    var k = ti.routes;
    for (var m in j) {
      var n = -1;
      for (;;) {
        n = m.indexOf(d, n + 1);
        if (n < 0) break;
        if (n === 0 || i.indexOf(m.charAt(n - 1)) >= 0) {
          var o = j[m].split(",");
          for (var p = o.length; --p >= 0; ) {
            var l = ti.fGetStopDetails(o[p]);
            if (
              l.name &&
              (f === e ||
                l.name.toLowerCase().replace(/\W/g, "").indexOf(f) >= 0)
            ) {
              if (!c && cfg.defaultCity == "intercity") {
                var q = [o[p]];
                q[0].charAt(0) == "a" &&
                  (q = (l.neighbours || "").split(",") || []);
                for (var r = 0; r < q.length; r++) {
                  var s = (ti.stops[q[r]] || {}).routes || [];
                  for (var t = 0, u = s.length; t < u; t += 2) {
                    var v = k[s[t]];
                    typeof v.times === "string" &&
                      (v.times = ti.explodeTimes(v.times));
                    var w = v.times;
                    if (!w) continue;
                    var x = w.valid_from || [],
                      y = x.length;
                    for (var z = 0; z < y; ++z) if (x[z] < 4e4) break;
                    if (z < y) {
                      t = 999999;
                      break;
                    }
                  }
                }
                if (t < 999999) continue;
              }
              (l.indexOf = n),
                (l.name2 = l.name.replace(
                  /[^0-9a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\u0400-\u04FF]/g,
                  ""
                )),
                (l.streets = (l.street != "-" ? l.street : "") || l.area),
                (l.clusterStop = l),
                (h[l.name2] || (h[l.name2] = [])).push(l);
            }
          }
        }
      }
    }
    for (var A in h) {
      var q = h[A],
        B = 0;
      for (var C = 2; C <= 2; C++)
        for (var p = B; p < q.length; p++) {
          var D = q[p];
          if (D.id) {
            var E;
            do {
              E = !1;
              for (var r = B; r < q.length; r++) {
                if (p == r) continue;
                var F = q[r];
                if (C == 1 && F.id) continue;
                if (C == 2 && !F.id) continue;
                var G = 0;
                typeof cfg == "object" && cfg.defaultCity == "intercity"
                  ? D.area != F.area && (D.area || F.area) && (G = 999999)
                  : (G = ti.distance(D.lat, D.lng, F.lat, F.lng));
                if (G <= 200) {
                  E = !0;
                  var l = C == 1 ? F.clusterStop : D.clusterStop,
                    H = C == 1 ? D : F;
                  (l.id += "," + H.id),
                    (H.id = ""),
                    (H.clusterStop = l),
                    H.street &&
                      (", " + l.streets + ",").indexOf(", " + H.street + ",") <
                        0 &&
                      (l.streets =
                        (l.streets ? l.streets + ", " : "") + H.street);
                }
              }
            } while (C == 2 && E);
          }
          if (C == 2) {
            C = 0;
            while (++B < q.length) if (q[B].id) break;
            break;
          }
        }
      for (var p = 0; p < q.length; p++)
        q[p].id &&
          (typeof mobile != "undefined" &&
            (q[p].transfers = ti.fGetRoutesAtStop(q[p].id)),
          g.push(q[p]));
    }
    g.sort(function (a, b) {
      if (typeof cfg == "object" && cfg.defaultCity == "intercity") {
        if (a.info && !b.info) return -1;
        if (!a.info && b.info) return 1;
        var c = /[a-zA-Z]/g;
        if (c.test(a.name)) {
          if (!c.test(b.name)) return -1;
        } else if (c.test(b.name)) return 1;
      }
      if (a.id.charAt(0) === "a" && b.id.charAt(0) !== "a") return -1;
      if (b.id.charAt(0) === "a" && a.id.charAt(0) !== "a") return 1;
      if (typeof pg == "object") {
        if (a.city === pg.city && b.city !== pg.city) return -1;
        if (a.city !== pg.city && b.city === pg.city) return 1;
      }
      if (a.indexOf === 0 && b.indexOf !== 0) return -1;
      if (b.indexOf === 0 && a.indexOf !== 0) return 1;
      if (a.name < b.name) return -1;
      if (b.name < a.name) return 1;
      if (a.area < b.area) return -1;
      if (b.area < a.area) return 1;
      if (a.streets < b.streets) return -1;
      if (b.streets < a.streets) return 1;
      return 0;
    });
    return g;
  }),
  (ti.fGetAnyStopDetails = function (a, b) {
    if (!a) {
      if (b) {
        b({});
        return;
      }
      return {};
    }
    if (typeof ti.stops !== "object") {
      if (b) {
        setTimeout(function () {
          ti.fGetAnyStopDetails(a, b);
        }, 200);
        return;
      }
      return {};
    }
    var c = typeof a == "string" ? a.split(",") : a,
      d,
      e,
      f,
      g;
    e = f = g = 0;
    for (var h = 0; h < c.length; ++h) {
      var i = ti.fGetStopDetails(c[h]);
      !d && i.id && (d = i),
        i && i.lat && i.lng && ((e += i.lat), (f += i.lng), ++g);
    }
    g && ((d.latAvg = e / g), (d.lngAvg = f / g));
    if (b) b(d || {});
    else return d || {};
  }),
  (ti.fGetStopDetails = function (a) {
    if (typeof ti.stops !== "object" || !a) return {};
    var b = ti.stops[a],
      c;
    if (!b) {
      var d = a.indexOf(";");
      if (d > 0) {
        c = {
          id: a,
          name:
            (typeof pg == "object" && a == pg.myLocation && i18n.myLocation) ||
            (typeof mobile != "undefined" &&
              mobile.geocoder &&
              mobile.geocoder.index[a]) ||
            (typeof pg == "object" && pg.geocoder2 && pg.geocoder2.index[a]) ||
            (typeof pg == "object" && pg.geocoder && pg.geocoder.index[a]) ||
            (typeof i18n == "object" ? i18n.mapPoint : "Point on map"),
          neighbours: "",
          lat: parseFloat(a.substr(0, d)),
          lng: parseFloat(a.substr(d + 1)),
          raw_data: "",
        };
        return c;
      }
      return {};
    }
    var e = b.raw_data.split(";");
    c = {
      id: e[ti.FLD_ID],
      city: e[ti.FLD_CITY],
      area: e[ti.FLD_AREA],
      street: e[ti.FLD_STREET],
      name: b.name,
      info: e[ti.FLD_INFO],
      towards: b.towards,
      neighbours: e[ti.FLD_STOPS],
      lng: ti.stops[a].lng,
      lat: ti.stops[a].lat,
      raw_data: b.raw_data,
    };
    return c;
  }),
  (ti.fGetTransfersAtStop = function (a, b, c) {
    var d = ti.stops,
      e = [a],
      f = parseInt(a, 10);
    if (
      f &&
      "" + f !== "" + a &&
      cfg.defaultCity !== "druskininkai" &&
      cfg.defaultCity !== "riga"
    )
      for (var g in d) f == parseInt(g, 10) && e.push(g);
    return ti.fGetRoutesAtStop(e, !1, b, c);
  }),
  (ti.fGetRoutesAtStop = function (a, b, c, d) {
    var e = (d && d.dirType) || "-",
      f = (d && d.id) || null,
      g = [],
      h = typeof a == "string" ? a.split(",") : a,
      i = e.split("-"),
      j = i[0],
      k = i[i.length - 1],
      l = j.charAt(0),
      m = k.charAt(0);
    for (var n = h.length; --n >= 0; ) {
      var o = (
          ti.stops[h[n]] || {
            raw_data: "",
          }
        ).raw_data.split(";"),
        p = o.length;
      for (var q = ti.FLD_DIRS; q < p; q += 2) {
        var r = ti.fGetRoutes(o[q]);
        if (r.id !== f)
          if (cfg.defaultCity == "riga" && r.dirType.indexOf("d") >= 0)
            continue;
        var s = +o[q + 1] < r.stops.length - 1;
        (s || c) &&
          (b || !r.routeTag || r.id === f) &&
          ((r.stopId = h[n]),
          e &&
          r.dirType.indexOf(e) < 0 &&
          e.indexOf(r.dirType) < 0 &&
          r.dirType.indexOf("-d") < 0 &&
          j !== k &&
          (r.dirType.indexOf(k) == 0 ||
            r.dirType.indexOf(j) == r.dirType.length - 1 ||
            (r.dirType.indexOf("-" + m) < 0 &&
              r.dirType.indexOf(j + "-") < 0 &&
              r.dirType.indexOf(l + "-") < 0 &&
              (r.dirType.indexOf("c") < 0 ||
                r.dirType.indexOf("c") >= r.dirType.length - 2)))
            ? (r.sortKey = "1")
            : (r.sortKey = "0"),
          (r.sortKey = [
            cfg.transportOrder[r.transport] || "Z",
            ("000000" + (parseInt(r.num, 10) || 0)).slice(-6),
            r.num.substr(0, 1),
            ("000000" + Math.abs(parseInt(r.num.substr(1), 10) || 0)).slice(-6),
            (r.num + "00000000000000000000").substr(0, 20),
            n === 0 ? "0" : "1",
            s ? "0" : "1",
            r.sortKey,
            ("000000" + r.order).slice(-6),
          ].join("")),
          g.push(r));
      }
    }
    g.sort(function (a, b) {
      if (a.sortKey < b.sortKey) return -1;
      if (a.sortKey > b.sortKey) return 1;
      return 0;
    });
    return g;
  }),
  (ti.fGetRoutes = function (a, b, c, d, e, f) {
    var g = [],
      h = {},
      i = -1,
      j = 0,
      k,
      l,
      m,
      n,
      o = ti.wordSeparators;
    if (f) {
      f = ti.toAscii("" + f, 2);
      if (f.slice(0, 3) == "airp" || f.slice(0, 4) == "ajero") f = "oro uostas";
    }
    a === 0 || (a && !isNaN(a))
      ? (l = ti.routes[+a])
      : a && typeof a == "object"
      ? (l = a)
      : ((k = ti.routes),
        (i = 0),
        (j = k.length),
        (m = c && ti.toAscii(c, !0)),
        (a = "," + a + ","));
    if (ti.SERVER === !0 && i == -1) return l;
    var p = new RegExp("[0-9]G"),
      q = (cfg || {}).defaultCity == "kaunas";
    while (i < j) {
      i >= 0 && (l = k[i]);
      var r = l.raw_data.split(";"),
        s = r[ti.RT_CITY],
        t = r[ti.RT_TRANSPORT],
        u = r[ti.RT_ORDER],
        v = r[ti.RT_ROUTENUM],
        w = r[ti.RT_ROUTENUM0],
        x;
      t == "expressbus" && v && p.test(v) && !q
        ? (x = v.replace("G", "<sup>G</sup>"))
        : (x = v),
        (v = ti.toAscii(v, !0));
      var y = v.split("(")[0],
        z = r[ti.RT_ROUTETAG];
      if (
        i < 0 ||
        (b == "new" && s == "vilnius" && !c && r[ti.RT_OPERATOR] == "Kautra") ||
        (b == "commercialbus" &&
          s == "xxxvilnius" &&
          !c &&
          "expressbus2g;bus21;bus54;trol16;trol18;".indexOf(
            t + y.substring(0, 3) + ";"
          ) >= 0) ||
        (b == "newyear" && s == "vilnius" && !c && v.indexOf("tik12-31") > 0) ||
        (("," + s + ",").indexOf(a) >= 0 &&
          (!b ||
            cfg.defaultCity == "lsa" ||
            b === t ||
            (b == "xxxbus" && t == "eventbus") ||
            (b == "bus" && t == "expressbus" && q)) &&
          (!m ||
            m === "all" ||
            (m === v &&
              (!z || e === !0 || (e === "0" && z.indexOf("0") < 0)))) &&
          (!d || d === r[ti.RT_ROUTETYPE]))
      ) {
        var A = (r[ti.RT_VALIDITYPERIODS] || "").split(",");
        for (var B = 0; B < 7; ++B)
          (A[B] = parseInt(A[B], 10) || 0), B > 0 && (A[B] += A[B - 1]);
        if (f) {
          var C = v.indexOf(f);
          C === 0 &&
            v.length > f.length &&
            "0123456789".indexOf(v.charAt(f.length)) >= 0 &&
            (C = -1);
          if (C !== 0) {
            var D = ti.toAscii(r[ti.RT_ROUTENAME], 2);
            while (D) {
              (C = D.indexOf(f)), C == -1 && (D = "");
              if (
                C > 0 &&
                o.indexOf(D.charAt(C - 1)) < 0 &&
                o.indexOf(f.charAt(0)) < 0
              )
                (D = D.substring(C + 1)), (C = -1);
              else break;
            }
          }
          if (C >= 0 || f === "*") {
            (C = 0),
              (n = ti.toAscii(
                s + ";" + t + ";" + v + ";" + r[ti.RT_ROUTENAME],
                !0
              ));
            var E = h[n];
            if (E) {
              (C = -1), (E.weekdays += r[ti.RT_WEEKDAYS]);
              for (var B = 0; B < 7; ++B)
                E.validityPeriods[B] < A[B] && (E.validityPeriods[B] = A[B]);
            }
          }
          if (C < 0 || z) {
            ++i;
            continue;
          }
        } else if (i >= 0 && !m && v != "l1") {
          n = ti.toAscii(s + ";" + t + ";" + v, !0);
          var E = h[n];
          if (E) {
            var F = r[ti.RT_ROUTETYPE];
            if (cfg.defaultCity != "riga")
              if (F === "a-b" || F.indexOf("a-b_") === 0)
                r[ti.RT_ROUTENAME] !== E.name && (E = null);
            if (E) {
              E.dirType.indexOf("_") < 0 && (E.weekdays += r[ti.RT_WEEKDAYS]);
              for (var B = 0; B < 7; ++B)
                E.validityPeriods[B] < A[B] && (E.validityPeriods[B] = A[B]);
            }
          }
          if (E && (u !== "1" || (s == "vilnius" && t == "commercialbus"))) {
            ++i;
            continue;
          }
        }
        var G = "Z";
        b != "commercialbus" ||
        t != "commercialbus" ||
        (!!0 && v.indexOf("litexpo") < 0)
          ? typeof cfg === "object" &&
            cfg.transportOrder &&
            cfg.defaultCity != "lsa" &&
            (G = cfg.transportOrder[t] || "Z")
          : (G = v.indexOf("litexpo") == 0 ? "-" : "+");
        var y = v;
        t == "ferry" && w && (y = w + v),
          (G +=
            ("000000" + parseInt(y, 10)).slice(-6) +
            y.substr(0, 1) +
            ("000000" + Math.abs(parseInt(y.substr(1), 10))).slice(-6) +
            (y + "!!!!!!!!!!!!!!!!!!!!").substr(0, 20) +
            ("000000" + u).slice(-6));
        var D = r[ti.RT_ROUTENAME];
        pg.language == "en" && (D = D.replaceAll("Oro uostas", "Airport")),
          g.push({
            id: r[0],
            authority: r[ti.RT_AUTHORITY],
            city: s,
            transport: t,
            operator: r[ti.RT_OPERATOR],
            commercial: r[ti.RT_COMMERCIAL],
            num: r[ti.RT_ROUTENUM],
            num0: r[ti.RT_ROUTENUM0],
            numHTML: x,
            name: D,
            routeTag: z,
            dirType: r[ti.RT_ROUTETYPE],
            weekdays: r[ti.RT_WEEKDAYS],
            validityPeriods: A,
            specialDates: (r[ti.RT_SPECIALDATES] || "").split(",") || [],
            entry: r[ti.RT_ENTRY],
            streets: r[ti.RT_STREETS],
            platforms: r[ti.RT_ROUTESTOPSPLATFORMS],
            stops: r.slice(ti.RT_ROUTESTOPS),
            times: l.times,
            order: u,
            sortKey: G,
            raw_data: l.raw_data,
          }),
          n && (h[n] = g[g.length - 1]);
      }
      ++i;
    }
    if (!j) return g[0];
    g.sort(function (a, b) {
      if (a.sortKey < b.sortKey) return -1;
      if (a.sortKey > b.sortKey) return 1;
      return (
        ti.naturalSort(a.num, b.num) ||
        (a.order < b.order ? -1 : a.order > b.order ? 1 : 0)
      );
    });
    return g;
  }),
  (ti.fOperatorDetails = function (a, b) {
    var c = cfg.operators[a || b];
    if (!c) return a;
    c = (b && c[b]) || c;
    return c[(pg || {}).language] || c.en || c;
  }),
  (ti.encodeNumber = function (a) {
    (a = a << 1), a < 0 && (a = ~a);
    var b = "";
    while (a >= 32) (b += String.fromCharCode((32 | (a & 31)) + 63)), (a >>= 5);
    b += String.fromCharCode(a + 63);
    return b;
  }),
  (ti.explodeTimes = function (a, b) {
    var c = [],
      d = [],
      e = [],
      f = [],
      g = [],
      h = [],
      i = [],
      j = [],
      k,
      l,
      m = a.split(","),
      n,
      o,
      p = m.length,
      q = [],
      r = "+",
      s = "-";
    for (n = -1, k = 0, l = 0, o = 0; ++n < p; ) {
      var t = m[n];
      if (t == "") break;
      var u = t.charAt(0);
      u === r
        ? (q[n] = t.charAt(1) === "0" && t !== "+0" ? "2" : "1")
        : u === s &&
          t.charAt(1) === "0" &&
          (q[n] = t.charAt(2) === "0" ? "2" : "1"),
        (o += +t),
        n == 0 && o >= 1440 && b == "nightbus" && (o -= 1440),
        (c[k++] = o);
    }
    for (var v = q.length; --v >= 0; ) q[v] || (q[v] = "0");
    for (var v = 0; ++n < p; ) {
      var w = +m[n],
        x = m[++n];
      x === "" ? ((x = k - v), (p = 0)) : (x = +x);
      while (x-- > 0) e[v++] = w;
    }
    --n;
    for (var v = 0, p = m.length; ++n < p; ) {
      var w = +m[n],
        x = m[++n];
      x === "" ? ((x = k - v), (p = 0)) : (x = +x);
      while (x-- > 0) f[v++] = w;
    }
    --n;
    for (var v = 0, p = m.length; ++n < p; ) {
      var y = m[n],
        x = m[++n];
      x === "" ? ((x = k - v), (p = 0)) : (x = +x);
      while (x-- > 0) d[v++] = y;
    }
    if (ti.has_trips_ids) {
      --n;
      var p = m.length;
      for (var v = 0; ++n < p; ) {
        if (m[n] === "") break;
        (g[v] = +m[n]), v > 0 && (g[v] += g[v - 1]), ++v;
      }
      for (var v = 0; ++n < p; ) {
        if (m[n] === "") break;
        (h[v] = m[n]), ++v;
      }
      if (ti.has_trips_ids === 2) {
        for (var v = 0; ++n < p; ) {
          if (m[n] === "") break;
          (j[v] = m[n]), ++v;
        }
        for (var v = 0; ++n < p; ) {
          if (m[n] === "") break;
          (i[v] = m[n]), ++v;
        }
      }
      ++n;
    }
    --n, (l = 1);
    for (var v = k, z = k, A = 5, p = m.length; ++n < p; ) {
      A += +m[n] - 5;
      var x = m[++n];
      x !== ""
        ? ((x = +x), x > z ? ((x = z), (z = 0)) : (z -= x))
        : ((x = z), (z = 0));
      while (x-- > 0) (c[v] = A + c[v - k]), ++v;
      z <= 0 && ((z = k), (A = 5), ++l);
    }
    final_data = {
      workdays: d,
      times: c,
      tag: q.join(""),
      valid_from: e,
      valid_to: f,
      trip_ids: g,
      trip_codes: h,
      trip_operators: i,
      trip_groups: j,
    };
    return final_data;
  }),
  (ti.fGetDirTag = function (a) {
    if (a.indexOf("-d") >= 0) return "0";
    if (a.indexOf("2") >= 0) return "2";
    if (a.indexOf("3") >= 0) return "3";
    var b = a.search(/[\dcefghijklmnopqrstuvwyz]/);
    if (b > 0) {
      var c = a.indexOf("_");
      if (c < 0 || c > b) return "1";
    }
    return "";
  }),
  (ti.parseParams = function (a) {
    var b = {};
    if (!a) {
      b.status = "UNDEFINED";
      return b;
    }
    a.origin || (b.status = "NO_ORIGIN"),
      a.destination || (b.status += (b.status ? "," : "") + "NO_DESTINATION");
    var c,
      d,
      e = 1;
    if (a.departure_time || a.arrival_time) {
      var f = a.departure_time || a.arrival_time;
      typeof f == "string"
        ? (f = new Date(f.replace(/-/g, "/")))
        : ((f = parseInt(a.departure_time || a.arrival_time, 10)),
          (ti.TimeZoneOffset = -new Date().getTimezoneOffset() / 60),
          ti.TimeZoneOffset ||
            ((ti.TimeZoneOffset = 3),
            f * 1e3 > +new Date(2015, 9, 25, 3, 0, 0) &&
              (ti.TimeZoneOffset = 2),
            (f += ti.TimeZoneOffset * 3600)),
          (f = new Date(f * 1e3))),
        (c = new Date(f.getFullYear(), f.getMonth(), f.getDate())),
        (d = f.getHours() * 60 + f.getMinutes()),
        (e = a.departure_time ? 1 : -1);
    }
    var g = {};
    if (typeof a.transport == "object") g = a.transport;
    else if (a.transport) {
      var h = "," + a.transport + ",";
      (g = {
        train: h.indexOf("train") >= 0,
        tram: h.indexOf("tram") >= 0 || h.indexOf("city") >= 0,
        trol: h.indexOf("trol") >= 0 || h.indexOf("city") >= 0,
        bus: h.indexOf("cb") >= 0 || h.indexOf("city") >= 0,
      }),
        (g.regionalbus = g.internationalbus = h.indexOf("bus") >= 0);
    }
    b = {
      status: b.status || "OK",
      mode: a.mode,
      optimization: a.optimization,
      origin: a.origin,
      origin_name: a.origin_name,
      start_stops: a.origin,
      destination: a.destination,
      destination_name: a.destination_name,
      finish_stops: a.destination,
      reverse: e,
      date: c,
      start_time: d,
      time_window: a.time_window,
      results_max: a.results_max,
      walk_min: parseInt(a.walk_min || ti.walk_min || 10, 10),
      walk_max: parseInt(a.walk_max || ti.walk_max || 1e3, 10),
      walk_max_total: parseInt(
        a.walk_max_total || ti.walk_max_total || 999999,
        10
      ),
      lowFloor: !1,
      transport: g,
      walk_speed_kmh: parseInt(a.walk_speed || 4, 10),
      change_time: parseInt(a.change_time || 3, 10),
      operators: a.operators,
      added_trips: a.added_trips,
      removed_trips: a.removed_trips,
      changed_trips: a.changed_trips,
      removed_trips_by_date: null,
      added_trips_by_date: null,
      max_changes: a.max_changes,
      route_nums: a.route_nums,
      include_private: a.include_private,
      shapes_url: a.shapes_url,
      timeout: a.timeout,
    };
    if (a.origin && a.origin.indexOf(";") > 0) {
      var i = a.origin.split(";"),
        j = parseFloat(i[0]),
        k = parseFloat(i[1]);
      if (j > 1e3 || k > 1e3) {
        (b.start_east = j), (b.start_north = k);
        var l = ti.ENtoLatLng(j, k);
        b.start_stops = l[0] + ";" + l[1];
      }
    }
    if (a.destination && a.destination.indexOf(";") > 0) {
      var i = a.destination.split(";"),
        j = parseFloat(i[0]),
        k = parseFloat(i[1]);
      if (j > 1e3 || k > 1e3) {
        (b.end_east = j), (b.end_north = k);
        var l = ti.ENtoLatLng(j, k);
        b.finish_stops = l[0] + ";" + l[1];
      }
    }
    (b.removed_trips_by_date = {}), (b.added_trips_by_date = {});
    if (a.changed_trips)
      for (var c in a.changed_trips) {
        var m = ti.dateToDays(new Date(c)),
          n = "removed";
        for (var o = 1; o <= 2; o++) {
          var p = (a.changed_trips[c][n] || "").split(",");
          if (p.length)
            for (var q = 0; q < p.length; ++q)
              b[n + "_trips_by_date"][m + ":" + p[q].trim()] = !0;
          n = "added";
        }
      }
    return b;
  }),
  (ti.printParameters = function (a) {
    if (!a.date) {
      var b = new Date();
      a.date = new Date(b.getFullYear(), b.getMonth(), b.getDate());
    }
    var c = {
      origin: a.origin,
      origin_name: a.origin_name,
      destination: a.destination,
      destination_name: a.destination_name,
      optimization: a.optimization,
      results_max: a.results_max,
      walk_min: a.walk_min + " m",
      walk_max: a.walk_max / 1e3 + " km",
      walk_speed: a.walk_speed_kmh + " km/h",
      change_time: a.change_time + " minutes",
      max_changes: a.max_changes,
      time_zone_offset: ti.TimeZoneOffset,
      operators: a.operators,
      added_trips: a.added_trips,
      removed_trips: a.removed_trips,
      changed_trips: a.changed_trips,
      time_window: a.time_window,
      include_private: a.include_private,
    };
    a.date && (c.date = a.date.yyyymmdd(".")),
      a.reverse == 1 && (c.departure_time = ti.printTime(a.start_time)),
      a.reverse == -1 && (c.arrival_time = ti.printTime(a.start_time)),
      a.walk_max_total && (c.walk_max_total = a.walk_max_total / 1e3 + " km");
    if (typeof a.transport == "object") c.transport = a.transport;
    else if (a.transport) {
      var d = "";
      for (var e in a.transport) a.transport[e] && (d += ", " + e);
      d && (c.transport = d.substring(2));
    }
    return c;
  }),
  (ti.toUnixTime = function (a, b) {
    var c = new Date(
      a.getFullYear(),
      a.getMonth(),
      a.getDate(),
      Math.floor((b || 0) / 60),
      (b || 0) % 60
    );
    (ti.TimeZoneOffset = -c.getTimezoneOffset() / 60),
      (c = +c / 1e3),
      ti.TimeZoneOffset ||
        ((ti.TimeZoneOffset = 3),
        a > new Date(2017, 9, 29, 3, 0, 0) && (ti.TimeZoneOffset = 2),
        (c -= ti.TimeZoneOffset * 3600));
    return c;
  }),
  (Date.prototype.yyyymmdd = function (a) {
    var b = this.getFullYear().toString(),
      c = (this.getMonth() + 1).toString(),
      d = this.getDate().toString();
    a || (a = "");
    return b + a + (c[1] ? c : "0" + c[0]) + a + (d[1] ? d : "0" + d[0]);
  }),
  (ti.gtfs_vehicle_name = {
    bus: "bus",
    regionalbus: "bus",
    internationalbus: "bus",
    trol: "trol",
    train: "train",
    tram: "tram",
    ferry: "ferry",
    ship: "ship",
    plane: "plane",
    1: "tram",
    2: "train",
    3: "bus",
    4: "ferry",
    800: "trol",
    1e3: "ship",
    1100: "plane",
  }),
  (ti.gtfs_vehicle_type = {
    bus: "LOCALBUS",
    regionalbus: "BUS",
    internationalbus: "BUS",
    trol: "TROLLEYBUS",
    train: "RAIL",
    tram: "TRAM",
    ferry: "FERRY",
    ship: "SHIP",
    plane: "AIR",
    1: "TRAM",
    2: "RAIL",
    3: "BUS",
    4: "FERRY",
    800: "TROLLEYBUS",
    1e3: "WATER_TRANSPORT",
    1100: "AIR",
  }),
  (ti.ToGoogleFormat = function (a) {
    if (!a || !a.status) {
      var b = {
        status: "UNDEFINED",
        parsed_parameters: {},
        routes: [],
      };
      return b;
    }
    if (a.status != "OK") {
      var b = {
        status: a.status,
        parsed_parameters: ti.printParameters(a),
        routes: [],
      };
      return b;
    }
    var c = a.results,
      b = {
        parsed_parameters: ti.printParameters(a),
        status: c.length ? "OK" : "ZERO_RESULTS",
        calculation_time: a.search_duration + "ms",
        text: undefined,
        summary: undefined,
        routes: [],
      };
    for (var d = 0; d < c.length; d++) {
      var e = c[d],
        f = c[d].legs,
        g = {
          bounds: {
            northeast: {
              lat: undefined,
              lng: undefined,
            },
            southwest: {
              lat: undefined,
              lng: undefined,
            },
          },
          overview_polyline: {
            points: undefined,
          },
          legs: [],
          warnings: [],
          copyrights: undefined,
          waypoint_order: undefined,
        };
      (g.bounds = undefined),
        (g.overview_polyline = undefined),
        (g.warnings = undefined);
      var h = {
        duration: {
          value: undefined,
          text: undefined,
        },
        walking_duration: {
          value: undefined,
          text: undefined,
        },
        distance: {
          value: undefined,
          text: undefined,
        },
        departure_time: {
          value: undefined,
          text: undefined,
          time_zone: undefined,
        },
        arrival_time: {
          value: undefined,
          text: undefined,
          time_zone: undefined,
        },
        start_location: {
          lat: undefined,
          lng: undefined,
        },
        end_location: {
          lat: undefined,
          lng: undefined,
        },
        start_address: undefined,
        end_address: undefined,
        origin_name: a.origin_name,
        destination_name: a.destination_name,
      };
      (h.departure_time.value = ti.toUnixTime(a.date, e.start_time)),
        (h.departure_time.text = ti.printTime(e.start_time)),
        (h.departure_time.time_zone = ti.TimeZone),
        (h.arrival_time.value = ti.toUnixTime(a.date, e.finish_time)),
        (h.arrival_time.text = ti.printTime(e.finish_time)),
        (h.arrival_time.time_zone = ti.TimeZone),
        (h.duration.value = e.travel_time * 60),
        (h.duration.text = e.travel_time + " min"),
        (h.walking_duration.value = e.walk_time * 60),
        (h.walking_duration.text = e.walk_time + " min"),
        (h.distance = Math.round(e.distance)),
        (h.cost = e.cost),
        (h.steps = []);
      if (e.legs && e.legs[0]) {
        var i = f[0];
        (h.start_location.lat = i.start_stop.lat),
          (h.start_location.lng = i.start_stop.lng);
        if (a.start_east && a.start_north)
          (h.start_location.east = a.start_east),
            (h.start_location.north = a.start_north);
        else if (a.mode == "vintra") {
          var j = ti.LatLngToEN(h.start_location.lat, h.start_location.lng);
          (h.start_location.east = j[0]), (h.start_location.north = j[1]);
        }
      }
      if (e.legs && f.length && e.legs[f.length - 1]) {
        var k = f[f.length - 1];
        (h.end_location.lat = k.finish_stop.lat),
          (h.end_location.lng = k.finish_stop.lng);
        if (a.end_east && a.end_north)
          (h.end_location.east = a.end_east),
            (h.end_location.north = a.end_north);
        else if (a.mode == "vintra") {
          var j = ti.LatLngToEN(h.end_location.lat, h.end_location.lng);
          (h.end_location.east = j[0]), (h.end_location.north = j[1]);
        }
      }
      g.legs.push(h);
      for (var l = 0; l < f.length; l++) {
        var m = f[l],
          n = {
            travel_mode: undefined,
            duration: {
              value: undefined,
              text: undefined,
            },
            distance: {
              value: undefined,
              text: undefined,
            },
            start_location: {
              lat: undefined,
              lng: undefined,
            },
            end_location: {
              lat: undefined,
              lng: undefined,
            },
            polyline: {
              points: undefined,
            },
            html_instructions: undefined,
            transit_details: {
              departure_time: {
                value: undefined,
                text: undefined,
                time_zone: undefined,
              },
              arrival_time: {
                value: undefined,
                text: undefined,
                time_zone: undefined,
              },
              weekdays: undefined,
              departure_stop: {
                name: undefined,
                location: {
                  lat: undefined,
                  lng: undefined,
                },
                street: undefined,
                id: undefined,
                platform: undefined,
              },
              arrival_stop: {
                name: undefined,
                location: {
                  lat: undefined,
                  lng: undefined,
                },
                street: undefined,
                id: undefined,
                platform: undefined,
              },
              headsign: undefined,
              num_stops: undefined,
              stops: undefined,
              line: {
                name: undefined,
                short_name: undefined,
                vehicle: {
                  name: undefined,
                  type: undefined,
                  icon: undefined,
                },
                trip_id: undefined,
                trip_date: undefined,
                trip_num: undefined,
                trip_operator: undefined,
                trip_group: undefined,
                agencies: [],
                weekdays: undefined,
                url: undefined,
                color: undefined,
                icon: undefined,
              },
            },
          };
        (n.travel_mode = m.route ? "TRANSIT" : "WALKING"),
          (n.distance = undefined),
          (n.polyline = undefined);
        if (m.shape && m.shape.length) {
          n.geometry = [];
          for (var o = 0; o < m.shape.length; ++o) {
            var p = [m.shape[o][0], m.shape[o][1]];
            m.route && (p = ti.LatLngToEN(m.shape[o][0], m.shape[o][1])),
              n.geometry.push(p);
          }
        }
        m.distance &&
          (n.distance = {
            value: m.distance,
            text: m.distance + " meters",
          }),
          (n.start_location.lat =
            n.transit_details.departure_stop.location.lat =
              m.start_stop.lat),
          (n.start_location.lng =
            n.transit_details.departure_stop.location.lng =
              m.start_stop.lng),
          (n.end_location.lat = n.transit_details.arrival_stop.location.lat =
            m.finish_stop.lat),
          (n.end_location.lng = n.transit_details.arrival_stop.location.lng =
            m.finish_stop.lng);
        if (a.mode == "vintra") {
          var j = ti.LatLngToEN(n.start_location.lat, n.start_location.lng);
          (n.start_location.east =
            n.transit_details.departure_stop.location.east =
              j[0]),
            (n.start_location.north =
              n.transit_details.departure_stop.location.north =
                j[1]),
            (j = ti.LatLngToEN(n.end_location.lat, n.end_location.lng)),
            (n.end_location.east =
              n.transit_details.arrival_stop.location.east =
                j[0]),
            (n.end_location.north =
              n.transit_details.arrival_stop.location.north =
                j[1]),
            n.geometry ||
              (n.geometry = [
                [n.start_location.east, n.start_location.north],
                [n.end_location.east, n.end_location.north],
              ]);
        }
        (n.duration.value = m.travel_time || m.finish_time - m.start_time),
          (n.duration.text = n.duration.value + " min"),
          (n.duration.value *= 60),
          (n.transit_details.departure_time.value = ti.toUnixTime(
            a.date,
            m.start_time
          )),
          (n.transit_details.departure_time.text = ti.printTime(m.start_time)),
          (n.transit_details.departure_time.time_zone = ti.TimeZone),
          (n.transit_details.arrival_time.value = ti.toUnixTime(
            a.date,
            m.finish_time
          )),
          (n.transit_details.arrival_time.text = ti.printTime(m.finish_time)),
          (n.transit_details.arrival_time.time_zone = ti.TimeZone),
          m.start_stop.id.indexOf(";") < 0 &&
            ((n.transit_details.departure_stop.name = m.start_stop.name),
            (n.transit_details.departure_stop.id = m.start_stop.id),
            (n.transit_details.departure_stop.street = m.start_stop.street),
            (n.transit_details.departure_stop.platform = m.start_platform)),
          m.finish_stop.id.indexOf(";") < 0 &&
            ((n.transit_details.arrival_stop.name = m.finish_stop.name),
            (n.transit_details.arrival_stop.id = m.finish_stop.id),
            (n.transit_details.arrival_stop.street = m.finish_stop.street),
            (n.transit_details.arrival_stop.platform = m.finish_platform));
        if (m.route) {
          (n.transit_details.headsign = m.route.name),
            (n.transit_details.num_stops = m.finish_pos - m.start_pos),
            (n.transit_details.stops = m.stops),
            (n.transit_details.cost = m.cost),
            (n.transit_details.line.name = m.route.name),
            (n.transit_details.line.short_name = m.route.num),
            (n.transit_details.line.vehicle.name =
              ti.gtfs_vehicle_name[m.route.transport.toLowerCase()] ||
              m.route.transport),
            (n.transit_details.line.vehicle.type =
              ti.gtfs_vehicle_type[m.route.transport.toLowerCase()] || "OTHER"),
            (n.transit_details.line.trip_id = m.trip_id),
            (n.transit_details.line.trip_date =
              m.trip_date && m.trip_date.yyyymmdd(".")),
            (n.transit_details.line.trip_num = m.trip_code),
            (n.transit_details.line.trip_operator = m.trip_operator),
            (n.transit_details.line.trip_group = m.trip_group),
            (n.transit_details.weekdays = m.weekdays),
            (n.transit_details.line.weekdays = m.route.weekdays),
            (n.transit_details.line.track_id =
              m.route.route_id ||
              ti.toAscii(
                [
                  m.route.city,
                  m.route.transport,
                  m.route.num,
                  m.route.dirType,
                ].join("_")
              ));
          if (m.route.operator) {
            var q = {
              name: undefined,
              phone: undefined,
              url: undefined,
            };
            (q.name = m.route.operator),
              n.transit_details.line.agencies.push(q);
          }
          m.online_data && (n.transit_details.online_data = m.online_data);
        } else n.transit_details.line = undefined;
        (n.taxi = m.taxi), g.legs[0].steps.push(n);
      }
      b.routes.push(g);
    }
    return b;
  });
function SHA1(a) {
  function b(a, b) {
    var c = (a << b) | (a >>> (32 - b));
    return c;
  }
  function c(a) {
    var b = "",
      c,
      d,
      e;
    for (c = 0; c <= 6; c += 2)
      (d = (a >>> (c * 4 + 4)) & 15),
        (e = (a >>> (c * 4)) & 15),
        (b += d.toString(16) + e.toString(16));
    return b;
  }
  function d(a) {
    var b = "",
      c,
      d;
    for (c = 7; c >= 0; c--) (d = (a >>> (c * 4)) & 15), (b += d.toString(16));
    return b;
  }
  function e(a) {
    a = a.replace(/\r\n/g, "\n");
    var b = "";
    for (var c = 0; c < a.length; c++) {
      var d = a.charCodeAt(c);
      d < 128
        ? (b += String.fromCharCode(d))
        : d > 127 && d < 2048
        ? ((b += String.fromCharCode((d >> 6) | 192)),
          (b += String.fromCharCode((d & 63) | 128)))
        : ((b += String.fromCharCode((d >> 12) | 224)),
          (b += String.fromCharCode(((d >> 6) & 63) | 128)),
          (b += String.fromCharCode((d & 63) | 128)));
    }
    return b;
  }
  var f,
    g,
    h,
    i = new Array(80),
    j = 1732584193,
    k = 4023233417,
    l = 2562383102,
    m = 271733878,
    n = 3285377520,
    o,
    p,
    q,
    r,
    s,
    t;
  a = e(a);
  var u = a.length,
    v = new Array();
  for (g = 0; g < u - 3; g += 4)
    (h =
      (a.charCodeAt(g) << 24) |
      (a.charCodeAt(g + 1) << 16) |
      (a.charCodeAt(g + 2) << 8) |
      a.charCodeAt(g + 3)),
      v.push(h);
  switch (u % 4) {
    case 0:
      g = 2147483648;
      break;
    case 1:
      g = (a.charCodeAt(u - 1) << 24) | 8388608;
      break;
    case 2:
      g = (a.charCodeAt(u - 2) << 24) | (a.charCodeAt(u - 1) << 16) | 32768;
      break;
    case 3:
      g =
        (a.charCodeAt(u - 3) << 24) |
        (a.charCodeAt(u - 2) << 16) |
        (a.charCodeAt(u - 1) << 8) |
        128;
  }
  v.push(g);
  while (v.length % 16 != 14) v.push(0);
  v.push(u >>> 29), v.push((u << 3) & 4294967295);
  for (f = 0; f < v.length; f += 16) {
    for (g = 0; g < 16; g++) i[g] = v[f + g];
    for (g = 16; g <= 79; g++)
      i[g] = b(i[g - 3] ^ i[g - 8] ^ i[g - 14] ^ i[g - 16], 1);
    (o = j), (p = k), (q = l), (r = m), (s = n);
    for (g = 0; g <= 19; g++)
      (t =
        (b(o, 5) + ((p & q) | (~p & r)) + s + i[g] + 1518500249) & 4294967295),
        (s = r),
        (r = q),
        (q = b(p, 30)),
        (p = o),
        (o = t);
    for (g = 20; g <= 39; g++)
      (t = (b(o, 5) + (p ^ q ^ r) + s + i[g] + 1859775393) & 4294967295),
        (s = r),
        (r = q),
        (q = b(p, 30)),
        (p = o),
        (o = t);
    for (g = 40; g <= 59; g++)
      (t =
        (b(o, 5) + ((p & q) | (p & r) | (q & r)) + s + i[g] + 2400959708) &
        4294967295),
        (s = r),
        (r = q),
        (q = b(p, 30)),
        (p = o),
        (o = t);
    for (g = 60; g <= 79; g++)
      (t = (b(o, 5) + (p ^ q ^ r) + s + i[g] + 3395469782) & 4294967295),
        (s = r),
        (r = q),
        (q = b(p, 30)),
        (p = o),
        (o = t);
    (j = (j + o) & 4294967295),
      (k = (k + p) & 4294967295),
      (l = (l + q) & 4294967295),
      (m = (m + r) & 4294967295),
      (n = (n + s) & 4294967295);
  }
  var t = d(j) + d(k) + d(l) + d(m) + d(n);
  return t.toLowerCase();
}
(ti.ENtoLatLng = function (a, b) {
  var c = 3.14159265,
    d = 6378137,
    e = 6356752.3141,
    f = 0,
    g = 0,
    h = 5e5,
    i = 0.9998,
    j = 24,
    k = g * (c / 180),
    l = j * (c / 180),
    m = d * i,
    n = e * i,
    o = (Math.pow(m, 2) - Math.pow(n, 2)) / Math.pow(m, 2),
    p = (m - n) / (m + n),
    q = a - h,
    r = ti.InitialLat(b, f, m, k, p, n),
    s = 1 / Math.cos(r),
    t = Math.tan(r),
    u = m / Math.sqrt(1 - o * Math.pow(Math.sin(r), 2)),
    v = (u * (1 - o)) / (1 - o * Math.pow(Math.sin(r), 2)),
    w = u / v - 1,
    x = t / (2 * v * u),
    y =
      (t / (24 * v * Math.pow(u, 3))) *
      (5 + 3 * Math.pow(t, 2) + w - 9 * w * Math.pow(t, 2)),
    z =
      (t / (720 * v * Math.pow(u, 5))) *
      (61 + 90 * Math.pow(t, 2) + 45 * Math.pow(t, 4)),
    A =
      (180 / c) *
      (r - Math.pow(q, 2) * x + Math.pow(q, 4) * y - Math.pow(q, 6) * z),
    B = s / u,
    C = (s / (6 * Math.pow(u, 3))) * (u / v + 2 * Math.pow(t, 2)),
    D =
      (s / (120 * Math.pow(u, 5))) *
      (5 + 28 * Math.pow(t, 2) + 24 * Math.pow(t, 4)),
    E =
      (s / (5040 * Math.pow(u, 7))) *
      (61 +
        662 * Math.pow(t, 2) +
        1320 * Math.pow(t, 4) +
        720 * Math.pow(t, 6)),
    F =
      (180 / c) *
      (l +
        q * B -
        Math.pow(q, 3) * C +
        Math.pow(q, 5) * D -
        Math.pow(q, 7) * E);
  return [A, F];
}),
  (ti.LatLngToEN = function (a, b) {
    var c = 3.14159265,
      d = 6378137,
      e = 6356752.3141,
      f = 0,
      g = 0,
      h = 5e5,
      i = 0.9998,
      j = 24,
      k = a * (c / 180),
      l = b * (c / 180),
      m = g * (c / 180),
      n = j * (c / 180),
      o = d * i,
      p = e * i,
      q = (o * o - p * p) / (o * o),
      r = (o - p) / (o + p),
      s = o / Math.sqrt(1 - q * Math.pow(Math.sin(k), 2)),
      t = (s * (1 - q)) / (1 - q * Math.pow(Math.sin(k), 2)),
      u = s / t - 1,
      v = l - n,
      w = ti.Marc(p, r, m, k),
      x = Math.sin(k),
      y = Math.cos(k),
      z = Math.tan(k),
      A = w + f,
      B = (s / 2) * x * y,
      C = (s / 24) * x * Math.pow(y, 3) * (5 - z * z + 9 * u),
      D = (s / 720) * x * Math.pow(y, 5) * (61 - 58 * (z * z) + Math.pow(z, 4));
    (Y = A + v * v * B + Math.pow(v, 4) * C + Math.pow(v, 6) * D),
      (Y = Math.round(Y));
    var E = s * y,
      F = (s / 6) * Math.pow(y, 3) * (s / t - z * z),
      G =
        (s / 120) *
        Math.pow(y, 5) *
        (5 - 18 * (z * z) + Math.pow(z, 4) + 14 * u - 58 * (z * z) * u);
    (X = h + v * E + Math.pow(v, 3) * F + Math.pow(v, 5) * G),
      (X = Math.round(X));
    return [X, Y];
  }),
  (ti.InitialLat = function (a, b, c, d, e, f) {
    var g = (a - b) / c + d,
      h = ti.Marc(f, e, d, g),
      i = (a - b - h) / c + g;
    while (Math.abs(a - b - h) > 1e-5)
      (i = (a - b - h) / c + g), (h = ti.Marc(f, e, d, i)), (g = i);
    return i;
  }),
  (ti.Marc = function (a, b, c, d) {
    return (
      a *
      ((1 + b + 1.25 * (b * b) + 1.25 * (b * b * b)) * (d - c) -
        (3 * b + 3 * (b * b) + (21 / 8) * (b * b * b)) *
          Math.sin(d - c) *
          Math.cos(d + c) +
        ((15 / 8) * (b * b) + (15 / 8) * (b * b * b)) *
          Math.sin(2 * (d - c)) *
          Math.cos(2 * (d + c)) -
        (35 / 24) * (b * b * b) * Math.sin(3 * (d - c)) * Math.cos(3 * (d + c)))
    );
  }),
  (ti.distance = function (a, b, c, d) {
    if (!(a && b && c && d)) return 0;
    var e = 6378137,
      f = Math.PI / 180,
      g = f * (c - a),
      h = f * (d - b),
      i = Math.sin(g / 2),
      j = Math.sin(h / 2),
      k = i * i + Math.cos(f * a) * Math.cos(f * c) * j * j,
      l = 2 * Math.atan2(Math.sqrt(k), Math.sqrt(1 - k)),
      m = e * l;
    return m;
  }),
  (ti.encodeNumber = function (a) {
    (a = a << 1), a < 0 && (a = ~a);
    var b = "";
    while (a >= 32) (b += String.fromCharCode((32 | (a & 31)) + 63)), (a >>= 5);
    b += String.fromCharCode(a + 63);
    return b;
  }),
  (ti.parseISOLocal = function (a) {
    var b = a.split(/\D/);
    return new Date(
      b[0],
      b[1] - 1,
      b[2],
      b[3] || "0",
      b[4] || "0",
      b[5] || "0"
    );
  }),
  (ti.stringToFields = function (a, b, c) {
    var d = a.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
    if (d.length < b.length)
      return {
        error:
          "Missing data, fields found; " + d.length + ", required: " + b.length,
      };
    var e = {};
    for (var f = 0; f < b.length; ++f) {
      var g = d[f];
      if (g.indexOf('"') >= 0) {
        g = g.replace(/""/g, '"');
        var h = g.length;
        g.charAt(0) === '"' &&
          g.charAt(h - 1) === '"' &&
          h > 1 &&
          (g = g.slice(1, -1));
      }
      e[b[f]] = g;
    }
    return e;
  });
if (typeof module !== "undefined" && module.exports) {
  module.exports = ti;
  var http = require("http");
}
var Hash = (function () {
  var a = this,
    b = document.documentMode,
    c = a.history,
    d = a.location,
    e,
    f,
    g,
    h = function () {
      var a = d.href.indexOf("#");
      return a == -1 ? "" : decodeURI(d.href.substr(a + 1));
    },
    i = function () {
      var a = h();
      if (a != f) {
        (f = a),
          e(a, !1),
          (pg.timeOfActivity = new Date().getTime()),
          typeof _gaq != "undefined" &&
            _gaq.push(["_trackPageview", "/" + d.hash]);
        if (typeof gtag == "function") {
          var b = d.href;
          (b = d.pathname.replace("index.html", "") + d.hash),
            gtag("config", cfg.city.ga, {
              page_path: b,
            });
        }
      }
    },
    j = function (a) {
      try {
        var b = g.contentWindow.document;
        b.open(),
          b.write("<html><body>" + a + "</body></html>"),
          b.close(),
          (f = a);
      } catch (c) {
        setTimeout(function () {
          j(a);
        }, 10);
      }
    },
    k = function () {
      try {
        g.contentWindow.document;
      } catch (a) {
        setTimeout(k, 10);
        return;
      }
      j(f);
      var b = f;
      setInterval(function () {
        var a, c;
        try {
          (a = g.contentWindow.document.body.innerText),
            a != b
              ? ((b = a), (d.hash = f = a), e(a, !0))
              : ((c = h()), c != f && j(c));
        } catch (i) {}
      }, 50);
    };
  return {
    getHash: h,
    init: function (d, j) {
      e ||
        ((e = d),
        (f = h()),
        d(f, !0),
        a.ActiveXObject
          ? !b || b < 8
            ? ((g = j), k())
            : a.attachEvent("onhashchange", i)
          : (c.navigationMode && (c.navigationMode = "compatible"),
            setInterval(i, 50)));
    },
    go: function (a) {
      if (a != f) {
        if (typeof gtag == "function") {
          var b = d.href;
          b.indexOf("m.") < 0 && b.indexOf("mobile") < 0
            ? (b = d.pathname.replace("index.html", "") + "#" + a)
            : ((b += "#"), (b = b.split("#")[0]), (b += "#" + a)),
            (b = d.pathname.replace("index.html", "") + "#" + a),
            gtag("config", cfg.city.ga, {
              page_path: b,
            });
        }
        if (
          top !== self &&
          (typeof cfg != "object" || cfg.defaultCity != "jelgava") &&
          !pg.sisp
        ) {
          var c = "stopslt";
          pg.sisp && top.frames[c]
            ? (console.log("top", top.frames, top.frames[c]),
              (top.frames[c].src = self.location.href.split("#")[0] + "#" + a))
            : top.location.replace(self.location.href.split("#")[0] + "#" + a);
          return;
        }
        g ? j(a) : ((d.hash = f = a), e(a, !1));
      }
    },
  };
})();
if (typeof module !== "undefined" && module.exports) {
  var fs = require("fs"),
    ti = require(fs.existsSync(__dirname + "/ti.js")
      ? __dirname + "/ti.js"
      : "../JS/ti.js");
  module.exports = ti;
}
var pikasRoute = (ti.pikasRoute = function (a, b) {
  a.mode == "vintra" &&
    typeof cfg != "undefined" &&
    (cfg.defaultCity = "vilnius"),
    (a = a || {
      origin: "3540",
      destination: "54.68561;25.28670",
      departure_time: "1355295600",
      walk_max: "1000",
    });
  var c = ti.parseParams(a);
  (c.callback = function (a) {
    var c = "";
    a.search_duration &&
      (c += "Search took " + a.search_duration + "ms<br /><br />"),
      (c += "Optimal routes:");
    var d = a.results || [];
    for (var e = 0; e < d.length; e++) {
      var f = d[e],
        g = d[e].legs;
      (c += [
        "<br /><b>Option",
        e + 1,
        "</b> travel time " + ti.printTime(f.travel_time),
      ].join("&nbsp;")),
        f.distance &&
          (c += ", distance " + Math.round(f.distance) / 1e3 + " km"),
        typeof f.cost == "number" && (c += ", cost " + f.cost + "&euro;"),
        (c += "<br />");
      for (var h = 0; h < g.length; h++) {
        var i = g[h];
        (c += [
          i.start_stop.name,
          ti.printTime(i.start_time),
          ti.printTime(i.finish_time),
          i.finish_stop.name,
          " ",
        ].join(" ")),
          i.route
            ? (c += [
                ti.gtfs_vehicle_name[i.route.transport] || i.route.transport,
                i.route.num,
                i.route.name,
                i.weekdays,
                i.cost + " Euro",
                "<br />",
              ].join(" "))
            : (c += "walk<br />");
      }
    }
    b === "JSON" || b === "json"
      ? (document.body.innerHTML = JSON.stringify(
          ti.ToGoogleFormat(a),
          null,
          4
        ))
      : typeof b === "string"
      ? (document.body.innerHTML = c)
      : typeof b === "function"
      ? ((d = ti.ToGoogleFormat(a)),
        (d.text = c),
        (d.version = "2020-04-10"),
        b(d))
      : window.JSClassObject.receiveResult(
          JSON.stringify(ti.ToGoogleFormat(a), null, 4)
        );
  }),
    ti.findTrips(c);
});
(ti.findTrips = function (args) {
  !args.timezone &&
    typeof cfg != "undefined" &&
    cfg.defaultCity == "intercity" &&
    ((args.timezone = {
      AT: -1,
      BE: -1,
      BG: 0,
      BY: 0,
      CH: -1,
      CZ: -1,
      DE: -1,
      DK: -1,
      EE: 0,
      ES: -1,
      FR: -1,
      HU: -1,
      IT: -1,
      LT: 0,
      LU: -1,
      LV: 0,
      NL: -1,
      PL: -1,
      RO: 0,
      RU: args.date.getTimezoneOffset() == -3 * 60 ? -1 : 0,
      SK: -1,
      SR: -1,
      UK: -2,
      UKR: 0,
    }),
    (args.timezone.BY =
      args.timezone["RU Maskva"] =
      args.timezone["RU Sankt "] =
        args.timezone.RU + 1)),
    (ti.args = args),
    (ti.distances = ti.distances || {}),
    (ti.walking_responses = ti.walking_responses || []);
  if (args && args.callback) {
    if (args.status && args.status != "OK") {
      args.callback(args);
      return;
    }
    if (args.distances_missing) return;
    ti.timeout_for_finding_distances &&
      (clearTimeout(ti.timeout_for_finding_distances),
      (ti.timeout_for_finding_distances = null));
    if (!args.stops_processed) {
      (args.stops_processed = !0),
        (args.distances_missing = 0),
        (ti.use_walking_distances = !1);
      var walk_max_km2 = (args.walk_max || 500) / 1e3;
      walk_max_km2 = walk_max_km2 * walk_max_km2;
      var walk_min_km2 = (args.walk_min || 10) / 1e3;
      walk_min_km2 = walk_min_km2 * walk_min_km2;
      var start_point = null;
      for (var k = 1; k <= 2; ++k) {
        var latlng;
        if (k == 1 && args.start_stops && args.start_stops.indexOf(";") > 0)
          latlng = args.start_stops.split(";");
        else if (
          k == 2 &&
          args.finish_stops &&
          args.finish_stops.indexOf(";") > 0
        )
          latlng = args.finish_stops.split(";");
        else continue;
        var lat = +parseFloat(latlng[0]).toFixed(5),
          lng = +parseFloat(latlng[1]).toFixed(5);
        lat > 54.636417 &&
          lng > 25.279669 &&
          lat < 54.650076 &&
          lng < 25.297436 &&
          ((lat = 54.64331), (lng = 25.27948)),
          (latlng = lat + ";" + lng),
          (args[k == 1 ? "start_stops" : "finish_stops"] = latlng);
        if (
          args.mode !== "vintra" &&
          cfg.defaultLanguage != "lt" &&
          cfg.defaultLanguage != "lv" &&
          cfg.defaultLanguage != "ee"
        )
          continue;
        k == 1 &&
          (start_point = {
            id: "start_point;" + latlng,
            lat: lat,
            lng: lng,
          });
        var stops = ti.stops,
          nearest_stops = [];
        for (var stop_id in stops) {
          var stop = stops[stop_id];
          if (!stop.lat || !stop.lng || stop.id == "gps") continue;
          var dx = (lng - stop.lng) * 58.1,
            dy = (lat - stop.lat) * 111.2,
            distance = dx * dx + dy * dy;
          if (distance > walk_min_km2)
            (distance <= walk_max_km2 ||
              (distance <= 1 && stop.id.slice(0, 4) == "aqua")) &&
              nearest_stops.push([distance, stop]);
          else {
            nearest_stops = [];
            break;
          }
        }
        if (k == 2 && start_point) {
          var dx = (lng - start_point.lng) * 58.1,
            dy = (lat - start_point.lat) * 111.2,
            distance = dx * dx + dy * dy;
          distance <= walk_max_km2 && nearest_stops.push([-999, start_point]);
        }
        nearest_stops.sort(function (a, b) {
          return a[0] - b[0];
        });
        if (args.mode !== "vintra") {
          var url =
              "https://" +
              cfg.defaultLanguage +
              "route.merakas.lt/table/v1/foot/" +
              lng +
              "," +
              lat,
            y1 = 55.72518472994023,
            x1 = 21.0978829006047,
            y2 = 55.67141189717329,
            x2 = 21.1457854498415,
            ax = lng,
            ay = lat;
          for (var i = 0; i < 200 && i < nearest_stops.length; i++) {
            var stop = nearest_stops[i][1],
              bx = stop.lng,
              by = stop.lat;
            if (ax < x2 || bx < x2)
              if (
                ((y1 - y2) * (ax - x1) + (x2 - x1) * (ay - y1)) *
                  ((y1 - y2) * (bx - x1) + (x2 - x1) * (by - y1)) <
                0
              ) {
                nearest_stops.splice(i, 1), (i = i - 1);
                continue;
              }
            url += ";" + stop.lng + "," + stop.lat;
          }
          url += "?annotations=distance&sources=0&skip_waypoints=true";
          if (nearest_stops.length) {
            var handler = (function () {
              var curr_time = +new Date(),
                stops = nearest_stops,
                curr_nearest_stops = nearest_stops.slice(),
                curr_lat = lat,
                curr_lng = lng;
              return function (lines) {
                args.distances_missing--;
                try {
                  var w;
                  JSON
                    ? (w = JSON.parse(lines))
                    : (w = eval("(function(){return " + lines + ";})()")),
                    (w = ((w || {}).distances || [])[0]);
                  if (w.length) {
                    ti.use_walking_distances = !0;
                    for (var i = 1; i < w.length; i++) {
                      var stop = curr_nearest_stops[i - 1][1];
                      if (stop) {
                        var shape_name = [
                          "distance",
                          curr_lat,
                          curr_lng,
                          stop.id,
                        ].join(";");
                        (ti.distances[shape_name] = w[i] / 1e3),
                          shape_name.indexOf(";start_point;") >= 0 &&
                            (args.walking_shape_name = shape_name);
                      }
                    }
                  }
                } catch (error) {
                  typeof ti.print_log != "function";
                }
                args.distances_missing <= 0 &&
                  ti.timeout_for_finding_distances &&
                  ((args.distances_missing = 0),
                  clearTimeout(ti.timeout_for_finding_distances),
                  (ti.timeout_for_finding_distances = null),
                  ti.findTrips(args));
              };
            })();
            ++args.distances_missing, ti.fDownloadUrl("get", url, handler);
          }
          continue;
        }
        for (var i = 0; i < 10; i++) {
          if (i >= nearest_stops.length) break;
          var stop = nearest_stops[i][1];
          (shape_name = ["distance", lat, lng, stop.id].join(";")),
            shape_name.indexOf(";start_point;") >= 0 &&
              (args.walking_shape_name = shape_name);
          if (ti.distances[shape_name]) continue;
          args.walking_shape_name != shape_name && args.distances_missing++;
          var url = cfg.walk_path_url;
          if (url) {
            var p1 = ti.LatLngToEN(lat, lng),
              p2 = ti.LatLngToEN(stop.lat, stop.lng);
            (url = url.replace("$x1", p1[0])),
              (url = url.replace("$y1", p1[1])),
              (url = url.replace("$x2", p2[0])),
              (url = url.replace("$y2", p2[1])),
              url.replace("esriNAOutputLineTrueShape", "esriNAOutputLineNone");
          }
          var handler = (function () {
            var curr_shape_name = shape_name,
              curr_url = url,
              curr_time = +new Date();
            return function (lines) {
              shape_name.indexOf(";start_point;") < 0 &&
                args.distances_missing--;
              if (lines.indexOf("DOCTYPE") < 0) {
                !ti.timeout_for_finding_distances &&
                  ti.print_log == "function" &&
                  ti.print_log(
                    "WARNING: late response in " +
                      (+new Date() - curr_time) +
                      "ms from " +
                      curr_url
                  );
                try {
                  var w;
                  JSON
                    ? (w = JSON.parse(lines))
                    : (w = eval("(function(){return " + lines + ";})()")),
                    (w = w.routes || {}),
                    (w = (w.features || [])[0] || {}),
                    (w = (w.attributes || {}).Total_Meters),
                    typeof w == "number" &&
                      w &&
                      (ti.distances[curr_shape_name] = w / 1e3);
                } catch (error) {
                  typeof ti.print_log == "function" &&
                    (ti.print_log(
                      "WARNING: invalid JSON data from walking path service: " +
                        error
                    ),
                    ti.print_log("JSON data: " + ti.shapes[shape_name]),
                    (ti.shapes[curr_shape_name] = !1));
                }
                args.distances_missing <= 0 &&
                  ti.timeout_for_finding_distances &&
                  ((args.distances_missing = 0), ti.findTrips(args));
              } else
                ti.print_log == "function" &&
                  ti.print_log(
                    "WARNING: response from walking path service for requested shape " +
                      curr_shape_name +
                      " is not JSON data:\n" +
                      lines
                  );
            };
          })();
          url && ti.fDownloadUrl("get", url, handler);
        }
      }
      if (args.distances_missing) {
        ti.timeout_for_finding_distances = setTimeout(function () {
          (args.distances_missing = 0), ti.findTrips(args);
        }, cfg.timeout_for_geometry || 1e3);
        return;
      }
    }
    args.optimization
      ? (args.optimization = args.optimization.toString())
      : (args.optimization = ""),
      (args.no_just_walking = !1),
      (args.reverseOriginal = args.reverse);
    if (!args.attempt) {
      if (typeof pg === "object") {
        if (pg.optimalSearchRunning) return;
        pg.optimalSearchRunning = !0;
      }
      (args.timeStarted = +new Date()),
        (ti.timeStarted = +new Date()),
        (args.attempt = 1),
        (args.curr_time = args.start_time),
        (args.direct_routes = []),
        (args.results0 = []);
      var d = args.date;
      d ||
        ((d = new Date()),
        (d = new Date(d.getFullYear(), d.getMonth(), d.getDate())),
        (args.date = d)),
        args.transport || (args.transport = {}),
        (args.transportOriginal = ti.cloneObject(args.transport)),
        typeof args.reverse == "undefined" &&
          ((args.reverse = 1), (args.reverseOriginal = args.reverse));
      if (typeof cfg === "object" && cfg.defaultCity === "intercity")
        (args.transport.internationalbus = !1),
          args.lowFloor && ((args.include_private = !0), (args.lowFloor = !1));
      else if (typeof cfg === "object" && cfg.defaultCity === "latvia")
        args.transport.internationalbus = !1;
      else if (typeof cfg !== "object" || cfg.defaultCity !== "vilnius")
        if (args.transport.bus || args.transport.trol || args.transport.tram)
          args.transport.regionalbus &&
            ((args.transport.regionalbus = !1), (args.attempt = -1)),
            args.transport.commercialbus &&
              ((args.transport.commercialbus = !1), (args.attempt = -1)),
            args.transport.intercitybus &&
              ((args.transport.intercitybus = !1), (args.attempt = -1)),
            args.transport.train &&
              cfg.defaultCity != "rostov" &&
              cfg.defaultCity != "traukiniai" &&
              ((args.transport.train = !1), (args.attempt = -1));
      dijkstra(args, args.start_time, args.reverse);
      return;
    }
    if (args.attempt == -1) {
      args.attempt = 1;
      if (args.results.length <= 0) {
        (args.transport = args.transportOriginal),
          dijkstra(args, args.start_time, args.reverse);
        return;
      }
    }
    if (args.attempt == 1 && args.results.length <= 0)
      if (typeof cfg !== "object" || cfg.defaultCity !== "intercity")
        if (args.mode != "vintra") {
          (args.attempt = 2),
            (args.reverse = -args.reverse),
            (args.sort = "no sort"),
            dijkstra(args, args.reverse == 1 ? 0 : 4320, args.reverse);
          return;
        }
    if (args.attempt == 2 && args.results.length > 0) {
      (args.attempt = 999), (args.reverse = -args.reverse);
      var time = null;
      for (var i = 0; i < args.results.length; i++)
        args.reverse == 1 &&
          (time === null || time < args.results[i].start_time) &&
          (time = args.results[i].start_time),
          args.reverse == -1 &&
            (time === null || time > args.results[i].finish_time) &&
            (time = args.results[i].finish_time);
      dijkstra(args, time, args.reverse);
      return;
    }
    if (args.attempt == 1) {
      var time = null;
      for (var i = 0; i < args.results.length; i++) {
        if (args.results[i].code == "W") continue;
        args.reverse == 1 &&
          (time === null || time > args.results[i].finish_time) &&
          (time = args.results[i].finish_time),
          args.reverse == -1 &&
            (time === null || time < args.results[i].start_time) &&
            (time = args.results[i].start_time);
      }
      (args.results0 = ti.filterSearchResults(args.results, args.reverse)),
        args.callback1 &&
          ((args.results = args.results0.slice(0, 1)),
          (args.results = ti.finalizeSearchResults(args)),
          args.callback1(args)),
        (args.attempt = 6),
        (args.no_just_walking = !0);
      if (time === null) args.results = [];
      else {
        dijkstra(args, time, -args.reverse, args.start_time);
        return;
      }
    }
    var no_later_trips =
      args.optimization && args.optimization.indexOf("2") < 0;
    if (!1 && args.attempt >= 3 && args.attempt <= 5) {
      args.results.push.apply(args.results, args.results0),
        (args.results = ti.filterSearchResults(args.results, args.reverse));
      if (args.results.length > 0)
        if (
          !0 ||
          args.results.length == 1 ||
          args.results0.length >= args.results.length
        )
          if (args.results[0].legs.length != 1 || args.results[0].legs[0].route)
            if (!no_later_trips) {
              (args.attempt = 6),
                (args.results0 = args.results),
                (args.no_just_walking = !0),
                dijkstra(
                  args,
                  args.reverse == 1
                    ? args.results[0].start_time + 1
                    : args.results[0].finish_time - 1,
                  args.reverse
                );
              return;
            }
    }
    if (!no_later_trips && args.attempt < 999)
      if (
        +new Date() - args.timeStarted <= (args.timeout || 5e3) ||
        args.curr_reverse == args.reverse ||
        args.start_time == 1
      )
        if (
          args.attempt >= 6 &&
          (args.curr_reverse != args.reverse ||
            (args.results.length > 0 &&
              (cfg.defaultCity === "intercity" ||
                args.attempt < 11 ||
                args.start_time == 1) &&
              (args.reverse == 1
                ? args.results[0].start_time < 1800
                : args.results[0].finish_time > 0)))
        ) {
          var start_time = null,
            finish_time = null;
          for (var i = 0; i < args.results.length; i++)
            if (args.curr_reverse == 1) {
              if (
                start_time === null ||
                start_time > args.results[i].start_time
              )
                start_time = args.results[i].start_time;
              if (
                finish_time === null ||
                finish_time > args.results[i].finish_time
              )
                finish_time = args.results[i].finish_time;
            } else {
              if (
                start_time === null ||
                start_time < args.results[i].start_time
              )
                start_time = args.results[i].start_time;
              if (
                finish_time === null ||
                finish_time < args.results[i].finish_time
              )
                finish_time = args.results[i].finish_time;
            }
          (args.curr_reverse *= -1),
            ++args.attempt,
            args.results0.push.apply(args.results0, args.results),
            (args.no_just_walking = !0),
            args.curr_reverse == args.reverse
              ? (args.curr_reverse == 1
                  ? ((time =
                      start_time !== null && start_time > args.curr_time
                        ? start_time
                        : args.curr_time),
                    (cfg.defaultCity != "intercity" ||
                      time == args.curr_time) &&
                      ++time)
                  : ((time =
                      finish_time !== null && finish_time < args.curr_time
                        ? finish_time
                        : args.curr_time),
                    (cfg.defaultCity != "intercity" ||
                      time == args.curr_time) &&
                      --time),
                (args.curr_time = time),
                dijkstra(args, time, args.curr_reverse))
              : (args.curr_reverse == -1
                  ? ((time = finish_time),
                    args.curr_time < start_time &&
                      start_time !== null &&
                      (args.curr_time = start_time))
                  : ((time = start_time),
                    args.curr_time > finish_time &&
                      finish_time !== null &&
                      (args.curr_time = finish_time)),
                dijkstra(
                  args,
                  time,
                  args.curr_reverse,
                  args.curr_time - 0 * args.reverse
                ));
          return;
        }
    args.attempt >= 6 && args.results.push.apply(args.results, args.results0),
      (args.results = ti.filterSearchResults(
        args.results,
        args.reverse,
        args.start_time == 1
      )),
      args.results_max > 0 &&
        args.results.length > args.results_max &&
        (args.results.length = args.results_max),
      (args.search_duration = +new Date() - args.timeStarted);
    if (args.shapes_url || ti.SERVER === !0) {
      (ti.timeout_for_search_results = setTimeout(
        ti.returnSearchResults,
        cfg.timeout_for_geometry || 1e3
      )),
        ti.applyShapes(!0);
      return;
    }
    if (
      typeof cfg == "object" &&
      cfg.defaultCity === "disable_temporary_latvia" &&
      args.attempt <= 999
    ) {
      typeof pg === "object" &&
        ((pg.optimalSearchRunning = !1),
        (($("online_results") || {}).innerHTML = "")),
        (args.attempt = 1e3);
      var start_finish_stops = {};
      (args.online_results = []), (args.online_results_required_count = 0);
      for (var i = 0; i < args.results.length; i++) {
        var result = args.results[i],
          legs = result.legs;
        for (var j = 0; j < legs.length; j++) {
          var leg = legs[j];
          if (leg.route) {
            var start_stop =
                leg.start_stop && ti.fGetStopDetails(leg.start_stop.id),
              finish_stop =
                leg.finish_stop && ti.fGetStopDetails(leg.finish_stop.id);
            start_stop &&
              start_stop.info &&
              finish_stop &&
              finish_stop.info &&
              !start_finish_stops[
                start_stop.info + ";separator;" + finish_stop.info
              ] &&
              ((start_finish_stops[
                start_stop.info + ";separator;" + finish_stop.info
              ] = [start_stop.info, finish_stop.info]),
              ++args.online_results_required_count);
          }
        }
      }
      for (var i in start_finish_stops) {
        var start_stop = start_finish_stops[i][0],
          finish_stop = start_finish_stops[i][1],
          key = "timetable" + args.date.yyyymmdd() + start_stop + finish_stop;
        (key += "7xk$n1Lp1*9E!3"), (key = SHA1(key));
        var query_url = "/api/ltc.php?action=timetable";
        (query_url += "&date=" + args.date.yyyymmdd()),
          (query_url += "&from=" + start_stop),
          (query_url += "&to=" + finish_stop),
          (query_url += "&signature=" + key),
          ti.SERVER === !0
            ? typeof http != "undefined" &&
              http.get(
                {
                  host: "bezrindas.lv",
                  port: 80,
                  path: query_url,
                },
                function (a) {
                  a.setEncoding("utf8");
                  var b = "";
                  a.on("data", function (a) {
                    b += a;
                  }),
                    a.on("end", function () {
                      if (b) {
                        var a = JSON.parse(b);
                        a.contents && (a = a.contents),
                          a &&
                            a.length &&
                            args.online_results.push.apply(
                              args.online_results,
                              [].concat(a)
                            ),
                          --args.online_results_required_count == 0 &&
                            ti.findTrips(args);
                      }
                    });
                }
              )
            : ((query_url = "http://bezrindas.lv" + query_url),
              (args.online_query_url = query_url),
              (query_url =
                "http://www.stops.lt/latviatest/proxy.php?url=" +
                encodeURIComponent(query_url)),
              (($("online_results") || {}).innerHTML =
                "<br/>Waiting data from bezrindas.lv for stops pairs: " +
                args.online_results_required_count),
              ti.fDownloadUrl(
                "get",
                query_url,
                function (a) {
                  if (a) {
                    args.online_results_JSON = a;
                    var b = JSON.parse(a);
                    b.contents && (b = b.contents),
                      b &&
                        b.length &&
                        args.online_results.push.apply(
                          args.online_results,
                          [].concat(b)
                        ),
                      (($("online_results") || {}).innerHTML =
                        "<br/>Waiting data from bezrindas.lv for stops pairs: " +
                        (args.online_results_required_count - 1)),
                      --args.online_results_required_count == 0 &&
                        ti.findTrips(args);
                  }
                },
                !0
              ));
      }
      if (args.online_results_required_count > 0) return;
    }
    (ti.args = args), ti.returnSearchResults();
  }
}),
  (ti.returnSearchResults = function () {
    ti.timeout_for_search_results &&
      (clearTimeout(ti.timeout_for_search_results),
      (ti.timeout_for_search_results = null));
    var a = ti.args;
    (a.results = ti.finalizeSearchResults(a, a.online_results)),
      (a.transport = a.transportOriginal),
      typeof pg === "object" && (pg.optimalSearchRunning = !1);
    if (a.callback) a.callback(a, !0);
    else {
      if (typeof pg === "object") return a;
      if (typeof window == "object")
        document.body.innerHTML = JSON.stringify(a.results);
      else return a;
    }
  }),
  (ti.applyShapes = function (bDownloadShapes) {
    if (ti.args && ti.args.results && ti.args.results.length) {
      var shapes_missing = 0,
        shape_name;
      if (bDownloadShapes)
        for (shape_name in ti.shapes)
          ti.shapes[shape_name] === !1 && (ti.shapes[shape_name] = "");
      for (var i = 0; i < ti.args.results.length; i++) {
        var legs = ti.args.results[i].legs;
        for (var j = 0; j < legs.length; j++) {
          var leg = legs[j];
          if (leg.shape) continue;
          var shape_name, lat1, lng1, lat2, lng2;
          if (leg.route) {
            var route = ti.fGetRoutes(leg.route);
            shape_name =
              route.shape_id ||
              ti.toAscii(
                [
                  route.city,
                  route.transport == "eventbus" ? "bus" : route.transport,
                  route.num,
                  route.dirType,
                ].join("_"),
                !0
              );
          } else
            (lat1 = leg.start_stop.lat),
              (lng1 = leg.start_stop.lng),
              (lat2 = leg.finish_stop.lat),
              (lng2 = leg.finish_stop.lng),
              (shape_name = ["walk", lat1, lng1, lat2, lng2].join(";"));
          if (ti.shapes[shape_name]) {
            leg.shape = ti.shapes[shape_name];
            if (leg.route)
              leg.shape = ti.splitShape(
                leg.shape,
                leg.start_stop.lat,
                leg.start_stop.lng,
                leg.finish_stop.lat,
                leg.finish_stop.lng
              );
            else
              try {
                var w;
                JSON
                  ? (w = JSON.parse(ti.shapes[shape_name]))
                  : (w = eval(
                      "(function(){return " + ti.shapes[shape_name] + ";})()"
                    )),
                  (w = w.routes || {}),
                  (w = (w.features || [])[0] || {}),
                  (leg.distance = (w.attributes || {}).Total_Meters),
                  (w = (w.geometry || {}).paths || [[]]),
                  (w = w[0]),
                  (leg.shape = w);
              } catch (error) {
                typeof ti.print_log == "function" &&
                  (ti.print_log(
                    "WARNING: invalid JSON data from walking path service: " +
                      error
                  ),
                  ti.print_log("JSON data: " + ti.shapes[shape_name]),
                  (ti.shapes[shape_name] = !1));
              }
          } else if (ti.shapes[shape_name] === !1) ++shapes_missing;
          else if (bDownloadShapes) {
            (ti.shapes[shape_name] = !1), ++shapes_missing;
            var url = cfg.walk_path_url;
            if (leg.route) url = ti.args.shapes_url + shape_name + ".txt";
            else if (url) {
              var p1 = ti.LatLngToEN(lat1, lng1),
                p2 = ti.LatLngToEN(lat2, lng2);
              (url = url.replace("$x1", p1[0])),
                (url = url.replace("$y1", p1[1])),
                (url = url.replace("$x2", p2[0])),
                (url = url.replace("$y2", p2[1]));
            }
            var handler = (function () {
              var a = shape_name,
                b = url,
                c = +new Date();
              return function (d) {
                d.indexOf("DOCTYPE") < 0
                  ? ((ti.shapes[a] = d),
                    ti.applyShapes(),
                    !ti.timeout_for_search_results &&
                      ti.print_log == "function" &&
                      ti.print_log(
                        "WARNING: late response in " +
                          (+new Date() - c) +
                          "ms from " +
                          b
                      ))
                  : ti.print_log == "function" &&
                    ti.print_log(
                      "WARNING: response from walking path service for requested shape " +
                        a +
                        " is not JSON data:\n" +
                        d
                    );
              };
            })();
            leg.route
              ? ti.fDownloadUrl(
                  "get",
                  ti.args.shapes_url + shape_name + ".txt",
                  handler
                )
              : url && ti.fDownloadUrl("get", url, handler);
          }
        }
      }
      shapes_missing == 0 && ti.returnSearchResults();
    }
  });
function dijkstra(a, b, c, d) {
  var e = new Date().getFullYear(),
    f = [];
  typeof cfg == "object" &&
    cfg.defaultLanguage == "lt" &&
    ((f = [101, 216, 311, 501, 624, 706, 815, 1101, 1102, 1224, 1225, 1226]),
    (ti.specialWeekdays[ti.dateToDays(new Date(2024, 3, 1))] =
      cfg.defaultCity == "vilnius" ? 6 : 7)),
    typeof cfg == "object" &&
      cfg.defaultLanguage == "ee" &&
      ((f = [101, 224, 501, 623, 624, 820, 1224, 1225, 1226]),
      (ti.specialWeekdays[ti.dateToDays(new Date(2024, 2, 29))] = 7),
      (ti.specialWeekdays[ti.dateToDays(new Date(2025, 3, 18))] = 7),
      (ti.specialWeekdays[ti.dateToDays(new Date(2026, 3, 3))] = 7));
  for (var g = 0; g <= f.length - 1; g++) {
    var h = Math.trunc(f[g] / 100),
      i = f[g] % 100,
      i = ti.dateToDays(new Date(e, h - 1, i));
    ti.specialWeekdays[i] ||
      (ti.specialWeekdays[i] = cfg.defaultCity == "vilnius" ? 6 : 7);
  }
  var j = "",
    k = "a",
    l = a.mode === "vintra",
    m = typeof cfg == "object" && cfg.isNato,
    n = !1,
    o = l || ti.use_walking_distances;
  typeof cfg == "object" &&
    (cfg.defaultCity == "latvia"
      ? ((j = ";bus;trol;tram;minibus;"), (k = "nothing"))
      : cfg.defaultCity == "klaipeda" && (k = "nothing"),
    cfg.defaultCity == "intercity" && (n = !0));
  var p = !1,
    q = c == -1 ? a.finish_stops.split(",") : a.start_stops.split(","),
    r = c == -1 ? a.start_stops.split(",") : a.finish_stops.split(","),
    s = a.finish_stops === "0;0";
  c ||
    ((p = !0),
    (c = 1),
    (a.direct_routes = []),
    r && !q && ((q = r), (r = ""), (c = -1))),
    (a.results = []),
    (a.curr_reverse = c),
    (b = typeof b != "undefined" ? b * c : 0),
    (d = typeof d != "undefined" ? d * c : 7200);
  var t = b,
    u = c == 1 ? "1" : "2",
    v = c == 1 ? "2" : "1",
    w = a.route_nums
      ? "," + a.route_nums.toLowerCase().replace(/\s/g, "") + ","
      : "",
    x = a.lowFloor,
    y = a.bicycles,
    z = a.include_private;
  w.indexOf(",z,") >= 0 && ((x = !0), (w = w.replace(/,z,/g, ""))),
    a.date || (a.date = new Date());
  var A = ti.dateToDays(a.date),
    B = "" + (a.date.getDay() || 7),
    C = "" + (ti.specialWeekdays[A] || ""),
    D = C == "7";
  C || (C = B);
  var E = a.max_changes || Number.POSITIVE_INFINITY,
    F = a.change_time || 3;
  if (l || cfg.defaultCity == "xxxintercity") F = 0;
  var G = a.walk_speed_kmh || 4,
    H = a.walk_max || 500;
  H > 0 && ((H = p ? 0.05 : H / 1e3), (H = H * H));
  var I = (a.walk_min || 10) / 1e3;
  I = I * I;
  var J = ti.stops,
    K = ti.routes,
    L = ti.specialDates,
    M = a.direct_routes || [],
    N = a.transport,
    O = a.operators,
    P = a.removed_trips ? "," + a.removed_trips.replace(/\s/g, "") + "," : "",
    Q = a.added_trips ? "," + a.added_trips.replace(/\s/g, "") + "," : "",
    R = a.removed_trips_by_date,
    S = a.added_trips_by_date,
    T = a.commercial,
    U = a.routetypes,
    V = U != 1,
    W = a.area,
    X = 0,
    Y = a.middle_stops;
  if (Y) {
    X = 10;
    for (var Z in Y) {
      var $ = J[Z].routes;
      for (var _ = 0; _ < $.length; _ += 2) K[$[_]].available = 10;
    }
  }
  var ba,
    bb,
    bc = 55.72518472994023,
    bd = 21.0978829006047,
    be = 55.67141189717329,
    bf = 21.1457854498415,
    bg = {},
    bh = {},
    bi = {};
  for (var bj = 1, bk = q; bj <= 2; ++bj) {
    for (var _ = bk.length; --_ >= 0; )
      if (bk[_].charAt(0) == k) {
        var bl = J[bk[_]];
        if (bl)
          for (var g = bl.neighbours.length; --g >= 0; )
            bk.push(bl.neighbours[g]);
        bk[_] = "removed stop";
      } else if (bk[_].indexOf(";") > 0) {
        var bm = bk[_].split(";"),
          bn = parseFloat(bm[0]),
          bo = parseFloat(bm[1]);
        if (bn > 1e3 || bo > 1e3) {
          var bp = ti.ENtoLatLng(bn, bo);
          (bn = bp[0]), (bo = bp[1]);
        }
        bj == 1
          ? (ba = {
              id: bk[_],
              lat: bn,
              lng: bo,
              neighbours: [],
            })
          : ((bb = {
              id: bk[_],
              lat: bn,
              lng: bo,
            }),
            (bh[bb.id] = !0),
            ba && (bi[ba.id] = !0));
      }
    bk = r;
  }
  var bq = [],
    br = {};
  br[t] = [];
  for (var Z in J) {
    var bl = J[Z];
    (bl.time = Number.POSITIVE_INFINITY),
      (bl.trip_date = null),
      s && (bl.rideStart = bl.rideEnd = 0);
    if (!bl.lat || !bl.lng) continue;
    if (ba) {
      var bs = (ba.lng - bl.lng) * 58.1,
        bt = (ba.lat - bl.lat) * 111.2,
        bu = bs * bs + bt * bt;
      if (bl.id != "gps")
        if (bu > I) {
          if (bu <= H || (bu <= 1 && bl.id.slice(0, 4) == "aqua")) {
            var bv = ["distance", ba.lat, ba.lng, bl.id].join(";");
            (bu = ti.distances[bv]),
              bu ? (bu *= bu) : o && bu !== 0 && (bu = H + 1),
              (!bu || bu <= H || (bu <= 1 && bl.id.slice(0, 4) == "aqua")) &&
                ba.neighbours.push(bl.id),
              typeof cfg == "object" &&
                cfg.defaultCity == "latvia" &&
                bl.city &&
                bl.city.toLowerCase().indexOf("latvija") < 0 &&
                (N.internationalbus = !0),
              typeof cfg == "object" &&
                cfg.defaultCity == "intercity" &&
                bl.city != "LT" &&
                (N.internationalbus = !0);
          }
        } else q.push(bl.id), (ba.remove = !0);
    }
    if (bb) {
      var bs = (bb.lng - bl.lng) * 58.1,
        bt = (bb.lat - bl.lat) * 111.2,
        bu = bs * bs + bt * bt;
      bl.id == "1902" && (g = g),
        bu <= I && bl.id != "gps" && (r.push(bl.id), (bb.remove = !0));
      if (bu <= H && bl.id != "gps") {
        var bv = ["distance", bb.lat, bb.lng, bl.id].join(";");
        (bu = ti.distances[bv]),
          bu ? (bu *= bu) : o && bu !== 0 && (bu = H + 1);
        if (!bu || bu <= H) {
          bi[bl.id] = !0;
          var bw = bl.neighbours;
          for (var g = bw.length; --g >= 0; )
            bl.name === (J[bw[g]] || {}).name && (bi[bw[g]] = !0);
        }
        typeof cfg == "object" &&
          cfg.defaultCity == "latvia" &&
          bl.city &&
          bl.city.toLowerCase().indexOf("latvija") < 0 &&
          (N.internationalbus = !0),
          typeof cfg == "object" &&
            cfg.defaultCity == "intercity" &&
            bl.city != "LT" &&
            (N.internationalbus = !0);
      }
    }
  }
  for (var g = q.length; --g >= -1; ) {
    var bl = g >= 0 ? J[q[g]] : ba;
    if (bl) {
      if (g == -1 && ba.remove) {
        ba = null;
        break;
      }
      (bl.prev_stop = !1),
        (bl.route = null),
        (bl.changes = 0),
        (bl.visited_stops = 0),
        (bg[bl.id] = !0),
        g == -1 && c == -1 && F ? ((t -= F), (br[t] = [ba])) : br[t].push(bl),
        (bl.time = t),
        typeof cfg == "object" &&
          cfg.defaultCity == "latvia" &&
          bl.city &&
          bl.city.toLowerCase().indexOf("latvija") < 0 &&
          (N.internationalbus = !0),
        typeof cfg == "object" &&
          cfg.defaultCity == "intercity" &&
          bl.city != "LT" &&
          (N.internationalbus = !0);
    }
  }
  for (var g = r.length; --g >= 0; ) {
    if (g == -1 && bb.remove) {
      (bh[bb.id] = !1), (bb = null), (bi = {});
      break;
    }
    var Z = r[g],
      bl = J[Z];
    bl &&
      ((bh[Z] = !0),
      typeof cfg == "object" &&
        cfg.defaultCity == "latvia" &&
        bl.city &&
        bl.city.toLowerCase().indexOf("latvija") < 0 &&
        (N.internationalbus = !0),
      typeof cfg == "object" &&
        cfg.defaultCity == "intercity" &&
        bl.city != "LT" &&
        (N.internationalbus = !0));
  }
  if (!0 || p)
    for (var bx = K.length; --bx >= 0; ) {
      var by = ti.fGetRoutes(bx),
        bz = K[bx];
      (bz.weekdays = by.weekdays),
        (bz.available =
          (N && N[by.transport] === !1) ||
          (X && X !== bz.available) ||
          (w && w.indexOf("," + by.num.toLowerCase() + ",") < 0) ||
          (T && T != by.commercial) ||
          (U && V != !_transport_data[by.transport].region) ||
          (W && W != by.cities[0])
            ? 0
            : 1);
    }
  for (var g = M.length; --g >= 0; ) M[g].available = 0;
  for (var bx in K) {
    var bz = K[bx];
    bz.trip_start_time = c * Number.POSITIVE_INFINITY;
  }
  a.finish_stops || (r = !1);
  var bA = +new Date(),
    bB,
    bC = 0,
    bD = function () {
      for (var b = 0; ; ) {
        for (var e; !(e = br[t]) || !e.length; )
          if (++t > d) {
            if (!bq.length) {
              a.results = [];
              if (p) return [];
              a.callback2
                ? window.setTimeout(a.callback2, 10)
                : typeof window === "object"
                ? window.setTimeout(function () {
                    ti.findTrips(a);
                  }, 10)
                : ti.findTrips(a);
              return;
            }
            e = !1;
            break;
          }
        if (!e) break;
        e = e.pop();
        if (e.time < t || e.changes < 0) continue;
        if (++b == 3e3 && !p && typeof window == "object") {
          if (+new Date() - bA > 3e4) {
            (a.results = []),
              window.setTimeout(function () {
                ti.findTrips(a);
              }, 10);
            return;
          }
          if (typeof bD == "function") {
            window.setTimeout(bD, 5);
            return;
          }
        }
        if (bh[e.id]) {
          d > t + 60 && (d = t + 60);
          continue;
        }
        var f = e.changes || 0,
          g = e.visited_stops || 0,
          h = null,
          i = null;
        if (!p && H > 0 && (f > 0 || !a.no_start_walking)) {
          var k = e;
          while (!k.route && k.prev_stop) k = k.prev_stop;
          var q = k.lat,
            w = k.lng,
            I = e.neighbours;
          for (var L = I.length; --L >= -1; ) {
            if (typeof cfg === "object" && cfg.defaultCity === "kaunas") {
              if (
                {
                  549: !0,
                  548: !0,
                  547: !0,
                  546: !0,
                  545: !0,
                  708: !0,
                  709: !0,
                  805: !0,
                  786: !0,
                  787: !0,
                  "787a": !0,
                  397: !0,
                  398: !0,
                  403: !0,
                  404: !0,
                  405: !0,
                  641: !0,
                }[e.id] &&
                {
                  20: !0,
                  21: !0,
                  22: !0,
                  23: !0,
                  24: !0,
                  25: !0,
                  26: !0,
                  27: !0,
                  196: !0,
                  195: !0,
                  664: !0,
                  201: !0,
                  202: !0,
                  203: !0,
                  204: !0,
                  207: !0,
                  208: !0,
                  209: !0,
                  210: !0,
                }[I[L]]
              )
                continue;
              if (
                {
                  549: !0,
                  548: !0,
                  547: !0,
                  546: !0,
                  545: !0,
                  708: !0,
                  709: !0,
                  805: !0,
                  786: !0,
                  787: !0,
                  "787a": !0,
                  397: !0,
                  398: !0,
                  403: !0,
                  404: !0,
                  405: !0,
                  641: !0,
                }[I[L]] &&
                {
                  20: !0,
                  21: !0,
                  22: !0,
                  23: !0,
                  24: !0,
                  25: !0,
                  26: !0,
                  27: !0,
                  196: !0,
                  195: !0,
                  664: !0,
                  201: !0,
                  202: !0,
                  203: !0,
                  204: !0,
                  207: !0,
                  208: !0,
                  209: !0,
                  210: !0,
                }[e.id]
              )
                continue;
            }
            if (
              typeof cfg === "object" &&
              cfg.defaultCity.indexOf("viln") == 0
            ) {
              if (
                {
                  5004: !0,
                  5006: !0,
                  5007: !0,
                  2367: !0,
                  2366: !0,
                  "0906": !0,
                  "0905": !0,
                  "0904": !0,
                  "0903": !0,
                  "0902": !0,
                  "0901": !0,
                  2309: !0,
                  2308: !0,
                  2310: !0,
                  2311: !0,
                  2316: !0,
                  2317: !0,
                }[e.id] &&
                {
                  5003: !0,
                  2368: !0,
                  2369: !0,
                  1103: !0,
                  1104: !0,
                  1107: !0,
                  1110: !0,
                  1113: !0,
                  1114: !0,
                  1115: !0,
                  1116: !0,
                  2314: !0,
                  2315: !0,
                  2318: !0,
                  2319: !0,
                  2320: !0,
                }[I[L]]
              )
                continue;
              if (
                {
                  5004: !0,
                  5006: !0,
                  5007: !0,
                  2367: !0,
                  2366: !0,
                  "0906": !0,
                  "0905": !0,
                  "0904": !0,
                  "0903": !0,
                  "0902": !0,
                  "0901": !0,
                  2309: !0,
                  2308: !0,
                  2310: !0,
                  2311: !0,
                  2316: !0,
                  2317: !0,
                }[I[L]] &&
                {
                  5003: !0,
                  2368: !0,
                  2369: !0,
                  1103: !0,
                  1104: !0,
                  1107: !0,
                  1110: !0,
                  1113: !0,
                  1114: !0,
                  1115: !0,
                  1116: !0,
                  2314: !0,
                  2315: !0,
                  2318: !0,
                  2319: !0,
                  2320: !0,
                }[e.id]
              )
                continue;
            }
            var M;
            if (L < 0)
              if (bi[e.id]) M = bb;
              else break;
            else
              (M = J[I[L]] || {
                lat: 999,
                lng: 999,
              }),
                bi[M.id] && (M = bb);
            var N = k.lng,
              T = M.lng;
            if (N < bf || T < bf) {
              var U = k.lat,
                V = M.lat;
              if (
                ((bc - be) * (N - bd) + (bf - bd) * (U - bc)) *
                  ((bc - be) * (T - bd) + (bf - bd) * (V - bc)) <
                0
              )
                continue;
            }
            var W = (w - M.lng) * 58.1,
              X = (q - M.lat) * 111.2;
            M.id == "aqua010" && (W = W);
            var Z = e.distances && e.distances[L];
            !1 && Z ? (Z = (Z * Z) / 1e6) : (Z = W * W + X * X);
            if (M === k || M === e) continue;
            if (M === bb) {
              if (k === ba && M.id.indexOf(";") > 0) {
                if (o) {
                  Z = ti.distances[a.walking_shape_name];
                  if (Z) Z *= Z;
                  else continue;
                }
                if (Z > H) continue;
              } else if (o) {
                var $ = ["distance", bb.lat, bb.lng, k.id].join(";");
                Z = ti.distances[$];
                if (Z) Z *= Z;
                else continue;
              }
            } else if (Z > 1 || M.id.slice(0, 4) != "aqua")
              if (Z > H && (!e.name || M.name !== e.name)) continue;
            Z = Math.sqrt(Z);
            if (o)
              if (k === ba && M !== bb) {
                var $ = ["distance", ba.lat, ba.lng, M.id].join(";");
                Z = ti.distances[$];
                if (!Z) continue;
              } else if (bi[M.id] && bb) {
                var $ = ["distance", bb.lat, bb.lng, k.id].join(";"),
                  _ = ti.distances[$];
                $ = ["distance", bb.lat, bb.lng, M.id].join(";");
                var bj = ti.distances[$];
                _ && bj && ((_ = Math.abs(_ - bj)), Z < _ && (Z = _));
              }
            var bk = Math.round((Z / G) * 60);
            bk += k.time;
            var bl = bk;
            if (!k.route || (!k.prev_stop && c < 0)) bk += F;
            bk < t && (bk = bl = t);
            if (bk > d) continue;
            if (bh[M.id])
              if (
                !1 &&
                f === 1 &&
                k.prev_stop &&
                typeof cfg === "object" &&
                cfg.defaultCity === "latvia"
              )
                (e = k.prev_stop), (h = k.id), (i = k.prev_stop_start_time);
              else {
                if (bk > M.time) continue;
                if (bk == M.time && f >= M.changes) continue;
                var bm = {
                  legs: [
                    {
                      start_stop: k,
                      start_time: c * (k.time - (k.route ? F : 0)),
                      finish_stop: M,
                      finish_time: c * (bk - F),
                      route: null,
                    },
                  ],
                };
                bq.push(bm);
              }
            else {
              if (bk > M.time) continue;
              if (bk != M.time || f < M.changes)
                (M.route = !1),
                  (M.prev_stop = k),
                  (M.prev_stop_start_time = k.time - (k.route ? F : 0));
              else continue;
            }
            s &&
              (typeof cfg != "object" || cfg.defaultCity != "vilnius"
                ? ((M.rideStart = k.rideStart), (M.rideEnd = bl))
                : k.route &&
                  ((M.rideStart = k.rideStart), (M.rideEnd = k.rideEnd))),
              (M.time = bk),
              (M.changes = f),
              (M.visited_stops = g);
            var bn = br[bk];
            bn ? (bn[bn.length] = M) : (br[bk] = [M]);
          }
        }
        f = e.changes || 0;
        if (f <= E) {
          var bo = e.routes || [];
          for (var L = 0, bp = bo.length; L < bp; L += 2) {
            var bs = K[bo[L]];
            if (p) {
              if (bs.available === 0 && r) continue;
              a.direct_routes.push(bs),
                L + 2 < bp && bo[L + 2] == bo[L] && (L += 2);
            } else if (!bs.available) continue;
            bs.id == 29 && (L = L + 0);
            if (typeof bs.entry == "undefined") {
              typeof bs.times === "string" &&
                (bs.times = ti.explodeTimes(bs.times));
              var bt = ti.fGetRoutes(bs.id);
              (bs.city = bt.city),
                (bs.transport = bt.transport),
                (bs.num = bt.num),
                (bs.stops = bt.stops),
                (bs.platforms = bt.platforms),
                (bs.entry = bt.entry || ""),
                (bs.specialDates = bt.specialDates);
            }
            var bu = bs.times,
              bv = "";
            j && j.indexOf(bs.transport) < 0
              ? e.city.indexOf("riga") < 0
                ? e.city.indexOf("liep") < 0
                  ? e.city.indexOf("jelg") >= 0 && (bv = "jelg")
                  : (bv = "liep")
                : (bv = "riga")
              : e.city == "LT" &&
                bs.transport == "internationalbus" &&
                (bv = "LT");
            var bw = bo[L + 1],
              bx = bs.stops || bs.raw_data.split(";").slice(ti.RT_ROUTESTOPS);
            if ((c == 1 && bw >= bx.length - 1) || (c == -1 && bw == 0))
              continue;
            var by = bs.entry || "";
            if (by.charAt(bw) == v) continue;
            bx[bw] == bx[bw + c] && (bw += c);
            if (!bu) continue;
            var bz = bu.workdays,
              bB = bu.valid_from,
              bC = bu.valid_to,
              bE = bu.exceptions || [],
              bF = bu.trip_operators,
              bG = bu.trip_groups,
              bH = bu.trip_ids,
              bI = bu.tag,
              bJ = bu.times;
            bu = null;
            var bK = "",
              bL,
              bM = 0,
              bN = 0,
              bO = bs.specialDates || [];
            for (var bP = 0, bQ = bO.length; bP < bO.length; bP += 2)
              if ((ti.specialDates[bO[bP]] || {})[A]) {
                (bK = bO[bP + 1]) === "*" && (bK = C);
                break;
              }
            if (bK == "0") continue;
            bK = C;
            if (bs.weekdays)
              if (bs.weekdays.indexOf("!") < 0) {
                if (bs.weekdays.indexOf("~") >= 0 && D) continue;
              } else {
                if (bs.weekdays.indexOf(B) < 0) continue;
                bK = B;
              }
            var bR = i || t;
            if (
              e.route &&
              bs.num === e.route.num &&
              bs.transport === e.route.transport &&
              bs.city === e.route.city
            )
              bR -= F;
            else if (f < 0 || a.mode != "vintra" || i) {
              if (f > 0 && typeof cfg == "object" && n && !i) {
                var bS = bs;
                c == 1 && (bS = e.route || (e.prev_stop && e.prev_stop.route)),
                  bS.minsk && ((bR -= F), (bR += 208));
              } else if (
                f > 0 &&
                typeof cfg == "object" &&
                cfg.defaultCity == "traukiniai" &&
                !i
              ) {
                bR -= F;
                var bS = bs;
                c == -1 && (bS = e.route || (e.prev_stop && e.prev_stop.route)),
                  bS &&
                    (bS.transport == "internationalbus"
                      ? (bR += Math.max(F, 20))
                      : bS.transport == "train"
                      ? (bR += Math.max(F, 10))
                      : (bR += F));
              } else if (
                f > 0 &&
                typeof cfg == "object" &&
                cfg.defaultCity == "latvia" &&
                !i
              ) {
                bR -= F;
                var bS = bs;
                c == -1 && (bS = e.route || (e.prev_stop && e.prev_stop.route)),
                  bS &&
                    (bS.transport == "internationalbus"
                      ? (bR += Math.max(F, 20))
                      : bS.transport == "train"
                      ? (bR += Math.max(
                          F,
                          {
                            1: 10,
                            2: 10,
                            3: 10,
                          }[bS.num.charAt(1)] || 10
                        ))
                      : (bR += Math.max(
                          F,
                          {
                            2: 5,
                            3: 5,
                            4: 10,
                            5: 10,
                            6: 10,
                            7: 15,
                            8: 20,
                          }[bS.num.charAt(0)] || F
                        )));
              }
            } else {
              var bS = bs;
              c == -1 && (bS = e.route || (e.prev_stop && e.prev_stop.route));
              if (bS) {
                var bT = a.transport[bS.transport];
                typeof bT == "number" && bT >= 0 && (bR += bT - F);
              }
            }
            var bU = bR * c;
            bR >= 1440 && (bM = bR - (bR % 1440));
            var bV = !1,
              bW,
              bX = (bW = bz.length),
              bY = c != -1 ? -1 : bX,
              bZ = 999999,
              b$ = 0;
            do {
              var b_ = -1,
                ca = Number.POSITIVE_INFINITY,
                cb,
                cc,
                cd,
                ce = null,
                cf = !p || !Y,
                cg = c * bX;
              for (var ch = bY + bw * bX; bW-- > 0; ) {
                (bY += c), (ch += c);
                if (O) {
                  var ci = O[bF[bY]];
                  if (typeof ci != "string") continue;
                  if (
                    ci != "" &&
                    ("," + ci + ",").indexOf("," + bG[bY] + ",") < 0
                  )
                    continue;
                }
                var cj = bH[bY];
                if (P && P.indexOf("," + cj + ",") >= 0) continue;
                (cb = cc = bJ[ch]), ch == 121 && (ch = 121);
                if (cb < 0) continue;
                if (!l && !m) {
                  if (cb - bU >= 1440 || cb * c - bR >= 1440)
                    cb = bU + ((cb - bU) % 1440);
                  cb < bU == (c == 1) &&
                    cb != bU &&
                    (cb = (bR + 1440) * c - ((bU - cb) % 1440));
                }
                (cc = cb - cc), (cb *= c);
                if (!p && (cb < bR || cb >= ca)) continue;
                cc
                  ? ((cd = (
                      (+B + Math.floor(cc / 1440) + 7) % 7 || 7
                    ).toString()),
                    (bL = A + cc / 1440))
                  : ((cd = bK), (bL = A));
                var ck = (bE[bY] || {})[bL];
                if (ck === !1) continue;
                ck && (cb++, cb--);
                var cl = bB[bY],
                  cm = bC[bY];
                cl > 4e4 && z && (cl -= 4e4),
                  bZ > cl && (bZ = cl),
                  b$ < cm && (b$ = cm);
                if (
                  (cb < ca || p || bV) &&
                  (!C ||
                    bz[bY].indexOf(cd) >= 0 ||
                    cl == cm ||
                    ck ||
                    (bz[bY].charAt(0) == "0" && !m) ||
                    (Q && Q.indexOf("," + cj + ",") >= 0) ||
                    (S && S[bL + ":" + cj])) &&
                  (!x || bI.charAt(bY) === "1" || bI.charAt(bY) === "3") &&
                  (!y || bI.charAt(bY) === "2" || bI.charAt(bY) === "3") &&
                  (!cm || cm >= bL) &&
                  cl <= bL &&
                  (!R || !R[bL + ":" + cj])
                ) {
                  if (bJ[ch + cg] < 0)
                    if (
                      typeof cfg !== "object" ||
                      cfg.defaultCity !== "traukiniai"
                    )
                      continue;
                  if (bz[bY].charAt(0) == "0") {
                    var cn = +bz[bY];
                    if ((bL - bB[bY]) % cn) continue;
                  }
                  (b_ = ch), (ca = cb), (bN = cc);
                  if (l && cb < 1440 && cc <= 0) break;
                  if (bV || p) {
                    if (!r) {
                      var bm = {
                        route: ti.fGetRoutes(bs.id),
                        start_time: ca,
                        date: ce,
                        trip_num: b_ % bX,
                      };
                      (bm.bLowFloorVehicle = bI.charAt(bm.trip_num) == "1"),
                        (bm.route.stopId = e.id),
                        bq.push(bm),
                        (b_ = -2);
                      continue;
                    }
                    break;
                  }
                }
              }
              if (b_ < 0) {
                if (b_ != -2 && !r && bZ <= A && b$ >= A) {
                  var bm = {
                    route: ti.fGetRoutes(bs.id),
                    start_time: -1,
                    trip_num: -1,
                  };
                  (bm.route.stopId = e.id), bq.push(bm);
                }
                break;
              }
              var co,
                cp = (trip_start_time0 = bJ[b_ % bX]);
              cp *= c;
              if (bM || bN)
                (ce = new Date(a.date.valueOf())),
                  ce.setDate(ce.getDate() + Math.floor(bN / 1440));
              p || bV || h
                ? (co = c === -1 ? 1 : bx.length)
                : c * (cp - bs.trip_start_time) < 0
                ? ((co = c == 1 ? bx.length : 1),
                  (bs.trip_start_time = cp + bN),
                  (bs.pos_max = c * bw))
                : ((co = bs.pos_max),
                  co > c * bw &&
                    cp == bs.trip_start_time &&
                    (bs.pos_max = c * bw));
              var cg = c * bX;
              g = e.visited_stops || 0;
              for (var cq = bw; c * (cq += c) < co; ) {
                b_ += cg;
                if (by.charAt(cq) == u) continue;
                var bk;
                if ((bk = bJ[b_]) >= 0) {
                  bk = c * (bk + bN);
                  if (bk > d && !bV) break;
                  if (bk < t && !h) continue;
                  var M;
                  if (!(M = J[bx[cq]])) continue;
                  if (bv && M.city.indexOf(bv) >= 0) continue;
                  ++g, (bk += F);
                  var cr;
                  p && !cf && (cf = M.id in Y);
                  if ((bh[M.id] || M.id === h) && cf) {
                    if (f > 0 && bk > M.time) continue;
                    if (f > 0 && bk == M.time && f >= M.changes) continue;
                    if (n && f == 0 && !bV) {
                      (bV = !0),
                        (bW = bX),
                        (bY = c != -1 ? -1 : bX),
                        a.direct_routes.push(bs);
                      break;
                    }
                    if (p || bV) {
                      bs.available = 0;
                      if (e.id.indexOf(";") < 0)
                        for (var cs = 0; cs < cq; ++cs) {
                          if (by.charAt(cs) == u || bx[cs] == bx[cs + 1])
                            continue;
                          if (bg[bx[cs]] && bJ[b_ + cg * (cs - cq)] >= 0) {
                            (e = J[bx[cs]]),
                              (ca = bJ[b_ + cg * (cs - cq)] + bN);
                            break;
                          }
                        }
                      for (var cs = co; --cs > cq; ) {
                        if (by.charAt(cs) == u || bx[cs] == bx[cs - 1])
                          continue;
                        ++g;
                        if (bh[bx[cs]] && bJ[b_ + cg * (cs - cq)] >= 0) {
                          (M = J[bx[cs]]),
                            (bk = bJ[b_ + cg * (cs - cq)] + F + bN);
                          break;
                        }
                      }
                    }
                    var bm = {
                      direct_trip: bV || p,
                      trip_start_time: trip_start_time0,
                      trip_start_time_adjusted: trip_start_time0 + bN,
                      legs: [
                        {
                          start_stop: e,
                          start_time: c * ca,
                          time_adjusted: bN,
                          trip_date: ce,
                          trip_start_time: trip_start_time0,
                          finish_stop: M,
                          finish_time: c * (bk - F),
                          route: bs,
                          trip_num: b_ % cg,
                          start_pos: c >= 0 ? bw : cq,
                          finish_pos: c >= 0 ? cq : bw,
                        },
                      ],
                    };
                    bq.push(bm), (cq = co);
                    if (bV && bk >= M.time) break;
                  } else {
                    if (p || bV || h) continue;
                    if (bk >= (cr = M.time)) {
                      if (cr < t) break;
                      continue;
                    }
                    if (bs.available === 2) {
                      (M.time = bk),
                        (M.changes = -1),
                        (M.visited_stops = g),
                        (M.trip_date = ce),
                        (M.trip_start_time = trip_start_time0),
                        (M.time_adjusted = bN);
                      continue;
                    }
                    (M.route = bs),
                      (M.prev_stop = e),
                      (M.prev_stop_start_time = ca),
                      (M.trip_num = b_ % cg),
                      (M.start_pos = c >= 0 ? bw : cq),
                      (M.finish_pos = c >= 0 ? cq : bw);
                  }
                  (M.time = bk),
                    (M.trip_date = ce),
                    (M.trip_start_time = trip_start_time0),
                    (M.time_adjusted = bN),
                    (M.changes = f + 1),
                    (M.visited_stops = g),
                    s &&
                      (typeof cfg != "object" || cfg.defaultCity != "vilnius"
                        ? ((M.rideEnd = bk - F),
                          M.id == "00105-1" && (--f, ++f),
                          f == 0 && e.prev_stop
                            ? (M.rideStart =
                                ca - (e.time - e.prev_stop_start_time))
                            : (M.rideStart = e.rideStart || ca))
                        : ((M.rideStart = f > 0 ? e.rideStart : ca),
                          (M.rideEnd = bk - F)));
                  var bn = br[bk];
                  bn ? (bn[bn.length] = M) : (br[bk] = [M]);
                }
              }
            } while (p || bV);
            bJ = null;
          }
        }
      }
      if (!r) {
        bq.sort(function (a, b) {
          if (a.route.sortKey < b.route.sortKey) return -1;
          if (a.route.sortKey > b.route.sortKey) return 1;
          if (a.start_time < b.start_time) return -1;
          if (a.start_time > b.start_time) return 1;
          return 0;
        });
        return bq;
      }
      var ct = {},
        cu = Number.POSITIVE_INFINITY;
      for (var L = bq.length; --L >= 0; ) {
        var bm = bq[L],
          cv = bm.legs[0].route ? ";" + bm.legs[0].route.id : "",
          cw = bm.legs[bm.legs.length - 1];
        (bm.finish_time = cw.finish_time),
          (bm.walk_time = cw.route
            ? 0
            : Math.abs(cw.finish_time - cw.start_time)),
          (bk = bm.departure_time);
        for (var cx = bm.legs[0].start_stop; cx; cx = cx.prev_stop) {
          if (!cx.prev_stop) break;
          cw = {
            start_stop: cx.prev_stop,
            start_time: c * cx.prev_stop_start_time,
            finish_stop: cx,
            finish_time: c * (cx.time - F),
            route: cx.route,
            trip_num: cx.trip_num,
            trip_date: cx.trip_date,
            time_adjusted: cx.time_adjusted,
            start_pos: cx.start_pos,
            finish_pos: cx.finish_pos,
          };
          if (cx.route) {
            cv = c == 1 ? ";" + cx.route.id + cv : cv + ";" + cx.route.id;
            if (c == -1 || !bm.trip_start_time)
              (bm.trip_start_time = cx.trip_start_time || cx.time_adjusted),
                (bm.trip_start_time_adjusted =
                  cx.trip_start_time + cx.time_adjusted);
          } else
            c < 0 &&
              (!cx.prev_stop || !cx.prev_stop.prev_stop) &&
              ((cw.finish_time -= F), (cw.start_time -= F)),
              (bm.walk_time += Math.abs(cw.finish_time - cw.start_time));
          bm.legs.splice(0, 0, cw);
        }
        if (c == -1) {
          var cy = bm.legs[0];
          if (!cy.route) {
            var cz = bm.legs[1];
            cz && cz.route
              ? ((cy.start_time += cz.start_time - cy.finish_time),
                (cy.finish_time = cz.start_time))
              : ((cy.start_time -= F), (cy.finish_time -= F));
          }
          (bm.finish_time = bm.legs[0].start_time),
            (bm.legs = bm.legs.reverse());
          for (var cA = -1, cB = bm.legs.length; ++cA < cB; ) {
            cw = bm.legs[cA];
            var bk = cw.start_time - cw.finish_time;
            !cw.route && cA > 0
              ? ((cw.start_time = bm.legs[cA - 1].finish_time),
                (cw.finish_time = cw.start_time + bk))
              : ((cw.finish_time = cw.start_time), (cw.start_time -= bk));
            var e = cw.finish_stop;
            (cw.finish_stop = cw.start_stop), (cw.start_stop = e);
          }
        }
        var cy = bm.legs[0],
          cz = bm.legs[1];
        if (!cy.route)
          if (cz && cz.route) {
            var bT = F;
            if (a.mode == "vintra") {
              bT = a.transport[cz.route.transport];
              if (typeof bT != "number" || bT < 0) bT = F;
            }
            (cy.start_time += cz.start_time - bT - cy.finish_time),
              (cy.finish_time = cz.start_time - bT);
          } else {
            if (a.no_just_walking) continue;
            (bm.just_walking = !0), (bm.direct_trip = !0);
          }
        (bm.start_time = bm.legs[0].start_time),
          cv == ""
            ? ((cv = "W"), (bm.code = cv), (cu = bm.walk_time))
            : ((cv += ";"),
              (bm.code = cv),
              bm.direct_trip && (cv = "T" + bm.legs[0].start_time + "T" + cv));
        var cC = ct[cv];
        if (
          !cC ||
          (c == 1 && bm.finish_time < cC.finish_time) ||
          (c != 1 && bm.start_time > cC.start_time)
        )
          ct[cv] = bm;
      }
      if (p) a.results = bq;
      else {
        var cD = [];
        for (var cv in ct) {
          var bm = ct[cv],
            cE = bm.code;
          if (bm.walk_time >= cu && cv != "W") continue;
          for (var L = cD.length; --L >= 0; ) {
            var cF = cD[L];
            if (cF.code.indexOf(cE) >= 0 || cE.indexOf(cF.code) >= 0)
              if (
                (c == 1 && cF.finish_time <= bm.finish_time) ||
                (c != 1 && cF.start_time >= bm.start_time)
              ) {
                if (
                  cF.walk_time + cF.travel_time <=
                    bm.walk_time + bm.travel_time &&
                  cE.length >= cF.code.length
                )
                  break;
              } else
                !cF.direct_trip &&
                  cF.walk_time + cF.travel_time >=
                    bm.walk_time + bm.travel_time &&
                  cD.splice(L, 1);
          }
          (L < 0 || bm.direct_trip) && cD.push(bm);
        }
        for (var L = cD.length; --L >= 0; ) {
          var bm = cD[L];
          a.reverseOriginal == -1
            ? (bm.code = bm.code + "T" + bm.trip_start_time_adjusted + "T")
            : (bm.code = "T" + bm.trip_start_time_adjusted + "T" + bm.code);
        }
        (a.results = cD),
          typeof window === "object"
            ? window.setTimeout(function () {
                ti.findTrips(a);
              }, 1)
            : ti.findTrips(a);
      }
    };
  if (typeof bD == "function") return bD();
}
(ti.filterSearchResults = function (a, b, c) {
  if (ti.args.time_window) {
    b == -1
      ? a.sort(function (a, b) {
          return -(a.finish_time - b.finish_time);
        })
      : a.sort(function (a, b) {
          return a.start_time - b.start_time;
        });
    for (var d = a.length; --d >= 1; ) {
      var e = a[d];
      if (b == -1) {
        if (ti.args.start_time - e.finish_time <= ti.args.time_window) break;
      } else if (e.start_time - ti.args.start_time <= ti.args.time_window)
        break;
    }
    a.length = d + 1;
  }
  if (ti.args && ti.args.mode && ti.args.mode.indexOf("vintra") >= 0) {
    var f = 0.64,
      g = 0.93;
    for (var d = a.length; --d >= 0; ) {
      var h = a[d].legs,
        i = 0,
        j = (ticket_expiration_time = 0),
        k = 0;
      for (var l = 0; l <= h.length - 1; l++) {
        var m = h[l],
          n = m.route;
        if (n) {
          m.fares = {};
          var o = 0,
            p,
            q = "";
          for (var r = 1; ; ++r) {
            var s =
                n.route_id ||
                ti.toAscii(
                  [
                    n.city,
                    n.transport == "eventbus" ? "bus" : n.transport,
                    n.num,
                  ].join("_"),
                  !0
                ),
              t = [s, r, m.start_stop.id, m.finish_stop.id].join("#"),
              u = ti.fare_rules[t];
            if (u) {
              o = ti.fare_attributes[u].price || 0;
              break;
            }
            (t = [s, r, "", ""].join("#")), (u = ti.fare_rules[t]);
            if (!u) break;
            var v = ti.fare_attributes[u];
            if (v.transfer_duration)
              if (v.transfer_duration < m.finish_time - m.start_time) {
                if (!q)
                  if (!p || v.transfer_duration > p)
                    (o = v.price), (p = v.transfer_duration);
              } else {
                for (var w = l; --w >= 0; ) {
                  var x = (h[w].fares || {})[u] || {
                    transfer_duration: Number.NEGATIVE_INFINITY,
                  };
                  if (x.transfer_duration >= m.finish_time - h[w].start_time) {
                    (i += x.price - h[w].cost),
                      (h[w].cost = x.price),
                      (o = -1),
                      (q = u),
                      (m.fares = {});
                    break;
                  }
                }
                if (o < 0) {
                  o = 0;
                  break;
                }
                if (!q || v.price < o) (o = v.price), (q = u);
                m.fares[u] = v;
              }
            else if (!q || v.price < o) (o = v.price), (q = u);
          }
          (m.cost = o), (i += o);
        }
        continue;
      }
      if (!!0)
        if (ticket_expiration_time < k) {
          i += f;
          var y = 0;
          for (var l = h.length; --l >= 0; ) {
            var m = h[l];
            if (m.route) {
              y == 0 && (y = m.finish_time - 30);
              if (y > m.start_time) break;
            } else if (y > m.start_time && y > 0) {
              y = m.start_time;
              break;
            }
          }
          j + 30 >= y && (i += f - g);
        }
      a[d].cost = i;
    }
  }
  if (ti.args && ti.args.optimization.indexOf("shortest") >= 0)
    for (var d = a.length; --d >= 0; ) {
      var h = a[d].legs,
        z = 0;
      for (var l = 0; l < h.length; l++) {
        var m = h[l];
        if (m.route) {
          var A = null,
            B;
          for (var C = m.start_pos; C <= m.finish_pos; ++C) {
            var D = m.route.stops[C];
            (B = ti.stops[D]),
              A && B && (z += ti.distance(A.lat, A.lng, B.lat, B.lng)),
              (A = B);
          }
        } else {
          var A = m.start_stop,
            B = m.finish_stop;
          z += ti.distance(A.lat, A.lng, B.lat, B.lng);
        }
      }
      a[d].distance = z;
    }
  else {
    for (var d = a.length; --d >= 0; ) {
      var e = a[d];
      (e.legs[0].route || {}).minsk && (e.minsk = !0);
    }
    for (var d = a.length; --d >= 0; ) {
      var e = a[d];
      if (e.remove) continue;
      for (l = a.length; --l >= 0; ) {
        if (d === l) continue;
        if (
          e.minsk &&
          e.finish_time == a[l].finish_time &&
          Math.abs(e.start_time - a[l].start_time) <= 60
        )
          continue;
        a[l].code.indexOf(e.code) < 0
          ? e.direct_trip &&
            !a[l].direct_trip &&
            e.start_time >= a[l].start_time &&
            e.finish_time <= a[l].finish_time &&
            (a[l].remove = !0)
          : a[l].code == e.code
          ? e.start_time < a[l].start_time || e.finish_time > a[l].finish_time
            ? (e.remove = !0)
            : (a[l].remove = !0)
          : a[l].walk_time < e.walk_time
          ? (e.remove = !0)
          : (a[l].remove = !0);
      }
    }
    var E = 0;
    for (var d = a.length; --d >= 0; ) {
      var e = a[d];
      if (e.remove) continue;
      for (l = a.length; --l >= 0; ) {
        if (d === l) continue;
        if (a[l].remove || a[l].legs.length <= 1) continue;
        if (
          e.minsk &&
          e.finish_time == a[l].finish_time &&
          Math.abs(e.start_time - a[l].start_time) <= 60
        )
          continue;
        a[l].legs.length >= e.legs.length + E &&
          (e.start_time > a[l].start_time && e.finish_time <= a[l].finish_time
            ? (a[l].remove = !0)
            : e.start_time >= a[l].start_time &&
              e.finish_time < a[l].finish_time &&
              (a[l].remove = !0));
      }
    }
  }
  if (cfg.defaultCity == "intercity" || cfg.defaultCity == "latvia")
    for (var d = a.length; --d >= 0; ) {
      var e = a[d];
      e.start_time >= 1440 && (e.remove = !0);
    }
  var F = {};
  for (var d = a.length; --d >= 0; ) {
    var e = a[d];
    e.travel_time = e.finish_time - e.start_time;
    if (e.remove) continue;
    if (e.start_time >= 1680 || e.finish_time < 0) {
      e.remove = !0;
      continue;
    }
    ti.args && ti.args.optimization.indexOf("shortest") >= 0
      ? (e.penalty_time = e.distance)
      : (e.penalty_time = e.travel_time + 5 * e.legs.length);
    var G = e.code;
    e.minsk && (G = "Start" + e.start_time + e.code);
    var H = F[G];
    if (!H || H.penalty_time > e.penalty_time) F[G] = e;
  }
  a = [];
  for (var G in F) a.push(F[G]);
  a.sort(function (a, b) {
    return a.penalty_time - b.penalty_time;
  });
  if (ti.args && ti.args.optimization.indexOf("shortest") >= 0) return a;
  var I = Number.POSITIVE_INFINITY;
  for (var d = a.length; --d >= 0; )
    (a[d].ok = d < 5 ? 1 : 0), I > a[d].travel_time && (I = a[d].travel_time);
  a.sort(function (a, b) {
    return a.finish_time - b.finish_time;
  }),
    b == -1 &&
      a.sort(function (a, b) {
        return -(a.start_time - b.start_time);
      });
  if (cfg.defaultCity != "intercity" && !c) {
    for (var d = a.length; --d >= 0; ) {
      if (a[d].direct_trip) {
        a[d].ok = 1;
        continue;
      }
      var J =
        b == 1
          ? a[d].finish_time - a[0].finish_time
          : a[0].start_time - a[d].start_time;
      if (J > a[0].travel_time / 2 + 60 && cfg.defaultCity != "latvia")
        a[d].ok = 0;
      else if (a[d].penalty_time > 2 * I && J > I && d >= 2) a[d].ok = 0;
      else if (a[d].walk_time > I && J > I && d >= 2) a[d].ok = 0;
      else if (d < 3 || cfg.defaultCity == "latvia" || ti.args.mode == "vintra")
        a[d].ok = 1;
    }
    a.sort(function (a, b) {
      return b.ok - a.ok;
    });
    for (var d = a.length; --d > 0; )
      if (a[d].ok == 1) {
        a.length = d + 1;
        break;
      }
  }
  a.sort(function (a, b) {
    return a.finish_time - b.finish_time;
  }),
    b == -1 &&
      a.sort(function (a, b) {
        return -(a.start_time - b.start_time);
      });
  var K = ti.args.timezone;
  if (K)
    for (var d = a.length; --d >= 0; ) {
      var e = a[d],
        h = e.legs,
        L = -999,
        M = L;
      for (var l = 0; l < h.length; l++) {
        var m = h[l];
        m.travel_time = m.finish_time - m.start_time;
        if (m.route) {
          var N;
          (N = m.start_stop),
            (M = K[N.city + " " + N.name.substring(0, 6)]),
            isNaN(M) && (M = K[N.city] || 0),
            (m.travel_time += M * 60),
            L == -999 && (L = M),
            (N = m.finish_stop),
            (M = K[N.city + " " + N.name.substring(0, 6)]),
            isNaN(M) && (M = K[N.city] || 0),
            (m.travel_time -= M * 60);
        }
      }
      e.travel_time -= (M - L) * 60;
    }
  return a;
}),
  (ti.finalizeSearchResults = function (a, b) {
    var c = a.results || [],
      d = Array(c.length);
    for (var e = 0; e < c.length; e++) {
      var f = c[e],
        g = f.legs,
        h = 0;
      d[e] = {
        start_time: f.start_time - h,
        finish_time: f.finish_time - h,
        travel_time: f.travel_time,
        distance: f.distance,
        cost: f.cost,
        walk_time: f.walk_time,
        direct_trip: f.direct_trip,
        legs: [],
        code: f.code,
      };
      var i = Number.POSITIVE_INFINITY;
      for (var j = 0; j < g.length; j++) {
        var k = g[j],
          l = k.route ? k.route.times.workdays[k.trip_num] : "",
          m = k.route ? k.route.times.trip_ids[k.trip_num] : 0,
          n = k.route ? k.route.times.trip_codes[k.trip_num] : 0,
          o = k.route ? k.route.times.trip_operators[k.trip_num] : "",
          p = k.route ? k.route.times.trip_groups[k.trip_num] : "",
          q = k.start_stop && ti.fGetStopDetails(k.start_stop.id),
          r = k.finish_stop && ti.fGetStopDetails(k.finish_stop.id),
          s =
            (k.route && k.route.platforms && k.route.platforms.split(",")) ||
            [],
          t = {
            trip_num: k.trip_num,
            trip_id: m,
            trip_code: n,
            trip_date: k.trip_date,
            trip_operator: o,
            trip_group: p,
            start_pos: k.start_pos,
            finish_pos: k.finish_pos,
            start_time: k.start_time - h,
            start_platform: s[k.start_pos || 0],
            finish_platform: s[k.finish_pos || 0],
            finish_time: k.finish_time - h,
            weekdays: l,
            cost: k.cost,
            distance: k.distance,
            travel_time: k.travel_time || k.finish_time - k.start_time,
            start_stop: q && {
              id: q.id,
              name: q.name,
              street: q.street,
              lat: q.lat,
              lng: q.lng,
            },
            finish_stop: r && {
              id: r.id,
              name: r.name,
              street: r.street,
              lat: r.lat,
              lng: r.lng,
            },
            shape: k.shape,
          };
        if (k.route) {
          t.stops = [];
          var u = k.route.times.workdays.length,
            v = k.route.times.times;
          for (var w = t.start_pos; ++w < t.finish_pos; ) {
            var x = k.route.stops[w],
              y = ti.stops[x],
              z = v[t.trip_num + w * u] + k.time_adjusted;
            (y = y && {
              id: y.id,
              name: y.name,
              street: y.street,
              lat: y.lat,
              lng: y.lng,
            }),
              (y.arrival_time = y.departure_time =
                {
                  minutes: z,
                  value: ti.toUnixTime(a.date, z),
                  text: ti.printTime(z),
                }),
              y &&
                k.route.stops[w] == k.route.stops[w + 1] &&
                (++w,
                (z = v[t.trip_num + w * u] + k.time_adjusted),
                (y.departure_time = {
                  minutes: z,
                  value: ti.toUnixTime(a.date, z),
                  text: ti.printTime(z),
                }));
            if (a.mode == "vintra") {
              var A = ti.LatLngToEN(y.lat, y.lng);
              (y.east = A[0]), (y.north = A[1]);
            }
            t.stops.push(y);
          }
          t.route = ti.fGetRoutes(k.route);
          if (b) {
            var B = k.start_time - h,
              C = Number.POSITIVE_INFINITY;
            n = t.route.num + String("0000" + n).slice(-4);
            for (var D = 0; D < b.length; ++D) {
              var f = b[D];
              if (
                f.code == n &&
                f.fromStopId == q.info &&
                f.toStopId == r.info
              ) {
                t.online_data = f;
                break;
              }
              if (!1 && f.code && f.code.indexOf(t.route.num) === 0) {
                var E = Math.abs(B - ti.toMinutes(f.departureAsStr));
                C > E && E <= 5 && ((C = E), (t.online_data = f));
              }
            }
          }
        }
        if (ti.taxi)
          if (
            (k.route &&
              k.start_time - i > 30 &&
              (j == g.length - 1 ||
                (j == g.length - 2 && !g[g.length - 1].route))) ||
            (!k.route && k.finish_time - k.start_time >= 15) ||
            (j == 0 && k.start_time - a.start_time > 120)
          ) {
            for (var D = 0; D < ti.taxi.length; ++D) {
              var F = ti.taxi[D],
                G = (q.lng - F.lng) * 58.1,
                H = (q.lat - F.lat) * 111.2,
                I = G * G + H * H,
                G = (r.lng - F.lng) * 58.1,
                H = (r.lat - F.lat) * 111.2,
                J = G * G + H * H;
              I <= F.radius &&
                J <= F.radius &&
                (t.taxi || (t.taxi = []),
                t.taxi.push({
                  name: F.name,
                  phone: F.phone,
                  km: Math.round(Math.sqrt(I)),
                }));
            }
            if (t.taxi) {
              t.taxi.sort(function (a, b) {
                return a.km - b.km;
              });
              var K = t.taxi[0].km;
              for (var D = 1; D < t.taxi.length; ++D)
                if (t.taxi[D].km > K) {
                  t.taxi.length = D;
                  break;
                }
            }
          }
        d[e].legs.push(t), k.route && (i = k.finish_time);
      }
    }
    typeof cfg === "object" && cfg.defaultCity === "intercity"
      ? (d.sort(function (a, b) {
          return a.start_time - b.start_time;
        }),
        a.reverse == -1 &&
          d.sort(function (a, b) {
            return -(a.finish_time - b.finish_time);
          }))
      : (d.sort(function (a, b) {
          return a.finish_time - b.finish_time;
        }),
        a.reverse == -1 &&
          d.sort(function (a, b) {
            return -(a.start_time - b.start_time);
          })),
      typeof ti.args == "object" &&
        ti.args.optimization &&
        (ti.args && ti.args.optimization.indexOf("short") >= 0
          ? d.sort(function (b, c) {
              if (b.distance < c.distance) return -1;
              if (b.distance > c.distance) return 1;
              return a.reverse == -1
                ? -(b.start_time - c.start_time)
                : b.finish_time - c.finish_time;
            })
          : ti.args && ti.args.optimization.indexOf("fast") >= 0
          ? d.sort(function (b, c) {
              if (b.travel_time < c.travel_time) return -1;
              if (b.travel_time > c.travel_time) return 1;
              return a.reverse == -1
                ? -(b.start_time - c.start_time)
                : b.finish_time - c.finish_time;
            })
          : ti.args &&
            ti.args.optimization.indexOf("cheap") >= 0 &&
            d.sort(function (b, c) {
              if (b.cost < c.cost) return -1;
              if (b.cost > c.cost) return 1;
              return a.reverse == -1
                ? -(b.start_time - c.start_time)
                : b.finish_time - c.finish_time;
            }));
    return d;
  }),
  (ti.splitShape = function (a, b, c, d, e) {
    var f;
    ti.SERVER === !0 ? (f = a) : (f = a.split("\n"));
    var g = [],
      h = Number.POSITIVE_INFINITY,
      i,
      j,
      k = 0,
      l = 0,
      m = 0,
      n,
      o,
      p;
    (b *= 1e5), (d *= 1e5), (c *= 1e5), (e *= 1e5);
    for (var q = 0; q < f.length; ++q)
      ti.SERVER === !0
        ? ((n = f[q]), (o = n[0]), (p = n[1]))
        : ((n = f[q].split(",")), (o = +(n[0] || 0)), (p = +(n[1] || 0))),
        o &&
          p &&
          ((i = (o - b) * (o - b) + (p - c) * (p - c)),
          h > i && ((h = i), (k = l = q), (j = Number.POSITIVE_INFINITY)),
          (i = (o - d) * (o - d) + (p - e) * (p - e)),
          j > i && ((j = i), (l = q)),
          g.push([o / 1e5, p / 1e5]));
    k < g.length && l < g.length && (g = g.slice(k, l + 1));
    return g;
  });
function $(a) {
  return document.getElementById(a);
}
var pg = {
  urlPrevious: "",
  urlLoaded: "",
  urlUnderSchedulePane: "",
  language: "",
  languageUnderSchedulePane: "",
  city: "",
  transport: "",
  schedule: null,
  optimalResults: [],
  transfers: [],
  showDeparturesWithNumbers: "",
  GMap: null,
  hashForMap: "",
  map: {},
  mapOverlays: [],
  mapStops: {},
  mapStopForZones: "",
  mapShowVehicles: -1,
  mapShowAllStops: 1,
  inputActive: null,
  stopsSuggested: [],
  stopsSuggestedForText: "",
  realTimeDepartures: {},
  vehicleCourses: {},
  inputStop: "",
  inputStopText: "",
  inputStart: "",
  inputFinish: "",
  timerSuggestedStopsHide: 0,
  timerSuggestedStopsShow: 0,
  imagesFolder: "images/",
  translationFolder:
    location.hostname.indexOf("saraksti.lv") >= 0
      ? "_translation/"
      : "//www.stops.lt/_translation/",
  browserVersion: 999,
  vehicleIconState: "",
  lowFloorUnchecked:
    (window.localStorage || {}).lowFloorUnchecked == "1" ? !0 : !1,
};
(pg.startVisibilityTest = function () {
  var a = "hidden";
  a in document
    ? document.addEventListener("visibilitychange", b)
    : (a = "mozHidden") in document
    ? document.addEventListener("mozvisibilitychange", b)
    : (a = "webkitHidden") in document
    ? document.addEventListener("webkitvisibilitychange", b)
    : (a = "msHidden") in document
    ? document.addEventListener("msvisibilitychange", b)
    : "onfocusin" in document
    ? (document.onfocusin = document.onfocusout = b)
    : (window.onpageshow =
        window.onpagehide =
        window.onfocus =
        window.onblur =
          b);
  function b(b) {
    var c = "visible",
      d = "hidden",
      e = {
        focus: c,
        focusin: c,
        pageshow: c,
        blur: d,
        focusout: d,
        pagehide: d,
      };
    (b = b || window.event),
      (pg.visibility = d),
      b.type in e
        ? (pg.visibility = e[b.type])
        : (pg.visibility = this[a] ? "hidden" : "visible");
  }
  b({
    type: "focus",
  });
}),
  (pg.addCSS = function (a) {
    var b = document.createElement("style");
    (b.type = "text/css"),
      b.styleSheet
        ? (b.styleSheet.cssText = a)
        : b.appendChild(document.createTextNode(a)),
      document.getElementsByTagName("head")[0].appendChild(b);
  });
var ej = function (a) {
  var b = [],
    c = [],
    d = [],
    e = [],
    f = [],
    g = [],
    h = [],
    i = [],
    j,
    k,
    l = a.split(","),
    m,
    n,
    o = l.length,
    p = [],
    q = "+",
    r = "-",
    s = l[0],
    t = s.length,
    u = 0,
    v = [],
    w = 0;
  while (u < t) {
    var x,
      y = 0,
      z = 0;
    do (x = s.charCodeAt(u++) - 63), (z |= (x & 31) << y), (y += 5);
    while (x >= 32);
    var A = z & 1 ? ~(z >> 1) : z >> 1;
    (y = 0), (z = 0), v.push(A);
  }
  (H = 10), (n = 240), (t = v.length);
  for (m = -1, j = 0; ++m < t; ) {
    var B = v[m];
    (p[m] = (B & 3) == 3 ? "3" : B & 1 ? "1" : B & 2 ? "2" : B & 4 ? "4" : "0"),
      (B >>= 3),
      m ? ((H += B), (n += H)) : (n += B),
      (b[j++] = n);
  }
  for (var C = p.length; --C >= 0; ) p[C] || (p[C] = "0");
  m = 1;
  for (var C = 0; ++m < o; ) {
    var D = +l[m],
      E = l[++m];
    E === "" ? ((E = j - C), (o = 0)) : (E = +E);
    while (E-- > 0) d[C++] = D;
  }
  --m;
  for (var C = 0, o = l.length; ++m < o; ) {
    var D = +l[m],
      E = l[++m];
    E === "" ? ((E = j - C), (o = 0)) : (E = +E);
    while (E-- > 0) e[C++] = D;
  }
  --m;
  for (var C = 0, o = l.length; ++m < o; ) {
    var F = l[m] || "0",
      E = l[++m];
    E === "" ? ((E = j - C), (o = 0)) : (E = +E);
    while (E-- > 0) c[C++] = F;
  }
  if (ti.has_trips_ids) {
    --m;
    var o = l.length;
    for (var C = 0; ++m < o; ) {
      if (l[m] === "") break;
      (f[C] = +l[m]), C > 0 && (f[C] += f[C - 1]), ++C;
    }
    for (var C = 0; ++m < o; ) {
      if (l[m] === "") break;
      (g[C] = l[m]), ++C;
    }
    if (ti.has_trips_ids === 2) {
      for (var C = 0; ++m < o; ) {
        if (l[m] === "") break;
        (i[C] = l[m]), ++C;
      }
      for (var C = 0; ++m < o; ) {
        if (l[m] === "") break;
        (h[C] = l[m]), ++C;
      }
    }
    ++m;
  }
  --m, (k = 1);
  for (var C = j, G = j, H = 5, o = l.length; ++m < o; ) {
    H += +l[m] - 5;
    var E = l[++m];
    E !== "" ? ((E = +E), (G -= E)) : ((E = G), (G = 0));
    while (E-- > 0) (b[C] = H + b[C - j]), ++C;
    G <= 0 && ((G = j), (H = 5), ++k);
  }
  final_data = {
    workdays: c,
    times: b,
    tag: p.join(""),
    valid_from: d,
    valid_to: e,
    trip_ids: f,
    trip_codes: g,
    trip_operators: h,
    trip_groups: i,
  };
  return final_data;
};
(function () {
  navigator.appVersion.indexOf("MSIE") >= 0 &&
    (pg.browserVersion = parseFloat(navigator.appVersion.split("MSIE")[1])),
    typeof document.body.style.transform != "undefined"
      ? (pg.transformCSS = "transform")
      : typeof document.body.style.MozTransform != "undefined"
      ? (pg.transformCSS = "-moz-transform")
      : typeof document.body.style.webkitTransform != "undefined"
      ? (pg.transformCSS = "-webkit-transform")
      : typeof document.body.style.msTransform != "undefined"
      ? (pg.transformCSS = "-ms-transform")
      : typeof document.body.style.OTransform != "undefined" &&
        (pg.transformCSS = "-o-transform"),
    cfg.defaultCity == "tallinna-linn" &&
      (pg.translationFolder = "tallinn/translation/");
  if (window.location.host.indexOf("soiduplaan.tallinn.ee") < 0) {
    var a = ["stops.lt", "ridebus.org", "marsruty.ru"];
    for (var b = 0; b < a.length; ++b)
      if (window.location.host.indexOf(a[b]) >= 0) {
        (pg.imagesFolder = "../_images/"),
          (pg.translationFolder = "../_translation/");
        break;
      }
  } else
    (pg.imagesFolder = "/_images/"), (pg.translationFolder = "/_translation/");
  var c = "";
  (cfg.transport_colors = {
    walk: "black",
    metro: "#ff6A00",
    bus: "#0073ac",
    trol: "#dc3131",
    tram: "#009900",
    nightbus: "#303030",
    regionalbus: "purple",
    suburbanbus: "#004a7f",
    commercialbus: "purple",
    intercitybus: "purple",
    internationalbus: "purple",
    seasonalbus: "purple",
    expressbus: "green",
    minibus: "green",
    train: "#009900",
    plane: "#404040",
    festal: "orange",
    eventbus: "#ff6a00",
    ferry: "#0064d7",
    aquabus: "#0064d7",
    autonomous: "#f58220",
  }),
    (cfg.transport_icons = {});
  for (var b in cfg.transport_colors)
    cfg.transport_icons[b] = "'" + pg.imagesFolder + b + ".png'";
  (cfg.transport_icons.expressbus = "'" + pg.imagesFolder + "bus_green.png'"),
    (cfg.transport_icons.eventbus = "'" + pg.imagesFolder + "bus_orange.png'"),
    (cfg.transport_icons.litexpo = "'" + pg.imagesFolder + "MarkerRed.png'"),
    (cfg.transport_icons.walk =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkBAMAAAATLoWrAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAhUExURQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAG3RSMEAAAAKdFJOUwDrWzmzzpF1Hw5JKzDNAAAA0klEQVQoz6WSKw/CQBCEL31BHWlIKKdAEBIUoEgVslShq9BVaFQNHoXAFXotmV/J9Qy3W0WY5MyXfcxOTojf5O56aD7hZAjMGHKAEx/VrxKL3iyxLDm54sVHSVQ3ii4AzoQEmmBKi5QEWoLyFKirklyzBWIZkWvuwH6DgzVd+XphmKkv8poHsBbO2GpME27LWH0ylKHrJJJ1gZjF3AZQ5O6BjiajSfsYmWdppSscvC0SSp2fS3INjCmSToJjl1BNjHY2C2UbbcyOyv4iJigvEn/pAzWNQeXuoaM3AAAAAElFTkSuQmCC"),
    (cfg.transport_icons.bus =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASAgMAAAAroGbEAAAADFBMVEUAAADAwMD///8Ac6wQQkMlAAAAAXRSTlMAQObYZgAAAD1JREFUeF5lysEJACAMA8CAg7mPMzlBKLiCI/UtQi0WCmIC9wjBk2rTXVSgmG23sbuk/MYnHSbX3KHeMHIA4toiwKUahYMAAAAASUVORK5CYII="),
    (cfg.transport_icons.expressbus =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASAgMAAAAroGbEAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAMUExURQAAAACAAP///8DAwFdGW0MAAAABdFJOUwBA5thmAAAANklEQVQI12NgQAaioQ5AMmpVAAMDY2hoCJB8tWoLkFy1aglWEqIGQi4NXQInwSIMAUAII0EAAGCcFKbJihAOAAAAAElFTkSuQmCC"),
    (cfg.transport_icons.trol =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASAgMAAAAroGbEAAAADFBMVEUAAADAwMD////cMTHYIE0PAAAAAXRSTlMAQObYZgAAAEFJREFUeF5lytEJACEMA9BAB3DPm+kmKAVXEFyoAwgxWPDHBN5HCIBMYXPI1gRILUYu+fkv3eO1PtfOON4dqZaVDa25JKCSbwixAAAAAElFTkSuQmCC"),
    (cfg.transport_icons.tram =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASAgMAAAAroGbEAAAADFBMVEUAAADAwMD///8Afw6EL87tAAAAAXRSTlMAQObYZgAAAEZJREFUeF5lzLEJQCEMBNBA2g8uJPyVnCuVIziHI1ilV4wXFBsv8LgiHBEPIvi5vxVoprBKgk3y6/659nn6XQgBUGTvittZX1shrS0B3oUAAAAASUVORK5CYII="),
    (cfg.transport_icons.nightbus =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASAgMAAAAroGbEAAAABGdBTUEAALGPC/xhBQAAAAxQTFRFAAAAwMDA////MDAwFsRlHAAAAAF0Uk5TAEDm2GYAAAA3SURBVHjaY2BABvb/DwDJX6s+MDAw////B0hmrZoDJFetWoOVhKiBkOv/r4GTYBGGD0AII0EAAOLaIsCN4ck7AAAAAElFTkSuQmCC"),
    (cfg.transport_icons.regionalbus =
      cfg.transport_icons.suburbanbus =
      cfg.transport_icons.commercialbus =
      cfg.transport_icons.intercitybus =
      cfg.transport_icons.internationalbus =
      cfg.transport_icons.seasonalbus =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASAgMAAAAroGbEAAAADFBMVEUAAADAwMD///+AAIDHvR5zAAAAAXRSTlMAQObYZgAAAD1JREFUeF5lysEJACAMA8CAg7mPMzlBKLiCI/UtQi0WCmIC9wjBk2rTXVSgmG23sbuk/MYnHSbX3KHeMHIA4toiwKUahYMAAAAASUVORK5CYII="),
    (cfg.transport_icons.eventbus =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASAgMAAAAroGbEAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAMUExURQAAAP9qAP///8DAwAwZbqEAAAABdFJOUwBA5thmAAAANklEQVQI12NgQAaioQ5AMmpVAAMDY2hoCJB8tWoLkFy1aglWEqIGQi4NXQInwSIMAUAII0EAAGCcFKbJihAOAAAAAElFTkSuQmCC"),
    (cfg.transport_icons.minibus =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASAgMAAAAroGbEAAAABGdBTUEAALGPC/xhBQAAAAxQTFRFAAAAwMDA////AH8OhC/O7QAAAAF0Uk5TAEDm2GYAAAAzSURBVHjaY2DABPz/QaTd6gNA8v//D0Dy1qoCIPlq1QY4CRGHkK//bYCTEBEb5gNwEgEAnKMcHFzyiOMAAAAASUVORK5CYII="),
    (cfg.transport_icons.train =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASAgMAAAAroGbEAAAADFBMVEUAAADAwMD///8Afw6EL87tAAAAAXRSTlMAQObYZgAAAEJJREFUeF5lzLEJACAMBMAXV7J0ImdyguAIFtnHxgHEGEhI4xdXPM/DI7KBLHLURl0lGr+2Cdedpjf+g5I4PhkVlgctPiXCztUWnAAAAABJRU5ErkJggg=="),
    (cfg.transport_icons.plane =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASBAMAAACk4JNkAAAAD1BMVEUAAABAQEBLS0uAgIA5OTlhl+UMAAAAAXRSTlMAQObYZgAAAEBJREFUeF5tzNEJACAIRVGtBXqjOEL7LxXesJ98oBwVtC++Siq5csqwCsRloptG/qTlql8D5a+JIjti3saSanMATQYDyukaLU8AAAAASUVORK5CYII="),
    (cfg.transport_icons.ferry = "'" + pg.imagesFolder + "ferry.svg'"),
    (cfg.transport_icons.aquabus = "'" + pg.imagesFolder + "ferry.svg'"),
    (cfg.transport_icons.autonomous =
      "data:image/svg+xml,%3Csvg%20id%3D%22Layer_1%22%20data-name%3D%22Layer%201%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20593.8%20960.8%22%3E%3Cdefs%3E%3Cstyle%3E.cls-1%7Bfill%3A%23f58220%7D%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cpath%20class%3D%22cls-1%22%20d%3D%22M0%20405.2c0-32.4%207.8-58.4%2023.4-78.1C39%20307.4%2060.2%20292.4%2086.8%20282c27.8-10.4%2059.6-17.1%2095.6-20%2035.9-2.9%2074.1-4.4%20114.6-4.4s78.7%201.5%20114.6%204.4c35.9%202.9%2067.7%209.6%2095.5%2020%2026.7%2010.4%2047.8%2025.5%2063.4%2045.1%2015.6%2019.7%2023.4%2045.7%2023.4%2078.1V775c0%209.3-.8%2017.7-2.6%2025.2s-4.4%2014.8-7.8%2021.7c-3.4%206.9-7.5%2013.3-12.2%2019.1-4.6%205.8-9.8%2011-15.6%2015.6v67.7c0%2010.4-3.2%2019.1-9.6%2026-6.3%207-15.3%2010.5-26.9%2010.5h-36.5c-11.5%200-20.8-3.4-27.8-10.4s-10.4-15.6-10.4-26.1v-38.2H149.3v38.2c0%2010.4-3.4%2019.1-10.4%2026-7%207-16.2%2010.5-27.8%2010.5H74.7c-11.6%200-20.5-3.4-26.9-10.4-6.3-7-9.6-15.6-9.6-26v-67.8c-5.8-4.6-11-9.8-15.6-15.6-4.6-5.8-8.7-12.2-12.2-19.1-3.4-7-6-14.2-7.8-21.7C.8%20792.7%200%20784.3%200%20775V405.2zm519.2%200H74.7V591h444.5V405.2zm-389%20408c7%200%2013.9-1.8%2020.8-5.2%207-3.4%2012.7-7.5%2017.4-12.2%205.8-4.6%2010.1-10.4%2013-17.4%202.9-6.9%204.4-13.9%204.4-20.8s-1.5-15.3-4.4-21.7c-2.9-6.3-7.2-12.4-13-18.2-4.6-4.6-10.4-8.4-17.4-11.3-7-2.9-13.9-4.4-20.8-4.4s-13.9%201.5-20.8%204.4c-7%202.9-12.7%206.7-17.4%2011.3-5.8%205.8-10.1%2011.9-13.1%2018.2-2.9%206.3-4.4%2013.6-4.4%2021.7s1.5%2013.9%204.4%2020.8c2.9%207%207.2%2012.7%2013%2017.4%204.6%204.6%2010.5%208.7%2017.4%2012.2%207%203.4%2013.9%205.2%2020.9%205.2zm333.4%200c7%200%2013.9-1.8%2020.8-5.2%207-3.4%2012.7-7.5%2017.4-12.2%205.8-4.6%2010.1-10.4%2013-17.4%202.9-6.9%204.4-13.9%204.4-20.8s-1.5-15.3-4.4-21.7c-2.9-6.3-7.2-12.4-13-18.2-4.6-4.6-10.4-8.4-17.4-11.3-7-2.9-13.9-4.4-20.8-4.4s-13.9%201.5-20.8%204.4c-7%202.9-12.7%206.7-17.4%2011.3-5.8%205.8-10.2%2011.9-13.1%2018.2-2.9%206.3-4.4%2013.6-4.4%2021.7s1.5%2013.9%204.4%2020.8c2.9%207%207.2%2012.7%2013%2017.4%204.6%204.6%2010.5%208.7%2017.4%2012.2%207%203.4%2013.9%205.2%2020.9%205.2z%22%2F%3E%3Cpath%20class%3D%22cls-1%22%20d%3D%22M275%20137.3h46.3v147.1H275z%22%2F%3E%3Ccircle%20class%3D%22cls-1%22%20cx%3D%22301.8%22%20cy%3D%22125.2%22%20r%3D%2255%22%2F%3E%3Cpath%20class%3D%22cls-1%22%20d%3D%22M151.8%208.1c6.5-8.7%2021.7-10.8%2030.3-4.3l32.5%2023.8c8.7%206.5%208.7%2019.5%204.3%2028.2-6.5%208.7-19.5%2013-28.2%206.5l-32.5-23.8c-8.7-6.5-10.8-21.7-4.3-30.3h-2.2zM405.3%2062.3c-8.7%206.5-21.7%202.2-28.2-6.5s-6.5-21.7%204.3-28.2l32.5-23.8c8.7-6.5%2023.8-4.3%2030.3%204.3%206.5%208.7%204.3%2023.8-4.3%2030.3l-32.5%2023.8h-2.2zM392.3%20109.9c0-8.7%206.5-17.3%2015.2-17.3h60.7c13%200%2021.7%208.7%2021.7%2021.7s-8.7%2021.7-21.7%2021.7H414c-13%200-21.7-13-21.7-26zM374.9%20198.7c-8.7-6.5-8.7-19.5-2.2-30.3%206.5-8.7%2019.5-13%2028.2-6.5l36.8%2028.2c8.7%206.5%2010.8%2021.7%204.3%2030.3-6.5%208.7-21.7%2010.8-30.3%204.3l-36.8-28.2v2.2zM193%20164.1c8.7-6.5%2021.7-2.2%2028.2%206.5s6.5%2021.7-2.2%2030.3l-36.8%2028.2c-8.7%206.5-23.8%204.3-30.3-4.3-6.5-8.7-4.3-23.8%204.3-30.3l36.8-28.2v-2.2zM201.6%20109.9c0%2013-8.7%2026-21.7%2026h-54.2c-13%200-21.7-8.7-21.7-21.7s8.7-21.7%2021.7-21.7h60.7c8.7%200%2015.2%208.7%2015.2%2017.3z%22%2F%3E%3C%2Fsvg%3E"),
    (c += ".icon.icon_autonomous {vertical-align: -15%;}"),
    cfg.defaultCity == "vilnius"
      ? ((cfg.transport_icons.newyear = "images/2023.svg"),
        (cfg.transport_colors.newyear = "black"),
        (c +=
          ".nav-transport .newyear a, .nav-transport .newyear span { background-size:18px; }"))
      : cfg.defaultCity == "riga"
      ? ((cfg.transport_colors.bus = "#f4b427"),
        (cfg.transport_colors.trol = "#009de0"),
        (cfg.transport_colors.tram = "#ff000c"),
        (cfg.transport_icons.bus =
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACsAAAA4CAMAAABTwfHHAAAAxlBMVEX/0Tj/yBL/yBH/yBT/00D/3Gr/4oP/2FX/44b/33P/0Tv/0Tr/11T/0jr/0z//0z7/0Tb/2Ff/3Wz/3Wr/yx//yhz/ziv/3W3/3nD/zCX/yx7/1Un/yRn/yh3/yhr/0Tn/yRj/0jz/0j3/0DT/zzD/zi7/zCT/zCb/1kz/3GX/1Eb/00H/2l3/zi3/1EP/yBP/00L/4Hr/4X3/3nP/0DX/4oH/zCL/4oT/zCP/4X//0Tf/0jn/0DL/0TT/2l//22H/yRcAAACANVW+AAAAQnRSTlP//////////////////////////////////////////////////////////////////////////////////////wBEFhAAAAABMklEQVRIx+3WSVODQBAF4OZFiRqNUYNLwICJirtGxWhc3///Ux4yLFMsg1y88I7NV0MxM9WNsH6ktVkrFsrTWcnYVZhiJxYAUPrq5KmQ7FbaNQDAurIbMKerbK+G3UzW3epvV6U/wA5J4e7e0DFuLfYPDikOgKHRWgCOBABGtSxa28Batc8CQtf1js1nPHZdCkk/MFtf3TPxzFZaq9ugvu1BTiozmSZnUaeX+H/oJc1tWQe2cvaU5FmBnJA81+2YJOnlaBh34Iy9IEm6OXtJkpxq9ookeZ2zNyTJ29TeAfdpt9fixPUHZWcARjYfvYJvC8mnDoBZPFtC4/aG6XwTA33OzsJIFV+iuR1nHr2q6ps+Y1V1od3Ed1VloR1odvEv9kOzn8U2WFa/NPu9LP40+Nf4BUk2l83bX+BeAAAAAElFTkSuQmCC"),
        (cfg.transport_icons.trol =
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACsAAAA4CAMAAABTwfHHAAABI1BMVEUnq+QAneAysOYIoOACneAhqeQqreUgqeMsreUBneBdwOtPu+kGn+BHuOgKoOEEnuBVveokquQtruUjquQuruVwyO5ux+12yu45sudBtehzye46s+d1yu4wr+Y3sucNoeFDtug7s+cWpeJ3yu4orOQeqOMvr+VMuuk+tOc9tOcFnuAQo+EYpuJIuelNu+pOu+pGuOkMoeEHn+AfqOMapuMRo+JgwesdqOQ4s+dVvutxyO5Uveocp+QDnuAJoOESo+MVpeIbp+QapuQbp+MSo+IUpOJRvOkXpeJIuOhtxu19ze8cp+Njw+wxr+VlxOxsx+0dqOM5suZ3y+9qxu1gwuxYv+tSvOlZv+thwuxrxu1CtuhnxOw8tOdiwutGt+hqxewAAAC4VQ4AAAAAYXRSTlP///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AroBvMQAAAaxJREFUSMfl1llTwjAQAOCs3IpcSlFU6oXVUkURT6jgCd6Kigei/f+/wvQigaYSH3DGcV9gd78JmSQ0RRp/oM4XACYAGHJYAPAwqBfIGB3rw0W/gwZwNeiwWgiXh3voCK6FnfM1ZgGOydIlyo7iRqSLRnElxrRaHLcSVD6G83HGmiUFITWh/+RkWjAjPWWk04KQpO0M9IuMbYEnTAvAiZEmknTWsRdzpDmvoQWSLTL2OEsNjJZIIjHsMmmvIJkkOYaNkLaC6OnnVte6Ir++QXULCLhjoDbA8V9TLBvksAHL+jns5j+wP1mzIofdsvd4uy+NkfMQ3tnd23dhyVKmLLPOjnogVqrKYflIqVZEj/p7Z3KAVj0+cTWnxRBtz/TFqTFlVm/VibWexyJrULNVt23BWvVzhr0g95Fh6XuL8Sg14tKyPg5bs+dr5SWGvSLDmPbadVhQOzewvWZxnN6EmGsm3+Le3V8+OyCLXhfiFaM99t5cm8bD41MzL0lSvvn88towiwnb5oCcNJd4M4kPtbr30uWdR48U0t71T+Fb29bJh3F3tz/7Pkta+rn4AoGlrgsv/IPaAAAAAElFTkSuQmCC"),
        (cfg.transport_icons.tram =
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACsAAAA4CAMAAABTwfHHAAABHVBMVEX/anH/SFD/MTr/ISv/Eh3/BhH/AAz/R0//aXD/OEH/Aw7/AQz/NT7/f4X/Iiz/U1v/QUn/ICr/JjD/PUb/VV3/JC7/d33/GSP/TVX/FiD/BA//Ag3/HSf/GyX/FSD/fYP/O0T/Mzz/XmX/T1f/WF//XGP/OkP/ERz/OUL/WmH/Ulr/FyH/GiT/e4H/HCb/GCL/bHL/ZWz/YGf/KTP/cHb/b3X/LTb/CBP/ChX/Z27/bXP/Qkr/SlL/dnz/aG//cnj/KzT/foT/eH7/KjT/DRj/fIL/BRD/RU3/Ljf/JzH/Tlb/REz/c3n/Iy3/Cxb/bnT/eX//EBv/Dhn/DBf/SVH/QEj/TFT/PEX/dHr/BxL/LDX/Mjv/UFj/CRQAAAAZIqiWAAAAX3RSTlP/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////AJOaXywAAAG3SURBVEjH7dZXW4MwGAXg2nGs4KqjVnDvvbXuvere2/P/f4YXKSUJCXjpheemTb63PEAIX1NUkqpLZ7I5IJfNpOvz1IrS9wYHWtxGs20C0NzSioIYtqG9oxNA0WQd1JMkusQwA5IsASaLbpKk54thTqAemM+XJNlbLaJPfPbH2IHADuqVqB3CMEmOoCPJjo5l4Xq+77kYn5i026lpRNI9bLI9sGRmVrNziMm8bBeQkMWazSMxS4ENp5ZXVqWsrIWVqh1QZ+SElbSw5fAR1K2nlFLyjyPHdZSSasvrSsqwWd/39cuXpmS7QUs2I3aL1mzrdtNui7pdsNudf2u+Z7t2u6fbTrvdjzwPbTs8MKTp8MjyTMbk71nHjwrXM9ljkic5VTpFkuMR6+svhHBbn+r2TMyfy7Qi5i4sa1yS7aWYu9Jtq7ye1VxH9+aNdG6m83WC60mRafHKOSFv9buWZ3CoirB3v1mK1er79z6Z3tR6wK9WOOgtTrx0lT5UerDLxyetvz0DL6YNNAVMaP3tFXgz77ZZoFGxBXj2vfmOXsk+Bn8WzOlCmWF/+2BsPmv9jcdPTMjXN0n+AMAd+IZKCuBTAAAAAElFTkSuQmCC"),
        (cfg.transport_colors.minibus = "#7f237e"),
        (cfg.transport_icons.minibus = "images/minibus_magenta.png"),
        4,
        (c +=
          ".expressbus, .transferexpressbus, .label-expressbus {color: #db314e!important;} .label-expressbus, .expressbus {outline: solid 1px #db314e;}"),
        (c += ".label-expressbus {color:" + d + ";}"),
        (cfg.transport_colors.expressbus = "#d7d9db"),
        (cfg.transport_icons.expressbus =
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAMAAABhEH5lAAAADFBMVEXbMU7////AwMAAAAAC0l1PAAAABHRSTlP///8AQCqp9AAAADpJREFUeNqVzgEGwGAMQ+GX7v533tSkZRb+h+AD4fp0RHSbQE8whBsqdbVIb5lcJAlAyuT2e28g90M3y4wCo2wPjX0AAAAASUVORK5CYII="))
      : cfg.defaultCity == "liepaja"
      ? ((cfg.transport_colors.minibus = "#ff6600"),
        (cfg.transport_icons.minibus = "images/minibus_FF6600.png"))
      : cfg.defaultCity == "lsa"
      ? ((c +=
          ".minibus, .transferminibus, .label-minibus {color: #db314e!important;} .label-minibus, .minibus {outline: solid 1px #db314e;}"),
        (c += ".label-minibus {color:" + d + ";}"),
        (cfg.transport_colors.minibus = "#d7d9db"),
        (cfg.transport_icons.minibus =
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAMAAABhEH5lAAAADFBMVEXbMU7////AwMAAAAAC0l1PAAAABHRSTlP///8AQCqp9AAAADpJREFUeNqVzgEGwGAMQ+GX7v533tSkZRb+h+AD4fp0RHSbQE8whBsqdbVIb5lcJAlAyuT2e28g90M3y4wCo2wPjX0AAAAASUVORK5CYII="),
        (cfg.transport_colors.bus = "#8d034e"),
        (cfg.transport_icons.bus =
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAMAAABhEH5lAAAADFBMVEWNA07////AwMAAAAChklB+AAAABHRSTlP///8AQCqp9AAAADpJREFUeNqly4EGADAIhOG7ev93HrdWSMF+KB8Hb42EqAigugZJ9cgYWRKzf6o2IqHIjfrQ9cUdqHUAg6ECNcfNS7sAAAAASUVORK5CYII="))
      : cfg.defaultCity == "rostov"
      ? ((cfg.transport_colors.bus = "#dc3131"),
        (cfg.transport_colors.trol = "#0073ac"),
        (cfg.transport_colors.minibus = "#FF6600"),
        (cfg.transport_colors.suburbanbus = "#9c1630"),
        (cfg.transport_icons.bus = "images/bus_red.png"),
        (cfg.transport_icons.trol = "images/trol_blue.png"),
        (cfg.transport_icons.minibus = "images/minibus_FF6600.png"),
        (cfg.transport_icons.suburbanbus = "images/suburbanbus_9c1630.png"))
      : cfg.defaultCity == "tallinna-linn"
      ? ((cfg.transport_colors.bus = cfg.transport_colors.nightbus = "#00e1b4"),
        (cfg.transport_colors.trol = "#0064d7"),
        (cfg.transport_colors.tram = "#ff601e"),
        (cfg.transport_colors.regionalbus = "#9c1630"),
        (cfg.transport_colors.commercialbus = "#7f0086"),
        (cfg.transport_icons.bus = cfg.transport_icons.nightbus =
          "images_tallinn/bus.png"),
        (cfg.transport_icons.trol = "images_tallinn/trol.png"),
        (cfg.transport_icons.tram = "images_tallinn/tram.png"),
        (cfg.transport_icons.regionalbus = "images_tallinn/regionalbus.png"),
        (cfg.transport_icons.commercialbus =
          "images_tallinn/commercialbus.png"),
        (cfg.transport_icons.train = "images_tallinn/train.png"))
      : cfg.defaultCity == "krasnodar" || cfg.defaultCity == "mariupol"
      ? ((cfg.transport_colors.bus = "green"),
        (cfg.transport_colors.trol = "#0073ac"),
        (cfg.transport_colors.tram = "#dc3131"),
        (cfg.transport_colors.minibus = "#ff6600"),
        (cfg.transport_icons.bus = "images/bus_green.png"),
        (cfg.transport_icons.trol = "images/trol_blue.png"),
        (cfg.transport_icons.tram = "images/tram_red.png"),
        (cfg.transport_icons.minibus = "images/minibus_FF6600.png"))
      : cfg.defaultCity == "chelyabinsk"
      ? ((cfg.transport_colors.minibus = "#7f237e"),
        (cfg.transport_icons.minibus = "images/minibus_magenta.png"))
      : cfg.defaultCity == "klaipeda"
      ? ((cfg.transport_colors.minibus = "#ff6600"),
        (cfg.transport_icons.minibus =
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASAgMAAAAroGbEAAAACVBMVEUAAADy0CQAAAB9nBbiAAAAAXRSTlMAQObYZgAAAB1JREFUCNdjwAUYQ0ND0MioKAS5dOkSKImpEhcAAHlGC+u+8/jOAAAAAElFTkSuQmCC"))
      : cfg.defaultCity == "kaunas" &&
        ((cfg.transport_colors.bus = "#dc3131"),
        (cfg.transport_colors.trol = "green"),
        (cfg.transport_colors.expressbus = "#0073ac"),
        (cfg.transport_icons.bus = "images/bus_red.png"),
        (cfg.transport_icons.trol =
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAMAAABhEH5lAAAADFBMVEUAAAAAfw7AwMD///+eqPGMAAAAAXRSTlMAQObYZgAAADZJREFUeNqlz8UBADEMA0HL6r/mgzDjhucX8QF2yY4gVEswKF0aiKF7io2IhIkcEVo/CmeD2r3BOAEV4viY7gAAAABJRU5ErkJggg=="),
        (cfg.transport_icons.expressbus = "images/bus.png"));
  if (
    (cfg.defaultCity == "vilnius" && cfg.city.datadir != "vilniusGTFS") ||
    cfg.defaultCity == "nato" ||
    cfg.defaultCity == "panevezysraj" ||
    cfg.defaultCity == "alytus" ||
    cfg.defaultCity == "alytaus" ||
    cfg.defaultCity == "taurage" ||
    cfg.defaultCity == "utena" ||
    cfg.defaultCity == "rostov" ||
    cfg.defaultCity == "krasnodar" ||
    cfg.defaultCity == "siauliai" ||
    cfg.defaultCity == "novorossiysk" ||
    cfg.defaultCity == "klaipeda" ||
    cfg.defaultCity == "mariupol" ||
    cfg.defaultCity == "kharkiv" ||
    cfg.defaultCity == "traukiniai"
  )
    ti.explodeTimes = ej;
  for (var b in cfg.transport_colors) {
    var d = cfg.transport_colors[b];
    (c += "." + b + "{ background-color:" + d + "; }"),
      typeof mobile != "undefined" &&
        ((c +=
          ".nav-transport ." +
          b +
          " span, .nav-transport ." +
          b +
          " a, .icon.icon-" +
          b +
          "{ background-image:url(" +
          cfg.transport_icons[b] +
          "); background-size:18px 18px; }"),
        (c += ".icon-" + b + "{ width:18px; height:18px;}"),
        (c += ".label-" + b + " {background-color:" + d + ";}")),
      cfg.city.defaultTransport != "tablo" &&
        (c +=
          ".icon.icon_" +
          b +
          "{ background-image:url(" +
          cfg.transport_icons[b] +
          ");}"),
      (c +=
        ".transfer" +
        b +
        ",a.transfer" +
        b +
        "{ color:" +
        d +
        " !important; font-weight:bold; }"),
      (c +=
        ".departure" +
        b +
        "{ color:" +
        d +
        "; font-size:smaller; font-style:normal; }");
  }
  cfg.city.custom_css &&
    ((cfg.city.custom_css = cfg.city.custom_css.replace(
      new RegExp("_images/", "g"),
      pg.imagesFolder
    )),
    (c += cfg.city.custom_css || "")),
    pg.addCSS(c);
})(),
  (pg.bodyKeyDown = function (a, b) {
    b || (b = window.event ? window.event.keyCode : a.keyCode);
    if (b == 27) {
      var c = $("ulScheduleDirectionsList");
      c && c.style && c.style.display != "none"
        ? (c.style.display = "none")
        : pg.schedule && pg.aScheduleClose_Click(a);
    }
  }),
  (pg.fLang_Click = function (a) {
    var b = a && (a.target || a.srcElement);
    if (b && (b.tagName || "").toLowerCase() == "a") {
      if (b.innerHTML.length < 10) {
        pg.fUrlSet({
          schedule: pg.schedule,
          language: b.innerHTML,
        });
        return pg.cancelEvent(a);
      }
    } else if (b && (b.tagName || "").toLowerCase() == "img") {
      pg.fUrlSet({
        schedule: pg.schedule,
        language: b.src.slice(-6, -4),
      });
      return pg.cancelEvent(a);
    }
    return !1;
  }),
  (pg.divHeader_Click = function (a) {
    a = a || window.event;
    var b = a.target || a.srcElement;
    while (b && b.nodeName.toLowerCase() !== "a") b = b.parentNode;
    if (b && b.href && b.href.indexOf("http:") >= 0) return !0;
    pg.aScheduleClose_Click(a);
  }),
  (pg.aScheduleClose_Click = function (a) {
    a = a || window.event;
    if (pg.schedule)
      if (pg.urlUnderSchedulePane == "")
        (pg.city = "nothing"),
          pg.fUrlSet({
            city: pg.schedule.city,
            transport: pg.schedule.transport,
            schedule: null,
          });
      else {
        var b = pg.fUrlParse(pg.urlUnderSchedulePane);
        b.language != pg.language &&
          ((b.language = pg.language), (pg.city = "nothing")),
          (b.schedule = null),
          pg.fUrlSet(b);
      }
    return pg.cancelEvent(a);
  }),
  (pg.fCreateLanguagesBar = function () {
    var a = $("divLang"),
      b = "",
      c = cfg.city.languages.split(",");
    for (var d = 0; d < c.length; d++) {
      var e = c[d];
      if (cfg.city.languageFlags)
        b +=
          '<a title="' +
          cfg.languages[e] +
          '"><img src="' +
          e +
          '.png" style="width:32px; height:26px; padding:0 5px;"></a>';
      else {
        var f =
          cfg.defaultCity == "riga" && pg.language == e
            ? "active"
            : "underlined";
        (b +=
          '<a title="' +
          cfg.languages[e] +
          '" class="' +
          f +
          '">' +
          e +
          "</a>"),
          cfg.city.navigation === "riga" && d % 3 === 2
            ? (b += " ")
            : (b += "&nbsp;");
      }
    }
    (a || {}).innerHTML = b;
  }),
  (pg.fTranslateStaticTexts = function () {
    var a = pg.language || cfg.defaultLanguage;
    (i18n.transport.expressbus =
      i18n.transport["expressbus_" + cfg.defaultCity] ||
      i18n.transport.expressbus),
      (i18n.transport1.expressbus =
        i18n.transport1["expressbus_" + cfg.defaultCity] ||
        i18n.transport1.expressbus),
      cfg.defaultCity === "riga" && (i18n.lowFloorDepartureTip = "");
    if (cfg.defaultCity === "chelyabinsk" && a == "ru") {
      i18n.transport.minibus = i18n.transport1.minibus = cfg.city.minibus;
      var b = i18n.lowFloorVehicles.lastIndexOf(",");
      b > 1 && (i18n.lowFloorVehicles = i18n.lowFloorVehicles.substr(0, b)),
        (b = i18n.lowFloorDepartures.lastIndexOf(",")),
        b > 80 &&
          (i18n.lowFloorDepartures =
            i18n.lowFloorDepartures.substr(0, b) + "."),
        (b = i18n.checkHandicapped.lastIndexOf(","));
    }
    cfg.defaultCity === "rostov" &&
      ((cfg.city.minibus || {})[a] &&
        (i18n.transport.minibus = i18n.transport1.minibus =
          cfg.city.minibus[a]),
      (cfg.city.train || {})[a] &&
        (i18n.transport.train = i18n.transport1.train = cfg.city.train[a])),
      cfg.defaultCity === "siauliai" &&
        a == "lt" &&
        ((i18n.transport.minibus = "Prive&#382;amieji autobusai"),
        (i18n.transport1.minibus = "Prive&#382;amasis autobusas")),
      cfg.defaultCity === "klaipeda" &&
        ((i18n.smallBus12Departures = (i18n.smallBus12Departures || "").replace(
          "Melsvu",
          "Geltonu"
        )),
        (i18n.smallBus12Departures = (i18n.smallBus12Departures || "").replace(
          "light blue",
          "yellow"
        )),
        a == "lt" &&
          ((i18n.lowFloorVehicleMapTip = "pritaikytas ne&#303;galiesiems"),
          (i18n.transport.expressbus = "Ekspresiniai autobusai"))),
      cfg.defaultCity === "alytus" &&
        ((i18n.smallBus12Service = i18n.bigBusService),
        (i18n.smallBus12Departures = i18n.bigBusDepartures),
        (i18n.smallBus12Tip = i18n.bigBusTip),
        (i18n.scheduleComments = (i18n.scheduleComments || "").replace(
          "(troleibuso)",
          ""
        )),
        (i18n.scheduleChangedDepartures = (
          i18n.scheduleChangedDepartures || ""
        ).replace("/troleibusas", "")),
        (i18n.lowFloorDepartures = i18n.canceledDepartures)),
      cfg.defaultCity === "vilnius" &&
        ((i18n.menuTickets = i18n.moreInformation || ""),
        (i18n.weekdays67 = i18n.weekdays67notfestal),
        (i18n.weekdays7 = i18n.weekdays7notfestal),
        (($("spanNewSchedulesSummer") || {}).innerHTML =
          i18n.NewSchedulesSummer),
        (($("aNewSchedulesSummer") || {}).href =
          "//www.stops.lt/vilnius/vasara.html#" + a),
        (($("spanNewSchedulesWinter") || {}).innerHTML =
          i18n.NewSchedulesWinter),
        (($("aNewSchedulesWinter") || {}).href =
          "//www.stops.lt/vilnius/ruduo.html#" + a),
        (($("spanBeaches") || {}).innerHTML = (
          $("spanBeachRoutes") || {}
        ).innerHTML =
          i18n.beach),
        (($("spanCemetery") || {}).innerHTML = (
          $("spanCemeteryRoutes") || {}
        ).innerHTML =
          i18n.cemetery),
        (($("aBeaches") || {}).href = "#beach/" + a),
        (($("aCemetery") || {}).href = "#cemetery/" + a),
        i18n.transport.eventbus != i18n.sumenek &&
          ((i18n.transport.commercialbus = i18n.transport.eventbus),
          (i18n.transport1.commercialbus = i18n.transport1.eventbus)),
        i18n.sumenek &&
          (i18n.transport.eventbus = i18n.transport1.eventbus = i18n.sumenek),
        i18n.bookFair &&
          new Date().getMonth() == 1 &&
          ((i18n.transport.commercialbus = i18n.bookFair || "Knygu muge"),
          (i18n.transport.commercialbus1 = i18n.transport.bus1)),
        ((
          $("divNoteLT") || {
            style: {},
          }
        ).style.display = a == "lt" ? "block" : "none"),
        ((
          $("divNoteRU") || {
            style: {},
          }
        ).style.display =
          a == "ru" || a == "by" || a == "ua" ? "block" : "none"),
        ((
          $("divNoteEN") || {
            style: {},
          }
        ).style.display =
          a == "lt" || a == "ru" || a == "by" || a == "ua" ? "none" : "block"),
        (($("spanTrol") || {}).innerHTML =
          i18n.transport.longtrol || "Ilgasis troleibusas"),
        location.pathname.indexOf("streikas") >= 0 &&
          (i18n.routesAndTimetables = i18n.routesAndTimetablesStrike)),
      cfg.isNato &&
        ((i18n.weekdays = "&nbsp;June&nbsp;16&nbsp;"),
        (i18n.weekdays7 = "&nbsp;June&nbsp;16&nbsp;"),
        (i18n.weekdays0 = "&nbsp;June&nbsp;16&nbsp;"),
        (i18n.weekdays1 = "&nbsp;June&nbsp;17&nbsp;"),
        (i18n.weekdays2 = "&nbsp;June&nbsp;18&nbsp;"),
        (i18n.weekdays3 = "&nbsp;June&nbsp;19&nbsp;"),
        (i18n.weekdays4 = "&nbsp;June&nbsp;20&nbsp;"),
        (i18n.weekdays5 = "&nbsp;June&nbsp;21&nbsp;"),
        (i18n.weekdays6 = "&nbsp;June&nbsp;22&nbsp;")),
      (document.title = i18n.headerTitle),
      (($("header") || {}).innerHTML =
        (cfg.city.logoInHeader || "") + i18n.headerTitle),
      (($("spanYouAreHere") || {}).innerHTML = i18n.youAreHere),
      (($("aYouAreHere") || {}).href = pg.hashHome =
        (pg.hashHome + "map").split("map")[0] + "map/" + pg.language),
      (($("spanRoutesFromStop") || {}).innerHTML = i18n.departingRoutes + ":"),
      (($("spanPlan") || {}).innerHTML =
        cfg.city.navigation !== "top"
          ? i18n.tripPlanner
          : i18n.tripPlanner.replace("<br/>", " ").replace("<br>", " ")),
      (($("spanShowMap") || {}).innerHTML = i18n.showStopsMap),
      (($("spanShowVehicles") || {}).innerHTML = i18n.mapShowVehicles),
      (($("spanShowTraffic") || {}).innerHTML = i18n.mapShowTraffic),
      (($("aPlanShowMap") || {}).innerHTML =
        "<br/><br/>" + i18n.showStopsMap.toLowerCase()),
      (($("spanPrintSchedule") || {}).innerHTML = i18n.print),
      (($("spanReturnToRoutes") || {}).innerHTML = i18n.returnToRoutes),
      (($("spanShowDirectionsMap") || {}).innerHTML = i18n.showInMap),
      (($("buttonSearch") || {}).value = i18n.searchRoute),
      (($("inputReverseDepart") || {}).text = i18n.depart),
      (($("inputReverseArrive") || {}).text = i18n.arrive),
      (($("labelDepartureDate") || {}).innerHTML = i18n.departuresFor),
      (($("inputDepartureDate-1") || {}).text = i18n.fromNow),
      (($("inputDate0") || {}).text = ($("inputDepartureDate0") || {}).text =
        i18n.today),
      (($("inputDate1") || {}).text = ($("inputDepartureDate1") || {}).text =
        i18n.tomorrow),
      (($("lblMapTools") || {}).innerHTML = i18n.mapOptions),
      (($("mapShowAllStops") || {}).title = i18n.mapShowAllStops),
      (($("mapShowWifiStops") || {}).title = i18n.mapShowWifiStops),
      (($("mapShowBicyclesRent") || {}).title = i18n.mapShowBicyclesRent),
      (($("mapShowTraffic") || {}).title = i18n.mapShowTraffic),
      (($("mapShowVehicles") || {}).title = i18n.mapShowVehicles),
      (($("mapShowCoolVehicles") || {}).title = i18n.mapShowCoolVehicles),
      (($("mapShowWifiVehicles") || {}).title = i18n.mapShowWifiVehicles),
      (($("mapShowUsbVehicles") || {}).title = i18n.mapShowUsbVehicles),
      (($("mapShowVehiclesBicycleFriendly") || {}).title =
        i18n.mapShowVehiclesBicycleFriendly),
      (($("mapShowPassengers") || {}).title = i18n.mapShowPassengers);
    var c = new Date();
    for (var b = 2; b <= 31; b++) {
      var d = new Date(c.getFullYear(), c.getMonth(), c.getDate() + b);
      (($("inputDate" + b) || {}).text = pg.formatDate(d)),
        (($("inputDepartureDate" + b) || {}).text = pg.formatDate(d));
    }
    (($("labelHandicapped") || {}).title = i18n.checkHandicapped),
      (($("labelBicycle") || {}).title = i18n.checkBicycle),
      (($("aExtendedOptions") || {}).innerHTML = (
        $("divContentPlannerOptionsExtended") || {
          style: {},
        }
      ).style.display
        ? i18n.extendedOptions
        : i18n.extendedOptionsHide),
      (($("labelRoutes") || {}).innerHTML = i18n.rideOnlyRoutes + ""),
      (($("labelChangeTimeText") || {}).innerHTML =
        i18n.timeForConnection + ""),
      (($("labelWalkMaxText") || {}).innerHTML = i18n.walkingMax + ""),
      (($("labelWalkSpeedText") || {}).innerHTML = i18n.walkingSpeed + "");
    var e = $("inputStop");
    e &&
      ((e.title = i18n.typeStartStop),
      e.className == "empty" && (e.value = i18n.startStop)),
      (e = $("inputStart")),
      e &&
        ((e.title = i18n.typeStartStop),
        e.className == "empty" && (e.value = i18n.startStop)),
      (e = $("inputFinish")),
      e &&
        ((e.title = i18n.typeFinishStop),
        e.className == "empty" && (e.value = i18n.finishStop)),
      (e = $("inputRoutes")),
      e &&
        ((e.title = i18n.typeRouteNameOrNumber),
        e.className == "empty" && (e.value = i18n.typeRouteNameOrNumber)),
      (($("labelInputRoutes") || {}).innerHTML = i18n.filter + ":"),
      (($("divFindMyLocation") || {}).innerHTML = i18n.findMyLocation);
  }),
  (pg.fGetCity = function (a) {
    for (var b in cfg.cities) if (cfg.cities[b].region === a) return b;
    return a;
  }),
  (pg.fCreateNavigation = function (a) {
    if (typeof mobile == "undefined" || typeof a != "undefined") {
      var b = '<dt class="splitter"></dt><!-- -->',
        c = pg.fGetCity(pg.city),
        d = 0;
      if (typeof mobile != "undefined") var e = [];
      cfg.defaultCity == "klaipeda" && (c = cfg.defaultCity);
      if (cfg.cities[c]) {
        var f = "",
          g = "",
          h = {};
        for (var i = 1; i <= 2; i++) {
          var j = pg.fUrlSet(
            {
              city: c,
              transport: null,
              hashForMap: null,
            },
            !0
          );
          typeof mobile != "undefined" &&
            e.push({
              hash: j,
              city: c,
              type: i == 1 ? "city" : "region",
              transport: [],
              timeout: cfg.cities[c].goHomeTimeout,
            });
          if (!cfg.cities[c].goHomeTimeout) {
            f +=
              '<dt><a id="' +
              (i == 1 ? "city" : "region") +
              '" href="#' +
              j +
              '">' +
              (cfg.cities[c].logo || "") +
              '<span class="hover">';
            var k = cfg.cities[c].name;
            if (k)
              var l =
                k[pg.language] ||
                k.en ||
                (i == 1 ? i18n.cityRoutes : i18n.regionRoutes);
            else var l = i == 1 ? i18n.cityRoutes : i18n.regionRoutes;
            (f += l),
              typeof mobile != "undefined" &&
                ((e[i - 1].name = l),
                (e[i - 1].logo = cfg.cities[c].logo || "")),
              (f += "</span></a></dt>");
          }
          for (var m = 0; m < cfg.cities[c].transport.length; m++) {
            var n = cfg.cities[c].transport[m];
            if (n == "newyear" && new Date() >= new Date("2023-01-02")) {
              cfg.cities[c].transport.splice(m, 1), --m;
              continue;
            }
            if (
              (cfg.cities[c].transportTemporary || {})[n] &&
              !(ti.cityTransportRoutes || {})[c + "_" + n]
            ) {
              ti.routes && (cfg.cities[c].transport.splice(m, 1), --m);
              continue;
            }
            var o = ' checked="checked"';
            cfg.cities[c].transportPlannerUncheck &&
              cfg.cities[c].transportPlannerUncheck[n] &&
              (o = "");
            var p = pg.fUrlSet(
                {
                  city: c,
                  transport: n,
                  hashForMap: null,
                },
                !0
              ),
              q = ((cfg.cities[c].transportTip || {})[n] || {})[pg.language];
            q && (q = ' title="' + q + '"'),
              (f += (
                '<dt><a id="' +
                c +
                '_{tr}" href="#' +
                p +
                '"' +
                q +
                '><span class="icon icon_{tr}"></span><span class="hover">' +
                i18n.transport[n] +
                "</span></a></dt>"
              ).replace(/{tr}/g, n)),
              typeof mobile != "undefined" &&
                e[i - 1].transport.push({
                  hash: p,
                  transport: n,
                  name: i18n.transport[n + "_mobile"] || i18n.transport[n],
                }),
              h[n] ||
                ((h[n] = !0),
                (g +=
                  (
                    '<label for="checkbox{tr}"><input name="checkbox{tr}" id="checkbox{tr}" type="checkbox" value="{tr}"' +
                    o +
                    "/>"
                  ).replace(/{tr}/g, n) +
                  i18n.transport[n] +
                  "</label> ")),
              (cfg.transportOrder[n] = ++d);
          }
          c = cfg.cities[c].region;
          if (!c || !cfg.cities[c]) break;
          f += b;
        }
        if (cfg.defaultCity == "pskov") {
          f += b;
          var r = ["dedovichi", "nevel", "novorzhev", "ostrov", "porxov"];
          for (var m = 0; m < r.length; ++m) {
            var c = r[m];
            f +=
              '<dt><a id="' +
              c +
              '_bus" href="#' +
              c +
              '/bus"><span class="hover">' +
              cfg.cities[c].name[pg.language] +
              "</span></a></dt>";
          }
        }
        if (
          cfg.defaultCity == "klaipeda" &&
          window.location.href.indexOf("test") >= 0
        ) {
          f += b;
          var r = ["klaipedaraj", "kretinga"];
          for (var m = 0; m < r.length; ++m) {
            var c = r[m],
              k = (cfg.cities[c] || {}).name;
            k && (k = k[pg.language] || k.en),
              c == "klaipedaraj" && (c = "klaipeda"),
              (f +=
                '<dt><a id="' +
                c +
                '_regionalbus" href="#' +
                c +
                '/regionalbus"' +
                (c == pg.city && pg.transport == "regional"
                  ? ' class="current_city"'
                  : "") +
                '><span class="icon icon_regionalbus"></span><span class="hover">' +
                k +
                "</span></a></dt>");
          }
        }
        if (
          cfg.defaultCity == "lsa" ||
          cfg.defaultCity == "lva" ||
          cfg.defaultCity == "taurage"
        ) {
          (f = ""), ((e || {}).transport = []);
          var r = cfg.city.cities;
          if (
            !pg.city ||
            pg.city == "lsa" ||
            pg.city == "lva" ||
            pg.city == "taurage"
          )
            pg.city = r[0];
          for (var m = 0; m < r.length; ++m) {
            var c = r[m],
              k = (cfg.cities[c] || {}).name;
            k && (k = k[pg.language] || k.en),
              (f +=
                '<dt><a id="' +
                c +
                '_city" href="#' +
                c +
                '"' +
                (c == pg.city ? ' class="current_city"' : "") +
                '><span class="hover">&nbsp;' +
                (k || c) +
                "</span></a></dt>");
          }
        }
        (($("listTransports") || {}).innerHTML = f),
          (($("divContentPlannerOptionsTransport") || {}).innerHTML =
            i18n.optionsTransport + "&nbsp;" + g);
      }
      cfg.transportOrder.commercialbus &&
        cfg.transportOrder.regionalbus &&
        (cfg.transportOrder.commercialbus = cfg.transportOrder.regionalbus),
        a && a(e);
    }
  }),
  (pg.fLoadPage = function () {
    (cfg.city.languages = cfg.city.languages || "en,ru"),
      (cfg.defaultLanguage =
        cfg.city.defaultLanguage || cfg.city.languages.split(",")[0]),
      pg.showDeparturesWithNumbers !== !0 &&
        pg.showDeparturesWithNumbers !== !1 &&
        ((pg.showDeparturesWithNumbers = cfg.city.showDeparturesWithNumbers),
        pg.toggleClass(
          $("divScheduleContentInner"),
          "HideNumbers",
          !pg.showDeparturesWithNumbers
        )),
      pg.fTranslateStaticTexts(),
      pg.fCreateLanguagesBar(),
      (pg.loadedRoutesHash = null),
      (pg.loadedDepartingRoutes = null),
      (pg.loadedPlannerParams = null),
      pg.fCreateNavigation(null, "2"),
      pg.fTabActivate();
    pg.schedule
      ? pg.fScheduleLoad()
      : (pg.addCSS(
          ".passengers0,.passengers1,.passengers2,.passengers3 { position: absolute; width: 24px; height: 16px; margin-left:5px!important; background-size: contain; background-repeat: no-repeat; background-position: center; background-color: none; z-index: 105; border: 0px solid black; cursor: pointer; }"
        ),
        pg.addCSS(
          ".passengers0 {background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALwAAAB+CAMAAACpt4smAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABaUExURQAAAJGSqGhpiFpcfXZ3k4OFnTEzXSUnUz9BZ01OckJDabi5yKusvZ+fspCRp8PDz////+zs8OTk6dvb47e4xvPz9aipupucsNHR2s7P2MTF0ODg5tfX3wAAACUnbSkAAAAedFJOU///////////////////////////////////////AOwYHF4AAAAJcEhZcwAAFxAAABcQARhhEdsAAAdySURBVHja7Zxpm7MqDIZxAbdqbTud6Wz//2+eEVc0C6G+23Xke+AmBITkadX3P9zUAX/AH/AH/AF/wB/wB/wBf8Af8D4tipMkSSNR35H+sUlENlH6YxFHO8KnJptbrv06LhY2WexjofOFhUl3gV922bdENt0ehvNmshkmfxq+yKBGuyUykI0hZwsOUzwFH/WdlFrr6qedtC55kmIyqjujZjLCg8dMJqfORE8mUTh8PHR5bqd2qYd+GZCyuc5Gt8EG8+QwTH2ZTc6DSRwKX/R9Lihse+n7TQn2srm7NvemRBcs7Yd5WQ1z7YcpwuDtFirXfXbttUR9byzIZWvTe98gfi9fgWFeSuZ4UPQeKq8t1M4YvcFAftpbCTrSDnMGLa4lfTrg8AT7QG/AxcLYB3oNTfeMWFxLcnspat+h7AN9DEwYZ29bvUWJKfaB3kjhI7rTIe6BCWvC5l5uvj3MdHsnaSF856OmpZrebCY74VvLoazjTJPDNETgKMLxd7LXx8b1hp2wnXGxcvyDtLCrFYngc57DgqTrEKAn3N7cGaes43vX5yL4juPC9NrFgPmWkdgZR8u1IjeW/aaXaNwoNGpYDgviRg0d8V2rnZ3iPUwkgO/2US2F9yJx/ehlUqOfWYWG/Dvba+OeYl4kzoy1x85q23f0qFdoyN/ZXivHJZEcvlvgirW4o0GPwntwfOwB/9FKw3Mf+M8NfN2Ktl8H//mH4L828I0c/usPwf+mmA+A99iwJ/diKYfvrpSn3Tds4eWS1ddDDu+3WBX6GFToK0oHfKTYK4W93OTyL2wqvNuwvV5Xy1n4HDcuCf3g4UKeupg9PD6whXTGLknhcUI9pBczu5W0dB95zPhldRP1OBk0nr0hXlIMSLO5cvDPIjvhVPR+IRyPwuccyA144XAP0u0LPGKdpImUqyIyH+Ub06mBMh8P0Wuae7O/Eo7H4WPajW9gp3S+BEz20E56Lal8pSITpij9G9IplamC02wxRf9Kpm2oXCWaQxxyoAWaIzy3aOYxAr/m22wulxNls8R99vaBYBgiO9tsjr8Lnlo2SEL3oRl2Oj+fQTnuIXOe0zn92sG/9Blu5Cufb6oAc4Y7C6+MDIUC3bz3LPdKM3WC/mFqjU7DRedyGuscdC2l1LoahnlvBhPzTE1qKnN1lZ2p2MKUW4xjMxnlbPloM0zyZDUwBwpdXDlQQ/W0SFgM9CgHetRhC1EpcMBfFQRzvi6cCkuB3hXweGTJ02/fpidnJp515+90XGbjVXU+hBP/AnzUNZlyQmwhM/GBjxJ3+3nEsHZPD+Oh/UjdgyGPd4BPjVgWkIAWVDFbwxIHTvqhRCeeB0xKWCAwCWFCnrHK7+QdPpbu9w/4WCWgxcIkJb6C8CAmpIis5y7r9+U161LNfScgeqfecDI411kvssLPZ5NqOcj9o54lJlFIEdl2ClZqruPNafGqm/QtDXg5v+ntZSvOAMHHVvohLKiNYpUaz0sM1+2p4yKDbraQXmRaL5Nl+EvEuUvDdWRF3MZAxQeAv3hSaC5vo+eHTMqiL8Qu4PGm8EdIw+eJz+MbQ3vNdn7aZZOa58FaXDT2clOC5x/kl6HjDJPZYMKbLM/YLM/aRz7wGZeygTr2Bpmd71FAXjmfh5eBjJoYf5B5wnyCmEkkKIHwCKO3bqklJj39u8QEoldPsw+pP4kbx8RfK6Y3FLwJYe+TvzKUjl4SnCN9gcMnmbjLKe6Fdpb+LKfXKHwge59FLx9iFI+SI5UhV5J8M4Oi5TtFZnJZadTU6grMK2ZwFOGiXeSrdXYrGmqPoJlQRCeOTdgGrJaB4JPwoAkPHJ/rEFrUUq7jX8LhLcpVvM2F83WUikpY9WaioJHP9yF3fbSBf9bxFkU4+1uY63MI/inH236lX2fto1fYHpdr+CITLzr0ndXyUKvlB066ghffrXaJmwCThRZV7Rc1VgEp3H82bu5y17vw6R7wF3nc1H5KLVijpETapv2D4Bo239iBz+TLt1sQCOFnhavaMeR7p7z/avhZ6LMvfBUUwcE7VolEkVz7ysTHdu0nDOXgm+fhP+U+qJ44bhbwzx82Nhx/P3yyD3zA9vu/w+t9Yv7PhM1OR+UpC7kkCi/Fm9PGS8L6K16Ct7BrdLa52zx9Pwh8g8syFtf5Da6cDOv9aXbh8r2Jp7v8lalySmjBKaeJXeRFmxyXvRzPS42gcjVB4UknW13zL6iMs5WNOFSR4m3epoB/SO6PLmPvC4OShMVYGIyhdN9YfNXCt+z4dwICJ45FaEHM3LZlawWXvZublFxwws/lc+/P00NDxXCFaCV+/N9U3OGzlBT0BXNuzZaSAld9iXtn8QcUKxmCovQ1nQzjVH19ridx/7R/abGkWAo3qgqw+Or+bAOwIEzsX20sTdYKCuWhRXTlJwBCvhH7cBZZsZHysCaxt3CCUgmtMXjJz0ozNGDo3N8kFYqFYr7vldpsLUaDppqSYjQfE3+NWRQnoCA30RGup4PmUBB/qhSl4CA59wdJf52uUiJmPBStB/wBf8Af8Af8X9v+AyZTeIMmVCNtAAAAAElFTkSuQmCC);}"
        ),
        pg.addCSS(
          ".passengers1 {background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALwAAAB+CAMAAACpt4smAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABaUExURQAAAJGSqGhpiFpcfSUnUzEzXXZ3k4OFnT9BZ01OckJDaausvc7P2ODg5pCRp7i5yNfX38TF0J+fstHR2v///8PDz+Tk6fPz9aipupucsLe4xuzs8Nvb4wAAAL+R0mUAAAAedFJOU///////////////////////////////////////AOwYHF4AAAAJcEhZcwAAFxAAABcQARhhEdsAAAX/SURBVHja7ZzblrMqDIBBRNS2Ou1Y7T9t3/81t6htBTkF6GltczU36foIIYQkDrp+saAVfoVf4Vf4FX6FX+FX+BV+hV/h7YITkvZCSQb4aUZyrlQQ7KySEcpVSIJjwbOB4S6F0+8mgk7qsuhC0MhZBPgsXQi12iVfKhHL3tKlShYIr/pNbhajElHqpAlstVxwCLwGoxfDpo7rLRnbbHe9bDeMleOOaR0znVSq+oer7A+ThmW/0BVuD7MdJ47fZibHCcZ0PsqqnWl0Ez/1haepSQq9ESV0Lr8ji/aglqyTVU5WeuTLrrH9AHJqFPJPQz/YvTwqNNphwdQHvkhtgjXsKpCbJRcoeFBp1SrDggs4PE7tojwkOvaJvlAtt9WpDPQYDO/AvoiY3OHLv6Yx0i/3V8/eNEx/zvXwxAU+VSyYNY0Zhcoq+q3q5VwaAiYKMLxsen4Zl50JvpW9ILctt/kr9aZHzkmB3fQWp+FSSSu2OM1ttzIQPHWETyR4sxUnLxDDpE2Fm56C4NMUbnpOUllIBjsywfAXFxUIPPOBd3CBptkI0dLB8PJ67fDEGR5fYSTd3G+wk8pGG29QmNfMj5ITieAEPCwcrBo/2lAfCk+uMDMK8HyDa9hmfRb8FqbyRPiDGwmewe8+Bv6rLf8RPk+/Odp8dZz/6hv2lbnNb+zc5mlZZfuKrPKr8/knvaQuL3lJyVXep75h/2x+Bn3DOpm+UFUPTvDqwSVy9eBpdRvyirqNw0X1uRUzc41YW/vX1io7XaU10y74Mqjkr6sSXzVV4qO+xj1ViduoVWJzrTXzqM9T06Ui4p+rUSV/RmcEu3RG9lObY2ot5Jbg0KvUQzOlriJ0RrSu49WTysA9GPo/7gYOvxveh6UefViHPrJj+35sTReEXd0FEwJpZ49N8wLSaF8HJz4dHvdOwCVz9wHMRhUGUMlGFRxtcAIvQl9u80m2uN4K22nJFhHKPi1ig88otAOufQoYQo7uKreMfiBovJ7BMHtcdbncMseqFgw+h5ScpKumv+rZph6kTw9ut73i0nygc5VRo08PZiq5B3zu8pYSL1t6p9hIT9nzffRDZGF38GovqbT30Q/wMzBxLdwUckpTMs2r7jb6MTsu+Y1c/Rg53/kxBD5P3QULyWR1NrymxcEbNqGbHuDTtIg6KQmtEt92dcrJq85SdJpY8D3E2Co9N3zqCJ+lQClur6GLvUo8sWTjTinGbDSlG5XroAB3l8RU9Fg+79LUNnYw8/3bgq3whS/7b+Mo03u2N/vZVeWkpEfR7N42ztKO9JW7xrTgzAyfebK79NJk+n0DpjfD+7K7uu+cvuwC6VEk9h7lDKZnDZie6uHzAHggCqd3jU9zeqKDZyHsPijlBaQiV5lRJKeBO86AAtstub6PIkR4T8fhKNbkQNFZyZTwoeyAe2rMFEpoxJEcB0U6rb6mB91UkwpRwIezQ03fwr1e6K8hj5b9O71e6GyimIYHBxxP01MZnkWB93BhSEYndfNRxOPq4Tc84Hgc2USCj8MO9RuOAlzv5XFkY8PDUuPRb86+foMC3yChfsPnbzZweCbA0zfBn0uv9RIBPhY79L73cPrHJHh0eNjjzgf+4fTx4Wv4ie3C4HE8+AruwduPgQc6Qe21WWP5DAVWPD4Bnqzwb4J/n88f/OCfFCo3zw6V3fMuKWCadYSnB9W9/vHmxGyom/2Blzs1Gt6bzwdWLGO/YY9gENgz8DSvFaPwyrxvuXJsroGWOzW08LJuE04P8d5xaBJUal18w4/8PhVRszuD3LvD7lGyrZb/PQF5fisS8Hy9VI+5ArfrqasfowiJoa0TUgEpGatqY7Q51/OJiFHlsDdZv3v8w4rlFAIK+FJHt4Jh3mO3241QXf/Xzzj7IXBLKnW9F1S20uyHasYHQcdw1VNALNdBqYFzpr4WDSoFYOrD9fDe56+w85YR/TSXzjwJeFiIWXCK5cRkZsFZTkzixHzMqGGW0z4gx4f0BKSckMQ8fseH9ASkwjYWiHFCiLDZLmOB61DoCr/Cr/Ar/Aq/wj9D/gNyCg/YMxkinAAAAABJRU5ErkJggg==);}"
        ),
        pg.addCSS(
          ".passengers2 {background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALwAAAB+CAMAAACpt4smAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABaUExURQAAAGhpiFpcfTEzXSUnUz9BZ4OFnZGSqE1OcnZ3k0JDabi5yNfX3+Dg5pCRp+Tk6f///+zs8J+fsqipusPDz9vb45ucsLe4xqusvfPz9c7P2MTF0NHR2gAAAH7vzlcAAAAedFJOU///////////////////////////////////////AOwYHF4AAAAJcEhZcwAAFxAAABcQARhhEdsAAAT7SURBVHja7ZrrkuogDIAp0GDpqlWPx3X3+P6vebT10tJySVrcZYb8cmYn3Y8QQkjCLgkLy/AZPsNn+Ayf4TN8hs/wGT7DB0jBhZSy5ID4tOKrq45ccRWsAry8agheLAYPtw++ZBW22oGOqAJUVgOVEhaAr+RIhNeU5ViJe7ZJjFWqmfBT37yZxanEJ3WcLOWkhs9KjIJxFcemCpuOdcnQ/V0D1B/rq9Qb0CH7xS5oe3RiPVMOHenyTA3b5iW7fcdfUuGFi8NycJVTR1oPqoZdY8ihpRc0eDe7xYc9OtJid/2nGcuxNb6gwK98HFLh2cco7VbpbTMpf7UzNlvhlfQL6pBYQqaL/U6v0PAB7CObgESv+La/+thYBezn3A7PJR4kaMGG49zYT3b2ZqsdAZPNMLwZyKowJWX4GTQuOWm76VlwUuA3vcSv2OnwL8epUPAiEKQgwMth+uY2fGd6gYKXeBAjkXQIDAx/9MC3psfAAwU+WGfVV/EZvoMHBDwPBlEEeNm/S/zwn9Z4w2a5/OAo4eFvYWHvhf+whno2z+V7JlF4+NsG1174s/618F9NQz6xPwKvevDr1OCTtnxcn0862iQd55O+YZPObdLOKpPO55N+SaX9hk26epB23SbpilnatUpalfjyS6rEadfn39YZUTE6I1aSJHpSaXcDE+/D3u1P74DzH+2A58GJ1OAV8FZUuNuoqtUoAlXiwMMoMfKelsqMUIIvB69uVgkyie0t6wg5tiTQE3JC4E2juGyiyvCX1+PzApNCo+ALjE2UwD0cB5fgNTuAz7qVzfWn9l/nbngQKJsI9LtXvcC/z8YDcP/k5wT4CvcqCi6zFUYaoWEz/RjZPfnV0o8RIzEOr28+cnS4o7se4P/u+CsU/ArFEVzo6b0gu//grB308AUCPtyOBbbMes8YRWf2s78+f9IW12GzCmb9HZUEmXy6Tvh+Z/wqCJ7jEAS2ufAMMbsmUA6T9Izu7iZ9hVWDJlz+TNGzBdgf9FjF7wZN74MvKM4rsNGydZvzTHo266ya9BH95k4vnPCSKJywcn3A03MHvKDCd2EY6zhHFP3BqNWzWUFyXA6L6jhtwVtY4Wewd5dViTT9CQV/1IN4yRZyGqrpcRHHcByGbSj4MnWk6eUG7zh8En6e4d/i9YP+GlvO8HfTi6heP+hsMlxHKcD0EN/0YgJ+NnuX22OP7BZv+jF8MR9evunIFiN4uRB8Fddvjq8juzA8yW92VL9hhBkbX3KJVfrEw4MBz6X8IadH+s1r8okt6jUdfBEXfvd0+qXhFeGyQ8K/nH5peB4/Oftd8CGDoW54tQw8KdzUeHgVA15m+AxPTOnfAB8l2lTxQ+V54pIqF/OayDfs5ln/WDirJN1RuIdgWzczEzNqlXIU5eNmB/2KJbssSE+qtuKegYd+rZjRxuYd/R1klT6wszNorsF0uW/OqQXK9mFKrY+2prJViZWYc1Tx7MFRcvuY+BOuzogqqeGdECUDr6fjaxSh8HUDK0HwdZLXaYD9t8v656+6P0TBg5rIENoBL+af99u4B9T113q9vq/jvF5/1PW+j21a3Tc4oQrnCsRwegl1WkqY9rB2HQbyaH8xw0Lt4FfvI5aBJ8WRZ3s0sRm2v9FmzDx7dV15NV6zZwWO6bQYA3JKFZwPnKjkvFJulcHudhsMvoG2PFeZ4TN8hs/wGT7Dx5D/ocdY4bPAzA4AAAAASUVORK5CYII=);}"
        ),
        pg.addCSS(
          ".passengers3 {background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALwAAAB+CAMAAACpt4smAAAACXBIWXMAABcRAAAXEQHKJvM/AAAAM1BMVEVHcEwlJ1MlJ1MlJ1MlJ1MlJ1MlJ1MlJ1MlJ1MlJ1MlJ1MlJ1MlJ1MlJ1MlJ1MlJ1MlJ1PEPTUWAAAAEHRSTlMAoCBgQBAwgPDA4NBQcLCQrD4XIAAABURJREFUeNrtnNuW2yAMRc3NXG34/69txvFMMwmADiZtZ5XzkifhjRDippVlmZqampqampqampoiaJUf4pCNOmwkYsIPi3UgeIg+fcputA4osZtPG8eEooBv9uszPoYR5Eq79F1eNI0ke7IxrNVnYZ9MnFZX2bVJr3L1UOB7xiaxGot0GQujr0W6T3nVSDaTtzHFSFCs8Bl/IfpFAaPWrNqLNimCLkrJiG72VJHJ0ytfM2JZdlMzEW9gL9DX2bP0dfZO+pAaMpm431tGL/TKtEw6kiZvNprsa25q2ryg2KaF4TB8u9GUnlPZSrB5Gq+NYGIHB3zeJ5QOfw8cwvh2hL1LMEh7ltz12GNGsnBvcPxNCnb8tx4r4mfE8Ij/0AZG/FOPN6IFFPWcyuEfjGKC/eipJvwNUfOtVTLJDvsIihvW0aoi2xhwhpf2FQWRnfiQ6mWCh0unnvBsic5h4cl3kwTTwk1vhtf/CbzG4dVPhuf/DHyYMX9tW/b9WAqkyhVdk6Gt2U5udcO3FL/dSF/IdwB+g52IDJeFt3IJucFZe4aT4aPlOnw0LugjfhZ5THvxDSFPjxve0WOLb7037HrVoBz0Hkv40GPAK1cNcyyLcnCH5fDpSgZh6D3V69yjzHIH33XLnkZ32IsUJ8kFlu7IX20Uj2flrlv61ogK+Mb3xq7g8zJblvH0+TNxnd4r+LTfyV6lL976rw5kr75h9LNXmnXl9br8NBLh16P+h5FjCcyvIvWHupDtcu0VTuWzg+XLNclX/Oaz5OvzZ3INH/LXELVyuS4eH0fVkh6El8Ae3O8YgUOJx3jzkS+DpKQ+JBBnrOFuFOgYUtxNpFqmpqZ60+UW7ZlxnN11UJQZzuyZL71lG2Gi86B3e6Yoa6MYUXTDt8yK6WOt6VVnVsx6oU6Ir7sKs4trSUcUz2lO52HUVtzc+AIMj8XNzd5dM5RZKFsrLWfVXaXJ7Ctk/QTj+rY3on0If8JX7QPMcwEQbx++HO79lfS0Y7bmhqy6QaOd89ENGvnO96thRb7gjApy0LOPmtEOXD6f1Vcr/WY5eU6Ny98BSk48CMjnfdYKkJyFRgL5iCfSQxxfZzXMSsD0Zn0L+0kfEkwfR9N3sJ/0Gqe3Y+l5D/sZ9ziKMiPjXvnUpwCjHHe/EvqIHVUy8YzC4bC3+AerV38hdcvCgXOgYKNVu3RVph/+CHuOmaxYwUX9gYddYL/HMMNHy40JnDVdEsNdH9Clqlwiaq/BH89rDI8CB7uo7zGk3S44egKO+kIBCLsKf1TFYAuFh6rTylGvLrMf7W54wtmxqL9WcFANYYWHmsBneX9JX92PHvYj2N/9QhVr9YQHby6PNdNejRsxAt7jSUv39Xd0rvnMN/ieSF7NN24IPB4Eaenqb29RXMspDJ/k7lrQyzHwDI/ggA+Weg+8xQ8FGj2Jv85YPQ7+z6ebQfAJh9/xr4v3wa/4YGl8sN4E/+cT/Y/2vBjD/nf2B3wMfMfObB2wMxuzt+F/5yzFzQB2jUeNhMcqV6oYrrMz/A5C4Hec2ctiMYRdwOxYxJYuuld3OWbA552AP+8UL+lV7Ee/twrNnPsrGRKu9f9x4J1J53yoRvx+1pAhfm9Wt/GIB88ukWfkw4WfHPREQ/zzj8AQ/q/iDHLQGRbqpY8Z8giUsKzbTvGiffwrl2AJJmbXDxiRsqC5fcNL/bjUzJZ4vNWZep416N0We7rnKv2k0LZY0WrZxUq/Vd4LE6O1TB+1hrLVoJRnWeKN915r2Pq3ICXPskRm7fG7of9jNDU1NTU1NTX1w/ULxvvP5o251QAAAAAASUVORK5CYII=);}"
        ));
  }),
  (pg.fLoadLanguageScript = function (a, b) {
    var c = $("scriptLanguage");
    c && document.getElementsByTagName("head")[0].removeChild(c);
    var d = document.createElement("script");
    d.setAttribute("id", "scriptLanguage"),
      d.setAttribute("type", "text/javascript"),
      (d.async = !1),
      d.setAttribute("src", pg.translationFolder + a + ".js"),
      b &&
        d.addEventListener(
          "load",
          function (a) {
            b(a);
          },
          !1
        ),
      document.getElementsByTagName("head")[0].appendChild(d);
  }),
  (pg.fTogglePlannerOptions = function (a) {
    var b = $("divContentPlannerOptionsExtended");
    b.style.display && a !== !1
      ? ((b.style.display = ""),
        (($("aExtendedOptions") || {}).innerHTML = i18n.extendedOptionsHide))
      : ((b.style.display = "none"),
        (($("aExtendedOptions") || {}).innerHTML = i18n.extendedOptions));
    if (a) return pg.cancelEvent(a);
  }),
  (pg.storeMyLocation = function (a) {
    var b = (a.coords.latitude = Math.round(a.coords.latitude * 1e6) / 1e6),
      c = (a.coords.longitude = Math.round(a.coords.longitude * 1e6) / 1e6);
    pg.myLocation = b + ";" + c;
  }),
  (pg.replaceHtml = function (a, b) {
    if (a) {
      var c = a.nextSibling,
        d = a.parentNode;
      d.removeChild(a),
        (a.innerHTML = b),
        c ? d.insertBefore(a, c) : d.appendChild(a);
    }
  }),
  (pg.storeStyles = function () {
    pg.styles = {};
    var a = document.styleSheets || [];
    for (var b = 0; b < a.length; ++b) {
      var c = [];
      try {
        c = a[b].rules || a[b].cssRules || [];
      } catch (d) {}
      for (var e = c.length; --e >= 0; ) {
        var f = c[e].selectorText;
        if (f) {
          var g = c[e].style,
            h = f.split(",");
          for (var i = h.length; --i >= 0; ) pg.styles[h[i].trim()] = g;
        }
      }
    }
  }),
  (pg.getProtocol = function () {
    return location.protocol == "https:" ? "https:" : "http:";
  }),
  (pg.getStyle = function (a) {
    if (a && a.indexOf("transport_icon_") == 0) {
      var b = a.substring("transport_icon_".length),
        c =
          (
            pg.styles[".icon.icon_" + b] ||
            pg.styles[".icon_" + b + ".icon"] ||
            pg.styles[".icon-" + b] || {
              backgroundImage: pg.imagesFolder + b + ".png",
            }
          ).backgroundImage || "";
      (c = c.replace(/\"/g, "")),
        (c = c.replace(/\'/g, "")),
        c.indexOf("url(") == 0 && (c = c.substring(4, c.length - 1));
      return c;
    }
    return pg.styles[a];
  }),
  (pg.styleRGBtoHex = function (a) {
    if (a == "green") return "008000";
    if (a == "purple") return "800080";
    if (a == "orange") return "FFA500";
    if (a.indexOf("#") === 0) return a.substring(1);
    var b = a.replace("rgb(", "").replace(")", ""),
      c = b.split(",");
    b = ((1 << 24) + (+c[0] << 16) + (+c[1] << 8) + +c[2])
      .toString(16)
      .slice(1);
    return b;
  }),
  (pg.toggleClass = function (a, b, c) {
    if (a) {
      var d = " " + (a.className || "") + " ";
      c && d.indexOf(" " + b + " ") < 0
        ? (a.className = (d + b).trim())
        : !c &&
          d.indexOf(" " + b + " ") >= 0 &&
          (a.className = d.replace(" " + b + " ", "").trim());
    }
  }),
  (pg.cancelEvent = function (a) {
    a &&
      ((a.cancelBubble = !0),
      (a.returnValue = !1),
      a.preventDefault && a.preventDefault(),
      a.stopPropagation && a.stopPropagation());
    return !1;
  }),
  (pg.formatDate = function (a, b) {
    typeof a == "number" && (a = new Date(a * 1e3 * 60 * 60 * 24));
    var c = a.getDate(),
      d = 1 + a.getMonth(),
      e = a.getFullYear();
    if (typeof b != "undefined" || pg.language == "ru" || pg.language == "ee")
      (e = c), (c = a.getFullYear());
    var f =
      (e < 10 ? "0" : "") +
      e +
      (d < 10 ? "-0" : "-") +
      d +
      (c < 10 ? "-0" : "-") +
      c;
    return b ? f.replace(/-/g, b) : f;
  }),
  (pg.nonEmptyCount = function (a) {
    var b = 0;
    for (var c in a) a.hasOwnProperty(c) && a[c] && ++b;
    return b;
  }),
  (pg.render_airport_icon = function (a, b) {
    if (
      a &&
      a.length >= 9 &&
      a.toLowerCase().indexOf("ro uostas") >= (b ? a.length - 9 : 0)
    )
      return (
        '&nbsp;<img style="vertical-align:text-top;" height="16" width="16" src="' +
        pg.imagesFolder +
        'airport_gray_36.png" alt="airport" title="" />'
      );
    return "";
  }),
  (pg.renderTimetableIntervals = function (a) {
    var b = [],
      c = 0,
      d = -999;
    for (var e = 0; e < a.length; e++) {
      var f = a[e];
      (f.time = f.departure || f.hour * 60 + f.min),
        f.hour || (f.hour = ~~(f.time / 60)),
        e > 0 && f.hour != d && c++,
        (d = f.hour);
      var g = b[c];
      g || (b[c] = g = {}),
        g.first
          ? (g.k++,
            g.max < f.time - g.last && (g.max = f.time - g.last),
            (g.min = f.time - (g.last - (g.last % 60))),
            g.k > 2 && (g.min = ~~(0.5 + g.min / (g.k - 1))),
            g.min > g.max && (g.min = g.max))
          : ((g.first = f.time),
            (g.min = 999999),
            (g.max = -999999),
            (g.k = 1)),
        (g.last = f.time);
    }
    html_timetable = "";
    for (var h = 0, i = -999999; h <= b.length; h++) {
      h != 0 &&
        b[h - 1].first != b[h - 1].last &&
        (h < b.length &&
          (b[h].first - i > 30
            ? (html_timetable +=
                "-" + ti.printTime(i) + (i < 600 || i >= 1440 ? "&numsp;" : ""))
            : (html_timetable +=
                "-" +
                ((~~(i / 60) % 24) + 1) +
                ":00" +
                (i < 540 || i > 1440 ? "&numsp;" : ""))),
        b[h - 1].k != 1 &&
          ((html_timetable += " " + i18n.every + " " + b[h - 1].min),
          b[h - 1].max > b[h - 1].min && (html_timetable += "-" + b[h - 1].max),
          (html_timetable += " " + i18n.minutesShort)));
      if (h >= b.length) break;
      html_timetable && (html_timetable += "<br/>");
      if (b[h].first < 600 || b[h].first >= 1440) html_timetable += "&numsp;";
      b[h].first - i > 30 || b[h].first == b[h].last
        ? (html_timetable += ti.printTime(b[h].first))
        : (html_timetable += ~~(b[h].first / 60) + ":00"),
        h == b.length - 1 &&
          b[h].first != b[h].last &&
          (html_timetable += "-" + ti.printTime(b[h].last)),
        (i = b[h].last);
    }
    return html_timetable;
  }),
  (pg.vehicle_features_html = function (a, b) {
    var c = [];
    (a = a || {}),
      a.bLowFloorVehicle &&
        b &&
        (cfg.defaultCity == "riga"
          ? c.push('<span class="icon_wheelchair_svg">')
          : c.push(
              '<img class="icon highlighted" src="' +
                pg.imagesFolder +
                'wheelchair.svg">'
            )),
      a.bCoolVehicle &&
        c.push('<img class="icon" src="' + pg.imagesFolder + 'snowflake.png">'),
      a.bBicycle &&
        c.push('<img class="icon" src="' + pg.imagesFolder + 'bicycle.png">');
    return c.join("&nbsp;");
  }),
  cfg.city.areaBounds &&
    (pg.geocoder = {
      index: {},
      suggestions: {},
      interval: 300,
      timer: null,
      getPlaceId: function (key, callback) {
        var self = this,
          url =
            "https://geocoder.api.here.com/6.2/geocode.json?app_id=tCceiFWbbHa1UBUxw6P0&app_code=rpIftmFMyPP4h_m1YdP8Dw&jsonattributes=1&gen=9&locationid=" +
            key.slice(1);
        ti.fDownloadUrl("GET", url, function (response) {
          var result = [];
          try {
            JSON
              ? (result = JSON.parse(response))
              : (result = eval("(function(){return " + response + ";})()")),
              (result = (result.response || {}).view || []),
              (result = (result[0] || {}).result || []);
          } catch (error) {
            typeof (console || {}).log == "function" &&
              (console.log(
                "WARNING: invalid JSON data from place details service: " +
                  error
              ),
              console.log("JSON data: " + response));
          }
          if (result.length) {
            result = (result[0] || {}).location || {};
            var address = (result.address || {}).label || "";
            (address = address.replace(", Lietuva", "")),
              (result = result.displayPosition || {});
            var lat = Math.round((result.latitude || 0) * 1e5) / 1e5,
              lng = Math.round((result.longitude || 0) * 1e5) / 1e5;
            if (lat && lng) {
              var id = [lat, lng].join(";");
              (self.index[id] = address || id), callback(id);
            }
          }
        });
      },
      search: function (str, callback) {
        debugger;
        var str2 = ti.toAscii(str.trim());
        if (this.suggestions[str2]) callback(this.suggestions[str2]);
        else {
          var self = this;
          this.timer !== null &&
            (window.clearTimeout(this.timer), (this.timer = null)),
            (this.timer = window.setTimeout(function () {
              var b = cfg.city.areaBounds,
                url =
                  "https://places.api.here.com/places/v1/autosuggest?app_id=tCceiFWbbHa1UBUxw6P0&app_code=rpIftmFMyPP4h_m1YdP8Dw" +
                  encodeURI("&hlStart=<b>&hlEnd=</b>&q=" + str) +
                  "&in=" +
                  b.southWest.lng +
                  "," +
                  b.southWest.lat +
                  "," +
                  b.northEast.lng +
                  "," +
                  b.northEast.lat;
              ti.fDownloadUrl("GET", url, function (response) {
                var predictions = [];
                try {
                  JSON
                    ? (predictions = JSON.parse(response))
                    : (predictions = eval(
                        "(function(){return " + response + ";})()"
                      )),
                    (predictions =
                      predictions.results || predictions.suggestions || []);
                } catch (error) {
                  typeof (console || {}).log == "function" &&
                    (console.log(
                      "WARNING: invalid JSON data from autosuggest service: " +
                        error
                    ),
                    console.log("JSON data: " + response));
                }
                var patt = cfg.city.addressFilter;
                if (predictions.length) {
                  var final_results = [],
                    collected_names = {};
                  for (
                    var i = 0, prediction;
                    (prediction = predictions[i]);
                    i++
                  ) {
                    if ((prediction.position || []).length < 2) continue;
                    if (
                      (prediction.title || "").toLowerCase().indexOf("pisim") >=
                      0
                    )
                      continue;
                    var name = prediction.title + ", " + prediction.vicinity,
                      name0 = name.split("<br/>").join(", ");
                    (name =
                      prediction.highlightedTitle +
                      ", " +
                      prediction.highlightedVicinity),
                      (name = name.split("<br/>").join(", "));
                    if (collected_names[name]) continue;
                    collected_names[name] = !0;
                    var lat =
                        Math.round((prediction.position[0] || 0) * 1e5) / 1e5,
                      lng =
                        Math.round((prediction.position[1] || 0) * 1e5) / 1e5;
                    name0.indexOf("Viln") >= 0 &&
                      name0.toLowerCase().indexOf("savivald") >= 0 &&
                      name0.toLowerCase().indexOf("raj") < 0 &&
                      name0.indexOf("Vilniaus R") < 0 &&
                      ((lat = 54.69586), (lng = 25.278718));
                    var id = lat + ";" + lng;
                    (self.index[id] = name0 || id),
                      final_results.push({
                        name: name,
                        type: prediction.type,
                        id: id,
                        lat: lat,
                        lng: lng,
                      }),
                      (self.suggestions[name] =
                        final_results[final_results.length - 1]);
                  }
                  (self.suggestions[str2] = final_results),
                    callback(final_results);
                } else callback([]);
              });
            }, self.interval));
        }
      },
    }),
  (pg.location_interval_key = null),
  (pg.location_circle = null),
  (pg.location = null),
  (pg.getLocation = function (a) {
    a.classList.add("active");
    if (navigator.geolocation) {
      window.clearInterval(pg.location_interval_key),
        (pg.location_interval_key = window.setInterval(function () {
          a.classList.toggle("active");
        }, 500));
      function b(b) {
        window.clearInterval(pg.location_interval_key),
          a.classList.add("active"),
          (pg.location = b);
        var c = [b.coords.latitude, b.coords.longitude];
        pg.GMap &&
          (pg.location_circle && pg.location_circle.remove(),
          (pg.location_circle = L.circle(c, b.accuracy).addTo(pg.GMap)),
          pg.GMap.flyTo(c, 16),
          pg.GMap.once("moveend", function () {
            pg.fToggleVehicles(2),
              (pg.mapShowAllStops = 2),
              pg.clusterManager.refresh();
          }));
      }
      function c(b) {
        window.clearInterval(pg.location_interval_key),
          a.classList.remove("active");
        var b = "";
        switch (b.code) {
          case b.PERMISSION_DENIED:
            b = "User denied the request for Geolocation.";
            break;
          case b.POSITION_UNAVAILABLE:
            b = "Location information is unavailable.";
            break;
          case b.TIMEOUT:
            b = "The request to get user location timed out.";
            break;
          case b.UNKNOWN_ERROR:
            b = "An unknown error occurred.";
        }
        console.log("error", b);
      }
      navigator.geolocation.getCurrentPosition(b, c, {
        maximumAge: 6e5,
        timeout: 1e4,
        enableHighAccuracy: !0,
      });
    } else console.log("Geolocation is not supported by this browser.");
  }),
  (pg.fUrlSet = function (a, b) {
    if (a) {
      a.schedule &&
        pg.schedule &&
        (typeof a.schedule.city == "undefined" &&
          (a.schedule.city = pg.schedule.city),
        typeof a.schedule.transport == "undefined" &&
          (a.schedule.transport = pg.schedule.transport),
        typeof a.schedule.num == "undefined" &&
          (a.schedule.num = pg.schedule.num),
        typeof a.schedule.dirType == "undefined" &&
          (a.schedule.dirType = pg.schedule.dirType),
        typeof a.schedule.stopId == "undefined" &&
          (a.schedule.stopId = pg.schedule.stopId));
      var c = [
        "city",
        "transport",
        "inputStop",
        "inputStart",
        "inputFinish",
        "hashForMap",
        "language",
      ];
      for (var d = c.length; --d >= 0; )
        typeof a[c[d]] == "undefined" && (a[c[d]] = pg[c[d]]);
    } else a = pg;
    var e = "";
    if (a.schedule)
      (e = (a.schedule.tripNum || "") + (e ? "/" + e : "")),
        (e = (a.schedule.stopId || "") + (e ? "/" + e : "")),
        (e =
          (typeof mobile != "undefined" && !b
            ? a.schedule.dirUrl || ""
            : a.schedule.dirType || "") + (e ? "/" + e : "")),
        (e = (a.schedule.num || "") + (e ? "/" + e : "")),
        (e = (a.schedule.transport || "") + (e ? "/" + e : "")),
        a.schedule.city &&
          a.schedule.city != cfg.defaultCity &&
          (e = a.schedule.city + (e ? "/" + e : "")),
        (e += a.hashForMap ? "/map" : "");
    else {
      a.transport == "stop"
        ? ((a.city = pg.fGetCity(a.city)),
          (e = "stop" + (a.inputStop ? "/" + a.inputStop : "")))
        : a.transport == "plan"
        ? ((a.city = pg.fGetCity(a.city)),
          (e =
            "plan/" +
            (a.inputStart || "") +
            (a.inputFinish ? "/" + a.inputFinish : "")))
        : a.transport == "schools"
        ? ((a.city = pg.fGetCity(a.city)),
          (e =
            "schools/" +
            (
              a.mapCenterTo || {
                id: "",
              }
            ).id))
        : a.transport == "vilniusfest"
        ? ((a.city = pg.fGetCity(a.city)),
          (e =
            "vilniusfest/" +
            (
              a.mapCenterTo || {
                id: "",
              }
            ).id))
        : (e = (a.transport || "") + (e ? "/" + e : ""));
      if (!e || a.city !== cfg.defaultCity) e = a.city + (e ? "/" + e : "");
      e += a.hashForMap ? "/" + a.hashForMap : "";
    }
    (e += a.language != cfg.defaultLanguage ? "/" + a.language : ""),
      (e = ti.toAscii(e, !0));
    if (b) return e;
    Hash.go(e);
    return e;
  }),
  (pg.fUrlSetMap = function (a, b) {
    var c = pg.hashForMap || "map";
    a
      ? (typeof a != "object" && (a = {}),
        a.optimalRoute && (c = "map,,," + a.optimalRoute),
        a.maximized && c.indexOf(",max") < 0 && (c += ",max"),
        a.maximized === !1 && (c = c.replace(",max", "")),
        a.clusters && c.indexOf(",stops") < 0 && (c += ",stops"),
        a.clusters === !1 && (c = c.replace(",stops", "")))
      : (c = "");
    if (b) return c;
    (pg.hashForMap = c),
      (c = pg.fUrlSet(null, !0)),
      c != Hash.getHash() ? Hash.go(c) : pg.fMapShow();
  }),
  (pg.fUrlParse = function (a) {
    a = decodeURI(a);
    var b = {},
      c = a.indexOf("#");
    c >= 0 && (a = a.substring(c + 1)),
      (a = a ? a.split("/") : []),
      a.length &&
      ("," + cfg.city.languages + ",").indexOf("," + a[a.length - 1] + ",") >= 0
        ? (b.language = a.pop())
        : (b.language = cfg.defaultLanguage),
      a.length && "map" === a[a.length - 1].substring(0, 3)
        ? (b.hashForMap = a.pop())
        : (b.hashForMap = ""),
      (b.transport = ""),
      a[0] ||
        (b.transport =
          typeof cfg.city.defaultTransport != "undefined"
            ? cfg.city.defaultTransport
            : cfg.city.transport[0]),
      a.length && cfg.cities[a[0]]
        ? (b.city = a.shift())
        : (b.city = cfg.defaultCity),
      a[0] &&
        ((b.transport = a[0]),
        a[0] === "stop"
          ? (b.inputStop = a[1] || "")
          : a[0] === "plan"
          ? ((b.inputStart = a[1] || ""), (b.inputFinish = a[2] || ""))
          : a[0] === "schools"
          ? ((pg.mapCenterTo = {
              type: "finish",
              id: a[1] || "",
            }),
            (b.mapCenterTo = {
              type: "finish",
              id: a[1] || "",
            }))
          : a[0] === "vilniusfest"
          ? ((pg.mapCenterTo = {
              type: "finish",
              id: a[1] || "",
            }),
            (b.mapCenterTo = {
              type: "finish",
              id: a[1] || "",
            }))
          : a[1] &&
            (b.schedule = {
              city: b.city,
              transport: a[0],
              num: a[1],
              dirType: a[2] || "",
              stopId: a[3] || "",
              tripNum: isNaN(a[4]) ? 0 : +a[4],
              dirUrl: a[2] || "",
            }));
    return b;
  }),
  (pg.fUrlExecute = function (a) {
    var b = pg.fUrlParse(a),
      c = pg.language;
    pg.language = b.language;
    var d = pg.city;
    pg.city = b.city;
    var e = pg.hashForMap;
    (pg.hashForMap = b.hashForMap),
      (pg.transport = b.transport),
      (pg.inputStop = b.inputStop || pg.inputStop),
      (pg.inputStart = b.inputStart || pg.inputStart),
      (pg.inputFinish = b.inputFinish || pg.inputFinish),
      (pg.urlPrevious = pg.urlLoaded),
      (pg.urlLoaded = a),
      b.schedule
        ? pg.fScheduleShow(b.schedule)
        : (pg.fScheduleHide(), pg.fTabActivate()),
      c != pg.language &&
        (c || pg.language != cfg.defaultLanguage) &&
        pg.fLoadLanguageScript(pg.language),
      d !== pg.city &&
        cfg.defaultCity != "pskov" &&
        (
          cfg.cities[d] || {
            region: "",
          }
        ).region !== pg.city &&
        pg.fLoadPage(),
      pg.hashForMap
        ? (e !== pg.hashForMap, pg.fMapShow())
        : document.body.className.indexOf("Map") >= 0 && pg.fMapHide(),
      typeof mobile != "undefined" && ((b.hash = a), mobile.render(b));
  }),
  (cfg.yandexAPIkey = "fd2746d9-dd29-4e30-a38a-a0d53590c8a1"),
  (cfg.hereAppId = "tCceiFWbbHa1UBUxw6P0"),
  (cfg.hereAppCode = "rpIftmFMyPP4h_m1YdP8Dw"),
  typeof $ == "undefined" &&
    ($ = function (a) {
      return document.getElementById(a);
    }),
  typeof jq == "undefined" &&
    (jq = function (a) {
      var b = null;
      if (typeof a == "string") {
        var c = a.charAt(0);
        c == "#"
          ? (b = document.getElementById(a.substr(1)))
          : c == "."
          ? (b = document.getElementsByClassName(a.substr(1))[0])
          : (b = document.getElementsByTagName(a)[0]);
      } else b = a;
      return {
        el: b,
        hasClass: function (a) {
          return this.el.className.match(new RegExp("(\\s|^)" + a + "(\\s|$)"));
        },
        addClass: function (a) {
          this.hasClass(a) || (this.el.className += " " + a);
          return this;
        },
        removeClass: function (a) {
          this.el.className = this.el.className.replace(
            new RegExp("\\b" + a + "\\b"),
            ""
          );
          return this;
        },
        toggleClass: function (a) {
          var b = this.el.className.split(" "),
            c = b.indexOf(a);
          c != -1 ? b.splice(c, 1) : b.push(a),
            (this.el.className = b.join(" "));
        },
        bind: function (a, b) {
          this.el &&
            ("addEventListener" in this.el
              ? this.el.addEventListener(a, b, !1)
              : this.el.attachEvent && this.el.attachEvent("on" + a, b));
        },
        html: function (a) {
          this.el.innerHTML = a;
        },
        remove: function () {
          this.el && this.el.parentNode.removeChild(this.el);
        },
      };
    });
var leaflet = {
  loadingYandex: 0,
  baseLayerYandex: !1,
};
(pg.fTabShowMap_Click = function (a, b) {
  b == "traffic"
    ? (pg.fShowTraffic(!0),
      (pg.mapShowAllStops = -Math.abs(pg.mapShowAllStops)))
    : b == "vehicles"
    ? pg.fToggleVehicles(2)
    : (pg.fShowTraffic(!1),
      (pg.mapShowAllStops =
        typeof mobile == "xxxundefined"
          ? -Math.abs(pg.mapShowAllStops)
          : Math.abs(pg.mapShowAllStops))),
    pg.hashForMap == "map" && b != "mylocation"
      ? pg.fMapShow()
      : ((pg.hashForMap = "map"),
        b == "mylocation" && (pg.hashForMap = "map,mylocation"),
        pg.fUrlSet());
  return pg.cancelEvent(a);
}),
  (pg.fMapHide = function () {
    pg.mapShowVehiclesInterval &&
      (clearInterval(pg.mapShowVehiclesInterval),
      (pg.mapShowVehiclesInterval = 0)),
      pg.schedule && (document.body.className = "ScheduleDisplayed"),
      pg.browserVersion <= 7 &&
        ($("divContent").innerHTML = $("divContent").innerHTML),
      jq("body")
        .removeClass("ScheduleMapDisplayed")
        .removeClass("MapDisplayed")
        .removeClass("MapDisplayedMax");
  }),
  (pg.parseCommaArgs = function (a) {
    var b = [],
      c = [],
      d = !1;
    for (var e = 0; e < a.length; e++) {
      var f = a.charAt(e);
      f == "("
        ? ((d = !0), c.push(f))
        : f == ")" && d
        ? ((d = !1), c.push(f))
        : f != "," || d
        ? c.push(f)
        : (b.push(c.join("")), (c = []));
    }
    b.push(c.join(""));
    return b;
  }),
  (pg.getRouteInterruptionsForStops = function (a) {
    var b = {};
    pg.getRouteNoticesForStops
      ? (b = pg.getRouteNoticesForStops(a, "interruption"))
      : typeof mobile != "undefined" &&
        mobile.getRouteNoticesForStops &&
        (b = mobile.getRouteNoticesForStops(a, "interruption"));
    return b;
  }),
  (pg.fMapShow = function (hashForMap) {
    if (pg.sisp && pg.GMap) {
      var c = pg.GMap.getContainer();
      (!pg.schedule || !pg.schedule.stopId) &&
        c.parentNode.id != "divMapWrapper" &&
        document.getElementById("divMapWrapper").appendChild(c);
    }
    cfg.isMobilePage &&
      pg.urlPrevious &&
      pg.urlPrevious.indexOf("map") == -1 &&
      (pg.urlUnderMobileMap = pg.urlPrevious);
    var args = (hashForMap || pg.hashForMap).split(";"),
      parts = pg.parseCommaArgs(args[0]),
      maximized;
    parts[parts.length - 1] == "max" && ((maximized = !0), parts.pop()),
      parts[parts.length - 1] == "drive" && ((maximized = !0), parts.pop()),
      parts[parts.length - 1] == "stops" && parts.pop();
    var city = parts[1] || cfg.defaultCity,
      transport,
      num,
      dirType,
      stopIds,
      lat,
      lng;
    pg.schedule
      ? (maximized
          ? jq("body")
              .removeClass("ScheduleMapDisplayed")
              .addClass("ScheduleMapDisplayedMax")
          : jq("body")
              .removeClass("ScheduleMapDisplayedMax")
              .addClass("ScheduleMapDisplayed"),
        (city = pg.schedule.city),
        (transport = pg.schedule.transport),
        (num = pg.schedule.num),
        (dirType = pg.schedule.dirType),
        (stopIds = pg.schedule.stopId))
      : (maximized
          ? jq("body").removeClass("MapDisplayed").addClass("MapDisplayedMax")
          : jq("body").removeClass("MapDisplayedMax").addClass("MapDisplayed"),
        pg.browserVersion <= 7 &&
          ($("divContent").innerHTML = $("divContent").innerHTML),
        (city = parts[1] || cfg.defaultCity),
        (transport = parts[2] || ""),
        (num = parts[3] || ""),
        (dirType = parts[4] || ""),
        (stopIds = parts[5] || ""),
        (lat = parseFloat(parts[6] || "")),
        (lng = parseFloat(parts[7] || "")));
    if (pg.GMap) {
      if (
        typeof ti.stops !== "object" ||
        typeof ti.routes !== "object" ||
        !pg.stopLabelSelected._ready
      ) {
        setTimeout(pg.fMapShow, 200);
        return;
      }
      var point, stop;
      if (pg.transport == "plan")
        pg.stopLabelSelected.remove(),
          pg.fToggleVehicles(-Math.abs(pg.mapShowVehicles));
      else {
        pg.fToggleVehicles(pg.mapShowVehicles),
          stopIds ||
            (pg.transport == "stop" &&
              ((stopIds = pg.inputStop),
              (pg.mapShowAllStops = Math.abs(pg.mapShowAllStops))));
        if (stopIds) {
          (stop = ti.fGetAnyStopDetails(stopIds)),
            pg.schedule
              ? (href = pg.fUrlSet(
                  {
                    schedule: {
                      stopId: stop.id,
                    },
                  },
                  !0
                ))
              : (href = pg.fUrlSet(
                  {
                    transport: "stop",
                    stopId: stop.id,
                  },
                  !0
                ));
          if (
            typeof stop.latAvg == "number" &&
            typeof stop.lngAvg == "number"
          ) {
            point = [stop.latAvg, stop.lngAvg];
            var stop_interruptions = {};
            pg.schedule &&
              pg.schedule.route &&
              (stop_interruptions = pg.getRouteInterruptionsForStops(
                pg.schedule.route.id
              ));
            var interruption_msg = stop_interruptions[stopIds]
              ? '<span class="interruption"></span>'
              : "";
            pg.stopLabelSelected
              .remove()
              .setLatLng(point)
              .bindTooltip(interruption_msg + stop.name, {
                permanent: !0,
                direction: "right",
                className: "tooltip-small yellow",
                offset: [4, 0],
              })
              .addTo(pg.GMap)
              .openTooltip();
            if (
              pg.transport == "stop" &&
              cfg.defaultCity === "vilnius" &&
              pg.mapStopForZones != stopIds &&
              !cfg.city.goHomeTimeout
            ) {
              pg.mapStopForZones = stopIds;
              var d = new Date(),
                weekday = d.getDay() || 7,
                searchParams = {
                  start_stops: stopIds,
                  finish_stops: "0;0",
                  date: d,
                  weekday: weekday,
                  transport: {},
                  walk_max: 500,
                  callback2: function () {
                    pg.clusterManager.refresh();
                  },
                };
              setTimeout(function () {
                dijkstra(searchParams, 720, 1);
              }, 100);
            }
          } else pg.stopLabelSelected.remove();
        } else pg.stopLabelSelected.remove();
      }
      if (
        num ||
        pg.transport == "plan" ||
        pg.transport == "home" ||
        pg.transport == "schools" ||
        transport == "schools" ||
        pg.transport == "vilniusfest" ||
        transport == "vilniusfest"
      ) {
        if (
          pg.map.city == city &&
          pg.map.transport == transport &&
          pg.map.num == num &&
          pg.map.dirType == dirType &&
          !hashForMap
        ) {
          point && !pg.GMap.getBounds().contains(point) && pg.GMap.panTo(point);
          if (typeof lat != "number" || typeof lng != "number") return;
        }
        (pg.map.city = city),
          (pg.map.transport = transport),
          (pg.map.num = num),
          (pg.map.dirType = dirType),
          (pg.mapStops = {}),
          pg.clusterManager.refresh(),
          pg.mapMarkerStart.remove(),
          pg.mapMarkerFinish.remove(),
          lat &&
            lng &&
            typeof lat == "number" &&
            typeof lng == "number" &&
            (pg.mapMarkerFinish.setLatLng([lat, lng]),
            pg.mapMarkerFinish.addTo(pg.GMap));
        while (pg.mapOverlays.length) pg.mapOverlays.pop().remove();
        var latMin = 999,
          latMax = -999,
          lngMin = 999,
          lngMax = -999,
          mapRoutesDropdownHTML = "",
          mapRoutesHeader = "";
        if (
          pg.transport == "plan" ||
          pg.transport == "home" ||
          pg.transport == "schools" ||
          transport == "schools" ||
          pg.transport == "vilniusfest" ||
          transport == "vilniusfest"
        ) {
          if (pg.transport == "home") {
            var city = cfg.cities[pg.city] || {},
              center = [city.lat || 59.43923, city.lng || 24.7588];
            pg.GMap.setView(center, city.zoom || 12);
          } else if (
            pg.transport == "schools" ||
            transport == "schools" ||
            pg.transport == "vilniusfest" ||
            transport == "vilniusfest"
          )
            point = pg.inputFinish;
          var legs;
          if (num && pg.optimalResults && pg.optimalResults.length) {
            pg.mapShowAllStops == 1 && (pg.mapShowAllStops = -1);
            if (
              typeof mobile == "undefined" &&
              cfg.defaultCity == "tallinna-linn"
            ) {
              var headers = jQuery(jQuery("#planner .results .option header"));
              jQuery.each(headers, function (a, b) {
                var c = jQuery(b);
                c.hasClass("active")
                  ? a != num - 1 && c.click()
                  : a == num - 1 && c.click();
              });
            }
            (i = num ? +num - 1 : 0),
              i >= pg.optimalResults.length && (i = 0),
              (legs = pg.optimalResults[i].legs || []);
            var result = pg.optimalResults[i];
            mapRoutesHeader = i18n.option + " " + (i + 1) + ".";
            for (var j = 0; j < pg.optimalResults.length; ++j) {
              var result = pg.optimalResults[j],
                s =
                  i18n.option +
                  " " +
                  (j + 1) +
                  ".&nbsp;&nbsp;" +
                  ti.printTime(result.start_time, null, "&#x2007;") +
                  " &mdash; " +
                  ti.printTime(result.finish_time, null, "&#x2007;") +
                  "&nbsp;(" +
                  ti.printTime(result.travel_time, ":", "duration") +
                  ")";
              (mapRoutesDropdownHTML +=
                '<a href="#map,,,' +
                (j + 1) +
                '"><span class="icon icon_narrow' +
                (j == i ? " icon_checked" : "") +
                '"></span>' +
                s +
                "</a>"),
                j == i && (mapRoutesHeader = s);
            }
          } else {
            pg.mapShowAllStops = Math.abs(pg.mapShowAllStops);
            var start_stop = pg.inputStart,
              finish_stop = pg.inputFinish;
            !start_stop &&
              (pg.mapCenterTo || {}).type == "start" &&
              (start_stop = pg.mapCenterTo.id),
              !finish_stop &&
                (pg.mapCenterTo || {}).type == "finish" &&
                (finish_stop = pg.mapCenterTo.id),
              (legs = [
                {
                  start_stop: ti.fGetAnyStopDetails(start_stop),
                  finish_stop: ti.fGetAnyStopDetails(finish_stop),
                },
              ]);
          }
          var route0;
          for (var i = 0; i <= legs.length; ++i) {
            var leg, stop, route, stopTime;
            i == legs.length
              ? ((leg = legs[i - 1]),
                (stop = leg.finish_stop),
                (stopTime = leg.finish_time),
                typeof stop.lat == "number" &&
                  typeof stop.lng == "number" &&
                  (pg.mapMarkerFinish.setLatLng([
                    stop.latAvg || stop.lat,
                    stop.lngAvg || stop.lng,
                  ]),
                  pg.mapMarkerFinish.addTo(pg.GMap),
                  (pg.mapCenterTo || {}).type == "finish" &&
                    (point = pg.mapMarkerFinish.getLatLng())))
              : ((leg = legs[i]),
                (stop = leg.start_stop),
                typeof stop.lat == "number" &&
                  typeof stop.lng == "number" &&
                  i == 0 &&
                  (pg.mapMarkerStart.setLatLng([
                    stop.latAvg || stop.lat,
                    stop.lngAvg || stop.lng,
                  ]),
                  pg.mapMarkerStart.addTo(pg.GMap),
                  (pg.mapCenterTo || {}).type == "start" &&
                    (point = pg.mapMarkerStart.getLatLng())),
                (stopTime = leg.start_time));
            if (!stop || !stop.id) continue;
            latMin > stop.lat && (latMin = stop.lat),
              lngMin > stop.lng && (lngMin = stop.lng),
              latMax < stop.lat && (latMax = stop.lat),
              lngMax < stop.lng && (lngMax = stop.lng);
            var route = leg.route || {},
              href,
              bSameTrip =
                route0 &&
                route.num === route0.num &&
                route.transport === route0.transport &&
                route.city === route0.city;
            (stopTime = (stopTime && ti.printTime(stopTime) + " ") || ""),
              stop.id.indexOf(";") < 0 &&
                (leg.route
                  ? (href = pg.fUrlSet(
                      {
                        schedule: {
                          city: route.city,
                          transport: route.transport,
                          num: route.num,
                          dirType: route.dirType,
                          stopId: stop.id,
                          tripNum: (leg.trip_num || -1) + 1,
                        },
                      },
                      !0
                    ))
                  : stop.id
                  ? (href = "stop/" + stop.id + "/map")
                  : (href = "map"),
                (pg.mapStops[stop.id] = {
                  lat: stop.latAvg || stop.lat,
                  lng: stop.lngAvg || stop.lng,
                  href: href,
                  info: stop.info,
                  img:
                    !route.transport && num && (i == 0 || i == legs.length)
                      ? "stopGray"
                      : bSameTrip
                      ? "stop"
                      : "stopOnRoute",
                  time: stopTime,
                  name: stop.name,
                }));
            if (
              !num ||
              pg.optimalSearchRunning ||
              !pg.optimalResults ||
              !pg.optimalResults.length
            )
              continue;
            bSameTrip ||
              (stop.id.indexOf(";") < 0 &&
                i !== legs.length &&
                (route.transport || i == legs.length - 1) &&
                (pg.mapStops["transport" + stop.id] = {
                  lat: stop.latAvg || stop.lat,
                  lng: stop.lngAvg || stop.lng,
                  href: href,
                  info: stop.info,
                  img: "MarkerStart",
                  time: stopTime,
                  name: i18n.stop.toLowerCase() + "&nbsp;" + stop.name,
                  transport: route.transport || "walk",
                  num: route.numHTML || "",
                }));
            if (i < legs.length)
              if (route.transport) {
                var dirTypes = {};
                dirTypes[route.dirType] = !0;
                if (leg.shape) {
                  var transportStyle = pg.getStyle("." + route.transport),
                    points = [];
                  for (var ii = 0; ii < leg.shape.length; ++ii)
                    points.push([leg.shape[ii][0], leg.shape[ii][1]]);
                  var polyline = L.polyline(points, {
                    color:
                      (transportStyle &&
                        (transportStyle.backgroundColor ||
                          transportStyle.color)) ||
                      "#0000FF",
                    opacity: 0.8,
                    weight: 3,
                  }).addTo(pg.GMap);
                  pg.mapOverlays.push(polyline);
                } else
                  pg.loadPolyline(
                    route,
                    route.transport,
                    route.num,
                    dirTypes,
                    leg.start_stop.lat,
                    leg.start_stop.lng,
                    leg.finish_stop.lat,
                    leg.finish_stop.lng
                  );
                route0 = route;
                if (!isNaN(leg.start_pos) && !isNaN(leg.finish_pos)) {
                  var times =
                      typeof route.times === "string"
                        ? ti.explodeTimes(route.times)
                        : route.times,
                    w = times.workdays.length;
                  times = times.times;
                  for (var pos = leg.start_pos; ++pos < leg.finish_pos; ) {
                    var stop = ti.fGetStopDetails(route.stops[pos]),
                      href = pg.fUrlSet(
                        {
                          schedule: {
                            city: route.city,
                            transport: route.transport,
                            num: route.num,
                            dirType: route.dirType,
                            stopId: stop.id,
                            tripNum: (leg.trip_num || -1) + 1,
                          },
                        },
                        !0
                      );
                    pg.mapStops[stop.id] = {
                      lat: stop.lat,
                      lng: stop.lng,
                      href: href,
                      img: "stop",
                      name:
                        ti.printTime(times[leg.trip_num + pos * w]) +
                        " " +
                        stop.name,
                    };
                  }
                }
              } else if (pg.optimalResults) {
                route0 = null;
                var points = [];
                if (leg.shape && leg.shape.length && leg.shape.length > 1)
                  for (var ii = 0; ii < leg.shape.length; ++ii) {
                    var lat_lng = ti.ENtoLatLng(
                      leg.shape[ii][0],
                      leg.shape[ii][1]
                    );
                    points.push([lat_lng[0], lat_lng[1]]);
                  }
                else if (
                  cfg.defaultCity == "kaunas" ||
                  (cfg.defaultLanguage != "lt" &&
                    cfg.defaultLanguage != "lv" &&
                    cfg.defaultLanguage != "ee")
                )
                  points = [
                    [leg.start_stop.lat, leg.start_stop.lng],
                    [leg.finish_stop.lat, leg.finish_stop.lng],
                  ];
                else {
                  var url =
                    "https://" +
                    cfg.defaultLanguage +
                    "route.merakas.lt/route/v1/foot/";
                  (url += leg.start_stop.lng + "," + leg.start_stop.lat),
                    (url +=
                      ";" + leg.finish_stop.lng + "," + leg.finish_stop.lat),
                    (url += "?skip_waypoints=true&continue_straight=true"),
                    ti.fDownloadUrl("get", url, function (lines) {
                      try {
                        var w;
                        JSON
                          ? (w = JSON.parse(lines))
                          : (w = eval("(function(){return " + lines + ";})()")),
                          (w = ((w || {}).routes || [])[0]),
                          (w = (w || {}).geometry);
                        if (w && w.length) {
                          var points = pg.splitEncodedPolyline(w, 0, 0, 0, 0),
                            polyline = L.polyline(points, {
                              color: "Black",
                              dashArray: "4 8",
                              opacity: 0.6,
                              weight: 3,
                            }).addTo(pg.GMap);
                          pg.mapOverlays.push(polyline);
                        }
                      } catch (error) {
                        typeof ti.print_log != "function";
                      }
                    });
                  continue;
                }
                var polyline = L.polyline(points, {
                  color: "Black",
                  dashArray: "4 8",
                  opacity: 0.6,
                  weight: 3,
                }).addTo(pg.GMap);
                pg.mapOverlays.push(polyline);
              }
          }
        } else if (transport) {
          pg.mapShowAllStops == 1 && (pg.mapShowAllStops = -1);
          if (pg.mapShowVehicles > 0 || (num && pg.mapShowVehicles == -1))
            pg.fToggleVehicles(Math.abs(pg.mapShowVehicles)),
              pg.fShowVehicles();
          var loop = [
            {
              city: city,
              transport: transport,
              num: num,
              dir: dirType,
            },
          ];
          if (args.length > 1)
            for (var i = 1; i < args.length; i++) {
              var parts = args[i].split(","),
                dir = parts.length > 3 ? parts[3] : "";
              loop.push({
                city: parts[0],
                transport: parts[1],
                num: parts[2],
                dir: dir,
              });
            }
          loop.forEach(function (a) {
            var b = ti.fGetRoutes(
              a.city,
              a.transport,
              a.num,
              (pg.schedule || {}).dirType,
              !0
            );
            a.num0 = (b[0] || {}).num0;
            var c = {};
            if (b.length) {
              var d = {},
                e = {};
              for (var f = b.length; --f >= 0; ) {
                var g = b[f];
                for (var h in e) (e[h] || 0) < 2 && (e[h] = 0);
                for (var i = g.stops.length; --i >= 0; ) {
                  stop = ti.fGetStopDetails(g.stops[i]);
                  if (!stop.lat || !stop.lng) continue;
                  e[stop.name] = (e[stop.name] || 0) + 1;
                }
              }
              var j = {},
                k = 0;
              for (var f = b.length; --f >= 0; ) {
                var g = b[f];
                if (g.routeTag && g.dirType != dirType)
                  if (b.length > 1 && (k || f > 0)) continue;
                cfg.defaultCity == "kaunas" &&
                  f == 0 &&
                  !dirType &&
                  ((dirType = g.dirType), (c = []), (pg.mapStops = {})),
                  (c[g.dirType] =
                    args.length > 1 ? !0 : !dirType || g.dirType == dirType);
                var l =
                  "map," +
                  g.city +
                  "," +
                  g.transport +
                  "," +
                  g.num +
                  "," +
                  g.dirType;
                l = ti.toAscii(l, !0);
                if (j[l]) continue;
                (j[l] = !0),
                  (mapRoutesDropdownHTML =
                    '<a href="#' +
                    l +
                    '"><span class="icon icon_narrow' +
                    (g.dirType == dirType ? " icon_checked" : "") +
                    '"></span>' +
                    g.name +
                    "</a>" +
                    mapRoutesDropdownHTML);
                if (!c[g.dirType]) continue;
                k++;
                var m = [],
                  n = pg.getRouteInterruptionsForStops(g.id);
                for (var i = g.stops.length; --i >= 0; ) {
                  stop = ti.fGetStopDetails(g.stops[i]);
                  if (!stop.lat || !stop.lng) continue;
                  (point = [stop.lat, stop.lng]), m.push(point);
                  var o = pg.fUrlSet(
                      {
                        schedule: {
                          city: g.city,
                          transport: g.transport,
                          num: g.num,
                          dirType: g.dirType,
                          stopId: stop.id,
                        },
                      },
                      !0
                    ),
                    p = (pg.mapStops[stop.id] = {
                      lat: stop.lat,
                      lng: stop.lng,
                      href: o,
                      img: "stopOnRoute" + (!dirType && f ? "2" : ""),
                      name: stop.name,
                      hidden: !0,
                      interruption: n[stop.id],
                    });
                  e[stop.name] >= 2 && (p.name += " (" + stop.street + ")"),
                    (d[p.name] = stop.id),
                    latMin > stop.lat && (latMin = stop.lat),
                    lngMin > stop.lng && (lngMin = stop.lng),
                    latMax < stop.lat && (latMax = stop.lat),
                    lngMax < stop.lng && (lngMax = stop.lng),
                    (f == 0 || dirType) &&
                      (i == 0 || i == g.stops.length - 1) &&
                      (pg.mapStops[i == 0 ? "MarkerStart" : "MarkerFinish"] = {
                        lat: stop.lat,
                        lng: stop.lng,
                        href: o,
                        img: i == 0 ? "MarkerStart" : "MarkerRed",
                        transport: g.transport,
                        num: g.numHTML,
                        name:
                          (i == 0 ? i18n.stop.toLowerCase() + "&nbsp;" : "") +
                          stop.name,
                        interruption: n[stop.id],
                      });
                }
                if (cfg.defaultCity === "xxxlatvia" && g.stops) {
                  var q =
                    "http://routelatvia.azurewebsites.net/?shape=" +
                    g.stops.join(",");
                  (q =
                    "http://www.stops.lt/latviatest/proxy.php?url=" +
                    encodeURIComponent(q)),
                    ti.fDownloadUrl(
                      "get",
                      q,
                      function (a) {
                        var b = JSON.parse(a);
                        b.contents && (b = b.contents), (b = b.split(","));
                        var c = [];
                        for (var d = 0; d < b.length; d += 2) {
                          var e = new GLatLng(
                            parseFloat(b[d]),
                            parseFloat(b[d + 1])
                          );
                          c.push(e);
                        }
                        if (c.length > 1) {
                          var f = pg.getStyle("." + transport),
                            g = d > 0 ? 0.6 : 0.8,
                            h = (f && f.backgroundColor) || "#0000FF",
                            i = 5,
                            j = new GPolyline(c, h, i, g);
                          pg.GMap.addOverlay(j), pg.mapOverlays.push(j);
                        }
                      },
                      !0
                    );
                }
              }
              for (var h in d) (pg.mapStops[d[h]] || {}).hidden = !1;
              k > 1 &&
                cfg.defaultCity != "kaunas" &&
                ((l = "map," + g.city + "," + g.transport + "," + g.num),
                (l = ti.toAscii(l)),
                (mapRoutesDropdownHTML =
                  '<a href="#' +
                  l +
                  '"><span class="icon icon_narrow' +
                  (dirType ? "" : " icon_checked") +
                  '"></span>' +
                  i18n.mapShowAllDirections +
                  "</a>" +
                  mapRoutesDropdownHTML));
              var r = cfg.transport_icons[a.transport];
              mapRoutesHeader =
                '<img class="icon icon_narrow" src="' +
                r +
                '"/><span class="transfer' +
                a.transport +
                '">&nbsp;' +
                b[0].numHTML +
                "</span>";
              if (cfg.defaultCity !== "xxxlatvia")
                if (cfg.defaultCity === "helsinki") {
                  var s = pg.getStyle("." + transport),
                    t = f > 0 ? 0.6 : 0.8,
                    u = (s && s.backgroundColor) || "#0000FF",
                    v = 5,
                    w = new GPolyline(m, u, v, t);
                  pg.GMap.addOverlay(w), pg.mapOverlays.push(w);
                } else pg.loadPolyline(a, a.transport, a.num, c);
            }
          });
        }
        pg.$mapRoutesDropdown &&
          (mapRoutesDropdownHTML
            ? ((mapRoutesDropdownHTML =
                '<div id="mapDropDownHeader" style="float:left;"><a href="#" aria-haspopup="true"><span class="arrow-down"></span>&nbsp;' +
                mapRoutesHeader +
                '<span id="mapRemoveRoute"></span><!--[if gte IE 7]><!--></a><!--<![endif]--><div id="mapDropDownContent" class="dropdown2">' +
                mapRoutesDropdownHTML +
                '<a id="mapShowStopsNames" href="#map" style="border-top:solid 1px #CCCCCC; margin-top:3px;"><span class="icon icon_narrow stopsnames' +
                (pg.mapShowStopsNames ? " icon_checked" : "") +
                '"></span>' +
                i18n.mapShowRouteStopsNames +
                "</a>" +
                (pg.schedule &&
                typeof mobile == "undefined" &&
                typeof pg.mobile == "undefined"
                  ? ""
                  : '<a id="mapRemoveRoute2" href="#map"><span class="icon icon_narrow"></span>' +
                    i18n.mapClearRoute +
                    "</a>") +
                "</div><!--[if lte IE 6]></a><![endif]--></div>"),
              (pg.$mapRoutesDropdown.innerHTML = mapRoutesDropdownHTML),
              (pg.$mapRoutesDropdown.style.display = ""),
              resizeDropDown())
            : (pg.$mapRoutesDropdown.style.display = "none"));
        var resize;
        num &&
          (pg.mapShowAllStops == 1
            ? (pg.mapShowAllStops = -1)
            : pg.clusterManager.hideMarkers(),
          (resize = function () {
            if (latMin == latMax && lngMin == lngMax)
              pg.GMap.panTo([latMin, lngMin]);
            else {
              var a = L.latLngBounds([latMin, lngMin], [latMax, lngMax]);
              pg.map_popup.isOpen() && pg.GMap.getBounds().intersects(a)
                ? pg.clusterManager.refresh()
                : (pg.GMap.fitBounds(a), pg.clusterManager.refresh());
            }
          }));
      }
      if (!num) {
        pg.$mapRoutesDropdown && (pg.$mapRoutesDropdown.style.display = "none"),
          pg.transport !== "plan" &&
            pg.transport !== "home" &&
            pg.transport !== "schools" &&
            pg.transport !== "vilniusfest" &&
            (pg.mapMarkerStart.remove(),
            pg.mapMarkerFinish.remove(),
            (pg.mapStops = {}));
        while (pg.mapOverlays.length) pg.mapOverlays.pop().remove();
        (pg.map = {}),
          pg.clusterManager.draw(),
          stopIds &&
          stop &&
          stop.id &&
          typeof stop.lat == "number" &&
          typeof stop.lng == "number"
            ? ((pg.mapStops[stopIds] = {
                lat: stop.latAvg,
                lng: stop.lngAvg,
                href: "stop/" + stopIds,
                info: stop.info,
                img: "stopOnRoute",
                name: stop.name,
              }),
              (point = [stop.lat, stop.lng]))
            : pg.mapCenterTo || (point = null),
          point
            ? window.setTimeout(function () {
                pg.GMap.panTo(point, {
                  animate: !0,
                  duration: 0.5,
                  easeLinearity: 1,
                });
              }, 300)
            : pg.clusterManager.refresh();
      }
      (pg.mapCenterTo = ""),
        setTimeout(function () {
          pg.GMap.invalidateSize(), typeof resize == "function" && resize();
        }, 300);
    } else
      pg.GMap === null
        ? ((pg.GMap = !1),
          ($("divMap").innerHTML =
            '<div id="loading-map" style="margin:10px;">' +
            i18n.loadingMap +
            "</div>"),
          pg.loadGoogleMapsScript(pg.GMapScriptLoadedMap))
        : pg.GMap !== !1 && pg.GMapScriptLoadedMap();
  }),
  (pg.loadGoogleMapsScript = function (a, b) {
    pg.loadLeafletScript(a);
  }),
  (pg.loadLeafletScript = function (a) {
    var b = "leaflet-css";
    if (!document.getElementById(b)) {
      var c = document.createElement("link");
      (c.id = b),
        (c.rel = "stylesheet"),
        (c.type = "text/css"),
        (c.href =
          location.hostname == "xxxlocalhost"
            ? "JS/leaflet/leaflet.css"
            : location.hostname.indexOf("stops.lt") >= 0 ||
              location.hostname.indexOf("marsruti.lv") >= 0
            ? "//www.stops.lt/vilnius/leaflet.css?20240507"
            : "leaflet.css?20240507"),
        (c.media = "all"),
        document.head.appendChild(c),
        ((
          document.getElementById("divMapHide") || {
            style: {},
          }
        ).style.zIndex = 1999),
        ((
          document.getElementById("divMapMaximize") || {
            style: {},
          }
        ).style.zIndex = 1999),
        ((
          document.getElementById("divMapRestore") || {
            style: {},
          }
        ).style.zIndex = 1999);
      var d = document.createElement("style");
      (d.type = "text/css"),
        (d.innerHTML = [
          "#divMapHide,#divMapMaximize,#divMapRestore{ position:absolute; top:2px; width:19px; height:19px; cursor:pointer; z-index:1999;}",
          ".station { padding:1px; line-height:12px; }",
          ".wifi { padding:0px; background-color:transparent; border:0px; box-shadow:none; margin:0; }",
          ".wifi:before { content:none; }",
          ".mapMenu { display:block; top: auto; position:relative; }",
          ".mapMenu .content { border:0px; margin:0px; padding:0px; }",
          ".label_transport { display:flex; }",
          ".tooltip-small { padding: 0 5px 0 5px;}",
          ".yellow { background-color:yellow; }",
          "#divNav a#aShowTraffic { display:none; }",
          ".mapMenu .content { max-width:250px; }",
          ".leaflet-tooltip:hover { z-index:1000;}",
          ".mapMenu ymaps>a {height: 14px; bottom:0;}",
        ].join("")),
        document.head.appendChild(d);
    }
    var e = "leaflet-js";
    if (document.getElementById(e)) jq("#loading-map").remove(), a();
    else {
      var f = document.createElement("script");
      (f.id = e),
        (f.onload = function () {
          jq("#loading-map").remove(), a();
        }),
        (f.src =
          location.hostname == "localhost"
            ? "leaflet.js"
            : location.hostname.indexOf("stops.lt") >= 0 ||
              location.hostname.indexOf("marsruti.lv") >= 0
            ? "//www.stops.lt/vilnius/leaflet.js?20240507"
            : "leaflet.js?20240507"),
        document.head.appendChild(f);
    }
  }),
  (pg.loadYandexPlugin = function () {
    L.Yandex = L.Layer.extend({
      options: {
        type: "yandex#map",
        mapOptions: {
          balloonAutoPan: !1,
          suppressMapOpenBlock: !0,
        },
        overlayOpacity: 0.8,
        minZoom: 0,
        maxZoom: 19,
      },
      initialize: function (a, b) {
        typeof a === "object" && ((b = a), (a = !1)),
          (b = L.Util.setOptions(this, b)),
          a && (b.type = a),
          (this._isOverlay =
            b.type.indexOf("overlay") !== -1 ||
            b.type.indexOf("skeleton") !== -1),
          (this._animatedElements = []);
      },
      _setStyle: function (a, b) {
        for (var c in b) a.style[c] = b[c];
      },
      _initContainer: function (a) {
        var b = this._isOverlay ? "leaflet-overlay-pane" : "leaflet-tile-pane",
          c = L.DomUtil.create(
            "div",
            "leaflet-yandex-container leaflet-pane " + b
          ),
          d =
            this.options.opacity ||
            (this._isOverlay && this.options.overlayOpacity);
        d && L.DomUtil.setOpacity(c, d);
        var e = {
          width: "100%",
          height: "100%",
        };
        this._setStyle(a, e), this._setStyle(c, e);
        return c;
      },
      onAdd: function (a) {
        var b = this;
        pg.loadYandexScript(function () {
          leaflet.baseLayerYandex = !0;
          var c = a.getPane("mapPane");
          b._container ||
            ((b._container = b._initContainer(c)),
            a.once("unload", b._destroy, b),
            b._initApi()),
            c.appendChild(b._container);
          b._yandex && (b._setEvents(a), b._update());
        });
      },
      beforeAdd: function (a) {
        a._addZoomLimit(this);
      },
      onRemove: function (a) {
        (leaflet.baseLayerYandex = !1), a._removeZoomLimit(this);
      },
      _destroy: function (a) {
        if (!this._map || this._map === a.target)
          this._yandex && (this._yandex.destroy(), delete this._yandex),
            delete this._container;
      },
      _setEvents: function (a) {
        var b = {
          move: this._update,
        };
        this._zoomAnimated &&
          ((b.zoomanim = this._animateZoom),
          (b.zoomend = this._animateZoomEnd)),
          a.on(b, this),
          this.once(
            "remove",
            function () {
              a.off(b, this),
                typeof this._container.remove == "function"
                  ? this._container.remove()
                  : this._container.parentNode.removeChild(this._container);
            },
            this
          );
      },
      _update: function () {
        var a = this._map,
          b = a.getCenter();
        this._yandex.setCenter([b.lat, b.lng], a.getZoom());
        var c = L.point(0, 0).subtract(
          L.DomUtil.getPosition(a.getPane("mapPane"))
        );
        L.DomUtil.setPosition(this._container, c);
      },
      _resyncView: function () {
        if (this._map) {
          var a = this._yandex;
          this._map.setView(a.getCenter(), a.getZoom(), {
            animate: !1,
          });
        }
      },
      _animateZoom: function (a) {
        var b = this._map,
          c = b.getSize()._divideBy(2),
          d = b.project(a.center, a.zoom)._subtract(c)._round(),
          e = b.project(b.getBounds().getNorthWest(), a.zoom)._subtract(d),
          f = b.getZoomScale(a.zoom);
        (this._animatedElements.length = 0),
          this._yandex.panes._array.forEach(function (a) {
            if (a.pane instanceof ymaps.pane.MovablePane) {
              var b = a.pane.getElement();
              L.DomUtil.addClass(b, "leaflet-zoom-animated"),
                L.DomUtil.setTransform(b, e, f),
                this._animatedElements.push(b);
            }
          }, this);
      },
      _animateZoomEnd: function () {
        this._animatedElements.forEach(function (a) {
          L.DomUtil.setTransform(a, 0, 1);
        }),
          (this._animatedElements.length = 0);
      },
      _initApi: function () {
        ymaps.ready(this._initMapObject, this);
      },
      _mapType: function () {
        var a = this.options.type;
        if (!a || a.indexOf("#") !== -1) return a;
        return "yandex#" + a;
      },
      _initMapObject: function () {
        ymaps.mapType.storage.add(
          "yandex#overlay",
          new ymaps.MapType("overlay", [])
        ),
          ymaps.mapType.storage.add(
            "yandex#skeleton",
            new ymaps.MapType("skeleton", ["yandex#skeleton"])
          ),
          ymaps.mapType.storage.add(
            "yandex#map~vector",
            new ymaps.MapType("map~vector", ["yandex#map~vector"])
          );
        var a = new ymaps.Map(
          this._container,
          {
            center: [0, 0],
            zoom: 0,
            behaviors: [],
            controls: [],
            type: this._mapType(),
          },
          this.options.mapOptions
        );
        (pg.YMap = a),
          this._isOverlay &&
            (a.container.getElement().style.background = "transparent"),
          typeof this._container.remove == "function"
            ? this._container.remove()
            : this._container.parentNode.removeChild(this._container),
          (this._yandex = a),
          this._map && this.onAdd(this._map),
          this.fire("load");
      },
    });
    function a() {
      var a = new ymaps.traffic.provider.Actual(
        {},
        {
          infoLayerShown: !0,
        }
      );
      a.setMap(this._yandex);
    }
    L.yandex = function (b) {
      var c = new L.Yandex(b);
      b.traffic && c.on("load", a);
      return c;
    };
  }),
  (pg.loadYandexScript = function (a) {
    var b =
      cfg.city.yandexAPIkey ||
      cfg.yandexAPIkey ||
      "fd2746d9-dd29-4e30-a38a-a0d53590c8a1";
    if (leaflet.loadingYandex == 1)
      window.setTimeout(function () {
        loadYandexScript(a);
      }, 100);
    else {
      if (leaflet.loadingYandex == 2) {
        a();
        return;
      }
      leaflet.loadingYandex = 1;
      var c = "yandex-js";
      if (!document.getElementById(c)) {
        var d = document.createElement("script");
        (d.id = c),
          (d.onload = function () {
            ymaps.ready(function () {
              (leaflet.loadingYandex = 2), a();
            });
          }),
          (d.src = "https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=" + b),
          document.head.appendChild(d);
      }
    }
  }),
  (pg.loadHerePlugin = function () {
    (L.TileLayer.HERE = L.TileLayer.extend({
      options: {
        subdomains: "1234",
        minZoom: 2,
        maxZoom: 18,
        scheme: "normal.day",
        resource: "maptile",
        resource2: "maptile",
        mapId: "newest",
        format: "png8",
        appId: "",
        appCode: "",
      },
      initialize: function a(a) {
        a = L.setOptions(this, a);
        var b = a.scheme.split(".")[0];
        (a.tileResolution = 256), L.Browser.retina && (a.tileResolution = 512);
        var c =
            "/{resource}/2.1/{resource2}/{mapId}/{scheme}/{z}/{x}/{y}/{tileResolution}/{format}?app_id={appId}&app_code={appCode}",
          d =
            "/maptile/2.1/copyright/{mapId}?app_id={appId}&app_code={appCode}",
          e = "base.maps.api.here.com";
        if (b == "satellite" || b == "terrain" || b == "hybrid")
          e = "aerial.maps.api.here.com";
        a.scheme.indexOf(".traffic.") !== -1 &&
          ((e = "traffic.maps.api.here.com"), (a.resource2 = "traffictile"));
        var f = "https://{s}." + e + c;
        b != "satellite" && b != "hybrid" && (f += "&ppi=320");
        if (pg.language == "ru" || pg.language == "by" || pg.language == "ua")
          f += "&lg=rus";
        (this._attributionUrl = L.Util.template(
          "https://1." + e + d,
          this.options
        )),
          L.TileLayer.prototype.initialize.call(this, f, a),
          (this._attributionText = "");
      },
      onAdd: function b(a) {
        L.TileLayer.prototype.onAdd.call(this, a),
          this._attributionBBoxes || this._fetchAttributionBBoxes();
      },
      onRemove: function c(a) {
        L.TileLayer.prototype.onRemove.call(this, a),
          this._map.attributionControl.removeAttribution(this._attributionText),
          (this._attributionText = ""),
          this._map.off(
            "moveend zoomend resetview",
            this._findCopyrightBBox,
            this
          );
      },
      _fetchAttributionBBoxes: function d() {
        var a = new XMLHttpRequest();
        (a.onreadystatechange = L.bind(function () {
          a.readyState == 4 &&
            a.status == 200 &&
            this._parseAttributionBBoxes(JSON.parse(a.responseText));
        }, this)),
          a.open("GET", this._attributionUrl, !0),
          a.send();
      },
      _parseAttributionBBoxes: function e(a) {
        if (this._map) {
          var b = a[this.options.scheme.split(".")[0]] || a.normal;
          for (var c = 0; c < b.length; c++)
            if (b[c].boxes)
              for (var d = 0; d < b[c].boxes.length; d++) {
                var e = b[c].boxes[d];
                b[c].boxes[d] = L.latLngBounds([
                  [e[0], e[1]],
                  [e[2], e[3]],
                ]);
              }
          this._map.on(
            "moveend zoomend resetview",
            this._findCopyrightBBox,
            this
          ),
            (this._attributionProviders = b),
            this._findCopyrightBBox();
        }
      },
      _findCopyrightBBox: function f() {
        if (this._map) {
          var a = this._attributionProviders,
            b = [],
            c = this._map.getZoom(),
            d = this._map.getBounds();
          for (var e = 0; e < a.length; e++) {
            if (a[e].minLevel < c && a[e].maxLevel > c)
              if (!a[e].boxes) {
                b.push(a[e]);
                break;
              }
            for (var f = 0; f < a[e].boxes.length; f++) {
              var g = a[e].boxes[f];
              if (d.overlaps(g)) {
                b.push(a[e]);
                break;
              }
            }
          }
          var h = [
            '<a href="https://legal.here.com/terms/serviceterms/gb/">HERE maps</a>',
          ];
          for (var e = 0; e < b.length; e++) {
            var i = b[e];
            h.push('<abbr title="' + i.alt + '">' + i.label + "</abbr>");
          }
          var j = "&copy " + h.join(", ") + ". ";
          j !== this._attributionText &&
            (this._map.attributionControl.removeAttribution(
              this._attributionText
            ),
            this._map.attributionControl.addAttribution(
              (this._attributionText = j)
            ));
        }
      },
    })),
      (L.tileLayer.here = function (a) {
        (a.appId = cfg.city.hereAppId || cfg.hereAppId),
          (a.appCode = cfg.city.hereAppCode || cfg.hereAppCode);
        return new L.TileLayer.HERE(a);
      });
  }),
  (pg.GMapScriptLoadedMap = function () {
    if (typeof L == "undefined") {
      console.log("Sorry, the Leaflet map failed to load!");
      return !1;
    }
    if (typeof ti.stops !== "object" || typeof ti.routes !== "object")
      setTimeout(pg.GMapScriptLoadedMap, 200);
    else {
      pg.addCSS(
        "#divMap .leaflet-control-zoom, #divMap .leaflet-control-layers { margin-right: 0; }#divMap .leaflet-control-layers-toggle { width: 30px; height: 30px; }#divMap input.leaflet-control-layers-selector {vertical-align: baseline;}.leaflet-container .dropdown2 a, .leaflet-container .mapMenu a, .leaflet-container .mapMenu div.a {color: black; cursor: pointer;}.mapMenu a, .mapMenu div.a { display: block; padding: 1px 5px; line-height: 30px; height: 30px; white-space: nowrap; }.m .icon_narrow { margin: 0 5px 0 0;}.leaflet-tooltip .interruption {background-image: url(tallinn/images/base/icon-menu-warning-a.png);width: 14px;height: 14px;background-repeat: no-repeat;background-size: 14px 14px;background-color: #f7b538;display:inline-block;padding: 2px;background-position: center;border-radius:4px;margin-bottom:-4px;margin-right:4px;}"
      ),
        pg.addCSS(
          '#divMapTools { position:absolute; right:0; z-index: 999;}#divMapToolsPanel { width:100%; height:262px; overflow: hidden; background-color: rgba(0, 0, 0, 0.2); transition: height .25s ease-in-out;}#divMapToolsPanel div.map_button { position: static; float: right; clear: both; margin-top: 3px; }#checkMapTools {display:none;} #checkMapTools:checked~#divMapToolsPanel { height:0; }#lblMapTools {display: block; width: 100%; margin-right: 5px; background-color: rgba(0, 0, 0, 0.2); }#lblMapTools::before { content: " "; display: inline-block; border-left: 5px solid transparent;  border-right: 5px solid transparent; border-top: 5px solid black; vertical-align: middle;  margin:0 3px; transform: translateY(-1px); transition: transform .2s ease-out; }#checkMapTools:checked + #lblMapTools::before { transform: translate(1px,-1px) rotate(-90deg); }'
        ),
        pg.addCSS(
          "#divMap .map_button { position:absolute; width: 30px; height: 30px; padding:0; z-index: 999; background: #fff; cursor:pointer; border: 2px solid rgba(0,0,0,0.2); border-radius: 5px; opacity: 1.0; }"
        ),
        pg.addCSS(
          "#divMap .map_button_icon { position:static; width: 100%; height: 100%; background-position: 50% 50%; background-repeat: no-repeat; }"
        ),
        pg.addCSS(
          "#divMap .map_button.pressed, #divMap .map_button:active { background-color: #3EACDD; }"
        ),
        cfg.defaultCity == "vilnius" &&
          (pg.addCSS(
            ".map_button.pressed>#mapShowCoolVehicles, .map_button:active>#mapShowCoolVehicles,.map_button.pressed>#mapShowWifiVehicles, .map_button:active>#mapShowWifiVehicles,.map_button.pressed>#mapShowUsbVehicles , .map_button:active>#mapShowUsbVehicles,.map_button.pressed>#mapShowVehiclesBicycleFriendly, .map_button:active>#mapShowVehiclesBicycleFriendly,.map_button.pressed>#mapShowPassengers, .map_button:active>#mapShowPassengers{filter: brightness(0) invert(1);}"
          ),
          pg.addCSS(
            ".map_vehicle_info_icon { position: absolute; width: 24px; height: 20px; background-size: contain; background-repeat: no-repeat; background-position: center; background-color: none; z-index: 105; border: 0px solid black; cursor: pointer; filter: drop-shadow(1px 1px 0px white); }.map_vehicle_info_icon.cool    { background-image:url(images/snowflake.svg); }.map_vehicle_info_icon.wifi    { background-image:url(images/wifi.svg);}.map_vehicle_info_icon.usb     { background-image:url(images/usb.svg);}.map_vehicle_info_icon.bicycle { background-image:url(images/bicycle.svg);}"
          )),
        pg.loadYandexPlugin(),
        pg.loadHerePlugin(),
        pg.storeStyles(),
        (pg.GMap = 0);
      if ((document.body.className || "").indexOf("Map") < 0) return;
      var a,
        b = cfg.cities[pg.city] || {};
      b.streetMap = b.streetMap || "GMaps";
      var c =
          pg.urlLoaded.indexOf("mylocation") != -1 && gps
            ? [gps.lat, gps.lng]
            : [b.lat || 59.43923, b.lng || 24.7588],
        d = (pg.GMap = L.map("divMap", {
          dragging: !cfg.mapDraggingDisabled,
          minZoom: pg.city == "mariupol" ? b.zoom - 1 : null,
          maxBounds:
            pg.city == "mariupol"
              ? [
                  [47.52, 37.8],
                  [46.7, 36.46],
                ]
              : null,
          maxBoundsViscosity: 1,
          zoomControl: !1,
          renderer: L.canvas({
            padding: 1,
          }),
        }).setView(c, b.zoom || 12));
      d.on("resize", function (a) {
        pg.YMap && pg.YMap.container && pg.YMap.container.fitToViewport();
      }),
        new L.Control.Zoom({
          position: "bottomright",
        }).addTo(d),
        new L.Control.Scale({
          position: "bottomleft",
          imperial: !1,
        }).addTo(d);
      var e = {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      };
      if (cfg.defaultCity == "panevezys" || cfg.defaultCity == "panevezysraj")
        e = {
          attribution: "&copy; OpenStreetMap contributors",
        };
      var f = b.map_tile_url,
        g = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        h = {};
      (f || "").indexOf("here") > 0
        ? (h["HERE map"] = L.tileLayer
            .here({
              scheme: "normal.day",
            })
            .addTo(d))
        : f
        ? (h.OSM = L.tileLayer(f, e).addTo(d))
        : cfg.defaultLanguage == "ru"
        ? (h["Yandex map"] = L.yandex({
            type: "map",
          }).addTo(d))
        : (h.OSM = L.tileLayer(g, e).addTo(d)),
        cfg.defaultLanguage == "ru"
          ? (h["Yandex map"] ||
              (h["Yandex map"] = L.yandex({
                type: "map",
              })),
            (h["Yandex traffic"] = L.yandex({
              type: "map",
              traffic: !0,
            })),
            (h["Yandex satellite"] = L.yandex({
              type: "satellite",
            })),
            (h["Yandex hybrid"] = L.yandex({
              type: "hybrid",
            })),
            d.attributionControl.setPrefix(""),
            pg.addCSS("#divMap .leaflet-control-zoom {margin-bottom:30px;}"))
          : ((h["HERE map"] = L.tileLayer.here({
              scheme: "normal.day",
            })),
            (h["HERE traffic"] = L.tileLayer.here({
              scheme: "normal.traffic.day",
            })),
            (h["HERE satellite"] = L.tileLayer.here({
              scheme: "satellite.day",
            })),
            (h["HERE hybrid"] = L.tileLayer.here({
              scheme: "hybrid.day",
            }))),
        h.OSM || (h.OSM = L.tileLayer(g, e));
      if (cfg.defaultCity == "panevezys" || cfg.defaultCity == "panevezysraj")
        d.attributionControl.setPrefix("");
      else {
        var j = {},
          k = L.control.layers(h, j, {
            position: "bottomright",
          });
        k.addTo(d),
          L.DomEvent.off(
            k._container,
            {
              mouseenter: k.expand,
              mouseleave: k.collapse,
            },
            k
          );
      }
      if (b.streetMap != "OSMlocal") {
        var l;
        cfg.isMobilePage && (pg.mapShowVehicles = 2);
      }
      if (typeof mobile != "undefined" || typeof pg.mobile != "undefined")
        (pg.$mapClose = document.createElement("div")),
          (pg.$mapClose.id = "divMapHide"),
          (pg.$mapClose.className = "map_hide"),
          (pg.$mapClose.style.left = "5px"),
          (pg.$mapClose.style.top = "5px"),
          (pg.$mapClose.style.zIndex = "1999"),
          (pg.$mapClose.innerHTML = [
            '<a onclick="return true;" alt="',
            i18n.btnBack,
            '" title="',
            i18n.btnBack,
            '" class="btn btn-back pull-left"></a>',
          ].join("")),
          d.getContainer().appendChild(pg.$mapClose),
          L.DomEvent.disableClickPropagation(pg.$mapClose),
          L.DomEvent.disableScrollPropagation(pg.$mapClose),
          jq(pg.$mapClose).bind("click", function (a) {
            pg.divMapHide_Click(a);
          });
      var m =
          typeof mobile != "undefined" || location.host.indexOf("riga") >= 0
            ? 55
            : 55,
        n = 36;
      if (cfg.defaultCity == "adazi" || cfg.defaultCity == "lsa")
        pg.addCSS(
          "#mapLegend{ position:absolute; bottom:0; left:50%; margin-left:-80px; height:20px; padding:4px; z-index:1000; background-color:white; text-transform: lowercase;}"
        ),
          (pg.$mapLegend = document.createElement("div")),
          (pg.$mapLegend.id = "mapLegend"),
          (pg.$mapLegend.className = "leaflet-bar"),
          (pg.$mapLegend.style.display = "none"),
          (pg.$mapLegend.innerHTML =
            '<div class="circle" style="background-color:#f0f0f0; position:relative; float:left; cursor:default; border:solid 1.5px #db314e;"></div><div style="position:relative; float:left; padding-right:4px;">&nbsp;-&nbsp;' +
            i18n.transport1.minibus +
            '</div><div class="circle" style="background-color:#8d034e; position:relative; float:left; cursor:default;"></div><div style="position:relative; float:left;">&nbsp;-&nbsp;' +
            i18n.transport1.bus +
            "</div>"),
          d.getContainer().appendChild(pg.$mapLegend);
      if (!document.getElementById("divMapHide")) {
        var o = document.createElement("div");
        (o.id = "divMapHide"),
          jq(o).bind("click", function (a) {
            pg.divMapHide_Click(a);
          }),
          d.getContainer().appendChild(o);
        var p = document.createElement("div");
        (p.id = "divMapMaximize"),
          jq(p).bind("click", function (a) {
            pg.divMapMaximize_Click(a);
          }),
          d.getContainer().appendChild(p);
        var q = document.createElement("div");
        (q.id = "divMapRestore"),
          jq(q).bind("click", function (a) {
            pg.divMapRestore_Click(a);
          }),
          d.getContainer().appendChild(q);
      }
      (pg.$mapRoutesDropdown = document.createElement("div")),
        (pg.$mapRoutesDropdown.id = "mapDropDown"),
        (pg.$mapRoutesDropdown.className = "dropdown"),
        (pg.$mapRoutesDropdown.style.display = "none"),
        d.getContainer().appendChild(pg.$mapRoutesDropdown),
        jq(pg.$mapRoutesDropdown).bind("click", function (a) {
          a || (a = window.event);
          var b = a && (a.target || a.srcElement);
          if (b.id == "mapShowStopsNames") {
            pg.mapShowStopsNames = !pg.mapShowStopsNames;
            var c = pg.$mapRoutesDropdown.innerHTML.replace(
              "stopsnames icon_checked",
              "stopsnames"
            );
            (pg.$mapRoutesDropdown.innerHTML = pg.mapShowStopsNames
              ? c.replace("stopsnames", "stopsnames icon_checked")
              : c),
              pg.clusterManager.refresh();
            return pg.cancelEvent(a);
          }
        });
      if (!1 || pg.sisp)
        (pg.$mapShowLocation = document.createElement("div")),
          (pg.$mapShowLocation.id = "divMapShowLocation"),
          (pg.$mapShowLocation.style.right = "1px"),
          (pg.$mapShowLocation.style.top = "6px"),
          (pg.$mapShowLocation.style.zIndex = 1998),
          (pg.$mapShowLocation.className = "map_button"),
          (pg.$mapShowLocation.innerHTML =
            '<div id="mapShowLocation" class="map_button_icon" title="' +
            (i18n.mapShowLocation || "Nustatyti buvimo vietą") +
            '"></div>'),
          d.getContainer().appendChild(pg.$mapShowLocation),
          L.DomEvent.disableClickPropagation(pg.$mapShowLocation),
          L.DomEvent.disableScrollPropagation(pg.$mapShowLocation),
          jq(pg.$mapShowLocation).bind("click", function (a) {
            pg.getLocation(this);
          });
      cfg.defaultCity != "vilnius" || pg.sisp || cfg.isNato
        ? (pg.$mapToolsPanel = d.getContainer())
        : ((pg.$mapTools = document.createElement("div")),
          (pg.$mapTools.id = "divMapTools"),
          (pg.$mapTools.style.top = "30px"),
          (pg.$mapTools.className = "map_tools"),
          (pg.$mapTools.innerHTML =
            '<input id="checkMapTools" type="checkbox"> <label for="checkMapTools" id="lblMapTools">' +
            i18n.mapOptions +
            '</label><div id="divMapToolsPanel"></div>'),
          d.getContainer().appendChild(pg.$mapTools),
          (pg.$mapToolsPanel = $("divMapToolsPanel"))),
        (pg.$mapShowAllStops = document.createElement("div")),
        (pg.$mapShowAllStops.id = "divMapShowAllStops"),
        (pg.$mapShowAllStops.style.right = "0"),
        (pg.$mapShowAllStops.style.top = m + "px"),
        (m += n),
        (pg.$mapShowAllStops.className = "map_button"),
        (pg.$mapShowAllStops.innerHTML =
          '<div id="mapShowAllStops" class="map_button_icon" title="' +
          i18n.mapShowAllStops +
          '"></div>'),
        pg.$mapToolsPanel.appendChild(pg.$mapShowAllStops),
        L.DomEvent.disableClickPropagation(pg.$mapShowAllStops),
        L.DomEvent.disableScrollPropagation(pg.$mapShowAllStops),
        jq(pg.$mapShowAllStops).bind("click", function (a) {
          (pg.mapShowAllStops = pg.mapShowAllStops > 0 ? -2 : 2),
            pg.clusterManager.refresh();
        }),
        typeof pg.mapShowAllStops == "undefined" && (pg.mapShowAllStops = -1),
        cfg.city.showWifiStops &&
          ((pg.$mapShowWifiStops = document.createElement("div")),
          (pg.$mapShowWifiStops.id = "divMapShowWifiStops"),
          (pg.$mapShowWifiStops.style.right = "0"),
          (pg.$mapShowWifiStops.style.top = m + "px"),
          (m += n),
          (pg.$mapShowWifiStops.className = "map_button"),
          (pg.$mapShowWifiStops.innerHTML =
            '<div id="mapShowWifiStops" class="map_button_icon" title="' +
            i18n.mapShowWifiStops +
            '"></div>'),
          pg.$mapToolsPanel.appendChild(pg.$mapShowWifiStops),
          L.DomEvent.disableClickPropagation(pg.$mapShowWifiStops),
          L.DomEvent.disableScrollPropagation(pg.$mapShowWifiStops),
          (pg.mapShowWifiStops = !1),
          jq(pg.$mapShowWifiStops).bind("click", function (a) {
            (pg.mapShowWifiStops = !pg.mapShowWifiStops),
              pg.clusterManager.refresh();
          })),
        cfg.city.bicycles &&
          ((pg.$mapShowBicyclesRent = document.createElement("div")),
          (pg.$mapShowBicyclesRent.id = "divMapShowBicyclesRent"),
          (pg.$mapShowBicyclesRent.style.right = "0"),
          (pg.$mapShowBicyclesRent.style.top = m + "px"),
          (m += n),
          (pg.$mapShowBicyclesRent.className = "map_button"),
          (pg.$mapShowBicyclesRent.innerHTML =
            '<div id="mapShowBicyclesRent" class="map_button_icon" title="' +
            i18n.mapShowBicyclesRent +
            '"></div>'),
          pg.$mapToolsPanel.appendChild(pg.$mapShowBicyclesRent),
          L.DomEvent.disableClickPropagation(pg.$mapShowBicyclesRent),
          L.DomEvent.disableScrollPropagation(pg.$mapShowBicyclesRent),
          (pg.mapShowBicyclesRent = !1),
          jq(pg.$mapShowBicyclesRent).bind("click", function (a) {
            (pg.mapShowBicyclesRent = !pg.mapShowBicyclesRent),
              pg.clusterManager.refresh();
          })),
        b.streetMap != "OSMlocal" &&
          (cfg.city.urlGPS &&
            ((pg.$mapShowVehicles = document.createElement("div")),
            (pg.$mapShowVehicles.id = "divMapShowVehicles"),
            (pg.$mapShowVehicles.style.right = "0"),
            (pg.$mapShowVehicles.style.top = m + "px"),
            (m += n),
            (pg.$mapShowVehicles.className = "map_button"),
            (pg.$mapShowVehicles.innerHTML =
              '<div id="mapShowVehicles" class="map_button_icon" title="' +
              i18n.mapShowVehicles +
              '"></div>'),
            pg.$mapToolsPanel.appendChild(pg.$mapShowVehicles),
            L.DomEvent.disableClickPropagation(pg.$mapShowVehicles),
            L.DomEvent.disableScrollPropagation(pg.$mapShowVehicles),
            jq(pg.$mapShowVehicles).bind("click", function (a) {
              pg.mapShowVehicles > 0
                ? pg.hashForMap == "map"
                  ? pg.fToggleVehicles(-1)
                  : pg.fToggleVehicles(0)
                : pg.hashForMap == "map"
                ? pg.fToggleVehicles(2)
                : pg.fToggleVehicles(1);
            })),
          cfg.defaultCity == "vilnius" &&
            !pg.sisp &&
            !cfg.isNato &&
            ((pg.$mapShowCoolVehicles = document.createElement("div")),
            (pg.$mapShowCoolVehicles.id = "divMapShowCoolVehicles"),
            (pg.$mapShowCoolVehicles.style.right = "0"),
            (pg.$mapShowCoolVehicles.style.top = m + "px"),
            (m += n),
            (pg.$mapShowCoolVehicles.className = "map_button"),
            (pg.$mapShowCoolVehicles.innerHTML =
              '<div id="mapShowCoolVehicles" class="map_button_icon" title="' +
              i18n.mapShowCoolVehicles +
              '" style="background-size: 90%; background-image: url(images/snowflake.svg);"></div>'),
            pg.$mapToolsPanel.appendChild(pg.$mapShowCoolVehicles),
            L.DomEvent.disableClickPropagation(pg.$mapShowCoolVehicles),
            L.DomEvent.disableScrollPropagation(pg.$mapShowCoolVehicles),
            (pg.mapShowCoolVehicles = !1),
            jq(pg.$mapShowCoolVehicles).bind("click", function (a) {
              (pg.mapShowCoolVehicles = !pg.mapShowCoolVehicles),
                pg.fToggleVehicles(
                  pg.mapShowCoolVehicles ? 2 : pg.mapShowVehicles
                ),
                pg.fShowVehicles();
            }),
            (pg.$mapShowWifiVehicles = document.createElement("div")),
            (pg.$mapShowWifiVehicles.id = "divMapShowWifiVehicles"),
            (pg.$mapShowWifiVehicles.style.right = "0"),
            (pg.$mapShowWifiVehicles.style.top = m + "px"),
            (m += n),
            (pg.$mapShowWifiVehicles.className = "map_button"),
            (pg.$mapShowWifiVehicles.innerHTML =
              '<div id="mapShowWifiVehicles" class="map_button_icon" title="' +
              i18n.mapShowWifiVehicles +
              '" style="background-size: 90%; background-image: url(images/wifi.svg);"></div>'),
            pg.$mapToolsPanel.appendChild(pg.$mapShowWifiVehicles),
            L.DomEvent.disableClickPropagation(pg.$mapShowWifiVehicles),
            L.DomEvent.disableScrollPropagation(pg.$mapShowWifiVehicles),
            (pg.mapShowWifiVehicles = !1),
            jq(pg.$mapShowWifiVehicles).bind("click", function (a) {
              (pg.mapShowWifiVehicles = !pg.mapShowWifiVehicles),
                pg.fToggleVehicles(
                  pg.mapShowWifiVehicles ? 2 : pg.mapShowVehicles
                ),
                pg.fShowVehicles();
            }),
            (pg.$mapShowUsbVehicles = document.createElement("div")),
            (pg.$mapShowUsbVehicles.id = "divMapShowUsbVehicles"),
            (pg.$mapShowUsbVehicles.style.right = "0"),
            (pg.$mapShowUsbVehicles.style.top = m + "px"),
            (m += n),
            (pg.$mapShowUsbVehicles.className = "map_button"),
            (pg.$mapShowUsbVehicles.innerHTML =
              '<div id="mapShowUsbVehicles" class="map_button_icon" title="' +
              i18n.mapShowUsbVehicles +
              '" style="background-size: 90%; background-image: url(images/usb.svg);"></div>'),
            pg.$mapToolsPanel.appendChild(pg.$mapShowUsbVehicles),
            L.DomEvent.disableClickPropagation(pg.$mapShowUsbVehicles),
            L.DomEvent.disableScrollPropagation(pg.$mapShowUsbVehicles),
            (pg.mapShowUsbVehicles = !1),
            jq(pg.$mapShowUsbVehicles).bind("click", function (a) {
              (pg.mapShowUsbVehicles = !pg.mapShowUsbVehicles),
                pg.fToggleVehicles(
                  pg.mapShowUsbVehicles ? 2 : pg.mapShowVehicles
                ),
                pg.fShowVehicles();
            }),
            (pg.$mapShowVehiclesBicycleFriendly =
              document.createElement("div")),
            (pg.$mapShowVehiclesBicycleFriendly.id =
              "divMapShowVehiclesBicycleFriendly"),
            (pg.$mapShowVehiclesBicycleFriendly.style.right = "0"),
            (pg.$mapShowVehiclesBicycleFriendly.style.top = m + "px"),
            (m += n),
            (pg.$mapShowVehiclesBicycleFriendly.className = "map_button"),
            (pg.$mapShowVehiclesBicycleFriendly.innerHTML =
              '<div id="mapShowVehiclesBicycleFriendly" class="map_button_icon" title="' +
              i18n.mapShowVehiclesBicycleFriendly +
              '" style="background-size: 90%; background-image: url(images/bicycle.svg)"></div>'),
            pg.$mapToolsPanel.appendChild(pg.$mapShowVehiclesBicycleFriendly),
            L.DomEvent.disableClickPropagation(
              pg.$mapShowVehiclesBicycleFriendly
            ),
            L.DomEvent.disableScrollPropagation(
              pg.$mapShowVehiclesBicycleFriendly
            ),
            (pg.mapShowVehiclesBicycleFriendly = !1),
            jq(pg.$mapShowVehiclesBicycleFriendly).bind("click", function (a) {
              (pg.mapShowVehiclesBicycleFriendly =
                !pg.mapShowVehiclesBicycleFriendly),
                pg.fToggleVehicles(
                  pg.mapShowVehiclesBicycleFriendly ? 2 : pg.mapShowVehicles
                ),
                pg.fShowVehicles();
            }),
            window.location.href.indexOf("test") >= 0 &&
              ((pg.$mapShowPassengers = document.createElement("div")),
              (pg.$mapShowPassengers.id = "divMapShowPassengers"),
              (pg.$mapShowPassengers.style.right = "0"),
              (pg.$mapShowPassengers.style.top = m + "px"),
              (m += n),
              (pg.$mapShowPassengers.className = "map_button"),
              (pg.$mapShowPassengers.innerHTML =
                '<div id="mapShowPassengers" class="map_button_icon passengers3" title="' +
                i18n.mapShowPassengers +
                '" style="background-size: 90%; margin: 0!important;"></div>'),
              pg.$mapToolsPanel.appendChild(pg.$mapShowPassengers),
              L.DomEvent.disableClickPropagation(pg.$mapShowPassengers),
              L.DomEvent.disableScrollPropagation(pg.$mapShowPassengers),
              (pg.mapShowPassengers = !1),
              jq(pg.$mapShowPassengers).bind("click", function (a) {
                (pg.mapShowPassengers = !pg.mapShowPassengers),
                  pg.fToggleVehicles(
                    pg.mapShowPassengers ? 2 : pg.mapShowVehicles
                  ),
                  pg.fShowVehicles();
              })))),
        pg.mapShowTraffic && pg.fShowTraffic(!0),
        pg.mapShowVehicles > 0 && pg.fToggleVehicles(pg.mapShowVehicles);
      var r;
      d.on("contextmenu", function (a) {
        event = a.originalEvent;
        if ((cfg.city.urlGPS || "").indexOf("sos") >= 0)
          return pg.cancelEvent(event);
        (r = null),
          ($("divSuggestedStops").style.display = "none"),
          event || (event = window.event);
        var b = event && (event.target || event.srcElement);
        if (!b || b.className == "map_button") return pg.cancelEvent(event);
        var c = (b && (b.tagName || "").toLowerCase()) || "";
        b &&
          c !== "a" &&
          c !== "img" &&
          ((b = b.parentNode),
          (c = (b && (b.tagName || "").toLowerCase()) || ""));
        var d =
          (b && ((c === "a" && b.href) || (c === "img" && b.id) || "")) || "";
        if (
          b &&
          b.parentNode &&
          (b.parentNode.tagName || "").toLowerCase() == "td"
        )
          return pg.cancelEvent(event);
        if (d && d.indexOf("#") >= d.length - 1) return pg.cancelEvent(event);
        pg.mapClick(a) || s(a), L.DomEvent.preventDefault(event);
      });
      var s = function (a) {
        if ((cfg.city.urlGPS || "").indexOf("sos") >= 0)
          return pg.cancelEvent(a.originalEvent);
        var b = a.containerPoint.x,
          c = a.containerPoint.y,
          d =
            Math.round(1e6 * a.latlng.lat) / 1e6 +
            ";" +
            Math.round(1e6 * a.latlng.lng) / 1e6;
        pg.openMapInfoWindow(b, c, "", "", d, a.latlng);
      };
      (pg.mapClick = function (a) {
        var b = a.originalEvent;
        (pg.timeOfActivity = new Date().getTime()),
          pg.inputSuggestedStops_Blur(),
          (b = b || window.event);
        var c = b && (b.target || b.srcElement),
          d = c && c.getAttribute && c.getAttribute("data-vehicle-id");
        if (d) {
          pg.realTimeDepartures.vehicleID != d &&
            ((pg.realTimeDepartures.vehicleID = d),
            (pg.realTimeDepartures.mapStop = ""),
            (pg.realTimeDepartures.vehicleTransport =
              c.getAttribute("data-transport")),
            (pg.realTimeDepartures.vehicleRouteNum =
              c.getAttribute("data-route")),
            (pg.realTimeDepartures.$mapPopup = {}),
            pg.fProcessVehicleDepartures()),
            (pg.pannedTo = 2),
            pg.fShowVehicles();
          return pg.cancelEvent(b);
        }
        if ((cfg.city.urlGPS || "").indexOf("sos") >= 0)
          return pg.cancelEvent(b);
        var e = (c && (c.tagName || "").toLowerCase()) || "",
          f,
          g = "";
        if (e != "input" && e != "label" && e != "fieldset") {
          if (!c || (c.id != "mapRemoveRoute" && c.id != "mapRemoveRoute2")) {
            for (var h = c; h; h = h.parentNode) {
              if (h.id == "mapDropDownContent") break;
              if (h.id == "mapDropDown") return pg.cancelEvent(b);
            }
            c && e !== "a" && e !== "img" && (c = c.parentNode),
              (f =
                (c && ((e === "a" && c.href) || (e === "img" && c.id) || "")) ||
                ""),
              (g = c.id);
          } else
            (f = "#map"),
              (pg.mapShowVehicles < 0 || pg.mapShowVehicles == 1) &&
                pg.fToggleVehicles(-Math.abs(pg.mapShowVehicles));
          if (f.indexOf("#") < 0 || f.indexOf("#") >= f.length - 1) {
            var i = a.sourceTarget.stopIds,
              j = a.containerPoint.x,
              k = a.containerPoint.y;
            if (!i) {
              var l = 256;
              for (var m = 0; m < pg.clusterManager.clusters.length; m++) {
                var n = pg.clusterManager.clusters[m],
                  o = pg.GMap.latLngToContainerPoint(n.getLatLng()),
                  p = (o.x - j) * (o.x - j) + (o.y - k) * (o.y - k);
                l > p && ((l = p), (i = n.stopIds));
              }
            }
            if (i) {
              (pg.realTimeDepartures.mapStop = i),
                (pg.realTimeDepartures.vehicleID = null);
              var q = [];
              i.indexOf(";") == -1 &&
                q.push(
                  '<br/><a class="show-departures" href="#stop/' +
                    i +
                    (cfg.isMobilePage ? "" : "/map") +
                    '"><span class="icon icon_narrow"></span>' +
                    i18n.mapShowRoutesFromStop +
                    "</a>"
                ),
                q.push(
                  '<a href="#stop/' +
                    i +
                    '/map" class="cluster"><span class="icon icon_narrow"></span>' +
                    i18n.mapZoomIn +
                    "</a>"
                );
              var r = ti.fGetRoutesAtStop(i, !1, !0),
                s = [],
                t = null,
                u = 1015,
                v = 1,
                w = null;
              for (var x = 0; x < r.length; x++) {
                route = r[x];
                if (
                  !t ||
                  cfg.transportOrder[t] != cfg.transportOrder[route.transport]
                )
                  t != null && s.push("<br/>"),
                    (t = route.transport),
                    s.push(
                      '<span class="icon icon_narrow icon_' +
                        route.transport +
                        '"></span>'
                    ),
                    (v = 1),
                    (w = null);
                var y = {
                  id: route.id,
                  city: route.city,
                  transport: route.transport,
                  num: ti.toAscii(route.num, !0),
                  dirType: route.dirType,
                  routeTag: route.stopId,
                  stopId: route.stopId,
                };
                if (y.num === w) continue;
                w = y.num;
                var z = pg.fUrlSet(
                    {
                      schedule: y,
                    },
                    !0
                  ),
                  A =
                    '<a class="hover ' +
                    (cfg.defaultCity == "xxxriga"
                      ? "activetransfer "
                      : "transfer") +
                    route.transport +
                    '" href="#' +
                    z +
                    '" title="' +
                    (route.name || "").replace(/"/g, "") +
                    '">' +
                    route.numHTML.replace(/\s/g, "&nbsp;") +
                    "</a> ";
                s.push(A),
                  v % u ||
                    s.push('<br/><span style="margin-left:22px;"></span>'),
                  (v += 1);
              }
              var B = ti.fGetAnyStopDetails(i);
              if (B && B.latAvg && B.lngAvg) {
                var C = B.name,
                  D = "&nbsp;&nbsp;";
                (B.info || "").indexOf("wifi") >= 0 &&
                  ((C +=
                    D +
                    '<img style="margin: 0;" src="' +
                    pg.imagesFolder +
                    'stop_wifi.png" alt="wifi stop" title="' +
                    i18n.stopHasWiFi +
                    '" />'),
                  (D = "&nbsp;")),
                  (B.info || "").indexOf("wc") >= 0 &&
                    (C +=
                      D +
                      '<img style="margin: 0; width:16px; height:16px; border:solid 1px black;" src="' +
                      pg.imagesFolder +
                      'wc.png" alt="wc stop" title="' +
                      i18n.stopHasWC +
                      '" />');
                var E = [s.join(""), q.join("")].join("");
                pg.openMapInfoWindow(
                  a.containerPoint.x,
                  a.containerPoint.y,
                  C,
                  E,
                  i,
                  {
                    lat: B.latAvg,
                    lng: B.lngAvg,
                  }
                );
                return !0;
              }
            }
            return !1;
          }
          var F = pg.fUrlParse(f);
          if (F.schedule && e !== "img" && g != "specialstop")
            f = pg.fUrlSet({
              schedule: F.schedule,
            });
          else if (F.transport == "stop" || F.schedule) {
            var i = (F.schedule && F.schedule.stopId) || F.inputStop;
            if ((c.className || "").toLowerCase().indexOf("cluster") < 0)
              F.transport == "stop" &&
                ((pg.hashForMap = cfg.isMobilePage ? "" : "map"),
                (pg.map = {}),
                pg.fTabStop_Click(F.inputStop));
            else {
              var G = i.split(","),
                H = [];
              for (var m = 0; m < G.length; m++) {
                var I = ti.fGetStopDetails(G[m]);
                I.lat && I.lng && H.push([I.lat, I.lng]);
              }
              pg.GMap.fitBounds(H);
            }
          } else if (F.transport == "plan")
            (pg.hashForMap = F.hashForMap),
              (pg.map = {}),
              (pg.optimalResults = null),
              pg.fTabPlanner_Click(F.inputStart, F.inputFinish);
          else {
            (pg.hashForMap = F.hashForMap),
              pg.hashForMap == "map" &&
                (pg.mapShowAllStops = Math.abs(pg.mapShowAllStops));
            if (typeof mobile != "undefined" || typeof pg.mobile != "undefined")
              pg.schedule = null;
            pg.sisp &&
              pg.transport != "plan" &&
              F.transport == "" &&
              (pg.transport = ""),
              cfg.defaultCity == "tallinna-linn" &&
                F.hashForMap == "map" &&
                ((pg.inputStart = ""),
                (pg.inputStop = ""),
                (pg.inputFinish = "")),
              pg.fUrlSet(pg),
              pg.mapShowVehicles > 0 && f == "#map" && pg.fShowVehicles();
          }
          return pg.cancelEvent(b);
        }
      }),
        d.on("click", pg.mapClick),
        (pg.hideMapInfoWindow = function () {
          pg.GMap.closePopup();
        }),
        (pg.openMapInfoWindow = function (a, b, c, d, e, f) {
          var g =
              (cfg.defaultCity == "mariupol" || cfg.defaultLanguage == "ru") &&
              leaflet.baseLayerYandex,
            h = 0;
          g ? (h = 150) : !1 && cfg.city.googleAPIkey && (h = 70);
          var i = [
            '<div class="mapMenu">',
            '<div class="content">',
            c ? '<span class="baloon_title">' + c + "</span><br/>" : "",
            '<div class="streetview" style="display:block;visibility:hidden;width:250px;height:',
            h,
            'px;transition: height 0.1s ease-in;">',
            "</div>",
            d,
          ];
          g ||
            (cfg.defaultLanguage == "ru"
              ? i.push(
                  '<a href="https://yandex.ru/maps/?panorama[point]=' +
                    f.lng +
                    "," +
                    f.lat
                )
              : cfg.defaultCity == "mariupol"
              ? i.push(
                  '<a href="https://yandex.ua/maps/?panorama[point]=' +
                    f.lng +
                    "," +
                    f.lat
                )
              : i.push(
                  '<a href="http://maps.google.com/maps?q=&layer=c&cbll=' +
                    f.lat +
                    "," +
                    f.lng
                ),
            i.push(
              '" target="_blank"><span class="icon icon_narrow"></span>',
              i18n.streetview || '"Street View"',
              "</a>"
            ));
          if (typeof e != "undefined") {
            var j = pg.fUrlSet(
                {
                  transport: "plan",
                  inputStart: e,
                  hashForMap: "map",
                },
                !0
              ),
              k = pg.fUrlSet(
                {
                  transport: "plan",
                  inputFinish: e,
                  hashForMap: "map",
                },
                !0
              );
            i.push(
              '<div class="a start-set" id="start-set"><span class="icon icon_stopGreen"></span>' +
                (e.indexOf(";") == -1
                  ? i18n.mapDirectionsFromStop
                  : i18n.mapDirectionsFromHere) +
                "</div>"
            ),
              i.push(
                '<div class="a finish-set" id="finish-set"><span class="icon icon_stopRed"></span>' +
                  (e.indexOf(";") == -1
                    ? i18n.mapDirectionsToStop
                    : i18n.mapDirectionsToThere) +
                  "</div>"
              );
          }
          i.push("</div></div>"), pg.map_popup.setLatLng(f);
          var d = L.DomUtil.create("div");
          (d.innerHTML = i.join("")),
            pg.map_popup.setContent(d),
            pg.map_popup.openOn(pg.GMap);
          if (typeof e != "undefined") {
            jq(d.getElementsByClassName("start-set")[0]).bind(
              "click",
              function () {
                pg.hideMapInfoWindow(),
                  (pg.inputStart = ""),
                  (pg.loadedPlannerParams = ""),
                  (pg.map.num = ""),
                  (pg.optimalResults = null);
                var a = {
                  transport: "plan",
                  inputStart: e,
                };
                cfg.isVilniusAirport && (a.inputFinish = "2613"), pg.fUrlSet(a);
              }
            ),
              jq(d.getElementsByClassName("finish-set")[0]).bind(
                "click",
                function () {
                  pg.hideMapInfoWindow(),
                    (pg.inputFinish = ""),
                    (pg.loadedPlannerParams = ""),
                    (pg.map.num = ""),
                    (pg.optimalResults = null);
                  var a = {
                    transport: "plan",
                    inputFinish: e,
                  };
                  cfg.isVilniusAirport && (a.inputStart = "2613"),
                    pg.fUrlSet(a);
                }
              );
            var l = d.getElementsByClassName("cluster");
            l.length &&
              jq(l[0]).bind("click", function () {
                pg.GMap.closePopup(), pg.clusterManager.fitStops(e.split(","));
              });
            var m = d.getElementsByClassName("streetview")[0];
            if (g)
              pg.loadYandexScript(function () {
                pg.loadYandexPanorama(m, f);
              });
            else if (!1 && cfg.city.googleAPIkey) {
              var n = new Image(250, 70);
              (n.id = "streetview-static"),
                n.setAttribute("crossOrigin", ""),
                (n.crossOrigin = "Anonymous"),
                (n.onload = function () {
                  var a = document.createElement("canvas");
                  (a.width = n.width),
                    (a.height = n.height),
                    a.getContext("2d").drawImage(n, 0, 0, n.width, n.height);
                  var b = a.getContext("2d").getImageData(0, 0, 1, 1).data;
                  b[0] != 228 || b[1] != 227 || b[2] != 223
                    ? (m.style.visibility = "visible")
                    : (m.style.height = "0px");
                }),
                (n.src = [
                  "//maps.googleapis.com/maps/api/streetview?",
                  cfg.city.googleAPIkey
                    ? "key=" + cfg.city.googleAPIkey + "&"
                    : "",
                  "size=500x140&location=",
                  f.lat,
                  ",",
                  f.lng,
                  "&fov=120&heading=0&pitch=0",
                  "?" + new Date().getTime(),
                ].join("")),
                m.appendChild(n);
            } else m.style.height = "0px";
          }
        }),
        (pg.loadYandexPanorama = function (a, b) {
          typeof ymaps != "undefined" &&
            ymaps.panorama.isSupported() &&
            ymaps.panorama.locate([b.lat, b.lng]).done(
              function (b) {
                if (b.length > 0) {
                  (a.innerHTML = ""),
                    (a.style.visibility = "visible"),
                    (a.style.height = "150px");
                  var c = new ymaps.panorama.Player(a, b[0], {
                    controls: [],
                  });
                } else a.style.height = "0px";
              },
              function (a) {
                console(a.message);
              }
            );
        }),
        (pg.splitEncodedPolyline = function (a, b, c, d, e) {
          var f = a.length,
            g = 0,
            h = [],
            i = 0,
            j = 0,
            k = Number.POSITIVE_INFINITY,
            l,
            m,
            n = 0,
            o = -1,
            p = 0;
          (b *= 1e5), (d *= 1e5), (c *= 1e5), (e *= 1e5);
          while (g < f) {
            var q,
              r = 0,
              s = 0;
            do (q = a.charCodeAt(g++) - 63), (s |= (q & 31) << r), (r += 5);
            while (q >= 32);
            var t = s & 1 ? ~(s >> 1) : s >> 1;
            (i += t), (r = 0), (s = 0);
            do (q = a.charCodeAt(g++) - 63), (s |= (q & 31) << r), (r += 5);
            while (q >= 32);
            var u = s & 1 ? ~(s >> 1) : s >> 1;
            (j += u),
              (l = (i - b) * (i - b) + (j - c) * (j - c)),
              k > l && ((k = l), (n = o = p), (m = Number.POSITIVE_INFINITY)),
              (l = (i - d) * (i - d) + (j - e) * (j - e)),
              m > l && ((m = l), (o = p)),
              (h[p] = [i / 1e5, j / 1e5]),
              ++p;
          }
          o < n && (o = p - 1), b && c && d && e && (h = h.slice(n, o + 1));
          return h;
        }),
        (pg.loadPolyline = function (a, b, c, d, e, f, g, h) {
          typeof a == "object" &&
            ((b = a.transport), (c = a.num0 || a.num), (a = a.city));
          var i = b,
            j = (c || "(").split("(")[0].trim();
          b == "eventbus"
            ? (i = "bus")
            : cfg.defaultCity == "tallinna-linn" && b == "nightbus"
            ? (i = "bus")
            : cfg.defaultCity == "klaipeda" &&
              b != "ferry" &&
              b != "regionalbus" &&
              c.charAt(0).toLowerCase() != "m" &&
              j != "31" &&
              j != "32"
            ? (i = "bus")
            : cfg.defaultCity == "kaunas" && b == "expressbus"
            ? (i = "bus")
            : cfg.defaultCity == "vilnius"
            ? (b == "commercialbus" &&
              c.toLowerCase().indexOf("arkikatedra") >= 0 &&
              c.toLowerCase().indexOf("vingi") < 0
                ? (c = "156")
                : b == "commercialbus" &&
                  c.toLowerCase().indexOf("ozo") >= 0 &&
                  (c = "177"),
              c.indexOf("xxxtraukinuk") < 0
                ? b == "commercialbus"
                  ? (i = "bus")
                  : b == "autonomous" && (i = "bus")
                : (i = "bus"))
            : cfg.defaultCity == "riga" && b == "expressbus"
            ? (i = "minibus")
            : cfg.defaultCity == "liepaja" && b == "minibus" && (i = "bus");
          var k = ti.toAscii([a, i, c].join("_"), !0) + ".txt";
          (k = k.replace(/\*/g, "@")),
            cfg.city.datadir == "riga" && i == "minibus"
              ? (k =
                  "//www.marsruti.lv/rigasmikroautobusi/bbus/readfile.php?name=" +
                  k)
              : (k = cfg.city.datadir + "/" + k);
          var l = new Date();
          location.pathname.indexOf("test") < 0
            ? (l = l.setHours(l.getHours(), 0, 0, 0))
            : (l = l.getTime()),
            ti.fDownloadUrl("get", k + "?" + l, function (i) {
              i.indexOf("\r\n") < 0
                ? (i = i.split("\n"))
                : (i = i.split("\r\n"));
              var j = pg.getStyle("." + b),
                k = 0.8;
              for (var l = 2; l < i.length; l += 3) {
                if (!d[i[l - 2]]) continue;
                var m = pg.splitEncodedPolyline(i[l - 1], e, f, g, h),
                  n = (j && (j.backgroundColor || j.color)) || "#0000FF",
                  o = L.polyline(m, {
                    color: n,
                    opacity: k,
                    weight: 5,
                    interactive: !1,
                  });
                i[l - 2].indexOf("m") >= 0 && (o.options.dashArray = "4 8"),
                  (k = 0.6),
                  o.addTo(pg.GMap),
                  pg.sisp &&
                    ((pg.loadedPolylines[[a, b, c].join("_")] || {}).polyline =
                      o),
                  pg.mapOverlays.push(o);
              }
            });
        }),
        (pg.stopLabelSelected = L.circleMarker(
          [cfg.city.lat || 0, cfg.city.lng || 0],
          {
            radius: 0,
            color: "rgb(60, 60, 60)",
            weight: 0,
            fillColor: "white",
            fillOpacity: 0,
            opacity: 0,
          }
        ).addTo(pg.GMap)),
        (pg.stopLabelSelected._ready = !0);
      var t = L.icon({
        iconUrl: pg.imagesFolder + "MarkerStart.png",
        iconSize: [20, 34],
        iconAnchor: [10, 34],
      });
      pg.mapMarkerStart = L.marker([0, 0], {
        icon: t,
        title: i18n.mapDragToChangeStart,
        draggable: !0,
      });
      var u = L.icon({
        iconUrl:
          pg.imagesFolder +
          (cfg.isNato ? "MarkerHotel.png" : "MarkerFinish.png"),
        iconSize: [20, 34],
        iconAnchor: [10, 34],
      });
      (pg.mapMarkerFinish = L.marker([0, 0], {
        icon: u,
        title: cfg.isNato ? "" : i18n.mapDragToChangeFinish,
        draggable: !cfg.isNato,
      })),
        pg.mapMarkerStart.on("dragend", function () {
          (pg.map = {}), (pg.optimalResults = null);
          var a = pg.mapMarkerStart.getLatLng(),
            b = v(a),
            c = b.length
              ? b.join(",")
              : [a.lat.toFixed(6), a.lng.toFixed(6)].join(";");
          pg.fTabPlanner_Click(c, pg.inputFinish, "map");
        }),
        pg.mapMarkerFinish.on("dragend", function () {
          (pg.map = {}), (pg.optimalResults = null);
          var a = pg.mapMarkerFinish.getLatLng(),
            b = v(a),
            c = b.length
              ? b.join(",")
              : [a.lat.toFixed(6), a.lng.toFixed(6)].join(";");
          pg.fTabPlanner_Click(pg.inputStart, c, "map");
        }),
        pg.mapMarkerStart.on("dragstart", function () {
          pg.mapShowAllStops < 0 &&
            ((pg.mapShowAllStops = Math.abs(pg.mapShowAllStops)),
            setTimeout(function () {
              pg.clusterManager.refresh();
            }, 100));
        }),
        pg.mapMarkerFinish.on("dragstart", function () {
          pg.mapShowAllStops < 0 &&
            ((pg.mapShowAllStops = Math.abs(pg.mapShowAllStops)),
            pg.clusterManager.refresh());
        });
      function v(a) {
        var b = pg.GMap.project(a, 19),
          c = 19 - pg.GMap.getZoom(),
          d = 1 << (c + 2),
          e = b.x - d,
          f = b.x + d,
          g = b.y - d,
          h = b.y + d,
          j = pg.clusterManager._mapMarkers,
          k = [];
        for (i = j.length; --i >= 0; ) {
          marker = j[i];
          var l = marker._x,
            m = marker._y;
          if (m > h) break;
          m >= g && l >= e && l <= f && k.push(marker.id);
        }
        return k;
      }
      (ClusterManager = function (a, b, c) {
        (this.map = a),
          (this._mapMarkers = b.slice()),
          (this.stop_colors = {
            Gray: "DarkGrey",
            30: "Green",
            60: "Red",
            OnRoute: "Orange",
            OnRoute2: "White",
          }),
          (this.markerRedIcon = L.icon({
            iconUrl: pg.imagesFolder + "MarkerRed.png",
            iconSize: [12, 20],
            iconAnchor: [6, 20],
          })),
          (this.clusterLayer = new L.FeatureGroup()),
          this.clusterLayer.addTo(this.map),
          (this._markersHidden = !1),
          (this.stopCluster = {}),
          (c = c || {}),
          (this.fitMapToMarkers = c.fitMapToMarkers === !0),
          c.fitMapMaxZoom && (this.fitMapMaxZoom = c.fitMapMaxZoom),
          (this.clusterMaxZoom = c.clusterMaxZoom ? c.clusterMaxZoom : 99),
          (this.borderPadding = c.borderPadding || 256),
          (this.intersectPadding = c.intersectPadding || 0),
          (this.clusteringEnabled = c.clusteringEnabled !== !1 && !cfg.isNato),
          (this.ZoomLevel = this.map.getZoom());
        var d = this._mapMarkers;
        for (var e = d.length; --e >= 0; ) {
          var f = d[e],
            g = this.map.project(L.latLng(f.lat, f.lng), 19);
          (f._x = g.x), (f._y = g.y);
        }
        d.sort(function (a, b) {
          return b._y - a._y;
        }),
          (this._mapMarkers = d),
          (this._ready = !0);
      }),
        (ClusterManager.prototype.hideMarkers = function () {
          this._markersHidden || ((this._markersHidden = !0), this.refresh());
        }),
        (ClusterManager.prototype.draw = function () {
          this._markersHidden !== !1 &&
            ((this._markersHidden = !1), this.refresh());
        }),
        (ClusterManager.prototype.fitStops = function (a) {
          var b = L.latLngBounds();
          for (var c = 0; c < a.length; c++) {
            var d = ti.fGetStopDetails(a[c]);
            d.lat && d.lng && b.extend([d.lat, d.lng]);
          }
          pg.GMap.fitBounds(b);
        }),
        (ClusterManager.prototype.findClosestCluster = function (a, b) {
          var c = b.slice(),
            d = a,
            e = b[0].trim(),
            f = Number.MAX_VALUE;
          for (var g = 0; g < b.length; g++) {
            var h = ti.fGetStopDetails(b[g]);
            h && h.neighbours && (c = c.concat(h.neighbours.split(",")));
          }
          for (var g = 0; g < c.length; g++) {
            var i = c[g].trim(),
              h = ti.fGetStopDetails(i);
            if (h && h.lat && h.lng) {
              var j = this.map.latLngToContainerPoint([h.lat, h.lng]),
                k = (j.x - a.x) * (j.x - a.x) + (j.y - a.y) * (j.y - a.y);
              k < f && ((d = j), (e = i), (f = k));
            }
          }
          var l = e in this.stopCluster ? this.stopCluster[e] : b;
          return {
            point: d,
            cluster: l,
          };
        }),
        (ClusterManager.prototype.show = function () {
          for (var a = 0; a < this.markers.length; a++)
            this.markers[a].addTo(this.stopsLayer);
        }),
        (ClusterManager.prototype.hide = function () {
          this.map.closePopup();
          for (var a = 0; a < this.markers.length; a++)
            this.markers[a].remove();
        }),
        (ClusterManager.prototype.createStopMarker = function (a, b, c) {
          c = c || !1;
          var d = L.circleMarker(a, {
            radius: b,
            color: "rgb(60, 60, 60)",
            weight: 1,
            fillColor: c ? c : "white",
            fillOpacity: c ? 0.8 : 0,
            opacity: c ? 1 : 0,
            riseOnHover: !0,
          }).addTo(this.clusterLayer);
          return d;
        }),
        (ClusterManager.prototype.refresh = function () {
          (pg.timeOfActivity = new Date().getTime()),
            pg.toggleClass(
              $("divMapShowAllStops"),
              "pressed",
              pg.mapShowAllStops > 0
            ),
            pg.toggleClass(
              $("divMapShowWifiStops"),
              "pressed",
              pg.mapShowWifiStops
            ),
            pg.toggleClass(
              $("divMapShowBicyclesRent"),
              "pressed",
              pg.mapShowBicyclesRent
            );
          var a = this._markersHidden ? "Gray" : "",
            b = this.map,
            c = [],
            d = this.map.project(this.map.getBounds().getSouthWest(), 19),
            e = this.map.project(this.map.getBounds().getNorthEast(), 19),
            f = this._mapMarkers,
            g = pg.mapStops,
            h,
            j,
            k,
            l,
            m = {};
          (this.stopCluster = {}),
            (this.clusters = []),
            this.clusterLayer.clearLayers();
          if (pg.mapShowAllStops > 0 || pg.mapShowWifiStops) {
            var n = 19 - this.map.getZoom(),
              o = 1 << (n + 8 + 2),
              p = d.x - o,
              q = e.x + o,
              r = d.y + o,
              s = e.y - o,
              t = cfg.defaultCity === "xxxkautra" ? 1 : 12;
            t = 1;
            var u = this.map.getZoom(),
              v = this.clusteringEnabled && u <= this.clusterMaxZoom,
              w =
                cfg.defaultCity === "vilnius" &&
                pg.transport === "stop" &&
                !cfg.isNato,
              x =
                cfg.defaultCity === "riga"
                  ? "s"
                  : cfg.defaultCity === "klaipeda"
                  ? "a"
                  : "xxx",
              y = cfg.defaultCity === "klaipeda" ? "#0064D7" : "#5CAFFB",
              z = 1 << (n + 3 + (u < 12 ? 1 : 0));
            for (i = f.length; --i >= 0; ) {
              h = f[i];
              var A = h._y;
              if (A < s || !h.name || h.id == "gps") continue;
              if (A > r) break;
              var B = h._x;
              if (B >= p && B <= q) {
                if (h.id in m) continue;
                var C = B,
                  D = A,
                  E = [],
                  F,
                  G = [],
                  H = 1,
                  I = h.rideEnd - h.rideStart,
                  J = (h.info || "").indexOf("wifi") >= 0;
                if (!J && pg.mapShowAllStops < 0) continue;
                if (v && h.id.charAt(0) != x) {
                  var K = g[h.id],
                    M = h.name;
                  M.length > 1 && !isNaN(M.slice(-1)) && (M = M.slice(0, -1));
                  for (var N = i; --N >= 0; ) {
                    var O = f[N];
                    if (O._y > D + z) break;
                    if (O.id in m) continue;
                    var P = (O.info || "").indexOf("wifi") >= 0;
                    if (!P && pg.mapShowAllStops < 0) continue;
                    O._x <= C + z &&
                      O._x >= C - z &&
                      (u < t || O.name.indexOf(M) == 0) &&
                      ((K = K || g[O.id]),
                      (m[O.id] = !0),
                      E.push(O.id),
                      G.push(O.name),
                      (J = J || P),
                      I < h.rideEnd - h.rideStart &&
                        O.time < 4320 &&
                        (I = h.rideEnd - h.rideStart),
                      H++,
                      (C = (B += O._x) / H),
                      (D = (A += O._y) / H));
                  }
                }
                if (K) continue;
                E.push(h.id);
                if (H > 1) {
                  (k = this.map.unproject(L.point(C, D), 19)), (H = 1);
                  if (u < 12) {
                    G.sort();
                    for (var N = G.length; --N > 0; ) G[N] != G[N - 1] && ++H;
                    F =
                      H > 2
                        ? i18n.totalStops + ": " + H
                        : (
                            G[0] + (H > 1 ? ", " + G[G.length - 1] : "")
                          ).replace(/"/g, "");
                  } else F = M.replace(/"/g, "");
                } else
                  (F = (h.name || "").replace(/"/g, "")), (k = [h.lat, h.lng]);
                w &&
                  I >= 0 &&
                  ((a = I <= 30 ? "30" : I <= 60 ? "60" : ""),
                  (F =
                    F + ", " + i18n.ride + " " + I + " " + i18n.minutesShort));
                var Q;
                if (H > 1) {
                  for (var R = 0; R < E.length; R++) this.stopCluster[E[R]] = E;
                  var S = a ? this.stop_colors[a] : "Yellow";
                  (Q = this.createStopMarker(k, 4, S)),
                    Q.bindTooltip(F, {
                      className: "tooltip-small",
                      offset: [6, 0],
                    }).addTo(this.clusterLayer),
                    (Q.cluster = !0),
                    (Q.stopIds = E.join(","));
                } else {
                  (this.stopCluster[h.id] = [h.id]),
                    J && !pg.mapShowWifiStops && (J = !1);
                  if (J) {
                    var T = [
                      "<div style=\"width:16px; height:9px;background-image: url('",
                      pg.imagesFolder,
                      "stop_wifi.png');\"/>",
                    ].join("");
                    this.createStopMarker(k, 4, !1)
                      .bindTooltip(T, {
                        permanent: !0,
                        direction: "top",
                        className: "wifi",
                        offset: [0, -4],
                      })
                      .addTo(this.clusterLayer);
                  }
                  if (!a && F == "Stotis" && h.id.length > 4) {
                    var U = h.id.slice(-1).toUpperCase();
                    this.createStopMarker(k, 4, !1)
                      .bindTooltip(U, {
                        permanent: !0,
                        className: "station",
                        direction: "right",
                        offset: [4, 0],
                      })
                      .addTo(this.clusterLayer);
                  }
                  var S = a ? this.stop_colors[a] : "Yellow";
                  h.id.charAt(0) === x && (S = y),
                    (Q = this.createStopMarker(k, 4, S)),
                    Q.bindTooltip(F, {
                      className: "tooltip-small",
                      direction: "right",
                      offset: [4, 0],
                    }).addTo(this.clusterLayer),
                    (Q.stopIds = E.join(","));
                }
                this.clusters.push(Q);
              }
            }
          }
          for (l in g) {
            var Q = null;
            (h = g[l]), (k = [h.lat, h.lng]);
            var F =
              pg.browserVersion < 7 && (!pg.mapShowStopsNames || h.hidden)
                ? h.name.replace(/"/g, "")
                : "";
            if (h.img == "MarkerStart") {
              var V = cfg.transport_icons[h.transport],
                W = [
                  '<a href="#',
                  h.href,
                  '" class="label_transport" style="border:0px;">',
                  h.interruption ? '<span class="interruption"></span>' : "",
                  '<img class="icon_narrow" src="',
                  V,
                  '" />',
                  h.num &&
                    '<span class="transfer' +
                      h.transport +
                      '" style="line-height:18px; vertical-align:top;">' +
                      h.num +
                      "</span>&nbsp;",
                  h.time
                    ? '<span style="line-height:18px; vertical-align:top; border:0 none;">&nbsp;' +
                      h.time +
                      "&nbsp;</span>"
                    : "",
                  "<span",
                  pg.mapShowStopsNames ? "" : ' class="unhide"',
                  ' style="line-height:18px; vertical-align:top; border:0 none;">',
                  h.name,
                  "&nbsp;</span>",
                  "</a>",
                ].join("");
              (Q = this.createStopMarker(k, 4, !1)),
                Q.bindTooltip(W, {
                  permanent: !0,
                  interactive: !0,
                  direction: "right",
                  className: "tooltip-small",
                  offset: [4, 0],
                }).openTooltip();
            } else {
              h.img == "MarkerRed"
                ? (Q = L.marker(k, {
                    icon: this.markerRedIcon,
                    title: F,
                    riseOnHover: !0,
                  }).addTo(this.clusterLayer))
                : ((Q = this.createStopMarker(
                    k,
                    4,
                    h.img == "stopOnRoute2" ? "White" : "Yellow"
                  )),
                  (h.img || "").indexOf("stopOnRoute") >= 0 &&
                    Q.setStyle({
                      weight: 2,
                    }));
              if (!F) {
                var W = [
                    '<div style="',
                    l == "vehicle"
                      ? " background-color:yellow; opacity:1;"
                      : "",
                    '"',
                    ' class="">',
                    h.interruption ? '<span class="interruption"></span>' : "",
                    h.time && h.img == "stop" ? h.time : "",
                    h.name,
                    "</div>",
                  ].join(""),
                  X = pg.mapShowStopsNames && !h.hidden;
                Q.bindTooltip(W, {
                  permanent: X,
                  interactive: X,
                  direction: "right",
                  className: "tooltip-small",
                  offset: [4, 0],
                }),
                  pg.mapShowStopsNames && !h.hidden && Q.openTooltip();
              }
            }
            (Q.stopIds = l), this.clusters.push(Q);
          }
          if (cfg.city.bicycles && pg.mapShowBicyclesRent) {
            var Y = u <= 12 ? 12 : 16,
              Z = L.icon({
                iconUrl: pg.imagesFolder + "cycling.png",
                iconSize: [Y, Y],
              });
            for (l = 0; l < cfg.city.bicycles.length; ++l) {
              (h = cfg.city.bicycles[l]), (k = [h.lat, h.lng]);
              var F = h.name.replace(/"/g, "") + '"',
                _ = L.marker(k, {
                  icon: Z,
                  pane: "overlayPane",
                  zIndexOffset: -1e3,
                  title: F,
                }).addTo(this.clusterLayer);
            }
          }
        });
      var w = [],
        x = ti.stops;
      for (var y in x) {
        var z = x[y];
        w.push(z);
      }
      (pg.clusterManager = new ClusterManager(d, w, {})),
        pg.clusterManager.refresh(),
        d.on("zoomend moveend", function () {
          pg.mapShowVehicles > 0 && !pg.mapPanInProcess && pg.fShowVehicles(),
            pg.clusterManager.refresh();
        });
      var A = L.icon({
        iconUrl: pg.imagesFolder + "location2_wait.png",
        iconSize: [20, 20],
        iconAnchor: [10, 20],
      });
      (pg.youAreHere = L.marker([0, 0], {
        icon: A,
        draggable: !0,
        title: i18n.youAreHere,
        riseOnHover: !0,
      })),
        (pg.locationAccuracyCircle = L.circle(null, 0, {
          stroke: !1,
          fillColor: "#FF0000",
          fillOpacity: 0.3,
        })),
        (pg.youAreHereInfowindow = L.popup({
          offset: [0, -20],
          autoPan: !1,
        }).setContent(i18n.dragMarkerText)),
        (pg.map_popup = L.popup({
          maxWidth: 500,
          minWidth: 250,
          className: "",
          autoPanPaddingTopLeft: L.point(5, 40),
          autoPanPaddingBottomRight: L.point(40, 15),
        })),
        pg.hashForMap && pg.hashForMap.indexOf("mylocation") != -1 && window.gps
          ? pg.renderMyLocation(jQuery("#divContentRoutes"), window.gps)
          : typeof pg.updateMyLocationMarker == "function" && window.gps
          ? pg.updateMyLocationMarker(window.gps)
          : typeof mobile != "undefined" &&
            typeof mobile.updateMyLocationMarker == "function" &&
            window.gps &&
            mobile.updateMyLocationMarker(window.gps),
        pg.fMapShow();
    }
  }),
  (pg.getMapVehiclesLayer = function () {
    typeof leaflet.vehiclesLayer == "undefined" &&
      ((VehiclesLayer = L.Layer.extend({
        onAdd: function (a) {
          var b = a.getPane("markerPane");
          (this._container = L.DomUtil.create("div")),
            (this._container.id = "divMapVehicles"),
            b.appendChild(this._container),
            a.on("zoomend viewreset", this._update, this);
        },
        onRemove: function (a) {
          (this._container.innerHTML = ""),
            L.DomUtil.remove(this._container),
            a.off("zoomend viewreset", this._update, this);
        },
        _update: function () {
          (this._container.innerHTML = ""),
            (this._container.style.visibility = "visible");
        },
        getContainer: function () {
          return this._container;
        },
      })),
      (leaflet.vehiclesLayer = new VehiclesLayer({
        pane: "markerPane",
      })),
      leaflet.vehiclesLayer.addTo(pg.GMap));
    return leaflet.vehiclesLayer;
  }),
  (pg.divMapHide_Click = function () {
    pg.fMapHide(), (pg.hashForMap = "");
    if (typeof mobile != "undefined") {
      if (pg.urlUnderMobileMap) {
        window.location.hash = "#" + pg.urlUnderMobileMap;
        return;
      }
      if (
        mobile.current_page == "schedule4" &&
        mobile.previous_page == "stop"
      ) {
        mobile.back();
        return;
      }
      if (
        mobile.current_page == "stop" &&
        pg.inputStop &&
        pg.inputStop.indexOf(";") != -1
      ) {
        pg.fUrlSet({
          transport: "search",
        });
        return;
      }
      if (pg.urlPrevious == "" || pg.urlPrevious == "/" + pg.language) {
        pg.fUrlSet({
          transport: "",
          city: "",
        });
        return;
      }
    }
    pg.fUrlSet();
  }),
  (pg.divMapMaximize_Click = function (a) {
    var b = pg.GMap && pg.GMap.getCenter();
    pg.fUrlSetMap({
      maximized: !0,
    }),
      b &&
        setTimeout(function () {
          pg.GMap.invalidateSize();
        }, 300);
    return pg.cancelEvent(a);
  }),
  (pg.divMapRestore_Click = function (a) {
    var b = pg.GMap && pg.GMap.getCenter();
    pg.fUrlSetMap({
      maximized: !1,
    }),
      b && pg.GMap.invalidateSize();
    return pg.cancelEvent(a);
  }),
  (pg.fToggleVehicles = function (a) {
    (pg.mapShowVehicles = a),
      pg.GMap &&
        cfg.city.urlGPS &&
        (pg.toggleClass($("divMapShowVehicles"), "pressed", a > 0),
        pg.$mapShowCoolVehicles &&
          pg.toggleClass(
            pg.$mapShowCoolVehicles,
            "pressed",
            pg.mapShowCoolVehicles
          ),
        pg.$mapShowWifiVehicles &&
          pg.toggleClass(
            pg.$mapShowWifiVehicles,
            "pressed",
            pg.mapShowWifiVehicles
          ),
        pg.$mapShowUsbVehicles &&
          pg.toggleClass(
            pg.$mapShowUsbVehicles,
            "pressed",
            pg.mapShowUsbVehicles
          ),
        pg.$mapShowVehiclesBicycleFriendly &&
          pg.toggleClass(
            pg.$mapShowVehiclesBicycleFriendly,
            "pressed",
            pg.mapShowVehiclesBicycleFriendly
          ),
        pg.$mapShowPassengers &&
          pg.toggleClass(
            pg.$mapShowPassengers,
            "pressed",
            pg.mapShowPassengers
          ),
        a > 0 && !pg.mapShowVehiclesInterval
          ? ((pg.mapShowVehiclesInterval = setInterval(pg.fShowVehicles, 5e3)),
            window.setTimeout(
              function () {
                pg.fShowVehicles();
              },
              typeof leaflet.vehiclesLayer == "undefined" ? 200 : 0
            ))
          : a <= 0 &&
            (pg.mapShowVehiclesInterval &&
              (clearInterval(pg.mapShowVehiclesInterval),
              (pg.mapShowVehiclesInterval = 0)),
            pg.getMapVehiclesLayer()._update(),
            pg.$mapRoutesDropdown &&
              (pg.$mapRoutesDropdown.innerHTML || "").indexOf("radio") >= 0 &&
              (pg.$mapRoutesDropdown.style.display = "none"),
            pg.$mapLegend && (pg.$mapLegend.style.display = "none")));
  }),
  (pg.fShowVehicles = function () {
    if (cfg.city.urlGPS && pg.mapShowVehicles > 0) {
      if (pg.hashForMap == "map" && pg.mapShowVehicles != 2) {
        pg.fToggleVehicles(-1);
        return;
      }
      var a = cfg.city.urlGPS;
      (a += a.indexOf("?") >= 0 ? "&time=" : "?"), (a += +new Date());
      if (!pg.visibility || pg.visibility == "visible")
        (pg.waitingForGPSData = 0),
          (pg.GPSDataChunk = ""),
          ti.fDownloadUrl("GET", a, pg.fProcessGPSData),
          cfg.city.urlGPS2 &&
            ((pg.waitingForGPSData = 1),
            (a = cfg.city.urlGPS2),
            (a += a.indexOf("?") >= 0 ? "&time=" : "?"),
            (a += +new Date()),
            ti.fDownloadUrl("GET", a, pg.fProcessGPSData));
    } else
      pg.mapShowVehiclesInterval &&
        (clearInterval(pg.mapShowVehiclesInterval),
        (pg.mapShowVehiclesInterval = 0)),
        pg.getMapVehiclesLayer()._update();
  }),
  (pg.fProcessGPSData = function (a) {
    if (pg.mapShowVehicles > 0) {
      if (pg.waitingForGPSData == 1) {
        (pg.waitingForGPSData = 0), (pg.GPSDataChunk = a);
        return;
      }
      (a += pg.GPSDataChunk), (a = a.replace("\r", "")), (a = a.split("\n"));
      var b = [],
        c = "," + pg.hashForMap + ",",
        d = c.lastIndexOf("(");
      d >= 0 && (c = c.substring(0, d) + ",");
      var e = pg.transport || (pg.schedule && pg.schedule.transport);
      e === "stop" && (e = "");
      var f = (pg.schedule && pg.schedule.num) || "",
        d = f.lastIndexOf("(");
      d >= 0 && (f = f.substring(0, d)),
        (c = c.replace("eventbus,su-menek", "bus,86")),
        (c = c.replace("commercialbus,ozog.-litexpo", "bus,177")),
        f.indexOf("su-menek") >= 0 &&
          ((f = f.replace("su-menek", "86")), (e = "bus")),
        f.indexOf("ozog.-litexpo") >= 0 &&
          ((f = f.replace("ozog.-litexpo", "177")), (e = "bus"));
      var g = cfg.city.courseOrigin || 0,
        h = cfg.city.courseCounterClockwise ? -1 : 1,
        i = pg.GMap.getBounds(),
        j = i.getSouthWest(),
        k = i.getNorthEast(),
        l = null;
      (cfg.city.urlGPS || "").indexOf("sos") >= 0 &&
        ((l = 0), (pg.mapStops = {}), (pg.mapShowStopsNames = !0));
      var m = null,
        n = null,
        o = null,
        p = ($("radio_new_vehicles") || {}).checked,
        q = 0,
        r = 0;
      for (var d = a.length; d--; ) {
        var s = a[d].split(",");
        if (s.length >= 4) {
          var t = s[1].replace(/\s/g, "");
          if (t === "-") continue;
          if (cfg.defaultCity == "jurmala" && s[0].length != 2) continue;
          if (cfg.defaultCity == "adazi" && s[0].length != 3) continue;
          if (cfg.defaultCity == "riga" && s[0].length > 1) continue;
          var u =
            {
              1: "trol",
              3: "tram",
              4: "minibus",
              5: "seasonalbus",
              6: "suburbanbus",
              7: "nightbus",
            }[s[0].slice(-1)] || "bus";
          s[1].length &&
            (typeof ti.transportRoutes == "function"
              ? (u = ti.transportRoutes(s[1], u))
              : cfg.defaultCity == "vilnius" &&
                (s[1].charAt(s[1].length - 1).toLowerCase() == "g"
                  ? (u = "expressbus")
                  : u == "bus" &&
                    s[1].charAt(s[1].length - 1).toLowerCase() == "n"
                  ? (u = "nightbus")
                  : u == "bus" &&
                    (t == "177" || t == "156") &&
                    ((u = "commercialbus"), (t = "LITEXPO"))));
          if (
            e != "plan" &&
            e != "home" &&
            e != "schools" &&
            e != "vilniusfest"
          )
            if (c != "commercialbus" || t != "LITEXPO")
              if (pg.hashForMap === "map" || pg.hashForMap == "map,max") {
                if (
                  e &&
                  (f ||
                    (typeof mobile == "undefined" &&
                      (cfg.defaultCity == "rostov" ||
                        cfg.defaultCity == "mariupol"))) &&
                  u !== e
                )
                  continue;
                if (f && ti.toAscii(t) !== f) continue;
              } else if (c.indexOf("," + u + "," + ti.toAscii(t) + ",") < 0)
                continue;
          var v = s[6],
            w = s[4] ? s[4] + " km/h" : "",
            x = null;
          s[5] && +s[5] < 999
            ? (pg.vehicleCourses[v] = x = g + +s[5] * h)
            : cfg.defaultCity == "mariupol" && (x = pg.vehicleCourses[v]);
          var y = +s[2] / 1e6,
            z = +s[3] / 1e6;
          cfg.defaultCity == "novorossiysk" &&
            ((z = (+s[2] + +s[3]) / 2e6), (y = (+s[2] - +s[3]) / 2e6));
          var A = +(s[8] || 0),
            B = +(s[7] || 0);
          if (l !== null) {
            var C = (s[9] || "").split("#");
            l <= -1 &&
              ((pg.realTimeDepartures.vehicleID = ""), (n = o = m = null)),
              ++l,
              l == 1 &&
                !pg.realTimeDepartures.vehicleID &&
                ((pg.realTimeDepartures.vehicleID = v), (l = -999999)),
              (pg.mapStops["vehicle" + d] = {
                lat: z,
                lng: y,
                href: "",
                img: "stop",
                name: "&nbsp;&nbsp;&nbsp;<b>" + v + "</b>",
                seconds: ti.printTimeWithSeconds(parseInt(s[7], 10)),
              });
            if (pg.realTimeDepartures.vehicleID == v) {
              m = d;
              if (C[1]) {
                var D = C[1].split("_"),
                  E = {},
                  F = s[8],
                  G = "",
                  H = (F || "-").split("-"),
                  I = H[H.length - 1],
                  J =
                    ti.fGetRoutes(cfg.defaultCity, D[0], D[1], null, !0) || [];
                for (var K = 0; K < J.length; ++K)
                  if (F == J[K].dirType) {
                    G = F;
                    break;
                  }
                if (!G)
                  for (var K = 0; K < J.length; ++K) {
                    var H = (J[K].dirType || "-").split("-");
                    if (I == H[H.length - 1]) {
                      G = J[K].dirType;
                      break;
                    }
                  }
                (E[G] = !0),
                  (n = [cfg.defaultCity, D[0], D[1], E, z, y]),
                  C[2] && s[8] == D[2] && (o = C[2].split("|"));
              }
              (N = [z, y]),
                pg.realTimeDepartures.vehicleID == v &&
                  pg.pannedTo >= 2 &&
                  ((pg.mapPanInProcess = !0),
                  pg.GMap.panTo(N),
                  (pg.mapPanInProcess = !1),
                  (N = null));
            }
            if (d == 0) {
              while (pg.mapOverlays.length) pg.mapOverlays.pop().remove();
              N &&
                pg.realTimeDepartures.vehicleID &&
                (!pg.pannedTo ||
                  (pg.pannedTo == 2 && !pg.GMap.getBounds().contains(N))) &&
                (pg.GMap.getZoom() < 15 && pg.GMap.setZoom(15),
                (pg.mapPanInProcess = !0),
                pg.GMap.panTo(N),
                (pg.mapPanInProcess = !1),
                (pg.pannedTo = pg.pannedTo || 2)),
                m !== null &&
                  ((pg.mapStops.vehicle = pg.mapStops["vehicle" + m]),
                  (pg.mapStops.vehicle.name +=
                    "&nbsp; " + (pg.mapStops["vehicle" + m].seconds || ""))),
                n && pg.loadPolyline(n[0], n[1], n[2], n[3], n[4], n[5]);
              if (o)
                for (var L = 0; L < o.length; L += 2) {
                  var M = ti.stops[o[L]];
                  M &&
                    (pg.mapStops[M.id] = {
                      lat: M.lat,
                      lng: M.lng,
                      href: "",
                      info: M.info,
                      img: L != 0 ? "stopOnRoute" : "stopOnRoute",
                      name:
                        (M.siriID && M.siriID != "nereikia"
                          ? "<b>" + M.siriID + "</b>&nbsp;"
                          : "") +
                        ti.printTimeWithSeconds(parseInt(o[L + 1], 10)) +
                        "&nbsp;" +
                        M.lat.toFixed(5) +
                        ",&nbsp;" +
                        M.lng.toFixed(5),
                    });
                }
              pg.clusterManager.refresh();
            }
          }
          if (z < j.lat || z > k.lat || y > k.lng || y < j.lng)
            if (l == 0) continue;
          var N = [z, y],
            O = pg.GMap.latLngToLayerPoint(N),
            P = pg.getStyle("." + u),
            Q = P && (P.backgroundColor || cfg.transport_colors[u] || P.color);
          (Q = (Q && pg.styleRGBtoHex(Q)) || "0000FF"),
            cfg.defaultCity == "adazi" || cfg.defaultCity == "lsa"
              ? u == "minibus" &&
                ((Q =
                  "f0f0f0; color:#db314e!important; border:solid 1.5px #db314e!important"),
                r++)
              : cfg.defaultCity == "riga"
              ? u == "expressbus" &&
                ((Q =
                  "f0f0f0; color:#db314e!important; border:solid 1.5px #db314e!important"),
                r++)
              : cfg.defaultCity == "vilnius"
              ? t == "86"
                ? ((t = "SU-"), (Q = "F58220"))
                : t == "177R" && (t = "177")
              : cfg.defaultCity == "lva" &&
                (t = t.replace("_VLP", "").replace("PNV_", ""));
          var R = w,
            S = !1,
            T = !1,
            U = !1,
            V = !1,
            W = !1;
          q++, v == "KNZ" && (R = "");
          if (cfg.defaultCity == "klaipeda")
            (S = v.slice(-1) == "t"),
              (R = S ? i18n.lowFloorVehicleMapTip || "" : ""),
              (R = (R ? R + ", " : "") + (v || "") + " " + w);
          else if (cfg.defaultCity == "liepaja")
            (S = (s[8] || "").toUpperCase().indexOf("Z") >= 0),
              (R = S
                ? (i18n.lowFloorVehicleMapTip || "")
                    .replace("autobus", "tramvajs")
                    .trim()
                : ""),
              (R = (R ? R + ", " : "") + (v || "") + " " + w);
          else if (cfg.defaultCity == "tallinna-linn")
            (S = s[7] === "Z"),
              s[9]
                ? (R = s[9])
                : (R = S
                    ? i18n.lowFloorVehicleMapTip || "madala sisenemisega sõiduk"
                    : "");
          else {
            (S = v.toUpperCase().slice(-1) == "Z"),
              (R = S ? v.slice(0, -1) : v);
            if (cfg.defaultCity == "vilnius") {
              (R = ""), v.toUpperCase().indexOf("N") >= 0 && ((T = !0), r++);
              var L = (v || "x").toLowerCase().lastIndexOf("k");
              L >= 0 && ((U = !0), (v = v.slice(0, L) + v.slice(L + 1)));
              var L = (v || "x").toLowerCase().lastIndexOf("w");
              L >= 0 && ((V = !0), (v = v.slice(0, L) + v.slice(L + 1)));
              var L = (v || "x").toLowerCase().lastIndexOf("d");
              L >= 0 && ((W = !0), (v = v.slice(0, L) + v.slice(L + 1)));
            }
            S && (R += i18n.lowFloorVehicleMapTip || ""),
              (R = (R ? R + ", " : "") + w);
          }
          var X = S;
          cfg.defaultCity == "tallinna-linn"
            ? (X = !S)
            : ["riga", "jurmala", "adazi", "lsa"].indexOf(cfg.defaultCity) >=
                0 && ((R = ""), u == "minibus" && (X = !1));
          var Y = X
            ? "color:yellow; border-color:gold; text-shadow: 1px 1px 0 black;"
            : "";
          u != "minibus" && (Y += "z-index: 200;");
          if (!p || T) {
            typeof x == "number" &&
              b.push(
                '<div class="arrow" style="left:' +
                  (O.x - 10) +
                  "px; top:" +
                  (O.y - 10) +
                  "px; background-color:#" +
                  Q +
                  ";" +
                  Y +
                  pg.transformCSS +
                  ":rotate(" +
                  (45 + x) +
                  'deg);"></div>'
              ),
              !A,
              b.push(
                '<div class="circle"  style="left:' +
                  (O.x - 9) +
                  "px; top:" +
                  (O.y - 9) +
                  "px; background-color:#" +
                  Q +
                  ";" +
                  Y +
                  (t.length > 3
                    ? ";font-size:8px"
                    : t.length > 2
                    ? ";font-size:smaller"
                    : "") +
                  ';" title="' +
                  R +
                  '" data-vehicle-id="' +
                  v +
                  '" data-transport="' +
                  u +
                  '" data-route="' +
                  t +
                  '">' +
                  (T
                    ? '<span style="box-shadow: inset 0 -1.5px 0 ' +
                      (X ? "gold;" : "white;") +
                      '">' +
                      t +
                      "</span>"
                    : t) +
                  "</div>"
              );
            var Z = "",
              _ = 0,
              ba = 9,
              bb = O.y - 9;
            pg.mapShowCoolVehicles &&
              U &&
              (b.push(
                '<div class="map_vehicle_info_icon cool" style="left:' +
                  (O.x + ba) +
                  "px; top:" +
                  bb +
                  'px;" title="' +
                  R +
                  '"></div>'
              ),
              (ba += 20)),
              pg.mapShowWifiVehicles &&
                V &&
                (b.push(
                  '<div class="map_vehicle_info_icon wifi" style="left:' +
                    (O.x + ba) +
                    "px; top:" +
                    bb +
                    'px;" title="' +
                    R +
                    '"></div>'
                ),
                (ba += 20)),
              pg.mapShowUsbVehicles &&
                V &&
                (b.push(
                  '<div class="map_vehicle_info_icon usb" style="left:' +
                    (O.x + ba) +
                    "px; top:" +
                    bb +
                    'px;" title="' +
                    R +
                    '"></div>'
                ),
                (ba += 20)),
              pg.mapShowVehiclesBicycleFriendly &&
                W &&
                (b.push(
                  '<div class="map_vehicle_info_icon bicycle" style="left:' +
                    (O.x + ba) +
                    "px; top:" +
                    bb +
                    'px;" title="' +
                    R +
                    '"></div>'
                ),
                (ba += 24)),
              pg.mapShowPassengers &&
                A &&
                B &&
                ((B = +((B * 100) / A)),
                B >= 0 &&
                  (B > 10
                    ? B > 40
                      ? B > 70
                        ? (B = 3)
                        : (B = 2)
                      : (B = 1)
                    : (B = 0),
                  b.push(
                    '<div class="passengers' +
                      B +
                      '" style="left:' +
                      (O.x + ba) +
                      "px; top:" +
                      (O.y - 8) +
                      'px;" title="' +
                      R +
                      '"></div>'
                  ),
                  (ba += 32))),
              b.push(
                '<div class="" style="position: absolute; left:' +
                  O.x +
                  "px; top:" +
                  (O.y - 8 - 1) +
                  "px; width:" +
                  ba +
                  'px; height:20px; background-color:rgba(0,0,0,0.2); border-radius: 8px;"></div>'
              );
          }
        }
      }
      if (
        pg.$mapRoutesDropdown &&
        cfg.defaultCity == "vilnius" &&
        !cfg.isNato
      ) {
        var bc = "radio";
        pg.$mapRoutesDropdown.style.display == "" &&
          (bc = pg.$mapRoutesDropdown.innerHTML || "");
        if (bc.indexOf("radio") < 0)
          pg.$mapRoutesDropdown.style.marginLeft = "auto";
        else {
          if (typeof mobile != "undefined" || typeof pg.mobile != "undefined")
            pg.$mapRoutesDropdown.style.marginLeft = "50px";
          (bc =
            '<span><fieldset style="cursor:default; line-height:20px;"><input type="radio" id="radio_all_vehicles" name="vehicles_on_map" style="vertical-align: baseline; position:relative; top:2px; margin:3px 3px 3px 0px;"  onchange="pg.fShowVehicles();" ' +
            (p ? "" : "checked") +
            '><label for="radio_all_vehicles" style="font-size:12px;">' +
            i18n.mapAllVehicles +
            " (" +
            q +
            ')</label><br /><input type="radio" id="radio_new_vehicles" name="vehicles_on_map" style="vertical-align: baseline; position:relative; top:2px; margin:3px 3px 3px 0px;"  onchange="pg.fShowVehicles();" ' +
            (p ? "checked" : "") +
            '><label for="radio_new_vehicles" style="font-size:12px;">' +
            i18n.mapNewVehicles +
            " (" +
            r +
            ")</label></fieldset></span>"),
            (pg.$mapRoutesDropdown.innerHTML = bc),
            (pg.$mapRoutesDropdown.style.display = ""),
            resizeDropDown();
        }
      }
      pg.$mapLegend && (pg.$mapLegend.style.display = ""),
        (a = null),
        window.requestAnimationFrame(function () {
          pg.getMapVehiclesLayer().getContainer().innerHTML = b.join("");
        });
    }
  });
function resizeDropDown() {
  var a = $("mapDropDown"),
    b = $("mapDropDownContent");
  if (a && b) {
    var c = document.body.clientWidth,
      d = a.offsetLeft,
      e = a.offsetWidth,
      f = b.offsetWidth,
      g = 0;
    if (d + f >= c) {
      var g = -(f / 2) + e / 2;
      (g = d + g > 0 ? g : -d),
        (b.style.left = g + "px"),
        (b.style.borderTopLeftRadius = "4px");
    }
  }
}
jq(window).bind("resize", function (a) {
  resizeDropDown();
}),
  (pg.fShowTraffic = function (a) {}),
  (pg.fScheduleShow = function (a) {
    a.num && (a.num = a.num.toLowerCase()),
      pg.schedule ||
        ((pg.schedulePane = 1),
        (($("spanReturnToRoutes") || {}).href = pg.urlPrevious),
        (pg.urlUnderSchedulePane = pg.urlPrevious),
        (pg.languageUnderSchedulePane = pg.language)),
      document.body.className.indexOf("Schedule") < 0 &&
        (cfg.isMobilePage && pg.hashForMap
          ? (document.body.className = "ScheduleMapDisplayed")
          : (document.body.className = "ScheduleDisplayed")),
      $("aDir1") &&
        setTimeout(function () {
          try {
            $("aDir1").focus();
          } catch (a) {}
        }, 100);
    pg.schedule &&
    pg.schedule.city == a.city &&
    pg.schedule.transport == a.transport &&
    pg.schedule.num == a.num &&
    pg.schedule.dirType == a.dirType &&
    pg.schedule.tripNum == a.tripNum
      ? ((pg.schedule.dirType = a.dirType),
        (pg.schedule.stopId = a.stopId),
        typeof mobile == "undefined" && pg.fScheduleStopActivate())
      : ((pg.schedule = a),
        (($("spanDir1") || {}).innerHTML = "&nbsp;"),
        (($("spanDir2") || {}).innerHTML = "&nbsp;"),
        (($("dlDirStops1") || {}).innerHTML = "&nbsp;"),
        (($("dlDirStops2") || {}).innerHTML = "&nbsp;"),
        (($("divScheduleContentInner") || {}).innerHTML =
          "<br/>" + i18n.loading),
        pg.fScheduleLoad());
  }),
  (pg.fScheduleHide = function () {
    (pg.schedule = null),
      document.body.className.indexOf("Schedule") >= 0 &&
        ((document.body.className = ""),
        ($("divMap").style.width = "100%"),
        ($("divMap").style.height = "100%"));
  }),
  (pg.fScheduleLoad = function (a) {
    if (typeof mobile == "undefined" || typeof a != "undefined") {
      (pg.schedules = null),
        (cfg.city.doNotShowTimetables = cfg.city.doNotShowTimetables || {}),
        ((
          $("ulScheduleDirectionsList") || {
            style: {},
          }
        ).style.display = "none");
      if (typeof ti.routes !== "object" || typeof ti.stops !== "object") {
        setTimeout(function () {
          pg.fScheduleLoad(a);
        }, 200);
        return;
      }
      var b = null,
        c;
      cfg.city.showAllDirections
        ? ((c = ti.fGetRoutes(
            pg.schedule.city,
            pg.schedule.transport,
            pg.schedule.num,
            pg.schedule.dirType
          )),
          ((
            $("aDir2") || {
              style: {},
            }
          ).style.display = "none"),
          ($("aDir1") || {}).innerHTML &&
            ($("aDir1").innerHTML = $("aDir1").innerHTML.replace("▼", "")))
        : (((
            $("aDir2") || {
              style: {},
            }
          ).style.display = "none"),
          ((
            $("divScheduleRight") || {
              style: {},
            }
          ).style.display = "none"),
          (c = ti.fGetRoutes(
            pg.schedule.city,
            pg.schedule.transport,
            pg.schedule.num,
            null,
            !0,
            null
          ))),
        !c.length &&
          cfg.defaultCity == "liepaja" &&
          (c = ti.fGetRoutes(
            pg.schedule.city,
            "minibus",
            pg.schedule.num,
            null,
            !0,
            null
          ));
      if (typeof mobile != "undefined")
        var d = {
          directions: {
            1: [],
            2: [],
          },
          stops: [],
          trip: {},
          streets: [],
        };
      if (!c.length) {
        a && a(d),
          ($("divScheduleContentInner").innerHTML = "Error: route not found.");
        return;
      }
      var e = {},
        f = {
          1: "",
          2: "",
        };
      for (var g = 0; g < c.length; g++) {
        var h = c[g],
          i = h.name,
          j = "";
        if (h.routeTag.indexOf("0") >= 0 && pg.schedule.dirType != h.dirType)
          continue;
        !b &&
          pg.schedule.dirType &&
          pg.schedule.dirType == h.dirType &&
          ((b = h), (j = "strong"));
        if (!e[i + h.dirType]) {
          e[i + h.dirType] = !0;
          var k = h.dirType.split("-"),
            l = k[0],
            m = k[k.length - 1];
          c.length > 1 && l !== "a" && m !== "b"
            ? l.charAt(0) === "b" ||
              m.charAt(0) === "a" ||
              (l.charAt(0) !== "a" && m.charAt(0) !== "b")
              ? ((h.dirNum = 2), (j = "indented" + (j ? " " + j : "")))
              : (h.dirNum = 1)
            : (h.dirNum = 1);
          var n = pg.fUrlSet(
              {
                schedule: {
                  dirType: h.dirType,
                },
                hashForMap: "",
              },
              !0
            ),
            o = pg.fUrlSet(
              {
                schedule: {
                  dirType: h.dirType,
                },
                hashForMap: !0,
              },
              !0
            );
          (f[h.dirNum] +=
            '<a href="#' +
            n +
            '"' +
            (j ? ' class="' + j + '"' : "") +
            ">" +
            i +
            "</a>"),
            typeof mobile != "undefined" &&
              d.directions[h.dirNum].push({
                hash: n,
                hashForMap: o,
                name: i,
              });
        }
      }
      (($("ulScheduleDirectionsList") || {}).innerHTML = f[1] + f[2]),
        b || (b = c[0]),
        (pg.schedule.dirType = b.dirType),
        (pg.schedule.dirTypes = {}),
        (pg.schedule.route = b);
      var p = pg.schedulePane == 2 ? 2 : 1,
        q = [];
      for (var r = 1; r <= 1; r++) {
        (pg.schedule.dirTypes[b.dirType] = p),
          (($("spanDir" + p) || {}).innerHTML =
            (b.num && b.num.length <= 5
              ? '<span class="num num3 ' +
                b.transport +
                '" title="' +
                i18n.transport[b.transport] +
                " " +
                b.num +
                '">' +
                b.numHTML +
                "</span>"
              : "") + b.name),
          (q = []);
        var s = null,
          t = 0,
          u = (b.streets || "").split(",") || [],
          v,
          w = null,
          x,
          y =
            pg.schedule.tripNum &&
            r == 1 &&
            !cfg.city.doNotShowTimetables[pg.schedule.transport]
              ? pg.schedule.tripNum
              : 0;
        y &&
          ((v =
            typeof b.times === "string" ? ti.explodeTimes(b.times) : b.times),
          (x = v.workdays.length),
          (w = v.times));
        var z = {};
        for (g = 0; g < b.stops.length; g++) {
          if (g < b.stops.length - 1 && b.stops[g] == b.stops[g + 1]) continue;
          var A = ti.fGetStopDetails(b.stops[g]);
          z[A.name] = A.street;
        }
        for (g = 0; g < b.stops.length; g++) {
          if (g < b.stops.length - 1 && b.stops[g] == b.stops[g + 1])
            if (
              !y ||
              (typeof cfg == "object" &&
                cfg.defaultCity != "intercity" &&
                cfg.defaultCity != "xxxtraukiniai")
            )
              continue;
          var A = ti.fGetStopDetails(b.stops[g]),
            n = pg.fUrlSet(
              {
                schedule: {
                  dirType: b.dirType,
                  stopId: A.id,
                  tripNum: y,
                },
                hashForMap: "",
              },
              !0
            ),
            o = pg.fUrlSet(
              {
                schedule: {
                  dirType: b.dirType,
                  stopId: A.id,
                  tripNum: y,
                },
                hashForMap: !0,
              },
              !0
            );
          q.push('<dt><a href="#' + n + '" class="hover">');
          var B = -16;
          (A.info || "").indexOf("wifi") >= 0 &&
            (q.push(
              '<img style="margin: -2px 0 0 ' +
                B +
                'px;" src="' +
                pg.imagesFolder +
                'stop_wifi.png" alt="wifi stop" title="' +
                i18n.stopHasWiFi +
                '" />'
            ),
            (B = 0)),
            (A.info || "").indexOf("wc") >= 0 &&
              (B < 0 && (B = -20),
              q.push(
                '<img style="margin: -2px 2px 0 ' +
                  B +
                  'px; width:16px; height:16px; border:solid 1px black;" src="' +
                  pg.imagesFolder +
                  'wc.png" alt="wc stop" title="' +
                  i18n.stopHasWC +
                  '" />'
              )),
            q.push(
              (A.name == "Stotis" && /[a-zA-Z]/.test(A.id.slice(-1))
                ? '<span style="display:inline-block; border-radius:50%; border: 1px solid black; text-align: center; font-size:12px; font-weight:bold; line-height: 13px; background-color:yellow;z-index:999; width:12px; height:12px; margin:0 1px 0 -15px;">' +
                  A.id.slice(-1).toUpperCase() +
                  "</span>"
                : "") +
                (w
                  ? ti.printTime(w[y - 1 + g * x], null, "&#x2007;") +
                    "&nbsp;&nbsp;"
                  : "") +
                A.name +
                (z[A.name] == A.street ? "" : " (" + A.street + ")") +
                "</a>"
            ),
            (z[A.name] = A.street),
            cfg.defaultCity == "latvia" &&
              g < b.stops.length - 1 &&
              q.push(
                '<a class="draw" target="_blank" href="http://www.stops.lt/latviatest/latvia/editor.html#' +
                  b.stops[g] +
                  "," +
                  b.stops[g + 1] +
                  '">draw</a>'
              ),
            q.push("</dt>");
          if (typeof mobile != "undefined" && r == 1) {
            var C = w ? ti.printTime(w[y - 1 + g * x], null, "&#x2007;") : "";
            d.stops.push({
              hash: n,
              hashForStop: pg.fUrlSet(
                {
                  schedule: {
                    dirType: b.dirType,
                    stopId: A.id,
                  },
                  hashForMap: "",
                },
                !0
              ),
              hashForMap: o,
              id: A.id,
              name: A.name,
              time: C,
              info: A.info,
            }),
              (d.trip[A.id] = {
                time: C,
                workdays: v ? v.workdays[y - 1] : "",
                previous_trip:
                  v && y > 1 && v.workdays[y - 2] == v.workdays[y - 1]
                    ? y - 1
                    : "",
                next_trip:
                  v &&
                  y < v.workdays.length &&
                  v.workdays[y] == v.workdays[y - 1]
                    ? y + 1
                    : "",
              });
          }
          if (r == 1) {
            while (u[t]) ++t;
            (u[t] = {
              name: A.street,
              stops: A.name,
              hash: n,
            }),
              t > 0 && !A.street && (u[t].name = u[t - 1].name),
              ++t;
          }
        }
        (($("dlDirStops" + p) || {}).innerHTML = q.join("")),
          ((
            $("dlDirStops" + p) || {
              style: {},
            }
          ).style.display = "");
        if (r == 2) break;
        for (t = u.length; --t >= 0; )
          (s = u[t]),
            typeof s == "string" &&
              (s = u[t] =
                {
                  name: s,
                }),
            (s.name || "").replace(/"/g, "&quote;").replace(/\s/, "&nbsp;"),
            t + 1 < u.length &&
              s.name == u[t + 1].name &&
              ((s.stops += ", " + u[t + 1].stops),
              (s.hash = s.hash || u[t + 1].hash),
              (u[t + 1].name = null));
        var D = "";
        for (t = 0; t < u.length; ++t)
          (s = u[t]),
            s.name &&
              (D ? (D += ", ") : (D = i18n.routeStreets + ": "),
              s.hash
                ? (D +=
                    '<a href="#' +
                    s.hash +
                    '" class="hover" title="' +
                    i18n.stops +
                    ": " +
                    s.stops.replace(/"/g, "") +
                    '">' +
                    s.name +
                    "</a>")
                : (D += s.name),
              typeof mobile != "undefined" && d.streets.push(s));
        ($("divScheduleRoute") || {}).innerHTML =
          '<span class="icon icon_' +
          b.transport +
          '"></span><span class="num num3 ' +
          b.transport +
          '">' +
          b.numHTML +
          "</span>&nbsp;&nbsp; " +
          D +
          '<div class="RouteDetails"' +
          (pg.scheduleDetailsExpanded ? "" : ' style="display:none;"') +
          ">" +
          (cfg.defaultCity == "vilnius" ? "" : i18n.operator + ": ") +
          ti.fOperatorDetails(b.operator, b.transport) +
          "</div>";
        if (c.length <= 1) break;
        p = 3 - p;
        var k = b.dirType.split("-"),
          l = k[0],
          m = k[k.length - 1],
          E = m + "-" + l,
          F = b.dirNum;
        b = null;
        for (g = 0; g < c.length; g++) {
          if (!b || (F == b.dirNum && F != c[g].dirNum)) b = c[g];
          if (c[g].dirType === E) {
            b = c[g];
            break;
          }
        }
        typeof mobile != "undefined" && (d.backDir = l != m ? b : null);
        if (!b || l == m || cfg.defaultCity == "latvia") {
          ((
            $("aDir2") || {
              style: {},
            }
          ).style.display = "none"),
            ((
              $("dlDirStops2") || {
                style: {},
              }
            ).style.display = "none");
          break;
        }
      }
      a ? a(d) : pg.fScheduleStopActivate(),
        pg.schedule.tripNum || (($("divScheduleBody") || {}).scrollTop = 0);
    }
  }),
  (pg.aDir_Click = function (a) {
    setTimeout(function () {
      try {
        a.focus();
      } catch (b) {}
    }, 100);
    var b = $("ulScheduleDirectionsList");
    (a.id || "").indexOf("2") >= 0 && a.offsetLeft > 100
      ? ((pg.scheduleProposedPane = 2),
        (b.style.right = "10px"),
        (b.style.left = ""))
      : ((pg.scheduleProposedPane = 1),
        (b.style.left = a.offsetLeft + "px"),
        (b.style.right = "")),
      (b.style.display = "block");
  }),
  (pg.aDir_Blur = function () {
    $("ulScheduleDirectionsList").style.display = "none";
  }),
  (pg.ulScheduleDirectionsList_Click = function (a) {
    a = a || window.event;
    var b = a.target || a.srcElement;
    if (b.nodeName.toLowerCase() == "a") {
      var c = b.href.split("#")[1],
        d = pg.fUrlParse(c);
      (pg.schedulePane = pg.scheduleProposedPane || 1),
        (c = pg.fUrlSet(
          {
            schedule: {
              dirType: d.schedule.dirType,
              stopId: null,
              tripNum: 0,
            },
          },
          !0
        )),
        c != Hash.getHash() ? Hash.go(c) : pg.fScheduleLoad();
      return pg.cancelEvent(a);
    }
  }),
  (pg.fScheduleStops_Click = function (a, b) {
    a = a || window.event;
    var c = a.target || a.srcElement;
    if (c.nodeName.toLowerCase() == "a") {
      pg.schedulePane = b;
      var d = c.href.split("#")[1],
        e = pg.fUrlParse(d);
      pg.fUrlSet({
        schedule: {
          dirType: e.schedule.dirType,
          stopId: e.schedule.stopId,
          tripNum: e.schedule.tripNum,
        },
      });
      return pg.cancelEvent(a);
    }
  }),
  (pg.fTransferHideMenu = function () {
    if (pg.transfersMenuHide) {
      var a = $("divTransfersMenu");
      a.style.display = "none";
    }
  }),
  (pg.fTransfer_MouseOver = function (a) {
    a = a || window.event;
    var b = a.target || a.srcElement;
    if (
      b.id == "divTransfersMenu" ||
      (b.parentNode || {}).id == "divTransfersMenu" ||
      b.id == "checkTransfer" ||
      b.id == "spanCheckTransfer"
    )
      pg.transfersMenuHide = !1;
    else {
      var c = b.getAttribute("data-transport");
      pg.transfersMenuHide = !0;
      if (
        (cfg.defaultCity != "tallinna-linn" &&
          cfg.defaultCity != "riga" &&
          cfg.defaultCity != "rostov") ||
        typeof b.className != "string" ||
        b.className.indexOf("transfer") < 0 ||
        !b.href
      ) {
        if (c && pg.transfersDisplayed) {
          pg.addSchedule = c;
          var d = !0;
          if (pg.schedules)
            for (var e in pg.transfersDisplayed) {
              d = pg.transfersDisplayed[e];
              if (d && d.transport == c && !pg.schedules[e]) {
                d = !0;
                break;
              }
            }
          ($("checkTransfer").checked = d !== !0),
            ($("spanCheckTransfer").innerHTML =
              i18n.transport[c.replace("-remove", "")]),
            (pg.transfersMenuHide = !1);
        }
      } else {
        pg.addSchedule = pg.fUrlParse(b.href).schedule;
        if (pg.addSchedule) {
          var d = ti.fGetRoutes(
            pg.addSchedule.city,
            pg.addSchedule.transport,
            pg.addSchedule.num,
            pg.addSchedule.dirType,
            !0
          )[0];
          ($("checkTransfer").checked = b.className.indexOf("active") >= 0),
            ($("spanCheckTransfer").innerHTML =
              i18n.transport1[d.transport] +
              (d.num.length > 15 ? "" : " " + d.numHTML) +
              " " +
              i18n.towards +
              " " +
              d.name),
            (pg.transfersMenuHide = !1);
        }
      }
      var f = $("divTransfersMenu");
      pg.transfersMenuHide
        ? f.style.display == "block" && pg.fTransfer_MouseOut()
        : ((f.style.left = b.offsetLeft + "px"),
          (f.style.top = b.offsetTop + b.offsetHeight + "px"),
          (f.style.display = "block"));
    }
  }),
  (pg.fTransfer_MouseOut = function () {
    (pg.transfersMenuHide = !0), setTimeout(pg.fTransferHideMenu, 200);
  }),
  (pg.fScheduleStopActivate = function () {
    var a = "/" + pg.schedule.dirType + "/" + pg.schedule.stopId + "/",
      b = 1,
      c;
    for (var d = 1; d <= 1; d++) {
      c = $("dlDirStops" + d).getElementsByTagName("a");
      for (var e = 0; e < c.length; ++e) {
        var f = c[e],
          g = (f.className || "").replace("current", "");
        d == b &&
        a &&
        pg.schedule.stopId &&
        ("/" + f.href + "/").indexOf(a) >= 0
          ? ((f.className =
              g + " current" + ti.fGetDirTag(pg.schedule.dirType)),
            (a = ""))
          : f.className.indexOf("current") >= 0 && (f.className = g);
      }
    }
    if (a) {
      c = $("dlDirStops" + (b || 1)).getElementsByTagName("a");
      if (c && (c[0] || {}).href) {
        (a = c[0].href.split("#")[1]),
          pg.hashForMap && a.slice(-3) != "map" && (a += "/map"),
          pg.fUrlExecute(a);
        return;
      }
    }
    (($("aDir1") || {}).className = ($("divScheduleLeft") || {}).className =
      b == 1 ? "active" : ""),
      (($("aDir2") || {}).className = ($("divScheduleRight") || {}).className =
        b == 2 ? "active" : ""),
      pg.browserVersion >= 8 &&
        pg.toggleClass($("divScheduleContentInner"), "Right", b == 2),
      pg.fScheduleLoadTimetable();
  }),
  (pg.fScheduleLoadTimetable = function (a) {
    if (typeof mobile == "undefined" || typeof a != "undefined") {
      var b,
        c,
        d,
        e = [pg.schedule.city, pg.schedule.transport, pg.schedule.num].join(
          "_"
        ),
        f = pg.schedules || {};
      pg.schedules || (f[e] = pg.schedule);
      var g = pg.nonEmptyCount(f) > (f[e] ? 1 : 0),
        h = ti.fGetTransfersAtStop(pg.schedule.stopId, !0, pg.schedule.route);
      if (typeof a == "function")
        var i = {
          workdays: [],
          timetables: {},
          timetables_html: [],
          intervals_html: [],
          maxlength: {},
          transfers: [],
          transfers_routes: [],
        };
      pg.transfersDisplayed = {};
      var j = null,
        k = null,
        l = [],
        m = [];
      for (d = 0; d < h.length; d++) {
        (b = h[d]),
          (e = ti.toAscii([b.city, b.transport, b.num].join("_"), !0));
        if (pg.transfersDisplayed[e]) continue;
        var n = {
          id: b.id,
          city: b.city,
          transport: b.transport,
          num: ti.toAscii(b.num, !0),
          numHTML: b.numHTML,
          dirType: b.dirType,
          routeTag: b.stopId,
          stopId: b.stopId,
        };
        pg.transfersDisplayed[e] = n;
        if (
          pg.city === "druskininkai" ||
          pg.city === "liepaja" ||
          (pg.city === "cherepovets" &&
            typeof mobile != "undefined" &&
            (parseInt(pg.schedule.num, 10) == 1 ||
              parseInt(pg.schedule.num, 10) == 5 ||
              parseInt(pg.schedule.num, 10) == 25))
        ) {
          if (
            parseInt(pg.schedule.num, 10) === parseInt(b.num, 10) &&
            pg.schedule.num.toLowerCase().indexOf("s") < 0 &&
            b.num.toLowerCase().indexOf("s") < 0
          ) {
            var o = pg.schedule.dirType.split("-"),
              p = o[0],
              q = o[o.length - 1];
            q = q.split("_")[0];
            var r = 2;
            p === "a" || q === "b"
              ? (r = 1)
              : p.charAt(0) !== "b" &&
                q.charAt(0) !== "a" &&
                (p.charAt(0) === "a" || q.charAt(0) === "b") &&
                (r = 1),
              (o = b.dirType.split("-")),
              (p = o[0]),
              (q = o[o.length - 1]),
              (q = q.split("_")[0]);
            var s = 2;
            p === "a" || q === "b"
              ? (s = 1)
              : p.charAt(0) !== "b" &&
                q.charAt(0) !== "a" &&
                (p.charAt(0) === "a" || q.charAt(0) === "b") &&
                (s = 1),
              r == s && ((f[e] = n), (g = g || pg.schedule.num !== b.num));
          }
        } else if (pg.city === "xxxklaipeda")
          if (
            pg.schedule.num + "e" === b.num.toLowerCase() ||
            (pg.schedule.num.indexOf("(") >= 0 &&
              pg.schedule.num.replace("(", "e(") ===
                b.num.toLowerCase().replace(/\s/g, ""))
          )
            (f[e] = n), (g = g || pg.schedule.num !== b.num.toLowerCase());
        if (b.transport != "ferry") {
          c = pg.fUrlSet(
            {
              schedule: n,
            },
            !0
          );
          if (!j || cfg.transportOrder[j] != cfg.transportOrder[b.transport])
            (j = b.transport),
              l.push(
                ' <span class="icon icon_narrow icon_' +
                  b.transport +
                  '" data-transport="' +
                  b.transport +
                  '"></span>&nbsp;'
              );
          var t =
            '<a class="hover ' +
            (f[e] ? "activetransfer " : "transfer") +
            b.transport +
            '" href="#' +
            c +
            '" title="' +
            (b.name || "").replace(/"/g, "") +
            '">' +
            h[d].numHTML.replace(/\s/g, "&nbsp;") +
            "</a> ";
          typeof a == "function" &&
            (i.transfers.push(c), i.transfers_routes.push(b)),
            l.push(t);
        }
        f[e] &&
          (k !== b.transport &&
            ((k = b.transport),
            (t =
              ' <span class="icon icon_narrow icon_' +
              b.transport +
              '" data-transport="' +
              b.transport +
              '-remove"></span>&nbsp;' +
              t)),
          m.push(t),
          (f[e].stopId = b.stopId));
      }
      l.push('<span style="display:inline-block; width:2px;"></span>');
      var u = ti.fGetStopDetails(pg.schedule.stopId),
        v =
          (u.street ? ", " + u.street : "") +
          (u.area && !cfg.cities[pg.city].skipStopArea ? ", " + u.area : "") +
          (u.city && !cfg.cities[pg.city].skipStopCity ? ", " + u.city : "");
      u[cfg.cities[pg.city].stopFareZone || "noFareZone"] &&
        (v += ", " + i18n.fareZone + " " + u[cfg.cities[pg.city].stopFareZone]),
        (v =
          v.length > 0
            ? '<span class="details"> (' + v.substring(2) + ")</span>"
            : ""),
        (($("divScheduleStop") || {}).innerHTML =
          '<span class="stop-name">' +
          i18n.stop +
          "</span><strong> " +
          u.name +
          "</strong>" +
          v +
          "&nbsp;&nbsp; " +
          l.join(""));
      if (u.street) {
        var w = u.street.replace(/"/g, "&quote;").replace(/\s/, "&nbsp;"),
          x =
            $("divScheduleRoute") &&
            $("divScheduleRoute").getElementsByTagName("a");
        if (x)
          for (d = x.length; --d >= 0; )
            x[d].innerHTML.indexOf(w) < 0
              ? x[d].className == "hover strong" && (x[d].className = "hover")
              : (x[d].className = "hover strong");
      }
      var y = [],
        z = 0,
        A = Number.POSITIVE_INFINITY,
        B = 0,
        C = [],
        D = [],
        E = [],
        F = [],
        G = new Date();
      G.setTime(G.getTime() - 108e5);
      var H = "" + (G.getDay() || 7),
        I = cfg.city.doNotMergeTimetables;
      pg.schedule.route.city == "vilnius" &&
        pg.schedule.route.transport == "regionalbus" &&
        (I = !1),
        pg.schedule.stopId != pg.schedule.route.stops[0] &&
          cfg.city.doNotShowTimetables &&
          cfg.city.doNotShowTimetables[pg.transport] &&
          (f = null);
      for (var e in f) {
        var n = f[e];
        if (!n || !n.stopId) continue;
        if (!pg.transfersDisplayed[e]) continue;
        var J = ti.fGetStopDetails(n.stopId),
          K = {},
          L = (
            J || {
              raw_data: "",
            }
          ).raw_data.split(";"),
          o = n.dirType.split("-"),
          p = o[0],
          q = o[o.length - 1],
          r = 2;
        p === "a" || q === "b"
          ? (r = 1)
          : p.charAt(0) !== "b" &&
            q.charAt(0) !== "a" &&
            (p.charAt(0) === "a" || q.charAt(0) === "b") &&
            (r = 1);
        var M = ti.toAscii(pg.schedule.route.name, !0);
        for (var d = ti.FLD_DIRS; d < L.length; d += 2) {
          b = ti.fGetRoutes(L[d]);
          if (
            b.city === n.city &&
            b.transport === n.transport &&
            ti.toAscii(b.num, !0) === n.num &&
            b.times &&
            (!pg.schedule.route.routeTag ||
              (pg.schedule.route.routeTag == "0" && !b.routeTag) ||
              b.id === pg.schedule.route.id ||
              ti.toAscii(b.name, !0) === M)
          ) {
            (o = b.dirType.split("-")),
              (p = o[0]),
              (q = o[o.length - 1]),
              (q = q.split("_")[0]);
            var s = 2;
            p === "a" || q === "b"
              ? (s = 1)
              : p.charAt(0) !== "b" &&
                q.charAt(0) !== "a" &&
                (p.charAt(0) === "a" || q.charAt(0) === "b") &&
                (s = 1);
            if (r !== s) continue;
            if (
              !g &&
              cfg.defaultCity == "siauliai" &&
              M != ti.toAscii(b.name, !0) &&
              o.length == 2 &&
              "aba".indexOf(p + q) >= 0
            )
              continue;
            if (K[b.id]) continue;
            (K[b.id] = !0),
              (b.tag =
                (!g &&
                b.dirType != pg.schedule.dirType &&
                ti.toAscii(b.name, !0) !== M
                  ? "other"
                  : "current") + ti.fGetDirTag(b.dirType));
            if (b.tag == "current" || (b.tag == "other" && p.charAt(0) == "d"))
              b.tag = "";
            (pg.city === "druskininkai" || pg.city === "liepaja") &&
              pg.schedule.num === b.num &&
              (b.tag = ""),
              pg.city === "klaipeda" &&
                (b.transport === "expressbus" ||
                  b.num.substring(b.num.length - 1).toLowerCase() === "e" ||
                  b.num.toLowerCase().indexOf("e (") > 0) &&
                (b.tag = "express");
            var N =
                typeof b.times === "string"
                  ? ti.explodeTimes(b.times)
                  : b.times,
              O = N.workdays,
              P = N.tag,
              Q = N.times,
              R = N.trip_codes,
              S = +L[d + 1];
            b.stops[S] == b.stops[S + 1] && ++S;
            var T = O.length,
              U = T;
            for (var V = T + S * T; U--; ) {
              var W = Q[--V];
              A > W && W >= 0 && (A = W), B < W && W >= 0 && (B = W);
              var X = b.tag,
                Y = !1,
                Z = !1;
              P.charAt(U) === "1"
                ? (X = (X ? X + " " : "") + "highlighted")
                : P.charAt(U) === "3"
                ? ((X = (X ? X + " " : "") + "highlighted"), (Y = !0))
                : P.charAt(U) === "4"
                ? ((X = (X ? X + " " : "") + "smallbus"), (Z = !0))
                : P.charAt(U) === "2" &&
                  ((Y = !0),
                  pg.city == "druskininkai" &&
                    (X = (X ? X + " " : "") + "highlighted")),
                pg.schedule.tripNum &&
                  b.dirType === pg.schedule.dirType &&
                  pg.schedule.tripNum - 1 == U &&
                  (X = (X ? X + " " : "") + "clicked"),
                Y &&
                  cfg.defaultCity == "vilnius" &&
                  b.transport == "trol" &&
                  ((Y = !1),
                  (X = (X ? X + " " : "") + "long"),
                  O[U] == "12345"
                    ? D.push(W)
                    : O[U] == "6"
                    ? E.push(W)
                    : O[U] == "7" && F.push(W));
              if (ti.missing_trips && R[U] && O[U].indexOf(H) >= 0) {
                var _ =
                    "\n" +
                    (b.transport == "trol" ? "t" : "") +
                    b.num +
                    "-" +
                    R[U] +
                    ",",
                  ba = Q[U];
                ba == 1721 && (W = W);
                for (var bb = -3; bb <= 3; bb++)
                  if (ti.missing_trips.indexOf(_ + (ba + bb) + ",") >= 0) {
                    C.push(W);
                    break;
                  }
              }
              if (I)
                y[z++] = {
                  time: W,
                  workday: O[U],
                  route: b,
                  tag: X,
                  bicycle: Y,
                  small_capacity: Z,
                  tripNum: U,
                };
              else
                for (var bc = 1; bc <= 7; bc++)
                  O[U].indexOf(bc) >= 0 &&
                    (y[z++] = {
                      time: W,
                      workday: bc,
                      route: b,
                      tag: X,
                      bicycle: Y,
                      small_capacity: Z,
                      tripNum: U,
                    });
            }
          }
        }
      }
      y.sort(function (a, b) {
        if (a.workday < b.workday) return -1;
        if (a.workday > b.workday) return 1;
        if (a.time < b.time) return -1;
        if (a.time > b.time) return 1;
        if (a.route.id < b.route.id) return -1;
        if (a.route.id > b.route.id) return 1;
        return 0;
      });
      var bd = "";
      $("divScheduleRoute") &&
        g &&
        (bd =
          '<div class="selectedNumbers" style="width:100%; margin-top:10px;">' +
          m.join(" &nbsp;") +
          ' &nbsp;<label id="labelShowDeparturesWithNumbers" for="showDeparturesWithNumbers"><input name="showDeparturesWithNumbers" id="showDeparturesWithNumbers" type="checkbox" value="showDeparturesWithNumbers"' +
          (pg.showDeparturesWithNumbers ? ' checked="checked"' : "") +
          ' onclick="pg.fToggleNumbersAtDepartures();" />' +
          i18n.showDeparturesWithRouteNumbers +
          "</label></div>"),
        (l = []);
      if (y.length) {
        var be,
          bf = (A = ~~(A / 60) - 1),
          B = ~~(B / 60),
          bg = [],
          bh = [],
          bi;
        for (d = 0, V = y.length; d <= V; d++) {
          if (d > 0 && (d === V || y[d].workday != y[d - 1].workday)) {
            var bi = l.join(";"),
              T = y[d - 1].workday;
            for (kk = 1; kk <= 7; ++kk)
              if (bg[kk] === bi) {
                bh[kk] += T;
                break;
              }
            kk > 7 && ((bg[T] = bi), (bh[T] = "" + T));
            if (d === V) break;
            l = [];
          }
          bi = y[d];
          var b = bi.route;
          l.push(bi.time, b.city, b.transport, b.num, b.dirType);
        }
        (l = []), (intervals_by_hour = []), (intervals_by_hour_k = 0);
        for (d = 0, V = y.length; d <= V; d++) {
          if (d < V) {
            bi = y[d];
            if (I) bh[bi.workday] = bi.workday;
            else if (!bh[bi.workday]) continue;
          }
          if (d > 0 && (d === V || bi.workday != y[d - 1].workday)) {
            bf != -999 && l.push("</td></tr>");
            if (cfg.defaultCity === "tallinna-linn")
              for (var bj = 0; bj < B - bf; bj++)
                l.push("<tr><th>—</th><td></td></tr>");
            html_intervals = [];
            for (var bj = 0, bk = -999999; bj < intervals_by_hour.length; bj++)
              break;
            l.push("</tbody></table>"),
              (bd += l.join("")),
              html_intervals.length > 0 &&
                (bd +=
                  "<table><tbody>" +
                  html_intervals.join("") +
                  "</tbody></table>"),
              typeof a == "function" &&
                (i.timetables_html.push(l.join("")),
                i.intervals_html.push(html_intervals.join(""))),
              (l = []);
            if (d === V) break;
          }
          if (d == 0 || bi.workday != y[d - 1].workday) {
            (intervals_by_hour = []), (intervals_by_hour_k = 0), (bf = A);
            var bl = pg.fWeekdaysName(bh[y[d].workday], pg.transport);
            bl.length > 20 && (bl = bl.replace(",", ",<br/>")),
              l.push(
                '<table class="table table-bordered timetable ',
                "days-",
                bh[y[d].workday],
                '" cellspacing="0" cellpadding="0"><tbody><tr><th></th><th class="workdays">' +
                  bl +
                  "</th></tr>"
              ),
              typeof a == "function" &&
                (i.workdays.push(bh[y[d].workday]),
                (i.timetables[bh[y[d].workday]] = []),
                (i.maxlength[bh[y[d].workday]] = 0));
          }
          var bm = bi.time;
          if (bm < 0) continue;
          var bn = ~~(bm / 60);
          bm = bm % 60;
          if (bf !== bn) {
            intervals_by_hour[intervals_by_hour_k] && intervals_by_hour_k++;
            if (bf != A) {
              l.push("</td></tr>");
              while (++bf < bn) l.push("<tr><th>&mdash;</th><td></td></tr>");
            } else
              while (++bf < bn)
                l.push(
                  "<tr><th>" +
                    (cfg.defaultCity === "tallinna-linn"
                      ? "&mdash;"
                      : "&nbsp;") +
                    "</th><td></td></tr>"
                );
            (bf = bn),
              l.push(
                "<tr><th>" +
                  (bn % 24) +
                  "</th><td" +
                  (g ? ' style="white-space:normal;"' : "") +
                  ">"
              ),
              typeof a == "function" &&
                i.timetables[bh[y[d].workday]].push({
                  hour: bn % 24,
                  minutes: [],
                });
          }
          var bo = intervals_by_hour[intervals_by_hour_k];
          bo || (intervals_by_hour[intervals_by_hour_k] = bo = {}),
            bo.first
              ? (bo.min > bi.time - bo.last && (bo.min = bi.time - bo.last),
                bo.max < bi.time - bo.last && (bo.max = bi.time - bo.last),
                bo.k++)
              : ((bo.first = bi.time),
                (bo.min = 999999),
                (bo.max = -999999),
                (bo.k = 1)),
            (bo.last = bi.time);
          var bp = bi.route;
          c = pg.fUrlSet(
            {
              schedule: {
                city: bp.city,
                transport: bp.transport,
                num: bp.num,
                dirType: bp.dirType,
                stopId: bp.stopId,
                tripNum: bi.tripNum + 1,
              },
            },
            !0
          );
          var bq = bp.numHTML;
          if (cfg.defaultCity === "tallinna-linn" && bq.length > 5) {
            var br = bq.indexOf(" ");
            br != -1 && (bq = bq.substring(0, br) + "*");
          }
          l.push(
            '<a href="#' +
              c +
              '" title="' +
              (g
                ? i18n.transport1[bp.transport] +
                  (bp.num.length > 15 ? "" : " " + bp.numHTML) +
                  " " +
                  i18n.towards +
                  " "
                : "") +
              bp.name.replace(/"/g, "") +
              '"' +
              (bi.tag ? 'class="' + bi.tag + '"' : "") +
              ">" +
              (bm < 10 ? "0" : "") +
              bm +
              (g
                ? '<span class="departure' +
                  bp.transport +
                  '">' +
                  (cfg.defaultCity === "tallinna-linn" ? "" : "\\") +
                  bq +
                  "</span>"
                : "") +
              (bi.bicycle
                ? '<img class="icon" style="margin:0 1px;" src="' +
                  pg.imagesFolder +
                  'bicycle.png">'
                : "") +
              (g && cfg.defaultCity != "tallinna-linn"
                ? "</a>&#x200A;"
                : "</a>")
          );
          if (typeof a == "function") {
            var bs = i.timetables[bh[y[d].workday]],
              bt = bs[bs.length - 1];
            bt.minutes.push({
              hash: c,
              min: bm,
              title: g
                ? i18n.transport1[bp.transport] +
                  (bp.num.length > 15 ? "" : " " + bp.num) +
                  " " +
                  i18n.towards +
                  " "
                : "",
              classname: bi.tag || "",
              bicycle: bi.bicycle,
              small_capacity: bi.small_capacity,
              route: bp,
            }),
              bt.minutes.length > i.maxlength[bh[y[d].workday]] &&
                (i.maxlength[bh[y[d].workday]] = bt.minutes.length);
          }
        }
      }
      if (pg.schedule.route && pg.schedule.route.transport) {
        (b = pg.schedule.route), (l = []);
        var bu = "";
        if (C.length > 0 && i18n.unassignedDepartures) {
          C.sort(function (a, b) {
            return a - b;
          }),
            (bu =
              '<div class="exclamation-at-start"><b>&nbsp;' +
              i18n.unassignedDepartures +
              ":</b>");
          for (var bv = 0; bv < C.length; bv++) bu += " " + ti.printTime(C[bv]);
        }
        if (D.length > 0 && i18n.unassignedDepartures) {
          D.sort(function (a, b) {
            return a - b;
          }),
            (bu =
              '<div class="exclamation-at-start long"><b>&nbsp;' +
              i18n.specialDeparturesWorkday +
              ":</b>");
          for (var bv = 0; bv < D.length; bv++)
            (bu += " " + ti.printTime(D[bv])),
              new Date() <= new Date(2021, 11, 22) &&
                D[bv] >= 950 &&
                D[bv] <= 1062 &&
                (bu += "(" + (i18n.except1222 || "except 22th December") + ")");
          E.sort(function (a, b) {
            return a - b;
          }),
            (bu += ",<br/><b>" + i18n.specialDeparturesSaturday + ":</b>");
          for (var bv = 0; bv < E.length; bv++) bu += " " + ti.printTime(E[bv]);
          F.sort(function (a, b) {
            return a - b;
          }),
            (bu += ",<br/><b>" + i18n.specialDeparturesSunday + ":</b>");
          for (var bv = 0; bv < E.length; bv++) bu += " " + ti.printTime(F[bv]);
        }
        bu &&
          ((bu += "</div>"),
          (bd = bu + bd),
          ((i || {}).missing_departures_html = bu));
        var bw =
          cfg.city[
            "notes_" + b.transport + "_" + b.num.toLowerCase().split("(")[0]
          ] ||
          cfg.city["notes_" + b.operator] ||
          cfg.city["notes_" + b.transport];
        bw &&
          (typeof a == "function" && (i.notes = bw),
          (bd =
            '<div style="margin-top:10px; clear:both;">' +
            (bw[pg.language] || bw.en || bw) +
            "</div>" +
            bd)),
          (bw = (cfg.cities[b.city] || {}).skipOperator
            ? ""
            : ti.fOperatorDetails(b.operator, b.transport)),
          bw &&
            l.push(
              '<p class="noindent">' +
                (cfg.defaultCity == "vilnius"
                  ? ""
                  : "<strong>" + i18n.operator + ":</strong> ") +
                bw +
                "</p>"
            ),
          (bw = (
            cfg.operators[b.operator] ||
            cfg.operators[b.transport] ||
            cfg.operators[b.transport + "_" + b.num] || {
              notes: "",
            }
          ).notes),
          bw &&
            ((bw = bw[pg.language] || bw.en || bw),
            (bw = bw.replace("%operator", b.operator)),
            l.push("<p>" + bw + "</p><br /><br /><p>")),
          f &&
            (b.transport != "commercialbus" ||
            b.num.indexOf("xxxArkikatedra") < 0
              ? b.transport != "commercialbus" || b.num.indexOf("Ozo") < 0
              : l.push('<img src="156.jpg" width="100%">'),
            l.push(
              '<p class="noindent"><strong>' +
                i18n.scheduleCommentsInfo +
                ":</strong>"
            ),
            bd.indexOf("bicycle") >= 0 &&
              l.push(
                "<p>" +
                  (
                    i18n["transferBicyclesDepartures_" + cfg.defaultCity] ||
                    i18n.transferBicyclesDepartures ||
                    ""
                  ).replace(
                    "&#128690;",
                    '<img class="icon" style="margin:0;" src="' +
                      pg.imagesFolder +
                      'bicycle.png">'
                  )
              ),
            (bw = (
              cfg.operators[b.operator] ||
              cfg.operators[b.transport] || {
                comments: "",
              }
            ).comments),
            bw
              ? l.push(
                  "<p>" +
                    (bw[pg.language] || bw.en || bw).replace(
                      "%operator",
                      b.operator
                    ) +
                    "</p>"
                )
              : (i18n.scheduleDelaysWarning &&
                  i18n.scheduleDelaysWarning.length > 10 &&
                  l.push("<p>" + i18n.scheduleDelaysWarning),
                l.push("<p>" + i18n.scheduleComments)),
            bd.indexOf("smallbus") >= 0 &&
              l.push("<p>" + i18n.smallBus12Departures),
            bd.indexOf("highlighted") >= 0 &&
              l.push(
                "<p>" +
                  (cfg.defaultCity === "tallinna-linn"
                    ? i18n.lowFloorDepartures2
                    : i18n.lowFloorDepartures)
              ),
            bd.indexOf("other") >= 0 &&
              l.push(
                "<p>" +
                  (cfg.defaultCity === "tallinna-linn"
                    ? i18n.scheduleChangedDepartures2
                    : i18n.scheduleChangedDepartures)
              ),
            (bw = cfg.city.scheduleFooter),
            bw &&
              ((bw = bw[pg.language] || bw.en || bw),
              (bw = bw.replace("%operator", b.operator)),
              l.push("<p>" + bw))),
          (($("divScheduleContentBottom") || {}).innerHTML =
            l.join("</p>") + "</p>");
      }
      pg.replaceHtml(
        $("divScheduleContentInner"),
        bd + '<div style="clear:both;"></div>'
      ),
        a && a(i);
    }
  }),
  (pg.fCheckTransfer_Click = function () {
    if (!pg.addSchedule) return !1;
    $e = $("checkTransfer");
    var a;
    pg.schedules ||
      ((a = [pg.schedule.city, pg.schedule.transport, pg.schedule.num].join(
        "_"
      )),
      (pg.schedules = {}),
      (pg.schedules[a] = pg.schedule));
    if (typeof pg.addSchedule == "object")
      (a = ti.toAscii(
        [
          pg.addSchedule.city,
          pg.addSchedule.transport,
          pg.addSchedule.num,
        ].join("_")
      )),
        (pg.schedules[a] = $e.checked ? pg.addSchedule : null);
    else {
      pg.addSchedule = (pg.addSchedule || "").replace("-remove", "");
      for (var a in pg.transfersDisplayed) {
        var b = pg.transfersDisplayed[a];
        b.transport == pg.addSchedule &&
          (pg.schedules[a] = $e.checked ? b : null);
      }
    }
    pg.fScheduleLoadTimetable();
    return;
  }),
  (pg.fToggleNumbersAtDepartures = function () {
    (pg.showDeparturesWithNumbers = $("showDeparturesWithNumbers").checked),
      pg.toggleClass(
        $("divScheduleContentInner"),
        "HideNumbers",
        !pg.showDeparturesWithNumbers
      );
  }),
  (pg.fWeekdaysName = function (a, b) {
    var c = "";
    pg.schedule &&
      pg.schedule.route &&
      (pg.schedule.route.weekdays || "").indexOf("!") >= 0 &&
      (a || "").indexOf("7") >= 0 &&
      (c = "notfestal"),
      a == "1234" &&
        cfg.isMobilePage &&
        !i18n["weekdays1234"] &&
        (i18n.weekdays1234 = i18n.weekdays1 + "-" + i18n.weekdays4);
    var d =
      i18n[b + "weekdays" + a + c] ||
      i18n[b + "weekdays" + a] ||
      i18n["weekdays" + a + c] ||
      i18n["weekdays" + a] ||
      "";
    if (d) return d;
    var e = a.split("");
    d;
    for (var f = e.length; --f >= 0; )
      (d = e[f]),
        (e[f] =
          i18n[b + "weekdays" + d + c] ||
          i18n[b + "weekdays" + d] ||
          i18n["weekdays" + d + c] ||
          i18n["weekdays" + d] ||
          d);
    d = e.join(", ");
    return d;
  }),
  (pg.inputShowClear = function (a, b) {
    var c = a.parentNode.querySelector(".inputClear");
    console.log("clear:inputShowClear", c, b),
      c &&
        (b && a.value
          ? c.classList.add("active")
          : window.setTimeout(function () {
              c.classList.remove("active");
            }, 200));
  }),
  (pg.inputSuggestedStops_Focus = function (a) {
    pg.sisp &&
      ((
        $("star-popup") || {
          style: {},
        }
      ).style.display = "none"),
      pg.inputActive !== a &&
        ((pg.inputActive = a),
        (pg.stopsSuggestedForText = pg[pg.inputActive.id]
          ? pg.inputActive.value
          : null)),
      pg.inputActive.className === "empty" &&
        ((pg.inputActive.className = ""),
        (pg.inputActive.value = ""),
        typeof pg.updateStopInputValue == "function" &&
          pg.updateStopInputValue(pg.inputActive));
    pg.timerSuggestedStopsShow === !1
      ? (pg.timerSuggestedStopsShow = 0)
      : (pg.fSuggestedStopsShow(!0),
        pg.timerSuggestedStopsShow === 0 &&
          (pg.timerSuggestedStopsShow = setInterval(
            pg.fSuggestedStopsShow,
            200
          )));
  }),
  (pg.inputSuggestedStops_Blur = function (a) {
    if (
      !document.activeElement ||
      document.activeElement.id != "divSuggestedStops"
    )
      pg.timerSuggestedStopsShow && clearInterval(pg.timerSuggestedStopsShow),
        (pg.timerSuggestedStopsShow = 0),
        a &&
          !a.value &&
          ((a.value =
            a.id == "inputFinish"
              ? i18n.finishStop
              : a.id == "inputStopFilter"
              ? ""
              : pg.transport == "plan"
              ? i18n.startStopOrAddress
              : i18n.startStop),
          typeof pg.updateStopInputValue == "function" &&
            pg.updateStopInputValue(a),
          (a.className = "empty"),
          pg.sisp &&
            (a.id == "inputStart"
              ? pg.starClear("start")
              : a.id == "inputFinish" && pg.starClear("finish"))),
        pg.timerSuggestedStopsHide ||
          (pg.timerSuggestedStopsHide = setTimeout(function () {
            (pg.timerSuggestedStopsHide = 0),
              a &&
                a.id == "inputStop" &&
                a.value != pg.inputStopText &&
                (!pg.sisp || !pg.tablo) &&
                pg.fSuggestedStopsSelectFirst(a),
              pg.timerSuggestedStopsShow || pg.fSuggestedStopsHide();
          }, 200));
  }),
  (pg.divSuggestedStops_Blur = function () {
    (!document.activeElement ||
      !pg.inputActive ||
      document.activeElement.id !== pg.inputActive.id) &&
      pg.inputSuggestedStops_Blur(pg.inputActive);
  }),
  (pg.fSuggestedStopsShow = function (a, b) {
    if (pg.inputActive) {
      if (
        pg.inputActive.value == i18n.mapPoint ||
        pg.inputActive.value == "Point on map" ||
        pg.inputActive.value == i18n.myLocation ||
        pg.inputActive.value == "My location"
      ) {
        pg.fSuggestedStopsHide();
        return;
      }
      var c = pg.inputActive.value || "";
      pg.sisp &&
        pg.tablo &&
        pg.inputActive.id == "inputStop" &&
        (c
          ? pg.inputActive.parentNode.classList.add("active")
          : pg.inputActive.parentNode.classList.remove("active"));
      var d = $("divSuggestedStops");
      if (
        a !== !0 &&
        pg.stopsSuggestedForText === c &&
        d.style.display === "block"
      )
        return;
      if (a !== !0 && pg.stopLastTyped !== c) {
        pg.stopLastTyped = c;
        return;
      }
      if (
        pg.stopsSuggestedForText != c &&
        pg.inputStopText != pg.stopSuggestedForMap
      )
        if (!pg.sisp || !pg.tablo) pg[pg.inputActive.id] = "";
      (pg.stopLastTyped = c),
        typeof ti.stops === "object" && (pg.stopsSuggestedForText = c);
      var e = [];
      if (pg.sisp) {
        var f = typeof favourites != "undefined" ? favourites.getLabels() : [];
        f.length &&
          (e.push(
            '<span style="display:block; padding-left:10px;line-height:26px;"><b>' +
              (i18n.favourites ||
                (pg.language == "en" ? "My labels" : "Mano asmenžymės")) +
              ":</b></span>"
          ),
          f.forEach(function (a) {
            var b = a.key,
              c = a.label,
              d = ti.fGetAnyStopDetails(b),
              f = [];
            d.city && !cfg.cities[pg.city].skipStopCity && f.push(d.city),
              d.area && !cfg.cities[pg.city].skipStopArea && f.push(d.area),
              d.streets && f.push(d.streets),
              (f =
                f.length > 0
                  ? '<span class="details"> (' + d.name + ")</span>"
                  : ""),
              (f =
                '<a id="' +
                b +
                '" href="" onclick="return false;"><span class="icon icon_map" title="' +
                i18n.showInMap +
                '"></span><span class="star-favourite"></span>' +
                (c.name || "").substring(0, 30) +
                f +
                "</a>"),
              e.push(f);
          }));
        var g = pg.getStopsNearBy(3);
        g.length &&
          (e.push(
            '<span style="display:block; padding-left:10px;line-height:26px;"><b>' +
              (i18n.stopsNearby ||
                (pg.language == "en" ? "Nearby stops" : "Stotelės netoliese")) +
              ":</b></span>"
          ),
          g.forEach(function (a) {
            var b = [];
            a.city && !cfg.cities[pg.city].skipStopCity && b.push(a.city),
              a.area && !cfg.cities[pg.city].skipStopArea && b.push(a.area),
              a.streets && b.push(a.streets),
              (b =
                b.length > 0
                  ? '<span class="details"> (' + b.join(", ") + ")</span>"
                  : ""),
              pg.sisp &&
                a.towards &&
                (b = '<span class="details">' + a.towards + "</span>"),
              (b =
                '<a id="' +
                a.id +
                '" href="" onclick="return false;"><span class="icon icon_map" title="' +
                i18n.showInMap +
                '"></span>' +
                a.name +
                b +
                (typeof a.distance == "number"
                  ? '<span class="distance">' + a.distance + " m</span>"
                  : "") +
                (pg.sisp && a.transfers
                  ? pg.detailsTransfers2(a.transfers)
                  : "") +
                "</a>"),
              e.push(b);
          }));
      }
      if (e.length || (c.length >= 2 && typeof ti.stops == "object")) {
        b =
          b ||
          (c.length > 1 ? ti.fGetStopsByName(pg.stopSuggestedForMap || c) : []);
        if (b.length == 0) {
          if (!pg.inputActive || pg.inputActive.id != "inputLocation")
            c.length &&
              e.push(
                '<a id="aMoreChars" href="" onclick="return false;"><span class="icon icon_info"></span>' +
                  i18n.noStopsFound +
                  "</a>"
              );
        } else {
          e.push(
            '<span style="display:block; padding-left:10px;line-height:26px;"><b>' +
              i18n.stops +
              ":</b></span>"
          );
          var h = "," + pg[pg.inputActive.id] + ",";
          for (var i = 0; i < b.length; i++) {
            var j = b[i],
              k = [];
            cfg.defaultCity == "riga" && j.towards && k.push(j.towards),
              j.city && !cfg.cities[pg.city].skipStopCity && k.push(j.city),
              j.area && !cfg.cities[pg.city].skipStopArea && k.push(j.area),
              j.streets && k.push(j.streets),
              (k =
                k.length > 0
                  ? '<span class="details"> (' + k.join(", ") + ")</span>"
                  : ""),
              pg.sisp &&
                j.towards &&
                (k = '<span class="details">(' + j.towards + ")</span>"),
              (k =
                '<a id="' +
                j.id +
                '" href="" onclick="return false;"><span class="icon icon_map" title="' +
                i18n.showInMap +
                '"></span><span class="title">' +
                (h.indexOf("," + j.id + ",") >= 0
                  ? "<strong>" + j.name + "</strong>"
                  : j.name) +
                "</span>" +
                k +
                (typeof j.distance == "number"
                  ? '<span class="distance">' + j.distance + " m</span>"
                  : "") +
                (pg.sisp && j.transfers
                  ? pg.detailsTransfers2(j.transfers)
                  : "") +
                (typeof mobile != "undefined" && j.transfers
                  ? mobile.detailsTransfers2(j.transfers)
                  : "") +
                "</a>"),
              !1 && h.indexOf("," + j.id + ",") >= 0
                ? e.splice(0, 0, k)
                : e.push(k);
          }
        }
      } else {
        if (pg.sisp && !g.length) return;
        pg.sisp ||
          e.push(
            '<a id="aMoreChars" href="" onclick="return false;"><span class="icon icon_info"></span>' +
              (typeof ti.stops != "object"
                ? i18n.receivingData
                : i18n.typeSomeChars) +
              "</a>"
          );
      }
      pg.geocoder || ti.fCreateGeocoder();
      if (c.length >= 3 && pg.geocoder) {
        var l = $("geocaching-results");
        l
          ? e.push('<div id="geocaching-results">' + l.innerHTML + "</div>")
          : e.push(
              '<div id="geocaching-results"><span style="display:block; padding-left:10px;line-height:26px;"><b>' +
                i18n.addressesAndPlaces +
                ":</b><br/>" +
                i18n.loading +
                "</span></div>"
            );
      }
      e.push(
        '<a id="aSuggestShowMap" href="" onclick="return false;"><span class="icon icon_stops"></span>' +
          i18n.selectFromMap +
          "</a>"
      ),
        typeof mobile != "undefined" && mobile.kautra && e.pop(),
        ((d || {}).innerHTML = e.join(""));
      var m = pg.inputActive.parentNode.querySelector(".inputClear");
      m && m.classList.toggle("active", c.length >= 1);
      if (c && c.length >= 3)
        if (!!1 || typeof mobile == "undefined")
          if (
            pg.inputActive.id == "inputStop" ||
            pg.inputActive.id == "inputStopFilter"
          ) {
            var l = $("geocaching-results");
            l && (l.style.display = "none");
          } else
            pg.geocoder &&
              pg.geocoder.search(c, function (a) {
                var b = $("geocaching-results");
                if (b) {
                  var c = "";
                  a.length
                    ? (c =
                        '<span style="display:block; padding-left:10px;line-height:26px;"><b>' +
                        i18n.addressesAndPlaces +
                        ":</b></span>")
                    : (c =
                        '<a id="aMoreChars" href="" onclick="return false;"><span class="icon icon_info"></span>' +
                        i18n.noAddressesAndPlacesFound +
                        "</a>");
                  for (var d = 0; d < a.length; d++) {
                    var e = a[d];
                    if (e.key || e.id)
                      c +=
                        "<a " +
                        (e.key
                          ? 'data-key="' + e.key + '"'
                          : 'id="' + e.id + '"') +
                        ' onclick="return false;" href=""><span class="icon icon_map" title="' +
                        i18n.showInMap +
                        '"></span>' +
                        e.name +
                        "</a>";
                  }
                  (b.innerHTML = c), (b.style.display = "block");
                }
              });
      if (d && pg.inputActive.offsetHeight) {
        var n = $("divContentWrapper") || {
            offsetLeft: 0,
            offsetTop: 0,
          },
          o = pg.inputActive.offsetLeft,
          p = pg.inputActive.offsetTop + pg.inputActive.offsetHeight + 1;
        pg.sisp && ((p -= 1), pg.inputActive.id === "inputStop" && (p += 2)),
          getComputedStyle(pg.inputActive.parentNode).position == "relative" &&
            ((o += pg.inputActive.parentNode.offsetLeft),
            (p += pg.inputActive.parentNode.offsetTop)),
          $("tblContentPlannerOptions") &&
            pg.inputActive.id !== "inputStop" &&
            (n.offsetLeft === 0 || o < n.offsetLeft || cfg.searchOnly) &&
            ((p += $("tblContentPlannerOptions").offsetTop),
            (o += $("tblContentPlannerOptions").offsetLeft)),
          pg.inputActive.id === "inputStop" &&
            n.offsetLeft === 0 &&
            !pg.tablo &&
            (p = 0),
          pg.inputActive.id !== "inputStop" &&
            o < n.offsetLeft &&
            ((o += n.offsetLeft), (p += n.offsetTop)),
          typeof mobile != "undefined" &&
            mobile.tallinn &&
            ((p = 120), pg.inputActive.id == "inputFinish" && (p += 35));
        if (
          typeof mobile != "undefined" &&
          (mobile.kautra || cfg.defaultCity == "riga")
        ) {
          var q = jQuery(pg.inputActive).offset();
          (p = q.top + 40),
            (o = q.left),
            (d.style.width = jQuery(pg.inputActive).width() + "px");
        }
        typeof mobile == "undefined" &&
          cfg.defaultCity == "tallinna-linn" &&
          typeof jQuery != "undefined" &&
          ((p = jQuery("#planner .plan-stations").position().top + 20 + 40),
          pg.inputActive.id == "inputFinish"
            ? ((p += 38),
              d.classList.add("finish"),
              d.classList.remove("start"))
            : (d.classList.add("start"), d.classList.remove("finish")),
          (o = pg.hashForMap ? 120 : 300)),
          pg.sisp && pg.inputActive.id == "inputStopFilter" && (p = 58),
          (d.style.top = p + "px"),
          (d.style.left = o + "px");
      }
      pg.inputActive.offsetWidth > 2 &&
        (typeof mobile == "undefined" || mobile.kautra
          ? ((d.style.minWidth = pg.inputActive.offsetWidth - 2 + "px"),
            pg.sisp &&
              (pg.inputActive.id == "inputStart" ||
                pg.inputActive.id == "inputFinish") &&
              (d.style.width = pg.inputActive.offsetWidth - 2 + "px"),
            pg.transport == "home" &&
              (d.style.width = pg.inputActive.offsetWidth + "px"))
          : (d.style.right =
              window.innerWidth - (pg.inputActive.offsetWidth + o) + "px")),
        (d.scrollTop = 0),
        (d.style.overflowX = "hidden");
      if (pg.sisp && pg.widget) d.style.overflowY = "auto";
      else if (typeof mobile != "object" || !mobile.kautra)
        d.style.overflowY = e.length > 6 ? "scroll" : "hidden";
      (d.style.height = e.length > 6 && !pg.sisp ? "156px" : "auto"),
        (d.style.display = "block");
    }
  }),
  (pg.fSuggestedStopsHide = function () {
    (pg.stopSuggestedForMap = ""),
      $("divSuggestedStops").style.display != "none" &&
        ($("divSuggestedStops").style.display = "none");
  }),
  (pg.divSuggestedStops_MouseDown = function (a) {
    var b = a && (a.target || a.srcElement);
    if (b && (b.id === "divSuggestedStops" || b.id === "geocaching-results"))
      return !1;
    return !0;
  }),
  (pg.eSuggestedStops_Click = function (a) {
    pg.timerSuggestedStopsHide &&
      (clearTimeout(pg.timerSuggestedStopsHide),
      (pg.timerSuggestedStopsHide = 0));
    var b = a && (a.target || a.srcElement);
    if (b && (b.id === "divSuggestedStops" || b.id === "geocaching-results"))
      return !1;
    var c = b && (b.className || "").toLowerCase(),
      d = b.getAttribute("data-key");
    if (b && !b.id && !d) {
      b = b.parentNode;
      var d = b.getAttribute("data-key");
    }
    if (!b) return pg.cancelEvent(a);
    function e(b, c) {
      if (c && c.indexOf("map") >= 0) {
        pg.inputStopText = pg.stopSuggestedForMap =
          pg.stopSuggestedForMap || pg.stopsSuggestedForText;
        if (pg.transport == "plan") {
          var d;
          pg.inputActive.id === "inputStart"
            ? ((pg.mapCenterTo = {
                type: "start",
                id: b,
              }),
              (pg.loadedPlannerParams = "clear start"),
              (d = "plan/" + b + "/" + (pg.inputFinish || "")))
            : ((pg.mapCenterTo = {
                type: "finish",
                id: b,
              }),
              (pg.loadedPlannerParams = "clear finish"),
              (d = "plan/" + (pg.inputStart || "") + "/" + b)),
            Hash.go(d + "/map");
        } else Hash.go("stop/" + b + "/map");
        setTimeout(function () {
          try {
            pg.inputActive.focus();
          } catch (a) {}
        }, 100);
      }
      if (b && b.indexOf("ShowMap") >= 0) {
        pg.fSuggestedStopsHide(), pg.fUrlSetMap({});
        return pg.cancelEvent(a);
      }
      if (
        b &&
        b.indexOf("MoreChars") < 0 &&
        (c || "").indexOf("icon_map") < 0
      ) {
        if (b.charAt(0) != "@") {
          var e = ti.fGetAnyStopDetails(b),
            f = e.name;
          if (pg.sisp) {
            var g = favourites.getLabel(b);
            g && (f = g.name + " (" + e.name + ")");
          }
          (pg.inputActive.value = f),
            typeof pg.updateStopInputValue == "function" &&
              pg.updateStopInputValue(pg.inputActive),
            (pg.inputActive.className = ""),
            (pg.stopsSuggestedForText = e.name),
            (pg[pg.inputActive.id] = b),
            pg.fSuggestedStopsHide(),
            (pg.timerSuggestedStopsShow = !1),
            pg.inputSuggestedStops_KeyDown(null, -13);
        }
      } else {
        try {
          pg.inputActive.focus();
        } catch (h) {}
        pg[pg.inputActive.id] = "";
      }
    }
    d
      ? pg.geocoder.getPlaceId(d, function (a) {
          e(a, c);
        })
      : b.id !== "divSuggestedStops" && e(b.id, c);
    return pg.cancelEvent(a);
  }),
  (pg.inputKeyTab = function (a) {
    var b = window.event ? window.event.keyCode : a.keyCode;
    b == 9 && pg.inputSuggestedStops_KeyDown(null, 13);
  }),
  (pg.inputSuggestedStops_KeyDown = function (a, b) {
    (pg.stopSuggestedForMap = ""),
      b || (b = window.event ? window.event.keyCode : a.keyCode);
    b == 27
      ? (pg.timerSuggestedStopsShow &&
          clearInterval(pg.timerSuggestedStopsShow),
        (pg.timerSuggestedStopsShow = 0),
        pg.fSuggestedStopsHide())
      : b == 13 || b == -13 || b == -13
      ? (pg.timerSuggestedStopsShow &&
          clearInterval(pg.timerSuggestedStopsShow),
        (pg.timerSuggestedStopsShow = 0),
        b == 13 && pg.fSuggestedStopsSelectFirst(),
        pg[pg.inputActive.id] && pg.fSuggestedStopsHide(),
        pg.inputActive.id === "inputStop" ||
        pg.inputActive.id === "inputLocation"
          ? pg[pg.inputActive.id] && pg.fTabStop_Click(pg[pg.inputActive.id])
          : pg.inputActive.id === "inputStopFilter"
          ? pg.sispTransportFilter(pg.inputStopFilter)
          : (pg.loadedPlannerParams != pg.inputStart + "/" + pg.inputFinish &&
              (pg.loadedPlannerParams = "clear results"),
            pg.fTabPlanner_Click(pg.inputStart, pg.inputFinish),
            pg.inputActive.id === "inputStart" &&
            pg.inputStart &&
            !pg.inputFinish
              ? setTimeout(function () {
                  try {
                    $("inputFinish").focus();
                  } catch (a) {}
                }, 100)
              : pg.inputActive.id === "inputFinish" &&
                pg.inputFinish &&
                !pg.inputStart
              ? setTimeout(function () {
                  try {
                    $("inputStart").focus();
                  } catch (a) {}
                }, 100)
              : pg.inputStart &&
                pg.inputFinish &&
                setTimeout(function () {
                  try {
                    $("buttonSearch").focus();
                  } catch (a) {}
                }, 100)))
      : b != 9 &&
        (pg.inputActive.className == "empty" &&
          ((pg.inputActive.value = ""),
          typeof pg.updateStopInputValue == "function" &&
            pg.updateStopInputValue(pg.inputActive),
          (pg.inputActive.className = "")),
        pg.fSuggestedStopsShow(),
        pg.timerSuggestedStopsShow ||
          (pg.timerSuggestedStopsShow = setInterval(
            pg.fSuggestedStopsShow,
            200
          )));
  }),
  (pg.fSuggestedStopsSelectFirst = function (a) {
    a = a || pg.inputActive;
    if (a) {
      pg[a.id] = "";
      if (a.value && a.value.length >= 2) {
        var b = ti.fGetStopsByName(a.value);
        b.length > 0 &&
          (a.value != b[0].name &&
            ((a.value = b[0].name),
            typeof pg.updateStopInputValue == "function" &&
              pg.updateStopInputValue(a)),
          (pg.stopsSuggestedForText = b[0].name),
          (pg[a.id] = b[0].id),
          a.id === "inputStop" && pg.fLoadDepartingRoutes());
      }
    }
  }),
  (pg.switchStops = function (a) {
    var b = pg.inputStart;
    (pg.inputStart = pg.inputFinish),
      (pg.inputFinish = b),
      pg.fLoadPlannerTab(),
      a &&
        pg.inputStart &&
        pg.inputFinish &&
        pg.fUrlSet({
          transport: "plan",
          inputStart: pg.inputStart,
          inputFinish: pg.inputFinish,
          hashForMap: pg.hashForMap && "map",
        });
    if (cfg.isVilniusAirport)
      if (pg.inputFinish == "2613" && pg.inputStart == "2613") {
        var c = $("inputStart"),
          d = $("inputFinish");
        c.getAttribute("disabled") &&
          ((c = $("inputFinish")), (d = $("inputStart"))),
          c.setAttribute("disabled", "disabled"),
          d.removeAttribute("disabled");
      } else
        pg.inputFinish == "2613"
          ? ($("inputFinish").setAttribute("disabled", "disabled"),
            $("inputStart").removeAttribute("disabled"))
          : pg.inputStart == "2613" &&
            ($("inputStart").setAttribute("disabled", "disabled"),
            $("inputFinish").removeAttribute("disabled"));
    return !1;
  }),
  (pg.fTabStop_Click = function (a) {
    pg.fUrlSet({
      transport: "stop",
      inputStop: a || pg.inputStop,
      hashForMap: pg.hashForMap && "map",
    });
    return !1;
  }),
  (pg.fTabPlanner_Click = function (a, b) {
    pg.fUrlSet({
      transport: "plan",
      inputStart: a || pg.inputStart || pg.inputStop,
      inputFinish: b || pg.inputFinish,
      hashForMap: pg.hashForMap && "map",
    });
    return !1;
  }),
  (pg.fTabActivate = function () {
    if (cfg.defaultCity == "panevezysraj" && pg.transport == "bus") {
      var a = location.pathname,
        b = Hash.getHash();
      cfg.isMobilePage
        ? ((a = a.split("mobile")[0]),
          (a += (a.slice(-1) == "/" ? "" : "/") + "mobile.html#" + b),
          (location.href = a))
        : (location.href =
            location.pathname.replace("rajonas.html", "index.html") + "#" + b);
    } else {
      if (cfg.defaultCity == "panevezys" && pg.transport == "regionalbus") {
        var a = location.pathname,
          b = Hash.getHash();
        cfg.isMobilePage
          ? ((a = a.split("mobile")[0]),
            (a += (a.slice(-1) == "/" ? "" : "/") + "mobileraj.html#" + b),
            (location.href = a))
          : ((a = a.split("index.html")[0]),
            (a += (a.slice(-1) == "/" ? "" : "/") + "rajonas.html#" + b),
            (location.href = a));
        return;
      }
      debugger;
      var c = pg.city + "_" + pg.transport;
      pg.transport ||
        ((c = "city"),
        cfg.cities[pg.city] &&
          pg.city !== pg.fGetCity(pg.city) &&
          (c = "region"));
      var d = $("divNav") && $("divNav").getElementsByTagName("a");
      if (d)
        for (var e = d.length; --e >= 0; )
          d[e].id === c
            ? (d[e].className = "active")
            : d[e].className.indexOf("active") >= 0 && (d[e].className = "");
      ($("dt_stop") || {}).className = pg.transport === "stop" ? "active" : "";
      if (pg.transport === "stop")
        (cfg.defaultCity == "tallinna-linn" ||
          pg.loadedDepartingRoutes !== pg.inputStop) &&
          setTimeout(pg.fLoadDepartingRoutes, 10);
      else if (pg.transport === "plan") {
        typeof mobile == "undefined" &&
          (($("plan") || {}).className = "active"),
          pg.loadedPlannerParams !== pg.inputStart + "/" + pg.inputFinish &&
            setTimeout(pg.fLoadPlannerTab, 10);
        var f = "" + (($("inputTime") || {}).value || "");
        f.trim() === "" &&
          ((f = ti.dateToMinutes(new Date()) % 1440),
          (($("inputTime") || {}).value = ti.printTime(f)));
      } else if (
        !pg.loadedRoutesHash ||
        pg.loadedRoutesHash.indexOf(pg.city + "/" + pg.transport + "/") != 0
      )
        ((
          $("inputRoutes") || {
            style: {},
          }
        ).style.display = (
          $("labelInputRoutes") || {
            style: {},
          }
        ).style.display =
          pg.transport == "litexpo" ||
          pg.transport == "beach" ||
          pg.transport == "cemetery" ||
          pg.transport == "cemetary" ||
          pg.transport == "vilniusfest" ||
          pg.transport == "christmastrain"
            ? "none"
            : "block"),
          ((
            $("divBeachRoutes") || {
              style: {},
            }
          ).style.display = pg.transport == "beach" ? "block" : "none"),
          pg.transport == "beach" &&
            !($("imgBeaches") || {}).src &&
            (($("imgBeaches") || {}).src = "images/vilnius_beaches.png"),
          ((
            $("divCemeteryRoutes") || {
              style: {},
            }
          ).style.display =
            pg.transport == "cemetery" || pg.transport == "cemetary"
              ? "block"
              : "none"),
          pg.transport == "cemetery" &&
            !($("imgCemetery") || {}).src &&
            (($("imgCemetery") || {}).src = "images/vilnius_cemetery.png"),
          ((
            $("divChristmasTrain") || {
              style: {},
            }
          ).style.display =
            pg.transport == "christmastrain" ? "block" : "none"),
          pg.transport == "christmastrain" &&
            !($("imgChristmasTrain") || {}).src &&
            (($("imgChristmasTrain") || {}).src =
              "images/vilnius_christmas_train.png"),
          pg.transport == "christmastrain" &&
            !($("imgChristmasTimetable") || {}).src &&
            (($("imgChristmasTimetable") || {}).src =
              "images/vilnius_christmas_timetable.png"),
          ((
            $("divFestalRoutes") || {
              style: {},
            }
          ).style.display = pg.transport == "vilniusfest" ? "block" : "none"),
          (($("inputRoutes") || {}).value = pg.routesFilter = ""),
          pg.inputRoutes_Blur(),
          pg.fLoadRoutesList();
      ((
        $("divContentRoutes") || {
          style: {},
        }
      ).style.display =
        pg.transport === "stop" ||
        pg.transport === "plan" ||
        pg.transport === "favourites" ||
        pg.transport === "contacts" ||
        pg.transport === "help"
          ? "none"
          : "block"),
        ((
          $("divContentDepartingRoutes") || {
            style: {},
          }
        ).style.display = pg.transport === "stop" ? "block" : "none"),
        ((
          $("divContentPlanner") || {
            style: {},
          }
        ).style.display = pg.transport === "plan" ? "block" : "none");
    }
  }),
  (pg.footerHTML = function () {
    var a = ['<div class="footer-info">'],
      b = cfg.cities[pg.city].footer;
    (b = b && (b[pg.language] || b.en)), b && a.push(b);
    if (!cfg.isMobilePage) {
      cfg.programmedBy &&
        a.push(
          '<p id="programmedBy" class="smalltext graytext">' +
            (cfg.programmedBy[pg.language] || cfg.programmedBy.en || "") +
            "</p>"
        );
      var c = cfg.cities[cfg.defaultCity].webcounter;
      c &&
        (a.push(
          '<a id="webcounter" href="http://whos.amung.us/stats/' +
            c +
            '" target="_blank" style="float:right; position:relative; bottom:20px; padding:10px;">'
        ),
        a.push(
          '<img width="80" height="15" border="0" title="web tracker" alt="web tracker" src="//whos.amung.us/swidget/' +
            c +
            '.gif"></a>'
        ));
    }
    a.push("</div>");
    return a.join("");
  }),
  (pg.fLoadRoutesList = function (a) {
    if (typeof mobile == "undefined" || typeof a != "undefined") {
      var b = $("divContentRoutesResults");
      if (typeof ti.routes !== "object") {
        (pg.loadedRoutesHash = ""),
          ((b || {}).innerHTML = "<br/>" + i18n.receivingData),
          typeof mobile !== "object" &&
            setTimeout(function () {
              pg.fLoadRoutesList(a);
            }, 200);
        return;
      }
      var c =
        $("inputRoutes") &&
        ($("inputRoutes").className == "empty"
          ? ""
          : ti.toAscii($("inputRoutes").value, 2));
      if (c && pg.routesFilter != c) {
        (pg.routesFilter = c),
          setTimeout(function () {
            pg.fLoadRoutesList(a);
          }, 200);
        return;
      }
      pg.routesFilter = c;
      if (
        pg.loadedRoutesHash == pg.city + "/" + pg.transport + "/" + c &&
        typeof mobile == "undefined" &&
        pg.transport != "favourites" &&
        pg.transport != "home"
      )
        return;
      pg.loadedRoutesHash = pg.city + "/" + pg.transport + "/" + c;
      if (pg.transport == "vilniusfest") {
        var d =
            '<tr class="white"><td colspan="3"><span class="icon icon_vilniusfest"></span>&nbsp;<span id="spanFestalRoutes">Jaunas kaip Vilnius</span></td><td style="width:100%;"></td></tr>',
          e = [
            "Jaunas kaip Vilnius",
            {
              name: "Vingio parkas (Savanori&uogon; &zcaron;iedo kryptis)",
              id: "0609",
            },
            {
              name: "Vingio parkas (Centro kryptis)",
              id: "0610",
            },
            "Gerosios Vilties",
            "Latviu",
          ];
        for (var f = 0; f < e.length; f++) {
          var g;
          typeof e[f] == "object"
            ? ((g = []), g.push(e[f]))
            : (g = ti.fGetStopsByName(e[f])),
            g.length ||
              (g = [
                {
                  name: e[f],
                  id: 0,
                },
              ]);
          if (g.length) {
            var h = g[0],
              i = ti.fGetRoutesAtStop(h.id, !1),
              j = i[0];
            (d += "<tr" + (f % 2 ? ' class="white"' : "") + "><td>"),
              typeof j == "object"
                ? ((d += '<a href="#vilniusfest/' + j.stopId + "/map"),
                  (d +=
                    '"><span class="icon icon_map" title="' +
                    i18n.showInMap +
                    '"></span>'),
                  (d += i18n.stop + " <b>" + h.name + "</b></a>"))
                : (d += i18n.stop + " <b>" + h.name + "</b>"),
              (d += "</td><td>");
            var k = {},
              l = null;
            for (var m = 0; m < i.length; m++) {
              var n = i[m];
              if (n.transport == "nightbus") continue;
              n.num == "157" && (i[m].numHTML = n.name),
                n.num.indexOf("(") <= 0,
                (n.numHTML = n.numHTML.split("(")[0].trim());
              var o = ti.toAscii(
                [n.city, n.transport, n.numHTML].join(","),
                !0
              );
              if (k[o]) continue;
              var p = {
                city: n.city,
                transport: n.transport,
                num: ti.toAscii(n.num, !0),
                dirType: n.dirType,
                stopId: n.stopId,
              };
              k[o] = p;
              var q = pg.fUrlSet(
                {
                  schedule: p,
                },
                !0
              );
              l !== n.transport &&
                ((l = n.transport),
                (d +=
                  ' <span class="icon icon_narrow icon_' +
                  n.transport +
                  '" data-transport="' +
                  n.transport +
                  '"></span>&nbsp;'));
              var r =
                '<a class="hover transfer' +
                l +
                '" href="#' +
                q +
                '/map" title="' +
                (n.name || "").replace(/"/g, "") +
                '">' +
                i[m].numHTML.replace(/\s/g, "&nbsp;") +
                "</a> ";
              d += r;
            }
            (d += '<span style="display:inline-block; width:2px;"></span>'),
              (d +=
                '</td><td><a href="#plan//' +
                h.id +
                '" class="hover">&nbsp;&nbsp;<span class="icon icon_plan"></span>' +
                i18n.planRoute +
                "</a></td>"),
              (d += '<td style="width:100%;"></td></tr>');
          }
        }
        (d +=
          '<tr class="white"><td colspan="3"><a target="_blank" href="images/vilnius_fest_map.png?2024-07-25a"><img id="imgFestalRoutes" src="images/vilnius_fest_map.png?2024-07-25a" style="margin-left:-8px;" width="900px;"></a></td><td style="width:100%;"></td>'),
          (($("divFestalRoutes") || {}).innerHTML = d),
          (($("divContentRoutesResults") || {}).innerHTML = "");
        return;
      }
      if (pg.transport == "schools") {
        var d = pg.fMakeSchoolsHTML(c);
        (d =
          '<table id="tblRoutes" width="100%" cellpadding="0" cellspacing="0"><tbody>' +
          d),
          (d += "</tbody></table>"),
          pg.replaceHtml($("divContentRoutesResults"), d);
        return;
      }
      if (pg.transport == "xxxvilniusfest") {
        var d = pg.fMakeFestRoutesHTML(c);
        (d =
          '<table id="tblRoutes" width="100%" cellpadding="0" cellspacing="0"><tbody><tr class="white"><td colspan="3"><span class="icon icon_vilniusfest"></span>&nbsp;<span id="spanFestalRoutes"><b>Dainų šventė</b></span></td><td style="width:100%;"></td></tr>' +
          d),
          (d += "</tbody></table>"),
          pg.replaceHtml($("divFestalRoutes"), d),
          pg.replaceHtml($("divContentRoutesResults"), "");
        return;
      }
      var s = ti.fGetRoutes(
        pg.city,
        pg.transport,
        null,
        null,
        null,
        c || (cfg.city.showAllDirections ? "*" : "")
      );
      a && a(s);
      if (
        pg.transport &&
        "beach;cemetery;cemetary;vilniusfest;christmastrain;".indexOf(
          ";" + pg.transport + ";"
        ) >= 0
      ) {
        (b || {}).innerHTML = "";
        return;
      }
      if (!s || !s.length) {
        (b || {}).innerHTML = "<br/>&nbsp;" + i18n.noRoutesFound;
        return;
      }
      var t = function (a, b, c) {
          (a += ""), (b += "");
          if (b.length <= 0) return a.length + 1;
          var d = 0,
            e = 0,
            f = c ? 1 : b.length;
          while (!0) {
            e = a.indexOf(b, e);
            if (e < 0) break;
            ++d, (e += f);
          }
          return d;
        },
        u = function () {
          var a = [];
          pg.transport == "litexpo" &&
            a.push(
              '<p style="margin:2px;">Tiesioginiai mar&scaron;rutai &iogon; Vakcinacijos centr&aogon; Litexpo:</p>'
            ),
            a.push(
              '<table id="tblRoutes" width="100%" cellpadding="0" cellspacing="0"><tbody>'
            );
          for (var b = 0; b < s.length; b++) {
            if (ti.missing_trips) {
              var c =
                  "\n" + (s[b].transport == "trol" ? "t" : "") + s[b].num + "-",
                d = t(ti.missing_trips, c);
              d && (s[b].missing_trips = d);
            }
            a.push(pg.fMakeRouteRowHTML(s[b], "tblRoutes", b));
          }
          a.push("</tbody></table>"),
            pg.transport == "litexpo"
              ? a.push(
                  '<a id="aToLitexpo" style="display:block; margin:12px 28px;" href="#plan//1604,1603"><span class="icon icon_plan"></span><span id="spanToLitexpo" class="hover">Planuoti mar&scaron;rut&aogon; &iogon; Vakcinacijos centr&aogon; Litexpo</span></a>'
                )
              : pg.transport == "commercialbus" &&
                cfg.defaultCity === "vilnius" &&
                new Date().getMonth() == 1
              ? ((
                  $("divBookFairTimetable") || {
                    style: {},
                  }
                ).style.display = "block")
              : (((
                  $("divBookFairTimetable") || {
                    style: {},
                  }
                ).style.display = "none"),
                a.push("<br/>" + pg.footerHTML())),
            pg.replaceHtml($("divContentRoutesResults"), a.join(""));
        };
      if (pg.browserVersion <= 8 && s.length > 25 && !c) {
        ((b || {}).innerHTML = "<br/>" + i18n.loading), setTimeout(u, 100);
        return;
      }
      u();
    }
  }),
  (pg.fLoadDepartingRoutes = function (a, b) {
    (pg.loadedDepartingRoutes = null),
      pg.realTimeDepartures.timer &&
        a &&
        (clearTimeout(pg.realTimeDepartures.timer),
        (pg.realTimeDepartures.timer = 0));
    var c = $("divContentDepartingRoutesResults");
    pg.inputStop &&
      pg.stopsByIP &&
      pg.inputStop.indexOf("192.168.") >= 0 &&
      cfg.city.defaultTransport == "tablo" &&
      ((pg.IP = pg.inputStop),
      (pg.tablo = pg.stopsByIP[pg.IP] || {
        stops: "unknown",
      }),
      (pg.inputStop = pg.tablo.stops),
      reloadTabloContent());
    var d = ti.fGetAnyStopDetails(pg.inputStop);
    if (a) var e = [];
    if (cfg.city.defaultTransport != "tablo")
      if (d.id)
        $("inputStop") &&
          (($("inputStop").value = pg.inputStopText = d.name || ""),
          ($("inputStop").className = "")),
          pg.startStop || (pg.startStop = pg.inputStop);
      else if (c && !pg.inputStop && typeof ti.stops == "object") {
        var f = pg.fUrlSet(
          {
            hashForMap: "map",
          },
          !0
        );
        ($("divContentDepartingRoutesHeader").style.display = "none"),
          ((c || {}).innerHTML = (
            '<p class="help">' +
            i18n.searchDeparturesHelp +
            '<p/><p class="help">' +
            i18n.tripPlannerHelpMap
          ).replace(/<a>/g, '<a class="underlined map" href="#' + f + '">')),
          document.activeElement &&
            document.activeElement.id !== "inputStop" &&
            (($("inputStop").value = i18n.startStop),
            ($("inputStop").className = "empty"),
            setTimeout(function () {
              try {
                $("inputStop").focus();
              } catch (a) {}
            }, 100));
        return;
      }
    if (typeof ti.routes !== "object" || typeof ti.stops !== "object")
      cfg.city.defaultTransport != "tablo" &&
        ((c || {}).innerHTML = "<br/>" + i18n.receivingData),
        setTimeout(function () {
          pg.fLoadDepartingRoutes(a, b);
        }, 200);
    else {
      (pg.loadedDepartingRoutes = pg.inputStop),
        (pg.stopsSuggestedForText = d.name);
      if (cfg.city.defaultTransport == "tablo")
        (($("spanContentDepartingRoutesStop") || {}).className =
          d.info.indexOf("P") != -1 ? "hand" : ""),
          (d.name = (d.name || "").replace(
            "Mikalojaus Konstantino",
            "Mikalojaus K."
          )),
          (($("spanContentDepartingRoutesStop") || {}).innerHTML = d.name),
          d.name.length >= 27 &&
            ((
              $("spanContentDepartingRoutesStop") || {
                style: {},
              }
            ).style.fontSize = d.name.length >= 30 ? "50px" : "54px"),
          (($("spanDepartureDate") || {}).innerHTML = ti.printTime(
            ti.dateToMinutes(new Date())
          ));
      else {
        var g =
          (d.street ? ", " + d.street : "") +
          (d.area && !cfg.cities[pg.city].skipStopArea ? ", " + d.area : "") +
          (d.city && !cfg.cities[pg.city].skipStopCity ? ", " + d.city : "");
        d[cfg.cities[pg.city].stopFareZone || "noFareZone"] &&
          (g +=
            ", " + i18n.fareZone + " " + d[cfg.cities[pg.city].stopFareZone]),
          (g =
            g.length > 0
              ? '<span class="details"> (' + g.substring(2) + ")</span>"
              : "");
        var h = [],
          f = pg.fUrlSet(
            {
              hashForMap: "map",
            },
            !0
          ),
          i = (pg.transfers = ti.fGetRoutesAtStop(pg.inputStop, !1)),
          j = {},
          k = null,
          h = [];
        for (var l = 0; l < i.length; l++) {
          var m = i[l];
          if (m.num.indexOf("(") > 0) continue;
          (m.num = m.num.split("(")[0].trim()),
            (m.numHTML = m.numHTML.split("(")[0].trim());
          var n = ti.toAscii([m.city, m.transport, m.num].join(","), !0);
          if (j[n]) continue;
          var o = {
            city: m.city,
            transport: m.transport,
            num: ti.toAscii(m.num, !0),
            dirType: m.dirType,
            stopId: m.stopId,
          };
          j[n] = o;
          var p = pg.fUrlSet(
            {
              schedule: o,
            },
            !0
          );
          k !== m.transport &&
            ((k = m.transport),
            h.push(
              ' <span class="icon icon_narrow icon_' +
                m.transport +
                '" data-transport="' +
                m.transport +
                '"></span>&nbsp;'
            ));
          var q =
            '<a class="hover transfer' +
            k +
            '" href="#' +
            p +
            '" title="' +
            (m.name || "").replace(/"/g, "") +
            '">' +
            i[l].numHTML.replace(/\s/g, "&nbsp;") +
            "</a> ";
          h.push(q);
        }
        h.push('<span style="display:inline-block; width:2px;"></span>'),
          (($("spanContentDepartingRoutesStop") || {}).innerHTML =
            '<a href="#' +
            f +
            '" class="icon icon_map" title="' +
            i18n.showInMap +
            '"></a>' +
            i18n.stop +
            " <strong>" +
            d.name +
            "</strong>" +
            g +
            h.join("") +
            "<br />");
      }
      h = [];
      var r = new Date(),
        s = -1;
      typeof mobile != "undefined" && typeof b != "undefined"
        ? (s = b)
        : $("inputDepartureDate") && (s = +$("inputDepartureDate").value);
      var t = {
        start_stops: pg.inputStop,
        finish_stops: "",
        transport: {},
      };
      typeof pg.tablo == "object" &&
        (cfg.defaultCity == "riga" && (pg.tablo.stops = pg.inputStop),
        (t.start_stops = pg.tablo.stops || pg.inputStop || "unknown")),
        s < 0
          ? ((t.date = r), (startTime = ti.dateToMinutes(r) % 1440))
          : ((t.date = new Date(
              r.getFullYear(),
              r.getMonth(),
              r.getDate() + s
            )),
            (startTime = -1));
      var u = dijkstra(
        t,
        cfg.city.defaultTransport == "tablo" || typeof mobile != "undefined"
          ? startTime
          : 0 * startTime,
        0
      );
      if (cfg.city.urlVehicleDepartures && s < 0) {
        c &&
          (($("divContentDepartingRoutesHeader").style.display = ""),
          ((c || {}).innerHTML = "<br/>" + i18n.loading)),
          (pg.departuresBySchedule = u),
          pg.fProcessVehicleDepartures(null, a);
        if (cfg.city.defaultTransport != "tablo") return;
      }
      if (!u || !u.length) {
        ((
          $("divContentDepartingRoutesHeader") || {
            style: {},
          }
        ).style.display = ""),
          ((c || {}).innerHTML = "<br/>" + i18n.noDepartingRoutes),
          a && a([]);
        return;
      }
      h.push(
        '<table id="tblDepartingRoutes" class="routes-list" cellpadding="0" cellspacing="0"><tbody>'
      );
      var v = {};
      for (var w = 0; w < u.length; w++) {
        var m = u[w].route,
          x = ti.toAscii(
            m.city +
              ";" +
              m.transport +
              ";" +
              m.num +
              ";" +
              m.name +
              ";" +
              m.stopId,
            !0
          ),
          y = {
            departure: u[w].start_time,
            bLowFloorVehicle: u[w].bLowFloorVehicle,
          };
        if (x in v) {
          var z = v[x];
          u[z].route.departures.push(u[w].start_time),
            u[z].route.tripNums.push(u[w].tripNum),
            u[z].route.vehicles.push(y);
        } else
          (v[x] = w),
            (u[w].route.departures = [u[w].start_time]),
            (u[w].route.tripNums = [u[w].tripNum]),
            (u[w].route.vehicles = [y]);
      }
      for (var w = 0, z = 0; w < u.length; w++)
        u[w].route.departures &&
          (u[w].route.departures.sort(function (a, b) {
            if (a < b) return -1;
            if (a > b) return 1;
            return 0;
          }),
          u[w].route.vehicles.sort(function (a, b) {
            if (a.departure < b.departure) return -1;
            if (a.departure > b.departure) return 1;
            return 0;
          }),
          u[w].route.departures[0] < 0 && u[w].route.num.indexOf("(") >= 0
            ? (w = w)
            : (a
                ? e.push(
                    pg.fMakeRouteRowHTML(
                      u[w].route,
                      "tblDepartingRoutes",
                      z,
                      startTime,
                      !0,
                      d.id
                    )
                  )
                : h.push(
                    pg.fMakeRouteRowHTML(
                      u[w].route,
                      "tblDepartingRoutes",
                      z,
                      startTime,
                      !1,
                      d.id
                    )
                  ),
              ++z));
      if (cfg.city.defaultTransport == "tablo") {
        pg.realTimeData &&
          ((pg.realTimeData = ""),
          (pg.realTimeDataStop = ""),
          pg.realTimeDepartures.timer2 &&
            (clearTimeout(pg.realTimeDepartures.timer2),
            (pg.realTimeDepartures.timer2 = setTimeout(function () {
              (pg.realTimeDepartures.timer2 = 0), pg.fLoadDepartingRoutes();
            }, 15e3)))),
          pg.fMakeTabloHTML(u);
        return;
      }
      c &&
        (((c || {}).innerHTML = h.join("") + "</tbody></table>"),
        ($("divContentDepartingRoutesHeader").style.display = "")),
        a && a(e);
    }
  }),
  (pg.fMakeSchoolsHTML = function (a, b) {
    a = ti.toAscii("" + a, 2);
    var c = ti.wordSeparators,
      d = "";
    for (var e = 0; e < ti.schools.length; e++) {
      var f = ti.schools[e];
      if (a) {
        var g = ti.toAscii(f[1], 2);
        while (g) {
          var h = g.indexOf(a);
          h == -1 && (g = "");
          if (
            h > 0 &&
            c.indexOf(g.charAt(h - 1)) < 0 &&
            c.indexOf(a.charAt(0)) < 0
          )
            (g = g.substring(h + 1)), (h = -1);
          else break;
        }
        if (!g) continue;
      }
      b
        ? ((d +=
            '<tr style="border-top: 1px solid #e0e0e0;"><td class="routeName">'),
          (d += '<a onclick="pg.MapShowMarker(' + f[4] + "," + f[3] + ')">'))
        : ((d += "<tr" + (e % 2 ? ' class="white"' : "")),
          (d +=
            '><td class="routeName"><a href="#schools/' +
            f[4] +
            ";" +
            f[3] +
            '/map">')),
        (d +=
          '<span class="icon icon_map" title="' + i18n.showInMap + '"></span>'),
        (d +=
          f[1] +
          "</a></td>" +
          (b ? '<tr></tr><td style="padding-left:24px;">' : "<td>"));
      var i = f[5];
      if (i.length) {
        var j = ti.fGetRoutesAtStop(i, !1),
          k = {},
          l = null;
        for (var m = 0; m < j.length; m++) {
          var n = j[m];
          n.num == "157" && (j[m].numHTML = n.name),
            n.num.indexOf("(") <= 0,
            (n.num = n.num.split("(")[0].trim()),
            (n.numHTML = n.numHTML.split("(")[0].trim());
          var o = ti.toAscii([n.city, n.transport, n.num].join(","), !0);
          if (k[o] || n.transport == "nightbus") continue;
          var p = {
            city: n.city,
            transport: n.transport,
            num: ti.toAscii(n.num, !0),
            dirType: n.dirType,
            stopId: n.stopId,
          };
          k[o] = p;
          var q = pg.fUrlSet(
            {
              schedule: p,
            },
            !0
          );
          l !== n.transport &&
            ((l = n.transport),
            (d +=
              ' <span class="icon icon_narrow icon_' +
              n.transport +
              '" data-transport="' +
              n.transport +
              '"></span>&nbsp;'));
          var r =
            '<a class="hover transfer' +
            l +
            '" href="#' +
            q +
            '/map" title="' +
            (n.name || "").replace(/"/g, "") +
            '">' +
            j[m].numHTML.replace(/\s/g, "&nbsp;") +
            "</a> ";
          d += r;
        }
        d += '<span style="display:inline-block; width:2px;"></span>';
      }
      (d +=
        "</td>" + (b ? '<tr></tr><td style="padding-left:24px;">' : "<td>")),
        (d += '<a href="#plan//' + f[4] + ";" + f[3] + '" class="hover">'),
        (d +=
          (b ? "" : "&nbsp;&nbsp;") +
          '<span class="icon icon_plan"></span>' +
          i18n.planRoute +
          "</a></td>"),
        b || (d += '<td style="width:100%;"></td>'),
        (d += "</tr>");
    }
    return d;
  }),
  (pg.fMakeFestRoutesHTML = function (a, b) {
    a = ti.toAscii("" + a, 2);
    var c = ti.wordSeparators,
      d = "";
    for (var e = 0; e < ti.fests.length; e++) {
      var f = ti.fests[e];
      if (a) {
        var g = ti.toAscii(f[1], 2);
        while (g) {
          var h = g.indexOf(a);
          h == -1 && (g = "");
          if (
            h > 0 &&
            c.indexOf(g.charAt(h - 1)) < 0 &&
            c.indexOf(a.charAt(0)) < 0
          )
            (g = g.substring(h + 1)), (h = -1);
          else break;
        }
        if (!g) continue;
      }
      b
        ? ((d +=
            '<tr style="border-top: 1px solid #e0e0e0;"><td class="routeName">'),
          (d += '<a onclick="pg.MapShowMarker(' + f[4] + "," + f[3] + ')">'))
        : ((d += "<tr" + (e % 2 ? ' class="white"' : "")),
          (d +=
            '><td class="routeName"><a href="#vilniusfest/' +
            f[4] +
            ";" +
            f[3] +
            '/map">')),
        (d +=
          '<span class="icon icon_map" title="' + i18n.showInMap + '"></span>'),
        (d +=
          f[1] +
          "</a></td>" +
          (b ? '<tr></tr><td style="padding-left:24px;">' : "<td>"));
      var i = {
          date: new Date(f[6]),
          start_stops: f[5],
          finish_stops: "",
          transport: {},
        },
        j = dijkstra(i, 1290, 0);
      if (j.length) {
        var k = {},
          l = null;
        for (var m = 0; m < j.length; m++) {
          if (j[m].start_time > 1620) continue;
          var n = j[m].route;
          n.num == "xxx157" && (m = m), n.num.indexOf("(") <= 0;
          if (
            n.num.indexOf("R") < 0 &&
            "0530e,0530h,0530j,1301,1302,1303".indexOf(n.stopId) >= 0
          )
            continue;
          var o = {
            city: n.city,
            transport: n.transport,
            num: ti.toAscii(n.num, !0),
            dirType: n.dirType,
            stopId: n.stopId,
          };
          (n.num = n.num.split("(")[0].trim()),
            (n.numHTML = n.numHTML.split("(")[0].trim());
          var p = ti.toAscii([n.city, n.transport, n.num].join(","), !0);
          if (k[p] || n.transport == "nightbus") continue;
          k[p] = o;
          var q = pg.fUrlSet(
            {
              schedule: o,
            },
            !0
          );
          l !== n.transport &&
            ((l = n.transport),
            (d +=
              ' <span class="icon icon_narrow icon_' +
              n.transport +
              '" data-transport="' +
              n.transport +
              '"></span>&nbsp;'));
          var r =
            '<a class="hover transfer' +
            l +
            '" href="#' +
            q +
            '/map" title="' +
            (n.name || "").replace(/"/g, "") +
            '">' +
            n.numHTML.replace(/\s/g, "&nbsp;") +
            "</a> ";
          d += r;
        }
        d += '<span style="display:inline-block; width:2px;"></span>';
      }
      (d +=
        "</td>" + (b ? '<tr></tr><td style="padding-left:24px;">' : "<td>")),
        (d += '<a href="#plan//' + f[4] + ";" + f[3] + '" class="hover">'),
        (d +=
          (b ? "" : "&nbsp;&nbsp;") +
          '<span class="icon icon_plan"></span>' +
          i18n.planRoute +
          "</a></td>"),
        b || (d += '<td style="width:100%;"></td>'),
        (d += "</tr>");
    }
    return d;
  }),
  (pg.fMakeTabloHTML = function (a) {
    if (pg.inputStop == "unknown")
      setTimeout(function () {
        location.reload(!0);
      }, 3e4),
        ($("divContentDepartingRoutes").innerHTML =
          '<p style="font-size:96px; padding-top:128px; text-align:center; text-transform:none;">Vyksta sistemos derinimo<br />darbai</p>' +
          (cfg.defaultCity != "vilnius"
            ? ""
            : '<div style="position:absolute; bottom:20px; right:20px; color:#606060; font-size:34px; text-transform:none;"><img src="' +
              pg.imagesFolder +
              'sisp_logo.png" /><br />www.vilniustransport.lt</div>'));
    else {
      var b = [];
      pg.departuresBySchedule &&
        pg.departuresBySchedule.sort(function (a, b) {
          return a.start_time - b.start_time;
        }),
        a.sort(function (a, b) {
          return a.start_time - b.start_time;
        });
      var c = 0,
        d,
        e = new Date(),
        f = (e.getTime() - e.setHours(10, 0, 0, 0)) / 1e3 + 36e3;
      (f /= 60), f < 240 && (f += 1440);
      if (pg.realTimeData) {
        if (pg.departuresBySchedule && pg.departuresBySchedule.length) {
          var g = pg.departuresBySchedule.slice(0);
          for (c = 0, d = -1; c < pg.departuresBySchedule.length; c++)
            (g[c].bySchedule = !0), d < 0 && g[c].start_time >= f && (d = c);
          d < 0 ? (g = []) : d > 0 && (g = g.slice(d));
          var h = f;
          a && a.length ? (h = a[0].start_time || h) : (a = []),
            (h += h % 1440 < 240 ? 30 : 60),
            g.length && h < g[0].start_time && a.push.apply(a, g);
        }
      } else c = c + 0;
      for (var c = a.length; --c >= 0; ) {
        var i = a[c].route;
        if (i.vehicles)
          for (var d = i.vehicles.length; --d >= 0; )
            b.push({
              route: i,
              start_time: i.vehicles[d].departure,
              vehicleID: i.vehicles[d].vehicleID,
              departure_data: i.vehicles[d],
              bySchedule: a[c].bySchedule,
            });
      }
      b.sort(function (a, b) {
        if (a.start_time < b.start_time) return -1;
        if (a.start_time > b.start_time) return 1;
        return ti.naturalSort(a.route.num, b.route.num);
      });
      var j;
      for (j = 0; j < (cfg.defaultCity == "vilnius" ? 6 : 9); ) {
        var k = {},
          l = !1;
        for (var c = 0; c < b.length; c++) {
          var m = b[c];
          if (l && m.bySchedule) break;
          var i = m.route,
            n = ti.toAscii(i.city + ";" + i.transport + ";" + i.num + ";", !0),
            o,
            p = i.destination || i.name,
            q = ["–", "—", "- ", " -", "-"];
          if (cfg.defaultCity != "tallinna-linn" || !pg.realTimeData)
            for (var r = 0; r < q.length; ++r) {
              d = p.lastIndexOf(q[r]);
              if (d >= 3) {
                p = p.substring(d + 1).trim();
                if (q[r + 1] == "-") break;
              }
            }
          cfg.defaultCity != "vilnius" &&
            p.toLowerCase().slice(-10) == "oro uostas" &&
            (p =
              'oro uostas&nbsp;&nbsp;&nbsp;<img style="vertical-align: baseline;" height="52" width="52" src="images/airport_blue_52.png" />'),
            cfg.defaultCity != "vilnius" &&
              m.departure_data.bBicycle &&
              (p +=
                '&nbsp;&nbsp;<img style="vertical-align: baseline;" height="52" width="72" src="images/bicycle_blue_52.png" />');
          if (m.html || m.start_time < 0) continue;
          var s = f;
          f < 240 && m.start_time >= 720 && (s = f + 1440);
          if (!pg.realTimeData && m.start_time <= s) continue;
          if (m.start_time <= s - 0.5) continue;
          if (cfg.defaultCity == "klaipeda" && m.start_time <= s + 0.5)
            continue;
          pg.realTimeData && (c = c + 1 - 1);
          if (cfg.defaultCity == "tallinna-linn") {
            if (";tram;trol;bus;".indexOf(";" + i.transport + ";") < 0)
              continue;
            (o = ti.fGetStopDetails(m.route.stopId)),
              (n = n + ";" + p + ";" + ti.toAscii(o.name, !0) + ";");
            if (k[n]) {
              var t;
              m.start_time == 999999
                ? (t = "")
                : m.start_time < s + 60 && pg.realTimeData
                ? (t = Math.floor(m.start_time - s + 0.5) + " min")
                : (t = ti.printTime(Math.floor(m.start_time + 0.5)));
              var u = k[n];
              u.html = (u.html || "").replace("%1", t);
              continue;
            }
          } else if (k[n]) continue;
          (k[n] = m), (l = !0);
          var v = !1,
            w = "",
            x = "",
            y = "",
            z = "",
            A = "",
            B = i.numHTML,
            C = i.transport,
            D = m.departure_data.passengers;
          D >= 0 && m.departure_data.capacity > 0
            ? ((D = +((D * 100) / m.departure_data.capacity)),
              D > 10
                ? D > 40
                  ? D > 70
                    ? (D = 3)
                    : (D = 2)
                  : (D = 1)
                : (D = 0),
              (A = '<div class="passengers' + D + '"></div>'))
            : (D = -1),
            window.location.href.indexOf("test") < 0 && (A = "");
          if (cfg.defaultCity == "vilnius") {
            var E = "",
              F = 0;
            m.departure_data.bLowFloorVehicle && ++F,
              m.departure_data.bCoolVehicle && ++F,
              A && ++F,
              m.departure_data.bBicycle && ++F,
              m.departure_data.bWifi && ++F,
              m.departure_data.bUsb && ++F;
            if (m.departure_data.bLowFloorVehicle) {
              if (F <= 5 || (pg.vehicleIconState & 1) == 0)
                E += '<div class="icon_wheelchair"></div>';
              (F += 10), (v = !1);
            }
            if (m.departure_data.bCoolVehicle) {
              if (F <= 14 || (pg.vehicleIconState & 1) == 0)
                E += '<div class="icon_snowflake"></div>';
              F += 10;
            }
            if (A) {
              if (F <= 23 || (pg.vehicleIconState & 1) == 0) E += A;
              F += 10;
            }
            if (m.departure_data.bBicycle)
              if (F < 30 || (pg.vehicleIconState & 1) == 1)
                (E += '<div class="icon_bicycle"></div>'), (F += 10);
            if (m.departure_data.bWifi)
              if (F < 30 || (pg.vehicleIconState & 1) == 1)
                (E += '<div class="icon_wifi"></div>'), (F += 10);
            if (m.departure_data.bUsb)
              if (F <= 30 || (pg.vehicleIconState & 1) == 1)
                E += '<div class="icon_usb"></div>';
            m.departure_data.bAirport == 1
              ? (p =
                  'oro uostas/<b style="font-size:40px;">airport</b><div style="display:inline-block;" class="icon_plane"></div>')
              : m.departure_data.bAirport == 2 &&
                (p =
                  'stotis<div style="display:inline-block;" class="icon_station"></div>'),
              (B += '</div><div id="divWindow"><div id="divTape"'),
              (B += ">" + E),
              (B += "</div></div>");
          } else
            (v = m.departure_data.bLowFloorVehicle),
              m.departure_data.bCoolVehicle &&
                (w = '<div class="snowflake"><img src="snowflake.png"></div>'),
              m.departure_data.bUsb &&
                (y = '<div class="usb"><img src="usb.png"></div>'),
              cfg.defaultCity == "klaipeda"
                ? (m.departure_data.bChristmasTree &&
                    (z =
                      '<div class="usb"><img src="christmastree.png"></div>'),
                  m.departure_data.bWifi &&
                    (x = '<div class="wifi"><img src="wifi.svg"></div>'),
                  m.departure_data.bElectrobus && (C = "electrobus"))
                : m.departure_data.bWifi &&
                  (w = '<div class="usb"><img src="wifi.png"></div>');
          (m.html =
            '<tr><td style="text-align: right; padding-left:18px;">' +
            (v && cfg.defaultCity == "riga"
              ? '<span class="icon_wheelchair_svg"></span>'
              : "") +
            '<span class="icon icon_' +
            C +
            '"></span></td><td style="position:relative; left:0;top:0;"><div class="num ' +
            i.transport +
            ' ">' +
            B +
            '</div></td><td class="name" style="position:relative; left:0;top:0;"><div>' +
            p +
            "</div>" +
            z +
            w +
            x +
            y +
            (v && cfg.defaultCity != "riga"
              ? '<div class="wheelchair">' +
                (cfg.defaultCity != "tallinna-linn"
                  ? '<img src="wheelchair.svg">'
                  : "") +
                "</div>"
              : "") +
            '</td><td class="time"><div>'),
            m.start_time == 999999
              ? (m.html += "---")
              : m.start_time < s + 60 && pg.realTimeData
              ? cfg.defaultCity == "klaipeda" && m.start_time < s + 1
                ? (m.html += "<1 min.")
                : (m.html +=
                    Math.floor(m.start_time - s + 0.5) +
                    " min" +
                    (cfg.defaultCity != "tallinna-linn" ? "." : "") +
                    (pg.realTimeData ? "" : "*"))
              : (m.html += ti.printTime(Math.floor(m.start_time + 0.5))),
            (m.html += "</div></td>");
          if (cfg.defaultCity == "tallinna-linn") {
            m.html += '<td><div class="next-departures">%1<br/>%1</div></td>';
            var o = ti.fGetStopDetails(m.route.stopId);
            m.html +=
              '<td><div class="white-circle">&nbsp;</div></td><td><div class="stop_name"><b>' +
              (o.name || "") +
              "</b><br/><i>" +
              (o.street || "") +
              "</i></div></td>";
          }
          m.html += "</tr>";
          if (cfg.defaultCity != "tallinna-linn")
            if (++j >= (cfg.defaultCity == "vilnius" ? 6 : 9)) break;
        }
        if (cfg.defaultCity == "tallinna-linn") break;
        if (!l) break;
      }
      var G =
        '<table id="tblDepartingRoutes" class="routes-list" cellpadding="0" cellspacing="0"><tbody><tr><th colspan="2">' +
        (i18n.route || "Maršrutas") +
        '</th><th class="name">' +
        (i18n.direction || "Kryptis") +
        '</th><th class="time">' +
        (i18n.time || "Laikas") +
        "</th></tr>";
      for (var c = 0, j = 0; c < b.length; c++)
        if (b[c].html) {
          (G += b[c].html.replace("%1", "&nbsp;").replace("%1", "&nbsp;")), ++j;
          if (cfg.defaultCity == "tallinna-linn" && j >= 1007) break;
        }
      if (cfg.defaultCity == "tallinna-linn" && j < 8) {
        (G +=
          '<tr class="bottom"><td rowspan="' +
          (8 - j).toString() +
          '" colspan="7"'),
          j > 4
            ? (G += "><div>")
            : (G +=
                ' class="phone"><div><span id="spanPhone1"></span><br/><span id="spanPhone2"></span><br/>'),
          (G += "transport.tallinn.ee</div></td></tr>");
        for (; ++j < 8; ) G += '<tr class="bottom"></tr>';
      }
      (G += "</tbody></table>"),
        (($("spanDepartureDate") || {}).innerHTML = ti.printTime(
          ti.dateToMinutes(new Date())
        )),
        (($("divContentDepartingRoutesResults") || {}).innerHTML = G),
        ((
          $("divContentDepartingRoutesHeader") || {
            style: {},
          }
        ).style.display = "");
      if (pg.tablo) {
        var H = new Date();
        if (
          pg.tablo.validFrom instanceof Date &&
          !isNaN(pg.tablo.validFrom.getTime()) &&
          (!pg.tablo.validTo ||
            (pg.tablo.validTo instanceof Date &&
              !isNaN(pg.tablo.validTo.getTime())))
        ) {
          if (
            !pg.tablo.validFrom ||
            H < pg.tablo.validFrom ||
            (pg.tablo.validTo && H > pg.tablo.validTo)
          )
            pg.tablo.message = !1;
        } else pg.tablo.message = !1;
        if (cfg.defaultCity != "klaipeda")
          if (
            pg.tablo.imageValidFrom instanceof Date &&
            !isNaN(pg.tablo.imageValidFrom.getTime()) &&
            (!pg.tablo.imageValidTo ||
              (pg.tablo.imageValidTo instanceof Date &&
                !isNaN(pg.tablo.imageValidTo.getTime())))
          ) {
            if (
              !pg.tablo.imageValidFrom ||
              H < pg.tablo.imageValidFrom ||
              (pg.tablo.imageValidTo && H > pg.tablo.imageValidTo)
            )
              pg.tablo.image = !1;
          } else pg.tablo.image = !1;
        ((
          $("TabloImage") || {
            style: {},
          }
        ).style.display = pg.tablo.image ? "block" : "none"),
          pg.tablo.image &&
            ((
              $("TabloImage") || {
                style: {},
              }
            ).style.backgroundImage =
              cfg.defaultCity == "vilnius" &&
              location.hostname.indexOf("stops.lt") < 0 &&
              window.location.hostname != "xxxlocalhost"
                ? 'url("http://192.168.14.14/Media/' + pg.tablo.image + '")'
                : 'url("Media/' + pg.tablo.image + '")'),
          ((
            $("divTabloMessagePanel") || {
              style: {},
            }
          ).style.display = pg.tablo.message ? "block" : "none"),
          ((
            $("divTabloMessage") || {
              style: {},
            }
          ).style.visibility = pg.tablo.message ? "visible" : "hidden");
      }
    }
  }),
  (pg.google_spreadsheet_JSON = function (a) {
    var b = JSON.parse(a),
      c = [],
      d = +new Date().setHours(0, 0, 0, 0);
    if (b && (b.values || []).length) {
      b = b.values;
      var e = b[0];
      for (var f = 1; f < b.length; f++) {
        var g = b[f],
          h = {};
        for (var i = 0; i < e.length; i++) {
          var j = e[i].toLowerCase();
          j = j.replace(/\s/g, "");
          var k = g[i] || "";
          k = k.trim();
          if (j == "from" || j == "until") {
            h[j + "Debug"] = k;
            var l = ti.parseISOLocal(k);
            (l = (l - d) / 6e4),
              l > 1440 &&
                j == "from" &&
                window.location.href.indexOf("test.html") >= 0 &&
                (l %= 1440),
              (h[j] = l);
          } else
            "stopnumber,bus,trol,tram".indexOf(j) < 0
              ? (h[j] = k)
              : (h[j] = k.replace(/\s|\n/g, ""));
        }
        c.push(h);
      }
    }
    return c;
  }),
  (pg.fProcessVehicleDepartures = function (a, b) {
    if (typeof mobile == "undefined" || typeof b != "undefined") {
      if (cfg.defaultCity == "tallinna-linn") {
        var c = new Date();
        if (+c - (pg.stop_closures_checked_time || 0) > 3e5) {
          (pg.stop_closures_checked_time = +c),
            ti.fDownloadUrl(
              "get",
              "https://transport.tallinn.ee/tabloconfig2021.php",
              function (c) {
                (pg.stop_closures = pg.google_spreadsheet_JSON(c)),
                  pg.fProcessVehicleDepartures(a, b);
              },
              !0
            );
          return;
        }
        if (
          (c >= new Date(2018, 1, 23, 19, 0) &&
            c <= new Date(2018, 1, 23, 23, 59)) ||
          (c >= new Date(2018, 1, 24, 7, 0) &&
            c <= new Date(2018, 1, 24, 14, 30))
        ) {
          pg.realTimeData = "";
          if (typeof b == "function") b([]);
          else {
            var d = $("divContentDepartingRoutesResults");
            (d || {}).innerHTML = "<br/>" + i18n.stopNoRealtimeDepartures;
          }
          return;
        }
      }
      if (pg.realTimeDepartures.timer) {
        clearTimeout(pg.realTimeDepartures.timer),
          (pg.realTimeDepartures.timer = 0);
        if (
          typeof mobile != "undefined" &&
          [
            "favourites",
            "schedule4",
            "schedule5",
            "stop",
            "index",
            "home",
          ].indexOf(mobile.current_page) == -1
        )
          return;
      }
      if (!cfg.city.urlVehicleDepartures) return;
      pg.realTimeDepartures.timer = setTimeout(
        function () {
          (pg.realTimeDepartures.timer = 0),
            pg.fProcessVehicleDepartures(null, b);
        },
        location.hostname == "xxxlocalhost"
          ? 1002999
          : pg.realTimeDataStop == "0114"
          ? 3e4
          : window.location.href.indexOf("tablo") > 0
          ? 3e3
          : 1e4
      );
      if (cfg.isApp && a && typeof a == "object") {
        b(a);
        return;
      }
      if (typeof a !== "string") {
        pg.realTimeDepartures.timer2 ||
          (pg.realTimeDepartures.timer2 = setTimeout(
            function () {
              (pg.realTimeDepartures.timer2 = 0), pg.fLoadDepartingRoutes();
            },
            location.hostname == "xxxlocalhost"
              ? 1014999
              : pg.realTimeData
              ? 9e5
              : 15e3
          ));
        if (
          (typeof mobile == "object" &&
            ["favourites", "index", "home"].indexOf(mobile.current_page) !=
              -1) ||
          (["favourites", "home", "schools"].indexOf(pg.transport) != -1 &&
            typeof pg.favouriteStops != "undefined")
        )
          var e = (pg.favouriteStops || "").split(",");
        else if (
          (typeof mobile == "object" || cfg.defaultCity == "tallinna-linn") &&
          pg.schedule &&
          pg.schedule.stopId
        ) {
          var e = [pg.schedule.stopId];
          if (pg.schedules) {
            e = [];
            for (var f in pg.schedules) {
              var g = pg.schedules[f];
              g && e.indexOf(g.stopId) == -1 && e.push(g.stopId);
            }
          }
        } else var e = (pg.inputStop || "").split(",");
        if (e.join(",").indexOf(";") != -1) return;
        pg.stopsBySiriID = {};
        if (
          cfg.defaultCity == "tallinna-linn" ||
          cfg.city.urlVehicleDepartures.indexOf("siri") >= 0
        )
          for (var h = 0; h < e.length; ++h) {
            var i = (ti.stops[e[h]] || {}).siriID || 0;
            i && ((pg.stopsBySiriID[i] = e[h]), (e[h] = i));
          }
        if (e && e.length == 1 && e[0] == "") return;
        (!pg.visibility || pg.visibility == "visible") &&
          ti.fDownloadUrl(
            "GET",
            cfg.city.urlVehicleDepartures +
              "?stopid=" +
              e.join(",") +
              "&time=" +
              +new Date(),
            function (a) {
              pg && pg.fProcessVehicleDepartures(a, b);
            },
            cfg.city.defaultTransport == "tablo" ? !0 : !1
          );
        return;
      }
      a &&
        pg.realTimeDepartures.timer2 &&
        (clearTimeout(pg.realTimeDepartures.timer2),
        (pg.realTimeDepartures.timer2 = 0));
      if (a && a.substring(0, 6) == "reload") {
        location.reload(!0);
        return;
      }
      (a = a || ""),
        !a &&
          pg.realTimeDataStop == pg.inputStop &&
          (a = pg.realTimeData || ""),
        (pg.realTimeData = a),
        (pg.realTimeDataStop = pg.inputStop);
      if (!a && cfg.city.defaultTransport == "tablo") return;
      cfg.city.defaultTransport == "tablo" &&
        ((pg.vehicleIconState = (pg.vehicleIconState || 0) + 1),
        pg.realTimeDataStop == "0114" && (pg.vehicleIconState = 0)),
        (a = a.split("\n"));
      if (pg.realTimeDepartures.$mapPopup)
        if (!pg.realTimeDepartures.mapStop)
          if (pg.realTimeDepartures.vehicleID) {
            var j = {};
            for (var h = 0; h < a.length; h++) {
              var k = a[h].trim().split(",");
              while (k[k.length - 1] == "") k.pop();
              if (k.length < 2) continue;
              var l =
                {
                  1: "trol",
                  3: "tram",
                  4: "minibus",
                }[k[0]] || "bus";
              j[l + ";" + k[3]] = {
                transport_number: k[0],
                route_number: k[1],
                direction_type: k[2].replace(/>/g, "-"),
                stops: k.slice(4),
              };
            }
            var m =
                j[
                  pg.realTimeDepartures.vehicleTransport +
                    ";" +
                    pg.realTimeDepartures.vehicleID
                ],
              n = "<br/>No data available";
            if (m) {
              n = [];
              for (var h = 0; h < m.stops.length - 1; h += 2)
                n.push(
                  ti.printTime((+m.stops[h + 1] + 30) / 60) +
                    '&nbsp;&nbsp;<a href="#stop/' +
                    m.stops[h] +
                    '/map">' +
                    ti.fGetStopDetails(m.stops[h]).name
                ) + "</a>";
              n = n.join("</br>");
            }
            var o = pg.realTimeDepartures.vehicleTransport,
              p = pg.realTimeDepartures.vehicleRouteNum,
              q = ti.fGetRoutes(
                cfg.defaultCity,
                o,
                p,
                m ? m.direction_type : !1
              ),
              r = "";
            q &&
              q.length &&
              q[0].name &&
              (r = "<strong>" + q[0].name + "</strong></br>");
            var s =
              '<div class="baloon_close"></div><div class="baloon_content"><span class="baloon_title"><span class="icon icon_' +
              o +
              '"></span><span class="num num3 ' +
              o +
              '">' +
              (p || "?") +
              "</span>" +
              pg.realTimeDepartures.vehicleID +
              "</span><br/>" +
              r +
              '<div style="padding:8px 20px 0 0; height:150px; overflow-y:auto; overflow-x:hidden;">' +
              n +
              "</div></div>";
          }
      if (
        (pg.transport == "stop" &&
          pg.loadedDepartingRoutes &&
          pg.loadedDepartingRoutes != null &&
          +(
            $("inputDepartureDate") || {
              value: 0,
            }
          ).value === -1) ||
        (cfg.city.defaultTransport == "tablo" && pg.loadedDepartingRoutes) ||
        (typeof mobile == "object" &&
          pg.schedule &&
          pg.schedule.stopId &&
          pg.loadedDepartingRoutes) ||
        (typeof mobile == "object" &&
          pg.loadedDepartingRoutes &&
          pg.transport === "stop" &&
          jQuery("#stop .nav-departures li.active").attr("data-departure") ==
            "-1") ||
        (typeof mobile == "object" &&
          mobile.current_page == "favourites" &&
          pg.loadedDepartingRoutes) ||
        (typeof mobile == "object" &&
          mobile.current_page == "index" &&
          pg.loadedDepartingRoutes) ||
        (typeof b == "function" &&
          pg.loadedDepartingRoutes &&
          (pg.schedule ||
            (["favourites", "home"].indexOf(pg.transport) != -1 &&
              typeof pg.favouriteStops != "undefined")))
      ) {
        var t = {},
          u = pg.loadedDepartingRoutes.split(",");
        for (var h = 0; h < u.length; ++h) t[u[h]] = !0;
        var v = [];
        v.push(
          '<table id="tblDepartingRoutes" class="routes-list" width="100%" cellpadding="0" cellspacing="0"><tbody>'
        );
        var w = {},
          x = [],
          y = ti.dateToMinutes(new Date(), !0) % 1440;
        y < 180 && cfg.defaultCity != "tallinna-linn" && (y += 1440);
        var z = 1e4,
          A = "nothing";
        for (var h = 0; h < a.length; h++) {
          var k = a[h].trim().split(","),
            B,
            C;
          if (h == 0 && k[0] !== "stop") {
            cfg.defaultCity === "tallinna-linn" &&
              k[4] &&
              !isNaN(k[4]) &&
              ((C = parseInt(k[4])), C >= 0 && (y = (C / 60) % 1440));
            continue;
          }
          if (k.length >= 2 && k[0] === "stop") {
            A = k[1];
            if (
              cfg.defaultCity != "tallinna-linn" &&
              cfg.city.urlVehicleDepartures.indexOf("siri") < 0
            ) {
              if (
                cfg.city.urlVehicleDepartures.indexOf("departures.txt") >= 0
              ) {
                if (t[A]) continue;
                for (; h < a.length - 1; h++)
                  if (a[h + 1].trim().indexOf("stop") >= 0) break;
              }
            } else A = pg.stopsBySiriID[A];
            continue;
          }
          if (k.length <= 3) continue;
          if (cfg.defaultCity === "tallinna-linn") {
            B = {
              city: cfg.defaultCity,
              transport: k[0],
              num: k[1],
              numHTML: k[1],
              name: k[4] || "",
              destination: k[4] || "",
            };
            var D = [B.city, B.transport, B.num.toLowerCase()].join("_");
            if (
              pg.good_siri_direction &&
              !pg.good_siri_direction(D, pg.transfers, B.destination)
            )
              continue;
            (C = +k[2]),
              z > C - y * 60 && (z = C - y * 60),
              (C = Math.floor(C / 60));
            for (var E = 0; E < pg.transfers.length; ++E)
              if (
                B.num === pg.transfers[E].num &&
                B.transport === pg.transfers[E].transport &&
                B.city === pg.transfers[E].city &&
                A === pg.transfers[E].stopId
              ) {
                var F = B.destination;
                (B = pg.transfers[E]), (B.destination = F);
                break;
              }
          } else {
            typeof ti.transportRoutes == "function" &&
              (k[0] = ti.transportRoutes(k[1], k[0]));
            if (
              cfg.defaultCity == "vilnius" &&
              k[0] == "bus" &&
              k[1].length &&
              k[1].charAt(k[1].length - 1).toLowerCase() == "n"
            )
              (k[0] = "nightbus"),
                cfg.city.defaultTransport == "tablo" &&
                  ((k[1] = k[1].substring(0, k[1].length - 1)), (B = null)),
                (B = (ti.fGetRoutes(
                  cfg.defaultCity,
                  k[0],
                  k[1].toUpperCase(),
                  k[2],
                  !0
                ) || [])[0]);
            else if (
              cfg.defaultCity != "vilnius" ||
              (k[1] || "").search(/1[5-9][0-9]/) < 0
            )
              if (
                cfg.defaultCity == "vilnius" &&
                (k[2] || "").match(/SU(.)MEN/i)
              )
                k[0] = "eventbus";
              else {
                B = (ti.fGetRoutes(
                  pg.city || cfg.defaultCity,
                  k[0],
                  k[1],
                  k[2],
                  !0
                ) || [])[0];
                if (!B) {
                  cfg.defaultCity == "kaunas" && (k[5] = k[6]);
                  if (!k[5]) continue;
                  var G = (k[2] || "-").split("-"),
                    H = G[G.length - 1],
                    q =
                      ti.fGetRoutes(
                        pg.city || cfg.defaultCity,
                        k[0],
                        k[1],
                        null,
                        !0
                      ) || [];
                  for (var E = 0; E < q.length; ++E) {
                    var G = (q[E].dirType || "-").split("-");
                    if (H == G[G.length - 1]) {
                      B = q[E];
                      break;
                    }
                    if (
                      q[E].name.indexOf(k[5]) >=
                      q[E].name.length - 3 - k[5].length
                    ) {
                      B = q[E];
                      break;
                    }
                  }
                }
              }
            else
              (k[0] = "commercialbus"),
                (B = (ti.fGetRoutes(
                  cfg.defaultCity,
                  k[0],
                  k[1].toUpperCase(),
                  k[2],
                  !0
                ) || [])[0]);
            (B = B || {
              city: pg.city || cfg.defaultCity,
              transport: k[0],
              num: k[1],
              numHTML: k[1],
              name: k[5] || "",
              destination: k[5] || "",
            }),
              B && k[5] && ((B.name = B.name || k[5]), (B.destination = k[5])),
              (C = +k[3] / 60);
          }
          var f = ti.toAscii(
            B.city + ";" + B.transport + ";" + B.num + ";" + B.name,
            !0
          );
          f += ";" + A;
          var I = w[f],
            J = k[4],
            K = {
              capacity: +(k[7] || 0),
              passengers: +(k[6] || 0),
            };
          if (cfg.defaultCity == "vilnius" || cfg.defaultCity == "klaipeda") {
            var L = (J || "x").toLowerCase().lastIndexOf("k");
            L >= 3 &&
              ((K.bCoolVehicle = !0), (J = J.slice(0, L) + J.slice(L + 1))),
              (J || "x").toLowerCase().indexOf("w") >= 0 &&
                ((K.bWifi = !0), (J = J.replace(/w/gi, "")));
          }
          cfg.defaultCity == "vilnius" &&
            ((J || "x").toLowerCase().indexOf("d") >= 0 &&
              ((K.bBicycle = !0), (J = J.replace(/d/gi, ""))),
            B && B.name && B.name.toLowerCase().slice(-10) == "oro uostas"
              ? (K.bAirport = 1)
              : B &&
                B.name &&
                B.name.toLowerCase().slice(-6) == "stotis" &&
                (K.bAirport = 2));
          if (cfg.defaultCity == "klaipeda") {
            var L = (J || "x").toLowerCase().lastIndexOf("n");
            L >= 3 &&
              ((K.bChristmasTree = !0), (J = J.slice(0, L) + J.slice(L + 1))),
              (L = (J || "x").toLowerCase().lastIndexOf("e")),
              L >= 3 &&
                ((K.bElectrobus = !0), (J = J.slice(0, L) + J.slice(L + 1)));
          }
          cfg.defaultCity == "tallinna-linn"
            ? (K.bLowFloorVehicle =
                (cfg.city.lowFloorVehicles || "").indexOf("," + J + ",") >= 0)
            : (cfg.defaultCity == "klaipeda"
                ? (K.bLowFloorVehicle = /[ztZT]/.test((J || "x").slice(-1)))
                : (K.bLowFloorVehicle = /[zZ]/.test((J || "x").slice(-1))),
              K.bLowFloorVehicle && (J = J.slice(0, -1))),
            cfg.defaultCity == "vilnius"
              ? (K.bUsb = K.bWifi)
              : cfg.defaultCity == "xxxvilnius" &&
                (pg.vehicleIconState == "wifi"
                  ? ((K.bUsb =
                      K.bWifi &&
                      (!K.bCoolVehicle || (!K.bBicycle && !K.bAirport))),
                    (K.bBicycle =
                      K.bBicycle && !(K.bCoolVehicle && K.bWifi && K.bAirport)))
                  : pg.vehicleIconState == "usb" &&
                    ((K.bUsb = K.bWifi),
                    (K.bWifi =
                      K.bWifi &&
                      (!K.bCoolVehicle || (!K.bBicycle && !K.bAirport))),
                    K.bCoolVehicle &&
                      K.bUsb &&
                      K.bBicycle &&
                      (K.bAirport = 0)));
          if (pg.stop_closures)
            for (var E = 0; E < pg.stop_closures.length; ++E) {
              var M = pg.stop_closures[E],
                N = "," + M.stopnumber + ",";
              if (
                N.indexOf("," + A + ",") < 0 &&
                N.indexOf(("," + A).split("-")[0] + ",") < 0
              )
                continue;
              var O = M[B.transport] || "";
              if (O != "all" && ("," + O + ",").indexOf("," + B.num + ",") < 0)
                continue;
              if (C >= M.from && C <= M.until) {
                (C = 999999), (B.message = M.message);
                break;
              }
            }
          (K.vehicleID = J),
            (K.departure = C),
            (K.zeroGround =
              (k.length == 7 && k[6] == "Z") || K.bLowFloorVehicle);
          if (C < y - 0.5) C = C;
          else if (I) {
            if (C != 999999)
              if (cfg.defaultCity != "tallinna-linn" || C <= y + 30)
                I.route.departures.push(C), I.route.vehicles.push(K);
          } else
            (B.departures = [C]),
              (B.vehicles = [K]),
              (B.stopId = A),
              (w[f] = {
                route: B,
              });
        }
        for (var f in w) {
          var B = w[f];
          B.route.departures.sort(function (a, b) {
            return a - b;
          }),
            B.route.vehicles.sort(function (a, b) {
              return a.departure - b.departure;
            }),
            (B.start_time = B.route.vehicles[0].departure),
            x.push(B);
        }
        x.sort(function (a, b) {
          if (a.route.sortKey < b.route.sortKey) return -1;
          if (a.route.sortKey > b.route.sortKey) return 1;
          return ti.naturalSort(a.route.num, b.route.num);
        }),
          pg.realTimeDepartures.timer &&
            cfg.defaultCity === "tallinna-linn" &&
            z >= 30 &&
            (clearTimeout(pg.realTimeDepartures.timer),
            (pg.realTimeDepartures.timer = setTimeout(
              function () {
                (pg.realTimeDepartures.timer = 0),
                  pg.fProcessVehicleDepartures(null, b);
              },
              z <= 90 ? 3e4 : 6e4
            )));
        if (typeof b == "function") {
          var P = [];
          for (var h = 0; h < x.length; h++) {
            P[h] = pg.fMakeRouteRowHTML(
              x[h].route,
              "tblDepartingRoutes",
              0,
              y,
              !0
            );
            var Q = x[h].route.departures[0];
            P[h].timetowait =
              Q == 999999 ? Q : Math.floor(x[h].route.departures[0] - y + 0.5);
          }
          b(P, y);
        } else if (cfg.city.defaultTransport == "tablo") {
          var R = new Date();
          pg.startedTimestamp
            ? R - pg.startedTimestamp > 864e5 && location.reload()
            : ((pg.startedTimestamp = new Date(R.valueOf())),
              pg.startedTimestamp.setHours(3, 0, 0, 0),
              pg.startedTimestamp >= R &&
                pg.startedTimestamp.setDate(R.getDate() - 1)),
            pg.fMakeTabloHTML(x);
        } else {
          for (var h = 0; h < x.length; h++) {
            var Q = x[h].route.departures[0];
            (x[h].route.timetowait =
              Q == 999999
                ? Q
                : Math.max(0, Math.floor(x[h].route.departures[0] - y + 0.5))),
              v.push(
                pg.fMakeRouteRowHTML(
                  x[h].route,
                  "tblDepartingRoutes",
                  0,
                  -1,
                  !1,
                  x[h].route.destination
                )
              );
          }
          ($("divContentDepartingRoutesResults") || {}).innerHTML =
            v.join("") + "</tbody></table>";
        }
      }
    }
  }),
  (pg.fLoadPlannerTab = function (a, b) {
    a === !0 &&
      ((pg.optimalResults = null),
      (pg.loadedPlannerParams = null),
      (pg.hashForMap = ""));
    if (b)
      var c = {
        errors: [],
      };
    var d =
      "" +
      ((typeof mobile != "undefined"
        ? jQuery(".inputTime").val()
        : ($("inputTime") || {}).value) || "");
    d === ""
      ? ((d = ti.dateToMinutes(new Date()) % 1440),
        (($("inputTime") || {}).value = ti.printTime(d)),
        typeof mobile != "undefined" &&
          jQuery(".inputTime").val(ti.printTime(d)))
      : (d = ti.toMinutes(d));
    var e = ti.fGetAnyStopDetails(pg.inputStart),
      f = ti.fGetAnyStopDetails(pg.inputFinish);
    f.id
      ? ((($("inputFinish") || {}).value = f.name || ""),
        (($("inputFinish") || {}).className = ""))
      : !pg.inputFinish &&
        typeof ti.stops == "object" &&
        ((($("divContentPlannerResults") || {}).innerHTML =
          i18n.typeFinishStop),
        b &&
          c.errors.push({
            text: i18n.typeFinishStop,
          }),
        document.activeElement &&
          document.activeElement.id !== "inputFinish" &&
          ((($("inputFinish") || {}).value = i18n.finishStop),
          (($("inputFinish") || {}).className = "empty")));
    if (e.id)
      (($("inputStart") || {}).value = e.name || ""),
        (($("inputStart") || {}).className = "");
    else if (!pg.inputStart || typeof ti.stops == "object")
      (($("divContentPlannerResults") || {}).innerHTML = i18n.typeStartStop),
        b &&
          c.errors.push({
            text: i18n.typeStartStop,
          }),
        document.activeElement &&
          document.activeElement.id !== "inputStart" &&
          ((($("inputStart") || {}).value = i18n.startStop),
          (($("inputStart") || {}).className = "empty"));
    if (typeof ti.routes !== "object" || typeof ti.stops !== "object")
      (($("divContentPlannerResults") || {}).innerHTML =
        "<br/>" + i18n.receivingData),
        setTimeout(function () {
          pg.fLoadPlannerTab(!1, b);
        }, 200);
    else {
      if (
        (!pg.inputStart && !pg.inputFinish) ||
        (pg.loadedPlannerParams || "").indexOf("clear") >= 0
      ) {
        (pg.loadedPlannerParams = pg.inputStart + "/" + pg.inputFinish),
          (pg.optimalResults = null),
          pg.hashForMap &&
            pg.hashForMap != "map" &&
            ((pg.map = {}), (pg.hashForMap = "map"), pg.fMapShow());
        var g = pg.fUrlSet(
          {
            hashForMap: "map",
          },
          !0
        );
        (($("divContentPlannerResults") || {}).innerHTML =
          '<p class="help">' +
          i18n.tripPlannerHelp +
          '</p><p class="help">' +
          i18n.tripPlannerHelpMap.replace(
            /<a>/g,
            '<a class="underlined map" href="#' + g + '">'
          ) +
          "</p>"),
          b &&
            (c.errors.push({
              text: i18n.tripPlannerHelp,
            }),
            b(c));
        return;
      }
      pg.loadedPlannerParams = pg.inputStart + "/" + pg.inputFinish;
      if (!e.id || !f.id) {
        b && b(c);
        return;
      }
      var h = new Date(),
        i = h;
      cfg.defaultCity == "tallinna-linn"
        ? jQuery("#inputDateNew").val() &&
          (i = jQuery("#inputDateNew").datepicker("getDate"))
        : (i = new Date(
            h.getFullYear(),
            h.getMonth(),
            h.getDate() +
              +(typeof mobile != "undefined"
                ? jQuery(".inputDate").val()
                : $("inputDate").value)
          ));
      var j = {
          start_stops:
            pg.inputStart == "gps"
              ? [ti.stops.gps.lat, ti.stops.gps.lng].join(";")
              : pg.inputStart,
          finish_stops:
            pg.inputFinish == "gps"
              ? [ti.stops.gps.lat, ti.stops.gps.lng].join(";")
              : pg.inputFinish,
          reverse:
            typeof mobile != "undefined"
              ? parseInt(jQuery(".inputReverse").val(), 10)
              : parseInt($("inputReverse").value, 10),
          date: i,
          start_time: d,
          lowFloor:
            typeof mobile != "undefined"
              ? jQuery(".checkHandicapped").is(":checked")
              : $("checkHandicapped").checked,
          bicycles:
            typeof mobile != "undefined"
              ? jQuery(".checkBicycles").is(":checked")
              : (
                  $("checkBicycles") || {
                    checked: !1,
                  }
                ).checked,
          transport: {},
          route_nums: (
            (typeof mobile != "undefined"
              ? jQuery(".inputRoutesFilter").val()
              : ($("inputRoutesFilter") || {}).value) || ""
          ).trim(),
          walk_speed_kmh:
            typeof mobile != "undefined"
              ? parseInt(jQuery(".inputWalkSpeed").val() || 4, 10)
              : parseInt($("inputWalkSpeed").value || 4, 10),
          walk_max:
            typeof mobile != "undefined"
              ? jQuery(".inputWalkMax").val()
              : $("inputWalkMax").value,
          change_time:
            typeof mobile != "undefined"
              ? parseInt(jQuery(".inputChangeTime").val() || 3, 10)
              : parseInt($("inputChangeTime").value || 3, 10),
          callback1:
            b ||
            (typeof mobile != "undefined"
              ? mobile.renderPlannerResults
              : pg.fPrintOptimalTrips),
          callback:
            b ||
            (typeof mobile != "undefined"
              ? mobile.renderPlannerResults
              : pg.fPrintOptimalTrips),
        },
        k = pg.fGetCity(pg.city);
      for (var l = 1; l <= 2; l++) {
        for (var m = 0, n = cfg.cities[k].transport; m < n.length; m++)
          j.transport[n[m]] =
            typeof mobile != "undefined"
              ? jQuery(".checkbox" + n[m]).is(":checked")
              : (
                  $("checkbox" + n[m]) || {
                    checked: !0,
                  }
                ).checked;
        k = cfg.cities[k].region;
        if (!k || !cfg.cities[k]) break;
      }
      cfg.defaultCity == "vilnius" &&
        "plane" in j.transport &&
        ((j.transport.plane = 120),
        (j.mode = "vintra"),
        (j.shapes_url = "http://www.stops.lt/shapes/")),
        (($("divContentPlannerResults") || {}).innerHTML =
          "<br/>" + i18n.calculating);
      if (
        typeof mobile == "undefined" ||
        (typeof mobile != "undefined" &&
          (pg.hashForMap || mobile.tallinnPlannerReady)) ||
        a
      )
        typeof mobile != "undefined" && jq("#loading").show(),
          setTimeout(function () {
            ti.findTrips(j);
          }, 100);
    }
  }),
  (pg.fPrintOptimalTrips = function (a, b, c) {
    var d = (pg.optimalResults = a.results);
    pg.map = {};
    var e = [];
    cfg.city.plannerTip &&
      e.push(
        '<div style="margin:10px; color:red;">' +
          (cfg.city.plannerTip[pg.language] || cfg.city.plannerTip.en || "") +
          "</div>"
      );
    for (var f = 0; f < d.length; f++) {
      var g = d[f],
        h = d[f].legs,
        i = [],
        j = [];
      for (var k = 0; k < h.length; k++) {
        var l = h[k],
          m = l.route,
          n = (
            h[k + 1] || {
              route: null,
            }
          ).route;
        if (m && m.transport) {
          n &&
            m.city === n.city &&
            m.transport === n.transport &&
            m.num === n.num &&
            cfg.defaultCity != "intercity" &&
            ((l.finish_stop.name = h[k + 1].finish_stop.name),
            (l.finish_time = h[k + 1].finish_time),
            ++k),
            j.push(
              '<span class="icon icon_narrow icon_' +
                m.transport +
                '" title="' +
                i18n.transport1[m.transport] +
                " " +
                m.num +
                " " +
                i18n.towards +
                " " +
                m.name +
                '"></span>'
            ),
            g.direct_trip &&
              m.num.length <= 8 &&
              (j.push(
                '<span class="num num' +
                  Math.min(l.route.num.length, 4) +
                  " " +
                  l.route.transport +
                  '">' +
                  l.route.numHTML +
                  "</span>"
              ),
              l.online_data &&
                j.push(
                  " " +
                    l.online_data.code +
                    " " +
                    l.online_data.departureAsStr +
                    " &rarr; " +
                    l.online_data.arrivalAsStr
                )),
            (m.stopId = l.start_stop.id),
            (m.tripNum = (l.trip_num || -1) + 1);
          var o = pg.fUrlSet(
              {
                schedule: m,
                mapHash: "",
              },
              !0
            ),
            p = l.travel_time;
          p =
            p >= 60
              ? ti.printTime(p, ":", "duration")
              : p + "&nbsp;" + i18n.minutesShort;
          var q = "";
          if (l.stops && l.stops.length) {
            q =
              ' style="cursor: default;" title="' + l.stops.length + " stops:";
            for (var r = 0; r < l.stops.length; ++r)
              q +=
                (r ? ", " : " ") +
                ti.printTime(l.stops[r].departure_time.minutes) +
                " " +
                l.stops[r].name;
            q += '"';
          }
          i.push(
            '<p class="results"><span class="icon icon_' +
              l.route.transport +
              '"></span><span class="num num' +
              Math.min(l.route.num.length, 4) +
              " " +
              l.route.transport +
              '">' +
              l.route.numHTML +
              "</span>" +
              (cfg.searchOnly
                ? ""
                : '<a class="hover" href="#' +
                  o +
                  '" title="' +
                  i18n.showSchedule +
                  '">') +
              (i18n.transport1[l.route.transport] || "") +
              " " +
              i18n.towards +
              "&nbsp;" +
              l.route.name +
              (cfg.searchOnly ? "" : "</a>") +
              " <br/><strong>" +
              (cfg.defaultCity == "xxxvilnius2"
                ? ""
                : ti.printTime(l.start_time)) +
              (l.online_data ? "(" + l.online_data.departureAsStr + ")" : "") +
              " " +
              l.start_stop.name +
              ((l.start_platform && "(" + l.start_platform + ")") || "") +
              "</strong> &rarr; " +
              (cfg.defaultCity == "xxxvilnius2"
                ? ""
                : ti.printTime(l.finish_time)) +
              (l.online_data ? "(" + l.online_data.arrivalAsStr + ")" : "") +
              " " +
              l.finish_stop.name +
              ((l.finish_platform && "(" + l.finish_platform + ")") || "") +
              (cfg.defaultCity == "xxxvilnius2"
                ? ""
                : '<span class="graytext"' +
                  q +
                  "> (" +
                  i18n.ride +
                  " " +
                  p +
                  (cfg.city.has_trips_ids
                    ? " trip ID=" +
                      l.trip_id +
                      (l.trip_date
                        ? "(" + l.trip_date.yyyymmdd("-") + ")"
                        : "") +
                      ", trip num=" +
                      l.trip_code +
                      (l.online_data
                        ? ", bezrindas trip ID=" + l.online_data.code
                        : "")
                    : "") +
                  (cfg.city.has_trips_ids === 2
                    ? ", trip operator=" +
                      l.trip_operator +
                      ", trip group=" +
                      l.trip_group
                    : "") +
                  ")</span>") +
              "</p>"
          );
        } else {
          if (
            l.start_time == l.finish_time &&
            parseInt(l.start_stop.id, 10) == parseInt(l.finish_stop.id, 10)
          )
            continue;
          j.push(
            '<span class="icon icon_narrow icon_walk" title="' +
              i18n.walk +
              " " +
              (l.finish_time - l.start_time) +
              "&nbsp;" +
              i18n.minutesShort +
              '"></span>'
          ),
            i.push(
              '<p class="results"><span class="icon icon_walk"></span><strong>' +
                (cfg.defaultCity == "xxxvilnius2"
                  ? ""
                  : ti.printTime(l.start_time)) +
                " " +
                l.start_stop.name +
                "</strong> &rarr; " +
                (cfg.defaultCity == "xxxvilnius2"
                  ? ""
                  : ti.printTime(l.finish_time)) +
                " " +
                l.finish_stop.name +
                '<span class="graytext"> (' +
                i18n.walk +
                " " +
                (l.finish_time - l.start_time) +
                "&nbsp;" +
                i18n.minutesShort +
                ")</span></p></a>"
            );
        }
        if (l.taxi)
          for (var s = 0; s < l.taxi.length; ++s) {
            var t = l.taxi[s];
            i.push(
              (s ? "<br />" : "") +
                "km: " +
                t.km +
                ", " +
                t.name +
                ", phone: " +
                t.phone
            );
          }
      }
      e.push(
        "<div" +
          (f % 2 ? "" : ' class="grey"') +
          ' style="border-bottom: solid 1px gray; padding:5px 0 5px 5px;"><table><tbody><tr><td><a href="" onclick="return false;" data-option-num="' +
          (f + 1) +
          '" title="' +
          (f ? i18n.showDetails : i18n.hideDetails) +
          '" class="' +
          (f ? "expand" : "collapse") +
          '"><span class="icon"></span><strong class="hover">' +
          i18n.option +
          "&nbsp;" +
          (f + 1) +
          '.</strong></a> <a href="#' +
          pg.city +
          "/" +
          pg.transport +
          "/map,,," +
          (f + 1) +
          '" class="icon icon_map" title="' +
          i18n.showInMap +
          '"></a> ' +
          (cfg.defaultCity == "xxxvilnius2"
            ? ""
            : ti.printTime(g.start_time, null, "&#x2007;") +
              " &mdash; " +
              ti.printTime(g.finish_time, null, "&#x2007;")) +
          ',</td><td style="white-space:pre-wrap;">' +
          (g.distance
            ? "atstumas&nbsp;" + Math.round(g.distance) / 1e3 + "&nbsp;km"
            : i18n.travelDuration +
              "&nbsp;<strong>" +
              ti.printTime(g.travel_time, ":", "duration")) +
          "</strong>  " +
          (typeof g.cost == "number"
            ? "kaina&nbsp;" + g.cost + "&euro;  "
            : "") +
          '<span style="white-space:nowrap;">' +
          j.join("") +
          '</span></td></tr></tbody></table><div class="RouteDetails" style="' +
          (f ? "display:none;" : "") +
          '">'
      ),
        e.push(i.join("") + "</a></div></div>");
    }
    if (d.length > 0) {
      pg.fTogglePlannerOptions(!1),
        b &&
          document.body.className.indexOf("Map") >= 0 &&
          ((pg.mapShowAllStops = -Math.abs(pg.mapShowAllStops)),
          pg.fUrlSetMap({
            optimalRoute: 1,
          }));
      if (cfg.defaultCity === "latvia") {
        ti.TimeZoneOffset = 2;
        var u = "http://routelatvia.azurewebsites.net/?";
        (u += "origin=" + a.start_stops),
          (u += "&destination=" + a.finish_stops),
          (u += "&departure_time=" + ti.toUnixTime(a.date, a.start_time)),
          e.push('<br/><a target="_blank" href="' + u + '">' + u + "</a>"),
          e.push('<div id="online_results">'),
          a.online_query_url
            ? e.push(
                '<a target="_blank" href="' +
                  a.online_query_url +
                  '">' +
                  a.online_query_url +
                  "</a>"
              )
            : b || e.push("<br/>Calculating alternative routes...");
        if (a.online_results_JSON) {
          var d = JSON.parse(a.online_results_JSON);
          e.push(
            '<div style="white-space:pre;">',
            JSON.stringify(d, null, 4),
            "</div>"
          );
        }
        e.push("</div>");
      }
    } else e.push("<br/>" + i18n.noOptimalRoutes);
    var v = $("divContentPlannerResults");
    (v || {}).innerHTML = e.join("");
  }),
  (pg.fMakeRouteRowHTML = function (a, b, c, d, e) {
    var f,
      g = "map," + a.city + "," + a.transport + "," + a.num;
    cfg.city.showAllDirections && (g = g + "," + a.dirType),
      (g = ti.toAscii(g, !0)),
      b == "tblRoutes"
        ? ((f = pg.fUrlSet(
            {
              schedule: {
                city: a.city,
                transport: a.transport,
                num: a.num,
                dirType: a.dirType,
              },
              hashForMap: "",
            },
            !0
          )),
          pg.routesFilter && (g += "," + a.dirType),
          (g = pg.fUrlSet(
            {
              hashForMap: g,
            },
            !0
          )))
        : ((f = pg.fUrlSet(
            {
              schedule: {
                city: a.city,
                transport: a.transport,
                num: a.num,
                dirType: a.dirType,
                stopId: a.stopId,
              },
              hashForMap: "",
            },
            !0
          )),
          (g = pg.fUrlSet(
            {
              hashForMap: g + "," + a.dirType + "," + a.stopId,
            },
            !0
          )));
    var h =
        '<a style="display:inline-block" href="#' +
        f +
        '" title="' +
        i18n.showSchedule +
        '">',
      i = "";
    for (var j = 1; j <= 7; j++)
      if ((a.weekdays || "").indexOf(j) < 0)
        i +=
          '<span class="blankday" title="' +
          i18n["weekdays" + j] +
          ": " +
          i18n.routeNotOperate +
          '">' +
          i18n.weekdaysShort[j] +
          "</span>";
      else {
        var k = a.validityPeriods[j - 1];
        (k = k ? ": " + i18n.validFrom + " " + pg.formatDate(k) : ""),
          (i +=
            "<span" +
            (j >= 6 ? "" : ' class="weekend"') +
            ' title="' +
            i18n["weekdays" + j] +
            k +
            '">' +
            i18n.weekdaysShort[j] +
            "</span>");
      }
    cfg.city.planHandicappedOption !== !1 &&
      a.weekdays &&
      a.weekdays.indexOf("z") >= 0 &&
      (i +=
        '<img src="' +
        pg.imagesFolder +
        'handicapped.png" alt="low floor" title="' +
        i18n.lowFloorVehicles +
        '" />'),
      a.weekdays &&
        a.weekdays.indexOf("s") >= 0 &&
        (i +=
          '<img src="' +
          pg.imagesFolder +
          'minibus_16_1E90FF.png" alt="small bus" title="' +
          i18n.smallBus12Service +
          '" />'),
      a.weekdays &&
        a.weekdays.indexOf("b") >= 0 &&
        (i +=
          '<img src="' +
          pg.imagesFolder +
          'bicycle16.png" alt="transfer bicycle" title="' +
          (i18n["transferBicycles_" + cfg.defaultCity] ||
            i18n.transferBicycles) +
          '" />');
    var l =
      h +
      (!0 || b == "tblDepartingRoutes"
        ? ""
        : '<span class="icon icon_expand" title="' +
          i18n.showDetails +
          '"></span>') +
      '<span class="icon icon_' +
      a.transport +
      '"></span>';
    a.transport == "train" || a.transport == "metro" || a.transport == "ferry"
      ? (l += '<span style="display:none;">' + a.num + "</span>")
      : (l +=
          '<span class="num num' +
          Math.min(a.num.length, 4) +
          " " +
          a.transport +
          '">' +
          a.numHTML +
          "</span>");
    if (ti.missing_trips) {
      var m = "\n" + (a.transport == "trol" ? "t" : "") + a.num + "-",
        n = ti.missing_trips.split(m);
      if (n.length > 1) {
        var o = "",
          p;
        for (var q = 1; q < n.length; q++)
          (p = (n[q] || ",").split(",")[1]),
            p &&
              (o +=
                (q > 1 ? ", " : i18n.unassignedDepartures + ":&nbsp;") +
                ti.printTime(parseInt(p, 10)));
        l +=
          '<span class="exclamation-at-start tooltip" style="padding:0; position:relative;" title="' +
          o +
          '"><span class="tooltiptext">Tooltip text</span></span>&nbsp;';
      }
    }
    if (e)
      var r = {
        route: a,
        hash: f,
        times: [],
        wait: [],
        zeroGround: [],
        notes: [],
        missing_trips: o,
      };
    var s =
      '<span class="hover">' +
      a.name +
      ((a.commercial || "").indexOf("E") >= 0
        ? " (" + i18n.express + ")"
        : "") +
      "</span>";
    (i += pg
      .render_airport_icon(a.name, pg.routesFilter != "")
      .replace("&nbsp;", "")),
      (s =
        "<tr" +
        (b != "tblDepartingRoutes" && c % 2 != 0 ? ' class="white"' : "") +
        '><td class="routeName"><a class="icon icon_map" title="' +
        i18n.showInMap +
        '" href="#' +
        g +
        '"></a>' +
        l +
        s +
        "</a>"),
      (s +=
        '</td><td class="weekdays"><a href="#' +
        f +
        '">' +
        i +
        '</a></td><td class="lastcol"></td></tr>');
    if (b === "tblDepartingRoutes") {
      if (
        cfg.city.doNotShowTimetables &&
        cfg.city.doNotShowTimetables[a.transport] &&
        a.departures.length &&
        a.departures[0] >= 0
      )
        if (("," + pg.inputStop + ",").indexOf("," + a.stops[0] + ",") < 0) {
          (s += '<tr class="white"><td class="DeparturesRow" colspan="4">'),
            (s += "</td></tr>");
          return s;
        }
      s +=
        '<tr class="white"><td class="DeparturesRow" colspan="4"><span><span class="icon icon_collapse"></span><span class="icon';
      var t = Infinity,
        u = Infinity,
        v = 0,
        w = 18;
      for (var q = a.departures.length; --q >= 0; ) {
        var x = a.departures[q];
        if (x < 0) continue;
        if (x < d) break;
        ++v, (x = ~~x);
        var y = ~~(x / 60);
        if (t != y) {
          if (++v > w && x < d) break;
          t = y;
        }
        u = x;
      }
      q < 0 && v < w
        ? (s += '">')
        : (s += ' icon_expand" title="' + i18n.stopShowAllDepartures + '">');
      var z = -1;
      v = 0;
      for (q = 0; q < a.departures.length; ++q) {
        var x = a.departures[q];
        if (x < 0) continue;
        e &&
          (r.times.push(~~(0.5 + x)),
          r.wait.push(x == 999999 ? x : Math.floor(x - d + 0.5)),
          a.vehicles &&
            a.vehicles[q] &&
            r.zeroGround.push(a.vehicles[q].zeroGround)),
          (x = ~~x);
        var y = ~~(x / 60);
        x >= u && ++v,
          z != y &&
            ((z = y),
            x >= u && ++v,
            (s +=
              '</span></span><span style="display:inline-block;"><span class="DeparturesHour' +
              (y < t || v > w ? " collapse" : "") +
              '">&nbsp;' +
              (y % 24) +
              '</span><span style="vertical-align:top"' +
              (x < u || v > w ? ' class="collapse"' : "") +
              ">&#x200A;")),
          x == u && (s += '</span><span style="vertical-align:top">'),
          v == w + 1 &&
            (s += '</span><span style="vertical-align:top" class="collapse">'),
          (x = x % 60),
          (s += (x < 10 ? "0" : "") + x + " ");
      }
      z === -1
        ? (e && r.notes.push(i18n.routeNotOperate),
          (s += "</span><span>" + i18n.routeNotOperate))
        : !v && a.departures.length
        ? (a.departures.sort(function (a, b) {
            return a - b;
          }),
          e &&
            r.times.length == 0 &&
            r.notes.push(
              i18n.stopLatestDeparture +
                "&nbsp;" +
                ti.printTime(a.departures[a.departures.length - 1])
            ),
          (s +=
            '</span><span style="cursor:default;" class="hideWhenExpanded">' +
            i18n.stopLatestDeparture +
            "&nbsp;" +
            ti.printTime(a.departures[a.departures.length - 1])))
        : v > w &&
          (s +=
            '</span><span style="cursor:default;" class="hideWhenExpanded">...'),
        (s += "</span></span></td></tr>"),
        (z === -1 || !v) &&
          a.dirType &&
          a.dirType.indexOf("d") >= 0 &&
          (s = "");
    }
    return e ? r : s;
  }),
  (pg.fContent_Click = function (a) {
    pg.stopSuggestedForMap &&
      ((pg.stopSuggestedForMap = ""), pg.fSuggestedStopsHide());
    var b = a && (a.target || a.srcElement);
    if (!b) return !0;
    var c, d, e;
    for (var f = b; f; f = f.parentNode) {
      if ((f.tagName || "").toLowerCase() === "tr") break;
      d ||
        ((c = f && (f.className || "").toLowerCase()),
        c.indexOf("expand") < 0
          ? c.indexOf("collapse") < 0
            ? (f.href || "").indexOf("#") >= 0 &&
              ((e = pg.fUrlParse(f.href)),
              f.className.indexOf("map") < 0
                ? e.schedule
                  ? (d = pg.fUrlSet(
                      {
                        schedule: e.schedule,
                      },
                      !0
                    ))
                  : ((d = "hash"),
                    (e.language = pg.language),
                    e.hashForMap ||
                      (pg.hashForMap &&
                        (pg.city === e.city && pg.transport === e.transport
                          ? (e.hashForMap = pg.hashForMap)
                          : (e.hashForMap = "map"))))
                : (d = pg.fUrlSet(
                    {
                      hashForMap: e.hashForMap,
                    },
                    !0
                  )))
            : ((d = "collapse"), (b = f))
          : ((d = "expand"), (b = f)));
      if ((f.tagName || "").toLowerCase() === "a") break;
      if (
        (f.className || "").toLowerCase() === "departuresrow" &&
        d === "expand"
      ) {
        (d = ""), (f.className = "DeparturesRowFull");
        break;
      }
      if (
        (f.className || "").toLowerCase() === "departuresrowfull" &&
        d === "collapse"
      ) {
        (d = ""), (f.className = "DeparturesRow");
        break;
      }
    }
    var g = [];
    while (f) {
      (f = f.parentNode), (g = (f && f.getElementsByTagName("div")) || []);
      if (g.length) break;
    }
    d == "expand"
      ? ((b.className = b.className.replace("expand", "collapse")),
        (b.title = i18n.hideDetails),
        ((
          g[0] || {
            style: {},
          }
        ).style.display = ""),
        pg.schedule && (pg.scheduleDetailsExpanded = !0),
        document.body.className.indexOf("Map") >= 0 &&
          pg.fUrlSetMap({
            optimalRoute: b.getAttribute("data-option-num") || 1,
          }),
        (d = ""))
      : d == "collapse"
      ? ((b.className = b.className.replace("collapse", "expand")),
        (b.title = i18n.showDetails),
        ((
          g[0] || {
            style: {},
          }
        ).style.display = "none"),
        pg.schedule && (pg.scheduleDetailsExpanded = !1),
        (d = ""))
      : d == "hash" && (pg.fUrlSet(e), (d = ""));
    if (d || d === "") {
      d && Hash.go(d);
      return pg.cancelEvent(a);
    }
    return !0;
  }),
  (pg.inputRoutes_KeyDown = function (a, b) {
    var c = $("inputRoutes");
    b || (b = window.event ? window.event.keyCode : a.keyCode),
      b == 27
        ? ((c.value = ""), setTimeout(pg.fLoadRoutesList, 200))
        : b != 9 &&
          (c.className == "empty" && ((c.value = ""), (c.className = "")),
          (pg.routesFilter = ""),
          setTimeout(pg.fLoadRoutesList, 200));
  }),
  (pg.inputRoutes_Focus = function () {
    ($e = $("inputRoutes")),
      $e.className === "empty" && (($e.className = ""), ($e.value = ""));
  }),
  (pg.inputRoutes_Blur = function () {
    ($e = $("inputRoutes")),
      $e &&
        !$e.value &&
        (($e.value =
          pg.transport == "schools"
            ? "Įveskite dalį mokyklos pavadinimo"
            : i18n.typeRouteNameOrNumber),
        ($e.className = "empty"));
  });

console.log("ti.loadData()", ti.loadData());
console.log("ti", ti);
console.log("cfg", cfg);
