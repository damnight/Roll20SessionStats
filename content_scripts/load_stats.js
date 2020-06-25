//console.log(content.document.getElementsByClass('message general'))
(function() {
    //check if content script is already running, if so return => no duplicate runs
    if (window.hasRun) {
        return;
      }
      window.hasRun = true;

    //load messages
    console.log('load_stats23');
    var txt_content = document.getElementById('textchat').getElementsByClassName('content')[0].childNodes;
    //console.log(txt_content[195])
    //sort messages by user and sessions
    var in_cur_player
    var cur_session
    var all_players = {};
    // all_players = '{"players":[ \
    //                     {"playername: ""test", "session:""[ \
    //                         {"0: ""[ \
    //                             {"dice: ""1d6", "result: ""4"} \
    //                         ]"}]"}],';
    all_players.players = [];
    console.log(txt_content)

    //console.log(txt_content);
    txt_content.forEach(msg => {
    /***
     * add player entry 
     */    
        //check if msg has by attribute
        if(msg.getElementsByClassName('by').length > 0){
            
            //check if all_players already has player entry, if not, add it
            if( !(Object.values(all_players.players).includes(msg.getElementsByClassName('by')[0].innerHTML)) ) {     
                //add player entry
                all_players.players.push( msg.getElementsByClassName('by')[0].innerHTML );
                in_cur_player = all_players.players.indexOf(msg.getElementsByClassName('by')[0].innerHTML);
            }//if all_players has msg.by

        }//if msg.by exists
    
    /***
     * add session entry
     */
        //check if msg has by attribute
        if(msg.getElementsByClassName('tstamp').length > 0){
                //get timestamp
                var timestamp = msg.getElementsByClassName('tstamp')[0].innerHTML;
                //console.log(timestamp)
                date = dateparser(timestamp)
                //all_players.players[in_cur_player]['date'].push(timestamp);
                //console.log(date);
        }//if msg.by exists




    });

    console.log(all_players)
    var d1 = dateparser('June 17, 2020 11:55PM');
    var d2 = dateparser('June 17, 2020 5:55PM');
    console.log(d1 - d2)
    //evaluate session stats





  /**
   * Listen for messages from the background script.
   * Call "beastify()" or "reset()".
  */
  browser.runtime.onMessage.addListener((message) => {
    if (message.command === "evaluate_session_stats") {
      run_evaluation();
    }

  });

})();

//Date parser
//Format: June 17, 2020 6:55PM
function dateparser(date_str) {

    var split_space = date_str.split(" ");
    //split_space = [ "June", "17,", "2020", "6:55PM" ]
    
    //year
    var year = parseInt(split_space[2]);
    //month
    var monthIndex = 0;
    switch (split_space[0]){
        case "January": monthIndex = 0;
        break;
        case "February": monthIndex = 1;
        break;
        case "March": monthIndex = 2;
        break;
        case "April": monthIndex = 3;
        break;
        case "May": monthIndex = 4;
        break;
        case "June": monthIndex = 5;
        break;
        case "July": monthIndex = 6;
        break;
        case "August": monthIndex = 7;
        break;
        case "September": monthIndex = 8;
        break;
        case "October": monthIndex = 9;
        break;
        case "November": monthIndex = 10;
        break;
        case "December": monthIndex = 11;
        break;
    }
    //day
    var day = parseInt(split_space[1]);

    //hour and minutes
    var split_hour_min = split_space[3].split(':');
    //[ "11", "55PM" ]
    var am_pm = split_hour_min[1].match(/[A-Z]/g);
    //[ "P", "M" ]
    var tm_hour = parseInt(split_hour_min[0]);
    if(am_pm[0] == 'P') tm_hour += 12;
    var tm_min_temp = split_hour_min[1].match(/[0-9]/g);
    var tm_min = parseInt(tm_min_temp[0] + tm_min_temp[1]);

    //new Date(year, monthIndex [, day [, hour [, minutes [, seconds [, milliseconds]]]]]);
    var date = new Date(year, monthIndex, day, tm_hour, tm_min)
    return date;
}