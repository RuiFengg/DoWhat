import { DATE_SELECT } from "../actions/types";
import moment from "moment";

const initState = {
    date: new Date(), // Start inital date with current date
    difference: 0,
};

export default function (state = initState, action) {
    switch (action.type) {
        case DATE_SELECT:
            const day_difference =
                moment(action.payload).date() - moment(state.date).date();
            return {
                date: action.payload,
                difference: day_difference,

                //,
            };

        default:
            return state;
    }
}
