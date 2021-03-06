/**
 * File for all the reducers invovled in the timeline input feature of the application
 */
import {
    UPDATE_CURR_FOUCS_TIME,
    ADD_FRIEND,
    GO_BACK,
    GO_FORWARD,
    FINALIZE_TIMELINE,
} from "../actions/types";
import moment from "moment-timezone";
/**
 * Keep track of start time, end time and time interval for scheduleing of events
 */
const date = new Date();
const initState = {
    availableTimings: [
        {
            startTime: moment(date).tz("Asia/Singapore"),
            endTime: moment(date).tz("Asia/Singapore"),
        },
    ],
    totalInputs: 0, //Start count from 0, as its used as array index
    currFocus: 0,
    finalTiming: [],
};

const addToTiming = (availableTimings, timeObject) => {
    var newAvailableTimings = availableTimings.slice(); // copy array
    newAvailableTimings.push(timeObject);
    return newAvailableTimings;
};

const updateSelectedTime = (availableTimings, selectedIndex, newTiming) => {
    var newAvailableTimings = availableTimings.slice(); // Copy arry
    newAvailableTimings[selectedIndex] = newTiming; // Change selected timing
    return newAvailableTimings;
};

const decrementIfPossible = (currFocus) => {
    return currFocus <= 0 ? 0 : currFocus - 1;
};

const incrementIfPossible = (currFocus, limit) => {
    return currFocus >= limit ? limit : currFocus + 1;
};

export default function (state = initState, action) {
    switch (action.type) {
        case UPDATE_CURR_FOUCS_TIME:
            return Object.assign({}, state, {
                availableTimings: updateSelectedTime(
                    state.availableTimings,
                    action.index,
                    action.newTiming
                ),
            });

        case ADD_FRIEND:
            return Object.assign({}, state, {
                availableTimings: addToTiming(
                    state.availableTimings,
                    action.payload
                ),
                totalInputs: state.totalInputs + 1,
                currFocus: state.currFocus + 1,
            });

        case GO_BACK:
            return Object.assign({}, state, {
                currFocus: decrementIfPossible(state.currFocus),
            });

        case GO_FORWARD:
            return Object.assign({}, state, {
                currFocus: incrementIfPossible(
                    state.currFocus,
                    state.totalInputs
                ),
            });

        case FINALIZE_TIMELINE:
            return Object.assign({}, state, {
                finalTiming: action.payload,
            });

        default:
            return state;
    }
}
