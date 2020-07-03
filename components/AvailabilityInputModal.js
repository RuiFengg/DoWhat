import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
} from "react-native";

import { connect } from "react-redux";
import { finalizeTimeline } from "../actions/timeline_actions";
import { AntDesign } from "@expo/vector-icons";
import Timeline from "./Timeline";
import moment from "moment";

/**
 * The modal that shows when user selects each of the individual upcoming plans
 */
const AvailabilityInputModal = ({
    onClose,
    styledDate,
    onFinalize,
    finalizeTimeline,
    allTimings,
}) => {
    const [boardIsFinalized, setBoardIsFinalized] = useState(false);

    const finalizeBoard = () => {
        let finalTiming = [0, 24];
        let startState = allTimings[0].startTime;
        let start = parseInt(
            moment(startState)
                .tz("Asia/Singapore")
                .format("HH:mm")
                .substring(0, 2)
        );
        finalTiming[0] = start;
        let endState = allTimings[0].endTime;
        let val = parseInt(
            moment(endState)
                .tz("Asia/Singapore")
                .format("HH:mm")
                .substring(0, 2)
        );
        let end = val === 0 ? 24 : val;
        finalTiming[1] = end;
        console.log(finalTiming);
        finalizeTimeline(finalTiming);
        onFinalize();
        onClose();
    };

    const renderDoneButton = () => {
        if (boardIsFinalized) {
            return (
                <TouchableOpacity
                    style={[
                        styles.finalizeButton,
                        {
                            borderRadius: 20,
                            backgroundColor: "#e63946",
                            borderWidth: 0.2,
                        },
                    ]}
                    disabled={true}
                    onPress={() => finalizeBoard()}
                >
                    <AntDesign
                        name="check"
                        size={20}
                        style={{ color: "white" }}
                    />
                </TouchableOpacity>
            );
        }
        return (
            <TouchableOpacity
                style={styles.finalizeButton}
                onPress={() => finalizeBoard()}
            >
                <Text>Done</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.modal}>
            <Text style={styles.headerText}>
                Availabilities input for {styledDate}
            </Text>
            <AntDesign
                name="close"
                size={24}
                onPress={() => onClose()}
                style={styles.close}
            />

            <View style={styles.body}>
                <Timeline />
            </View>

            <View style={styles.buttonGroup}>
                {/* {renderInputAvailabilitiesButton()} */}
                {renderDoneButton()}
            </View>
        </View>
    );
};

const mapDispatchToProps = {
    finalizeTimeline,
};

const mapStateToProps = (state) => {
    // Main user's timing
    return {
        userID: state.add_events.userID,
        currUserName: state.add_events.currUserName,
        allTimings: state.timeline.availableTimings,
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AvailabilityInputModal);

const styles = StyleSheet.create({
    modal: {
        flex: 1,
        marginBottom: "20%",
        marginTop: "10%",
        marginLeft: "5%",
        marginRight: "5%",
        backgroundColor: "white",
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 10,
            height: 20,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 10,
    },
    header: {
        flex: 1,
    },
    headerText: {
        fontWeight: "800",
        fontSize: 17,
        marginTop: "15%",
        marginLeft: "4%",
        fontFamily: "serif",
    },
    body: {
        flex: 9,
        margin: 10,
    },
    footer: {
        flex: 1,
        margin: 10,
        marginTop: 0,
        borderWidth: 1,
    },
    buttonGroup: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    finalizeButton: {
        borderWidth: 1,
        borderRadius: 10,
        justifyContent: "center",
        flexDirection: "row",
        alignSelf: "flex-end",
        padding: 5,
        marginRight: 10,
        marginLeft: 10,
    },
    close: {
        position: "absolute",
        left: 330,
        right: 0,
        top: 25,
        bottom: 0,
    },
});
