// styles.js

import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  map: {
    flex: 1,
  },
  searchBarContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    marginBottom: Platform.OS === 'ios' ? 60 : 50,
  },
  searchBarInputContainer: {
    backgroundColor: '#EDEDED',
  },
  searchResultsContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 100,
    left: 10,
    right: 10,
    backgroundColor: 'white',
    zIndex: 1,
    borderRadius: 5,
    elevation: 3,
  },
  searchResultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  searchResultsList: {
    margin: 0,
    padding: 0,
  },
});
export default styles;
