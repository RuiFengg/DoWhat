import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Card } from "react-native-elements";

const CuisineSelection = ({ handleCuisinePress }) => {
    const [selected, setSelected] = React.useState([]);
    const cuisine = [
        "Asian",
        "Western",
        "Chinese",
        "Korean",
        "Indian",
        "Japanese",
        "Cafe",
        "Local",
    ];

    const handlePress = (cuisine) => {
        selected.includes(cuisine)
            ? setSelected(selected.filter((s) => s !== cuisine))
            : setSelected([...selected, cuisine]);
    };

    const buttons = () =>
        cuisine.map((items) => (
            <TouchableOpacity
                key={items}
                onPress={() => {
                    handlePress(items);
                    handleCuisinePress(selected);
                }}
                style={[
                    styles.button,
                    {
                        backgroundColor: selected.includes(items)
                            ? "silver"
                            : "white",
                    },
                ]}
            >
                <Text
                    style={{
                        fontSize: 16,
                    }}
                >
                    {items}
                </Text>
            </TouchableOpacity>
        ));

    return (
        <View style={{ marginTop: 20 }}>
            <Text style={styles.header}>Cuisine</Text>
            <View style={styles.buttonContainer}>{buttons()}</View>
        </View>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: 10,
        padding: 5,
        borderWidth: StyleSheet.hairlineWidth,
        marginHorizontal: 5,
        marginVertical: 10,
    },
    buttonContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginLeft: 20,
    },
    header: {
        marginLeft: 25,
        fontSize: 20,
        fontWeight: "bold",
    },
});

export default CuisineSelection;
