import React, { useEffect, useState } from 'react';
import './App.css';
import Fuse from "fuse.js";
import ReactPaginate from 'react-paginate';

// Firebase client
import firebase from './lib/firebase_client'

// Bootstrap and React-Bootstrap imports
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Table from 'react-bootstrap/Table';
import Image from 'react-bootstrap/Image';

// CSS
import './App.css';

// Components
import Search from './components/Search.js';

// Utility functions
import { getReadableDate, getReadableSeasonality } from './lib/utils';

// URL constants for backend API
// const PATH_BASE = 'http://localhost:5000/api';
// const FISH = '/fish';
// const BUGS = '/bugs';
// const FOSSILS = '/fossils';
// const VILLAGERS = '/villagers';

// Main app entry point
function App() {


  const PER_PAGE = 10
  const [fish, setFish] = useState([])
  const [bugs, setBugs] = useState([])
  const [fossils, setFossils] = useState([])
  const [villagers, setVillagers] = useState([])
  const [currentCategory, setCurrentCategory] = useState('fish')
  const [searchList, setSearchList] = useState(fish)
  const [searchResults, setSearchResults] = useState([])
  const [paginatedResults, setPaginatedResults] = useState([])
  const [offset, setOffset] = useState(0)
  // const searchList = fish.concat(bugs, fossils, villagers)
  const fuseOpts = {
    isCaseSensitive: false,
    shouldSort: true,
    minMatchCharLength: 3,
    includeScore: false,
    threshold: 0.3,
    keys: [
      "name",
      "location",
      "fossil_type",
      "species",
      "personality",
      "group",
    ]
  }
  const fuse = new Fuse(searchList, fuseOpts)

  /* CDM */
  // Side effect to load in data from firestore
  useEffect(() => {
    const db = firebase.firestore()

    // get fish data and setup searchlist and results
    db.collection('critters').where('critter_type', '==', 'fish').get().then(snapshot => {
      let fishData = snapshot.docs.map(doc => doc.data())
      setFish(fishData)
      setSearchList(fishData)
      setSearchResults(fishData)
      setPaginatedResults(fishData.slice(offset * PER_PAGE, PER_PAGE))
    })

    // get bug data
    db.collection('critters').where('critter_type', '==', 'bug').get().then(snapshot => {
      setBugs(snapshot.docs.map(doc => doc.data()))
    })

    // get villager data
    db.collection('villagers').get().then(snapshot => {
      setVillagers(snapshot.docs.map(doc => doc.data()))
    })

    // get fossil data
    db.collection('fossils').get().then(snapshot => {
      setFossils(snapshot.docs.map(doc => doc.data()))
    })

  }, [])

  
  const [query, setQuery] = useState("")
  // Side effect on query to update searchResults array
  useEffect(() => {
    setSearchResults(fuse.search(query))
  }, [query])

  useEffect(() => {
    setPaginatedResults(searchResults.slice(offset * PER_PAGE, (offset * PER_PAGE) + PER_PAGE))
  }, [searchResults])

  // Callback to set the query value. This is debounced in the Search component
  const handleQueryChange = (value) => {
    console.log("handleChange called, calling setQuery")
    if (value.length >= 3) setQuery(value)
  }

  // Update the data set to search the selected category as well as update the
  // searchResults list to point to the entire dataset on initial category selection
  const handleCategoryChange = (value) => {
    if (value === 'fish') {
      setSearchList(fish)
      setSearchResults(fish)

    }
    else if (value === 'bugs') {
      setSearchList(bugs)
      setSearchResults(bugs)
    }
    else if (value === 'fossils') {
      setSearchList(fossils)
      setSearchResults(fossils)
    }
    else if (value === 'villagers') {
      setSearchList(villagers)
      setSearchResults(villagers)
    }
    setCurrentCategory(value)
  }

  const handlePageClick = (data) => {
    console.log('handlePageClick called, data.selected: ', data.selected)
    setOffset(data.selected)
    setPaginatedResults(searchResults.slice(data.selected * PER_PAGE, (data.selected * PER_PAGE) + PER_PAGE))
  }


  return (
    <Container className="p-2">

      <Jumbotron className="header">
        <h2>🦝Animal Crossing: New Horizons Info Guide🍃</h2>
      </Jumbotron>
      
      <Row>
        <Col>
          <Search
            value={query}
            onQueryChange={handleQueryChange}
            category={currentCategory}
            onCategoryChange={handleCategoryChange}
          >
            Search
          </Search>
        </Col>
      </Row>

      <Row> 
        <Col> 
          <ResultsTable results={paginatedResults}/>
          <ReactPaginate 
            previousLabel={"Previous"}
            nextLabel={"Next"}
            breakClassName={'break-me'}
            pageCount={Math.ceil(searchResults.length / PER_PAGE)}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            containerClassName={'pagination'}
            subContainerClassName={'pages pagination'}
            activeClassName={'active'}
          />
        </Col>
      </Row>

    </Container>
  )
}

