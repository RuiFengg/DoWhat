import { ADD_FRIEND, FINALIZE, CHANGE_TIME, CHANGE_INTERVAL } from "./types";
import { cloneElement } from "react";

/**
 *  Action creator that changes the start and end time state
 */
export const change_time = (values) => dispatch => {
    const newState = {
        type: CHANGE_TIME,
        payload: values,

    }
    dispatch(newState);
}

/**
 * Action creator that adds friend's timeline to the list of available timings
 */
export const change_interval = (values) => dispatch => {
    const newState = {
        type: CHANGE_INTERVAL,
        payload: values,
    }

    dispatch(newState);
}
