//  Mootools Events Calendar v0.3.0 (2009-08-05) - http://dansnetwork.com/mootools/events-calendar

/*
  Script: mooECal.js
    Class for creating an events calendar with multiple views
  
  Requires:
    Mootools 1.2.3 Core
    Mootools 1.2.3.1 More
      Tips
      Scroller
      Date

  License:
    MIT-style license.
*/
var Calendar = new Class({
  
  Implements: [Options, Events],
  options: {
    calContainer: 'calBody', // id of the element that the calendar will be "injected" into
    newDate: 0, // used to set the initial selected date to one other than the current day
    view: 'month', // options are: month, week, day - sets the default view
    dayLabels: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'], // used to localize days of week
	monthLabels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], //localize month names
	labels: {'start': 'Start', 'end': 'End', 'allDay': 'All Day', 'monthly': 'By Month', 'weekly': 'By Week', 'daily': 'By Day'},
	iCalLink: false,
	feedPlugin: '', // default (empty string) uses cEvents[] for manual event entry
    feedSpan: 3, // This is the number of months (past and future) of events to retrieve. Not needed for manual event entry using cEvents.
    scroller: true,
    weekStart: 0, // Sets the first day of the week (0 = Sunday and 1 = Monday)
    cEvents: [], //event container
    /*cEvents: [ //simulate JSON feed
      {
        title:'Get Groceries',
        start:'2009-2-05',
        end:'2009-2-06',
        location:'Store'
      },
      {
        title:'Goin Cow Tip\'n',
        start:'2009-2-20T23:30:00-06:00',
        end:'2009-2-20T24:30:00-06:00',
        location:''
      },
      {
        title:'Hair Cut',
        start:'2009-2-22T13:00:00-06:00',
        end:'2009-2-22T13:30:00-06:00',
        location:''
      }
    ]*/
    callback: function(){} // call back function for onComplete of calendar data retrieval
  },
  initialize: function(options){

    this.setOptions(options);
    this.extendDate();
    this.days = this.options.dayLabels;
    this.months = this.options.monthLabels;
	this.labels = this.options.labels;
	this.iCalLink = this.options.iCalLink;
	this.daysInMonth = 30; // can be set with setDaysInMonth(month,year)
    this.options.newDate != 0 ? this.calDate = new Date(this.options.newDate) : this.calDate = new Date();
    this.startingOffset = 0; // determine the offset of the first of the month and Sunday - used for the "month" view
    this.viewStartDate = new Date(); // starting date for current view
    this.viewEndDate = new Date(); // ending date for current view
    this.gotEvents = false; // initial request for the events feed
    this.eventRangeStart = new Date(); //current range of events that have been fetched
    this.eventRangeEnd = new Date();
	this.loadingAnimation = false;
    this.setCalParams();
    switch(this.options.view){
      case 'month':
        this.showMonth();
        break;
      case 'week':
        this.showWeek();
        break;
      case 'day':
        this.showDay();
        break;
      default:
        this.showMonth;
    }
  },
  setDaysInMonth: function(month, year){ // month: must be an integer (0 - 11) year: used to dertermine if leap year exists
    var daysInMonths = new Array(31,28,31,30,31,30,31,31,30,31,30,31);
    if(new Date(year,1,29).getDate() == 29) // determine if leap year
      daysInMonths[1] = 29;
    this.daysInMonth = daysInMonths[month];
  },
  setStartingOffset: function(month,year){ // month: must be an integer (0 - 11)
    this.options.weekStart == 0 ? this.startingOffset = new Date(year,month,1).getDay() : this.startingOffset = (new Date(year,month,1).getMDay());
  },
  setDate: function(day){
    this.calDate.setDate(day);
  },
  setCalParams: function(){
    this.setDaysInMonth(this.calDate.getMonth(), this.calDate.getFullYear());
    this.setStartingOffset(this.calDate.getMonth(), this.calDate.getFullYear());
  },
  showControlsRow: function(calTitle){
    var trC = new Element('tr', {
      'class':'trControls'
    });    
          
    var thC = new Element('th', {
      'colspan': '7',
      'class':'thControls'
    }).inject(trC);
    
    /***added***/
    var optionBox = new Element('tr', {
      'class':'optionBox'
    });
    optionBox.inject(trC,'before');
    /***added***/
    
    var ulControls = new Element('ul',{
      'class':'ulControls'
    }).inject(thC);

    var liNextCal = new Element('li', {
      'class':'liNextCal'
    }).inject(ulControls);

    var aNextCal = new Element('a',{
      'href':'javascript:void(0)',
      'class':'largeArrow-btn nextBtn',
	  'html': '<strong><span class="corpIcon">&nbsp;</span></strong>'
    }).inject(liNextCal);
  
    /***added***/
    var ulViewPicker = new Element('ul',{
        'class':'ulViewPicker'
      }).inject(thC);
        
		if(this.iCalLink)
		{
			var iCalLink = new Element('li', {
              'class':'iCalLink'
            }).inject(ulViewPicker);
              new Element('a',{
                'href':this.iCalLink,
                'class':'aViewCal',
			    'html': '<span>' + this.labels.iCal + '</span>'
            }).inject(iCalLink);
        }
		
		var liMonthPicker = new Element('li', {
          'class':'liMonthPicker'
        }).inject(ulViewPicker);
          new Element('a',{
            'href':'javascript:void(0)',
            'class':'aViewCal',
			'html': '<span>' + this.labels.monthly + '</span>',
            'events':{
              'click':function(){
                this.showMonth()
              }.bind(this)
            }
          }).inject(liMonthPicker);
          
    var liWeekPicker = new Element('li', {
      'class':'liWeekPicker'
    }).inject(ulViewPicker);
      new Element('a',{
        'href':'javascript:void(0)',
        'class':'aViewCal',
		'html': '<span>' + this.labels.weekly + '</span>',
        'events':{
          'click':function(){
            this.showWeek()
          }.bind(this)
        }
      }).inject(liWeekPicker);
          
    var liDayPicker = new Element('li', {
      'class':'liDayPicker'
    }).inject(ulViewPicker);
      new Element('a',{
        'href':'javascript:void(0)',
        'class':'aViewCal',
		'html': '<span>' + this.labels.daily + '</span>',
        'events':{
          'click':function(){
            this.showDay()
          }.bind(this)
        }
      }).inject(liDayPicker);
    /***added***/
                        
      var liHeaderCal = new Element('li', {
        'class':'liHeaderCal'
      }).set('html',calTitle).inject(ulControls);
      var liPrevCal = new Element('li', {
        'class':'liPrevCal'
      }).inject(ulControls);
        var aPrevCal = new Element('a',{
          'href':'javascript:void(0)',
          'class':'largeArrow-btn prevBtn',
		  'html': '<strong><span class="corpIcon">&nbsp;</span></strong>'
        }).inject(liPrevCal);
		
      var liLoading = new Element('li', {
        'class':'liLoading'
      }).inject(ulControls);
      this.loadingAnimation = new Element('span',{
		  'class': 'animation',
          'styles':{
            'visibility':'hidden'
          },
          'id':'loading'
        }).inject(liLoading);
    
    switch(this.options.view){
      case 'month':
        aPrevCal.addEvent('click',function(){
          this.showPrevMonth()
        }.bind(this));
        aNextCal.addEvent('click',function(){
          this.showNextMonth()
        }.bind(this));
        break;
      case 'week':
        aPrevCal.addEvent('click',function(){this.showPrevWeek()}.bind(this));
        aNextCal.addEvent('click',function(){this.showNextWeek()}.bind(this));
        break;
      case 'day':
        aPrevCal.addEvent('click',function(){this.showPrevDay()}.bind(this));
        aNextCal.addEvent('click',function(){this.showNextDay()}.bind(this));
        break;
    }
    return trC;
  },
  showDowRow: function(){
    var tr = new Element('tr',{
      'class':'dowRow'
    });
    
	for (var i = 0; i < 7; i++){
	  var th = new Element('th');
      if (this.options.weekStart == 0) {
        th.set('text', this.days[i]).inject(tr);
      }
      else{
        var j = 0;
        if(i == 6){
          j = 0;
        }
        else{
          j = i+1;
        }
        th.set('text',this.days[j]).inject(tr);
      }
	  
	  if(i == 6) th.addClass('last');
    }
      
    return tr;
  },
  showNextMonth: function(){
    this.calDate.nextMonth();
    this.setCalParams();
    this.showMonth();
  },
  showPrevMonth: function(){
    this.calDate.prevMonth();
    this.setCalParams();
    this.showMonth();
  },
  showMonth: function(){
    $(this.options.calContainer).set('html','');
    this.options.view = 'month';
    var table = new Element('table',{
      'cellspacing':'0',
      'class':'mooECal',
      'id':'monthCal'
    });
    var thead = new Element('thead').inject(table);
    var tbody = new Element('tbody').inject(table);
    
    this.showControlsRow(this.months[this.calDate.getMonth()]+' '+this.calDate.getFullYear()).inject(thead);
    
    this.showDowRow().inject(thead);
    
    var calDone = false;
    for (var i = 0; i < 6; i++){
      if(calDone){
        break;
      }
      var tr = new Element('tr',{'class':'montlhy-week'}).inject(tbody); // create weeks
      for (var j = 0; j < 7; j++) {
        var day = ((j+1) + (i*7)) - this.startingOffset;

        var td = new Element('td',{'class':'monthly-day day-box','id':'day'+day, 'html':'<div class="day-content"></div>'}).inject(tr); // create days
        if(j == 6) td.addClass('last');
		if (day > 0 && day <= this.daysInMonth) {
          td.set({
            events: {
              'mouseover': function(){this.addClass('hover')},
              'mouseout': function(){this.removeClass('hover')},
              'dblclick': function(e){
                this.setDate(e.target.retrieve('date'));
                this.showDay();
              }.bind(this)
            }
          });
          new Element('span',{'text':day, 'class':'date-label'}).store('date',day).inject(td.getElement('.day-content'));
          td.store('date',day);
          td.addEvent('click', function(){
            $$('td.monthly-day').each(function(td){td.removeClass('selected')});
            this.addClass('selected');
          });
          td.addEvent('click',function(e){
            this.setDate(e.target.retrieve('date'))
          }.bind(this));
          new Element('div', {'class':'events-container'}).store('date',day).inject(td);
          if(day == this.calDate.getDate()) //set background color for current day
            td.addClass('selected');
          if(day == this.daysInMonth)
            calDone = true;
        }
        else {
          td.set('html', '&nbsp;'); // IE won't show td borders without something in the cell
		  td.addClass('other-month');
        }
      }
    }
    
    this.viewStartDate.setTime(this.calDate.valueOf());
    this.viewStartDate.setDate(1);
    this.viewEndDate.setTime(this.calDate.valueOf());
    this.viewEndDate.setDate(this.daysInMonth);
    this.viewStartDate.clearTime();
    this.viewEndDate.endOfDay();
    
    table.inject($(this.options.calContainer));
    this.getCalEvents();
    
  }, // end of showMonth
  showNextWeek: function(){
    var nWeek = this.calDate.getDate();
    this.calDate.setDate(nWeek+7)
    this.setCalParams();
    this.showWeek();
  },
  showPrevWeek: function(){
    var pWeek = this.calDate.getDate();
    this.calDate.setDate(pWeek-7)
    this.setCalParams();
    this.showWeek();
  },
  showWeek: function(){
    var wDate = new Date(this.calDate);
    var dow = this.options.weekStart == 0 ? wDate.getDay() : wDate.getMDay();
    wDate.setDate(wDate.getDate()-dow);
    var lastDay = new Date(wDate); // used for header info(last day of the week)
    lastDay.setDate(lastDay.getDate()+6);
    
    $(this.options.calContainer).set('html', '');
    this.options.view = 'week';
    var table = new Element('table', {
      'cellspacing':'0',
      'class':'mooECal',
      'id': 'weekCal'
    });
    var thead = new Element('thead').inject(table);
    var tbody = new Element('tbody').inject(table);
      
    this.showControlsRow(this.months[wDate.getMonth()]
      + ' ' + wDate.getDate() + ', ' + wDate.getFullYear() + '&nbsp; - &nbsp;'
      + this.months[lastDay.getMonth()]
      + ' ' + lastDay.getDate() + ', ' + lastDay.getFullYear()).inject(thead);
    
    this.viewStartDate.setTime(wDate.valueOf());
    this.viewEndDate.setTime(lastDay.valueOf());
    this.viewStartDate.clearTime();
    this.viewEndDate.endOfDay();
      
    this.showDowRow().inject(thead);
    
    var trWeek = new Element('tr',{'class':'weekly-week'}).inject(tbody); // create week
    for(var i = 0; i < 7; i++){
      var td = new Element('td',{
        'class':'weekly-day day-box',
        'id':'day'+wDate.getDate(),
		'html':'<div class="day-content"></div>'
      }).inject(trWeek); // create days
      if(i == 6) td.addClass('last');
	  td.set({
        events: {
          'mouseover': function(){
            this.addClass('hover')
          },
          'mouseout': function(){
            this.removeClass('hover')
          },
          'dblclick': function(e){
            this.setDate(e.target.retrieve('date'));
            this.showDay();
          }.bind(this)
        } 
      });
      new Element('span',{'text':wDate.getDate(), 'class':'date-label'}).store('date',wDate.getDate()).inject(td.getElement('.day-content'));
      td.store('date',wDate.getDate());
      td.addEvent('click', function(){
        $$('td.weekly-day').each(function(td){
          td.removeClass('selected')
        });
        this.addClass('selected');
      });
      td.addEvent('click',function(e){
        this.setDate(e.target.retrieve('date'))
      }.bind(this));
      new Element('div', {'class':'events-container'}).store('date',wDate.getDate()).inject(td);
      if(wDate.getDate() == this.calDate.getDate()) //set background color for current day
        td.addClass('selected');
      wDate.setDate(wDate.getDate()+1);
    }
    table.inject($(this.options.calContainer));
    this.getCalEvents();
  }, //end of showWeek
  showNextDay: function(){
    var nDay = this.calDate.getDate();
    this.calDate.setDate(nDay+1)
    this.setCalParams();
    this.showDay();
  },
  showPrevDay: function(){
    var pDay = this.calDate.getDate();
    this.calDate.setDate(pDay-1)
    this.setCalParams();
    this.showDay();
  },
  showDay: function(){
    $(this.options.calContainer).set('html', '');
    this.options.view = 'day';
    var table = new Element('table', {
      'cellspacing':'0',
      'class':'mooECal',
      'id': 'dayCal'
    });
    var thead = new Element('thead').inject(table);
    var tbody = new Element('tbody').inject(table);
    
    this.showControlsRow(this.days[this.calDate.getDay()]+' - '+this.months[this.calDate.getMonth()]
      + ' ' + this.calDate.getDate() + ', ' + this.calDate.getFullYear()).inject(thead);
    
    var trDay = new Element('tr').inject(tbody);
    var td = new Element('td',{
      'class':'daily-day day-box',
	  'colspan':'7',
      'id':'day'+this.calDate.getDate()
    }).inject(trDay); // create day
    new Element('div',{
      'class':'day-content'
    }).inject(td);
    
    table.inject($(this.options.calContainer));
    this.viewStartDate.setTime(this.calDate.valueOf());
    this.viewEndDate.setTime(this.calDate.valueOf());
    this.viewStartDate.clearTime();
    this.viewEndDate.endOfDay();
    this.getCalEvents();
  }, //end of showDay
  getCalEvents: function(){
    if ((!this.gotEvents || this.viewStartDate < this.eventRangeStart || this.viewEndDate > this.eventRangeEnd) && this.options.feedPlugin != '') {
      this.eventRangeStart.setTime(this.viewStartDate.getTime());
      this.eventRangeEnd.setTime(this.viewEndDate.getTime());
      this.eventRangeStart.setMonth(this.eventRangeStart.getMonth()-this.options.feedSpan);
      this.eventRangeEnd.setMonth(this.eventRangeEnd.getMonth()+this.options.feedSpan);
      $('loading').fade('in');
      this.options.feedPlugin.getEvents(this,this.eventRangeStart,this.eventRangeEnd)
    }
    else {
      this.loadCalEvents();
    }
  },
  loadCalEvents: function(){
    var StartDate = this.viewStartDate;
    var EndDate = this.viewEndDate;

    var thisYear = this.calDate.getFullYear();
    var thisMonth = this.calDate.getMonth() + 1;
    var cbFunc = this.options.callback;
	
	var labels = this.labels;
	
    send_url = '/index.php?q=news/get_calendar_data/' + thisYear + '/' + thisMonth;
    
	var loadingAnimation = this.loadingAnimation;
	loadingAnimation.setStyle('visibility','visible');
	
	var request = new Request({
      method: 'get',
      url: send_url,
      onComplete: function(response) {
        var thisEvents = eval(response);

        var time = '';
        $$('div.tip').each(function(divs){divs.getParent().destroy();});
        for (var i = 0; i < thisEvents.length; i++){
          var eStart = new Date().clearTime();
          var eEnd = new Date().clearTime();
          eStart.parse(thisEvents[i].start);
          eEnd.parse(thisEvents[i].end);

          var fStart = new Date().clearTime();
          var fEnd = new Date().clearTime();
          fStart.parse(thisEvents[i].start);
          fEnd.parse(thisEvents[i].end);

          eStartTime = eStart.thTime();
          eEndTime = eEnd.thTime();

//          if((eStart >= StartDate && eStart <= EndDate) || (eEnd >= StartDate && eEnd <= EndDate)){
          if((eStart >= StartDate && eStart <= EndDate) || (eEnd >= StartDate && eEnd <= EndDate) || (eStart <= StartDate && eEnd >= EndDate)) {
            while(eStart <= eEnd) {
              if (eStart >= StartDate && eStart <= EndDate) {

                var cDay = eStart.getDate();
                var cMonth = eStart.getMonth();
                var cYear = eStart.getFullYear();

                dd = new Date(cYear, cMonth, cDay);
                cTime = dd.getTime();
                fStartTime =  fStart.getTime();
                fEndTime = fEnd.getTime();

                var sDur = (cTime+86400000-fStartTime)/(3600*1000);
                var eDur = (cTime+86400000-fEndTime)/(3600*1000);

                if (sDur <= 24 && sDur > 0 && eDur <= 24 && eDur > 0)
                  time='<em class="time">' + labels.start + ': ' + eStartTime + '</em><br /><em class="time">' + labels.end + ': ' + eEndTime + '</em>';
                else if (sDur <= 24 && sDur > 0 )
                  time='<em class="time">' + labels.start + ': ' + eStartTime + '</em>';
                else if (eDur <= 24 && eDur > 0)
                  time='<em class="time">' + labels.end + ': ' + eEndTime + '</em>';
                else
                  time='<em class="time">' + labels.allDay + '</em>';

                var eventDiv = new Element('a', {
                  'html': '<span class="event-content"><strong class="title">' + thisEvents[i].title + '</strong>' + time + '</span>',
				  'class':'event-box',
				  'href': thisEvents[i].url
                }).store('date', eStart.getDate()).inject($('day' + eStart.getDate()).getChildren('div')[0]);

                if (this.options.view != 'month') // the month view only shows a portion of the event description
                  eventDiv.addClass('fullEvent');
                else {
                  if (this.options.scroller)
                    new Scroller($('day' + eStart.getDate()).getChildren('div')[0], {
                      'area': 20
                    }).start(); //add Scroller to month view days
                  new Tips(eventDiv, {
                    onShow: function(tip){
                      tip.setStyle('opacity', '0.9');
                    }
                  });
                  eventDiv.store('tip:title', time).store('tip:text', thisEvents[i].title + '<br /><i>' + thisEvents[i].location + '</i>');
                }
              }
              eStart.increment();
            }
          }
        }
		loadingAnimation.setStyle('visibility','hidden');
        cbFunc();
      }
    }).send();
  },
  extendDate: function(){ // this section could also be implemented with MooTools::Implement (no pun intended)
    function prevMonth(){
      var thisMonth = this.getMonth();
      this.setMonth(thisMonth-1);
      if(this.getMonth() != thisMonth-1 && (this.getMonth() != 11 || (thisMonth == 11 && this.getDate() == 1))){
        this.setDate(0);
      }
    };
    function nextMonth(){
      var thisMonth = this.getMonth();
      this.setMonth(thisMonth+1);
      if(this.getMonth() != thisMonth+1 && this.getMonth() != 0)
        this.setDate(0);
    };
    function endOfDay(){
      this.setHours(23);
      this.setMinutes(59);
      this.setSeconds(59);
      this.setMilliseconds(999);
    };
    function getMDay(){ // the equivalent of Date.getDay() for weeks starting on Monday
      if(this.getDay() == 0)
        return 6;
      else
        return this.getDay() - 1;
    };
    function ymd(){
      return this.format('%Y-%m-%d');
    }
    function thTime(){ // twelve hour time
/*
      var ampm = this.format('%p').toLowerCase();
      return this.format('%I:%M'+ampm);
*/
//      var ampm = this.format('%p').toLowerCase();
      return this.format('%H:%M');
    }

    Date.prototype.nextMonth = nextMonth;
    Date.prototype.prevMonth = prevMonth;
    Date.prototype.endOfDay = endOfDay;
    Date.prototype.getMDay = getMDay;
    Date.prototype.ymd = ymd;
    Date.prototype.thTime = thTime;
  }
  
});

