import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { connect } from 'react-redux';
import { selectDate, setLocation } from '../actions/date_select_action';
import { extractCalendarEvents } from '../actions/auth_screen_actions';
import AvailabilityInputModal from './AvailabilityInputModal';
import firebase from '../database/firebase';
import Genre from '../components/genre/Genre';
import { getBusyPeriodFromGoogleCal } from '../reusable-functions/GoogleCalendarGetBusyPeriods';
import Calendar from './Calendar';
import { Divider, Overlay } from 'react-native-elements';

export const formatDate = (day, month, date) => {
	const possibleDays = [
		'Sunday',
		'Monday',
		'Tuesday',
		'Wenesday',
		'Thursday',
		'Friday',
		'Saturday',
	];

	const possibleMonths = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December',
	];

	const curDay = possibleDays[day];
	const curMonth = possibleMonths[month];
	return curDay + ', ' + curMonth + ' ' + date;
};

/**
 * DateSelection Page is where user inputs availablilities, selected date, as well as outing
 * preferences.
 */
const DateSelection = (props) => {
	useEffect(() => {
		getUsersFavourites();
		return () => null;
	}, []);

	const [isLoading, setIsLoading] = useState(true);
	const [usersFavourites, setUsersFavourites] = useState([]);
	const [date, setDate] = useState(new Date()); // new Date() gives today's date
	const [modalVisible, setModalVisible] = useState(false);
	const [isFinalized, setIsFinalized] = useState(false);
	const [isButtonDisabled, setIsButtonDisabled] = useState(false); // Input avails button

	let synced = isButtonDisabled ? 'synced' : 'manual';

	const getUsersFavourites = () => {
		firebase
			.database()
			.ref('/users/' + props.userID)
			.once('value')
			.then((snapshot) => {
				const userData = snapshot.val();
				if (userData.hasOwnProperty('favourites')) {
					let object = userData.favourites;

					var finalFavouritesArray = [];
					for (var key in object) {
						const arr = [object[key], false];
						finalFavouritesArray.push(arr);
					}
					setUsersFavourites[finalFavouritesArray];
					setIsLoading(false);
				} else {
					setIsLoading(false);
				}
			});
	};

	const inputAvailabilities = () => {
		getBusyPeriodFromGoogleCal(props.userID, date); // User ID comes from Redux state
		setIsButtonDisabled(true); // Prevent syncing google calendar twice
	};

	const renderSyncCalendarButton = () => {
		if (isButtonDisabled) {
			return (
				<View>
					<TouchableOpacity
						style={[
							styles.syncCalendarButton,
							{
								backgroundColor: '#F28333',
							},
						]}
						disabled={true}
						onPress={() => finalizeBoard()}
					>
						<Text
							style={{
								color: '#ffe0b3',
								marginLeft: 5,
								fontWeight: 'bold',
							}}
						>
							SYNC CALENDAR
						</Text>
					</TouchableOpacity>
				</View>
			);
		} else {
			return (
				<TouchableOpacity
					style={styles.syncCalendarButton}
					onPress={() => inputAvailabilities()}
					disabled={isButtonDisabled || isFinalized} // Cant sync if manual input
				>
					<Text
						style={{
							color: '#F28333',
							fontWeight: 'bold',
						}}
					>
						SYNC CALENDAR
					</Text>
				</TouchableOpacity>
			);
		}
	};

	// Passed to Calendar.js child component
	const onDateChange = (selectedDate) => {
		const formattedDate = new Date(selectedDate);
		setDate(formattedDate);
		props.selectDate(formattedDate); // Set date in redux state
	};

	const addSelectedDateToFirebase = () => {
		const userId = firebase.auth().currentUser.uid;
		firebase
			.database()
			.ref('users/' + userId)
			.child('selected_date')
			.set(date.toDateString()); // date comes from component's state
	};

	const syncWithFirebaseThenNavigate = () => {
		addSelectedDateToFirebase();
		if (props.route.params.route === 'manual') {
			props.navigation.navigate('Loading', {
				route: 'manual',
				access: 'host',
				synced: synced,
			});
		} else {
			props.navigation.navigate('FriendInput', {
				route: props.route.params.route,
			});
		}
	};

	const closeModal = () => {
		setModalVisible(false);
	};

	const onFinalize = () => {
		setIsFinalized(true);
	};

	if (isLoading) {
		return (
			<View style={{ flex: 1, justifyContent: 'center' }}>
				<ActivityIndicator size='large' />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Overlay
				isVisible={modalVisible}
				width='auto'
				height='auto'
				overlayStyle={{
					width: '95%',
					height: props.route.params.route == 'manual' ? '25%' : '20%',
					borderRadius: 20,
				}}
			>
				<AvailabilityInputModal
					onClose={closeModal}
					route={props.route.params.route}
					date={date}
					onFinalize={onFinalize}
					styledDate={formatDate(date.getDay(), date.getMonth(), date.getDate())}
				/>
			</Overlay>

			<View style={styles.dateInput}>
				<View style={{ flexDirection: 'row', marginTop: 10 }}>
					<Text style={[styles.header, { fontSize: 20 }]}>Plan Event On: </Text>
					<Text style={styles.date}>
						{formatDate(date.getDay(), date.getMonth(), date.getDate())}
					</Text>
				</View>
			</View>
			<View style={styles.calendar}>
				<Calendar currDate={new Date()} onDateChange={onDateChange} />
			</View>

			<View style={styles.availsInput}>
				<Text
					style={[
						styles.header,
						{
							textAlign: 'center',
							marginTop: 20,
						},
					]}
				>
					Input your available timings
				</Text>
				<View
					style={{
						flex: 0.8,
						justifyContent: 'space-around',
						borderBottomWidth: 0.5,
						borderColor: '#F9F0E6',
					}}
				>
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'center',
							marginTop: 15,
						}}
					>
						<TouchableOpacity
							disabled={isButtonDisabled} // If sync google cal, cant manual input
							style={[
								props.route.params.route == 'manual'
									? styles.manualRouteInputButton
									: styles.manualInputButton,
								isFinalized ? { backgroundColor: '#F28333' } : null,
							]}
							onPress={() => setModalVisible(true)}
						>
							<Text
								style={[
									{ fontWeight: 'bold' },
									isFinalized ? { color: '#ffe0b3' } : { color: '#F28333' },
								]}
							>
								MANUAL INPUT
							</Text>
						</TouchableOpacity>
						<Divider
							style={{
								borderWidth: 0.3,
								height: '100%',
								borderColor: '#F9F0E6',
							}}
						/>
						{props.route.params.route != 'manual' ? renderSyncCalendarButton() : null}
					</View>
				</View>
			</View>

			<View style={styles.genreSelection}>
				<Genre syncWithFirebaseThenNavigate={syncWithFirebaseThenNavigate} />
			</View>
		</View>
	);
};
const mapStateToProps = (state) => {
	return {
		userID: state.add_events.userID,
		currUserName: state.add_events.currUserName,
	};
};

