import React from "react";
import { Text, View, Image, ScrollView } from "react-native";
import ReadMore from "react-native-read-more-text";
import { TIH_API_KEY } from "react-native-dotenv";
import Route from "../components/finalized/Route";

/**
 * handles filter for food to be added in data array. Returns array of data that is formatted to be passed as props into
 * timeline library, and timings array of start time and end time of each array, and location of each event
 * @param {array of area price and cuisine the user selected} filters
 * @param {events are all the events}
 */
export const filterHelper = (filters, events) => {
    const genre = filters.cuisine.includes("Hawker")
        ? "hawker"
        : filters.cuisine.includes("Cafe")
        ? "cafes"
        : "restaurants";

    const eventList = events[genre]["list"];
    // so there will be a variety of places to choose from
    let temp = [];
    for (let i = 0; i < eventList.length; i++) {
        const event = eventList[i];
        const cuisineFilter = (element) =>
            event.cuisine.toString().includes(element);
        const areaFilter = (element) => event.tags.includes(element);
        if (genre === "hawker" && filters.area.some(areaFilter)) {
            temp.push(event);
        } else if (
            genre === "cafes" &&
            filters.area.some(areaFilter) &&
            event.price_level == filters.price
        ) {
            temp.push(event);
        } else if (
            genre === "restaurants" &&
            filters.area.some(areaFilter) &&
            event.price_level == filters.price &&
            filters.cuisine.some(cuisineFilter)
        ) {
            temp.push(event);
        }
    }
    if (temp.length == 0) {
        for (let i = 0; i < eventList.length; i++) {
            const event = eventList[i];
            const cuisineFilter = (element) =>
                event.cuisine.toString().includes(element);
            const areaFilter = (element) => event.tags.includes(element);
            if (genre === "hawker" && filters.area.some(areaFilter)) {
                temp.push(event);
            } else if (
                genre === "cafes" &&
                filters.area.some(areaFilter) &&
                event.price_level < filters.price
            ) {
                temp.push(event);
            } else if (
                genre === "restaurants" &&
                filters.area.some(areaFilter) &&
                event.price_level < filters.price &&
                filters.cuisine.some(cuisineFilter)
            ) {
                temp.push(event);
            }
        }
    }
    if (temp.length == 0) {
        let backup = {
            area: filters.area,
            cuisine: ["Hawker", "Cafe"],
            price: 2,
        };
        return filterHelper(backup, events);
    }

    let rand = Math.floor(Math.random() * temp.length);
    return { [genre]: temp[rand] };
};

/**
 * Helper function to generate possible events the user can see on his timeline
 * @param {array of genres selected by the user} userGenres
 * @param {all events stored in redux} events
 * @param {user picked filters} filters
 * @param {today's weather} weather
 * @param {end time range of all participants} endTime
 */
export const genreEventObjectArray = (
    userGenres,
    events,
    filters,
    weather,
    endTime
) => {
    let currentEvents = [];

    // See whether dinner event can be scheduled for the user
    let dinner = 0;
    if (userGenres.includes("food") && endTime >= 18) dinner = 1;

    if (userGenres.includes("food")) {
        const filterObject = filterHelper(filters, events);
        currentEvents.push(filterObject);
    }
    if (weather === "Rain" || weather === "Thunderstorm") {
        for (let i = 0; i < userGenres.length; i++) {
            const genre = userGenres[i] === "food" ? "food" : "indoors";
            if (genre === "indoors") {
                const eventObject = events[genre]["list"];
                const rand = Math.floor(Math.random() * eventObject.length);
                const event = events[genre]["list"][rand];
                currentEvents.push({ [genre]: event });
            }
        }
    } else {
        for (let i = 0; i < userGenres.length; i++) {
            const genre = userGenres[i].toLowerCase();
            if (genre !== "food") {
                const eventObject = events[genre]["list"];
                const rand = Math.floor(Math.random() * eventObject.length);
                currentEvents.push({ [genre]: events[genre]["list"][rand] });
            }
        }
    }
    if (dinner == 1) {
        let obj = filterHelper(
            { area: filters.area, cuisine: ["Hawker", "Cafe"], price: 3 },
            events
        );
        currentEvents.push(obj);
    }
    return currentEvents;
};

/**
 * Returns data needed for the timeline library, a timings array to be used to schedule the calendar and a location array with
 * long lat objects of the events scheduled for the user
 * @param {array that stores the user's available time range} timeline
 * @param {genres the user picked} userGenres
 * @param {database of all events} events
 * @param {food filters the user selected} filters
 */
