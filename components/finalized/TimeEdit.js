import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Platform,
    Dimensions,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

const TimeEdit = (props) => {
    const [mode, setMode] = React.useState("date");
    const [show, setShow] = React.useState(false);

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || props.newTime;
        setShow(Platform.OS === "ios");
        props.newTimeChange(currentDate);
    };

    const showMode = (currentMode) => {
        setShow(true);
        setMode(currentMode);
    };

    const showTimepicker = () => {
        showMode("time");
    };

    const windowHeight = Dimensions.get("window").height;

    return (
        <View style={{ flex: 1 }}>
            <TouchableOpacity
                style={{
                    alignItems: "center",
                    backgroundColor: "#708090",
                    height: "100%",
                }}
                onPress={showTimepicker}
            >
                <Text style={{ marginTop: windowHeight / 2, fontSize: 25 }}>
                    Edit Timings
                </Text>
            </TouchableOpacity>

            {show && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={props.newTime}
                    mode={mode}
                    is24Hour={true}
                    display="default"
                    onChange={onChange}
                />
            )}
        </View>
    );
};
export default TimeEdit;