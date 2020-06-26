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
    var psych = [];

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
        //get rolls and add only valid message rolls to stack
        var roll = filter_rolls(msg)
        if (roll == 0) { 
          //console.log('0')
        } else { 
          psych.push(roll);
        }

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

//
function filter_rolls(msg) {

  var dice_rolls_temp = [];

  var el = get_span_el(msg);
  if ( el == undefined) {
    return 0;
  }
  
  console.log(el)

  //seperately handle each meme
  if (el.length == 2){
    //NOTE these are always 1d20 rolls
    //get diceroll
    var d1 = '1d20';
    var d2 = '1d20';

    //get full diceroll results
    var dr1 = parseInt(el[0].firstElementChild.innerText);
    var dr2 = parseInt(el[1].firstElementChild.innerText);

    //get basic dice roll
    var str1 = el[0].firstElementChild.firstChild.attributes[1].textContent.match(/">([0-9]+)<\/span>\)/g);
    var dr1 = parseInt(str1[0].match(/([0-9]+)/g));

    var str2 = el[1].firstElementChild.firstChild.attributes[1].textContent.match(/">([0-9]+)<\/span>\)/g);
    var dr2 = parseInt(str2[0].match(/([0-9]+)/g));

    dice_rolls_temp.push([d1, dr1])
    dice_rolls_temp.push([d2, dr2])
  } else if (el.length == 1) {
    //handle dicegrouping
    if(el[0].className == "dicegrouping"){
      var d_count = el[0].childElementCount;
      var d_type = parseInt(el[0].firstElementChild.className.match(/(([0-9]+)?d([0-9]+))/g)[0].match(/[0-9]+/g)[0]);
      var d1 = d_count + 'd' + d_type;
      //TODO dice results
      //dice_rolls_temp.push([d1, dr1])
    }

  }


  return dice_rolls_temp;
}//end function


//filter for span element containing the rolls
function get_span_el(msg) {
  //console.log('filter rolls')
  //find atk roll and dice
  //returns pair (adv-roll) of divs, span inside these have the rolls
  try {

    try { 
    var solo_roll_dmg = msg.getElementsByClassName('sheet-rolltemplate-dmg')[0].getElementsByClassName('sheet-container sheet-damagetemplate')[0].getElementsByClassName('sheet-result')[0].getElementsByClassName('sheet-solo')[0].getElementsByClassName('sheet-damage'); 
    return solo_roll_dmg;
    } catch (e) {
      //console.log(e)
    }

    try {
    var adv_roll_dmg = msg.getElementsByClassName('sheet-rolltemplate-dmg')[0].getElementsByClassName('sheet-container sheet-damagetemplate')[0].getElementsByClassName('sheet-result')[0].getElementsByClassName('sheet-adv')[0].getElementsByClassName('sheet-damage');
    return adv_roll_dmg;
    } catch (e) {
      //console.log(e)
    }

    try {
    var adv_roll_atk = msg.getElementsByClassName('sheet-rolltemplate-atk')[0].getElementsByClassName('sheet-container')[0].getElementsByClassName('sheet-result')[0].getElementsByClassName('sheet-adv');
    return adv_roll_atk;
    } catch (e) {
      //console.log(e)
    }
    
    try {
    var solo_roll_simp = msg.getElementsByClassName('sheet-rolltemplate-simple')[0].getElementsByClassName('sheet-container')[0].getElementsByClassName('sheet-result')[0].getElementsByClassName('sheet-solo');
    return solo_roll_simp;
    } catch (e) {
      //console.log(e)
    }
    
    try {
    var adv_roll_simp = msg.getElementsByClassName('sheet-rolltemplate-simple')[0].getElementsByClassName('sheet-container')[0].getElementsByClassName('sheet-result')[0].getElementsByClassName('sheet-adv');
    return adv_roll_simp;
    } catch (e) {
      //console.log(e)
    }
    
    try {
    var adv_roll_desc = msg.getElementsByClassName('sheet-rolltemplate-dmg')[0].getElementsByClassName('sheet-desc');
    return adv_roll_desc;
    } catch (e) {
      //console.log(e)
    }
    
    //div not span
    try {
    var formula_roll = msg.getElementsByClassName('formula formattedformula')[0].getElementsByClassName('dicegrouping');
    return formula_roll;
    } catch (e) {
      //console.log(e)
    } 
    
    //outer try-catch
    } catch (e) {
      //console.log('something went wrong', e);
    }

    
}//end function

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