const ResultsTable = ({results}) => {
  let headings = []
  let ignoreTitles = []

  if (results.length > 0) {
    // When page is first loaded, no query is selected, but we want to show the entire fish dataset.
    // Need to alter the inital results list to follow formatting of the list returned by the fuse search
    if (!("item" in results[0])) {
      results = results.map(obj => new Object({"item": obj}))
    }

    headings = Object.keys(results[0].item)
    // Setup headings for all categories
    ignoreTitles = ["id", "image_url", "critter_type", "birthdate_month", "birthdate_day", "read_seasonality_n", "read_seasonality_s"]
    headings = headings.filter(heading => heading !== "name")
    headings.unshift("name")
    
    // If the item is a villager, hide the birthdate_month heading and push the birthday month heading
    if (("birthdate_month" in results[0].item) && !("birthday" in results[0].item)) {
      headings.push("birthday")
    }

    // Remove shadow_size heading for bugs
    if (results[0].item['critter_type'] === 'bug') {
      headings = headings.filter(heading => heading !== 'shadow_size')
    }

    // Move seasonality headings to end of array
    if ((headings.includes("seasonality_n")) && (headings.includes("seasonality_s")) &&
        (headings.indexOf("seasonality_s") !== (headings.length - 1))) {
      headings.push(headings.splice(headings.indexOf("seasonality_n"), 1)[0])
      headings.push(headings.splice(headings.indexOf("seasonality_s"), 1)[0])
      // console.log(headings.indexOf("seasonality_s"), headings.length - 1)
      // console.log("seasonality moved", headings.indexOf("seasonality_s") !== (headings.length - 1))
    }
  }

  // Utility function to get the corresponding formatted heading from the properties of the records
  const getReadableHeading = (heading) => {
    const heading_dict = {
      "location": "Location",
      "name": "Name",
      "price": "Price (Bells)",
      "seasonality_n": "Seasonality (Northern Hemisphere)",
      "seasonality_s": "Seasonality (Southern Hemisphere)",
      "shadow_size": "Shadow Size",
      "timeday": "Time Available",
      "fossil_type": "Fossil Type",
      "group": "Fossil Group",
      "personality": "Personality",
      "species": "Species",
      "catchphrase": "Catchphrase",
      "birthday": "Birthday"
    }

    return heading_dict[heading]
  }

  return (
    <Table bordered>
      <thead>
        <tr>
          {results.length > 0 && <th></th>}
          {results.length > 0 && 
          headings.filter(heading => !ignoreTitles.includes(heading)).map((heading) => {
            return <th key={headings.indexOf(heading)}>{getReadableHeading(heading)}</th>
          })}
        </tr>
      </thead>

      <tbody>
      {results && results.map((value) => {
        return <ResultsItem 
                  key={results.indexOf(value)} 
                  item={value.item} 
                  index={results.indexOf(value)}
                />
      })}
      </tbody>
  </Table>
  )
}

const ResultsItem = ({item, index}) => {
  // Headings that do not need to be displayed to the user
  let ignoreTitles = ["id", "name", "image_url", "critter_type", "seasonality_n", "seasonality_s"]

  // item is a villager
  if ("birthdate_month" in item) {
    item["birthday"] = getReadableDate(item.birthdate_month, item.birthdate_day)
    ignoreTitles.push("birthdate_month", "birthdate_day")
  }

  // item is a critter, need to format seasonality to readable format
  if (("seasonality_n" in item) || ("seasonality_s" in item)) {
    item["read_seasonality_n"] = getReadableSeasonality(item.seasonality_n)
    item["read_seasonality_s"] = getReadableSeasonality(item.seasonality_s)
  }


  return (
    <tr>
      {item.image_url &&
        /* ****************************************************** */
        // don't want to send requests for the images in development
        // <td><Image src={item.image_url} height="100" width="100" rounded></Image></td> 
        <td><Image src="" height="100" width="100" rounded></Image></td> 

      }
      <td>{item.name}</td>

      {/* Use map to only render the properties that are not in ignoreTitles */}
      {Object.entries(item).map(([key, value]) => {
        // For fossil group with fossils, want to render empty cell instead of nothing
        if (ignoreTitles.includes(key) || (!value && (key === "shadow_size"))) return null
        return <td key={key}>{value}</td>
      })}
    </tr>
  )
}
  
export default App;