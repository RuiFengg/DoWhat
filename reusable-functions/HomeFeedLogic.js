/**
 * This file stores the logic for sorting and formatting events from the Firebase DB
 * to a React view.
 */

/**
 * Sort events by decreasing order of ratings
 * @param {*} allEventsObject is an object from Firebase events node, object
 * has the following props: duration, list, slots
 */
const sortEventsByRatings = (allEventsObject, genre) => {
  const eventsList = allEventsObject.list;
  var sortable = []; //2D Array to be used for sorting by ratings
  var count = 0;

  for (var prop in eventsList) {
    if (count == 19) break; // We only take top 20 events

    const currEvent = eventsList[prop];
    sortable.push([
      {
        coord: currEvent.coord,
        title: currEvent.name,
        description: currEvent.description,
        imageUrl: currEvent.image,
        location: currEvent.location,
        id: currEvent.id,
        tags: currEvent.tags,
        selected: false, // To prevent duplicates when selecting
        favourited: false,
        genre: genre,
      },
      currEvent.rating,
    ]);
    count++;
  }

  // Ratings stored in index '1' of each inner array
  sortable.sort((x, y) => {
    return y[1] - x[1];
  });
  return sortable;
};

// Min and max included.
const randomIntFromInterval = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

/**
 * Selects the top 5 out of the 3 food categories. Randomised.
 * @param {*} restaurants
 * @param {*} hawkers
 * @param {*} cafes
 */
const getTopEateries = (restaurants, hawkers, cafes) => {
  // 2D array of [{}, rating]
  const topRestaurants = sortEventsByRatings(restaurants, "restaurants");
  const topHawkers = sortEventsByRatings(hawkers, "hawker");
  const topCafes = sortEventsByRatings(cafes, "cafes");

  const selections = [topRestaurants, topHawkers, topCafes];
  var result = [];

  for (var i = 0; i < 3; i++) {
    const j = randomIntFromInterval(0, 2);
    const k = randomIntFromInterval(0, 4);

    const category = selections[j]; // Randomly selected category
    var eatery = category[k]; // One of top 5 (since 0 <= k <= 4)

    if (!eatery.selected) {
      // Selected eatery is unique
      eatery.selected = true; // Mark as selected so we dont have duplicates
    } else {
      // If already selected, reselect another option
      while (eatery.selected) {
        // Ensure it is a unique selection
        const a = randomIntFromInterval(0, 10);
        eatery = category[a];
      }
      eatery.selected = true; // Mark as selected so we dont have duplicates
    }

    result.push(eatery);
  }
  result.sort((x, y) => {
    return y[1] - x[1];
  });
  return [result]; // Array for formatting in flatList
};

/**
 * This algo can be used to recommend events to users that they don't normally
 * select, to encourage users to try something new. It requires data of what users
 * normally select.
 * So NEW events are unique to each user. For example if a user often selects chill,
 * we will recommend adventure activities from here.
 * @param {} allCategories
 */
const findSomethingNew = (allCategories, userPreferences) => {
  const sortByLowestPreference = (preferences) => {
    var sortable = []; //2D Array to be used for sorting by ratings
    for (var genre in preferences) {
      const count = preferences[genre];
      sortable.push([
        {
          genre: genre,
          selected: false, // To prevent duplicates when selecting events
        },
        count,
      ]);
    }

    // Preference count stored in index '1' of each inner array
    sortable.sort((x, y) => {
      return x[1] - y[1];
    });
    return sortable; // Array of genres sorted in increasing preference
  };

  if (userPreferences == undefined) {
    // Case where account is new, no preference data yet
    return getPopularEvents(allCategories, 5, 9); // 5-9 so dont overlap with currently popular which used 0-4
  } else {
    const leastPreferredGenres = sortByLowestPreference(userPreferences);
    return getTopEventsFromGenres(
      leastPreferredGenres[0][0].genre,
      leastPreferredGenres[1][0].genre,
      allCategories
    );
  }
};

/**
 * From the generes inputted, this function will give the top rated events.
 * @param {*} genre1 is the least preferred genre of the user
 * @param {*} genre2 is the second least preferred genred of the user
 * @param {*} allCategories is an object copied from Firebase containing info to render to SectionList
 */
