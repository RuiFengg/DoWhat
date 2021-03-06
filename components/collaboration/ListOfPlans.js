import React, { useState } from "react";
import { connect } from "react-redux";
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    SectionList,
    Modal,
    Alert,
} from "react-native";
import IndividualPlanModal from "./IndividualPlanModal";
import ChatRoomModal from "./ChatRoomModal";
import firebase from "../../database/firebase";
import { findOverlappingIntervals } from "../../reusable-functions/OverlappingIntervals";
import { Overlay } from "react-native-elements";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { formatDate } from "../DateSelection";
import { setAddingFavouritesToExistsingBoard } from "../../actions/favourite_event_actions";

/**
 * The <SectionList> Component within the AllPlans component. This is the component
 * which shows all the plans that the user is part of.
 */
const ListOfPlans = ({
    plans,
    navigation,
    userID,
    allEvents,
    addingFavourite,
    event,
    setAddingFavouritesToExistsingBoard,
}) => {
    const [boardModalVisibility, setBoardModalVisibility] = useState(false);
    const [boardDetails, setBoardDetails] = useState({});
    const [boardChatRoomVisibility, setBoardChatRoomVisibility] = useState(
        false
    );

    const closeModal = () => {
        setBoardModalVisibility(false);
    };

    const closeChatModal = () => {
        setBoardChatRoomVisibility(false);
    };

    // To open each individual collaboration board modal
    const viewMoreDetails = (board) => {
        setBoardDetails(board); // Pass in the details of the clicked board to the modal
        setBoardModalVisibility(true);

        // Once board is opened, its no longer considered a new board
        firebase
            .database()
            .ref("collab_boards/" + board.boardID)
            .update({ isNewlyAddedBoard: false });
    };

    // To open each individual collaboration board ChatRoom
    const viewBoardChatRoom = (board) => {
        setBoardDetails(board); // Pass in the details of the clicked board to the modal
        setBoardChatRoomVisibility(true);
    };

    /**
     * @param {*} topNumber is the limit of how many categories we want
     */
    const getTopVoted = (category, topNumber) => {
        var sortable = []; //2D Array to be used for sorting by ratings
        var count = 0;

        for (var prop in category) {
            sortable.push([prop, category[prop]]);
            count++;
        }
        // Votes stored in index '1' of each inner array
        sortable.sort((x, y) => {
            return y[1] - x[1];
        });

        var final = [];
        for (var i = 0; i < topNumber; i++) {
            final.push(sortable[i][0]); // Get the names only
        }
        return final;
    };

    const handleRouteToFinalized = (board) => {
        firebase
            .database()
            .ref("collab_boards/" + board.boardID)
            .once("value")
            .then((snapshot) => {
                const currBoard = snapshot.val();
                const finalizedTimeline = board.finalized_timeline;
                goToFinalized(currBoard, finalizedTimeline, board);
            });
    };

    // Out of all suggestions, get the one with most votes
    const getTopVotedFavouriteEvent = (allVotedFavourites) => {
        if (allVotedFavourites == undefined) return {}; // No favourites added

        const topVotedEventKey = Object.keys(allVotedFavourites).reduce(
            (x, y) => {
                const event1 = allVotedFavourites[x];
                const event2 = allVotedFavourites[y];

                return event1.votes > event2.votes ? x : y;
            }
        );
        return allVotedFavourites[topVotedEventKey];
    };

    const goToFinalized = (
        boardFromFirebase,
        finalizedTimeline,
        boardFromParent
    ) => {
        const accessRights = boardFromParent.isUserHost ? "host" : "attendee";

        const topVotedFavouriteEvent = [
            getTopVotedFavouriteEvent(boardFromFirebase.favourites),
        ]; // Format in array for loading.js function
        const topGenres = getTopVoted(boardFromFirebase.preferences, 3);
        var topCuisines = getTopVoted(
            boardFromFirebase.food_filters.cuisine,
            3
        );
        topCuisines = topCuisines.map(
            (item) => item.charAt(0).toUpperCase() + item.slice(1)
        ); // Capitalize first letter

        var topArea = getTopVoted(boardFromFirebase.food_filters.area, 1);
        topArea = topArea.map(
            (item) => item.charAt(0).toUpperCase() + item.slice(1)
        ); // Capitalize first letter

        const topPrice = getTopVoted(
            boardFromFirebase.food_filters.price,
            1
        )[0];
        const timeInterval = findOverlappingIntervals(
            boardFromFirebase.availabilities,
            undefined
        );
        const myFilters = {
            area: topArea,
            cuisine: topCuisines,
            price: topPrice,
        };

        var navigationProps = {
            route: "board",
            genres: topGenres,
            timeInterval: timeInterval,
            filters: myFilters,
            board: boardFromFirebase, // for Gcal Invite
            boardID: boardFromParent.boardID,
            currentEvents: finalizedTimeline,
            access: accessRights, // 'host' | 'attendee'
            topVotedEvent: topVotedFavouriteEvent, // If anyone adds suggestions and votes casted
            //userLocation:
        };
        console.log(
            "navigation props time interval: ",
            navigationProps.timeInterval
        );
        navigation.navigate("Loading", navigationProps);
    };

    // Fraction of invitees that have finalized their collaboration inputs
    const getFinalizedFraction = (board) => {
        var noOfRejectees = 0;
        if (board.hasOwnProperty("rejected")) {
            noOfRejectees = Object.keys(board.rejected).length;
        }

        if (board.hasOwnProperty("finalized")) {
            const total = Object.keys(board.invitees).length + noOfRejectees;
            const confirmed = Object.keys(board.finalized).length;
            return confirmed / total;
        } else {
            return 0;
        }
    };

    const addFavouriteToCollab = (allEvents, boardID) => {
        var updates = {};
        allEvents.forEach((event) => {
            // Add all selected favourites
            var cleanedEvent = event[0];
            delete cleanedEvent.favourited;
            delete cleanedEvent.selected;
            updates["/favourites/" + cleanedEvent.id] = cleanedEvent;
        });

        setAddingFavouritesToExistsingBoard(false); // Reset redux state after adding to collab

        firebase.database().ref("collab_boards").child(boardID).update(updates);

        navigation.navigate("Plan"); //Done adding
    };

    const handleAddFavourite = (allEvents, boardID) => {
        Alert.alert(
            "Add to collaboration",
            "Would you like to add this favourite event as a suggestion in this collaboration?",
            [
                {
                    text: "No",
                    onPress: () =>
                        navigation.navigate("Plan", { addingFavourite: false }),
                    style: "cancel",
                },
                {
                    text: "Yes",
                    onPress: () => addFavouriteToCollab(allEvents, boardID),
                },
            ],
            { cancelable: true }
        );
    };

    const renderCollaborationBoard = (board) => {
        const isBoardFinalized = getFinalizedFraction(board) == 1;
        const selectedDate = new Date(board.selected_date);
        const formattedDate = formatDate(
            selectedDate.getDay(),
            selectedDate.getMonth(),
            selectedDate.getDate()
        );

        const boardTitleString = () => {
            return isBoardFinalized
                ? "Timeline generated"
                : board.isNewlyAddedBoard
                ? "Newly added board"
                : "Collaboration in progress";
        };

        const boardSubTitleString = () => {
            return isBoardFinalized
                ? "Your schedule is ready to view!"
                : board.isNewlyAddedBoard
                ? "Check me out!"
                : "Wait for all your friends to finalize their input!";
        };

        const cardColorStyle = () => {
            return isBoardFinalized
                ? { backgroundColor: "#eddcd2" }
                : board.isNewlyAddedBoard
                ? {
                      backgroundColor: "white",
                      borderColor: "#eddcd2",
                      borderWidth: 4,
                      elevation: 1,
                  }
                : { backgroundColor: "white" };
        };

        // generateFinalizedTimeline(board, isBoardFinalized)
        return (
            <TouchableOpacity
                onPress={() =>
                    addingFavourite
                        ? handleAddFavourite(event, board.boardID) // Event comes from home feed favourite event
                        : isBoardFinalized
                        ? handleRouteToFinalized(board)
                        : viewMoreDetails(board)
                }
            >
                <View style={[styles.individualPlan, cardColorStyle()]}>
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                        }}
                    >
                        <View>
                            <Text style={styles.sectionSubHeaderText}>
                                {formattedDate}
                            </Text>
                        </View>
                        <Text style={styles.sectionSubHeaderText}>
                            By{" "}
                            {board.isUserHost
                                ? "Me"
                                : board.host.replace(/_/g, " ")}
                        </Text>
                    </View>

                    <Text style={styles.sectionHeaderText}>
                        {boardTitleString()}
                    </Text>
                    <Text style={styles.sectionSubHeaderText}>
                        {boardSubTitleString()}
                    </Text>

                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            marginTop: "12%",
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "flex-start",
                                marginTop: 2,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 11,
                                    borderWidth: 0.2,
                                    padding: 2,
                                    backgroundColor: "#E86830",
                                    borderColor: "grey",
                                    borderRadius: 5,
                                    textAlign: "center",
                                    paddingLeft: 5,
                                    paddingRight: 5,
                                    color: "#FEFBFA",
                                    marginBottom: 15,
                                }}
                            >
                                {Object.keys(board.finalized).length}/
                                {Object.keys(board.invitees).length +
                                    (board.hasOwnProperty("rejected")
                                        ? Object.keys(board.rejected).length
                                        : 0)}
                            </Text>
                            <Text
                                style={[
                                    styles.sectionSubHeaderText,
                                    { color: "#554E4E" },
                                ]}
                            >
                                {" "}
                                responded
                            </Text>
                        </View>

                        <View style={{ flexDirection: "row" }}>
                            <TouchableOpacity
                                onPress={() => viewBoardChatRoom(board)}
                            >
                                <MaterialCommunityIcons
                                    name="chat"
                                    color={"black"}
                                    size={25}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container]}>
            <Overlay
                isVisible={boardModalVisibility}
                windowBackgroundColor="rgba(255, 255, 255, .5)"
                width="auto"
                height="auto"
                overlayStyle={{ width: "95%", height: "95%", borderRadius: 20 }}
            >
                <IndividualPlanModal
                    onClose={closeModal}
                    board={boardDetails}
                />
            </Overlay>

            <Modal
                animationType="fade"
                transparent={false}
                visible={boardChatRoomVisibility}
                onRequestClose={() => {
                    closeChatModal();
                }}
            >
                <ChatRoomModal onClose={closeChatModal} board={boardDetails} />
            </Modal>

            <SectionList
                progressViewOffset={100}
                sections={[{ title: "", data: plans }]}
                renderItem={({ item }) => renderCollaborationBoard(item)}
                keyExtractor={(item, index) => index}
            />
        </View>
    );
};

const mapDispatchToProps = {
    setAddingFavouritesToExistsingBoard,
};

const mapStateToProps = (state) => {
    return {
        allEvents: state.add_events.events,
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ListOfPlans);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    individualPlan: {
        borderWidth: 0.1,
        borderRadius: 10,
        start: "10%",
        width: "80%",
        height: 150,
        padding: 10,
        marginTop: 10,
        paddingBottom: 5,
    },
    headerText: {
        textAlign: "center",
        fontWeight: "800",
        fontSize: 20,
    },
    sectionHeaderText: {
        color: "#4f4f4f",
        fontSize: 15,
        fontWeight: "bold",
        marginTop: 15,
    },
    sectionSubHeaderText: {
        fontSize: 12,
        color: "#A4A4A6",
        fontWeight: "100",
    },
    icon: {
        borderWidth: 1,
        padding: 5,
        paddingLeft: 10,
        paddingRight: 10,
        borderRadius: 50,
    },
    footer: {
        flex: 1,
    },
});
