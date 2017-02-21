import { bindable, containerless } from 'aurelia-framework';
import {
    default as moment
} from 'moment';
import 'fullcalendar';
import 'fullcalendar/dist/locale/zh-cn';

@containerless
export class EmChatSchedule {

    @bindable loginUser;

    show() {
        this.users = window.tmsUsers;
        _.defer(() => {
            $(this.scheduleRef).fullCalendar('today');
            // $(this.scheduleRef).fullCalendar('changeView', 'agendaWeek');
        });
    }

    /**
     * 构造函数
     */
    constructor() {
        this.actorsOpts = {
            onAdd: (addedValue, addedText, $addedChoice) => {},
            onLabelRemove: (removedValue) => {
                if (this.loginUser.username == removedValue) {
                    return false;
                }
            }
        };

        this.subscribe = ea.subscribe(nsCons.EVENT_SCHEDULE_REFRESH, (payload) => {
            $(this.scheduleRef).fullCalendar('refetchEvents');
        });
    }

    /**
     * 当数据绑定引擎从视图解除绑定时被调用
     */
    unbind() {
        this.subscribe.dispose();
    }

    _fetchEvents() {

        // var todayDate = moment().startOf('day');
        // var YM = todayDate.format('YYYY-MM');
        // var YESTERDAY = todayDate.clone().subtract(1, 'day').format('YYYY-MM-DD');
        // var TODAY = todayDate.format('YYYY-MM-DD');
        // var TOMORROW = todayDate.clone().add(1, 'day').format('YYYY-MM-DD');
    }

    attached() {

        $(this.scheduleRef).fullCalendar({
            header: {
                left: 'prev,next today',
                center: '',
                // center: 'title',
                right: 'month,agendaWeek,agendaDay,listWeek'
            },
            height: $(window).height() - 60,
            defaultDate: new Date(),
            defaultView: 'listWeek',
            editable: true,
            eventLimit: true, // allow "more" link when too many events
            navLinks: true,
            // timezone: 'Asia/Shanghai',
            // timezone: 'UTC',
            timezone: 'local',
            dayClick: function(date, jsEvent, view) {

                // alert('Clicked on: ' + date.format());

                // alert('Coordinates: ' + jsEvent.pageX + ',' + jsEvent.pageY);

                // alert('Current view: ' + view.name);

                // // change the day's background color just for fun
                // $(this).css('background-color', 'red');

            },
            eventClick: (calEvent, jsEvent, view) => {
                this.scheduleEditVm.show(calEvent);
            },
            eventMouseover: function(event, jsEvent, view) {},
            eventMouseout: function(event, jsEvent, view) {},
            events: (start, end, timezone, callback) => {

                $.get('/admin/schedule/listMy', {
                    // our hypothetical feed requires UNIX timestamps
                    start: start.unix(),
                    end: end.unix()
                }, (data) => {
                    if (data.success) {
                        this.events = _.map(data.data, (item) => {
                            let event = {
                                id: item.id,
                                title: item.title,
                                actors: item.actors,
                                creator: item.creator
                            };

                            if (item.startDate) {
                                event.start = item.startDate;
                            } else {
                                event.start = new Date().getTime();
                            }

                            if (item.endDate) {
                                event.end = item.endDate;
                            }

                            return event;
                        });
                        callback(this.events);
                    }
                })
            }
        });

        $(this.addRef)
            .popup({
                on: 'click',
                // closable: false,
                inline: true,
                // hoverable: true,
                silent: true,
                // movePopup: false,
                jitter: 300,
                position: 'bottom center',
                delay: {
                    show: 300,
                    hide: 300
                }
            });

        $(this.startRef).calendar({
            today: true,
            endCalendar: $(this.endRef)
        });
        $(this.endRef).calendar({
            today: true,
            startCalendar: $(this.startRef)
        });

        this._reset();
    }

    initMembersUI(last) {
        if (last) {
            _.defer(() => {
                $(this.actorsRef).dropdown().dropdown('clear').dropdown(this.actorsOpts).dropdown('set selected', [this.loginUser.username]);
            });
        }
    }

    clearStartDateHandler() {
        $(this.startRef).calendar('clear');
    }

    clearEndDateHandler() {
        $(this.endRef).calendar('clear');
    }

    addHandler() {

        if (!this.title) {
            toastr.error('日程内容不能为空!');
            return;
        }

        let data = {
            title: this.title,
            actors: $(this.actorsRef).dropdown('get value')
        };

        let start = $(this.startRef).calendar('get date');
        let end = $(this.endRef).calendar('get date');

        if (start) {
            data.startDate = start;
        } else {
            data.startDate = new Date();
        }

        if (end) {
            data.endDate = end;
        }

        // console.log(data);

        $.post('/admin/schedule/create', data, (data, textStatus, xhr) => {
            if (data.success) {
                $(this.scheduleRef).fullCalendar('refetchEvents');
                toastr.success('添加日程成功!');
                this._reset();
                $(this.addRef).popup('hide');
            } else {
                toastr.error(data.data);
            }
        });
    }

    _reset() {
        this.title = '';
        $(this.startRef).calendar('set date', new Date());
        $(this.endRef).calendar('clear');
        $(this.actorsRef).dropdown('clear');
        if (this.loginUser && this.loginUser.username) {
            $(this.actorsRef).dropdown('set selected', [this.loginUser.username]);
        }
    }
}