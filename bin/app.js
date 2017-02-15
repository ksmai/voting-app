"use strict";!function t(e,o,n){function r(i,s){if(!o[i]){if(!e[i]){var a="function"==typeof require&&require;if(!s&&a)return a(i,!0);if(l)return l(i,!0);throw new Error("Cannot find module '"+i+"'")}var c=o[i]={exports:{}};e[i][0].call(c.exports,function(t){var o=e[i][1][t];return r(o?o:t)},c,c.exports,t,e,o,n)}return o[i].exports}for(var l="function"==typeof require&&require,i=0;i<n.length;i++)r(n[i]);return r}({1:[function(t,e,o){e.exports={100:"Continue",101:"Switching Protocols",200:"OK",201:"Created",202:"Accepted",203:"Non-Authoritative Information",204:"No Content",205:"Reset Content",206:"Partial Content",207:"Multi Status",208:"Already Reported",226:"IM Used",300:"Multiple Choices",301:"Moved Permanently",302:"Found",303:"See Other",304:"Not Modified",305:"Use Proxy",306:"Switch Proxy",307:"Temporary Redirect",308:"Permanent Redirect",400:"Bad Request",401:"Unauthorized",402:"Payment Required",403:"Forbidden",404:"Not Found",405:"Method Not Allowed",406:"Not Acceptable",407:"Proxy Authentication Required",408:"Request Time-out",409:"Conflict",410:"Gone",411:"Length Required",412:"Precondition Failed",413:"Request Entity Too Large",414:"Request-URI Too Large",415:"Unsupported Media Type",416:"Requested Range not Satisfiable",417:"Expectation Failed",418:"I'm a teapot",421:"Misdirected Request",422:"Unprocessable Entity",423:"Locked",424:"Failed Dependency",426:"Upgrade Required",428:"Precondition Required",429:"Too Many Requests",431:"Request Header Fields Too Large",451:"Unavailable For Legal Reasons",500:"Internal Server Error",501:"Not Implemented",502:"Bad Gateway",503:"Service Unavailable",504:"Gateway Time-out",505:"HTTP Version not Supported",506:"Variant Also Negotiates",507:"Insufficient Storage",508:"Loop Detected",510:"Not Extended",511:"Network Authentication Required",CONTINUE:100,SWITCHING_PROTOCOLS:101,OK:200,CREATED:201,ACCEPTED:202,NON_AUTHORITATIVE_INFORMATION:203,NO_CONTENT:204,RESET_CONTENT:205,PARTIAL_CONTENT:206,MULTI_STATUS:207,ALREADY_REPORTED:208,IM_USED:226,MULTIPLE_CHOICES:300,MOVED_PERMANENTLY:301,FOUND:302,SEE_OTHER:303,NOT_MODIFIED:304,USE_PROXY:305,SWITCH_PROXY:306,TEMPORARY_REDIRECT:307,PERMANENT_REDIRECT:308,BAD_REQUEST:400,UNAUTHORIZED:401,PAYMENT_REQUIRED:402,FORBIDDEN:403,NOT_FOUND:404,METHOD_NOT_ALLOWED:405,NOT_ACCEPTABLE:406,PROXY_AUTHENTICATION_REQUIRED:407,REQUEST_TIMEOUT:408,CONFLICT:409,GONE:410,LENGTH_REQUIRED:411,PRECONDITION_FAILED:412,REQUEST_ENTITY_TOO_LARGE:413,REQUEST_URI_TOO_LONG:414,UNSUPPORTED_MEDIA_TYPE:415,REQUESTED_RANGE_NOT_SATISFIABLE:416,EXPECTATION_FAILED:417,IM_A_TEAPOT:418,MISDIRECTED_REQUEST:421,UNPROCESSABLE_ENTITY:422,UPGRADE_REQUIRED:426,PRECONDITION_REQUIRED:428,LOCKED:423,FAILED_DEPENDENCY:424,TOO_MANY_REQUESTS:429,REQUEST_HEADER_FIELDS_TOO_LARGE:431,UNAVAILABLE_FOR_LEGAL_REASONS:451,INTERNAL_SERVER_ERROR:500,NOT_IMPLEMENTED:501,BAD_GATEWAY:502,SERVICE_UNAVAILABLE:503,GATEWAY_TIMEOUT:504,HTTP_VERSION_NOT_SUPPORTED:505,VARIANT_ALSO_NEGOTIATES:506,INSUFFICIENT_STORAGE:507,LOOP_DETECTED:508,NOT_EXTENDED:510,NETWORK_AUTHENTICATION_REQUIRED:511}},{}],2:[function(t,e,o){o.headerCtrl=["$user","$scope","$http","$location","$flash",function(t,e,o,n,r){e.user=t,e.logout=function(){var e;t.data&&(e=t.data.name),o.get("/auth/logout").then(function(){return e&&r.setMsg("Bye, "+e+"!","success"),n.path("/"),t.loadUser()}).catch(function(t){console.log(t)})},e.search=function(){return e.query?void n.path("/search/"+e.query):void r.setMsg("Enter a query to search.","info")},setTimeout(function(){e.$emit("headerCtrl")},0)}],o.homeCtrl=["$scope","$http","$location","$flash",function(t,e,o,n){t.new={offset:0,polls:[],done:!1,pend:!1},t.hot={offset:0,polls:[],done:!1,pend:!1},t.hotTab=!1,t.loadPolls=function(){var r=arguments.length>0&&void 0!==arguments[0]&&arguments[0],l=r?t.hot:t.new;l.pend||(l.pend=!0,e.get("/api/list?offset="+l.offset+(r?"&hot=1":"")).then(function(t){l.pend=!1,Array.isArray(t.data)&&(l.polls=l.polls.concat(t.data),l.offset=l.polls.length,0===t.data.length&&(n.setMsg("No more result available.","info"),l.done=!0))},function(t){l.pend=!1,0===l.polls.length&&o.path("/error/"+t.status)}))},t.tab=function(e){t.hotTab=e},t.loadNew=function(){return t.loadPolls(!1)},t.loadHot=function(){return t.loadPolls(!0)},t.loadPolls(!0),t.loadPolls(!1),setTimeout(function(){t.$emit("homeCtrl")},0)}],o.myPollsCtrl=["$scope","$http","$location","$route","$flash",function(t,e,o,n,r){var l=0,i=0;t.polls=[],t.searching=!1,t.done=!1,t.pend=!1,t.loadMyPolls=function(){t.pend=!0,e.get("/api/ownlist?offset="+l).then(function(e){t.pend=!1,Array.isArray(e.data)&&(t.polls=t.polls.concat(e.data),l=t.polls.length,0===e.data.length&&(r.setMsg("No more result available.","info"),t.done=!0))},function(e){t.pend=!1,0===t.polls.length&&o.path("/error/"+e.status)})},t.loadMyPolls(),t.delete=function(t,l){e.delete("/api/delete_poll/"+t).then(function(t){r.setMsg('"'+l+'" has been successfully deleted!',"success"),n.reload()},function(t){o.path("/error/"+t.status)})},t.search=function(){var o=!(arguments.length>0&&void 0!==arguments[0])||arguments[0];return t.query?(o&&(i=0,t.polls=[],t.done=!1),t.searching=!0,t.pend=!0,l=0,void e.get("/api/ownsearch/"+encodeURIComponent(t.query)+"?offset="+i).then(function(e){t.pend=!1,t.polls=t.polls.concat(e.data),i=t.polls.length,e.data.length||(r.setMsg("No more result available.","info"),t.done=!0)},function(e){t.pend=!1})):t.empty()},t.empty=function(){t.searching=!1,t.query="",t.polls=[],l=0,t.done=!1,t.loadMyPolls()},t.more=function(){return t.searching?t.search(!1):t.loadMyPolls()},setTimeout(function(){t.$emit("myPollsCtrl")},0)}],o.searchCtrl=["$scope","$http","$routeParams","$location","$flash",function(t,e,o,n,r){t.query=o.query,t.done=!1,t.pend=!1,t.polls=[];var l=0;t.search=function(){t.pend=!0,e.get("/api/search/"+encodeURIComponent(t.query)+"?offset="+l).then(function(e){t.pend=!1,Array.isArray(e.data)&&(t.polls=t.polls.concat(e.data),l=t.polls.length,0===e.data.length&&(r.setMsg("No more result available.","info"),t.done=!0))},function(e){t.pend=!1,0===t.polls.length&&n.path("/error/"+e.status)})},t.search(),setTimeout(function(){t.$emit("searchCtrl")},0)}],o.createCtrl=["$scope","$http","$location","$flash","$user",function(t,e,o,n,r){function l(){for(var e=t.options.length-1;e>=0;e--)t.options[e].option=t.options[e].option.trim(),0===t.options[e].option.length&&t.removeOption(e);for(var o=t.options.map(function(t){return t.option}),r=o.length-1;r>=0;r--)o.indexOf(o[r])!==r&&t.removeOption(r);t.title=t.title.trim();var l=null;if(t.title.length<s)l="There must be a title.";else if(t.title.length>i)l="Title is too long (max "+i+" characters).";else if(t.options.length>u)l="Too many options specified (max "+u+").";else if(t.options.length<p)l="Too few options specified (min "+p+"). \n               Duplicates do not count.";else for(var d=0;d<t.options.length;d++){if(t.options[d].option.length<c){l="Option "+(d+1)+" is empty.";break}if(t.options[d].option.length>a){l="Option "+(d+1)+" is too long (max "+a+"\n                   characters.";break}}if(l){for(n.setMsg(l,"warning");t.options.length<p;)t.addOption();return!1}return!0}var i=256,s=1,a=128,c=1,u=10,p=2;t.maxTitleLen=i,t.maxOptLen=a,t.options=[{option:""},{option:""}],t.title="",t.pend=!1,t.create=function(){return r.data?void(l()&&(t.pend||(t.pend=!0,e.post("/api/create_poll",{title:t.title,options:t.options}).then(function(t){t.data.pollID?(n.setMsg("Your poll has been successfully created!","success"),o.path("/poll/"+t.data.pollID)):o.path("/error/400")},function(t){o.path("/error/"+t.status)})))):void n.setMsg("Please login to continue.","warning")},t.addOption=function(e){return t.options.length>=u?void n.setMsg("At most "+u+" options can be specified.","info"):void(void 0!=e?t.options.splice(e,0,{option:""}):t.options.push({option:""}))},t.removeOption=function(e){for(t.options.splice(e,1);t.options.length<p;)n.setMsg("At least "+p+" options are needed.","info"),t.addOption()},t.up=function(e){if(!(void 0==e||e<1)&&t.options[e]){var o=[t.options[e],t.options[e-1]];t.options[e-1]=o[0],t.options[e]=o[1]}},t.down=function(e){void 0==e||e>t.options.length-2||t.up(e+1)},t.reset=function(){t.title="",t.options=[{option:""},{option:""}]},setTimeout(function(){t.$emit("createCtrl")},0)}],o.pollCtrl=["$scope","$http","$routeParams","$location","$route","$user","$flash",function(t,e,o,n,r,l,i){var s=!1;e.get("/api/poll/"+o.id).then(function(e){t.poll=e.data},function(t){n.path("/error/"+t.status)}),t.vote=function(o){return l.data?~t.poll.voters.indexOf(l.data._id)?void i.setMsg("You have already voted before.","warning"):void(s||(i.setMsg("Submitting your vote: "+t.poll.options[o].option+".","info"),s=!0,e.put("/api/vote",{pollID:t.poll._id,optNum:o}).then(function(t){i.setMsg("You have successfully voted!","success"),r.reload()},function(t){n.path("/error/"+t.status)}))):void i.setMsg("Please login to vote.","info")},setTimeout(function(){t.$emit("pollCtrl")},0)}],o.flashCtrl=["$scope","$flash",function(t,e){t.message=e.getMsg(),t.close=e.clrMsg,setTimeout(function(){t.$emit("flashCtrl")},0)}],o.errorCtrl=["$scope","$routeParams",function(e,o){var n,r=parseInt(o.status);r&&(n=t("http-status")[r])?e.status={code:r,text:n}:e.status={code:0,text:"Unknown"},setTimeout(function(){e.$emit("errorCtrl")},0)}]},{"http-status":1}],3:[function(t,e,o){o.voteHeader=function(){return{restrict:"E",scope:{},templateUrl:"/templates/vote-header.html",controller:"headerCtrl"}},o.voteFooter=function(){return{restrict:"E",scope:{},templateUrl:"/templates/vote-footer.html"}},o.voteHome=function(){return{restrict:"E",scope:{},templateUrl:"/templates/vote-home.html",controller:"homeCtrl"}},o.voteMyPolls=function(){return{restrict:"E",scope:{},templateUrl:"/templates/vote-my-polls.html",controller:"myPollsCtrl"}},o.voteSearch=function(){return{restrict:"E",scope:{},templateUrl:"/templates/vote-search.html",controller:"searchCtrl"}},o.voteCreate=function(){return{restrict:"E",scope:{},templateUrl:"/templates/vote-create.html",controller:"createCtrl"}},o.votePoll=function(){return{restrict:"E",scope:{},templateUrl:"/templates/vote-poll.html",controller:"pollCtrl"}},o.votePollList=function(){return{restrict:"E",scope:{polls:"=",more:"&",act:"=",delete:"&?",done:"=",pend:"="},templateUrl:"/templates/vote-poll-list.html"}},o.voteFlash=function(){return{restrict:"E",scope:{},templateUrl:"/templates/vote-flash.html",controller:"flashCtrl"}},o.voteChart=["$window","$timeout",function(t,e){return{restrict:"E",scope:{opts:"="},templateUrl:"/templates/vote-chart.html",link:function(o,n){function r(){return e(l,0)}function l(){var t=new google.visualization.DataTable;t.addColumn("string","option"),t.addColumn("number","votes"),t.addRows(o.opts.map(function(t){return[t.option,t.votes]}));var e={is3D:!0,legend:{position:"none"},pieSliceText:"label",backgroundColor:"#eee",chartArea:{left:"3%",top:"3%",width:"94%",height:"94%"},fontName:"Lato"},r=new google.visualization.PieChart(n.find("figure")[0]);r.draw(t,e)}google.charts.setOnLoadCallback(r),angular.element(t).bind("resize",r)}}}],o.voteFocus=["$timeout",function(t){return{restrict:"A",link:function(e,o){t(function(){document.querySelector("vote-create input:focus")||o[0].focus()},0)}}}],o.voteError=[function(){return{restrict:"E",templateUrl:"/templates/vote-error.html",scope:{},controller:"errorCtrl"}}]},{}],4:[function(t,e,o){!function(){google.charts.load("current",{packages:["corechart"]});var e=angular.module("voting",["ng","ngRoute","angular.filter"]),o=t("./controllers"),n=t("./directives"),r=t("./services");for(var l in o)o.hasOwnProperty(l)&&e.controller(l,o[l]);for(var i in n)n.hasOwnProperty(i)&&e.directive(i,n[i]);for(var s in r)r.hasOwnProperty(s)&&e.factory(s,r[s]);e.config(["$routeProvider","$locationProvider",function(t,e){e.html5Mode(!0).hashPrefix(""),t.when("/",{template:"<vote-home></vote-home>"}).when("/my_polls",{template:"<vote-my-polls></vote-my-polls>"}).when("/create_poll",{template:"<vote-create></vote-create>"}).when("/search/:query",{template:"<vote-search></vote-search>"}).when("/poll/:id",{template:"<vote-poll></vote-poll>"}).when("/error/:status",{template:"<vote-error></vote-error>"}).when("/_=_",{redirectTo:"/"}).otherwise({redirectTo:"/error/404"})}])}()},{"./controllers":2,"./directives":3,"./services":5}],5:[function(t,e,o){o.$user=["$http","$flash",function(t,e){var o={},n=!1;return o.loadUser=function(){t.get("/auth/me").then(function(t){o.data=t.data,n||(n=!0,e.setMsg("Welcome, "+t.data.name+"!","success"))},function(t){o.data=null})},o.loadUser(),setInterval(o.loadUser,18e5),o}],o.$flash=["$timeout",function(t){var e={msg:"",type:"success"},o=5e3,n=null;return{getMsg:function(){return e},setMsg:function(r){var l=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"success";return e.msg=r,e.type=l,n&&t.cancel(n),n=t(function(){e.msg=""},o),e},clrMsg:function(){return e.msg="",n&&t.cancel(n),e},setTimeout:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1e4;return o=parseInt(t)||o,e}}}]},{}]},{},[4]);