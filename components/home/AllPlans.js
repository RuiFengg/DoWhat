
import React from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, Dimensions } from "react-native";
import { Card } from 'react-native-elements';
import ListOfPlans from './ListOfPlans';

const AllPlans = (props) => {
    // Test data
    const da =
        <TouchableOpacity onPress={() => alert("hello")}>
            <View style={{ width: Dimensions.get('window').width }}>
                <Card
                    style={{ height: (Dimensions.get('window').height / 2) }}
                    title={'Saturday Morning'}
                >
                    <Text style={{ marginBottom: 10, fontFamily: 'serif' }}>
                        {'Fun and games'}
                    </Text>
                </Card>
            </View>
        </TouchableOpacity>

    const [allPlans, setAllPlans] = React.useState([da, da, da]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}> Upcoming Plans</Text>

            </View>

            <View style={styles.body}>
                <ListOfPlans plans={allPlans} />
            </View>

            <View style={styles.footer}>
                <Button title="Plan activities for me" onPress={() => props.navigation.navigate("DateSelection")} />
                <Button title="Find friends" onPress={() => alert("hello")} />
            </View>

        </View >
    );
}

export default AllPlans;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flex: 1,
        justifyContent: 'center',

    },
    headerText: {
        textAlign: 'center',
        fontWeight: '800',
        fontSize: 20,
    },
    body: {
        flex: 7,
        justifyContent: 'center',
    },
    footer: {
        flex: 1,
    },
});