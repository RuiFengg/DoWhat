import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const PriceSelection = ({ handlePricePress }) => {
    const [selected, setSelected] = React.useState([]);
    const price = [1, 2, 3, 4];

    const handlePress = (price) => {
        let arr = [];
        for (i = 1; i <= price; i++) {
            arr.push(i);
        }
        setSelected(arr);
        handlePricePress(price);
    };

    const buttons = () =>
        price.map((price) => (
            <TouchableOpacity
                key={price}
                onPress={() => {
                    handlePress(price);
                }}
                style={styles.button}
            >
                <Text
                    style={{
                        fontSize: 25,
                        color: !selected.includes(price) ? "gray" : "black",
                    }}
                >
                    $
                </Text>
            </TouchableOpacity>
        ));

    return (
        <View style={{ marginTop: 20 }}>
            <Text style={styles.header}>Price</Text>
            <View style={styles.buttonContainer}>{buttons()}</View>
        </View>
    );
};

const styles = StyleSheet.create({
    button: {
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

export default PriceSelection;
