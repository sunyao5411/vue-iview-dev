/**
 * Created by binwang on 17/8/16.
 */
const menus = [{
    "id": 1,
    "title": "Incidents",
    "icon": "desktop",
    "path": "/desktop",
    "role": "1",
}, {
    "id": 4,
    "title": "Alerts",
    "icon": "user",
    "role": "2",
}, {
    "id": 8,
    "title": "Configuration",
    "icon": "setting",
    "group": "soft",
    "role": "3",
    "children": [

        {"id": 9, "title": "Schedules", "path": "/service_management"}, {
            "id": 10,
            "title": "Services",
            "path": "/services"
        }, {"id": 11, "title": "Escalation Policies", "path": "/event_source_management"}, {
            "id": 12,
            "title": "Users",
            "path": "/strategy_management"
        }, {
            "id": 13, "title": "Teams", "path": "/teams"
        }, {
            "id": 14, "title": "API Access", "path": "/api_access"
        }, {
            "id": 15, "title": "Extensions", "path": "/extensions"
        }, {
            "id": 16, "title": "Account Settings", "path": "/account_settings"
        }, {"id": 17, "title": "Analytics", "path": "/analytics"}

    ]
}, {


    "id": 18,
    "title": "Analytics",
    "group": "audit",
    "role": "4",
    "icon": "area-chart",
    "children": [{"id": 19, "title": "Reports", "path": "/reports"}, {
        "id": 20,
        "title": "Postmortems",
        "path": "/postmortems"
    }]
}, {
    "id": 21,
    "title": "Command Console",
    "group": "opt",
    "path":"/command_console",
    "role": "5",
    "icon": "setting",

}];

export default menus;