export const data_timeline = (timeline, events, currentEvents) => {
    const data = [];
    const timingsArray = [];
    let startTime = timeline[0];
    let num = currentEvents.length;
    let locationArray = [];
    // checks if user selected food so dinner will be included if user has time 6pm onwards
    let busRoutes = [];

    // formats data array to be passed into Timeline library
    while (currentEvents.length !== 0) {
        for (let i = 0; i < currentEvents.length; i++) {
            const genre = currentEvents
                .map((x) => Object.keys(x)[0])
                [i].toLowerCase();
            const event = currentEvents[i][genre];
            if (events[genre].slots.includes(startTime)) {
                if (startTime + events[genre]["duration"] > timeline[1]) {
                    break;
                }
                let intervalObject = { start: "", end: "" };
                intervalObject.start = startTime.toString() + ":00";
                locationArray.push({ coord: event.coord, name: event.name });
                busRoutes.push(event.location);

                //data.push({ startTime: startTime, event: event, genre: genre });
                data.push(objectFormatter(intervalObject.start, event, genre));
                currentEvents.splice(i, 1);
                startTime += events[genre]["duration"];

                intervalObject.end =
                    startTime > timeline[1]
                        ? timeline[1].toString() + ":00"
                        : startTime + ":00";
                timingsArray.push(intervalObject);
            }
        }

        if (num === currentEvents.length) {
            startTime++;
        } else {
            num = currentEvents.length; // in case the start time is too early and there are no time slots to schedule
        }
        if (startTime >= timeline[1]) break;
    }
    return [data, timingsArray, locationArray, busRoutes];
};

/**
 * Formats the object to be shown in the reshuffle modal
 * @param {all the events stored in the database} events
 * @param {array of genres that the user selected} genres
 * @param {time interval free period of the user} time
 * @param {genre of the event that the user is reselecting} unsatisfied
 */
export const data_shuffle = (events, genres, time, unsatisfied, filters) => {
    let data = [];
    let selectable = [];
    for (let i = 0; i < genres.length; i++) {
        let type = genres[i].toString().toLowerCase();
        if (type === "food") {
            if (filters.cuisine.includes("Hawker"))
                Array.prototype.push.apply(
                    selectable,
                    events["hawker"]["list"]
                );

            if (filters.cuisine.includes("Cafe"))
                Array.prototype.push.apply(selectable, events["cafes"]["list"]);

            Array.prototype.push.apply(
                selectable,
                events["restaurants"]["list"]
            );
        } else {
            Array.prototype.push.apply(selectable, events[type]["list"]);
        }
    }
    for (let i = 0; i < 3; i++) {
        let randomNumber = Math.floor(Math.random() * selectable.length);
        let event = selectable[randomNumber];

        let obj = objectFormatter(time, event, unsatisfied.toLowerCase());

        // ensure no duplicate objects
        const checkName = (object) => object.title === obj.title;
        if (!data.some(checkName)) data.push(obj);
    }
    return data;
};

/**
 * Creates the object with keys (time, title description) that the timeline library accepts
 */
export const objectFormatter = (startTime, event, genre) => {
    let imageURI = event.image;
    if (imageURI.substring(0, 5) != "https") {
        imageURI =
            "https://tih-api.stb.gov.sg/media/v1/download/uuid/" +
            imageURI +
            "?apikey=" +
            TIH_API_KEY;
    }
    return {
        time: startTime,
        title: event.tags.includes("Indoors")
            ? event.name + " " + "(Indoors)"
            : event.name,

        description: event.location + "\n\n" + event.description,

        lineColor: "#cc5327",
        imageUrl: imageURI,
        genre: genre,
        coord: event.coord,
        location: event.location,
    };
};

/**
 * Formats and renders the details in each block of the timeline
 */
export const renderDetail = (rowData, sectionID, rowID) => {
    const renderTruncatedFooter = (handlePress) => {
        return (
            <Text style={{ color: "#595959" }} onPress={handlePress}>
                Read more
            </Text>
        );
    };

    const renderRevealedFooter = (handlePress) => {
        return (
            <Text style={{ color: "#595959" }} onPress={handlePress}>
                Show less
            </Text>
        );
    };
    let title = (
        <Text
            style={{
                fontSize: 16,
                fontWeight: "bold",
            }}
        >
            {rowData.title}
        </Text>
    );
    let desc = null;
    if (rowData.description && rowData.imageUrl) {
        desc = (
            <View>
                <Image
                    source={{ uri: rowData.imageUrl }}
                    style={{
                        //width: 230,
                        height: 120,
                        borderTopLeftRadius: 25,
                        borderTopRightRadius: 25,
                        //marginTop: 10,
                        //marginLeft: 5,
                    }}
                />
                <View style={{ marginHorizontal: 10, marginVertical: 5 }}>
                    <ReadMore
                        numberOfLines={2}
                        renderTruncatedFooter={renderTruncatedFooter}
                        renderRevealedFooter={renderRevealedFooter}
                    >
                        <Text
                            style={{
                                flex: 1,
                            }}
                        >
                            {title}
                            {"\n"}
                            {rowData.description}
                        </Text>
                    </ReadMore>
                </View>
            </View>
        );
    } else if (rowData.description) {
        desc = (
            <View
                style={{
                    flex: 1,
                    padding: 5,
                }}
            >
                {title}
                <Route item={rowData.description} />
            </View>
        );
    }
    return (
        <View
            style={{
                flex: 1,
                //paddingTop: 10,
                marginBottom: 10,
                //paddingLeft: 15,
                //paddingRight: 15,
                backgroundColor: "white",
                borderRadius: 20,
            }}
        >
            {desc}
        </View>
    );
};
