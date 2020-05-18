import React, { Component } from "react";
import { connect } from 'react-redux'
import { View, Text, StyleSheet } from "react-native";
import Draggable from 'react-native-draggable'; // Library to allow draggable objects, for better UI

// might use tab navigator and define a static property
class Timeline extends React.Component {

  /**
   * Get starting time of the time period based on the object's position 
   * We represent time in integers 8-24. Which is  0800hrs-2400hrs
   * Every 16px movement in Y direction represents a 30min change in time
   */
  startTime = (event, gestureState) => {
    const initY = 48; // At Y.coord = 48, represents starting time: 0800hrs 
    const curY = gestureState.moveY;
    const time = Math.floor((curY - initY) / 16) * 0.5; // Time in hrs,
  }

  /**
   * Get ending time of the time peroid based on the object's position 
   */
  endTime = (event, gestureState) => {
    const initY = 560; // End time: 2359hrs
    const curY = gestureState.moveY;
  }

  render() {
    return (
      <View>
        <Draggable x={20} y={48} renderSize={30}
          maxX={20} minX={20} // Fix the circles to only be able to move along x=20 axis
          minY={48}
          renderColor='black' renderText='S'
          isCircle // Make the object a circle
          onShortPressRelease={() => alert('This is the starting time')}
          onDrag={this.startTime}
        />

        <Draggable x={20} y={520} renderSize={30}
          maxX={20} minX={20}
          maxY={560}
          renderColor='black' renderText='E'
          isCircle
          onShortPressRelease={() => alert('This is the end time')}
          onDrag={this.endTime}
        />

        <View style={{ marginStart: 100, marginTop: 48 }}>
          <Text style={{ fontSize: 12 }}> -- Starting time: 0800hrs</Text>
        </View>

        <View style={styles.timing}>
          <Text style={{ textAlign: "center", fontSize: 15 }}>Current Time Period</Text>
        </View>
      </View >
    );
  }
}

const styles = StyleSheet.create({
  timing: {
    borderWidth: 1,
    borderColor: "lightblue",
    marginTop: 400,

  }
})

export default connect()(Timeline);