const mapDispatchToProps = {
	selectDate,
	extractCalendarEvents,
	setLocation,
};

export default connect(mapStateToProps, mapDispatchToProps)(DateSelection);

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		fontWeight: 'bold',
		fontSize: 18,
		borderTopEndRadius: 5,
		paddingRight: 10,
		paddingLeft: 10,
		color: 'black',
	},
	date: {
		fontWeight: '500',
		fontSize: 20,
		paddingRight: 10,
		color: 'black',
		textDecorationLine: 'underline',
	},
	dateInput: {
		flex: 1,
		alignContent: 'flex-start',
		alignItems: 'flex-start',
	},
	availsInput: {
		flex: 2,
		borderRadius: 40,
		borderBottomLeftRadius: 0,
		borderBottomRightRadius: 0,
		backgroundColor: '#fff5e6',
	},
	calendar: {
		flex: 7,
	},
	genreSelection: {
		flex: 5,
		backgroundColor: 'white',
	},
	button: {
		fontSize: 20,
		borderWidth: 0.2,
		textAlign: 'center',
		borderRadius: 10,
		backgroundColor: '#cc5327',
		color: '#fcf5f2',
	},
	body: {
		flex: 5,
		alignItems: 'center',
		alignContent: 'center',
		justifyContent: 'center',
	},
	item: {
		backgroundColor: 'white',
		flex: 1,
		borderRadius: 5,
		padding: 10,
		marginRight: 10,
		marginTop: 17,
	},
	manualInputButton: {
		borderBottomStartRadius: 8,
		borderTopStartRadius: 8,
		padding: 10,
		paddingTop: 6,
		paddingBottom: 6,
		backgroundColor: '#ffe0b3',
	},
	syncCalendarButton: {
		borderBottomEndRadius: 8,
		borderTopEndRadius: 8,
		padding: 10,
		paddingTop: 6,
		paddingBottom: 6,
		backgroundColor: '#ffe0b3',
	},
	emptyDate: {
		height: 15,
		flex: 1,
		paddingTop: 30,
	},
	manualRouteInputButton: {
		borderRadius: 20,
		padding: 10,
		backgroundColor: '#ffe0b3',
	},
});
