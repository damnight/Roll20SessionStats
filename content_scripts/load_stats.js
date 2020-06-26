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
    var cur_player = '';
    var cur_session_it = 0;
    var cur_session = '';
    var all_players = {};
    var last_tm = 0;
    var first_run = true;
    var psych;

    console.log(txt_content)
    console.log(all_players)

    //console.log(txt_content);
    txt_content.forEach(msg => {
    /***
     * add player entry 
     */    
        //check if msg has by attribute
        if(msg.getElementsByClassName('by').length > 0){
          cur_player = String(msg.getElementsByClassName('by')[0].innerHTML);

            //check if all_players already has player entry, if not, add it
            if( !(cur_player in all_players) ) {     
                //add player entry
                all_players[cur_player] = {};
            }//if all_players has msg.by

        }//if msg.by exists
    
    /***
     * add session entry
     */
       // console.log('pre sess', all_players[cur_player] , cur_player, all_players)

        //if last_tm-cur_tm > 6h increase session mod for current msg
        //check if msg has by attribute
        if(msg.getElementsByClassName('tstamp').length > 0){
          //get timestamp
          var timestamp = msg.getElementsByClassName('tstamp')[0].innerHTML;
          var date = dateparser(timestamp)
          //compare timestamp
          //console.log(date - last_tm)
          if( (date - last_tm > 22000000) && !first_run){
            cur_session_it++;
          }

          //set last_iteration_date
          last_tm = date;
        }//if msg.by exists

        //session modifier
        cur_session = String('session_' + cur_session_it);
        first_run = false;
        if( !( cur_session in all_players[cur_player] )  ){
          //console.log('add session', cur_player, cur_session)
          all_players[cur_player][cur_session] = [{}];
        }

        //filter rolls and add them to the session
        //all_players[cur_player][cur_session].push( filterRolls(msg) )




        psych = filterRolls(msg)
    });
    console.log(all_players)
    console.log(psych)


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

//Filter Rolls
function filterRolls(msg){
  console.log('filter rolls')
  //find atk roll and dice
  //returns pair (adv-roll) of divs, span inside these have the rolls
  var solo_roll_dmg = msg.getElementsByClassName('sheet-rolltemplate-dmg').getElementsByClassName('sheet-container sheet-damagetemplate').getElementsByClassName('sheet-result').getElementsByClassName('sheet-solo').getElementsByClassName('sheet-damage');
  var adv_roll_dmg = msg.getElementsByClassName('sheet-rolltemplate-dmg').getElementsByClassName('sheet-container sheet-damagetemplate').getElementsByClassName('sheet-result').getElementsByClassName('sheet-adv').getElementsByClassName('sheet-damage');
  var adv_roll_atk = msg.getElementsByClassName('sheet-rolltemplate-atk').getElementsByClassName('sheet-container').getElementsByClassName('sheet-result').getElementsByClassName('sheet-adv');
  var solo_roll_simp = msg.getElementsByClassName('sheet-rolltemplate-simple').getElementsByClassName('sheet-container').getElementsByClassName('sheet-result').getElementsByClassName('sheet-solo');
  var adv_roll_simp = msg.getElementsByClassName('sheet-rolltemplate-simple').getElementsByClassName('sheet-container').getElementsByClassName('sheet-result').getElementsByClassName('sheet-adv');
  var adv_roll_desc = msg.getElementsByClassName('sheet-rolltemplate-dmg').getElementsByClassName('sheet-desc');
  //div not span
  var formula_roll = msg.getElementsByClassName('formula formattedformula').getElementsByClassName('dicegrouping');
  //console.log(adv_roll);
  
  
  
  
  
  return adv_roll;
}

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