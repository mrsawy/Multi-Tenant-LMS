"use client"

import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
// import 'react-big-calendar/lib/css/';
// import 'react-big-calendar/lib/addons/dragAndDrop/styles'; // if using DnD
// Setup the localizer by providing the moment (or globalize, or Luxon) Object
// to the correct localizer.
const localizer = momentLocalizer(moment) // or globalizeLocalizer

const MyCalendar = (props: any) => (
    <div className="  p-5   ">
        <Calendar
            localizer={localizer}
            // events={myEventsList}
            startAccessor="start"
            endAccessor="end"
            {...props}
        />
    </div>
)

export default MyCalendar