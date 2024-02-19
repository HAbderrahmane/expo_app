import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Platform, Linking, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { SearchBar } from 'react-native-elements';
import * as Location from 'expo-location';
import axios from 'axios';
import {styles} from './styles'
export default function App() {
  const [location, setLocation] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);

  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      const locationSubscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: 10 },
        (newLocation) => {
          setLocation(newLocation.coords);
        }
      );

      return () => {
        if (locationSubscription) {
          locationSubscription.remove();
        }
      };
    })();
  }, []);

  const handleMapPress = async (event) => {
    const newMarker = {
      id: new Date().getTime(),
      coordinate: {
        latitude: event.nativeEvent.coordinate.latitude,
        longitude: event.nativeEvent.coordinate.longitude,
      },
    };

    setMarkers([newMarker]);
    setSelectedMarker(newMarker);

    try {
      const response = await axios.post(
        `https://api.openrouteservice.org/v2/directions/driving-car`,
        {
          coordinates: [
            [location.longitude, location.latitude],
            [newMarker.coordinate.longitude, newMarker.coordinate.latitude],
          ],
        },
        {
          headers: {
            'Authorization': 'api key',
          },
        }
      );

      if (response.data.features && response.data.features.length > 0) {
        const routeCoords = response.data.features[0].geometry.coordinates;
        setRouteCoordinates(routeCoords);
      }
      
    } catch (error) {
      console.info('Driving route not available. ');
      
      console.info('Trying an alternative mode.');
      
    }

    mapRef.current.animateToRegion({
      latitude: newMarker.coordinate.latitude,
      longitude: newMarker.coordinate.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    });
  };

  const handleGetDirections = () => {
    if (selectedMarker) {
      const { latitude, longitude } = selectedMarker.coordinate;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

      Linking.canOpenURL(url).then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          console.error('Cannot open Google Maps');
        }
      });
    }
  };

  const handleMarkerPress = (markerId) => {
    setSelectedMarker(markers.find(marker => marker.id === markerId));
    setRouteCoordinates([]);
  };

  const handleSearch = async (text) => {
    setSearchQuery(text);
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&types=geocode&key=api-key`
      );

      if (response.data.predictions) {
        setSearchResults(response.data.predictions);
      }
    } catch (error) {
      console.error('Error searching for location:', error);
    }
  };

  const handleResultPress = async (placeId) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=5b3ce3597851110001cf624807bf9138d19d430e9b74a566557649d0`
      );

      if (response.data.result) {
        const result = response.data.result;
        const newDestination = {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
        };

        setDestination(newDestination);
        setRouteCoordinates([]);
        setSearchQuery(result.formatted_address);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error getting place details:', error);
    }
  };

  return (
    <View style={styles.container}>
      
      <MapView
        ref={mapRef}
        style={styles.map}
        region={location ? {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        } : null}
        onPress={handleMapPress}
      >
        {location && <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} pinColor="blue" />}
        {markers.map(marker => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            onPress={() => handleMarkerPress(marker.id)}
          />
        ))}
        {selectedMarker && (
          <Marker
            coordinate={selectedMarker.coordinate}
            pinColor="red"
            onPress={handleGetDirections}
          />
        )}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={2}
            strokeColor="#FF0000"
          />
        )}
      </MapView>
      <SearchBar
        placeholder="Search for a location"
        onChangeText={handleSearch}
        value={searchQuery}
        containerStyle={styles.searchBarContainer}
        inputContainerStyle={styles.searchBarInputContainer}
        listStyle={styles.searchResultsList}
        onClear={() => setSearchResults([])}
      />
      {searchResults.length > 0 && (
        <View style={styles.searchResultsContainer}>
          {searchResults.map((result) => (
            <Text
              key={result.place_id}
              style={styles.searchResultItem}
              onPress={() => handleResultPress(result.place_id)}
            >
              {result.description}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

