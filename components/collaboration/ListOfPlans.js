
import React, { useState } from 'react';
import { Button, View, StyleSheet, Text, TouchableOpacity, SectionList, Dimensions, Modal } from 'react-native';
import IndividualPlanModal from './IndividualPlanModal';
import { AntDesign } from "@expo/vector-icons";
import * as Progress from 'react-native-progress';

/**
 * The <SectionList> Component within the AllPlans component. This is the component
 * which shows all the plans that the user is part of.
 */
const ListOfPlans = ({ plans, refreshList, navigation }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [modalVisibility, setModalVisibility] = useState(false);
    const [boardDetails, setBoardDetails] = useState({})

    // Not functional yet
    const refreshPage = () => {
        setIsRefreshing(true);
        refreshList();
        setIsRefreshing(false);
    }

    // To open each individual collaboration board modal
    const viewMoreDetails = (board) => {
        setBoardDetails(board); // Pass in the details of the clicked board to the modal
        setModalVisibility(true)

    }

    const goToFinalized = (board) => {
        console.log(board)
        // navigation.navigate("Finalized", {
        //     route: "board",
        //     genres: ["adventure", "food"],
        //     timeInterval: [12, 18],
        //     filters: {
        //         area: ["North", "East"],
        //         cuisine: ["Western", "Asian"],
        //         price: 2
        //     }
        // });
    }

    // Fraction of invitees that have finalized their collaboration inputs
    const getFinalizedFraction = (board) => {
        if (board.hasOwnProperty('finalized')) {
            const total = Object.keys(board.invitees).length;
            const confirmed = Object.keys(board.finalized).length;
            return confirmed / total;
        } else {
            return 0;
        }
    }

    const renderCollaborationBoard = (board) => {
        const finalizedFraction = getFinalizedFraction(board);
        if (finalizedFraction == 1) { // All invitees are ready
            return (
                <View style={styles.individualPlan}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View>
                            <Text>
                                Outing on: {board.selected_date}
                            </Text>
                            <Text>
                                Invited by: {board.host.replace("_", " ")}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => goToFinalized(board)}>
                            <AntDesign
                                name="arrowright"
                                size={30}
                                style={{ color: 'black' }}
                            />
                        </TouchableOpacity>
                    </View>
                    <Progress.Bar progress={finalizedFraction}
                        width={Dimensions.get('window').width - 40}
                        borderWidth={0} unfilledColor={'#f1faee'} color={'#457b9d'} />
                </View>
            )
        }
        return (
            <TouchableOpacity onPress={() => viewMoreDetails(board)}>
                <View style={styles.individualPlan}>
                    <Text>
                        Outing on: {board.selected_date}
                    </Text>
                    <Text>
                        Invited by: {board.host.replace("_", " ")}
                    </Text>
                    <Progress.Bar progress={finalizedFraction}
                        width={Dimensions.get('window').width - 40}
                        borderWidth={0} unfilledColor={'#f1faee'} color={'#457b9d'} />
                </View>
            </TouchableOpacity>
        )
    }

    const closeModal = () => {
        setModalVisibility(false);
    }

    return (
        <View style={styles.container}>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisibility}
                onRequestClose={() => {
                    closeModal()
                }}>
                <IndividualPlanModal onClose={closeModal} board={boardDetails} />
            </Modal>

            <SectionList
                onRefresh={() => refreshPage()}
                progressViewOffset={100}
                refreshing={isRefreshing}
                sections={[
                    { title: "", data: plans },
                ]}
                renderItem={({ item }) => renderCollaborationBoard(item)}
                keyExtractor={(item, index) => index}
            />
        </View >
    );
}

export default ListOfPlans;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    individualPlan: {
        borderWidth: 1,
        borderRadius: 10,
        marginLeft: 10,
        marginRight: 10,
        padding: 10,
        marginTop: 10,
        paddingBottom: 5,
    },
    headerText: {
        textAlign: 'center',
        fontWeight: '800',
        fontSize: 20,
    },
    footer: {
        flex: 1,
    },
})