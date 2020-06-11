import React from "react";
import { View, Button, Text, StyleSheet } from "react-native";
import * as Linking from "expo-linking";
import firebase from "../database/firebase";

/**
 * This component is a page for user to determine how many friends will be added to find the
 * common overlapping intervals of available timings.
 * User will only come to this page if and after snycing their Google Calendar.
 */
class FriendInput extends React.Component {
    shareWithTelegram = (url) => {
        // Deep linking
        Linking.openURL(
            "https://t.me/share/url?url=" +
                url +
                "&text=" +
                "\n" +
                "Here is the link to input your calendar availability!"
        );
    };

    shareWithWhatsapp = (url) => {
        Linking.openURL(
            "whatsapp://send?" +
                "text=Here is the link to input your calendar availability! " +
                "\n" +
                url
        );
    };

    encodeUserInfoToURL = (url) => {
        const userId = "#" + firebase.auth().currentUser.uid; // Add # for marking, so can extract from web-app
        return url + encodeURIComponent(userId);
    };

    // Hosted on AWS Amplify
    DoWhatWebURL = "https://master.da00s432t0f9l.amplifyapp.com/";

    render() {
        return (
            <View style={styles.container}>
                <Text>Invite some friends</Text>

                <Button
                    title="Share with Telegram"
                    onPress={() =>
                        this.shareWithTelegram(
                            this.encodeUserInfoToURL(this.DoWhatWebURL)
                        )
                    }
                />
                <Button
                    title="Share with Whatsapp"
                    onPress={() =>
                        this.shareWithWhatsapp(
                            this.encodeUserInfoToURL(this.DoWhatWebURL)
                        )
                    }
                />
                <Button
                    title="Know their schedule?"
                    onPress={() => this.props.navigation.navigate("Timeline")}
                />
                <Button
                    title="Navigate to Genre"
                    onPress={() =>
                        this.props.navigation.navigate("Genre", {
                            route: "link",
                        })
                    }
                />
            </View>
        );
    }
}

export default FriendInput;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});
