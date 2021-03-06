<template>
    <div class="calendar" :style="`height:${layers * 30}px`">
        <div class="bg" :style="`width:${bgWidth}`"></div>
        <div :style="`width:${blockStyle.width}`" class="block" v-for="t in tblocks">
            <div class="title">
                <div class="firstday" v-if="t.day === '1'">{{t.month}}</div>
                {{t.title}}
            </div>
            <div v-if="t.columns" class="title-secondary" v-for="tt in t.columns"></div>
        </div>

        <div class="events" v-for="event in _events"
             :style="`display:${event.display};width:${event.width};left:${event.left};background:${event.color};top:${event.top}px;z-index:${event.zIndex}`">
            <Poptip class="event-poptip" :transfer="true" trigger="click" :title="event.title">
                <div class="poptip-body">{{event.title}}</div>
                <div class="api" slot="content">
                    <Row type="flex">
                        <Col span="12">
                        From: </Col>
                        <Col span="12">
                        {{event.begin}}</Col>
                        <Col span="12">
                        To: </Col>
                        <Col span="12">
                        {{event.end}}</Col>
                    </Row>
                    <div class="divider"></div>
                    <Row type="flex">
                        <Col span="24">
                        <Button @click="click1(event.id)" style="width:100%;margin-top:5px;text-align: left;"
                                icon="calendar" size="small">Schedule On Override

                        </Button>
                        </Col>
                        <Col span="24">
                        <Button @click="click2(event.id)" style="width:100%;margin-top:5px;text-align: left;"
                                icon="person" size="small">View profile

                        </Button>
                        </Col>
                    </Row>
                </div>
            </Poptip>
        </div>
        </Poptip>
    </div>
</template>

<script>
    import _ from 'lodash';
    import moment from 'moment';
    import {VueUtil, FormUtil} from '../../../../libs';

    export default{
        name: 'Calendar',
        components: {},
        computed: {
            //...VueUtil(this).select(['Calendar']).state(),

        },
        props: [
            'scope',
            'startTime',
            'cb',
            'events',
            'click1',
            'click2',
            'layers',
        ],

        data(){
            return {
                tblocks: [],
                blockStyle: {},
                _events: [],
                bgWidth: null,
            }
        },
        mounted(){
            this.changeScope(this.scope);
            this.changeEvents();
        },
        watch: {
            scope: 'changeScope',
            startTime: 'changeScope',
            events: 'changeEvents'
        },
        methods: {
            changeEvents(){
            },
            changeRange(){
                let range = {
                    beginTime: this.tblocks[0].time,
                    //结束时间需补充一个分段时间
                    endTime: this.scope === '1d' ? this.tblocks[this.tblocks.length - 1].time.add(4, 'h') : this.tblocks[this.tblocks.length - 1].time.add(1, 'd'),
                };
                let ruler = range.endTime.diff(range.beginTime, 'd', true);

                //计算今天的位置,用于渲染背景
                let bgWidth = ( moment().diff(range.beginTime,'d',true) / ruler * 100);
                if(bgWidth < 0)
                    bgWidth = 0;
                this.bgWidth = bgWidth + '%';
                //计算今天的位置,用于渲染背景
                //计算每个事件条的宽度和偏移量
                if (this.events) {
                    let width;
                    let left;
                    let display = 'block';
                    this._events = _.map(this.events, event => {
                        let b = moment(event.begin);
                        let e = moment(event.end);
                        if (b.isBefore(range.beginTime)) {
                            b = range.beginTime;
                        }
                        if (e.isAfter(range.endTime)) {
                            e = range.endTime;
                        }
                        if (e.millisecond() < range.beginTime.millisecond() || b.millisecond() > range.endTime.millisecond()) {
                            width = 0;
                            left = 0;
                        } else {
                            width = (e.diff(b, 'd', true) / ruler * 100);
                            left = (b.diff(range.beginTime, 'd', true) / ruler * 100);
                            if (width <= 0) width = 0;
                            if (left < 0) left = -20;
                            width = width + '%';
                            left = left + '%';
                        }
                        return {...event, width, left, display};
                    });
                }
                //计算每个事件条的宽度和偏移量
                if (this.cb) {
                    this.cb(range);
                }
            },
            changeScope(){
                switch (this.scope) {
                    case '1d':
                        this.renderDay();
                        break;
                    case '4d':
                        this.render4Day();
                        break;
                    case '1w':
                        this.render1W();
                        break;
                    case '2w':
                        this.render2W();
                        break;
                    case '1m':
                        this.render1M();
                        break;
                }
            },
            cap(dm, time){
                let title = time.format(dm);
                let month = time.format(this.$t('date.month'));
                let smonth = time.format(this.$t('date.smonth'));
                let day = time.format('D');
                return {time, title, month, smonth, day};
            },
            getFirstDay(time){
                return moment(time).add(moment(time).day() - 8,'d');
            },
            renderDayAddSomeDays(begin, addDays){
                if (!_.isNumber(addDays) || addDays < 0)
                    throw new Error('error params [addDays]!');
                const dm = addDays > 14 ? 'D' : 'ddd M/D';
                var times = [];
                for (let i = 0; i < addDays; i++) {
                    let time = moment(begin || new Date()).add(i, 'd');
                    times.push(this.cap(dm, time));
                }
                var blockStyle = {
                    width: (100.0 / times.length) + '%'
                }
                this.blockStyle = blockStyle;
                this.tblocks = times;
                this.changeRange();
            },
            render1W(){ //从选中日期所在周的第一天开始计算
                this.renderDayAddSomeDays(this.getFirstDay(this.startTime).format(this.$t('date.date')), 7);
            },
            render2W(){ //从选中日期所在周的第一天开始计算
                this.renderDayAddSomeDays(this.getFirstDay(this.startTime).format(this.$t('date.date')), 14);
            },
            render1M(){
                this.renderDayAddSomeDays(this.startTime, 31);
            },

            render4Day(){
                this.renderDayAddSomeDays(this.startTime, 4);
            },
            renderDay(){
                let startTime = moment(this.startTime);
                var times = [{
                    title: '00:00',
                    time: _.cloneDeep(startTime),
                    columns: ['01:00', '02:00', '03:00', '04:00']
                }, {
                    title: '04:00',
                    time: _.cloneDeep(startTime.add(4,'h')),
                    columns: ['05:00', '06:00', '07:00', '08:00']
                }, {
                    title: '08:00',
                    time: _.cloneDeep(startTime.add(4,'h')),
                    columns: ['09:00', '10:00', '11:00', '12:00']
                }, {
                    title: '12:00',
                    time: _.cloneDeep(startTime.add(4,'h')),
                    columns: ['13:00', '14:00', '15:00', '16:00']
                }, {
                    title: '16:00',
                    time: _.cloneDeep(startTime.add(4,'h')),
                    columns: ['17:00', '18:00', '19:00', '20:00']
                }, {
                    title: '20:00',
                    time: _.cloneDeep(startTime.add(4,'h')),
                    columns: ['21:00', '22:00', '23:00', '24:00']
                },];

                var blockStyle = {
                    width: (100.0 / times.length) + '%'
                }
                this.blockStyle = blockStyle;
                this.tblocks = times;
                this.changeRange();
            }
            //...VueUtil(this).select(['Calendar']).actions(),
        }
    }
</script>