const getTopEventsFromGenres = (genre1, genre2, allCategories) => {
  const topFromGenre1 = sortEventsByRatings(allCategories[genre1], genre1);
  const topFromGenre2 = sortEventsByRatings(allCategories[genre2], genre2);

  const genreChecker = [genre1, genre2]; // Since algo is randomized, we dk what genre1 | genre2 will be
  const selections = [topFromGenre1, topFromGenre2];

  const ensureValidSelection = (genre, index) => {
    if (genreChecker[genre] == "leisure") {
      // leisure has only 5 activities
      return index < 5;
    } else {
      return true;
    }
  };

  const genreIsEatery = (index) => {
    return (
      genreChecker[index] == "cafes" ||
      genreChecker[index] == "restaurants" ||
      genreChecker[index] == "hawker"
    );
  };

  var result = [];

  for (var i = 0; i < 3; i++) {
    // Get top 3 events
    const j = randomIntFromInterval(0, 1); // selections array index
    var k = randomIntFromInterval(0, 4);

    // For case where show something new genre is eatery, prevent duplicates from the eateries
    if (genreIsEatery(j)) {
      k = randomIntFromInterval(5, 9); // Eateries use index 0-4
    }

    const category = selections[j]; // Randomly selected category
    var event = category[k]; // One of top 5 (since 0 <= k <= 4)

    if (!event.selected) {
      // Selected eatery is unique
      event.selected = true; // Mark as selected so we dont have duplicates
    } else {
      // If selected, reselect another option
      while (event.selected) {
        const a = randomIntFromInterval(0, 9);
        while (!ensureValidSelection(j, a)) {
          a = randomIntFromInterval(0, 4); // Ensure we get a leisure event that is present
        }
        event = category[a];
      }
      event.selected = true; // Mark as selected so we dont have duplicates
    }
    result.push(event);
  }
  result.sort((x, y) => {
    return y[1] - x[1];
  });
  return result;
};

/**
 * Popularity is determined by using the ratings as a metric. This does not include eateries.
 * @param {} allCategories
 * @param {} low an integer representing the the top low(th) ranked event
 * @param {} high is an integer representing the top high(th) ranked event
 */
const getPopularEvents = (allCategories, low, high) => {
  const topAdventures = sortEventsByRatings(
    allCategories.adventure,
    "adventure"
  );
  const topArts = sortEventsByRatings(allCategories.arts, "arts");
  const topLeisure = sortEventsByRatings(allCategories.leisure, "leisure");
  const topNature = sortEventsByRatings(allCategories.nature, "nature");
  const topNightlife = sortEventsByRatings(
    allCategories.nightlife,
    "nightlife"
  );

  const ensureValidSelection = (genre, index) => {
    if (genre == 2) {
      // leisure has only 5 activities
      return index < 5;
    } else {
      return true;
    }
  };

  const selections = [
    topAdventures,
    topArts,
    topLeisure,
    topNature,
    topNightlife,
  ];
  var result = [];

  for (var i = 0; i < 3; i++) {
    // Get top 3 events
    var j = randomIntFromInterval(0, 4); // selections array index
    var k = randomIntFromInterval(low, high);

    const category = selections[j]; // Randomly selected category
    var event = category[k]; // One of top 5 (since 0 <= k <= 4)

    if (j == 2 && k >= 5) {
      // Selected leisure genre, and out of index
      while (j == 2) {
        j = randomIntFromInterval(0, 4);
      }
      event = selections[j][k]; // Select new genre.
    }

    if (!event.selected) {
      // Selected eatery is unique
      event.selected = true; // Mark as selected so we dont have duplicates
    } else {
      // If selected, reselect another option
      while (event.selected) {
        const a = randomIntFromInterval(high, event.length);
        while (!ensureValidSelection(j, a)) {
          a = randomIntFromInterval(0, 4); // Ensure we get a leisure event that is present
        }
        event = category[a];
      }
      event.selected = true; // Mark as selected so we dont have duplicates
    }
    result.push(event);
  }
  result.sort((x, y) => {
    // Sort in descending
    return y[1] - x[1];
  });
  return result;
};

/**
 * Takes events from all categories, and extracts relavant data to create 3 components:
 * What is currently popular, Top eateries, and lastly new events that user is not usually
 * exposed to.
 * @param {*} allCategories events from all categories
 * @param {*} userPreference is object of all user's selected genres from history
 */
export const handleEventsOf = (allCategories, userPreference) => {
  const newEvents = findSomethingNew(allCategories, userPreference);

  const popularEvents = getPopularEvents(allCategories, 0, 4);

  const topFoodEvents = getTopEateries(
    allCategories.restaurants,
    allCategories.hawker,
    allCategories.cafes
  );

  return [popularEvents, topFoodEvents, newEvents];
};
